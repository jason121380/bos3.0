import uuid from '../uuid'

// 為什麼重要：全站 49 處用 uuid() 當列表 key／暫存 id（打帳單項目、卡券、匯入資料…），同一畫面若產生重複 id，
// React 會把兩列當成同一筆、勾選與刪除會作用到錯的項目。取代 uuid 套件後，格式與唯一性必須和 uuid@3 的 v4 相同。

test('格式為 RFC 4122 v4：8-4-4-4-12、第 13 碼為 4、第 17 碼為 8/9/a/b', () => {
  for (let i = 0; i < 20; i++) {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  }
})

test('連續產生 10000 個不重複', () => {
  const seen = new Set()
  for (let i = 0; i < 10000; i++) seen.add(uuid())
  expect(seen.size).toBe(10000)
})
