'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/app/actions/stripe'
import { cn } from '@/lib/utils'

/**
 * Opens the Stripe billing portal.
 *
 * A failure here previously logged to the console and silently left the button
 * spinning. Now it surfaces the reason and resets.
 */
export function BillingPortalButton({
  className,
  label = 'Manage subscription',
  variant = 'outline',
}: {
  className?: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      toast.error(
        "We couldn't open the billing portal. Please try again, or contact support if it keeps happening."
      )
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <ExternalLink className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  )
}
