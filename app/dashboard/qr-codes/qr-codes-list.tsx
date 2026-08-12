'use client'

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLink, MoreHorizontal, QrCode, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { EmptyState } from "@/components/app/empty-state"
import { QrPreview } from "@/components/qr/qr-preview"
import { CopyButton } from "@/components/app/copy-button"
import { deleteQrCode } from "@/app/actions/qr-codes"
import type { QrCodeListItem } from "@/lib/qr/queries"
import { formatDate, fullNumber, truncateMiddle } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * QR code library.
 *
 * Each card shows the code as it will actually print, and a scan count that is
 * a real measurement — the encoded URL carries a `?qr=1` marker, so scans are
 * recorded separately from ordinary clicks. The previous page rendered a
 * hardcoded "0 scans" under every code and a download button that did nothing.
 */
export function QrCodesList({
  codes,
  appOrigin,
}: {
  codes: QrCodeListItem[]
  appOrigin: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState<QrCodeListItem | null>(null)
  const [isPending, startTransition] = useTransition()

  // Client-side filtering is correct here: the list is capped server-side at a
  // size that comfortably fits in memory, unlike the links table.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return codes
    return codes.filter(
      (code) =>
        (code.title || "").toLowerCase().includes(term) ||
        code.shortCode.toLowerCase().includes(term) ||
        code.destinationUrl.toLowerCase().includes(term)
    )
  }, [codes, search])

  const handleDelete = (code: QrCodeListItem) => {
    startTransition(async () => {
      const result = await deleteQrCode(code.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("QR code deleted.")
      router.refresh()
    })
  }

  if (codes.length === 0) {
    return (
      <EmptyState
        icon={QrCode}
        title="No QR codes yet"
        description="Turn any short link into a scannable code for print, packaging or signage. Scans are tracked separately from clicks, so you can see what physical placement actually earns."
        action={
          <Button asChild>
            <Link href="/dashboard/qr-codes/new">Create your first QR code</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className={cn("space-y-5", isPending && "pointer-events-none opacity-60")}>
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search QR codes"
          aria-label="Search QR codes"
          className="h-9 pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          variant="filtered"
          icon={Search}
          title="No QR codes match your search"
          description="Try a different name, short code or destination."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((code) => {
            const shortUrl = `${appOrigin}/l/${code.shortCode}`
            const displayUrl = shortUrl.replace(/^https?:\/\//, "")

            return (
              <li
                key={code.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">
                      {code.title || displayUrl}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {truncateMiddle(code.destinationUrl, 44)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${code.title || displayUrl}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/links/${code.linkId}`}>
                          <ExternalLink className="size-4" aria-hidden="true" />
                          Open link details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setPendingDelete(code)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        Delete QR code
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <QrPreview
                  value={`${shortUrl}?qr=1`}
                  size={148}
                  fileName={`cuttly-${code.shortCode}`}
                  design={{
                    foregroundColor: code.foregroundColor || "#000000",
                    backgroundColor: code.backgroundColor || "#ffffff",
                    logoUrl: code.logoUrl,
                    errorCorrection: code.errorCorrection || "M",
                  }}
                />

                <div className="flex items-center gap-1.5">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate font-mono text-xs text-brand hover:underline"
                  >
                    {displayUrl}
                  </a>
                  <CopyButton
                    value={shortUrl}
                    variant="ghost"
                    size="icon-sm"
                    iconOnly
                    label="Copy short link"
                    successMessage="Short link copied"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground tabular">
                      {fullNumber(code.scans)}
                    </span>{" "}
                    scan{code.scans === 1 ? "" : "s"}
                  </span>
                  <span>{formatDate(code.createdAt)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this QR code?</AlertDialogTitle>
            <AlertDialogDescription>
              Any printed copies of this code will keep working, because they point at the short
              link — but you&apos;ll lose this saved design and its scan history. The link itself
              is not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = pendingDelete
                setPendingDelete(null)
                if (target) handleDelete(target)
              }}
            >
              Delete QR code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
