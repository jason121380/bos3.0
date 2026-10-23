import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn, focusRing } from './utils'
import { useLayerRef } from './layer-stack'

// 與相容層共用 Radix DismissableLayer／FocusScope，讓後開的日期、下拉與彈窗
// 自動接管焦點與 Esc；不改成非 modal，保留背景隔離與既有受控開關契約。
// layer-stack 管理視覺順序與較晚 portal 的外部事件防護，避免兩套焦點鎖與 document Esc 互搶（MEMORY #195）。
// STYLE.md §6：寬 480 / 640 / 800；標題、內容、底部動作三段
const sizes = { sm: 'max-w-[480px]', md: 'max-w-[640px]', lg: 'max-w-[800px]' }

const DialogState = React.createContext(null)
function Dialog({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen)
  const open = controlledOpen === undefined ? localOpen : controlledOpen
  const wasOpen = React.useRef(false)
  const opener = React.useRef(null)
  // 在 Portal／FocusScope 掛載前記錄；再次開啟時不能沿用退場中的舊欄位或 body。
  if (open && !wasOpen.current && typeof document !== 'undefined') opener.current = document.activeElement
  wasOpen.current = open
  const change = next => {
    if (controlledOpen === undefined) setLocalOpen(next)
    if (onOpenChange) onOpenChange(next)
  }
  return <DialogPrimitive.Root {...props} open={open} onOpenChange={change}>
    <DialogState.Provider value={{ open, change, opener }}>{children}</DialogState.Provider>
  </DialogPrimitive.Root>
}
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogContent = React.forwardRef(({ className, size = 'sm', children, hideClose, style, onBlurCapture, onOpenAutoFocus, onCloseAutoFocus, onPointerDownOutside, onFocusOutside, onInteractOutside, onEscapeKeyDown, ...props }, forwardedRef) => {
  const state = React.useContext(DialogState)
  const { ref, zIndex, isLaterLayerEvent, isTop } = useLayerRef(forwardedRef, true, event => {
    if (!state || !state.open) return
    if (onEscapeKeyDown) onEscapeKeyDown(event)
    if (!event.defaultPrevented) state.change(false)
    event.preventDefault()
  })
  const restoreFocus = React.useRef(null)
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay style={{ zIndex }} className="fixed inset-0 z-[1300] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        ref={ref}
        onEscapeKeyDown={event => {
          // portal 重開的 effect 尚在交接時，仍以同步登記的最上層為準。
          if (event.defaultPrevented) return
          if (!isTop()) event.preventDefault()
          else if (onEscapeKeyDown) onEscapeKeyDown(event)
        }}
        onPointerDownOutside={event => {
          if (isLaterLayerEvent(event)) event.preventDefault()
          else if (onPointerDownOutside) onPointerDownOutside(event)
        }}
        onFocusOutside={event => {
          if (isLaterLayerEvent(event)) event.preventDefault()
          else if (onFocusOutside) onFocusOutside(event)
        }}
        onInteractOutside={event => {
          if (isLaterLayerEvent(event)) event.preventDefault()
          else if (onInteractOutside) onInteractOutside(event)
        }}
        onOpenAutoFocus={event => {
          restoreFocus.current = (state && state.opener.current) || document.activeElement
          if (onOpenAutoFocus) onOpenAutoFocus(event)
        }}
        onCloseAutoFocus={event => {
          if (onCloseAutoFocus) onCloseAutoFocus(event)
          // 受控視窗常沒有 DialogTrigger；仍須還原下層原焦點，並尊重呼叫端 preventDefault。
          if (!event.defaultPrevented && restoreFocus.current && restoreFocus.current.isConnected) {
            event.preventDefault()
            restoreFocus.current.focus()
          }
        }}
        style={{ ...style, zIndex }}
        onBlurCapture={event => {
          if (onBlurCapture) onBlurCapture(event)
          // 主動 blur（例如數字欄滾輪）時將焦點留在面板，避免焦點鎖把游標拉回原輸入框。
          if (!event.defaultPrevented && (event.relatedTarget === document.body || event.relatedTarget === document) && event.target !== event.currentTarget) event.currentTarget.focus()
        }}
        className={cn(
          'ui-root fixed left-1/2 top-1/2 z-[1300] flex max-h-[calc(100vh-48px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col',
          'rounded-2xl border border-solid border-border bg-background shadow-float outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          sizes[size],
          // 手機：改為由底部滑出的面板（bottom sheet），避開底部指示條
          'max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0',
          'max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[env(safe-area-inset-bottom)]',
          'max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=open]:slide-in-from-bottom-1/2 max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=closed]:slide-out-to-bottom-1/2',
          className
        )}
        {...props}
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border-strong sm:hidden" />
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="關閉"
            // 視覺 24px；透明偽元素四周各擴 8px，命中區 40px（STYLE §9 觸控目標），標題列已留 pr-12 不會蓋到標題
            className={cn("absolute right-4 top-4 rounded-md p-1 text-text-tertiary before:absolute before:-inset-2 before:content-[''] hover:bg-surface-hover hover:text-text", focusRing)}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 px-6 pb-2 pr-12 pt-6 max-sm:px-4 max-sm:pr-12 max-sm:pt-3', className)} {...props} />
)
const DialogBody = ({ className, ...props }) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4 max-sm:px-4', className)} {...props} />
)
const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-end gap-2 border-0 border-t border-solid border-border px-6 py-4 max-sm:px-4 max-sm:[&>button]:flex-1', className)} {...props} />
)

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-heading text-text', className)} {...props} />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-body text-text-secondary', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription }
