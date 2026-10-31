import React from 'react'
import { cn, phoneIconHit } from './utils'
import { checkboxHitArea } from './checkbox'
import { useFieldControl, useFieldLabelledBy } from './input'

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

// 開關，取代 MUI Switch；onChange(event, checked) 與 MUI 相同（原生 handler 只讀 event 也相容）
// label：取代 FormControlLabel + Switch 的組合；labelPlacement 'end'（預設）或 'start'
// 其餘 props（data-testid、aria-*…）一律給 input；MUI 的 color / size 忽略
// inputRef：同 MUI，取得 input 元素（react-hook-form 以 inputRef={register} 註冊非受控欄位）
const Switch = React.forwardRef(
  (
    { checked, defaultChecked, onChange, disabled, name, id, label, labelPlacement = 'end', className, inputProps, inputRef, color, size, ...props },
    ref
  ) => {
    // 沒有自己的 label 時，以外層 Field 的標籤命名（aria-labelledby；呼叫端的 aria-* 仍優先）
    const fieldLabelledBy = useFieldLabelledBy(label ? { 'aria-label': true } : { ...inputProps, ...props })
    // 外層 Field 的標籤以 htmlFor 指向開關（點標籤切換一次，與點開關相同）；既有 id（inputProps.id 優先於 id，同原本的覆寫順序）不改
    const ownId = inputProps && inputProps.id !== undefined ? inputProps.id : id
    const controlId = useFieldControl(ownId)
    const control = (
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          ref={node => {
            assignRef(ref, node)
            assignRef(inputRef, node)
          }}
          type="checkbox"
          role="switch"
          name={name}
          aria-labelledby={fieldLabelledBy}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={e => onChange && onChange(e, e.target.checked)}
          className="peer absolute inset-0 z-[1] m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...inputProps}
          {...props}
          id={controlId}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none h-5 w-9 rounded-full bg-border-strong transition-colors peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1 peer-disabled:opacity-40'
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-4"
        />
      </span>
    )
    if (!label) return <label className={cn('ui-root inline-flex cursor-pointer', phoneIconHit, className)}>{control}</label>
    return (
      <label
        className={cn(
          'ui-root inline-flex cursor-pointer select-none items-center gap-2 text-body text-text',
          checkboxHitArea,
          disabled && 'cursor-not-allowed opacity-60',
          labelPlacement === 'start' && 'flex-row-reverse',
          className
        )}
      >
        {control}
        <span>{label}</span>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
