import React from 'react'
import { cn } from './utils'

// 自家輸入框（取代 MUI TextField／InputAdornment，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面刻意與 MUI TextField 相容：呼叫端只換 import，props 原樣保留；外觀依 STYLE.md（標籤一律在欄位上方、36px、rounded-md）。
// 事件落點比照 MUI：onChange／onFocus／onBlur／onClick 掛在輸入元素；onKeyDown、onWheel、tabIndex 等其餘 props 落在外層（MUI 的 FormControl 根），
// 鍵盤事件由輸入框冒泡上來，event.target 仍是輸入框。variant（outlined／standard）、color、focused、InputLabelProps 只影響 MUI 外觀，接收後忽略。

let autoIdSeed = 0
const useAutoId = idProp => {
  const ref = React.useRef(null)
  if (ref.current === null) ref.current = `tf-${(autoIdSeed += 1)}`
  return idProp || ref.current
}

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

const TextField = React.forwardRef(function TextField(
  {
    label,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onClick,
    onSelect,
    onCopy,
    onPaste,
    type,
    name,
    id: idProp,
    placeholder,
    autoFocus,
    autoComplete,
    disabled = false,
    required = false,
    error = false,
    helperText,
    fullWidth = false,
    size,
    multiline = false,
    rows,
    minRows,
    maxRows,
    inputRef,
    inputProps,
    InputProps = {},
    className,
    style,
    children,
    // MUI 外觀專用，忽略
    variant,
    color,
    focused,
    margin,
    InputLabelProps,
    FormHelperTextProps,
    css: _css, // 沒有 emotion pragma 的檔案若傳物件，不落到 DOM
    ...rest
  },
  ref
) {
  const id = useAutoId(idProp)
  const { startAdornment, endAdornment, inputProps: nestedInputProps, readOnly, style: inputRootStyle, className: inputRootClassName, ...inputRootRest } = InputProps || {}
  const small = size === 'small'
  const elementProps = {
    id,
    name,
    type: multiline ? undefined : type,
    value,
    defaultValue,
    placeholder,
    autoFocus,
    autoComplete,
    disabled,
    required,
    readOnly,
    onChange,
    onFocus,
    onBlur,
    onSelect,
    onCopy,
    onPaste,
    'aria-invalid': error || undefined,
    'aria-describedby': helperText ? `${id}-helper` : undefined,
    ...(nestedInputProps || {}),
    ...(inputProps || {}),
  }
  const setInputRef = node => {
    assignRef(inputRef, node)
    if (nestedInputProps && nestedInputProps.ref) assignRef(nestedInputProps.ref, node)
    if (inputProps && inputProps.ref) assignRef(inputProps.ref, node)
  }
  const hasAdornment = !!(startAdornment || endAdornment)
  const boxClass = cn(
    'flex w-full min-w-0 items-center gap-2 rounded-md border border-solid bg-background px-3 text-body text-text transition-colors',
    multiline ? 'py-1.5' : small ? 'h-8' : 'h-9 max-sm:h-10',
    error ? 'border-danger' : 'border-border-strong hover:border-border-strong-hover',
    'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
    disabled && 'pointer-events-none bg-surface opacity-60',
    inputRootClassName
  )
  const fieldClass = cn(
    'min-w-0 flex-1 border-0 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary',
    multiline && 'resize-y',
    elementProps.className
  )
  const field = multiline ? (
    <textarea
      {...elementProps}
      ref={setInputRef}
      rows={rows || minRows || 2}
      style={{ ...(elementProps.style || {}), ...(maxRows ? { maxHeight: `${maxRows * 24}px` } : {}) }}
      className={fieldClass}
    />
  ) : (
    <input {...elementProps} ref={setInputRef} className={fieldClass} />
  )

  return (
    <div
      ref={ref}
      // 比照 MUI 根節點 inline-flex＋vertical-align:top：與前後文字同列（如「總業績從 [欄位] 抽成」）
      className={cn('ui-root inline-flex min-w-0 flex-col gap-1.5 align-top', fullWidth ? 'w-full' : 'w-[220px] max-w-full', className)}
      style={style}
      {...rest}
    >
      {label !== undefined && label !== null && label !== '' && (
        <label htmlFor={id} className={cn('text-label', error ? 'text-danger' : 'text-text-secondary')}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className={boxClass} style={inputRootStyle} onClick={onClick} {...inputRootRest}>
        {startAdornment}
        {field}
        {endAdornment}
      </div>
      {helperText && (
        <p id={`${id}-helper`} className={cn('m-0 text-caption', error ? 'text-danger' : 'text-text-tertiary')}>
          {helperText}
        </p>
      )}
      {!hasAdornment && children}
    </div>
  )
})

// 與 MUI InputAdornment 相容：放在 InputProps.startAdornment／endAdornment 內
const InputAdornment = ({ position, className, children, ...props }) => (
  <span className={cn('flex shrink-0 items-center text-text-tertiary', position === 'start' ? '-ml-1' : '-mr-1', className)} {...props}>
    {children}
  </span>
)

export { TextField, InputAdornment }
export default TextField
