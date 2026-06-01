import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CreditCard, Check, ArrowRight, Building2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Billing & Plans - LinkForge",
}

export default async function BillingPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  // Normalize plan names
  let currentPlan = profile?.plan?.toLowerCase() || "free"
  if (currentPlan !== "free" && currentPlan !== "pro" && currentPlan !== "enterprise") {
     currentPlan = "free"
  }

  const plans = [
    {
      name: "Free",
      id: "free",
      price: "$0",
      period: "/month",
      description: "For getting started with clean short links and one public page.",
      features: [
        "1 bio page",
        "50 short links / month",
        "Basic click analytics",
        "Standard support"
      ],
      current: currentPlan === "free"
    },
    {
      name: "Core",
      id: "pro",
      price: "$8",
      period: "/month",
      description: "For creators and teams sharing links every week.",
      features: [
        "Unlimited bio pages",
        "500 short links / month",
        "Advanced analytics and trends",
        "Custom link back-halves",
        "Priority email support"
      ],
      popular: true,
      current: currentPlan === "pro"
    },
    {
      name: "Premium",
      id: "enterprise",
      price: "$29",
      period: "/month",
      description: "For businesses that need domains, bulk creation, and scale.",
      features: [
        "Everything in Core",
        "3,000 short links / month",
        "White-label custom domains",
        "Bulk link creation",
        "24/7 dedicated support"
      ],
      current: currentPlan === "enterprise"
    }
  ]

  return (
    <div className="dash-page font-sans">
      <div className="dash-hero text-center">
         <div className="dash-kicker mx-auto mb-4">
          <CreditCard className="size-3.5" />
          Billing
         </div>
         <h1 className="dash-title">Plans for more links</h1>
         <p className="dash-subtitle mx-auto">Stay on Free while you explore. Upgrade when you need more monthly links, deeper analytics, or custom domains.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`dash-panel relative p-6 flex flex-col ${
              plan.popular ? 'border-foreground ring-1 ring-foreground shadow-xl shadow-foreground/10' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                <Zap className="h-3 w-3 fill-primary" /> Most Popular
              </div>
            )}
            
            <div className="mb-6">
               <h3 className="text-2xl font-semibold text-foreground mb-2">{plan.name}</h3>
               <p className="text-sm text-muted-foreground min-h-10">{plan.description}</p>
            </div>

            <div className="mb-8 border-b border-border pb-8 flex items-baseline gap-1">
              <span className="text-5xl font-semibold text-foreground tracking-tight">{plan.price}</span>
              <span className="text-muted-foreground font-medium">{plan.period}</span>
            </div>

            <div className="flex-1">
               <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Features included</p>
               <ul className="space-y-4 mb-8">
               {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                     <Check className="h-5 w-5 text-primary shrink-0" />
                     {feature}
                  </li>
               ))}
               </ul>
            </div>

            <div className="mt-auto">
               <Button 
                  className={`w-full h-12 text-base ${
                     plan.current ? 'btn-secondary bg-muted border-border text-muted-foreground cursor-default' : 'btn-primary'
                  }`}
               >
                  {plan.current ? "Current Plan" : `Get ${plan.name}`}
               </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-12 dash-panel p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="dash-icon size-16">
               <Building2 className="h-7 w-7" />
            </div>
            <div>
               <h2 className="text-2xl font-semibold text-foreground mb-2">Need a custom solution?</h2>
               <p className="text-muted-foreground max-w-xl">
                 For high-volume link programs, custom integrations, SLAs, and dedicated account management. Let's talk about an Enterprise plan.
               </p>
            </div>
         </div>
         <Button variant="secondary" className="h-12 px-8 shrink-0">
            Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </div>

      <div className="max-w-6xl mx-auto mt-12 mb-8">
         <div className="dash-panel p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
               <div className="dash-icon size-12">
                  <CreditCard className="h-6 w-6 text-primary" />
               </div>
               <div>
                  <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">Manage your cards and billing history via Stripe.</p>
               </div>
            </div>
            <Button variant="secondary" className="bg-card">
               Manage Billing
            </Button>
         </div>
      </div>
    </div>
  )
}
