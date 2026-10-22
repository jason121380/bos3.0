// 保護「收支匯款表」：
// - 預設查本月 1 日 00:00 到現在（台灣時間）；快速選擇、網址帶的日期改查該區間
// - 每日一列（日期以台灣時間、金額千分位）；合計列加總營業現金應收、現金收支收入／支出、當日現金結存，匯款不加總、累計現金結存為 N/A
// - 匯出 CSV 與畫面同一組數字；查詢失敗不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import MoneyFlowTransferReport from '..'

jest.setTimeout(20000)

const ROWS = [
  { date: Date.UTC(2026, 9, 19, 16, 30), businessCash: 12000, cashRevenue: 500, cashExpenditure: 200, bankTransfer: 10000, cashBalance: 2300, totalCashBalance: 2300 },
  { date: Date.UTC(2026, 9, 20, 16, 30), businessCash: 8000, cashRevenue: 0, cashExpenditure: 1000, bankTransfer: 0, cashBalance: 7000, totalCashBalance: 9300 },
]
const setup = (options = {}) =>
  renderPage(<MoneyFlowTransferReport />, {
    fixtures: { GET_MONEY_FLOW_TRANSFER_REPORT: { moneyFlowTransferReport: ROWS } },
    route: '/report/money-flow-transfer',
    ...options,
  })
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
const lastInput = calls => {
  const list = callsOf(calls, 'GET_MONEY_FLOW_TRANSFER_REPORT')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('收支匯款表', () => {
  it('預設查本月 1 日到現在；快速選擇「昨天」改查昨天整天；網址帶的日期直接查詢', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_MONEY_FLOW_TRANSFER_REPORT')[0].variables.input
    expect(first.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(first.endDate).toBeGreaterThanOrEqual(before)
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    )
    cleanup()
    const start = new Date(2026, 9, 1).getTime()
    const end = new Date(2026, 9, 31, 23, 59, 59, 999).getTime()
    const second = setup({ route: `/report/money-flow-transfer?startDate=${start}&endDate=${end}` })
    await second.settle()
    expect(lastInput(second.calls)).toEqual({ startDate: start, endDate: end })
  })

  it('每日一列與合計（匯款不加總、累計結存 N/A）；匯出同一組數字', async () => {
    const { settle } = setup()
    await settle()
    expect(bodyRows()).toEqual([
      ['2026/10/20', '12,000', '500', '200', '10,000', '2,300', '2,300'],
      ['2026/10/21', '8,000', '0', '1,000', '0', '7,000', '9,300'],
      ['合計', '20,000', '500', '1,200', '', '9,300', 'N/A'],
    ])
    const csv = exportedCsv()
    expect(csv).toContain('"2026/10/20","12000","500","200","10000","2300","2300"')
    expect(csv).toContain('"合計","20000","500","1200","","9300","N/A"')
  })

  it('查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: {}, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('合計')).toBeInTheDocument()
  })
})
