'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, Home, Search, Bell, HelpCircle, Sparkles, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"

const pathLabels: Record<string, string> = {
  dashboard: "Home",
  links: "Links",
  bio: "Bio Pages",
  surveys: "Surveys",
  "action-pages": "Action Pages",
  "qr-codes": "QR Codes",
  domains: "Custom Domains",
  teams: "Teams",
  analytics: "Analytics",
  settings: "Settings",
  billing: "Billing",
  admin: "Admin Console",
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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border px-4 sm:px-5 bg-card/95 backdrop-blur-xl shrink-0 gap-4">
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
                <span className="font-semibold text-foreground truncate font-mono text-xs">{seg.label}</span>
              ) : (
                <Link
                  href={seg.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate font-mono text-xs"
                >
                  {seg.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Global Search Bar (Bitly Style) */}
      <div className="hidden md:flex items-center max-w-xs w-full relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search links, QR codes, domains..."
          className="h-8 pl-8 pr-3 font-mono text-xs bg-muted/30 border-border/80 rounded-md focus-visible:ring-1"
        />
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/dashboard/billing">
          <Button variant="default" size="sm" className="h-8 px-3 text-xs font-mono font-bold bg-teal-600 hover:bg-teal-700 text-white border-0 gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Upgrade
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-emerald-500" />
        </Button>

        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
          <HelpCircle className="size-4" />
        </Button>

        <ThemeToggle />

        {!isNewPage && (
          <Button className="h-8 px-3 text-xs font-mono font-semibold" asChild>
            <Link href={isBioSection ? "/dashboard/bio/new" : "/dashboard/links/new"}>
              <Plus className="size-3.5 mr-1" />
              {isBioSection ? "New page" : "Create new"}
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
