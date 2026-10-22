// 保護後台登入頁（/auth/login）。守住：
// - 送出的登入 mutation：一般登入送 LOGINV2（電話、密碼、是否保持登入），從 LINE 進來（localStorage 有 liffId）送 LOGINFORLINE（電話、密碼）
// - 存進 localStorage 的登入者資料只有 id／name／isAdmin／isNeedChangePassword（lib/stored-user），手機號碼、uid、userCode、solmateKey 不落地；
//   一般登入另存 token、保持登入設定；店家（userMerchant）已存在時不覆蓋，沒有時存登入回傳的品牌店家
// - 個人資料查回後才導頁：網址帶 redirect 時導回原頁，沒帶時到首頁
// - 電話含空白時提示且不送出；登入或讀個人資料失敗時按鈕恢復可按（不會卡在「登入中」）
// 不連任何後端：GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import Login from '..'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const LOGIN_USER = {
  id: 'u-1',
  cellphone: '0912345678',
  uid: 'uid-secret',
  userCode: 'code-secret',
  status: 'ACTIVE',
  isNeedChangePassword: true,
  firstName: '小',
  lastName: '王',
  name: '王小明',
  merchants: [{ id: 'm-1', name: '一店', solmateKey: 'solmate-secret' }],
  isAdmin: false,
}
const PRIVATE = /0912345678|uid-secret|code-secret|solmate-secret|cellphone|merchants/

// setupTests 的 localStorage 假物件 setItem 會再 JSON.stringify；登入頁以字串比對 liffId，這裡改成與瀏覽器相同的行為
let store
beforeEach(() => {
  store = {}
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(k => (k in store ? store[k] : null))
  jest.spyOn(window.localStorage, 'setItem').mockImplementation((k, v) => {
    store[k] = String(v)
  })
  jest.spyOn(window.localStorage, 'removeItem').mockImplementation(k => {
    delete store[k]
  })
  jest.spyOn(window.localStorage, 'clear').mockImplementation(() => {
    store = {}
  })
})
afterEach(cleanup)

const fixtures = (extra = {}) => ({
  LOGINV2: {
    userLoginV2: { token: 'tkn-1', user: LOGIN_USER, officialBrandMerchantId: 'brand-1', officialBrandMerchantName: '品牌店' },
  },
  LOGINFORLINE: { userLoginForLine: LOGIN_USER },
  PROFILE: { me: { id: 'u-1', name: '王小明' } },
  ...extra,
})

const setup = ({ search = '', extra } = {}) =>
  renderPage(<Login location={{ pathname: '/auth/login', search }} />, {
    route: `/auth/login${search}`,
    fixtures: fixtures(extra),
  })

const fill = (cellphone, password) => {
  fireEvent.change(screen.getByTestId('cellphone'), { target: { value: cellphone } })
  fireEvent.change(screen.getByTestId('password'), { target: { value: password } })
}
const loginBtn = () => screen.getByTestId('login-btn')

describe('畫面與欄位檢查', () => {
  it('顯示標題、忘記密碼連到重設密碼頁；電話、密碼必填', async () => {
    const utils = setup()
    expect(screen.getByText('登入系統')).toBeInTheDocument()
    expect(screen.getByText('忘記密碼?').closest('a')).toHaveAttribute('href', '/auth/resetpassword')
    fireEvent.click(loginBtn())
    expect(await screen.findByText('電話號碼為必填')).toBeInTheDocument()
    expect(screen.getByText('密碼為必填')).toBeInTheDocument()
    await utils.settle()
    expect(utils.calls).toHaveLength(0)
  })

  it('電話含空白：提示格式不正確、不送出，按鈕恢復可按', async () => {
    const utils = setup()
    fill('0912 345678', 'pw')
    fireEvent.click(loginBtn())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '登入號碼格式不正確', variant: 'warning' }))
    await utils.settle()
    expect(callsOf(utils.calls, 'LOGINV2')).toHaveLength(0)
    expect(loginBtn()).not.toBeDisabled()
    expect(loginBtn()).toHaveTextContent('登入')
  })
})

