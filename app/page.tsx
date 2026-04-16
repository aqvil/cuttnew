import { Button } from "@/components/ui/button"
import { 
  Link2, 
  BarChart3, 
  Sparkles, 
  Globe, 
  Zap, 
  Shield,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Link2,
    title: "LINK-IN-BIO_SYSTEM",
    description: "Initialize high-performance bio segments with technical metadata and custom entity blocks."
  },
  {
    icon: Zap,
    title: "ACCESS_CODE_GENERATOR",
    description: "Terminate long-form URLs into trackable access points with encryption and decay timers."
  },
  {
    icon: BarChart3,
    title: "METRIC_ANALYTICS",
    description: "Deep-node investigation into traffic vectors, geographic origin, and hardware decryption."
  },
  {
    icon: Sparkles,
    title: "AI_GENERATION",
    description: "Automated entity description and metadata optimization via neural processing."
  },
  {
    icon: Globe,
    title: "DOMAIN_OVERWRITE",
    description: "Inject your own namespace for authoritative brand presence across the global network."
  },
  {
    icon: Shield,
    title: "ACCESS_SECURITY",
    description: "Multi-layer protection including gateway locking and temporal segment expiration."
  }
]

const plans = [
  {
    name: "BASE_TIER",
    price: "$0",
    period: "PERPETUAL",
    description: "Baseline operational capacity",
    features: [
      "1 BIO_SEGMENT",
      "50 SHORT_LINKS / CYCLE",
      "STANDARD_METRICS",
      "MONO_CORE_THEMES"
    ],
    cta: "GET_STARTED",
    highlighted: false
  },
  {
    name: "ELITE_TIER",
    price: "$9",
    period: "/ CYCLE",
    description: "Enhanced throughput and logic",
    features: [
      "UNLIMITED_BIO_SEGMENTS",
      "500 SHORT_LINKS / CYCLE",
      "ADVANCED_METRICS",
      "CUSTOM_VISUAL_RECOGNITION",
      "AI_LOGIC_GENERATION",
      "NULL_BRANDING"
    ],
    cta: "INITIALIZE_TRIAL",
    highlighted: true
  },
  {
    name: "CORE_TIER",
    price: "$29",
    period: "/ CYCLE",
    description: "Full-scale network deployment",
    features: [
      "EVERYTHING_IN_ELITE",
      "UNLIMITED_LINKS",
      "CUSTOM_NAMESPACE",
      "TEAM_COLLABORATION",
      "PRIORITY_RE-SYNC",
      "RAW_API_ACCESS"
    ],
    cta: "CONTACT_OPERATIONS",
    highlighted: false
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-primary bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-10 w-10 items-center justify-center border-4 border-primary bg-primary text-primary-foreground transition-transform group-hover:-rotate-6">
              <Link2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black uppercase italic tracking-tighter">LinkForge</span>
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
            {["FEATURES", "PRICING", "NETWORK"].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest px-6" asChild>
              <Link href="/auth/login">SIGN_IN</Link>
            </Button>
            <Button className="btn-mono" asChild>
              <Link href="/auth/sign-up">GET_STARTED</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-32 md:py-48 bg-[url('https://discbot.io/grid.png')] bg-repeat">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-10 inline-flex items-center gap-3 border-4 border-primary bg-background px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] italic">
            <Sparkles className="h-4 w-4" />
            <span>AI_NEURAL_LOGIC_INTEGRATED</span>
          </div>
          <h1 className="mb-10 text-6xl font-black uppercase italic tracking-tighter leading-[0.85] sm:text-7xl md:text-8xl">
            YOUR_LINKS_YOUR_BRAND_<br />
            <span className="text-primary bg-background border-4 border-primary px-4 mt-2 inline-block -rotate-1">YOUR_WAY</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-[10px] font-mono uppercase tracking-[0.25em] leading-relaxed opacity-70">
            Initialize high-performance bio segments, generate encrypted access points with deep-node analytics, and build authoritative network presence — all within a unified monochromatic architecture.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button size="lg" className="h-16 px-10 text-xl font-black uppercase italic tracking-widest border-4 border-primary bg-primary text-primary-foreground hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 active:translate-y-1" asChild>
              <Link href="/auth/sign-up">
                BEGIN_SEQUENCE
                <ArrowRight className="ml-4 h-6 w-6" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-black uppercase italic tracking-widest border-4 border-primary rounded-none hover:bg-primary hover:text-primary-foreground transition-all" asChild>
              <Link href="#features">VIEW_SYSTEM</Link>
            </Button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-32 mx-auto max-w-5xl">
          <div className="relative border-4 border-primary p-4 bg-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-2 border-primary p-12 bg-muted/10">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="border-4 border-primary bg-background p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 border-2 border-primary bg-primary" />
                    <div className="space-y-2">
                      <div className="h-2 w-20 bg-primary" />
                      <div className="h-2 w-14 bg-primary opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 border-2 border-primary bg-muted/20" />
                    <div className="h-12 border-2 border-primary bg-muted/20" />
                    <div className="h-12 border-2 border-primary bg-muted/20" />
                  </div>
                </div>
                <div className="border-4 border-primary bg-background p-6">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest">METRIC_STREAM</div>
                  <div className="flex h-32 items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary hover:opacity-80 transition-opacity" 
                        style={{ height: `${height}%` }} 
                      />
                    ))}
                  </div>
                </div>
                <div className="border-4 border-primary bg-background p-6">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest">ACCESS_NODES</div>
                  <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest">
                    <div className="flex items-center justify-between border-2 border-primary p-2">
                      <span>/L/PORTFOLIO</span>
                      <span className="font-black">1.2K</span>
                    </div>
                    <div className="flex items-center justify-between border-2 border-primary p-2 bg-primary text-primary-foreground italic">
                      <span>/L/CORE_NODE</span>
                      <span className="font-black">847</span>
                    </div>
                    <div className="flex items-center justify-between border-2 border-primary p-2">
                      <span>/L/DEMO_SEGMENT</span>
                      <span className="font-black">523</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-y-4 border-primary bg-muted/5 py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center mb-24">
            <h2 className="mb-6 text-4xl font-black uppercase italic tracking-tighter">
              SYSTEM_DEPLOYMENT_TOOLS
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">
              LinkForge provides the critical infrastructure for digital entity presence and redirection.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group relative">
                <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="relative z-10 border-4 border-primary bg-background p-10 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center border-4 border-primary bg-muted/20">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-black uppercase italic tracking-tight">{feature.title}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-widest">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center mb-24">
            <h2 className="mb-6 text-4xl font-black uppercase italic tracking-tighter">
              ALLOCATION_PLANS
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">
              Scale your operational capacity according to network requirements.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-3">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative border-4 p-10 ${plan.highlighted ? 'border-primary shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]' : 'border-border'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary px-6 py-1 text-[10px] font-black uppercase italic tracking-[0.3em] text-primary-foreground transform active:scale-95">
                    OPTIMIZED_CHOICE
                  </div>
                )}
                <div className="mb-10">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">{plan.name}</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">{plan.description}</p>
                </div>
                <div className="mb-10">
                  <span className="text-6xl font-black italic tracking-tighter">{plan.price}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">{plan.period}</span>
                </div>
                <ul className="mb-10 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                      <div className="h-2 w-2 bg-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full h-14 text-sm font-black uppercase italic tracking-widest border-4 ${plan.highlighted ? 'bg-primary text-primary-foreground border-primary hover:opacity-90' : 'bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                  asChild
                >
                  <Link href="/auth/sign-up">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t-4 border-primary bg-primary text-primary-foreground py-32 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://discbot.io/grid.png')] bg-repeat rotate-12 scale-150" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-10 text-6xl font-black uppercase italic tracking-tighter sm:text-7xl md:text-8xl">
              INITIALIZE_LOGISTICS?
            </h2>
            <p className="mb-12 text-[10px] font-mono uppercase tracking-[0.4em] leading-relaxed opacity-80">
              JOIN_THOUSANDS_OF_ENTITIES_ALREADY_CONNECTED_TO_THE_LINKFORGE_NETWORK.
            </p>
            <Button size="lg" className="h-20 px-12 text-2xl font-black uppercase italic tracking-widest border-4 border-primary-foreground bg-primary-foreground text-primary hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 active:translate-y-1" asChild>
              <Link href="/auth/sign-up">
                START_FREE_SEQUENCE
                <ArrowRight className="ml-6 h-8 w-8" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-primary py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border-4 border-primary bg-primary text-primary-foreground">
                <Link2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-black uppercase italic tracking-tighter">LinkForge</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-4">
              <span>NEXT.JS_16</span>
              <div className="h-1 w-1 bg-muted-foreground/30" />
              <span>POSTGRESQL_ENGINE</span>
              <div className="h-1 w-1 bg-muted-foreground/30" />
              <span>NEURAL_GEN_V2</span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              &copy; 2026_LINKFORGE_OPERATIONS
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
