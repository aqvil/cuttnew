'use client'

import { createClient } from "@/lib/supabase/client"

interface LinkTrackerProps {
  blockId: string
  url: string
  children: React.ReactNode
}

export function LinkTracker({ blockId, url, children }: LinkTrackerProps) {
  const handleClick = async () => {
    const supabase = createClient()
    
    // Record click (fire and forget)
    supabase.from("link_analytics").insert({
      bio_block_id: blockId,
    })

    // Navigate to URL
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div onClick={handleClick} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
      {children}
    </div>
  )
}
