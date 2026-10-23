import React from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClass } from './input'
import { cn } from './utils'
import { CompatLayer } from './compat-layer'
import { useLayerRef } from './layer-stack'

// 自家下拉組（取代 MUI FormControl／InputLabel／Select／MenuItem／FormHelperText，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面與 MUI 相容：頁面只換 import，<FormControl><InputLabel/><Select value onChange><MenuItem value/></Select></FormControl> 原樣保留。
// - 單選：原生 <select>（手機叫出系統選單、可放在任何 Dialog 內），選項值可為任何型別，以索引對應；onChange 與 MUI 相同（event.target.value 為原始值、event.target.name 為 name）
// - renderValue：在原生 select 上疊一層自訂顯示（如載入中轉圈），點選仍由原生 select 處理
// - multiple：自家勾選清單（MenuItem 內容原樣渲染）
// - InputLabel 一律成為欄位上方標籤（STYLE §6）；Select 的 label、variant、sx 只影響 MUI 外框，接收後忽略

const FormControlContext = React.createContext(null)
let seed = 0
const useStableId = () => {
  const ref = React.useRef(null)
  if (ref.current === null) ref.current = `fc-${(seed += 1)}`
  return ref.current
}

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

const textOf = node => {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement(node)) return textOf(node.props.children)
  return ''
}

// MUI 比對規則：非物件值以字串比較（1 與 '1' 視為相同）
const same = (a, b) => a === b || (a !== null && b !== null && typeof a !== 'object' && typeof b !== 'object' && String(a) === String(b))

function collectOptions(children) {
  const options = []
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    if (child.type === React.Fragment) {
      options.push(...collectOptions(child.props.children))
      return
    }
    // MenuItem 或 native 模式的 <option>
    options.push({ value: child.props.value, disabled: child.props.disabled, children: child.props.children, props: child.props })
  })
  return options
}

const FormControl = React.forwardRef(function FormControl(
  { fullWidth = false, error = false, required = false, disabled = false, size, className, style, children, variant, focused, margin, css: _css, ...rest },
  ref
) {
  const id = useStableId()
  // 比照 MUI useFormControl().focused：子欄位聚焦時為 true（如排班卡標題聚焦才顯示提示）
  const [isFocused, setFocused] = React.useState(false)
  const value = React.useMemo(() => ({ id, error, required, disabled, size, focused: isFocused }), [id, error, required, disabled, size, isFocused])
  return (
    <FormControlContext.Provider value={value}>
      <div
        ref={ref}
        className={cn('ui-root inline-flex min-w-0 flex-col gap-1.5 align-top', fullWidth ? 'w-full' : 'min-w-[120px]', className)}
        style={style}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={() => setFocused(false)}
        {...rest}
      >
        {children}
      </div>
    </FormControlContext.Provider>
  )
})

const InputLabel = React.forwardRef(function InputLabel({ children, htmlFor, id, className, style, shrink, focused, variant, ...rest }, ref) {
  const ctx = React.useContext(FormControlContext)
  return (
    <label
      ref={ref}
      id={id}
      htmlFor={htmlFor || (ctx && ctx.id)}
      className={cn('text-label', ctx && ctx.error ? 'text-danger' : 'text-text-secondary', className)}
      style={style}
      {...rest}
    >
      {children}
      {ctx && ctx.required && <span className="text-danger"> *</span>}
    </label>
  )
})

// MenuItem 只是選項資料的載體（由 Select 收集），本身不渲染
const MenuItem = () => null
MenuItem.displayName = 'MenuItem'

const FormHelperText = ({ children, className, error, ...rest }) => {
  const ctx = React.useContext(FormControlContext)
  const isError = error !== undefined ? error : ctx && ctx.error
  return (
    <p className={cn('m-0 text-caption', isError ? 'text-danger' : 'text-text-tertiary', className)} {...rest}>
      {children}
    </p>
  )
}

