import React from 'react'
import ReactDOM from 'react-dom'
import { ArrowLeft, ChevronRight, ListFilter } from 'lucide-react'
import { cn, focusRing } from './utils'
import { Button } from './button'
import { Card } from './card'

// STYLE.md §4 頁面骨架：PageHeader（標題 + 說明 + 右側主要動作）→ Toolbar（搜尋 / 篩選 / 日期 / 次要動作）→ Content
// 每頁只有一個 title（24px 粗體、字距略緊，比照打帳單——Jason 2026/10/20）；舊版 initialize.scss 對 h1 有 font-weight !important，故以 !font-bold 覆蓋
// 詳細頁（選填）：breadcrumb＝標題上方的麵包屑（Breadcrumb 元件）；back＝{ label, onClick }，在標題左側放返回鈕
function PageHeader({ title, description, actions, breadcrumb, back, className, children }) {
  const heading = (
    <div className="flex min-w-0 flex-col gap-1">
      {breadcrumb}
      <h1 className="m-0 text-title !font-bold text-text">{title}</h1>
      {description && <p className="text-body text-text-secondary">{description}</p>}
    </div>
  )
  return (
    <div className={cn('ui-root noprint flex flex-wrap justify-between gap-4 pb-6', description || breadcrumb ? 'items-start' : 'items-center', className)}>
      {back ? (
        <div className="flex min-w-0 items-start gap-3">
          <Button variant="secondary" size="icon" className="mt-1 shrink-0" aria-label={back.label} title={back.label} onClick={back.onClick}>
            <ArrowLeft strokeWidth={1.75} />
          </Button>
          {heading}
        </div>
      ) : (
        heading
      )}
      {(actions || children) && <div className="flex flex-wrap items-center gap-2">{actions || children}</div>}
    </div>
  )
}

// 麵包屑：items＝[{ label, href?, onClick? }]，最後一項為目前頁（aria-current="page"、不可點）。
// 有 onClick 的項目仍輸出 href（可在新分頁開啟），一般點擊交給 onClick（沿用頁面原本的返回行為）
function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="麵包屑" className={cn('min-w-0', className)}>
      <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-1 p-0 text-label font-normal text-text-secondary">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${index}-${item.label}`} className="flex min-w-0 items-center gap-1">
              {last ? (
                <span aria-current="page" className="truncate text-text">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={
                    item.onClick
                      ? event => {
                          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
                          event.preventDefault()
                          item.onClick(event)
                        }
                      : undefined
                  }
                  className={cn('rounded-md text-text-secondary no-underline hover:text-accent hover:underline', focusRing)}
                >
                  {item.label}
                </a>
              )}
              {!last && <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.75} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Toolbar({ className, children }) {
  return <div className={cn('ui-root noprint flex flex-wrap items-center gap-3 pb-4', className)}>{children}</div>
}

// 推到右側的區塊（放次要動作）
const ToolbarSpacer = () => <div className="flex-1" />

// 報表篩選列（Jason 2026/10/20「所有報表跟帳單列表一樣，放在篩選才會乾淨簡約」，STYLE §14）：
// 一列只放日期（date）＋右側「篩選」開關與動作（actions，如搜尋——日期改了要按搜尋的頁面，搜尋不能藏進收合區）；
// 其餘條件（filters）收進下方卡片，預設收合。收合只用 display:none 隱藏、不卸載：店家挑選等元件自己保存已選值，卸載會與頁面 state 不一致
function ReportToolbar({ date, filters, actions, className }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Toolbar className={className}>
        {date}
        <ToolbarSpacer />
        {filters && (
          <Button
            variant="secondary"
            aria-pressed={open}
            aria-expanded={open}
            className={open ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
            onClick={() => setOpen(!open)}
          >
            <ListFilter strokeWidth={1.75} />
            篩選
          </Button>
        )}
        {actions}
      </Toolbar>
      {/* 卡片是直排，子元素預設撐滿（挑選欄要撐滿）；切換鈕群組（role=group）改依內容寬度，避免灰底拉滿整張卡 */}
      {filters && (
        <Card className="noprint mb-6 flex flex-col gap-4 p-4 [&_[role=group]]:w-fit [&_[role=group]]:max-w-full" style={open ? undefined : { display: 'none' }}>
          {filters}
        </Card>
      )}
    </>
  )
}

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

export { PageHeader, Breadcrumb, Toolbar, ToolbarSpacer, ReportToolbar, HeaderActionsSlot, HeaderActionsPortal }
