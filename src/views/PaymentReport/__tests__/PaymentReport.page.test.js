// 保護「每日非現金明細」：
// - 預設查本月 1 日 00:00 到現在（台灣時間）；快速選擇、網址帶的日期改查該區間
// - 欄位依後端回傳的「使用過的付款方式」排列；當天沒用到的付款方式留白；沒有任何非現金的日子整列留白
// - 合計列逐欄加總；匯出 CSV 只含有非現金的日子＋合計（日期以台灣時間）
// - 查詢失敗不整頁錯誤（Jason 2026/10/22 長期授權：查詢失敗一律防呆）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait, within } from '@testing-library/react'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import PaymentReport from '..'

jest.setTimeout(20000)

const D1 = Date.UTC(2026, 9, 19, 16, 30) // 台灣 2026/10/20 00:30
const D2 = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const D3 = Date.UTC(2026, 9, 21, 16, 30) // 台灣 2026/10/22 00:30
const REPORT = [
  { date: D1, payTypeDetail: [{ name: 'LINE Pay', price: 1200 }, { name: '信用卡', price: 3000 }] },
  { date: D2, payTypeDetail: [] },
  { date: D3, payTypeDetail: [{ name: '信用卡', price: 500 }] },
]
const fixtures = (report = REPORT) => ({
  GET_MERCHANT_OTHER_PAYMENT_REPORT: {
    merchantOtherPayWayDetailReport: { merchantOtherPayWayDetailReport: report, usedPayType: ['LINE Pay', '信用卡'] },
  },
})
const setup = (options = {}) => renderPage(<PaymentReport />, { fixtures: fixtures(), route: '/report/payment', ...options })
const rowCells = text => within(screen.getByText(text).closest('tr')).getAllByRole('cell').map(c => c.textContent)
const lastInput = calls => {
  const list = callsOf(calls, 'GET_MERCHANT_OTHER_PAYMENT_REPORT')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('每日非現金明細', () => {
  it('預設查本月 1 日到現在；快速選擇「上個月」改查上個月整月', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_MERCHANT_OTHER_PAYMENT_REPORT')[0].variables.input
    expect(first.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(first.endDate).toBeGreaterThanOrEqual(before)
    expect(first.endDate).toBeLessThanOrEqual(Date.now())
    pickQuickDate('上個月')
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfMonth(subMonths(new Date(), 1)).getTime(),
        endDate: endOfMonth(subMonths(new Date(), 1)).getTime(),
      })
    )
  })

  it('網址帶的日期區間直接查詢', async () => {
    const start = new Date(2026, 8, 1).getTime()
    const end = new Date(2026, 8, 30, 23, 59, 59, 999).getTime()
    const { calls, settle } = setup({ route: `/report/payment?startDate=${start}&endDate=${end}` })
    await settle()
    expect(lastInput(calls)).toEqual({ startDate: start, endDate: end })
  })

  it('欄位依使用過的付款方式；沒用到的留白；合計逐欄加總；匯出只含有非現金的日子與合計', async () => {
    const { settle } = setup()
    await settle()
    expect([...document.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['日期', 'LINE Pay', '信用卡'])
    expect(rowCells('2026/10/20')).toEqual(['2026/10/20', '1,200', '3,000'])
    expect(rowCells('2026/10/21')).toEqual(['2026/10/21', '', ''])
    expect(rowCells('2026/10/22')).toEqual(['2026/10/22', '', '500'])
    expect(rowCells('合計')).toEqual(['合計', '1,200', '3,500'])
    const csv = exportedCsv()
    expect(csv).toContain('"2026/10/20","1200","3000"')
    expect(csv).toContain('"2026/10/22","","500"')
    expect(csv).not.toContain('2026/10/21')
    expect(csv).toContain('"合計","1200","3500"')
  })

  it('查詢失敗不整頁錯誤，顯示空表格與 0 筆合計', async () => {
    const { settle } = renderPage(<PaymentReport />, { fallback: 'error', route: '/report/payment' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('合計')).toBeInTheDocument()
  })
})
