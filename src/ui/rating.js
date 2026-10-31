import React from 'react'
import { Star } from 'lucide-react'
import { cn, focusRing } from './utils'

let ratingSeed = 0
// 整數星等：原生 radio 保留表單語意；再次點目前值回傳 null，與相容元件簽名相同。
const Rating = React.forwardRef(function Rating(
  {
    value: valueProp,
    defaultValue = null,
    onChange,
    readOnly = false,
    disabled = false,
    size = 'medium',
    max = 5,
    name: nameProp,
    precision,
    className,
    'aria-label': ariaLabel = '評分',
    ...props
  },
  ref
) {
  const [autoName] = React.useState(() => `ui-rating-${++ratingSeed}`)
  const name = nameProp || autoName
  const [innerValue, setValue] = React.useState(defaultValue)
  const [hover, setHover] = React.useState(null)
  const value = valueProp === undefined ? innerValue : valueProp
  const locked = readOnly || disabled
  const pick = (event, next) => {
    // 防禦：點擊與鍵盤兩個呼叫端都先檢查 locked，鎖定時不會呼叫到這裡，測不到
    /* istanbul ignore if */
    if (locked) return
    if (valueProp === undefined) setValue(next)
    if (onChange) onChange(event, next)
  }
  return (
    <span
      {...props}
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      className={cn('ui-root inline-flex items-center', disabled && 'opacity-50', className)}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <label
          key={n}
          data-filled={n <= (hover === null ? value || 0 : hover)}
          className={cn('relative flex min-h-10 min-w-10 items-center justify-center rounded-md', locked ? 'cursor-default' : 'cursor-pointer')}
          onMouseEnter={() => {
            if (!locked) setHover(n)
          }}
        >
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${n} 星`}
            tabIndex={readOnly ? -1 : value === n || (!value && n === 1) ? 0 : -1}
            className={cn('peer absolute inset-0 m-0 h-full w-full appearance-none rounded-md opacity-0', focusRing)}
            onChange={() => {}}
            onClick={event => {
              if (locked) event.preventDefault()
              else pick(event, value === n ? null : n)
            }}
            onKeyDown={event => {
              if (locked) return
              const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
              if (delta) {
                event.preventDefault()
                const next = ((n - 1 + delta + max) % max) + 1
                event.currentTarget.closest('[role="radiogroup"]').querySelectorAll('input')[next - 1].focus()
                pick(event, next)
              } else if (event.key === ' ') {
                event.preventDefault()
                pick(event, value === n ? null : n)
              }
            }}
          />
          <Star
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn(
              'pointer-events-none rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
              size === 'large' ? 'h-8 w-8' : size === 'small' ? 'h-5 w-5' : 'h-6 w-6',
              n <= (hover === null ? value || 0 : hover) ? 'fill-warning text-warning' : 'text-text-tertiary'
            )}
          />
        </label>
      ))}
    </span>
  )
})

export { Rating }
