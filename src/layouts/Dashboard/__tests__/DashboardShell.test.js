// 保護什麼：後台版面外框（layouts/Dashboard/index.js）與手機導覽（MobileNav）在 Dashboard.test.js 以外的行為：
// - 裝置不在台灣時區時，每次開啟（同一個分頁只一次）提示「日期時間以台灣時間為準」，避免出國時誤判報表區間。
// - 頁面權限檢查的參數：個人頁／員工資料頁帶 page 與 currentTab；個人頁的釘選分頁不檢查；未登入時不送檢查。
//   連個人頁基本資料都沒權限時提示「權限異常」而不是無限導頁。
// - 側欄收合／展開（桌機）與抽屜開關（手機），「跳至主要內容」只移焦點不改網址。
// - 頁面程式下載中顯示佔位；手機底部分頁列以釘選頁優先、返回鈕只在站內有上一頁時出現、捲動後頂列顯示頁名。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { useHistory } from 'react-router-dom'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import Dashboard from '..'

jest.setTimeout(20000)

jest.mock('socket.io-client', () => () => ({ on() {}, off() {}, emit() {}, connect() {}, disconnect() {} }))
// 首屏延後的查詢（釘選頁、店家清單…）在測試中直接放行
jest.mock('lib/after-first-load', () => ({ __esModule: true, default: () => true, useHoldFirstLoad: () => {} }))
// 裝置時區：預設在台灣（未替換 Date）；個別測試改成海外
const mockTimeZone = { installed: false, device: 'Asia/Taipei' }
jest.mock('lib/business-timezone', () => ({
  ...jest.requireActual('lib/business-timezone'),
  isBusinessTimeZoneInstalled: () => mockTimeZone.installed,
  getDeviceTimeZone: () => mockTimeZone.device,
}))

const ROLE = JSON.stringify([{ pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: true }] }])
const fixtures = ({ pageAllowed = true, pinned = [], ...overrides } = {}) => ({
  PROFILE: { me: { id: 'user-1', name: '店長小林', status: 'active', theme: null, avatar: null, merchantIdentity: { authorityName: '高階主管', authorityId: 'auth-1' } } },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '高階主管', authorityId: 'auth-1' } } },
  FETCH_USER: { user: { id: 'user-1', name: '店長小林', pageAuthority: { authorityName: '高階主管', pageAuthority: [] }, theme: null } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: true } },
  GET_IS_REPORT_LIST_EXTENDED: { getIsReportListExtended: true },
  GET_USERS_PINNED_TABLE: { getUserPinnedTable: pinned },
  CHECK_PAGE_AUTHORITY: { checkPageAuthority: pageAllowed },
  GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: [{ id: 'auth-1', authorityName: '高階主管', authoritySettings: ROLE }] },
  GET_USING_ORDER_QUEUE: { getUsingOrderQueue: [] },
  GET_USER_MERCHANTS: { getUserMerchant: null },
  ...overrides,
})

// 內容頁：提供站內換頁（push／replace）的按鈕
const Content = () => {
  const history = useHistory()
  return (
    <div>
      內容頁
      <button type="button" onClick={() => history.push('/management/customers')}>
        前往客戶列表
      </button>
      <button type="button" onClick={() => history.replace('/management/customers/1')}>
        取代網址
      </button>
    </div>
  )
}

const setup = (options = {}, { route = '/order/create', page = Content } = {}) =>
  renderPage(<Dashboard route={{ routes: [{ path: '*', component: page }] }} location={{ pathname: route }} />, {
    fixtures: fixtures(options),
    route,
  })

const main = () => document.getElementById('main-content')
const tabBar = () => screen.queryByRole('navigation', { name: '常用頁面' })

let innerWidth
beforeEach(() => {
  loginAs()
  localStorage.setItem('keepLogin', true)
  sessionStorage.clear()
  mockTimeZone.installed = false
  mockTimeZone.device = 'Asia/Taipei'
  innerWidth = window.innerWidth
  window.scrollY = 0
})
afterEach(() => {
  act(() => {
    cleanup()
  })
  window.innerWidth = innerWidth
})

