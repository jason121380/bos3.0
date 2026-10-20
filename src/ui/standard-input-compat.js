import React from 'react'
import { cn } from './utils'
import './standard-input-compat.css'

// MUI TextField variant="standard"（無標籤的底線輸入框）相容元件：只供薪資轉帳單列印範本（MerchantBankTransferReport/TransferDetail）
// 嵌在文字中填寫「本公司於 ＿ 年 ＿ 月」。輸出與 MUI 相同的 DOM 與 class（MuiFormControl-root／MuiInput-underline／MuiInput-input…），
// initialize.scss 的列印與版面規則（.MuiInput-input 置中、底線顏色）照常生效。其他頁面請用 ui/text-field。
const TextField = React.forwardRef(function TextField(
  { size = 'medium', disabled = false, error = false, value, defaultValue, onChange, onFocus, onBlur, inputProps, inputRef, id, name, placeholder, type = 'text', className, style, variant, ...rest },
  ref
) {
  const [focused, setFocused] = React.useState(false)
  const small = size === 'small'
  return (
    <div ref={ref} className={cn('MuiFormControl-root MuiTextField-root', className)} style={style} {...rest}>
      <div
        className={cn(
          'MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-colorPrimary MuiInputBase-formControl',
          small && 'MuiInputBase-sizeSmall',
          focused && 'Mui-focused',
          disabled && 'Mui-disabled',
          error && 'Mui-error'
        )}
      >
        <input
          aria-invalid={error}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          ref={inputRef}
          {...inputProps}
          className={cn('MuiInputBase-input MuiInput-input', disabled && 'Mui-disabled', small && 'MuiInputBase-inputSizeSmall', inputProps && inputProps.className)}
          onFocus={event => {
            setFocused(true)
            if (onFocus) onFocus(event)
          }}
          onBlur={event => {
            setFocused(false)
            if (onBlur) onBlur(event)
          }}
        />
      </div>
    </div>
  )
})

export { TextField }
export default TextField
