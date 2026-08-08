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
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Tag as TagIcon,
  Share2,
  Edit2,
  Plus,
  MoreHorizontal,
  ChevronRightCircle,
  Download,
  Calendar,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { LinkAnalyticsPanel } from "@/components/links/link-analytics-panel"

interface LinkEditorProps {
  link: any
}

export function LinkEditor({ link }: LinkEditorProps) {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl)
  const [title, setTitle] = useState(link.title || "")
  const [tagsInput, setTagsInput] = useState<string>((link.tags || []).join(", "))
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
  const [isEditingForm, setIsEditingForm] = useState(false)

  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://2s.ms"
  const shortUrl = `${baseUrl.replace(/^https?:\/\//, "")}/l/${link.shortCode}`
  const formattedCreated = link.createdAt
    ? new Date(link.createdAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " GMT+1"
    : "March 11, 2025 10:59 AM GMT+1"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`https://${shortUrl}`)
    setCopied(true)
    toast.success("Short link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateShortLink(link.id, {
        originalUrl,
        title: title || null,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        password: usePassword ? (password || undefined) : null,
        expiresAt: useExpiration && expiresAt ? expiresAt : null,
        isActive,
      })
      toast.success("Link updated")
      setIsEditingForm(false)
      router.refresh()
    } catch (err: any) {
      toast.error(`Error saving: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteShortLink(link.id)
      toast.success("Link deleted")
      router.push("/dashboard/links")
    } catch {
      toast.error("Failed to delete link")
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full max-w-[1240px] mx-auto space-y-6 p-6 font-mono">
      {/* Bitly Header Row (Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/links">
            <button className="p-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <ChevronRightCircle className="w-5 h-5 text-muted-foreground shrink-0" />
            <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
              {title || "Reminderly - Your Ultimate Reminder Service"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setIsEditingForm(!isEditingForm)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md">
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <button onClick={() => setIsEditingForm(!isEditingForm)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md">
            <Edit2 className="w-4 h-4" />
          </button>

          <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-4 font-mono text-xs font-bold gap-1.5 border-border rounded-lg">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 text-xs text-destructive hover:bg-destructive/10">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete link?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Any shared URLs using this short code will stop working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {isDeleting ? "Deleting..." : "Delete Link"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Layout: Flex Row with 100% matching card widths (Image 1) */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* Left Column (Details, Dynamic Routing, Analytics) - All cards 100% same width */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Details Card */}
          <div className="w-full p-6 rounded-2xl border border-border bg-card space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Details</h2>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Short link</span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://${shortUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {shortUrl}
                </a>
                <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Destination</span>
              <div className="text-xs text-foreground flex items-center gap-1 truncate">
                <span className="text-muted-foreground font-bold">↳</span>
                <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                  {originalUrl}
                </a>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Tags</span>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" />
                {link.tags && link.tags.length > 0 ? (
                  <span>{link.tags.join(", ")}</span>
                ) : (
                  <span>No tags</span>
                )}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground">Created on</span>
              <div className="text-xs text-foreground">{formattedCreated}</div>
            </div>
          </div>

          {/* Dynamic Routing Card */}
          <div className="w-full p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Dynamic routing</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  New!
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                Automatically route visitors to different destinations based on device, location, and more.
              </p>
            </div>
            <Button
              onClick={() => setIsEditingForm(!isEditingForm)}
              variant="outline"
              size="sm"
              className="font-mono text-xs font-bold shrink-0 gap-1 rounded-lg border-border"
            >
              <Plus className="w-3.5 h-3.5" /> Add rules
            </Button>
          </div>

          {/* Edit Form Drawer */}
          {isEditingForm && (
            <div className="w-full p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4">
              <h3 className="font-bold text-sm text-foreground">Edit Link Target</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 font-mono text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Destination URL</Label>
                  <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} className="h-9 font-mono text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Tags (comma-separated)</Label>
                  <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="h-9 font-mono text-xs" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label className="text-xs font-semibold">Active Status</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="font-mono text-xs font-bold">
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingForm(false)} className="font-mono text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Analytics Card */}
          <div className="w-full p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-foreground">Analytics</h2>

              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-mono font-semibold gap-1.5 border-border rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Jul 10, 2026 &rarr; Aug 8, 2026
                </Button>
                <div className="relative">
                  <select className="h-9 px-3 pr-8 rounded-lg border border-border bg-background text-xs font-mono font-semibold text-foreground focus:outline-none appearance-none cursor-pointer">
                    <option>No comparison</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 border-border rounded-lg text-muted-foreground hover:text-foreground">
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <div className="text-[11px] text-muted-foreground font-semibold">Total engagements</div>
                <div className="text-2xl font-bold text-foreground">{(link.clickCount || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <div className="text-[11px] text-muted-foreground font-semibold">Engagements (Jul 10 – Aug 8, 2026)</div>
                <div className="text-2xl font-bold text-foreground">{(link.clickCount || 0).toLocaleString()}</div>
              </div>
            </div>

            <LinkAnalyticsPanel linkId={link.id} />
          </div>
        </div>

        {/* Right Column Sidebar Cards (Fixed 340px width matching Image 1) */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
          {/* QR Code Box */}
          <div className="w-full p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">QR Code</h2>
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="p-1 hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                <button className="p-1 hover:text-foreground"><Download className="w-4 h-4" /></button>
              </div>
            </div>
            <QrCodeCard url={`https://${shortUrl}`} fileName={`cuttly-${link.shortCode}`} />
          </div>

          {/* Cuttly Pages Box */}
          <div className="w-full p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Cuttly Pages</h2>
              <Link href="/dashboard/bio" className="text-xs text-primary font-bold hover:underline">
                + Add to a page
              </Link>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-center text-xs text-muted-foreground">
              Not on any pages yet
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
