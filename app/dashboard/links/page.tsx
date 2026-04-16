import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { LinkIcon, ExternalLink, BarChart2, MoreHorizontal, Lock, Search, Copy, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

export const metadata = {
  title: "Links - LinkForge",
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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Links
          </h1>
        </div>
        <Button className="btn-primary" asChild>
          <Link href="/dashboard/links/new">Create new link</Link>
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search links..." 
            className="pl-10 h-10 bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-lg text-sm"
          />
        </div>
        <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 border border-slate-200 rounded-lg">
          <Calendar className="h-4 w-4 mr-2" />
          All time
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link) => (
            <div 
              key={link.id}
              className="card flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/dashboard/links/${link.id}`}
                      className="text-lg font-bold text-slate-900 hover:text-primary hover:underline truncate"
                    >
                      {link.title || 'Untitled Link'}
                    </Link>
                    {link.password && (
                      <span title="Password Protected">
                        <Lock className="h-4 w-4 text-slate-400" />
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
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 truncate max-w-xs sm:max-w-md">
                      {link.originalUrl}
                    </a>
                  </div>
                  <div className="text-xs text-slate-400 font-medium pt-1">
                    {formatDistanceToNow(new Date(link.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-8 pl-14 sm:pl-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart2 className="h-4 w-4 text-slate-400" />
                      {link.clickCount.toLocaleString()}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 cursor-help" title="Total Engagements">
                      Engagements
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 px-3 gap-2 bg-white" title="Copy Link">
                    <Copy className="h-4 w-4" />
                    <span className="hidden lg:inline">Copy</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 border border-transparent hover:border-slate-200" asChild>
                    <Link href={`/dashboard/links/${link.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-20 flex flex-col items-center">
             <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <LinkIcon className="h-8 w-8 text-primary" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">No links created yet</h3>
             <p className="text-slate-500 max-w-sm mb-6">Create shortened links to track clicks, customize destinations, and analyze your audience.</p>
             <Button className="btn-primary px-8" asChild>
                <Link href="/dashboard/links/new">Create your first link</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
