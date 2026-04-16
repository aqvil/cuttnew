import { createClient } from "@/lib/supabase/server"
import { LinkIcon, ExternalLink, BarChart2, Copy, MoreHorizontal, Lock, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Links",
}

export default async function ShortLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: links } = await supabase
    .from("short_links")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shorten URLs and track clicks
        </p>
      </div>

      {links && links.length > 0 ? (
        <div className="rounded-lg border border-border bg-card">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
            <div className="col-span-5">Link</div>
            <div className="col-span-2">Short URL</div>
            <div className="col-span-2">Clicks</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-border">
            {links.map((link) => {
              const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
              return (
                <div 
                  key={link.id} 
                  className="grid grid-cols-12 items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <LinkIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <Link 
                        href={`/dashboard/links/${link.id}`}
                        className="flex items-center gap-2 text-sm font-medium hover:underline"
                      >
                        <span className="truncate">{link.title || link.short_code}</span>
                        {link.password && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                        {isExpired && (
                          <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                            Expired
                          </span>
                        )}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground max-w-[280px]">
                        {link.original_url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      /l/{link.short_code}
                    </code>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm tabular-nums">{link.click_count}</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/links/${link.id}`}>
                            Edit Link
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`${baseUrl}/l/${link.short_code}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 size-4" />
                            Open Link
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/analytics?link=${link.id}`}>
                            <BarChart2 className="mr-2 size-4" />
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <LinkIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium">No links yet</h3>
          <p className="mt-1 text-center text-xs text-muted-foreground max-w-sm">
            Create your first shortened URL with custom slug and analytics.
          </p>
          <Link
            href="/dashboard/links/new"
            className="mt-4 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            Create Link
          </Link>
        </div>
      )}
    </div>
  )
}
