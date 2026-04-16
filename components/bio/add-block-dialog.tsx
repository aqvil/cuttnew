'use client'

import { BlockType } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Link as LinkIcon,
  Heading,
  Type,
  Image,
  Share2,
  Code,
  Minus,
  Mail,
} from "lucide-react"

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBlock: (type: BlockType) => void
}

const blockTypes: Array<{
  type: BlockType
  icon: React.ElementType
  title: string
  description: string
}> = [
  {
    type: "link",
    icon: LinkIcon,
    title: "Link",
    description: "Add a clickable link button",
  },
  {
    type: "header",
    icon: Heading,
    title: "Header",
    description: "Add a section header",
  },
  {
    type: "text",
    icon: Type,
    title: "Text",
    description: "Add a text paragraph",
  },
  {
    type: "social",
    icon: Share2,
    title: "Social Link",
    description: "Add a social media link",
  },
  {
    type: "email-capture",
    icon: Mail,
    title: "Email Capture",
    description: "Collect email subscribers",
  },
  {
    type: "divider",
    icon: Minus,
    title: "Divider",
    description: "Add a horizontal divider",
  },
]

export function AddBlockDialog({ open, onOpenChange, onAddBlock }: AddBlockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Block</DialogTitle>
          <DialogDescription>
            Choose a block type to add to your bio page
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {blockTypes.map((block) => (
            <button
              key={block.type}
              onClick={() => onAddBlock(block.type)}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <block.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{block.title}</p>
                <p className="text-xs text-muted-foreground">{block.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
