import { getUserTeams } from "@/app/actions/teams"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Users, Plus, ShieldCheck, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const teams = await getUserTeams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create up to 10 teams and invite up to 20 members per team.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create New Team
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t: any) => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {t.name?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">/{t.slug}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                {t.role}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" /> 1 / 20 members
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-500" /> Active
              </span>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl">
            <Users className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-semibold text-foreground">No teams created yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Collaborate with your team by creating workspace teams and managing short links together.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
