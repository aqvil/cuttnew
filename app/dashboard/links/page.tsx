import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { LinkIcon, ExternalLink, BarChart2, MoreHorizontal, Lock, Search, Copy, Calendar, ArrowUpRight, MousePointerClick, PencilLine } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const metadata = {
  title: "Links - Cuttly",
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
    <div className="dash-page">
      <div className="dash-hero flex flex-col items-center gap-6">
        <div>
          <div className="dash-kicker mb-4">
            <LinkIcon className="size-3.5" />
            Short links
          </div>
          <h1 className="dash-title">Links</h1>
          <p className="dash-subtitle">Your primary workspace. Shorten URLs, copy them, edit destinations, and watch clicks roll in.</p>
        </div>
        <Button className="btn-primary h-11 px-5" asChild>
          <Link href="/dashboard/links/new">
            Create new link
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="dash-control flex items-center justify-between gap-4">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search links..." 
            className="pl-10 h-10 bg-background border-border focus-visible:ring-primary rounded-md text-sm"
          />
        </div>
        <div className="dash-muted-pill hidden sm:flex">
          <Calendar className="h-4 w-4 mr-2" />
          All time
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Create", text: "Paste a long URL and choose the short back-half.", icon: LinkIcon },
          { title: "Share", text: "Copy the short URL anywhere your audience clicks.", icon: Copy },
          { title: "Measure", text: "Track clicks and open analytics from each link.", icon: MousePointerClick },
        ].map((step, index) => (
          <div key={step.title} className="dash-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="dash-icon size-9">
                <step.icon className="size-4" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="font-semibold text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link) => (
            <div 
              key={link.id}
              className="dash-panel flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-6 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="dash-icon">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/dashboard/links/${link.id}`}
                      className="text-lg font-bold text-foreground hover:text-primary hover:underline truncate"
                    >
                      {link.title || 'Untitled Link'}
                    </Link>
                    {link.password && (
                      <span title="Password Protected">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/l/${link.shortCode}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      {process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '')}/l/{link.shortCode}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-border hidden sm:inline">|</span>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground truncate max-w-xs sm:max-w-md">
                      {link.originalUrl}
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1 font-mono">
                    {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-8 pl-14 sm:pl-0 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      {(link.clickCount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground cursor-help" title="Total Engagements">
                      Engagements
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 px-3 gap-2 bg-card" title="Copy Link">
                    <Copy className="h-4 w-4" />
                    <span className="hidden lg:inline">Copy</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground border border-transparent hover:border-border" asChild>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty flex flex-col items-center">
             <div className="dash-icon size-16 mb-6">
                <LinkIcon className="h-7 w-7 text-primary" />
             </div>
             <h3 className="text-xl font-semibold text-foreground mb-2">Start with one destination URL</h3>
             <p className="text-muted-foreground max-w-sm mb-6">Create a short link first. You can edit the destination and settings after it exists.</p>
             <Button className="btn-primary px-8" asChild>
                <Link href="/dashboard/links/new">
                  <PencilLine className="size-4" />
                  Create your first link
                </Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
