'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateShortLink, deleteShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, ExternalLink, Copy, Check, Trash2, LayoutTemplate, Link2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface LinkEditorProps {
  link: any
}

export function LinkEditor({ link }: LinkEditorProps) {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl)
  const [title, setTitle] = useState(link.title || "")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(!!link.password)
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
  )
  const [useExpiration, setUseExpiration] = useState(!!link.expiresAt)
  const [isActive, setIsActive] = useState(link.isActive)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linkforge.app"
  const shortUrl = `${baseUrl}/l/${link.shortCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      await updateShortLink(link.id, {
        originalUrl,
        title: title || null,
        password: usePassword ? (password || link.password) : null,
        expiresAt: useExpiration && expiresAt ? expiresAt : null,
        isActive,
      })
      toast.success("Link details saved")
      router.refresh()
    } catch (err: any) {
      setError(`Error saving link: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteShortLink(link.id)
      toast.success("Link deleted successfully")
      router.push("/dashboard/links")
    } catch (err) {
      toast.error("Failed to delete link")
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:bg-slate-100 hover:text-slate-900" asChild>
              <Link href="/dashboard/links">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Edit Link</h1>
               <p className="text-sm text-slate-500 mt-1">Manage destination and link security</p>
            </div>
         </div>

         <div className="flex items-center gap-3">
             <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Link?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-slate-600">
                      Are you sure you want to delete this link? This action cannot be undone and will break any existing URLs shared.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="btn-primary bg-red-600 hover:bg-red-700">
                      {isDeleting ? "Deleting..." : "Yes, delete link"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
             </Button>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Editor */}
         <div className="lg:col-span-2 space-y-6">
            <div className="card p-8">
               <h2 className="text-lg font-bold text-slate-900 mb-6">Link Destination</h2>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-sm font-semibold text-slate-700">Destination URL <span className="text-red-500">*</span></Label>
                     <Input
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="h-12 border-slate-200 bg-white"
                        placeholder="https://example.com/very-long-url"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-sm font-semibold text-slate-700">Title (Optional)</Label>
                     <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 border-slate-200 bg-white"
                        placeholder="My awesome link"
                     />
                     <p className="text-xs text-slate-500">Helps you identify this link in your dashboard.</p>
                  </div>
               </div>
            </div>

            <div className="card p-8">
               <h2 className="text-lg font-bold text-slate-900 mb-6">Security & Routing</h2>

               <div className="space-y-8">
                  {/* Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                     <div>
                        <Label className="text-base font-semibold text-slate-900">Active Status</Label>
                        <p className="text-sm text-slate-500 mt-1">If turned off, the link will redirect to an error page.</p>
                     </div>
                     <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

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
                           placeholder={link.password ? "Leave blank to keep existing password" : "Enter a secure password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="h-12 mt-2"
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
                        />
                     </div>
                  )}
               </div>
            </div>

            {error && (
               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium font-sans">
                  {error}
               </div>
            )}
         </div>

         {/* Sidebar Preview */}
         <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 border-blue-100 shadow-xl shadow-blue-900/5">
               <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Short Link</h3>
               <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Link2 className="h-5 w-5 text-primary" />
                     <span className="font-semibold text-slate-900 truncate">{shortUrl}</span>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" className="w-full bg-white h-9" onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy"}
                     </Button>
                     <Button variant="secondary" size="icon" className="w-9 shrink-0 bg-white" asChild>
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </a>
                     </Button>
                  </div>
               </div>

               <Button className="btn-primary w-full h-12 text-base" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving changes..." : "Save details"}
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}
