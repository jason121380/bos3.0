import React from 'react'
import ReactDOM from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { inputClass } from './input'
import { cn } from './utils'
import { CompatLayer } from './compat-layer'
import { useLayerRef } from './layer-stack'

// 自家下拉（Jason 2026/10/24：不要原生系統選單）。
// 畫面是按鈕＋清單；onChange 仍與舊原生 select 相同：event.target.value 為選項索引字串。
// 同層留一顆 role=presentation 的 select：不進定位順序、點不到、不會叫出系統選單，
// 只為了既有測試依 name 找到它、讀 .options，以及 fireEvent.change 仍走索引。
// 鍵盤：方向鍵移動作用中的選項（略過停用），Enter／空白鍵選取；清單用 portal 掛到對話框或 body，
// 避免被 DialogBody 的 overflow 裁掉。

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

// 與 combobox 相同：在對話框內就掛在對話框上（配合焦點鎖，且脫離 DialogBody 的 overflow），否則掛在 body。
const findPortalHost = node => (node && node.closest('[role="dialog"]')) || document.body

// 清單固定在視窗內：空間不夠就改向上開，高度夾在視窗剩餘空間裡，由清單自己捲動。
// hostRect 有值時座標改相對該宿主（對話框）；沒有時用 fixed 對齊視窗，避免跟著文件捲出畫面。
export function placeAnchoredMenu(anchorRect, { viewport, hostRect = null, scrollTop = 0, scrollLeft = 0, gap = 4, margin = 8, maxMenu = 320 } = {}) {
  const viewBottom = viewport.height - margin
  const viewRight = viewport.width - margin
  const spaceBelow = Math.max(0, viewBottom - anchorRect.bottom - gap)
  const spaceAbove = Math.max(0, anchorRect.top - margin - gap)
  const openBelow = spaceBelow >= spaceAbove
  const maxHeight = Math.min(maxMenu, openBelow ? spaceBelow : spaceAbove)
  let left = anchorRect.left
  if (left + anchorRect.width > viewRight) left = Math.max(margin, viewRight - anchorRect.width)
  const topViewport = openBelow ? anchorRect.bottom + gap : Math.max(margin, anchorRect.top - gap - maxHeight)
  const width = anchorRect.width
  if (!hostRect) return { position: 'fixed', top: topViewport, left, width, maxHeight }
  return {
    position: 'absolute',
    top: topViewport - hostRect.top + scrollTop,
    left: left - hostRect.left + scrollLeft,
    width,
    maxHeight,
  }
}

