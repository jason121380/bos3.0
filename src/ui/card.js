import React from 'react'
import { cn } from './utils'

// STYLE.md §13（PrimeStay 地基）：rounded-2xl（16px）、1px 細邊框、柔和 shadow-card、內距 20px 不變；標題用 heading。報表 compact 只借圓角/邊框/底色，列高不放寬。
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('ui-root rounded-2xl border border-solid border-border bg-background shadow-card', className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = ({ className, action, children, ...props }) => (
  <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)} {...props}>
    <div className="flex min-w-0 flex-col gap-1">{children}</div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
)
const CardTitle = ({ className, ...props }) => <h3 className={cn('text-heading text-text', className)} {...props} />
const CardDescription = ({ className, ...props }) => <p className={cn('text-body text-text-secondary', className)} {...props} />
const CardContent = ({ className, ...props }) => <div className={cn('p-5', className)} {...props} />
const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-end gap-2 border-0 border-t border-solid border-border px-5 py-4', className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
