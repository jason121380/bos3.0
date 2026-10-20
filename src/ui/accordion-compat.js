import React from 'react'
import { cn } from './utils'
import './accordion-compat.css'

// 舊頁面用的可展開區塊（取代 MUI Accordion／AccordionSummary／AccordionDetails，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面與 MUI 相容（頁面只換 import），輸出 MUI 同名元素、class 與 ARIA（標題 role=button＋aria-expanded、內容 role=region）。
// 外觀為目前橋接主題的 Grok 式無框卡片；新畫面請用 ui/accordion。
// 行為同 MUI：expanded 受控／defaultExpanded 非受控；點標題先呼叫 onChange(event, !expanded)、再呼叫標題自己的 onClick；
// 收合時內容保持掛載，只是高度 0 且不可見。展開不做高度動畫（MUI 為 300ms 高度過渡）。

const AccordionContext = React.createContext({ expanded: false, disabled: false, toggle: () => {} })

const Accordion = React.forwardRef(function Accordion(
  { expanded: expandedProp, defaultExpanded = false, onChange, disabled = false, className, children, square, disableGutters, TransitionProps, TransitionComponent, ...rest },
  ref
) {
  const [inner, setInner] = React.useState(defaultExpanded)
  const expanded = expandedProp !== undefined ? expandedProp : inner
  const toggle = React.useCallback(
    event => {
      if (expandedProp === undefined) setInner(!expanded)
      if (onChange) onChange(event, !expanded)
    },
    [expandedProp, expanded, onChange]
  )
  const [summary, ...details] = React.Children.toArray(children)
  const summaryProps = React.isValidElement(summary) ? summary.props : {}
  const value = React.useMemo(() => ({ expanded, disabled, toggle }), [expanded, disabled, toggle])
  return (
    <div
      ref={ref}
      className={cn('MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiAccordion-root', expanded && 'Mui-expanded', disabled && 'Mui-disabled', className)}
      {...rest}
    >
      <AccordionContext.Provider value={value}>{summary}</AccordionContext.Provider>
      <div className={cn('MuiCollapse-root MuiCollapse-vertical', expanded ? 'MuiCollapse-entered' : 'MuiCollapse-hidden')}>
        <div className="MuiCollapse-wrapper MuiCollapse-vertical">
          <div className="MuiCollapse-wrapperInner MuiCollapse-vertical">
            <div aria-labelledby={summaryProps.id} id={summaryProps['aria-controls']} role="region" className="MuiAccordion-region">
              {details}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

const AccordionSummary = React.forwardRef(function AccordionSummary({ expandIcon, onClick, onKeyDown, className, children, ...rest }, ref) {
  const { expanded, disabled, toggle } = React.useContext(AccordionContext)
  const handleClick = event => {
    if (disabled) return
    toggle(event)
    if (onClick) onClick(event)
  }
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={expanded}
      aria-disabled={disabled || undefined}
      className={cn('MuiButtonBase-root MuiAccordionSummary-root', expanded && 'Mui-expanded', disabled && 'Mui-disabled', className)}
      onClick={handleClick}
      onKeyDown={event => {
        if (onKeyDown) onKeyDown(event)
        // 同 ButtonBase：非原生按鈕以 Enter／空白鍵觸發點擊
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          handleClick(event)
        }
      }}
      {...rest}
    >
      <div className={cn('MuiAccordionSummary-content', expanded && 'Mui-expanded')}>{children}</div>
      {expandIcon && <div className={cn('MuiAccordionSummary-expandIconWrapper', expanded && 'Mui-expanded')}>{expandIcon}</div>}
    </div>
  )
})

const AccordionDetails = React.forwardRef(function AccordionDetails({ className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiAccordionDetails-root', className)} {...rest} />
})

export { Accordion, AccordionSummary, AccordionDetails }
