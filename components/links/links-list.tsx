'use client'

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Archive,
  ArchiveRestore,
  BarChart3,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Lock,
  MoreHorizontal,
  Pencil,
  QrCode,
  Search,
  Tag as TagIcon,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/app/empty-state"
import { useCopy } from "@/components/app/copy-button"
import {
  bulkAddTags,
  bulkDeleteLinks,
  bulkSetArchived,
  deleteLink,
} from "@/app/actions/links"
import type { LinkListItem } from "@/lib/links/queries"
import { formatDate, fullNumber, truncateMiddle } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * The links list.
 *
 * Rows rather than cards: at a hundred links, a card per link is a wall of
 * borders. Hairline separators and consistent column positions let the eye
 * scan down a single axis.
 *
 * Every control here is wired to something. The previous version shipped a
 * "Tag" button that called the *delete* action, two filter buttons that did
 * nothing, list/grid toggles that did nothing, and a placeholder title
 * ("Reminderly — Your Ultimate Reminder Service") rendered for every link
 * without one.
 */

interface LinksListProps {
  links: LinkListItem[]
  appOrigin: string
  /** True when the user has links but the current filters exclude them all. */
  isFiltered: boolean
  totalLinks: number
}

type LinkStatus = "active" | "archived" | "expired" | "inactive"

function statusOf(link: LinkListItem): LinkStatus {
  if (link.archivedAt) return "archived"
  if (link.isActive === false) return "inactive"
  if (link.expiresAt && new Date(link.expiresAt) <= new Date()) return "expired"
  if (link.maxClicks != null && (link.clickCount ?? 0) >= link.maxClicks) return "expired"
  return "active"
}

const STATUS_META: Record<LinkStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-success/30 bg-success/10 text-success" },
  archived: { label: "Archived", className: "border-border bg-muted text-muted-foreground" },
  expired: { label: "Expired", className: "border-warning/30 bg-warning/10 text-warning" },
  inactive: { label: "Paused", className: "border-border bg-muted text-muted-foreground" },
}

function toCsv(rows: LinkListItem[], origin: string): string {
  const header = [
    "Title",
    "Short URL",
    "Destination",
    "Status",
    "Clicks",
    "Tags",
    "Created",
  ]

  const lines = rows.map((link) => [
    link.title ?? "",
    `${origin}/l/${link.shortCode}`,
    link.originalUrl,
    STATUS_META[statusOf(link)].label,
    String(link.clickCount ?? 0),
    (link.tags ?? []).join("; "),
    link.createdAt ? new Date(link.createdAt).toISOString() : "",
  ])

  // Prefix formula-leading cells so a spreadsheet treats them as text rather
  // than executing them — a destination URL can legitimately start with "=".
  const escape = (value: string) => {
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
    return `"${safe.replace(/"/g, '""')}"`
  }

  return [header, ...lines].map((row) => row.map(escape).join(",")).join("\r\n")
}

