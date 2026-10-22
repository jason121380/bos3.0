import React from 'react'

// 掛載後執行 callback 一次；回傳 callback 是否已執行（執行前的第一次 render 為 false，執行後重新 render 為 true）。
// Jason 2026/10/22 fix all：原本回傳 ref，第一次 render 為 false、之後不會因此重新 render，清除快取頁因此一開始就導頁、
// 「清除快取中...」永遠不顯示；改為 state，讓頁面先顯示文字、callback 執行完再切換。
export default function useMounted(callback) {
  const [done, setDone] = React.useState(false)
  const callbackRef = React.useRef(callback)

  React.useEffect(() => {
    callbackRef.current()
    setDone(true)
  }, [])
  return done
}
