'use client'

import { useState } from "react"
import Link from "next/link"
import { Check, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BillingPortalButton } from "@/components/billing/portal-button"
import { PLANS, type PlanId } from "@/lib/plans"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

/**
 * Plan comparison and upgrade.
 *
 * Feature rows are read from `lib/plans.ts` — the same source the server uses
 * to enforce quotas — so what's advertised and what's allowed can't diverge.
 */

const BLURBS: Record<PlanId, string> = {
  free: "For personal links and trying things out.",
  pro: "For creators and marketers running campaigns.",
  business: "For teams that need domains and API access.",
}

const ROWS: Array<{ label: string; value: (plan: (typeof PLANS)[PlanId]) => string | boolean }> = [
  {
    label: "Links per month",
    value: (plan) =>
      plan.linksPerMonth === null ? "Unlimited" : plan.linksPerMonth.toLocaleString(),
  },
  {
    label: "Analytics history",
    value: (plan) =>
      plan.analyticsRetentionDays >= 365
        ? `${Math.round(plan.analyticsRetentionDays / 365)} year${plan.analyticsRetentionDays >= 730 ? "s" : ""}`
        : `${plan.analyticsRetentionDays} days`,
  },
  { label: "Custom back-halves", value: (plan) => plan.customAlias },
  { label: "Password protection", value: (plan) => plan.passwordProtection },
  { label: "Expiry & click limits", value: (plan) => plan.linkExpiration },
  {
    label: "Custom domains",
    value: (plan) => (plan.customDomains === 0 ? false : String(plan.customDomains)),
  },
  { label: "API keys", value: (plan) => (plan.apiKeys === 0 ? false : String(plan.apiKeys)) },
  { label: "Team collaboration", value: (plan) => plan.teamCollaboration },
]

const ORDER: PlanId[] = ["free", "pro", "business"]

export function PlanSelector({
  products,
  currentPlan,
  hasSubscription,
}: {
  products: Product[]
  currentPlan: PlanId
  hasSubscription: boolean
}) {
  const [interval, setInterval] = useState<"month" | "year">("month")

  const priceFor = (id: PlanId): { amount: string; cadence: string; productId?: string } => {
    if (id === "free") return { amount: "$0", cadence: "forever" }

    const product = products.find((p) => p.id === `${id}-${interval}ly`)
    if (!product) return { amount: "—", cadence: "" }

    const dollars = product.priceInCents / 100
    return {
      amount: `$${dollars % 1 === 0 ? dollars : dollars.toFixed(2)}`,
      cadence: interval === "year" ? "per year" : "per month",
      productId: product.id,
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing interval"
          className="inline-flex items-center rounded-md border border-border bg-subtle p-0.5"
        >
          {(["month", "year"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              aria-pressed={interval === value}
              className={cn(
                "rounded-[2px] px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors",
                interval === value
                  ? "border border-border bg-card text-foreground"
                  : "border border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {value === "month" ? "Monthly" : "Yearly"}
              {value === "year" ? (
                <span className="ml-1.5 text-xs text-success">save 17%</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {ORDER.map((id) => {
          const plan = PLANS[id]
          const price = priceFor(id)
          const isCurrent = currentPlan === id
          const highlighted = id === "pro" && !isCurrent

          return (
            <div
              key={id}
              className={cn(
                "flex flex-col rounded-lg border bg-card p-6",
                isCurrent ? "border-foreground" : highlighted ? "border-foreground/40" : "border-border"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{plan.name}</h3>
                {isCurrent ? (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium">
                    Current plan
                  </span>
                ) : highlighted ? (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
              </div>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-[-0.03em]">{price.amount}</span>
                <span className="text-sm text-muted-foreground">{price.cadence}</span>
              </p>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">{BLURBS[id]}</p>

              <div className="mt-6">
                {isCurrent ? (
                  hasSubscription ? (
                    <BillingPortalButton className="w-full" />
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Your current plan
                    </Button>
                  )
                ) : id === "free" ? (
                  hasSubscription ? (
                    <BillingPortalButton className="w-full" label="Cancel subscription" />
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Included
                    </Button>
                  )
                ) : (
                  <Button
                    asChild
                    variant={highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href={`/dashboard/billing/checkout?plan=${price.productId}`}>
                      Upgrade to {plan.name}
                    </Link>
                  </Button>
                )}
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                {ROWS.map((row) => {
                  const value = row.value(plan)
                  const included = value !== false
                  return (
                    <li key={row.label} className="flex items-start gap-2.5 text-sm">
                      {included ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      ) : (
                        <Minus
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
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
    </div>
  )
}