function useAnchoredMenu(anchorRef, open) {
  const [style, setStyle] = React.useState(null)
  const [host, setHost] = React.useState(null)
  React.useLayoutEffect(() => {
    if (!open) return undefined
    const anchor = anchorRef.current
    if (!anchor || typeof document === 'undefined') return undefined
    const target = findPortalHost(anchor)
    setHost(target)
    const update = () => {
      const rect = anchor.getBoundingClientRect()
      const viewport = { width: window.innerWidth, height: window.innerHeight }
      if (target === document.body) {
        setStyle(placeAnchoredMenu(rect, { viewport }))
      } else {
        setStyle(
          placeAnchoredMenu(rect, {
            viewport,
            hostRect: target.getBoundingClientRect(),
            scrollTop: target.scrollTop,
            scrollLeft: target.scrollLeft,
          })
        )
      }
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef])
  return { style, host }
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
  const [active, setActive] = React.useState(-1)
  const rootRef = React.useRef(null)
  const buttonRef = React.useRef(null)
  const selectRef = React.useRef(null)
  const menuRef = React.useRef(null)
  // 觸控點在可捲動清單上時，Safari 常常第一次只套上 hover／作用中樣式、不送 click。
  // 選取改在 pointerup 完成；緊接著的相容 click 用這個記號吞掉，避免選兩次。
  const touchPressRef = React.useRef(null)
  const suppressClickRef = React.useRef(null)
  const suppressTimerRef = React.useRef(null)
  const swallowClickRef = React.useRef(null)
  const autoId = React.useRef(`idxsel-${Math.random().toString(36).slice(2, 8)}`).current
  const index = valueIndex < 0 ? -1 : valueIndex
  const listId = id ? `${id}-list` : `${autoId}-list`
  const optionDomId = i => `${listId}-option-${i}`

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
  React.useEffect(
    () => () => {
      clearTimeout(suppressTimerRef.current)
      if (swallowClickRef.current) window.removeEventListener('click', swallowClickRef.current, true)
    },
    []
  )

  const escape = event => {
    event.preventDefault()
    setOpen(false)
    if (buttonRef.current) buttonRef.current.focus()
  }
  const { ref: layerRef, zIndex } = useLayerRef(null, open, escape)
  const setMenu = node => {
    menuRef.current = node
    layerRef(node)
  }
  const { style: menuStyle, host } = useAnchoredMenu(rootRef, open)

  React.useEffect(() => {
    if (!open) return undefined
    let pendingClose
    const close = event => {
      const target = event.target
      if (rootRef.current && rootRef.current.contains(target)) return
      if (menuRef.current && menuRef.current.contains(target)) return
      const dialog = rootRef.current && rootRef.current.closest('[role="dialog"]')
      if (dialog && dialog.contains(target)) pendingClose = setTimeout(() => setOpen(false), 0)
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

  const isEnabled = i => i >= 0 && i < options.length && !options[i].disabled
  const moveEnabled = (from, delta) => {
    const count = options.length
    if (!count || !delta) return isEnabled(from) ? from : -1
    let cursor = from
    for (let n = 0; n < count; n += 1) {
      cursor += delta
      if (cursor < 0 || cursor >= count) break
      if (!options[cursor].disabled) return cursor
    }
    return isEnabled(from) ? from : -1
  }
  const firstEnabled = () => moveEnabled(-1, 1)
  const lastEnabled = () => {
    for (let i = options.length - 1; i >= 0; i -= 1) {
      if (!options[i].disabled) return i
    }
    return -1
  }
  const edgeEnabled = delta => (delta < 0 ? lastEnabled() : firstEnabled())

  const closeAndFocus = () => {
    setOpen(false)
    if (buttonRef.current) buttonRef.current.focus()
  }
  const activate = (next, event) => {
    if (!isEnabled(next)) return
    emit(next, event)
    closeAndFocus()
  }
  const armSuppressClick = key => {
    suppressClickRef.current = key
    if (swallowClickRef.current) window.removeEventListener('click', swallowClickRef.current, true)
    clearTimeout(suppressTimerRef.current)
    // 清單在 pointerup 後可能先卸載，相容 click 會落在下方元件。在 window 捕獲階段吞掉下一擊。
    const swallow = event => {
      event.preventDefault()
      event.stopPropagation()
      window.removeEventListener('click', swallow, true)
      if (swallowClickRef.current === swallow) swallowClickRef.current = null
    }
    swallowClickRef.current = swallow
    window.addEventListener('click', swallow, true)
    suppressTimerRef.current = setTimeout(() => {
      window.removeEventListener('click', swallow, true)
      if (swallowClickRef.current === swallow) swallowClickRef.current = null
      if (suppressClickRef.current === key) suppressClickRef.current = null
    }, 500)
  }

  const onMenuKey = event => {
    if (readOnly || disabled) return
    const key = event.key
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const delta = key === 'ArrowDown' ? 1 : -1
      if (!open) {
        const current = isEnabled(index) ? index : edgeEnabled(delta)
        setActive(current)
        setOpen(true)
        return
      }
      // 已打開才擋下預設行為。關閉時不 preventDefault，既有 readOnly 測試才對得起來。
      event.preventDefault()
      setActive(current => {
        const origin = current >= 0 ? current : index
        if (origin < 0) return edgeEnabled(delta)
        return moveEnabled(origin, delta)
      })
      return
    }
    if (!open || (key !== 'Enter' && key !== ' ')) return
    event.preventDefault()
    if (isEnabled(active)) activate(active, event)
  }

  const handleChange = event => changeRef.current(event)

  const shown = blank ? '' : display
  const extra = buttonProps || {}
  const { className: extraClass, ...extraRest } = extra

  React.useLayoutEffect(() => {
    if (!open || active < 0 || !host) return
    const node = document.getElementById(`${listId}-option-${active}`)
    if (node && typeof node.scrollIntoView === 'function') node.scrollIntoView({ block: 'nearest' })
  }, [open, active, host, listId])

  const menu = (
    <ul
      ref={setMenu}
      id={listId}
      role="listbox"
      style={{ ...(menuStyle || {}), zIndex }}
      className="ui-root z-[1500] m-0 max-h-80 list-none overflow-y-auto rounded-lg border border-solid border-border bg-background p-1 shadow-float"
    >
      {options.map((option, i) => (
        <li
          key={i}
          id={optionDomId(i)}
          role="option"
          tabIndex={-1}
          aria-selected={i === index}
          aria-disabled={option.disabled || undefined}
          data-active={i === active ? 'true' : undefined}
          onMouseDown={event => {
            // 不要把焦點移進選項，否則按鈕失焦、清單先關，click 來不及選取。
            event.preventDefault()
          }}
          onPointerDown={event => {
            if (option.disabled || event.pointerType === 'mouse') return
            touchPressRef.current = { index: i, x: event.clientX, y: event.clientY }
          }}
          onPointerUp={event => {
            const press = touchPressRef.current
            touchPressRef.current = null
            if (event.pointerType === 'mouse' || !press || press.index !== i || option.disabled) return
            const moved = Math.abs(event.clientX - press.x) > 10 || Math.abs(event.clientY - press.y) > 10
            armSuppressClick(i)
            if (!moved) activate(i, event)
          }}
          onPointerCancel={() => {
            touchPressRef.current = null
          }}
          onMouseMove={() => {
            if (!option.disabled && active !== i) setActive(i)
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              if (!option.disabled) activate(i, event)
              return
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') onMenuKey(event)
            if (event.key === 'Escape' && open) escape(event)
          }}
          onClick={event => {
            if (suppressClickRef.current === i) {
              suppressClickRef.current = null
              clearTimeout(suppressTimerRef.current)
              return
            }
            if (option.disabled) return
            activate(i, event)
          }}
          className={cn(
            'flex min-h-9 max-sm:min-h-10 cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-body text-text hover:bg-surface-hover',
            (i === index || i === active) && 'bg-surface-hover',
            i === active && 'outline outline-1 -outline-offset-1 outline-accent',
            option.disabled && 'pointer-events-none text-text-tertiary'
          )}
        >
          {option.text}
        </li>
      ))}
    </ul>
  )

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
        aria-activedescendant={open && active >= 0 ? optionDomId(active) : undefined}
        aria-labelledby={labelledBy}
        aria-readonly={readOnly || undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        value={index === -1 ? '' : String(index)}
        onClick={() => {
          if (disabled || readOnly) return
          if (open) {
            setOpen(false)
            return
          }
          setActive(isEnabled(index) ? index : firstEnabled())
          setOpen(true)
        }}
        onKeyDown={event => {
          if (readOnly && event.key !== 'Enter' && event.key !== 'Tab') event.preventDefault()
          if (!readOnly && !disabled) onMenuKey(event)
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
        <span className={cn('min-w-0 flex-1 truncate text-left', shown !== '' && 'text-text')}>{shown}</span>
        <ChevronDown aria-hidden="true" strokeWidth={1.75} className="h-4 w-4 shrink-0 text-text-tertiary" />
      </button>
      {open && host && menuStyle ? ReactDOM.createPortal(menu, host) : null}
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
