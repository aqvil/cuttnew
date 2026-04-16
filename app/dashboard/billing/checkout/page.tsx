'use client'

import { useSearchParams } from "next/navigation"
import { Checkout } from "@/components/billing/checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">Invalid Plan</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              The selected plan was not found. Please select a valid plan.
            </p>
            <Button asChild>
              <Link href="/dashboard/billing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const priceDisplay = product.interval === 'year' 
    ? `$${(product.priceInCents / 100).toFixed(0)}/year`
    : `$${(product.priceInCents / 100).toFixed(0)}/month`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">
            Subscribe to {product.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
            <CardDescription>
              {product.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{product.name}</span>
              <span className="font-medium">{priceDisplay}</span>
            </div>
            <hr />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{priceDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4">
              <Shield className="h-4 w-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Payment Details</CardTitle>
            <CardDescription>
              Enter your payment information to complete your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Checkout productId={planId} />
          </CardContent>
        </Card>
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
