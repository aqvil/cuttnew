'use client'

import { signIn } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Link2, DiscIcon as Discord, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDiscordLogin = () => {
    setIsLoading(true)
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 md:p-10 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-10 items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-3xl tracking-tight">
            <Link2 className="h-8 w-8 stroke-[3]" />
            LinkForge
          </Link>
          
          <div className="card w-full p-8 shadow-xl border-slate-200 bg-white">
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h2>
              <p className="text-sm font-medium text-slate-500">Sign up to start creating short links.</p>
            </div>
            
            <div className="space-y-6">
              <Button 
                onClick={handleDiscordLogin} 
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border-slate-200 shadow-sm transition-all"
              >
                {isLoading ? (
                  "Connecting..."
                ) : (
                  <>
                    <Discord className="mr-3 h-5 w-5 text-[#5865F2]" />
                    Sign up with Discord
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase">
                  <span className="bg-white px-2 text-slate-400">or continue with</span>
                </div>
              </div>

               <Button 
                disabled
                variant="outline"
                className="w-full h-12 bg-white text-slate-400 font-semibold text-base border-slate-200 cursor-not-allowed"
              >
                 <Mail className="mr-3 h-5 w-5" />
                 Sign up with Email
              </Button>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-slate-500">
               Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
