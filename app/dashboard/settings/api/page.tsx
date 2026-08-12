import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { listApiKeys } from "@/app/actions/api-keys"
import { ApiKeysManager } from "@/components/settings/api-keys-manager"
import { planFor } from "@/lib/plans"
import { appOrigin } from "@/lib/app-url"

export const metadata = { title: "API keys" }

export default async function ApiSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const [profile, keys] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { plan: true },
    }),
    listApiKeys(),
  ])

  const plan = planFor(profile?.plan)
  const origin = appOrigin()

  return (
    <div className="space-y-12">
      <ApiKeysManager
        keys={keys}
        canCreate={plan.apiKeys > 0}
        planName={plan.name}
        maxKeys={plan.apiKeys}
      />

      <section className="space-y-4 border-t border-border pt-8">
        <div className="space-y-1">
          <h2 className="h2">Quick reference</h2>
          <p className="lede">
            All endpoints are scoped to your account and rate limited to 300 requests per minute
            per key.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-subtle">
          <pre className="p-4 font-mono text-xs leading-6">
            <code>{`# Create a short link
curl -X POST ${origin}/api/v1/links \\
  -H "Authorization: Bearer ck_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","alias":"spring-sale"}'

# List your links
curl ${origin}/api/v1/links?page=1&limit=25 \\
  -H "Authorization: Bearer ck_your_key_here"

# Update a link's destination
curl -X PATCH ${origin}/api/v1/links/LINK_ID \\
  -H "Authorization: Bearer ck_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/new"}'

# Delete a link
curl -X DELETE ${origin}/api/v1/links/LINK_ID \\
  -H "Authorization: Bearer ck_your_key_here"`}</code>
          </pre>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Successful responses return <code className="font-mono text-xs">{`{ "data": … }`}</code>.
            Errors return{" "}
            <code className="font-mono text-xs">{`{ "error": { "code", "message" } }`}</code> with
            an appropriate status.
          </p>
          <p>
            Rate-limit state is returned in the{" "}
            <code className="font-mono text-xs">X-RateLimit-*</code> response headers.
          </p>
        </div>
      </section>
    </div>
  )
}
