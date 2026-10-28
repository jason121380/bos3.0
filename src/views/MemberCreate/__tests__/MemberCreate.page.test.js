// 保護顧客前台「成為會員」：未登入時提示並導到顧客登入頁（帶店家與回跳網址）；登入後填姓名、性別、生日（台灣時間當日）、推薦碼，
// 姓名未填不可註冊；送出的 input 與畫面一致，成功提示註冊成功。生日屬個資：送出的是選定日的時間戳，清除日期不會變成 1970/01/01。
// GraphQL 全由 testkit 的模擬 link 回應，不建立真實會員。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import MemberCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('ui/date-picker', () => ({
  DatePicker: ({ label, value, onChange }) => (
    <input aria-label={label} data-value={String(value)} onChange={e => onChange(e.target.value === '' ? null : new Date(e.target.value))} />
  ),
}))

function Page() {
  const { useLocation } = require('react-router')
  return <MemberCreate location={useLocation()} />
}

const setup = (fixtures = {}) =>
  renderPage(<Page />, {
    fixtures: { UpdateCustomerProfile: { updateCustomerProfile: { id: 'customer-1' } }, ...fixtures },
    path: '/customer/member/create',
    route: '/customer/member/create?merchantid=m-9',
  })

beforeEach(() => {
  localStorage.clear()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('成為會員', () => {
  it('未登入：提示尚未登入並導到顧客登入頁', async () => {
    setup()
    await wait(() => expect(currentLocation()).toMatch(/^\/customer\/login\?/))
    expect(decodeURIComponent(currentLocation())).toBe(
      '/customer/login?merchantid=m-9&redirect=/customer/member/create?merchantid=m-9'
    )
    expect(openSnackbar).toHaveBeenCalledWith({ message: '尚未登入', variant: 'warning' })
  })

  it('登入後：姓名未填不可註冊；填寫後送出姓名、性別、生日、推薦碼', async () => {
    localStorage.setItem('customer', JSON.stringify({ userCode: 'code-1' }))
    const utils = setup()
    expect(currentLocation()).toBe('/customer/member/create?merchantid=m-9')
    const submit = screen.getByText('註冊')
    expect(submit).toBeDisabled()

    typeLikeBrowser(screen.getByLabelText('姓名'), '陳小姐')
    expect(screen.getByLabelText('姓名')).toHaveValue('陳小姐')
    expect(submit).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '女' }))
    expect(screen.getByRole('button', { name: '女' })).toHaveAttribute('aria-pressed', 'true')
    // 再按一次已選的性別不會變成未選
    fireEvent.click(screen.getByRole('button', { name: '女' }))
    expect(screen.getByRole('button', { name: '女' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.change(screen.getByLabelText('生日'), { target: { value: '1990/02/28' } })
    // 清除日期：保留原本選的生日（不會變成 0／1970）
    fireEvent.change(screen.getByLabelText('生日'), { target: { value: '' } })
    expect(screen.getByLabelText('生日')).toHaveAttribute('data-value', String(new Date(1990, 1, 28).getTime()))
    typeLikeBrowser(screen.getByLabelText('推薦碼'), 'REF01')

    fireEvent.click(submit)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '註冊成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'UpdateCustomerProfile')[0].variables).toEqual({
      input: { name: '陳小姐', gender: 'FEMALE', birthday: new Date(1990, 1, 28).getTime(), recommandCode: 'REF01' },
    })
  })
})
