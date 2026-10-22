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
    // setupTests 的 localStorage 假物件會再 stringify 一次：解兩次得到後端回的顧客資料
    expect(JSON.parse(JSON.parse(localStorage.getItem('customer')))).toEqual({ id: 'customer-1', userCode: 'code-1' })
    await wait(() => expect(currentLocation()).toBe('/customer/consumption/records?merchantid=m-9'))
    // 只送一次要求驗證碼
    expect(callsOf(utils.calls, 'LoginSMS')).toHaveLength(1)
  })

  // 已知缺口（待 Jason 決定）：已登入的顧客應自動導回 redirect，但 localStorage 取出的是 JSON 字串，
  // 程式直接讀 customer.userCode（字串沒有這個屬性）永遠是 undefined，自動導回從不發生（views/CustomerLogin/index.js:36-38）。
  // 建議：JSON.parse 後再判斷（並統一導向寫法：此處 `/${redirect}` 與登入後的 `${redirect}` 不一致，redirect 以 / 開頭時會變成 //）。
  it('已知缺口：已登入的顧客打開登入頁不會自動導回', async () => {
    localStorage.setItem('customer', JSON.stringify({ id: 'customer-1', userCode: 'code-1' }))
    const utils = setup()
    await utils.settle()
    expect(currentLocation()).toBe(ROUTE)
    expect(screen.getByText('獲取驗證碼')).toBeInTheDocument()
  })
})
