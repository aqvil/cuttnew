'use client'

import { useSearchParams } from "next/navigation"
import { Checkout } from "@/components/billing/checkout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { PRODUCTS } from "@/lib/products"
import { Suspense } from "react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan")

  const product = PRODUCTS.find(p => p.id === planId)

  if (!planId || !product) {
    return (
      <div className="dash-narrow">
        <div className="dash-empty">
            <h3 className="text-lg font-semibold mb-2">Invalid Plan</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              The selected plan was not found. Please select a valid plan.
            </p>
            <Button asChild>
              <Link href="/dashboard/billing">View Plans</Link>
            </Button>
        </div>
      </div>
    )
  }

  const priceDisplay = product.interval === 'year' 
    ? `$${(product.priceInCents / 100).toFixed(0)}/year`
    : `$${(product.priceInCents / 100).toFixed(0)}/month`

  return (
    <div className="dash-narrow">
      <div className="dash-hero flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="dash-kicker mb-3">Checkout</div>
          <h1 className="dash-title">Checkout</h1>
          <p className="text-muted-foreground">
            Subscribe to {product.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Order Summary */}
        <div className="dash-panel lg:col-span-2">
          <div className="dash-panel-header">
            <div>
            <h2 className="dash-panel-title">Order Summary</h2>
            <p className="text-sm text-muted-foreground">
              {product.name}
            </p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm">{product.name}</span>
              <span className="font-medium">{priceDisplay}</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{priceDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4">
              <Shield className="h-4 w-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="dash-panel lg:col-span-3">
          <div className="dash-panel-header">
            <div>
            <h2 className="dash-panel-title">Payment Details</h2>
            <p className="text-sm text-muted-foreground">
              Enter your payment information to complete your subscription
            </p>
            </div>
          </div>
          <div className="p-5">
            <Checkout productId={planId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
