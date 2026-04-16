import { db } from "@/lib/db"
import { bioPages, bioBlocks, pageViews } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Metadata } from "next"
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Github,
  Twitch,
  ExternalLink,
} from "lucide-react"
import { EmailCaptureForm } from "@/components/bio/email-capture-form"
import { LinkTracker } from "@/components/bio/link-tracker"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  const page = await db.query.bioPages.findFirst({
    where: and(eq(bioPages.slug, slug), eq(bioPages.isPublished, true)),
  })

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: page.seoTitle || page.title || "Bio Page",
    description: page.seoDescription || page.description || "Check out my bio page",
  }
}

export default async function PublicBioPage({ params }: PageProps) {
  const { slug } = await params

  const page = await db.query.bioPages.findFirst({
    where: and(eq(bioPages.slug, slug), eq(bioPages.isPublished, true)),
  })

  if (!page) {
    notFound()
  }

  const blocks = await db.query.bioBlocks.findMany({
    where: and(eq(bioBlocks.pageId, page.id), eq(bioBlocks.isVisible, true)),
    orderBy: [asc(bioBlocks.position)],
  })

  const theme = page.theme as any
  const visibleBlocks = blocks || []

  // Record page view (fire and forget)
  db.insert(pageViews).values({
    pageId: page.id,
  }).catch(err => console.error("Page view record error:", err))

  const getTextColor = (color: string) => {
    // Simple contrast check
    if (!color) return '#000000'
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) || 0
    const g = parseInt(hex.substr(2, 2), 16) || 0
    const b = parseInt(hex.substr(4, 2), 16) || 0
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  const buttonStyle = {
    backgroundColor: theme?.accent || '#1d4ed8',
    color: getTextColor(theme?.accent || '#1d4ed8'),
  }

  const pageBg = theme?.background || '#f4f6fb'
  const pageText = theme?.text || '#0f1728'

  return (
    <div 
      className="min-h-screen font-sans"
      style={{ backgroundColor: pageBg }}
    >
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <Avatar className="h-24 w-24 mx-auto shadow-md">
              <AvatarFallback 
                style={buttonStyle}
                className="text-3xl font-semibold"
              >
                {page.title?.slice(0, 2).toUpperCase() || "LF"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 
                className="text-2xl font-bold tracking-tight"
                style={{ color: pageText }}
              >
                {page.title || "Your Name"}
              </h1>
              {page.description && (
                <p 
                  className="text-base mt-2 opacity-80 max-w-md mx-auto"
                  style={{ color: pageText }}
                >
                  {page.description}
                </p>
              )}
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-4 pt-4">
            {visibleBlocks.length === 0 ? (
              <p 
                className="text-center text-sm opacity-50 py-8"
                style={{ color: pageText }}
              >
                No visible blocks
              </p>
            ) : (
              visibleBlocks.map((block) => (
                <PublicBlock 
                  key={block.id} 
                  block={block} 
                  theme={theme}
                  buttonStyle={buttonStyle}
                  pageId={page.id}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-12 text-center">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity opacity-50">
              <span className="text-xs font-semibold" style={{ color: pageText }}>Powered by</span>
              <span className="text-sm font-bold tracking-tight" style={{ color: pageText }}>LinkForge</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const socialIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
}

function PublicBlock({ 
  block, 
  theme,
  buttonStyle,
  pageId,
}: { 
  block: any
  theme: any
  buttonStyle: any
  pageId: string
}) {
  const pageText = theme?.text || '#0f1728'

  switch (block.type) {
    case "link": {
      const content = block.content
      return (
        <LinkTracker blockId={block.id} url={content.url || "#"}>
          <div
            className="flex items-center justify-center relative w-full rounded-xl p-4 transition-transform hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer"
            style={buttonStyle}
          >
            <span className="font-semibold text-center text-lg">{content.title || "Link"}</span>
          </div>
        </LinkTracker>
      )
    }

    case "header": {
      const content = block.content
      const sizeClasses = {
        small: "text-lg",
        medium: "text-2xl",
        large: "text-3xl",
      }
      return (
        <h2 
          className={`font-bold text-center py-4 tracking-tight ${sizeClasses[content.size as keyof typeof sizeClasses || "medium"]}`}
          style={{ color: pageText }}
        >
          {content.text || "Header"}
        </h2>
      )
    }

    case "text": {
      const content = block.content
      return (
        <p 
          className="text-base text-center py-2 opacity-90"
          style={{ color: pageText }}
        >
          {content.text || "Text content"}
        </p>
      )
    }

    case "social": {
      const content = block.content
      const Icon = socialIcons[content.platform] || ExternalLink
      return (
        <LinkTracker blockId={block.id} url={content.url || "#"}>
          <div
            className="flex items-center justify-center w-full rounded-xl p-4 transition-transform hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer"
            style={buttonStyle}
          >
            <Icon className="h-6 w-6" />
            <span className="ml-3 font-semibold capitalize text-lg">{content.platform}</span>
          </div>
        </LinkTracker>
      )
    }

    case "email-capture": {
      const content = block.content
      return (
        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: `${theme?.accent || '#1d4ed8'}10`, borderColor: `${theme?.accent || '#1d4ed8'}20` }}>
          <p 
            className="text-lg font-bold text-center mb-4"
            style={{ color: pageText }}
          >
            {content.title || "Subscribe"}
          </p>
          <EmailCaptureForm 
            pageId={pageId}
            title={content.title}
            placeholder={content.placeholder}
            buttonText={content.button_text}
            theme={theme}
          />
        </div>
      )
    }

    case "divider":
      return (
        <div className="py-6">
          <div 
            className="h-px w-full mx-auto"
            style={{ backgroundColor: pageText, opacity: 0.15 }}
          />
        </div>
      )

    default:
      return null
  }
}
