import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  Link2,
  Lock,
  QrCode,
  Smartphone,
  Sparkles,
  Tags,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SignalMotif } from "@/components/marketing/signal-motif"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import { QrModule } from "@/components/marketing/qr-module"
import { appOrigin } from "@/lib/app-url"

export const metadata = {
  title: "Features",
  description:
    "Everything Cuttly does: editable short links, QR codes that report back, real click analytics, password protection, expiry rules, bio pages and a documented REST API.",
}

/**
 * Features.
 *
 * A bento grid, not a stack of alternating sections — each panel proves its
 * capability with the real component that renders it elsewhere in the
 * product (the same `ClicksChart`, the same badge and mono vocabulary),
 * instead of an icon and a paragraph standing in for it.
 */

const timeline = Array.from({ length: 24 }, (_, i) => ({
  bucket: new Date(Date.now() - (23 - i) * 3600_000).toISOString(),
  clicks: Math.round(18 + Math.sin(i / 2.2) * 12 + Math.cos(i / 5) * 6),
}))

const MORE = [
  { icon: Tags, label: "Tags and saved filters" },
  { icon: Timer, label: "Click-limit expiry" },
  { icon: Smartphone, label: "Device-based redirects" },
]

export default function FeaturesPage() {
  const origin = appOrigin().replace(/^https?:\/\//, "")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <SignalMotif className="pointer-events-none absolute right-[-140px] top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-foreground/[0.05]" />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-24">
            <p className="mono-label mb-5 flex items-center justify-center gap-2">
              <span className="signal-dot relative flex size-1.5 rounded-full bg-brand" />
              Six systems, one account
            </p>
            <h1 className="font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[50px]">
              Everything a link needs. Nothing it doesn&apos;t.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-lg">
              Every panel below is the real thing — the same components that render inside your
              dashboard, not a mockup of what they might look like.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Start free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <section className="border-b border-border bg-subtle">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
            <div className="grid gap-5 lg:grid-cols-12">
              {/* Links — rewrite diff */}
              <FeatureCard
                className="lg:col-span-5"
                icon={Link2}
                title="One short link, always up to date"
                body="Change the destination whenever the campaign moves — the short URL printed on a flyer a year ago keeps working."
              >
                <div className="rounded-lg border border-border bg-background p-4 font-mono text-[12px] leading-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-destructive">−</span>
                    <span className="truncate line-through decoration-destructive/50">
                      {origin}/l/launch → …/2024-preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <span className="text-success">+</span>
                    <span className="truncate">{origin}/l/launch → …/2025-live</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Custom back-half", "Tags", "Bulk actions"].map((t) => (
                    <span key={t} className="code-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </FeatureCard>

              {/* Analytics — real mini chart */}
              <FeatureCard
                className="lg:col-span-7"
                icon={BarChart3}
                title="Only what actually happened"
                body="Every redirect is logged the moment it happens — referrer, country, device, browser and OS. Nothing here is modelled or estimated."
              >
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="mono-label">Clicks — last 24h</p>
                    <p className="mono-label text-brand">Live</p>
                  </div>
                  <ClicksChart data={timeline} range="24h" height={110} />
                  <div className="mt-1 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    {[
                      { label: "Clicks", value: "412" },
                      { label: "Unique", value: "298" },
                      { label: "Countries", value: "19" },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="tabular text-[16px] font-semibold leading-none">{s.value}</p>
                        <p className="mono-label mt-1.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FeatureCard>

              {/* QR codes — module grid */}
              <FeatureCard
                className="lg:col-span-4"
                icon={QrCode}
                title="Codes that report back"
                body="Generate, customize and download as PNG or SVG. Scans are tracked separately from link clicks."
              >
                <div className="flex items-center justify-center rounded-lg border border-border bg-background p-6">
                  <QrModule className="size-28 text-foreground" accentClassName="text-brand" />
                </div>
              </FeatureCard>

              {/* Security & control — masked field */}
              <FeatureCard
                className="lg:col-span-4"
                icon={Lock}
                title="Decide who gets through"
                body="Password-gate a link, expire it by date or click count, or route by device — without changing the URL."
              >
                <div className="space-y-2.5 rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="text-muted-foreground">Password</span>
                    <span className="tracking-[0.3em]">••••••••</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="text-muted-foreground">Expires</span>
                    <span>2026-01-01</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-t border-border pt-2.5 text-[12px] text-success">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Destination hidden until verified
                  </div>
                </div>
              </FeatureCard>

              {/* Bio pages — stacked blocks */}
              <FeatureCard
                className="lg:col-span-4"
                icon={Sparkles}
                title="One link, many destinations"
                body="A bio page turns a single link into a profile, launch or menu — with reorderable blocks and its own theme."
              >
                <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                  {["Portfolio", "Book a call", "Instagram"].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-full bg-brand/10 px-3.5 py-2 text-[12px] font-medium text-foreground"
                    >
                      {label}
                      <ArrowRight className="size-3 text-brand" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* API — terminal window */}
        <section className="ink-band dark border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="mono-label">One request</p>
                <h2 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
                  From URL to short link in one call.
                </h2>
                <p className="mt-3 max-w-md text-[13px] leading-7 text-muted-foreground">
                  The same endpoint the dashboard itself uses — nothing held back for a
                  separate &quot;enterprise API&quot;.
                </p>
                <Button asChild variant="outline" className="mt-7">
                  <Link href="/auth/sign-up">Get an API key</Link>
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-warning/60" />
                  <span className="size-2.5 rounded-full bg-success/60" />
                  <span className="mono-label ml-2">POST /api/v1/links</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-6">
                  <code>
                    <span className="text-brand">curl</span> -X POST https://{origin}/api/v1/links \{"\n"}
                    {"  "}-H &quot;Authorization: Bearer ck_live_…&quot; \{"\n"}
                    {"  "}-H &quot;Content-Type: application/json&quot; \{"\n"}
                    {"  "}-d &apos;{`{ "url": "https://example.com/launch", "alias": "launch" }`}&apos;
                    {"\n\n"}
                    <span className="text-muted-foreground">{`{ "data": { "shortCode": "launch", "clickCount": 0 } }`}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Also included */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {MORE.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <item.icon className="size-4 text-brand" aria-hidden="true" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-24">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Try it with your own link.
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

function FeatureCard({
  icon: Icon,
  title,
  body,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`surface flex flex-col p-6 ${className || ""}`}>
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-subtle text-brand"
      >
        <Icon className="size-4" />
      </span>
      <h2 className="mt-4 font-display text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{body}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}
