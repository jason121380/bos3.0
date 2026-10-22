// 保護「多店店販銷售排行」：
// - 進頁查今天 00:00～23:59:59.999（台灣時間）、不限廠商與店家；改日期重查
// - 選廠商（名稱不分大小寫搜尋）、選店家後按搜尋送出廠商 uuid 與店家 id；清除廠商立即以不限廠商重查
// - 排序：業績依後端名次、數量依總數量由多到少；再按一次已選的排序維持原排序（不可變成未選、匯出不可送出空的排序）
// - 展開販售人看商品明細、再按收合；合計列：總業績（各列四捨五入到小數 2 位後加總）、總數量
// - 報表匯出：以目前日期、廠商、店家、排序向後端要檔案網址並下載
// - 廠商或排行查詢失敗不整頁錯誤；列印呼叫瀏覽器列印
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { comboOptions, inputsByLabel, openCombo, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import MultiMerchantsLeaderBoard from '..'

jest.setTimeout(30000)

const MERCHANTS = JSON.stringify({ allMerchants: [{ id: 'm-1', name: '台北店' }, { id: 'm-2', name: '台中店' }], groups: [], merchants: [] })
const VENDORS = [{ uuid: 'v-1', name: 'Loreal 萊雅' }, { uuid: 'v-2', name: '花王' }]
const BOARD = [
  {
    sorting: 2, merchantName: '台中店', sellerName: '陳大文', sellerNo: null, totalPerformance: 1000.555, totalCount: 9,
    productDetail: [{ productName: '洗髮精', productNo: 'P1', performance: 1000.555, count: 9, unit: '瓶' }],
  },
  {
    sorting: 1, merchantName: '台北店', sellerName: '王小美', sellerNo: 'A01', totalPerformance: 2000.333, totalCount: 3,
    productDetail: [{ productName: '護髮油', productNo: 'P2', performance: 2000.333, count: 3, unit: '罐' }],
  },
]
const fixtures = (extra = {}) => ({
  GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS },
  GET_VENDOR: { getVendor: VENDORS },
  GET_MMULTI_MERCHANTS_LEADER_BOARD: { multiMerchantsLeaderBoard: BOARD },
  GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL: { multiMerchantsLeaderBoardExcel: 'https://files.example/board.xlsx' },
  ...extra,
})
const setup = (options = {}) =>
  renderPage(<MultiMerchantsLeaderBoard />, { fixtures: fixtures(), route: '/report/multi-merchants-leader-board', ...options })
