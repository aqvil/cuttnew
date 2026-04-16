import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages, shortLinks, pageViews, linkAnalytics } from "@/lib/db/schema"
import { eq, desc, count, inArray } from "drizzle-orm"
import { FileText, LinkIcon, Eye, MousePointer, Activity, Cpu, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Fetch stats
  const [bioPagesCount, shortLinksCount] = await Promise.all([
    db.select({ value: count() }).from(bioPages).where(eq(bioPages.userId, userId)),
    db.select({ value: count() }).from(shortLinks).where(eq(shortLinks.userId, userId)),
  ])

  // Get user's page/link IDs for aggregate counting
  const userBioPages = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    columns: { id: true }
  })
  const userShortLinks = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    columns: { id: true }
  })

  const bioPageIds = userBioPages.map(p => p.id)
  const shortLinkIds = userShortLinks.map(l => l.id)

  let pageViewsCount = 0
  if (bioPageIds.length > 0) {
    const [result] = await db.select({ value: count() }).from(pageViews).where(inArray(pageViews.pageId, bioPageIds))
    pageViewsCount = result?.value || 0
  }

  let linkClicksCount = 0
  if (shortLinkIds.length > 0) {
    const [result] = await db.select({ value: count() }).from(linkAnalytics).where(inArray(linkAnalytics.linkId, shortLinkIds))
    linkClicksCount = result?.value || 0
  }

  const stats = [
    { id: "01", title: "BIO_SEGMENTS", value: bioPagesCount[0]?.value || 0, icon: FileText, desc: "ACTIVE_NODES" },
    { id: "02", title: "RELAY_LINKS", value: shortLinksCount[0]?.value || 0, icon: LinkIcon, desc: "CONNECTION_POINTS" },
    { id: "03", title: "VIEW_STREAM", value: pageViewsCount, icon: Eye, desc: "TOTAL_FLUX" },
    { id: "04", title: "CLICK_PULSE", value: linkClicksCount, icon: MousePointer, desc: "ENGAGEMENT_SIGNS" },
  ]

  const recentBioPagesData = await db.query.bioPages.findMany({
    where: eq(bioPages.userId, userId),
    orderBy: [desc(bioPages.createdAt)],
    limit: 3,
  })

  const recentLinksData = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, userId),
    orderBy: [desc(shortLinks.createdAt)],
    limit: 3,
  })

  return (
    <div className="space-y-16 pb-24">
      {/* Welcome Section */}
      <div className="border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="tech-label mb-4">
              <Activity className="h-3 w-3" />
              SYSTEM_READY_V2
            </div>
            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-2">
              OVERVIEW
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              SESSION_TOKEN: {session.user.id.slice(0, 12).toUpperCase()} // MODE: OPERATIONAL
            </p>
          </div>
          <div className="flex gap-4">
            <div className="border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <div className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">STABILITY</div>
                <div className="text-xl font-black italic tracking-tighter">99.9%</div>
            </div>
            <div className="border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <div className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1">LATENCY</div>
                <div className="text-xl font-black italic tracking-tighter text-accent">12MS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-px bg-white/10 border border-white/10">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-black p-8 group hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <stat.icon className="size-4 text-white/40 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase italic tracking-widest">{stat.title}</span>
              </div>
              <span className="text-[8px] font-mono font-black opacity-20">[{stat.id}]</span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-6xl font-black italic tracking-tighter tabular-nums leading-none">
                {stat.value.toLocaleString()}
              </p>
              <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40 mb-1">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Recent Data Blocks */}
        <div className="space-y-12">
          {/* Bio Pages */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-white/40" />
                <h2 className="text-lg font-black uppercase italic tracking-tight">ACTIVE_SEGMENTS</h2>
              </div>
              <Link href="/dashboard/bio" className="text-[8px] font-black uppercase tracking-widest hover:text-accent transition-colors">
                FULL_INDEX ->
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentBioPagesData.map(page => (
                <Link key={page.id} href={`/dashboard/bio/${page.id}`} className="block card-mono !py-6 group overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-sm font-black italic tracking-widest opacity-20 group-hover:opacity-100 transition-opacity">
                        [0{recentBioPagesData.indexOf(page) + 1}]
                      </div>
                      <div>
                        <div className="text-base font-black uppercase italic tracking-tight">{page.title || "UNTITLED_NODE"}</div>
                        <div className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-1">
                          PATH: /p/{page.slug}
                        </div>
                      </div>
                    </div>
                    <Zap className={`size-4 ${page.isPublished ? 'text-accent' : 'text-white/20'}`} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Short Links */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <LinkIcon className="size-4 text-white/40" />
                <h2 className="text-lg font-black uppercase italic tracking-tight">RELAY_POINTS</h2>
              </div>
              <Link href="/dashboard/links" className="text-[8px] font-black uppercase tracking-widest hover:text-accent transition-colors">
                NETWORK_MAP ->
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentLinksData.map(link => (
                <Link key={link.id} href={`/dashboard/links/${link.id}`} className="block card-mono !py-6 group overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-sm font-black italic tracking-widest opacity-20 group-hover:opacity-100 transition-opacity">
                        [R{recentLinksData.indexOf(link) + 1}]
                      </div>
                      <div className="max-w-[180px] md:max-w-xs">
                        <div className="text-base font-black uppercase italic tracking-tight truncate">{link.title || link.shortCode}</div>
                        <div className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-1 truncate">
                          ADDR: {link.originalUrl}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] font-bold opacity-40 tabular-nums">
                      {link.clickCount.toString().padStart(4, '0')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Technical Sidebar Widgets */}
        <div className="space-y-8">
          <div className="card-mono border-white/20 p-8">
              <h3 className="text-sm font-black uppercase italic tracking-widest mb-8 border-b border-white/10 pb-4">
                QUICK_INITIALIZE
              </h3>
              <div className="grid gap-4">
                <Button className="btn-mono group h-14" asChild>
                  <Link href="/dashboard/bio/new">
                    CREATE_BIO_SEGMENT
                    <ArrowUpRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </Button>
                <Button className="btn-mono group h-14" asChild>
                  <Link href="/dashboard/links/new">
                    DEPLOY_RELAY_NODE
                    <ArrowUpRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </Button>
              </div>
          </div>

          <div className="card-mono border-white/20 p-8">
              <h3 className="text-sm font-black uppercase italic tracking-widest mb-6 border-b border-white/10 pb-4">
                SECURITY_CLEARANCE
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                  <span className="opacity-40 uppercase">ENCRYPTION_LVL</span>
                  <span className="font-black text-emerald-400">MIL_SPEC_AES_256</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono tracking-widest">
                  <span className="opacity-40 uppercase">THREAT_LEVEL</span>
                  <span className="font-black text-white">MINIMAL</span>
                </div>
                <div className="pt-4 border-t border-white/10">
                   <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-[8px] font-black uppercase italic tracking-widest">FIREWALL_ACTIVE</span>
                   </div>
                </div>
              </div>
          </div>

          <div className="card-mono border-white/20 p-8 bg-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-black uppercase italic tracking-widest">LOGISTICS_UPGRADE</h3>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-60 leading-relaxed mb-8">
                UPGRADE_TO_ELITE_FOR_UNLIMITED_BUFFER_POOL_AND_ADVANCED_TELEM_STREAMS.
              </p>
              <Button variant="outline" className="btn-ghost-mono w-full h-12 text-[10px]" asChild>
                <Link href="/dashboard/billing">OPTIMIZE_ALLOCATION</Link>
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
