// 保護「編輯會員卡分類」：依網址的分類 uuid 讀取並帶入代號、名稱；儲存時送出 itemUUID 與修改後的值（保留原啟用狀態），
// 成功導回分類列表、失敗提示錯誤。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import { fieldByLabel, stubLocation } from '../../__tests__/settingsPageKit.test'
import MemberCardCategoryEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const CATEGORY = { id: '9', uuid: 'cat-1', no: 'A01', name: '金卡', isUsing: false }
const setup = fixtures =>
  renderPage(<MemberCardCategoryEdit match={{ params: { id: 'cat-1' } }} />, {
    fixtures: { FETCH_MEMBERSHIP_CATEGORY: { membershipCategory: CATEGORY }, ...fixtures },
    route: '/member-card-category/edit/cat-1',
  })

let restoreLocation
beforeEach(() => {
  loginAs()
  restoreLocation = stubLocation()
})
afterEach(() => {
  cleanup()
  restoreLocation()
})

describe('編輯會員卡分類', () => {
  it('帶入原資料，儲存送出 itemUUID、修改後的代號名稱與原啟用狀態，成功導回列表', async () => {
    const { calls } = setup({ updateMembershipCategory: { updateMembershipCategory: true } })
    await wait(() => expect(fieldByLabel('名稱')).toHaveValue('金卡'))
    expect(callsOf(calls, 'FETCH_MEMBERSHIP_CATEGORY')[0].variables).toEqual({ categoryUUID: 'cat-1' })
    expect(fieldByLabel('代號')).toHaveValue('A01')
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'A09' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '白金卡' } })
    fireEvent.click(screen.getByTestId('save'))
    await wait(() => expect(window.location.href).toBe('/member-card-categories'))
    expect(callsOf(calls, 'updateMembershipCategory')[0].variables).toEqual({
      input: { itemUUID: 'cat-1', no: 'A09', name: '白金卡', isUsing: false },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功更新會員卡類別', variant: 'success' })
  })

  it('儲存失敗時提示錯誤、留在本頁', async () => {
    setup({ updateMembershipCategory: new Error('代號重複') })
    await wait(() => expect(fieldByLabel('名稱')).toHaveValue('金卡'))
    fireEvent.click(screen.getByTestId('save'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '代號重複', variant: 'error' }))
    expect(window.location.href).toBe('http://localhost/')
  })
})
