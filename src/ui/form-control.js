import React from 'react'
import { cn } from './utils'

// 自家表單欄位外框（取代 MUI FormControl／InputLabel／FormHelperText，Jason 2026/10/20 拍版「MUI 整包移除」）。
// - FormControl：版面容器，把 error／required／disabled／size／focused 傳給子元件（useFormControl 可讀）
// - InputLabel 一律成為欄位上方標籤（STYLE §6）；FormHelperText 跟隨 FormControl 的 error
// 下拉不在這裡：單選用 ui/native-select、搜尋與多選用 ui/combobox
// （原本的 Select／MultipleSelect／MenuItem 已無頁面使用，Jason 2026/10/30 核准移除）。

const FormControlContext = React.createContext(null)
let seed = 0
const useStableId = () => {
  const ref = React.useRef(null)
  if (ref.current === null) ref.current = `fc-${(seed += 1)}`
  return ref.current
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

const FormHelperText = ({ children, className, error, ...rest }) => {
  const ctx = React.useContext(FormControlContext)
  const isError = error !== undefined ? error : ctx && ctx.error
  return (
    <p className={cn('m-0 text-caption', isError ? 'text-danger' : 'text-text-tertiary', className)} {...rest}>
      {children}
    </p>
  )
}

// 與 MUI useFormControl 相容：在 FormControl 內回傳 { focused, error, required, disabled }，否則 undefined
const useFormControl = () => React.useContext(FormControlContext) || undefined

export { FormControl, InputLabel, FormHelperText, useFormControl }