describe('一般登入（LOGINV2）', () => {
  it('送出電話、密碼與保持登入；只存 4 個登入者欄位（不含手機等個資）、token、保持登入；帶 redirect 時導回原頁', async () => {
    const utils = setup({ search: '?redirect=/order/list' })
    fill('0912345678', 'secret')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(loginBtn())
    await wait(() => expect(currentLocation()).toBe('/order/list'))
    expect(callsOf(utils.calls, 'LOGINV2').map(c => c.variables)).toEqual([
      { input: { cellphone: '0912345678', password: 'secret', isKeepLogin: true } },
    ])
    expect(callsOf(utils.calls, 'PROFILE')).toHaveLength(1)
    expect(JSON.parse(store.user)).toEqual({ id: 'u-1', name: '王小明', isAdmin: false, isNeedChangePassword: true })
    expect(store.user).not.toMatch(PRIVATE)
    expect(store.token).toBe('tkn-1')
    expect(store.keepLogin).toBe('true')
    // 沒有目前店家時存登入回傳的品牌店家
    expect(JSON.parse(store.userMerchant)).toEqual({ id: 'brand-1', name: '品牌店' })
    // localStorage 其他鍵也沒有個資
    Object.values(store).forEach(v => expect(v).not.toMatch(PRIVATE))
  })

  it('沒勾保持登入送 false；已有目前店家時不覆蓋；網址沒帶 redirect 時導到首頁（再由路由導到打帳單）', async () => {
    store.userMerchant = JSON.stringify({ id: 'm-9', name: '原店' })
    const utils = setup()
    fill('0912345678', 'secret')
    fireEvent.click(loginBtn())
    await wait(() => expect(callsOf(utils.calls, 'PROFILE')).toHaveLength(1))
    await utils.settle()
    expect(callsOf(utils.calls, 'LOGINV2')[0].variables.input.isKeepLogin).toBe(false)
    expect(store.keepLogin).toBe('false')
    expect(JSON.parse(store.userMerchant)).toEqual({ id: 'm-9', name: '原店' })
    await wait(() => expect(currentLocation()).toBe('/'))
  })

  it('登入失敗：不存登入資料、按鈕恢復可按並把游標移回電話欄', async () => {
    const utils = setup({ extra: { LOGINV2: new Error('帳號或密碼錯誤') } })
    fill('0912345678', 'wrong')
    fireEvent.click(loginBtn())
    await wait(() => expect(callsOf(utils.calls, 'LOGINV2')).toHaveLength(1))
    await wait(() => expect(loginBtn()).not.toBeDisabled())
    expect(document.activeElement).toBe(screen.getByTestId('cellphone'))
    expect(store.user).toBeUndefined()
    expect(store.token).toBeUndefined()
    expect(callsOf(utils.calls, 'PROFILE')).toHaveLength(0)
    expect(currentLocation()).toBe('/auth/login')
  })

  it('登入成功但讀個人資料失敗：不導頁，按鈕恢復可按（原本永遠停在「登入中」）', async () => {
    const utils = setup({ search: '?redirect=/order/list', extra: { PROFILE: new Error('伺服器錯誤') } })
    fill('0912345678', 'secret')
    fireEvent.click(loginBtn())
    await wait(() => expect(callsOf(utils.calls, 'PROFILE')).toHaveLength(1))
    await utils.settle()
    expect(currentLocation()).toBe('/auth/login?redirect=/order/list')
    await wait(() => expect(loginBtn()).not.toBeDisabled())
    expect(loginBtn()).toHaveTextContent('登入')
  })

  it('送出中按鈕停用並顯示「登入中」', async () => {
    const utils = renderPage(<Login location={{ pathname: '/auth/login', search: '' }} />, {
      route: '/auth/login',
      fixtures: fixtures(),
      delays: { LOGINV2: 300 },
    })
    fill('0912345678', 'secret')
    fireEvent.click(loginBtn())
    await wait(() => expect(loginBtn()).toHaveTextContent('登入中'))
    expect(loginBtn()).toBeDisabled()
    await utils.settle()
  })

  it('舊版存成字串 "null"／空字串的 liffId 視同沒有，走一般登入', async () => {
    for (const liffId of ['null', '']) {
      store = { liffId }
      const utils = setup()
      fill('0912345678', 'secret')
      fireEvent.click(loginBtn())
      await wait(() => expect(callsOf(utils.calls, 'LOGINV2')).toHaveLength(1))
      expect(callsOf(utils.calls, 'LOGINFORLINE')).toHaveLength(0)
      await utils.settle()
      cleanup()
    }
  })
})

describe('從 LINE 進來（LOGINFORLINE）', () => {
  it('送出電話、密碼（不送保持登入）；只存 4 個登入者欄位、不存 token；個人資料回來後導回原頁', async () => {
    store.liffId = 'liff-1'
    const utils = setup({ search: '?redirect=/manager/memberChangeLineMenu' })
    fill('0912345678', 'secret')
    fireEvent.click(loginBtn())
    await wait(() => expect(currentLocation()).toBe('/manager/memberChangeLineMenu'))
    expect(callsOf(utils.calls, 'LOGINFORLINE').map(c => c.variables)).toEqual([
      { input: { cellphone: '0912345678', password: 'secret' } },
    ])
    expect(callsOf(utils.calls, 'LOGINV2')).toHaveLength(0)
    expect(JSON.parse(store.user)).toEqual({ id: 'u-1', name: '王小明', isAdmin: false, isNeedChangePassword: true })
    expect(store.user).not.toMatch(PRIVATE)
    expect(store.token).toBeUndefined()
    expect(store.keepLogin).toBe('false')
  })

  it('LINE 登入失敗：按鈕恢復可按、游標回到電話欄、不存登入資料', async () => {
    store.liffId = 'liff-1'
    const utils = setup({ extra: { LOGINFORLINE: new Error('帳號或密碼錯誤') } })
    fill('0912345678', 'wrong')
    fireEvent.click(loginBtn())
    await wait(() => expect(callsOf(utils.calls, 'LOGINFORLINE')).toHaveLength(1))
    await wait(() => expect(loginBtn()).not.toBeDisabled())
    expect(document.activeElement).toBe(screen.getByTestId('cellphone'))
    expect(store.user).toBeUndefined()
  })
})
