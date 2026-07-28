import { auth } from "@/auth"
import { db } from "@/lib/db"
import { shortLinks } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { LinkIcon, Copy, ArrowUpRight, MousePointerClick } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { LinksList } from "@/components/links/links-list"

export const metadata = {
  title: "Links - Cuttly",
}

export default async function LinksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const links = await db.query.shortLinks.findMany({
    where: eq(shortLinks.userId, session.user.id),
    orderBy: [desc(shortLinks.createdAt)],
  })

  return (
    <div className="dash-page">
      <div className="dash-hero flex flex-col items-center gap-6">
        <div>
          <div className="dash-kicker mb-4">
            <LinkIcon className="size-3.5" />
            Short links
          </div>
          <h1 className="dash-title">Links</h1>
          <p className="dash-subtitle">Your primary workspace. Shorten URLs, copy them, edit destinations, and watch clicks roll in.</p>
        </div>
        <Button className="btn-primary h-11 px-5" asChild>
          <Link href="/dashboard/links/new">
            Create new link
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Create", text: "Paste a long URL and choose the short back-half.", icon: LinkIcon },
          { title: "Share", text: "Copy the short URL anywhere your audience clicks.", icon: Copy },
          { title: "Measure", text: "Track clicks and open analytics from each link.", icon: MousePointerClick },
        ].map((step, index) => (
          <div key={step.title} className="dash-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="dash-icon size-9">
                <step.icon className="size-4" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="font-semibold text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      <LinksList links={links} appUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
    </div>
  )
}
