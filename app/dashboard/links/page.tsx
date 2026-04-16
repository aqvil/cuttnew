import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { LinkIcon, ExternalLink, BarChart2, MoreHorizontal, Lock, Zap, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Relay Nodes",
}

export default async function LinksPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const links = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, session.user.id),
    orderBy: [desc(shortLinks.createdAt)],
  })

  return (
    <div className="space-y-16 pb-24">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="tech-label mb-4">
              <Zap className="h-3 w-3 text-accent" />
              RELAY_PROTOCOL_STABLE
            </div>
            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
              RELAY_NODES
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              INDEXING_TOTAL_CONNECTIONS: {links.length.toString().padStart(3, '0')} // ENCRYPTION: ACTIVE
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-hover:text-white transition-colors" />
              <Input 
                 placeholder="SEARCH_NODES..." 
                 className="bg-white/5 border-white/10 h-14 pl-12 text-[10px] font-mono uppercase tracking-widest w-full md:w-[300px] rounded-none focus:border-white transition-all"
              />
            </div>
             <Button className="btn-mono h-14 px-8" asChild>
              <Link href="/dashboard/links/new">DEPLOY_NEW</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-px bg-white/10 border border-white/10 overflow-hidden">
        {links.length > 0 ? (
          links.map((link) => (
            <div 
              key={link.id}
              className="bg-black p-8 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-white/[0.02] transition-colors group relative"
            >
              {/* Index Number Aesthetic */}
              <div className="absolute left-2 top-2 text-[8px] font-mono font-bold opacity-10 group-hover:opacity-100 transition-opacity">
                [{links.indexOf(link).toString().padStart(3, '0')}]
              </div>

              <div className="flex items-center gap-8 flex-1">
                <div className="h-16 w-16 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <LinkIcon className="size-6 text-white/20 group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight truncate group-hover:text-accent transition-colors">
                      {link.title || link.shortCode}
                    </h3>
                    {link.password && <Lock className="size-3 text-white/20" />}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/40">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-white">
                      NODE: {link.shortCode}
                    </span>
                    <span className="opacity-20">//</span>
                    <span className="truncate max-w-[240px]">DEST: {link.originalUrl}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="hidden lg:block text-right">
                  <div className="flex items-center justify-end gap-3 text-white/40 mb-1">
                    <BarChart2 className="size-3" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest">TRAFFIC_LEVEL</span>
                  </div>
                  <div className="text-2xl font-black italic tracking-tighter tabular-nums">
                    {link.clickCount.toLocaleString().padStart(5, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 border-white/10 bg-transparent hover:bg-white hover:text-black transition-all rounded-none"
                    asChild
                  >
                    <Link href={`/dashboard/links/${link.id}`}>
                      <MoreHorizontal className="size-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 border-white/10 bg-transparent hover:bg-accent hover:border-accent transition-all rounded-none"
                    asChild
                  >
                    <a href={`${process.env.NEXT_PUBLIC_APP_URL}/l/${link.shortCode}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-black py-48 flex flex-col items-center justify-center text-center">
             <div className="tech-label mb-8">EMPTY_STREAM</div>
             <p className="text-2xl font-black uppercase italic tracking-tighter mb-12 opacity-40">NO_ACTIVE_RELAY_NODES_FOUND</p>
             <Button className="btn-mono h-16 px-12" asChild>
                <Link href="/dashboard/links/new">DEPLOY_INITIAL_NODE</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
