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
    <div className="space-y-10">
      <div className="border-b-2 border-primary pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Analytics</h1>
        <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Metric Stream // Region: Global // Duration: 30D
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-mono !p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="size-5 text-primary" />
            <span className="flex items-center gap-1 text-[8px] font-mono font-black uppercase tracking-widest text-primary">
              <TrendingUp className="size-3" />
              LIVE_DATA
            </span>
          </div>
          <div>
            <p className="text-4xl font-black italic tracking-tighter tabular-nums">
              {totalPageViews.toLocaleString()}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">PAGE_VIEWS</p>
          </div>
        </div>

        <div className="card-mono !p-6">
          <div className="flex items-center justify-between mb-4">
            <MousePointer className="size-5 text-primary" />
            <span className="flex items-center gap-1 text-[8px] font-mono font-black uppercase tracking-widest text-primary">
              <TrendingUp className="size-3" />
              IN_SYNC
            </span>
          </div>
          <div>
            <p className="text-4xl font-black italic tracking-tighter tabular-nums">
              {totalLinkClicks.toLocaleString()}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">LINK_CLICKS</p>
          </div>
        </div>

        <div className="card-mono !p-6">
          <div className="flex items-center justify-between mb-4">
            <Globe className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black uppercase italic tracking-tight">
              {topCountries[0]?.[0] || "N/A"}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">TOP_ORIGIN</p>
          </div>
        </div>

        <div className="card-mono !p-6">
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="size-3 text-muted-foreground" />
                <span className="text-[8px] font-mono font-black uppercase">DESKTOP</span>
              </div>
              <span className="text-[10px] font-mono font-bold tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.desktop / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="size-3 text-muted-foreground" />
                <span className="text-[8px] font-mono font-black uppercase">MOBILE</span>
              </div>
              <span className="text-[10px] font-mono font-bold tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.mobile / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="size-3 text-muted-foreground" />
                <span className="text-[8px] font-mono font-black uppercase">TABLET</span>
              </div>
              <span className="text-[10px] font-mono font-bold tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.tablet / totalDevices) * 100) : 0}%
              </span>
            </div>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">HARDWARE_DECRYPT</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card-mono !p-0 overflow-hidden">
        <div className="border-b-2 border-primary px-8 py-5 bg-muted/20">
          <h2 className="text-lg font-black uppercase italic tracking-tight italic tracking-tight">Access Frequency</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">30_DAY_TEMPORAL_BUFFER</p>
        </div>
        <div className="p-8">
          <AnalyticsChart data={chartData} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Top Links */}
        <div className="card-mono !p-0 overflow-hidden">
          <div className="border-b-2 border-primary px-8 py-5 bg-muted/20">
            <h2 className="text-lg font-black uppercase italic tracking-tight">High_Yield_Nodes</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Most effective redirection points</p>
          </div>
          <div className="p-4">
            <TopLinksTable links={topLinksData.map(l => ({ ...l, short_code: l.shortCode, click_count: l.clickCount }))} />
          </div>
        </div>

        {/* Geographic */}
        <div className="card-mono !p-0 overflow-hidden">
          <div className="border-b-2 border-primary px-8 py-5 bg-muted/20">
            <h2 className="text-lg font-black uppercase italic tracking-tight">Geospatial Distribution</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Vector origin mapping</p>
          </div>
          <div className="p-8">
            <GeoChart countries={topCountries} />
          </div>
        </div>
      </div>
    </div>
  )
}
