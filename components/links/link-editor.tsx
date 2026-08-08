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
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Link2,
  BarChart2,
  QrCode as QrCodeIcon,
  SlidersHorizontal,
  Clock,
  Tag as TagIcon,
  Lock,
  Share2,
  Edit2,
  Plus,
  Globe,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { LinkAnalyticsPanel } from "@/components/links/link-analytics-panel"
import { SocialShareModal } from "@/components/ui/social-share-modal"

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

  const [iosUrl, setIosUrl] = useState(link.iosUrl || "")
  const [androidUrl, setAndroidUrl] = useState(link.androidUrl || "")
  const [deepLinkScheme, setDeepLinkScheme] = useState(link.deepLinkScheme || "")
  const [maxClicks, setMaxClicks] = useState(link.maxClicks ? String(link.maxClicks) : "")
  const [expirationUrl, setExpirationUrl] = useState(link.expirationUrl || "")

  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${baseUrl}/l/${link.shortCode}`
  const formattedCreated = link.createdAt ? new Date(link.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
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
        expirationUrl: expirationUrl || null,
        maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
        iosUrl: iosUrl || null,
        androidUrl: androidUrl || null,
        deepLinkScheme: deepLinkScheme || null,
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
    <div className="max-w-7xl mx-auto space-y-8 p-6 font-mono">
      {/* Bitly Header Row (Attachment 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/links">
            <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground truncate max-w-md">
              {title || "Untitled Link"}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingForm(!isEditingForm)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SocialShareModal url={shortUrl} title={title || "Check out this link"} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
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

      {/* Main 2-Column Bitly Layout (Attachment 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Details, Dynamic Routing & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Details</h2>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Short link</span>
              <div className="flex items-center gap-2">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {shortUrl.replace(/^https?:\/\//, "")}
                </a>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Destination</span>
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-foreground hover:underline flex items-center gap-1 truncate"
              >
                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{originalUrl}</span>
              </a>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Tags</span>
              <div className="text-xs text-muted-foreground">
                {link.tags && link.tags.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {link.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-bold text-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span>No tags</span>
                )}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Created on</span>
              <div className="text-xs text-foreground">{formattedCreated}</div>
            </div>
          </div>

          {/* Dynamic Routing Card (Bitly Style) */}
          <div className="p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Dynamic routing</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase">
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
              className="font-mono text-xs font-bold shrink-0 gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add rules
            </Button>
          </div>

          {/* Edit Form Modal/Drawer toggle */}
          {isEditingForm && (
            <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4">
              <h3 className="font-bold text-sm text-foreground">Edit Link Target & Rules</h3>
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

          {/* Analytics Section */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Analytics</h2>
            </div>
            <LinkAnalyticsPanel linkId={link.id} />
          </div>
        </div>

        {/* Right 1 Column: QR Code & Bio Pages cards (Bitly Attachment 4) */}
        <div className="lg:col-span-1 space-y-6">
          {/* QR Code Card */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">QR Code</h2>
            </div>
            <QrCodeCard url={shortUrl} fileName={`cuttly-${link.shortCode}`} />
          </div>

          {/* Cuttly Pages Card */}
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Bio Pages</h2>
              <Link href="/dashboard/bio" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                + Add to a page
              </Link>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-center text-xs text-muted-foreground">
              Not on any pages yet
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
