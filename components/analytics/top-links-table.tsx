'use client'

import Link from "next/link"
import { LinkIcon, ExternalLink } from "lucide-react"

interface TopLinksTableProps {
  links: Array<{
    id: string
    title: string | null
    short_code: string
    click_count: number
    original_url: string
  }>
}

export function TopLinksTable({ links }: TopLinksTableProps) {
  if (links.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
        No links created yet
      </div>
    )
  }

  const totalClicks = links.reduce((acc, link) => acc + link.click_count, 0)

  return (
    <div className="space-y-3">
      {links.map((link) => {
        const percentage = totalClicks > 0 ? (link.click_count / totalClicks) * 100 : 0
        
        return (
          <Link
            key={link.id}
            href={`/dashboard/links/${link.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
              <LinkIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">
                  {link.title || link.short_code}
                </p>
                <span className="text-sm font-mono text-muted-foreground shrink-0">
                  {link.click_count.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-foreground/50 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        )
      })}
    </div>
  )
}
