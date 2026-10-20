import React from 'react'
import { cn } from './utils'
import './display-compat.css'
import './link-compat.css'

// 舊頁面用的連結（取代 MUI Link，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// Link 是帶顏色與底線規則的 Typography：component 可給 react-router 的 Link（to／target 照傳）；
// color：primary（預設）／inherit 走 class，其他色值以 CSS 變數＋單一 class 套用（不用 inline style：要和 MUI 一樣能被
// initialize-dark.scss 的 .MuiTypography-root 顏色規則蓋過，深色模式才一致）；underline：none／hover／always（預設）。
const Link = React.forwardRef(function Link({ component: Component = 'a', color = 'primary', underline = 'always', variant = 'inherit', className, style, TypographyClasses, ...rest }, ref) {
  const named = color === 'primary' || color === 'inherit'
  return (
    <Component
      ref={ref}
      className={cn(
        'MuiTypography-root',
        `MuiTypography-${variant}`,
        'MuiLink-root',
        `MuiLink-underline${underline.charAt(0).toUpperCase() + underline.slice(1)}`,
        named ? `MuiLink-color${color.charAt(0).toUpperCase() + color.slice(1)}` : 'MuiLink-colorCustom',
        className
      )}
      style={named ? style : { '--mui-link-color': color, ...style }}
      {...rest}
    />
  )
})

export { Link }
export default Link
