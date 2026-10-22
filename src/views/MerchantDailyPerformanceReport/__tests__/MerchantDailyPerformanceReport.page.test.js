// 保護「每日業績分析表」：
// - 預設查本月 1 日到今天 23:59:59.999（台灣時間）、虛業績；快速選擇改查該區間；切換實業績送出 TRUTH
// - 店家設定隱藏虛實切換時不顯示（設定比會員卡設定晚到或早到都一樣）
// - 每日一列：服務／店販「業績/人次/單均價」、男女未知、指定不指定、不重複客數；服務分類只顯示區間內有數字的分類
// - 會員卡欄：區間內有會員卡業績或啟用會員卡才顯示；匯出 CSV 同欄位
// - 沒有資料、查詢失敗不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import MerchantDailyPerformanceReport from '..'

jest.setTimeout(20000)

const category = (categoryName, orderCount, fakePerformance, averagePerformance) => ({ categoryName, orderCount, fakePerformance, averagePerformance })
const performance = extra => ({
  fakePerformance: 0, orderCount: 0, averagePerformance: 0,
  orderMaleCount: 0, orderFemaleCount: 0, orderUnknownCount: 0,
  orderDesignateCount: 0, orderNonDesignatecount: 0,
  customerMaleCount: 0, customerFemaleCount: 0, customerUnknownCount: 0,
  productPerformance: 0, productOrderCount: 0, productAveragePerformance: 0,
  membershipPerformance: 0, membershipOrderCount: 0, membershipAveragePerformance: 0,
  categoryData: [],
  ...extra,
})
const REPORT = [
  {
    date: Date.UTC(2026, 9, 19, 16, 30), // 台灣 2026/10/20
    performance: performance({
      fakePerformance: 5000.4, orderCount: 5, averagePerformance: 1000.08,
      orderMaleCount: 2, orderFemaleCount: 3, orderDesignateCount: 3, orderNonDesignatecount: 2,
      customerMaleCount: 2, customerFemaleCount: 2,
      productPerformance: 800, productOrderCount: 2, productAveragePerformance: 400,
      categoryData: [category('剪髮', 3, 3000, 1000), category('燙髮', 0, 0, 0), category('染髮', 0, 0, 0)],
    }),
  },
  {
    date: Date.UTC(2026, 9, 20, 16, 30), // 台灣 2026/10/21
    performance: performance({
      fakePerformance: 2000.6, orderCount: 1, averagePerformance: 2000.6, orderFemaleCount: 1, orderNonDesignatecount: 1, customerUnknownCount: 1,
      categoryData: [category('剪髮', 0, 0, 0), category('燙髮', 0, 0, 0), category('染髮', 1, 2000.6, 2000.6)],
    }),
  },
]
const fixtures = ({ report = REPORT, active = false, hideToggle = false } = {}) => ({
  GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: hideToggle },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
  FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT: { merchantDailyPerformanceReport: report },
})
const setup = ({ fixtureOptions, ...options } = {}) =>
  renderPage(<MerchantDailyPerformanceReport />, { fixtures: fixtures(fixtureOptions), route: '/report/merchant-daily-performance', ...options })
const lastInput = calls => callsOf(calls, 'FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT').pop().variables.input
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('每日業績分析表', () => {
  it('預設查本月到今天、虛業績；快速選擇「昨天」與切換實業績重查', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT')[0].variables.input).toEqual({
      displayReference: 'FAKE',
      dateRange: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
    })
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastInput(calls).dateRange).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    )
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastInput(calls).displayReference).toBe('TRUTH'))
  })

  it('店家設定隱藏虛實切換時不顯示；會員卡設定晚到也一樣', async () => {
    const first = setup({ fixtureOptions: { hideToggle: true } })
    await first.settle()
    expect(screen.queryByText('業績依據')).toBeNull()
    cleanup()
    const late = setup({ fixtureOptions: { hideToggle: true }, delays: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 300 } })
    await late.settle()
    expect(screen.queryByText('業績依據')).toBeNull()
  })

  it('每日列與只顯示有數字的服務分類；未啟用會員卡且沒有會員卡業績時不顯示會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    expect(headers()).toEqual([
      '日期', '服務業績/人次/單均價', '店販業績/人次/單均價', '男/女/未知 (人次)', '指定/不指定 (人次)', '男/女/未知 (不重複)', '剪髮/人次/單均價', '染髮/人次/單均價',
    ])
    expect(bodyRows()).toEqual([
      ['2026/10/20', '5,000/5/1,000', '800/2/400', '2/3/0', '3/2', '2/2/0', '3,000/3/1,000', '0/0/0'],
      ['2026/10/21', '2,001/1/2,001', '0/0/0', '0/1/0', '0/1', '0/0/1', '0/0/0', '2,001/1/2,001'],
    ])
    const csv = exportedCsv()
    expect(csv).toContain('"日期","服務業績/人次/單均價","店販業績/人次/單均價","男/女/未知 (人次)","指定/不指定 (人次)","男/女/未知 (不重複)","剪髮/人次/單均價","染髮/人次/單均價"')
    expect(csv).toContain('"2026/10/20","5000 / 5 / 1000","800 / 2 / 400","2 / 3 / 0","3 / 2"," 2 / 2 / 0","3000 / 3 / 1000"')
    expect(csv).not.toContain('會員卡')
  })

  it('啟用會員卡或區間內有會員卡業績時顯示會員卡欄，匯出也有', async () => {
    const first = setup({ fixtureOptions: { active: true } })
    await first.settle()
    expect(headers()).toContain('會員卡業績/人次/單均價')
    expect(exportedCsv()).toContain('"會員卡業績/人次/單均價"')
    cleanup()
    const report = [{ ...REPORT[0], performance: { ...REPORT[0].performance, membershipPerformance: 1500.5, membershipOrderCount: 1, membershipAveragePerformance: 1500.5 } }, REPORT[1]]
    const second = setup({ fixtureOptions: { report } })
    await second.settle()
    expect(bodyRows()[0][3]).toBe('1,501/1/1,501')
    expect(exportedCsv()).toContain('"1501 / 1 / 1501"')
  })

  it('沒有資料、查詢失敗都不整頁錯誤', async () => {
    const empty = setup({ fixtureOptions: { report: [] } })
    await empty.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(bodyRows()).toEqual([])
    cleanup()
    const failed = setup({ fixtures: {}, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
