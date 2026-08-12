import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { profiles, users } from "@/lib/db/schema"
import { verifyPassword } from "@/lib/auth/password"
import { authConfig, superadminEmails } from "./auth.config"
import { LIMITS, clientIp, hit, reset } from "@/lib/rate-limit"

/**
 * Ensures every authenticated user has a profile row.
 *
 * Profiles carry the plan and the foreign key that links own, so a user
 * without one cannot create anything. This runs on both sign-in paths.
 */
async function ensureProfile(user: {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}) {
  const displayName = user.name || user.email?.split("@")[0] || "User"
  const usernameBase = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  await db
    .insert(profiles)
    .values({
      id: user.id,
      username: `${usernameBase || "user"}_${user.id.slice(0, 6)}`,
      displayName,
      avatarUrl: user.image,
    })
    .onConflictDoNothing()
}

/**
 * Resolves the effective role for an account.
 *
 * The stored role wins. The SUPERADMIN_EMAILS allowlist exists only to
 * bootstrap the first administrator on a fresh deployment; when it matches, the
 * promotion is written back so the database stays the source of truth.
 */
async function resolveRole(user: {
  id: string
  email: string | null
  role: string | null
}): Promise<string> {
  if (user.role === "superadmin" || user.role === "admin") return user.role

  const email = user.email?.toLowerCase()
  if (email && superadminEmails().has(email)) {
    await db
      .update(users)
      .set({ role: "superadmin", updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .catch((err) => console.error("[auth] role bootstrap failed:", err))
    return "superadmin"
  }

  return user.role || "user"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase()
        const password = String(credentials?.password || "")

        if (!email || !password) return null

        // Throttle by IP so the sign-in form isn't a password oracle. Returning
        // null (rather than throwing) keeps the failure indistinguishable from
        // a wrong password, so an attacker can't detect the throttle.
        const ip = clientIp(await headers())
        const limit = hit(`auth:signin:${ip}`, LIMITS.auth)
        if (!limit.allowed) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        // Banned accounts and unknown emails fail identically.
        if (!user || user.bannedAt || !user.password) return null

        const isValid = await verifyPassword(password, user.password)
        if (!isValid) return null

        reset(`auth:signin:${ip}`)

        await ensureProfile(user)
        const role = await resolveRole(user)

        return {
          id: user.id,
          name: user.name || user.username || user.email?.split("@")[0],
          email: user.email,
          image: user.image || user.avatarUrl || user.avatar,
          role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * OAuth sign-ins bypass `authorize`, so the ban check has to happen here
     * too — otherwise a banned user could still sign in with Discord.
     */
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true
      if (!user?.email) return true

      const [record] = await db
        .select({ bannedAt: users.bannedAt })
        .from(users)
        .where(eq(users.email, user.email.toLowerCase()))
        .limit(1)

      return !record?.bannedAt
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        const [record] = await db
          .select({ id: users.id, email: users.email, role: users.role })
          .from(users)
          .where(eq(users.id, user.id as string))
          .limit(1)

        token.role = record ? await resolveRole(record) : "user"
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      return token
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
      }
    },
  },
})
