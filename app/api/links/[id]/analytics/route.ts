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
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "30d"

  const link = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)),
    columns: { id: true, clickCount: true },
  })

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const startDate = new Date()
  let daysCount = 30

  if (range === "24h") {
    startDate.setHours(startDate.getHours() - 24)
    daysCount = 1
  } else if (range === "7d") {
    startDate.setDate(startDate.getDate() - 7)
    daysCount = 7
  } else if (range === "90d") {
    startDate.setDate(startDate.getDate() - 90)
    daysCount = 90
  } else if (range === "1y") {
    startDate.setFullYear(startDate.getFullYear() - 1)
    daysCount = 365
  } else if (range === "2y") {
    startDate.setFullYear(startDate.getFullYear() - 2)
    daysCount = 730
  } else {
    // default 30d
    startDate.setDate(startDate.getDate() - 30)
    daysCount = 30
  }

  const analytics = await db.query.linkAnalytics.findMany({
    where: and(
      eq(linkAnalytics.linkId, id),
      gte(linkAnalytics.clickedAt, startDate)
    ),
  })

  // Compute unique redirects (distinct non-null ipHash)
  const uniqueIpSet = new Set<string>()
  analytics.forEach((a) => {
    if (a.ipHash) uniqueIpSet.add(a.ipHash)
  })

  // Build chart data
  const clicksByDate: Record<string, number> = {}
  analytics.forEach((a) => {
    const date = new Date(a.clickedAt || Date.now()).toISOString().split("T")[0]
    clicksByDate[date] = (clicksByDate[date] || 0) + 1
  })

  const chartData: Array<{ date: string; clicks: number }> = []
  const step = Math.max(1, Math.floor(daysCount / 30))
  for (let i = daysCount - 1; i >= 0; i -= step) {
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
    totalClicks: link.clickCount || analytics.length,
    uniqueRedirects: uniqueIpSet.size,
    chartData,
    deviceCounts,
    topCountries,
    topReferrers,
    topBrowsers,
  })
}

