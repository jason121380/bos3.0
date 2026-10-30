import React from 'react'
import { DismissableLayer } from '@radix-ui/react-dismissable-layer'
import { FocusScope } from '@radix-ui/react-focus-scope'

// 共用浮層行為 helper：使用者為 ui/combobox（搜尋／多選清單）與 ui/index-select（NativeSelect 的自家清單）。
// （form-control 的多選清單 MultipleSelect 已於 2026/10/30 移除，Jason 核准。）
// 行為節點與內容分開：關閉時卸載 Radix 登記，keepMounted／淡出的內容仍保留同一棵子樹。
// combobox 與 index-select 自行管理初始聚焦；此 Scope 讓下層 Radix 暫停，避免焦點鎖互搶。
function CompatLayer({ open, modal = false, onEscapeKeyDown, restoreFocus = false, contentRef, onPointerEventsChange }) {
  const markerRef = React.useRef(null)
  const restoreTo = React.useRef(null)
  React.useLayoutEffect(() => {
    if (!open || !markerRef.current || !onPointerEventsChange) return undefined
    const marker = markerRef.current
    // 將 Radix 算出的指標封鎖同步給真實內容；不可用固定 auto 繞過較晚上層的 modal。
    const update = () => onPointerEventsChange(marker.style.pointerEvents || 'auto')
    update()
    const observer = new MutationObserver(update)
    observer.observe(marker, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [open, onPointerEventsChange])
  if (!open) return null
  return (
    <FocusScope
      asChild
      onMountAutoFocus={event => {
        restoreTo.current = document.activeElement
        event.preventDefault()
      }}
      onUnmountAutoFocus={event => {
        event.preventDefault()
        if (!restoreFocus) return
        // keepMounted 以 display:none 隱藏時，Chrome 可能在 Scope 清理之後才把焦點移到 body。
        // 等目前 Scope 解除暫停後再還原；若使用者已點到其他可見欄位則不搶回焦點。
        const content = contentRef && contentRef.current
        const target = restoreTo.current
        setTimeout(() => {
          const active = document.activeElement
          if (target && target.isConnected && (active === document.body || (content && content.contains(active)))) target.focus()
        }, 0)
      }}
    >
      <DismissableLayer
        ref={markerRef}
        aria-hidden="true"
        style={{ display: 'none' }}
        disableOutsidePointerEvents={modal}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={event => event.preventDefault()}
        onFocusOutside={event => event.preventDefault()}
      />
    </FocusScope>
  )
}

export { CompatLayer }
