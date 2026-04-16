import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Sparkles } from "lucide-react"
import Link from "next/link"
import { PRODUCTS } from "@/lib/products"
import { BillingPortalButton } from "@/components/billing/portal-button"

export const metadata = {
  title: "Billing",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 Bio Page",
      "50 Short Links/month",
      "Basic Analytics",
      "Standard Themes"
    ],
    productId: null,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For creators and professionals",
    features: [
      "Unlimited Bio Pages",
      "500 Short Links/month",
      "Advanced Analytics",
      "Custom Themes",
      "AI Content Generation",
      "Remove Branding",
    ],
    productId: "pro-monthly",
    popular: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Unlimited Short Links",
      "Custom Domains",
      "Team Collaboration",
      "Priority Support",
      "API Access",
    ],
    productId: "business-monthly",
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  const currentPlan = profile?.plan || "free"
  const hasSubscription = profile?.stripe_customer_id && currentPlan !== "free"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            You are currently on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold capitalize">{currentPlan}</p>
              {hasSubscription && (
                <p className="text-sm text-muted-foreground">
                  Your subscription renews automatically
                </p>
              )}
            </div>
            {hasSubscription && (
              <BillingPortalButton />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {hasSubscription ? "Change Plan" : "Upgrade Your Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toLowerCase()
            
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-foreground shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.productId ? (
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href={`/dashboard/billing/checkout?plan=${plan.productId}`}>
                        {currentPlan === "free" ? "Upgrade" : "Switch Plan"}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens when I upgrade?</h4>
            <p className="text-sm text-muted-foreground">
              Your new plan takes effect immediately. We&apos;ll prorate the remaining time from your current plan.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 7-day money-back guarantee on all paid plans. Contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
