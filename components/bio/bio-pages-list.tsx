'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FileText, ExternalLink, Eye, MoreHorizontal, Search, Settings, LayoutTemplate, BarChart2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DeleteBioPageItem } from "@/components/bio/delete-bio-page-item"

interface BioPageRow {
  id: string
  title: string | null
  slug: string
  isPublished: boolean | null
  createdAt: Date | string | null
  views: number
  clicks: number
}

export function BioPagesList({ pages, appUrl }: { pages: BioPageRow[]; appUrl: string }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((p) =>
      (p.title || "").toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    )
  }, [pages, search])

  return (
    <div className="space-y-4">
      <div className="dash-control flex items-center justify-between gap-4">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background border-border focus-visible:ring-primary rounded-md text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((page) => (
            <div
              key={page.id}
              className="dash-panel flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-6 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="dash-icon size-12">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/bio/${page.id}`}
                      className="text-lg font-semibold text-foreground hover:text-primary hover:underline truncate"
                    >
                      {page.title || "Untitled Page"}
                    </Link>
                    <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                      page.isPublished
                        ? 'bg-foreground text-background border border-foreground'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <a
                      href={`${appUrl}/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline flex items-center gap-1.5 truncate"
                    >
                      {appUrl.replace(/^https?:\/\//, '')}/p/{page.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1 font-mono">
                    Created {formatDistanceToNow(new Date(page.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-6 pl-18 sm:pl-0 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {page.views.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground cursor-help" title="Total Views">
                      Views
                    </div>
                  </div>
                   <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {page.clicks.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground cursor-help" title="Total Link Clicks on Page">
                      Clicks
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 px-4 bg-card" asChild>
                     <Link href={`/dashboard/bio/${page.id}`}>
                        Edit design
                     </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground border border-transparent hover:border-border">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-md border-border bg-card">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/dashboard/bio/${page.id}`}>
                          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {page.isPublished && (
                        <>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <a href={`${appUrl}/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                              View public page
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/analytics?page=${page.id}`}>
                              <BarChart2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              View analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DeleteBioPageItem pageId={page.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty flex flex-col items-center">
             <div className="dash-icon size-16 mb-6">
                <LayoutTemplate className="h-7 w-7" />
             </div>
             <h3 className="text-xl font-semibold text-foreground mb-2">
               {pages.length > 0 ? "No pages match your search" : "Create a page when one link is not enough"}
             </h3>
             <p className="text-muted-foreground max-w-sm mb-6">
               {pages.length > 0
                 ? "Try a different search term."
                 : "Bio pages are best for profiles, launches, menus, or campaigns with multiple destinations."}
             </p>
             {pages.length === 0 && (
               <Button className="btn-primary px-8" asChild>
                  <Link href="/dashboard/bio/new">Create a bio page</Link>
               </Button>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
