import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, count, inArray } from "drizzle-orm"
import { FileText, LinkIcon, Eye, MousePointer, Copy, Activity, ArrowUpRight, BarChart3 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuickLinkForm } from "@/components/dashboard/quick-link-form"
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
    { title: "Bio Pages", value: bioPagesCount[0]?.value || 0, icon: FileText, suffix: "pages" },
  ]

  const workflows = [
    {
      title: "Shorten a link",
      description: "Create a clean short URL, customize the back-half, and share it anywhere.",
      href: "/dashboard/links/new",
      icon: LinkIcon,
      action: "Create link",
    },
    {
      title: "Make a bio page",
      description: "Collect multiple destinations behind one public profile link.",
      href: "/dashboard/bio/new",
      icon: FileText,
      action: "Create page",
    },
    {
      title: "Read performance",
      description: "See clicks, top links, countries, and devices once traffic starts coming in.",
      href: "/dashboard/analytics",
      icon: BarChart3,
      action: "View analytics",
    },
  ]

  const recentLinksData = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.createdAt)],
    limit: 5,
  })

  return (
    <div className="dash-page">
      <div className="dash-hero flex flex-col items-center gap-6">
        <div>
          <div className="dash-kicker mb-4">
            <Activity className="size-3.5" />
            Workspace
          </div>
          <h1 className="dash-title">
            Welcome back, {session.user.name || "User"}.
          </h1>
          <p className="dash-subtitle">
            Start by shortening a URL. Add bio pages and analytics only when you need them.
          </p>
          <QuickLinkForm />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {workflows.map((workflow, index) => (
          <Link key={workflow.title} href={workflow.href} className="dash-panel group p-5 transition-colors hover:bg-muted/35">
            <div className="mb-6 flex items-center justify-between">
              <div className="dash-icon">
                <workflow.icon className="size-5" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">{workflow.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              {workflow.action}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="dash-panel p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-5">
              <span className="text-sm font-semibold">{stat.title}</span>
              <div className="dash-icon size-9">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-foreground tabular-nums tracking-tight">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-panel w-full overflow-hidden">
        <div className="dash-panel-header">
          <div>
            <h2 className="dash-panel-title">Recent Links</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your latest short links appear here after creation.</p>
          </div>
          <Button variant="link" className="text-sm font-semibold text-primary" asChild>
            <Link href="/dashboard/links">View all links</Link>
          </Button>
        </div>
        
        <div className="divide-y divide-border">
          {recentLinksData.length > 0 ? (
            recentLinksData.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-5 hover:bg-muted/35 transition-colors">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="dash-icon">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link 
                        href={`/dashboard/links/${link.id}`}
                        className="text-base font-bold text-foreground hover:text-primary hover:underline truncate"
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
                      <span className="text-border">|</span>
                      <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground truncate max-w-[300px]">
                        {link.originalUrl}
                      </a>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium font-mono">
                      {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 pl-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xl font-bold text-foreground tabular-nums">
                      {(link.clickCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                      Engagements
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted" asChild>
                      <Link href={`/dashboard/analytics?link=${link.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="dash-empty">
               <div className="dash-icon mx-auto mb-5 size-14">
                <LinkIcon className="h-6 w-6" />
               </div>
               <p className="text-lg font-semibold text-foreground mb-2">No links created yet</p>
               <p className="text-sm text-muted-foreground mb-6">Paste a URL above or create a link manually to start tracking clicks.</p>
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