describe('海外時區提示', () => {
  it('裝置不在台灣時區時提示一次（同一個分頁再開不重複）', async () => {
    mockTimeZone.installed = true
    mockTimeZone.device = 'America/Los_Angeles'
    const first = setup()
    await first.settle()
    expect(screen.getByText(/此裝置時區為 America\/Los_Angeles/)).toBeInTheDocument()
    act(() => {
      cleanup()
    })
    const second = setup()
    await second.settle()
    expect(screen.queryByText(/此裝置時區為/)).toBeNull()
  })

  it('取不到裝置時區名稱時顯示「非台灣時區」；sessionStorage 無法使用時仍提示', async () => {
    mockTimeZone.installed = true
    mockTimeZone.device = ''
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { settle } = setup()
    await settle()
    spy.mockRestore()
    expect(screen.getByText(/此裝置時區為 非台灣時區/)).toBeInTheDocument()
  })

  it('在台灣時區時不提示', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByText(/此裝置時區為/)).toBeNull()
  })
})

describe('頁面權限檢查的參數', () => {
  it('個人頁帶 page=PROFILE 與分頁名稱', async () => {
    const { settle, calls } = setup({}, { route: '/profile/salary' })
    await settle()
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')[0].variables.input).toEqual({ id: 'user-1', url: '/profile/salary', page: 'PROFILE', currentTab: 'salary' })
  })

  it('個人頁的釘選分頁不檢查權限', async () => {
    const { settle, calls } = setup({}, { route: '/profile/pinnedTable' })
    await settle()
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')).toHaveLength(0)
  })

  it('員工資料頁（/management/employee/<id>/<tab>）帶 page=EMPLOYEE 與分頁名稱；員工列表本身不帶', async () => {
    const { settle, calls } = setup({}, { route: '/management/employee/abc123/general' })
    await settle()
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')[0].variables.input).toEqual(
      expect.objectContaining({ page: 'EMPLOYEE', currentTab: 'general' })
    )
    act(() => {
      cleanup()
    })
    const list = setup({}, { route: '/management/employee' })
    await list.settle()
    expect(callsOf(list.calls, 'CHECK_PAGE_AUTHORITY')[0].variables.input).toEqual(expect.objectContaining({ page: null, currentTab: null }))
  })

  it('連個人頁基本資料都沒權限時提示「權限異常」，不再導頁', async () => {
    const { settle } = setup({ pageAllowed: false }, { route: '/profile/general' })
    await settle()
    expect(await screen.findByText('權限異常！請洽詢各店主管')).toBeInTheDocument()
    expect(currentLocation()).toBe('/profile/general')
  })

  it('未登入時不送權限檢查（由側欄導向登入頁）', async () => {
    localStorage.removeItem('user')
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { settle, calls } = setup()
    await settle()
    spy.mockRestore()
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')).toHaveLength(0)
  })
})

