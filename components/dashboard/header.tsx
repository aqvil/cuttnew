'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

interface DashboardHeaderProps {
  user?: any
  profile?: any
}

const pageConfig: Record<string, { title: string; description: string; action?: { label: string; href: string } }> = {
  "/dashboard": {
    title: "OVERVIEW",
    description: "MONITOR_LINKS_AND_PERFORMANCE",
  },
  "/dashboard/bio": {
    title: "BIO_PAGES",
    description: "MANAGE_BIO_SEGMENTS",
    action: { label: "NEW_PAGE", href: "/dashboard/bio/new" },
  },
  "/dashboard/links": {
    title: "SHORT_LINKS",
    description: "MANAGE_ACCESS_NODES",
    action: { label: "NEW_LINK", href: "/dashboard/links/new" },
  },
  "/dashboard/analytics": {
    title: "METRICS",
    description: "REDACTED_ANALYTICS_DATA",
  },
  "/dashboard/settings": {
    title: "CONFIGURATION",
    description: "SYSTEM_PREFERENCES",
  },
  "/dashboard/billing": {
    title: "LOGISTICS",
    description: "CREDIT_ALLOCATION",
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
    <header className="sticky top-0 z-10 border-b-4 border-primary bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2 size-8 text-primary hover:bg-primary hover:text-primary-foreground border-2 border-transparent hover:border-primary rounded-none transition-all" />
          <div className="hidden h-6 w-1 bg-primary sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-black uppercase italic tracking-widest">{config.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {config.action && (
            <Button size="sm" asChild className="btn-mono !h-10 !px-4">
              <Link href={config.action.href}>
                <Plus className="size-4 mr-2" />
                {config.action.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
