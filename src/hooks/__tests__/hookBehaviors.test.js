// 保護 src/hooks 中「不只是包一支查詢」的 hook 行為（契約表格 contracts.*.test.js 之外）：
// - useCheckDisablePendingOrder：參數設定關閉掛單時，掛單列表／掛單詳細要提示並導回打帳單，避免繞過設定建立掛單
// - useQueryString：報表與搜尋列從網址讀查詢參數（designerId、date…），讀錯會查到別的員工或日期
// - useMounted／usePageLoading：清除快取頁、新增顧客彈窗依賴的掛載時機
// - useStore：商品分類編輯頁以 Provider 把表單狀態傳給子元件
// - 預設值分支：顧客搜尋的 keyword 預設、票券查詢的空條件、登入取個人資料不帶變數、服務分類假資料的店家 id
// - 同名查詢：店家權限、登入者權限、第三方卡券三支查詢的 operation name 都是 FETCH_THIRDPARTYS（維持原名），各自拿到自己的欄位
// GraphQL 一律由 testkit 的模擬 link 回應，不連後端。
import { MockedProvider } from '@apollo/client/testing'
import { act, cleanup, render, wait } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { createAutoMockLink, loginAs, MERCHANT_ID } from '../../__tests__/testkit.test'
import { observeHook } from './hookContract.test'
import { openSnackbar } from 'elements/snackbars'
import useCheckDisablePendingOrder from 'hooks/useCheckDisablePendingOrder'
import useQueryString from 'hooks/useQueryString'
import useMounted from 'hooks/useMounted'
import usePageLoading from 'hooks/usePageLoading'
import useStore, { Provider as StoreProvider } from 'hooks/useStore'
import { useFetchCustomersInAutoComplete } from 'hooks/useFetchCustomers'
import { useFetchTicketsInOrderDetail, useFetchTicketsForList } from 'hooks/useFetchTickets'
import { useLazyFetchProfile, useFetchMePermissions } from 'hooks/useFetchProfile'
import { useFetchMerchantPermission, useFetchTHirdPartys } from 'hooks/useFetchMerchant'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

afterEach(cleanup)

// 在路由與 Apollo 內執行 hook；回傳最新結果、每次 render 的結果、目前網址
function mount(useHook, { fixtures = {}, fallback = 'empty', route = '/draft-order/list', onError } = {}) {
  const calls = []
  const link = createAutoMockLink(fixtures, { calls, fallback })
  const result = { current: undefined, history: [] }
  const location = { current: null }
  function Probe() {
    result.current = useHook()
    result.history.push(result.current)
    return null
  }
  class Boundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { failed: false }
    }

    static getDerivedStateFromError() {
      return { failed: true }
    }

    componentDidCatch(error) {
      if (onError) onError(error)
    }

    render() {
      return this.state.failed ? <p>頁面錯誤</p> : this.props.children
    }
  }
  const utils = render(
    <MockedProvider link={link} addTypename={false}>
      <MemoryRouter initialEntries={[route]}>
        <Boundary>
          <Probe />
        </Boundary>
        <Route
          render={({ location: loc }) => {
            location.current = loc.pathname + loc.search
            return null
          }}
        />
      </MemoryRouter>
    </MockedProvider>
  )
  return { ...utils, result, calls, location, link }
}

