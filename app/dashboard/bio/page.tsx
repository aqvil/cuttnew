import { auth } from "@/auth"
import { db } from "@/lib/db"
import { bioPages } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { FileText, ExternalLink, Eye, MoreHorizontal, Search, Settings, Calendar, LayoutTemplate } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Link-in-bio - LinkForge",
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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Link-in-bio
          </h1>
        </div>
        <Button className="btn-primary" asChild>
          <Link href="/dashboard/bio/new">Create a Link-in-bio</Link>
        </Button>
      </div>

       {/* Controls */}
       <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search pages..." 
            className="pl-10 h-10 bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-lg text-sm"
          />
        </div>
        <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 border border-slate-200 rounded-lg">
          <Calendar className="h-4 w-4 mr-2" />
          All time
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((page) => (
            <div 
              key={page.id}
              className="card flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                  <LayoutTemplate className="h-6 w-6 text-purple-600" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/dashboard/bio/${page.id}`}
                      className="text-lg font-bold text-slate-900 hover:text-primary hover:underline truncate"
                    >
                      {page.title || "Untitled Page"}
                    </Link>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      page.isPublished 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <a 
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline flex items-center gap-1.5 truncate"
                    >
                      {process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '')}/p/{page.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="text-xs text-slate-400 font-medium pt-1">
                    Created {formatDistanceToNow(new Date(page.createdAt || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-6 pl-18 sm:pl-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-slate-400" />
                      0
                    </div>
                    <div className="text-xs font-semibold text-slate-500 cursor-help" title="Total Views">
                      Views
                    </div>
                  </div>
                   <div className="flex flex-col sm:items-end">
                    <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-slate-400" />
                      0
                    </div>
                    <div className="text-xs font-semibold text-slate-500 cursor-help" title="Total Link Clicks on Page">
                      Clicks
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-9 px-4 bg-white" asChild>
                     <Link href={`/dashboard/bio/${page.id}`}>
                        Edit design
                     </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 border border-transparent hover:border-slate-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/dashboard/bio/${page.id}`}>
                          <Settings className="mr-2 h-4 w-4 text-slate-500" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {page.isPublished && (
                        <>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4 text-slate-500" />
                              View public page
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/analytics?page=${page.id}`}>
                              <BarChart2 className="mr-2 h-4 w-4 text-slate-500" />
                              View analytics
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                        Delete page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-20 flex flex-col items-center">
             <div className="h-16 w-16 bg-purple-50 rounded-full border border-purple-100 flex items-center justify-center mb-6">
                <LayoutTemplate className="h-8 w-8 text-purple-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">No pages created yet</h3>
             <p className="text-slate-500 max-w-sm mb-6">Create a beautiful Link-in-bio page to organize all your important links in one place.</p>
             <Button className="btn-primary px-8" asChild>
                <Link href="/dashboard/bio/new">Create a Link-in-bio</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
