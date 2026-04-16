'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus, Terminal, Wifi } from "lucide-react"

export function DashboardHeader() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    const path = pathname.split('/').pop() || 'OVERVIEW'
    return path.toUpperCase()
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 px-8 bg-black/40 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="h-10 w-10 border border-white/10 hover:border-white transition-colors" />
        <div className="h-6 w-px bg-white/10 hidden md:block" />
        <div className="flex flex-col">
          <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-40">NODE_SESSION_ACTIVE</span>
            <Wifi className="h-2 w-2 text-accent animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 border-x border-white/10 px-6">
          <Terminal className="h-3 w-3 text-white/20" />
          <span className="text-[8px] font-mono font-black uppercase tracking-[0.3em] text-white/40">
            SYSTEM_ENCRYPTION_V2_ACTIVE
          </span>
        </div>
        
        <Button className="btn-mono h-11 px-6 text-[10px]" asChild>
          <Link href={pathname.includes('bio') ? '/dashboard/bio/new' : '/dashboard/links/new'}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            INITIALIZE_NEW
          </Link>
        </Button>
      </div>
    </header>
  )
}
