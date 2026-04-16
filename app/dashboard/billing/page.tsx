import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
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
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">Current Plan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            You are currently on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
          </p>
        </div>
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-xl font-semibold capitalize">{currentPlan}</p>
            {hasSubscription && (
              <p className="text-xs text-muted-foreground">
                Your subscription renews automatically
              </p>
            )}
          </div>
          {hasSubscription && (
            <BillingPortalButton />
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="mb-4 text-sm font-medium">
          {hasSubscription ? "Change Plan" : "Upgrade Your Plan"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toLowerCase()
            
            return (
              <div 
                key={plan.name} 
                className={`relative rounded-lg border bg-card p-5 transition-colors ${
                  plan.popular 
                    ? 'border-foreground' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                    <Sparkles className="size-3" />
                    Popular
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium">{plan.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="mb-5">
                  <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                
                <ul className="mb-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs">
                      <Check className="size-3.5 text-muted-foreground" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isCurrentPlan ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.productId ? (
                  <Button 
                    size="sm"
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/dashboard/billing/checkout?plan=${plan.productId}`}>
                      {currentPlan === "free" ? "Upgrade" : "Switch Plan"}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Free Forever
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">FAQ</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="p-5">
            <h4 className="text-sm font-medium">Can I cancel anytime?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the billing period.
            </p>
          </div>
          <div className="p-5">
            <h4 className="text-sm font-medium">What happens when I upgrade?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Your new plan takes effect immediately. We&apos;ll prorate the remaining time from your current plan.
            </p>
          </div>
          <div className="p-5">
            <h4 className="text-sm font-medium">Do you offer refunds?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              We offer a 7-day money-back guarantee on all paid plans. Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