const lastVars = (calls, name = 'GET_MMULTI_MERCHANTS_LEADER_BOARD') => callsOf(calls, name).pop().variables
const sellers = () => [...document.querySelectorAll('tbody tr.cursor-pointer')].map(tr => tr.querySelectorAll('td')[3].textContent)
const rowOf = text => [...screen.getByText(text).closest('tr').querySelectorAll('td')].map(td => td.textContent)
const today = () => ({ startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('多店店販銷售排行', () => {
  it('進頁查今天、不限廠商與店家；改日期重查', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_MMULTI_MERCHANTS_LEADER_BOARD')[0].variables).toEqual({ input: today(), vendorUUId: null, merchantId: [] })
    pickQuickDate('本月')
    await wait(() =>
      expect(lastVars(calls)).toEqual({
        input: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() },
        vendorUUId: null,
        merchantId: [],
      })
    )
  })

  it('選廠商（不分大小寫搜尋）與店家後搜尋送出 uuid 與店家 id；清除廠商立即以不限廠商重查', async () => {
    const { calls, settle } = setup()
    await settle()
    openCombo('選擇廠商', { typed: 'loreal' })
    expect(comboOptions().map(o => o.textContent)).toEqual(['Loreal 萊雅'])
    pickOption('選擇廠商', 'Loreal 萊雅', { typed: 'loreal' })
    fireEvent.click(screen.getByText('全選'))
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastVars(calls)).toEqual({ input: today(), vendorUUId: 'v-1', merchantId: ['m-1', 'm-2'] }))
    await settle()
    fireEvent.focusIn(inputsByLabel('選擇廠商')[0])
    fireEvent.mouseDown(screen.getByLabelText('清除'))
    await wait(() => expect(lastVars(calls)).toEqual({ input: today(), vendorUUId: null, merchantId: ['m-1', 'm-2'] }))
  })

  it('移除全部店家時立即以不限店家重查', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('全選'))
    fireEvent.mouseDown(screen.getByLabelText('移除 台北店'))
    fireEvent.mouseDown(screen.getByLabelText('移除 台中店'))
    await settle()
    expect(lastVars(calls)).toEqual({ input: today(), vendorUUId: null, merchantId: [] })
  })

  it('排序：業績依名次、數量依總數量多到少；再按一次已選的排序維持原排序', async () => {
    const { settle } = setup()
    await settle()
    expect(sellers()).toEqual(['王小美', '陳大文'])
    fireEvent.click(screen.getByText('數量'))
    expect(sellers()).toEqual(['陳大文', '王小美'])
    fireEvent.click(screen.getByText('數量'))
    expect(screen.getByText('數量')).toHaveAttribute('aria-pressed', 'true')
    expect(sellers()).toEqual(['陳大文', '王小美'])
    fireEvent.click(screen.getByText('業績'))
    expect(sellers()).toEqual(['王小美', '陳大文'])
  })

  it('列表欄位、合計；展開看商品明細、再按收合', async () => {
    const { settle } = setup()
    await settle()
    expect(rowOf('王小美')).toEqual(['', '1', '台北店', '王小美', 'A01', '2,000.33', '3'])
    expect(rowOf('陳大文')).toEqual(['', '2', '台中店', '陳大文', '', '1,000.56', '9'])
    expect(rowOf('合計')).toEqual(['', '合計', '3,000.89', '12'])
    fireEvent.click(screen.getByText('王小美'))
    expect(rowOf('護髮油')).toEqual(['護髮油', 'P2', '2,000.333', '3', '罐'])
    expect(screen.getAllByLabelText('收合明細')).toHaveLength(1)
    fireEvent.click(screen.getByText('陳大文'))
    expect(screen.getByText('洗髮精')).toBeInTheDocument()
    fireEvent.click(screen.getByText('王小美'))
    expect(screen.queryByText('護髮油')).toBeNull()
    expect(screen.getByText('洗髮精')).toBeInTheDocument()
  })

  it('報表匯出：以目前條件與排序要檔案網址並下載', async () => {
    const clicked = []
    jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      clicked.push(this.getAttribute('href'))
    })
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('數量'))
    fireEvent.click(screen.getByText('數量'))
    fireEvent.click(screen.getByText('報表匯出'))
    await settle()
    expect(lastVars(calls, 'GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL')).toEqual({ input: today(), vendorUUId: null, merchantId: [], sortBy: 'TOTALCOUNT' })
    expect(clicked).toEqual(['https://files.example/board.xlsx'])
    // 選了廠商與店家後匯出帶入 uuid 與店家 id
    pickOption('選擇廠商', '花王')
    fireEvent.click(screen.getByText('全選'))
    fireEvent.click(screen.getByText('報表匯出'))
    await settle()
    expect(lastVars(calls, 'GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL')).toEqual({
      input: today(),
      vendorUUId: 'v-2',
      merchantId: ['m-1', 'm-2'],
      sortBy: 'TOTALCOUNT',
    })
  })

  it('列印呼叫瀏覽器列印；列印標頭帶店名', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店')
  })

  it('廠商或排行查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: { GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS } }, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rowOf('合計')).toEqual(['', '合計', '0', '0'])
  })

  it('排行回傳 null 時顯示空表格、不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: fixtures({ GET_MMULTI_MERCHANTS_LEADER_BOARD: { multiMerchantsLeaderBoard: null } }) })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rowOf('合計')).toEqual(['', '合計', '0', '0'])
  })
})