function MultipleSelect({ id, value, onChange, name, options, renderValue, disabled, className, labelId }) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  const triggerRef = React.useRef(null)
  // 多選清單登記共用圖層與 Scope，避免 Escape 關閉外窗、外點移除 DOM 時搶焦點。
  const escape = event => {
    event.preventDefault()
    setOpen(false)
    if (triggerRef.current) triggerRef.current.focus()
  }
  const { ref: listRef, zIndex } = useLayerRef(null, open, escape)
  React.useEffect(() => {
    if (!open) return undefined
    let pendingClose
    const close = event => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return
      const dialog = rootRef.current.closest('[role="dialog"]')
      // 同窗滑鼠預設聚焦尚未完成，先保留 DOM，讓 FocusScope observer 不會插隊。
      if (dialog && dialog.contains(event.target)) pendingClose = setTimeout(() => setOpen(false), 0)
      else setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      clearTimeout(pendingClose)
    }
  }, [open])
  const list = Array.isArray(value) ? value : []
  const toggle = (event, optionValue) => {
    const exists = list.some(v => same(v, optionValue))
    const next = exists ? list.filter(v => !same(v, optionValue)) : [...list, optionValue]
    const target = { value: next, name }
    if (onChange) onChange(Object.assign(Object.create(event), { target, currentTarget: target }))
  }
  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <CompatLayer open={open} onEscapeKeyDown={escape} />
      <button ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={cn(inputClass, 'flex items-center justify-between gap-2 pr-9 text-left')}
      >
        <span className="min-w-0 truncate">{renderValue ? renderValue(list) : list.map(v => textOf((options.find(o => same(o.value, v)) || {}).children)).join(', ')}</span>
      </button>
      <ChevronDown aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      {open && (
        <ul ref={listRef} style={{ zIndex }} role="listbox" aria-multiselectable="true" className="absolute left-0 right-0 top-full z-[1500] m-0 mt-1 max-h-80 list-none overflow-y-auto rounded-lg border border-solid border-border bg-background p-1 shadow-float">
          {options.map((o, i) => {
            const selected = list.some(v => same(v, o.value))
            return (
              <li
                key={i}
                role="option"
                aria-selected={selected}
                aria-disabled={o.disabled || undefined}
                onClick={event => !o.disabled && toggle(event, o.value)}
                className={cn('flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-md px-3 py-1.5 text-body text-text hover:bg-surface-hover', o.disabled && 'pointer-events-none opacity-40')}
              >
                {o.children}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const Select = React.forwardRef(function Select(
  {
    value: valueProp,
    defaultValue,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    name,
    id: idProp,
    labelId,
    inputRef,
    inputProps,
    readOnly = false,
    disabled: disabledProp,
    error: errorProp,
    multiple = false,
    renderValue,
    displayEmpty,
    native,
    fullWidth,
    size,
    className,
    style,
    children,
    // MUI 外觀專用，忽略
    label,
    variant,
    sx,
    MenuProps,
    css: _css,
    ...rest
  },
  ref
) {
  const ctx = React.useContext(FormControlContext)
  const id = idProp || (ctx && ctx.id)
  const disabled = disabledProp !== undefined ? disabledProp : !!(ctx && ctx.disabled)
  const error = errorProp !== undefined ? errorProp : !!(ctx && ctx.error)
  const options = collectOptions(children)
  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : multiple ? [] : '')
  const value = valueProp !== undefined ? valueProp : inner

  if (multiple) {
    return (
      <MultipleSelect
        id={id}
        labelId={labelId}
        value={value}
        name={name}
        options={options}
        renderValue={renderValue}
        disabled={disabled}
        className={className}
        onChange={event => {
          if (valueProp === undefined) setInner(event.target.value)
          if (onChange) onChange(event)
        }}
      />
    )
  }

  const index = options.findIndex(o => same(o.value, value))
  const handleChange = event => {
    if (readOnly) return
    const picked = options[Number(event.target.value)]
    const next = picked ? picked.value : ''
    if (valueProp === undefined) setInner(next)
    if (!onChange) return
    const target = { value: next, name }
    // 以原事件為原型建立新事件：保留 preventDefault／persist 等方法，只替換 target（與 MUI 相同簽名 onChange(event, child)）
    onChange(Object.assign(Object.create(event), { target, currentTarget: target }), picked ? { props: picked.props } : undefined)
  }
  const small = size === 'small' || (ctx && ctx.size === 'small')
  // 比照 MUI：值為空（''／null／undefined）且未設 displayEmpty 時欄位顯示空白，即使有對應選項（如 <MenuItem value=''>None</MenuItem>）
  const showBlank = !displayEmpty && (value === '' || value === null || value === undefined)
  return (
    <div ref={ref} className={cn('relative w-full min-w-0', className)} style={style}>
      <select
        ref={node => {
          assignRef(inputRef, node)
          if (inputProps && inputProps.ref) assignRef(inputProps.ref, node)
        }}
        id={id}
        name={name}
        value={index === -1 ? '' : String(index)}
        onChange={handleChange}
        onKeyDown={event => {
          // readOnly：比照 MUI，不允許以鍵盤改值，但保留其他按鍵（Enter 跳欄）
          if (readOnly && event.key !== 'Enter' && event.key !== 'Tab') event.preventDefault()
          if (onKeyDown) onKeyDown(event)
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-readonly={readOnly || undefined}
        aria-invalid={error || undefined}
        className={cn(
          inputClass,
          'cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed',
          small && 'h-8',
          readOnly && 'pointer-events-none',
          (renderValue || showBlank) && 'text-transparent',
          index === -1 && 'text-text-tertiary',
          error && 'border-danger hover:border-danger'
        )}
        {...(inputProps ? Object.fromEntries(Object.entries(inputProps).filter(([k]) => k !== 'ref')) : {})}
        {...rest}
      >
        {index === -1 && <option value="" disabled hidden />}
        {options.map((o, i) => (
          <option key={i} value={String(i)} disabled={o.disabled}>
            {textOf(o.children)}
          </option>
        ))}
      </select>
      {renderValue && (
        <span className="pointer-events-none absolute inset-y-0 left-3 right-9 flex items-center text-body text-text">{renderValue(value)}</span>
      )}
      <ChevronDown aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
    </div>
  )
})

// 與 MUI useFormControl 相容：在 FormControl 內回傳 { focused, error, required, disabled }，否則 undefined
const useFormControl = () => React.useContext(FormControlContext) || undefined

export { FormControl, InputLabel, Select, MenuItem, FormHelperText, useFormControl }
