// 保護什麼：側欄選單（NavBar）在 Dashboard.test.js 以外的行為：
// - 釘選頁：後端回傳的頁名對到 helper/pageData 才顯示（對不到的略過），寫入 store 供手機底部分頁列使用；搜尋時也篩選釘選頁。
// - 搜尋：關鍵字命中分類名稱時整個分類的頁面都留下；Esc 或再按一次搜尋鈕關閉並恢復完整選單。
// - 掛單參數查不到時比照停用（不顯示掛單列表）。
// - 帳號狀態：被停權（banned）時清除登入資料並導回登入頁。
// - 保持登入：沒有 keepLogin cookie 時，勾選保持登入者補上 cookie、沒勾選者登出。
// - 底部使用者區：沒有名稱／角色時顯示預設文字，有大頭貼時顯示圖片。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import NavBar from '../NavBar'

jest.setTimeout(20000)
// 釘選頁查詢在測試中直接放行（正式環境延後到首屏完成）
jest.mock('lib/after-first-load', () => ({ __esModule: true, default: () => true, useHoldFirstLoad: () => {} }))

const fixtures = ({ me = {}, pinned = [], pending = { disablePendingOrder: false }, ...overrides } = {}) => ({
  PROFILE: { me: { id: 'user-1', name: '店長小林', status: 'active', theme: null, avatar: null, merchantIdentity: { authorityName: '高階主管', authorityId: 'auth-1' }, ...me } },
  FETCH_USER: { user: { id: 'user-1', pageAuthority: { authorityName: '高階主管', pageAuthority: [] } } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: pending },
  GET_IS_REPORT_LIST_EXTENDED: { getIsReportListExtended: true },
  GET_USERS_PINNED_TABLE: { getUserPinnedTable: pinned },
  ...overrides,
})

const Shell = props => (
  <>
    {/* TopBar 提供的搜尋鈕插槽 */}
    <span id="sidebar-search-slot" />
    <aside>
      <NavBar onMobileClose={() => {}} openMobile={false} openDesktop {...props} />
    </aside>
  </>
)
const setup = (options, { route = '/order/create', props } = {}) => renderPage(<Shell {...props} />, { fixtures: fixtures(options), route })
const sidebar = () => within(document.querySelector('aside'))
const link = title => sidebar().queryByText(title, { selector: 'a, a *' })
const group = title => sidebar().queryByText(title, { selector: 'button, button *' })
const clearCookies = () => {
  document.cookie.split(';').forEach(c => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
}

beforeEach(() => {
  loginAs()
  clearCookies()
  // 與瀏覽器相同：布林值存成 'true'／'false'
  localStorage.setItem('keepLogin', true)
})
afterEach(() => {
  act(() => {
    cleanup()
  })
})

describe('釘選頁', () => {
  it('只顯示對得到頁面清單的釘選頁，並寫入 store', async () => {
    const { settle, store } = setup({ pinned: ['帳單列表', '已下架的頁面'] })
    await settle()
    expect(store.getState().pinnedTable.table).toEqual([{ title: '帳單列表', href: '/management/orders' }])
    expect(sidebar().getByText('釘選')).toBeInTheDocument()
    fireEvent.click(group('釘選頁面'))
    expect(sidebar().getAllByText('帳單列表', { selector: 'a, a *' }).length).toBeGreaterThan(0)
  })

  it('搜尋時釘選頁也依關鍵字篩選並自動展開', async () => {
    const { settle } = setup({ pinned: ['帳單列表', '打帳單'] })
    await settle()
    fireEvent.click(screen.getByLabelText('搜尋選單'))
    fireEvent.change(screen.getByPlaceholderText('搜尋選單'), { target: { value: '帳單列表' } })
    // 釘選群組＋櫃檯作業各一個「帳單列表」
    expect(sidebar().getAllByText('帳單列表', { selector: 'a, a *' })).toHaveLength(2)
    expect(link('打帳單')).toBeNull()
  })

  it('釘選頁查詢失敗時不拋錯、不顯示釘選區', async () => {
    const { settle, store } = setup({ GET_USERS_PINNED_TABLE: new Error('壞了') })
    await settle()
    expect(store.getState().pinnedTable.table).toEqual([])
    expect(sidebar().queryByText('釘選')).toBeNull()
    expect(group('櫃檯作業')).toBeInTheDocument()
  })
})

describe('搜尋', () => {
  it('關鍵字命中分類名稱時保留整個分類的頁面', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByLabelText('搜尋選單'))
    fireEvent.change(screen.getByPlaceholderText('搜尋選單'), { target: { value: '櫃檯' } })
    expect(link('打帳單')).toBeInTheDocument()
    expect(link('每日結帳')).toBeInTheDocument()
    expect(group('客戶管理')).toBeNull()
  })

  it('Esc 關閉搜尋；再按一次搜尋鈕也會關閉', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByLabelText('搜尋選單'))
    fireEvent.keyDown(screen.getByPlaceholderText('搜尋選單'), { key: 'a' })
    expect(screen.getByPlaceholderText('搜尋選單')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByPlaceholderText('搜尋選單'), { key: 'Escape' })
    expect(screen.queryByPlaceholderText('搜尋選單')).toBeNull()
    const toggle = screen.getByRole('button', { name: '搜尋選單' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(toggle)
    expect(screen.queryByPlaceholderText('搜尋選單')).toBeNull()
  })
})

