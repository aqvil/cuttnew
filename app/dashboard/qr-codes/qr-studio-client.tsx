'use client'

import { useState } from "react"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy, Check, Globe, Link2, QrCode, Tag, ArrowRight } from "lucide-react"

interface QrStudioClientProps {
  initialUrl: string
}

export function QrStudioClient({ initialUrl }: QrStudioClientProps) {
  const [targetUrl, setTargetUrl] = useState(initialUrl || "https://reminderly.net/")
  const [shortLink, setShortLink] = useState("2s.ms/3FkaiZ7")
  const [title, setTitle] = useState("Reminderly - Your Ultimate Reminder Service")
  const [tags, setTags] = useState("marketing, launch")
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${shortLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Page Title */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
          Edit QR Code
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Details & Content Forms */}
        <div className="lg:col-span-2 space-y-8 bg-card border border-border p-6 rounded-xl shadow-sm">
          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Details</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                Short link
              </Label>
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-primary">
                <span>{shortLink}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reminderly - Your Ultimate Reminder Service"
                className="font-mono text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Select or enter tags (e.g. campaign, social)"
                className="font-mono text-xs h-10"
              />
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 space-y-4">
            {/* Content Section */}
            <h2 className="text-lg font-bold text-foreground">Content</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                Scan destination
              </Label>
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-foreground">
                <Globe className="w-4 h-4 text-muted-foreground" /> Website
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                Destination
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://reminderly.net/"
                  className="font-mono text-xs h-10"
                />
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                >
                  Redirect <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4 border-t border-border/40">
              <Button
                onClick={handleSave}
                className="font-mono text-xs font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saved ? "Changes saved!" : "Save changes"}
              </Button>
              <Button variant="ghost" className="font-mono text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Preview Box */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-3">
            <div className="text-center font-mono text-xs uppercase font-bold text-muted-foreground">
              Preview
            </div>
            <QrCodeCard url={targetUrl || "https://reminderly.net"} fileName="cuttly-qr-code" />
          </div>
        </div>
      </div>
    </div>
  )
}
