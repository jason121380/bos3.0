// 保護「店家日報表」：
// - 預設查今天；只選一天：當日（起訖同一時間點）、月初到當日、支付方式（營業儀表板）三支查詢；快速選擇與網址帶的日期改查該日（台灣時間）
// - 營業表：第一列當日、第二列「月初 - 當日」；「服務與卡券合併」時改為營業總業績；當日或月累計有會員卡金額、或啟用會員卡時顯示會員卡欄
// - 分類表：月累計有數字的分類，當日數字以「分類名稱完全相同」對應（不可把「護髮療程」對到「護髮」）；合計列
//   平均項次單價(累積)、單均價(累積)目前為各分類平均相加——鎖住現況，已知缺口（待 Jason 決定）
// - 客數表、收支表（科目小數 2 位、營業現金結存、合計、當日現金結存、材料自購與其合計、含自購結存＝當日結存＋自購收入、非現場現金收支）
// - 下方明細卡：非現金明細設定開啟時合併表，否則其他支付方式／第三方卡券兩張卡；入金儲值明細
// - 當日查詢失敗或為 null、支付方式查詢失敗都不整頁錯誤（Jason 2026/10/22）；列印呼叫瀏覽器列印
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { DASHBOARD, dailyReport, tableRows, tableWith } from '../../__tests__/merchantReportKit.test'
import MerchantDailyReport from '..'

jest.setTimeout(20000)

const DAY = new Date(2026, 9, 21).getTime() // 台灣 2026/10/21 00:00
const ROUTE = `/report/merchant-daily?startDate=${DAY}&endDate=${DAY}`
const category = (name, performance, totalCount, designationCount, nonDesignationCount, orderTypeCount, orderTypeAveragePerformance, averagePerformance) => ({
  name, performance, totalCount, designationCount, nonDesignationCount, orderTypeCount, orderTypeAveragePerformance, averagePerformance,
})
const MONTH = dailyReport(
  {
    service: 40000,
    product: 5000.4,
    usedTicket: 1000,
    ticketSellIntoPerformance: 2000,
    performanceIncome: 40000,
    orderCount: 30,
    orderDesignateCount: 17,
    orderNonDesignateCount: 13,
    categoryPerformance: [
      category('護髮療程', 30000, 20, 12, 8, 25, 1200, 1500),
      category('護髮', 10000, 10, 5, 5, 10, 1000, 1000),
      category('燙髮', 0, 0, 0, 0, 0, 0, 0),
    ],
  },
  { orderTotalCount: 30, orderDesignateCount: 17, orderNonDesignateCount: 13, orderMaleCount: 10, orderFemaleCount: 18, orderUnknownCount: 2 }
)
const TODAY = dailyReport(
  {
    service: 1500,
    product: 300.4,
    usedTicket: 0,
    ticketSellIntoPerformance: 0,
    performanceIncome: 1500,
    ticketSellNotIntoPerformance: 0,
    businessCash: 1800,
    orderCount: 2,
    orderDesignateCount: 1,
    orderNonDesignateCount: 1,
    categoryPerformance: [category('護髮療程', 1000, 1, 1, 0, 1, 1000, 1000), category('護髮', 500, 1, 0, 1, 1, 500, 500)],
  },
  {
    pickingRecord: [
      { productNumber: 'P1', productName: '洗髮精', cashRevenue: 300, cashExpenditure: 0, remark: '自購' },
      { productNumber: 'P2', productName: '護髮油', cashRevenue: 0, cashExpenditure: 150.5, remark: '' },
    ],
    cashBalance: 1200,
    businessCash: 1800,
    summaryRevenue: 2300,
    summaryExpenditure: 300.555,
    orderTotalCount: 2,
    orderDesignateCount: 1,
    orderNonDesignateCount: 1,
    orderMaleCount: 0,
    orderFemaleCount: 2,
    orderUnknownCount: 0,
  }
)
// 以既有報表為底，改 currentDay 的部分欄位
const withDay = (report, currentDay) => ({ ...report, currentDay: { ...report.currentDay, ...currentDay } })
const isDay = variables => variables.input.startDate === variables.input.endDate

