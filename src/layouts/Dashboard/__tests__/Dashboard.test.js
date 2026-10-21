// 保護後台版面的權限與防呆：側欄選單依「角色權限」隱藏整個分類或單一頁面、只有高階主管看得到角色權限管理、
// 依店家參數顯示會員卡／紅利／掛單、搜尋選單、單頁出錯只影響內容區、沒有頁面權限時導回個人頁、登出清除登入資料。
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應；WebSocket 以假物件取代，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import Dashboard from '..'

jest.setTimeout(20000)

// 推播連線：只需要 on／off／disconnect 介面，不建立真的連線
jest.mock('socket.io-client', () => () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
  connect: () => {},
  disconnect: () => {},
}))

const authority = (pages = []) => ({
  authorityName: '自訂角色',
  pageAuthority: pages,
})

const fixtures = ({
  pageAuthority = [],
  authorityName = '高階主管',
  membership = true,
  bonus = false,
  disablePendingOrder = false,
  pageAllowed = true,
  roleSettings = [
    { pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: true }] },
    {
      pageTitle: '資料設定',
      authority: true,
      pageAuthority: [
        { pageName: '服務項目扣項設定', authority: true },
        { pageName: '預收卡項目扣項設定', authority: false },
      ],
    },
  ],
  ...overrides
} = {}) => ({
  PROFILE: {
    me: {
      id: 'user-1',
      name: '店長小林',
      status: 'active',
      theme: 'light',
      avatar: null,
      merchantIdentity: { authorityName, authorityId: 'auth-1' },
    },
  },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName, authorityId: 'auth-1' } } },
  FETCH_USER: { user: { id: 'user-1', name: '店長小林', pageAuthority: authority(pageAuthority), theme: 'light' } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: membership },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonus },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder } },
  GET_IS_REPORT_LIST_EXTENDED: { getIsReportListExtended: true },
  GET_USERS_PINNED_TABLE: { getUserPinnedTable: [] },
  CHECK_PAGE_AUTHORITY: { checkPageAuthority: pageAllowed },
  // 店家的角色設定（JSON 字串）：登入者角色至少要有一個頁面權限，否則導回個人頁
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authorityName,
        authoritySettings: JSON.stringify(roleSettings),
      },
    ],
  },
  ...overrides,
})

const Content = () => <div>內容頁</div>
const Broken = () => {
  throw new Error('頁面壞了')
}

const setup = (options = {}, { route = '/order/create', page = Content } = {}) => {
  const routeConfig = { routes: [{ path: '*', component: page }] }
  return renderPage(<Dashboard route={routeConfig} location={{ pathname: route }} />, {
    fixtures: fixtures(options),
    route,
  })
}

// 側欄（手機底部分頁列也有「打帳單」等連結，查詢限定在側欄內）
const sidebar = () => within(document.querySelector('aside'))
const group = title => sidebar().queryByText(title, { selector: 'button, button *' })
const openGroup = title => fireEvent.click(sidebar().getByText(title, { selector: 'button, button *' }))
const link = title => sidebar().queryByText(title, { selector: 'a, a *' })

beforeEach(() => {
  loginAs()
  // 保持登入（keepLogin）：未勾選時沒有 cookie 會被登出
  localStorage.setItem('keepLogin', 'true')
})
afterEach(cleanup)

describe('側欄選單：角色權限', () => {
  it('沒有權限的分類整個隱藏，分類內沒有權限的頁面也隱藏', async () => {
    setup({
      pageAuthority: [
        { pageTitle: '報表及分析', authority: false, pageAuthority: [] },
        {
          pageTitle: '櫃檯作業',
          authority: true,
          pageAuthority: [
            { pageName: '每日結帳', authority: false },
            { pageName: '打帳單', authority: true },
          ],
        },
      ],
    })
    expect(await screen.findByText('店長小林')).toBeInTheDocument()
    await wait(() => expect(group('報表及分析')).toBeNull())
    // 目前在打帳單：櫃檯作業自動展開
    expect(link('打帳單')).toBeInTheDocument()
    expect(link('每日結帳')).toBeNull()
    expect(group('客戶管理')).toBeInTheDocument()
  })

  it('只有「高階主管」看得到角色權限管理', async () => {
    setup({ authorityName: '設計師' })
    await screen.findByText('店長小林')
    openGroup('資料設定')
    expect(link('系統參數設定')).toBeInTheDocument()
    expect(link('角色權限管理')).toBeNull()
    cleanup()

    setup({ authorityName: '高階主管' })
    await screen.findByText('店長小林')
    openGroup('資料設定')
    expect(link('角色權限管理')).toBeInTheDocument()
  })

  it('底部顯示登入者名稱與角色', async () => {
    setup({ authorityName: '設計師' })
    expect(await screen.findByText('店長小林')).toBeInTheDocument()
    expect(screen.getByText('設計師')).toBeInTheDocument()
    // 目前店家名稱
    expect(screen.getAllByText('測試店')[0]).toBeInTheDocument()
  })
})

describe('側欄選單：店家參數', () => {
  it('停用會員卡時不顯示會員卡管理；啟用紅利點數時顯示紅利點數設定', async () => {
    setup({ membership: false, bonus: true })
    await screen.findByText('店長小林')
    await wait(() => expect(group('會員卡管理')).toBeNull())
    expect(group('紅利點數設定')).toBeInTheDocument()
  })

  it('啟用會員卡、停用紅利點數時相反', async () => {
    setup({ membership: true, bonus: false })
    await screen.findByText('店長小林')
    await wait(() => expect(group('會員卡管理')).toBeInTheDocument())
    expect(group('紅利點數設定')).toBeNull()
  })

  it('掛單功能開啟時，櫃檯作業多一個「掛單列表」；關閉時沒有', async () => {
    setup({ disablePendingOrder: false })
    await screen.findByText('店長小林')
    await wait(() => expect(link('掛單列表')).toBeInTheDocument())
    cleanup()

    setup({ disablePendingOrder: true })
    await screen.findByText('店長小林')
    await wait(() => expect(link('掛單列表')).toBeNull())
  })
})

