import type { ReactNode } from "react"
import Link from "next/link"
import { BarChart3, Link2, Lock, QrCode } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignalMotif } from "@/components/marketing/signal-motif"

/**
 * Shared frame for every authentication screen.
 *
 * The right-hand panel states what the product does. It previously advertised
 * an unrelated third-party game, which is not something a sign-in page should
 * be doing.
 */

const HIGHLIGHTS = [
  { icon: Link2, text: "Short links with custom back-halves" },
  { icon: BarChart3, text: "Clicks, referrers, countries and devices" },
  { icon: QrCode, text: "QR codes with separate scan tracking" },
  { icon: Lock, text: "Password protection and expiry rules" },
]

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen flex-col justify-center px-6 py-12 lg:min-h-0 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 flex items-center gap-2.5 font-display text-[15px] font-bold tracking-[-0.02em]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Link2 className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            </span>
            Cuttly
          </Link>

          <div className="mb-8 space-y-1.5">
            <h1 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
            {description ? (
              <p className="text-[15px] leading-7 text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {children}

          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>

      {/* Decorative side panel — hidden rather than stacked on small screens,
          where it would push the actual form below the fold. Always the ink
          theme, regardless of the site-wide light/dark setting, so the form
          panel and the statement panel read as day and night. */}
      <aside className="ink-band dark relative hidden overflow-hidden border-l border-border lg:flex lg:flex-col lg:justify-center lg:px-12">
        <SignalMotif className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 text-foreground/[0.06]" />
        <div className="relative max-w-md">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">
            Links that keep working, and tell you what happened.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Change a destination after you&apos;ve shared it. See where clicks come from. Print a
            QR code and know how many people scanned it.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-[13px]">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-brand"
                >
                  <item.icon className="size-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