const fixtures = ({ today = TODAY, month = MONTH, merged = false, active = false, nonCash = false, dashboard = DASHBOARD } = {}) => ({
  FETCH_MERCHANT_DAILY_REPORTV3: variables => {
    const report = isDay(variables) ? today : month
    return report instanceof Error ? report : { merchantDailyReportV2: report }
  },
  FETCH_MERCHNAT_DASHBOARD: dashboard instanceof Error ? dashboard : { merchantDashboard: dashboard },
  GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isServiceTicketMerged: merged } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
  GET_NONCASH_DISPLAY: { getParameterReportSetting: { nonCashDisplay: nonCash } },
})
const setup = ({ route = ROUTE, ...options } = {}) => renderPage(<MerchantDailyReport />, { fixtures: fixtures(options), route })
const reportInputs = calls => {
  const list = callsOf(calls, 'FETCH_MERCHANT_DAILY_REPORTV3').map(c => c.variables.input)
  return { day: list.filter(i => i.startDate === i.endDate).pop(), month: list.filter(i => i.startDate !== i.endDate).pop() }
}
// 明細卡：從卡片標題往上找到含表格的卡片
const cardRows = title => {
  let el = screen.getByText(title)
  while (!el.querySelector('table')) el = el.parentElement
  return tableRows(el.querySelector('table'))
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('店家日報表', () => {
  it('預設查今天；快速選擇「昨天」改查昨天：當日、月初到當日、支付方式三支查詢', async () => {
    const before = Date.now()
    const { calls, settle } = setup({ route: '/report/merchant-daily' })
    await settle()
    const first = callsOf(calls, 'FETCH_MERCHNAT_DASHBOARD')[0].variables.input
    expect(first.startDate).toBe(first.endDate)
    expect(first.startDate).toBeGreaterThanOrEqual(before)
    pickQuickDate('昨天')
    const yesterday = startOfDay(subDays(new Date(), 1)).getTime()
    await wait(() => expect(reportInputs(calls).day).toEqual({ startDate: yesterday, endDate: yesterday }))
    expect(reportInputs(calls).month).toEqual({ startDate: startOfMonth(yesterday).getTime(), endDate: yesterday })
    expect(callsOf(calls, 'FETCH_MERCHNAT_DASHBOARD').pop().variables.input).toEqual({ startDate: yesterday, endDate: yesterday })
  })

  it('網址帶的日期：查該日與月初到該日；列印標頭帶店名與日期', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(reportInputs(calls)).toEqual({
      day: { startDate: DAY, endDate: DAY },
      month: { startDate: new Date(2026, 9, 1).getTime(), endDate: DAY },
    })
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店   2026-10-21   店家日報表')
  })

  it('營業表：當日與月累計兩列，四捨五入加千分位；沒有會員卡金額且未啟用時不顯示會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    const rows = tableRows(tableWith('營業現金應收'))
    expect(rows[0].slice(0, 5)).toEqual(['', '服務業績', '店販業績', '卡券使用(入業績)', '卡券販賣(入業績)'])
    expect(rows[1]).toEqual(['10/21', '1,500', '300', '0', '0', '1,500', '0', '300', '200', '1,000', '400', '1,800'])
    expect(rows[2]).toEqual(['10/01 - 10/21', '40,000', '5,000', '1,000', '2,000', '40,000', '800', '300', '200', '1,000', '400', '12,101'])
  })

  it('服務與卡券合併時顯示營業總業績；啟用會員卡時顯示會員卡欄', async () => {
    const { settle } = setup({ merged: true, active: true })
    await settle()
    const rows = tableRows(tableWith('營業現金應收'))
    expect(rows[0].slice(0, 5)).toEqual(['', '營業總業績', '店販業績', '會員卡銷售', '業績收入'])
    expect(rows[1].slice(0, 5)).toEqual(['10/21', '1,500', '300', '0', '1,500'])
    expect(rows[2].slice(0, 5)).toEqual(['10/01 - 10/21', '43,000', '5,000', '0', '40,000'])
  })

  it('服務與卡券合併、未啟用會員卡且沒有會員卡金額時不顯示會員卡欄', async () => {
    const { settle } = setup({ merged: true })
    await settle()
    const rows = tableRows(tableWith('營業現金應收'))
    expect(rows[0].slice(0, 4)).toEqual(['', '營業總業績', '店販業績', '業績收入'])
    expect(rows[2].slice(0, 4)).toEqual(['10/01 - 10/21', '43,000', '5,000', '40,000'])
  })

  it('當日或月累計有會員卡金額時，一般顯示也帶會員卡欄', async () => {
    const { settle } = setup({ today: withDay(TODAY, { membership: 800.6 }) })
    await settle()
    const rows = tableRows(tableWith('營業現金應收'))
    expect(rows[0][3]).toBe('會員卡銷售')
    expect(rows[1][3]).toBe('801')
    cleanup()
    const second = setup({ month: withDay(MONTH, { membership: 2000 }) })
    await second.settle()
    expect(tableRows(tableWith('營業現金應收'))[2][3]).toBe('2,000')
  })

  it('分類表：當日數字以分類名稱完全相同對應；合計列（累積的平均為各分類平均相加，已知缺口）', async () => {
    const { settle } = setup()
    await settle()
    const rows = tableRows(tableWith('類別總業績(累積)'))
    expect(rows.slice(1)).toEqual([
      ['護髮療程', '1,000', '1', '1/0', '1', '1,000', '1,000', '30,000', '20', '12/8', '25', '1,200', '1,500'],
      ['護髮', '500', '1', '0/1', '1', '500', '500', '10,000', '10', '5/5', '10', '1,000', '1,000'],
      ['合計', '1,500', '2', '1/1', '2', '750', '750', '40,000', '30', '17/13', '35', '2,200', '2,500'],
    ])
  })

  it('當日沒有該分類時當日欄為 0；當日客項次與客次為 0 時平均顯示 0（不是 NaN／Infinity）', async () => {
    const today = withDay(TODAY, { performanceIncome: 0, orderCount: 0, categoryPerformance: [] })
    const { settle } = setup({ today })
    await settle()
    const rows = tableRows(tableWith('類別總業績(累積)'))
    expect(rows[1].slice(0, 7)).toEqual(['護髮療程', '0', '0', '0/0', '0', '0', '0'])
    expect(rows[3].slice(0, 7)).toEqual(['合計', '0', '0', '1/1', '0', '0', '0'])
    cleanup()
    // 業績大於 0、次數為 0：顯示 0（不是 Infinity）
    const second = setup({ today: withDay(TODAY, { orderCount: 0, categoryPerformance: [] }) })
    await second.settle()
    expect(tableRows(tableWith('類別總業績(累積)'))[3].slice(0, 7)).toEqual(['合計', '1,500', '0', '1/1', '0', '0', '0'])
  })

  it('月累計沒有任何分類數字時顯示「無資料」', async () => {
    const { settle } = setup({ month: withDay(MONTH, { categoryPerformance: [MONTH.currentDay.categoryPerformance[2]] }) })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('客數表與收支表（材料自購、含自購的當日現金結存、非現場現金收支）', async () => {
    const { settle } = setup()
    await settle()
    expect(tableRows(tableWith('總客數')).slice(1)).toEqual([
      ['10/21', '2', '1/1', '0/2/0', '3,000', '400', '2,300', '800'],
      ['10/01 - 10/21', '30', '17/13', '10/18/2', '3,000', '400', '2,300', '800'],
    ])
    expect(tableRows(tableWith('科目編號')).slice(1)).toEqual([
      ['G1', '營業收入', '12,101.23', '0', ''],
      ['', '營業現金結存:1,800', '', '', ''],
      ['4101', '學費', '500', '0', '十月'],
      ['5101', '水電', '0', '300.56', ''],
      ['', '合計', '2,300', '301', ''],
      ['', '當日現金結存:1,200', '', '', ''],
      ['P1', '洗髮精', '300', '0', '自購'],
      ['P2', '護髮油', '0', '150.5', ''],
      ['', '合計', '300', '151', ''],
      ['', '當日現金結存（含自購）:1,500', '', '', ''],
      ['', '非現場現金收支：', '', '', ''],
      ['6101', '匯款', '0', '10,000', ''],
    ])
  })

  it('沒有非現場現金收支時不顯示該標題', async () => {
    const { settle } = setup({ today: { ...TODAY, moneyFlowNotCash: [] } })
    await settle()
    expect(screen.queryByText('非現場現金收支：')).toBeNull()
  })

  it('明細卡：其他支付方式、第三方卡券、入金儲值分開列出', async () => {
    const { settle } = setup()
    await settle()
    expect(cardRows('其他支付方式明細')).toEqual([['LINE Pay', '1500', '(1200)'], ['街口', '300', '(300)']])
    expect(cardRows('第三方卡券明細')).toEqual([['旅遊券', '200', '(200)'], ['LINE Pay', '100', '(0)']])
    expect(cardRows('入金儲值明細')).toEqual([['現金', '3000', '(0)']])
  })

  it('非現金明細設定開啟：依名稱合併其他支付方式與第三方卡券，小計與合計', async () => {
    const { settle } = setup({ nonCash: true })
    await settle()
    expect(tableRows(tableWith('小計'))).toEqual([
      ['', '其他支付方式明細', '第三方卡券明細', '小計'],
      ['LINE Pay', '1500 / (1200)', '100 / (0)', '1600 / (1200)'],
      ['街口', '300 / (300)', '0 / (0)', '300 / (300)'],
      ['旅遊券', '0 / (0)', '200 / (200)', '200 / (200)'],
      ['', '合計', '2100 / 1700'],
    ])
    expect(cardRows('入金儲值明細')).toEqual([['現金', '3000', '(0)']])
  })

  it('列印呼叫瀏覽器列印', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
  })

  it('當日查詢失敗或為 null、月累計為 null、支付方式查詢失敗都不整頁錯誤', async () => {
    const failedDay = setup({ today: new Error('當日查詢失敗') })
    await failedDay.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(tableWith('營業現金應收')).toBeUndefined()
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
    cleanup()
    const nullDay = setup({ today: null })
    await nullDay.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(tableWith('營業現金應收')).toBeUndefined()
    cleanup()
    const nullMonth = setup({ month: null })
    await nullMonth.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(tableWith('營業現金應收')).toBeUndefined()
    cleanup()
    const failedDashboard = setup({ dashboard: new Error('支付方式查詢失敗') })
    await failedDashboard.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(cardRows('其他支付方式明細')).toEqual([])
    expect(cardRows('入金儲值明細')).toEqual([])
  })
})
