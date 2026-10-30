import React from 'react'
import { cn } from './utils'
import { checkboxHitArea } from './checkbox'

// 原生 radio，保留圓點外觀與瀏覽器原生群組鍵盤行為（同 name 方向鍵移動＋選取、Tab 只停已選/第一顆、空白鍵選取）
// 選取色為 primary（STYLE.md §6 Radio）；不改成分段按鈕
const Radio = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="radio"
    ref={ref}
    className={cn(
      'ui-root h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40',
      'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
      className
    )}
    {...props}
  />
))
Radio.displayName = 'Radio'

// 帶文字的單選，取代 MUI FormControlLabel + Radio
// onChange(event, value) 與 MUI RadioGroup 的 (event, value) 簽名相同；原 handler 只讀 event.target.value 亦相容
// checked / value / name / disabled 一律傳給原生 input；同組必須給相同 name，原生互斥與鍵盤行為才成立
const RadioField = React.forwardRef(({ label, onChange, disabled, className, labelClassName, ...props }, ref) => (
  <label
    className={cn(
      'ui-root inline-flex cursor-pointer select-none items-center gap-2 text-body text-text',
      checkboxHitArea,
      disabled && 'cursor-not-allowed opacity-60',
      className
    )}
  >
    <Radio ref={ref} disabled={disabled} onChange={e => onChange && onChange(e, e.target.value)} {...props} />
    <span className={labelClassName}>{label}</span>
  </label>
))
RadioField.displayName = 'RadioField'

export { Radio, RadioField }
