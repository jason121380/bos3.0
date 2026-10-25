import React, { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, focusRing } from './utils'

// STYLE.md §6／§15 Sidebar：展開 264px、收合 80px 圖示欄；#FAFAFA（surface）底、無右框線；
// 項目高 36px、圓角 8px（rounded-md）、圖示與文字間距 10px；選取為主題色 8% 底 + 主題色文字 + 字重 500。
// 桌機（lg 以上）固定在左側：展開為完整選單，收合仍留圖示欄。平板與手機為由左滑出的抽屜。整個側欄只渲染一份。
export const SIDEBAR_FLYOUT_MEDIA = '(min-width: 768px) and (hover: hover) and (pointer: fine)'
export const SIDEBAR_RAIL_MAIN_CLASS = '[--sidebar-w:80px] lg:pl-[80px]'
export const SIDEBAR_EXPANDED_MAIN_CLASS = '[--sidebar-w:264px] lg:pl-[264px]'
// 桌機圖示欄才藏的操作（搜尋、通知、深淺色、切換店家、登出）。必須帶 lg：窄屏抽屜不是圖示欄，這些操作仍要在。
export const SIDEBAR_RAIL_HIDDEN_CLASS = 'lg:group-data-[rail=true]/sidebar:hidden'
// 浮層左緣貼側欄右緣，只留這一小段（不要再加一層大空白）。
export const SIDEBAR_FLYOUT_GAP = 4
// 浮層上下都貼近視窗，留這一圈，整塊留在視窗內。
export const SIDEBAR_FLYOUT_VIEWPORT_MARGIN = 8
// 一欄最多這個數量；超過才換下一欄（11 項＝10＋1）。
export const SIDEBAR_FLYOUT_ITEMS_PER_COLUMN = 10

export function splitSidebarFlyoutColumns(items, perColumn = SIDEBAR_FLYOUT_ITEMS_PER_COLUMN) {
  const list = Array.from(items || [])
  if (list.length <= perColumn) return [list]
  const columns = []
  for (let index = 0; index < list.length; index += perColumn) {
    columns.push(list.slice(index, index + perColumn))
  }
  return columns
}

export function sidebarFlyoutColumnCount(itemCount, perColumn = SIDEBAR_FLYOUT_ITEMS_PER_COLUMN) {
  return splitSidebarFlyoutColumns(Array.from({ length: Math.max(0, itemCount) }), perColumn).length
}

export function sidebarFlyoutShellWidth(columnCount, paddingLeft = SIDEBAR_FLYOUT_GAP) {
  const pad = Number.isFinite(paddingLeft) ? paddingLeft : 0
  if (columnCount <= 1) return `calc(15rem + ${pad}px)`
  return `calc(${columnCount} * 15rem + 1rem + ${pad}px)`
}

// 主側欄收合（桌機圖示欄）。窄屏抽屜不讀這個值來藏文字，文字是否隱藏由 lg: 樣式決定。
export const SidebarRailContext = React.createContext(false)

export function canHoverSidebarFlyout() {
  return typeof window.matchMedia === 'function' && window.matchMedia(SIDEBAR_FLYOUT_MEDIA).matches
}

let closeActiveFlyout = null

export function claimSidebarFlyout(close) {
  if (closeActiveFlyout && closeActiveFlyout !== close) closeActiveFlyout()
  closeActiveFlyout = close
}

export function releaseSidebarFlyout(close) {
  if (closeActiveFlyout === close) closeActiveFlyout = null
}

