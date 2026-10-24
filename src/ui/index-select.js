import React from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClass } from './input'
import { cn } from './utils'
import { CompatLayer } from './compat-layer'
import { useLayerRef } from './layer-stack'

// 自家下拉（Jason 2026/10/24：不要原生系統選單）。
// 畫面是按鈕＋清單；onChange 仍與舊原生 select 相同：event.target.value 為選項索引字串。
// 同層留一顆 role=presentation 的 select：不進定位順序、點不到、不會叫出系統選單，
// 只為了既有測試依 name 找到它、讀 .options，以及 fireEvent.change 仍走索引。

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

const mirrorSelect = (button, select) => {
  if (!button || !select) return
  const define = (key, get) => {
    try {
      Object.defineProperty(button, key, { configurable: true, get })
    } catch (e) {
      // 瀏覽器若已把該屬性鎖成不可設定，維持原狀
    }
  }
  define('options', () => select.options)
  define('selectedOptions', () => select.selectedOptions)
  define('selectedIndex', () => select.selectedIndex)
  // 標籤連到按鈕後，既有測試仍對按鈕做 querySelector('option')
  const query = (method, selector) => {
    if (typeof selector === 'string' && (selector === 'option' || selector.startsWith('option'))) {
      return select[method](selector)
    }
    return HTMLElement.prototype[method].call(button, selector)
  }
  try {
    Object.defineProperty(button, 'querySelectorAll', { configurable: true, value: selector => query('querySelectorAll', selector) })
    Object.defineProperty(button, 'querySelector', { configurable: true, value: selector => query('querySelector', selector) })
  } catch (e) {
    // 維持原生查詢
  }
}

const IndexSelect = React.forwardRef(function IndexSelect(
  {
    id,
    name,
    valueIndex,
    options,
    emptyLabel = '',
    blank = false,
    display,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    disabled = false,
    readOnly = false,
    invalid = false,
    required = false,
    small = false,
    labelledBy,
    className,
    buttonProps,
    inputRef,
  },
  ref
) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  const buttonRef = React.useRef(null)
  const selectRef = React.useRef(null)
  const index = valueIndex < 0 ? -1 : valueIndex
  const listId = id ? `${id}-list` : undefined

  const setButton = node => {
    buttonRef.current = node
    assignRef(ref, node)
    assignRef(inputRef, node)
    mirrorSelect(node, selectRef.current)
  }
  const setSelect = node => {
    selectRef.current = node
    mirrorSelect(buttonRef.current, node)
  }

  React.useLayoutEffect(() => {
    mirrorSelect(buttonRef.current, selectRef.current)
  })

  // React 的 onChange 只發給 input／textarea／select，按鈕收不到。
  // 既有測試與頁面用 fireEvent.change 打在標籤所連的按鈕上，所以改聽原生 change。
  const changeRef = React.useRef(() => {})
  changeRef.current = event => {
    if (readOnly || !onChange) return
    // 原生 Event 的 target 是檢查 this 的 getter，Object.create(event) 會讀不到。
    // 改成一般物件，讓上游照舊用 Object.create 包一層並換成 { value, name }。
    if (typeof event.persist === 'function') {
      onChange(event)
      return
    }
    const read = node => ({ value: node ? node.value : '', name: node ? node.name : undefined })
    onChange({
      target: read(event.target),
      currentTarget: read(event.currentTarget),
      preventDefault() {
        event.preventDefault()
      },
      stopPropagation() {
        event.stopPropagation()
      },
      persist() {},
      get defaultPrevented() {
        return event.defaultPrevented
      },
    })
  }
  React.useEffect(() => {
    const button = buttonRef.current
    if (!button) return undefined
    const onDomChange = event => changeRef.current(event)
    button.addEventListener('change', onDomChange)
    return () => button.removeEventListener('change', onDomChange)
  }, [])

  const escape = event => {
    event.preventDefault()
    setOpen(false)
    if (buttonRef.current) buttonRef.current.focus()
  }
  const { ref: listRef, zIndex } = useLayerRef(null, open, escape)

  React.useEffect(() => {
    if (!open) return undefined
    let pendingClose
    const close = event => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return
      const dialog = rootRef.current.closest('[role="dialog"]')
      if (dialog && dialog.contains(event.target)) pendingClose = setTimeout(() => setOpen(false), 0)
      else setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      clearTimeout(pendingClose)
    }
  }, [open])

  const emit = (nextIndex, event) => {
    if (!onChange || readOnly || disabled) return
    const target = { value: String(nextIndex), name }
    onChange(Object.assign(Object.create(event), { target, currentTarget: target }))
  }

  const handleChange = event => changeRef.current(event)

  const shown = blank ? '' : display
  const extra = buttonProps || {}
  const { className: extraClass, ...extraRest } = extra

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <CompatLayer open={open} onEscapeKeyDown={escape} />
      <button
        {...extraRest}
        ref={setButton}
        type="button"
        id={id}
        role="combobox"
        data-ui-select=""
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelledBy}
        aria-readonly={readOnly || undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        value={index === -1 ? '' : String(index)}
        onClick={() => {
          if (disabled || readOnly) return
          setOpen(o => !o)
        }}
        onKeyDown={event => {
          if (readOnly && event.key !== 'Enter' && event.key !== 'Tab') event.preventDefault()
          if (!readOnly && !disabled && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) setOpen(true)
          if (event.key === 'Escape' && open) escape(event)
          if (onKeyDown) onKeyDown(event)
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          inputClass,
          'flex cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed',
          small && 'h-8',
          readOnly && 'pointer-events-none',
          blank && 'text-transparent',
          index === -1 && !blank && 'text-text-tertiary',
          invalid && 'border-danger hover:border-danger',
          extraClass,
          className
        )}
      >
        <span className="min-w-0 truncate">{shown}</span>
        <ChevronDown aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0 text-text-tertiary" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{ zIndex }}
          className="absolute left-0 right-0 top-full z-[1500] m-0 mt-1 max-h-80 list-none overflow-y-auto rounded-lg border border-solid border-border bg-background p-1 shadow-float"
        >
          {options.map((option, i) => (
            <li
              key={i}
              role="option"
              aria-selected={i === index}
              aria-disabled={option.disabled || undefined}
              onMouseDown={event => event.preventDefault()}
              onClick={event => {
                if (option.disabled) return
                emit(i, event)
                setOpen(false)
                if (buttonRef.current) buttonRef.current.focus()
              }}
              className={cn(
                'flex min-h-9 cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-body text-text hover:bg-surface-hover',
                i === index && 'bg-surface-hover',
                option.disabled && 'pointer-events-none text-text-tertiary'
              )}
            >
              {option.text}
            </li>
          ))}
        </ul>
      )}
      {/* 不顯示、點不到、不進定位順序。role=presentation 避免再被當成系統下拉；
          不用 hidden／display:none，既有測試才能在這顆 select 裡讀到選項文字。 */}
      <select
        ref={setSelect}
        role="presentation"
        tabIndex={-1}
        name={name}
        disabled={disabled}
        required={required}
        value={index === -1 ? '' : String(index)}
        onChange={handleChange}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      >
        {index === -1 && (
          <option value="" disabled hidden>
            {emptyLabel}
          </option>
        )}
        {options.map((option, i) => (
          <option key={i} value={String(i)} disabled={option.disabled}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  )
})

export { IndexSelect }
