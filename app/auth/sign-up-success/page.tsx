import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata = { title: "Account created" }

/**
 * Sign-up normally signs the user straight in, so this page is only reached if
 * that automatic step didn't happen. It previously claimed a confirmation
 * email had been sent, which was never true — this deployment has no email
 * verification step.
 */
export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Your account is ready"
      description="Sign in to create your first short link."
    >
      <Button asChild size="lg" className="w-full">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </AuthShell>
  )
}
