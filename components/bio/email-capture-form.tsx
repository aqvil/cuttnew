'use client'

import { useState } from "react"
import { subscribeToEmail } from "@/app/actions/bio"
import { Loader2, Check } from "lucide-react"

interface EmailCaptureFormProps {
  pageId: string
  title?: string
  placeholder?: string
  buttonText?: string
  theme: any
}

export function EmailCaptureForm({
  pageId,
  title,
  placeholder,
  buttonText,
  theme,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await subscribeToEmail(pageId, email)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div 
        className="border-4 border-primary p-8 text-center bg-background"
      >
        <div 
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-4 border-primary bg-primary text-primary-foreground"
        >
          <Check className="h-8 w-8" />
        </div>
        <p className="font-black uppercase italic tracking-tighter">
          TRANSFER_SUCCESSFUL
        </p>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-60 mt-2">
          Subscriber data cached.
        </p>
      </div>
    )
  }

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-primary translate-x-1.5 translate-y-1.5" />
      <div 
        className="relative z-10 border-4 border-primary p-6 bg-background"
      >
        <p className="font-black uppercase italic tracking-tighter mb-6 text-xl">
          {title || "Subscribe"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder || "EMAIL BUFFER"}
            required
            className="w-full border-4 border-primary px-4 py-3 text-sm font-black uppercase tracking-widest bg-background outline-none focus:bg-muted/30"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full border-4 border-primary bg-primary text-primary-foreground py-3 font-black uppercase italic tracking-widest transition-transform active:translate-y-1 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              buttonText || "Initialize"
            )}
          </button>
        </form>
        {error && (
          <p className="text-[10px] font-mono uppercase text-red-500 mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
