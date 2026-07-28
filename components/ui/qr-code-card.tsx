'use client'

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download, QrCode } from "lucide-react"

interface QrCodeCardProps {
  url: string
  fileName?: string
}

export function QrCodeCard({ url, fileName = "qr-code" }: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then((result) => {
        if (!cancelled) setDataUrl(result)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${fileName}.png`
    a.click()
  }

  return (
    <div className="p-4 bg-background border border-border rounded-md">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <QrCode className="size-4" />
        QR code
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
