// 保護顧客前台「顧客登入」（手機簡訊驗證）：第一次送出以手機與網址的店家 id 要求驗證碼，成功後鎖定手機欄並出現驗證碼欄；
// 第二次送出以 { merchantId, code, cellphone } 驗證，成功把後端回的顧客資料存入 localStorage（JSON 字串）並導回 redirect 網址。
// （要求驗證碼失敗時 mutation 未接 catch，由全站 errorLink 提示；測試環境會視為未處理的 rejection，故不在此測。）GraphQL 全由 testkit 的模擬 link 回應，不發真實簡訊。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import CustomerLogin from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

function Page() {
  const { useLocation } = require('react-router')
  return <CustomerLogin location={useLocation()} />
}

const ROUTE = '/customer/login?merchantid=m-9&redirect=/customer/consumption/records?merchantid=m-9'

const setup = (fixtures = {}) =>
  renderPage(<Page />, {
    fixtures: {
      LoginSMS: { customerLoginSMS: true },
      CustomerVerifySMS: { customerVerifySMS: { id: 'customer-1', userCode: 'code-1' } },
      ...fixtures,
    },
    route: ROUTE,
  })

beforeEach(() => {
  localStorage.clear()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('顧客登入', () => {
  it('要求驗證碼 → 輸入驗證碼登入 → 存入顧客資料並導回原頁', async () => {
    const utils = setup()
    expect(screen.queryByLabelText('驗證碼')).toBeNull()
    fireEvent.change(screen.getByLabelText('電話'), { target: { value: '0912345678' } })
    fireEvent.click(screen.getByText('獲取驗證碼'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已傳送驗證碼', variant: 'success' }))
    expect(callsOf(utils.calls, 'LoginSMS')[0].variables).toEqual({ input: { cellphone: '0912345678', merchantId: 'm-9' } })
    expect(screen.getByLabelText('電話')).toBeDisabled()

    fireEvent.wheel(screen.getByLabelText('驗證碼'))
    fireEvent.change(screen.getByLabelText('驗證碼'), { target: { value: '1234' } })
    fireEvent.click(screen.getByText('登入'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '登入成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'CustomerVerifySMS')[0].variables).toEqual({
      input: { merchantId: 'm-9', code: '1234', cellphone: '0912345678' },
    })
    expect(JSON.parse(localStorage.getItem('customer'))).toEqual({ id: 'customer-1', userCode: 'code-1' })
    await wait(() => expect(currentLocation()).toBe('/customer/consumption/records?merchantid=m-9'))
    // 只送一次要求驗證碼
    expect(callsOf(utils.calls, 'LoginSMS')).toHaveLength(1)
  })

  // 已登入的顧客打開登入頁自動導回 redirect：localStorage 取出後 JSON.parse 再讀 userCode，導向寫法與登入後相同
  // （原本直接讀字串的 userCode 永遠是 undefined，且導向多加一個 / ；Jason 2026/10/22 fix all）
  it('已登入的顧客打開登入頁自動導回原頁', async () => {
    localStorage.setItem('customer', JSON.stringify({ id: 'customer-1', userCode: 'code-1' }))
    setup()
    await wait(() => expect(currentLocation()).toBe('/customer/consumption/records?merchantid=m-9'))
  })

  it('存的顧客資料沒有 userCode 或不是 JSON 時留在登入頁', async () => {
    localStorage.setItem('customer', JSON.stringify({ id: 'customer-1' }))
    const utils = setup()
    await utils.settle()
    expect(currentLocation()).toBe(ROUTE)
    cleanup()
    const spy = jest.spyOn(localStorage, 'getItem').mockImplementation(key => (key === 'customer' ? '{壞掉' : null))
    const broken = setup()
    await broken.settle()
    expect(currentLocation()).toBe(ROUTE)
    expect(screen.getByText('獲取驗證碼')).toBeInTheDocument()
    spy.mockRestore()
  })
})
