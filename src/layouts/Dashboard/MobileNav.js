import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom'
import { CalendarDays, ChartColumn, ChevronLeft, Menu, PenLine, Receipt, Star } from 'lucide-react'
import { Button } from 'ui/button'
import { cn, focusRing } from 'ui/utils'

// 平板與手機（lg 以下）的 App 外框：頂部列（返回 / Logo / 捲動後顯示頁名）＋底部分頁列
// 只負責導覽外觀；路由、權限檢查仍由 Dashboard 與各頁原有邏輯處理

const DEFAULT_TABS = [
  { title: '打帳單', href: '/order/create', icon: PenLine },
  { title: '帳單列表', href: '/management/orders', icon: Receipt },
  { title: '預約', href: '/management/weborders', icon: CalendarDays },
  { title: '報表', href: '/dashboard-list-detail', icon: ChartColumn },
]
const ICONS = Object.fromEntries(DEFAULT_TABS.map(t => [t.href, t.icon]))

// 進入單筆編輯／建立流程時隱藏分頁列（這些頁面有自己的底部動作列）
const FLOW = /\/(create|edit|duplicate)(\/|$)|^\/(order|draft-order|queue-order-edit)\//

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`)

export function useMobileTabs() {
  // 使用者在側欄釘選的常用頁面優先，不足 4 個時以預設常用頁補滿
  const pinned = useSelector(state => state.pinnedTable.table)
  const tabs = pinned.map(p => ({ title: p.title, href: p.href, icon: ICONS[p.href] || Star }))
  DEFAULT_TABS.forEach(t => { if (!tabs.some(x => x.href === t.href)) tabs.push(t) })
  return tabs.slice(0, 4)
}

export function useShowTabBar(tabs) {
  const { pathname } = useLocation()
  return tabs.some(t => isActive(pathname, t.href)) || !FLOW.test(pathname)
}

export function MobileAppBar({ tabs, showTabBar, onOpenMenu }) {
  const history = useHistory()
  const { pathname } = useLocation()
  const [depth, setDepth] = useState(0)
  const [title, setTitle] = useState(document.title)
  const [scrolled, setScrolled] = useState(false)

  // 只在 App 內有上一頁時顯示返回，避免從外部連結進來時按返回離開系統
  useEffect(() => history.listen((_, action) => {
    setDepth(d => (action === 'PUSH' ? d + 1 : action === 'POP' ? Math.max(0, d - 1) : d))
  }), [history])

  // 頁名來自各頁 <Page title>（components/Page 寫入 document.title）
  useEffect(() => {
    const el = document.querySelector('title')
    if (!el) return
    const observer = new MutationObserver(() => setTitle(document.title))
    observer.observe(el, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const isRoot = tabs.some(t => isActive(pathname, t.href))
  const showBack = depth > 0 && !isRoot

  // 手機版不放 bos 頁首（Jason 2026/10/20）：沒有返回／選單按鈕要放時整條不顯示，只保留狀態列安全距離；
  // 需要按鈕時才出現（PWA 沒有瀏覽器返回鍵，返回鈕不能拿掉），且不放 logo
  if (!showBack && showTabBar) {
    return <div aria-hidden="true" className="noprint pt-[env(safe-area-inset-top)] lg:hidden" />
  }

  return (
    <header
      className={cn(
        'ui-root noprint sticky top-0 z-[1100] border-0 border-b border-solid bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-colors lg:hidden',
        scrolled ? 'border-border' : 'border-transparent'
      )}
    >
      <div className="relative flex h-12 items-center px-2">
        {showBack && (
          <Button variant="ghost" size="icon" aria-label="返回" className="-ml-1 h-10 w-10 text-accent [&_svg]:size-6" onClick={() => history.goBack()}>
            <ChevronLeft strokeWidth={2} />
          </Button>
        )}
        {/* 沒有上一頁又沒有分頁列時（例如直接開啟編輯頁連結），保留開啟選單的入口 */}
        {!showBack && !showTabBar && (
          <Button variant="ghost" size="icon" aria-label="開啟選單" className="h-10 w-10 [&_svg]:size-5" onClick={onOpenMenu}>
            <Menu strokeWidth={1.75} />
          </Button>
        )}
        <div className="pointer-events-none absolute inset-x-14 flex h-full items-center justify-center">
          {scrolled && title && (
            <span className="truncate text-heading font-bold text-text animate-in fade-in-0 slide-in-from-bottom-1">{title}</span>
          )}
        </div>
      </div>
    </header>
  )
}

export function MobileTabBar({ tabs, onOpenMenu, menuOpen }) {
  const { pathname } = useLocation()
  const item = (active) => cn(
    // 分頁文字 12px（STYLE §3：不用 12px 以下字級）
    'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md pt-1.5 text-caption no-underline transition-colors',
    'active:scale-95 active:bg-surface-hover',
    active ? 'font-medium text-accent' : 'text-text-tertiary',
    focusRing
  )
  return (
    <nav
      aria-label="常用頁面"
      className="ui-root noprint fixed inset-x-0 bottom-0 z-[1100] border-0 border-t border-solid border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex h-14 max-w-xl items-stretch px-1">
        {tabs.map(({ title, href, icon: Icon }) => {
          const active = !menuOpen && isActive(pathname, href)
          return (
            <RouterLink key={href} to={href} aria-current={active ? 'page' : undefined} className={item(active)}>
              <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.75} />
              <span className="max-w-full truncate px-1">{title}</span>
            </RouterLink>
          )
        })}
        <button type="button" aria-label="開啟選單" aria-expanded={menuOpen} onClick={onOpenMenu} className={item(menuOpen)}>
          {/* 選單分頁用三條線漢堡圖示（Jason 2026/10/21 截圖指示，原為格狀 LayoutGrid） */}
          <Menu className="h-6 w-6" strokeWidth={menuOpen ? 2 : 1.75} />
          <span>選單</span>
        </button>
      </div>
    </nav>
  )
}
