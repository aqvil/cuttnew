'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ExternalLink,
  BarChart2,
  MoreHorizontal,
  Lock,
  Search,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Download,
  Tag as TagIcon,
  Clock,
  CheckCircle2,
  XCircle,
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
  expiresAt: Date | string | null
  isActive: boolean | null
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

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

function LinkStatusBadge({ link }: { link: LinkRow }) {
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
  if (isExpired) {
    return (
      <span className="badge-expired flex items-center gap-1">
        <Clock className="size-3" /> Expired
      </span>
    )
  }
  if (!link.isActive) {
    return (
      <span className="badge-archived flex items-center gap-1">
        <XCircle className="size-3" /> Inactive
      </span>
    )
  }
  return null
}

export function LinksList({ links, appUrl }: LinksListProps) {
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [showArchived, setShowArchived] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isBusy, setIsBusy] = useState(false)
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set())

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
    toast.success("Copied to clipboard")
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
      {/* Control bar */}
      <div className="dash-control flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allTags.length > 0 && (
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
          )}

          <div className="flex items-center rounded-md border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => { setShowArchived(false); setSelected(new Set()) }}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors ${!showArchived ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => { setShowArchived(true); setSelected(new Set()) }}
              className={`rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors ${showArchived ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Archived
            </button>
          </div>

          <Button variant="secondary" className="h-10 gap-2 bg-card text-sm" onClick={handleExport}>
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-card)] animate-fade-in-up">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex-1" />
          {showArchived ? (
            <Button variant="secondary" size="sm" className="bg-background" disabled={isBusy} onClick={() => handleBulkArchive(false)}>
              <ArchiveRestore className="size-3.5 mr-1.5" />
              Restore
            </Button>
          ) : (
            <Button variant="secondary" size="sm" className="bg-background" disabled={isBusy} onClick={() => handleBulkArchive(true)}>
              <Archive className="size-3.5 mr-1.5" />
              Archive
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isBusy}>
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selected.size} link{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone and will break any shared URLs.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Select all row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <Checkbox
            checked={selected.size === filtered.length && filtered.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {selected.size > 0 ? `${selected.size} of ${filtered.length} selected` : `${filtered.length} link${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* Link rows */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((link) => {
            const faviconUrl = getFaviconUrl(link.originalUrl)
            const showFavicon = faviconUrl && !faviconErrors.has(link.id)
            const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()

            return (
              <div
                key={link.id}
                className={`dash-panel flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 transition-all duration-150 hover:bg-muted/20 ${selected.has(link.id) ? "ring-1 ring-foreground/20 bg-muted/10" : ""}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Checkbox
                    className="mt-1 shrink-0"
                    checked={selected.has(link.id)}
                    onCheckedChange={() => toggleSelected(link.id)}
                  />

                  {/* Favicon or fallback icon */}
                  <div className="size-9 shrink-0 flex items-center justify-center rounded-md border border-border bg-background overflow-hidden">
                    {showFavicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={faviconUrl!}
                        alt=""
                        className="size-4 object-contain"
                        onError={() => setFaviconErrors((prev) => new Set([...prev, link.id]))}
                      />
                    ) : (
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/links/${link.id}`}
                        className="text-sm font-bold text-foreground hover:text-primary hover:underline truncate max-w-[280px]"
                      >
                        {link.title || "Untitled Link"}
                      </Link>
                      <LinkStatusBadge link={link} />
                      {link.password && (
                        <span className="badge-password flex items-center gap-1">
                          <Lock className="size-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                      <a
                        href={`${appUrl}/l/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:underline flex items-center gap-1"
                      >
                        {appUrl.replace(/^https?:\/\//, "")}/l/{link.shortCode}
                        <ExternalLink className="size-2.5 text-muted-foreground" />
                      </a>
                      <span className="hidden sm:inline text-border">·</span>
                      <span className="text-muted-foreground truncate max-w-[220px] sm:max-w-xs">
                        {link.originalUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </div>

                    {(link.tags && link.tags.length > 0) && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {link.tags.map((tag) => (
                          <span key={tag} className="tag-pill">
                            <TagIcon className="size-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground font-mono pt-0.5">
                      {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4 pl-12 sm:pl-0 border-t sm:border-t-0 border-border pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <BarChart2 className="size-3.5 text-muted-foreground" />
                      <span className="text-base font-bold tabular-nums">{(link.clickCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">clicks</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => handleCopy(link.shortCode)}
                      title="Copy link"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                      asChild
                      title="Manage link"
                    >
                      <Link href={`/dashboard/links/${link.id}`}>
                        <MoreHorizontal className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="dash-empty">
            <div className="dash-icon size-14 mb-5">
              <ExternalLink className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {showArchived ? "No archived links" : links.length > 0 ? "No links match" : "No links yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              {showArchived
                ? "Links you archive will appear here."
                : links.length > 0
                ? "Try adjusting your search or tag filter."
                : "Create your first short link to start tracking clicks."}
            </p>
            {!showArchived && links.length === 0 && (
              <Button className="btn-primary" asChild>
                <Link href="/dashboard/links/new">Create a link</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
