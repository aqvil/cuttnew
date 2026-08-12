'use client'

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandSearch } from "@/components/dashboard/command-search"

/**
 * Dashboard top bar.
 *
 * Deliberately sparse. The previous version carried a non-functional search
 * field, a help button that did nothing, an "AI" button with no feature behind
 * it, and a notification bell permanently showing an unread count of 1. Each
 * of those trained users to distrust the controls, so they're gone: what's
 * left is search (which works), the plan upgrade (only when it applies), and
 * the theme toggle.
 */
export function DashboardHeader({ plan }: { plan?: string | null }) {
  const isFreePlan = (plan || "free") === "free"

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="size-8 text-muted-foreground" />

      <div className="flex flex-1 justify-start">
        <CommandSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {isFreePlan ? (
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/billing">Upgrade</Link>
          </Button>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  )
}
