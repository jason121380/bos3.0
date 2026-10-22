// 保護「店家區間累計表」：
// - 預設以「現在」查（起訖相同）；網址帶的區間改查該區間（台灣時間）；支付方式明細（營業儀表板查詢）目前只帶起日——鎖住現況，已知缺口（待 Jason 決定）
// - 區間累積表：一般顯示服務、店販、卡券使用、卡券販賣(入業績)分開；「服務與卡券合併」時改為服務總業績＝服務＋卡券使用＋卡券販賣(入業績)；
//   會員卡欄在區間內有會員卡金額或啟用會員卡時顯示；金額四捨五入加千分位
// - 分類表：只列有數字的分類；合計列的平均項次單價＝業績收入÷客項次、單均價＝業績收入÷客次，除數為 0 時顯示 0（不顯示 NaN／Infinity）
// - 客數表、收支表（科目金額小數 2 位、營業現金結存、合計、區間累計現金結存、非現場現金收支）
// - 「非現金明細」設定開啟時，其他支付方式與第三方卡券依名稱合併成一張表（小計、合計）＋入金儲值明細
// - 報表為 null、支付方式查詢失敗都不整頁錯誤（Jason 2026/10/22）；列印呼叫瀏覽器列印
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES, DASHBOARD, dailyReport, tableRows, tableWith } from '../../__tests__/merchantReportKit.test'
import MerchantBusinessIntervalReport from '..'

jest.setTimeout(20000)

const START = new Date(2026, 9, 1).getTime()
const END = new Date(2026, 9, 21, 23, 59, 59, 999).getTime()
const ROUTE = `/report/merchant-interval?startDate=${START}&endDate=${END}`

