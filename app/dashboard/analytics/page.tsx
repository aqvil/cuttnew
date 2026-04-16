import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, inArray, gte, and, desc, sql } from "drizzle-orm"
import { Eye, MousePointer, Globe, Smartphone, Monitor, Tablet, TrendingUp } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { TopLinksTable } from "@/components/analytics/top-links-table"
import { GeoChart } from "@/components/analytics/geo-chart"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Get user's bio page IDs first
  const userBioPages = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    columns: { id: true }
  })
  
  const bioPageIds = userBioPages.map(p => p.id)

  // Get user's short link IDs
  const userShortLinks = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    columns: { id: true }
  })
  
  const shortLinkIds = userShortLinks.map(l => l.id)

  // Get total page views
  let totalPageViews = 0
  if (bioPageIds.length > 0) {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(pageViews).where(inArray(pageViews.pageId, bioPageIds))
    totalPageViews = Number(result?.count || 0)
  }

  // Get total link clicks  
  let totalLinkClicks = 0
  if (shortLinkIds.length > 0) {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(linkAnalytics).where(inArray(linkAnalytics.linkId, shortLinkIds))
    totalLinkClicks = Number(result?.count || 0)
  }

  // Get clicks over the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let recentClicks = []
  if (shortLinkIds.length > 0) {
    recentClicks = await db.query.linkAnalytics.findMany({
      where: and(inArray(linkAnalytics.linkId, shortLinkIds), gte(linkAnalytics.clickedAt, thirtyDaysAgo)),
      orderBy: [desc(linkAnalytics.clickedAt)],
    })
  }

  // Group clicks by date
  const clicksByDate: Record<string, number> = {}
  recentClicks.forEach(click => {
    const date = new Date(click.clickedAt || Date.now()).toISOString().split('T')[0]
    clicksByDate[date] = (clicksByDate[date] || 0) + 1
  })

  // Fill in missing dates with 0
  const chartData: Array<{ date: string; clicks: number }> = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    chartData.push({
      date: dateStr,
      clicks: clicksByDate[dateStr] || 0,
    })
  }

  // Get device breakdown
  let deviceStats = []
  if (shortLinkIds.length > 0) {
    deviceStats = await db.query.linkAnalytics.findMany({
      where: and(inArray(linkAnalytics.linkId, shortLinkIds), sql`${linkAnalytics.device} is not null`),
      columns: { device: true },
    })
  }

  const deviceCounts = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  }
  deviceStats.forEach(stat => {
    if (stat.device && stat.device in deviceCounts) {
      deviceCounts[stat.device as keyof typeof deviceCounts]++
    }
  })
  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0)

  // Get country breakdown
  let countryStats = []
  if (shortLinkIds.length > 0) {
    countryStats = await db.query.linkAnalytics.findMany({
      where: and(inArray(linkAnalytics.linkId, shortLinkIds), sql`${linkAnalytics.country} is not null`),
      columns: { country: true },
      limit: 1000
    })
  }

  const countryCounts: Record<string, number> = {}
  countryStats.forEach(stat => {
    if (stat.country) {
      countryCounts[stat.country] = (countryCounts[stat.country] || 0) + 1
    }
  })

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Get top links
  const topLinksData = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.clickCount)],
    limit: 10
  })

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-8 font-sans">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your engagements and trends from the last 30 days.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Page Views</span>
            <Eye className="size-4 text-slate-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 tabular-nums">
              {totalPageViews.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Link Clicks</span>
            <MousePointer className="size-4 text-slate-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 tabular-nums">
              {totalLinkClicks.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Top Origin</span>
            <Globe className="size-4 text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {topCountries[0]?.[0] || "N/A"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="space-y-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="size-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Desktop</span>
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-900">
                {totalDevices > 0 ? Math.round((deviceCounts.desktop / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="size-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Mobile</span>
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-900">
                {totalDevices > 0 ? Math.round((deviceCounts.mobile / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="size-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Tablet</span>
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-900">
                {totalDevices > 0 ? Math.round((deviceCounts.tablet / totalDevices) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card overflow-hidden">
        <div className="border-b border-border px-8 py-5 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Engagements Over Time</h2>
        </div>
        <div className="p-8">
          <AnalyticsChart data={chartData} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Links */}
        <div className="card overflow-hidden">
          <div className="border-b border-border px-8 py-5 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Top Performing Links</h2>
          </div>
          <div className="p-4">
            <TopLinksTable links={topLinksData.map(l => ({ ...l, short_code: l.shortCode, click_count: l.clickCount }))} />
          </div>
        </div>

        {/* Geographic */}
        <div className="card overflow-hidden">
          <div className="border-b border-border px-8 py-5 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Geographic Distribution</h2>
          </div>
          <div className="p-8">
            <GeoChart countries={topCountries} />
          </div>
        </div>
      </div>
    </div>
  )
}
