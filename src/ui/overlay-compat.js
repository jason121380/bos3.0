import React from 'react'
import ReactDOM from 'react-dom'
import { CompatLayer } from './compat-layer'
import { useLayerRef } from './layer-stack'
import { useFloating, autoUpdate, flip, shift } from '@floating-ui/react-dom'
import { cn } from './utils'
import { Paper } from './display-compat'
import { Modal } from './modal-compat'
import './display-compat.css'
import './modal-compat.css'
import './overlay-compat.css'

// 舊頁面用的浮層（取代 MUI Popper／Drawer／Fade，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// - Popper：掛到 body、以 floating-ui 定位（同 popper.js 預設：位置不夠時翻面、貼齊可視範圍）；transition 時 children 為函式並取得 TransitionProps
// - Drawer：persistent／permanent 為固定在邊緣的面板（不擋頁面），temporary 為帶背景的彈窗（沿用 modal-compat）；開關以滑入滑出呈現
// - Fade：同 MUI 時序（進場 225ms、離場 195ms，可用 timeout 改），離場結束呼叫 onExited 並設 visibility hidden
// 新畫面請用 ui/popover、ui/dialog。

const assignRef = (ref, node) => {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else ref.current = node
}

const resolveAnchor = anchorEl => (typeof anchorEl === 'function' ? anchorEl() : anchorEl)

const Popper = React.forwardRef(function Popper(
  { open, anchorEl, placement = 'bottom', transition = false, keepMounted = false, disablePortal = false, container, children, className, style, modifiers, popperOptions, popperRef, onEscapeKeyDown, ...rest },
  ref
) {
  const [pointerEvents, setPointerEvents] = React.useState('auto')
  const [exited, setExited] = React.useState(!open)
  React.useEffect(() => {
    if (open) setExited(false)
  }, [open])
  const { refs, floatingStyles, placement: finalPlacement } = useFloating({
    placement,
    strategy: 'absolute',
    open,
    middleware: [flip(), shift()],
    whileElementsMounted: autoUpdate,
  })
  React.useLayoutEffect(() => {
    refs.setReference(resolveAnchor(anchorEl) || null)
  }, [anchorEl, refs])

  const { ref: layerRef, zIndex } = useLayerRef(ref, open)
  const setFloating = refs.setFloating
  const setRoot = React.useCallback(el => {
    setFloating(el)
    layerRef(el)
  }, [setFloating, layerRef])

  if (!keepMounted && !open && (!transition || exited)) return null
  const childProps = { placement: finalPlacement }
  if (transition) childProps.TransitionProps = { in: open, onEnter: () => setExited(false), onExited: () => setExited(true) }
  const node = (
    <div
      ref={setRoot}
      role="tooltip"
      className={cn('base-Popper-root', className)}
      style={{ ...floatingStyles, ...(!open && keepMounted && !transition ? { display: 'none' } : null), ...style, zIndex, pointerEvents: open ? pointerEvents : undefined }}
      {...rest}
    >
      {typeof children === 'function' ? children(childProps) : children}
    </div>
  )
  const layeredNode = <>
    <CompatLayer open={open} contentRef={refs.floating} onPointerEventsChange={setPointerEvents} onEscapeKeyDown={onEscapeKeyDown} restoreFocus />
    {node}
  </>
  if (disablePortal) return layeredNode
  const mount = typeof container === 'function' ? container() : container
  return ReactDOM.createPortal(layeredNode, mount || document.body)
})

const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

// 子元素需能接 style（同 MUI Fade：cloneElement 合併 style）
const Fade = React.forwardRef(function Fade({ in: inProp = false, timeout, appear = true, onEnter, onExited, children, style }, ref) {
  const enter = typeof timeout === 'number' ? timeout : (timeout && timeout.enter) || 225
  const exit = typeof timeout === 'number' ? timeout : (timeout && timeout.exit) || 195
  // 進場：先以 opacity 0 畫一次，下一個 frame 才變 1，才有淡入
  const [shown, setShown] = React.useState(inProp && !appear)
  const [done, setDone] = React.useState(!inProp)
  // onEnter／onExited 多為呼叫端每次 render 新建的函式：放在 ref，effect 只隨 in 觸發
  const callbacks = React.useRef({})
  callbacks.current = { onEnter, onExited, exit }
  React.useEffect(() => {
    const { onEnter: entered, onExited: exitedCb, exit: exitMs } = callbacks.current
    if (inProp) {
      setDone(false)
      if (entered) entered()
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = setTimeout(() => {
      setDone(true)
      if (exitedCb) exitedCb()
    }, exitMs)
    return () => clearTimeout(timer)
  }, [inProp])
  const child = React.Children.only(children)
  return React.cloneElement(child, {
    ref: el => {
      assignRef(ref, el)
      assignRef(child.ref, el)
    },
    style: {
      opacity: shown ? 1 : 0,
      transition: `opacity ${shown ? enter : exit}ms ${EASING} 0ms`,
      visibility: !inProp && done ? 'hidden' : undefined,
      ...style,
      ...child.props.style,
    },
  })
})

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
const SLIDE_OUT = { bottom: 'translateY(100%)', top: 'translateY(-100%)', left: 'translateX(-100%)', right: 'translateX(100%)' }

const Drawer = React.forwardRef(function Drawer(
  { anchor = 'left', open = false, variant = 'temporary', onClose, elevation = 16, PaperProps = {}, ModalProps = {}, hideBackdrop, className, children, SlideProps, transitionDuration, ...rest },
  ref
) {
  const slideStyle =
    variant === 'permanent'
      ? null
      : open
      ? { transform: 'none', transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' }
      : { transform: SLIDE_OUT[anchor], visibility: 'hidden', transition: 'transform 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, visibility 0ms 195ms' }
  const paper = (
    <Paper
      square
      elevation={variant === 'temporary' ? elevation : 0}
      {...PaperProps}
      className={cn('MuiDrawer-paper', `MuiDrawer-paperAnchor${capitalize(anchor)}`, variant !== 'temporary' && `MuiDrawer-paperAnchorDocked${capitalize(anchor)}`, PaperProps.className)}
      style={{ ...slideStyle, ...PaperProps.style }}
    >
      {children}
    </Paper>
  )
  if (variant !== 'temporary') {
    return (
      <div ref={ref} className={cn('MuiDrawer-root MuiDrawer-docked', className)} {...rest}>
        {paper}
      </div>
    )
  }
  return (
    <Modal ref={ref} open={open} onClose={onClose} hideBackdrop={hideBackdrop} className={cn('MuiDrawer-root MuiDrawer-modal', className)} {...rest} {...ModalProps}>
      {paper}
    </Modal>
  )
})

export { Popper, Fade, Drawer }
