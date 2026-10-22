// 保護顧客前台「抽獎券查詢」：未通過 reCAPTCHA 不可送出；電話空白時提示不送出；查詢只送電話與驗證 token（不送姓名），
// 查完後重設驗證（token 清空、需重新驗證才可再查）；結果依活動分組，有券的活動點開才列出流水號、發券日期（台灣時間）、發券店家，
// 沒有券時顯示後端訊息。GraphQL 全由 testkit 的模擬 link 回應；reCAPTCHA 以假元件代替，不連 Google。
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

const RESULT = {
  message: '',
  customerEventTickets: [
    {
      eventName: '週年慶抽獎',
      tickets: [
        { serialNumber: 'SN-001', consumptionDate: new Date(2026, 9, 21, 23, 40).getTime(), consumptionStoreName: '信義店' },
        { serialNumber: 'SN-002', consumptionDate: new Date(2026, 9, 1, 0, 5).getTime(), consumptionStoreName: '大安店' },
      ],
    },
    { eventName: '已結束活動', tickets: [] },
  ],
}

const setup = (result = RESULT) =>
  renderPage(<CustomerEventTicketSearch />, { fixtures: { GET_CUSTOMER_CHECK_TICKET: { customerCheckTicket: result } } })

const submit = () => screen.getByText('提交')

beforeEach(() => {
  mockRecaptcha.resets = 0
})
afterEach(cleanup)

describe('抽獎券查詢', () => {
  it('未通過驗證不可送出；電話空白提示不送出，點畫面其他地方關閉提示', async () => {
    const utils = setup()
    expect(submit()).toBeDisabled()
    fireEvent.click(screen.getByText('完成驗證'))
    expect(submit()).not.toBeDisabled()
    fireEvent.change(screen.getByLabelText(/^電話/), { target: { value: '   ' } })
    fireEvent.click(submit())
    expect(await screen.findByText('電話不得為空')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'GET_CUSTOMER_CHECK_TICKET')).toHaveLength(0)
    await new Promise(resolve => setTimeout(resolve, 10))
    fireEvent.click(document.body)
    await wait(() => expect(screen.queryByText('電話不得為空')).toBeNull())
  })

  it('查詢送出電話與驗證 token；查完重設驗證，結果依活動分組、點開才顯示券明細', async () => {
    const utils = setup()
    fireEvent.click(screen.getByText('完成驗證'))
    fireEvent.change(screen.getByLabelText(/^電話/), { target: { value: '0912345678' } })
    fireEvent.click(submit())
    await screen.findByText('週年慶抽獎')
    expect(callsOf(utils.calls, 'GET_CUSTOMER_CHECK_TICKET')[0].variables).toEqual({
      input: { cellphone: '0912345678', recaptchaToken: 'token-1' },
    })
    expect(mockRecaptcha.resets).toBe(1)
    expect(submit()).toBeDisabled()

    expect(screen.queryByText('SN-001')).toBeNull()
    fireEvent.click(screen.getByText('週年慶抽獎'))
    expect(screen.getByText('SN-001')).toBeInTheDocument()
    expect(screen.getByText('2026/10/21')).toBeInTheDocument()
    expect(screen.getByText('信義店')).toBeInTheDocument()
    expect(screen.getByText('2026/10/01')).toBeInTheDocument()
    fireEvent.click(screen.getByText('週年慶抽獎'))
    expect(screen.queryByText('SN-001')).toBeNull()
    // 沒有券的活動點了也不展開
    fireEvent.click(screen.getByText('已結束活動'))
    expect(screen.queryByText('流水號')).toBeNull()
  })

  it('沒有抽獎券時顯示後端訊息', async () => {
    setup({ message: '查無抽獎券', customerEventTickets: [] })
    fireEvent.click(screen.getByText('完成驗證'))
    fireEvent.change(screen.getByLabelText(/^電話/), { target: { value: '0912345678' } })
    fireEvent.click(submit())
    expect(await screen.findByText('查無抽獎券')).toBeInTheDocument()
  })
})
