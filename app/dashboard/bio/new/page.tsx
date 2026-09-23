'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBioPage } from "@/app/actions/bio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, SlidersHorizontal } from "lucide-react"
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
        title: title || "Untitled bio page",
        slug: finalSlug,
        description,
      })

      toast.success("Bio page created successfully")
      router.push(`/dashboard/bio/${page.id}`)
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        setError("This slug is already taken. Please choose another one.")
      } else {
        setError(`Error creating page: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-narrow">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/dashboard/bio">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to bio pages
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="h1">Create a bio page</h1>
        <p className="lede mt-2">Use this when one short link should open a page of many destinations.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="surface p-6 sm:p-8">
               <div className="mb-6">
                  <h2 className="h3">1. Page identity</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Name the page and reserve the public URL. Links and design come next.</p>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label htmlFor="title">Profile Name</Label>
                     <Input
                        id="title"
                        placeholder="Your name or brand"
                        value={title}
                        onChange={handleTitleChange}
                        className="h-10"
                     />
                     <p className="text-xs text-muted-foreground">This appears at the top of your bio page.</p>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="slug">Public bio URL</Label>
                     <div className="flex items-center gap-2">
                        <div className="h-10 px-3 flex items-center bg-subtle border border-border rounded-md text-muted-foreground font-mono text-[13px] whitespace-nowrap">
                           {(process.env.NEXT_PUBLIC_APP_URL || "").replace(/^https?:\/\//, "") || "cuttly.io"}/p/
                        </div>
                        <Input
                           id="slug"
                           placeholder="my-awesome-bio"
                           value={slug}
                           onChange={(e) => setSlug(generateSlug(e.target.value))}
                           className="h-10 flex-1 font-mono text-[13px]"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="description">Description (optional)</Label>
                     <Textarea
                        id="description"
                        placeholder="Tell your audience what this page is about..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="border-border bg-background resize-none py-3"
                     />
                  </div>
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
               <div className="surface p-6">
                  <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <SlidersHorizontal className="size-4" />
                     2. Create page
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 text-base">
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Create bio page
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2 text-muted-foreground" asChild>
                     <Link href="/dashboard/bio">Cancel</Link>
                  </Button>
               </div>
            </div>
         </div>
      </form>
    </div>
  )
}
