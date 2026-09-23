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
  Sparkles,
  Tags,
  Timer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SignalMotif } from "@/components/marketing/signal-motif"
import { appOrigin } from "@/lib/app-url"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Features",
  description:
    "Everything Cuttly does: editable short links, QR codes that report back, real click analytics, password protection, expiry rules, bio pages and a documented REST API.",
}

/**
 * Features.
 *
 * One section per real capability, in the order a new user actually reaches
 * for them: make the link, see what happened, print or share it, lock it
 * down, then automate it. Every bullet here maps to something wired up in
 * the product today — nothing is a roadmap item dressed as a feature.
 */

const SECTIONS = [
  {
    id: "links",
    icon: Link2,
    title: "One short link, always up to date",
    body: "Create a short link with a random code or your own custom back-half, then change the destination whenever the campaign moves — the short URL printed on a flyer or posted a year ago keeps working.",
    points: [
      "Custom back-halves you choose at creation, or a short random code",
      "Edit the destination URL at any time without breaking existing links",
      "Tag links by campaign or client, then search and filter server-side",
      "Bulk actions — tag, archive or delete many links at once",
      "Archive links you're done with instead of deleting your history",
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Only what actually happened",
    body: "Every redirect is logged the moment it happens. Nothing here is modelled, sampled or estimated — if we can't measure it, it doesn't appear on your dashboard.",
    points: [
      "Clicks over time, from the last 24 hours to the last 12 months",
      "Unique visitors, counted by hashed IP rather than a tracking cookie",
      "Referrer, country, device, browser and operating system breakdowns",
      "QR scans counted separately from ordinary link clicks",
      "CSV export of exactly what's on screen, for your own reporting",
    ],
  },
  {
    id: "qr-codes",
    icon: QrCode,
    title: "Codes that report back",
    body: "Generate a QR code for any link in one click, customize its colors, and download it as PNG or SVG for print. Every scan is tracked as its own event, separate from link clicks.",
    points: [
      "One QR code per link, generated instantly",
      "Foreground/background color and logo customization",
      "PNG and SVG downloads for both screen and print",
      "Scans tracked separately, with the same breakdown as link clicks",
    ],
  },
  {
    id: "control",
    icon: Lock,
    title: "Decide who gets through, and for how long",
    body: "Not every link should be open forever. Gate it, expire it, or route different visitors to different places — all without changing the link you've already shared.",
    points: [
      "Password protection — the destination is never present in the page until the password verifies",
      "Expiry by date or after a set number of clicks, with an optional fallback URL",
      "Device targeting: send iOS and Android visitors to their app stores while everyone else gets the main destination",
    ],
  },
  {
    id: "bio-pages",
    icon: Sparkles,
    title: "When one link needs to open many",
    body: "A bio page turns a single short link into a page of destinations — a profile, a product launch, a menu, or a campaign with several calls to action — with its own theme and block layout you control.",
    points: [
      "One link opens a page of many destinations, each tracked individually",
      "Reorderable content blocks: links, text, and email capture",
      "Custom colors and layout per page, independent of your dashboard theme",
      "Action pages for a single focused landing experience — video, lead form, one clear call to action",
    ],
  },
  {
    id: "api",
    icon: Globe,
    title: "Automate it",
    body: "Everything you can do by hand in the dashboard, you can do from your own code. Create a scoped API key in Settings and manage links programmatically.",
    points: [
      "REST API to create, update and delete links",
      "Keys are hashed at rest and scoped to your account",
      "Rate limited per key, with request and response shapes documented",
    ],
  },
]

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
        <section className="relative overflow-hidden border-b border-border">
          <SignalMotif className="pointer-events-none absolute right-[-140px] top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-foreground/[0.05]" />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-6 lg:py-24">
            <h1 className="font-display text-[38px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[50px]">
              Everything a link needs. Nothing it doesn&apos;t.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-lg">
              Six real capabilities, wired up end to end — from the first redirect to the CSV
              export you send your client.
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

        {SECTIONS.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={index % 2 === 1 ? "border-b border-border bg-subtle scroll-mt-20" : "border-b border-border scroll-mt-20"}
          >
            <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <span
                    aria-hidden="true"
                    className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-brand"
                  >
                    <section.icon className="size-5" />
                  </span>
                  <h2 className="mt-5 font-display text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-[14px] leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                </div>

                <ul className={cn("space-y-3.5", index % 2 === 1 ? "lg:order-1" : "")}>
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[14px] leading-6">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* API example */}
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
              </div>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <pre className="p-5 font-mono text-xs leading-6">
                  <code>{`curl -X POST https://${origin}/api/v1/links \\
  -H "Authorization: Bearer ck_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{ "url": "https://example.com/launch", "alias": "launch" }'`}</code>
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

