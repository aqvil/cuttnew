'use client'

import { recordBioClick } from "@/app/actions/bio"

interface LinkTrackerProps {
  blockId: string
  url: string
  children: React.ReactNode
}

export function LinkTracker({ blockId, url, children }: LinkTrackerProps) {
  const handleClick = async () => {
    // Record click (fire and forget)
    recordBioClick(blockId).catch(err => console.error("Click record error:", err))

    // Navigate to URL
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div 
      onClick={handleClick} 
      role="link" 
      tabIndex={0} 
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="cursor-pointer"
    >
      {children}
    </div>
  )
}
