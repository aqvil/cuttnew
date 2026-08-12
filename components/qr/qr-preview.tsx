'use client'

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * Renders a QR code to a canvas and downloads it as PNG or SVG.
 *
 * Downloads are generated at 1024px regardless of the on-screen preview size,
 * so a code pulled into print material stays crisp — the previous version
 * downloaded whatever the preview happened to be.
 *
 * A logo is drawn only at error-correction level H, where up to 30% of the
 * modules can be obscured without the code becoming unreadable.
 */

export interface QrDesign {
  foregroundColor: string
  backgroundColor: string
  logoUrl?: string | null
  errorCorrection: string
}

const DOWNLOAD_SIZE = 1024
const LOGO_RATIO = 0.2

export function QrPreview({
  value,
  design,
  fileName = "qr-code",
  size = 200,
  className,
  showDownload = true,
}: {
  value: string
  design: QrDesign
  fileName?: string
  size?: number
  className?: string
  showDownload?: boolean
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const level = (design.errorCorrection || "M") as "L" | "M" | "Q" | "H"
  const canDrawLogo = level === "H" && Boolean(design.logoUrl)

  useEffect(() => {
    let cancelled = false

    render(value, design, size, canDrawLogo)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[qr] render failed:", err)
          setError("This QR code couldn't be rendered. Check the colours and try again.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [value, design, size, canDrawLogo])

  const download = async (format: "png" | "svg") => {
    try {
      if (format === "svg") {
        const svg = await QRCode.toString(value, {
          type: "svg",
          errorCorrectionLevel: level,
          margin: 2,
          color: { dark: design.foregroundColor, light: design.backgroundColor },
        })
        triggerDownload(
          URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
          `${fileName}.svg`,
          true
        )
      } else {
        const url = await render(value, design, DOWNLOAD_SIZE, canDrawLogo)
        triggerDownload(url, `${fileName}.png`, false)
      }
      toast.success(`Downloaded ${fileName}.${format}`)
    } catch (err) {
      console.error("[qr] download failed:", err)
      toast.error("We couldn't generate that file. Please try again.")
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={containerRef}
        className="flex items-center justify-center rounded-lg border border-border p-4"
        style={{ backgroundColor: design.backgroundColor }}
      >
        {error ? (
          <p className="px-4 py-8 text-center text-sm text-destructive">{error}</p>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`QR code linking to ${value}`}
            width={size}
            height={size}
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center"
            role="status"
            aria-label="Generating QR code"
          >
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      {showDownload ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full" disabled={!dataUrl}>
              <Download className="size-4" aria-hidden="true" />
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => download("png")}>
              PNG · {DOWNLOAD_SIZE}×{DOWNLOAD_SIZE}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => download("svg")}>
              SVG · vector
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

async function render(
  value: string,
  design: QrDesign,
  size: number,
  withLogo: boolean
): Promise<string> {
  const canvas = document.createElement("canvas")

  await QRCode.toCanvas(canvas, value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: (design.errorCorrection || "M") as "L" | "M" | "Q" | "H",
    color: { dark: design.foregroundColor, light: design.backgroundColor },
  })

  if (!withLogo || !design.logoUrl) return canvas.toDataURL("image/png")

  const context = canvas.getContext("2d")
  if (!context) return canvas.toDataURL("image/png")

  try {
    const logo = await loadImage(design.logoUrl)
    const logoSize = size * LOGO_RATIO
    const padding = size * 0.02
    const x = (size - logoSize) / 2
    const y = (size - logoSize) / 2

    // Knock out a quiet zone behind the logo so it doesn't sit on top of
    // modules the scanner still needs to read around.
    context.fillStyle = design.backgroundColor
    context.beginPath()
    context.roundRect(
      x - padding,
      y - padding,
      logoSize + padding * 2,
      logoSize + padding * 2,
      size * 0.02
    )
    context.fill()
    context.drawImage(logo, x, y, logoSize, logoSize)
  } catch {
    // A logo that won't load must not stop the QR code rendering.
  }

  return canvas.toDataURL("image/png")
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    // Needed so drawing a remote logo doesn't taint the canvas and break
    // toDataURL().
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("logo failed to load"))
    image.src = src
  })
}

function triggerDownload(href: string, fileName: string, revoke: boolean) {
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  if (revoke) URL.revokeObjectURL(href)
}
