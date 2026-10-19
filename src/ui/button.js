import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn, focusRing } from './utils'

// STYLE.md §13（PrimeStay 地基）：primary 維持 bos 品牌藍 #1A73E8 實心 pill（不換截圖綠）；secondary 改白底＋1px 細邊 pill（截圖的白鈕語彙）；ghost / danger 不變；尺寸 sm 32 / md 36 / lg 40 不變（報表/帳單密度不放寬）
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
        secondary: 'rounded-full border border-solid border-border bg-background text-text hover:border-border-strong hover:bg-surface-hover',
        ghost: 'rounded-md text-text hover:bg-surface-hover',
        danger: 'rounded-full bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-label',
        md: 'h-9 px-4 text-body font-medium max-sm:h-10', // 手機觸控目標 40px
        lg: 'h-10 px-5 text-body font-medium',
        icon: 'h-9 w-9 max-sm:h-10 max-sm:w-10',
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
      className={cn('ui-root', buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
