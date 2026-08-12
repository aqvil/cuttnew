'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createActionPage, deleteActionPage } from "@/app/actions/action-pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Layers,
  Plus,
  ExternalLink,
  Eye,
  Trash2,
  Copy,
  Check,
  ArrowUpRight,
  MousePointerClick,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { SocialShareModal } from "@/components/ui/social-share-modal"

interface ActionPagesClientProps {
  initialPages: any[]
}

export function ActionPagesClient({ initialPages }: ActionPagesClientProps) {
  const [pages, setPages] = useState(initialPages)
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [ctaText, setCtaText] = useState("Get Started Now")
  const [ctaUrl, setCtaUrl] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const router = useRouter()
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  const totalViews = pages.reduce((acc, p) => acc + (p.viewsCount || 0), 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug) {
      toast.error("Title and slug are required")
      return
    }

    setIsCreating(true)
    try {
      const newPage = await createActionPage(title, slug, description, {
        heroImage,
        videoUrl,
        ctaText,
        ctaUrl,
      })
      setPages([newPage, ...pages])
      toast.success("Action Page created")
      setIsOpen(false)
      setTitle("")
      setSlug("")
      setDescription("")
      setHeroImage("")
      setVideoUrl("")
      setCtaUrl("")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to create action page")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteActionPage(id)
      setPages(pages.filter((p) => p.id !== id))
      toast.success("Action Page deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete Action Page")
    }
  }

  const handleCopy = (pageSlug: string, id: string) => {
    const url = `${baseUrl}/a/${pageSlug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="page-narrow space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="eyebrow mb-2">Action Pages</div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Landing Pages & Action Router
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl font-mono">
            High-converting customized action pages with video embeds, lead forms, and instant call-to-actions.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 bg-foreground text-background font-semibold text-xs rounded-md hover:opacity-90 transition-opacity gap-2">
              <Plus className="size-3.5" />
              New Action Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg border border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Create Action Page</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure content and publish your landing router.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Title <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Product Launch 2026"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }}
                  className="h-10 h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Slug <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-2.5 rounded-md border border-border">/a/</span>
                  <Input
                    placeholder="launch-2026"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="h-10 h-10 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Textarea
                  placeholder="Summary description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-xs font-mono border-border bg-background"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Hero Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="h-10 h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Video Embed URL</Label>
                  <Input
                    placeholder="https://youtube.com/embed/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="h-10 h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">CTA Label</Label>
                  <Input
                    placeholder="Get Started Now"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="h-10 h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">CTA Link</Label>
                  <Input
                    placeholder="https://..."
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="h-10 h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} size="sm" className="h-9 text-xs bg-foreground text-background font-semibold">
                  {isCreating ? "Publishing..." : "Publish Page"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monochrome Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Action Pages</p>
          <p className="text-2xl font-bold font-mono text-foreground">{pages.length} <span className="text-xs text-muted-foreground font-normal">/ 20</span></p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold font-mono text-foreground">{totalViews.toLocaleString()}</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Avg Conversion</p>
          <p className="text-2xl font-bold font-mono text-foreground">18.4%</p>
        </div>
        <div className="border border-border bg-card p-4 rounded-md space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Status</p>
          <p className="text-xs font-mono font-semibold text-foreground mt-2 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground" /> Operational
          </p>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground uppercase px-1">
          <span>Active Pages ({pages.length})</span>
          <span>Views</span>
        </div>

        <div className="space-y-2">
          {pages.map((p: any) => {
            const pageUrl = `${baseUrl}/a/${p.slug}`
            return (
              <div
                key={p.id}
                className="group border border-border bg-card rounded-md p-4 transition-all duration-150 hover:border-foreground/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm truncate">{p.title}</h3>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">/a/{p.slug}</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <span className="text-xs font-mono font-bold text-foreground">{(p.viewsCount || 0).toLocaleString()} views</span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(p.slug, p.id)}
                    >
                      {copiedId === p.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </Button>

                    <SocialShareModal url={pageUrl} title={p.title} />

                    <a
                      href={pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline px-2.5 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      View <ArrowUpRight className="size-3" />
                    </a>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {pages.length === 0 && (
            <div className="py-16 text-center border border-dashed border-border rounded-md bg-card">
              <Layers className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground font-mono">No Action Pages created</h3>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Create your first landing page router.</p>
              <Button onClick={() => setIsOpen(true)} size="sm" className="mt-4 h-9 px-4 text-xs font-semibold bg-foreground text-background">
                <Plus className="mr-1.5 size-3.5" /> Create Action Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
