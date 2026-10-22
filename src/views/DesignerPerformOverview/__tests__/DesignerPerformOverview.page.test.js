// 保護「全店業績分析表」：
// - 進頁查本月 1 日到今天結束（台灣時間）、虛業績；切實業績送 TRUTH；快速選擇改查新區間
// - 業績依據切換鈕：店家設定隱藏時不顯示（設定比會員卡設定早回來時也要生效）
// - 設計師列只顯示有任何業績／人次的人；服務類別欄只顯示有人有數字的類別；最後一列「全店」
// - 會員卡欄：店家啟用會員卡，或全店有會員卡業績／人次／單均價時顯示
// - 匯出 CSV 與表格一致；店家沒有任何設計師資料、查詢失敗時不整頁錯誤（失敗時不顯示表格、不停在載入中）
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { csvRows, headerTexts, rowCells } from '../../__tests__/staffReportKit.test'
import DesignerPerformOverview from '..'

jest.mock('react-csv', () => require('../../__tests__/staffReportKit.test').csvModule)
jest.setTimeout(20000)

const cat = (categoryName, fakePerformance = 0, orderCount = 0, averagePerformance = 0) => ({ categoryName, fakePerformance, orderCount, averagePerformance })
const zero = {
  fakePerformance: 0, orderCount: 0, averagePerformance: 0, productPerformance: 0, productOrderCount: 0, productAveragePerformance: 0,
  membershipPerformance: 0, membershipOrderCount: 0, membershipAveragePerformance: 0, orderMaleCount: 0, orderFemaleCount: 0,
  orderUnknownCount: 0, orderDesignateCount: 0, orderNonDesignatecount: 0, customerMaleCount: 0, customerFemaleCount: 0, customerUnknownCount: 0,
}
const user = (userNo, userName, extra = {}, categories = [cat('剪髮'), cat('染髮'), cat('燙髮')]) => ({
  ...zero, userNo, userName, userId: userNo, categoryData: categories, ...extra,
})
const USERS = [
  user('A01', '小美', { fakePerformance: 10000.4, orderCount: 10, averagePerformance: 1000.4, productPerformance: 500.4, productOrderCount: 2, productAveragePerformance: 250.2, orderMaleCount: 3, orderFemaleCount: 6, orderUnknownCount: 1, orderDesignateCount: 7, orderNonDesignatecount: 3, customerMaleCount: 2, customerFemaleCount: 5, customerUnknownCount: 1 }, [cat('剪髮', 6000.4, 6, 1000.1), cat('染髮'), cat('燙髮', 0, 0, 0)]),
  user('A02', '阿明', { productPerformance: 300, productOrderCount: 1, productAveragePerformance: 300 }, [cat('剪髮'), cat('染髮', 0, 1, 0), cat('燙髮')]),
  user('A03', '休假'),
  user('A04', '只有男客', { orderMaleCount: 1 }),
  user('A05', '只有女客', { orderFemaleCount: 1 }),
  user('A06', '只有未知', { orderUnknownCount: 1 }),
  user('A07', '只有單均', { averagePerformance: 1 }),
  user('A08', '店販單均', { productAveragePerformance: 1 }),
  user('A09', '店販人次', { productOrderCount: 1 }),
  user('A10', '只有人次', { orderCount: 1 }, [cat('剪髮'), cat('染髮'), cat('燙髮', 0, 0, 5)]),
]
const WHOLE = {
  ...zero, fakePerformance: 10000.4, orderCount: 11, averagePerformance: 909.1, productPerformance: 800.4, productOrderCount: 3, productAveragePerformance: 266.8,
  orderMaleCount: 4, orderFemaleCount: 7, orderUnknownCount: 2, orderDesignateCount: 7, orderNonDesignatecount: 4, customerMaleCount: 3, customerFemaleCount: 6, customerUnknownCount: 2,
  categoryData: [cat('剪髮', 6000.4, 6, 1000.1), cat('染髮', 0, 1, 0), cat('燙髮', 0, 0, 5)],
}
const report = (users = USERS, whole = WHOLE) => ({ merchantImmediatePerformanceReport: { users, wholeStore: whole } })
const setup = (extra = {}, options = {}) =>
  renderPage(<DesignerPerformOverview />, {
    route: '/designer/perform/overview',
    fixtures: {
      FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: report(),
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      ...extra,
    },
    ...options,
  })
