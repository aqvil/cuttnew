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
              <Label className="text-[10px] font-black uppercase tracking-widest">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="LINK TITLE"
                className="border-2 border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="HTTPS://EXAMPLE.COM"
                className="border-2 border-primary font-bold"
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
              <Label className="text-[10px] font-black uppercase tracking-widest">Text</Label>
              <Input
                value={content.text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
                placeholder="HEADER TEXT"
                className="border-2 border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Size</Label>
              <Select
                value={content.size || "medium"}
                onValueChange={(value) => onUpdate(block.id, { ...content, size: value })}
              >
                <SelectTrigger className="border-2 border-primary font-bold rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-primary">
                  <SelectItem value="small">SMALL</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="large">LARGE</SelectItem>
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
            <Label className="text-[10px] font-black uppercase tracking-widest">Text</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate(block.id, { ...content, text: e.target.value })}
              placeholder="ENTER YOUR TEXT..."
              rows={3}
              className="border-2 border-primary font-bold rounded-none"
            />
          </div>
        )
      }

      case "social": {
        const content = block.content
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Platform</Label>
              <Select
                value={content.platform || "twitter"}
                onValueChange={(value) => onUpdate(block.id, { ...content, platform: value })}
              >
                <SelectTrigger className="border-2 border-primary font-bold rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-primary">
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
              <Label className="text-[10px] font-black uppercase tracking-widest">URL</Label>
              <Input
                value={content.url || ""}
                onChange={(e) => onUpdate(block.id, { ...content, url: e.target.value })}
                placeholder="HTTPS://TWITTER.COM/USERNAME"
                className="border-2 border-primary font-bold"
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
              <Label className="text-[10px] font-black uppercase tracking-widest">Title</Label>
              <Input
                value={content.title || ""}
                onChange={(e) => onUpdate(block.id, { ...content, title: e.target.value })}
                placeholder="SUBSCRIBE"
                className="border-2 border-primary font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Button Text</Label>
              <Input
                value={content.button_text || ""}
                onChange={(e) => onUpdate(block.id, { ...content, button_text: e.target.value })}
                placeholder="INITIALIZE"
                className="border-2 border-primary font-bold"
              />
            </div>
          </div>
        )
      }

      default:
        return (
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 italic">
            Config: Static / No parameters required.
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
        return "TEXT_BUFFER"
      case "social":
        return `${block.content.platform || "SOCIAL"}`.toUpperCase()
      case "email-capture":
        return block.content.title || "MAIL_CAPTURE"
      case "divider":
        return "DIVIDER"
      default:
        return block.type.toUpperCase()
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`border-2 border-primary transition-opacity ${!block.isVisible ? "opacity-30" : "opacity-100"}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <GripVertical className="h-4 w-4 text-primary opacity-50" />
            <div className="flex size-10 items-center justify-center border-2 border-primary bg-background">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black uppercase italic tracking-tighter truncate">{getBlockTitle()}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{block.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border-2 border-transparent hover:border-primary rounded-none"
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
                className="size-8 border-2 border-transparent hover:border-primary rounded-none"
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
                className="size-8 border-2 border-transparent hover:border-primary rounded-none text-primary"
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
                className="size-8 border-2 border-transparent hover:border-destructive rounded-none text-destructive"
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
          <div className="border-t-2 border-primary p-6 bg-muted/20">
            {renderBlockEditor()}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
