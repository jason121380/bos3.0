import React from 'react'
import { IndexSelect } from './index-select'
import { cn } from './utils'

// 下拉（STYLE.md §6 Input / Select）。Jason 2026/10/24：不使用原生系統選單，標籤在欄位上方。
// 與 Radix Select（ui/select）的差別：
//   - 選項值可以是任何型別（空字串、數字、布林、null），以索引對應，onChange 拿回原始值
//   - onChange(event) 與 MUI Select 相容：event.target.value 為原始值、event.target.name 為 name
//   - 可放在 ui/dialog 內；選單是自家清單，不是系統選單
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
    { value, onChange, onBlur, onFocus, onKeyDown, name, id, label, placeholder, error = false, disabled, required, fullWidth = true, className, children, ...props },
    ref
  ) => {
    const options = collectOptions(children)
    // 與 MUI Select 的比對規則一致：非物件值以字串比較（1 與 '1' 視為相同）
    const same = (a, b) => a === b || (a !== null && b !== null && typeof a !== 'object' && typeof b !== 'object' && String(a) === String(b))
    const index = options.findIndex(o => same(o.value, value))
    const autoId = React.useRef(`ns-${Math.random().toString(36).slice(2, 9)}`).current
    const selectId = id || autoId

    const handleChange = event => {
      if (!onChange) return
      const picked = options[Number(event.target.value)]
      const target = { value: picked ? picked.value : '', name }
      // 以原事件為原型建立新事件：保留 preventDefault / persist 等方法，只替換 target
      onChange(Object.assign(Object.create(event), { target, currentTarget: target }))
    }

    const selected = index === -1 ? null : options[index]

    return (
      <div className={cn('ui-root flex min-w-0 flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex', className)}>
        {label && (
          <label htmlFor={selectId} className={cn('text-label', error ? 'text-danger' : 'text-text-secondary')}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <IndexSelect
          ref={ref}
          id={selectId}
          name={name}
          valueIndex={index}
          options={options.map(o => ({ disabled: o.disabled, text: textOf(o.label) }))}
          emptyLabel={placeholder || ''}
          display={selected ? textOf(selected.label) : placeholder || ''}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
          invalid={error}
          required={required}
          buttonProps={props}
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect, NativeSelectOption }
