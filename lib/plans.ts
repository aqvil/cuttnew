/**
 * Plan entitlements.
 *
 * These are the numbers the UI shows *and* the numbers the server enforces —
 * there is deliberately no second copy. Limits are checked in
 * `app/actions/links.ts` and the public API before anything is written.
 */

export type PlanId = "free" | "pro" | "business"

export interface PlanLimits {
  id: PlanId
  name: string
  /** Links creatable per calendar month. `null` means unlimited. */
  linksPerMonth: number | null
  /** Custom domains that may be connected. */
  customDomains: number
  /** Bio pages that may exist. */
  bioPages: number | null
  /** API keys that may be active at once. 0 disables API access. */
  apiKeys: number
  /** How far back analytics can be queried, in days. */
  analyticsRetentionDays: number
  customAlias: boolean
  passwordProtection: boolean
  linkExpiration: boolean
  teamCollaboration: boolean
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    name: "Free",
    linksPerMonth: 50,
    customDomains: 0,
    bioPages: 1,
    apiKeys: 0,
    analyticsRetentionDays: 30,
    customAlias: true,
    passwordProtection: true,
    linkExpiration: true,
    teamCollaboration: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    linksPerMonth: 500,
    customDomains: 1,
    bioPages: null,
    apiKeys: 3,
    analyticsRetentionDays: 365,
    customAlias: true,
    passwordProtection: true,
    linkExpiration: true,
    teamCollaboration: false,
  },
  business: {
    id: "business",
    name: "Business",
    linksPerMonth: null,
    customDomains: 25,
    bioPages: null,
    apiKeys: 10,
    analyticsRetentionDays: 730,
    customAlias: true,
    passwordProtection: true,
    linkExpiration: true,
    teamCollaboration: true,
  },
}

export function planFor(plan: string | null | undefined): PlanLimits {
  if (plan === "pro" || plan === "business") return PLANS[plan]
  return PLANS.free
}

/** Anonymous visitors on the marketing page get a small, fixed allowance. */
export const ANONYMOUS_LINK_TTL_DAYS = 30
