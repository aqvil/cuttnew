import { db } from "@/lib/db"
import { linkAnalytics, shortLinks } from "@/lib/db/schema"
import { eq, and, gte } from "drizzle-orm"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify link belongs to user
  const link = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)),
    columns: { id: true, clickCount: true },
  })

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const analytics = await db.query.linkAnalytics.findMany({
    where: and(
      eq(linkAnalytics.linkId, id),
      gte(linkAnalytics.clickedAt, thirtyDaysAgo)
    ),
  })

  // Build chart data
  const clicksByDate: Record<string, number> = {}
  analytics.forEach((a) => {
    const date = new Date(a.clickedAt || Date.now()).toISOString().split("T")[0]
    clicksByDate[date] = (clicksByDate[date] || 0) + 1
  })

  const chartData: Array<{ date: string; clicks: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    chartData.push({ date: dateStr, clicks: clicksByDate[dateStr] || 0 })
  }

  // Devices
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
  analytics.forEach((a) => {
    if (a.device && a.device in deviceCounts) {
      deviceCounts[a.device as keyof typeof deviceCounts]++
    }
  })

  // Countries
  const countryCounts: Record<string, number> = {}
  analytics.forEach((a) => {
    if (a.country) countryCounts[a.country] = (countryCounts[a.country] || 0) + 1
  })
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Referrers
  const referrerCounts: Record<string, number> = {}
  analytics.forEach((a) => {
    const ref = a.referrer || ""
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
  })
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Browsers
  const browserCounts: Record<string, number> = {}
  analytics.forEach((a) => {
    if (a.browser) browserCounts[a.browser] = (browserCounts[a.browser] || 0) + 1
  })
  const topBrowsers = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return NextResponse.json({
    totalClicks: link.clickCount || 0,
    chartData,
    deviceCounts,
    topCountries,
    topReferrers,
    topBrowsers,
  })
}
