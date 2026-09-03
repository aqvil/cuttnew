import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground/70 aria-invalid:border-destructive bg-card dark:bg-subtle flex field-sizing-content min-h-16 w-full rounded-sm border px-2.5 py-2 text-base leading-6 transition-colors outline-none hover:border-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-[13px]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
