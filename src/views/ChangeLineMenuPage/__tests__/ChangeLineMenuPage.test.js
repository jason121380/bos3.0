// 保護 LINE 圖文選單切換頁（從 LINE 開啟的 LIFF 頁，畫面只有 Loading）：
// - /changelinemenu/index2：以網址的 liffId 初始化，取 LINE userId 後送 changeLineMenu（userId、menuId、storeId），完成關閉視窗
// - /changelinemenu/default：送 setDefaultLineMenu（userId、storeId）切回預設選單，完成關閉視窗
// - /manager/memberChangeLineMenu：員工切換選單，記住 liffId 供登入頁判斷 LINE 登入（沒帶 liffId 時清掉舊值），送 memberChangeLineMenu
// - /manager/temp/attendanceRecord：以登入者 id 導到自己的出勤紀錄；未登入不導頁
// 共同：尚未登入 LINE 時導向 LINE 登入（login() 不回傳 Promise，登入後會重新開啟本頁），不送出；
// LINE 初始化或取個人資料失敗時提示錯誤（原本是沒人接的 rejection，畫面永遠停在 Loading 沒有提示）；
// 送出失敗時不關閉視窗，GraphQL 錯誤的提示由 errorLink 負責、頁面不重複提示。
// LIFF SDK 以假物件代替；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation, loginAs, USER_ID } from '../../../__tests__/testkit.test'
import ChangeMenu from '../index'
import DefaultMenu from '../defaultMenu'
import MemberChangeMenu from '../memberChangeLineMenu'
import Temp from '../temp'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

let liff
let store
beforeEach(() => {
  liff = {
    init: jest.fn(() => Promise.resolve()),
    isLoggedIn: jest.fn(() => true),
    getProfile: jest.fn(() => Promise.resolve({ userId: 'U-line-1' })),
    login: jest.fn(),
    closeWindow: jest.fn(),
  }
  window.liff = liff
  // 與瀏覽器相同的 localStorage（setupTests 的假物件會再 JSON.stringify）
  store = {}
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(k => (k in store ? store[k] : null))
  jest.spyOn(window.localStorage, 'setItem').mockImplementation((k, v) => {
    store[k] = String(v)
  })
  jest.spyOn(window.localStorage, 'removeItem').mockImplementation(k => {
    delete store[k]
  })
})
afterEach(() => {
  cleanup()
  delete window.liff
})

const PAGES = [
  {
    name: '切換選單（index2）',
    Page: ChangeMenu,
    title: 'Loading',
    op: 'ChangeLineMenu',
    ok: { changeLineMenu: true },
    expected: { input: { lineId: 'U-line-1', menuId: 'menu-2', storeId: 'store-9' } },
  },
  {
    name: '切回預設選單（default）',
    Page: DefaultMenu,
    title: 'Loading',
    op: 'SetDefaultLineMenu',
    ok: { setDefaultLineMenu: true },
    expected: { input: { lineId: 'U-line-1', storeId: 'store-9' } },
  },
  {
    name: '員工切換選單（memberChangeLineMenu）',
    Page: MemberChangeMenu,
    title: 'Loading...',
    op: 'ChangeLineMenu',
    ok: { memberChangeLineMenu: true },
    expected: { input: { lineId: 'U-line-1', menuId: 'menu-2', storeId: 'store-9' } },
  },
]
const SEARCH = '?liffId=liff-77&menuId=menu-2&storeId=store-9'
const setup = (Page, { search = SEARCH, fixtures = {} } = {}) =>
  renderPage(<Page location={{ search }} />, { route: `/page${search}`, fixtures })

describe.each(PAGES)('$name', ({ Page, title, op, ok, expected }) => {
  it('以網址的 liffId 初始化，取 userId 後送出，完成關閉視窗', async () => {
    const utils = setup(Page, { fixtures: { [op]: ok } })
    expect(screen.getByText(title)).toBeInTheDocument()
    await wait(() => expect(liff.closeWindow).toHaveBeenCalled())
    expect(liff.init).toHaveBeenCalledWith({ liffId: 'liff-77' })
    expect(callsOf(utils.calls, op).map(c => c.variables)).toEqual([expected])
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('尚未登入 LINE：導向 LINE 登入，不取個人資料、不送出', async () => {
    liff.isLoggedIn.mockReturnValue(false)
    const utils = setup(Page, { fixtures: { [op]: ok } })
    await wait(() => expect(liff.login).toHaveBeenCalled())
    await utils.settle()
    expect(liff.getProfile).not.toHaveBeenCalled()
    expect(callsOf(utils.calls, op)).toHaveLength(0)
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('LINE 初始化失敗、取個人資料失敗：提示錯誤、不送出', async () => {
    liff.init.mockImplementation(() => Promise.reject(new Error('invalid liffId')))
    setup(Page)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' })))
    expect(openSnackbar.mock.calls[0][0].message).toContain('invalid liffId')
    cleanup()
    openSnackbar.mockClear()
    liff.init.mockImplementation(() => Promise.resolve())
    liff.getProfile.mockImplementation(() => Promise.reject({ code: '403', message: 'no profile' }))
    const utils = setup(Page)
    await wait(() => expect(openSnackbar).toHaveBeenCalledTimes(1))
    expect(openSnackbar.mock.calls[0][0].message).toContain('no profile')
    expect(callsOf(utils.calls, op)).toHaveLength(0)
    expect(liff.closeWindow).not.toHaveBeenCalled()
  })

  it('送出失敗：不關閉視窗，GraphQL 錯誤由 errorLink 提示、頁面不重複提示', async () => {
    const utils = setup(Page, { fixtures: { [op]: new Error('選單不存在') } })
    await wait(() => expect(callsOf(utils.calls, op)).toHaveLength(1))
    await utils.settle()
    await new Promise(r => setTimeout(r, 0))
    expect(liff.closeWindow).not.toHaveBeenCalled()
    expect(openSnackbar).not.toHaveBeenCalled()
  })
})

describe('員工切換選單：記住 liffId 供登入頁判斷 LINE 登入', () => {
  it('有帶 liffId 時存入；沒帶時清掉舊值（不存成字串 "null"）', async () => {
    const utils = setup(MemberChangeMenu, { fixtures: { ChangeLineMenu: { memberChangeLineMenu: true } } })
    expect(store.liffId).toBe('liff-77')
    await utils.settle()
    cleanup()
    const again = setup(MemberChangeMenu, { search: '?menuId=menu-2&storeId=store-9' })
    expect(store.liffId).toBeUndefined()
    await again.settle()
  })
})

describe('出勤紀錄入口（temp）', () => {
  it('已登入：導到自己的出勤紀錄；未登入：停在原頁', async () => {
    loginAs()
    store.user = JSON.stringify({ id: USER_ID })
    setup(Temp)
    await wait(() => expect(currentLocation()).toBe(`/management/employee/${USER_ID}/AttendanceRecord`))
    cleanup()
    store = {}
    setup(Temp)
    await new Promise(r => setTimeout(r, 0))
    expect(currentLocation()).toBe(`/page${SEARCH}`)
  })
})
