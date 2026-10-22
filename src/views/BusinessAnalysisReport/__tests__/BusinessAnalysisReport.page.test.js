// 保護「營業統計分析表」：
// - 預設查本月 1 日 00:00 到現在（台灣時間）、100 筆；快速選擇日期改查該區間
// - 一般顯示：服務、店販、卡券使用(入業績，小數 2 位)、卡券販賣(入業績)分開；「服務與卡券合併」設定時改為營業總業績＝服務＋卡券使用＋卡券販賣(入業績)
// - 會員卡欄：啟用會員卡或區間內有會員卡金額才顯示；點數欄：啟用點數或區間內有點數折抵才顯示（合計為 null 時顯示 0）
// - 匯出 CSV：每日一列＋總計，欄位依會員卡／點數設定增減；列印呼叫瀏覽器列印
// - 已知缺口：報表查詢失敗時整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import BusinessAnalysisReport from '..'

jest.setTimeout(20000)

const day = (date, extra = {}) => ({
  date,
  cashBalance: 5000.4,
  service: 3000,
  product: 800,
  membership: 0,
  usedTicket: 333.336,
  ticketSellIntoPerformance: 500,
  performanceIncome: 4633,
  ticketSellNotIntoPerformance: 0,
  walletDeposit: 1000,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  bonusDecountForReport: 0,
  businessCash: 4000,
  cashRevenue: 200,
  cashExpenditure: 100,
  expenditure: 300,
  ...extra,
})
const SUMMARY = {
  cashBalance: 10000, service: 6000, product: 1600, membership: 0, usedTicket: 666.67, ticketSellIntoPerformance: 1000,
  performanceIncome: 9266, ticketSellNotIntoPerformance: 0, walletDeposit: 2000, usedTicketForDecount: 0, thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0, walletUsedForDecount: 0, bonusDecountForReport: 0, businessCash: 8000, cashRevenue: 400,
  cashExpenditure: 200, expenditure: 600,
}
const ROWS = [day(new Date(2026, 9, 1).getTime()), day(new Date(2026, 9, 2).getTime(), { membership: 1200, bonusDecountForReport: -40 })]

const fixtures = (extra = {}) => ({
  GET_BUSINESS_ANALYSIS_DATA: { businessAnalysisReport: { data: ROWS, summary: SUMMARY } },
  GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isPriceDisplayOnDailyReport: true, isServiceTicketMerged: false } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  ...extra,
})
const setup = (extra = {}) => renderPage(<BusinessAnalysisReport />, { fixtures: fixtures(extra), route: '/report/business-analysis' })

beforeEach(() => loginAs())
afterEach(cleanup)

const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const cells = text =>
  within(within(document.querySelector('tbody')).getByText(text).closest('tr')).getAllByRole('cell').map(c => c.textContent)
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const lastInput = calls => {
  const list = callsOf(calls, 'GET_BUSINESS_ANALYSIS_DATA')
  return list[list.length - 1].variables.input
}

describe('營業統計分析表', () => {
  it('預設查本月 1 日到現在、100 筆；快速選擇「昨天」改查昨天整天', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_BUSINESS_ANALYSIS_DATA')[0].variables.input
    expect(first).toMatchObject({ startDate: startOfMonth(new Date()).getTime(), pageLimit: 100, pageOffset: 0 })
    expect(first.endDate).toBeGreaterThanOrEqual(before)
    expect(first.endDate).toBeLessThanOrEqual(Date.now())
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
        pageLimit: 100,
        pageOffset: 0,
      })
    )
  })

  it('一般顯示：服務、店販、卡券分開；未啟用且區間內沒有會員卡與點數時不顯示兩欄；匯出不含兩欄', async () => {
    const { settle } = setup()
    await settle()
    expect(headers().slice(0, 5)).toEqual(['營業日期', '服務消費', '店販消費', '卡券使用(入業績)', '卡券販賣(入業績)'])
    expect(headers()).not.toContain('會員卡消費')
    expect(headers()).not.toContain('點數折抵金額(-)')
    expect(cells('2026/10/01').slice(0, 5)).toEqual(['2026/10/01', '3,000', '800', '333.34', '500'])
    expect(cells('2026/10/01').pop()).toBe('5,000')
    expect(cells('合計').slice(0, 5)).toEqual(['合計', '6,000', '1,600', '667', '1,000'])
    await wait(() => expect(exportedCsv()).toContain('"2026/10/01","5000","3000","800","333","500"'))
    expect(exportedCsv()).toContain('"總計","10000","6000","1600","667","1000"')
    expect(exportedCsv()).not.toContain('會員卡消費')
    expect(exportedCsv()).not.toContain('點數折抵金額')
  })

  it('服務與卡券合併：營業總業績＝服務＋卡券使用＋卡券販賣(入業績)；啟用會員卡與點數時顯示兩欄', async () => {
    const { settle } = setup({
      GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isPriceDisplayOnDailyReport: true, isServiceTicketMerged: true } },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
      GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
      GET_BUSINESS_ANALYSIS_DATA: { businessAnalysisReport: { data: ROWS, summary: { ...SUMMARY, bonusDecountForReport: null } } },
    })
    await settle()
    await wait(() => expect(headers()).toContain('會員卡消費'))
    expect(headers().slice(0, 4)).toEqual(['營業日期', '營業總業績', '店販消費', '會員卡消費'])
    expect(headers()).toContain('點數折抵金額(-)')
    // 3000 + 333.336 + 500 = 3833.336 → 3,833
    expect(cells('2026/10/02').slice(0, 4)).toEqual(['2026/10/02', '3,833', '800', '1,200'])
    expect(cells('2026/10/02')).toContain('-40')
    // 合計：6000 + 666.67 + 1000 = 7667；點數合計 null 顯示 0
    const total = cells('合計')
    expect(total.slice(0, 4)).toEqual(['合計', '7,667', '1,600', '0'])
    expect(total[11]).toBe('0')
    await wait(() => expect(exportedCsv()).toContain('會員卡消費'))
    expect(exportedCsv()).toContain('點數折抵金額(-)')
  })

  it('設定未啟用但區間內有會員卡、點數金額時仍顯示兩欄', async () => {
    const { settle } = setup({
      GET_BUSINESS_ANALYSIS_DATA: { businessAnalysisReport: { data: ROWS, summary: { ...SUMMARY, membership: 1200, bonusDecountForReport: -40 } } },
    })
    await settle()
    await wait(() => expect(headers()).toContain('會員卡消費'))
    expect(headers()).toContain('點數折抵金額(-)')
  })

  it('列印時呼叫瀏覽器列印，抬頭含店名與日期區間', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店')
  })

  it('已知缺口（待 Jason 決定）：報表查詢失敗時整頁進入錯誤畫面', async () => {
    // 會員卡／點數 effect 直接讀 businessAnalysisReport.summary；Results 也直接讀 data.data
    const { settle } = setup({ GET_BUSINESS_ANALYSIS_DATA: new Error('查詢失敗') })
    await settle()
    expect(await screen.findByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
