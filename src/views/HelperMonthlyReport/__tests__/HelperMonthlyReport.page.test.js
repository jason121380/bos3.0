// 保護「互助月報表」：
// - 進頁以「現在」為起訖查詢（目前行為，已知缺口：預設區間只有一個時間點，待 Jason 決定是否改成本月）；快速選擇「本月」改查本月 1 日到月底（台灣時間）
// - 每位設計師一列：互助獲得（不含點／點）、店販業績四捨五入到整數，店販抽成取到小數 1 位；合計列＝各列加總
// - 會員卡兩欄：店家啟用會員卡，或區間內有會員卡業績／抽成時才顯示
// - 列印呼叫瀏覽器列印，列印抬頭含店名與日期區間
// - 報表查詢失敗、回傳 null 時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfMonth, startOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { headerTexts, rowCells } from '../../__tests__/staffReportKit.test'
import HelperMonthlyReport from '..'

jest.setTimeout(20000)

const ROWS = [
  { designer: '小美', helperRetrievePriceWithoutPoint: 1234.5, helperRetrievePoint: 12.4, productPerformance: 3000.4, productRake: 300.06, membershipPerformance: 0, membershipRake: 0 },
  { designer: '阿明', helperRetrievePriceWithoutPoint: 100.2, helperRetrievePoint: 3.6, productPerformance: 999.5, productRake: 99.96, membershipPerformance: 0, membershipRake: 0 },
]

const setup = (extra = {}, options = {}) =>
  renderPage(<HelperMonthlyReport />, {
    route: '/helper-monthly-report',
    fixtures: {
      GET_HELPER_MONTHLY_REPORT: { helperMonthlyReport: ROWS },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      ...extra,
    },
    ...options,
  })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('互助月報表', () => {
  it('進頁以現在為起訖查詢；快速選擇本月改查本月 1 日到月底', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const { input } = callsOf(calls, 'GET_HELPER_MONTHLY_REPORT')[0].variables
    expect(input.startDate).toBe(input.endDate)
    expect(input.startDate).toBeGreaterThanOrEqual(before)
    expect(input.startDate).toBeLessThanOrEqual(Date.now())
    pickQuickDate('本月')
    await wait(() => {
      const list = callsOf(calls, 'GET_HELPER_MONTHLY_REPORT')
      expect(list[list.length - 1].variables.input).toEqual({
        startDate: startOfMonth(new Date()).getTime(),
        endDate: endOfMonth(new Date()).getTime(),
      })
    })
  })

  it('各列四捨五入、店販抽成小數 1 位；合計＝各列加總；未啟用會員卡且無會員卡金額時不顯示會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    expect(headerTexts()).toEqual(['設計師', '互助獲得 (不含點)', '互助獲得 (點)', '店販業績', '店販抽成'])
    expect(rowCells('小美')).toEqual(['小美', '1,235', '12', '3,000', '300.1'])
    expect(rowCells('阿明')).toEqual(['阿明', '100', '4', '1,000', '100'])
    // 合計：1334.7→1,335；16→16；3999.9→4,000；400.01→400
    expect(rowCells('合計')).toEqual(['合計', '1,335', '16', '4,000', '400'])
  })

  it('啟用會員卡時顯示會員卡業績與抽成欄（含合計）', async () => {
    const { settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡業績'))
    expect(headerTexts().slice(-2)).toEqual(['會員卡業績', '會員卡抽成'])
    expect(rowCells('合計').slice(-2)).toEqual(['0', '0'])
  })

  it('未啟用會員卡但區間內有會員卡業績或抽成時仍顯示會員卡欄', async () => {
    const rows = [{ ...ROWS[0], membershipPerformance: 2000.4, membershipRake: 0 }, { ...ROWS[1], membershipRake: 20.06 }]
    const { settle } = setup({ GET_HELPER_MONTHLY_REPORT: { helperMonthlyReport: rows } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡抽成'))
    expect(rowCells('小美').slice(-2)).toEqual(['2,000', '0'])
    expect(rowCells('阿明').slice(-2)).toEqual(['0', '20.1'])
    expect(rowCells('合計').slice(-2)).toEqual(['2,000', '20.1'])
  })

  it('只有會員卡抽成（業績為 0）也顯示會員卡欄', async () => {
    const rows = [{ ...ROWS[0], membershipRake: 5 }]
    const { settle } = setup({ GET_HELPER_MONTHLY_REPORT: { helperMonthlyReport: rows } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡抽成'))
  })

  it('列印呼叫瀏覽器列印；列印抬頭含店名與日期區間', async () => {
    window.print = jest.fn()
    const { settle } = setup({}, { route: `/helper-monthly-report?startDate=${new Date(2026, 8, 1).getTime()}&endDate=${new Date(2026, 8, 30, 23, 59).getTime()}` })
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint .merchantNamePrint').textContent).toContain('測試店   2026-09-01  - 2026-09-30   互助月報表')
  })

  it('載入中顯示骨架；報表查詢失敗或回傳 null 時不整頁錯誤、不顯示表格', async () => {
    const { settle } = setup({ GET_HELPER_MONTHLY_REPORT: new Error('查詢失敗') }, { delays: { GET_HELPER_MONTHLY_REPORT: 30 } })
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('table')).toBeNull()
    cleanup()
    const nulled = setup({ GET_HELPER_MONTHLY_REPORT: { helperMonthlyReport: null } })
    await nulled.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('table')).toBeNull()
  })
})
