import React from 'react'
import { IndexSelect } from './index-select'
import { cn } from './utils'

// 下拉（STYLE.md §6 Input / Select）。Jason 2026/10/24：不使用原生系統選單，標籤在欄位上方。
// 與 Radix Select（ui/select）的差別：
//   - 選項值可以是任何型別（空字串、數字、布林、null），以索引對應，onChange 拿回原始值
//   - onChange(event) 與 MUI Select 相容：event.target.value 為原始值、event.target.name 為 name
//   - 可放在 ui/dialog 內；選單是自家清單，不是系統選單
// 不支援 multiple（多選用 ui/combobox multiple）。
// 2026/10/30 第三波：全站單選下拉收斂到這裡（form-control Select 單選、Radix ui/select 退役），補上
//   defaultValue（未傳 value 時由元件自己記住選取，與 form-control Select 相同）、readOnly、renderValue、
//   displayEmpty、inputRef、inputProps、size="small"、labelId、labelRef（原本掛在 InputLabel 上的 ref 改掛在標籤）。
//   displayEmpty 預設 true＝維持本元件原本行為（有 value='' 的選項就顯示它的文字）；
//   displayEmpty={false}：值為空時不顯示 value='' 選項的文字——有 placeholder 就顯示佔位字，沒有就空白。
//   從 form-control 搬來的欄位傳 displayEmpty={false} placeholder="請選擇…"（Jason 2026/10/30 決定：未選的欄位顯示「請選擇…」，
//   原本的空值選項仍留在清單裡可選回空值）。

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
    options.push({ value: child.props.value, disabled: child.props.disabled, label: child.props.children, props: child.props })
  })
  return options
}

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
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
    {
      value: valueProp,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      name,
      id,
      label,
      labelRef,
      labelId,
      placeholder,
      error = false,
      disabled,
      required,
      readOnly = false,
      renderValue,
      displayEmpty = true,
      inputRef,
      inputProps,
      size,
      fullWidth = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const options = collectOptions(children)
    const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : '')
    const value = valueProp !== undefined ? valueProp : inner
    // 與 MUI Select 的比對規則一致：非物件值以字串比較（1 與 '1' 視為相同）
    const same = (a, b) => a === b || (a !== null && b !== null && typeof a !== 'object' && typeof b !== 'object' && String(a) === String(b))
    const index = options.findIndex(o => same(o.value, value))
    const autoId = React.useRef(`ns-${Math.random().toString(36).slice(2, 9)}`).current
    const selectId = id || autoId

    const handleChange = event => {
      // 防禦：唯讀時 IndexSelect 已在點選、鍵盤與原生 change 三條路徑先擋下，不會呼叫到這裡，測不到
      /* istanbul ignore if */
      if (readOnly) return
      const picked = options[Number(event.target.value)]
      const next = picked ? picked.value : ''
      if (valueProp === undefined) setInner(next)
      if (!onChange) return
      const target = { value: next, name }
      // 以原事件為原型建立新事件：保留 preventDefault / persist 等方法，只替換 target。
      // 第二參數與 form-control Select（MUI 簽名 onChange(event, child)）相同：{ props: 選項的 props }，客戶來源篩選讀 child.props.value
      onChange(Object.assign(Object.create(event), { target, currentTarget: target }), picked ? { props: picked.props } : undefined)
    }

    const empty = value === '' || value === null || value === undefined
    // displayEmpty={false}＋placeholder：值為空時一律顯示佔位字（即使清單裡有 value='' 的選項，它仍可選來清空）
    const showPlaceholder = !displayEmpty && empty && !!placeholder
    const shownIndex = showPlaceholder ? -1 : index
    const selected = shownIndex === -1 ? null : options[shownIndex]
    const blank = !displayEmpty && empty && !placeholder
    const { ref: inputPropsRef, ...inputRest } = inputProps || {}
    const display = renderValue ? renderValue(value) : selected ? textOf(selected.label) : placeholder || ''

    return (
      <div className={cn('ui-root flex min-w-0 flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex', className)}>
        {label && (
          <label ref={labelRef} id={labelId} htmlFor={selectId} className={cn('text-label', error ? 'text-danger' : 'text-text-secondary')}>
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <IndexSelect
          ref={ref}
          id={selectId}
          name={name}
          valueIndex={shownIndex}
          inputRef={node => {
            assignRef(inputRef, node)
            assignRef(inputPropsRef, node)
          }}
          options={options.map(o => ({ disabled: o.disabled, text: textOf(o.label) }))}
          // 隱藏 select 的「未選」項文字：從 form-control 搬來的欄位（displayEmpty={false}）維持空字串，與搬移前相同
          emptyLabel={displayEmpty ? placeholder || '' : ''}
          blank={blank}
          display={display}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          invalid={error}
          required={required}
          small={size === 'small'}
          labelledBy={labelId}
          buttonProps={{ ...inputRest, ...props }}
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect, NativeSelectOption }
