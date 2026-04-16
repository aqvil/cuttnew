import { createClient } from "@/lib/supabase/server"
import { FileText, ExternalLink, Eye, Pencil, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

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
    <div className="space-y-6">
      {/* Header - handled by DashboardHeader now */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bio Pages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your link-in-bio pages
        </p>
      </div>

      {bioPages && bioPages.length > 0 ? (
        <div className="rounded-lg border border-border bg-card">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
            <div className="col-span-5">Page</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Views</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {bioPages.map((page) => (
              <div 
                key={page.id} 
                className="grid grid-cols-12 items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <Link 
                      href={`/dashboard/bio/${page.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {page.title || "Untitled"}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    page.is_published 
                      ? "bg-foreground/10 text-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {page.is_published ? "Live" : "Draft"}
                  </span>
                </div>
                
                <div className="col-span-2">
                  <span className="text-sm tabular-nums text-muted-foreground">0</span>
                </div>
                
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(page.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bio/${page.id}`}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {page.is_published && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/p/${page.slug}`} target="_blank">
                              <ExternalLink className="mr-2 size-4" />
                              View Live
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/analytics?page=${page.id}`}>
                              <Eye className="mr-2 size-4" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No bio pages yet</h3>
          <p className="mt-1 text-center text-xs text-muted-foreground max-w-sm">
            Create your first bio page to share all your important links in one place.
          </p>
          <Link
            href="/dashboard/bio/new"
            className="mt-4 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            Create Page
          </Link>
        </div>
      )}
    </div>
  )
}
