import { createClient } from "@/lib/supabase/server"
import { Eye, MousePointer, Globe, Smartphone, Monitor, Tablet, TrendingUp } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { TopLinksTable } from "@/components/analytics/top-links-table"
import { GeoChart } from "@/components/analytics/geo-chart"

export const metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Please sign in to view analytics</p>
      </div>
    )
  }

  // Get user's bio page IDs first
  const { data: userBioPages } = await supabase
    .from("bio_pages")
    .select("id")
    .eq("user_id", user.id)
  
  const bioPageIds = userBioPages?.map(p => p.id) || []

  // Get user's short link IDs
  const { data: userShortLinks } = await supabase
    .from("short_links")
    .select("id")
    .eq("user_id", user.id)
  
  const shortLinkIds = userShortLinks?.map(l => l.id) || []

  // Get total page views
  let totalPageViews = 0
  if (bioPageIds.length > 0) {
    const { count } = await supabase
      .from("page_views")
      .select("id", { count: "exact" })
      .in("page_id", bioPageIds)
    totalPageViews = count || 0
  }

  // Get total link clicks  
  let totalLinkClicks = 0
  if (shortLinkIds.length > 0) {
    const { count } = await supabase
      .from("link_analytics")
      .select("id", { count: "exact" })
      .in("link_id", shortLinkIds)
    totalLinkClicks = count || 0
  }

  // Get clicks over the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let recentClicks: Array<{ clicked_at: string }> = []
  if (shortLinkIds.length > 0) {
    const { data } = await supabase
      .from("link_analytics")
      .select("clicked_at")
      .in("link_id", shortLinkIds)
      .gte("clicked_at", thirtyDaysAgo.toISOString())
      .order("clicked_at", { ascending: true })
    recentClicks = data || []
  }

  // Group clicks by date
  const clicksByDate: Record<string, number> = {}
  recentClicks.forEach(click => {
    const date = new Date(click.clicked_at).toISOString().split('T')[0]
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
  let deviceStats: Array<{ device: string | null }> = []
  if (shortLinkIds.length > 0) {
    const { data } = await supabase
      .from("link_analytics")
      .select("device")
      .in("link_id", shortLinkIds)
      .not("device", "is", null)
    deviceStats = data || []
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
  let countryStats: Array<{ country: string | null }> = []
  if (shortLinkIds.length > 0) {
    const { data } = await supabase
      .from("link_analytics")
      .select("country")
      .in("link_id", shortLinkIds)
      .not("country", "is", null)
      .limit(1000)
    countryStats = data || []
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
  const { data: topLinks } = await supabase
    .from("short_links")
    .select("id, title, short_code, click_count, original_url")
    .eq("user_id", user.id)
    .order("click_count", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track clicks, views, and engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <Eye className="size-4 text-muted-foreground" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" />
              +0%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {totalPageViews.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Page Views</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <MousePointer className="size-4 text-muted-foreground" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" />
              +0%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold tabular-nums tracking-tight">
              {totalLinkClicks.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Link Clicks</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <Globe className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold tracking-tight">
              {topCountries[0]?.[0] || "N/A"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Top Country</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <Monitor className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.desktop / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.mobile / totalDevices) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tablet className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium tabular-nums">
                {totalDevices > 0 ? Math.round((deviceCounts.tablet / totalDevices) * 100) : 0}%
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Device Breakdown</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">Clicks Over Time</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Last 30 days</p>
        </div>
        <div className="p-5">
          <AnalyticsChart data={chartData} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Links */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Top Links</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Most clicked links</p>
          </div>
          <div className="p-5">
            <TopLinksTable links={topLinks || []} />
          </div>
        </div>

        {/* Geographic */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Geographic Distribution</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Where your clicks come from</p>
          </div>
          <div className="p-5">
            <GeoChart countries={topCountries} />
          </div>
        </div>
      </div>
    </div>
  )
}
