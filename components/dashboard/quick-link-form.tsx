'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Link2, Loader2, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

function generateShortCode(length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export function QuickLinkForm() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const destination = url.trim()
    if (!destination) return

    // Validate URL
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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        setResult({ shortUrl: `${appUrl}/l/${link.shortCode}`, shortCode: link.shortCode })
        setUrl("")
        toast.success("Link created!")
      } catch (err: any) {
        toast.error(err.message || "Failed to create link")
      }
    })
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    toast.success("Copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) {
    return (
      <div className="mx-auto mt-7 w-full max-w-3xl animate-fade-in-up">
        <div className="flex flex-col gap-2 sm:flex-row rounded-lg border border-border bg-background p-2">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Check className="size-4 text-foreground shrink-0" />
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold truncate hover:underline"
            >
              {result.shortUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>
          <div className="flex gap-2">
            <Button className="btn-primary h-11 px-4" onClick={handleCopy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="secondary" className="h-11 px-3 bg-card" onClick={() => setResult(null)}>
              Shorten another
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <button
            onClick={() => router.push(`/dashboard/links/${result.shortCode}`)}
            className="underline hover:text-foreground transition-colors"
          >
            Manage & view analytics →
          </button>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-7 flex w-full max-w-3xl flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Link2 className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL to shorten instantly"
          className="h-12 rounded-md border-border bg-background pl-11 text-sm"
        />
      </div>
      <Button type="submit" disabled={isPending || !url} className="btn-primary h-12 px-6">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Shorten
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}
