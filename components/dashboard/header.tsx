'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

export function DashboardHeader() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    if (!path || path === 'dashboard') return 'Dashboard'
    if (path === 'bio') return 'Link-in-bio'
    if (path === 'links') return 'Links'
    if (path === 'analytics') return 'Analytics'
    if (path === 'settings') return 'Settings'
    if (path === 'billing') return 'Billing'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border px-4 sm:px-6 bg-card/90 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-9 w-9 border border-border text-muted-foreground hover:bg-muted transition-colors" />
        <div className="h-6 w-px bg-border hidden sm:block" />
        <h1 className="text-base font-semibold tracking-tight text-foreground hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button className="btn-primary h-10 px-4" asChild>
          <Link href={pathname.includes('bio') ? '/dashboard/bio/new' : '/dashboard/links/new'}>
            <Plus className="mr-2 h-4 w-4" />
            Create new
          </Link>
        </Button>
      </div>
    </header>
  )
}
