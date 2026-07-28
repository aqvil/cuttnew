import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Link2,
  MousePointerClick,
  QrCode,
  Smartphone,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Link2,
    title: "Short links",
    desc: "Turn long URLs into clean, memorable links with custom slugs and fast redirects.",
  },
  {
    icon: BarChart3,
    title: "Simple analytics",
    desc: "See clicks, referrers, locations, and top links without wading through clutter.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    desc: "Create scannable QR codes for campaigns, packaging, events, and offline sharing.",
  },
]

const stats = [
  { value: "42.8K", label: "clicks this month" },
  { value: "1.2K", label: "active links" },
  { value: "99.9%", label: "redirect uptime" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-md border border-foreground bg-foreground text-background shadow-[3px_3px_0_0_rgba(0,0,0,0.16)] dark:border-border dark:bg-foreground dark:text-background dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.16)]">
              <Link2 className="size-4 stroke-[3]" />
            </span>
            <span className="text-xl">Cuttly</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {["Links", "Analytics", "QR codes", "Pricing"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button className="btn-primary" asChild>
              <Link href="/auth/login">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 mono-grid opacity-70" />
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <MousePointerClick className="size-3.5" />
                URL shortener
              </div>
              <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
                Short links that look sharp everywhere.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Create compact links, QR codes, and link-in-bio pages with a clean dashboard for tracking what gets clicked.
              </p>

              <div className="mt-10 max-w-2xl rounded-lg border border-border bg-card p-2 shadow-xl shadow-foreground/5">
                <form className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Paste a long URL"
                      className="h-14 rounded-md border-border bg-background pl-12 text-base font-medium"
                    />
                  </div>
                  <Button className="btn-primary h-14 px-7 text-base">
                    Shorten
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Custom slugs", "Click analytics", "QR export"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check className="size-4 text-foreground" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg border border-border bg-card p-3 shadow-2xl shadow-foreground/10">
                <div className="flex items-center justify-between border-b border-border px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold">cuttly.io/l/spring</p>
                    <p className="text-xs text-muted-foreground">Redirects to product launch page</p>
                  </div>
                  <Button variant="outline" size="icon" className="size-9">
                    <Copy className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-md border border-border bg-background p-4">
                      <div className="text-2xl font-semibold tabular-nums">{stat.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-3 pt-0">
                  {[72, 46, 88, 62, 55].map((width, index) => (
                    <div key={index} className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-xs">
                      <span className="font-mono text-muted-foreground">day {index + 1}</span>
                      <span className="h-2 rounded-full bg-muted">
                        <span className="block h-2 rounded-full bg-foreground" style={{ width: `${width}%` }} />
                      </span>
                      <span className="text-right font-mono text-muted-foreground">{width}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-5">
                  <Smartphone className="mb-4 size-5" />
                  <p className="font-semibold">Bio page</p>
                  <p className="mt-1 text-sm text-muted-foreground">One link for every profile.</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <QrCode className="mb-4 size-5" />
                  <p className="font-semibold">QR code</p>
                  <p className="mt-1 text-sm text-muted-foreground">Ready for print or share.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything a shortener needs. Nothing it does not.</h2>
              <p className="mt-4 text-muted-foreground">
                A monochrome workspace for teams and solo builders who want links that are easy to create, share, and measure.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-lg border border-border bg-background p-6 transition-colors hover:bg-muted/50">
                  <feature.icon className="size-6" />
                  <h3 className="mt-8 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Link2 className="size-4" />
            Cuttly
          </div>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground">Support</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
          </div>
          <p>© 2026 Cuttly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
