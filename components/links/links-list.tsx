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
  Calendar,
  Filter,
  Check,
  Edit2,
  Share2,
  ChevronRight,
  Sparkles,
  LayoutList,
  Grid,
} from "lucide-react"
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

export function LinksList({ links, appUrl }: LinksListProps) {
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isBusy, setIsBusy] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return links.filter((link) => {
      if (Boolean(link.archivedAt) !== showArchived) return false
      if (!q) return true
      return (
        (link.title || "").toLowerCase().includes(q) ||
        link.shortCode.toLowerCase().includes(q) ||
        link.originalUrl.toLowerCase().includes(q)
      )
    })
  }, [links, search, showArchived])

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

  const handleCopy = async (id: string, shortCode: string) => {
    await navigator.clipboard.writeText(`${appUrl}/l/${shortCode}`)
    setCopiedId(id)
    toast.success("Short link copied!")
    setTimeout(() => setCopiedId(null), 2000)
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
    <div className="max-w-6xl mx-auto space-y-6 p-6 font-mono">
      {/* Bitly Header Row (Attachment 2) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Cuttly Links
        </h1>
        <Button asChild className="bg-primary text-primary-foreground font-mono font-bold text-xs px-5 h-10 hover:opacity-90">
          <Link href="/dashboard/links/new">Create link</Link>
        </Button>
      </div>

      {/* Bitly Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search links"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 font-mono text-xs bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card">
            <Calendar className="w-3.5 h-3.5" /> Filter by created date
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card">
            <Filter className="w-3.5 h-3.5" /> Add filters
          </Button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground bg-card border border-border px-4 py-2.5 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected.size === filtered.length && filtered.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="font-semibold text-foreground">{selected.size} selected</span>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="hover:text-foreground">Export</button>
              <span>·</span>
              <button onClick={() => handleBulkArchive(!showArchived)} className="hover:text-foreground">
                {showArchived ? "Restore" : "Hide"}
              </button>
              <span>·</span>
              <button onClick={handleBulkDelete} className="text-destructive hover:underline">Delete</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <LayoutList className="w-4 h-4 text-foreground" />
            <Grid className="w-4 h-4" />
          </div>

          <select
            value={showArchived ? "archived" : "active"}
            onChange={(e) => setShowArchived(e.target.value === "archived")}
            className="bg-transparent font-mono text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="active">Show: Active</option>
            <option value="archived">Show: Archived</option>
          </select>
        </div>
      </div>

      {/* Link Items Cards List (Bitly Screenshot 2) */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((link) => {
            const shortUrlDisplay = `${appUrl.replace(/^https?:\/\//, "")}/l/${link.shortCode}`
            const createdDateFormatted = link.createdAt
              ? new Date(link.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Mar 11, 2025"

            return (
              <div
                key={link.id}
                className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-sm hover:border-primary/40 transition-colors"
              >
                {/* Card Top Row: Checkbox, Expand Arrow, Title & Actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={selected.has(link.id)}
                      onCheckedChange={() => toggleSelected(link.id)}
                    />
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="font-bold text-sm text-foreground hover:text-primary truncate"
                    >
                      {link.title || "Reminderly - Your Ultimate Reminder Service"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    <Link href={`/dashboard/links/${link.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Short Code Row */}
                <div className="pl-7 flex items-center gap-2">
                  <a
                    href={`${appUrl}/l/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-xs text-primary hover:underline"
                  >
                    {shortUrlDisplay}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(link.id, link.shortCode)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>

                {/* Destination URL */}
                <div className="pl-7 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <span className="text-muted-foreground font-bold">↳</span>
                  <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                    {link.originalUrl}
                  </a>
                </div>

                {/* Footer Metadata Badges */}
                <div className="pl-7 pt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <BarChart2 className="w-3 h-3 text-muted-foreground" /> {link.clickCount || 0} engagements
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {createdDateFormatted}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    {link.tags && link.tags.length > 0 ? link.tags.join(", ") : "No tags"}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
            <ExternalLink className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground font-mono">No links match your search</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Create your first short link to start tracking clicks.</p>
            <Button asChild className="mt-4 h-9 px-4 font-mono text-xs font-bold">
              <Link href="/dashboard/links/new">Create link</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bitly Bottom Upgrade Callout Banner */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-foreground flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <span>Change a link's destination, even after you've shared it. Get redirects with every plan.</span>
        </div>
        <Button variant="link" className="text-xs font-bold text-teal-500 hover:underline p-0 h-auto shrink-0">
          View plans &rarr;
        </Button>
      </div>

      {/* Bitly End Divider */}
      <div className="pt-4 text-center font-mono text-xs text-muted-foreground flex items-center justify-center gap-4">
        <span className="h-px bg-border flex-1 max-w-[120px]" />
        <span>You've reached the end of your links</span>
        <span className="h-px bg-border flex-1 max-w-[120px]" />
      </div>
    </div>
  )
}
