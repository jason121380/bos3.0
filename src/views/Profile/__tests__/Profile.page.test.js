// 保護「個人頁」外框：分頁依登入者角色「個人檔案」區塊開放（以角色 id 比對）、「功能釘選」一律可用；點分頁以 history.push 切換；
// 標題為登入者姓名與目前分頁；預約表在店家開啟報到功能時可切換報到模式；登入者資料載入中顯示 Loading。
// 網址分頁不在清單內（permission）時導回「基本資料」（Jason 2026/10/22）。另以元件單獨測試 Profile/Permission.js（依既有權限判斷頁面不開放）。
// GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, USER_ID, currentLocation } from '../../../__tests__/testkit.test'
import Permission from '../Permission'
import { renderProfile, profileSection, PROFILE_TABS } from './profileKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('hooks/useFetchMerchant', () => ({
  ...jest.requireActual('hooks/useFetchMerchant'),
  __esModule: true,
  default: () => ({ loading: false, data: { merchant: { id: 'merchant-1', openingHours: '10:00:00', closingHours: '20:00:00' } } }),
}))

const tabNames = () => within(screen.getByRole('tablist')).getAllByRole('tab').map(t => t.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('個人頁：分頁', () => {
  it('依角色開放的分頁加上功能釘選；標題為登入者姓名與目前分頁', async () => {
    const { settle } = renderProfile('security')
    await settle()
    await wait(() => expect(tabNames()).toEqual([...PROFILE_TABS, '功能釘選']))
    expect(document.title).toContain('王小美 - 密碼設定')
  })

  it('沒開放的分頁不出現；角色沒有任何分頁時不顯示分頁列', async () => {
    const { settle } = renderProfile('security', { section: profileSection({ 薪資條: false, 抽成報表: false }) })
    await settle()
    await wait(() => expect(tabNames()).toContain('基本資料'))
    expect(tabNames()).not.toContain('薪資條')
    cleanup()
    const second = renderProfile('security', { section: { pageTitle: '個人檔案', authority: false, pageAuthority: [] } })
    await second.settle()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('點分頁以 history.push 切換', async () => {
    const { settle, history } = renderProfile('security')
    await settle()
    fireEvent.mouseDown(await screen.findByRole('tab', { name: '功能釘選' }), { button: 0 })
    expect(history.push).toHaveBeenCalledWith('pinnedTable')
  })

  it('登入者資料載入中顯示 Loading', async () => {
    renderProfile('security', { delays: { PROFILE: 300 } })
    expect(screen.getByText('載入中…')).toBeInTheDocument()
    expect(await screen.findByText('更改密碼')).toBeInTheDocument()
  })

  it('預約表：店家開啟報到功能時可切換報到模式；以登入者 id 查週曆', async () => {
    const { settle, calls } = renderProfile('reservation', {
      fixtures: { GET_CHECKIN_SETTING_FOR_CALENDAR: { getMerchantCheckinSettings: { isBookingCheckinEnabled: true, isUnDoneBookingManualNotify: false } } },
    })
    await settle()
    const toggle = await screen.findByRole('switch', { name: '報到模式' })
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(callsOf(calls, 'getMerchantDesignerCalendar')[0].variables.input).toEqual(expect.objectContaining({ designerIds: [USER_ID] }))
  })

  // 網址分頁不在分頁清單時導回「基本資料」（Jason 2026/10/22；修正前 findTabName 讀 undefined.label 整頁錯誤）。
  // permission 分頁（Permission.js）自初版起就不在分頁清單、角色「個人檔案」區塊也沒有對應的頁面權限，依既有權限判斷不開放。
  it('網址分頁為 permission 時導回基本資料', async () => {
    renderProfile('permission')
    await wait(() => expect(currentLocation()).toBe('/profile/general'))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // 預約歷史設定查詢失敗時以 false 為預設，頁面照常顯示（Jason 2026/10/22；修正前整頁錯誤）。
  it('預約歷史設定查詢失敗時頁面照常顯示', async () => {
    const { settle } = renderProfile('security', { fixtures: { GET_BOOKING_HISTORY_DISPLAY: new Error('網路錯誤') } })
    await settle()
    await wait(() => expect(tabNames()).toEqual([...PROFILE_TABS, '功能釘選']))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})

describe('Profile/Permission（舊版權限勾選，元件單獨測試）', () => {
  it('列出店家權限並勾選自己已有的；勾選送出新增、取消送出刪除（以登入者 id）', async () => {
    // 店家權限與自己的權限兩支查詢同名（FETCH_THIRDPARTYS），一併回應
    const { calls } = renderPage(<Permission />, {
      fixtures: {
        FETCH_THIRDPARTYS: {
          merchant: { id: 'merchant-1', permissions: [{ id: 'p1', name: '帳單', code: 'O', actions: [{ id: 'a1', name: '開單', code: 'C' }, { id: 'a2', name: '刪單', code: 'D' }] }] },
          me: { id: USER_ID, permissionActions: [{ id: 'a1' }] },
        },
        updateUserPermission: v => ({ updateUserPermission: v.input.status }),
      },
    })
    await screen.findByText('帳單')
    await wait(() => expect(screen.getByLabelText('開單')).toBeChecked())
    fireEvent.click(screen.getByLabelText('刪單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
    expect(callsOf(calls, 'updateUserPermission')[0].variables.input).toEqual({ userId: USER_ID, permissionActionId: 'a2', status: true })
    fireEvent.click(screen.getByLabelText('開單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
  })
})
