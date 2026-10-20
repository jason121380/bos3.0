import React from 'react'
import { cn } from './utils'
import { Paper } from './display-compat'
import './display-compat.css'
import './feedback-compat.css'

// 舊頁面用的提示訊息（取代 MUI Snackbar／SnackbarContent／Alert，Jason 2026/10/20 拍版「MUI 整包移除」）。介面與 MUI 相容：頁面只換 import。
// Snackbar 行為比照 MUI：固定位置、不掛 Portal；autoHideDuration 到時呼叫 onClose(null, 'timeout')，滑鼠移入暫停、移出後以一半時間重新計時；
// 點畫面其他地方呼叫 onClose(event, 'clickaway')（觸發開啟的那次點擊不算）；出現時有 Grow 動畫，關閉即卸載（不做離場動畫）。
// 新畫面請用 ui/toast。

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

const SnackbarContent = React.forwardRef(function SnackbarContent({ message, action, role = 'alert', className, ...rest }, ref) {
  return (
    <Paper ref={ref} role={role} square elevation={6} className={cn('MuiSnackbarContent-root', className)} {...rest}>
      <div className="MuiSnackbarContent-message">{message}</div>
      {action ? <div className="MuiSnackbarContent-action">{action}</div> : null}
    </Paper>
  )
})

const Snackbar = React.forwardRef(function Snackbar(
  {
    open,
    onClose,
    autoHideDuration = null,
    resumeHideDuration,
    anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
    message,
    action,
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    ClickAwayListenerProps,
    ContentProps,
    TransitionComponent,
    TransitionProps,
    transitionDuration,
    disableWindowBlurListener,
    ...rest
  },
  ref
) {
  const rootRef = React.useRef(null)
  const timer = React.useRef(null)
  const latest = React.useRef({})
  latest.current = { onClose, autoHideDuration, resumeHideDuration }

  const startTimer = React.useCallback(duration => {
    clearTimeout(timer.current)
    if (duration == null || !latest.current.onClose) return
    timer.current = setTimeout(() => {
      if (latest.current.onClose) latest.current.onClose(null, 'timeout')
    }, duration)
  }, [])

  React.useEffect(() => {
    if (!open) return undefined
    startTimer(autoHideDuration)
    return () => clearTimeout(timer.current)
  }, [open, autoHideDuration, startTimer])

  React.useEffect(() => {
    if (!open) return undefined
    // 同 MUI ClickAwayListener：開啟後的下一輪才開始監聽，避免開啟它的那次點擊立刻觸發 clickaway
    let active = false
    const arm = setTimeout(() => {
      active = true
    }, 0)
    const onDocClick = event => {
      if (!active || !rootRef.current || rootRef.current.contains(event.target)) return
      if (latest.current.onClose) latest.current.onClose(event, 'clickaway')
    }
    document.addEventListener('click', onDocClick)
    return () => {
      clearTimeout(arm)
      document.removeEventListener('click', onDocClick)
    }
  }, [open])

  if (!open) return null
  const child = children || <SnackbarContent message={message} action={action} {...ContentProps} />
  const grown = React.cloneElement(child, { style: { animation: 'mui-grow-in 225ms cubic-bezier(0.4, 0, 0.2, 1)', ...child.props.style } })
  return (
    <div
      ref={el => {
        rootRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      role="presentation"
      className={cn('MuiSnackbar-root', `MuiSnackbar-anchorOrigin${capitalize(anchorOrigin.vertical)}${capitalize(anchorOrigin.horizontal)}`, className)}
      onMouseEnter={event => {
        clearTimeout(timer.current)
        if (onMouseEnter) onMouseEnter(event)
      }}
      onMouseLeave={event => {
        const { autoHideDuration: duration, resumeHideDuration: resume } = latest.current
        if (duration != null) startTimer(resume != null ? resume : duration * 0.5)
        if (onMouseLeave) onMouseLeave(event)
      }}
      {...rest}
    >
      {grown}
    </div>
  )
})

// 圖示沿用 MUI 原本的 SVG 路徑
const ICONS = {
  success: 'M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z',
  warning: 'M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z',
  error: 'M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  info: 'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
}
const Svg = ({ d, size = 'Inherit' }) => (
  <svg className={`MuiSvgIcon-root MuiSvgIcon-fontSize${size}`} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
)

const Alert = React.forwardRef(function Alert(
  { severity = 'success', variant = 'standard', color, icon, iconMapping, action, onClose, closeText = 'Close', role = 'alert', elevation = 0, className, children, ...rest },
  ref
) {
  const tone = capitalize(color || severity)
  const iconNode = icon !== false && (icon || (iconMapping && iconMapping[severity]) || <Svg d={ICONS[severity] || ICONS.success} />)
  return (
    <Paper ref={ref} role={role} elevation={elevation} className={cn('MuiAlert-root', `MuiAlert-${variant}${tone}`, `MuiAlert-${variant}`, className)} {...rest}>
      {iconNode ? <div className="MuiAlert-icon">{iconNode}</div> : null}
      <div className="MuiAlert-message">{children}</div>
      {action != null ? <div className="MuiAlert-action">{action}</div> : null}
      {action == null && onClose ? (
        <div className="MuiAlert-action">
          <button type="button" className="MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeSmall" aria-label={closeText} title={closeText} onClick={onClose}>
            <Svg d={ICONS.close} size="Small" />
          </button>
        </div>
      ) : null}
    </Paper>
  )
})

export { Snackbar, SnackbarContent, Alert }
