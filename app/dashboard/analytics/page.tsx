import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointer, Globe, Smartphone, Monitor, Tablet } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { TopLinksTable } from "@/components/analytics/top-links-table"
import { GeoChart } from "@/components/analytics/geo-chart"

export const metadata = {
  title: "Analytics",
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get total page views
  const { count: totalPageViews } = await supabase
    .from("page_views")
    .select("id", { count: "exact" })
    .in("page_id", 
      supabase.from("bio_pages").select("id").eq("user_id", user?.id)
    )

  // Get total link clicks  
  const { count: totalLinkClicks } = await supabase
    .from("link_analytics")
    .select("id", { count: "exact" })
    .in("short_link_id",
      supabase.from("short_links").select("id").eq("user_id", user?.id)
    )

  // Get clicks over the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentClicks } = await supabase
    .from("link_analytics")
    .select("created_at")
    .in("short_link_id",
      supabase.from("short_links").select("id").eq("user_id", user?.id)
    )
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true })

  // Group clicks by date
  const clicksByDate: Record<string, number> = {}
  recentClicks?.forEach(click => {
    const date = new Date(click.created_at).toISOString().split('T')[0]
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
  const { data: deviceStats } = await supabase
    .from("link_analytics")
    .select("device")
    .in("short_link_id",
      supabase.from("short_links").select("id").eq("user_id", user?.id)
    )
    .not("device", "is", null)

  const deviceCounts = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  }
  deviceStats?.forEach(stat => {
    if (stat.device && stat.device in deviceCounts) {
      deviceCounts[stat.device as keyof typeof deviceCounts]++
    }
  })
  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0)

  // Get country breakdown
  const { data: countryStats } = await supabase
    .from("link_analytics")
    .select("country")
    .in("short_link_id",
      supabase.from("short_links").select("id").eq("user_id", user?.id)
    )
    .not("country", "is", null)
    .limit(1000)

  const countryCounts: Record<string, number> = {}
  countryStats?.forEach(stat => {
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
    .eq("user_id", user?.id)
    .order("click_count", { ascending: false })
    .limit(10)

  const stats = [
    {
      title: "Total Page Views",
      value: totalPageViews || 0,
      icon: Eye,
      description: "Bio page views",
    },
    {
      title: "Total Link Clicks",
      value: totalLinkClicks || 0,
      icon: MousePointer,
      description: "Short link clicks",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance and understand your audience
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
        
        {/* Device Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span>{totalDevices > 0 ? Math.round((deviceCounts.desktop / totalDevices) * 100) : 0}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span>{totalDevices > 0 ? Math.round((deviceCounts.mobile / totalDevices) * 100) : 0}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Tablet className="h-3 w-3" />
                <span>{totalDevices > 0 ? Math.round((deviceCounts.tablet / totalDevices) * 100) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Country */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCountries[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCountries[0]?.[1] || 0} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clicks Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
          <CardDescription>Link clicks over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
            <CardDescription>Your most clicked links</CardDescription>
          </CardHeader>
          <CardContent>
            <TopLinksTable links={topLinks || []} />
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Where your clicks come from</CardDescription>
          </CardHeader>
          <CardContent>
            <GeoChart countries={topCountries} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
