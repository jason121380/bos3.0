import React from 'react'

// 焦點與指標交給 Radix；這裡統一開啟順序、較晚圖層的外部事件防護與 Esc 交接。
// ref 掛載才登記，避免 keepMounted 或未開啟的浮層占用順序；卸載後回收。
const layers = []
const escapeHandlers = new WeakMap()
// Radix 的 passive effect 與退場動畫可能尚未交接監聽；以 ref 同步登記的頂層補上 Esc。
const topLayer = () => {
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const node = layers[index]
    // Radix Presence 的退場內容／Select 暫存 Fragment 仍可掛著，但已不擁有鍵盤。
    if (node.isConnected && node.getAttribute('data-state') !== 'closed') return node
  }
  return null
}
const handleEscape = event => {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  const handler = escapeHandlers.get(topLayer())
  if (handler && handler.current) handler.current(event)
}
const assignRef = (ref, node) => {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

function useLayerRef(forwardedRef, enabled = true, onEscapeKeyDown) {
  const escapeRef = React.useRef(onEscapeKeyDown)
  escapeRef.current = onEscapeKeyDown
  const latestRef = React.useRef(forwardedRef)
  const nodeRef = React.useRef(null)
  const [zIndex, setZIndex] = React.useState(1300)
  React.useLayoutEffect(() => {
    if (latestRef.current === forwardedRef) return
    assignRef(latestRef.current, null)
    latestRef.current = forwardedRef
    assignRef(forwardedRef, nodeRef.current)
  }, [forwardedRef])
  const ref = React.useCallback(node => {
    if (nodeRef.current) {
      const index = layers.indexOf(nodeRef.current)
      if (index >= 0) layers.splice(index, 1)
    }
    nodeRef.current = node
    if (node && enabled) {
      const last = layers[layers.length - 1]
      const order = last ? Number(last.style.zIndex) + 1 : 1300
      if (!layers.length) document.addEventListener('keydown', handleEscape, true)
      layers.push(node)
      escapeHandlers.set(node, escapeRef)
      // 同步設定，Radix Popper 在 layout effect 讀取 computed z-index 時即取得正確值。
      node.style.zIndex = order
      setZIndex(order)
    }
    if (!layers.length) document.removeEventListener('keydown', handleEscape, true)
    assignRef(latestRef.current, node)
  }, [enabled])
  const isLaterLayerEvent = event => {
    const current = layers.indexOf(nodeRef.current)
    return current >= 0 && layers.slice(current + 1).some(node => node.contains(event.target))
  }
  const guardOutside = callback => event => {
    if (isLaterLayerEvent(event)) event.preventDefault()
    else if (callback) callback(event)
  }
  return { ref, zIndex, isLaterLayerEvent, guardOutside, isTop: () => isTopLayer(nodeRef.current) }
}

const isTopLayer = node => topLayer() === node

export { useLayerRef, isTopLayer }
