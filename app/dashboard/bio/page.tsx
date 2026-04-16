import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { FileText, ExternalLink, Eye, Pencil, MoreHorizontal, Zap, Terminal } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Bio Segments",
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
    <div className="space-y-16 pb-24">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="tech-label mb-4">
              <Terminal className="h-3 w-3" />
              SEGMENT_REGISTRY_ONLINE
            </div>
            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
              BIO_SEGMENTS
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              ACTIVE_BUFFERS: {data.length.toString().padStart(3, '0')} // SYNC_STATUS: NOMINAL
            </p>
          </div>
          
          <Button className="btn-mono h-14 px-8" asChild>
            <Link href="/dashboard/bio/new">INITIALIZE_SEGMENT</Link>
          </Button>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-px bg-white/10 border border-white/10 overflow-hidden">
        {data.length > 0 ? (
          data.map((page) => (
            <div 
              key={page.id}
              className="bg-black p-8 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-white/[0.02] transition-colors group relative"
            >
              {/* Index Number Aesthetic */}
              <div className="absolute left-2 top-2 text-[8px] font-mono font-bold opacity-10 group-hover:opacity-100 transition-opacity">
                [B{data.indexOf(page).toString().padStart(2, '0')}]
              </div>

              <div className="flex items-center gap-8 flex-1">
                <div className="h-16 w-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <FileText className="size-6 text-white/20 group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight truncate group-hover:text-accent transition-colors">
                      {page.title || "UNTITLED_SEGMENT"}
                    </h3>
                    <div className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest border ${
                      page.isPublished ? 'border-accent text-accent' : 'border-white/20 text-white/20'
                    }`}>
                      {page.isPublished ? 'LIVE' : 'DRAFT'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-white">
                      PATH: /p/{page.slug}
                    </span>
                    <span className="opacity-20">//</span>
                    <span>INITIALIZED: {formatDistanceToNow(new Date(page.createdAt || Date.now()), { addSuffix: true }).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden lg:block text-right">
                  <div className="flex items-center justify-end gap-3 text-white/40 mb-1">
                    <Eye className="size-3" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest">FLUX_METRICS</span>
                  </div>
                  <div className="text-2xl font-black italic tracking-tighter tabular-nums">
                    00000
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 border-white/10 bg-transparent hover:bg-white hover:text-black transition-all rounded-none"
                    asChild
                  >
                    <Link href={`/dashboard/bio/${page.id}`}>
                      <Pencil className="size-5" />
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-12 w-12 border-white/10 bg-transparent hover:border-white hover:text-black transition-all rounded-none">
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border border-white/20 bg-black p-0 min-w-[200px]">
                       <div className="px-4 py-3 border-b border-white/10">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40">SEGMENT_OPERATIONS</span>
                      </div>
                      <DropdownMenuItem asChild className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-white focus:text-black cursor-pointer">
                        <Link href={`/dashboard/bio/${page.id}`}>
                          EDIT_CORE_LOGIC
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-white focus:text-black cursor-pointer">
                         <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          EXTRACT_PUBLIC_VIEW
                          <ExternalLink className="ml-auto size-3" />
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-white focus:text-black cursor-pointer">
                        <Link href={`/dashboard/analytics?page=${page.id}`}>
                          TELEMETRY_STREAM
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="rounded-none px-4 py-4 font-black uppercase italic text-[10px] focus:bg-red-500 focus:text-white text-red-500 cursor-pointer">
                        TERMINATE_SEGMENT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-black py-48 flex flex-col items-center justify-center text-center">
             <div className="tech-label mb-8">NULL_INDEX</div>
             <p className="text-2xl font-black uppercase italic tracking-tighter mb-12 opacity-40">NO_BIO_SEGMENTS_INITIALIZED</p>
             <Button className="btn-mono h-16 px-12" asChild>
                <Link href="/dashboard/bio/new">START_INITIALIZATION</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
