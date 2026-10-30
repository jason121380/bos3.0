import React, { useEffect, useRef } from 'react'
import { cn } from './utils'

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

// 原生 checkbox，支援 indeterminate；選取色為 primary（STYLE.md §2）
// 與 MUI Checkbox 相容：onChange(event, checked)、inputRef、inputProps；color／icon／checkedIcon／disableRipple／sx／size／edge 只影響 MUI 外觀，接收後忽略
const Checkbox = React.forwardRef(
  (
    {
      className,
      indeterminate = false,
      onChange,
      inputRef,
      inputProps,
      color,
      icon,
      checkedIcon,
      disableRipple,
      sx,
      size,
      edge,
      css: _css,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = useRef(null)
    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate
    }, [indeterminate])
    return (
      <input
        type="checkbox"
        ref={node => {
          innerRef.current = node
          assignRef(forwardedRef, node)
          assignRef(inputRef, node)
        }}
        className={cn(
          'ui-root h-4 w-4 shrink-0 cursor-pointer rounded-sm accent-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40',
          'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
          className
        )}
        onChange={onChange ? event => onChange(event, event.target.checked) : undefined}
        {...(inputProps || {})}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

// 觸控命中區（STYLE §9 觸控目標 ≥ 40px）：原生 checkbox 不能掛偽元素，改由包住它的 <label> 在手機寬度以透明偽元素上下各擴 8px
// （列高 24px → 命中 40px）；-z-10＋isolate 讓偽元素墊在標籤內容下方，不擋住標籤裡的連結或按鈕；不改視覺尺寸與版面。
export const checkboxHitArea =
  "max-sm:relative max-sm:isolate max-sm:before:absolute max-sm:before:inset-x-0 max-sm:before:-inset-y-2 max-sm:before:-z-10 max-sm:before:content-['']"

// 帶文字的勾選框，取代 MUI FormControlLabel + Checkbox
// onChange(event, checked) 與 MUI Checkbox 相同；label 可放任何節點
const CheckboxField = React.forwardRef(({ label, onChange, disabled, className, labelClassName, ...props }, ref) => (
  <label
    className={cn(
      'ui-root inline-flex cursor-pointer select-none items-center gap-2 text-body text-text',
      checkboxHitArea,
      disabled && 'cursor-not-allowed opacity-60',
      className
    )}
  >
    <Checkbox ref={ref} disabled={disabled} onChange={onChange} {...props} />
    <span className={labelClassName}>{label}</span>
  </label>
))
CheckboxField.displayName = 'CheckboxField'

// 與 MUI FormControlLabel 相容：control（Checkbox／Switch…）＋label；checked／name／onChange／value／inputRef 在 control 未指定時由此帶入（同 MUI），
// disabled 一律帶入；其餘 props（onFocus、onKeyDown、tabIndex、style…）落在外層 label
const FormControlLabel = React.forwardRef(
  (
    {
      control,
      label,
      checked,
      name,
      onChange,
      value,
      inputRef,
      disabled,
      labelPlacement = 'end',
      className,
      style,
      componentsProps,
      slotProps,
      css: _css,
      ...rest
    },
    ref
  ) => {
    const controlProps = {}
    const fromLabel = { checked, name, onChange, value, inputRef }
    Object.keys(fromLabel).forEach(key => {
      if (control.props[key] === undefined && fromLabel[key] !== undefined) controlProps[key] = fromLabel[key]
    })
    if (disabled !== undefined && control.props.disabled === undefined) controlProps.disabled = disabled
    const isDisabled = controlProps.disabled !== undefined ? controlProps.disabled : control.props.disabled
    return (
      <label
        ref={ref}
        className={cn(
          'ui-root inline-flex cursor-pointer select-none items-center gap-2 text-body text-text',
          checkboxHitArea,
          labelPlacement === 'start' && 'flex-row-reverse',
          labelPlacement === 'top' && 'flex-col-reverse items-start',
          labelPlacement === 'bottom' && 'flex-col items-start',
          isDisabled && 'cursor-not-allowed opacity-60',
          className
        )}
        style={style}
        {...rest}
      >
        {React.cloneElement(control, controlProps)}
        <span>{label}</span>
      </label>
    )
  }
)
FormControlLabel.displayName = 'FormControlLabel'

export { Checkbox, CheckboxField, FormControlLabel }
