// 保護「每日結帳」：
// - 預設查詢 31 天前到今天 23:59:59.999（台灣時間），日結紀錄與尚未日結兩支查詢各 1000 筆；快速選擇日期時兩支都改查新區間
// - 尚未日結：只列今天 00:00（含）以前的營業日；勾選後按「結帳」開啟日結確認（帶勾選的日期、結帳人）
// - 店家設定「有掛單未結不可日結」時，有掛單的日期不能勾、標示掛單筆數，全選只選沒有掛單的日期
// - 日結紀錄：各欄金額四捨五入、千分位；會員卡／點數折抵欄依設定或區間內有金額才顯示；合計列；匯出 CSV 依日期排序並附合計
// - 解除日結：未設密碼時直接送出日期並重新整理；有設密碼時先輸入密碼，送出日期與密碼；取消／失敗不重新整理
// - 全選框以畫面列出的日期計算；點數設定晚到時匯出也重算；日結紀錄查詢失敗不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addHours, endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, USER_ID } from '../../../__tests__/testkit.test'
import CheckoutDaily from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const now = new Date()
const D2 = startOfDay(subDays(now, 2)).getTime()
const D1 = startOfDay(subDays(now, 1)).getTime()
const TODAY = startOfDay(now).getTime()
const TODAY_NOON = addHours(startOfDay(now), 12).getTime()
const fmt = t => require('date-fns').format(t, 'yyyy/MM/dd')

const WAIT = [
  { date: D2, orders: [], pendingOrderCount: 2 },
  { date: D1, orders: [], pendingOrderCount: 0 },
  { date: TODAY, orders: [], pendingOrderCount: 0 },
  // 今天 00:00 以後的時間戳（例如後端回傳今天中午）不列出
  { date: TODAY_NOON, orders: [], pendingOrderCount: 0 },
]

const row = (date, extra = {}) => ({
  date,
  service: 1000.4,
  product: 500.6,
  usedTicket: 33.335,
  ticketSellIntoPerformance: 0,
  performanceIncome: 1501,
  ticketSellNotIntoPerformance: 0,
  walletDeposit: 2000,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  businessCash: 1501,
  cashRevenue: 300,
  cashExpenditure: 100,
  cashBalance: 1701,
  lastCheckoutDateTime: new Date(2026, 9, 21, 22, 0).getTime(),
  checkoutStaff: { name: '店長' },
  membership: 0,
  picking: 0,
  bonusDecountForReport: 0,
  ...extra,
})
const SUMMARY = {
  service: 2000.8,
  product: 1001.2,
  usedTicket: 0,
  ticketSellIntoPerformance: 0,
  performanceIncome: 3002,
  ticketSellNotIntoPerformance: 0,
  walletDeposit: 4000,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  businessCash: 3002,
  cashRevenue: 600,
  cashExpenditure: 200,
  cashBalance: 3402,
  membership: 0,
  picking: 0,
  bonusDecountForReport: 0,
}
const REPORT_ROWS = [row(new Date(2026, 9, 20).getTime(), { checkoutStaff: null }), row(new Date(2026, 9, 19).getTime())]

const fixtures = (extra = {}) => ({
  GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: { getIsDailyCheckoutBlockedByDraftOrder: false },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_MERCHANT_PASSWORD: { merchantPassword: { restoreCheckout: { isUsing: false } } },
  waitCloseOrderDate: { waitCloseOrderDate: { data: WAIT, pageLimit: 1000, pageOffset: 0, totalCount: WAIT.length } },
  dailyMoneyFlowReport: { dailyMoneyFlowReport: { data: REPORT_ROWS, summary: SUMMARY, pageLimit: 1000, pageOffset: 0, totalCount: 2 } },
  SET_RESTORE_DAILY_ACCOUNT: { restoreDailyAccount: true },
  ...extra,
})
const setup = (extra = {}, options = {}) => renderPage(<CheckoutDaily />, { fixtures: fixtures(extra), route: '/checkout/daily', ...options })

const realLocation = window.location
let reload
beforeEach(() => {
  loginAs()
  reload = jest.fn()
  delete window.location
  window.location = { reload }
})
afterEach(() => {
  cleanup()
  window.location = realLocation
})

const lastInput = (calls, name) => {
  const list = callsOf(calls, name)
  return list[list.length - 1].variables.input
}
const expand = () => fireEvent.click(screen.getByLabelText('show more'))
const reportCard = () => screen.getByText('日結紀錄').closest('.ui-root, div')
const reportHeaders = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))

