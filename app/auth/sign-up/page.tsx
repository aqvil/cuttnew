'use client'

import { signIn } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Link2, DiscIcon as Discord } from 'lucide-react'
import { useState } from 'react'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDiscordLogin = () => {
    setIsLoading(true)
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[url('https://discbot.io/grid.png')] bg-repeat p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-primary bg-primary text-primary-foreground transform -rotate-12">
              <Link2 className="h-6 w-6" />
            </div>
            <span className="text-4xl font-black uppercase italic tracking-tighter">LinkForge</span>
          </div>
          
          <div className="card-mono text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Onboarding</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-2">Initialize new entity profile via provider</p>
            </div>
            
            <div className="space-y-6">
              <Button 
                onClick={handleDiscordLogin} 
                disabled={isLoading}
                className="w-full h-14 border-4 border-primary bg-primary text-primary-foreground font-black uppercase italic tracking-widest text-lg hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1"
              >
                {isLoading ? (
                  "INITIALIZING..."
                ) : (
                  <>
                    <Discord className="mr-3 h-6 w-6" />
                    Begin with Discord
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-primary opacity-20" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase">
                  <span className="bg-background px-4 text-muted-foreground tracking-widest">or</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Already registered?{" "}
                  <a
                    href="/auth/login"
                    className="text-primary font-black underline underline-offset-4 hover:opacity-80"
                  >
                    Resync
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
