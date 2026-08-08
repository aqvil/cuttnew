import { db } from "@/lib/db"
import { actionPages, actionPageViews } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import crypto from "crypto"

export default async function PublicActionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await db.query.actionPages.findFirst({
    where: eq(actionPages.slug, slug),
  })

  if (!page || !page.isActive) {
    notFound()
  }

  // Record view
  await db.insert(actionPageViews).values({
    actionPageId: page.id,
    ipHash: crypto.randomBytes(8).toString("hex"),
  }).catch(err => console.error("Action page view log error:", err))

  await db.update(actionPages)
    .set({ viewsCount: (page.viewsCount || 0) + 1 })
    .where(eq(actionPages.id, page.id))
    .catch(err => console.error("Update views count error:", err))

  const content: any = page.content || {}

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-2xl">
        {content.heroImage && (
          <img
            src={content.heroImage}
            alt={page.title}
            className="w-full max-h-64 object-cover rounded-xl"
          />
        )}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              {page.description}
            </p>
          )}
        </div>

        {content.videoUrl && (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-black">
            <iframe
              src={content.videoUrl}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        {content.ctaUrl && (
          <div className="pt-4">
            <a
              href={content.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              {content.ctaText || "Get Started Now"}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
