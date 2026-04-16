'use client'

import { useState } from "react"
import { BioBlock, LinkBlockContent, HeaderBlockContent, TextBlockContent, SocialBlockContent, EmailCaptureBlockContent } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react"

interface BioBlockItemProps {
  block: BioBlock
  index: number
  totalBlocks: number
  icon: React.ElementType
  onUpdate: (id: string, content: BioBlock["content"]) => void
  onDelete: (id: string) => void
  onToggleVisibility: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function BioBlockItem({
  block,
  index,
  totalBlocks,
  icon: Icon,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: BioBlockItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const renderBlockEditor = () => {
    switch (block.type) {
      case "link": {
        const content = block.content as LinkBlockContent
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="Link title"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
        )
      }

      case "header": {
        const content = block.content as HeaderBlockContent
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Text</Label>
              <Input
                value={content.text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
                placeholder="Header text"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Select
                value={content.size || "medium"}
                onValueChange={(value) => onUpdate(block.id, { ...content, size: value as HeaderBlockContent["size"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      }

      case "text": {
        const content = block.content as TextBlockContent
        return (
          <div className="space-y-1">
            <Label className="text-xs">Text</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
              placeholder="Enter your text..."
              rows={3}
            />
          </div>
        )
      }

      case "social": {
        const content = block.content as SocialBlockContent
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Platform</Label>
              <Select
                value={content.platform || "twitter"}
                onValueChange={(value) => onUpdate(block.id, { ...content, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter / X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        )
      }

      case "email-capture": {
        const content = block.content as EmailCaptureBlockContent
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="Subscribe to my newsletter"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={content.placeholder || ""}
                onChange={(e) => onUpdate(block.id, { ...content, placeholder: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Button Text</Label>
              <Input
                value={content.button_text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, button_text: e.target.value })}
                placeholder="Subscribe"
              />
            </div>
          </div>
        )
      }

      case "divider":
        return (
          <p className="text-xs text-muted-foreground">
            A horizontal divider line between blocks.
          </p>
        )

      default:
        return (
          <p className="text-xs text-muted-foreground">
            Block configuration not available.
          </p>
        )
    }
  }

  const getBlockTitle = () => {
    switch (block.type) {
      case "link":
        return (block.content as LinkBlockContent).title || "Link"
      case "header":
        return (block.content as HeaderBlockContent).text || "Header"
      case "text":
        return "Text Block"
      case "social":
        return `${(block.content as SocialBlockContent).platform || "Social"}`
      case "email-capture":
        return (block.content as EmailCaptureBlockContent).title || "Email Capture"
      case "divider":
        return "Divider"
      default:
        return block.type
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${!block.is_visible ? "opacity-50" : ""}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getBlockTitle()}</p>
              <p className="text-xs text-muted-foreground capitalize">{block.type}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp()
                }}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown()
                }}
                disabled={index === totalBlocks - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(block.id)
                }}
              >
                {block.is_visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(block.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-3">
            {renderBlockEditor()}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
