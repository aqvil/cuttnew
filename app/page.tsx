import { Button } from "@/components/ui/button"
import { 
  Link2, 
  BarChart3, 
  Sparkles, 
  Globe, 
  Zap, 
  Shield,
  ArrowRight,
  Terminal,
  Cpu,
  Fingerprint
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 grid-bg-columns opacity-40 pointer-events-none" />
      
      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-24 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-primary bg-primary text-black transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Link2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black uppercase italic tracking-tighter">LinkForge</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12">
          {['FEATURES', 'COLLECTION', 'LOGISTICS', 'DOCS'].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent px-4 py-2">
            LOGIN
          </Link>
          <Button variant="outline" className="btn-mono h-12" asChild>
            <Link href="/auth/login">INITIALIZE_NODE</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-8 pt-32 pb-64">
        <div className="max-w-6xl">
          <div className="tech-label mb-8">
            <Cpu className="h-3 w-3" />
            SYSTEM_V0.1.0_READY
          </div>

          <h1 className="text-9xl-condensed mb-12">
            BUILD <span className="text-white/40">WITHOUT</span><br />
            LIMITS
          </h1>

          <div className="grid md:grid-cols-2 gap-24 items-start">
            <div className="space-y-12">
              <p className="text-xl text-white/60 font-medium leading-relaxed max-w-lg">
                The tactical edge for your digital presence. Create high-performance bio segments, 
                secure redirection nodes, and analyzed links in seconds.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-6">
                <Button className="btn-mono group h-16 px-10 text-base" asChild>
                  <Link href="/auth/login">
                    GET_STARTED
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="btn-ghost-mono h-16 px-10 text-base" asChild>
                  <Link href="#features">VIEW_STREAMS</Link>
                </Button>
              </div>

              {/* Status Widgets */}
              <div className="flex gap-4 pt-12">
                <div className="border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-60">LATENCY</span>
                  </div>
                  <div className="text-xl font-black italic tracking-tighter">12MS</div>
                </div>
                <div className="border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                  <div className="text-[8px] font-mono font-bold uppercase tracking-widest opacity-60 mb-1">UPTIME</div>
                  <div className="text-xl font-black italic tracking-tighter">99.98%</div>
                </div>
              </div>
            </div>

            {/* Code Preview Widget */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent blur-2xl opacity-50" />
              <div className="relative card-mono border-white/20">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-white/40" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">LINK_INSTANCE.TS</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="font-mono text-sm space-y-2 text-white/80 leading-relaxed">
                  <p><span className="text-accent">const</span> project = <span className="text-accent">new</span> LinkForge({'{'}</p>
                  <p className="pl-4">node: <span className="text-amber-200">'PRODUCTION'</span>,</p>
                  <p className="pl-4">analytics: <span className="text-emerald-300">true</span>,</p>
                  <p className="pl-4">encryption: <span className="text-emerald-300">true</span></p>
                  <p>{'}'});</p>
                  <p className="pt-4 text-white/40">// Initialize redirect sequence</p>
                  <p>project.deploy({'{'} </p>
                  <p className="pl-4">target: <span className="text-amber-200">'https://domain.com/bio'</span></p>
                  <p>{'}'});</p>
                  <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">SYSTEM_OPERATIONAL</span>
                    <Fingerprint className="h-4 w-4 text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 border-y border-white/10 bg-white/[0.02] py-48">
        <div className="container mx-auto px-8">
          <div className="max-w-2xl mb-24">
            <h2 className="text-4xl-condensed mb-6 italic">HIGH_CORE_FLUX</h2>
            <p className="text-lg text-white/60 font-medium">Advanced protocols for superior digital management.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {[
              { icon: Zap, label: "01", title: "INSTANT_BUFFER", desc: "Redirection latency optimized to the physical limit. Your users don't wait." },
              { icon: Shield, label: "02", title: "HARDWARE_LOCK", desc: "Military-grade encryption for your sensitive redirections. Total security." },
              { icon: BarChart3, label: "03", title: "RAW_STREAM_DATA", desc: "Unfiltered analytics stream. See exactly how your traffic flows through the network." },
            ].map((f) => (
              <div key={f.label} className="bg-black p-12 space-y-8 hover:bg-white/[0.03] transition-colors group">
                <div className="flex items-center justify-between">
                  <f.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                  <span className="text-[10px] font-black font-mono opacity-20">{f.label}</span>
                </div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">{f.title}</h3>
                <p className="text-[10px] font-mono leading-relaxed opacity-50 uppercase tracking-widest">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-64">
        <div className="container mx-auto px-8 text-center mb-24">
          <h2 className="text-6xl font-black uppercase italic tracking-tighter italic mb-4">CHOOSE_POWER_LEVEL</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Logistic allocation parameters</p>
        </div>

        <div className="container mx-auto px-8 grid md:grid-cols-3 gap-12 max-w-7xl">
          {[
            {
              price: "$0",
              tier: "BASE",
              desc: "STABLE_STARK_0",
              features: ["1 BIO_PAGE", "50 LINKS", "STATIC_METRICS"]
            },
            {
              price: "$9",
              tier: "ELITE",
              desc: "CORE_OVERLOAD_V2",
              features: ["UNLIMITED_PAGES", "500 LINKS", "REALTIME_FLOW", "CUSTOM_VECTORS"],
              popular: true
            },
            {
              price: "$29",
              tier: "GLOBAL",
              desc: "NETWORK_DOMINANCE",
              features: ["RAW_API_ACCESS", "CUSTOM_DOMAINS", "PRIORITY_RE-SYNC", "TEAM_LOGIC"]
            }
          ].map((plan) => (
            <div key={plan.tier} className={`relative p-12 border-4 transition-all ${plan.popular ? 'border-primary shadow-[20px_20px_0px_0px_rgba(255,77,77,0.1)]' : 'border-white/10'}`}>
              <div className="text-6xl font-black italic tracking-tighter mb-4">{plan.price}</div>
              <div className="text-xl font-black uppercase tracking-tight mb-2">{plan.tier}_ALLOCATION</div>
              <div className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/40 mb-12">{plan.desc}</div>
              
              <ul className="space-y-6 mb-12">
                {plan.features.map(f => (
                  <li key={f} className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-3">
                    <div className="h-1.5 w-1.5 bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button className="btn-mono w-full h-16 text-base">INITIALIZE</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-24 bg-black">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <Link2 className="h-6 w-6 text-primary" />
            <span className="text-2xl font-black uppercase italic tracking-tighter">LinkForge</span>
          </div>
          <div className="flex gap-12">
            {['PRIVACY', 'TERMS', 'SECURITY', 'INFRASTRUCTURE'].map(item => (
              <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-accent">
                {item}
              </Link>
            ))}
          </div>
          <p className="text-[8px] font-mono uppercase tracking-widest text-white/40">
            © 2026 LINKFORGE_OS ALL_SYSTEMS_OPERATIONAL
          </p>
        </div>
      </footer>
    </div>
  )
}
