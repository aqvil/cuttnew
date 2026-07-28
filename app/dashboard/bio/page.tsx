import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, bioBlocks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, inArray, count } from "drizzle-orm"
import { LayoutTemplate, ArrowUpRight, Link2, Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { BioPagesList } from "@/components/bio/bio-pages-list"

export const metadata = {
  title: "Bio Pages - Cuttly",
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
    <div className="dash-page">
      <div className="dash-hero flex flex-col items-center gap-6">
        <div>
          <div className="dash-kicker mb-4">
            <LayoutTemplate className="size-3.5" />
            Profile pages
          </div>
          <h1 className="dash-title">Bio Pages</h1>
          <p className="dash-subtitle">Use this when one short link needs to open a page of many links. Short links are still the fastest place to start.</p>
        </div>
        <Button className="btn-primary h-11 px-5" asChild>
          <Link href="/dashboard/bio/new">
            Create page
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Profile", text: "Name the page and choose its public slug.", icon: LayoutTemplate },
          { title: "Blocks", text: "Add links, text, dividers, social buttons, or email capture.", icon: Link2 },
          { title: "Design", text: "Tune colors and publish when the page is ready.", icon: Palette },
        ].map((step, index) => (
          <div key={step.title} className="dash-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="dash-icon size-9">
                <step.icon className="size-4" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="font-semibold text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      <BioPagesList pages={pagesWithStats} appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
    </div>
  )
}
