import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn, focusRing } from './utils'

// STYLE.md §6（Grok 式）：膠囊分頁；每顆高 32px、圓角 full、間距 4px；選取為主題色淡底＋主題色文字（保留品牌藍），未選 text-secondary
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn('flex items-center gap-1 overflow-x-auto', className)} {...props} />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex h-8 items-center whitespace-nowrap rounded-full border-0 bg-transparent px-4 text-body text-text-secondary transition-colors duration-150 ease-out',
      'hover:text-text data-[state=active]:bg-accent/10 data-[state=active]:font-medium data-[state=active]:text-accent',
      'disabled:pointer-events-none disabled:text-text-tertiary',
      focusRing,
      // 焦點框畫在膠囊內側：分頁列是橫向捲動容器（overflow-x:auto 會連帶裁掉上下溢出），外側 3px 的框在手機上會被切掉上下緣
      'focus-visible:ring-inset focus-visible:ring-offset-0',
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
