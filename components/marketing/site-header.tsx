'use client'

import { useState } from "react"
import Link from "next/link"
import { Link2, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "API", href: "/#api" },
  { label: "Contact", href: "/contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[14px] font-semibold uppercase tracking-[0.16em]"
        >
          <span className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          Cuttly
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main"
        className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}
      >
        <ul className="space-y-1 px-5 py-4">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-subtle hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-subtle"
            >
              Sign in
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