describe('店家參數', () => {
  it('掛單參數查不到（null）時比照停用：沒有掛單列表', async () => {
    const { settle } = setup({ pending: null })
    await settle()
    expect(link('打帳單')).toBeInTheDocument()
    expect(link('掛單列表')).toBeNull()
  })
})

describe('帳號與登入狀態', () => {
  it('被停權（banned）時清除登入資料並導回登入頁', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { settle } = setup({ me: { status: 'banned' } })
    await settle()
    spy.mockRestore()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('登入資料沒有 id 時以 null 查詢使用者權限', async () => {
    loginAs({ user: { name: '無 id' } })
    localStorage.setItem('keepLogin', true)
    const { settle, calls } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_USER')[0].variables).toEqual({ input: { id: null } })
  })

  it('保持登入：沒有 cookie 時補上 keepLogin cookie；已有 cookie 時不動', async () => {
    const { settle } = setup()
    await settle()
    expect(document.cookie).toContain('keepLogin=hello')
    cleanup()
    const again = setup()
    await again.settle()
    expect(localStorage.getItem('user')).not.toBeNull()
  })

  it('沒勾選保持登入且 cookie 已過期（關閉瀏覽器後）時登出', async () => {
    localStorage.setItem('keepLogin', false)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    setup()
    spy.mockRestore()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('沒有目前店家資料時清除登入資料並導回登入頁', async () => {
    localStorage.removeItem('userMerchant')
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    setup()
    spy.mockRestore()
    expect(localStorage.getItem('user')).toBeNull()
  })
})

describe('底部使用者區', () => {
  it('沒有名稱與角色名稱時顯示預設文字', async () => {
    const { settle } = setup({ me: { name: '', merchantIdentity: { authorityName: '', authorityId: 'auth-1' } } })
    await settle()
    expect(screen.getByText('使用者名稱')).toBeInTheDocument()
    expect(screen.getByText('權限未設定')).toBeInTheDocument()
  })

  it('有大頭貼時顯示圖片', async () => {
    const { settle, container } = setup({ me: { avatar: 'https://example.com/a.png' } })
    await settle()
    expect(container.querySelector('img[src="https://example.com/a.png"]')).not.toBeNull()
  })
})

describe('重新渲染條件', () => {
  it('掛載與換頁時呼叫 onMobileClose（關閉手機抽屜）；openMobile 改變時重新渲染', async () => {
    const onMobileClose = jest.fn()
    const Harness = () => {
      const [openMobile, setOpenMobile] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpenMobile(o => !o)}>
            切換抽屜
          </button>
          <Shell onMobileClose={onMobileClose} openMobile={openMobile} />
        </>
      )
    }
    const { settle } = renderPage(<Harness />, { fixtures: fixtures(), route: '/order/create' })
    await settle()
    expect(onMobileClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByText('切換抽屜'))
    fireEvent.click(screen.getByText('切換抽屜'))
    expect(group('櫃檯作業')).toBeInTheDocument()
    fireEvent.click(link('帳單列表'))
    await wait(() => expect(onMobileClose).toHaveBeenCalledTimes(2))
  })
})
