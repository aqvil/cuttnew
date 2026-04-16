import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { CreditCard, Zap, Check, ArrowRight, Activity, Shield, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Logistics Protocol",
}

export default async function BillingPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  })

  const currentPlan = (profile?.plan || "FREE").toUpperCase()

  const plans = [
    {
      name: "BASE_ALLOCATION",
      price: "$0",
      description: "STABLE_STARK_0",
      features: [
        "1_BIO_SEGMENT",
        "50_RELAY_NODES",
        "STATIC_TELEMETRY",
        "STANDARD_LATENCY"
      ],
      current: currentPlan === "FREE"
    },
    {
      name: "ELITE_PROTOCOL",
      price: "$9",
      description: "CORE_OVERLOAD_V2",
      features: [
        "UNLIMITED_SEGMENTS",
        "500_RELAY_NODES",
        "REALTIME_FLUX_DATA",
        "CUSTOM_VECTORS",
        "PRIORITY_RE-SYNC"
      ],
      popular: true,
      current: currentPlan === "PRO"
    },
    {
      name: "NETWORK_DOMINANCE",
      price: "$29",
      description: "GLOBAL_ARRAY_SYNC",
      features: [
        "UNLIMITED_EVERYTHING",
        "RAW_API_ACCESS",
        "CUSTOM_INFRA_NODES",
        "WHITE_LABEL_ENCRYPTION",
        "DEDICATED_BUFFER"
      ],
      current: currentPlan === "ENTERPRISE"
    }
  ]

  return (
    <div className="space-y-16 pb-24">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="tech-label mb-4">
              <CreditCard className="h-3 w-3" />
              LOGISTICS_PROTOCOL_ACTIVE
            </div>
            <h1 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4">
              LOGISTICS
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              SUBSCRIPTION_NODE: {currentPlan} // STATUS: SYNCHRONIZED
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative p-12 border-4 transition-all group ${
              plan.popular ? 'border-primary shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)]' : 'border-white/10'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-8 bg-white text-black px-4 py-1 text-[8px] font-black uppercase tracking-[0.3em] italic">
                RECOMMENDED_PATH
              </div>
            )}
            
            <div className="mb-12">
              <div className="text-6xl font-black italic tracking-tighter mb-2">{plan.price}</div>
              <div className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/40">{plan.description}</div>
            </div>

            <div className="space-y-2 mb-12">
              <h3 className="text-xl font-black uppercase tracking-tight italic group-hover:text-accent transition-colors">{plan.name}</h3>
              <div className="h-0.5 w-12 bg-white/20 group-hover:w-full transition-all duration-500" />
            </div>

            <ul className="space-y-6 mb-16">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
                  <Check className="size-3 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className={`w-full h-16 text-sm font-black uppercase italic tracking-widest transition-all rounded-none ${
                plan.current 
                  ? 'bg-transparent border border-white/20 text-white/40 cursor-default' 
                  : 'btn-mono'
              }`}
            >
              {plan.current ? "CURRENT_ALLOCATION" : "INITIALIZE_SWITCH"}
            </Button>

            {/* Corner Coordinate */}
            <div className="absolute bottom-2 right-2 text-[8px] font-mono opacity-10 group-hover:opacity-100 transition-opacity">
               [L0{plans.indexOf(plan) + 1}]
            </div>
          </div>
        ))}
      </div>

      {/* Support / Enterprise Block */}
      <div className="card-mono p-16 border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 mt-12 overflow-hidden relative">
         <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
            <Terminal className="size-64" />
         </div>
         <div className="max-w-2xl">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">CUSTOM_INFRASTRUCTURE?</h2>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 leading-relaxed">
              FOR_LARGE_ENTITY_COLLECTIVES_REQUIRING_DEDICATED_BUFFER_POOLS_AND_ISOLATED_RELAY_ARRAYS. 
              WE_PROVIDE_TAILORED_LOGISTICS_FOR_GLOBAL_DOMINANCE.
            </p>
         </div>
         <Button variant="outline" className="btn-ghost-mono h-16 px-12 text-sm group">
            ESTABLISH_COMM_LINK
            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
         </Button>
      </div>
    </div>
  )
}
