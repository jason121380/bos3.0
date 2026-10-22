// 保護什麼：側欄頂列（TopBar）的訂單佇列、推播連線、角色權限防呆與深淺色切換。
// - 訂單佇列：建立中顯示轉圈、失敗時鈴鐺轉紅並標失敗筆數；失敗訂單可編輯（前往重開單頁）、重試、刪除，失敗時提示原因。
//   建立中時 10 秒後自動重新查詢佇列。
// - WebSocket：連上（含重新連上）時加入目前店家的房間；排班、預約、QR 打卡碼的推播寫入 store；伺服器主動斷線時手動重連；
//   卸載時移除監聽並斷線（舊版重連後事件會被重複處理）。
// - 角色權限：API 失敗不讓版面拋錯；找不到登入者角色時導回個人頁；Logo 連結依「櫃檯作業」第一個頁面權限決定去處。
// - 深淺色：依後端使用者設定顯示開關；按下立即切換並存檔，存檔中不重複送出、失敗還原。
// GraphQL 由 testkit 的模擬 link 回應；socket.io-client 以假物件取代，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import Snackbar from 'elements/snackbars'
import TopBar from '../TopBar'

jest.setTimeout(20000)

// 推播連線替身：記錄監聽與送出的事件，由測試觸發伺服器事件
const mockSocket = {
  handlers: {},
  emitted: [],
  connectCount: 0,
  disconnected: false,
  connected: false,
  on(event, fn) {
    this.handlers[event] = fn
  },
  off(event) {
    if (event === undefined) this.handlers = {}
    else delete this.handlers[event]
  },
  emit(...args) {
    this.emitted.push(args)
  },
  connect() {
    this.connectCount += 1
  },
  disconnect() {
    this.disconnected = true
  },
}
jest.mock('socket.io-client', () => () => mockSocket)
// 首屏延後的查詢（訂單佇列、系統公告）在測試中直接放行
jest.mock('lib/after-first-load', () => ({ __esModule: true, default: () => true, useHoldFirstLoad: () => {} }))

const ROLE = { pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: true }] }
const baseFixtures = ({ queue = [], theme = 'DEFAULT', roles, authorityId = 'auth-1', ...overrides } = {}) => ({
  PROFILE: { me: { id: 'user-1', name: '店長', theme, merchantIdentity: { authorityName: '高階主管', authorityId } } },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '高階主管', authorityId } } },
  FETCH_USER: { user: { id: 'user-1', theme } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: roles || [{ id: 'auth-1', authorityName: '高階主管', authoritySettings: JSON.stringify([ROLE]) }],
  },
  GET_USING_ORDER_QUEUE: { getUsingOrderQueue: queue },
  GET_SYSTEM_UPDATE_RECORD: {
    systemUpdateRecord: [
      { systemUpdateId: 's2', title: '新版', content: '內容', versionNo: 'v2', updateTime: new Date(2026, 9, 20).getTime() },
      { systemUpdateId: 's1', title: '舊版', content: '內容', versionNo: 'v1', updateTime: new Date(2026, 9, 1).getTime() },
    ],
  },
  SET_THEME: { setTheme: true },
  DELETE_QUEUE: { destroyQueueById: true },
  RECHECKOUT_ORDER_FOM_QUEUE: { reCheckoutOrderFromQueue: true },
  ...overrides,
})

const order = (id, status, extra = {}) => ({
  id,
  orderNo: `A${id}`,
  status,
  orderDate: new Date(2026, 9, 22).getTime(),
  createTime: new Date(2026, 9, 22, 10, 30).getTime(),
  message: status === 'fail' ? '庫存不足' : null,
  orderInput: '{}',
  ...extra,
})

const onOpenNavBarMobile = jest.fn()
const setup = (options = {}, { withSlot = true } = {}) =>
  renderPage(
    <>
      <Snackbar />
      <TopBar userMerchants={{ loading: false, data: null }} onOpenNavBarMobile={onOpenNavBarMobile} />
      {withSlot && <span id="sidebar-merchant-switch-slot" />}
    </>,
    { fixtures: baseFixtures(options), route: '/order/create' }
  )

const bell = () => screen.getByRole('button', { name: /^訂單佇列/ })

