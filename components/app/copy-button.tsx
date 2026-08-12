'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Copy-to-clipboard with confirmation.
 *
 * The Clipboard API needs a secure context and can be denied, so the failure
 * path is handled rather than assumed: a `document.execCommand` fallback keeps
 * this working on plain-HTTP deployments and older browsers, and the user is
 * told when copying genuinely isn't possible.
 *
 * The result is announced through an aria-live region so it isn't a
 * colour-and-icon-only signal.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const textarea = document.createElement("textarea")
    textarea.value = value
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const succeeded = document.execCommand("copy")
    document.body.removeChild(textarea)
    return succeeded
  } catch {
    return false
  }
}

export function useCopy(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = useCallback(
    async (value: string, successMessage = "Copied to clipboard") => {
      const ok = await copyText(value)

      if (!ok) {
        toast.error("We couldn't copy that. Select the text and copy it manually.")
        return false
      }

      setCopied(true)
      toast.success(successMessage)

      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetAfterMs)
      return true
    },
    [resetAfterMs]
  )

  return { copied, copy }
}

export function CopyButton({
  value,
  label = "Copy",
  successMessage,
  variant = "outline",
  size = "sm",
  className,
  iconOnly = false,
}: {
  value: string
  label?: string
  successMessage?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "icon" | "icon-sm"
  className?: string
  iconOnly?: boolean
}) {
  const { copied, copy } = useCopy()

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => copy(value, successMessage)}
        aria-label={iconOnly ? `${label} ${value}` : undefined}
      >
        {copied ? (
          <Check className="size-3.5 text-success" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {!iconOnly && (copied ? "Copied" : label)}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}