describe('每日結帳', () => {
  it('預設查 31 天前到今天整天，兩支查詢各 1000 筆；快速選擇「本月」後兩支都改查本月', async () => {
    const { calls, settle } = setup()
    await settle()
    const expected = {
      startDate: subDays(endOfDay(now), 31).getTime(),
      endDate: endOfDay(now).getTime(),
      pageLimit: 1000,
      pageOffset: 0,
    }
    expect(callsOf(calls, 'dailyMoneyFlowReport')[0].variables.input).toEqual(expected)
    expect(callsOf(calls, 'waitCloseOrderDate')[0].variables.input).toEqual(expected)
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '本月' }), { key: 'Enter' })
    const month = { startDate: startOfMonth(now).getTime(), endDate: require('date-fns').endOfMonth(now).getTime(), pageLimit: 1000, pageOffset: 0 }
    await wait(() => expect(lastInput(calls, 'dailyMoneyFlowReport')).toEqual(month))
    expect(lastInput(calls, 'waitCloseOrderDate')).toEqual(month)
  })

  describe('尚未日結', () => {
    it('只列今天 00:00（含）以前的日期；勾選後按結帳開啟日結確認並帶勾選日期與結帳人', async () => {
      const { settle } = setup()
      await settle()
      expect(screen.getByText('共 3 筆')).toBeInTheDocument()
      expand()
      expect(screen.getByLabelText('show more').getAttribute('aria-expanded')).toBe('true')
      expect(screen.getByLabelText(fmt(D2))).toBeInTheDocument()
      expect(screen.getByLabelText(fmt(TODAY))).toBeInTheDocument()
      // 沒有開啟「掛單未結不可日結」：有掛單的日期也可勾、不標示
      expect(screen.getByLabelText(fmt(D2))).not.toBeDisabled()
      expect(screen.queryByText('(2筆掛單未結)')).toBeNull()
      fireEvent.click(screen.getByLabelText(fmt(D1)))
      fireEvent.click(screen.getByLabelText(fmt(D2)))
      fireEvent.click(screen.getByLabelText(fmt(D2)))
      fireEvent.click(screen.getByText('結帳', { selector: 'button' }))
      expect(openSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          resign: true,
          isDailyCheckout: true,
          selectedOrders: [D1],
          checkoutStaff: { id: USER_ID, name: '店長' },
          waitCloseOrderResults: WAIT,
        })
      )
      // 收合
      expand()
      expect(screen.queryByLabelText(fmt(D1))).toBeNull()
    })

    it('全選勾選所有列出的日期，再按一次清空', async () => {
      const { settle } = setup({
        waitCloseOrderDate: { waitCloseOrderDate: { data: WAIT.slice(0, 3), pageLimit: 1000, pageOffset: 0, totalCount: 3 } },
      })
      await settle()
      expand()
      fireEvent.click(screen.getByLabelText('全選'))
      fireEvent.click(screen.getByText('結帳', { selector: 'button' }))
      expect(openSnackbar).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOrders: [D2, D1, TODAY] }))
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText(fmt(D1)).checked).toBe(false)
    })

    it('有今天 00:00 以後的未日結時間戳（不列出）時，全選框以列出的日期計算：全選後為勾選、再按清空（Jason 2026/10/22）', async () => {
      const { settle } = setup()
      await settle()
      expand()
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText('全選').checked).toBe(true)
      expect(screen.getByLabelText('全選').indeterminate).toBe(false)
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText(fmt(D1)).checked).toBe(false)
    })

    it('設定有掛單未結不可日結時，全選框也只以列出的日期中沒有掛單的計算（Jason 2026/10/22）', async () => {
      const { settle } = setup({ GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: { getIsDailyCheckoutBlockedByDraftOrder: true } })
      await settle()
      expand()
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText('全選').checked).toBe(true)
      fireEvent.click(screen.getByText('結帳', { selector: 'button' }))
      expect(openSnackbar).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOrders: [D1, TODAY] }))
    })

    // B2 #13（2026/10/30）：「有掛單未結不可日結」設定比尚未日結列表晚回來時，子層先以預設 false 算全選上限（3 天），
    // 設定回來後不重算 → 全選只選 2 天、勾選框卻顯示半選。設定改變時必須重算。
    it('「有掛單未結不可日結」設定較晚回來：全選後仍為完整勾選，不是半選', async () => {
      const { settle } = setup(
        {
          GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: { getIsDailyCheckoutBlockedByDraftOrder: true },
          waitCloseOrderDate: { waitCloseOrderDate: { data: WAIT.slice(0, 3), pageLimit: 1000, pageOffset: 0, totalCount: 3 } },
        },
        { delays: { GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: 50 } }
      )
      await settle()
      expand()
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText('全選').indeterminate).toBe(false)
      expect(screen.getByLabelText('全選').checked).toBe(true)
    })

    it('設定有掛單未結不可日結：有掛單的日期停用並標示筆數，全選只選沒有掛單的日期', async () => {
      const { settle } = setup({
        GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: { getIsDailyCheckoutBlockedByDraftOrder: true },
        waitCloseOrderDate: { waitCloseOrderDate: { data: WAIT.slice(0, 3), pageLimit: 1000, pageOffset: 0, totalCount: 3 } },
      })
      await settle()
      expand()
      expect(screen.getByLabelText(fmt(D2))).toBeDisabled()
      expect(screen.getByText('(2筆掛單未結)')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText('全選').checked).toBe(true)
      fireEvent.click(screen.getByText('結帳', { selector: 'button' }))
      expect(openSnackbar).toHaveBeenLastCalledWith(expect.objectContaining({ selectedOrders: [D1, TODAY] }))
      fireEvent.click(screen.getByLabelText('全選'))
      expect(screen.getByLabelText(fmt(D1)).checked).toBe(false)
    })
  })

  describe('日結紀錄', () => {
    it('金額四捨五入並加千分位，結帳人沒有時空白；未啟用會員卡與點數且區間內沒有金額時不顯示這兩欄', async () => {
      const { settle } = setup()
      await settle()
      expect(screen.getByText('共 2 筆')).toBeInTheDocument()
      expect(reportHeaders()).not.toContain('會員卡消費')
      expect(reportHeaders()).not.toContain('點數折抵金額(-)')
      const cells = within(screen.getByText('2026/10/20').closest('tr')).getAllByRole('cell').map(c => c.textContent)
      expect(cells.slice(1, 6)).toEqual(['2026/10/20', '1,701', '1,000', '501', '33.34'])
      expect(cells[cells.length - 2]).toBe('2026/10/21')
      expect(cells[cells.length - 1]).toBe('')
      const total = within(screen.getByText('合計').closest('tr')).getAllByRole('cell').map(c => c.textContent)
      expect(total.slice(0, 5)).toEqual(['合計', '', '3,402', '2,001', '1,001'])
      // 匯出：依日期由舊到新、最後一列為合計，不含會員卡與點數欄
      await wait(() => expect(exportedCsv()).toContain('"2026/10/19","1000","501"'))
      const csv = exportedCsv()
      expect(csv.indexOf('2026/10/19')).toBeLessThan(csv.indexOf('2026/10/20'))
      expect(csv).toContain('"合計","2001","1001"')
      expect(csv).not.toContain('會員卡消費')
      expect(csv).not.toContain('點數折抵金額')
      expect(csv).toContain('"店長"')
    })

    it('啟用會員卡與點數時表格顯示兩欄，匯出含會員卡欄', async () => {
      const { settle } = setup({
        GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
        GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
      })
      await settle()
      await wait(() => expect(reportHeaders()).toContain('會員卡消費'))
      expect(reportHeaders()).toContain('點數折抵金額(-)')
      await wait(() => expect(exportedCsv()).toContain('會員卡消費'))
    })

    it('啟用點數但未啟用會員卡、設定比報表先回來時，匯出檔有點數欄（Jason 2026/10/22）', async () => {
      const { settle } = setup(
        { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } },
        { delays: { dailyMoneyFlowReport: 120, GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: 120 } }
      )
      // 掛單設定晚到：尚未日結區塊先顯示，設定到了再算可日結筆數
      await screen.findByText('尚未日結紀錄')
      await settle()
      expect(reportHeaders()).toContain('點數折抵金額(-)')
      await wait(() => expect(exportedCsv()).toContain('點數折抵金額(-)'))
      expect(exportedCsv()).not.toContain('會員卡消費')
      expect(screen.getByText('共 3 筆')).toBeInTheDocument()
    })

    it('會員卡與點數都啟用、設定比報表先回來：匯出含兩欄（會員卡顯示改變時一併重算）', async () => {
      const { settle } = setup(
        { GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true }, GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } },
        { delays: { dailyMoneyFlowReport: 120 } }
      )
      await settle()
      await wait(() => expect(exportedCsv()).toContain('點數折抵金額(-)'))
      expect(exportedCsv()).toContain('會員卡消費')
    })

    it('設定未啟用但區間內有會員卡、點數折抵金額時仍顯示兩欄', async () => {
      const { settle } = setup({
        dailyMoneyFlowReport: {
          dailyMoneyFlowReport: { data: REPORT_ROWS, summary: { ...SUMMARY, membership: 800, bonusDecountForReport: 50 }, pageLimit: 1000, pageOffset: 0, totalCount: 2 },
        },
      })
      await settle()
      await wait(() => expect(reportHeaders()).toContain('會員卡消費'))
      expect(reportHeaders()).toContain('點數折抵金額(-)')
    })

    it('點數設定比報表晚回來時，表格與匯出檔都有「點數折抵金額」欄（Jason 2026/10/22）', async () => {
      const { settle } = setup({ GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } }, { delays: { GET_CUSTOMER_BONUS: 80 } })
      await settle()
      await wait(() => expect(reportHeaders()).toContain('點數折抵金額(-)'))
      await wait(() => expect(exportedCsv()).toContain('點數折抵金額(-)'))
    })

    // 解除日結後不整頁重新整理（會丟掉日期區間與捲動位置），改為重抓待結帳日期與日結紀錄：解除的那天要回到待結帳清單（2026/10/28）
    it('未設解除密碼：按解除日結直接送出該日，成功後重抓兩份清單、不重新整理', async () => {
      const { calls, settle } = setup()
      await settle()
      const waitBefore = callsOf(calls, 'waitCloseOrderDate').length
      const reportBefore = callsOf(calls, 'dailyMoneyFlowReport').length
      fireEvent.click(within(screen.getByText('2026/10/19').closest('tr')).getByLabelText('解除日結'))
      await wait(() => expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')).toHaveLength(1))
      expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')[0].variables).toEqual({ date: new Date(2026, 9, 19).getTime() })
      await wait(() => expect(callsOf(calls, 'waitCloseOrderDate').length).toBeGreaterThan(waitBefore))
      await wait(() => expect(callsOf(calls, 'dailyMoneyFlowReport').length).toBeGreaterThan(reportBefore))
      expect(reload).not.toHaveBeenCalled()
      expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '日結解除成功' })
    })

    it('解除失敗時不重新整理', async () => {
      const { calls, settle } = setup({ SET_RESTORE_DAILY_ACCOUNT: new Error('已鎖定') })
      await settle()
      fireEvent.click(within(screen.getByText('2026/10/19').closest('tr')).getByLabelText('解除日結'))
      await wait(() => expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')).toHaveLength(1))
      await settle()
      expect(reload).not.toHaveBeenCalled()
    })

    it('有設解除密碼：先輸入密碼，送出日期與密碼；取消、按 Esc 不送出；密碼錯誤時關閉對話框、不重新整理', async () => {
      const { calls, settle } = setup({ GET_MERCHANT_PASSWORD: { merchantPassword: { restoreCheckout: { isUsing: true } } } })
      await settle()
      const unlock = () => fireEvent.click(within(screen.getByText('2026/10/20').closest('tr')).getByLabelText('解除日結'))
      unlock()
      expect(within(screen.getByRole('dialog')).getByText('2026/10/20 解除日結?')).toBeInTheDocument()
      fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '1111' } })
      fireEvent.click(within(screen.getByRole('dialog')).getByText('取消'))
      await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
      unlock()
      expect(screen.getByTestId('delete-password')).toHaveValue('')
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')).toHaveLength(0)
      unlock()
      fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '2468' } })
      fireEvent.click(screen.getByTestId('confirm'))
      await wait(() => expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')).toHaveLength(1))
      expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')[0].variables).toEqual({ date: new Date(2026, 9, 20).getTime(), password: '2468' })
      await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(reload).not.toHaveBeenCalled()
    })

    it('有設解除密碼但密碼錯誤：關閉對話框、不重新整理', async () => {
      const { calls, settle } = setup({
        GET_MERCHANT_PASSWORD: { merchantPassword: { restoreCheckout: { isUsing: true } } },
        SET_RESTORE_DAILY_ACCOUNT: new Error('密碼錯誤'),
      })
      await settle()
      fireEvent.click(within(screen.getByText('2026/10/20').closest('tr')).getByLabelText('解除日結'))
      fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '0000' } })
      fireEvent.click(screen.getByTestId('confirm'))
      await wait(() => expect(callsOf(calls, 'SET_RESTORE_DAILY_ACCOUNT')).toHaveLength(1))
      await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(reload).not.toHaveBeenCalled()
    })
  })

  it('日結紀錄查詢失敗時只少了該區塊，尚未日結照常顯示（Jason 2026/10/22）', async () => {
    const { settle } = setup({ dailyMoneyFlowReport: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('尚未日結紀錄')).toBeInTheDocument()
    expect(screen.queryByText('日結紀錄')).toBeNull()
  })

  it('尚未日結查詢失敗時只少了該區塊，日結紀錄照常顯示', async () => {
    const { settle } = setup({ waitCloseOrderDate: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText('尚未日結紀錄')).toBeNull()
    expect(screen.getByText('日結紀錄')).toBeInTheDocument()
    expect(reportCard()).toBeTruthy()
  })
})
