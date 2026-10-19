import React from 'react'
import { TabsList, TabsTrigger } from './tabs'
import { cn } from './utils'

// 設定頁樣板（STYLE.md §12）：桌機左側窄選單（surface 淺灰整欄、與右側 background 白底直接相鄰、無分隔線）、手機回到頂部橫向捲動分頁。
// 沿用 ui/tabs 的 Radix 行為（value/onValueChange/activationMode 由呼叫端原樣傳入），
// 本元件只提供選單呈現，不自帶狀態、不改分頁切換語意。
const SettingsTabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    aria-label="設定分類"
    className={cn(
      'md:w-60 md:shrink-0 md:flex-col md:items-stretch md:gap-1 md:overflow-x-visible md:border-b-0 md:bg-surface md:p-3',
      className
    )}
    {...props}
  />
))
SettingsTabsList.displayName = 'SettingsTabsList'

const SettingsTabsTrigger = React.forwardRef(({ icon: Icon, className, children, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      'md:mb-0 md:h-9 md:justify-start md:gap-2 md:rounded-md md:border-b-0 md:px-3 md:text-left',
      'md:hover:bg-surface-hover md:hover:text-text',
      'data-[state=active]:md:bg-accent/8 data-[state=active]:md:text-accent',
      className
    )}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
    <span className="truncate">{children}</span>
  </TabsTrigger>
))
SettingsTabsTrigger.displayName = 'SettingsTabsTrigger'

// 右側內容區的分段標題：只呈現目前分類，不帶說明文案（說明留給各卡片既有標題／描述）。
function SettingsSectionHeading({ title, className }) {
  if (!title) return null
  return (
    <h2 className={cn('m-0 mb-6 mt-6 text-heading text-text md:mt-0', className)}>{title}</h2>
  )
}

export { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading }
