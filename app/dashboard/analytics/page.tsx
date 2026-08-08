import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, inArray, gte, and, desc, sql } from "drizzle-orm"
import { Eye, MousePointer, Globe, Smartphone, Monitor, Tablet, TrendingUp, Sparkles, Lock, Plus, ArrowRight, BarChart3, LayoutGrid } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { TopLinksTable } from "@/components/analytics/top-links-table"
import { GeoChart } from "@/components/analytics/geo-chart"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Get user's bio page IDs
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

  let recentClicks: Array<{ clickedAt: Date | null }> = []
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

  // Get country breakdown
  let countryStats: Array<{ country: string | null }> = []
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
    <div className="max-w-7xl mx-auto space-y-8 p-6 font-mono">
      {/* Bitly Header Row (Attachment 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <Button size="sm" className="font-mono text-xs font-bold gap-1.5 bg-primary text-primary-foreground">
          <Sparkles className="w-3.5 h-3.5" /> Analyze with AI
        </Button>
      </div>

      {/* Bitly Callout Banner (Attachment 5) */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-foreground flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <span>Upgrade to view performance data, uncover themes, and get actionable insights.</span>
        </div>
        <Button variant="link" className="text-xs font-bold text-teal-500 hover:underline p-0 h-auto shrink-0">
          Upgrade &rarr;
        </Button>
      </div>

      {/* Dashboards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
          <span>Dashboards</span>
          <span className="text-primary hover:underline cursor-pointer flex items-center gap-1">
            View all &rarr;
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-dashed border-border bg-card/40 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer min-h-[100px]">
            <Plus className="w-4 h-4" /> Create dashboard
          </div>
          <div className="p-5 rounded-xl border border-border bg-card space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Preview dashboard</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Modified on Jan 15, 2025</span>
          </div>
        </div>
      </div>

      {/* Last Week's Insights (Attachment 5 Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
          <span>Last week's insights</span>
          <span className="text-muted-foreground font-mono">Jul 27 – Aug 2, 2026</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Channel */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              CHANNEL
            </div>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              Traffic from social channels dropped compared to the week before.
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs font-mono font-bold gap-1.5 border-border">
              <Lock className="w-3 h-3 text-muted-foreground" /> Unlock insights
            </Button>
          </div>

          {/* Card 2: Link */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              LINK
            </div>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              Link traffic was up in overall engagement compared to the week before.
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs font-mono font-bold gap-1.5 border-border">
              <Lock className="w-3 h-3 text-muted-foreground" /> Unlock insights
            </Button>
          </div>

          {/* Card 3: Peak Engagement */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              PEAK ENGAGEMENT
            </div>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              Engagement peaked on Thursday during mid-day campaign window.
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs font-mono font-bold gap-1.5 border-border">
              <Lock className="w-3 h-3 text-muted-foreground" /> Unlock insights
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Overview Timeline */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Performance overview</h2>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Summarize
          </Button>
        </div>
        <AnalyticsChart data={chartData} />
      </div>

      {/* Bottom Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Top Performing Links</h2>
          <TopLinksTable links={topLinksData.map(l => ({
            id: l.id,
            title: l.title,
            short_code: l.shortCode,
            click_count: l.clickCount || 0,
            original_url: l.originalUrl,
          }))} />
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Geographic Distribution</h2>
          <GeoChart countries={topCountries} />
        </div>
      </div>
    </div>
  )
}
