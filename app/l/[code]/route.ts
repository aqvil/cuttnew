import { db } from "@/lib/db"
import { shortLinks, linkAnalytics } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

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

  // Check if link is active
  if (!link.isActive) {
    return NextResponse.redirect(new URL("/link-inactive", request.url))
  }

  // Check if link has expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL("/link-expired", request.url))
  }

  // Check if password protected (logic might need adjusting if columns changed)
  // In our schema.ts, we have password column
  if (link.password) {
    // Redirect to password page
    return NextResponse.redirect(new URL(`/l/${code}/unlock`, request.url))
  }

  // Record click analytics
  const userAgent = request.headers.get("user-agent") || ""
  
  // Simple device detection
  let device = "desktop"
  if (/mobile/i.test(userAgent)) device = "mobile"
  else if (/tablet/i.test(userAgent)) device = "tablet"

  // Simple browser detection
  let browser = "other"
  if (/chrome/i.test(userAgent)) browser = "chrome"
  else if (/firefox/i.test(userAgent)) browser = "firefox"
  else if (/safari/i.test(userAgent)) browser = "safari"
  else if (/edge/i.test(userAgent)) browser = "edge"

  // Record analytics (fire and forget - but in Drizzle/Node we should await if we want to be safe, 
  // or use a separate worker, but for now we'll just await for simplicity or use the next server's waitUntil if available)
  
  await db.insert(linkAnalytics).values({
    linkId: link.id,
    device,
    browser,
    referrer: request.headers.get("referer"),
    // country/city would need a provider like Vercel geo or similar
  }).catch(err => console.error("Analytics error:", err))

  // Increment click count
  await db.update(shortLinks)
    .set({ clickCount: (link.clickCount || 0) + 1 })
    .where(eq(shortLinks.id, link.id))
    .catch(err => console.error("Update click count error:", err))

  return NextResponse.redirect(link.originalUrl)
}
