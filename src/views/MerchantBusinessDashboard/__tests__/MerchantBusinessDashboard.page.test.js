// 保護「營業儀表板」：
// - 預設查今天 00:00～23:59:59.999（台灣時間）；快速選擇改查該區間
// - 區間統計 12 格：金額四捨五入＋千分位；「店販消費/會員卡消費」在啟用會員卡或區間內有會員卡金額時才合併顯示（也加千分位）
// - 其他支付方式、第三方卡券、入金儲值三張明細卡：名稱、金額、(非現金金額)
// - 查詢失敗不整頁錯誤，統計顯示 0、不出現 undefined（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import MerchantBusinessDashboard from '..'

jest.setTimeout(20000)

const SUMMARY = {
  service: 12345.6,
  product: 4500,
  usedTicket: 999.5,
  ticketSellIntoPerformance: 2000.4,
  performanceIncome: 15000,
  ticketSellNotIntoPerformance: 3000,
  usedTicketForDecount: 100.2,
  thirdPartTicketForDecount: 200,
  otherPayWayForDecount: 1500,
  walletUsedForDecount: 800,
  businessCash: 9876.5,
  walletDeposit: 5000,
  membership: 0,
}
const DASHBOARD = {
  intervalSummary: SUMMARY,
  otherPayway: [{ paywayName: 'LINE Pay', usedPrice: 1500, usedPriceWithNoCash: 1200 }],
  thirdPartTicket: [{ ticketName: '旅遊券', usedPrice: 200, usedPriceWithNoCash: 200 }],
  walletDeposit: [{ paywayName: '現金', usedPrice: 5000, usedPriceWithNoCash: 0 }],
}
const setup = ({ summary = SUMMARY, active = false, ...options } = {}) =>
  renderPage(<MerchantBusinessDashboard />, {
    fixtures: {
      FETCH_MERCHNAT_DASHBOARD: { merchantDashboard: { ...DASHBOARD, intervalSummary: summary } },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
    },
    route: '/dashboard/business',
    ...options,
  })
const stat = label => screen.getByText(label).nextSibling.textContent
// 明細卡：從卡片標題往上找到含表格的卡片
const cardOf = title => {
  let el = screen.getByText(title)
  while (!el.querySelector('table')) el = el.parentElement
  return el
}
const cardRows = title =>
  [...cardOf(title).querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_MERCHNAT_DASHBOARD')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('營業儀表板', () => {
  it('預設查今天整天；快速選擇「本月」改查本月', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_MERCHNAT_DASHBOARD')[0].variables.input).toEqual({
      startDate: startOfDay(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
    })
    pickQuickDate('本月')
    await wait(() =>
      expect(lastInput(calls)).toEqual({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() })
    )
  })

  it('區間統計四捨五入加千分位；未啟用會員卡且沒有會員卡金額時只顯示店販消費', async () => {
    const { settle } = setup({ summary: { ...SUMMARY, product: 12345.5 } })
    await settle()
    expect(stat('服務消費')).toBe('12,346')
    expect(stat('店販消費')).toBe('12,345.5')
    expect(stat('卡券使用 (入業績)')).toBe('1,000')
    expect(stat('卡券販賣 (入業績)')).toBe('2,000')
    expect(stat('業績收入')).toBe('15,000')
    expect(stat('卡券販賣 (不入業績)')).toBe('3,000')
    expect(stat('卡券使用(-)')).toBe('100')
    expect(stat('第三方卡券(-)')).toBe('200')
    expect(stat('其他付款方式(-)')).toBe('1,500')
    expect(stat('入金使用(-)')).toBe('800')
    expect(stat('入金儲值')).toBe('5,000')
    expect(stat('營業現金應收')).toBe('9,877')
  })

  it('啟用會員卡、或區間內有會員卡金額時，合併顯示店販消費/會員卡消費', async () => {
    const first = setup({ active: true })
    await first.settle()
    await wait(() => expect(stat('店販消費/會員卡消費')).toBe('4,500/0'))
    cleanup()
    const second = setup({ summary: { ...SUMMARY, membership: 1200 } })
    await second.settle()
    await wait(() => expect(stat('店販消費/會員卡消費')).toBe('4,500/1,200'))
  })

  it('三張明細卡列出名稱、金額與非現金金額', async () => {
    const { settle } = setup()
    await settle()
    expect(cardRows('其他支付方式明細')).toEqual([['LINE Pay', '1,500', '(1,200)']])
    expect(cardRows('第三方卡券明細')).toEqual([['旅遊券', '200', '(200)']])
    expect(cardRows('入金儲值明細')).toEqual([['現金', '5,000', '(0)']])
  })

  it('查詢失敗不整頁錯誤：統計顯示 0、不顯示會員卡欄、明細卡為空', async () => {
    const { settle } = setup({ fixtures: {}, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(stat('服務消費')).toBe('0')
    expect(stat('店販消費')).toBe('0')
    expect(document.body.textContent).not.toContain('undefined')
    expect(cardRows('其他支付方式明細')).toEqual([])
  })
})
