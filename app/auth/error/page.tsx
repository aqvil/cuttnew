import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata = { title: "Sign-in problem" }

/**
 * NextAuth redirects here with an `error` code. Each known code gets a
 * specific explanation and a concrete next step — "Something went wrong,
 * please try again" tells the user nothing about what to do.
 */
const MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Sign-in isn't available right now",
    description:
      "This deployment is missing authentication configuration. If you're the site owner, check the AUTH_SECRET and provider credentials.",
  },
  AccessDenied: {
    title: "You don't have access",
    description:
      "That account isn't allowed to sign in. If you think this is a mistake, contact support and we'll take a look.",
  },
  Verification: {
    title: "That link has expired",
    description:
      "Sign-in links can only be used once and expire quickly. Request a new one to continue.",
  },
  OAuthAccountNotLinked: {
    title: "That email is already registered",
    description:
      "You originally signed up with a different method. Sign in the way you did the first time, then link the other provider from Settings.",
  },
}

const FALLBACK = {
  title: "We couldn't sign you in",
  description:
    "Something went wrong on the way back from the sign-in provider. This is usually temporary — try again, and contact support if it persists.",
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = (error && MESSAGES[error]) || FALLBACK

  return (
    <AuthShell title={message.title} description={message.description}>
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full">
          <Link href="/auth/login">Try signing in again</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>

      {error ? (
        <p className="mt-6 text-xs text-muted-foreground">
          Reference code: <code className="font-mono">{error}</code>
        </p>
      ) : null}
    </AuthShell>
  )
}
