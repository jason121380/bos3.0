// 保護「抽獎券查詢」的錯誤處理：
// ① 查詢失敗（GraphQL 錯誤）後重設 reCAPTCHA、清掉已用過的驗證 token，必須重新驗證才能再查
//    （已修正，Jason 2026/10/22 長期授權：原本只在查詢成功時重設，失敗後「提交」仍可按，會帶著已用過的 token 再送一次）。
// ② 送出時發生例外：以錯誤提示顯示訊息並重設 reCAPTCHA。
// GraphQL 由 testkit 的模擬 link 回應（②以替身 hook 模擬送出時拋錯），reCAPTCHA 以假元件代替，不連 Google。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, callsOf } from '../../../__tests__/testkit.test'
import CustomerEventTicketSearch from '..'

jest.setTimeout(20000)

const mockRecaptcha = { resets: 0 }
jest.mock('react-google-recaptcha-enterprise', () => {
  const ReactActual = jest.requireActual('react')
  return ReactActual.forwardRef(({ onChange }, ref) => {
    ReactActual.useImperativeHandle(ref, () => ({ reset: () => { mockRecaptcha.resets += 1 } }))
    return <button type="button" onClick={() => onChange('token-1')}>完成驗證</button>
  })
})
const mockHook = { throwOnSearch: false }
jest.mock('hooks/useFetchGetCustomerCheckTicket', () => {
  const actual = jest.requireActual('hooks/useFetchGetCustomerCheckTicket').default
  return () => {
    const [search, result] = actual()
    if (!mockHook.throwOnSearch) return [search, result]
    return [() => { throw new Error('送出失敗') }, result]
  }
})

const submit = () => screen.getByText('提交')
const fillAndSubmit = () => {
  fireEvent.click(screen.getByText('完成驗證'))
  fireEvent.change(screen.getByLabelText(/^電話/), { target: { value: '0912345678' } })
  fireEvent.click(submit())
}

beforeEach(() => {
  mockRecaptcha.resets = 0
  mockHook.throwOnSearch = false
})
afterEach(cleanup)

describe('抽獎券查詢：錯誤處理', () => {
  // 已修正：查詢失敗原本不重設驗證
  it('查詢失敗後重設驗證、清掉 token，需重新驗證才可再查', async () => {
    const { calls, settle } = renderPage(<CustomerEventTicketSearch />, { fixtures: { GET_CUSTOMER_CHECK_TICKET: new Error('驗證失敗') } })
    fillAndSubmit()
    await settle()
    expect(callsOf(calls, 'GET_CUSTOMER_CHECK_TICKET')).toHaveLength(1)
    await wait(() => expect(mockRecaptcha.resets).toBe(1))
    expect(submit()).toBeDisabled()
    expect(screen.queryByText('流水號')).toBeNull()
  })

  it('送出時發生例外：提示錯誤訊息並重設驗證', async () => {
    mockHook.throwOnSearch = true
    renderPage(<CustomerEventTicketSearch />)
    fillAndSubmit()
    expect(await screen.findByText('送出失敗')).toBeInTheDocument()
    expect(mockRecaptcha.resets).toBe(1)
  })
})
