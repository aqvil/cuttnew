'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  LinkIcon,
  ExternalLink,
  BarChart2,
  MoreHorizontal,
  Lock,
  Search,
  Copy,
  ArrowUpRight,
  PencilLine,
  Archive,
  ArchiveRestore,
  Trash2,
  Download,
  Tag as TagIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { bulkDeleteShortLinks, bulkSetArchived } from "@/app/actions/links"

interface LinkRow {
  id: string
  title: string | null
  shortCode: string
  originalUrl: string
  password: string | null
  tags: string[] | null
  archivedAt: Date | string | null
  clickCount: number | null
  createdAt: Date | string | null
}

interface LinksListProps {
  links: LinkRow[]
  appUrl: string
}

function toCsv(rows: LinkRow[], appUrl: string): string {
  const header = ["Title", "Short URL", "Destination URL", "Tags", "Clicks", "Created", "Archived"]
  const lines = rows.map((l) => [
    l.title || "",
    `${appUrl}/l/${l.shortCode}`,
    l.originalUrl,
    (l.tags || []).join("; "),
    String(l.clickCount || 0),
    l.createdAt ? new Date(l.createdAt).toISOString() : "",
    l.archivedAt ? "yes" : "no",
  ])
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [header, ...lines].map((row) => row.map(escape).join(",")).join("\n")
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function LinksList({ links, appUrl }: LinksListProps) {
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [showArchived, setShowArchived] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isBusy, setIsBusy] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const link of links) {
      for (const tag of link.tags || []) set.add(tag)
    }
    return Array.from(set).sort()
  }, [links])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return links.filter((link) => {
      if (Boolean(link.archivedAt) !== showArchived) return false
      if (tagFilter !== "all" && !(link.tags || []).includes(tagFilter)) return false
      if (!q) return true
      return (
        (link.title || "").toLowerCase().includes(q) ||
        link.shortCode.toLowerCase().includes(q) ||
        link.originalUrl.toLowerCase().includes(q)
      )
    })
  }, [links, search, tagFilter, showArchived])

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((l) => l.id))
    )
  }

  const handleCopy = async (shortCode: string) => {
    await navigator.clipboard.writeText(`${appUrl}/l/${shortCode}`)
    toast.success("Link copied to clipboard")
  }

  const handleBulkArchive = async (archived: boolean) => {
    setIsBusy(true)
    try {
      await bulkSetArchived(Array.from(selected), archived)
      toast.success(archived ? "Links archived" : "Links restored")
      setSelected(new Set())
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsBusy(false)
    }
  }

  const handleBulkDelete = async () => {
    setIsBusy(true)
    try {
      await bulkDeleteShortLinks(Array.from(selected))
      toast.success("Links deleted")
      setSelected(new Set())
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsBusy(false)
    }
  }

  const handleExport = () => {
    const rows = selected.size > 0 ? filtered.filter((l) => selected.has(l.id)) : filtered
    if (rows.length === 0) {
      toast.error("No links to export")
      return
    }
    downloadCsv(toCsv(rows, appUrl), `cuttly-links-${Date.now()}.csv`)
  }

  return (
    <div className="space-y-4">
      <div className="dash-control flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background border-border focus-visible:ring-primary rounded-md text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground"
          >
            <option value="all">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <div className="flex items-center rounded-md border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => { setShowArchived(false); setSelected(new Set()) }}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors ${!showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => { setShowArchived(true); setSelected(new Set()) }}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors ${showArchived ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Archived
            </button>
          </div>

          <Button variant="secondary" className="h-10 bg-card" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3 shadow-[var(--shadow-card)]">
          <span className="text-sm font-semibold text-foreground">{selected.size} selected</span>
          <div className="flex-1" />
          {showArchived ? (
            <Button variant="secondary" size="sm" className="bg-background" disabled={isBusy} onClick={() => handleBulkArchive(false)}>
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Restore
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="bg-background" disabled={isBusy} onClick={() => handleBulkArchive(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isBusy}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selected.size} link{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone and will break any shared URLs.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <Checkbox
            checked={selected.size === filtered.length}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select all ({filtered.length})
          </span>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((link) => (
            <div
              key={link.id}
              className="dash-panel flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-6 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Checkbox
                  className="mt-1"
                  checked={selected.has(link.id)}
                  onCheckedChange={() => toggleSelected(link.id)}
                />
                <div className="dash-icon">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="text-lg font-bold text-foreground hover:text-primary hover:underline truncate"
                    >
                      {link.title || 'Untitled Link'}
                    </Link>
                    {link.password && (
                      <span title="Password Protected">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <a
                      href={`${appUrl}/l/${link.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      {appUrl.replace(/^https?:\/\//, '')}/l/{link.shortCode}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-border hidden sm:inline">|</span>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground truncate max-w-xs sm:max-w-md">
                      {link.originalUrl}
                    </a>
                  </div>
                  {(link.tags && link.tags.length > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {link.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <TagIcon className="size-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground font-medium pt-1 font-mono">
                    {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-8 pl-14 sm:pl-0 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      {(link.clickCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground cursor-help" title="Total Engagements">
                      Engagements
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 px-3 gap-2 bg-card" title="Copy Link" onClick={() => handleCopy(link.shortCode)}>
                    <Copy className="h-4 w-4" />
                    <span className="hidden lg:inline">Copy</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground border border-transparent hover:border-border" asChild>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty flex flex-col items-center">
             <div className="dash-icon size-16 mb-6">
                <LinkIcon className="h-7 w-7 text-primary" />
             </div>
             <h3 className="text-xl font-semibold text-foreground mb-2">
               {showArchived ? "No archived links" : links.length > 0 ? "No links match your filters" : "Start with one destination URL"}
             </h3>
             <p className="text-muted-foreground max-w-sm mb-6">
               {showArchived
                 ? "Links you archive will show up here."
                 : "Create a short link first. You can edit the destination and settings after it exists."}
             </p>
             {!showArchived && links.length === 0 && (
               <Button className="btn-primary px-8" asChild>
                  <Link href="/dashboard/links/new">
                    <PencilLine className="size-4" />
                    Create your first link
                  </Link>
               </Button>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
