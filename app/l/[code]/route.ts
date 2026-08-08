import { db } from "@/lib/db"
import { shortLinks, linkAnalytics, retargetingPixels, customDomains } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashIp(ip: string | null): string {
  if (!ip) return "anonymous"
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)
}

function selectTargetUrl(link: any, userAgent: string): string {
  const isIos = /iphone|ipad|ipod/i.test(userAgent)
  const isAndroid = /android/i.test(userAgent)

  // 1. Mobile overrides
  if (isIos && link.iosUrl) return link.iosUrl
  if (isAndroid && link.androidUrl) return link.androidUrl

  // 2. Deep link scheme override
  if (link.deepLinkScheme) return link.deepLinkScheme

  // 3. Link rotation (A/B/C testing)
  const rotationUrls = (link.rotationUrls as Array<{ url: string; weight: number }>) || []
  if (rotationUrls.length > 0) {
    const candidates = [{ url: link.originalUrl, weight: 100 }, ...rotationUrls]
    const totalWeight = candidates.reduce((sum, item) => sum + (Number(item.weight) || 1), 0)
    let random = Math.random() * totalWeight
    for (const candidate of candidates) {
      if (random < candidate.weight) {
        return candidate.url
      }
      random -= candidate.weight
    }
  }

  return link.originalUrl
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  const link = await db.query.shortLinks.findFirst({
    where: eq(shortLinks.shortCode, code),
  })

  if (!link) {
    return NextResponse.redirect(new URL("/404", request.url))
  }

  if (!link.isActive) {
    return NextResponse.redirect(new URL("/link-inactive", request.url))
  }

  // Check expiration by date
  const isDateExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
  // Check expiration by max click cap
  const isMaxClicksReached = link.maxClicks !== null && link.maxClicks !== undefined && (link.clickCount || 0) >= link.maxClicks

  if (isDateExpired || isMaxClicksReached) {
    if (link.expirationUrl) {
      return NextResponse.redirect(link.expirationUrl)
    }
    return NextResponse.redirect(new URL("/link-expired", request.url))
  }

  // Check password protection
  if (link.password) {
    return NextResponse.redirect(new URL(`/l/${code}/unlock`, request.url))
  }

  const userAgent = request.headers.get("user-agent") || ""
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || null
  const ipHash = hashIp(ip)

  let device = "desktop"
  if (/mobile/i.test(userAgent)) device = "mobile"
  else if (/tablet/i.test(userAgent)) device = "tablet"

  let browser = "other"
  if (/chrome/i.test(userAgent)) browser = "chrome"
  else if (/firefox/i.test(userAgent)) browser = "firefox"
  else if (/safari/i.test(userAgent)) browser = "safari"
  else if (/edge/i.test(userAgent)) browser = "edge"

  // Record click analytics
  await db.insert(linkAnalytics).values({
    linkId: link.id,
    device,
    browser,
    referrer: request.headers.get("referer"),
    ipHash,
  }).catch(err => console.error("Analytics error:", err))

  // Increment click count
  await db.update(shortLinks)
    .set({ clickCount: (link.clickCount || 0) + 1 })
    .where(eq(shortLinks.id, link.id))
    .catch(err => console.error("Update click count error:", err))

  const destinationUrl = selectTargetUrl(link, userAgent)

  // Fetch retargeting pixels if attached
  let pixelScripts = ""
  if (link.retargetingPixelIds && link.retargetingPixelIds.length > 0) {
    const pixels = await db.query.retargetingPixels.findMany({
      where: inArray(retargetingPixels.id, link.retargetingPixelIds),
    })

    pixels.forEach((pixel) => {
      if (pixel.provider === "facebook") {
        pixelScripts += `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixel.pixelId}');
          fbq('track', 'PageView');
        `
      } else if (pixel.provider === "gtm") {
        pixelScripts += `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${pixel.pixelId}');
        `
      } else if (pixel.provider === "tiktok") {
        pixelScripts += `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","addUserData"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq.methods[i],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${pixel.pixelId}');
            ttq.page();
          }(window, document, 'ttq');
        `
      }
    })
  }

  // If pixel scripts are present or destination is custom deep link, return intermediate HTML launcher
  if (pixelScripts || destinationUrl.startsWith("intent://") || destinationUrl.includes("://") && !destinationUrl.startsWith("http")) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redirecting...</title>
          <meta http-equiv="refresh" content="1;url=${destinationUrl}">
          <script>${pixelScripts}</script>
          <script>
            setTimeout(function() {
              window.location.href = ${JSON.stringify(destinationUrl)};
            }, 300);
          </script>
        </head>
        <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #09090b; color: #fff;">
          <div style="text-align: center;">
            <p style="font-size: 16px; font-weight: 500;">Redirecting to destination...</p>
            <p style="font-size: 14px; opacity: 0.6;"><a href="${destinationUrl}" style="color: #3b82f6; text-decoration: none;">Click here if not redirected automatically</a></p>
          </div>
        </body>
      </html>
    `
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    })
  }

  return NextResponse.redirect(destinationUrl)
}

