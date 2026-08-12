import Link from "next/link"
import { Check, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { PLANS } from "@/lib/plans"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Pricing",
  description: "Simple plans for short links, QR codes and click analytics.",
}

/**
 * Pricing.
 *
 * The numbers here are read from `lib/plans.ts` — the same module the server
 * uses to enforce quotas. There is no second, hand-maintained copy that can
 * drift away from what the product actually allows.
 */

const PRICES = {
  free: { amount: "$0", cadence: "forever", blurb: "For personal links and trying things out." },
  pro: { amount: "$9", cadence: "per month", blurb: "For creators and marketers running campaigns." },
  business: { amount: "$29", cadence: "per month", blurb: "For teams that need domains and API access." },
} as const

type Row = {
  label: string
  value: (plan: (typeof PLANS)[keyof typeof PLANS]) => string | boolean
}

const ROWS: Row[] = [
  {
    label: "Links per month",
    value: (plan) => (plan.linksPerMonth === null ? "Unlimited" : plan.linksPerMonth.toLocaleString()),
  },
  { label: "Custom back-halves", value: (plan) => plan.customAlias },
  { label: "QR codes", value: () => "Unlimited" },
  { label: "Password protection", value: (plan) => plan.passwordProtection },
  { label: "Expiry & click limits", value: (plan) => plan.linkExpiration },
  {
    label: "Analytics history",
    value: (plan) =>
      plan.analyticsRetentionDays >= 365
        ? `${Math.round(plan.analyticsRetentionDays / 365)} year${plan.analyticsRetentionDays >= 730 ? "s" : ""}`
        : `${plan.analyticsRetentionDays} days`,
  },
  {
    label: "Bio pages",
    value: (plan) => (plan.bioPages === null ? "Unlimited" : String(plan.bioPages)),
  },
  {
    label: "Custom domains",
    value: (plan) => (plan.customDomains === 0 ? false : String(plan.customDomains)),
  },
  {
    label: "API keys",
    value: (plan) => (plan.apiKeys === 0 ? false : String(plan.apiKeys)),
  },
  { label: "Team collaboration", value: (plan) => plan.teamCollaboration },
]

const ORDER = ["free", "pro", "business"] as const

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Straightforward pricing
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Start free and stay free if that&apos;s all you need. Upgrade when you want custom
              domains, API access or a longer analytics history.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {ORDER.map((id) => {
              const plan = PLANS[id]
              const price = PRICES[id]
              const highlighted = id === "pro"

              return (
                <div
                  key={id}
                  className={cn(
                    "flex flex-col rounded-lg border bg-card p-6",
                    highlighted ? "border-foreground" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{plan.name}</h2>
                    {highlighted ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                        Most popular
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-[-0.03em]">
                      {price.amount}
                    </span>
                    <span className="text-sm text-muted-foreground">{price.cadence}</span>
                  </p>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{price.blurb}</p>

                  <Button
                    asChild
                    variant={highlighted ? "default" : "outline"}
                    className="mt-6 w-full"
                  >
                    <Link href="/auth/sign-up">
                      {id === "free" ? "Start free" : `Choose ${plan.name}`}
                    </Link>
                  </Button>

                  <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                    {ROWS.slice(0, 6).map((row) => {
                      const value = row.value(plan)
                      const included = value !== false
                      return (
                        <li key={row.label} className="flex items-start gap-2.5 text-sm">
                          {included ? (
                            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                          ) : (
                            <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          )}
                          <span className={cn(!included && "text-muted-foreground")}>
                            {row.label}
                            {typeof value === "string" ? (
                              <span className="text-muted-foreground"> — {value}</span>
                            ) : null}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Full comparison */}
          <section className="mt-20">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">Compare every plan</h2>

            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[600px] text-sm">
                <caption className="sr-only">Feature comparison across Cuttly plans</caption>
                <thead>
                  <tr className="border-b border-border bg-subtle">
                    <th scope="col" className="px-4 py-3 text-left font-medium">
                      Feature
                    </th>
                    {ORDER.map((id) => (
                      <th key={id} scope="col" className="px-4 py-3 text-left font-medium">
                        {PLANS[id].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ROWS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="px-4 py-3 text-left font-normal">
                        {row.label}
                      </th>
                      {ORDER.map((id) => {
                        const value = row.value(PLANS[id])
                        return (
                          <td key={id} className="px-4 py-3">
                            {value === true ? (
                              <>
                                <Check className="size-4 text-success" aria-hidden="true" />
                                <span className="sr-only">Included</span>
                              </>
                            ) : value === false ? (
                              <>
                                <Minus className="size-4 text-muted-foreground" aria-hidden="true" />
                                <span className="sr-only">Not included</span>
                              </>
                            ) : (
                              value
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Need something else?{" "}
            <Link href="/contact" className="link-brand font-medium">
              Get in touch
            </Link>{" "}
            and we&apos;ll work it out.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
