'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BarChart2,
  MoreHorizontal,
  Search,
  Copy,
  Tag as TagIcon,
  Calendar,
  Check,
  Edit2,
  Share2,
  Sparkles,
  LayoutList,
  Grid,
  ChevronRightCircle,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { bulkDeleteShortLinks, bulkSetArchived } from "@/app/actions/links"
import { SocialShareModal } from "@/components/ui/social-share-modal"

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
  const [shareLink, setShareLink] = useState<{ url: string; title: string } | null>(null)

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
    if (selected.size === 0) return
    setIsBusy(true)
    try {
      await bulkSetArchived(Array.from(selected), archived)
      toast.success(archived ? "Links hidden" : "Links restored")
      setSelected(new Set())
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsBusy(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
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
    <div className="w-full max-w-[1140px] mx-auto space-y-5 p-4 sm:p-6 font-mono text-foreground">
      {/* Bitly Header Row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Cuttly Links
        </h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs px-5 h-10 rounded-[3px] shadow-xs">
          <Link href="/dashboard/links/new">Create link</Link>
        </Button>
      </div>

      {/* Search & Filters Input Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search links"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 font-mono text-xs bg-card border-border rounded-[3px] focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card border-border rounded-[3px]">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Filter by created date
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card border-border rounded-[3px]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" /> Add filters
          </Button>
        </div>
      </div>

      {/* Bitly Sub-toolbar Row */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground bg-muted/40 border border-border px-4 py-2 rounded-[3px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected.size === filtered.length && filtered.length > 0}
              onCheckedChange={toggleSelectAll}
              className="rounded-[2px]"
            />
            <span className="font-semibold text-foreground">{selected.size} selected</span>
          </div>

          <button
            onClick={handleExport}
            disabled={selected.size === 0}
            className={`hover:text-foreground transition-colors ${selected.size === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Export
          </button>
          <button
            onClick={() => handleBulkArchive(!showArchived)}
            disabled={selected.size === 0}
            className={`hover:text-foreground transition-colors ${selected.size === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {showArchived ? "Restore" : "Hide"}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selected.size === 0}
            className={`text-destructive hover:underline transition-colors ${selected.size === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Tag
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <LayoutList className="w-3.5 h-3.5 text-foreground cursor-pointer" />
            <Grid className="w-3.5 h-3.5 cursor-pointer" />
          </div>

          <select
            value={showArchived ? "archived" : "active"}
            onChange={(e) => setShowArchived(e.target.value === "archived")}
            className="bg-transparent font-mono text-xs font-bold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="active">Show: Active</option>
            <option value="archived">Show: Archived</option>
          </select>
        </div>
      </div>

      {/* Link Card Items (Exact Bitly Match with 3px Rounding & Dynamic Theme Support) */}
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
                className="p-5 rounded-[3px] border border-border bg-card space-y-2.5 shadow-xs hover:border-primary/40 transition-colors"
              >
                {/* Card Top Row: Checkbox, Circle Icon, Title & Action Buttons */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Checkbox
                      checked={selected.has(link.id)}
                      onCheckedChange={() => toggleSelected(link.id)}
                      className="rounded-[2px]"
                    />
                    <ChevronRightCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Link
                      href={`/dashboard/links/${link.id}`}
                      className="font-bold text-sm text-foreground hover:text-primary truncate"
                    >
                      {link.title || "Reminderly - Your Ultimate Reminder Service"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <Link href={`/dashboard/links/${link.id}`}>
                      <button className="p-1 hover:text-foreground rounded-[2px]" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => setShareLink({ url: `${appUrl}/l/${link.shortCode}`, title: link.title || "Short Link" })}
                      className="p-1 hover:text-foreground rounded-[2px]"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <button className="p-1 hover:text-foreground rounded-[2px]" title="Analytics">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <button className="p-1 hover:text-foreground rounded-[2px]" title="More">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Short Code Row */}
                <div className="pl-6 flex items-center gap-2">
                  <a
                    href={`${appUrl}/l/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-xs text-primary hover:underline"
                  >
                    {shortUrlDisplay}
                  </a>
                  <button
                    onClick={() => handleCopy(link.id, link.shortCode)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === link.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Destination URL */}
                <div className="pl-6 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <span className="text-muted-foreground font-bold">↳</span>
                  <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                    {link.originalUrl}
                  </a>
                </div>

                {/* Footer Metadata */}
                <div className="pl-6 pt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <BarChart2 className="w-3 h-3 text-muted-foreground" /> {link.clickCount || 0} engagements
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" /> {createdDateFormatted}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <TagIcon className="w-3 h-3 text-muted-foreground" />
                    {link.tags && link.tags.length > 0 ? link.tags.join(", ") : "No tags"}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-border rounded-[3px] bg-card">
            <ExternalLink className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground font-mono">No links match your search</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Create your first short link to start tracking clicks.</p>
            <Button asChild className="mt-4 h-9 px-4 font-mono text-xs font-bold rounded-[3px]">
              <Link href="/dashboard/links/new">Create link</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bitly Bottom Callout Banner */}
      <div className="p-3.5 rounded-[3px] bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-foreground flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <span>Change a link's destination, even after you've shared it. Get redirects with every plan.</span>
        </div>
        <a href="/dashboard/billing" className="text-xs font-bold text-teal-500 hover:underline shrink-0">
          View plans &rarr;
        </a>
      </div>

      {/* Bitly End Divider */}
      <div className="pt-4 text-center font-mono text-xs text-muted-foreground flex items-center justify-center gap-4">
        <span className="h-px bg-border flex-1 max-w-[120px]" />
        <span>You've reached the end of your links</span>
        <span className="h-px bg-border flex-1 max-w-[120px]" />
      </div>

      {/* Social Share Modal */}
      {shareLink && (
        <SocialShareModal
          url={shareLink.url}
          title={shareLink.title}
        />
      )}
    </div>
  )
}