function downloadCsv(csv: string, filename: string) {
  // BOM so Excel reads it as UTF-8.
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function LinksList({ links, appOrigin, isFiltered, totalLinks }: LinksListProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [pendingDelete, setPendingDelete] = useState<LinkListItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // Selecting a row then changing the filter would otherwise leave rows
  // selected that are no longer on screen.
  useEffect(() => {
    setSelected((current) => {
      if (current.size === 0) return current
      const visible = new Set(links.map((link) => link.id))
      const next = new Set([...current].filter((id) => visible.has(id)))
      return next.size === current.size ? current : next
    })
  }, [links])

  const allSelected = links.length > 0 && selected.size === links.length
  const someSelected = selected.size > 0 && !allSelected

  const selectedLinks = useMemo(
    () => links.filter((link) => selected.has(link.id)),
    [links, selected]
  )

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(links.map((link) => link.id)))

  const run = (
    action: () => Promise<{ ok: boolean; error?: string }>,
    successMessage: (count: number) => string,
    count: number
  ) => {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        toast.error(result.error || "Something went wrong.")
        return
      }
      toast.success(successMessage(count))
      setSelected(new Set())
      router.refresh()
    })
  }

  const handleExport = () => {
    const rows = selectedLinks.length > 0 ? selectedLinks : links
    if (rows.length === 0) {
      toast.error("There's nothing to export.")
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(toCsv(rows, appOrigin), `cuttly-links-${stamp}.csv`)
    toast.success(`Exported ${rows.length} link${rows.length === 1 ? "" : "s"}.`)
  }

  if (links.length === 0) {
    return isFiltered ? (
      <EmptyState
        variant="filtered"
        icon={Search}
        title="No links match these filters"
        description="Try a different search term, or widen the status and date filters."
      />
    ) : (
      <EmptyState
        icon={Link2}
        title="You haven't created any links yet"
        description="Shorten your first URL to start tracking clicks, generate a QR code, and share it anywhere."
        action={
          <Button asChild>
            <Link href="/dashboard/links/new">Create your first link</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className={cn("space-y-3", isPending && "pointer-events-none opacity-60")}>
      {/* Selection toolbar — always present so the layout doesn't jump. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-subtle px-3 py-2">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
            aria-label={allSelected ? "Deselect all links" : "Select all links"}
          />
          <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {selected.size > 0
              ? `${selected.size} selected`
              : `${fullNumber(totalLinks)} link${totalLinks === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="size-4" aria-hidden="true" />
            Export{selected.size > 0 ? ` (${selected.size})` : " CSV"}
          </Button>

          {selected.size > 0 ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setTagDialogOpen(true)}>
                <TagIcon className="size-4" aria-hidden="true" />
                Tag
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  run(
                    () => bulkSetArchived([...selected], true),
                    (n) => `Archived ${n} link${n === 1 ? "" : "s"}.`,
                    selected.size
                  )
                }
              >
                <Archive className="size-4" aria-hidden="true" />
                Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  run(
                    () => bulkSetArchived([...selected], false),
                    (n) => `Restored ${n} link${n === 1 ? "" : "s"}.`,
                    selected.size
                  )
                }
              >
                <ArchiveRestore className="size-4" aria-hidden="true" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {links.map((link) => (
          <LinkRow
            key={link.id}
            link={link}
            appOrigin={appOrigin}
            selected={selected.has(link.id)}
            onToggle={() => toggle(link.id)}
            onDelete={() => setPendingDelete(link)}
          />
        ))}
      </ul>

      {/* Single delete */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this link?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="font-medium text-foreground">
                {appOrigin.replace(/^https?:\/\//, "")}/l/{pendingDelete?.shortCode}
              </strong>{" "}
              will stop working immediately for everyone who has it, and its click history
              will be deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep link</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = pendingDelete
                setPendingDelete(null)
                if (target) {
                  run(() => deleteLink(target.id), () => "Link deleted.", 1)
                }
              }}
            >
              Delete link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} link{selected.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              These short links will stop working immediately for everyone who has them,
              and their click history will be deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setBulkDeleteOpen(false)
                run(
                  () => bulkDeleteLinks([...selected]),
                  (n) => `Deleted ${n} link${n === 1 ? "" : "s"}.`,
                  selected.size
                )
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk tag */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add tags</DialogTitle>
            <DialogDescription>
              Tags are added to the {selected.size} selected link
              {selected.size === 1 ? "" : "s"}. Existing tags are kept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="bulk-tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="bulk-tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="spring-campaign, newsletter"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const tags = tagInput
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)

                if (tags.length === 0) {
                  toast.error("Enter at least one tag.")
                  return
                }

                setTagDialogOpen(false)
                setTagInput("")
                run(
                  () => bulkAddTags([...selected], tags),
                  (n) => `Tagged ${n} link${n === 1 ? "" : "s"}.`,
                  selected.size
                )
              }}
            >
              Add tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LinkRow({
  link,
  appOrigin,
  selected,
  onToggle,
  onDelete,
}: {
  link: LinkListItem
  appOrigin: string
  selected: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const { copied, copy } = useCopy()
  const status = statusOf(link)
  const meta = STATUS_META[status]
  const fullShortUrl = `${appOrigin}/l/${link.shortCode}`
  const displayShortUrl = `${appOrigin.replace(/^https?:\/\//, "")}/l/${link.shortCode}`

  // A link without a title is shown by its destination host, not a fabricated
  // name — the previous build hardcoded a fake product title here.
  const displayTitle = link.title || displayShortUrl

  return (
    <li className="flex items-start gap-3 p-4 transition-colors hover:bg-subtle">
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        className="mt-1 shrink-0"
        aria-label={`Select ${displayTitle}`}
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/links/${link.id}`}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {displayTitle}
          </Link>

          <Badge variant="outline" className={cn("h-5 shrink-0 text-[11px]", meta.className)}>
            {meta.label}
          </Badge>

          {link.hasPassword ? (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              title="Password protected"
            >
              <Lock className="size-3" aria-hidden="true" />
              <span className="sr-only">Password protected</span>
            </span>
          ) : null}

          {link.qrCodeCount > 0 ? (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              title={`${link.qrCodeCount} QR code${link.qrCodeCount === 1 ? "" : "s"}`}
            >
              <QrCode className="size-3" aria-hidden="true" />
              {link.qrCodeCount}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={fullShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-[13px] text-brand hover:underline"
          >
            {displayShortUrl}
          </a>
          <button
            type="button"
            onClick={() => copy(fullShortUrl, "Short link copied")}
            aria-label={`Copy ${displayShortUrl}`}
            className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5 text-success" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="truncate text-xs text-muted-foreground" title={link.originalUrl}>
          {truncateMiddle(link.originalUrl, 90)}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground tabular">
            {fullNumber(link.clickCount)} click{link.clickCount === 1 ? "" : "s"}
          </span>
          <span aria-hidden="true">·</span>
          <span>Created {formatDate(link.createdAt)}</span>
          {link.tags && link.tags.length > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex flex-wrap items-center gap-1">
                {link.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="h-5 font-normal">
                    {tag}
                  </Badge>
                ))}
                {link.tags.length > 3 ? <span>+{link.tags.length - 3}</span> : null}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button asChild variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
          <Link href={`/dashboard/links/${link.id}`} aria-label={`Analytics for ${displayTitle}`}>
            <BarChart3 className="size-4" aria-hidden="true" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${displayTitle}`}>
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={() => copy(fullShortUrl, "Short link copied")}>
              <Copy className="size-4" aria-hidden="true" />
              Copy short link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/links/${link.id}`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit link
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/qr-codes/new?link=${link.id}`}>
                <QrCode className="size-4" aria-hidden="true" />
                Create QR code
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" aria-hidden="true" />
                Open destination
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
