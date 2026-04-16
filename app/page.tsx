import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Link2, 
  BarChart3, 
  Sparkles, 
  Globe, 
  Zap, 
  Shield,
  ArrowRight,
  Check
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

const features = [
  {
    icon: Link2,
    title: "Link-in-Bio Pages",
    description: "Create stunning bio pages with our drag-and-drop builder. Add links, social profiles, and custom blocks."
  },
  {
    icon: Zap,
    title: "Link Shortener",
    description: "Shorten any URL with custom slugs, password protection, and expiration dates."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track clicks, views, and conversions with detailed geographic and device insights."
  },
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description: "Generate bio descriptions, optimize link titles, and create SEO metadata with AI."
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description: "Use your own domain for bio pages and short links for a professional brand presence."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Password-protect links, set expiration dates, and maintain full control over your content."
  }
]

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "1 Bio Page",
      "50 Short Links/month",
      "Basic Analytics",
      "Standard Themes"
    ],
    cta: "Get Started",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For creators and professionals",
    features: [
      "Unlimited Bio Pages",
      "500 Short Links/month",
      "Advanced Analytics",
      "Custom Themes",
      "AI Content Generation",
      "Remove Branding"
    ],
    cta: "Start Free Trial",
    highlighted: true
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Unlimited Short Links",
      "Custom Domains",
      "Team Collaboration",
      "Priority Support",
      "API Access"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <Link2 className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold">LinkForge</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Now with AI-powered content generation</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Your links, your brand,{" "}
            <span className="text-muted-foreground">your way</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
            Create beautiful bio pages, shorten links with powerful analytics, and build landing pages — all in one platform designed for creators and businesses.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative rounded-xl border bg-muted/30 p-2">
            <div className="rounded-lg border bg-background p-8 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="h-2 w-14 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 rounded-lg bg-foreground/10" />
                    <div className="h-10 rounded-lg bg-foreground/10" />
                    <div className="h-10 rounded-lg bg-foreground/10" />
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 text-sm font-medium">Click Analytics</div>
                  <div className="flex h-24 items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t bg-foreground/20" 
                        style={{ height: `${height}%` }} 
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-3 text-sm font-medium">Short Links</div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between rounded bg-muted p-2">
                      <span>lnk.to/portfolio</span>
                      <span className="font-mono">1.2k</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-muted p-2">
                      <span>lnk.to/project</span>
                      <span className="font-mono">847</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-muted p-2">
                      <span>lnk.to/demo</span>
                      <span className="font-mono">523</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Everything you need to grow online
            </h2>
            <p className="text-muted-foreground text-pretty">
              From bio pages to link analytics, LinkForge gives you the tools to build your online presence.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-background">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative border ${plan.highlighted ? 'border-foreground shadow-lg' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/auth/sign-up">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of creators and businesses using LinkForge to grow their online presence.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Create your free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <Link2 className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">LinkForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Supabase, and AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
