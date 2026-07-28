'use client'

import { useState } from "react"
import Link from "next/link"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BillingPortalButton } from "@/components/billing/portal-button"
import type { Product } from "@/lib/products"

interface PlanSelectorProps {
  products: Product[]
  currentPlan: "free" | "pro" | "business"
  hasSubscription: boolean
}

const FREE_FEATURES = [
  "1 bio page",
  "50 short links / month",
  "Basic click analytics",
  "Standard support",
]

export function PlanSelector({ products, currentPlan, hasSubscription }: PlanSelectorProps) {
  const [interval, setInterval] = useState<"month" | "year">("month")

  const pro = products.find((p) => p.id === `pro-${interval}ly`)!
  const business = products.find((p) => p.id === `business-${interval}ly`)!

  const formatPrice = (cents: number) => `$${(cents / 100) % 1 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`

  return (
    <div className="space-y-8">
      <div className="mx-auto flex w-fit items-center rounded-md border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => setInterval("month")}
          className={`rounded-sm px-4 py-1.5 text-sm font-semibold transition-colors ${interval === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("year")}
          className={`rounded-sm px-4 py-1.5 text-sm font-semibold transition-colors ${interval === "year" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Yearly <span className="text-xs font-normal opacity-80">(save 17%)</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Free */}
        <div className="dash-panel relative p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Free</h3>
            <p className="text-sm text-muted-foreground min-h-10">For getting started with clean short links and one public page.</p>
          </div>
          <div className="mb-8 border-b border-border pb-8 flex items-baseline gap-1">
            <span className="text-5xl font-semibold text-foreground tracking-tight">$0</span>
            <span className="text-muted-foreground font-medium">/month</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Features included</p>
            <ul className="space-y-4 mb-8">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            {currentPlan === "free" ? (
              <Button className="w-full h-12 text-base btn-secondary bg-muted border-border text-muted-foreground cursor-default" disabled>
                Current Plan
              </Button>
            ) : hasSubscription ? (
              <BillingPortalButton />
            ) : (
              <Button className="w-full h-12 text-base btn-secondary bg-muted border-border text-muted-foreground cursor-default" disabled>
                Downgrade unavailable
              </Button>
            )}
          </div>
        </div>

        {/* Pro */}
        {[pro, business].map((product) => {
          const tier = product.id.startsWith("pro") ? "pro" : "business"
          const isCurrent = currentPlan === tier
          const isPopular = tier === "pro"
          return (
            <div
              key={product.id}
              className={`dash-panel relative p-6 flex flex-col ${isPopular ? "border-foreground ring-1 ring-foreground shadow-xl shadow-foreground/10" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                  <Zap className="h-3 w-3 fill-primary" /> Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2 capitalize">{tier}</h3>
                <p className="text-sm text-muted-foreground min-h-10">{product.description}</p>
              </div>
              <div className="mb-8 border-b border-border pb-8 flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-foreground tracking-tight">{formatPrice(product.priceInCents)}</span>
                <span className="text-muted-foreground font-medium">/{interval}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Features included</p>
                <ul className="space-y-4 mb-8">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                {isCurrent ? (
                  <Button className="w-full h-12 text-base btn-secondary bg-muted border-border text-muted-foreground cursor-default" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button className="w-full h-12 text-base btn-primary" asChild>
                    <Link href={`/dashboard/billing/checkout?plan=${product.id}`}>
                      Get {tier === "pro" ? "Pro" : "Business"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
