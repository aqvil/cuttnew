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
  QrCode,
  SlidersHorizontal,
  Clock,
  Tag as TagIcon,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { LinkAnalyticsPanel } from "@/components/links/link-analytics-panel"
import { SocialShareModal } from "@/components/ui/social-share-modal"
import { formatDistanceToNow } from "date-fns"

type Tab = "details" | "analytics" | "qr"

interface LinkEditorProps {
  link: any
}

export function LinkEditor({ link }: LinkEditorProps) {
  const [tab, setTab] = useState<Tab>("details")
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
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shortUrl = `${baseUrl}/l/${link.shortCode}`

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const [iosUrl, setIosUrl] = useState(link.iosUrl || "")
  const [androidUrl, setAndroidUrl] = useState(link.androidUrl || "")
  const [deepLinkScheme, setDeepLinkScheme] = useState(link.deepLinkScheme || "")
  const [maxClicks, setMaxClicks] = useState(link.maxClicks ? String(link.maxClicks) : "")
  const [expirationUrl, setExpirationUrl] = useState(link.expirationUrl || "")
  const [rotationUrl, setRotationUrl] = useState(
    Array.isArray(link.rotationUrls) && link.rotationUrls.length > 0 ? link.rotationUrls[0]?.url || "" : ""
  )

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
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
        rotationUrls: rotationUrl ? [{ url: rotationUrl, weight: 50 }] : [],
        isActive,
      })
      toast.success("Link updated")
      router.refresh()
    } catch (err: any) {
      setError(`Error saving: ${err.message}`)
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

  const tabs: { id: Tab; label: string; icon: typeof BarChart2 }[] = [
    { id: "details",   label: "Details",   icon: SlidersHorizontal },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "qr",        label: "QR Code",   icon: QrCode },
  ]

  return (
    <div className="dash-narrow">
      {/* Hero header */}
      <div className="dash-hero">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 size-9 text-muted-foreground hover:bg-muted"
          asChild
        >
          <Link href="/dashboard/links">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete link?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Any shared URLs using this short code will stop working.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col items-center gap-3">
          <div className="dash-kicker">
            <Link2 className="size-3.5" />
            Short link
          </div>
          <h1 className="dash-title">{link.title || "Untitled Link"}</h1>

          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {isExpired ? (
              <span className="badge-expired flex items-center gap-1.5">
                <Clock className="size-3" /> Expired
              </span>
            ) : isActive ? (
              <span className="badge-active flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground" /> Active
              </span>
            ) : (
              <span className="badge-archived">Inactive</span>
            )}
            {link.password && (
              <span className="badge-password flex items-center gap-1.5">
                <Lock className="size-3" /> Protected
              </span>
            )}
            {(link.tags || []).slice(0, 3).map((t: string) => (
              <span key={t} className="tag-pill"><TagIcon className="size-3" />{t}</span>
            ))}
          </div>

          {/* Short URL row */}
          <div className="flex items-center gap-2 mt-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:underline flex items-center gap-1.5"
            >
              {shortUrl.replace(/^https?:\/\//, "")}
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
            <SocialShareModal url={shortUrl} title={link.title || "Check out this link"} />
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            Created {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
            {" · "}
            {(link.clickCount || 0).toLocaleString()} clicks
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit shadow-[var(--shadow-card)]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 ${
              tab === id
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "details" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Destination */}
            <div className="dash-panel p-6">
              <h2 className="dash-panel-title mb-5">Destination</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Destination URL <span className="text-destructive">*</span></Label>
                  <Input
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="dash-field"
                    placeholder="https://example.com/very-long-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="dash-field"
                    placeholder="e.g. Fall Campaign"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tags</Label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="dash-field"
                    placeholder="marketing, social, launch"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                </div>
              </div>
            </div>

            {/* Access & Routing */}
            <div className="dash-panel p-6">
              <h2 className="dash-panel-title mb-5">Access & Routing</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Active</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Disabled links show an error page.</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <div className="border-t border-border pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Password Protection</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Require a password to redirect.</p>
                    </div>
                    <Switch checked={usePassword} onCheckedChange={setUsePassword} />
                  </div>
                  {usePassword && (
                    <div className="mt-4 bg-background border border-border rounded-md p-4">
                      <Label className="text-sm font-semibold">Password</Label>
                      <Input
                        type="password"
                        placeholder={link.password ? "Leave blank to keep current password" : "Enter password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="dash-field mt-2"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Link Expiration</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Auto-disable or redirect after date or max clicks.</p>
                    </div>
                    <Switch checked={useExpiration} onCheckedChange={setUseExpiration} />
                  </div>
                  {useExpiration && (
                    <div className="mt-4 bg-background border border-border rounded-md p-4 space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">Expiration Date</Label>
                        <Input
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="dash-field mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Max Click Limit</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 1000"
                          value={maxClicks}
                          onChange={(e) => setMaxClicks(e.target.value)}
                          className="dash-field mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Expiration Redirect URL</Label>
                        <Input
                          type="url"
                          placeholder="https://example.com/expired-landing"
                          value={expirationUrl}
                          onChange={(e) => setExpirationUrl(e.target.value)}
                          className="dash-field mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile & Deep Links */}
                <div className="border-t border-border pt-5 space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Mobile & Deep Links</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Target iOS, Android, or custom App Schemes dynamically.</p>
                  </div>
                  <div className="grid gap-3 bg-background border border-border rounded-md p-4">
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">iOS Target URL</Label>
                      <Input
                        type="url"
                        placeholder="https://apps.apple.com/app/id123"
                        value={iosUrl}
                        onChange={(e) => setIosUrl(e.target.value)}
                        className="dash-field mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Android Target URL</Label>
                      <Input
                        type="url"
                        placeholder="https://play.google.com/store/apps/details?id=com.app"
                        value={androidUrl}
                        onChange={(e) => setAndroidUrl(e.target.value)}
                        className="dash-field mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Deep Link Scheme URI</Label>
                      <Input
                        type="text"
                        placeholder="myapp://path/to/content"
                        value={deepLinkScheme}
                        onChange={(e) => setDeepLinkScheme(e.target.value)}
                        className="dash-field mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Link Rotation (A/B Testing) */}
                <div className="border-t border-border pt-5 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">Link Rotation (%) — A/B Test</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Rotate traffic between target URLs.</p>
                  </div>
                  <div className="bg-background border border-border rounded-md p-4">
                    <Label className="text-xs font-semibold text-muted-foreground">Alternative Target URL B (50% Split)</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/variant-b"
                      value={rotationUrl}
                      onChange={(e) => setRotationUrl(e.target.value)}
                      className="dash-field mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="dash-panel p-5 sticky top-24">
              <Button className="btn-primary w-full h-11" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
              <div className="mt-4 rounded-md bg-background border border-border p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Short URL</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate flex-1">{shortUrl.replace(/^https?:\/\//, "")}</span>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopy}>
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold tabular-nums">{(link.clickCount || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold capitalize">{isExpired ? "Expired" : isActive ? "Active" : "Off"}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <LinkAnalyticsPanel linkId={link.id} />
      )}

      {tab === "qr" && (
        <div className="max-w-md">
          <div className="dash-panel p-6">
            <div className="mb-4">
              <h2 className="dash-panel-title">QR Code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Download and print, embed in presentations, or share digitally.
              </p>
            </div>
            <QrCodeCard url={shortUrl} fileName={`cuttly-${link.shortCode}`} />
            <div className="mt-4 rounded-md bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Encodes: <span className="font-mono font-medium text-foreground">{shortUrl}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
