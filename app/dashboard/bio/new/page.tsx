'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBioPage } from "@/app/actions/bio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-8 font-sans">
      <div className="flex items-center pb-6 border-b border-border">
         <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 mr-4" asChild>
          <Link href="/dashboard/bio">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create new Link-in-bio</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="card p-8">
               <h2 className="text-lg font-bold text-slate-900 mb-6">Page Details</h2>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Profile Name</Label>
                     <Input
                        id="title"
                        placeholder="Your name or brand"
                        value={title}
                        onChange={handleTitleChange}
                        className="h-12 border-slate-200 bg-white"
                     />
                     <p className="text-xs text-slate-500">This appears at the top of your Link-in-bio.</p>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">Link-in-bio URL</Label>
                     <div className="flex items-center gap-2">
                        <div className="h-12 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium whitespace-nowrap">
                           linkforge.app/p/
                        </div>
                        <Input
                           id="slug"
                           placeholder="my-awesome-bio"
                           value={slug}
                           onChange={(e) => setSlug(generateSlug(e.target.value))}
                           className="h-12 border-slate-200 bg-white flex-1"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description (optional)</Label>
                     <Textarea
                        id="description"
                        placeholder="Tell your audience what this page is about..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="border-slate-200 bg-white resize-none py-3"
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
               <div className="card p-6 shadow-sm">
                  <Button type="submit" disabled={isLoading} className="btn-primary w-full h-12 text-base">
                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Create Link-in-bio
                  </Button>
                  <Button type="button" variant="ghost" className="w-full mt-2 text-slate-500" asChild>
                     <Link href="/dashboard/bio">Cancel</Link>
                  </Button>
               </div>
            </div>
         </div>
      </form>
    </div>
  )
}
