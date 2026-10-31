import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './utils'

// STYLE.md §6：狀態專用；文字＋8% 底色；不加邊框陰影
const badgeVariants = cva('ui-root inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-2 text-caption font-medium', {
  variants: {
    variant: {
      neutral: 'bg-text/8 text-text-secondary',
      success: 'bg-success/8 text-success',
      warning: 'bg-warning/8 text-warning',
      danger: 'bg-danger/8 text-danger',
      accent: 'bg-accent/8 text-accent-text',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

const Badge = ({ className, variant, ...props }) => <span className={cn(badgeVariants({ variant }), className)} {...props} />

export { Badge, badgeVariants }
