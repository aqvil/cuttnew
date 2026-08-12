import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, bioBlocks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, inArray, count } from "drizzle-orm"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { BioPagesList } from "@/components/bio/bio-pages-list"
import { PageHeader } from "@/components/app/page-header"

export const metadata = {
  title: "Bio pages",
}

export default async function BioPagesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  const data = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    orderBy: [desc(bioPages.createdAt)],
  })

  const pageIds = data.map((p) => p.id)

  const viewsByPage = pageIds.length > 0
    ? await db.select({ pageId: pageViews.pageId, value: count() }).from(pageViews).where(inArray(pageViews.pageId, pageIds)).groupBy(pageViews.pageId)
    : []
  const viewsMap = new Map(viewsByPage.map((v) => [v.pageId, v.value]))

  const blocksForPages = pageIds.length > 0
    ? await db.select({ id: bioBlocks.id, pageId: bioBlocks.pageId }).from(bioBlocks).where(inArray(bioBlocks.pageId, pageIds))
    : []
  const blockToPage = new Map(blocksForPages.map((b) => [b.id, b.pageId]))
  const blockIds = blocksForPages.map((b) => b.id)

  const clicksByBlock = blockIds.length > 0
    ? await db.select({ bioBlockId: linkAnalytics.bioBlockId, value: count() }).from(linkAnalytics).where(inArray(linkAnalytics.bioBlockId, blockIds)).groupBy(linkAnalytics.bioBlockId)
    : []
  const clicksByPage = new Map<string, number>()
  for (const c of clicksByBlock) {
    const pageId = c.bioBlockId ? blockToPage.get(c.bioBlockId) : null
    if (pageId) clicksByPage.set(pageId, (clicksByPage.get(pageId) || 0) + c.value)
  }

  const pagesWithStats = data.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    isPublished: page.isPublished,
    createdAt: page.createdAt,
    views: viewsMap.get(page.id) || 0,
    clicks: clicksByPage.get(page.id) || 0,
  }))

  return (
    <div className="page">
      <PageHeader
        title="Bio pages"
        description="One short link that opens a page of many destinations — for profiles, launches, menus and multi-link campaigns."
        actions={
          <Button asChild>
            <Link href="/dashboard/bio/new">
              <Plus className="size-4" aria-hidden="true" />
              Create page
            </Link>
          </Button>
        }
      />

      <BioPagesList
        pages={pagesWithStats}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
      />
    </div>
  )
}
