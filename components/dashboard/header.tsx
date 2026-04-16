'use client'

import { User } from "@supabase/supabase-js"
import { Profile } from "@/lib/types/database"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

const pageNames: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bio": "Bio Pages",
  "/dashboard/links": "Short Links",
  "/dashboard/analytics": "Analytics",
  "/dashboard/ai": "AI Assistant",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Billing",
}

export function DashboardHeader({ }: DashboardHeaderProps) {
  const pathname = usePathname()
  
  // Get page name from the path
  const getPageName = () => {
    // Check exact match first
    if (pageNames[pathname]) {
      return pageNames[pathname]
    }
    // Check for nested routes
    for (const [path, name] of Object.entries(pageNames)) {
      if (pathname.startsWith(path) && path !== "/dashboard") {
        return name
      }
    }
    return "Dashboard"
  }

  const pageName = getPageName()
  const isOverview = pathname === "/dashboard"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {!isOverview && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
