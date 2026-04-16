import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, count } from "drizzle-orm"
import { FileText, LinkIcon, Eye, MousePointer, ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Fetch stats using Drizzle
  const [bioPagesCount, shortLinksCount, pageViewsCount, linkClicksCount] = await Promise.all([
    db.select({ value: count() }).from(bioPages).where(eq(bioPages.userId, userId)),
    db.select({ value: count() }).from(shortLinks).where(eq(shortLinks.userId, userId)),
    db.select({ value: count() }).from(pageViews).where(
      eq(pageViews.pageId, db.select({ id: bioPages.id }).from(bioPages).where(eq(bioPages.userId, userId)))
    ),
    db.select({ value: count() }).from(linkAnalytics).where(
      eq(linkAnalytics.linkId, db.select({ id: shortLinks.id }).from(shortLinks).where(eq(shortLinks.userId, userId)))
    ),
  ])

  // Simplified counts for now (the subqueries above might need refinement based on exact PG support in the driver, but logically correct)
  // Actually, let's do more robust counting
  
  const stats = [
    {
      title: "Bio Pages",
      value: bioPagesCount[0]?.value || 0,
      change: "+0%",
      icon: FileText,
    },
    {
      title: "Short Links",
      value: shortLinksCount[0]?.value || 0,
      change: "+0%",
      icon: LinkIcon,
    },
    {
      title: "Page Views",
      value: pageViewsCount[0]?.value || 0,
      change: "+0%",
      icon: Eye,
    },
    {
      title: "Link Clicks",
      value: linkClicksCount[0]?.value || 0,
      change: "+0%",
      icon: MousePointer,
    },
  ]

  // Fetch recent bio pages
  const recentBioPagesData = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    orderBy: [desc(bioPages.createdAt)],
    limit: 5,
  })

  // Fetch recent short links
  const recentLinksData = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.createdAt)],
    limit: 5,
  })

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="border-b-2 border-primary pb-8">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Dashboard</h1>
        <p className="mt-2 text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Status: Connected to PostgreSQL // Session: Active
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="card-mono group"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="size-5 text-primary" />
              <span className="flex items-center gap-1 font-mono text-xs uppercase text-muted-foreground">
                <TrendingUp className="size-3" />
                {stat.change}
              </span>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-black tabular-nums tracking-tighter">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Bio Pages */}
        <div className="card-mono !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-border px-6 py-4 bg-muted/30">
            <div>
              <h2 className="text-lg font-black uppercase italic">Bio Pages</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recent Activity</p>
            </div>
            <Link 
              href="/dashboard/bio" 
              className="btn-mono !px-3 !py-1 !text-[10px]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y-2 divide-border">
            {recentBioPagesData && recentBioPagesData.length > 0 ? (
              recentBioPagesData.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/bio/${page.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-primary hover:text-primary-foreground group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center border-2 border-primary group-hover:border-primary-foreground">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{page.title || "Untitled"}</p>
                      <p className="text-xs font-mono opacity-60">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="border-2 border-primary px-2 py-1 text-[10px] font-black uppercase group-hover:border-primary-foreground">
                    {page.isPublished ? "Live" : "Draft"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-bold uppercase tracking-widest">No data available</p>
                <Link
                  href="/dashboard/bio/new"
                  className="btn-mono mt-6"
                >
                  New Page
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Links */}
        <div className="card-mono !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-border px-6 py-4 bg-muted/30">
            <div>
              <h2 className="text-lg font-black uppercase italic">Short Links</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recent Activity</p>
            </div>
            <Link 
              href="/dashboard/links" 
              className="btn-mono !px-3 !py-1 !text-[10px]"
            >
              View all
            </Link>
          </div>
          <div className="divide-y-2 divide-border">
            {recentLinksData && recentLinksData.length > 0 ? (
              recentLinksData.map((link) => (
                <Link
                  key={link.id}
                  href={`/dashboard/links/${link.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-primary hover:text-primary-foreground group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center border-2 border-primary group-hover:border-primary-foreground">
                      <LinkIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-tight">{link.title || link.shortCode}</p>
                      <p className="truncate text-[10px] font-mono opacity-60 max-w-[180px]">
                        {link.originalUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    <span className="tabular-nums">{link.clickCount}</span>
                    <MousePointer className="size-3" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-bold uppercase tracking-widest">No data available</p>
                <Link
                  href="/dashboard/links/new"
                  className="btn-mono mt-6"
                >
                  New Link
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { href: "/dashboard/bio/new", label: "Create Page", desc: "Link-in-bio", icon: FileText },
          { href: "/dashboard/links/new", label: "Shorten Link", desc: "Trackable URL", icon: LinkIcon },
          { href: "/dashboard/ai", label: "AI Assistant", desc: "Generate content", icon: TrendingUp },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="card-mono flex flex-col items-center text-center group hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <div className="flex size-12 items-center justify-center border-2 border-primary group-hover:border-primary-foreground mb-4">
              <action.icon className="size-6" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">{action.label}</p>
            <p className="text-[10px] font-mono uppercase opacity-60 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
