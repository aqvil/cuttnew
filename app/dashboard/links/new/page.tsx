'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Link2, SlidersHorizontal } from "lucide-react"
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

    try {
      new URL(originalUrl)
    } catch {
      setError("Please provide a valid URL (e.g., https://example.com)")
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
    <div className="dash-narrow">
      <div className="dash-hero flex flex-col items-center gap-4">
         <Button variant="ghost" size="icon" className="absolute left-4 top-4 text-muted-foreground hover:bg-muted" asChild>
          <Link href="/dashboard/links">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="dash-kicker mb-3">
            <Link2 className="size-3.5" />
            New short link
          </div>
          <h1 className="dash-title">Create a short link</h1>
          <p className="dash-subtitle">Paste a destination first. Custom slugs, passwords, and expiration are optional.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="dash-panel p-6 sm:p-8">
             <div className="mb-6">
              <h2 className="dash-panel-title">1. Destination</h2>
              <p className="mt-1 text-sm text-muted-foreground">This is the long URL people will be redirected to.</p>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-semibold text-foreground">Destination URL <span className="text-destructive">*</span></Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/my-long-url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    className="dash-field"
                  />
                  <p className="text-xs text-muted-foreground">You can create multiple links to the same destination.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="E.g. Fall Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="dash-field"
                  />
                </div>
             </div>
           </div>

           <div className="dash-panel p-6 sm:p-8">
             <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="dash-panel-title">2. Short link</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Leave this off for an automatic code.</p>
                </div>
                <Switch
                  checked={useCustomSlug}
                  onCheckedChange={setUseCustomSlug}
                />
             </div>
             {useCustomSlug ? (
               <div className="space-y-2">
                 <Label className="text-sm font-semibold text-foreground">Domain / Custom back-half</Label>
                 <div className="flex items-center gap-2">
                   <div className="h-12 px-4 flex items-center bg-background border border-border rounded-md text-muted-foreground font-medium">
                     linkforge.app/l/
                   </div>
                   <Input
                     placeholder="custom-alias"
                     value={customSlug}
                     onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                     className="dash-field flex-1"
                   />
                 </div>
               </div>
             ) : (
                <p className="text-sm text-muted-foreground">Toggle to customize how your link looks. Leave off to auto-generate.</p>
             )}
           </div>

           <div className="dash-panel p-6 sm:p-8">
              <div className="mb-6 border-b border-border pb-4">
                <h2 className="dash-panel-title">3. Optional rules</h2>
                <p className="mt-1 text-sm text-muted-foreground">Use these only when the link needs extra control.</p>
              </div>
              <div className="space-y-8 pt-2">
                 {/* Password */}
                  <div className="flex items-center justify-between">
                     <div>
                        <Label className="text-base font-semibold text-foreground">Password Protection</Label>
                        <p className="text-sm text-muted-foreground mt-1">Require a password to access the destination URL.</p>
                     </div>
                     <Switch checked={usePassword} onCheckedChange={setUsePassword} />
                  </div>
                  {usePassword && (
                     <div className="bg-background p-4 rounded-md border border-border">
                        <Label className="text-sm font-semibold text-foreground">Password</Label>
                        <Input
                           type="password"
                           placeholder="Enter a secure password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="h-12 mt-2"
                           required={usePassword}
                        />
                     </div>
                  )}

                  <div className="w-full h-px bg-border" />

                  {/* Expiration */}
                  <div className="flex items-center justify-between">
                     <div>
                        <Label className="text-base font-semibold text-foreground">Link Expiration</Label>
                        <p className="text-sm text-muted-foreground mt-1">Automatically disable this link after a specific date.</p>
                     </div>
                     <Switch checked={useExpiration} onCheckedChange={setUseExpiration} />
                  </div>
                  {useExpiration && (
                     <div className="bg-background p-4 rounded-md border border-border">
                        <Label className="text-sm font-semibold text-foreground">Expiration Date</Label>
                        <Input
                           type="datetime-local"
                           value={expiresAt}
                           onChange={(e) => setExpiresAt(e.target.value)}
                           className="h-12 mt-2"
                           required={useExpiration}
                        />
                     </div>
                  )}
              </div>
           </div>

           {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/25 rounded-md text-sm text-destructive font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
           <div className="sticky top-24">
             <div className="dash-panel p-6">
                <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                  <SlidersHorizontal className="size-4" />
                  Ready to create
                </div>
                <Button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Link
                </Button>
                <Button type="button" variant="ghost" className="w-full mt-2 text-muted-foreground" asChild>
                   <Link href="/dashboard/links">Cancel</Link>
                </Button>
             </div>
           </div>
        </div>
      </form>
    </div>
  )
}
