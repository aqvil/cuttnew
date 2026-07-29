import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Link2,
  Lock,
  MousePointerClick,
  QrCode,
  Smartphone,
  Tag,
  Timer,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroShortenForm } from "./hero-shorten-form"

const features = [
  {
    icon: Link2,
    title: "Short links",
    desc: "Turn any URL into a clean, shareable link with a custom back-half. Instant redirects, zero friction.",
  },
  {
    icon: BarChart3,
    title: "Deep analytics",
    desc: "Track clicks, referrers, countries, browsers, and devices — per link, in real time.",
  },
  {
    icon: QrCode,
    title: "QR codes",
    desc: "Generate high-res QR codes for every link. Download PNG with your branding built in.",
  },
  {
    icon: Smartphone,
    title: "Bio pages",
    desc: "One public page. Many destinations. Perfect for Instagram, Twitter, and everywhere else.",
  },
  {
    icon: Lock,
    title: "Password protection",
    desc: "Gate any link behind a password. Share sensitive content with only the right audience.",
  },
  {
    icon: Timer,
    title: "Link expiration",
    desc: "Set links to auto-expire on a date or after a click limit. Perfect for time-limited campaigns.",
  },
  {
    icon: Tag,
    title: "Tags & organization",
    desc: "Label links with tags for campaigns, clients, or channels. Filter and export instantly.",
  },
  {
    icon: Globe,
    title: "UTM tracking",
    desc: "Auto-append UTM parameters to destination URLs for seamless GA4 and analytics integration.",
  },
  {
    icon: Shield,
    title: "Reliable uptime",
    desc: "99.9% uptime SLA. Every redirect is served from the edge so nothing breaks at the worst time.",
  },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For anyone getting started",
    features: [
      "50 short links / month",
      "Basic click analytics",
      "QR code download",
      "1 bio page",
      "Link expiration",
      "Password protection",
    ],
    cta: "Get started free",
    href: "/auth/login",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    description: "For creators and professionals",
    features: [
      "500 short links / month",
      "Advanced analytics",
      "Unlimited bio pages",
      "Custom slugs",
      "UTM campaign builder",
      "Remove branding",
      "Custom themes",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/auth/login",
    popular: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    description: "For teams and agencies",
    features: [
      "Unlimited short links",
      "Everything in Pro",
      "Custom domains",
      "Team collaboration",
      "API access",
      "Dedicated support",
      "Analytics export",
      "SSO (coming soon)",
    ],
    cta: "Start Business",
    href: "/auth/login",
    popular: false,
  },
]

