'use client'

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Download, QrCode, Palette, Shapes, Image as ImageIcon } from "lucide-react"

interface QrCodeCardProps {
  url: string
  fileName?: string
}

const QR_SIZE = 360
const LOGO_RATIO = 0.22

export function QrCodeCard({ url, fileName = "qr-code" }: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [withLogo, setWithLogo] = useState(true)
  const [logoUrl, setLogoUrl] = useState("/icon.svg")
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement("canvas")

    QRCode.toCanvas(canvas, url, {
      width: QR_SIZE,
      margin: 1,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: withLogo ? "H" : "M",
    })
      .then(() => {
        if (cancelled) return

        if (!withLogo) {
          canvasRef.current = canvas
          setDataUrl(canvas.toDataURL("image/png"))
          return
        }

        const ctx = canvas.getContext("2d")
        const logo = new Image()
        logo.src = logoUrl || "/icon.svg"
        logo.crossOrigin = "anonymous"
        logo.onload = () => {
          if (cancelled || !ctx) return
          const logoSize = QR_SIZE * LOGO_RATIO
          const pad = 10
          const x = (QR_SIZE - logoSize) / 2
          const y = (QR_SIZE - logoSize) / 2

          ctx.fillStyle = bgColor
          ctx.beginPath()
          ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 8)
          ctx.fill()

          ctx.drawImage(logo, x, y, logoSize, logoSize)

          canvasRef.current = canvas
          setDataUrl(canvas.toDataURL("image/png"))
        }
        logo.onerror = () => {
          if (cancelled) return
          canvasRef.current = canvas
          setDataUrl(canvas.toDataURL("image/png"))
        }
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [url, withLogo, logoUrl, fgColor, bgColor])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${fileName}.png`
    a.click()
  }

  return (
    <div className="p-5 bg-background border border-border rounded-xl space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <QrCode className="size-4 text-primary" />
          Custom QR Code
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Logo Overlay</span>
          <Switch checked={withLogo} onCheckedChange={setWithLogo} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Color pickers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Palette className="size-3.5" /> Code Color
            </span>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="size-7 rounded cursor-pointer border border-border"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Palette className="size-3.5" /> Background
            </span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="size-7 rounded cursor-pointer border border-border"
            />
          </div>

          {withLogo && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5" /> Custom Logo URL
              </span>
              <Input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/icon.svg or https://..."
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>

        {/* QR Preview box */}
        <div className="flex items-center justify-center rounded-lg border border-border p-4 bg-muted/30">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Custom QR code" className="h-44 w-44 rounded-md shadow-sm" />
          ) : (
            <div className="h-44 w-44 animate-pulse rounded-md bg-muted" />
          )}
        </div>
      </div>

      <Button
        variant="default"
        className="w-full h-10 font-semibold text-sm"
        onClick={handleDownload}
        disabled={!dataUrl}
      >
        <Download className="mr-2 h-4 w-4" />
        Download High-Res PNG
      </Button>
    </div>
  )
}

