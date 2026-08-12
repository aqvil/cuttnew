import { db } from "@/lib/db"
import { linkAnalytics, retargetingPixels, shortLinks } from "@/lib/db/schema"
import { eq, inArray, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { validateDestinationUrl } from "@/lib/links/url"
import {
  detectBrowser,
  detectCity,
  detectCountry,
  detectDevice,
  detectOs,
  isAndroid,
  isBot,
  isIos,
} from "@/lib/links/user-agent"

/**
 * The redirect endpoint.
 *
 * Correctness and safety notes, since this is the one route the whole product
 * depends on:
 *
 * - Every destination is re-validated immediately before redirecting. Rows can
 *   predate the validation rules, or arrive through a future code path, and an
 *   unvalidated redirect here is an open redirect for the whole domain.
 * - The click counter is incremented with `count + 1` *in SQL*. The previous
 *   read-modify-write lost clicks under any concurrency.
 * - Bot traffic still redirects but is not recorded, so counts mean something.
 * - Responses are explicitly uncacheable; a cached redirect would strand every
 *   subsequent visitor on a stale destination and silently stop counting.
 */

export const dynamic = "force-dynamic"

/**
 * IPs are hashed with a server-side secret so the analytics table cannot be
 * reversed into a list of visitor addresses via a rainbow table of the (small)
 * IPv4 space.
 */
const IP_SALT = process.env.AUTH_SECRET || "cuttly-analytics"

function hashIp(ip: string | null): string {
  if (!ip) return "anonymous"
  return crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex").slice(0, 24)
}

/** Escapes a string for safe interpolation into an HTML attribute or text node. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** Pixel IDs are provider-issued identifiers; anything else is not one. */
const SAFE_PIXEL_ID = /^[A-Za-z0-9_-]{1,64}$/

type LinkRow = typeof shortLinks.$inferSelect

/**
 * Chooses the destination for this visitor.
 *
 * Precedence: platform-specific override → weighted rotation → the canonical
 * destination. The deep-link scheme is only used on a mobile OS, where such a
 * URL can actually resolve; previously it hijacked desktop traffic too.
 */
function selectTargetUrl(link: LinkRow, userAgent: string): string {
  if (isIos(userAgent) && link.iosUrl) return link.iosUrl
  if (isAndroid(userAgent) && link.androidUrl) return link.androidUrl

  if (link.deepLinkScheme && (isIos(userAgent) || isAndroid(userAgent))) {
    return link.deepLinkScheme
  }

  const rotation = (link.rotationUrls as Array<{ url: string; weight: number }> | null) || []
  if (rotation.length > 0) {
    const candidates = [
      { url: link.originalUrl, weight: 100 },
      ...rotation.filter((entry) => typeof entry?.url === "string"),
    ]
    const total = candidates.reduce((sum, item) => sum + (Number(item.weight) || 1), 0)
    let roll = Math.random() * total
    for (const candidate of candidates) {
      const weight = Number(candidate.weight) || 1
      if (roll < weight) return candidate.url
      roll -= weight
    }
  }

  return link.originalUrl
}

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  // Don't leak the destination to the target site via the Referer header.
  "Referrer-Policy": "no-referrer",
} as const

function internalRedirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { headers: NO_STORE })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  // Short codes are opaque identifiers; reject anything that isn't one before
  // it reaches the database.
  if (!code || code.length > 64) {
    return internalRedirect(request, "/link-not-found")
  }

  // A database outage must not leave the visitor on a blank 500. This is the
  // single most-visited route in the product and the only one most people
  // ever see, so it degrades to an explanatory page instead.
  let link: typeof shortLinks.$inferSelect | undefined
  try {
    link = await db.query.shortLinks.findFirst({
      where: eq(shortLinks.shortCode, code),
    })
  } catch (err) {
    console.error("[redirect] lookup failed:", err)
    return NextResponse.redirect(new URL("/link-unavailable", request.url), {
      status: 307,
      headers: NO_STORE,
    })
  }

  if (!link) {
    return internalRedirect(request, "/link-not-found")
  }

  if (!link.isActive || link.archivedAt) {
    return internalRedirect(request, "/link-inactive")
  }

  const isDateExpired = link.expiresAt ? new Date(link.expiresAt) <= new Date() : false
  const isClickCapReached =
    link.maxClicks != null && (link.clickCount || 0) >= link.maxClicks

  if (isDateExpired || isClickCapReached) {
    if (link.expirationUrl) {
      const fallback = validateDestinationUrl(link.expirationUrl)
      if (fallback.ok) {
        return NextResponse.redirect(fallback.url, { headers: NO_STORE })
      }
    }
    return internalRedirect(request, "/link-expired")
  }

  // Password-protected links never reveal their destination here.
  if (link.password) {
    return internalRedirect(request, `/l/${encodeURIComponent(code)}/unlock`)
  }

  const destination = selectTargetUrl(link, request.headers.get("user-agent") || "")
  const userAgent = request.headers.get("user-agent") || ""

  // Record the click. Bots redirect but aren't counted.
  if (!isBot(userAgent)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null

    // `?qr=1` is appended to the URL encoded into every generated QR code, so
    // scans can be told apart from ordinary clicks.
    const source = request.nextUrl.searchParams.get("qr") === "1" ? "qr" : "link"

    await Promise.all([
      db
        .insert(linkAnalytics)
        .values({
          linkId: link.id,
          device: detectDevice(userAgent),
          browser: detectBrowser(userAgent),
          os: detectOs(userAgent),
          country: detectCountry(request.headers),
          city: detectCity(request.headers),
          referrer: request.headers.get("referer"),
          source,
          ipHash: hashIp(ip),
        })
        .catch((err) => console.error("[redirect] analytics insert failed:", err)),

      // Atomic increment — safe under concurrent clicks.
      db
        .update(shortLinks)
        .set({ clickCount: sql`COALESCE(${shortLinks.clickCount}, 0) + 1` })
        .where(eq(shortLinks.id, link.id))
        .catch((err) => console.error("[redirect] click increment failed:", err)),
    ])
  }

  // A custom scheme (myapp://) can't be sent as an HTTP redirect, and pixels
  // need a document to execute in. Both cases fall back to an interstitial.
  const isCustomScheme = !/^https?:\/\//i.test(destination)
  const pixelScripts = await buildPixelScripts(link)

  if (pixelScripts || isCustomScheme) {
    return new NextResponse(interstitialHtml(destination, pixelScripts), {
      headers: {
        ...NO_STORE,
        "Content-Type": "text/html; charset=utf-8",
        // The interstitial only ever runs the pixel snippets we generate.
        "X-Content-Type-Options": "nosniff",
      },
    })
  }

  // Final safety net: never redirect to something that doesn't pass validation.
  const safe = validateDestinationUrl(destination)
  if (!safe.ok) {
    console.error("[redirect] blocked unsafe destination for", link.shortCode)
    return internalRedirect(request, "/link-inactive")
  }

  return NextResponse.redirect(safe.url, { headers: NO_STORE })
}

/** Link previewers issue HEAD; answer without recording a click. */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const link = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.shortCode, code),
    columns: { id: true, isActive: true },
  })

  return new NextResponse(null, {
    status: link?.isActive ? 200 : 404,
    headers: NO_STORE,
  })
}

async function buildPixelScripts(link: LinkRow): Promise<string> {
  const ids = link.retargetingPixelIds
  if (!ids || ids.length === 0) return ""

  const pixels = await db.query.retargetingPixels.findMany({
    where: inArray(retargetingPixels.id, ids),
  })

  let scripts = ""

  for (const pixel of pixels) {
    // Reject anything that isn't a plain identifier rather than interpolating
    // attacker-controlled text into a <script> body.
    if (!SAFE_PIXEL_ID.test(pixel.pixelId)) {
      console.warn("[redirect] skipping pixel with unsafe id:", pixel.id)
      continue
    }

    const id = JSON.stringify(pixel.pixelId)

    if (pixel.provider === "facebook") {
      scripts += `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${id});fbq('track', 'PageView');`
    } else if (pixel.provider === "gtm") {
      scripts += `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${id});`
    } else if (pixel.provider === "tiktok") {
      scripts += `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","addUserData"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load(${id});ttq.page();}(window,document,'ttq');`
    }
  }

  return scripts
}

/**
 * Interstitial shown only when we can't issue a plain HTTP redirect.
 * The destination is escaped for the attribute and JSON-encoded for the
 * script — it is user-supplied data, not markup.
 */
function interstitialHtml(destination: string, pixelScripts: string): string {
  const safeHref = escapeHtml(destination)

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Redirecting…</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #ffffff; color: #09090b;
  }
  @media (prefers-color-scheme: dark) { body { background: #09090b; color: #fafafa; } }
  .box { text-align: center; padding: 24px; max-width: 380px; }
  .spinner {
    width: 22px; height: 22px; margin: 0 auto 18px; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: spin .7s linear infinite; opacity: .5;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
  p { margin: 0; font-size: 14px; }
  .muted { margin-top: 10px; font-size: 13px; opacity: .6; }
  a { color: inherit; }
</style>
${pixelScripts ? `<script>${pixelScripts}</script>` : ""}
<script>
  setTimeout(function () { window.location.replace(${JSON.stringify(destination)}); }, 250);
</script>
</head>
<body>
  <div class="box">
    <div class="spinner" role="status" aria-label="Redirecting"></div>
    <p>Taking you to your destination…</p>
    <p class="muted"><a href="${safeHref}" rel="noopener noreferrer">Continue manually</a></p>
  </div>
</body>
</html>`
}
