'use client'

import { useEffect, useState } from "react"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { Globe, ExternalLink, Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LinkAnalyticsData {
  chartData: Array<{ date: string; clicks: number }>
  totalClicks: number
  uniqueRedirects?: number
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
  const [locationTab, setLocationTab] = useState<"countries" | "cities">("countries")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/links/${linkId}/analytics?range=30d`)
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
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-40 shimmer rounded-[3px]" />
        ))}
      </div>
    )
  }

  const hasData = (data?.totalClicks || 0) > 0

  return (
    <div className="space-y-5 font-mono text-foreground">
      {/* Engagements Over Time Box matching screenshot */}
      <div className="p-5 rounded-[3px] border border-border bg-card space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Engagements over time</h3>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono font-semibold gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-[3px]">
            <Sparkles className="w-3.5 h-3.5" /> What's driving engagement?
          </Button>
        </div>

        {hasData ? (
          <div className="py-2">
            <AnalyticsChart data={data?.chartData || []} />
          </div>
        ) : (
          <div className="relative py-12 px-4 rounded-[3px] border border-border/60 bg-muted/20 text-center space-y-2 overflow-hidden">
            <div className="max-w-md mx-auto space-y-1 relative z-10">
              <div className="text-xs font-bold text-foreground">No data for this time period</div>
              <p className="text-[11px] text-muted-foreground">
                Share your short link to view where your engagements are coming from.
              </p>
            </div>
            {/* Background SVG decorative chart curve */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-primary" fill="none" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,80 Q100,20 200,60 T400,30" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}
      </div>

      {/* Side-by-Side Locations & Referrers Grid matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Locations Card */}
        <div className="p-5 rounded-[3px] border border-border bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-foreground">Locations</h3>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setLocationTab("countries")}
                  className={`font-bold transition-colors ${locationTab === "countries" ? "text-primary underline" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Countries
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setLocationTab("cities")}
                  className={`font-bold transition-colors ${locationTab === "cities" ? "text-primary underline" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Cities
                </button>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="h-7 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground gap-1">
              <Plus className="w-3.5 h-3.5" /> Compare
            </Button>
          </div>

          {hasData && data?.topCountries && data.topCountries.length > 0 ? (
            <div className="divide-y divide-border/60 text-xs">
              {data.topCountries.slice(0, 5).map(([country, count]) => (
                <div key={country} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" /> {country}
                  </span>
                  <span className="font-bold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-4 rounded-[3px] border border-border/60 bg-muted/20 text-center space-y-1">
              <div className="text-xs font-bold text-foreground">No data for this time period</div>
              <p className="text-[11px] text-muted-foreground">
                Share your short link to view where your engagements are coming from.
              </p>
            </div>
          )}
        </div>

        {/* Referrers Card */}
        <div className="p-5 rounded-[3px] border border-border bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Referrers</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground gap-1">
              <Plus className="w-3.5 h-3.5" /> Compare
            </Button>
          </div>

          {hasData && data?.topReferrers && data.topReferrers.length > 0 ? (
            <div className="divide-y divide-border/60 text-xs">
              {data.topReferrers.slice(0, 5).map(([ref, count]) => (
                <div key={ref} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> {ref || "Direct / None"}
                  </span>
                  <span className="font-bold text-foreground shrink-0">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-4 rounded-[3px] border border-border/60 bg-muted/20 text-center space-y-1">
              <div className="text-xs font-bold text-foreground">No data for this time period</div>
              <p className="text-[11px] text-muted-foreground">
                Share your short link to view Referrers stats about your clicks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
