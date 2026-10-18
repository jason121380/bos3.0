import { Link as RouterLink } from 'react-router-dom'
import { cn, focusRing } from 'ui/utils'

// 登入相關頁的頂部列：白底、細框，只放 Logo（STYLE.md §1 內容優先）
function Topbar({ className, ...rest }) {
  return (
    <header
      {...rest}
      className={cn('ui-root noprint fixed inset-x-0 top-0 z-[1100] flex h-14 items-center border-0 border-b border-solid border-border bg-background px-4 sm:px-6', className)}
    >
      <RouterLink to="/" className={cn('flex items-center gap-2 rounded-md', focusRing)}>
        <img className="h-6 w-auto invert dark:invert-0" alt="BeautyOS" src={require('assets/images/bosLogoNew.png')} />
        <span className="text-caption text-text-tertiary">v3.0</span>
      </RouterLink>
    </header>
  )
}

export default Topbar
