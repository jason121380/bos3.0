import React, { forwardRef, useLayoutEffect, useRef } from 'react'
import { buildURI } from 'react-csv/lib/core'

// 按下才產生 CSV 的下載連結（效能修正 A，Jason 2026/10/31）。
// react-csv 的 CSVLink 每次 render 都把整份資料轉成 CSV 並建立新的 Blob 網址（還不釋放），帳單列表 80 張時每次重畫都要重轉一次。
// 這裡改在點擊當下呼叫 getData() 組資料、以 react-csv 同一支 buildURI 與 CSVLink 的預設值（BOM、逗號、雙引號）產生網址，
// 寫回這個 <a> 的 href 後由瀏覽器照常下載：檔案內容與原本 CSVLink 逐字相同（有測試比對）。
// 仍是 <a download>（角色、鍵盤 Enter、樣式與原本相同）；上一次產生的 Blob 網址在下次點擊或卸載時釋放。
const CSV_UFEFF = true
const CSV_SEPARATOR = ','
const CSV_ENCLOSING = '"'

// Blob 網址只會在瀏覽器支援 URL.createObjectURL 時產生（否則 buildURI 回 data URI，不必釋放）
const revokeUrl = url => {
  if (url && url.indexOf('blob:') === 0) window.URL.revokeObjectURL(url)
}

export const buildCsvUri = (data, headers) => buildURI(data, CSV_UFEFF, headers, CSV_SEPARATOR, CSV_ENCLOSING)

const LazyCSVLink = forwardRef(function LazyCSVLink({ getData, headers, filename, children, onClick, ...rest }, ref) {
  const lastUrl = useRef(null)
  // 卸載時釋放最後一次的 Blob 網址（layout effect：卸載當下同步執行）
  useLayoutEffect(() => () => revokeUrl(lastUrl.current), [])

  const handleClick = event => {
    if (onClick) onClick(event)
    revokeUrl(lastUrl.current)
    const uri = buildCsvUri(getData(), headers)
    lastUrl.current = uri
    // 在預設動作（下載）發生前換上這次的網址
    event.currentTarget.setAttribute('href', uri)
  }

  return (
    <a download={filename} {...rest} ref={ref} target="_self" href="#csv" onClick={handleClick}>
      {children}
    </a>
  )
})

export default LazyCSVLink