describe('useCheckDisablePendingOrder：掛單功能關閉時導回打帳單', () => {
  const setting = disablePendingOrder => ({ GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder } } })

  it('設定為關閉：跳出警告並導到 /order/create', async () => {
    const { location } = mount(() => useCheckDisablePendingOrder(), { fixtures: setting(true) })
    await wait(() => expect(location.current).toBe('/order/create'))
    expect(openSnackbar).toHaveBeenCalledTimes(1)
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '掛單功能已關閉' })
  })

  it('設定為開啟：留在原頁、不提示', async () => {
    const { location, calls, link } = mount(() => useCheckDisablePendingOrder(), { fixtures: setting(false) })
    await wait(() => expect(calls).toHaveLength(1))
    await wait(() => expect(link.pending).toBe(0))
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(location.current).toBe('/draft-order/list')
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('設定還在載入時不導頁（避免設定未到就把使用者踢走）', () => {
    const { location } = mount(() => useCheckDisablePendingOrder(), { fixtures: setting(true) })
    expect(location.current).toBe('/draft-order/list')
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  // Jason 2026/10/22 fix all：原本查詢失敗時 data 為 undefined，hook 直接讀 data.getParameterAboutSettingFunction 而拋錯，
  // 掛單列表／掛單詳細整頁變成錯誤畫面；改為查詢失敗時不拋錯、不導頁（errorLink 已跳錯誤提示）
  it('設定查詢失敗時不拋錯、不導頁、不提示', async () => {
    const errors = []
    const { calls, link, location, queryByText } = mount(() => useCheckDisablePendingOrder(), { fallback: 'error', onError: e => errors.push(e) })
    await wait(() => expect(calls).toHaveLength(1))
    await wait(() => expect(link.pending).toBe(0))
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(errors).toEqual([])
    expect(queryByText('頁面錯誤')).toBeNull()
    expect(location.current).toBe('/draft-order/list')
    expect(openSnackbar).not.toHaveBeenCalled()
  })
})

describe('useQueryString：從網址讀查詢參數', () => {
  const read = (route, key) => {
    const { result } = mount(() => useQueryString(), { route })
    const [getQueryString] = result.current
    const value = getQueryString(key)
    cleanup()
    return value
  }

  it('讀出指定參數並解碼（中文、空白）', () => {
    expect(read('/report?designerId=d-1&date=2026-10', 'designerId')).toBe('d-1')
    expect(read('/report?designerId=d-1&date=2026-10', 'date')).toBe('2026-10')
    expect(read('/report?keyword=%E9%99%B3%20%E5%B0%8F%E7%BE%8E', 'keyword')).toBe('陳 小美')
  })

  it('參數名稱不分大小寫', () => {
    expect(read('/report?DesignerId=d-2', 'designerid')).toBe('d-2')
  })

  it('沒有這個參數、或只有名稱沒有值時回傳空字串', () => {
    expect(read('/report?date=2026-10', 'designerId')).toBe('')
    expect(read('/report?designerId', 'designerId')).toBe('')
    expect(read('/report', 'designerId')).toBe('')
  })

  it('只比對完整參數名稱：前面多字元的參數不會被誤認', () => {
    expect(read('/report?xdesignerId=d-9', 'designerId')).toBe('')
  })

  it('參數名稱中的 . + * 以字面比對（不當成正規表示式）', () => {
    expect(read('/report?a.b=1', 'a.b')).toBe('1')
    expect(read('/report?axb=1', 'a.b')).toBe('')
  })
})

// Jason 2026/10/22 fix all：原本 useMounted 回傳 ref（第一次 render 為 false），清除快取頁第一次 render 就走 Redirect，
// 「清除快取中...」永遠不顯示；改為回傳「callback 是否已執行」的 state：執行前為 false、執行後重新 render 為 true
describe('useMounted：掛載後執行一次 callback', () => {
  it('掛載後執行 callback 一次；執行前回傳 false、執行後重新 render 為 true，之後 render 也不再執行', () => {
    const callback = jest.fn()
    const values = []
    function Probe({ tick }) {
      values.push(useMounted(callback))
      return <span>{tick}</span>
    }
    const { rerender } = render(<Probe tick={1} />)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(values).toEqual([false, true])
    rerender(<Probe tick={2} />)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(values).toEqual([false, true, true])
  })

  it('清除快取頁的用法：callback 清空 localStorage', () => {
    loginAs()
    function Probe() {
      useMounted(() => localStorage.clear())
      return null
    }
    render(<Probe />)
    expect(localStorage.getItem('userMerchant')).toBeNull()
  })

  it('callback 是必填：沒傳時在 effect 拋 TypeError', () => {
    function Probe() {
      useMounted()
      return null
    }
    const silence = jest.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<Probe />)).toThrow(TypeError)
    } finally {
      silence.mockRestore()
    }
  })
})

describe('usePageLoading：第一次 render 為載入中，掛載後結束', () => {
  it('依序回傳 loading true → false', async () => {
    const { result } = mount(() => usePageLoading())
    expect(result.history[0]).toEqual({ loading: true })
    await wait(() => expect(result.current).toEqual({ loading: false }))
  })
})

describe('useStore：讀取最近的 Provider 提供的值', () => {
  it('子元件拿到 Provider 的 value；沒有 Provider 時為 undefined', () => {
    const seen = []
    function Child() {
      seen.push(useStore())
      return null
    }
    const value = { category: { name: '洗髮' }, setCategory: () => {} }
    render(
      <StoreProvider value={value}>
        <Child />
      </StoreProvider>
    )
    render(<Child />)
    expect(seen[0]).toBe(value)
    expect(seen[1]).toBeUndefined()
  })
})

