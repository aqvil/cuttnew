import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import {
  getAnalyticsSummary,
  isAnalyticsRange,
  type AnalyticsRange,
} from "@/lib/analytics/queries"

/**
 * Per-link analytics for the dashboard.
 *
 * Session-authenticated (not API-key) because it backs the in-app charts.
 * Aggregation happens in Postgres — see lib/analytics/queries.ts.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const rangeParam = new URL(request.url).searchParams.get("range")
  const range: AnalyticsRange = isAnalyticsRange(rangeParam) ? rangeParam : "30d"

  const link = await db.query.shortLinks.findFirst({
    where: and(eq(shortLinks.id, id), eq(shortLinks.userId, session.user.id)),
    columns: { id: true, clickCount: true },
  })

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const summary = await getAnalyticsSummary([link.id], range)

  return NextResponse.json(
    { ...summary, lifetimeClicks: link.clickCount || 0, range },
    { headers: { "Cache-Control": "private, max-age=30" } }
  )
}
