import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { PageHeader } from "@/components/app/page-header"
import { DomainsClient } from "./domains-client"
import {
  getCustomDomains,
  getGlobalTrackingHeaders,
  verificationToken,
} from "@/app/actions/domains"
import { planFor } from "@/lib/plans"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "Domains" }

export default async function DomainsPage() {
  const session = await auth()
  // The previous version redirected to /auth/signin, which isn't a route on
  // this app — signed-out visitors got a 404 instead of a sign-in page.
  if (!session?.user?.id) redirect("/auth/login")

  const [profile, domains, headers] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { plan: true },
    }),
    getCustomDomains(),
    getGlobalTrackingHeaders(),
  ])

  const plan = planFor(profile?.plan)

  // Verification tokens are derived per domain; computing them on the server
  // keeps the HMAC secret out of the bundle.
  const tokens: Record<string, string> = {}
  for (const domain of domains) {
    tokens[domain.id] = await verificationToken(domain.domain, session.user.id)
  }

  return (
    <div className="page">
      <PageHeader
        title="Domains"
        description="Brand your short links with a domain you own."
      />

      <DomainsClient
        domains={domains}
        headers={headers}
        appHost={appOrigin().replace(/^https?:\/\//, "")}
        canConnect={plan.customDomains > 0}
        planName={plan.name}
        maxDomains={plan.customDomains}
        tokens={tokens}
      />
    </div>
  )
}
