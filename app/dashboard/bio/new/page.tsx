'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBioPage } from "@/app/actions/bio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewBioPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const finalSlug = slug || generateSlug(title) || `page-${Date.now()}`
      const page = await createBioPage({
        title: title || "UNTITLED",
        slug: finalSlug,
        description,
      })

      toast.success("Sector initialized")
      router.push(`/dashboard/bio/${page.id}`)
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
          <Link href="/dashboard/bio">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Initialize Bio</h1>
          <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">New Entity Sequence // Sector: Alpha</p>
        </div>
      </div>

      <div className="card-mono">
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase italic italic tracking-tight">Entity Configuration</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Input baseline parameters</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest leading-none">Page Title</Label>
            <Input
              id="title"
              placeholder="MY AWESOME BIO"
              value={title}
              onChange={handleTitleChange}
              className="border-2 border-primary bg-background font-bold h-12 uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest leading-none">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold">/P/</span>
              <Input
                id="slug"
                placeholder="MY-AWESOME-BIO"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="border-2 border-primary bg-background font-bold h-12 uppercase"
              />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-2">
              PUBLIC_PATH: LINKFORGE.APP/P/{slug || "YOUR-SLUG"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest leading-none">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="EXPLAIN THE ENTITY PURPOSE..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-2 border-primary bg-background font-bold rounded-none uppercase"
            />
          </div>

          {error && (
            <div className="border-2 border-destructive p-4 bg-destructive/10">
              <p className="text-[10px] font-mono uppercase text-destructive font-black tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="btn-mono">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize Segment
            </Button>
            <Button type="button" variant="outline" className="border-2 border-border hover:border-primary px-6 py-2 uppercase font-black tracking-widest text-xs" asChild>
              <Link href="/dashboard/bio">Abort</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