describe('側欄選單：搜尋', () => {
  it('輸入關鍵字只留下符合的頁面並展開所屬分類；關閉搜尋恢復完整選單', async () => {
    setup()
    await screen.findByText('店長小林')
    fireEvent.click(screen.getAllByLabelText('搜尋選單')[0])
    const input = screen.getByPlaceholderText('搜尋選單')
    fireEvent.change(input, { target: { value: '薪資' } })
    expect(link('每月薪資維護')).toBeInTheDocument()
    expect(link('薪資條')).toBeInTheDocument()
    expect(link('打帳單')).toBeNull()

    fireEvent.click(screen.getByLabelText('關閉搜尋'))
    expect(screen.queryByPlaceholderText('搜尋選單')).toBeNull()
    expect(link('打帳單')).toBeInTheDocument()
  })
})

describe('內容區與頁面權限', () => {
  it('單一頁面拋錯時只在內容區顯示錯誤畫面，側欄照常可用', async () => {
    setup({}, { page: Broken })
    expect(await screen.findByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
    expect(await screen.findByText('店長小林')).toBeInTheDocument()
    expect(group('櫃檯作業')).toBeInTheDocument()
  })

  it('依目前網址檢查頁面權限；沒有權限時導回個人頁', async () => {
    const { calls } = setup({ pageAllowed: false }, { route: '/management/orders' })
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')[0].variables.input).toEqual(
      expect.objectContaining({ id: 'user-1', url: '/management/orders' })
    )
  })

  it('有權限時留在原頁', async () => {
    const { calls, settle } = setup({ pageAllowed: true }, { route: '/management/orders' })
    await screen.findByText('店長小林')
    await settle()
    expect(callsOf(calls, 'CHECK_PAGE_AUTHORITY')).toHaveLength(1)
    expect(currentLocation()).toBe('/management/orders')
    expect(screen.getByText('內容頁')).toBeInTheDocument()
  })

  it('登入者角色的頁面權限全部關閉時導回個人頁', async () => {
    setup(
      {
        roleSettings: [
          { pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: false }] },
          { pageTitle: '資料設定', authority: false, pageAuthority: [] },
        ],
      },
      { route: '/management/orders' }
    )
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
  })
})

describe('抽成設定的顯示權限', () => {
  it('依登入者角色的「服務項目／預收卡項目扣項設定」權限寫入 store，供各頁決定是否顯示抽成欄位', async () => {
    const { store } = setup()
    await screen.findByText('店長小林')
    await wait(() => expect(store.getState().deductionDisplay).toEqual({ service: true, coupon: false }))
  })
})

describe('角色設定缺少區塊', () => {
  // 為什麼重要：舊角色或後台新增區塊前建立的角色，可能沒有「櫃檯作業」「資料設定」。
  // 原本 TopBar 直接取 [0].pageAuthority 拋錯，而 TopBar 不在頁面錯誤邊界內，整個後台白畫面、該角色完全無法使用。
  it('沒有「櫃檯作業」「資料設定」時後台照常顯示，缺的權限一律視為沒有', async () => {
    const { store } = setup({
      roleSettings: [{ pageTitle: '客戶管理', authority: true, pageAuthority: [{ pageName: '客戶列表', authority: true }] }],
    })
    expect(await screen.findByText('店長小林')).toBeInTheDocument()
    expect(screen.getByText('內容頁')).toBeInTheDocument()
    await wait(() => expect(store.getState().deductionDisplay).toEqual({ service: false, coupon: false }))
  })
})

describe('同名角色', () => {
  // 為什麼重要：角色名稱可以重複；以名稱比對時會讀到排在前面的同名角色，抽成欄位與選單權限跟著錯（2026/10/21 改以 id 比對）
  it('依登入者的角色 id 讀權限，不會讀到另一個同名角色', async () => {
    const otherRole = {
      id: 'auth-2',
      authorityName: '高階主管',
      authoritySettings: JSON.stringify([
        { pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: true }] },
        { pageTitle: '資料設定', authority: true, pageAuthority: [{ pageName: '服務項目扣項設定', authority: false }] },
      ]),
    }
    const { store } = setup({
      GET_MERCHANT_AUTHORITIES: {
        getMerchantAuthorities: [
          otherRole,
          {
            id: 'auth-1',
            authorityName: '高階主管',
            authoritySettings: JSON.stringify([
              { pageTitle: '櫃檯作業', authority: true, pageAuthority: [{ pageName: '打帳單', authority: true }] },
              { pageTitle: '資料設定', authority: true, pageAuthority: [{ pageName: '服務項目扣項設定', authority: true }] },
            ]),
          },
        ],
      },
    })
    await screen.findByText('店長小林')
    await wait(() => expect(store.getState().deductionDisplay).toEqual({ service: true, coupon: false }))
  })
})

describe('登出', () => {
  it('清除 localStorage 的登入資料並導到登入頁', async () => {
    setup()
    await screen.findByText('店長小林')
    const footer = screen.getByLabelText('登出').parentElement
    fireEvent.click(within(footer).getByLabelText('登出'))
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('userMerchant')).toBeNull()
    await wait(() => expect(currentLocation()).toBe('/auth/login'))
  })
})
