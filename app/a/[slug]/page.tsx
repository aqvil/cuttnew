import { db } from "@/lib/db"
import { actionPages, actionPageViews } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import crypto from "crypto"
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export default async function PublicActionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let page: any = null

  try {
    page = await db.query.actionPages.findFirst({
      where: eq(actionPages.slug, slug),
    })
  } catch (err) {
    console.error("Fetch action page error:", err)
  }

  if (!page || !page.isActive) {
    notFound()
  }

  // Record view
  await db.insert(actionPageViews).values({
    actionPageId: page.id,
    ipHash: crypto.randomBytes(8).toString("hex"),
  }).catch((err) => console.error("Action page view log error:", err))

  await db.update(actionPages)
    .set({ viewsCount: (page.viewsCount || 0) + 1 })
    .where(eq(actionPages.id, page.id))
    .catch((err) => console.error("Update views count error:", err))

  const content: any = page.content || {}

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl w-full text-center space-y-8 bg-[#121215]/90 border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl backdrop-blur-xl relative z-10 animate-fade-in-up">
        {/* Kicker badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80 tracking-wide uppercase">
          <Zap className="size-3.5 text-amber-400" /> Featured Action Page
        </div>

        {content.heroImage && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.heroImage}
              alt={page.title}
              className="w-full max-h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-white/70 text-base sm:text-xl max-w-xl mx-auto font-normal leading-relaxed">
              {page.description}
            </p>
          )}
        </div>

        {content.videoUrl && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <iframe
              src={content.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Feature Highlights Pill Bar */}
        <div className="flex items-center justify-center gap-6 text-xs text-white/60 pt-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 text-emerald-400" /> Instant Access
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-blue-400" /> Verified Secure Link
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-4 text-purple-400" /> Premium Content
          </span>
        </div>

        {content.ctaUrl && (
          <div className="pt-4">
            <a
              href={content.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black font-extrabold text-lg rounded-2xl hover:bg-white/90 transition-all shadow-2xl hover:scale-105 active:scale-95 group"
            >
              <span>{content.ctaText || "Get Started Now"}</span>
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}

        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>Powered by Cuttly</span>
          <span>Verified Page</span>
        </div>
      </div>
    </div>
  )
}
