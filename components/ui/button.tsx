import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Buttons use normal product language; mono remains reserved for data.
 *
 * Every committing variant rounds all the way to a pill — the product's one
 * borrowed gesture from its reference world, reserved for controls so it
 * never competes with the rectilinear panels around it. `ghost` and `link`
 * stay unrounded and low-key on purpose: they appear inside menus and prose.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-brand text-brand-foreground text-sm shadow-[0_4px_14px_-4px_rgb(212_80_30_/_0.45)] hover:bg-brand/90 active:bg-brand',
        dark:
          'bg-primary text-primary-foreground text-sm hover:bg-primary/88 active:bg-primary',
        destructive:
          'bg-destructive text-destructive-foreground text-sm hover:bg-destructive/88',
        outline:
          'border border-input bg-card text-sm text-foreground hover:border-foreground/30 hover:bg-subtle',
        secondary:
          'bg-secondary text-secondary-foreground text-sm hover:bg-secondary/70',
        ghost:
          'rounded-md text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground',
        link: 'rounded-none text-[13px] text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 has-[>svg]:px-3.5',
        sm: 'h-8 gap-1.5 px-3.5 has-[>svg]:px-3',
        lg: 'h-11 px-6 text-[15px] has-[>svg]:px-5',
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
