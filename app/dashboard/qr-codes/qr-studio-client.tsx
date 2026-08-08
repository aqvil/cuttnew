'use client'

import { useState } from "react"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { QrCode, Sparkles, Palette, Link2, Download, Image as ImageIcon, Check } from "lucide-react"

interface QrStudioClientProps {
  initialUrl: string
}

export function QrStudioClient({ initialUrl }: QrStudioClientProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl)

  return (
    <div className="dash-narrow space-y-8">
      {/* Hero Header */}
      <div className="dash-hero relative overflow-hidden bg-gradient-to-br from-card via-card to-amber-500/5 border border-border p-8 rounded-2xl shadow-xl">
        <div className="space-y-2 text-left relative z-10">
          <div className="dash-kicker text-amber-500 bg-amber-500/10 border-amber-500/20">
            <Sparkles className="size-3.5" /> High-Resolution Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Custom QR Code Studio
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Generate vector-ready customizable QR codes with custom colors, brand logo overlays, and shape patterns for digital & print media.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configurator Column */}
        <div className="lg:col-span-2 space-y-6 bg-card border border-border p-6 rounded-2xl shadow-md">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Link2 className="size-4 text-amber-500" /> Target Destination URL
            </Label>
            <Input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://2s.ms/your-link"
              className="h-11 text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter any URL or short link to encode into the high-resolution QR matrix.
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
