import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Text input.
 *
 * Set in mono like everything else, which is the point: a URL, a slug or an
 * API key typed into this field is legible character by character, and the
 * field's own width predicts how much will fit.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/70 selection:bg-brand/20 border-input bg-card h-9 w-full min-w-0 rounded-sm border px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px]',
        'hover:border-foreground/20',
        'dark:bg-subtle',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
