// 保護「店家排行榜」：
// - 預設查本月 1 日到今天 23:59:59.999（台灣時間）、虛業績、不含店販、不含會員卡、未選店家；按「搜尋」前不顯示表格
// - 選店家（全選）後按搜尋送出店家 id；之後改日期自動帶入已選店家重查；移除全部店家後表格收起
// - 業績依據（虛／實）、總業績含店販、含會員卡（啟用會員卡或有會員卡業績才出現）各自送出對應參數；再按一次已選的按鈕不改變
// - 表格：名次、各項四捨五入加千分位、合計列；店家設定「服務業績月平均」時多一欄；會員卡業績在啟用或有金額時顯示
// - 匯出：虛／實業績欄名不同，每列的總業績都是總業績（不是月平均），合計列與各列加總一致（Jason 2026/10/22 報表規則）；查無資料時清空匯出
// - 設定比報表晚到時匯出也補上月平均欄；店家設定隱藏虛實切換時不顯示
// - 報表或設定查詢失敗不整頁錯誤；列印呼叫瀏覽器列印
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import MerchantLeaderBoard from '..'

jest.setTimeout(30000)

const MERCHANTS = JSON.stringify({
  allMerchants: [{ id: 'm-1', name: '台北店' }, { id: 'm-2', name: '台中店' }],
  groups: [],
  merchants: [],
})
const store = (storeName, extra) => ({
  userName: '',
  storeName,
  serviceTotal: 0,
  designateServiceTotal: 0,
  nonDesignateServiceTotal: 0,
  usedTicketTotal: 0,
  productTotal: 0,
  helperPaidPoint: 0,
  helperPaidPrice: 0,
  monthlyAveragePerformance: 0,
  ticketSellIntoPerformanceDesignate: 0,
  ticketSellIntoPerformanceNonDesignate: 0,
  businessPerformanceTotal: 0,
  membershipTotal: 0,
  ...extra,
})
const BOARD = [
  store('台北店', {
    serviceTotal: 50000.4,
    designateServiceTotal: 30000,
    nonDesignateServiceTotal: 20000.4,
    usedTicketTotal: 5000,
    ticketSellIntoPerformanceDesignate: 1000,
    ticketSellIntoPerformanceNonDesignate: 500,
    productTotal: 8000,
    helperPaidPoint: 12.4,
    helperPaidPrice: 600,
    monthlyAveragePerformance: 45000,
    businessPerformanceTotal: 63500,
  }),
  store('台中店', {
    serviceTotal: 30000,
    designateServiceTotal: 20000,
    nonDesignateServiceTotal: 10000,
    usedTicketTotal: 2000,
    productTotal: 3000,
    helperPaidPoint: 3,
    helperPaidPrice: 150,
    monthlyAveragePerformance: 28000,
    businessPerformanceTotal: 35000,
  }),
]
const fixtures = ({ board = BOARD, monthly = false, active = false, hideToggle = false } = {}) => ({
  GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS },
  SET_MERCHANT_LEARDER_BOARD: board instanceof Function || board instanceof Error ? board : { merchantLeaderBoard: { merchantLeaderBoard: board } },
  GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT: { getIsMonthlyAverageDisplayForMerchantLeaderBoard: monthly },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
  GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: hideToggle },
})
const setup = ({ fixtureOptions, ...options } = {}) =>
  renderPage(<MerchantLeaderBoard />, { fixtures: fixtures(fixtureOptions), route: '/report/merchant-leader-board', ...options })
