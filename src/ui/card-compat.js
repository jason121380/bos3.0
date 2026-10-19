import React from 'react'
import { cn } from './utils'

// 舊頁面用的卡片（取代 MUI Card／CardHeader／CardContent／CardActions，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 外觀與 ui/card 相同（STYLE §6 Grok 式：#FAFAFA 表面、16px 圓角、無框無影、內距 16），介面與 MUI 相容：頁面只換 import。
// 刻意保留 MUI 的 class 名稱（MuiPaper-root、MuiCard-root、MuiCardHeader-*、MuiCardContent-root、MuiCardActions-root）：
// initialize.scss 的列印版面與深色模式、各頁的 '& .MuiCardHeader-action' 等選擇器都靠它們，拿掉會改變列印結果。
// 不加 .ui-root：它會重置內部 p／ul／table 的邊距與框線，舊卡片內容（含列印）會跑版。新畫面請用 ui/card。

const Card = React.forwardRef(function Card({ className, children, elevation, raised, square, variant, ...rest }, ref) {
  return (
    // MUI Card 是 overflow:hidden 的 Paper（內容不會溢出圓角）
    <div ref={ref} className={cn('MuiPaper-root MuiCard-root overflow-hidden rounded-2xl bg-surface text-text', className)} {...rest}>
      {children}
    </div>
  )
})

// MUI 結構：根（flex、置中）＞內容（標題 span＋副標）＋動作區（靠上、右側負邊距）
const CardHeader = React.forwardRef(function CardHeader({ title, subheader, action, avatar, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cn('MuiCardHeader-root flex items-center px-4 pb-2 pt-4', className)} {...rest}>
      {avatar && <div className="MuiCardHeader-avatar mr-4 flex shrink-0">{avatar}</div>}
      <div className="MuiCardHeader-content min-w-0 flex-auto">
        {title !== undefined && title !== null && <span className="MuiCardHeader-title block text-heading text-text">{title}</span>}
        {subheader !== undefined && subheader !== null && <span className="MuiCardHeader-subheader block text-label text-text-secondary">{subheader}</span>}
      </div>
      {action && <div className="MuiCardHeader-action -my-1 -mr-2 shrink-0 self-start">{action}</div>}
      {children}
    </div>
  )
})

const CardContent = React.forwardRef(function CardContent({ className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiCardContent-root p-4', className)} {...rest} />
})

// MUI：flex 置中、內距 8、相鄰子元素間距 8（disableSpacing 時不加）
const CardActions = React.forwardRef(function CardActions({ className, disableSpacing = false, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiCardActions-root flex items-center p-2', !disableSpacing && '[&>:not(:first-child)]:ml-2', className)} {...rest} />
})

export { Card, CardHeader, CardContent, CardActions }
