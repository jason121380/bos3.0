import React from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClass } from './input'
import { cn } from './utils'

// 原生 <select> 外觀的下拉（STYLE.md §6 Input / Select）
// 與 Radix Select（ui/select）的差別：
//   - 選項值可以是任何型別（空字串、數字、布林、null），以索引對應，onChange 拿回原始值
//   - onChange(event) 與 MUI Select 相容：event.target.value 為原始值、event.target.name 為 name
//   - 可放在 ui/dialog 內；沒有 portal，系統選單由瀏覽器管理，自帶 ui-root 基礎樣式
//   - 手機上叫出系統原生選單
// label：顯示在外框上緣，可和 ui/text-field 並排
// 不支援 multiple、renderValue；那些情況使用 ui/form-control Select。

const NativeSelectOption = () => null
NativeSelectOption.displayName = 'NativeSelectOption'

function collectOptions(children) {
  const options = []
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return
    if (child.type === React.Fragment) {
      options.push(...collectOptions(child.props.children))
      return
    }
    options.push({ value: child.props.value, disabled: child.props.disabled, label: child.props.children })
  })
  return options
}

const textOf = node => {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement(node)) return textOf(node.props.children)
  return ''
}

const NativeSelect = React.forwardRef(
  (
    { value, onChange, onBlur, name, id, label, placeholder, error = false, disabled, required, fullWidth = true, className, children, ...props },
    ref
  ) => {
    const options = collectOptions(children)
    // 與 MUI Select 的比對規則一致：非物件值以字串比較（1 與 '1' 視為相同）
    const same = (a, b) => a === b || (a !== null && b !== null && typeof a !== 'object' && typeof b !== 'object' && String(a) === String(b))
    const index = options.findIndex(o => same(o.value, value))
    const autoId = React.useRef(`ns-${Math.random().toString(36).slice(2, 9)}`).current
    const selectId = id || autoId

    const handleChange = e => {
      if (!onChange) return
      const picked = options[Number(e.target.value)]
      const target = { value: picked ? picked.value : '', name }
      // 以原事件為原型建立新事件：保留 preventDefault / persist 等方法，只替換 target
      onChange(Object.assign(Object.create(e), { target, currentTarget: target }))
    }

    return (
      <div className={cn('ui-root relative', fullWidth ? 'w-full' : 'inline-flex', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'pointer-events-none absolute -top-2 left-2 z-[1] max-w-[calc(100%-24px)] truncate bg-background px-1 text-caption',
              error ? 'text-danger' : 'text-text-secondary'
            )}
          >
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={index === -1 ? '' : String(index)}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-invalid={error || undefined}
          className={cn(
            inputClass,
            'cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed',
            index === -1 && 'text-text-tertiary',
            error && 'border-danger hover:border-danger'
          )}
          {...props}
        >
          {index === -1 && (
            <option value="" disabled hidden>
              {placeholder || ''}
            </option>
          )}
          {options.map((o, i) => (
            <option key={i} value={String(i)} disabled={o.disabled}>
              {textOf(o.label)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.75}
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect, NativeSelectOption }
