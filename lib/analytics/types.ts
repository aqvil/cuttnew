/**
 * Analytics shapes and labels shared by server queries and client components.
 *
 * Kept separate from `queries.ts`, which is `server-only` and imports the
 * Postgres driver. A client component that needed `RANGE_LABELS` would
 * otherwise drag `pg` — and its `net`/`tls` requires — into the browser
 * bundle, which fails the build.
 */

export type AnalyticsRange = "24h" | "7d" | "30d" | "90d" | "12m"

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
}

export function isAnalyticsRange(value: unknown): value is AnalyticsRange {
  return typeof value === "string" && value in RANGE_LABELS
}

export interface TimelinePoint {
  bucket: string
  clicks: number
}

export interface Breakdown {
  label: string
  value: number
}

export interface AnalyticsSummary {
  totalClicks: number
  uniqueVisitors: number
  qrScans: number
  /** Clicks in the equivalent preceding window. */
  previousClicks: number
  timeline: TimelinePoint[]
  referrers: Breakdown[]
  countries: Breakdown[]
  devices: Breakdown[]
  browsers: Breakdown[]
  operatingSystems: Breakdown[]
}
