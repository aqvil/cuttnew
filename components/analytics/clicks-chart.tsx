'use client'

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AnalyticsRange, TimelinePoint } from "@/lib/analytics/types"

/**
 * Clicks over time.
 *
 * Colours come from `--color-chart-1`, which is a real hex value in both
 * themes. The previous chart used `hsl(var(--foreground))`, but the tokens
 * aren't HSL triplets — the whole expression resolved to nothing, so the line
 * and fill rendered with the browser default rather than the brand colour.
 */

interface ClicksChartProps {
  data: TimelinePoint[]
  range: AnalyticsRange
  height?: number
}

function tickFormatter(range: AnalyticsRange) {
  return (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    if (range === "24h") {
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    }
    if (range === "12m") {
      return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    }
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }
}

function fullLabel(value: string, range: AnalyticsRange) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  if (range === "24h") {
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  if (range === "12m") {
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function ClicksChart({ data, range, height = 260 }: ClicksChartProps) {
  const format = useMemo(() => tickFormatter(range), [range])

  // With a long window, labelling every bucket produces unreadable overlap.
  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1)

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="clicks-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="bucket"
            tickFormatter={format}
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={44}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />

          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const value = Number(payload[0].value ?? 0)
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-[var(--shadow-overlay)]">
                  <p className="text-xs text-muted-foreground">
                    {fullLabel(String(label), range)}
                  </p>
                  <p className="mt-0.5 font-medium tabular">
                    {value.toLocaleString()} click{value === 1 ? "" : "s"}
                  </p>
                </div>
              )
            }}
          />

          <Area
            type="monotone"
            dataKey="clicks"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#clicks-fill)"
            // A dot per point is noise at 90 points and useful at 7.
            dot={data.length <= 14 ? { r: 2.5, strokeWidth: 0, fill: "var(--color-chart-1)" } : false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-background)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
