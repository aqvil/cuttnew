import "server-only"

import { db } from "@/lib/db"
import { linkAnalytics, shortLinks } from "@/lib/db/schema"
import { and, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm"
import type { AnyPgColumn } from "drizzle-orm/pg-core"
import {
  RANGE_LABELS,
  type AnalyticsRange,
  type AnalyticsSummary,
  type Breakdown,
  type TimelinePoint,
} from "./types"

// Re-exported so server modules can keep importing everything from one place.
export { RANGE_LABELS, isAnalyticsRange } from "./types"
export type { AnalyticsRange, AnalyticsSummary, Breakdown, TimelinePoint } from "./types"

/**
 * Analytics aggregation.
 *
 * Everything here is a GROUP BY in Postgres. The previous implementation
 * selected every click row into Node and reduced it with `forEach`, which
 * means a link with a million clicks tried to materialise a million rows in
 * memory to compute a five-row table.
 *
 * Only metrics the click record can actually support are exposed. There is no
 * city breakdown because the redirect never captured a city, and inventing one
 * would be worse than omitting it.
 */

interface Window {
  start: Date
  end: Date
  /** Previous window of equal length, for period-over-period comparison. */
  previousStart: Date
  /** Postgres date_trunc unit for the timeline. */
  bucket: "hour" | "day" | "month"
}

export function resolveWindow(range: AnalyticsRange): Window {
  const end = new Date()
  const start = new Date(end)
  let bucket: Window["bucket"] = "day"

  switch (range) {
    case "24h":
      start.setHours(start.getHours() - 24)
      bucket = "hour"
      break
    case "7d":
      start.setDate(start.getDate() - 7)
      break
    case "90d":
      start.setDate(start.getDate() - 90)
      break
    case "12m":
      start.setMonth(start.getMonth() - 12)
      bucket = "month"
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  const spanMs = end.getTime() - start.getTime()
  return { start, end, previousStart: new Date(start.getTime() - spanMs), bucket }
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalClicks: 0,
  uniqueVisitors: 0,
  qrScans: 0,
  previousClicks: 0,
  timeline: [],
  referrers: [],
  countries: [],
  devices: [],
  browsers: [],
  operatingSystems: [],
}

/** Turns a raw referrer URL into a readable source name. */
function referrerLabel(referrer: string | null): string {
  if (!referrer) return "Direct"
  try {
    return new URL(referrer).hostname.replace(/^www\./, "")
  } catch {
    return referrer.slice(0, 60)
  }
}

/** Any nullable text column on link_analytics can be grouped this way. */
type BreakdownColumn = AnyPgColumn

async function breakdownBy(
  column: BreakdownColumn,
  linkIds: string[],
  start: Date,
  limit: number,
  fallbackLabel: string
): Promise<Breakdown[]> {
  const rows = await db
    .select({ label: sql<string | null>`${column}`, value: count() })
    .from(linkAnalytics)
    .where(
      and(inArray(linkAnalytics.linkId, linkIds), gte(linkAnalytics.clickedAt, start))
    )
    .groupBy(column)
    .orderBy(desc(count()))
    .limit(limit)

  return rows.map((row) => ({
    label: row.label || fallbackLabel,
    value: Number(row.value),
  }))
}

/**
 * Aggregates analytics for a set of links the caller is known to own.
 * Callers must scope `linkIds` themselves — this function performs no
 * authorization of its own.
 */
export async function getAnalyticsSummary(
  linkIds: string[],
  range: AnalyticsRange
): Promise<AnalyticsSummary> {
  if (linkIds.length === 0) return EMPTY_SUMMARY

  const { start, previousStart, bucket } = resolveWindow(range)
  const inWindow = and(
    inArray(linkAnalytics.linkId, linkIds),
    gte(linkAnalytics.clickedAt, start)
  )

  const [
    [totals],
    [previous],
    timelineRows,
    referrerRows,
    countries,
    devices,
    browsers,
    operatingSystems,
  ] = await Promise.all([
    db
      .select({
        totalClicks: count(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${linkAnalytics.ipHash})`,
        qrScans: sql<number>`COUNT(*) FILTER (WHERE ${linkAnalytics.source} = 'qr')`,
      })
      .from(linkAnalytics)
      .where(inWindow),

    db
      .select({ value: count() })
      .from(linkAnalytics)
      .where(
        and(
          inArray(linkAnalytics.linkId, linkIds),
          gte(linkAnalytics.clickedAt, previousStart),
          lt(linkAnalytics.clickedAt, start)
        )
      ),

    db
      .select({
        bucket: sql<string>`to_char(date_trunc(${bucket}, ${linkAnalytics.clickedAt}), 'YYYY-MM-DD"T"HH24:MI:SS')`,
        clicks: count(),
      })
      .from(linkAnalytics)
      .where(inWindow)
      .groupBy(sql`date_trunc(${bucket}, ${linkAnalytics.clickedAt})`)
      .orderBy(sql`date_trunc(${bucket}, ${linkAnalytics.clickedAt})`),

    db
      .select({ label: linkAnalytics.referrer, value: count() })
      .from(linkAnalytics)
      .where(inWindow)
      .groupBy(linkAnalytics.referrer)
      .orderBy(desc(count()))
      .limit(30),

    breakdownBy(linkAnalytics.country, linkIds, start, 10, "Unknown"),
    breakdownBy(linkAnalytics.device, linkIds, start, 5, "Unknown"),
    breakdownBy(linkAnalytics.browser, linkIds, start, 8, "Other"),
    breakdownBy(linkAnalytics.os, linkIds, start, 8, "Other"),
  ])

  // Collapse referrers by hostname after grouping — many distinct URLs map to
  // one source, and doing it in SQL would need a regex per row.
  const referrerTotals = new Map<string, number>()
  for (const row of referrerRows) {
    const label = referrerLabel(row.label)
    referrerTotals.set(label, (referrerTotals.get(label) || 0) + Number(row.value))
  }
  const referrers = Array.from(referrerTotals, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  return {
    totalClicks: Number(totals?.totalClicks || 0),
    uniqueVisitors: Number(totals?.uniqueVisitors || 0),
    qrScans: Number(totals?.qrScans || 0),
    previousClicks: Number(previous?.value || 0),
    timeline: fillTimeline(timelineRows, range),
    referrers,
    countries,
    devices,
    browsers,
    operatingSystems,
  }
}

/**
 * Postgres only returns buckets that contain rows. A chart with gaps misleads,
 * so empty buckets are filled with zero across the whole window.
 */
function fillTimeline(
  rows: Array<{ bucket: string; clicks: number }>,
  range: AnalyticsRange
): TimelinePoint[] {
  const { start, end, bucket } = resolveWindow(range)
  const counts = new Map(rows.map((r) => [r.bucket.slice(0, 19), Number(r.clicks)]))
  const points: TimelinePoint[] = []

  const cursor = new Date(start)
  if (bucket === "hour") cursor.setMinutes(0, 0, 0)
  else if (bucket === "day") cursor.setHours(0, 0, 0, 0)
  else {
    cursor.setDate(1)
    cursor.setHours(0, 0, 0, 0)
  }

  // Guard against an unbounded loop if a range is ever misconfigured.
  const maxPoints = 400

  while (cursor <= end && points.length < maxPoints) {
    const key = localIsoKey(cursor)
    points.push({ bucket: key, clicks: counts.get(key) ?? 0 })

    if (bucket === "hour") cursor.setHours(cursor.getHours() + 1)
    else if (bucket === "day") cursor.setDate(cursor.getDate() + 1)
    else cursor.setMonth(cursor.getMonth() + 1)
  }

  return points
}

/** `YYYY-MM-DDTHH:MM:SS` in local time, matching the to_char format above. */
function localIsoKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

/** IDs of every link owned by a user — the scope for account-wide analytics. */
export async function getOwnedLinkIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ id: shortLinks.id })
    .from(shortLinks)
    .where(eq(shortLinks.userId, userId))
  return rows.map((r) => r.id)
}

export interface TopLink {
  id: string
  title: string | null
  shortCode: string
  originalUrl: string
  clicks: number
}

/** Best-performing links inside the selected window (not lifetime totals). */
export async function getTopLinks(
  userId: string,
  range: AnalyticsRange,
  limit = 8
): Promise<TopLink[]> {
  const { start } = resolveWindow(range)

  const rows = await db
    .select({
      id: shortLinks.id,
      title: shortLinks.title,
      shortCode: shortLinks.shortCode,
      originalUrl: shortLinks.originalUrl,
      clicks: count(linkAnalytics.id),
    })
    .from(shortLinks)
    .leftJoin(
      linkAnalytics,
      and(
        eq(linkAnalytics.linkId, shortLinks.id),
        gte(linkAnalytics.clickedAt, start)
      )
    )
    .where(eq(shortLinks.userId, userId))
    .groupBy(shortLinks.id)
    .orderBy(desc(count(linkAnalytics.id)), desc(shortLinks.createdAt))
    .limit(limit)

  return rows.map((row) => ({ ...row, clicks: Number(row.clicks) }))
}

export interface RecentClick {
  clickedAt: Date | null
  country: string | null
  device: string | null
  browser: string | null
  referrer: string | null
  source: string | null
  shortCode: string
}

/** The most recent clicks, for the live activity feed. */
export async function getRecentClicks(
  linkIds: string[],
  limit = 12
): Promise<RecentClick[]> {
  if (linkIds.length === 0) return []

  return db
    .select({
      clickedAt: linkAnalytics.clickedAt,
      country: linkAnalytics.country,
      device: linkAnalytics.device,
      browser: linkAnalytics.browser,
      referrer: linkAnalytics.referrer,
      source: linkAnalytics.source,
      shortCode: shortLinks.shortCode,
    })
    .from(linkAnalytics)
    .innerJoin(shortLinks, eq(shortLinks.id, linkAnalytics.linkId))
    .where(inArray(linkAnalytics.linkId, linkIds))
    .orderBy(desc(linkAnalytics.clickedAt))
    .limit(limit)
}