describe('預設值分支', () => {
  it('顧客搜尋：沒有指定顧客與關鍵字時 keyword 為空字串、不帶 customerId；未登入時店家 id 為 null', async () => {
    const loggedIn = await observeHook(useFetchCustomersInAutoComplete, { args: [{ pageLimit: 10, pageOffset: 0 }] })
    expect(loggedIn.initial).toEqual([
      {
        operationName: 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE',
        variables: { input: { merchantId: MERCHANT_ID, pageLimit: 10, keyword: '', pageOffset: 0 } },
      },
    ])
    const loggedOut = await observeHook(useFetchCustomersInAutoComplete, { args: [{ keyword: '0912' }], loggedIn: false })
    expect(loggedOut.initial[0].variables).toEqual({ input: { merchantId: null, keyword: '0912' } })
    const withCustomer = await observeHook(useFetchCustomersInAutoComplete, { args: [{ customerId: 'c-1' }], loggedIn: false })
    expect(withCustomer.initial[0].variables).toEqual({ input: { merchantId: null, keyword: '', customerId: 'c-1' } })
  })

  it.each([
    ['useFetchTicketsInOrderDetail', useFetchTicketsInOrderDetail, 'GET_TICKETS_IN_ORDER_DETAIL'],
    ['useFetchTicketsForList', useFetchTicketsForList, 'GET_TICKETS_FOR_LIST'],
  ])('%s：沒給關鍵字與分類時以空字串、空陣列查全部', async (_name, useHook, operationName) => {
    const obs = await observeHook(useHook, { args: [{}] })
    expect(obs.initial).toEqual([{ operationName, variables: { keyword: '', categoryIds: [] } }])
  })

  // Jason 2026/10/22 fix all：原本送出 PROFILE 查詢沒有宣告的 orders 變數（後端不會用到），已移除
  it('登入取個人資料：不帶變數查詢', async () => {
    const obs = await observeHook(useLazyFetchProfile, { invoke: [{ fn: 'fetchProfile' }] })
    expect(obs.invoked[0].calls).toEqual([{ operationName: 'PROFILE', variables: {} }])
  })

  it('服務分類假資料（ServiceCategoryCreate 頁面測試用）在載入模組時讀店家 id', () => {
    loginAs()
    jest.isolateModules(() => {
      const { mockServiceCreateRes } = require('hooks/useFetchServiceCategoryCreate')
      expect(mockServiceCreateRes.data.createServiceCategory[0].OfficialBrandMerchantId).toBe(MERCHANT_ID)
    })
    localStorage.clear()
    jest.isolateModules(() => {
      const { mockServiceCreateRes } = require('hooks/useFetchServiceCategoryCreate')
      expect(mockServiceCreateRes.data.createServiceCategory[0].OfficialBrandMerchantId).toBeNull()
    })
  })
})

// 三支查詢原本就同名 FETCH_THIRDPARTYS。曾改名為 FETCH_MERCHANT_PERMISSION／FETCH_ME_PERMISSIONS，已撤回：
// 後端可能依 operation name 記錄或判斷，前端無法確認，不冒險（Jason 2026/10/22）。
// 測試的 fixture 以名稱對應，同名時用函式依查詢的根欄位與選取欄位回應（不改產品碼的名稱）。
describe('同名查詢 FETCH_THIRDPARTYS：店家權限、登入者權限、第三方卡券', () => {
  const PERMISSIONS = [{ id: 'p1', name: '帳單', code: 'ORDER', actions: [{ id: 'a1', name: '新增', code: 'CREATE' }] }]
  const COUPONS = [{ id: 't1', name: '街口', fee: 1, type: 'A' }]
  const byQuery = (_variables, operation) => {
    const root = operation.query.definitions.find(d => d.kind === 'OperationDefinition').selectionSet.selections[0]
    if (root.name.value === 'me') return { me: { id: 'u1', permissionActions: [{ id: 'a1' }] } }
    const fields = root.selectionSet.selections.map(sel => sel.name.value)
    return fields.includes('permissions')
      ? { merchant: { id: 'm1', permissions: PERMISSIONS } }
      : { merchant: { id: 'm1', thirdpartyCoupons: COUPONS } }
  }

  it.each([
    ['useFetchMerchantPermission', useFetchMerchantPermission, { merchant: { id: 'm1', permissions: PERMISSIONS } }],
    ['useFetchMePermissions', useFetchMePermissions, { me: { id: 'u1', permissionActions: [{ id: 'a1' }] } }],
    ['useFetchTHirdPartys', useFetchTHirdPartys, { merchant: { id: 'm1', thirdpartyCoupons: COUPONS } }],
  ])('%s：送出 FETCH_THIRDPARTYS，拿到自己的欄位', async (_name, useHook, expected) => {
    loginAs()
    const { result, calls } = mount(useHook, { fixtures: { FETCH_THIRDPARTYS: byQuery } })
    await wait(() => expect(result.current.data).toEqual(expected))
    expect(calls.map(c => c.operationName)).toEqual(['FETCH_THIRDPARTYS'])
  })
})
