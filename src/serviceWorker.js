// 本系統不使用 service worker（離線快取會讓使用者一直看到舊版）：入口檔（src/index.js）只呼叫 unregister，
// 把舊版曾安裝的 service worker 移除。CRA 樣板的 register 等函式全站沒有呼叫，已於 2026/10/22 刪除（Jason fix all）。
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister()
    })
  }
}
