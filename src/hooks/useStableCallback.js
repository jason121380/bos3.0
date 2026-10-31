import { useCallback, useRef } from 'react'

// 回傳「身分永遠不變、呼叫時執行最新一次 render 的函式」的包裝（效能修正 A／B，Jason 2026/10/31）。
// 給 memo 過的子元件當事件 handler：子元件不因 handler 每次 render 重建而重畫，handler 內容與讀到的 state 仍是最新的。
// 在 render 期間就換上最新的函式（React 17 同步模式下 render 與 commit 不會被中斷）：
// 子元件在 commit 階段觸發的事件（例如 autoFocus 掛載時的 focus）也拿到這一次 render 的版本，不會晚一輪。
// 只能在事件（點擊、輸入、鍵盤、effect）裡呼叫，不要在 render 期間呼叫。
export default function useStableCallback(fn) {
  const latest = useRef(fn)
  latest.current = fn
  return useCallback((...args) => latest.current(...args), [])
}
