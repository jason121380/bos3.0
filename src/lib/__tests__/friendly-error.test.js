import { FRIENDLY_MESSAGES, friendlyErrorMessage } from '../friendly-error'

// 為什麼重要：櫃台看到英文技術訊息（500、資料格式錯誤、程式例外）時不知道是自己操作錯、網路問題還是要找客服。
// 這些測試守住：①中文業務訊息（密碼錯誤、庫存不足）一字不改——那是後端給使用者的正確指示；
// ②技術訊息一律換成「發生什麼＋下一步」；③頁面自己加的開頭保留，使用者知道是哪個動作失敗；
// ④無法分類的英文附上原文，截圖給客服時查得到原因。

test('中文業務訊息原樣保留', () => {
  expect(friendlyErrorMessage('密碼錯誤')).toBe('密碼錯誤')
  expect(friendlyErrorMessage('庫存不足\n請重新選擇')).toBe('庫存不足\n請重新選擇')
  expect(friendlyErrorMessage('此客戶已有 3 筆未結帳單')).toBe('此客戶已有 3 筆未結帳單')
})

test('HTTP 狀態碼：依原因給下一步（重新登入、縮小檔案、稍後再試）', () => {
  expect(friendlyErrorMessage('Response not successful: Received status code 500')).toBe(`${FRIENDLY_MESSAGES.server}（500）`)
  expect(friendlyErrorMessage('Response not successful: Received status code 401')).toBe(FRIENDLY_MESSAGES.auth)
  expect(friendlyErrorMessage('Response not successful: Received status code 413')).toBe(FRIENDLY_MESSAGES.tooLarge)
  expect(friendlyErrorMessage('Response not successful: Received status code 429')).toBe(FRIENDLY_MESSAGES.tooMany)
  expect(friendlyErrorMessage('Response not successful: Received status code 504')).toBe(FRIENDLY_MESSAGES.timeout)
  expect(friendlyErrorMessage('Response not successful: Received status code 400')).toBe(FRIENDLY_MESSAGES.badRequest)
})

test('頁面加的開頭保留：使用者知道是哪個動作失敗', () => {
  expect(friendlyErrorMessage('刪除訂單失敗: Response not successful: Received status code 502')).toBe(
    `刪除訂單失敗：${FRIENDLY_MESSAGES.server}（502）`
  )
  expect(friendlyErrorMessage("內部錯誤:Cannot read properties of undefined (reading 'id')")).toBe(
    `內部錯誤：${FRIENDLY_MESSAGES.server}（Cannot read properties of undefined (reading 'id')）`
  )
})

test('資料格式錯誤與程式例外：中文說明＋原文（給客服）', () => {
  const invalid = 'Variable "$input" got invalid value "abc"; Int cannot represent non-integer value: "abc"'
  expect(friendlyErrorMessage(invalid).startsWith(`${FRIENDLY_MESSAGES.badRequest}（Variable "$input"`)).toBe(true)
  expect(friendlyErrorMessage('Internal server error')).toBe(`${FRIENDLY_MESSAGES.server}（Internal server error）`)
  expect(friendlyErrorMessage('timeout of 30000ms exceeded')).toBe(FRIENDLY_MESSAGES.timeout)
  // 前後端版本不一致（Codex PR #239）：改輸入沒用，請重新整理；後端回空值屬伺服器錯誤
  expect(friendlyErrorMessage('Cannot query field "foo" on type "Query".').startsWith(`${FRIENDLY_MESSAGES.outdated}（Cannot query field`)).toBe(true)
  expect(friendlyErrorMessage('Unknown argument "bar" on field "Query.orders".').startsWith(FRIENDLY_MESSAGES.outdated)).toBe(true)
  expect(friendlyErrorMessage('Cannot return null for non-nullable field Order.id.').startsWith(FRIENDLY_MESSAGES.server)).toBe(true)
  // 伺服器回 500 錯誤頁（不是 JSON）時 Apollo 給的是解析錯誤：只說是伺服器問題，不附看不懂的原文（實測情境）
  expect(friendlyErrorMessage('Unexpected token \'I\', "Internal S"... is not valid JSON')).toBe(FRIENDLY_MESSAGES.server)
})

test('其他看不懂的英文：通用說明＋原文；過長的原文截斷', () => {
  expect(friendlyErrorMessage('Order not found')).toBe(`${FRIENDLY_MESSAGES.unknown}（Order not found）`)
  const long = `Something went wrong ${'x'.repeat(200)}`
  const result = friendlyErrorMessage(long)
  expect(result.endsWith('…）')).toBe(true)
  expect(result.length).toBeLessThan(FRIENDLY_MESSAGES.unknown.length + 90)
})

test('多支查詢同時失敗：相同說明只出現一次；非字串原樣回傳', () => {
  expect(friendlyErrorMessage('Internal server error\nInternal server error')).toBe(`${FRIENDLY_MESSAGES.server}（Internal server error）`)
  expect(friendlyErrorMessage(undefined)).toBeUndefined()
  expect(friendlyErrorMessage('')).toBe('')
})
