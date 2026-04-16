'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/app/actions/stripe'
import { Loader2, ExternalLink } from 'lucide-react'

export function BillingPortalButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create portal session:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="mr-2 h-4 w-4" />
      )}
      Manage Subscription
    </Button>
  )
}
