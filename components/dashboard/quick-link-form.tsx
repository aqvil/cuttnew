'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Link2 } from "lucide-react"

export function QuickLinkForm() {
  const [url, setUrl] = useState("")
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const destination = url.trim()
    router.push(destination ? `/dashboard/links/new?url=${encodeURIComponent(destination)}` : "/dashboard/links/new")
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-7 flex w-full max-w-3xl flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a long URL to shorten"
          className="h-14 rounded-sm border-border bg-background pl-12 text-base"
        />
      </div>
      <Button className="btn-primary h-14 px-6 text-base">
        Continue
        <ArrowRight className="size-4" />
      </Button>
    </form>
  )
}
