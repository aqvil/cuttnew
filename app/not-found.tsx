import { FileQuestion } from "lucide-react"
import { StatusPage } from "@/components/marketing/status-page"

export const metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <StatusPage
      icon={FileQuestion}
      code="404"
      title="We couldn't find that page"
      description="The page you're looking for doesn't exist, or it's moved. If you followed a link from somewhere on this site, let us know and we'll fix it."
      primaryAction={{ label: "Back to home", href: "/" }}
    />
  )
}
