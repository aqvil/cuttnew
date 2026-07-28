'use client'

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className || "text-muted-foreground hover:text-primary hover:bg-muted"}
      onClick={handleCopy}
    >
      <Copy className="h-4 w-4" />
    </Button>
  )
}
