'use client'

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Download, QrCode } from "lucide-react"

interface QrCodeCardProps {
  url: string
  fileName?: string
}

const QR_SIZE = 320
const LOGO_RATIO = 0.22

export function QrCodeCard({ url, fileName = "qr-code" }: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [withLogo, setWithLogo] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement("canvas")

    QRCode.toCanvas(canvas, url, {
      width: QR_SIZE,
      margin: 1,
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
        logo.src = "/icon.svg"
        logo.onload = () => {
          if (cancelled || !ctx) return
          const logoSize = QR_SIZE * LOGO_RATIO
          const pad = 10
          const x = (QR_SIZE - logoSize) / 2
          const y = (QR_SIZE - logoSize) / 2

          ctx.fillStyle = "#ffffff"
          ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
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
  }, [url, withLogo])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${fileName}.png`
    a.click()
  }

  return (
    <div className="p-4 bg-background border border-border rounded-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <QrCode className="size-4" />
          QR code
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Logo</span>
          <Switch checked={withLogo} onCheckedChange={setWithLogo} />
        </div>
      </div>
      <div className="flex items-center justify-center rounded-md border border-border bg-white p-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR code" className="h-40 w-40" />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded-md bg-muted" />
        )}
      </div>
      <Button
        variant="secondary"
        className="w-full bg-card h-9 mt-3"
        onClick={handleDownload}
        disabled={!dataUrl}
      >
        <Download className="mr-2 h-4 w-4" />
        Download PNG
      </Button>
    </div>
  )
}
