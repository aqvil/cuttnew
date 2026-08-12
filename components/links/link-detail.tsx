'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Lock, Plus, QrCode, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { CopyButton } from "@/components/app/copy-button"
import { Stat, StatRow, percentChange } from "@/components/app/stat"
import { RangeSelector } from "@/components/analytics/range-selector"
import { AnalyticsBreakdowns, ClicksOverTime } from "@/components/analytics/analytics-panels"
import { LinkSettingsForm } from "@/components/links/link-settings-form"
import { QrPreview } from "@/components/qr/qr-preview"
import { deleteLink } from "@/app/actions/links"
import type { OwnedLink } from "@/lib/links/queries"
import type { AnalyticsRange, AnalyticsSummary } from "@/lib/analytics/types"
import { RANGE_LABELS } from "@/lib/analytics/types"
import { formatDateTime, fullNumber, truncateMiddle } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Link detail: performance on one tab, configuration on another.
 *
 * Splitting them keeps each view short enough to take in at a glance. The
 * previous single-column layout mixed a read-only summary, a hidden edit
 * drawer, an analytics section and two promotional panels for features that
 * didn't exist.
 */

interface LinkDetailProps {
  link: OwnedLink
  summary: AnalyticsSummary
  range: AnalyticsRange
  appOrigin: string
  qrCodes: Array<{
    id: string
    title: string | null
    foregroundColor: string | null
    backgroundColor: string | null
    logoUrl: string | null
    errorCorrection: string | null
  }>
}

export function LinkDetail({ link, summary, range, appOrigin, qrCodes }: LinkDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState("performance")

  const fullShortUrl = `${appOrigin}/l/${link.shortCode}`
  const displayShortUrl = fullShortUrl.replace(/^https?:\/\//, "")

  const isExpired =
    (link.expiresAt && new Date(link.expiresAt) <= new Date()) ||
    (link.maxClicks != null && (link.clickCount ?? 0) >= link.maxClicks)

  const status = link.archivedAt
    ? { label: "Archived", tone: "border-border bg-muted text-muted-foreground" }
    : link.isActive === false
      ? { label: "Paused", tone: "border-border bg-muted text-muted-foreground" }
      : isExpired
        ? { label: "Expired", tone: "border-warning/30 bg-warning/10 text-warning" }
        : { label: "Active", tone: "border-success/30 bg-success/10 text-success" }

  const trend = percentChange(summary.totalClicks, summary.previousClicks)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLink(link.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Link deleted.")
      router.push("/dashboard/links")
    })
  }

  return (
    <div className={cn("page", isPending && "pointer-events-none opacity-60")}>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/dashboard/links">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to links
        </Link>
      </Button>

      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="h1 truncate">{link.title || displayShortUrl}</h1>
            <Badge variant="outline" className={cn("h-6", status.tone)}>
              {status.label}
            </Badge>
            {link.hasPassword ? (
              <Badge variant="outline" className="h-6 gap-1">
                <Lock className="size-3" aria-hidden="true" />
                Protected
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={fullShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium text-brand hover:underline"
            >
              {displayShortUrl}
            </a>
            <CopyButton
              value={fullShortUrl}
              successMessage="Short link copied"
              variant="ghost"
              size="icon-sm"
              iconOnly
              label="Copy short link"
            />
          </div>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span aria-hidden="true">↳</span>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:text-foreground hover:underline"
              title={link.originalUrl}
            >
              {truncateMiddle(link.originalUrl, 80)}
            </a>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              Open destination
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/qr-codes/new?link=${link.id}`}>
              <QrCode className="size-4" aria-hidden="true" />
              QR code
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this link?</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong className="font-medium text-foreground">{displayShortUrl}</strong> will
                  stop working immediately for everyone who has it, and its{" "}
                  {fullNumber(link.clickCount)} recorded click
                  {link.clickCount === 1 ? "" : "s"} will be deleted. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep link</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="qr">
            QR codes{qrCodes.length > 0 ? ` (${qrCodes.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{RANGE_LABELS[range]}</p>
            <RangeSelector value={range} />
          </div>

          <StatRow>
            <Stat
              label="Clicks in period"
              value={fullNumber(summary.totalClicks)}
              trend={
                trend === null
                  ? null
                  : { changePercent: trend, label: "vs. previous period" }
              }
            />
            <Stat
              label="Unique visitors"
              value={fullNumber(summary.uniqueVisitors)}
              hint="Distinct hashed IPs"
            />
            <Stat
              label="QR scans"
              value={fullNumber(summary.qrScans)}
              hint="Included in clicks"
            />
            <Stat
              label="Lifetime clicks"
              value={fullNumber(link.clickCount)}
              hint={`Since ${formatDateTime(link.createdAt)}`}
            />
          </StatRow>

          <ClicksOverTime summary={summary} range={range} />
          <AnalyticsBreakdowns summary={summary} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-2xl">
            <LinkSettingsForm link={link} />
          </div>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          {qrCodes.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
              <div
                aria-hidden="true"
                className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-subtle text-muted-foreground"
              >
                <QrCode className="size-4" />
              </div>
              <h3 className="text-sm font-semibold">No QR code for this link yet</h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Generate one for print, packaging or signage. Scans are counted separately from
                clicks, so you can tell the two apart.
              </p>
              <Button asChild className="mt-6">
                <Link href={`/dashboard/qr-codes/new?link=${link.id}`}>
                  <Plus className="size-4" aria-hidden="true" />
                  Create QR code
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qrCodes.map((code) => (
                <div key={code.id} className="space-y-3 rounded-lg border border-border p-4">
                  <p className="truncate text-sm font-medium">
                    {code.title || link.title || displayShortUrl}
                  </p>
                  <QrPreview
                    value={`${fullShortUrl}?qr=1`}
                    size={160}
                    fileName={`cuttly-${link.shortCode}`}
                    design={{
                      foregroundColor: code.foregroundColor || "#000000",
                      backgroundColor: code.backgroundColor || "#ffffff",
                      logoUrl: code.logoUrl,
                      errorCorrection: code.errorCorrection || "M",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
