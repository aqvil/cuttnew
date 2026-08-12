import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BarChart3 } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader, SectionHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { Stat, StatRow, percentChange } from "@/components/app/stat"
import { RangeSelector } from "@/components/analytics/range-selector"
import { AnalyticsBreakdowns, ClicksOverTime } from "@/components/analytics/analytics-panels"
import {
  getAnalyticsSummary,
  getOwnedLinkIds,
  getTopLinks,
  isAnalyticsRange,
  RANGE_LABELS,
  type AnalyticsRange,
} from "@/lib/analytics/queries"
import { appOrigin } from "@/lib/app-url"
import { fullNumber, truncateMiddle } from "@/lib/format"

export const metadata = { title: "Analytics" }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Account-wide analytics.
 *
 * Every number here is computed from recorded clicks. The previous page
 * carried three "Last week's insights" cards with invented narrative text, a
 * fake dashboards section and a static date range — none of it derived from
 * data.
 */
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const params = await searchParams
  const rangeParam = Array.isArray(params.range) ? params.range[0] : params.range
  const range: AnalyticsRange = isAnalyticsRange(rangeParam) ? rangeParam : "30d"

  const linkIds = await getOwnedLinkIds(session.user.id)
  const [summary, topLinks] = await Promise.all([
    getAnalyticsSummary(linkIds, range),
    getTopLinks(session.user.id, range),
  ])

  const origin = appOrigin()
  const trend = percentChange(summary.totalClicks, summary.previousClicks)

  if (linkIds.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Analytics" />
        <EmptyState
          icon={BarChart3}
          title="No links to analyse yet"
          description="Analytics start the moment your first link gets a click — clicks over time, referrers, countries, devices and browsers."
          action={
            <Button asChild>
              <Link href="/dashboard/links/new">Create your first link</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page space-y-6">
      <PageHeader
        title="Analytics"
        description="Click performance across every link in your account."
        actions={
          <Suspense fallback={<Skeleton className="h-8 w-56" />}>
            <RangeSelector value={range} />
          </Suspense>
        }
      />

      <p className="text-sm text-muted-foreground">{RANGE_LABELS[range]}</p>

      <StatRow>
        <Stat
          label="Total clicks"
          value={fullNumber(summary.totalClicks)}
          trend={trend === null ? null : { changePercent: trend, label: "vs. previous period" }}
        />
        <Stat
          label="Unique visitors"
          value={fullNumber(summary.uniqueVisitors)}
          hint="Distinct hashed IPs"
        />
        <Stat
          label="QR scans"
          value={fullNumber(summary.qrScans)}
          hint="Included in total clicks"
        />
        <Stat
          label="Links tracked"
          value={fullNumber(linkIds.length)}
          hint="All links in your account"
        />
      </StatRow>

      <ClicksOverTime summary={summary} range={range} />

      <section>
        <SectionHeader
          title="Top links"
          description={`Ranked by clicks in the selected period, not lifetime totals.`}
        />

        {topLinks.every((link) => link.clicks === 0) ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No clicks recorded in this period.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-border rounded-lg border border-border bg-card">
            {topLinks
              .filter((link) => link.clicks > 0)
              .map((link, index) => (
                <li key={link.id} className="flex items-center gap-4 p-4">
                  <span
                    aria-hidden="true"
                    className="w-5 shrink-0 text-sm text-muted-foreground tabular"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {link.title || `${origin.replace(/^https?:\/\//, "")}/l/${link.shortCode}`}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {truncateMiddle(link.originalUrl, 70)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular">
                    {fullNumber(link.clicks)}
                  </span>
                </li>
              ))}
          </ol>
        )}
      </section>

      <AnalyticsBreakdowns summary={summary} />
    </div>
  )
}
