import React from 'react'
import { cn } from './utils'
import './display-compat.css'

// 舊頁面用的顯示元件（取代 MUI Paper／Divider／CircularProgress／Typography／Container，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面與 MUI 相容（頁面只換 import），輸出 MUI 同名元素與 class，樣式由 display-compat.css 重現：
// initialize.scss 的列印與深色模式、各頁 '& .MuiPaper-root' 等選擇器都靠它們。新畫面請用 ui 元件與 Tailwind。

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

// 橋接主題 defaultProps：elevation 0
const Paper = React.forwardRef(function Paper({ elevation = 0, square = false, variant = 'elevation', component: Component = 'div', className, ...rest }, ref) {
  return (
    <Component
      ref={ref}
      className={cn(
        'MuiPaper-root',
        variant === 'outlined' ? 'MuiPaper-outlined' : `MuiPaper-elevation MuiPaper-elevation${elevation}`,
        !square && 'MuiPaper-rounded',
        className
      )}
      {...rest}
    />
  )
})

const Divider = React.forwardRef(function Divider({ component: Component = 'hr', className, ...rest }, ref) {
  return <Component ref={ref} className={cn('MuiDivider-root MuiDivider-fullWidth', className)} {...rest} />
})

// 同 MUI：SVG 圓環 44 單位、粗細 3.6；不定進度旋轉＋伸縮動畫，定值以 dashoffset 顯示並轉 -90 度從頂端開始
const SIZE = 44
const CircularProgress = React.forwardRef(function CircularProgress(
  { color = 'primary', size = 40, thickness = 3.6, value = 0, variant = 'indeterminate', className, style, ...rest },
  ref
) {
  const rootStyle = {}
  const circleStyle = {}
  const rootProps = {}
  if (variant === 'determinate') {
    const circumference = 2 * Math.PI * ((SIZE - thickness) / 2)
    circleStyle.strokeDasharray = circumference.toFixed(3)
    rootProps['aria-valuenow'] = Math.round(value)
    circleStyle.strokeDashoffset = `${(((100 - value) / 100) * circumference).toFixed(3)}px`
    rootStyle.transform = 'rotate(-90deg)'
  }
  return (
    <span
      ref={ref}
      role="progressbar"
      className={cn('MuiCircularProgress-root', `MuiCircularProgress-${variant}`, `MuiCircularProgress-color${capitalize(color)}`, className)}
      style={{ width: size, height: size, ...rootStyle, ...style }}
      {...rootProps}
      {...rest}
    >
      <svg className="MuiCircularProgress-svg" viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}>
        <circle
          className={cn('MuiCircularProgress-circle', `MuiCircularProgress-circle${capitalize(variant)}`)}
          style={circleStyle}
          cx={SIZE}
          cy={SIZE}
          r={(SIZE - thickness) / 2}
          fill="none"
          strokeWidth={thickness}
        />
      </svg>
    </span>
  )
})

const VARIANT_TAG = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6', subtitle1: 'h6', subtitle2: 'h6', body1: 'p', body2: 'p', inherit: 'p' }

const Typography = React.forwardRef(function Typography(
  { variant = 'body1', align = 'inherit', gutterBottom = false, noWrap = false, paragraph = false, component, className, ...rest },
  ref
) {
  const Component = component || (paragraph ? 'p' : VARIANT_TAG[variant] || 'span')
  return (
    <Component
      ref={ref}
      className={cn(
        'MuiTypography-root',
        variant !== 'inherit' && `MuiTypography-${variant}`,
        align !== 'inherit' && `MuiTypography-align${capitalize(align)}`,
        gutterBottom && 'MuiTypography-gutterBottom',
        noWrap && 'MuiTypography-noWrap',
        paragraph && 'MuiTypography-paragraph',
        className
      )}
      {...rest}
    />
  )
})

const Container = React.forwardRef(function Container({ maxWidth = 'lg', component: Component = 'div', className, ...rest }, ref) {
  return <Component ref={ref} className={cn('MuiContainer-root', maxWidth && `MuiContainer-maxWidth${capitalize(String(maxWidth))}`, className)} {...rest} />
})

export { Paper, Divider, CircularProgress, Typography, Container }
