import { endOfDay, startOfDay } from 'date-fns'
import { ordersListPath, ordersListPathForOrderDate } from '../ordersListPath'

// 為什麼重要：掛單結帳已經成功之後才導頁。舊的 split('=').substring 在查詢不是
// 「startDate=13 碼&endDate=…」時會拋錯，畫面就顯示結帳失敗、留在原頁。

test('有日期區間時回到同一區間的帳單列表', () => {
  expect(ordersListPath('?startDate=1760976000000&endDate=1761062399999'))
    .toBe('/management/orders?startDate=1760976000000&endDate=1761062399999')
})

test('日期前面還有別的參數時仍讀得到兩個日期', () => {
  expect(ordersListPath('?source=LINE&startDate=1760976000000&endDate=1761062399999'))
    .toBe('/management/orders?startDate=1760976000000&endDate=1761062399999')
})

test('依掛單日期回到當天的帳單列表；日期無效時不帶參數', () => {
  const date = new Date(2026, 9, 21, 10, 30).getTime()
  expect(ordersListPathForOrderDate(date)).toBe(
    `/management/orders?startDate=${startOfDay(new Date(date)).getTime()}&endDate=${endOfDay(new Date(date)).getTime()}`
  )
  expect(ordersListPathForOrderDate('不是日期')).toBe('/management/orders')
})

test('沒有查詢、查詢沒有等號、或日期不是數字時回到不帶參數的帳單列表，且不拋錯', () => {
  expect(ordersListPath('')).toBe('/management/orders')
  expect(ordersListPath('?')).toBe('/management/orders')
  expect(ordersListPath('?reprint')).toBe('/management/orders')
  expect(ordersListPath('?startDate=abc&endDate=1')).toBe('/management/orders')
  expect(ordersListPath(null)).toBe('/management/orders')
})
