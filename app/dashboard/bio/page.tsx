import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, ExternalLink, Eye, Pencil } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Bio Pages",
}

export default async function BioPagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bioPages } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bio Pages</h1>
          <p className="text-muted-foreground">
            Create and manage your link-in-bio pages
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bio/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Link>
        </Button>
      </div>

      {bioPages && bioPages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bioPages.map((page) => (
            <Card key={page.id} className="group relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{page.title || "Untitled"}</CardTitle>
                      <CardDescription className="text-xs">/{page.slug}</CardDescription>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${page.is_published ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    {page.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {page.description || "No description"}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/dashboard/bio/${page.id}`}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  {page.is_published && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/p/${page.slug}`} target="_blank">
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/analytics?page=${page.id}`}>
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No bio pages yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create your first bio page to share all your important links in one place.
            </p>
            <Button asChild>
              <Link href="/dashboard/bio/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first bio page
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
