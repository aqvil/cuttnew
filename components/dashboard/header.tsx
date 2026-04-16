'use client'

import { User } from "@supabase/supabase-js"
import { Profile } from "@/lib/types/database"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

const pageConfig: Record<string, { title: string; description: string; action?: { label: string; href: string } }> = {
  "/dashboard": {
    title: "Overview",
    description: "Monitor your links and page performance",
  },
  "/dashboard/bio": {
    title: "Bio Pages",
    description: "Create and manage your bio pages",
    action: { label: "New Page", href: "/dashboard/bio/new" },
  },
  "/dashboard/links": {
    title: "Links",
    description: "Shorten and track your links",
    action: { label: "New Link", href: "/dashboard/links/new" },
  },
  "/dashboard/analytics": {
    title: "Analytics",
    description: "Track clicks, views, and engagement",
  },
  "/dashboard/ai": {
    title: "AI Assistant",
    description: "Generate content with AI",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Manage your account settings",
  },
  "/dashboard/billing": {
    title: "Billing",
    description: "Manage your subscription and billing",
  },
}

export function DashboardHeader({ }: DashboardHeaderProps) {
  const pathname = usePathname()
  
  const getConfig = () => {
    if (pageConfig[pathname]) {
      return pageConfig[pathname]
    }
    for (const [path, config] of Object.entries(pageConfig)) {
      if (pathname.startsWith(path) && path !== "/dashboard") {
        return config
      }
    }
    return pageConfig["/dashboard"]
  }

  const config = getConfig()

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2 size-8 text-muted-foreground hover:text-foreground" />
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-medium">{config.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {config.action && (
            <Button size="sm" asChild className="h-8 gap-1.5 text-xs">
              <Link href={config.action.href}>
                <Plus className="size-3.5" />
                {config.action.label}
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
