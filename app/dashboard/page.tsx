import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, LinkIcon, BarChart3, Eye, MousePointer, Plus } from "lucide-react"
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
      description: "Active bio pages",
      icon: FileText,
      href: "/dashboard/bio",
    },
    {
      title: "Short Links",
      value: shortLinks.count || 0,
      description: "Total links created",
      icon: LinkIcon,
      href: "/dashboard/links",
    },
    {
      title: "Page Views",
      value: pageViews.count || 0,
      description: "Total bio page views",
      icon: Eye,
      href: "/dashboard/analytics",
    },
    {
      title: "Link Clicks",
      value: linkClicks.count || 0,
      description: "Total link clicks",
      icon: MousePointer,
      href: "/dashboard/analytics",
    },
  ]

  // Fetch recent bio pages
  const { data: recentBioPages } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // Fetch recent short links
  const { data: recentLinks } = await supabase
    .from("short_links")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your LinkForge account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Bio Pages
              <Button size="sm" asChild>
                <Link href="/dashboard/bio/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Page
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>Your latest bio pages</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBioPages && recentBioPages.length > 0 ? (
              <div className="space-y-3">
                {recentBioPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/dashboard/bio/${page.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{page.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">/{page.slug}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${page.is_published ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">No bio pages yet</p>
                <Button asChild>
                  <Link href="/dashboard/bio/new">Create your first bio page</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Short Links
              <Button size="sm" asChild>
                <Link href="/dashboard/links/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Link
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>Your latest shortened links</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLinks && recentLinks.length > 0 ? (
              <div className="space-y-3">
                {recentLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/dashboard/links/${link.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{link.title || link.short_code}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.original_url}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {link.click_count} clicks
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <LinkIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">No short links yet</p>
                <Button asChild>
                  <Link href="/dashboard/links/new">Create your first link</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Analytics Overview
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                Analytics will appear here once you start getting traffic
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
