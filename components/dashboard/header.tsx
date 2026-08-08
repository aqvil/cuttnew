'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Bell, HelpCircle, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/80 px-4 sm:px-6 bg-card backdrop-blur-xl shrink-0 gap-4 font-mono">
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="size-8 shrink-0 border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-lg" />
      </div>

      {/* Bitly Style Search Bar Header */}
      <div className="flex-1 max-w-md mx-auto relative hidden md:block">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-9 pl-9 pr-3 font-mono text-xs bg-muted/40 border-border rounded-lg focus-visible:ring-1"
        />
      </div>

      {/* Bitly Style Header Right Controls (Upgrade, Help, Notifications, User) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link href="/dashboard/billing">
          <Button variant="default" size="sm" className="h-8 px-3.5 text-xs font-mono font-bold bg-teal-700 hover:bg-teal-800 text-white border-0 gap-1 rounded-lg shadow-sm">
            Upgrade
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
          <HelpCircle className="size-4" />
        </Button>

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
          <Sparkles className="size-4 text-teal-600" />
        </Button>

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
            1
          </span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  )
}