const setup = ({ report = dailyReport(), merged = false, active = false, nonCash = false, dashboard = DASHBOARD, ...options } = {}) =>
  renderPage(<MerchantBusinessIntervalReport />, {
    fixtures: {
      FETCH_MERCHANT_DAILY_REPORTV3: { merchantDailyReportV2: report },
      FETCH_MERCHNAT_DASHBOARD: { merchantDashboard: dashboard },
      GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isServiceTicketMerged: merged } },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
      GET_NONCASH_DISPLAY: { getParameterReportSetting: { nonCashDisplay: nonCash } },
    },
    route: ROUTE,
    ...options,
  })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('店家區間累計表', () => {
  it('預設以現在查詢；網址帶的區間查日報；支付方式明細只帶起日（已知缺口，待 Jason 決定）', async () => {
    const before = Date.now()
    const first = setup({ route: '/report/merchant-interval' })
    await first.settle()
    const input = callsOf(first.calls, 'FETCH_MERCHANT_DAILY_REPORTV3')[0].variables.input
    expect(input.startDate).toBe(input.endDate)
    expect(input.startDate).toBeGreaterThanOrEqual(before)
    cleanup()
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_MERCHANT_DAILY_REPORTV3').pop().variables.input).toEqual({ startDate: START, endDate: END })
    expect(callsOf(calls, 'FETCH_MERCHNAT_DASHBOARD').pop().variables.input).toEqual({ startDate: START, endDate: START })
    // 列印標頭（列印範本）帶店名與區間
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店   2026-10-01  - 2026-10-21   店家區間累計表')
  })

  it('區間累積表：一般顯示各項分開、四捨五入加千分位；沒有會員卡金額且未啟用時不顯示會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    const rows = tableRows(tableWith('區間累積'))
    expect(rows[0]).toEqual(['', '服務業績', '店販業績', '卡券使用(入業績)', '卡券販賣(入業績)', '業績收入', '卡券販賣(不入業績)', '卡券使用(-)', '第三方卡券(-)', '其他付款方式(-)', '入金使用(-)', '營業現金應收'])
    expect(rows[1]).toEqual(['區間累積', '10,000', '2,001', '500', '1,500', '14,001', '800', '300', '200', '1,000', '400', '12,101'])
  })

  it('服務與卡券合併：服務總業績＝服務＋卡券使用＋卡券販賣(入業績)；啟用會員卡時顯示會員卡欄', async () => {
    const { settle } = setup({ merged: true, active: true })
    await settle()
    const rows = tableRows(tableWith('區間累積'))
    expect(rows[0].slice(0, 5)).toEqual(['', '服務總業績', '店販業績', '會員卡銷售', '業績收入'])
    expect(rows[1].slice(0, 5)).toEqual(['區間累積', '12,000', '2,001', '0', '14,001'])
  })

  it('服務與卡券合併、未啟用會員卡且沒有會員卡金額時不顯示會員卡欄', async () => {
    const { settle } = setup({ merged: true })
    await settle()
    const rows = tableRows(tableWith('區間累積'))
    expect(rows[0].slice(0, 4)).toEqual(['', '服務總業績', '店販業績', '業績收入'])
    expect(rows[1].slice(0, 4)).toEqual(['區間累積', '12,000', '2,001', '14,001'])
  })

  it('區間內有會員卡金額時，一般顯示也帶會員卡欄', async () => {
    const { settle } = setup({ report: dailyReport({ membership: 1234.5 }) })
    await settle()
    const rows = tableRows(tableWith('區間累積'))
    expect(rows[0].slice(0, 5)).toEqual(['', '服務業績', '店販業績', '會員卡銷售', '卡券使用(入業績)'])
    expect(rows[1][3]).toBe('1,235')
  })

  it('分類表只列有數字的分類，合計列：客項次加總、平均項次單價＝業績÷客項次、單均價＝業績÷客次', async () => {
    const { settle } = setup()
    await settle()
    const rows = tableRows(tableWith('服務歸屬'))
    expect(rows).toEqual([
      ['服務歸屬', '類別總業績', '客次(人次)', '指定/不指定', '客項次', '平均項次單價', '單均價(客次價)'],
      ['剪髮', '6,000', '6', '4/2', '7', '857', '1,000'],
      ['染髮', '8,001', '4', '2/2', '4', '2,000', '2,000'],
      ['合計', '14,001', '10', '6/4', '11', '1,273', '1,400'],
    ])
  })

  it('客項次或客次為 0 時，平均項次單價與單均價顯示 0（不是 NaN／Infinity）', async () => {
    const categories = [{ ...CATEGORIES[0], orderTypeCount: 0 }]
    const { settle } = setup({ report: dailyReport({ categoryPerformance: categories, orderCount: 0 }) })
    await settle()
    const total = tableRows(tableWith('服務歸屬')).pop()
    expect(total).toEqual(['合計', '14,001', '0', '6/4', '0', '0', '0'])
  })

  it('沒有任何分類數字時顯示「無資料」', async () => {
    const { settle } = setup({ report: dailyReport({ categoryPerformance: [CATEGORIES[2]] }) })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    expect(tableWith('服務歸屬')).toBeUndefined()
  })

  it('客數表與收支表', async () => {
    const { settle } = setup()
    await settle()
    expect(tableRows(tableWith('總客數'))[1]).toEqual(['區間累積', '10', '6/4', '3/6/1', '3,000', '400', '2,300', '800'])
    expect(tableRows(tableWith('科目編號')).slice(1)).toEqual([
      ['G1', '營業收入', '12,101.23', '0', ''],
      ['', '營業現金結存:12,101', '', '', ''],
      ['4101', '學費', '500', '0', '十月'],
      ['5101', '水電', '0', '300.56', ''],
      ['', '合計', '12,601', '301', ''],
      ['', '區間累計現金結存:12,301', '', '', ''],
      ['', '非現場現金收支：', '', '', ''],
      ['6101', '匯款', '0', '10,000', ''],
    ])
  })

  it('沒有非現場現金收支時不顯示該標題', async () => {
    const { settle } = setup({ report: dailyReport({}, { moneyFlowNotCash: [] }) })
    await settle()
    expect(screen.queryByText('非現場現金收支：')).toBeNull()
  })

  it('非現金明細設定開啟：其他支付方式與第三方卡券依名稱合併、小計與合計；入金儲值明細', async () => {
    const { settle } = setup({ nonCash: true })
    await settle()
    expect(tableRows(tableWith('第三方卡券明細'))).toEqual([
      ['', '其他支付方式明細', '第三方卡券明細', '小計'],
      ['LINE Pay', '1500 / (1200)', '100 / (0)', '1600 / (1200)'],
      ['街口', '300 / (300)', '0 / (0)', '300 / (300)'],
      ['旅遊券', '0 / (0)', '200 / (200)', '200 / (200)'],
      ['', '合計', '2100 / 1700'],
    ])
    expect(screen.getByText('入金儲值明細')).toBeInTheDocument()
    expect(tableRows([...document.querySelectorAll('table')].pop())).toEqual([['現金', '3,000', '(0)']])
  })

  it('非現金明細設定關閉時不顯示合併表', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByText('入金儲值明細')).toBeNull()
  })

  it('列印呼叫瀏覽器列印', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
  })

  it('報表為 null 不顯示內容；支付方式查詢失敗不整頁錯誤', async () => {
    const empty = setup({ report: null })
    await empty.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByText('區間累積')).toBeNull()
    cleanup()
    const { settle } = renderPage(<MerchantBusinessIntervalReport />, {
      fixtures: {
        FETCH_MERCHANT_DAILY_REPORTV3: { merchantDailyReportV2: dailyReport() },
        FETCH_MERCHNAT_DASHBOARD: new Error('支付方式查詢失敗'),
        GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isServiceTicketMerged: false } },
        GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
        GET_NONCASH_DISPLAY: { getParameterReportSetting: { nonCashDisplay: true } },
      },
      route: ROUTE,
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('區間累積').length).toBeGreaterThan(0)
    expect(tableRows(tableWith('第三方卡券明細'))).toEqual([['', '其他支付方式明細', '第三方卡券明細', '小計'], ['', '合計', '0 / 0']])
  })
})