const lastVariables = calls => {
  const list = callsOf(calls, 'FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT')
  return list[list.length - 1].variables
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('全店業績分析表', () => {
  it('進頁查本月到今天、虛業績；切實業績送 TRUTH，再按一次不改變；快速選擇昨天改查昨天', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT')[0].variables).toEqual({
      input: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      displayReference: 'FAKE',
    })
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVariables(calls).displayReference).toBe('TRUTH'))
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await settle()
    expect(lastVariables(calls).displayReference).toBe('TRUTH')
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastVariables(calls).input).toEqual({ startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() })
    )
  })

  it('店家設定隱藏切換鈕時不顯示業績依據（設定比會員卡設定早回來也要生效）', async () => {
    const { settle } = setup(
      { GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } },
      { delays: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 60 } }
    )
    await settle()
    await wait(() => expect(screen.queryByText('實業績')).toBeNull())
  })

  it('只顯示有數字的設計師與服務類別；全店列；未啟用會員卡且全店沒有會員卡數字時不顯示會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    expect(headerTexts()).toEqual([
      '編號', '設計師', '服務業績/人次/單均價', '店販業績/人次/單均價', '男/女/未知 (人次)', '指定/不指定 (人次)', '男/女/未知 (不重複)',
      '剪髮/人次/單均價', '染髮/人次/單均價', '燙髮/人次/單均價',
    ])
    expect(screen.queryByText('休假')).toBeNull()
    expect(rowCells('小美')).toEqual(['A01', '小美', '10,000/10/1,000', '500/2/250', '3/6/1', '7/3', '2/5/1', '6,000/6/1,000', '0/0/0', '0/0/0'])
    expect(rowCells('阿明')[3]).toBe('300/1/300')
    expect(['只有男客', '只有女客', '只有未知', '只有單均', '店販單均', '店販人次', '只有人次'].every(name => screen.queryByText(name))).toBe(true)
    expect(rowCells('全店')).toEqual(['', '全店', '10,000/11/909', '800/3/267', '4/7/2', '7/4', '3/6/2', '6,000/6/1,000', '0/1/0', '0/0/5'])
  })

  it('沒有人有數字的服務類別不顯示', async () => {
    const users = [user('A01', '小美', { orderCount: 1 }, [cat('剪髮', 100, 1, 100), cat('染髮')])]
    const { settle } = setup({ FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: report(users, { ...WHOLE, categoryData: [cat('剪髮', 100, 1, 100), cat('染髮')] }) })
    await settle()
    expect(headerTexts().slice(-1)).toEqual(['剪髮/人次/單均價'])
    expect(rowCells('全店')).toHaveLength(8)
    await wait(() => expect(csvRows()).toHaveLength(2))
    expect(Object.keys(csvRows()[0])).not.toContain('染髮/人次/單均價')
  })

  it('匯出：有數字的設計師各一列＋全店列，類別欄與表格一致', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(csvRows()).toHaveLength(10))
    expect(csvRows()[0]).toEqual({
      編號: 'A01',
      設計師: '小美',
      '服務業績/人次/單均價': '10000 / 10 / 1000',
      '店販業績/人次/單均價': '500 / 2 / 250',
      '男/女/未知 (人次)': '3 / 6 / 1',
      '指定/不指定 (人次)': '7 / 3',
      // 原本開頭多一個空白（與全店列不一致），已移除
      '男/女/未知 (不重複)': '2 / 5 / 1',
      '剪髮/人次/單均價': '6000 / 6 / 1000',
      '染髮/人次/單均價': '0 / 0 / 0',
      '燙髮/人次/單均價': '0 / 0 / 0',
    })
    expect(csvRows()[9]).toEqual({
      設計師: '全店',
      '服務業績/人次/單均價': '10000 / 11 / 909',
      '店販業績/人次/單均價': '800 / 3 / 267',
      '男/女/未知 (人次)': '4 / 7 / 2',
      '指定/不指定 (人次)': '7 / 4',
      '男/女/未知 (不重複)': '3 / 6 / 2',
      '剪髮/人次/單均價': '6000 / 6 / 1000',
      '染髮/人次/單均價': '0 / 1 / 0',
      '燙髮/人次/單均價': '0 / 0 / 5',
    })
  })

  it.each([
    ['店家啟用會員卡', { getIsMemberShipCardActive: true }, {}],
    ['全店有會員卡業績', { getIsMemberShipCardActive: false }, { membershipPerformance: 300.4 }],
    ['全店有會員卡人次', { getIsMemberShipCardActive: false }, { membershipOrderCount: 1 }],
    ['全店有會員卡單均價', { getIsMemberShipCardActive: false }, { membershipAveragePerformance: 2 }],
  ])('%s時顯示會員卡欄（表格與匯出）', async (_, setting, wholeExtra) => {
    const users = [user('A01', '小美', { membershipPerformance: 300.4, membershipOrderCount: 1, membershipAveragePerformance: 300.4 })]
    const { settle } = setup({
      GET_IS_MEMBERSHIP_CARD_ACTIVE: setting,
      FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: report(users, { ...WHOLE, ...wholeExtra }),
    })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡業績/人次/單均價'))
    expect(rowCells('小美')[4]).toBe('300/1/300')
    expect(csvRows()[0]['會員卡業績/人次/單均價']).toBe('300 / 1 / 300')
    expect(csvRows()[1]).toHaveProperty('會員卡業績/人次/單均價')
  })

  it('店家沒有任何設計師資料時只顯示全店列', async () => {
    const { settle } = setup({ FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: report([], { ...WHOLE }) })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rowCells('全店').slice(0, 3)).toEqual(['', '全店', '10,000/11/909'])
  })

  it('載入中顯示骨架；查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup({ FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: new Error('查詢失敗') })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('報表匯出')).toBeInTheDocument()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    expect(document.querySelector('table')).toBeNull()
    expect(csvRows()).toEqual([])
  })
})
