'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BioPageTheme } from "@/lib/types/database"
import { Loader2, Check } from "lucide-react"

interface EmailCaptureFormProps {
  pageId: string
  title?: string
  placeholder?: string
  buttonText?: string
  theme: BioPageTheme
  buttonStyle: React.CSSProperties
}

export function EmailCaptureForm({
  pageId,
  title,
  placeholder,
  buttonText,
  theme,
  buttonStyle,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase
      .from("email_subscribers")
      .insert({
        page_id: pageId,
        email,
      })

    if (insertError) {
      setError("Failed to subscribe. Please try again.")
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <div 
        className="rounded-xl p-6 text-center"
        style={{ backgroundColor: `${theme.accent}15` }}
      >
        <div 
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.accent }}
        >
          <Check className="h-6 w-6" style={{ color: buttonStyle.color }} />
        </div>
        <p 
          className="font-medium"
          style={{ color: theme.text }}
        >
          Thanks for subscribing!
        </p>
      </div>
    )
  }

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: `${theme.accent}15` }}
    >
      <p 
        className="font-medium text-center mb-4"
        style={{ color: theme.text }}
      >
        {title || "Subscribe"}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder || "Enter your email"}
          required
          className="flex-1 rounded-lg px-4 py-2.5 text-sm border-0"
          style={{ backgroundColor: theme.background, color: theme.text }}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          style={buttonStyle}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            buttonText || "Subscribe"
          )}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
