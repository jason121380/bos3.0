import React from 'react'
import { cn } from './utils'
import './grid-compat.css'

// 舊頁面用的格線（取代 MUI Grid v1，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// 輸出與 MUI 完全相同的 class 名稱，版面規則由 grid-compat.css（scripts/redesign/gen-grid-css.py 產生）重現：
// initialize.scss 的列印版面（MerchantDailyReportCard、薪資單、printGrid）與深色模式都以 .MuiGrid-* 選擇器排版，不能改名。
// 新畫面請直接用 Tailwind 的 grid／flex。

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl']

// MUI 的 system props（justifyContent、alignItems…）會被頁面的 emotion css 覆蓋，所以對應成 class 而不是 inline style
const JUSTIFY = {
  'flex-start': 'justify-start',
  center: 'justify-center',
  'flex-end': 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
}
const ALIGN = {
  'flex-start': 'items-start',
  center: 'items-center',
  'flex-end': 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}
const GAP = { 1: 'gap-2', 2: 'gap-4', 3: 'gap-6' }

const Grid = React.forwardRef(function Grid(
  {
    container = false,
    item = false,
    spacing = 0,
    direction = 'row',
    wrap = 'wrap',
    zeroMinWidth = false,
    justifyContent,
    alignItems,
    flexWrap,
    gap,
    component: Component = 'div',
    className,
    style,
    children,
    xs,
    sm,
    md,
    lg,
    xl,
    ...rest
  },
  ref
) {
  const sizes = { xs, sm, md, lg, xl }
  const extraStyle = {}
  const sizeClasses = BREAKPOINTS.filter(bp => sizes[bp] !== undefined && sizes[bp] !== false).map(bp => {
    const v = sizes[bp]
    // 非整數欄寬（如 12 / 比較組數）沒有對應 class：xs 不分斷點，直接以 inline 寬度呈現，與 MUI 計算結果相同
    if (typeof v === 'number' && !Number.isInteger(v)) {
      if (bp === 'xs') {
        const width = `${Math.round((v / 12) * 1e8) / 1e6}%`
        Object.assign(extraStyle, { flexBasis: width, maxWidth: width, flexGrow: 0 })
      }
      return null
    }
    return `MuiGrid-grid-${bp}-${v}`
  })
  const inlineFallback = {}
  if (justifyContent && !JUSTIFY[justifyContent]) inlineFallback.justifyContent = justifyContent
  if (alignItems && !ALIGN[alignItems]) inlineFallback.alignItems = alignItems
  if (gap !== undefined && !GAP[gap]) inlineFallback.gap = typeof gap === 'number' ? gap * 8 : gap

  return (
    <Component
      ref={ref}
      className={cn(
        'MuiGrid-root',
        container && 'MuiGrid-container',
        item && 'MuiGrid-item',
        zeroMinWidth && 'MuiGrid-zeroMinWidth',
        container && spacing !== 0 && `MuiGrid-spacing-xs-${spacing}`,
        container && direction !== 'row' && `MuiGrid-direction-xs-${direction}`,
        container && wrap !== 'wrap' && `MuiGrid-wrap-xs-${wrap}`,
        ...sizeClasses,
        JUSTIFY[justifyContent],
        ALIGN[alignItems],
        flexWrap === 'nowrap' && 'flex-nowrap',
        flexWrap === 'wrap' && 'flex-wrap',
        GAP[gap],
        className
      )}
      style={{ ...extraStyle, ...inlineFallback, ...style }}
      {...rest}
    >
      {children}
    </Component>
  )
})

export { Grid }
export default Grid
