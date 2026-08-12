import { SearchX } from "lucide-react"
import { StatusPage } from "@/components/marketing/status-page"

export const metadata = {
  title: "Link not found",
  robots: { index: false, follow: false },
}

/**
 * Shown when a short code doesn't exist. Distinct from the site-wide 404 so
 * the message can address the actual situation — a mistyped or deleted link —
 * rather than "this page doesn't exist".
 */
export default function LinkNotFoundPage() {
  return (
    <StatusPage
      icon={SearchX}
      title="This link doesn't exist"
      description="It may have been deleted by its owner, or the address might have a typo. Double-check the characters after /l/ — they're case-sensitive."
      primaryAction={{ label: "Go to Cuttly", href: "/" }}
    />
  )
}
