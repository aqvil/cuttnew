import { Clock } from "lucide-react"
import { StatusPage } from "@/components/marketing/status-page"

export const metadata = {
  title: "Link expired",
  robots: { index: false, follow: false },
}

export default function LinkExpiredPage() {
  return (
    <StatusPage
      icon={Clock}
      title="This link has expired"
      description="Its owner set it to stop working after a certain date, or after a set number of clicks. If you still need what it pointed to, ask whoever shared it for an updated link."
      primaryAction={{ label: "Go to Cuttly", href: "/" }}
    />
  )
}
