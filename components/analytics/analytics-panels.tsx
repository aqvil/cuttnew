'use client'

import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { BreakdownList, countryLabel } from "@/components/analytics/breakdown-list"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import type { AnalyticsRange, AnalyticsSummary } from "@/lib/analytics/types"
import { RANGE_LABELS } from "@/lib/analytics/types"

/**
 * The breakdown grid shared by the account analytics page and each link's
 * detail page, plus a CSV export that actually writes a file.
 */

export function AnalyticsBreakdowns({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      <Panel title="Top referrers" description="Where the click came from">
        <BreakdownList items={summary.referrers} emptyMessage="No referrer data yet." />
      </Panel>

      <Panel title="Countries" description="Based on the visitor's network location">
        <BreakdownList
          items={summary.countries}
          formatLabel={countryLabel}
          emptyMessage="No location data yet."
        />
      </Panel>

      <Panel title="Devices" description="Desktop, mobile or tablet">
        <BreakdownList items={summary.devices} emptyMessage="No device data yet." />
      </Panel>

      <Panel title="Browsers">
        <BreakdownList items={summary.browsers} emptyMessage="No browser data yet." />
      </Panel>

      <Panel title="Operating systems">
        <BreakdownList
          items={summary.operatingSystems}
          emptyMessage="No OS data yet."
        />
      </Panel>

      <Panel title="Clicks vs. QR scans" description="How people reached the link">
        <BreakdownList
          items={[
            { label: "Link clicks", value: summary.totalClicks - summary.qrScans },
            { label: "QR scans", value: summary.qrScans },
          ].filter((item) => item.value > 0)}
          emptyMessage="No traffic in this period."
        />
      </Panel>
    </div>
  )
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-card p-5">
      <div className="mb-4 space-y-0.5">
        <h3 className="h3">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ClicksOverTime({
  summary,
  range,
  title = "Clicks over time",
}: {
  summary: AnalyticsSummary
  range: AnalyticsRange
  title?: string
}) {
  const hasData = summary.timeline.some((point) => point.clicks > 0)

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="h3">{title}</h3>
          <p className="text-xs text-muted-foreground">{RANGE_LABELS[range]}</p>
        </div>
        <ExportButton summary={summary} range={range} />
      </div>

      {hasData ? (
        <ClicksChart data={summary.timeline} range={range} />
      ) : (
        <div className="flex h-[260px] flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium">No clicks in this period</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Share your short link and clicks will appear here within seconds.
          </p>
        </div>
      )}
    </section>
  )
}

/**
 * Exports the visible analytics as CSV. Everything written comes from the
 * summary already on screen — nothing is invented to fill a column.
 */
function ExportButton({
  summary,
  range,
}: {
  summary: AnalyticsSummary
  range: AnalyticsRange
}) {
  const handleExport = () => {
    if (summary.totalClicks === 0) {
      toast.error("There's no data to export for this period.")
      return
    }

    const rows: string[][] = [["Section", "Label", "Clicks"]]

    for (const point of summary.timeline) {
      rows.push(["Timeline", point.bucket, String(point.clicks)])
    }
    for (const [section, items] of [
      ["Referrer", summary.referrers],
      ["Country", summary.countries],
      ["Device", summary.devices],
      ["Browser", summary.browsers],
      ["Operating system", summary.operatingSystems],
    ] as const) {
      for (const item of items) rows.push([section, item.label, String(item.value)])
    }

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n")

    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `cuttly-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    toast.success("Analytics exported.")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" aria-hidden="true" />
      Export
    </Button>
  )
}
