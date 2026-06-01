'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBioPage } from "@/app/actions/bio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, LayoutTemplate, SlidersHorizontal } from "lucide-react"
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
        title: title || "Untitled Link-in-bio",
        slug: finalSlug,
        description,
      })

      toast.success("Link-in-bio created successfully")
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
    <div className="dash-narrow font-sans">
      <div className="dash-hero flex items-center gap-4">
         <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" asChild>
          <Link href="/dashboard/bio">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="dash-kicker mb-3">
            <LayoutTemplate className="size-3.5" />
            New profile page
          </div>
          <h1 className="dash-title">Create new Link-in-bio</h1>
          <p className="dash-subtitle">Set the identity and public URL first. You can tune the design on the next screen.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="dash-panel p-6 sm:p-8">
               <h2 className="dash-panel-title mb-6">Page Details</h2>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label htmlFor="title" className="text-sm font-semibold text-foreground">Profile Name</Label>
                     <Input
                        id="title"
                        placeholder="Your name or brand"
                        value={title}
                        onChange={handleTitleChange}
                        className="dash-field"
                     />
                     <p className="text-xs text-muted-foreground">This appears at the top of your Link-in-bio.</p>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="slug" className="text-sm font-semibold text-foreground">Link-in-bio URL</Label>
                     <div className="flex items-center gap-2">
                        <div className="h-12 px-4 flex items-center bg-background border border-border rounded-md text-muted-foreground font-medium whitespace-nowrap">
                           linkforge.app/p/
                        </div>
                        <Input
                           id="slug"
                           placeholder="my-awesome-bio"
                           value={slug}
                           onChange={(e) => setSlug(generateSlug(e.target.value))}
                           className="dash-field flex-1"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description (optional)</Label>
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
               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                  {error}
               </div>
            )}
         </div>

         <div className="lg:col-span-1">
            <div className="sticky top-24">
               <div className="dash-panel p-6">
                  <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <SlidersHorizontal className="size-4" />
                    Page setup
                  </div>
                  <Button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base">
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Create Link-in-bio
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
