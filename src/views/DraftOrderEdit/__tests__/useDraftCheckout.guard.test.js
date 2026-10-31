// useDraftCheckout 的「已結帳掛單不可再結帳」防護邊界（整頁測試走不到的時序與資料缺漏）。
// 為什麼重要：正式站曾發生掛單結帳逾時後被再結一次、成立兩張帳單。這裡守住：
// - 進頁確認回來前已離開頁面：不導頁、不提示（否則使用者在別頁被拉走）；
// - 掛單沒有日期：無法查當天清單，直接開放操作，不卡在「處理中」；
// - 確認仍在檢查中：儲存掛單不送出；
// - 導頁失敗時退回帳單列表；後端回的帳單 id 與掛單相同時回列表（不導回自己）；
// - 結帳結果不確定、確認回來前已離開頁面：不再導頁或改狀態。
// 後端以 mock 取代，不連任何後端。
import React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { Provider as BillProvider } from 'context/keyInContext'
import useDraftCheckout from '../useDraftCheckout'
import { confirmDraftStillPending, confirmDraftStillPendingOnDates } from '../draftCheckoutGuard'

const mockHistory = { replace: jest.fn(), push: jest.fn() }
const mockReCheckout = jest.fn()
const mockSnackbar = jest.fn()

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockHistory,
  useLocation: () => ({ search: '?startDate=1&endDate=2' }),
}))
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ cache: { evict: () => {}, gc: () => {} } }),
}))
jest.mock('hooks/useFetchReCheckoutOrder', () => () => ({ fetchReCheckoutOrder: (...args) => mockReCheckout(...args) }))
jest.mock('hooks/useFetchTicketRecords', () => () => ({ loading: false, data: undefined }))
jest.mock('elements/snackbars', () => ({ openSnackbar: (...args) => mockSnackbar(...args) }))
jest.mock('../draftCheckoutGuard', () => ({
  ...jest.requireActual('../draftCheckoutGuard'),
  confirmDraftStillPending: jest.fn(),
  confirmDraftStillPendingOnDates: jest.fn(),
}))

const DRAFT_ID = 'draft-1'
const ORDER_DATE = new Date(2026, 9, 21, 10).getTime()
const baseBill = {
  date: ORDER_DATE,
  customerId: 'c1',
  designerId: 'd1',
  serviceOrders: [{ serviceId: 's1', price: 1000, serviceOrderHelpers: [] }],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
  walletPay: 0,
  amountByOtherPay: 0,
  bonusDecount: 0,
}

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
const flush = () => act(() => new Promise(resolve => setTimeout(resolve, 0)))

function setup({ order = { id: DRAFT_ID, date: ORDER_DATE }, orderId = DRAFT_ID, bill = baseBill } = {}) {
  const latest = {}
  function Probe() {
    Object.assign(latest, useDraftCheckout({ passwordData: { loading: false, data: undefined } }))
    return null
  }
  const value = {
    bill,
    orderSetting: { orderId },
    orderId,
    order,
    handleBillChange: () => {},
    bonusSetting: { isUsing: false },
    setBill: () => {},
  }
  const utils = render(
    <BillProvider value={value}>
      <Probe />
    </BillProvider>
  )
  return { latest, ...utils }
}

beforeEach(() => {
  mockHistory.replace.mockReset()
  mockHistory.push.mockReset()
  mockReCheckout.mockReset()
  mockSnackbar.mockReset()
  confirmDraftStillPending.mockReset()
  confirmDraftStillPendingOnDates.mockReset()
  sessionStorage.clear()
})
afterEach(cleanup)

describe('進頁確認掛單狀態', () => {
  it('沒有掛單 id 時不查詢，維持檢查中（不開放結帳）', () => {
    const { latest } = setup({ orderId: null, order: null })
    expect(confirmDraftStillPending).not.toHaveBeenCalled()
    expect(latest.checkoutLocked).toBe(true)
  })

  it('掛單沒有日期：無法查當天清單，直接開放操作', () => {
    const { latest } = setup({ order: { id: DRAFT_ID, date: null } })
    expect(confirmDraftStillPending).not.toHaveBeenCalled()
    expect(latest.checkoutLocked).toBe(false)
  })

  it('掛單資料還沒回來（沒有 order）時維持檢查中', () => {
    const { latest } = setup({ order: null })
    expect(latest.checkoutLocked).toBe(true)
  })

  it('確認回來前已離開頁面：不導頁、不提示', async () => {
    const pending = deferred()
    confirmDraftStillPending.mockReturnValue(pending.promise)
    const { unmount } = setup()
    unmount()
    // React 17 在卸載後的下一輪才執行 effect 的清除；等清除完成（使用者已離開頁面）才讓查詢回來
    await flush()
    pending.resolve('closed')
    await flush()
    expect(mockHistory.replace).not.toHaveBeenCalled()
    expect(mockSnackbar).not.toHaveBeenCalled()
  })

  it('確認為已結帳時導到當天帳單列表；導頁失敗時退回不帶參數的帳單列表', async () => {
    confirmDraftStillPending.mockResolvedValue('closed')
    mockHistory.replace.mockImplementationOnce(() => {
      throw new Error('chunk failed')
    })
    const { latest } = setup()
    await flush()
    expect(mockHistory.replace).toHaveBeenNthCalledWith(1, expect.stringMatching(/^\/management\/orders\?startDate=\d+&endDate=\d+$/))
    expect(mockHistory.replace).toHaveBeenNthCalledWith(2, '/management/orders')
    expect(mockSnackbar).toHaveBeenCalledWith({ message: '這張掛單已結帳，不能再次結帳', variant: 'warning' })
    expect(latest.disabledReason).toBe('這張掛單已結帳')
  })
})

