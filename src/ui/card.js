import React from 'react'
import { cn } from './utils'

// STYLE.md §13（扁平修正 2026/10/19，覆蓋 #151）：灰卡 bg-surface(#F3F4F6)、rounded-2xl、無 border、無陰影，靠灰/白色差在白底上分層；內距 20px 不變。深色 surface(#1C1C1C) 比 canvas(#0A0A0A) 亮一階，同理分層。報表 compact 只借圓角/底色，列高不放寬。
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('ui-root rounded-2xl bg-surface', className)} {...props} />
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
