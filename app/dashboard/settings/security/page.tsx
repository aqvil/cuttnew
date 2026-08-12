import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { SecurityForm } from "@/components/settings/security-form"

export const metadata = { title: "Security settings" }

export default async function SecuritySettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  // Only whether a password exists crosses to the client — never the hash.
  const [user] = await db
    .select({ email: users.email, password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  return <SecurityForm hasPassword={Boolean(user?.password)} email={user?.email ?? null} />
}
