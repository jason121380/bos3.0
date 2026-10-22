// 保護「員工資料 › 密碼與安全」：帳號狀態（pending 視為可登入）、角色、是否可登入設計師手機端的帶入與送出；
// 有輸入兩次密碼才送 CHANGE_PASSWORD（以員工 id），之後更新帳號資料與角色；沒輸入密碼時只更新帳號資料與角色並重抓員工；完成後回員工列表。
// 角色送出的是角色 id（MerchantUserAuthorityId），權限以角色 id 判斷，送錯會讓員工拿到別的角色權限。
// 另以元件單獨測試 Permission.js（舊版權限勾選；頁面目前無法開啟此分頁，見 page 測試的已知缺口）。
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳號。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, USER_ID } from '../../../__tests__/testkit.test'
import Permission from '../Permission'
import { renderDetail, DESIGNER, EMP_ID } from './employeeDetailKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const FIXTURES = {
  UPDATE_USER_INFO: { setUserInfo: true },
  FETCH_UPDATE_USER_MERCHANT_IDENTITY: { updateUserMerchantIdentity: { designer: { id: EMP_ID, name: '王小美' }, MerchantUserAuthorityId: 'auth-1' } },
  CHANGE_PASSWORD: { changePassword: true },
}

const selectOf = label => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('select')
const selected = label => {
  const select = selectOf(label)
  return select.options[select.selectedIndex].textContent
}
const choose = (label, text) => {
  const select = selectOf(label)
  fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
}
const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存並返回列表' }))

const realLocation = window.location
beforeEach(() => {
  loginAs()
  delete window.location
  window.location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '', reload: jest.fn() }
})
afterEach(() => {
  cleanup()
  window.location = realLocation
})

const ready = async () => {
  await screen.findByText('更改密碼')
  await wait(() => expect(selected('權限設定')).toBe('設計師'))
}

describe('密碼與安全', () => {
  it('帶入帳號狀態（pending 視為可登入）、角色與手機端登入；不改密碼時更新帳號與角色並回員工列表', async () => {
    const { calls } = renderDetail('security', { designer: { ...DESIGNER, status: 'pending' }, fixtures: FIXTURES })
    await ready()
    expect(selected('帳號狀態')).toBe('可登入')
    expect(selected('允許登入設計師手機端')).toBe('可登入')
    choose('權限設定', '店長')
    choose('允許登入設計師手機端', '不可登入')
    choose('帳號狀態', '不可登入')
    const before = callsOf(calls, 'DESIGNER').length
    save()
    await wait(() => expect(window.location.href).toBe('/management/employee'))
    expect(callsOf(calls, 'CHANGE_PASSWORD')).toHaveLength(0)
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input).toEqual({
      userId: EMP_ID,
      status: 'banned',
      firstName: '小美',
      lastName: '王',
      isCellphoneLogin: false,
    })
    expect(callsOf(calls, 'FETCH_UPDATE_USER_MERCHANT_IDENTITY')[0].variables.input).toEqual({ designerId: EMP_ID, MerchantUserAuthorityId: 'auth-1' })
    await wait(() => expect(callsOf(calls, 'DESIGNER').length).toBeGreaterThan(before))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '更新成功', variant: 'success' })
  })

  it('兩個密碼欄都有填才先改密碼（以員工 id），再更新帳號與角色', async () => {
    const { calls } = renderDetail('security', { fixtures: FIXTURES })
    await ready()
    fireEvent.change(screen.getByLabelText('密碼'), { target: { name: 'password', value: 'abc12345' } })
    save()
    // 只填一個：不改密碼
    await wait(() => expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(1))
    expect(callsOf(calls, 'CHANGE_PASSWORD')).toHaveLength(0)
    fireEvent.change(screen.getByLabelText('確認密碼'), { target: { name: 'confirm', value: 'abc12345' } })
    save()
    await wait(() => expect(callsOf(calls, 'CHANGE_PASSWORD')).toHaveLength(1))
    expect(callsOf(calls, 'CHANGE_PASSWORD')[0].variables.input).toEqual({ password: 'abc12345', secondPassword: 'abc12345', userId: EMP_ID })
    await wait(() => expect(callsOf(calls, 'FETCH_UPDATE_USER_MERCHANT_IDENTITY')).toHaveLength(2))
    expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(2)
    await wait(() => expect(window.location.href).toBe('/management/employee'))
  })

  // 已知缺口（待 Jason 決定）：Security.js:106、125 用 mutation 的回傳（{ data }）判斷 designer.status === 'banned'，
  // 回傳物件沒有 status，所以「把自己的帳號設為不可登入」時永遠不會提示停用並登出（基本資料分頁的同一功能用畫面上的狀態判斷，正常）；
  // 建議改用 designerSetting.status 與 designer.id 判斷。這裡鎖住目前行為：停用自己仍照一般流程回員工列表。
  it('把自己的帳號設為不可登入時目前不會登出（鎖住現況）', async () => {
    const { calls } = renderDetail('security', { id: USER_ID, designer: { ...DESIGNER, id: USER_ID }, fixtures: FIXTURES })
    await ready()
    choose('帳號狀態', '不可登入')
    save()
    await wait(() => expect(window.location.href).toBe('/management/employee'))
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input.status).toBe('banned')
    expect(openSnackbar).not.toHaveBeenCalledWith({ message: '已將此帳號設為停用', variant: 'error' })
    expect(localStorage.getItem('user')).not.toBeNull()
  })
})

describe('Permission（舊版權限勾選，元件單獨測試）', () => {
  const fixtures = {
    FETCH_THIRDPARTYS: {
      merchant: {
        id: 'merchant-1',
        permissions: [
          { id: 'p1', name: '帳單', code: 'ORDER', actions: [{ id: 'a1', name: '開單', code: 'C' }, { id: 'a2', name: '刪單', code: 'D' }] },
        ],
      },
    },
    GetUserPermission: { user: { id: EMP_ID, permissionActions: [{ id: 'a1' }] } },
    updateUserPermission: v => ({ updateUserPermission: v.input.status }),
  }

  it('列出店家權限並勾選員工已有的；勾選送出新增、取消送出刪除', async () => {
    const { calls } = renderPage(<Permission designerId={EMP_ID} />, { fixtures })
    await screen.findByText('帳單')
    await wait(() => expect(screen.getByLabelText('開單')).toBeChecked())
    expect(screen.getByLabelText('刪單')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('刪單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
    expect(callsOf(calls, 'updateUserPermission')[0].variables.input).toEqual({ userId: EMP_ID, permissionActionId: 'a2', status: true })
    fireEvent.click(screen.getByLabelText('開單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(calls, 'updateUserPermission')[1].variables.input).toEqual({ userId: EMP_ID, permissionActionId: 'a1', status: false })
  })
})
