import React from 'react'
import ReactDOM from 'react-dom'
import { cn } from './utils'

// STYLE.md §4 頁面骨架：PageHeader（標題 + 說明 + 右側主要動作）→ Toolbar（搜尋 / 篩選 / 日期 / 次要動作）→ Content
// 每頁只有一個 title（24px 粗體、字距略緊，比照打帳單——Jason 2026/10/20）；舊版 initialize.scss 對 h1 有 font-weight !important，故以 !font-bold 覆蓋
function PageHeader({ title, description, actions, className, children }) {
  return (
    <div className={cn('ui-root noprint flex flex-wrap justify-between gap-4 pb-6', description ? 'items-start' : 'items-center', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="m-0 text-title !font-bold text-text">{title}</h1>
        {description && <p className="text-body text-text-secondary">{description}</p>}
      </div>
      {(actions || children) && <div className="flex flex-wrap items-center gap-2">{actions || children}</div>}
    </div>
  )
}

function Toolbar({ className, children }) {
  return <div className={cn('ui-root noprint flex flex-wrap items-center gap-3 pb-4', className)}>{children}</div>
}

// 推到右側的區塊（放次要動作）
const ToolbarSpacer = () => <div className="flex-1" />

// 頁首動作插槽（STYLE §14：「報表匯出」在頁首、列印左側）：匯出按鈕的資料與 handler 留在 Results 原地，
// 以 HeaderActionsPortal 畫到 PageHeader 的 HeaderActionsSlot；頁面沒有插槽時照原位置渲染（不會消失）
const SLOT_ID = 'page-header-actions-slot'
const HeaderActionsSlot = () => <span id={SLOT_ID} className="contents" />

function HeaderActionsPortal({ children }) {
  const [slot, setSlot] = React.useState(null)
  React.useEffect(() => {
    setSlot(document.getElementById(SLOT_ID))
  }, [])
  if (slot) return ReactDOM.createPortal(children, slot)
  return children
}

export { PageHeader, Toolbar, ToolbarSpacer, HeaderActionsSlot, HeaderActionsPortal }
