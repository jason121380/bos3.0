import React from 'react'
import ReactDOM from 'react-dom'
import { useFloating, autoUpdate, flip, shift, offset, arrow as arrowMiddleware } from '@floating-ui/react-dom'
import { cn } from './utils'
import { Modal } from './modal-compat'
import './accordion-compat.css'
import './modal-compat.css'
import './misc-compat.css'

// 舊頁面的零星元件（取代 MUI IconButton／Chip／Collapse／Hidden／Tooltip／Rating／Menu／MenuItem，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面與 MUI 相容（頁面只換 import），輸出 MUI 同名 class，樣式由 misc-compat.css 重現。新畫面請用 ui 元件。

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

const IconButton = React.forwardRef(function IconButton({ size = 'medium', color = 'default', edge, disableRipple, disableFocusRipple, className, type = 'button', ...rest }, ref) {
  return <button ref={ref} type={type} className={cn('MuiButtonBase-root MuiIconButton-root', color !== 'default' && `MuiIconButton-color${capitalize(color)}`, `MuiIconButton-size${capitalize(size)}`, className)} {...rest} />
})

const CANCEL_ICON = 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'

// 同 MUI：可刪除的 Chip 本身是可聚焦的按鈕，Backspace／Delete 觸發 onDelete；刪除圖示只是滑鼠點擊目標
const Chip = React.forwardRef(function Chip({ label, onDelete, onKeyUp, className, size, variant, color, ...rest }, ref) {
  return (
    <div
      ref={ref}
      role={onDelete ? 'button' : undefined}
      tabIndex={onDelete ? 0 : undefined}
      className={cn(
        onDelete && 'MuiButtonBase-root relative',
        'MuiChip-root MuiChip-filled MuiChip-sizeMedium MuiChip-colorDefault MuiChip-filledDefault',
        onDelete && 'MuiChip-deletable MuiChip-deletableColorDefault',
        className
      )}
      onKeyUp={event => {
        if (onKeyUp) onKeyUp(event)
        if (onDelete && event.target === event.currentTarget && (event.key === 'Backspace' || event.key === 'Delete')) onDelete(event)
      }}
      {...rest}
    >
      <span className="MuiChip-label MuiChip-labelMedium">{label}</span>
      {onDelete && (
        <svg className="MuiChip-deleteIcon" focusable="false" aria-hidden="true" viewBox="0 0 24 24" onClick={onDelete}>
          <path d={CANCEL_ICON} />
        </svg>
      )}
    </div>
  )
})

// 收合時高度 0 且不可見、內容保持掛載（同 MUI Collapse 結束狀態）；不做高度動畫
const Collapse = React.forwardRef(function Collapse({ in: inProp = false, className, children, timeout, unmountOnExit, ...rest }, ref) {
  if (unmountOnExit && !inProp) return null
  return (
    <div ref={ref} className={cn('MuiCollapse-root MuiCollapse-vertical', inProp ? 'MuiCollapse-entered' : 'MuiCollapse-hidden', className)} {...rest}>
      <div className="MuiCollapse-wrapper MuiCollapse-vertical">
        <div className="MuiCollapse-wrapperInner MuiCollapse-vertical">{children}</div>
      </div>
    </div>
  )
})

// 斷點同 MUI：sm 600、md 900、lg 1200、xl 1536
const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
// 同 MUI：可直接傳 theme.breakpoints.down('sm') 產生的 '@media (…)' 字串；預設（noSsr false）第一次渲染回傳 defaultMatches（false），
// 掛載後才換成實際結果——預約行事曆等 hook 依此先以桌機視圖初始化再切換，時序與 MUI 相同
const useMediaQuery = (rawQuery, { noSsr = false, defaultMatches = false } = {}) => {
  const query = rawQuery.replace(/^@media( ?)/m, '')
  const get = () => (noSsr && typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : defaultMatches)
  const [matches, setMatches] = React.useState(get)
  React.useEffect(() => {
    if (!window.matchMedia) return undefined
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange)
    return () => (mql.removeEventListener ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange))
  }, [query])
  return matches
}

