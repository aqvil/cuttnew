import Link from "next/link"
import { Link2 } from "lucide-react"

/**
 * Footer links point at pages that exist. The previous footer rendered twelve
 * links, every one of them `href="#"`.
 */
const GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/#api" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/auth/login" },
      { label: "Create account", href: "/auth/sign-up" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Link2 className="size-3" strokeWidth={2.5} aria-hidden="true" />
              </span>
              Cuttly
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Short links, QR codes and click analytics — without the dashboard clutter.
            </p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="eyebrow mb-4">{group.heading}</h2>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      // Extra vertical padding gives a comfortable tap target
                      // without changing the visual rhythm of the list.
                      className="-my-1 inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cuttly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