describe('儲存與結帳', () => {
  it('還在確認掛單狀態時，儲存掛單不送出', () => {
    confirmDraftStillPending.mockReturnValue(new Promise(() => {}))
    const { latest } = setup()
    act(() => latest.usehandleSaveDraftOrder())
    expect(mockReCheckout).not.toHaveBeenCalled()
  })

  it('後端回的帳單 id 與掛單相同時回到原日期區間的帳單列表（不導回自己）', async () => {
    confirmDraftStillPending.mockResolvedValue('open')
    mockReCheckout.mockResolvedValue({ data: { reCheckoutOrder: { id: DRAFT_ID } } })
    const { latest } = setup()
    await flush()
    act(() => latest.handleReCheckoutOrder())
    await flush()
    expect(mockReCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ updateOrderId: DRAFT_ID, orderInput: expect.objectContaining({ isPending: false }) })
    )
    expect(mockHistory.replace).toHaveBeenCalledWith('/management/orders?startDate=1&endDate=2')
  })

  it('後端沒有回新帳單 id：記住已結帳（沒有帳單 id）並回到原日期區間的帳單列表', async () => {
    confirmDraftStillPending.mockResolvedValue('open')
    mockReCheckout.mockResolvedValue({ data: { reCheckoutOrder: null } })
    const { latest } = setup()
    await flush()
    act(() => latest.handleReCheckoutOrder())
    await flush()
    expect(mockHistory.replace).toHaveBeenCalledWith('/management/orders?startDate=1&endDate=2')
    expect(JSON.parse(sessionStorage.getItem('bos.checkedOutDrafts'))[DRAFT_ID]).toMatchObject({ orderId: '' })
    expect(mockSnackbar).toHaveBeenCalledWith({ message: '掛單結帳成功', variant: 'success' })
  })

  it('結果不確定、再確認為已結帳，但帳單與掛單都沒有日期：回到網址上的帳單列表區間', async () => {
    mockReCheckout.mockRejectedValue(Object.assign(new Error('timeout'), { networkError: new Error('timeout') }))
    confirmDraftStillPendingOnDates.mockResolvedValue('closed')
    const { latest } = setup({ order: { id: DRAFT_ID, date: null }, bill: { ...baseBill, date: null } })
    act(() => latest.handleReCheckoutOrder())
    await flush()
    expect(mockHistory.replace).toHaveBeenCalledWith('/management/orders?startDate=1&endDate=2')
    expect(mockSnackbar).toHaveBeenCalledWith({ message: '這張掛單已結帳，請到帳單列表確認，不要重複結帳', variant: 'warning' })
  })

  it('結帳成功回來前已離開頁面：仍記住已結帳並導頁，但不再更新已卸載的狀態', async () => {
    confirmDraftStillPending.mockResolvedValue('open')
    const pending = deferred()
    mockReCheckout.mockReturnValue(pending.promise)
    const { latest, unmount } = setup()
    await flush()
    act(() => latest.handleReCheckoutOrder())
    unmount()
    await flush()
    pending.resolve({ data: { reCheckoutOrder: { id: 'bill-9' } } })
    await flush()
    expect(mockHistory.replace).toHaveBeenCalledWith('/order/bill-9')
    expect(JSON.parse(sessionStorage.getItem('bos.checkedOutDrafts'))[DRAFT_ID]).toMatchObject({ orderId: 'bill-9' })
  })

  it('結帳結果不確定、再確認回來前已離開頁面：不導頁、不提示', async () => {
    confirmDraftStillPending.mockResolvedValue('open')
    mockReCheckout.mockRejectedValue(Object.assign(new Error('Failed to fetch'), { networkError: new Error('Failed to fetch') }))
    const recheck = deferred()
    confirmDraftStillPendingOnDates.mockReturnValue(recheck.promise)
    const { latest, unmount } = setup()
    await flush()
    act(() => latest.handleReCheckoutOrder())
    await flush()
    expect(confirmDraftStillPendingOnDates).toHaveBeenCalled()
    unmount()
    await flush()
    recheck.resolve('closed')
    await flush()
    expect(mockHistory.replace).not.toHaveBeenCalled()
    expect(mockSnackbar).not.toHaveBeenCalled()
  })
})
