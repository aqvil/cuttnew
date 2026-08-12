import Discord from "next-auth/providers/discord"
import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth configuration.
 *
 * This file is imported by `proxy.ts` (the middleware), so it must not pull in
 * the database driver or anything Node-specific. Role resolution therefore
 * happens against the JWT, which `auth.ts` populates from the database at
 * sign-in.
 */

/**
 * Accounts granted the superadmin role, configured per deployment.
 *
 * Previously two email addresses were hardcoded here and force-promoted on
 * every request — anyone who registered with one of those addresses became a
 * platform superadmin. Roles now come from the database; this list exists only
 * so the first administrator can bootstrap themselves, and it is empty unless
 * the deployment sets SUPERADMIN_EMAILS.
 */
export function superadminEmails(): Set<string> {
  return new Set(
    (process.env.SUPERADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export const authConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user)
      const isDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isAuthPage = nextUrl.pathname.startsWith("/auth")

      if (isDashboard) {
        return isLoggedIn
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },

    jwt({ token, user, trigger, session }) {
      if (user) {
        // Set once at sign-in from the database record.
        token.role = (user as { role?: string }).role || "user"
      }

      // Allow the session to be refreshed after a role change without forcing
      // the user to sign out and back in.
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      return token
    },

    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        ;(session.user as { role?: string }).role = (token.role as string) || "user"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig
