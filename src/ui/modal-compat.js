import React from 'react'
import ReactDOM from 'react-dom'
import { cn } from './utils'
import { Paper } from './display-compat'
import './display-compat.css'
import './modal-compat.css'

// 舊頁面用的彈窗（取代 MUI Modal／Dialog／DialogTitle／DialogContent／DialogContentText／DialogActions／Backdrop，
// Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// 輸出 MUI 同名元素、class 與 ARIA，樣式由 modal-compat.css 重現；行為比照 MUI Modal：
// - 掛到 document.body（container／disablePortal 可改）；關閉且未 keepMounted 時不渲染
// - 開啟時鎖住 body 捲動（有捲軸時補 padding-right 避免畫面跳動），並把 body 其他子節點設 aria-hidden
// - 焦點：開啟時移入彈窗、Tab 在彈窗內循環（前後哨兵）、焦點跑到「彈窗之前」的頁面內容時拉回；關閉時還給原本的元素
//   之後才開的圖層（例如 MUI 日期選擇器的對話框、搜尋下拉選單）掛在 body 更後面，焦點移過去不會被拉回
// - Esc：onClose(event, 'escapeKeyDown')；點背景：onClose(event, 'backdropClick')；多層時只有最上層回應
// - 不做淡出動畫：關閉即卸載（MUI 會延遲 195ms）
// 新畫面請用 ui/dialog。

const stack = [] // 開啟中的相容彈窗（最上層在最後）
let lockCount = 0
let savedBodyStyle = null

