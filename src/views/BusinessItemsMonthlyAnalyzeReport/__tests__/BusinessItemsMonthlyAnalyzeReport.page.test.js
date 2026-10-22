// 保護「營業項目月分析表」：
// - 預設查本月 1 日～月底（台灣時間）；快速選擇改查該區間
// - 表頭依服務分類；每月一列「yyyy/M」與各分類「業績 / 次數」、客數、店販收入、總業績、合計收入；合計、指定、不指定、指定比（%）、業績比（%）
// - 報表匯出：以目前區間向後端要檔案網址並下載；列印呼叫瀏覽器列印
// - 查詢失敗或沒有月份資料不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import BusinessItemsMonthlyAnalyzeReport from '..'

jest.setTimeout(20000)

const cats = (cut, perm) => [
  { categoriesName: '剪髮', performance: cut[0], count: cut[1] },
  { categoriesName: '染髮', performance: perm[0], count: perm[1] },
]
const summary = (cut, perm, extra) => ({ serviceCategoriesPerformance: cats(cut, perm), cutomerCount: 0, productPerformance: 0, totalPerformance: 0, totalIncome: 0, ...extra })
const REPORT = {
  businessItemsReportData: [
    { date: Date.UTC(2026, 7, 31, 16, 0), ...summary([12000, 30], [8000, 4], { cutomerCount: 30, productPerformance: 1500, totalPerformance: 20000, totalIncome: 21500 }) }, // 台灣 2026/9/1
    { date: Date.UTC(2026, 8, 30, 16, 0), ...summary([10000, 25], [6000, 3], { cutomerCount: 26, productPerformance: 500, totalPerformance: 16000, totalIncome: 16500 }) }, // 台灣 2026/10/1
  ],
  businessItemsReportDataTotal: summary([22000, 55], [14000, 7], { cutomerCount: 56, productPerformance: 2000, totalPerformance: 36000, totalIncome: 38000 }),
  businessItemsReportDataDesignation: summary([15000, 35], [10000, 5], { cutomerCount: 40, productPerformance: 1200, totalPerformance: 25000, totalIncome: 26200 }),
  businessItemsReportDataNonDesignation: summary([7000, 20], [4000, 2], { cutomerCount: 16, productPerformance: 800, totalPerformance: 11000, totalIncome: 11800 }),
  businessItemsReportDataDesignationProportion: summary([68.18, 63.64], [71.43, 71.43], { cutomerCount: 71.43, productPerformance: 60, totalPerformance: 69.44, totalIncome: 68.95 }),
  businessItemsReportDataPerformanceProportion: summary([61.11, 0], [38.89, 0]),
}
const setup = ({ report = REPORT, ...options } = {}) =>
  renderPage(<BusinessItemsMonthlyAnalyzeReport />, {
    fixtures: {
      GET_BUSINESS_ITEMS_MOTHLY_REPORT: { businessItemsMonthlyReport: report },
      GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL: { businessItemsMonthlyReportExcel: 'https://files.example/items.xlsx' },
    },
    route: '/report/business-items-monthly',
    ...options,
  })
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
const lastInput = calls => callsOf(calls, 'GET_BUSINESS_ITEMS_MOTHLY_REPORT').pop().variables.input

beforeEach(() => loginAs())
afterEach(cleanup)

describe('營業項目月分析表', () => {
  it('預設查本月；快速選擇「上個月」改查上個月', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_BUSINESS_ITEMS_MOTHLY_REPORT')[0].variables.input).toEqual({
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfMonth(new Date()).getTime(),
    })
    pickQuickDate('上個月')
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfMonth(subMonths(new Date(), 1)).getTime(),
        endDate: endOfMonth(subMonths(new Date(), 1)).getTime(),
      })
    )
  })

  it('表頭依服務分類；每月一列與彙總列', async () => {
    const { settle } = setup()
    await settle()
    expect([...document.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['月份', '剪髮', '染髮', '客數', '店販收入', '總業績', '合計收入'])
    expect(bodyRows()).toEqual([
      ['2026/9', '12,000 / 30', '8,000 / 4', '30', '1,500', '20,000', '21,500'],
      ['2026/10', '10,000 / 25', '6,000 / 3', '26', '500', '16,000', '16,500'],
      ['合計', '22,000 / 55', '14,000 / 7', '56', '2,000', '36,000', '38,000'],
      ['指定', '15,000 / 35', '10,000 / 5', '40', '1,200', '25,000', '26,200'],
      ['不指定', '7,000 / 20', '4,000 / 2', '16', '800', '11,000', '11,800'],
      ['指定比', '68.18% / 63.64%', '71.43% / 71.43%', '71.43%', '60%', '69.44%', '68.95%'],
      ['業績比', '61.11%', '38.89%', '-', '-', '-', '-'],
    ])
  })

  it('報表匯出以目前區間要檔案網址並下載；列印呼叫瀏覽器列印', async () => {
    const clicked = []
    jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      clicked.push(this.getAttribute('href'))
    })
    window.print = jest.fn()
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('報表匯出'))
    await settle()
    expect(callsOf(calls, 'GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL').pop().variables).toEqual({
      input: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() },
    })
    expect(clicked).toEqual(['https://files.example/items.xlsx'])
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('營業項目月分析表')
  })

  it('沒有月份資料、查詢失敗都不整頁錯誤', async () => {
    const empty = setup({ report: { ...REPORT, businessItemsReportData: [] } })
    await empty.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect([...document.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['月份', '剪髮', '染髮', '客數', '店販收入', '總業績', '合計收入'])
    cleanup()
    const failed = setup({ fixtures: {}, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('合計')).toBeInTheDocument()
  })
})
