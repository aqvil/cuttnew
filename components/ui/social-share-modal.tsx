'use client'

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, Send, Mail } from "lucide-react"
import { toast } from "sonner"

interface SocialShareModalProps {
  url: string
  title?: string
  trigger?: React.ReactNode
}

export function SocialShareModal({ url, title = "Check out this link", trigger }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    {
      name: "Twitter / X",
      icon: "𝕏",
      color: "bg-black text-white hover:bg-neutral-800",
      shareUrl: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: "in",
      color: "bg-[#0a66c2] text-white hover:bg-[#084e96]",
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: "fb",
      color: "bg-[#1877f2] text-white hover:bg-[#0d65d9]",
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: "WA",
      color: "bg-[#25d366] text-white hover:bg-[#1da851]",
      shareUrl: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#229ed9] text-white hover:bg-[#1a80b0]",
      shareUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-neutral-600 text-white hover:bg-neutral-700",
      shareUrl: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="size-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="size-5 text-primary" />
            Share Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Direct link copy row */}
          <div className="flex items-center gap-2">
            <Input value={url} readOnly className="font-mono text-xs" />
            <Button size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>

          {/* Social share grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {shareOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-lg text-xs font-semibold transition-all ${opt.color}`}
              >
                {typeof opt.icon === "string" ? (
                  <span className="text-base font-bold mb-1">{opt.icon}</span>
                ) : (
                  <opt.icon className="size-4 mb-1" />
                )}
                {opt.name}
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
