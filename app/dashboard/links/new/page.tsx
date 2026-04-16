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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-8">
      {/* Header */}
      <div className="flex items-center pb-6 border-b border-border">
         <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 mr-4" asChild>
          <Link href="/dashboard/links">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create new link</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="card p-8">
             <h2 className="text-lg font-bold text-slate-900 mb-6">Destination</h2>
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-semibold text-slate-700">Destination URL <span className="text-red-500">*</span></Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/my-long-url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    className="h-12 border-slate-200 bg-white"
                  />
                  <p className="text-xs text-slate-500">You can create multiple links to the same destination.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="E.g. Fall Campaign"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 border-slate-200 bg-white"
                  />
                </div>
             </div>
           </div>

           <div className="card p-8">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Custom back-half</h2>
                <Switch
                  checked={useCustomSlug}
                  onCheckedChange={setUseCustomSlug}
                />
             </div>
             {useCustomSlug ? (
               <div className="space-y-2">
                 <Label className="text-sm font-semibold text-slate-700">Domain / Custom back-half</Label>
                 <div className="flex items-center gap-2">
                   <div className="h-12 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium">
                     linkforge.app/l/
                   </div>
                   <Input
                     placeholder="custom-alias"
                     value={customSlug}
                     onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                     className="h-12 border-slate-200 bg-white flex-1"
                   />
                 </div>
               </div>
             ) : (
                <p className="text-sm text-slate-500">Toggle to customize how your link looks. Leave off to auto-generate.</p>
             )}
           </div>

           <div className="card p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Security & Routing</h2>
              <div className="space-y-8 pt-2">
                 {/* Password */}
                  <div className="flex items-center justify-between">
                     <div>
                        <Label className="text-base font-semibold text-slate-900">Password Protection</Label>
                        <p className="text-sm text-slate-500 mt-1">Require a password to access the destination URL.</p>
                     </div>
                     <Switch checked={usePassword} onCheckedChange={setUsePassword} />
                  </div>
                  {usePassword && (
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <Label className="text-sm font-semibold text-slate-700">Password</Label>
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

                  <div className="w-full h-px bg-slate-100" />

                  {/* Expiration */}
                  <div className="flex items-center justify-between">
                     <div>
                        <Label className="text-base font-semibold text-slate-900">Link Expiration</Label>
                        <p className="text-sm text-slate-500 mt-1">Automatically disable this link after a specific date.</p>
                     </div>
                     <Switch checked={useExpiration} onCheckedChange={setUseExpiration} />
                  </div>
                  {useExpiration && (
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <Label className="text-sm font-semibold text-slate-700">Expiration Date</Label>
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
           <div className="sticky top-24">
             <div className="card p-6 shadow-sm">
                <Button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Link
                </Button>
                <Button type="button" variant="ghost" className="w-full mt-2 text-slate-500" asChild>
                   <Link href="/dashboard/links">Cancel</Link>
                </Button>
             </div>
           </div>
        </div>
      </form>
    </div>
  )
}
