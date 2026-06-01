'use client'

import { signIn } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Link2, DiscIcon as Discord, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDiscordLogin = () => {
    setIsLoading(true)
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-6 md:p-10 font-sans">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-10 items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl tracking-tight">
            <Link2 className="h-8 w-8 stroke-[3]" />
            LinkForge
          </Link>
          
          <div className="card w-full p-8 shadow-xl">
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Log in to LinkForge</h2>
              <p className="text-sm font-medium text-muted-foreground">Welcome back to your short links.</p>
            </div>
            
            <div className="space-y-6">
              <Button 
                onClick={handleDiscordLogin} 
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-card hover:bg-muted text-foreground font-semibold text-base border-border shadow-sm transition-all"
              >
                {isLoading ? (
                  "Connecting..."
                ) : (
                  <>
                    <Discord className="mr-3 h-5 w-5 text-[#5865F2]" />
                    Continue with Discord
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

               <Button 
                disabled
                variant="outline"
                className="w-full h-12 bg-card text-muted-foreground font-semibold text-base border-border cursor-not-allowed"
              >
                 <Mail className="mr-3 h-5 w-5" />
                 Continue with Email
              </Button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
               Don't have an account? <Link href="/auth/sign-up" className="text-primary hover:underline">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
