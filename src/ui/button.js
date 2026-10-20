import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn, focusRing } from './utils'

// STYLE.md §6（Grok 式）：全膠囊；primary（主題藍實心）/ secondary（#F5F5F5 實心、無框）/ ghost / danger；
// 尺寸 sm 32 / md 36 / lg 40、字級 14 medium；150ms 過渡、按下 scale(0.97)；圖示 16px、間距 6px
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none',
    'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
    focusRing
  ),
  {
    variants: {
      variant: {
        primary: 'rounded-full bg-primary text-primary-foreground hover:bg-primary/85',
        secondary: 'rounded-full bg-surface-hover text-text hover:bg-surface-active',
        ghost: 'rounded-md text-text hover:bg-surface-hover',
        danger: 'rounded-full bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3.5 text-label',
        md: 'h-9 px-4 text-label max-sm:h-10', // 手機觸控目標 40px
        lg: 'h-10 px-[18px] text-label',
        icon: 'h-8 w-8 rounded-full max-sm:h-10 max-sm:w-10',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  }
)

// 圖示鈕（size="icon"）沒給 title 時以 aria-label 補上（STYLE §6／§9：圖示按鈕帶 title 與 aria-label，滑鼠停留可看到用途）；
// asChild 時名稱多半寫在子元素（RouterLink）上，一併讀取。呼叫端自己給的 title 一律優先。
const iconTitle = (size, asChild, props) => {
  if (size !== 'icon' || props.title !== undefined) return undefined
  if (typeof props['aria-label'] === 'string') return props['aria-label']
  const child = asChild && React.isValidElement(props.children) ? props.children.props : null
  if (child && child.title === undefined && typeof child['aria-label'] === 'string') return child['aria-label']
  return undefined
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const title = iconTitle(size, asChild, props)
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn('ui-root', buttonVariants({ variant, size }), className)}
      {...(title !== undefined ? { title } : null)}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
