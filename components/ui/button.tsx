import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Buttons in the technical register.
 *
 * The committing variants (default, secondary, destructive, outline) set
 * their label in small uppercase with wide tracking — the same treatment as
 * every other micro-label in the product, so a control reads as a control at
 * a glance. `ghost` and `link` keep sentence case on purpose: they appear
 * inside menus and prose, where uppercase would shout.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground uppercase tracking-[0.08em] text-[11px] hover:bg-primary/88 active:bg-primary',
        destructive:
          'bg-destructive text-destructive-foreground uppercase tracking-[0.08em] text-[11px] hover:bg-destructive/88',
        outline:
          'border border-input bg-card uppercase tracking-[0.08em] text-[11px] text-foreground hover:border-foreground/30 hover:bg-subtle',
        secondary:
          'bg-secondary text-secondary-foreground uppercase tracking-[0.08em] text-[11px] hover:bg-secondary/70',
        ghost:
          'text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground',
        link: 'text-[13px] text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-5 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
