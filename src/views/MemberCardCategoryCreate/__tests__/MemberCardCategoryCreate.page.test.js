// 保護「新增會員卡分類」：送出的代號、名稱、所屬店家（登入店家）與啟用狀態；代號、名稱必填；成功後提示並回到分類列表。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, MERCHANT_ID } from '../../../__tests__/testkit.test'
import { fieldByLabel, stubLocation } from '../../__tests__/settingsPageKit.test'
import MemberCardCategoryCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

let restoreLocation
beforeEach(() => {
  restoreLocation = stubLocation()
})
afterEach(() => {
  cleanup()
  restoreLocation()
})

describe('新增會員卡分類', () => {
  it('送出代號、名稱、登入店家與啟用中，成功後提示並導回分類列表', async () => {
    loginAs()
    const { calls } = renderPage(<MemberCardCategoryCreate />, {
      fixtures: { createMembershipCategory: { createMembershipCategory: true } },
      route: '/member-card-category/create',
    })
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'B01' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '鑽石卡' } })
    fireEvent.click(screen.getByTestId('submit-create'))
    await wait(() => expect(window.location.href).toBe('/member-card-categories'))
    expect(callsOf(calls, 'createMembershipCategory')[0].variables).toEqual({
      input: { no: 'B01', name: '鑽石卡', OfficialBrandMerchantId: MERCHANT_ID, isUsing: true },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增會員卡類別', variant: 'success' })
  })

  // 送出失敗：頁面沒有接 catch，錯誤提示由 init-apollo 的 errorLink 統一顯示（測試的模擬 link 沒有 errorLink，故不另測）
  // 代號、名稱原本沒有必填檢查，空白也會建立分類。Jason 2026/10/22「照建議」：去掉前後空白後為空時提示且不送出。
  it('代號或名稱空白（含只有空白）時提示且不送出', async () => {
    loginAs()
    const utils = renderPage(<MemberCardCategoryCreate />, {
      fixtures: { createMembershipCategory: { createMembershipCategory: true } },
      route: '/member-card-category/create',
    })
    fireEvent.click(screen.getByTestId('submit-create'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入代號', variant: 'warning' })
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'B01' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '   ' } })
    fireEvent.click(screen.getByTestId('submit-create'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入名稱', variant: 'warning' })
    fireEvent.change(fieldByLabel('代號'), { target: { value: '  ' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '鑽石卡' } })
    fireEvent.click(screen.getByTestId('submit-create'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入代號', variant: 'warning' })
    await utils.settle()
    expect(callsOf(utils.calls, 'createMembershipCategory')).toHaveLength(0)
    expect(window.location.href).toBe('http://localhost/')
  })

  it('沒有登入店家時店家欄位送 null', async () => {
    loginAs({ merchant: null })
    const { calls } = renderPage(<MemberCardCategoryCreate />, {
      fixtures: { createMembershipCategory: { createMembershipCategory: true } },
      route: '/member-card-category/create',
    })
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'B02' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '銀卡' } })
    fireEvent.click(screen.getByTestId('submit-create'))
    await wait(() => expect(window.location.href).toBe('/member-card-categories'))
    expect(callsOf(calls, 'createMembershipCategory')[0].variables.input).toEqual({
      no: 'B02', name: '銀卡', OfficialBrandMerchantId: null, isUsing: true,
    })
  })
})
