import React from 'react'
import { cn } from './utils'

// 自家輸入框（取代 MUI TextField／InputAdornment，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面刻意與 MUI TextField 相容：呼叫端只換 import，props 原樣保留；外觀依 STYLE.md（標籤一律在欄位上方、36px、rounded-md）。
// 事件落點：onChange／onFocus／onBlur 掛在輸入元素。onClick 掛在欄位外框（點輸入框、內距、圖示都會冒泡，event.target 是實際點到的節點）；
// 標籤在外框外面，點標籤不會觸發 onClick。onKeyDown、onWheel、tabIndex 等其餘 props 落在最外層，
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

// 欄位外框（TextField／Input／OutlinedInput 共用，全站輸入框一套樣式）
const fieldBoxClass = ({ multiline = false, small = false, error = false, disabled = false, className } = {}) =>
  cn(
    'flex w-full min-w-0 items-center gap-2 rounded-md border border-solid bg-background px-3 text-body text-text transition-colors',
    multiline ? 'py-1.5' : small ? 'h-8' : 'h-9 max-sm:h-10',
    error
      ? 'border-danger hover:border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/25'
      : 'border-border-strong hover:border-border-strong-hover focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25',
    disabled && 'pointer-events-none bg-surface opacity-60',
    className
  )
const FIELD_INPUT_CLASS = 'min-w-0 flex-1 border-0 bg-transparent p-0 text-body text-text outline-none placeholder:text-text-tertiary'

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
  // InputProps.placeholder 在 MUI 會傳到輸入框（InputBase），這裡比照，不放到外框 div
  const {
    startAdornment,
    endAdornment,
    inputProps: nestedInputProps,
    readOnly,
    style: inputRootStyle,
    className: inputRootClassName,
    placeholder: rootPlaceholder,
    ...inputRootRest
  } = InputProps || {}
  const small = size === 'small'
  const elementProps = {
    id,
    name,
    type: multiline ? undefined : type,
    value,
    defaultValue,
    placeholder: placeholder ?? rootPlaceholder,
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
  const boxClass = fieldBoxClass({ multiline, small, error, disabled, className: inputRootClassName })
  const fieldClass = cn(FIELD_INPUT_CLASS, multiline && 'resize-y', elementProps.className)
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

// 與 MUI Input／OutlinedInput 相容（不含標籤的輸入框）：外框同 TextField；disableUnderline 時為無框的裸輸入（外層自己畫框，如搜尋列）。
// 事件落點比照 MUI InputBase：onClick 在外框（點外框任何位置都會聚焦輸入），id／value／onChange／onKeyDown／onKeyUp／onFocus／onBlur 等在輸入元素。
const InputBase = React.forwardRef(function InputBase(
  {
    id,
    name,
    type,
    value,
    defaultValue,
    placeholder,
    autoFocus,
    autoComplete,
    readOnly,
    disabled = false,
    error = false,
    fullWidth = false,
    size,
    onChange,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onClick,
    startAdornment,
    endAdornment,
    inputProps,
    inputRef,
    disableUnderline = false,
    className,
    style,
    // MUI 外觀專用／非 DOM 屬性，忽略
    label,
    color,
    variant,
    notched,
    margin,
    css: _css,
    ...rest
  },
  ref
) {
  const localRef = React.useRef(null)
  const setInputRef = node => {
    localRef.current = node
    assignRef(inputRef, node)
    if (inputProps && inputProps.ref) assignRef(inputProps.ref, node)
  }
  const { ref: _inputPropsRef, className: inputClassName, ...restInputProps } = inputProps || {}
  return (
    <div
      ref={ref}
      className={cn(
        'ui-root',
        disableUnderline ? 'inline-flex min-w-0 items-center gap-2 text-body text-text' : fieldBoxClass({ small: size === 'small', error, disabled }),
        fullWidth && 'w-full',
        className
      )}
      style={style}
      onClick={event => {
        if (localRef.current && event.target === event.currentTarget) localRef.current.focus()
        if (onClick) onClick(event)
      }}
      {...rest}
    >
      {startAdornment}
      <input
        ref={setInputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={error || undefined}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(FIELD_INPUT_CLASS, inputClassName)}
        {...restInputProps}
      />
      {endAdornment}
    </div>
  )
})

const Input = InputBase
const OutlinedInput = InputBase

export { TextField, InputAdornment, InputBase, Input, OutlinedInput }
export default TextField
