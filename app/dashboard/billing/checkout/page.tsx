'use client'

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/app/page-header"
import { EmptyState } from "@/components/app/empty-state"
import { Checkout } from "@/components/billing/checkout"
import { PRODUCTS } from "@/lib/products"

function CheckoutContent() {
  const planId = useSearchParams().get("plan")
  const product = PRODUCTS.find((p) => p.id === planId)

  if (!planId || !product) {
    return (
      <div className="page-narrow">
        <EmptyState
          title="That plan doesn't exist"
          description="The plan in this link isn't one we offer. Pick one from the billing page and we'll take it from there."
          action={
            <Button asChild>
              <Link href="/dashboard/billing">View plans</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const dollars = product.priceInCents / 100
  const price = `$${dollars % 1 === 0 ? dollars : dollars.toFixed(2)}`
  const cadence = product.interval === "year" ? "per year" : "per month"

  return (
    <div className="page">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 text-muted-foreground">
        <Link href="/dashboard/billing">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to plans
        </Link>
      </Button>

      <PageHeader
        title="Complete your upgrade"
        description={`You're subscribing to ${product.name}. You can cancel at any time from the billing portal.`}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <aside className="space-y-4 rounded-lg border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold">Order summary</h2>

          <dl className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{product.name}</dt>
              <dd className="font-medium tabular">{price}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="font-medium tabular">
                {price} <span className="font-normal text-muted-foreground">{cadence}</span>
              </dd>
            </div>
          </dl>

          <ul className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
            {product.features.slice(0, 5).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <p className="flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Payment is handled entirely by Stripe. Card details never reach our servers.
          </p>
        </aside>

        <div className="min-w-0 rounded-lg border border-border bg-card p-5">
          <Checkout productId={planId} />
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="page space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
