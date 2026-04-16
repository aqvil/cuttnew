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
      description: "Perfect for individuals getting started with link management.",
      features: [
        "1 Link-in-bio page",
        "50 Bitly Links / month",
        "Basic Click Analytics",
        "Standard support"
      ],
      current: currentPlan === "free"
    },
    {
      name: "Core",
      id: "pro",
      price: "$8",
      period: "/month",
      description: "For creators and small businesses growing their audience.",
      features: [
        "Unlimited Link-in-bio pages",
        "500 Bitly Links / month",
        "Advanced Analytics & Trends",
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
      description: "For expanding businesses needing advanced features and scale.",
      features: [
        "Everything in Core",
        "3,000 Bitly Links / month",
        "White-label custom domains",
        "Bulk link creation",
        "24/7 dedicated support"
      ],
      current: currentPlan === "enterprise"
    }
  ]

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto p-8 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
         <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Upgrade your plan</h1>
         <p className="text-lg text-slate-600">Choose the perfect plan for your link management and Link-in-bio needs. Switch or cancel anytime.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`card relative p-8 flex flex-col ${
              plan.popular ? 'border-primary shadow-xl shadow-blue-900/10 ring-1 ring-primary' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-primary px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Zap className="h-3 w-3 fill-primary" /> Most Popular
              </div>
            )}
            
            <div className="mb-6">
               <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
               <p className="text-sm text-slate-500 h-10">{plan.description}</p>
            </div>

            <div className="mb-8 border-b border-slate-100 pb-8 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
              <span className="text-slate-500 font-medium">{plan.period}</span>
            </div>

            <div className="flex-1">
               <p className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Features included</p>
               <ul className="space-y-4 mb-8">
               {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                     <Check className="h-5 w-5 text-primary shrink-0" />
                     {feature}
                  </li>
               ))}
               </ul>
            </div>

            <div className="mt-auto">
               <Button 
                  className={`w-full h-12 text-base ${
                     plan.current ? 'btn-secondary bg-slate-50 border-slate-200 text-slate-500 cursor-default' : 'btn-primary'
                  }`}
               >
                  {plan.current ? "Current Plan" : `Get ${plan.name}`}
               </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise CTA */}
      <div className="max-w-6xl mx-auto mt-12 bg-slate-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
               <Building2 className="h-8 w-8 text-blue-400" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white mb-2">Need a custom solution?</h2>
               <p className="text-slate-400 max-w-xl">
                 For high volume links, custom integrations, SLAs, and dedicated account management. Let's talk about an Enterprise plan.
               </p>
            </div>
         </div>
         <Button variant="secondary" className="h-12 px-8 shrink-0 hover:bg-slate-100">
            Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </div>

      {/* Current Billing Details */}
      <div className="max-w-6xl mx-auto mt-12 mb-8">
         <div className="card p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
                  <p className="text-sm text-slate-500">Manage your cards and billing history securely via Stripe.</p>
               </div>
            </div>
            <Button variant="secondary" className="bg-white">
               Manage Billing
            </Button>
         </div>
      </div>
    </div>
  )
}
