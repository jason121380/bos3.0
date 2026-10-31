import React from 'react'
import { cn } from './utils'

// STYLE.md §6：高 36px、rounded-md、1px 控制項邊框（border-strong）；focus 2px accent；錯誤時 border 變 danger
export const inputClass = cn(
  'h-9 max-sm:h-10 w-full rounded-md border border-solid border-border-strong bg-background px-3 text-body text-text',
  'placeholder:text-text-tertiary transition-colors hover:border-border-strong-hover',
  'outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
  'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-tertiary'
)

// Field 沒有 htmlFor 時：
// 1. 標籤自帶 id，裡面的輸入元件以 aria-labelledby 指回標籤（讀屏念得出欄位名稱；元件自己有 aria-label／aria-labelledby 時不覆蓋）。
// 2. 點標籤文字，游標跳到欄位（Jason 2026/10/31）：Field 內的輸入元件向 Field 登記自己的 id（沒有 id 才產生一個，
//    既有 id 一律不改），標籤指向最先登記、仍在畫面上的那一個。Input／Textarea／Switch 用原生 label htmlFor（Switch 點標籤切換一次，
//    與點開關本身相同）；NativeSelect／Combobox 只聚焦不展開（原生 label 會連帶「點一下」按鈕／輸入框而打開選單，與原生 select 點標籤只聚焦不同）。
const FieldLabelContext = React.createContext(null)
const useFieldLabelledBy = props => {
  const field = React.useContext(FieldLabelContext)
  if (!props || props['aria-label'] || props['aria-labelledby']) return undefined
  return (field && field.labelId) || undefined
}

// 遞增序號而非 Math.random：測試常把 Math.random 固定成同一值，會讓 id 重複
let fieldSeq = 0
const nextFieldKey = () => {
  fieldSeq += 1
  return fieldSeq.toString(36)
}

// 輸入元件登記為外層 Field 標籤的目標；回傳要放在元件上的 id（ownId 優先；不在有標籤的 Field 內時維持原本的 undefined）
const useFieldControl = (ownId, focusOnly = false) => {
  const field = React.useContext(FieldLabelContext)
  const token = React.useRef(null)
  if (!token.current) token.current = { autoId: null }
  if (field && !ownId && !token.current.autoId) token.current.autoId = `field-control-${nextFieldKey()}`
  const id = ownId || (field ? token.current.autoId : undefined)
  // 登記／更新（id 改變時原位更新，不改先後）與卸載時取消登記分開，避免 id 一變就被排到最後
  React.useLayoutEffect(() => {
    if (field) field.register(token.current, { id, focusOnly })
  }, [field, id, focusOnly])
  React.useLayoutEffect(() => {
    if (!field) return undefined
    const mine = token.current
    return () => field.unregister(mine)
  }, [field])
  return id
}

const Input = React.forwardRef(({ className, type = 'text', invalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid || undefined}
    aria-labelledby={useFieldLabelledBy(props)}
    className={cn('ui-root', inputClass, invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30', className)}
    {...props}
    id={useFieldControl(props.id)}
  />
))
Input.displayName = 'Input'

const Textarea = React.forwardRef(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    aria-labelledby={useFieldLabelledBy(props)}
    className={cn(
      'ui-root',
      inputClass,
      'h-auto min-h-[80px] py-2',
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30',
      className
    )}
    {...props}
    id={useFieldControl(props.id)}
  />
))
Textarea.displayName = 'Textarea'

const Label = ({ className, required, children, ...props }) => (
  <label className={cn('ui-root text-label text-text-secondary', className)} {...props}>
    {children}
    {required && <span className="ml-0.5 text-danger">*</span>}
  </label>
)

// 原生 label 在部分瀏覽器（Safari 的勾選框、jsdom）點擊不會移動焦點，一律再明確聚焦一次
const focusById = id => {
  const node = document.getElementById(id)
  if (node) node.focus()
}

// 表單欄位：標籤在上、輸入在中、說明或錯誤在下（STYLE.md §6 Form）
const Field = ({ label, htmlFor, required, hint, error, className, children }) => {
  const labelId = React.useRef(null)
  if (!labelId.current) labelId.current = `field-label-${nextFieldKey()}`
  const linked = !!label && !htmlFor
  // 已登記的輸入元件（依登記順序）；標籤指向第一個
  const controls = React.useRef([])
  const [target, setTarget] = React.useState(null)
  const field = React.useMemo(() => {
    if (!linked) return null
    const sync = () => {
      const first = controls.current[0]
      setTarget(prev => (prev && first && prev.id === first.id && prev.focusOnly === first.focusOnly ? prev : first || null))
    }
    return {
      labelId: labelId.current,
      register: (token, info) => {
        // 已登記的（id 改變）原位更新，不改先後順序
        const known = controls.current.some(c => c.token === token)
        controls.current = known ? controls.current.map(c => (c.token === token ? { token, ...info } : c)) : [...controls.current, { token, ...info }]
        sync()
      },
      unregister: token => {
        controls.current = controls.current.filter(c => c.token !== token)
        sync()
      },
    }
  }, [linked])
  const active = field && target
  return (
    <div className={cn('ui-root flex flex-col gap-1.5', className)}>
      {label && (
        <Label
          htmlFor={htmlFor || (active && !target.focusOnly ? target.id : undefined)}
          id={linked ? labelId.current : undefined}
          onClick={active ? () => focusById(target.id) : undefined}
          required={required}
        >
          {label}
        </Label>
      )}
      <FieldLabelContext.Provider value={field}>{children}</FieldLabelContext.Provider>
      {error ? (
        <p id={htmlFor ? `${htmlFor}-helper-text` : undefined} className="text-caption text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-caption text-text-tertiary">{hint}</p>
      )}
    </div>
  )
}

export { Input, Textarea, Label, Field, FieldLabelContext, useFieldLabelledBy, useFieldControl }
