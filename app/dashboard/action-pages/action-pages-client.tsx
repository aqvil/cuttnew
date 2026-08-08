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
  Zap,
  Sparkles,
  TrendingUp,
  Globe,
  Share2,
  Video,
  MousePointerClick,
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
      toast.success("Action Page created successfully!")
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
    toast.success("Action Page URL copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="dash-narrow space-y-8">
      {/* Hero Header */}
      <div className="dash-hero relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-border p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <div className="dash-kicker text-primary bg-primary/10 border-primary/20">
              <Sparkles className="size-3.5" /> High-Converting Landing Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Action Pages
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Create up to 20 customizable high-converting landing pages with video embeds, lead forms, and instant call-to-action buttons.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="btn-primary gap-2 shadow-lg hover:shadow-xl transition-all font-semibold">
                <Plus className="size-5" />
                New Action Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Zap className="size-5 text-primary" /> Create Action Page
                </DialogTitle>
                <DialogDescription>
                  Design a dynamic landing page tailored for maximum conversion.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Page Title <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. Exclusive Product Launch 2026"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                    }}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">URL Slug <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-2 rounded-md border border-border">/a/</span>
                    <Input
                      placeholder="product-launch"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subtitle / Description</Label>
                  <Textarea
                    placeholder="Briefly describe what users will get on this page..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Hero Banner Image URL</Label>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Video Embed URL (YouTube/Vimeo)</Label>
                    <Input
                      placeholder="https://www.youtube.com/embed/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">CTA Button Label</Label>
                    <Input
                      placeholder="Get Started Now"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">CTA Target URL</Label>
                    <Input
                      placeholder="https://example.com/checkout"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating} className="btn-primary">
                    {isCreating ? "Publishing..." : "Publish Action Page"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" /> Active Pages
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{pages.length} <span className="text-xs text-muted-foreground font-normal">/ 20</span></p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="size-3.5 text-blue-500" /> Total Page Views
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">{totalViews.toLocaleString()}</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MousePointerClick className="size-3.5 text-emerald-500" /> Conversion Rate
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">18.4%</p>
        </div>
        <div className="dash-panel p-5 bg-card rounded-xl border border-border">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-amber-500" /> Page Capacity
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2">Unlimited</p>
        </div>
      </div>

      {/* Action Pages Grid List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Published Action Pages
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((p: any) => {
            const pageUrl = `${baseUrl}/a/${p.slug}`
            return (
              <div
                key={p.id}
                className="group relative bg-card border border-border hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Zap className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">/a/{p.slug}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete page"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Eye className="size-3.5 text-primary" />
                    {(p.viewsCount || 0).toLocaleString()} views
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(p.slug, p.id)}
                      title="Copy Link"
                    >
                      {copiedId === p.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </Button>

                    <SocialShareModal url={pageUrl} title={p.title} />

                    <a
                      href={pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      Visit <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}

          {pages.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
              <Layers className="size-12 text-muted-foreground/40 mx-auto mb-3 animate-float" />
              <h3 className="text-lg font-bold text-foreground">No Action Pages Created Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Create dynamic, mobile-optimized landing pages with videos, call-to-actions, and lead generation in under 60 seconds.
              </p>
              <Button onClick={() => setIsOpen(true)} className="btn-primary mt-6 gap-2">
                <Plus className="size-4" /> Create First Action Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
