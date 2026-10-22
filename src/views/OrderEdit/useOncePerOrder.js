import { useCallback, useRef } from 'react'

// 「同一張帳單只帶入一次」：回傳 isFirstLoad(orderId)，這個元件第一次遇到這張帳單時回 true（並記下），之後同一張帳單回 false。
// 為什麼需要：Apollo 快取不正規化（init-apollo 的 addTypename: false），頁面與各區塊以不同查詢讀同一張帳單（都寫入 order(orderId)），
// 某個區塊後來才掛載（例如不留客資的帳單選了顧客，「使用預收卡」出現）而重抓帳單時，其他帳單查詢的資料變得不完整、跟著重抓；
// 原本每次查詢完成都把原帳單重新帶入，櫃檯已改的內容被蓋回原帳單。換到另一張帳單（orderId 不同）時照常重新帶入。
// 回傳的函式在元件存續期間不變，可放進 effect 依賴。
export default function useOncePerOrder() {
  const doneRef = useRef(null)
  return useCallback(orderId => {
    if (doneRef.current === orderId) return false
    doneRef.current = orderId
    return true
  }, [])
}
