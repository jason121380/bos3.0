// 保護忘記密碼頁（/auth/resetpassword）。守住：
// - 第一步：電話必填，送出 forgetPassword（電話）寄驗證碼；成功後電話鎖定、出現驗證碼欄，記下倒數旗標
// - 第二步：驗證碼必填，送出 forgetPasswordVerify（電話＋驗證碼）；成功後登入者資料只存 id／name／isAdmin／isNeedChangePassword
//   （手機號碼、uid、userCode 不落地）、目前店家為第一間、清掉倒數旗標並導到首頁
// - 寄驗證碼失敗時回到輸入電話（原本停在驗證碼欄、電話鎖住無法重寄）；驗證失敗時按鈕恢復可按（原本停用到改驗證碼為止）
// 不連任何後端：GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import ResetPassword from '..'

jest.setTimeout(20000)

const VERIFIED_USER = {
  id: 'u-1',
  uid: 'uid-secret',
  name: '王小明',
  status: 'ACTIVE',
  jobTitle: '設計師',
  userCode: 'code-secret',
  userGroup: 'g',
  merchants: [{ id: 'm-1' }, { id: 'm-2' }],
  cellphone: '0912345678',
  groupCategory: 'c',
  isNeedChangePassword: true,
}

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
})
afterEach(cleanup)

const setup = (extra = {}) =>
  renderPage(<ResetPassword />, {
    route: '/auth/resetpassword',
    fixtures: {
      forgetPassword: { forgetPassword: true },
      FORGOT_PASSWORD_VERFITY: { forgetPasswordVerify: VERIFIED_USER },
      ...extra,
    },
  })

// 欄位處理在 setState 的 updater 內才讀 event.target.value，要用與瀏覽器相同的輸入方式（見 testkit typeLikeBrowser）
const type = typeLikeBrowser
const phone = () => screen.getByLabelText('電話號碼')
const button = () => screen.getByRole('button')

const sendCode = async utils => {
  type(phone(), '0912345678')
  fireEvent.click(button())
  await wait(() => expect(callsOf(utils.calls, 'forgetPassword')).toHaveLength(1))
  await utils.settle()
}

it('電話必填：清空後顯示「必填」且不能寄驗證碼', async () => {
  setup()
  expect(screen.getByText('重設密碼')).toBeInTheDocument()
  expect(button()).toHaveTextContent('發送驗證碼')
  expect(button()).toBeDisabled()
  type(phone(), '09')
  expect(button()).not.toBeDisabled()
  type(phone(), '')
  expect(screen.getByText('必填')).toBeInTheDocument()
  expect(phone()).toHaveAttribute('aria-invalid', 'true')
  expect(button()).toBeDisabled()
})

it('寄驗證碼後輸入驗證碼重設：送出電話與驗證碼，只存 4 個登入者欄位、第一間店，清倒數旗標並導到首頁', async () => {
  const utils = setup()
  await sendCode(utils)
  expect(callsOf(utils.calls, 'forgetPassword')[0].variables).toEqual({ cellphone: '0912345678' })
  expect(store.countdownForVerify).toBe('true')
  expect(phone()).toBeDisabled()
  const code = screen.getByLabelText('驗證碼')
  expect(button()).toHaveTextContent('重設密碼')
  expect(button()).toBeDisabled()
  // 驗證碼必填
  type(code, '1')
  type(code, '')
  expect(screen.getByText('必填')).toBeInTheDocument()
  expect(button()).toBeDisabled()
  type(code, '123456')
  expect(button()).not.toBeDisabled()
  fireEvent.click(button())
  await wait(() => expect(currentLocation()).toBe('/'))
  expect(callsOf(utils.calls, 'FORGOT_PASSWORD_VERFITY').map(c => c.variables)).toEqual([
    { input: { cellphone: '0912345678', verifyCode: '123456' } },
  ])
  expect(JSON.parse(store.user)).toEqual({ id: 'u-1', name: '王小明', isNeedChangePassword: true })
  expect(store.user).not.toMatch(/0912345678|uid-secret|code-secret|cellphone|userCode/)
  expect(JSON.parse(store.userMerchant)).toEqual({ id: 'm-1' })
  expect(store.countdownForVerify).toBeUndefined()
})

it('寄驗證碼失敗：回到輸入電話，可修改電話後再寄一次（原本停在驗證碼欄、電話鎖住無法重寄）', async () => {
  let fail = true
  const utils = setup({
    forgetPassword: () => (fail ? new Error('查無此電話') : { forgetPassword: true }),
  })
  await sendCode(utils)
  expect(store.countdownForVerify).toBeUndefined()
  await wait(() => expect(phone()).not.toBeDisabled())
  expect(screen.queryByLabelText('驗證碼')).toBeNull()
  expect(button()).toHaveTextContent('發送驗證碼')
  fail = false
  type(phone(), '0987654321')
  expect(button()).not.toBeDisabled()
  fireEvent.click(button())
  await wait(() => expect(callsOf(utils.calls, 'forgetPassword')).toHaveLength(2))
  expect(callsOf(utils.calls, 'forgetPassword')[1].variables).toEqual({ cellphone: '0987654321' })
  await wait(() => expect(screen.getByLabelText('驗證碼')).toBeInTheDocument())
})

it('驗證碼錯誤：不登入、不導頁，按鈕恢復可按（原本要改驗證碼才能再按）', async () => {
  const utils = setup({ FORGOT_PASSWORD_VERFITY: new Error('驗證碼錯誤') })
  await sendCode(utils)
  type(screen.getByLabelText('驗證碼'), '000000')
  fireEvent.click(button())
  await wait(() => expect(callsOf(utils.calls, 'FORGOT_PASSWORD_VERFITY')).toHaveLength(1))
  await utils.settle()
  expect(store.user).toBeUndefined()
  expect(currentLocation()).toBe('/auth/resetpassword')
  await wait(() => expect(button()).not.toBeDisabled())
})
