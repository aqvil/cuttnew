import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CreditCard, ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import { PlanSelector } from "@/components/billing/plan-selector"
import { BillingPortalButton } from "@/components/billing/portal-button"

export const metadata = {
  title: "Billing & Plans - Cuttly",
}

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  const currentPlan = (profile?.plan === "pro" || profile?.plan === "business") ? profile.plan : "free"
  const hasSubscription = Boolean(profile?.stripeSubscriptionId)

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

      <PlanSelector products={PRODUCTS} currentPlan={currentPlan} hasSubscription={hasSubscription} />

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
         <Button variant="secondary" className="h-12 px-8 shrink-0" asChild>
            <a href="mailto:sales@cuttly.io?subject=Enterprise%20plan%20inquiry">
              Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
            </a>
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
            {hasSubscription ? (
              <BillingPortalButton />
            ) : (
              <Button variant="secondary" className="bg-card" disabled>
                No active subscription
              </Button>
            )}
         </div>
      </div>
    </div>
  )
}