function lockScroll() {
  if (lockCount++ > 0) return
  const body = document.body
  const doc = document.documentElement
  savedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  // 同 MUI：只有 body 真的有捲軸時才補捲軸寬度
  const scrollbar = window.innerWidth - doc.clientWidth
  if (scrollbar > 0) {
    const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbar}px`
  }
  body.style.overflow = 'hidden'
}

function unlockScroll() {
  if (--lockCount > 0 || !savedBodyStyle) return
  document.body.style.overflow = savedBodyStyle.overflow
  document.body.style.paddingRight = savedBodyStyle.paddingRight
  savedBodyStyle = null
}

const SKIP_ARIA = ['TEMPLATE', 'SCRIPT', 'STYLE', 'LINK', 'MAP', 'META', 'NOSCRIPT', 'PICTURE', 'COL', 'COLGROUP', 'PARAM', 'SLOT', 'SOURCE', 'TRACK']

function hideSiblings(node) {
  const hidden = []
  if (!node || node.parentElement !== document.body) return hidden
  for (const el of Array.from(document.body.children)) {
    if (el === node || SKIP_ARIA.includes(el.tagName) || el.getAttribute('aria-hidden') === 'true') continue
    el.setAttribute('aria-hidden', 'true')
    hidden.push(el)
  }
  return hidden
}

const TABBABLE = 'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
const tabbables = root => Array.from(root.querySelectorAll(TABBABLE)).filter(el => !el.hasAttribute('data-sentinel') && el.offsetParent !== null)

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

// 共用的彈窗外殼：Portal＋背景＋焦點哨兵＋行為；children 是要鎖焦點的內容節點（Modal 的子元素或 Dialog 的 container）
function ModalBase({
  open,
  onClose,
  rootClassName,
  rootProps,
  hideBackdrop = false,
  BackdropProps,
  keepMounted = false,
  disablePortal = false,
  container,
  disableEscapeKeyDown = false,
  disableAutoFocus = false,
  disableEnforceFocus = false,
  disableRestoreFocus = false,
  disableScrollLock = false,
  onBackdropClick,
  rootRef,
  content,
}) {
  const nodeRef = React.useRef(null)
  const contentRef = React.useRef(null)
  const entry = React.useRef({})
  const isTop = () => stack[stack.length - 1] === entry.current
  // 開啟期間的行為旗標放在 ref：effect 只隨 open 開關重建
  const flags = React.useRef({})
  flags.current = { disableScrollLock, disablePortal, disableAutoFocus, disableEnforceFocus, disableRestoreFocus }

  React.useEffect(() => {
    if (!open) return undefined
    const me = entry.current
    const opts = flags.current
    stack.push(me)
    const restoreTo = document.activeElement
    if (!opts.disableScrollLock) lockScroll()
    const hidden = opts.disablePortal ? [] : hideSiblings(nodeRef.current)
    if (!opts.disableAutoFocus && contentRef.current && !contentRef.current.contains(document.activeElement)) contentRef.current.focus()
    const onFocusIn = event => {
      const root = nodeRef.current
      if (flags.current.disableEnforceFocus || !root || stack[stack.length - 1] !== me || root.contains(event.target)) return
      // 只把焦點從「彈窗之前」的頁面內容拉回；之後才開的圖層（掛在後面）放行
      if (root.compareDocumentPosition(event.target) & Node.DOCUMENT_POSITION_PRECEDING && contentRef.current) contentRef.current.focus()
    }
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      hidden.forEach(el => el.removeAttribute('aria-hidden'))
      if (!opts.disableScrollLock) unlockScroll()
      const i = stack.indexOf(me)
      if (i >= 0) stack.splice(i, 1)
      if (!opts.disableRestoreFocus && restoreTo && typeof restoreTo.focus === 'function' && document.contains(restoreTo)) restoreTo.focus()
    }
  }, [open])

  if (!open && !keepMounted) return null

  const focusEdge = edge => () => {
    const list = contentRef.current ? tabbables(contentRef.current) : []
    const target = edge === 'start' ? list[list.length - 1] : list[0]
    if (target) target.focus()
    else if (contentRef.current) contentRef.current.focus()
  }

  const node = (
    <div
      ref={el => {
        nodeRef.current = el
        assignRef(rootRef, el)
      }}
      role="presentation"
      {...rootProps}
      className={cn(rootClassName, !open && 'MuiModal-hidden', rootProps && rootProps.className)}
      onKeyDown={event => {
        if (rootProps && rootProps.onKeyDown) rootProps.onKeyDown(event)
        if (event.key !== 'Escape' || !isTop() || disableEscapeKeyDown) return
        event.stopPropagation()
        if (onClose) onClose(event, 'escapeKeyDown')
      }}
    >
      {!hideBackdrop && (
        <div
          aria-hidden="true"
          {...BackdropProps}
          className={cn('MuiBackdrop-root MuiModal-backdrop', BackdropProps && BackdropProps.className)}
          onClick={event => {
            if (BackdropProps && BackdropProps.onClick) BackdropProps.onClick(event)
            if (event.target !== event.currentTarget) return
            if (onBackdropClick) onBackdropClick(event)
            if (onClose) onClose(event, 'backdropClick')
          }}
        />
      )}
      <div tabIndex={open ? 0 : -1} data-testid="sentinelStart" data-sentinel="" onFocus={focusEdge('start')} />
      {content(contentRef)}
      <div tabIndex={open ? 0 : -1} data-testid="sentinelEnd" data-sentinel="" onFocus={focusEdge('end')} />
    </div>
  )
  if (disablePortal) return node
  const mount = typeof container === 'function' ? container() : container
  return ReactDOM.createPortal(node, mount || document.body)
}

const Modal = React.forwardRef(function Modal({ open, onClose, children, className, style, hideBackdrop, BackdropProps, keepMounted, disablePortal, container, disableEscapeKeyDown, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, disableScrollLock, onBackdropClick, closeAfterTransition, BackdropComponent, slotProps, slots, ...rest }, ref) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      rootRef={ref}
      rootClassName="MuiModal-root"
      rootProps={{ ...rest, className, style }}
      {...{ hideBackdrop, BackdropProps, keepMounted, disablePortal, container, disableEscapeKeyDown, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, disableScrollLock, onBackdropClick }}
      content={contentRef => {
        const child = React.Children.only(children)
        return React.cloneElement(child, {
          // 同 MUI：子元素沒有 tabIndex 時補 -1，讓它能接焦點
          tabIndex: child.props.tabIndex !== undefined ? child.props.tabIndex : -1,
          ref: el => {
            contentRef.current = el
            assignRef(child.ref, el)
          },
        })
      }}
    />
  )
})

const DialogContext = React.createContext({ titleId: undefined })
let dialogSeed = 0

const Dialog = React.forwardRef(function Dialog(
  {
    open,
    onClose,
    children,
    className,
    style,
    maxWidth = 'sm',
    fullWidth = false,
    fullScreen = false,
    scroll = 'paper',
    PaperProps = {},
    PaperComponent = Paper,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    hideBackdrop,
    BackdropProps,
    keepMounted,
    disablePortal,
    container,
    disableEscapeKeyDown,
    disableAutoFocus,
    disableEnforceFocus,
    disableRestoreFocus,
    disableScrollLock,
    onBackdropClick,
    TransitionComponent,
    TransitionProps,
    transitionDuration,
    ...rest
  },
  ref
) {
  const idRef = React.useRef(null)
  if (idRef.current === null) idRef.current = `dialog-title-${(dialogSeed += 1)}`
  const titleId = ariaLabelledby || idRef.current
  const downTarget = React.useRef(null)
  const value = React.useMemo(() => ({ titleId }), [titleId])
  const scrollName = scroll.charAt(0).toUpperCase() + scroll.slice(1)
  const widthName = maxWidth === false ? 'False' : String(maxWidth).charAt(0).toUpperCase() + String(maxWidth).slice(1)
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      rootRef={ref}
      rootClassName="MuiDialog-root MuiModal-root"
      rootProps={{ ...rest, className, style }}
      {...{ hideBackdrop, BackdropProps, keepMounted, disablePortal, container, disableEscapeKeyDown, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, disableScrollLock, onBackdropClick }}
      content={contentRef => (
        <div
          ref={contentRef}
          role="presentation"
          tabIndex={-1}
          className={cn('MuiDialog-container', `MuiDialog-scroll${scrollName}`)}
          onMouseDown={event => {
            downTarget.current = event.target
          }}
          onClick={event => {
            // 同 MUI：在 container 上按下並放開（點在面板外）才算點背景
            if (downTarget.current !== event.currentTarget || event.target !== event.currentTarget) return
            downTarget.current = null
            if (onBackdropClick) onBackdropClick(event)
            if (onClose) onClose(event, 'backdropClick')
          }}
        >
          <PaperComponent
            elevation={24}
            role="dialog"
            aria-describedby={ariaDescribedby}
            aria-labelledby={titleId}
            {...PaperProps}
            className={cn(
              'MuiDialog-paper',
              `MuiDialog-paperScroll${scrollName}`,
              `MuiDialog-paperWidth${widthName}`,
              fullWidth && 'MuiDialog-paperFullWidth',
              fullScreen && 'MuiDialog-paperFullScreen',
              PaperProps.className
            )}
          >
            <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
          </PaperComponent>
        </div>
      )}
    />
  )
})

const DialogTitle = React.forwardRef(function DialogTitle({ id, className, component: Component = 'h2', ...rest }, ref) {
  const { titleId } = React.useContext(DialogContext)
  return <Component ref={ref} id={id !== undefined ? id : titleId} className={cn('MuiTypography-root MuiTypography-h6 MuiDialogTitle-root', className)} {...rest} />
})

const DialogContent = React.forwardRef(function DialogContent({ dividers = false, className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiDialogContent-root', dividers && 'MuiDialogContent-dividers', className)} {...rest} />
})

const DialogContentText = React.forwardRef(function DialogContentText({ className, component: Component = 'p', ...rest }, ref) {
  return <Component ref={ref} className={cn('MuiTypography-root MuiTypography-body1 MuiDialogContentText-root', className)} {...rest} />
})

const DialogActions = React.forwardRef(function DialogActions({ disableSpacing = false, className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiDialogActions-root', !disableSpacing && 'MuiDialogActions-spacing', className)} {...rest} />
})

// 獨立的載入遮罩：關閉時保留在畫面上但 opacity 0＋visibility hidden（同 MUI Fade 結束狀態）
const Backdrop = React.forwardRef(function Backdrop({ open, invisible = false, className, style, transitionDuration, TransitionComponent, ...rest }, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('MuiBackdrop-root', invisible && 'MuiBackdrop-invisible', className)}
      style={{ opacity: open ? 1 : 0, visibility: open ? undefined : 'hidden', ...style }}
      {...rest}
    />
  )
})

export { Modal, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Backdrop }
