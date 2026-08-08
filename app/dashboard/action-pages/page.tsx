import { getActionPages } from "@/app/actions/action-pages"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Layers, Plus, ExternalLink, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ActionPagesDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const pages = await getActionPages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Action Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create up to 20 customizable high-converting landing action pages.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create Action Page
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((ap: any) => (
          <div key={ap.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-foreground text-base">{ap.title}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">/a/{ap.slug}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Eye className="size-3.5" /> {(ap.viewsCount || 0).toLocaleString()} views
              </span>
              <a
                href={`/a/${ap.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Preview <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
            <Layers className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-semibold text-foreground">No Action Pages created</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Build custom high-converting action landing pages with video embeds, CTA buttons, and lead forms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
