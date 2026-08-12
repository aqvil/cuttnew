'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  ExternalLink,
  LayoutTemplate,
  MoreHorizontal,
  Search,
  Settings,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/app/empty-state"
import { DeleteBioPageItem } from "@/components/bio/delete-bio-page-item"
import { formatDate, fullNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

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
    const term = search.trim().toLowerCase()
    if (!term) return pages
    return pages.filter(
      (page) =>
        (page.title || "").toLowerCase().includes(term) ||
        page.slug.toLowerCase().includes(term)
    )
  }, [pages, search])

  if (pages.length === 0) {
    return (
      <EmptyState
        icon={LayoutTemplate}
        title="No bio pages yet"
        description="A bio page is one link that opens a page of many — useful for a profile, a launch, a menu or a campaign with several destinations."
        action={
          <Button asChild>
            <Link href="/dashboard/bio/new">Create your first page</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pages"
          aria-label="Search bio pages"
          className="h-9 pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="filtered"
          icon={Search}
          title="No pages match your search"
          description="Try a different title or slug."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {filtered.map((page) => {
            const publicUrl = `${appUrl}/p/${page.slug}`
            return (
              <li key={page.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/bio/${page.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {page.title || "Untitled page"}
                    </Link>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 text-[11px]",
                        page.isPublished
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 truncate font-mono text-xs text-brand hover:underline"
                  >
                    {publicUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  </a>

                  <p className="text-xs text-muted-foreground">
                    Created {formatDate(page.createdAt)}
                  </p>
                </div>

                <dl className="flex shrink-0 items-center gap-6 text-sm">
                  <div className="text-right">
                    <dd className="font-medium tabular">{fullNumber(page.views)}</dd>
                    <dt className="text-xs text-muted-foreground">Views</dt>
                  </div>
                  <div className="text-right">
                    <dd className="font-medium tabular">{fullNumber(page.clicks)}</dd>
                    <dt className="text-xs text-muted-foreground">Clicks</dt>
                  </div>
                </dl>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/bio/${page.id}`}>Edit</Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`More actions for ${page.title || page.slug}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/bio/${page.id}`}>
                          <Settings className="size-4" aria-hidden="true" />
                          Page settings
                        </Link>
                      </DropdownMenuItem>
                      {page.isPublished ? (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-4" aria-hidden="true" />
                              View public page
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/analytics">
                              <BarChart3 className="size-4" aria-hidden="true" />
                              View analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DeleteBioPageItem pageId={page.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
