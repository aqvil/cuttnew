import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BarChart3, Link2, QrCode } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader, SectionHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { Stat, StatRow, percentChange } from "@/components/app/stat"
import { QuickCreate } from "@/components/dashboard/quick-create"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import { getLinkCounters, getLinksPage } from "@/lib/links/queries"
import { countQrCodes } from "@/lib/qr/queries"
import {
  getAnalyticsSummary,
  getOwnedLinkIds,
  getRecentClicks,
} from "@/lib/analytics/queries"
import { appOrigin } from "@/lib/app-url"
import { countryFlag, formatRelative, fullNumber, truncateMiddle } from "@/lib/format"

export const metadata = { title: "Overview" }

/**
 * The dashboard.
 *
 * Answers, in order: what happened recently, what do I have, what do I do next.
 * Everything on this page is derived from the user's real data — the previous
 * version showed a hardcoded "100% complete" checklist and three integration
 * cards for integrations that don't exist.
 */
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const userId = session.user.id
  const linkIds = await getOwnedLinkIds(userId)

  const [counters, summary, recentLinks, recentClicks, qrCount] = await Promise.all([
    getLinkCounters(userId),
    getAnalyticsSummary(linkIds, "30d"),
    getLinksPage({ userId, pageSize: 5, sort: "newest" }),
    getRecentClicks(linkIds, 6),
    countQrCodes(userId),
  ])

  const origin = appOrigin()
  const trend = percentChange(summary.totalClicks, summary.previousClicks)
  const firstName = (session.user.name || "").split(" ")[0]

  return (
    <div className="page space-y-8">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Overview"}
        description="Your links at a glance, and everything you need to make another."
      />

      <QuickCreate appOrigin={origin} />

      {counters.totalLinks === 0 ? (
        <EmptyState
          icon={Link2}
          title="Nothing to measure yet"
          description="Create your first short link above. Once someone clicks it, this page fills in with real click data — where they came from, what they used, and when."
          action={
            <Button asChild>
              <Link href="/dashboard/links/new">Create a link with options</Link>
            </Button>
          }
        />
      ) : (
        <>
          <StatRow>
            <Stat
              label="Clicks (30 days)"
              value={fullNumber(summary.totalClicks)}
              trend={
                trend === null ? null : { changePercent: trend, label: "vs. previous 30 days" }
              }
            />
            <Stat
              label="Unique visitors"
              value={fullNumber(summary.uniqueVisitors)}
              hint="Last 30 days"
            />
            <Stat
              label="Active links"
              value={fullNumber(counters.activeLinks)}
              hint={
                counters.archivedLinks > 0
                  ? `${fullNumber(counters.archivedLinks)} archived`
                  : "All time"
              }
            />
            <Stat
              label="QR codes"
              value={fullNumber(qrCount)}
              hint={`${fullNumber(summary.qrScans)} scans in 30 days`}
            />
          </StatRow>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="h3">Clicks over time</h2>
                <p className="text-xs text-muted-foreground">Last 30 days, all links</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/analytics">
                  <BarChart3 className="size-4" aria-hidden="true" />
                  Full analytics
                </Link>
              </Button>
            </div>

            {summary.timeline.some((point) => point.clicks > 0) ? (
              <ClicksChart data={summary.timeline} range="30d" height={220} />
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium">No clicks yet</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Share one of your links — clicks show up here within seconds.
                </p>
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <SectionHeader
                title="Recent links"
                actions={
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/links">
                      View all
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                }
              />

              <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                {recentLinks.items.map((link) => (
                  <li key={link.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Link
                        href={`/dashboard/links/${link.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {link.title || `${origin.replace(/^https?:\/\//, "")}/l/${link.shortCode}`}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {truncateMiddle(link.originalUrl, 56)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular">
                      {fullNumber(link.clickCount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeader title="Latest activity" />

              {recentClicks.length === 0 ? (
                <div className="flex h-[calc(100%-3rem)] min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No clicks recorded yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                  {recentClicks.map((click, index) => (
                    <li
                      key={`${click.shortCode}-${index}`}
                      className="flex items-center gap-3 p-4 text-sm"
                    >
                      <span aria-hidden="true" className="shrink-0 text-base">
                        {click.country ? countryFlag(click.country) : "🌐"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          /l/{click.shortCode}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {[click.browser, click.device].filter(Boolean).join(" · ") ||
                            "Unknown client"}
                        </p>
                      </div>
                      {click.source === "qr" ? (
                        <Badge variant="secondary" className="h-5 shrink-0 gap-1 font-normal">
                          <QrCode className="size-3" aria-hidden="true" />
                          Scan
                        </Badge>
                      ) : null}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(click.clickedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
