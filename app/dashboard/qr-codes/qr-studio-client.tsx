'use client'

import { useState } from "react"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Link2 } from "lucide-react"

interface QrStudioClientProps {
  initialUrl: string
}

export function QrStudioClient({ initialUrl }: QrStudioClientProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl)

  return (
    <div className="dash-narrow space-y-8">
      {/* Header Bar */}
      <div className="border-b border-border pb-6">
        <div className="dash-kicker mb-2">QR Studio</div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          High-Resolution QR Studio
        </h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
          Generate vector-ready customizable QR codes with custom colors, brand logo overlays, and shape patterns.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configurator Column */}
        <div className="lg:col-span-2 space-y-6 border border-border bg-card p-6 rounded-md shadow-sm">
          <div className="space-y-2">
            <Label className="text-xs font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-2">
              <Link2 className="size-3.5 text-muted-foreground" /> Target Destination URL
            </Label>
            <Input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://2s.ms/your-link"
              className="dash-field h-11 text-xs font-mono"
            />
            <p className="text-xs text-muted-foreground font-mono">
              Enter any URL or short link to generate high-resolution QR matrix.
            </p>
          </div>
        </div>

        {/* Live Preview Studio Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <QrCodeCard url={targetUrl || "https://2s.ms"} fileName="cuttly-qr-studio" />
          </div>
        </div>
      </div>
    </div>
  )
}
