'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, Globe, LayoutDashboard, Link2, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Links", href: "/dashboard/admin/links", icon: Link2 },
  { label: "Domains", href: "/dashboard/admin/domains", icon: Globe },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  { label: "Migration", href: "/dashboard/admin/migration", icon: Database },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin sections" className="border-b border-border">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {SECTIONS.map((section) => {
          const active = section.exact
            ? pathname === section.href
            : pathname.startsWith(section.href)

          return (
            <li key={section.href} className="shrink-0">
              <Link
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <section.icon className="size-4 shrink-0" aria-hidden="true" />
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
