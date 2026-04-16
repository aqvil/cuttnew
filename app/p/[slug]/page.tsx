import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BioBlock, BioPageTheme, LinkBlockContent, HeaderBlockContent, TextBlockContent, SocialBlockContent, EmailCaptureBlockContent } from "@/lib/types/database"
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
  const supabase = await createClient()
  
  const { data: page } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: page.seo_title || page.title || "Bio Page",
    description: page.seo_description || page.description || "Check out my bio page",
  }
}

export default async function PublicBioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !page) {
    notFound()
  }

  const { data: blocks } = await supabase
    .from("bio_blocks")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("position", { ascending: true })

  const theme = page.theme as BioPageTheme
  const visibleBlocks = blocks || []

  // Record page view (fire and forget)
  supabase.from("page_views").insert({
    page_id: page.id,
  })

  const getTextColor = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  const buttonStyle = {
    backgroundColor: theme.accent,
    color: getTextColor(theme.accent),
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: theme.background }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-3">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarFallback 
              style={{ backgroundColor: theme.accent, color: getTextColor(theme.accent) }}
              className="text-2xl font-semibold"
            >
              {page.title?.slice(0, 2).toUpperCase() || "LF"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: theme.text }}
            >
              {page.title || "Bio Page"}
            </h1>
            {page.description && (
              <p 
                className="text-base mt-2 opacity-80"
                style={{ color: theme.text }}
              >
                {page.description}
              </p>
            )}
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {visibleBlocks.map((block) => (
            <PublicBlock 
              key={block.id} 
              block={block as BioBlock} 
              theme={theme}
              buttonStyle={buttonStyle}
              pageId={page.id}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="pt-6 text-center">
          <a 
            href="/"
            className="text-xs opacity-50 hover:opacity-70 transition-opacity"
            style={{ color: theme.text }}
          >
            Powered by LinkForge
          </a>
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
  block: BioBlock
  theme: BioPageTheme
  buttonStyle: React.CSSProperties
  pageId: string
}) {
  switch (block.type) {
    case "link": {
      const content = block.content as LinkBlockContent
      return (
        <LinkTracker blockId={block.id} url={content.url || "#"}>
          <div
            className="flex items-center justify-between rounded-xl p-4 transition-transform hover:scale-[1.02] cursor-pointer"
            style={buttonStyle}
          >
            <span className="font-medium">{content.title || "Link"}</span>
            <ExternalLink className="h-4 w-4 opacity-70" />
          </div>
        </LinkTracker>
      )
    }

    case "header": {
      const content = block.content as HeaderBlockContent
      const sizeClasses = {
        small: "text-base",
        medium: "text-xl",
        large: "text-2xl",
      }
      return (
        <h2 
          className={`font-bold text-center py-2 ${sizeClasses[content.size || "medium"]}`}
          style={{ color: theme.text }}
        >
          {content.text || "Header"}
        </h2>
      )
    }

    case "text": {
      const content = block.content as TextBlockContent
      return (
        <p 
          className="text-base text-center py-2"
          style={{ color: theme.text }}
        >
          {content.text || "Text content"}
        </p>
      )
    }

    case "social": {
      const content = block.content as SocialBlockContent
      const Icon = socialIcons[content.platform] || ExternalLink
      return (
        <LinkTracker blockId={block.id} url={content.url || "#"}>
          <div
            className="flex items-center justify-center rounded-xl p-4 transition-transform hover:scale-[1.02] cursor-pointer"
            style={buttonStyle}
          >
            <Icon className="h-5 w-5" />
            <span className="ml-2 font-medium capitalize">{content.platform}</span>
          </div>
        </LinkTracker>
      )
    }

    case "email-capture": {
      const content = block.content as EmailCaptureBlockContent
      return (
        <EmailCaptureForm 
          pageId={pageId}
          title={content.title}
          placeholder={content.placeholder}
          buttonText={content.button_text}
          theme={theme}
          buttonStyle={buttonStyle}
        />
      )
    }

    case "divider":
      return (
        <hr 
          className="my-4 border-t"
          style={{ borderColor: `${theme.text}20` }}
        />
      )

    default:
      return null
  }
}
