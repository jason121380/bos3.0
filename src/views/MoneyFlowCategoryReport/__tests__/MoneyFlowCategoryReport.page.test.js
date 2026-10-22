// 保護「收支分類明細表」：
// - 預設查本月 1 日 00:00 到現在（台灣時間）；快速選擇、網址帶的日期改查該區間
// - 每個分類的明細列（收入／支出為 0 時留白、四捨五入到小數 2 位）後面接一列「小結」：有收入合計顯示在收入欄，否則支出合計顯示在支出欄
// - 合計列為全區間收入／支出合計（小數 2 位）；匯出 CSV 含明細、各分類小結與合計，日期以台灣時間
// - 查詢結果唯讀：加「小結」列時不改到查詢結果；查詢失敗不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import MoneyFlowCategoryReport from '..'

jest.setTimeout(20000)

const D1 = Date.UTC(2026, 9, 19, 16, 30) // 台灣 2026/10/20 00:30
const D2 = Date.UTC(2026, 9, 20, 17, 0) // 台灣 2026/10/21 01:00
const flow = extra => ({ date: D1, subjectNo: '', subjectName: '', revenue: 0, expenditure: 0, remark: '', ...extra })
const REPORT = {
  revenueSummary: 5000.555,
  expenditureSummary: 300.333,
  moneyFlowCategoryReport: [
    {
      revenueSummary: 5000,
      expenditureSummary: 0,
      moneyFlow: [
        flow({ subjectNo: '4101', subjectName: '學費收入', revenue: 3000.555, remark: '十月' }),
        flow({ date: D2, subjectNo: '4101', subjectName: '學費收入', revenue: 2000 }),
      ],
    },
    {
      revenueSummary: 0,
      expenditureSummary: 300,
      moneyFlow: [flow({ date: D2, subjectNo: '5201', subjectName: '水電費', expenditure: 300 })],
    },
  ],
}
const setup = (options = {}) =>
  renderPage(<MoneyFlowCategoryReport />, {
    fixtures: { GET_MONEY_FLOW_CATEGORY_REPORT: { moneyFlowCategoryReport: REPORT } },
    route: '/report/money-flow-category',
    ...options,
  })
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
const lastInput = calls => {
  const list = callsOf(calls, 'GET_MONEY_FLOW_CATEGORY_REPORT')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('收支分類明細表', () => {
  it('預設查本月 1 日到現在；快速選擇「前天」改查前天整天；網址帶的日期直接查詢', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_MONEY_FLOW_CATEGORY_REPORT')[0].variables.input
    expect(first.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(first.endDate).toBeGreaterThanOrEqual(before)
    pickQuickDate('前天')
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfDay(subDays(new Date(), 2)).getTime(),
        endDate: endOfDay(subDays(new Date(), 2)).getTime(),
      })
    )
    cleanup()
    const start = new Date(2026, 9, 1).getTime()
    const end = new Date(2026, 9, 15, 23, 59, 59, 999).getTime()
    const second = setup({ route: `/report/money-flow-category?startDate=${start}&endDate=${end}` })
    await second.settle()
    expect(lastInput(second.calls)).toEqual({ startDate: start, endDate: end })
  })

  it('明細列、各分類小結與合計；匯出含小結與合計', async () => {
    const { settle } = setup()
    await settle()
    expect(bodyRows()).toEqual([
      ['2026/10/20', '4101', '學費收入', '3,000.56', '', '十月'],
      ['2026/10/21', '4101', '學費收入', '2,000', '', ''],
      ['', '', '小結', '5,000', '', ''],
      ['2026/10/21', '5201', '水電費', '', '300', ''],
      ['', '', '小結', '', '300', ''],
      ['合計', '', '', '5,000.56', '300.33', ''],
    ])
    expect(document.querySelectorAll('tr.moneyFlowCatReportSubtotal')).toHaveLength(2)
    const csv = exportedCsv()
    expect(csv).toContain('"2026/10/20","4101","學費收入","3000.555","","十月"')
    expect(csv).toContain('"","","小結","5000","",""')
    expect(csv).toContain('"2026/10/21","5201","水電費","","300",""')
    expect(csv).toContain('"","","小結","","300",""')
    expect(csv).toContain('"合計","","","5000.56","300.33",""')
  })

  it('查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: {}, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(within(document.querySelector('tbody')).getByText('合計')).toBeInTheDocument()
  })
})
