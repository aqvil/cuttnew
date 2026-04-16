import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { LinkIcon, ExternalLink, BarChart2, MoreHorizontal, Lock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Links",
}

export default async function ShortLinksPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  const data = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.createdAt)],
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-primary pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Short Links</h1>
        <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Entities: {data.length} // Region: Central
        </p>
      </div>

      {data && data.length > 0 ? (
        <div className="card-mono !p-0 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b-2 border-primary bg-muted/20 px-6 py-4 text-[10px] font-black uppercase tracking-widest leading-none">
            <div className="col-span-5">Entity_Identifier</div>
            <div className="col-span-2">Access_Path</div>
            <div className="col-span-2">Metrics</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y-2 divide-border">
            {data.map((link) => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
              return (
                <div 
                  key={link.id} 
                  className="grid grid-cols-12 items-center gap-4 px-6 py-5 transition-colors hover:bg-primary group"
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center border-2 border-primary bg-background group-hover:border-primary-foreground">
                      <LinkIcon className="size-5 group-hover:text-primary" />
                    </div>
                    <div className="min-w-0">
                      <Link 
                        href={`/dashboard/links/${link.id}`}
                        className="flex items-center gap-2 text-sm font-black uppercase tracking-tight group-hover:text-primary-foreground"
                      >
                        <span className="truncate">{link.title || link.shortCode}</span>
                        {link.password && (
                          <Lock className="size-3 opacity-50" />
                        )}
                        {isExpired && (
                          <span className="border-2 border-destructive px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-destructive group-hover:border-primary-foreground group-hover:text-primary-foreground">
                            EXPIRED
                          </span>
                        )}
                      </Link>
                      <p className="truncate font-mono text-[10px] uppercase opacity-50 group-hover:text-primary-foreground group-hover:opacity-100 max-w-[280px]">
                        {link.originalUrl}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <code className="border-2 border-border px-1.5 py-0.5 text-[10px] font-mono group-hover:border-primary-foreground group-hover:text-primary-foreground">
                      /L/{link.shortCode}
                    </code>
                  </div>
                  
                  <div className="col-span-2 text-[10px] font-mono font-bold group-hover:text-primary-foreground tabular-nums">
                    {link.clickCount}
                  </div>
                  
                  <div className="col-span-2">
                    <span className="font-mono text-[10px] uppercase group-hover:text-primary-foreground">
                      {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 border-2 border-transparent hover:border-primary rounded-none group-hover:border-primary-foreground group-hover:text-primary-foreground">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-none border-2 border-primary">
                        <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground rounded-none px-4 py-2 font-black uppercase text-[10px]">
                          <Link href={`/dashboard/links/${link.id}`}>
                            Edit Link
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground rounded-none px-4 py-2 font-black uppercase text-[10px]">
                          <a href={`${baseUrl}/l/${link.shortCode}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 size-4" />
                            Open Link
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground rounded-none px-4 py-2 font-black uppercase text-[10px]">
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
        <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-border card-mono">
          <LinkIcon className="size-12 opacity-20 mb-6" />
          <h3 className="text-lg font-black uppercase italic">No entities detected</h3>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground max-w-sm">
            Sector remains empty. Initialize your first trackable segment.
          </p>
          <Link
            href="/dashboard/links/new"
            className="btn-mono mt-8"
          >
            New Short Link
          </Link>
        </div>
      )}
    </div>
  )
}
