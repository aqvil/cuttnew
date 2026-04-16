import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { FileText, ExternalLink, Eye, Pencil, MoreHorizontal } from "lucide-react"
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
  title: "Bio Pages",
}

export default async function BioPagesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  const data = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    orderBy: [desc(bioPages.createdAt)],
  })

  return (
    <div className="space-y-10">
      <div className="border-b-2 border-primary pb-6">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Bio Pages</h1>
        <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          Entities: {data.length} // Region: Central
        </p>
      </div>

      {data && data.length > 0 ? (
        <div className="card-mono !p-0 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b-2 border-primary bg-muted/20 px-6 py-4 text-[10px] font-black uppercase tracking-widest leading-none">
            <div className="col-span-5">Entity_Identifier</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Metrics</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y-2 divide-border">
            {data.map((page) => (
              <div 
                key={page.id} 
                className="grid grid-cols-12 items-center gap-4 px-6 py-5 transition-colors hover:bg-primary group"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center border-2 border-primary bg-background group-hover:border-primary-foreground">
                    <FileText className="size-5 group-hover:text-primary" />
                  </div>
                  <div className="min-w-0">
                    <Link 
                      href={`/dashboard/bio/${page.id}`}
                      className="block truncate text-sm font-black uppercase tracking-tight group-hover:text-primary-foreground"
                    >
                      {page.title || "Untitled"}
                    </Link>
                    <p className="truncate font-mono text-[10px] uppercase opacity-50 group-hover:text-primary-foreground group-hover:opacity-100">/p/{page.slug}</p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className={`border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                    page.isPublished 
                      ? "border-primary bg-primary text-primary-foreground italic" 
                      : "border-border text-muted-foreground"
                  }`}>
                    {page.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold group-hover:text-primary-foreground">
                    <span className="tabular-nums">0</span>
                    <Eye className="size-3" />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className="font-mono text-[10px] uppercase group-hover:text-primary-foreground">
                    {formatDistanceToNow(new Date(page.createdAt || Date.now()), { addSuffix: true })}
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
                        <Link href={`/dashboard/bio/${page.id}`}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {page.isPublished && (
                        <>
                          <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground rounded-none px-4 py-2 font-black uppercase text-[10px]">
                            <Link href={`/p/${page.slug}`} target="_blank">
                              <ExternalLink className="mr-2 size-4" />
                              View Live
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground rounded-none px-4 py-2 font-black uppercase text-[10px]">
                            <Link href={`/dashboard/analytics?page=${page.id}`}>
                              <Eye className="mr-2 size-4" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-border card-mono">
          <FileText className="size-12 opacity-20 mb-6" />
          <h3 className="text-lg font-black uppercase italic">No entities detected</h3>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground max-w-sm">
            Sector remains empty. Initialize your first bio segment.
          </p>
          <Link
            href="/dashboard/bio/new"
            className="btn-mono mt-8"
          >
            New Bio Page
          </Link>
        </div>
      )}
    </div>
  )
}
