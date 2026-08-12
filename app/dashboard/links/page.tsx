import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/app/page-header"
import { PaginationControls } from "@/components/app/pagination-controls"
import { LinksList } from "@/components/links/links-list"
import { LinksToolbar } from "@/components/links/links-toolbar"
import {
  DEFAULT_PAGE_SIZE,
  getLinksPage,
  getUserTags,
  type LinkSort,
  type LinkStatusFilter,
} from "@/lib/links/queries"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "Links" }

const VALID_STATUS: LinkStatusFilter[] = ["active", "archived", "expired", "all"]
const VALID_SORT: LinkSort[] = ["newest", "oldest", "clicks", "title"]

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function LinksPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const params = await searchParams

  // Every parameter is validated before it reaches a query — an unexpected
  // `sort` value must fall back to a default, not reach the ORDER BY.
  const statusParam = first(params.status) as LinkStatusFilter | undefined
  const sortParam = first(params.sort) as LinkSort | undefined

  const query = {
    userId: session.user.id,
    search: first(params.q),
    status: statusParam && VALID_STATUS.includes(statusParam) ? statusParam : "active",
    sort: sortParam && VALID_SORT.includes(sortParam) ? sortParam : "newest",
    tag: first(params.tag),
    from: first(params.from),
    to: first(params.to),
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: DEFAULT_PAGE_SIZE,
  } as const

  const [result, tags] = await Promise.all([
    getLinksPage(query),
    getUserTags(session.user.id),
  ])

  const isFiltered = Boolean(
    query.search || query.tag || query.from || query.to || query.status !== "active"
  )

  return (
    <div className="page">
      <PageHeader
        title="Links"
        description="Every short link in your account, with live click counts."
        actions={
          <Button asChild>
            <Link href="/dashboard/links/new">
              <Plus className="size-4" aria-hidden="true" />
              Create link
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <Suspense fallback={<Skeleton className="h-9 w-full" />}>
          <LinksToolbar tags={tags} />
        </Suspense>

        <LinksList
          links={result.items}
          appOrigin={appOrigin()}
          isFiltered={isFiltered}
          totalLinks={result.total}
        />

        <Suspense fallback={null}>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            itemLabel="links"
          />
        </Suspense>
      </div>
    </div>
  )
}
