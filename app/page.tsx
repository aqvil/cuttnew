import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Link2, 
  BarChart3, 
  Globe, 
  ShieldCheck,
  ArrowRight,
  QrCode,
  Smartphone
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Link2 className="h-6 w-6 stroke-[3]" />
              LinkForge
            </Link>
            <nav className="hidden md:flex gap-6">
              {['Products', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors hidden sm:block">
              Log in
            </Link>
            <Button className="btn-primary rounded-full px-6" asChild>
              <Link href="/auth/login">Get started for free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#fcfdff] pt-24 pb-32 border-b border-blue-100">
          <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Build stronger digital <span className="text-primary">connections</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create short links, QR Codes, and Link-in-bio pages. Share them anywhere. Track what's working, and what's not.
            </p>

            {/* Quick Shortener Tool (Visual only for landing) */}
            <div className="bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/5 max-w-3xl mx-auto mt-12 border border-slate-200">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Paste a long URL" 
                    className="h-14 pl-12 rounded-xl border-slate-200 bg-slate-50 text-base focus-visible:ring-primary shadow-inner"
                  />
                </div>
                <Button className="btn-primary h-14 px-8 text-base shadow-lg shadow-primary/20">
                  Shorten link
                </Button>
              </form>
              <p className="text-xs text-slate-500 mt-4 font-medium text-left px-2">
                By clicking Shorten link, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                The LinkForge Connections Platform
              </h2>
              <p className="text-lg text-slate-600">
                All the products you need to build brand connections, manage links and QR Codes, and connect with audiences everywhere.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Link2,
                  title: "Link Management",
                  desc: "A comprehensive solution to help make every point of connection between your content and your audience more powerful.",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: Smartphone,
                  title: "Link-in-bio",
                  desc: "Create a beautiful page that connects your audience to all your important content with just one link.",
                  color: "text-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  icon: QrCode,
                  title: "QR Codes",
                  desc: "QR Code solutions for every customer, campaign and tracking requirement, connecting the physical and digital.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                }
              ].map((product) => (
                <div key={product.title} className="card p-8 flex flex-col items-start hover:shadow-lg transition-shadow border-slate-200">
                  <div className={`h-14 w-14 rounded-2xl ${product.bg} flex items-center justify-center mb-6`}>
                    <product.icon className={`h-7 w-7 ${product.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{product.title}</h3>
                  <p className="text-slate-600 mb-8 flex-1">{product.desc}</p>
                  <Link href="/auth/login" className="text-primary font-bold hover:underline inline-flex items-center">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise/Trust Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-6 max-w-6xl text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Global scale and security
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500K+", label: "Global paying customers" },
                { value: "10B+", label: "Connections created" },
                { value: "99.9%", label: "Uptime guarantee" },
                { value: "256-bit", label: "Encryption protocol" },
              ].map(stat => (
                <div key={stat.label} className="space-y-2">
                  <div className="text-4xl font-black text-blue-400">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Link2 className="h-6 w-6 stroke-[3]" />
            LinkForge
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-primary">Support</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 LinkForge Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
