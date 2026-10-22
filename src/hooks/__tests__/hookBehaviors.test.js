// 保護 src/hooks 中「不只是包一支查詢」的 hook 行為（契約表格 contracts.*.test.js 之外）：
// - useCheckDisablePendingOrder：參數設定關閉掛單時，掛單列表／掛單詳細要提示並導回打帳單，避免繞過設定建立掛單
// - useQueryString：報表與搜尋列從網址讀查詢參數（designerId、date…），讀錯會查到別的員工或日期
// - useMounted／usePageLoading：清除快取頁、新增顧客彈窗依賴的掛載時機
// - useStore：商品分類編輯頁以 Provider 把表單狀態傳給子元件
// - 預設值分支：顧客搜尋的 keyword 預設、票券查詢的空條件、登入資料的 orders、服務分類假資料的店家 id
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
import { useLazyFetchProfile } from 'hooks/useFetchProfile'

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

  // 已知缺口（待 Jason 決定）：查詢失敗時 data 為 undefined，hook 直接讀 data.getParameterAboutSettingFunction 而拋錯，
  // 掛單列表／掛單詳細整頁變成錯誤畫面（PageErrorBoundary），而不是只跳 errorLink 的提示。這裡鎖住目前行為。
  it('已知缺口：設定查詢失敗時拋 TypeError（整頁錯誤）', async () => {
    const errors = []
    const { findByText } = mount(() => useCheckDisablePendingOrder(), { fallback: 'error', onError: e => errors.push(e) })
    await findByText('頁面錯誤')
    expect(errors[0]).toBeInstanceOf(TypeError)
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

describe('useMounted：掛載後執行一次 callback', () => {
  it('掛載後執行 callback 一次；第一次 render 回傳 false、重新 render 也不再執行', () => {
    const callback = jest.fn()
    const values = []
    function Probe({ tick }) {
      values.push(useMounted(callback))
      return <span>{tick}</span>
    }
    const { rerender } = render(<Probe tick={1} />)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(values[0]).toBe(false)
    rerender(<Probe tick={2} />)
    expect(callback).toHaveBeenCalledTimes(1)
    // 掛載後再 render 時 ref 已為 true（清除快取頁只有第一次 render，因此一律走 Redirect）
    expect(values[1]).toBe(true)
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

  it('登入取個人資料：有 params 但沒有 orders 時以空物件查詢', async () => {
    const obs = await observeHook(useLazyFetchProfile, { args: [{}], invoke: [{ fn: 'fetchProfile' }] })
    expect(obs.invoked[0].calls).toEqual([{ operationName: 'PROFILE', variables: { orders: {} } }])
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
