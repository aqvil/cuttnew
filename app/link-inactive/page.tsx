import { PauseCircle } from "lucide-react"
import { StatusPage } from "@/components/marketing/status-page"

export const metadata = {
  title: "Link paused",
  robots: { index: false, follow: false },
}

export default function LinkInactivePage() {
  return (
    <StatusPage
      icon={PauseCircle}
      title="This link is paused"
      description="Its owner has temporarily turned off redirects. The link still exists and may start working again — check back later, or ask whoever shared it."
      primaryAction={{ label: "Go to Cuttly", href: "/" }}
    />
  )
}
