import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, count, inArray } from "drizzle-orm"
import { FileText, LinkIcon, Eye, MousePointer, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Fetch stats
  const [bioPagesCount, shortLinksCount] = await Promise.all([
    db.select({ value: count() }).from(bioPages).where(eq(bioPages.userId, userId)),
    db.select({ value: count() }).from(shortLinks).where(eq(shortLinks.userId, userId)),
  ])

  // Get user's page/link IDs for aggregate counting
  const userBioPages = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    columns: { id: true }
  })
  const userShortLinks = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    columns: { id: true }
  })

  const bioPageIds = userBioPages.map(p => p.id)
  const shortLinkIds = userShortLinks.map(l => l.id)

  let pageViewsCount = 0
  if (bioPageIds.length > 0) {
    const [result] = await db.select({ value: count() }).from(pageViews).where(inArray(pageViews.pageId, bioPageIds))
    pageViewsCount = result?.value || 0
  }

  let linkClicksCount = 0
  if (shortLinkIds.length > 0) {
    const [result] = await db.select({ value: count() }).from(linkAnalytics).where(inArray(linkAnalytics.linkId, shortLinkIds))
    linkClicksCount = result?.value || 0
  }

  const stats = [
    { title: "Total Clicks", value: linkClicksCount, icon: MousePointer, suffix: "clicks" },
    { title: "Total Views", value: pageViewsCount, icon: Eye, suffix: "views" },
    { title: "Active Links", value: shortLinksCount[0]?.value || 0, icon: LinkIcon, suffix: "links" },
    { title: "Link-in-bio Pages", value: bioPagesCount[0]?.value || 0, icon: FileText, suffix: "pages" },
  ]

  const recentLinksData = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.createdAt)],
    limit: 5,
  })

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {session.user.name || "User"}. Here's an overview of your connections.
          </p>
        </div>
        <Button className="btn-primary" asChild>
          <Link href="/dashboard/links/new">Create new link</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-semibold">{stat.title}</span>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tabular-nums">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-500">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Links Chart / List Area */}
      <div className="card w-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Recent Links</h2>
          <Button variant="link" className="text-sm font-semibold text-primary" asChild>
            <Link href="/dashboard/links">View all links</Link>
          </Button>
        </div>
        
        <div className="divide-y divide-border">
          {recentLinksData.length > 0 ? (
            recentLinksData.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/dashboard/links/${link.id}`}
                        className="text-base font-bold text-slate-900 hover:text-primary hover:underline truncate"
                      >
                        {link.title || 'Untitled Link'}
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <a 
                        href={`${process.env.NEXT_PUBLIC_APP_URL}/l/${link.shortCode}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline truncate max-w-[200px]"
                      >
                         {process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '')}/l/{link.shortCode}
                      </a>
                      <span className="text-slate-300">|</span>
                      <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 truncate max-w-[300px]">
                        {link.originalUrl}
                      </a>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 pl-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xl font-bold text-slate-900 tabular-nums">
                      {link.clickCount.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Engagements
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-blue-50">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-blue-50" asChild>
                      <Link href={`/dashboard/analytics?link=${link.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
               <LinkIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <p className="text-lg font-medium text-slate-900 mb-2">No links created yet</p>
               <p className="text-sm mb-6">Create your first shortened link to start tracking engagements.</p>
               <Button className="btn-primary" asChild>
                  <Link href="/dashboard/links/new">Create a link</Link>
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
