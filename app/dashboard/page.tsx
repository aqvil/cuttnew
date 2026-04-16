import { createClient } from "@/lib/supabase/server"
import { FileText, LinkIcon, Eye, MousePointer, ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch stats
  const [bioPages, shortLinks, pageViews, linkClicks] = await Promise.all([
    supabase.from("bio_pages").select("id", { count: "exact" }).eq("user_id", user?.id),
    supabase.from("short_links").select("id", { count: "exact" }).eq("user_id", user?.id),
    supabase.from("page_views").select("id", { count: "exact" }),
    supabase.from("link_analytics").select("id", { count: "exact" }),
  ])

  const stats = [
    {
      title: "Bio Pages",
      value: bioPages.count || 0,
      change: "+0%",
      icon: FileText,
    },
    {
      title: "Short Links",
      value: shortLinks.count || 0,
      change: "+0%",
      icon: LinkIcon,
    },
    {
      title: "Page Views",
      value: pageViews.count || 0,
      change: "+0%",
      icon: Eye,
    },
    {
      title: "Link Clicks",
      value: linkClicks.count || 0,
      change: "+0%",
      icon: MousePointer,
    },
  ]

  // Fetch recent bio pages
  const { data: recentBioPages } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent short links
  const { data: recentLinks } = await supabase
    .from("short_links")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your links and pages.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="size-4 text-muted-foreground" />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="size-3" />
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {stat.value.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bio Pages */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Bio Pages</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Your recent bio pages</p>
            </div>
            <Link 
              href="/dashboard/bio" 
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBioPages && recentBioPages.length > 0 ? (
              recentBioPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/bio/${page.id}`}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{page.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    page.is_published 
                      ? "bg-foreground/10 text-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {page.is_published ? "Live" : "Draft"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">No bio pages yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Create your first bio page to get started</p>
                <Link
                  href="/dashboard/bio/new"
                  className="mt-4 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
                >
                  Create Page
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Links */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Short Links</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Your recent shortened links</p>
            </div>
            <Link 
              href="/dashboard/links" 
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentLinks && recentLinks.length > 0 ? (
              recentLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/dashboard/links/${link.id}`}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <LinkIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{link.title || link.short_code}</p>
                      <p className="truncate text-xs text-muted-foreground max-w-[180px]">
                        {link.original_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MousePointer className="size-3" />
                    <span className="tabular-nums">{link.click_count}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <LinkIcon className="size-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">No links yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Shorten your first link to start tracking</p>
                <Link
                  href="/dashboard/links/new"
                  className="mt-4 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
                >
                  Create Link
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/bio/new"
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Create Bio Page</p>
            <p className="text-xs text-muted-foreground">Build your link-in-bio</p>
          </div>
        </Link>
        <Link
          href="/dashboard/links/new"
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
            <LinkIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Shorten Link</p>
            <p className="text-xs text-muted-foreground">Create a trackable URL</p>
          </div>
        </Link>
        <Link
          href="/dashboard/ai"
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
            <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Generate content with AI</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
