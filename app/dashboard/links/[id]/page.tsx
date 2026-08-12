import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { LinkDetail } from "@/components/links/link-detail"
import { getOwnedLink } from "@/lib/links/queries"
import { getQrCodesForLink } from "@/lib/qr/queries"
import { getAnalyticsSummary, isAnalyticsRange, type AnalyticsRange } from "@/lib/analytics/queries"
import { appOrigin } from "@/lib/app-url"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return { title: "Link" }

  const { id } = await params
  const link = await getOwnedLink(session.user.id, id)
  return { title: link?.title || link?.shortCode || "Link" }
}

export default async function LinkDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { id } = await params
  const link = await getOwnedLink(session.user.id, id)

  // getOwnedLink scopes by userId, so a link belonging to someone else is
  // indistinguishable from one that doesn't exist.
  if (!link) notFound()

  const query = await searchParams
  const rangeParam = Array.isArray(query.range) ? query.range[0] : query.range
  const range: AnalyticsRange = isAnalyticsRange(rangeParam) ? rangeParam : "30d"

  const [summary, qrCodes] = await Promise.all([
    getAnalyticsSummary([link.id], range),
    getQrCodesForLink(session.user.id, link.id),
  ])

  return (
    <LinkDetail
      link={link}
      summary={summary}
      range={range}
      appOrigin={appOrigin()}
      qrCodes={qrCodes}
    />
  )
}
