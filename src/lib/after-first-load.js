// 首屏非必要查詢延後（Jason 2026/10/21 同意「首屏查詢分批」）。
//
// 原因：開頁時版面一次發出 12 支查詢，回應陸續抵達時 TopBar／NavBar 各重新渲染十多次，
// 與頁面本身的渲染搶主執行緒（中階手機量測：系統公告、訂單佇列、釘選頁、切換店家清單 4 支延後，表格較早出現）。
// 判斷「首屏完成」：window load 之後、沒有任何查詢在等回應（init-apollo 的 inflightLink 計數），且瀏覽器空閒；
// 只看空閒不夠——頁面查詢等網路時主執行緒也是閒的，會在頁面資料回來前就放行。
// Safari 沒有 requestIdleCallback，改為網路安靜後 0.5 秒；不論如何 10 秒後一定放行（避免鈴鐺、店家清單永遠不出現）。
// 同一次開啟只等一次：之後版面重新掛載（例如登入後）直接視為已就緒。
import { useEffect, useState } from 'react'

const IDLE_TIMEOUT = 3000
const SAFARI_FALLBACK_DELAY = 500
const MAX_WAIT = 10000

let ready = false
let scheduled = false
let loaded = false
let inflight = 0
let checking = false
const listeners = new Set()

function markReady() {
  if (ready) return
  ready = true
  listeners.forEach(listener => listener())
  listeners.clear()
}

// 網路安靜時等一次空閒，空閒時若又有新查詢就繼續等
function check() {
  if (ready || !loaded || inflight > 0 || checking) return
  checking = true
  const done = () => {
    checking = false
    if (inflight === 0) markReady()
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(done, { timeout: IDLE_TIMEOUT })
  } else {
    setTimeout(done, SAFARI_FALLBACK_DELAY)
  }
}

function onLoad() {
  loaded = true
  check()
}

function schedule() {
  if (scheduled) return
  scheduled = true
  setTimeout(markReady, MAX_WAIT)
  if (document.readyState === 'complete') {
    onLoad()
  } else {
    window.addEventListener('load', onLoad, { once: true })
  }
}

// 每支 GraphQL 請求開始時呼叫，回傳結束時要呼叫的函式（重複呼叫無妨）
export function beginRequest() {
  inflight += 1
  let ended = false
  return () => {
    if (ended) return
    ended = true
    inflight -= 1
    check()
  }
}

// 回傳 true 表示首屏已完成，可以發出非必要查詢
export default function useAfterFirstLoad() {
  const [isReady, setIsReady] = useState(ready)
  useEffect(() => {
    if (ready) return undefined
    const listener = () => setIsReady(true)
    listeners.add(listener)
    schedule()
    return () => listeners.delete(listener)
  }, [])
  return isReady
}

// 測試用：重設模組狀態
export function __resetAfterFirstLoadForTest() {
  ready = false
  scheduled = false
  loaded = false
  inflight = 0
  checking = false
  listeners.clear()
}
