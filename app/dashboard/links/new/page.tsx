'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
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
  const [useCustomSlug, setUseCustomSlug] = useState(false)
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const [expiresAt, setExpiresAt] = useState("")
  const [useExpiration, setUseExpiration] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!originalUrl) {
      setError("CONFLICT: MISSING_URL")
      setIsLoading(false)
      return
    }

    // Validate URL
    try {
      new URL(originalUrl)
    } catch {
      setError("CONFLICT: INVALID_URL_STRUCTURE")
      setIsLoading(false)
      return
    }

    try {
      const shortCode = useCustomSlug && customSlug ? customSlug : generateShortCode()
      const link = await createShortLink({
        originalUrl,
        shortCode,
        title: title || null,
        password: usePassword && password ? password : null,
        expiresAt: useExpiration && expiresAt ? expiresAt : null,
      })

      toast.success("Link initialized")
      router.push(`/dashboard/links/${link.id}`)
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        setError("CONFLICT: SLUG_ALREADY_EXISTS")
      } else {
        setError(`ERROR: ${err.message?.toUpperCase() || "UNKNOWN_ERROR"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex items-center gap-6 border-b-2 border-primary pb-8">
        <Button variant="ghost" size="icon" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground" asChild>
          <Link href="/dashboard/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Initialize Link</h1>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">New Access Sequence // Sector: Gamma</p>
        </div>
      </div>

      <div className="card-mono">
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase italic tracking-tight">Access Parameters</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Define redirection buffer</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest leading-none">Destination Buffer (URL) *</Label>
            <Input
              id="url"
              type="url"
              placeholder="HTTPS://EXAMPLE.COM/PAYLOAD"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="border-2 border-primary bg-background font-bold h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest leading-none">Entity Alias (optional)</Label>
            <Input
              id="title"
              placeholder="MY TRACKABLE ENTITY"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-primary bg-background font-bold h-12 uppercase"
            />
          </div>

          {/* Custom Slug */}
          <div className="space-y-4 border-2 border-primary p-6 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Overwrite Slug</Label>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">Manual path definition</p>
              </div>
              <Switch
                checked={useCustomSlug}
                onCheckedChange={setUseCustomSlug}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {useCustomSlug && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">/L/</span>
                  <Input
                    placeholder="CUSTOM-ACCESS-CODE"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').toUpperCase())}
                    className="border-2 border-primary bg-background font-bold h-10 uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Protection */}
          <div className="space-y-4 border-2 border-primary p-6 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Gateway Lock</Label>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">Authorization required</p>
              </div>
              <Switch
                checked={usePassword}
                onCheckedChange={setUsePassword}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {usePassword && (
              <div className="space-y-2 pt-2">
                <Input
                  type="password"
                  placeholder="ENCRYPTION-KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-primary bg-background font-bold h-10"
                />
              </div>
            )}
          </div>

          {/* Expiration */}
          <div className="space-y-4 border-2 border-primary p-6 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Decay Timer</Label>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">Temporal segment end</p>
              </div>
              <Switch
                checked={useExpiration}
                onCheckedChange={setUseExpiration}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {useExpiration && (
              <div className="space-y-2 pt-2">
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="border-2 border-primary bg-background font-bold h-10"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="border-2 border-destructive p-4 bg-destructive/10">
              <p className="text-[10px] font-mono uppercase text-destructive font-black tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="btn-mono">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize Link
            </Button>
            <Button type="button" variant="outline" className="border-2 border-border hover:border-primary px-6 py-2 uppercase font-black tracking-widest text-xs" asChild>
              <Link href="/dashboard/links">Abort</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
