// 保護「每日收支明細(已日結)」：
// - 預設查本月 1 日 00:00 到現在（台灣時間）；網址帶的日期改查該區間；表頭依區間逐日列出「MM/dd(星期)」
// - 收入科目顯示原值；支出科目以負數顯示（-金額），該列合計與「支出合計」的合計欄也是負數（與逐日格同號，Jason 2026/10/22 報表規則：合計與明細不符直接修）
// - 收入合計、支出合計、結餘合計（收入－支出）逐日與區間合計；匯出 CSV 與畫面同號
// - 「會員卡消費」科目：區間內有金額或啟用會員卡才顯示
// - 沒有資料、查詢失敗、後端回 null 都不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { startOfMonth } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv } from '../../__tests__/stockKit.test'
import MoneyFlowDailyReport from '..'

jest.setTimeout(20000)

const START = new Date(2026, 9, 19).getTime() // 2026/10/19（一）00:00 台灣時間
const END = new Date(2026, 9, 25, 23, 59, 59, 999).getTime() // 2026/10/25（日）
const ROUTE = `/report/money-flow-daily?startDate=${START}&endDate=${END}`
const prices = list => list.map((price, i) => ({ date: START + i * 86400000, price }))
const ITEMS = [
  { itemName: '服務收入', itemNo: '4100', type: 'REVENUE', moneyFlowRecord: prices([1000, 0, 0, 0, 0, 0, 500]) },
  { itemName: '會員卡消費', itemNo: '4200', type: 'REVENUE', moneyFlowRecord: prices([0, 0, 0, 0, 0, 0, 0]) },
  { itemName: '水電費', itemNo: '5100', type: 'EXPENDITURE', moneyFlowRecord: prices([100, 0, 200, 0, 0, 0, 0]) },
]
const setup = ({ items = ITEMS, active = false, ...options } = {}) =>
  renderPage(<MoneyFlowDailyReport />, {
    fixtures: {
      GET_MONEY_FLOW__REPORT: { moneyFlowDailyReport: items },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
    },
    route: ROUTE,
    ...options,
  })
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const rowOf = text => [...screen.getByText(text).closest('tr').querySelectorAll('td')].map(td => td.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('每日收支明細(已日結)', () => {
  it('預設查本月 1 日到現在', async () => {
    const before = Date.now()
    const { calls, settle } = setup({ route: '/report/money-flow-daily' })
    await settle()
    const input = callsOf(calls, 'GET_MONEY_FLOW__REPORT')[0].variables.input
    expect(input.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(input.endDate).toBeGreaterThanOrEqual(before)
    expect(input.endDate).toBeLessThanOrEqual(Date.now())
  })

  it('網址帶的區間：表頭逐日列出星期；收入原值、支出負數，列合計與支出合計同號；三列合計', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_MONEY_FLOW__REPORT').pop().variables.input).toEqual({ startDate: START, endDate: END })
    expect(headers()).toEqual(['科目', '10/19(一)', '10/20(二)', '10/21(三)', '10/22(四)', '10/23(五)', '10/24(六)', '10/25(日)', '合計'])
    expect(rowOf('服務收入')).toEqual(['服務收入', '1,000', '0', '0', '0', '0', '0', '500', '1,500'])
    expect(rowOf('水電費')).toEqual(['水電費', '-100', '0', '-200', '0', '0', '0', '0', '-300'])
    // 會員卡未啟用且區間內沒有金額：不顯示
    expect(screen.queryByText('會員卡消費')).toBeNull()
    expect(rowOf('收入合計:')).toEqual(['收入合計:', '1,000', '0', '0', '0', '0', '0', '500', '1,500'])
    expect(rowOf('支出合計:')).toEqual(['支出合計:', '-100', '0', '-200', '0', '0', '0', '0', '-300'])
    expect(rowOf('結餘合計:')).toEqual(['結餘合計:', '900', '0', '-200', '0', '0', '0', '500', '1,200'])
  })

  it('匯出 CSV 與畫面同號（支出為負）', async () => {
    const { settle } = setup()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"科目","10/19(一)","10/20(二)","10/21(三)","10/22(四)","10/23(五)","10/24(六)","10/25(日)","合計"')
    expect(csv).toContain('"服務收入","1000","0","0","0","0","0","500","1500"')
    expect(csv).toContain('"水電費","-100","0","-200","0","0","0","0","-300"')
    expect(csv).toContain('"收入合計:","1000","0","0","0","0","0","500","1500"')
    expect(csv).toContain('"支出合計:","-100","0","-200","0","0","0","0","-300"')
    expect(csv).toContain('"結餘合計:","900","0","-200","0","0","0","500","1200"')
    expect(csv).not.toContain('會員卡消費')
  })

  it('會員卡消費：啟用會員卡時顯示；區間內有金額時也顯示', async () => {
    const first = setup({ active: true })
    await first.settle()
    expect(rowOf('會員卡消費')).toEqual(['會員卡消費', '0', '0', '0', '0', '0', '0', '0', '0'])
    expect(exportedCsv()).toContain('"會員卡消費","0","0"')
    cleanup()
    const items = ITEMS.map(item => (item.itemName === '會員卡消費' ? { ...item, moneyFlowRecord: prices([0, 300, 0, 0, 0, 0, 0]) } : item))
    const second = setup({ items })
    await second.settle()
    expect(rowOf('會員卡消費')).toEqual(['會員卡消費', '0', '300', '0', '0', '0', '0', '0', '300'])
    expect(rowOf('收入合計:')[2]).toBe('300')
  })

  it('沒有會員卡科目時其餘科目照常顯示', async () => {
    const { settle } = setup({ items: ITEMS.filter(item => item.itemName !== '會員卡消費') })
    await settle()
    expect(rowOf('服務收入')[8]).toBe('1,500')
  })

  it('沒有資料時只有三列合計（合計 0）；後端回 null、查詢失敗都不整頁錯誤', async () => {
    const empty = setup({ items: [] })
    await empty.settle()
    expect(rowOf('收入合計:')).toEqual(['收入合計:', '0'])
    cleanup()
    const nullReport = setup({ items: null })
    await nullReport.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rowOf('結餘合計:')).toEqual(['結餘合計:', '0'])
    cleanup()
    const failed = setup({ fixtures: {}, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('每日收支明細(已日結)')).toBeInTheDocument()
  })
})
