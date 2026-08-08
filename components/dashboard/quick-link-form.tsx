'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Link2, QrCode, Sparkles, Lock, Info, Check, Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"

function generateShortCode(length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export function QuickLinkForm() {
  const [activeTab, setActiveTab] = useState<"link" | "qr">("link")
  const [url, setUrl] = useState("")
  const [createQr, setCreateQr] = useState(true)
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const destination = url.trim()
    if (!destination) return

    let finalUrl = destination
    if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl

    startTransition(async () => {
      try {
        const code = generateShortCode()
        const link = await createShortLink({
          originalUrl: finalUrl,
          shortCode: code,
          title: null,
          password: null,
          expiresAt: null,
          tags: [],
        })
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"
        setResult({ shortUrl: `${appUrl}/l/${link.shortCode}`, shortCode: link.shortCode })
        setUrl("")
        toast.success("Short link created successfully!")
      } catch (err: any) {
        toast.error(err.message || "Failed to create link")
      }
    })
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5 w-full font-mono">
      {/* Top Creation Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-bold transition-all border ${
            activeTab === "link"
              ? "bg-card text-foreground border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Link2 className="w-3.5 h-3.5" /> Short link
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qr")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-bold transition-all border ${
            activeTab === "qr"
              ? "bg-card text-foreground border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" /> QR Code
        </button>
      </div>

      {/* Main Quick Create Box Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
        {/* Left Column: Shortener Form */}
        <div className="flex-1 w-full p-5 rounded-[3px] border border-border bg-card space-y-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Quick create: Short link</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>You can create 100 more links this month.</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
            </div>
          </div>

          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <span>Domain: </span>
            <span className="font-bold text-foreground flex items-center gap-1">
              2s.ms <Lock className="w-3 h-3 text-muted-foreground" />
            </span>
          </div>

          {result ? (
            <div className="p-4 rounded-[3px] border border-primary/30 bg-primary/5 space-y-3">
              <div className="text-xs font-bold text-foreground">Your link is ready!</div>
              <div className="flex items-center gap-2">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-primary hover:underline truncate"
                >
                  {result.shortUrl.replace(/^https?:\/\//, "")}
                </a>
                <Button size="sm" onClick={handleCopy} className="font-mono text-xs font-bold ml-auto rounded-[3px]">
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                <Button variant="link" onClick={() => setResult(null)} className="p-0 h-auto text-xs text-muted-foreground">
                  Create another link
                </Button>
                <Button variant="link" onClick={() => router.push(`/dashboard/links`)} className="p-0 h-auto text-xs text-primary font-bold">
                  View in Links &rarr;
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Enter your destination URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/my-long-url"
                    className="font-mono text-xs h-10 border-border bg-background flex-1 rounded-[3px]"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isPending || !url.trim()}
                    className="h-10 px-5 font-mono text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-[3px]"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create your Cuttly link"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="create_qr"
                  checked={createQr}
                  onCheckedChange={(c) => setCreateQr(!!c)}
                  className="rounded-[2px]"
                />
                <Label htmlFor="create_qr" className="text-xs font-mono text-muted-foreground cursor-pointer">
                  Also create a QR Code for this link
                </Label>
              </div>
            </form>
          )}

          {/* Bottom Callout */}
          <div className="p-3 rounded-[3px] bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-foreground flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Get custom links and a complimentary domain.</span>
            </div>
            <a href="/dashboard/domains" className="text-teal-500 font-bold hover:underline">
              Upgrade now &rarr;
            </a>
          </div>
        </div>

        {/* Right Column: Callout Box (Fixed 340px width matching 100% grid) */}
        <div className="w-full lg:w-[340px] shrink-0 p-5 rounded-[3px] border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/10 space-y-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Simplify your workflow
            </div>
            <p className="text-xs text-muted-foreground">
              Explore smarter ways to create links.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-[3px] bg-card border border-border text-xs font-semibold text-foreground text-center shadow-xs">
              Personalize a short link
            </div>
            <div className="p-2.5 rounded-[3px] bg-card border border-border text-xs font-semibold text-foreground text-center shadow-xs">
              Make a unique link for every post
            </div>
          </div>

          <Button className="w-full h-9 font-mono text-xs font-bold gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-[3px]">
            <Sparkles className="w-3.5 h-3.5" /> Upgrade to Create with AI
          </Button>
        </div>
      </div>
    </div>
  )
}