describe('側欄收合與抽屜', () => {
  it('桌機：收合側欄後改留圖示欄寬度，同一顆鈕改為展開；按下恢復', async () => {
    window.innerWidth = 1280
    const { settle } = setup()
    await settle()
    expect(main().className).toContain('lg:pl-[264px]')
    expect(main().className).toContain('[--sidebar-w:264px]')
    const version = screen.getByTestId('sidebar-app-version')
    expect(version.tagName).toBe('P')
    expect(version.closest('a')).toBeNull()
    expect(version.closest('button')).toBeNull()
    fireEvent.click(screen.getByLabelText('收合側欄'))
    expect(main().className).not.toContain('lg:pl-[264px]')
    expect(main().className).toContain('lg:pl-[80px]')
    expect(main().className).toContain('[--sidebar-w:80px]')
    const aside = document.querySelector('aside')
    const classes = aside.className.split(/\s+/)
    expect(classes).toContain('lg:w-[80px]')
    expect(classes).toContain('lg:translate-x-0')
    expect(classes).not.toContain('lg:-translate-x-full')
    expect(aside).toHaveAttribute('data-rail', 'true')
    fireEvent.click(screen.getByLabelText('展開側欄'))
    expect(main().className).toContain('lg:pl-[264px]')
    expect(screen.queryByLabelText('展開側欄')).toBeNull()
    expect(screen.getByLabelText('收合側欄')).toBeInTheDocument()
  })

  it('手機：選單鈕開啟抽屜（分頁列的選單標示開啟中），點遮罩關閉', async () => {
    window.innerWidth = 375
    const { settle } = setup()
    await settle()
    const menuBtn = within(tabBar()).getByLabelText('開啟選單')
    fireEvent.click(menuBtn)
    expect(document.querySelector('aside').className).toContain('max-lg:translate-x-0')
    expect(document.querySelector('aside').className).not.toContain('max-lg:-translate-x-full')
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true')
    // 抽屜開啟時分頁列不標示目前頁
    expect(within(tabBar()).getByText('打帳單').closest('a')).not.toHaveAttribute('aria-current')
    fireEvent.click(document.querySelector('.bg-black\\/40'))
    expect(document.querySelector('aside').className).toContain('max-lg:-translate-x-full')
  })

  it('「跳至主要內容」把焦點移到 main（暫時可聚焦，失焦後還原），不改網址', async () => {
    const { settle } = setup()
    await settle()
    const skip = screen.getByText('跳至主要內容')
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true })
    act(() => {
      skip.dispatchEvent(ev)
    })
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(main())
    expect(main()).toHaveAttribute('tabindex', '-1')
    act(() => main().blur())
    expect(main()).not.toHaveAttribute('tabindex')
    expect(currentLocation()).toBe('/order/create')
  })
})

describe('頁面載入佔位', () => {
  it('頁面程式下載中顯示進度條', async () => {
    const Never = React.lazy(() => new Promise(() => {}))
    const { settle, container } = setup({}, { page: Never })
    await settle()
    expect(container.querySelector('#printContainer .animate-pulse')).not.toBeNull()
  })
})

describe('手機導覽（MobileNav）', () => {
  it('底部分頁列以釘選頁優先（沒有對應圖示的用星號），不足 4 個以預設頁補滿且不重複', async () => {
    const { settle } = setup({ pinned: ['店家日報表', '帳單列表'] })
    await settle()
    await wait(() => expect(within(tabBar()).getAllByRole('link').map(a => a.textContent)).toEqual(['店家日報表', '帳單列表', '打帳單', '預約']))
  })

  it('站內換頁（push）到非分頁的頁面時出現返回鈕；返回後消失；replace 不增加返回深度', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByLabelText('返回')).toBeNull()
    fireEvent.click(screen.getByText('前往客戶列表'))
    await wait(() => expect(currentLocation()).toBe('/management/customers'))
    expect(screen.getByLabelText('返回')).toBeInTheDocument()
    fireEvent.click(screen.getByText('取代網址'))
    await wait(() => expect(currentLocation()).toBe('/management/customers/1'))
    expect(screen.getByLabelText('返回')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('返回'))
    await wait(() => expect(currentLocation()).toBe('/order/create'))
    expect(screen.queryByLabelText('返回')).toBeNull()
  })

  it('直接開啟建立／編輯流程頁（沒有上一頁、沒有分頁列）時，頂列保留開啟選單的入口', async () => {
    window.innerWidth = 375
    const { settle } = setup({}, { route: '/services/create' })
    await settle()
    expect(tabBar()).toBeNull()
    const header = document.querySelector('header')
    fireEvent.click(within(header).getByLabelText('開啟選單'))
    expect(document.querySelector('aside').className).toContain('translate-x-0')
    expect(main().className).not.toContain('max-lg:pb-[calc(56px+env(safe-area-inset-bottom))]')
  })

  it('捲動超過 48px 後頂列加底線並顯示頁名（取自 document.title）', async () => {
    const titleEl = document.createElement('title')
    titleEl.textContent = '服務項目'
    document.head.appendChild(titleEl)
    const { settle } = setup({}, { route: '/services/create' })
    await settle()
    const header = document.querySelector('header')
    expect(header.className).toContain('border-transparent')
    window.scrollY = 100
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(header.className).toContain('border-border')
    expect(within(header).getByText('服務項目')).toBeInTheDocument()
    await act(async () => {
      document.title = '新增服務'
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(within(header).getByText('新增服務')).toBeInTheDocument()
    titleEl.remove()
  })
})
