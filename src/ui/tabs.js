import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn, focusRing } from './utils'

// STYLE.md §6：底線式；選取為 text + 2px 主題色底線，未選 text-secondary
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('flex items-center gap-6 overflow-x-auto border-0 border-b border-solid border-border', className)}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      '-mb-px inline-flex h-10 items-center whitespace-nowrap border-0 border-b-2 border-solid border-transparent text-body text-text-secondary transition-colors',
      'hover:text-text data-[state=active]:border-accent data-[state=active]:font-medium data-[state=active]:text-text',
      'disabled:pointer-events-none disabled:text-text-tertiary',
      focusRing,
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('pt-6 outline-none', className)} {...props} />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
