'use client'

import { BioBlock, BioPageTheme, LinkBlockContent, HeaderBlockContent, TextBlockContent, SocialBlockContent, EmailCaptureBlockContent } from "@/lib/types/database"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Github,
  Twitch,
  ExternalLink,
} from "lucide-react"

interface BioPreviewProps {
  title: string
  description: string
  blocks: BioBlock[]
  theme: BioPageTheme
}

const socialIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
}

export function BioPreview({ title, description, blocks, theme }: BioPreviewProps) {
  const visibleBlocks = blocks.filter(block => block.is_visible)

  const getTextColor = (color: string) => {
    // Simple contrast check
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
    <div className="mx-auto max-w-sm">
      <div 
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ backgroundColor: theme.background }}
      >
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="text-center space-y-3">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarFallback 
                style={{ backgroundColor: theme.accent, color: getTextColor(theme.accent) }}
                className="text-xl font-semibold"
              >
                {title?.slice(0, 2).toUpperCase() || "LF"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 
                className="text-xl font-bold"
                style={{ color: theme.text }}
              >
                {title || "Your Name"}
              </h1>
              {description && (
                <p 
                  className="text-sm mt-1 opacity-80"
                  style={{ color: theme.text }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            {visibleBlocks.length === 0 ? (
              <p 
                className="text-center text-sm opacity-50 py-8"
                style={{ color: theme.text }}
              >
                Add blocks to see them here
              </p>
            ) : (
              visibleBlocks.map((block) => (
                <PreviewBlock 
                  key={block.id} 
                  block={block} 
                  theme={theme}
                  buttonStyle={buttonStyle}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 text-center">
            <p 
              className="text-xs opacity-50"
              style={{ color: theme.text }}
            >
              Powered by LinkForge
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewBlock({ 
  block, 
  theme,
  buttonStyle,
}: { 
  block: BioBlock
  theme: BioPageTheme
  buttonStyle: React.CSSProperties
}) {
  switch (block.type) {
    case "link": {
      const content = block.content as LinkBlockContent
      return (
        <a
          href={content.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg p-3 transition-transform hover:scale-[1.02]"
          style={buttonStyle}
        >
          <span className="font-medium">{content.title || "Link"}</span>
          <ExternalLink className="h-4 w-4 opacity-70" />
        </a>
      )
    }

    case "header": {
      const content = block.content as HeaderBlockContent
      const sizeClasses = {
        small: "text-sm",
        medium: "text-lg",
        large: "text-xl",
      }
      return (
        <h2 
          className={`font-bold text-center ${sizeClasses[content.size || "medium"]}`}
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
          className="text-sm text-center"
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
        <a
          href={content.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg p-3 transition-transform hover:scale-[1.02]"
          style={buttonStyle}
        >
          <Icon className="h-5 w-5" />
          <span className="ml-2 font-medium capitalize">{content.platform}</span>
        </a>
      )
    }

    case "email-capture": {
      const content = block.content as EmailCaptureBlockContent
      return (
        <div className="rounded-lg p-4" style={{ backgroundColor: `${theme.accent}10` }}>
          <p 
            className="text-sm font-medium text-center mb-3"
            style={{ color: theme.text }}
          >
            {content.title || "Subscribe"}
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder={content.placeholder || "Enter your email"}
              className="flex-1 rounded-lg px-3 py-2 text-sm border"
              style={{ backgroundColor: theme.background, color: theme.text }}
            />
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={buttonStyle}
            >
              {content.button_text || "Subscribe"}
            </button>
          </div>
        </div>
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
