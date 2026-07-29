'use client'

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Link2, Check, Copy } from "lucide-react"
import { createShortLink } from "@/app/actions/links"
import { toast } from "sonner"
import Link from "next/link"

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function HeroShortenForm() {
  const [url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShortUrl(null)

    if (!url) return

    // Validate URL
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    const finalUrl = url.startsWith("http") ? url : `https://${url}`

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        setShortUrl(`${appUrl}/l/${link.shortCode}`)
      } catch (err: any) {
        if (err.message?.includes("Unauthorized") || err.message?.includes("auth")) {
          // Redirect to login with the URL as a query param
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent("/dashboard/links/new?url=" + encodeURIComponent(finalUrl))}`
        } else {
          setError(err.message || "Something went wrong")
        }
      }
    })
  }

  const handleCopy = async () => {
    if (!shortUrl) return
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (shortUrl) {
    return (
      <div className="mt-8 max-w-2xl w-full rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-elevated)] animate-fade-in-up">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 flex items-center gap-3 bg-background border border-border rounded-md px-4 h-14">
            <Check className="size-4 text-foreground shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">{shortUrl}</span>
          </div>
          <div className="flex gap-2">
            <Button className="btn-primary h-14 px-5 shrink-0" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="secondary" className="h-14 px-4 shrink-0" onClick={() => { setShortUrl(null); setUrl("") }}>
              New
            </Button>
          </div>
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          <Link href="/auth/login" className="underline hover:text-foreground">Sign in</Link> to track clicks and manage this link.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 max-w-2xl w-full">
      <div className="rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-elevated)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Paste a long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 rounded-md border-transparent bg-background pl-11 text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-border"
            />
          </div>
          <Button type="submit" disabled={isPending || !url} className="btn-primary h-14 px-7 text-sm shrink-0">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : (
              <>Shorten <ArrowRight className="size-4" /></>
            )}
          </Button>
        </form>
      </div>
      {error && (
        <p className="mt-2 px-1 text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}
