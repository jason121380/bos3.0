import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, focusRing } from './utils'

// STYLE.md §6 Sidebar：240px、surface 底；項目高 36px、rounded-md；選取為主題色 8% 底 + 主題色文字 + 字重 500
// 桌機（lg 以上）固定在左側，可收合；平板與手機為由左滑出的抽屜。整個側欄只渲染一份。
function Sidebar({ mobileOpen, onMobileClose, desktopOpen = true, className, children }) {
  return (
    <>
      {mobileOpen && (
        <div aria-hidden="true" className="noprint fixed inset-0 z-[1190] bg-black/40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          'ui-root noprint fixed inset-y-0 left-0 z-[1200] flex w-60 flex-col border-0 border-r border-solid border-border bg-surface',
          'transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          desktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full',
          className
        )}
      >
        {children}
      </aside>
    </>
  )
}

const SidebarHeader = ({ className, ...props }) => <div className={cn('flex flex-col gap-2 px-3 pb-2 pt-3', className)} {...props} />

const SidebarContent = ({ className, ...props }) => (
  <nav className={cn('flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4', className)} {...props} />
)

const SidebarFooter = ({ className, ...props }) => (
  <div className={cn('border-0 border-t border-solid border-border px-3 py-3', className)} {...props} />
)

// 區段標題：caption + text-tertiary
const SidebarLabel = ({ className, ...props }) => (
  <div className={cn('px-2 pb-1 pt-4 text-caption text-text-tertiary', className)} {...props} />
)

const rowClass = cn(
  'flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-body text-text-secondary transition-colors',
  'hover:bg-surface-hover hover:text-text',
  focusRing
)

// 可收合的群組列（如「櫃檯作業」）
const SidebarGroupButton = React.forwardRef(({ icon: Icon, open, hideChevron, className, children, ...props }, ref) => (
  <button ref={ref} type="button" aria-expanded={hideChevron ? undefined : open} className={cn(rowClass, 'font-medium', className)} {...props}>
    {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
    <span className="flex-1 truncate">{children}</span>
    {!hideChevron && (
      <ChevronDown className={cn('h-4 w-4 text-text-tertiary transition-transform', !open && '-rotate-90')} strokeWidth={1.75} />
    )}
  </button>
))
SidebarGroupButton.displayName = 'SidebarGroupButton'

// 導覽連結；active 由呼叫端決定，與舊版判斷方式一致
const SidebarLink = ({ to, active, icon: Icon, indent, className, children, ...props }) => (
  <Link
    to={to}
    aria-current={active ? 'page' : undefined}
    className={cn(rowClass, indent && 'pl-8', active && 'bg-accent/8 font-medium text-accent hover:bg-accent/8 hover:text-accent', className)}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
    <span className="flex-1 truncate">{children}</span>
  </Link>
)

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarLabel, SidebarGroupButton, SidebarLink }