const stats = [
  { value: "10M+", label: "links shortened" },
  { value: "99.9%", label: "redirect uptime" },
  { value: "< 50ms", label: "redirect speed" },
  { value: "180+", label: "countries tracked" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-md border border-foreground bg-foreground text-background shadow-sm">
              <Link2 className="size-3.5 stroke-[3]" />
            </span>
            <span className="text-lg">Cuttly</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Analytics", href: "#analytics" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden text-sm sm:inline-flex" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button className="btn-primary" asChild>
              <Link href="/auth/login">
                Get started <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border bg-background">
          {/* Grid bg */}
          <div className="absolute inset-0 mono-grid opacity-60 pointer-events-none" />
          {/* Radial spotlight */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-foreground/[0.03] blur-3xl" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <span className="dash-kicker">
                <MousePointerClick className="size-3.5" />
                URL shortener &amp; analytics
              </span>
            </div>

            <h1
              className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tighter text-foreground sm:text-6xl lg:text-7xl animate-fade-in-up"
              style={{ animationDelay: "60ms" }}
            >
              Short links that do
              <br />
              <span className="relative inline-block">
                more than redirect.
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-foreground/15 rounded-full" />
              </span>
            </h1>

            <p
              className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl animate-fade-in-up"
              style={{ animationDelay: "120ms" }}
            >
              Shorten URLs, track every click, generate QR codes, and build link-in-bio pages.
              The link infrastructure for builders who care about data.
            </p>

            <div
              className="animate-fade-in-up flex w-full max-w-2xl justify-center"
              style={{ animationDelay: "180ms" }}
            >
              <HeroShortenForm />
            </div>

            <div
              className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground animate-fade-in-up"
              style={{ animationDelay: "240ms" }}
            >
              {["No credit card required", "Free forever plan", "Instant setup"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="size-3.5 text-foreground" />
                  {item}
                </span>
              ))}
            </div>

            {/* Stats bar */}
            <div
              className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="dash-panel p-5 text-center">
                  <div className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Analytics Preview ───────────────────────────────────── */}
        <section id="analytics" className="border-b border-border bg-muted/30 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="dash-kicker mb-6 w-fit">
                  <TrendingUp className="size-3.5" />
                  Analytics
                </div>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Know exactly who clicks,
                  <br />
                  where, and when.
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  Every link comes with a full analytics dashboard. Track clicks over time,
                  referrer sources, country breakdown, devices, and browsers — all in one place.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "30-day click timeline",
                    "Country & city breakdown",
                    "Device & browser stats",
                    "Referrer source tracking",
                    "QR code scans vs. link clicks",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                        <Check className="size-3 text-foreground" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Button className="btn-primary" asChild>
                    <Link href="/auth/login">Start tracking free <ArrowRight className="size-4" /></Link>
                  </Button>
                </div>
              </div>

              {/* Fake analytics card */}
              <div className="relative animate-float">
                <div className="dash-panel overflow-hidden p-0">
                  <div className="border-b border-border px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">cuttly.io/l/spring25</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Spring campaign → product page</p>
                      </div>
                      <span className="dash-kicker text-[10px]">Live</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                    {[
                      { v: "4,218", l: "Total clicks" },
                      { v: "62%", l: "Mobile" },
                      { v: "US", l: "Top country" },
                    ].map((s) => (
                      <div key={s.l} className="p-4 text-center">
                        <div className="text-xl font-bold tabular-nums">{s.v}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { label: "chrome", pct: 58 },
                      { label: "safari", pct: 28 },
                      { label: "firefox", pct: 9 },
                      { label: "edge", pct: 5 },
                    ].map((b) => (
                      <div key={b.label} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                        <span className="font-mono text-muted-foreground capitalize">{b.label}</span>
                        <span className="h-1.5 rounded-full bg-muted">
                          <span
                            className="block h-1.5 rounded-full bg-foreground transition-all"
                            style={{ width: `${b.pct}%` }}
                          />
                        </span>
                        <span className="text-right font-semibold tabular-nums">{b.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────────────── */}
        <section id="features" className="border-b border-border bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="max-w-2xl">
              <div className="dash-kicker mb-6 w-fit">
                <Zap className="size-3.5" />
                Features
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Everything a link needs. Nothing it doesn't.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                A focused toolkit for teams and solo builders who want links that are easy to
                create, share, and measure.
              </p>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="dash-panel group cursor-default p-6 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="dash-icon mb-6 transition-colors group-hover:bg-foreground group-hover:text-background">
                    <feature.icon className="size-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────── */}
        <section id="pricing" className="border-b border-border bg-muted/20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="dash-kicker mb-6 w-fit mx-auto">
                <Zap className="size-3.5" />
                Pricing
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, honest pricing.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Start free. Upgrade when you need more links, deeper analytics, or custom domains.
                No hidden fees, no surprise overages.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`pricing-card ${plan.popular ? "pricing-card-popular" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-bold text-background">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      {plan.name}
                    </p>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                      {plan.period && (
                        <span className="mb-1.5 text-base text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="size-4 mt-0.5 shrink-0 text-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={plan.popular ? "btn-primary w-full h-11" : "btn-secondary w-full h-11"}
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              All plans include a 14-day money-back guarantee. Need more?{" "}
              <a href="mailto:sales@cuttly.io" className="underline hover:text-foreground">
                Contact sales
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <section className="bg-foreground py-20">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
            <div className="mono-grid-sm absolute inset-0 opacity-10 pointer-events-none" />
            <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl">
              Your first short link is free.
              <br />
              No account needed to try.
            </h2>
            <p className="mt-4 text-base text-background/70">
              Paste a URL above or sign up to get full analytics, custom slugs, and QR codes.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button className="h-12 px-8 bg-background text-foreground hover:bg-background/90 text-sm font-semibold rounded-full" asChild>
                <Link href="/auth/login">Create free account</Link>
              </Button>
              <Button className="h-12 px-8 bg-transparent text-background border border-background/30 hover:bg-background/10 text-sm font-semibold rounded-full" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="flex size-7 items-center justify-center rounded-md border border-foreground bg-foreground text-background">
                  <Link2 className="size-3 stroke-[3]" />
                </span>
                Cuttly
              </Link>
              <p className="mt-3 text-xs leading-6 text-muted-foreground max-w-xs">
                The smart URL shortener with deep analytics, QR codes, and bio pages for modern teams.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Product</p>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "Analytics", "QR Codes"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Company</p>
              <ul className="space-y-2.5">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Legal</p>
              <ul className="space-y-2.5">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">© 2026 Cuttly. All rights reserved.</p>
            <p className="text-xs text-muted-foreground font-mono">v2.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
