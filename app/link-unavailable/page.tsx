import { ServerCrash } from "lucide-react"
import { StatusPage } from "@/components/marketing/status-page"

export const metadata = {
  title: "Link temporarily unavailable",
  robots: { index: false, follow: false },
}

/**
 * Shown when the redirect service can't reach its database. The link is fine —
 * we just can't look it up right now — so the copy says exactly that and tells
 * the visitor to retry rather than implying the link is broken.
 */
export default function LinkUnavailablePage() {
  return (
    <StatusPage
      icon={ServerCrash}
      title="We can't reach this link right now"
      description="The link itself is fine — we're having trouble looking it up. This is usually brief. Please try again in a moment."
      primaryAction={{ label: "Try again", href: "/" }}
    />
  )
}
