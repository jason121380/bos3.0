import React, { useEffect, useRef, useState } from 'react'
import { TabsList, TabsTrigger } from './tabs'
import { Card } from './card'
import { cn, focusRing } from './utils'

// 設定頁樣板（STYLE.md §12）：桌機左側窄選單（surface 淺灰、圓角與 Card 的 rounded-2xl 相同）、手機回到頂部橫向捲動分頁。
// 沿用 ui/tabs 的 Radix 行為（value/onValueChange/activationMode 由呼叫端原樣傳入）。
// 分類若有子項，由呼叫端把內容放進 detail；桌機滑鼠滑過才浮出，點擊分類仍走原本的 onValueChange。窄屏與觸控不浮出。
export const SETTINGS_FLYOUT_MEDIA = '(min-width: 768px) and (hover: hover) and (pointer: fine)'

// 斜向移到下方細項時，指標會先離開分類、經過空隙或下一個分類。立刻關閉或立刻改開下一個分類，
// 面板會在抵達前被換掉。移出後稍等；這段時間內回到原分類（含面板）就取消關閉，只是掠過下一個分類也不改開。
const FLYOUT_CLOSE_DELAY = 160
let openFlyoutCount = 0

export function canHoverSettingsFlyout() {
  return typeof window.matchMedia === 'function' && window.matchMedia(SETTINGS_FLYOUT_MEDIA).matches
}

// 細項列：字級與列高比照報表目錄右側連結（text-body、h-10），面板圓角由外層 Card 負責。
function SettingsFlyoutButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 w-full items-center rounded-md px-3 text-left text-body text-text hover:bg-surface-hover',
        focusRing
      )}
    >
      {children}
    </button>
  )
}

const SettingsTabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    aria-label="設定分類"
    className={cn(
      'md:relative md:z-10 md:w-60 md:shrink-0 md:flex-col md:items-stretch md:gap-1 md:overflow-x-visible md:rounded-2xl md:border-b-0 md:bg-surface md:p-3',
      className
    )}
    {...props}
  />
))
SettingsTabsList.displayName = 'SettingsTabsList'

const SettingsTabsTrigger = React.forwardRef(({ icon: Icon, className, children, detail, detailLabel, ...props }, ref) => {
  const [open, setOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState(320)
  const closeTimer = useRef(null)
  const openTimer = useRef(null)
  const isOpen = useRef(false)
  const clearTimer = timer => {
    if (timer.current != null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }
  const reallyClose = () => {
    if (!isOpen.current) return
    isOpen.current = false
    openFlyoutCount = Math.max(0, openFlyoutCount - 1)
    setOpen(false)
  }
  const reallyOpen = top => {
    if (!detail || !canHoverSettingsFlyout()) return
    if (!isOpen.current) {
      isOpen.current = true
      openFlyoutCount += 1
    }
    setMaxHeight(Math.max(160, window.innerHeight - top - 16))
    setOpen(true)
  }
  useEffect(() => () => {
    clearTimer(closeTimer)
    clearTimer(openTimer)
    if (isOpen.current) {
      isOpen.current = false
      openFlyoutCount = Math.max(0, openFlyoutCount - 1)
    }
  }, [])
  const showDetail = event => {
    clearTimer(closeTimer)
    clearTimer(openTimer)
    if (!detail || !canHoverSettingsFlyout()) return
    const top = event.currentTarget.getBoundingClientRect().top
    // 已有別的分類面板開著時，先不要改開這一個，避免斜向滑過途中的分類把目標面板換掉。
    if (openFlyoutCount > 0 && !isOpen.current) {
      openTimer.current = setTimeout(() => {
        openTimer.current = null
        reallyOpen(top)
      }, FLYOUT_CLOSE_DELAY)
      return
    }
    reallyOpen(top)
  }
  const hideDetail = () => {
    clearTimer(openTimer)
    clearTimer(closeTimer)
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      reallyClose()
    }, FLYOUT_CLOSE_DELAY)
  }
  const label = detailLabel || (typeof children === 'string' ? `${children}的細項` : '分類細項')
  return (
    <div className="relative md:w-full" onMouseEnter={showDetail} onMouseLeave={hideDetail}>
      <TabsTrigger
        ref={ref}
        className={cn(
          'max-md:min-h-10 md:mb-0 md:h-9 md:w-full md:justify-start md:gap-2 md:rounded-md md:border-b-0 md:px-3 md:text-left',
          'md:hover:bg-surface-hover md:hover:text-text',
          'data-[state=active]:md:bg-accent/8 data-[state=active]:md:text-accent',
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
        <span className="truncate">{children}</span>
      </TabsTrigger>
      {open && detail ? (
        <div
          role="region"
          aria-label={label}
          className="absolute left-full top-0 z-20 -translate-x-1 pl-3 max-md:hidden"
        >
          <Card>
            <div className="flex w-60 flex-col overflow-y-auto p-2 pt-3" style={{ maxHeight }}>
              {detail}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
})
SettingsTabsTrigger.displayName = 'SettingsTabsTrigger'

// 右側內容區的分段標題：只呈現目前分類，不帶說明文案（說明留給各卡片既有標題／描述）。
function SettingsSectionHeading({ title, className }) {
  if (!title) return null
  return (
    <h2 className={cn('m-0 mb-6 mt-6 text-heading text-text md:mt-0', className)}>{title}</h2>
  )
}

export { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading, SettingsFlyoutButton }