beforeEach(() => {
  loginAs()
  mockSocket.handlers = {}
  mockSocket.emitted = []
  mockSocket.connectCount = 0
  mockSocket.disconnected = false
  mockSocket.connected = false
  document.documentElement.removeAttribute('data-color-mode')
})
afterEach(() => {
  act(() => {
    cleanup()
  })
})

describe('訂單佇列', () => {
  it('建立中顯示轉圈，失敗時鈴鐺標示失敗筆數；面板列出各筆狀態與失敗原因', async () => {
    const { settle } = setup({ queue: [order('1', 'creating'), order('2', 'fail'), order('3', 'success')] })
    await settle()
    expect(bell()).toHaveAttribute('aria-label', '訂單佇列：1 筆失敗')
    expect(within(bell()).getByText('1')).toBeInTheDocument()
    fireEvent.click(bell())
    expect(screen.getByText('#A1 訂單建立中')).toBeInTheDocument()
    expect(screen.getByText('#A2 訂單建立失敗')).toBeInTheDocument()
    expect(screen.getByText('失敗原因：庫存不足')).toBeInTheDocument()
    expect(screen.getByText('#A3 訂單建立成功')).toBeInTheDocument()
    expect(screen.getAllByText('訂單日期：2026/10/22')).toHaveLength(3)
    // 只有失敗的訂單有更多操作
    expect(screen.getAllByLabelText('更多操作')).toHaveLength(1)
  })

  it('佇列為空時面板顯示沒有進行中的工作；再按一次鈴鐺或點面板外關閉', async () => {
    const { settle } = setup()
    await settle()
    expect(bell()).toHaveAttribute('aria-label', '訂單佇列')
    fireEvent.click(bell())
    expect(screen.getByText('佇列中沒有正在進行中的工作')).toBeInTheDocument()
    fireEvent.mouseDown(bell())
    fireEvent.click(bell())
    expect(screen.queryByText('佇列中沒有正在進行中的工作')).toBeNull()
    fireEvent.click(bell())
    expect(screen.getByText('佇列中沒有正在進行中的工作')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    await wait(() => expect(screen.queryByText('佇列中沒有正在進行中的工作')).toBeNull())
  })

  it('面板按 Esc 關閉', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(bell())
    fireEvent.keyDown(screen.getByText('佇列中沒有正在進行中的工作'), { key: 'Escape' })
    await wait(() => expect(screen.queryByText('佇列中沒有正在進行中的工作')).toBeNull())
  })

  it('手機：面板以畫面水平正中、鈴鐺下緣為錨點定位（側欄抽屜太窄，往右開會被推出畫面）', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(bell())
    const panel = screen.getByText('佇列中沒有正在進行中的工作').closest('[data-side]')
    await wait(() => expect(panel).toHaveAttribute('data-side', 'bottom'))
    // 等 floating-ui 以虛擬錨點完成定位
    await act(() => new Promise(resolve => setTimeout(resolve, 50)))
    expect(panel).toHaveAttribute('data-align', 'center')
  })

  it('系統公告查詢失敗時不拋錯', async () => {
    const { settle } = setup({ GET_SYSTEM_UPDATE_RECORD: new Error('壞了') })
    await settle()
    expect(bell()).toBeInTheDocument()
  })

  it('佇列查詢失敗時不拋錯，鈴鐺維持一般狀態', async () => {
    const { settle } = setup({ GET_USING_ORDER_QUEUE: new Error('壞了') })
    await settle()
    expect(bell()).toHaveAttribute('aria-label', '訂單佇列')
  })

  it('推播送來的佇列即時更新；有建立中的訂單時 10 秒後自動重新查詢佇列', async () => {
    const { settle, calls } = setup()
    await settle()
    const before = callsOf(calls, 'GET_USING_ORDER_QUEUE').length
    jest.useFakeTimers()
    act(() => mockSocket.handlers.OrderQueue([order('9', 'creating')]))
    expect(bell().querySelector('.animate-spin')).not.toBeNull()
    act(() => jest.advanceTimersByTime(10000))
    jest.useRealTimers()
    expect(callsOf(calls, 'GET_USING_ORDER_QUEUE').length).toBe(before + 1)
    act(() => mockSocket.handlers.OrderQueue([order('9', 'success')]))
    expect(bell().querySelector('.animate-spin')).toBeNull()
  })
})

