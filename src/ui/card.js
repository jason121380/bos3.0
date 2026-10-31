import React from 'react'
import { cn } from './utils'

// STYLE.md §6（Grok 式）：#FAFAFA 表面（surface）、圓角 16px、無框無影、內距 16px；標題用 heading
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('ui-root rounded-2xl bg-surface', className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = ({ className, action, children, ...props }) => (
  <div className={cn('flex min-h-8 items-start justify-between gap-4 px-4 pt-4', className)} {...props}>
    <div className="flex min-w-0 flex-col gap-1">{children}</div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
)
const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-heading text-text', className)} {...props}>
    {children}
  </h3>
)
const CardDescription = ({ className, ...props }) => <p className={cn('text-body text-text-secondary', className)} {...props} />
const CardContent = ({ className, ...props }) => <div className={cn('p-4', className)} {...props} />
const CardFooter = ({ className, ...props }) => <div className={cn('flex items-center justify-end gap-2 px-4 pb-4 pt-2', className)} {...props} />

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