function Sidebar({ mobileOpen, onMobileClose, desktopOpen = true, className, children }) {
  return (
    <SidebarRailContext.Provider value={!desktopOpen}>
      {mobileOpen && (
        <div aria-hidden="true" className="noprint fixed inset-0 z-[1190] bg-black/40 lg:hidden" onClick={onMobileClose} />
      )}
      {/* iPhone PWA（viewport-fit=cover）狀態列畫在網頁最上方的安全區上：抽屜打開時遮罩（黑 40%）與抽屜淺灰底會把狀態列染灰。
          這條白色（canvas）細條只蓋住頂部安全區，讓狀態列維持純白、文字維持深色；一般瀏覽器安全區為 0，不顯示。純畫面，不攔點擊。 */}
      {mobileOpen && (
        <div aria-hidden="true" className="noprint pointer-events-none fixed inset-x-0 top-0 z-[1201] h-[env(safe-area-inset-top)] bg-canvas lg:hidden" />
      )}
      <aside
        data-rail={desktopOpen ? undefined : 'true'}
        className={cn(
          'group/sidebar ui-root noprint fixed inset-y-0 left-0 z-[1200] flex w-[264px] flex-col bg-surface',
          'transition-[transform,width] duration-200',
          // 手機抽屜：加寬、避開瀏海與底部指示條；桌機收合改留 80px 圖示欄，不整欄移出畫面
          'max-lg:w-[min(84vw,320px)] max-lg:pb-[env(safe-area-inset-bottom)] max-lg:pt-[env(safe-area-inset-top)] max-lg:shadow-float',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
          'lg:translate-x-0',
          !desktopOpen && 'lg:w-[80px]',
          className
        )}
      >
        {children}
      </aside>
    </SidebarRailContext.Provider>
  )
}

const SidebarHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-2 px-3 pb-2 pt-3 lg:group-data-[rail=true]/sidebar:px-1.5', className)} {...props} />
)

const SidebarContent = ({ className, ...props }) => (
  <nav className={cn('flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4 lg:group-data-[rail=true]/sidebar:px-1.5', className)} {...props} />
)

const SidebarFooter = ({ className, ...props }) => (
  <div className={cn('px-3 py-3 lg:group-data-[rail=true]/sidebar:px-1.5', className)} {...props} />
)

// 區段標題：14px、text-tertiary（Grok 式分組標籤）。圖示欄不顯示文字標題。
const SidebarLabel = ({ className, ...props }) => (
  <div className={cn('px-2.5 pb-1.5 pt-4 text-label font-normal text-text-tertiary lg:group-data-[rail=true]/sidebar:hidden', className)} {...props} />
)

const rowClass = cn(
  'flex h-9 max-lg:min-h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-body text-text-secondary transition-colors duration-150',
  'hover:bg-surface-hover hover:text-text',
  'lg:group-data-[rail=true]/sidebar:justify-center lg:group-data-[rail=true]/sidebar:px-0',
  focusRing
)

const labelClass = 'flex-1 truncate lg:group-data-[rail=true]/sidebar:hidden'