const lastVars = calls => callsOf(calls, 'SET_MERCHANT_LEARDER_BOARD').pop().variables
const rows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const selectAllMerchantsAndSearch = async settle => {
  fireEvent.click(screen.getByText('全選'))
  fireEvent.click(screen.getByText('搜尋'))
  await settle()
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('店家排行榜', () => {
  it('預設參數；按搜尋前不顯示表格；全選店家後搜尋送出店家 id 並顯示排行與合計', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'SET_MERCHANT_LEARDER_BOARD')[0].variables).toEqual({
      startDay: startOfMonth(new Date()).getTime(),
      endDay: endOfDay(new Date()).getTime(),
      merchantId: [],
      reference: 'FAKE',
      isIncludeProductPerformance: false,
      isIncludeMembershipPerformance: false,
    })
    expect(document.querySelector('table')).toBeNull()
    await selectAllMerchantsAndSearch(settle)
    expect(lastVars(calls).merchantId).toEqual(['m-1', 'm-2'])
    expect(headers()).toEqual(['名次', '所屬店家', '總業績', '服務總業績(虛)', '服務業績(指)(虛)', '服務業績(不指)(虛)', '卡券使用業績(虛)', '卡券販賣(入業績)(虛)', '店販業績(虛)', '互助使用(點數)/互助使用(金額)'])
    expect(rows()).toEqual([
      ['1', '台北店', '63,500', '50,000', '30,000', '20,000', '5,000', '1,500', '8,000', '12/600'],
      ['2', '台中店', '35,000', '30,000', '20,000', '10,000', '2,000', '0', '3,000', '3/150'],
      ['合計', '', '98,500', '80,000', '50,000', '30,000', '7,000', '1,500', '11,000', '15/750'],
    ])
  })

  it('沒選店家按搜尋不顯示表格；選了店家後改日期自動重查；移除全部店家後表格收起', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('搜尋'))
    expect(document.querySelector('table')).toBeNull()
    fireEvent.click(screen.getByText('全選'))
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastVars(calls)).toMatchObject({
        startDay: startOfDay(subDays(new Date(), 1)).getTime(),
        endDay: endOfDay(subDays(new Date(), 1)).getTime(),
        merchantId: ['m-1', 'm-2'],
      })
    )
    await settle()
    expect(rows()).toHaveLength(3)
    fireEvent.mouseDown(screen.getByLabelText('移除 台北店'))
    expect(document.querySelector('table')).not.toBeNull()
    fireEvent.mouseDown(screen.getByLabelText('移除 台中店'))
    expect(document.querySelector('table')).toBeNull()
  })

  it('業績依據、含店販、含會員卡切換送出對應參數；再按一次已選的按鈕不改變', async () => {
    const { calls, settle } = setup({ fixtureOptions: { active: true } })
    await settle()
    await selectAllMerchantsAndSearch(settle)
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVars(calls).reference).toBe('TRUTH'))
    fireEvent.click(screen.getByText('實業績'))
    fireEvent.click(screen.getByText('含店販'))
    await wait(() => expect(lastVars(calls).isIncludeProductPerformance).toBe(true))
    fireEvent.click(screen.getByText('含店販'))
    fireEvent.click(screen.getByText('含會員卡'))
    await wait(() => expect(lastVars(calls).isIncludeMembershipPerformance).toBe(true))
    fireEvent.click(screen.getByText('含會員卡'))
    await settle()
    expect(lastVars(calls)).toMatchObject({ reference: 'TRUTH', isIncludeProductPerformance: true, isIncludeMembershipPerformance: true })
    expect(headers()).toContain('服務總業績(實)')
    expect(headers()).toContain('會員卡業績(實)')
  })

  it('匯出（虛業績）：各列與合計；未啟用會員卡且沒有會員卡業績時沒有會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    await selectAllMerchantsAndSearch(settle)
    const csv = exportedCsv()
    expect(csv).toContain('"所屬店家","總業績","服務總業績(虛)","服務業績(指)(虛)","服務業績(不指)(虛)","卡券使用業績(虛)","卡券販賣(入業績)(虛)","店販業績(虛)","互助使用(點數)/互助使用(金額)"')
    expect(csv).toContain('"台北店","63500","50000","30000","20000","5000","1500","8000","12/600"')
    expect(csv).toContain('"合計","98500","80000","50000","30000","7000","1500","11000","15/750"')
    expect(screen.queryByText('含會員卡')).toBeNull()
  })

  it('匯出（實業績）：每列總業績是總業績、不是月平均，與合計一致', async () => {
    const { calls, settle } = setup()
    await settle()
    await selectAllMerchantsAndSearch(settle)
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVars(calls).reference).toBe('TRUTH'))
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"所屬店家","總業績","服務總業績(實)"')
    expect(csv).toContain('"台北店","63500","50000","30000","20000","5000","1500","8000","12/600"')
    expect(csv).toContain('"台中店","35000","30000"')
    expect(csv).toContain('"合計","98500","80000"')
  })

  it('服務業績月平均設定與會員卡業績：表格與匯出都多一欄', async () => {
    const board = [{ ...BOARD[0], membershipTotal: 1200.4 }, BOARD[1]]
    const { calls, settle } = setup({ fixtureOptions: { monthly: true, board } })
    await settle()
    await selectAllMerchantsAndSearch(settle)
    expect(headers().slice(2, 4)).toEqual(['總業績', '服務業績月平均'])
    expect(headers()).toContain('會員卡業績(虛)')
    expect(rows()[0]).toEqual(['1', '台北店', '63,500', '45,000', '50,000', '30,000', '20,000', '5,000', '1,500', '8,000', '1,200', '12/600'])
    expect(rows()[2].slice(0, 4)).toEqual(['合計', '', '98,500', '73,000'])
    expect(rows()[2][10]).toBe('1,200')
    let csv = exportedCsv()
    expect(csv).toContain('"台北店","45000","63500","50000","30000","20000","5000","1500","8000","1200","12/600"')
    expect(csv).toContain('"合計","73000","98500","80000","50000","30000","7000","1500","11000","1200","15/750"')
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVars(calls).reference).toBe('TRUTH'))
    await settle()
    csv = exportedCsv()
    expect(csv).toContain('"台北店","45000","63500","50000","30000","20000","5000","1500","8000","1200","12/600"')
    expect(csv).toContain('會員卡業績(實)')
  })

  it('月平均設定比報表晚到時，匯出也補上月平均欄', async () => {
    // 匯出在進頁的第一次查詢就產生（尚未按搜尋）；設定晚 300ms 才回來
    const { settle } = setup({ fixtureOptions: { monthly: true }, delays: { GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT: 300 } })
    await settle()
    expect(exportedCsv()).toContain('"台北店","45000","63500"')
  })

  it('查無資料時清空匯出', async () => {
    const board = variables => ({ merchantLeaderBoard: { merchantLeaderBoard: variables.reference === 'TRUTH' ? [] : BOARD } })
    const { calls, settle } = setup({ fixtureOptions: { board } })
    await settle()
    await selectAllMerchantsAndSearch(settle)
    expect(exportedCsv()).toContain('台北店')
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVars(calls).reference).toBe('TRUTH'))
    await settle()
    expect(exportedCsv()).not.toContain('台北店')
    expect(rows()).toEqual([['合計', '', '0', '0', '0', '0', '0', '0', '0', '0/0']])
  })

  it('店家設定隱藏虛實切換時不顯示業績依據', async () => {
    const { settle } = setup({ fixtureOptions: { hideToggle: true } })
    await settle()
    expect(screen.queryByText('業績依據')).toBeNull()
    expect(screen.queryByText('實業績')).toBeNull()
  })

  it('列印呼叫瀏覽器列印；列印標頭帶店名與區間', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店')
  })

  it('報表或設定查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: { GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS } }, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    await selectAllMerchantsAndSearch(settle)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rows()).toEqual([['合計', '', '0', '0', '0', '0', '0', '0', '0', '0/0']])
  })
})