// 同 MUI Hidden（js 實作）：符合條件時不渲染 children；xxDown 為「小於該斷點」、xxUp 為「大於等於該斷點」
function Hidden({ children, xsDown, smDown, mdDown, lgDown, xlDown, xsUp, smUp, mdUp, lgUp, xlUp, only }) {
  const downKey = (smDown && 'sm') || (mdDown && 'md') || (lgDown && 'lg') || (xlDown && 'xl') || (xsDown && 'xs')
  const upKey = (xsUp && 'xs') || (smUp && 'sm') || (mdUp && 'md') || (lgUp && 'lg') || (xlUp && 'xl')
  const down = useMediaQuery(downKey ? `(max-width: ${BREAKPOINTS[downKey] - 0.05}px)` : '(max-width: -1px)', { noSsr: true })
  const up = useMediaQuery(upKey ? `(min-width: ${BREAKPOINTS[upKey]}px)` : '(max-width: -1px)', { noSsr: true })
  if ((downKey && down) || (upKey && up) || only) return null
  return children
}

// Tooltip：滑入／聚焦 100ms 後顯示，掛 body、floating-ui 定位，arrow 時加箭頭；title 為空不顯示
let tooltipSeed = 0
function Tooltip({ title, children, placement = 'bottom', arrow = false, enterDelay = 100, leaveDelay = 0, open: openProp, PopperProps, componentsProps, describeChild }) {
  const [openState, setOpenState] = React.useState(false)
  const open = openProp !== undefined ? openProp : openState
  const arrowRef = React.useRef(null)
  const idRef = React.useRef(null)
  if (idRef.current === null) idRef.current = `tooltip-${(tooltipSeed += 1)}`
  const timer = React.useRef(null)
  const { refs, floatingStyles, placement: finalPlacement, middlewareData } = useFloating({
    placement,
    open,
    whileElementsMounted: autoUpdate,
    middleware: [offset(0), flip(), shift({ padding: 4 }), ...(arrow ? [arrowMiddleware({ element: arrowRef })] : [])],
  })
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const show = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenState(true), enterDelay)
  }
  const hide = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpenState(false), leaveDelay)
  }
  const child = React.Children.only(children)
  const empty = title === '' || title === null || title === undefined
  const trigger = React.cloneElement(child, {
    ref: el => {
      refs.setReference(el)
      assignRef(child.ref, el)
    },
    'aria-describedby': open && !empty && typeof title !== 'string' ? idRef.current : child.props['aria-describedby'],
    'aria-label': typeof title === 'string' && !child.props['aria-label'] && !describeChild ? title : child.props['aria-label'],
    onMouseEnter: event => {
      if (child.props.onMouseEnter) child.props.onMouseEnter(event)
      show()
    },
    onMouseLeave: event => {
      if (child.props.onMouseLeave) child.props.onMouseLeave(event)
      hide()
    },
    onFocus: event => {
      if (child.props.onFocus) child.props.onFocus(event)
      show()
    },
    onBlur: event => {
      if (child.props.onBlur) child.props.onBlur(event)
      hide()
    },
  })
  const arrowData = middlewareData.arrow || {}
  return (
    <>
      {trigger}
      {open && !empty &&
        ReactDOM.createPortal(
          <div ref={refs.setFloating} role="tooltip" id={idRef.current} className="MuiTooltip-popper" data-placement={finalPlacement} style={floatingStyles}>
            <div className={cn('MuiTooltip-tooltip', arrow && 'MuiTooltip-tooltipArrow', `MuiTooltip-tooltipPlacement${capitalize(finalPlacement.split('-')[0])}`)}>
              {title}
              {arrow && <span ref={arrowRef} className="MuiTooltip-arrow" style={{ left: arrowData.x != null ? arrowData.x : undefined, top: arrowData.y != null ? arrowData.y : undefined }} />}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

// Rating：原生 radio（可鍵盤操作、可報讀），滑過預覽；再點一次目前的星等以 null 呼叫 onChange（同 MUI）
// 圖示沿用 MUI 原本的 Star／StarBorder（空星是外框星）
const STAR = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
const STAR_BORDER = 'M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z'
const Rating = React.forwardRef(function Rating({ name, value: valueProp, defaultValue = null, max = 5, onChange, readOnly = false, disabled = false, size = 'medium', precision, className, ...rest }, ref) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : inner
  const [hover, setHover] = React.useState(-1)
  const shown = hover !== -1 ? hover : value
  const pick = (event, next) => {
    if (readOnly || disabled) return
    const newValue = next === value ? null : next
    if (valueProp === undefined) setInner(newValue)
    if (onChange) onChange(event, newValue)
  }
  return (
    <span ref={ref} role="radiogroup" className={cn('MuiRating-root', `MuiRating-size${capitalize(size)}`, readOnly && 'MuiRating-readOnly', disabled && 'Mui-disabled', className)} onMouseLeave={() => setHover(-1)} {...rest}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <label key={n} className="MuiRating-label" onMouseEnter={() => !readOnly && !disabled && setHover(n)}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${n} Star${n > 1 ? 's' : ''}`}
            onChange={event => pick(event, n)}
            onClick={event => {
              // 原生 radio 再點已選取的項目不會觸發 change：在 click 補上「取消選取」
              if (value === n) pick(event, n)
            }}
          />
          <span className={cn('MuiRating-icon', n <= (shown || 0) ? 'MuiRating-iconFilled' : 'MuiRating-iconEmpty', hover === n && 'MuiRating-iconHover')}>
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
              <path d={n <= (shown || 0) ? STAR : STAR_BORDER} />
            </svg>
          </span>
        </label>
      ))}
    </span>
  )
})

// Menu：Popover 式選單（隱形背景、點外面或 Esc 關閉），依 anchorOrigin 對齊錨點；MenuItem 為 role=menuitem
const Menu = React.forwardRef(function Menu({ open, onClose, anchorEl, anchorOrigin = { vertical: 'top', horizontal: 'left' }, transformOrigin, elevation, PaperProps, MenuListProps, className, children, ...rest }, ref) {
  const [pos, setPos] = React.useState(null)
  React.useLayoutEffect(() => {
    if (!open) return
    const el = typeof anchorEl === 'function' ? anchorEl() : anchorEl
    if (!el) return
    const r = el.getBoundingClientRect()
    const top = anchorOrigin.vertical === 'bottom' ? r.bottom : anchorOrigin.vertical === 'center' ? r.top + r.height / 2 : r.top
    const left = anchorOrigin.horizontal === 'right' ? r.right : anchorOrigin.horizontal === 'center' ? r.left + r.width / 2 : r.left
    setPos({ top: Math.max(16, top), left: Math.max(16, left) })
  }, [open, anchorEl, anchorOrigin.vertical, anchorOrigin.horizontal])
  const listRef = React.useRef(null)
  React.useEffect(() => {
    if (open && listRef.current) {
      const first = listRef.current.querySelector('[role="menuitem"]')
      if (first) first.focus()
    }
  }, [open, pos])
  const onKeyDown = event => {
    const items = Array.from(listRef.current ? listRef.current.querySelectorAll('[role="menuitem"]') : [])
    const i = items.indexOf(document.activeElement)
    if (event.key === 'ArrowDown') items[(i + 1) % items.length].focus()
    else if (event.key === 'ArrowUp') items[(i - 1 + items.length) % items.length].focus()
    else if (event.key === 'Tab' && onClose) {
      event.preventDefault()
      onClose(event, 'tabKeyDown')
    } else return
    event.preventDefault()
  }
  return (
    <Modal open={open} onClose={onClose} BackdropProps={{ className: 'MuiBackdrop-invisible' }} className={cn('MuiPopover-root MuiMenu-root', className)} ref={ref} {...rest}>
      <div className="MuiPaper-root MuiPopover-paper MuiMenu-paper" style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }} {...PaperProps}>
        <ul ref={listRef} role="menu" className="MuiList-root MuiMenu-list" onKeyDown={onKeyDown} {...MenuListProps}>
          {children}
        </ul>
      </div>
    </Modal>
  )
})

const MenuItem = React.forwardRef(function MenuItem({ className, onKeyDown, onClick, ...rest }, ref) {
  return (
    <li
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      className={cn('MuiButtonBase-root MuiMenuItem-root', className)}
      onClick={onClick}
      onKeyDown={event => {
        if (onKeyDown) onKeyDown(event)
        if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
          event.preventDefault()
          if (onClick) onClick(event)
        }
      }}
      {...rest}
    />
  )
})

export { IconButton, Chip, Collapse, Hidden, useMediaQuery, Tooltip, Rating, Menu, MenuItem }