// 可收合的群組列（如「櫃檯作業」）
const SidebarGroupButton = React.forwardRef(({ icon: Icon, open, hideChevron, className, children, ...props }, ref) => (
  <button ref={ref} type="button" aria-expanded={hideChevron ? undefined : open} className={cn(rowClass, 'font-medium text-text', className)} {...props}>
    {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
    <span className={labelClass}>{children}</span>
    {!hideChevron && (
      <ChevronDown className={cn('h-4 w-4 shrink-0 text-text-tertiary transition-transform lg:group-data-[rail=true]/sidebar:hidden', !open && '-rotate-90')} strokeWidth={1.75} />
    )}
  </button>
))
SidebarGroupButton.displayName = 'SidebarGroupButton'

// 導覽連結；active 由呼叫端決定，與舊版判斷方式一致
const SidebarLink = ({ to, active, icon: Icon, indent, className, children, ...props }) => (
  <Link
    to={to}
    aria-current={active ? 'page' : undefined}
    className={cn(
      rowClass,
      indent && 'pl-8',
      indent && 'lg:group-data-[rail=true]/sidebar:!pl-0',
      active && 'bg-accent/8 font-medium text-accent hover:bg-accent/8 hover:text-accent',
      className
    )}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
    <span className={labelClass}>{children}</span>
  </Link>
)

// 卡片左緣在側欄右緣再留 gap。外殼則向左接到按鈕右緣，滑鼠才不會在側欄內距上斷掉。
// 按鈕若比側欄更右，仍以側欄右緣為準，不跟著那一列往右推。
// 垂直不跟被 hover 的那一列走：頂端固定貼近視窗上緣，高度貼近視窗上下。
export function placeSidebarFlyout({
  sidebarRight = 0,
  anchorRight,
  viewportWidth = 0,
  viewportHeight = 0,
  gap = SIDEBAR_FLYOUT_GAP,
  margin = SIDEBAR_FLYOUT_VIEWPORT_MARGIN,
} = {}) {
  const edge = Number.isFinite(sidebarRight) ? sidebarRight : 0
  const width = Number.isFinite(viewportWidth) ? viewportWidth : 0
  const height = Number.isFinite(viewportHeight) ? viewportHeight : 0
  const maxRight = width - margin
  const minPanel = 160
  let cardLeft = edge + gap
  if (maxRight - cardLeft < minPanel) cardLeft = Math.max(margin, maxRight - minPanel)
  const anchor = Number.isFinite(anchorRight) ? anchorRight : edge
  let left = Math.min(anchor, edge, cardLeft)
  if (left < margin) left = margin
  if (left > cardLeft) left = cardLeft
  return {
    top: margin,
    left,
    height: Math.max(0, height - margin * 2),
    maxWidth: Math.max(0, maxRight - left),
    paddingLeft: cardLeft - left,
  }
}

// renderItems 會包一層 div。多欄要算裡面的連結，不能把那層 div 當成一項。
function flyoutEntries(children) {
  const nodes = React.Children.toArray(children).filter(Boolean)
  if (nodes.length === 1 && React.isValidElement(nodes[0]) && nodes[0].type === 'div') {
    return React.Children.toArray(nodes[0].props.children).filter(Boolean)
  }
  return nodes
}

function readSidebarEdge(el) {
  const aside = el && typeof el.closest === 'function' ? el.closest('aside') : null
  return (aside || el).getBoundingClientRect().right
}

function renderFlyoutItems(children) {
  const items = flyoutEntries(children)
  const columns = splitSidebarFlyoutColumns(items)
  if (columns.length <= 1) return children
  return (
    <div className="flex items-start">
      {columns.map((column, index) => (
        <div key={index} data-flyout-column="true" className="flex w-60 shrink-0 flex-col gap-0.5">
          {column}
        </div>
      ))}
    </div>
  )
}

// 桌機 hover／圖示欄點選時，把子項畫到側欄外面（側欄自己的 overflow 會裁掉絕對定位）。
// 左緣貼側欄（aside）右緣，不跟被 hover 那一列的 right／top 走；視窗滿高，內容由上往下，超出在浮層內捲動。
// 圓角用既有 rounded-2xl（卡片 16px）、項目沿用 SidebarLink 的 rounded-md 與 text-body。
function SidebarFlyout({ anchorRef, label, onMouseEnter, onMouseLeave, onKeyDown, children }) {
  const [box, setBox] = useState(null)
  const columnCount = sidebarFlyoutColumnCount(flyoutEntries(children).length)
  useLayoutEffect(() => {
    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const next = placeSidebarFlyout({
        sidebarRight: readSidebarEdge(el),
        anchorRight: el.getBoundingClientRect().right,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      })
      setBox(prev => (
        prev
        && prev.top === next.top
        && prev.left === next.left
        && prev.height === next.height
        && prev.maxWidth === next.maxWidth
        && prev.paddingLeft === next.paddingLeft
          ? prev
          : next
      ))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const aside = anchorRef.current && anchorRef.current.closest('aside')
    let observer
    if (aside && typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(update)
      observer.observe(aside)
    }
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      if (observer) observer.disconnect()
    }
  }, [anchorRef])
  if (!box) return null
  return createPortal(
    <div
      role="region"
      aria-label={label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      style={{
        top: box.top,
        left: box.left,
        height: box.height,
        maxWidth: box.maxWidth,
        paddingLeft: box.paddingLeft,
        width: sidebarFlyoutShellWidth(columnCount, box.paddingLeft),
      }}
      className="ui-root noprint fixed z-[1200] flex"
    >
      <div className="h-full min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl border border-solid border-border bg-surface p-2 shadow-float [&_a]:!pl-2.5">
        {renderFlyoutItems(children)}
      </div>
    </div>,
    document.body
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarLabel,
  SidebarGroupButton,
  SidebarLink,
  SidebarFlyout,
}
