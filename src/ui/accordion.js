import React, { createContext, useContext } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn, focusRing } from './utils'

// 可展開卡片，取代 MUI Accordion。介面與 MUI 相容，替換時 props 與 handler 不用改：
//   <Accordion expanded>
//     <AccordionSummary onClick={…} expandIcon={…} data-testid="…">標題</AccordionSummary>
//     <AccordionDetails>內容</AccordionDetails>
//   </Accordion>
// - expanded 由外層控制（受控）。點標題只會呼叫 onClick，要不要展開由外層決定，與 MUI 受控模式相同。
// - 收合時內容仍保持掛載（只是隱藏），裡面欄位的值與 ref 不會遺失，與 MUI 預設相同。
// - 收合隱藏用 inline style，因為呼叫端常用 emotion 的 css 指定 display，class 或 hidden 屬性會被蓋掉。
// - expandIcon 會被忽略（箭頭由元件自己畫，並隨展開旋轉）。
// - summaryMeta：標題右側的摘要文字（例如「已填 2 筆」），收合時一眼看得到內容概況。
const AccordionContext = createContext(false)

const Accordion = React.forwardRef(({ expanded = false, className, children, ...props }, ref) => (
  <AccordionContext.Provider value={expanded}>
    <div
      ref={ref}
      data-state={expanded ? 'open' : 'closed'}
      className={cn('ui-root rounded-lg border border-solid border-border bg-background', className)}
      {...props}
    >
      {children}
    </div>
  </AccordionContext.Provider>
))
Accordion.displayName = 'Accordion'

const AccordionSummary = React.forwardRef(({ className, expandIcon, summaryMeta, children, onClick, onKeyDown, ...props }, ref) => {
  const expanded = useContext(AccordionContext)
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onClick}
      onKeyDown={event => {
        if (onKeyDown) onKeyDown(event)
        // 與原生按鈕相同：焦點在標題本身時，Enter／空白鍵等同點擊
        if (!event.defaultPrevented && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          if (onClick) onClick(event)
        }
      }}
      className={cn(
        'flex min-h-[52px] w-full cursor-pointer select-none items-center gap-3 rounded-lg px-5 py-3.5 text-left transition-colors hover:bg-surface',
        focusRing,
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">{children}</div>
      {summaryMeta && <span className="shrink-0 text-label tabular-nums text-text-secondary">{summaryMeta}</span>}
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn('h-5 w-5 shrink-0 text-text-tertiary transition-transform', expanded && 'rotate-180')}
      />
    </div>
  )
})
AccordionSummary.displayName = 'AccordionSummary'

const AccordionDetails = React.forwardRef(({ className, style, ...props }, ref) => {
  const expanded = useContext(AccordionContext)
  return <div ref={ref} style={expanded ? style : { ...style, display: 'none' }} className={cn('px-5 pb-5 pt-1', className)} {...props} />
})
AccordionDetails.displayName = 'AccordionDetails'

export { Accordion, AccordionSummary, AccordionDetails }
