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
  placeholder,
  buttonText,
  theme,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const text = theme?.text || "#0f1728"
  const accent = theme?.accent || "#1d4ed8"
  const background = theme?.background || "#f4f6fb"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Enter an email address to subscribe.")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      await subscribeToEmail(pageId, email)
      setIsSuccess(true)
    } catch (err) {
      setError("Couldn't subscribe you right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-lg p-4 text-center"
        style={{ backgroundColor: `${accent}14` }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: accent, color: getTextColor(accent) }}
        >
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium" style={{ color: text }}>
          You&rsquo;re subscribed
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          placeholder={placeholder || "Email address"}
          aria-label={placeholder || "Email address"}
          aria-invalid={error ? true : undefined}
          required
          className="w-full flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2"
          style={
            {
              backgroundColor: background,
              color: text,
              borderColor: `${text}30`,
              "--tw-ring-color": `${accent}55`,
            } as React.CSSProperties
          }
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
          style={{ backgroundColor: accent, color: getTextColor(accent) }}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isLoading ? "Subscribing…" : buttonText || "Subscribe"}
        </button>
      </div>
      {error && (
        <p className="text-xs" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}
    </form>
  )
}

function getTextColor(color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substr(0, 2), 16) || 0
  const g = parseInt(hex.substr(2, 2), 16) || 0
  const b = parseInt(hex.substr(4, 2), 16) || 0
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? "#000000" : "#ffffff"
}
