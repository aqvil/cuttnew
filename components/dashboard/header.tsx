'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, Home } from "lucide-react"

const pathLabels: Record<string, string> = {
  dashboard: "Home",
  links: "Links",
  bio: "Bio Pages",
  analytics: "Analytics",
  settings: "Settings",
  billing: "Billing",
  new: "New",
}

export function DashboardHeader() {
  const pathname = usePathname()

  // Build breadcrumb segments from path
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg, i, arr) => ({
      label: pathLabels[seg] || (seg.length === 36 ? "Edit" : seg.charAt(0).toUpperCase() + seg.slice(1)),
      href: "/" + arr.slice(0, i + 1).join("/"),
      isLast: i === arr.length - 1,
    }))
    .filter((s) => s.label !== "Dashboard")

  const isNewPage = pathname.includes("/new")
  const isBioSection = pathname.includes("/bio")

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border px-4 sm:px-5 bg-card/95 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="size-8 shrink-0 border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-md" />

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="size-3.5" />
          </Link>
          {segments.map((seg) => (
            <span key={seg.href} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="size-3 text-border shrink-0" />
              {seg.isLast ? (
                <span className="font-semibold text-foreground truncate">{seg.label}</span>
              ) : (
                <Link
                  href={seg.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {seg.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
        {!isNewPage && (
          <Button className="btn-primary h-9 px-4 text-xs" asChild>
            <Link href={isBioSection ? "/dashboard/bio/new" : "/dashboard/links/new"}>
              <Plus className="size-3.5" />
              {isBioSection ? "New page" : "New link"}
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
