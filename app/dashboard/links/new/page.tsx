'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Link2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function NewLinkPage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("url")
    if (url) {
      setOriginalUrl(url)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!originalUrl) {
      setError("Please provide a destination URL")
      setIsLoading(false)
      return
    }

    let finalDestination = originalUrl.trim()
    if (!finalDestination.startsWith("http")) {
      finalDestination = "https://" + finalDestination
    }

    try {
      new URL(finalDestination)
    } catch {
      setError("Please provide a valid URL (e.g., https://example.com)")
      setIsLoading(false)
      return
    }

    try {
      const shortCode = customSlug.trim() ? customSlug.trim() : generateShortCode()
      const link = await createShortLink({
        originalUrl: finalDestination,
        shortCode,
        title: title.trim() || null,
        password: null,
        expiresAt: null,
        tags: [],
      })

      toast.success("Link created successfully")
      router.push(`/dashboard/links/${link.id}`)
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        setError("This custom back-half is already taken.")
      } else {
        setError(`Error creating link: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 sm:p-8 font-mono text-foreground">
      {/* Header Row */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/dashboard/links">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Create a short link
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-card p-6 sm:p-8 rounded-[3px] border border-border shadow-xs">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-xs font-semibold text-foreground">
              Destination URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/my-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="h-10 font-mono text-xs rounded-[3px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Title (optional)
            </Label>
            <Input
              id="title"
              placeholder="E.g. My Campaign Link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 font-mono text-xs rounded-[3px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customSlug" className="text-xs font-semibold text-foreground">
              Custom back-half / Alias (optional)
            </Label>
            <div className="flex items-center gap-2">
              <div className="h-10 px-3 flex items-center bg-muted border border-border rounded-[3px] text-muted-foreground font-mono text-xs shrink-0">
                2s.ms/l/
              </div>
              <Input
                id="customSlug"
                placeholder="my-alias"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                className="h-10 font-mono text-xs rounded-[3px] flex-1"
              />
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Leave blank to auto-generate a short code. Advanced rules (passwords, expiration, routing) can be set after creating in Edit Link.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/25 rounded-[3px] text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isLoading} className="h-10 px-6 font-mono text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-[3px]">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create link
          </Button>
          <Button type="button" variant="ghost" className="h-10 px-4 font-mono text-xs text-muted-foreground rounded-[3px]" asChild>
            <Link href="/dashboard/links">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
