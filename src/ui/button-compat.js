import React from 'react'
import { buttonVariants } from './button'
import { cn } from './utils'

// 舊頁面用的按鈕（取代 MUI Button，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// 外觀一律走 ui/button 的變體（全站同一套按鈕），只把 MUI 的 variant × color 對應過去：
//   contained＋primary → primary（品牌藍實心）；contained＋error → danger；contained＋secondary／inherit → secondary
//   outlined → secondary（橋接主題原本就把 outlined 畫成淺灰實心）；text（MUI 預設）→ ghost
// 尺寸比照 MUI：最小高度而非固定高度、文字可換行、最小寬度 64px——舊頁面有固定寬度的長文字按鈕，固定高度會溢出。
// focusRipple／disableRipple／disableElevation 只影響 MUI 漣漪與陰影，接收後忽略。

const variantOf = (variant, color) => {
  if (variant === 'contained') {
    if (color === 'error') return 'danger'
    if (color === 'secondary' || color === 'inherit') return 'secondary'
    return 'primary'
  }
  if (variant === 'outlined') return 'secondary'
  return 'ghost'
}

const sizeClass = {
  small: 'min-h-8 px-3 text-[13px]',
  medium: 'min-h-9 px-4',
  large: 'min-h-9 px-4',
}

const Button = React.forwardRef(function Button(
  {
    variant = 'text',
    color = 'primary',
    size = 'medium',
    fullWidth = false,
    startIcon,
    endIcon,
    type = 'button',
    className,
    children,
    focusRipple,
    disableRipple,
    disableFocusRipple,
    disableElevation,
    ...rest
  },
  ref
) {
  const mapped = variantOf(variant, color)
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'ui-root',
        buttonVariants({ variant: mapped }),
        'h-auto min-w-[64px] whitespace-normal py-0 max-sm:h-auto',
        sizeClass[size] || sizeClass.medium,
        mapped !== 'primary' && mapped !== 'danger' && color === 'error' && 'text-danger',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  )
})

export { Button }
export default Button
