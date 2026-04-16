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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-[url('https://discbot.io/grid.png')] bg-repeat"
      style={{ backgroundColor: theme.background }}
    >
      <div className="w-full max-w-md space-y-12">
        {/* Profile Header */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2" />
            <Avatar className="h-32 w-32 border-4 border-primary relative z-10 rounded-none bg-background">
              <AvatarFallback 
                style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                className="text-4xl font-black italic rounded-none"
              >
                {page.title?.slice(0, 2).toUpperCase() || "LF"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-2">
            <h1 
              className="text-4xl font-black uppercase tracking-tighter italic"
              style={{ color: theme.text }}
            >
              {page.title || "Bio Page"}
            </h1>
            {page.description && (
              <p 
                className="text-xs font-mono uppercase tracking-[0.2em] opacity-60"
                style={{ color: theme.text }}
              >
                {page.description}
              </p>
            )}
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-6">
          {visibleBlocks.map((block) => (
            <PublicBlock 
              key={block.id} 
              block={block} 
              theme={theme}
              pageId={page.id}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="pt-12 text-center">
          <div className="inline-block border-2 border-primary px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-background">
            <span style={{ color: theme.text }}>POWERED_BY_LINKFORGE</span>
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
  pageId,
}: { 
  block: any
  theme: any
  pageId: string
}) {
  const baseButtonStyle = {
    backgroundColor: theme.accent,
    color: '#ffffff',
  }

  switch (block.type) {
    case "link": {
      const content = block.content
      return (
        <LinkTracker blockId={block.id} url={content.url || "#"}>
          <div
            className="group relative"
          >
            <div className="absolute inset-0 bg-primary translate-x-1.5 translate-y-1.5" />
            <div
              className="relative z-10 flex items-center justify-between border-4 border-primary p-5 bg-background transition-transform active:translate-x-1 active:translate-y-1"
            >
              <span className="font-black uppercase italic tracking-tight">{content.title || "Link"}</span>
              <ExternalLink className="h-5 w-5" />
            </div>
          </div>
        </LinkTracker>
      )
    }

    case "header": {
      const content = block.content
      const sizeClasses = {
        small: "text-lg",
        medium: "text-2xl",
        large: "text-4xl",
      }
      return (
        <h2 
          className={`font-black uppercase italic text-center py-4 tracking-tighter ${sizeClasses[content.size as keyof typeof sizeClasses || "medium"]}`}
          style={{ color: theme.text }}
        >
          {content.text || "Header"}
        </h2>
      )
    }

    case "text": {
      const content = block.content
      return (
        <p 
          className="text-xs font-mono uppercase tracking-widest text-center py-4 opacity-70"
          style={{ color: theme.text }}
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
          <div className="group relative">
            <div className="absolute inset-0 bg-primary translate-x-1 translate-y-1" />
            <div
              className="relative z-10 flex items-center justify-center border-4 border-primary p-5 bg-background transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Icon className="h-6 w-6" />
              <span className="ml-3 font-black uppercase italic tracking-tight">{content.platform}</span>
            </div>
          </div>
        </LinkTracker>
      )
    }

    case "email-capture": {
      const content = block.content
      return (
        <EmailCaptureForm 
          pageId={pageId}
          title={content.title}
          placeholder={content.placeholder}
          buttonText={content.button_text}
          theme={theme}
        />
      )
    }

    case "divider":
      return (
        <div className="py-4">
          <div 
            className="h-1 bg-primary"
            style={{ opacity: 0.2 }}
          />
        </div>
      )

    default:
      return null
  }
}
