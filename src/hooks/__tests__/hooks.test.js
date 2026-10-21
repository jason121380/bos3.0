// 保護資料存取 hooks 的共通契約：查詢條件的店家 id 一律取自 localStorage 的 userMerchant（未登入時為 null、不拋錯）、
// mutation 包裝函式把呼叫參數原樣放進 variables（頁面依此送出帳單／刪除資料）、API 失敗時回傳 error 而不是拋錯；
// 另驗證 useToggle、useMediaQuery 的行為。GraphQL 由 MockedProvider（testkit 的模擬 link）回應，不連後端。
import React from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { act, cleanup, render, wait } from '@testing-library/react'
import { createAutoMockLink, callsOf, loginAs, MERCHANT_ID } from '../../__tests__/testkit.test'
import useFetchMerchantDesigners from 'hooks/useFetchMerchantDesigners'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchCustomers, { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import useFetchDeleteService from 'hooks/useFetchDeleteService'
import useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchOrder from 'hooks/useFetchOrder'
import useToggle from 'hooks/useToggle'
import useMediaQuery from 'hooks/useMediaQuery'

// 在 MockedProvider 內執行 hook，回傳最新結果與送出的查詢紀錄
function renderHook(useHook, { fixtures = {}, fallback = 'empty' } = {}) {
  const calls = []
  const link = createAutoMockLink(fixtures, { fallback, calls })
  const result = { current: undefined }
  function Probe() {
    result.current = useHook()
    return null
  }
  render(
    <MockedProvider link={link} addTypename={false}>
      <Probe />
    </MockedProvider>
  )
  return { result, calls }
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('查詢條件的店家 id 取自 userMerchant', () => {
  it.each([
    ['useFetchMerchantDesigners', () => useFetchMerchantDesigners(), 'FETCH_DESIGNERS'],
    ['useFetchMerchantCommissionWay', () => useFetchMerchantCommissionWay(), 'MERCHANT_COMMISSION_WAY'],
    ['useFetchMerchantHelperItems', () => useFetchMerchantHelperItems(), 'MERCHANT_HELPER_ITEMS'],
    ['useFetchMerchantCustomerCategory', () => useFetchMerchantCustomerCategory(), 'CUSTOMER_CATEGORY'],
  ])('%s', async (_name, useHook, operationName) => {
    const { calls } = renderHook(useHook)
    await wait(() => expect(calls.length).toBeGreaterThan(0))
    const call = callsOf(calls, operationName)[0]
    expect(call.variables.merchantId).toBe(MERCHANT_ID)
  })

  it('未登入店家（沒有 userMerchant）時以 null 查詢，不拋錯', async () => {
    localStorage.removeItem('userMerchant')
    const { calls, result } = renderHook(() => useFetchMerchantDesigners())
    await wait(() => expect(calls.length).toBe(1))
    expect(calls[0].variables.merchantId).toBeNull()
    expect(result.current).toBeDefined()
  })

  it('顧客列表：頁面條件與店家 id 合併成 input', async () => {
    const { calls } = renderHook(() => useFetchCustomers({ pageLimit: 20, pageOffset: 0, keyword: '陳' }))
    await wait(() => expect(calls.length).toBe(1))
    expect(calls[0].variables.input).toEqual({ pageLimit: 20, pageOffset: 0, keyword: '陳', merchantId: MERCHANT_ID })
  })

  it('打帳單的顧客搜尋：有指定顧客時才帶 customerId，其餘條件照傳', async () => {
    const { calls } = renderHook(() => useFetchCustomersInAutoComplete({ keyword: '0912', customerId: 'c1', pageLimit: 10 }))
    await wait(() => expect(calls.length).toBe(1))
    expect(calls[0].variables.input).toEqual(
      expect.objectContaining({ merchantId: MERCHANT_ID, keyword: '0912', customerId: 'c1', pageLimit: 10 })
    )
    cleanup()

    const second = renderHook(() => useFetchCustomersInAutoComplete({ keyword: '' }))
    await wait(() => expect(second.calls.length).toBe(1))
    expect(second.calls[0].variables.input).not.toHaveProperty('customerId')
  })
})

describe('mutation 包裝函式：參數原樣放進 variables', () => {
  it('打帳單：createOrder／checkOrder 以 { input } 送出', async () => {
    const { result, calls } = renderHook(() => useFetchCreateOrder(), {
      fixtures: { FETCH_CREATE_ORDER: { createOrder2: 'A001' }, CHECK_ORDER: { checkOrder: true } },
    })
    const bill = { designerId: 'd1', serviceOrders: [{ serviceId: 's1', price: 800 }] }
    let res
    await act(async () => {
      res = await result.current.createOrder(bill)
    })
    expect(res.data.createOrder2).toBe('A001')
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables).toEqual({ input: bill })
    await act(async () => {
      await result.current.checkOrder(bill)
    })
    expect(callsOf(calls, 'CHECK_ORDER')[0].variables).toEqual({ input: bill })
  })

  it('重新結帳與儲存帳單：updateOrderId／orderInput／password 一起放在 input', async () => {
    const input = { updateOrderId: 'o1', orderInput: { designerId: 'd1' }, password: '1234' }
    const re = renderHook(() => useFetchReCheckoutOrder(), { fixtures: { reCheckoutOrder: { reCheckoutOrder: { id: 'o1' } } } })
    await act(async () => {
      await re.result.current.fetchReCheckoutOrder(input)
    })
    expect(callsOf(re.calls, 'reCheckoutOrder')[0].variables).toEqual({ input })
    cleanup()

    const up = renderHook(() => useFetchUpdateOrder(), { fixtures: { UpdateOrder: { updateOrder: { id: 'o1' } } } })
    await act(async () => {
      await up.result.current.updateOrder(input)
    })
    expect(callsOf(up.calls, 'UpdateOrder')[0].variables).toEqual({ input })
  })

  it('新增顧客、刪除服務、刪除佇列', async () => {
    const add = renderHook(() => useFetchAddCustomer(), { fixtures: { FETCH_ADD_CUSTOMER: { addCustomer: { id: 'c9' } } } })
    await act(async () => {
      await add.result.current.addCustomer({ input: { name: '新客', cellphone: '0900' } })
    })
    expect(callsOf(add.calls, 'FETCH_ADD_CUSTOMER')[0].variables).toEqual({ input: { name: '新客', cellphone: '0900' } })
    cleanup()

    const del = renderHook(() => useFetchDeleteService(), { fixtures: { DEL_COUPONS: { deleteService: true } } })
    await act(async () => {
      await del.result.current.deleteService({ itemIds: ['s1'], password: 'p' })
    })
    expect(callsOf(del.calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['s1'], password: 'p' })
    cleanup()

    const queue = renderHook(() => useFetchDestroyQueueById(), { fixtures: { DELETE_QUEUE: { destroyQueueById: true } } })
    await act(async () => {
      await queue.result.current.destroyQueueById({ queueId: 'q1' })
    })
    expect(callsOf(queue.calls, 'DELETE_QUEUE')[0].variables).toEqual({ queueId: 'q1' })
  })

  it('mutation 失敗時 Promise 被拒絕（頁面以 catch 提示），不在 hook 內吞掉', async () => {
    const { result } = renderHook(() => useFetchCreateOrder(), { fixtures: { FETCH_CREATE_ORDER: new Error('庫存不足') } })
    let error
    await act(async () => {
      await result.current.createOrder({}).catch(e => {
        error = e
      })
    })
    expect(error.message).toContain('庫存不足')
  })
})

describe('查詢失敗與資料', () => {
  it('API 失敗時回傳 error、data 為 undefined，不拋錯（頁面須自行防呆）', async () => {
    const { result } = renderHook(() => useFetchGetIsMemberShipCardActive(), { fallback: 'error' })
    await wait(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeDefined()
    expect(result.current.data).toBeUndefined()
  })

  it('成功時回傳後端資料', async () => {
    const { result } = renderHook(() => useFetchGetIsMemberShipCardActive(), {
      fixtures: { GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } },
    })
    await wait(() => expect(result.current.data).toEqual({ getIsMemberShipCardActive: true }))
  })

  it('帳單明細以帳單 id 查詢', async () => {
    const { calls } = renderHook(() => useFetchOrder({ id: 'order-9' }))
    await wait(() => expect(callsOf(calls, 'FETCH_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ORDER')[0].variables).toEqual({ orderId: 'order-9' })
  })
})

describe('useToggle', () => {
  it('toggle 反轉開關，setOpen 直接指定', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.open).toBe(false)
    act(() => result.current.toggle())
    expect(result.current.open).toBe(true)
    act(() => result.current.setOpen(false))
    expect(result.current.open).toBe(false)
  })
})

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia
  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('沒有 matchMedia 的環境回傳 false', () => {
    window.matchMedia = undefined
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)
  })

  it('依 media query 結果回傳，視窗變化時更新；卸載時移除監聽', async () => {
    let listener
    const mql = {
      matches: true,
      addEventListener: (_type, fn) => {
        listener = fn
      },
      removeEventListener: jest.fn(),
    }
    window.matchMedia = () => mql
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(true)
    mql.matches = false
    act(() => listener())
    expect(result.current).toBe(false)
    cleanup()
    // React 17 的 effect 清除在卸載後非同步執行
    await wait(() => expect(mql.removeEventListener).toHaveBeenCalled())
  })

  it('舊版 Safari 只有 addListener／removeListener 也能運作', async () => {
    let listener
    const mql = {
      matches: false,
      addListener: fn => {
        listener = fn
      },
      removeListener: jest.fn(),
    }
    window.matchMedia = () => mql
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'))
    expect(result.current).toBe(false)
    mql.matches = true
    act(() => listener())
    expect(result.current).toBe(true)
    cleanup()
    await wait(() => expect(mql.removeListener).toHaveBeenCalled())
  })
})
