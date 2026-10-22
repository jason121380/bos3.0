// 保護「測試不得連到任何真實後端」（Jason 2026/10/22：不可以動到真的資料庫）：
// setupTests.js 對每個測試檔封鎖 fetch／XMLHttpRequest／WebSocket；這裡確認三個出口都送不出去，連到正式與測試後端的網址都被擋下並記錄。
import { PROD_ORIGIN, TEST_ORIGIN } from 'lib/api-base'

beforeEach(() => {
  global.__blockedNetwork__.length = 0
})

it('fetch 正式與測試後端：一律失敗、不連網，並記錄網址', async () => {
  await expect(fetch(`${PROD_ORIGIN}/graphql`)).rejects.toThrow('測試中禁止連網（fetch）')
  await expect(fetch(`${TEST_ORIGIN}/graphql`)).rejects.toThrow('測試中禁止連網（fetch）')
  expect(global.__blockedNetwork__).toEqual([`fetch ${PROD_ORIGIN}/graphql`, `fetch ${TEST_ORIGIN}/graphql`])
})

it('XMLHttpRequest 送出即拋錯', () => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `${PROD_ORIGIN}/graphql`)
  expect(() => xhr.send('{}')).toThrow('測試中禁止連網（XMLHttpRequest）')
  expect(global.__blockedNetwork__).toEqual([`XMLHttpRequest ${PROD_ORIGIN}/graphql`])
})

it('WebSocket（訂閱）建立即拋錯', () => {
  const wsUrl = PROD_ORIGIN.replace('https', 'wss') + '/graphql'
  expect(() => new WebSocket(wsUrl)).toThrow('測試中禁止連網（WebSocket）')
  expect(global.__blockedNetwork__).toEqual([`WebSocket ${wsUrl}`])
})
