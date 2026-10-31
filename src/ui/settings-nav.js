import React, { useEffect, useRef, useState } from 'react'
import { TabsList, TabsTrigger } from './tabs'
import { cn } from './utils'

// 設定頁樣板（STYLE.md §12）：桌機左側窄選單（surface 淺灰、圓角與 Card 的 rounded-2xl 相同）、手機回到頂部橫向捲動分頁。
// 沿用 ui/tabs 的 Radix 行為（value/onValueChange/activationMode 由呼叫端原樣傳入）。
// 本元件只提供選單呈現，不自帶分頁狀態、不在這裡做 hover 浮出（細項浮出在主側欄）。
// 桌機左欄高度貼內容，不跟右側拉滿；頁面往下捲時留在可視區。
const DESKTOP_NAV_MEDIA = '(min-width: 768px)'
const STICKY_TOP = 16

function assignRef(ref, node) {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

function readBox(el) {
  const box = el.getBoundingClientRect()
  return { top: box.top, bottom: box.bottom, left: box.left, width: box.width, height: box.height }
}

const SettingsTabsList = React.forwardRef(({ className, style, ...props }, ref) => {
  const slotRef = useRef(null)
  const listRef = useRef(null)
  // #printContainer 的 overflow-x:hidden 會讓純 CSS sticky 黏不住視窗，桌機改在捲動時用 fixed 補上。
  const [fixedBox, setFixedBox] = useState(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mq = window.matchMedia(DESKTOP_NAV_MEDIA)
    const update = () => {
      const slot = slotRef.current
      const list = listRef.current
      const desktop = window.matchMedia(DESKTOP_NAV_MEDIA).matches
      const printing = window.matchMedia('print').matches
      if (!slot || !list || !desktop || printing) {
        setFixedBox(prev => (prev == null ? prev : null))
        return
      }
      const slotBox = readBox(slot)
      const listBox = readBox(list)
      const parent = slot.parentElement
      const parentBox = parent ? readBox(parent) : slotBox
      const height = listBox.height || slotBox.height
      const width = slotBox.width || listBox.width
      // CSS sticky 若已把欄位停在 top，就不要再改成 fixed。
      const shouldStick = width > 0 && height > 0 && slotBox.top < STICKY_TOP - 1 && parentBox.bottom > height + STICKY_TOP
      if (!shouldStick) {
        setFixedBox(prev => (prev == null ? prev : null))
        return
      }
      const next = { left: slotBox.left, width, height }
      setFixedBox(prev => {
        if (prev && Math.abs(prev.left - next.left) < 0.5 && Math.abs(prev.width - next.width) < 0.5 && Math.abs(prev.height - next.height) < 0.5)
          return prev
        return next
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    window.addEventListener('beforeprint', update)
    if (mq.addEventListener) mq.addEventListener('change', update)
    let observer
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(update)
      const main = document.getElementById('main-content')
      if (main) observer.observe(main)
      // effect 在掛載後執行，欄位節點一定已掛上；else 測不到
      /* istanbul ignore else */
      if (slotRef.current) observer.observe(slotRef.current)
    }
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      window.removeEventListener('beforeprint', update)
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      if (observer) observer.disconnect()
    }
  }, [])

  const setListRef = node => {
    listRef.current = node
    assignRef(ref, node)
  }

  return (
    <div
      ref={slotRef}
      data-settings-nav=""
      className="md:sticky md:top-4 md:z-10 md:h-fit md:w-60 md:max-w-full md:shrink-0 md:self-start"
      style={fixedBox ? { minHeight: fixedBox.height } : undefined}
    >
      <TabsList
        ref={setListRef}
        aria-label="設定分類"
        {...props}
        className={cn(
          'md:h-fit md:max-h-[calc(100dvh-2rem)] md:w-full md:flex-col md:items-stretch md:gap-1 md:overflow-x-visible md:overflow-y-auto md:rounded-2xl md:border-b-0 md:bg-surface md:p-3',
          className
        )}
        style={
          fixedBox
            ? {
                position: 'fixed',
                top: STICKY_TOP,
                left: fixedBox.left,
                width: fixedBox.width,
                maxHeight: 'calc(100dvh - 2rem)',
                zIndex: 10,
              }
            : style || {}
        }
      />
    </div>
  )
})
SettingsTabsList.displayName = 'SettingsTabsList'

const SettingsTabsTrigger = React.forwardRef(({ icon: Icon, className, children, ...props }, ref) => (
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
))
SettingsTabsTrigger.displayName = 'SettingsTabsTrigger'

// 右側內容區的分段標題：只呈現目前分類，不帶說明文案（說明留給各卡片既有標題／描述）。
function SettingsSectionHeading({ title, className }) {
  if (!title) return null
  return <h2 className={cn('m-0 mb-6 mt-6 text-heading text-text md:mt-0', className)}>{title}</h2>
}

export { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading }
