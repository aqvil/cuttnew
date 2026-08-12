import Link from "next/link"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionHeader } from "@/components/app/page-header"
import { PlanSelector } from "@/components/billing/plan-selector"
import { BillingPortalButton } from "@/components/billing/portal-button"
import { getLinkQuota } from "@/app/actions/links"
import { PRODUCTS } from "@/lib/products"
import { planFor } from "@/lib/plans"
import { fullNumber } from "@/lib/format"

export const metadata = { title: "Plan & billing" }

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const [profile, quota] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { plan: true, stripeSubscriptionId: true },
    }),
    getLinkQuota(),
  ])

  const plan = planFor(profile?.plan)
  const hasSubscription = Boolean(profile?.stripeSubscriptionId)

  const usedPercent =
    quota && quota.limit ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0

  return (
    <div className="page space-y-10">
      <PageHeader
        title="Plan & billing"
        description="Your current plan, this month's usage, and everything else on offer."
      />

      {/* Current usage — real numbers from the same counter that enforces the
          quota, so this can't say "42 used" while the server thinks otherwise. */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{plan.name}</p>
          </div>
          {hasSubscription ? <BillingPortalButton /> : null}
        </div>

        {quota ? (
          <div className="mt-6 space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Links created this month</span>
              <span className="text-muted-foreground tabular">
                {fullNumber(quota.used)}
                {quota.limit !== null ? ` / ${fullNumber(quota.limit)}` : " (unlimited)"}
              </span>
            </div>

            {quota.limit !== null ? (
              <>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={usedPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Monthly link allowance used"
                >
                  <div
                    className={
                      usedPercent >= 90
                        ? "h-full rounded-full bg-warning"
                        : "h-full rounded-full bg-chart-1"
                    }
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {quota.remaining === 0
                    ? "You've used your whole allowance. It resets on the 1st of next month."
                    : `${fullNumber(quota.remaining ?? 0)} left. Resets on the 1st of next month.`}
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeader title="Plans" description="Change plan at any time — upgrades apply immediately." />
        <PlanSelector
          products={PRODUCTS}
          currentPlan={plan.id}
          hasSubscription={hasSubscription}
        />
      </section>

      <section className="rounded-lg border border-border bg-subtle p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Need something different?</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              High link volumes, a specific data-residency requirement, or an integration that
              isn&apos;t listed — tell us what you need and we&apos;ll work it out.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
