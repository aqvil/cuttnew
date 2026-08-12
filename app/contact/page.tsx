import Script from "next/script"
import { BookOpen, LifeBuoy, ShieldAlert } from "lucide-react"

import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { ContactForm } from "./contact-form"

export const metadata = {
  title: "Contact",
  description: "Questions, bug reports or abuse reports — get in touch with the Cuttly team.",
}

const CHANNELS = [
  {
    icon: LifeBuoy,
    title: "Support",
    body: "Something not working, or a question about your account? Use the form — we reply to every message.",
  },
  {
    icon: ShieldAlert,
    title: "Report abuse",
    body: "Found a Cuttly link being used for phishing, malware or spam? Include the full short URL and we'll disable it.",
  },
  {
    icon: BookOpen,
    title: "API help",
    body: "Endpoint reference and examples live in Settings → API once you're signed in.",
  },
]

export default function ContactPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Tell us what you need. A real person reads every message.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
            <ContactForm turnstileSiteKey={turnstileSiteKey} />

            <aside className="space-y-8 lg:border-l lg:border-border lg:pl-12">
              {CHANNELS.map((channel) => (
                <div key={channel.title}>
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-md border border-border bg-subtle text-muted-foreground"
                  >
                    <channel.icon className="size-4" />
                  </span>
                  <h2 className="mt-3.5 text-sm font-semibold">{channel.title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {channel.body}
                  </p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Loaded only when Turnstile is configured for this deployment. */}
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      ) : null}
    </div>
  )
}
