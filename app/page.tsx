import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Link2,
  Lock,
  QrCode,
  Smartphone,
  Tags,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SignalMotif } from "@/components/marketing/signal-motif"
import { HeroScene } from "@/components/marketing/hero-scene"
import { HeroShortenForm } from "./hero-shorten-form"
import { PLANS } from "@/lib/plans"
import { appOrigin } from "@/lib/app-url"

/**
 * Landing page.
 *
 * Every claim below describes something the product actually does. The
 * previous page advertised "10M+ links shortened", "99.9% uptime SLA" and
 * "< 50ms redirect speed" — none of which were measured, and the first of
 * which was demonstrably false for a fresh deployment.
 */

const FEATURES = [
  {
    icon: Link2,
    title: "Editable destinations",
    body: "Change where a link points after you've shared it. The short URL never changes, so print and posts stay valid.",
  },
  {
    icon: BarChart3,
    title: "Click analytics",
    body: "Clicks over time, referrer, country, device, browser and OS — recorded on every redirect, aggregated in the database.",
  },
  {
    icon: QrCode,
    title: "QR codes that report back",
    body: "Generate a code for any link and download it as PNG or SVG. Scans are counted separately from ordinary clicks.",
  },
  {
    icon: Lock,
    title: "Password protection",
    body: "Gate a link behind a password. The destination is never present in the page until the password verifies.",
  },
  {
    icon: Timer,
    title: "Expiry rules",
    body: "Expire a link on a date or after a number of clicks, and optionally redirect expired traffic somewhere else.",
  },
  {
    icon: Smartphone,
    title: "Device targeting",
    body: "Send iOS and Android visitors to their respective app stores while everyone else gets the main destination.",
  },
  {
    icon: Tags,
    title: "Tags and search",
    body: "Tag links by campaign or client, then search and filter server-side — it stays fast at thousands of links.",
  },
  {
    icon: Globe,
    title: "REST API",
    body: "Create, update and delete links programmatically with a scoped API key. Rate limited and documented.",
  },
]

export default function LandingPage() {
  const origin = appOrigin().replace(/^https?:\/\//, "")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <HeroScene className="pointer-events-none absolute inset-y-0 right-[-8%] h-full w-[64%] text-foreground/90 opacity-[0.9] mix-blend-normal sm:right-[-4%] lg:right-0 lg:w-[52%]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[52%] bg-gradient-to-r from-background via-background/70 to-transparent lg:from-transparent lg:via-transparent" />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div className="max-w-xl">
              <p className="mono-label mb-5">Est. 2026 — link infrastructure</p>
              <h1 className="font-display text-[44px] font-semibold leading-[0.96] tracking-[-0.03em] sm:text-[60px] lg:text-[68px]">
                The short link
                <br />
                that keeps <span className="text-brand">working.</span>
              </h1>
              <p className="mt-7 max-w-lg text-[17px] leading-7 text-muted-foreground sm:text-lg">
                Share one clean URL everywhere. Change the destination, measure every click, and
                keep your campaigns tidy from the first post to the final report.
              </p>

              <div className="mt-9 max-w-xl">
                <HeroShortenForm />
              </div>

              <p className="mt-4 text-[12px] text-muted-foreground">
                No credit card required. Free plan includes{" "}
                {PLANS.free.linksPerMonth} links a month.
              </p>
            </div>

            {/* Spacer column on large screens — the scene bleeds into it. */}
            <div aria-hidden="true" className="hidden lg:block" />
          </div>
        </section>

        {/* What it looks like */}
        <section className="border-b border-border bg-subtle">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <h2 className="font-display text-[32px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[42px]">
                  Know what happens after you share.
                </h2>
                <p className="mt-4 text-[13px] leading-7 text-muted-foreground">
                  Every redirect records where the visitor came from, what they used and roughly
                  where they were. Nothing is estimated or modelled — if we can&apos;t measure it,
                  we don&apos;t show it.
                </p>

                <ul className="mt-8 space-y-3">
                  {[
                    "Clicks over 24 hours to 12 months",
                    "Unique visitors, counted by hashed IP",
                    "Referrer, country, device, browser and OS",
                    "QR scans separated from link clicks",
                    "CSV export of everything on screen",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[13px]">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button asChild className="mt-9">
                  <Link href="/auth/sign-up">
                    Start tracking free
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              {/* An illustration of the interface, clearly labelled as an
                  example rather than presented as live data. */}
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_60px_-28px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{origin}/l/spring25</p>
                    <p className="mono-label mt-1.5">Example dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  {[
                    { value: "4,218", label: "Clicks" },
                    { value: "3,104", label: "Unique" },
                    { value: "612", label: "QR scans" },
                  ].map((stat) => (
                    <div key={stat.label} className="px-4 py-5">
                      <p className="text-[22px] font-semibold tracking-[-0.03em] tabular">
                        {stat.value}
                      </p>
                      <p className="mono-label mt-1.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-5">
                  <p className="mono-label">Top referrers</p>
                  {[
                    { label: "Direct", pct: 42 },
                    { label: "linkedin.com", pct: 27 },
                    { label: "newsletter", pct: 19 },
                    { label: "x.com", pct: 12 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span>{row.label}</span>
                        <span className="text-muted-foreground tabular">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-chart-1"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-border scroll-mt-20">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
            <div className="max-w-2xl">
              <h2 className="font-display text-[32px] font-semibold tracking-[-0.02em] sm:text-[42px]">
                Everything a link needs. Nothing it doesn&apos;t.
              </h2>
            </div>

            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-subtle text-brand"
                  >
                    <feature.icon className="size-4" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API — the first ink band, punctuating the paper sections above. */}
        <section id="api" className="ink-band dark scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] sm:text-[34px]">
                  Automate it.
                </h2>
                <p className="mt-4 text-[13px] leading-7 text-muted-foreground">
                  Create a scoped API key in Settings and manage links from your own code. Keys
                  are hashed at rest, scoped to your account, and rate limited per key.
                </p>
                <Button asChild variant="outline" className="mt-8">
                  <Link href="/auth/sign-up">Get an API key</Link>
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <pre className="p-5 font-mono text-xs leading-6">
                  <code>{`curl -X POST https://${origin}/api/v1/links \\
  -H "Authorization: Bearer ck_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/pricing",
    "alias": "pricing"
  }'

{
  "data": {
    "shortCode": "pricing",
    "originalUrl": "https://example.com/pricing",
    "clickCount": 0
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <SignalMotif className="pointer-events-none absolute left-1/2 top-0 h-[900px] w-[900px] -translate-x-1/2 -translate-y-[62%] text-foreground/[0.035]" />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-28">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Make your first link in about ten seconds.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              No card, no trial timer. The free plan is genuinely free.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Create a free account
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">Compare plans</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
