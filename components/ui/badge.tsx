import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Status tag.
 *
 * Deliberately quiet: a hairline outline and uppercase micro-type rather
 * than a filled pill. Badges appear in table rows next to real data, and a
 * saturated block of colour there pulls the eye away from the numbers.
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none tracking-[0.1em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none aria-invalid:border-destructive transition-colors overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/88',
        secondary:
          'border-border bg-subtle text-muted-foreground [a&]:hover:text-foreground',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        brand: 'border-brand/30 bg-brand/10 text-brand',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
