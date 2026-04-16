import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkIcon, Plus, ExternalLink, Copy, BarChart3, Pencil } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export const metadata = {
  title: "Short Links",
}

export default async function ShortLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: links } = await supabase
    .from("short_links")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linkforge.app"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Short Links</h1>
          <p className="text-muted-foreground">
            Create and manage your shortened URLs
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {links && links.length > 0 ? (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">
                          {link.title || link.short_code}
                        </h3>
                        {link.is_password_protected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">
                            Protected
                          </span>
                        )}
                        {link.expires_at && new Date(link.expires_at) < new Date() && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-muted-foreground font-mono">
                          {baseUrl}/l/{link.short_code}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {link.click_count} clicks
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {link.original_url}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatDistanceToNow(new Date(link.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/links/${link.id}`}>
                        <Pencil className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/analytics?link=${link.id}`}>
                        <BarChart3 className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/l/${link.short_code}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LinkIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No short links yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create your first shortened URL with custom slug, password protection, and analytics.
            </p>
            <Button asChild>
              <Link href="/dashboard/links/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first link
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
