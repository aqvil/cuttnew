'use client'

import { useState } from "react"
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
  block: any
  index: number
  totalBlocks: number
  icon: React.ElementType
  onUpdate: (id: string, content: any) => void
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
        const content = block.content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="Link title"
                className="dash-field font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="https://example.com"
                className="dash-field font-medium"
              />
            </div>
          </div>
        )
      }

      case "header": {
        const content = block.content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text</Label>
              <Input
                value={content.text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
                placeholder="Header text"
                className="dash-field font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</Label>
              <Select
                value={content.size || "medium"}
                onValueChange={(value) => onUpdate(block.id, { ...content, size: value })}
              >
                <SelectTrigger className="dash-field font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border">
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
        const content = block.content
        return (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
              placeholder="Enter your text..."
              rows={3}
              className="border-border bg-background font-medium"
            />
          </div>
        )
      }

      case "social": {
        const content = block.content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</Label>
              <Select
                value={content.platform || "twitter"}
                onValueChange={(value) => onUpdate(block.id, { ...content, platform: value })}
              >
                <SelectTrigger className="dash-field font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border">
                  <SelectItem value="twitter">TWITTER / X</SelectItem>
                  <SelectItem value="instagram">INSTAGRAM</SelectItem>
                  <SelectItem value="youtube">YOUTUBE</SelectItem>
                  <SelectItem value="tiktok">TIKTOK</SelectItem>
                  <SelectItem value="linkedin">LINKEDIN</SelectItem>
                  <SelectItem value="github">GITHUB</SelectItem>
                  <SelectItem value="twitch">TWITCH</SelectItem>
                  <SelectItem value="discord">DISCORD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="https://twitter.com/username"
                className="dash-field font-medium"
              />
            </div>
          </div>
        )
      }

      case "email-capture": {
        const content = block.content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="Subscribe"
                className="dash-field font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Button Text</Label>
              <Input
                value={content.button_text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, button_text: e.target.value })}
                placeholder="Subscribe"
                className="dash-field font-medium"
              />
            </div>
          </div>
        )
      }

      default:
        return (
          <p className="text-xs text-muted-foreground">
            This block does not need any extra settings.
          </p>
        )
    }
  }

  const getBlockTitle = () => {
    switch (block.type) {
      case "link":
        return block.content.title || "LINK"
      case "header":
        return block.content.text || "HEADER"
      case "text":
        return "Text"
      case "social":
        return block.content.platform || "Social"
      case "email-capture":
        return block.content.title || "Email capture"
      case "divider":
        return "Divider"
      default:
        return block.type.toUpperCase()
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`dash-panel overflow-hidden transition-opacity ${!block.isVisible ? "opacity-40" : "opacity-100"}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="dash-icon">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{getBlockTitle()}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{block.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border border-transparent hover:border-border rounded-md"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp()
                }}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border border-transparent hover:border-border rounded-md"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown()
                }}
                disabled={index === totalBlocks - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border border-transparent hover:border-border rounded-md text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(block.id)
                }}
              >
                {block.isVisible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border border-transparent hover:border-destructive rounded-md text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(block.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-6 bg-muted/20">
            {renderBlockEditor()}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
