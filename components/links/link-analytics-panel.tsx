'use client'

import { useEffect, useState } from "react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { Globe, Monitor, Smartphone, Tablet, MousePointer, ExternalLink } from "lucide-react"

interface LinkAnalyticsData {
  chartData: Array<{ date: string; clicks: number }>
  totalClicks: number
  deviceCounts: { desktop: number; mobile: number; tablet: number }
  topCountries: Array<[string, number]>
  topReferrers: Array<[string, number]>
  topBrowsers: Array<[string, number]>
}

interface LinkAnalyticsPanelProps {
  linkId: string
}

export function LinkAnalyticsPanel({ linkId }: LinkAnalyticsPanelProps) {
  const [data, setData] = useState<LinkAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/links/${linkId}/analytics`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [linkId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 shimmer rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
        <MousePointer className="mb-4 size-8 opacity-40" />
        <p className="font-medium">No analytics data yet</p>
        <p className="text-sm mt-1">Share your link to start tracking clicks.</p>
      </div>
    )
  }

  const totalDevices = data.deviceCounts.desktop + data.deviceCounts.mobile + data.deviceCounts.tablet
  const pct = (n: number) => totalDevices > 0 ? Math.round((n / totalDevices) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="dash-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Clicks</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{data.totalClicks.toLocaleString()}</p>
        </div>
        <div className="dash-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Country</p>
          <p className="mt-2 text-3xl font-bold">{data.topCountries[0]?.[0] || "—"}</p>
        </div>
        <div className="dash-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top Referrer</p>
          <p className="mt-2 text-sm font-bold truncate">{data.topReferrers[0]?.[0]?.replace(/^https?:\/\//, "").split("/")[0] || "Direct"}</p>
        </div>
        <div className="dash-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile %</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{pct(data.deviceCounts.mobile)}%</p>
        </div>
      </div>

      {/* Click chart */}
      <div className="dash-panel overflow-hidden">
        <div className="dash-panel-header">
          <h3 className="dash-panel-title">Clicks — last 30 days</h3>
        </div>
        <div className="p-5">
          <AnalyticsChart data={data.chartData} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Devices */}
        <div className="dash-panel overflow-hidden">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Devices</h3>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: "Desktop", icon: Monitor, count: data.deviceCounts.desktop },
              { label: "Mobile",  icon: Smartphone, count: data.deviceCounts.mobile },
              { label: "Tablet",  icon: Tablet, count: data.deviceCounts.tablet },
            ].map(({ label, icon: Icon, count }) => (
              <div key={label} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="h-1.5 w-24 rounded-full bg-muted">
                    <span
                      className="block h-1.5 rounded-full bg-foreground transition-all"
                      style={{ width: `${pct(count)}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-xs font-bold tabular-nums">{pct(count)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="dash-panel overflow-hidden">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Top Countries</h3>
          </div>
          <div className="divide-y divide-border">
            {data.topCountries.length > 0 ? data.topCountries.slice(0, 5).map(([country, count]) => {
              const total = data.topCountries.reduce((s, [, c]) => s + c, 0)
              return (
                <div key={country} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="h-1.5 w-24 rounded-full bg-muted">
                      <span
                        className="block h-1.5 rounded-full bg-foreground"
                        style={{ width: `${total > 0 ? Math.round((count / total) * 100) : 0}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-xs font-bold tabular-nums">{count}</span>
                  </div>
                </div>
              )
            }) : (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">No country data yet</div>
            )}
          </div>
        </div>

        {/* Referrers */}
        <div className="dash-panel overflow-hidden lg:col-span-2">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title">Referrer Sources</h3>
          </div>
          <div className="divide-y divide-border">
            {data.topReferrers.length > 0 ? data.topReferrers.slice(0, 8).map(([ref, count]) => {
              const total = data.topReferrers.reduce((s, [, c]) => s + c, 0)
              const domain = ref ? ref.replace(/^https?:\/\//, "").split("/")[0] : "Direct / None"
              return (
                <div key={ref} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{domain}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="h-1.5 w-28 rounded-full bg-muted">
                      <span
                        className="block h-1.5 rounded-full bg-foreground"
                        style={{ width: `${total > 0 ? Math.round((count / total) * 100) : 0}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-xs font-bold tabular-nums">{count}</span>
                  </div>
                </div>
              )
            }) : (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">No referrer data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
