'use client'

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/app/empty-state"
import { QrPreview } from "@/components/qr/qr-preview"
import { createQrCode } from "@/app/actions/qr-codes"
import { cn } from "@/lib/utils"

/**
 * QR designer.
 *
 * The preview is the real artefact — the same render path produces the file you
 * download, so what you see is exactly what prints.
 *
 * Contrast between the two colours is checked live, because a low-contrast code
 * looks fine on screen and then fails to scan on paper. This is the one place
 * where "it renders" genuinely isn't the same as "it works".
 */

interface LinkOption {
  id: string
  title: string | null
  shortCode: string
  originalUrl: string
}

const ERROR_LEVELS = [
  { value: "L", label: "Low — smallest code, no logo" },
  { value: "M", label: "Medium — recommended" },
  { value: "Q", label: "Quartile — tolerates minor damage" },
  { value: "H", label: "High — required for a logo" },
]

export function QrStudio({
  links,
  appOrigin,
}: {
  links: LinkOption[]
  appOrigin: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [linkId, setLinkId] = useState(searchParams.get("link") || links[0]?.id || "")
  const [title, setTitle] = useState("")
  const [foreground, setForeground] = useState("#000000")
  const [background, setBackground] = useState("#ffffff")
  const [logoUrl, setLogoUrl] = useState("")
  const [errorCorrection, setErrorCorrection] = useState("M")
  const [error, setError] = useState<string | null>(null)

  // Selecting a logo without level H would produce a code that can't be read.
  useEffect(() => {
    if (logoUrl && errorCorrection !== "H") setErrorCorrection("H")
  }, [logoUrl, errorCorrection])

  const selected = links.find((link) => link.id === linkId)
  const previewUrl = selected
    ? `${appOrigin}/l/${selected.shortCode}?qr=1`
    : `${appOrigin}/l/example?qr=1`

  const contrast = contrastRatio(foreground, background)
  const contrastOk = contrast >= 3

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!linkId) {
      setError("Choose which link this QR code should point to.")
      return
    }

    startTransition(async () => {
      const result = await createQrCode({
        linkId,
        title: title.trim() || null,
        foregroundColor: foreground,
        backgroundColor: background,
        logoUrl: logoUrl.trim() || null,
        errorCorrection,
      })

      if (!result.ok) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success("QR code saved.")
      router.push("/dashboard/qr-codes")
    })
  }

  if (links.length === 0) {
    return (
      <EmptyState
        title="Create a link first"
        description="A QR code points at one of your short links, so the destination stays editable after the code is printed."
        action={
          <Button asChild>
            <Link href="/dashboard/links/new">Create a short link</Link>
          </Button>
        }
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_280px]" noValidate>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qr-link">
            Short link <span className="text-destructive">*</span>
          </Label>
          <Select value={linkId} onValueChange={setLinkId}>
            <SelectTrigger id="qr-link" className="h-10">
              <SelectValue placeholder="Choose a link" />
            </SelectTrigger>
            <SelectContent className="max-w-[min(28rem,90vw)]">
              {links.map((link) => (
                <SelectItem key={link.id} value={link.id}>
                  <span className="truncate">
                    {link.title || `/l/${link.shortCode}`}
                    <span className="ml-2 text-muted-foreground">/l/{link.shortCode}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            You can change where this link points at any time — printed codes keep working.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr-title">Name</Label>
          <Input
            id="qr-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Menu card — table tent"
            maxLength={200}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Helps you find this code later. Defaults to the link&apos;s title.
          </p>
        </div>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-sm font-semibold">Appearance</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              id="qr-foreground"
              label="Code colour"
              value={foreground}
              onChange={setForeground}
            />
            <ColorField
              id="qr-background"
              label="Background"
              value={background}
              onChange={setBackground}
            />
          </div>

          <p
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-2 rounded-md border p-3 text-xs",
              contrastOk
                ? "border-border bg-subtle text-muted-foreground"
                : "border-warning/30 bg-warning/10 text-warning"
            )}
          >
            {!contrastOk ? (
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            ) : null}
            <span>
              Contrast ratio {contrast.toFixed(1)}:1.{" "}
              {contrastOk
                ? "Scanners should read this reliably."
                : "Too low — many scanners will fail on this. Aim for at least 3:1."}
            </span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="qr-logo">Logo URL</Label>
            <Input
              id="qr-logo"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://example.com/logo.png"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Must be an https:// URL or a path on this site, and forces high error
              correction so the code stays readable.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-ec">Error correction</Label>
            <Select
              value={errorCorrection}
              onValueChange={setErrorCorrection}
              disabled={Boolean(logoUrl)}
            >
              <SelectTrigger id="qr-ec" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERROR_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher levels survive smudges and partial damage at the cost of a denser code.
            </p>
          </div>
        </fieldset>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-border pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save QR code"
            )}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/dashboard/qr-codes">Cancel</Link>
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold">Preview</p>
          <QrPreview
            value={previewUrl}
            size={200}
            fileName={selected ? `cuttly-${selected.shortCode}` : "cuttly-qr"}
            design={{
              foregroundColor: foreground,
              backgroundColor: background,
              logoUrl: logoUrl || null,
              errorCorrection,
            }}
          />
          <p className="text-xs text-muted-foreground">
            Test the download on a real phone before sending anything to print.
          </p>
        </div>
      </aside>
    </form>
  )
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
        />
        <Input
          value={value}
          onChange={(event) => {
            const next = event.target.value
            if (/^#[0-9a-fA-F]{0,6}$/.test(next)) onChange(next)
          }}
          aria-label={`${label} hex value`}
          className="h-10 font-mono"
        />
      </div>
    </div>
  )
}

/** WCAG relative-luminance contrast ratio between two hex colours. */
function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string): number => {
    const normalised = hex.replace("#", "")
    const full =
      normalised.length === 3
        ? normalised.split("").map((c) => c + c).join("")
        : normalised.padEnd(6, "0")

    const channels = [0, 2, 4].map((offset) => {
      const value = parseInt(full.slice(offset, offset + 2), 16) / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}
