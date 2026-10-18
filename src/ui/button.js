import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn, focusRing } from './utils'

// STYLE.md §6：變體 primary（主題藍實心）/ secondary（淺灰實心、無框）/ ghost / danger；尺寸 sm 32 / md 36 / lg 40；圖示 16px、間距 6px
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors select-none',
    'disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
    focusRing
  ),
  {
    variants: {
      variant: {
        primary: 'rounded-full bg-primary text-primary-foreground hover:bg-primary/85',
        secondary: 'rounded-full bg-surface-hover text-text hover:bg-surface-active',
        ghost: 'rounded-md text-text hover:bg-surface-hover',
        danger: 'rounded-full bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-label',
        md: 'h-9 px-4 text-body font-medium',
        lg: 'h-10 px-5 text-body font-medium',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
