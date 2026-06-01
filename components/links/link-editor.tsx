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
import { ArrowLeft, ExternalLink, Copy, Check, Trash2, Link2, SlidersHorizontal } from "lucide-react"
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
    <div className="dash-narrow">
      <div className="dash-hero flex flex-col items-center gap-4">
         <div className="flex flex-col items-center gap-4">
            <Button variant="ghost" size="icon" className="absolute left-4 top-4 h-10 w-10 text-muted-foreground hover:bg-muted hover:text-foreground" asChild>
              <Link href="/dashboard/links">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
               <div className="dash-kicker mb-3">
                  <Link2 className="size-3.5" />
                  Short link
               </div>
               <h1 className="dash-title">Edit Link</h1>
               <p className="text-sm text-muted-foreground mt-1">Manage destination, access, and redirects</p>
            </div>
         </div>

         <div className="absolute right-4 top-4 flex items-center gap-3">
             <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" asChild>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-foreground">Delete Link?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base text-muted-foreground">
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
            <div className="dash-panel p-6 sm:p-8">
               <h2 className="dash-panel-title mb-6">Link Destination</h2>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-sm font-semibold text-foreground">Destination URL <span className="text-red-500">*</span></Label>
                     <Input
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="h-12 border-border bg-background"
                        placeholder="https://example.com/very-long-url"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-sm font-semibold text-foreground">Title (Optional)</Label>
                     <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 border-border bg-background"
                        placeholder="My awesome link"
                     />
                     <p className="text-xs text-muted-foreground">Helps you identify this link in your dashboard.</p>
                  </div>
               </div>
            </div>

            <div className="dash-panel p-6 sm:p-8">
               <h2 className="dash-panel-title mb-6">Access & Routing</h2>

               <div className="space-y-8">
                  {/* Status */}
                  <div className="flex items-center justify-between border-b border-border pb-8">
                     <div>
                        <Label className="text-base font-semibold text-foreground">Active Status</Label>
                        <p className="text-sm text-muted-foreground mt-1">If turned off, the link will redirect to an error page.</p>
                     </div>
                     <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

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
                           placeholder={link.password ? "Leave blank to keep existing password" : "Enter a secure password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="h-12 mt-2"
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
                        />
                     </div>
                  )}
               </div>
            </div>

            {error && (
               <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 font-medium font-sans">
                  {error}
               </div>
            )}
         </div>

         {/* Sidebar Preview */}
         <div className="lg:col-span-1 space-y-6">
            <div className="dash-panel p-6 shadow-xl shadow-foreground/5">
               <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                  <SlidersHorizontal className="size-4" />
                  Link controls
               </div>
               <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Short Link</h3>
               <div className="p-4 bg-background border border-border rounded-md mb-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Link2 className="h-5 w-5 text-primary" />
                     <span className="font-semibold text-foreground truncate">{shortUrl}</span>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" className="w-full bg-card h-9" onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy"}
                     </Button>
                     <Button variant="secondary" size="icon" className="w-9 shrink-0 bg-card" asChild>
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