describe('失敗訂單的更多操作', () => {
  const openMore = async (options = {}) => {
    const utils = setup({ queue: [order('7', 'fail')], ...options })
    await utils.settle()
    fireEvent.click(bell())
    fireEvent.click(screen.getByLabelText('更多操作'))
    return utils
  }

  it('編輯：前往重開單頁', async () => {
    await openMore()
    fireEvent.click(screen.getByRole('menuitem', { name: '編輯' }))
    await wait(() => expect(currentLocation()).toBe('/queue-order-edit/7'))
  })

  it('重試：送出重結；成功後關閉面板', async () => {
    const { calls, settle } = await openMore()
    fireEvent.click(screen.getByRole('menuitem', { name: '重試' }))
    await settle()
    expect(callsOf(calls, 'RECHECKOUT_ORDER_FOM_QUEUE')[0].variables).toEqual({ queueId: '7' })
    await wait(() => expect(screen.queryByText('#A7 訂單建立失敗')).toBeNull())
  })

  it('重試失敗：提示原因', async () => {
    const { settle } = await openMore({ RECHECKOUT_ORDER_FOM_QUEUE: new Error('伺服器忙碌') })
    fireEvent.click(screen.getByRole('menuitem', { name: '重試' }))
    await settle()
    expect(await screen.findByText(/重結失敗/)).toBeInTheDocument()
  })

  it('刪除：送出刪除；成功後關閉面板', async () => {
    const { calls, settle } = await openMore()
    fireEvent.click(screen.getByRole('menuitem', { name: '刪除' }))
    await settle()
    expect(callsOf(calls, 'DELETE_QUEUE')[0].variables).toEqual({ queueId: '7' })
    await wait(() => expect(screen.queryByText('#A7 訂單建立失敗')).toBeNull())
  })

  it('刪除失敗：提示原因', async () => {
    const { settle } = await openMore({ DELETE_QUEUE: new Error('找不到訂單') })
    fireEvent.click(screen.getByRole('menuitem', { name: '刪除' }))
    await settle()
    expect(await screen.findByText(/刪除訂單失敗/)).toBeInTheDocument()
  })

  it('選單按 Esc 關閉', async () => {
    await openMore()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})

describe('WebSocket 推播', () => {
  it('連上時加入目前店家房間；排班／預約／QR 打卡碼寫入 store', async () => {
    const { settle, store } = setup()
    await settle()
    act(() => mockSocket.handlers.connect())
    expect(mockSocket.emitted).toContainEqual(['roomKey', 'merchant-1'])
    act(() => mockSocket.handlers.NEWSCHEDULE({ id: 'sch' }))
    act(() => mockSocket.handlers.CALENDARS([{ id: 'r1' }]))
    act(() => mockSocket.handlers.QRCODE_KEY_EXPIRED('new-key'))
    expect(store.getState().socket.schedule).toEqual({ id: 'sch' })
    expect(store.getState().reservation.reservationData).toEqual([{ id: 'r1' }])
    expect(store.getState().QRcodeClockIn.key).toBe('new-key')
  })

  it('掛載時若已連線就立即加入房間；沒有店家資料時不送 roomKey', async () => {
    mockSocket.connected = true
    const { settle } = setup({}, { withSlot: false })
    await settle()
    expect(mockSocket.emitted).toContainEqual(['roomKey', 'merchant-1'])
    mockSocket.emitted = []
    localStorage.removeItem('userMerchant')
    act(() => mockSocket.handlers.connect())
    expect(mockSocket.emitted).toEqual([])
  })

  it('伺服器主動斷線時手動重連，其他原因交給內建重連；卸載時移除監聽並斷線', async () => {
    const { settle, unmount } = setup()
    await settle()
    act(() => mockSocket.handlers.disconnect('transport close'))
    expect(mockSocket.connectCount).toBe(0)
    act(() => mockSocket.handlers.disconnect('io server disconnect'))
    expect(mockSocket.connectCount).toBe(1)
    act(() => unmount())
    expect(mockSocket.disconnected).toBe(true)
    expect(Object.keys(mockSocket.handlers)).toEqual([])
  })
})

describe('角色權限防呆', () => {
  it('「櫃檯作業」第一個頁面有權限時 Logo 連到首頁，否則連到個人頁', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(screen.getByAltText('BeautyOS').closest('a')).toHaveAttribute('href', '/'))
    cleanup()
    const denied = setup({
      roles: [{ id: 'auth-1', authorityName: '設計師', authoritySettings: JSON.stringify([{ ...ROLE, pageAuthority: [{ pageName: '打帳單', authority: false }] }]) }],
    })
    await denied.settle()
    expect(screen.getByAltText('BeautyOS').closest('a')).toHaveAttribute('href', '/profile/general')
  })

  it('角色清單查詢失敗時不拋錯、不導頁', async () => {
    const { settle } = setup({ GET_MERCHANT_AUTHORITIES: new Error('壞了') })
    await settle()
    expect(currentLocation()).toBe('/order/create')
    expect(bell()).toBeInTheDocument()
  })

  it('找不到登入者的角色時導回個人頁', async () => {
    const { settle } = setup({ authorityId: 'auth-404' })
    await settle()
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
  })
})

describe('深淺色切換', () => {
  it('後端設定為深色時顯示「切換為淺色模式」並設定 markdown 編輯器的色彩模式', async () => {
    const { settle } = setup({ theme: 'DARK' })
    await settle()
    await wait(() => expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-label', '切換為淺色模式'))
    expect(document.documentElement.getAttribute('data-color-mode')).toBe('dark')
  })

  it('按下立即切換並存檔（DARK），存檔中顯示轉圈且不重複送出', async () => {
    const { settle, calls } = setup({ SET_THEME: () => new Promise(() => {}) })
    await settle()
    expect(document.documentElement.getAttribute('data-color-mode')).toBe('light')
    const toggle = screen.getByTestId('theme-toggle')
    fireEvent.click(toggle)
    expect(toggle).toBeDisabled()
    expect(toggle.querySelector('.animate-spin')).not.toBeNull()
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(toggle)
    expect(callsOf(calls, 'SET_THEME').map(c => c.variables)).toEqual([{ input: { userId: 'user-1', theme: 'DARK' } }])
  })

  it('存檔成功後可再切回淺色（DEFAULT）', async () => {
    const { settle, calls } = setup()
    await settle()
    fireEvent.click(screen.getByTestId('theme-toggle'))
    await settle()
    await wait(() => expect(screen.getByTestId('theme-toggle')).not.toBeDisabled())
    fireEvent.click(screen.getByTestId('theme-toggle'))
    await settle()
    expect(callsOf(calls, 'SET_THEME').map(c => c.variables.input.theme)).toEqual(['DARK', 'DEFAULT'])
  })

  it('存檔失敗時還原開關狀態', async () => {
    const { settle } = setup({ SET_THEME: new Error('存檔失敗') })
    await settle()
    fireEvent.click(screen.getByTestId('theme-toggle'))
    await settle()
    await wait(() => expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false'))
    expect(screen.getByTestId('theme-toggle')).not.toBeDisabled()
  })

  it('沒有登入資料時按下不動作', async () => {
    loginAs({ user: null })
    const { settle, calls } = setup()
    await settle()
    fireEvent.click(screen.getByTestId('theme-toggle'))
    expect(callsOf(calls, 'SET_THEME')).toHaveLength(0)
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('其他按鈕', () => {
  it('收合側欄呼叫 onOpenNavBarMobile；切換店家鈕顯示目前店家並開啟切換視窗', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByLabelText('收合側欄'))
    expect(onOpenNavBarMobile).toHaveBeenCalled()
    const sw = screen.getByLabelText('切換店家（目前：測試店）')
    fireEvent.click(sw)
    expect(screen.getByRole('dialog', { name: '切換店家' })).toBeInTheDocument()
  })

  it('桌機（min-width: 1024px）時面板貼著鈴鐺往右開', async () => {
    const original = window.matchMedia
    window.matchMedia = query => ({ matches: query === '(min-width: 1024px)', addEventListener() {}, removeEventListener() {} })
    const { settle } = setup()
    await settle()
    fireEvent.click(bell())
    const panel = screen.getByText('佇列中沒有正在進行中的工作').closest('[data-side]')
    expect(panel).toHaveAttribute('data-side', 'right')
    window.matchMedia = original
  })
})
