'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CreditCard, KeyRound, ShieldCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { label: "Profile", href: "/dashboard/settings", icon: User, exact: true },
  { label: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { label: "API keys", href: "/dashboard/settings/api", icon: KeyRound },
  { label: "Plan & billing", href: "/dashboard/billing", icon: CreditCard },
]

/**
 * Section navigation. Becomes a horizontal, scrollable strip on narrow
 * screens so it never eats the full viewport height on a phone.
 */
export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Settings sections" className="lg:w-52 lg:shrink-0">
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
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
                  "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-subtle hover:text-foreground"
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
