// 保護「新增紅利點數」：從顧客詳細頁帶入的顧客 id 會預先帶入；送出前依序檢查日期、設計師、顧客、點數，缺什麼提示什麼且不送出；
// 點數只取整數（小數直接捨去、可為負數扣點），送出的 input（日期為台灣時間當日的時間戳、設計師、顧客、整數點數、備註）正確；
// 成功導回紅利紀錄列表，後端回 false 或錯誤時提示並可再按。GraphQL 全由 testkit 的模擬 link 回應，不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import CustomerBonusRecordCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
// 日期選擇器本體另有測試；這裡以輸入框代替，並照實呼叫頁面自訂的 slots.field（顯示 yyyy/MM/dd）
jest.mock('ui/date-picker', () => {
  const MockPicker = ({ label, value, onChange, slots, format }) => (
    <div>
      {slots && slots.field ? slots.field({ value: new Date(value), format, onClick: () => {} }) : null}
      <input aria-label={`選擇${label}`} onChange={e => onChange(e.target.value === '' ? null : new Date(e.target.value))} />
    </div>
  )
  return { MobileDatePicker: MockPicker }
})
jest.mock('components/EmployeeAutoComplete', () => ({ label, value, onChange }) => (
  <div data-testid="designer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ userId: 'designer-1', userName: '王小美' })}>選{label}</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除設計師</button>
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ label, value, onChange }) => (
  <div data-testid="customer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: 'customer-1', name: '陳小姐' })}>選{label}</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除顧客</button>
  </div>
))

const setup = ({ fixtures = {}, route = '/customer-bonus-record/create' } = {}) =>
  renderPage(<CustomerBonusRecordCreate />, {
    fixtures: { ADD_CUSTOMER_BONUS: { addCustomerBonus: true }, ...fixtures },
    path: '/customer-bonus-record/create/:id?',
    route,
  })

// Field 的標籤沒有 htmlFor，以標籤所在欄位找輸入框
const fieldInput = label => screen.getByText(label).parentElement.querySelector('input')
const bonusInput = () => fieldInput('紅利點數')
const submit = () => fireEvent.click(screen.getByText('新增'))

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增紅利點數', () => {
  it('預設日期為今天、點數 0；從顧客詳細頁進入時帶入該顧客', async () => {
    setup({ route: '/customer-bonus-record/create/customer-9' })
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', 'customer-9')
    expect(bonusInput()).toHaveValue(0)
    const today = new Date()
    const pad = n => String(n).padStart(2, '0')
    expect(screen.getByLabelText('日期')).toHaveValue(`${today.getFullYear()}/${pad(today.getMonth() + 1)}/${pad(today.getDate())}`)
  })

  it('依序檢查：日期、設計師、顧客、點數，缺少時提示且不送出', async () => {
    const utils = setup()
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/20' } })
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '' } })
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '日期格式有誤', variant: 'warning' })

    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/20' } })
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇設計師', variant: 'warning' })

    fireEvent.click(screen.getByText('選選擇設計師'))
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇顧客', variant: 'warning' })

    fireEvent.click(screen.getByText('選選擇顧客'))
    fireEvent.change(bonusInput(), { target: { value: '' } })
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入點數', variant: 'warning' })
    expect(callsOf(utils.calls, 'ADD_CUSTOMER_BONUS')).toHaveLength(0)
    // 檢查失敗後按鈕仍可再按
    expect(screen.getByText('新增')).not.toBeDisabled()
  })

  it('清除設計師或顧客後視為未選擇', async () => {
    setup({ route: '/customer-bonus-record/create/customer-9' })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('清除設計師'))
    expect(screen.getByTestId('designer')).toHaveAttribute('data-value', '')
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇設計師', variant: 'warning' })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('清除顧客'))
    submit()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇顧客', variant: 'warning' })
  })

  it('送出：點數小數捨去轉整數、日期為選定日（台灣時間）00:00，成功後導回紅利紀錄列表', async () => {
    const utils = setup()
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/20' } })
    expect(screen.getByLabelText('日期')).toHaveValue('2026/10/20')
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    fireEvent.focusIn(bonusInput())
    fireEvent.wheel(bonusInput())
    fireEvent.change(bonusInput(), { target: { value: '12.7' } })
    expect(bonusInput()).toHaveValue(12)
    fireEvent.change(fieldInput('備註'), { target: { value: '活動贈點' } })
    submit()
    expect(screen.getByText('新增')).toBeDisabled()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'ADD_CUSTOMER_BONUS')[0].variables).toEqual({
      input: {
        date: new Date(2026, 9, 20).getTime(),
        designerId: 'designer-1',
        customerId: 'customer-1',
        bonus: 12,
        remark: '活動贈點',
      },
    })
    await wait(() => expect(currentLocation()).toBe('/customer-bonus-record'))
  })

  it('負數點數照送（扣點）', async () => {
    const utils = setup({ route: '/customer-bonus-record/create/customer-9' })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.change(bonusInput(), { target: { value: '-5' } })
    submit()
    await wait(() => expect(callsOf(utils.calls, 'ADD_CUSTOMER_BONUS')).toHaveLength(1))
    expect(callsOf(utils.calls, 'ADD_CUSTOMER_BONUS')[0].variables.input).toMatchObject({ customerId: 'customer-9', bonus: -5 })
  })

  it('後端回 false：提示新增失敗、不導頁、按鈕恢復可按', async () => {
    setup({ route: '/customer-bonus-record/create/customer-9', fixtures: { ADD_CUSTOMER_BONUS: { addCustomerBonus: false } } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增失敗', variant: 'error' }))
    expect(currentLocation()).toBe('/customer-bonus-record/create/customer-9')
    expect(screen.getByText('新增')).not.toBeDisabled()
  })

  it('送出發生錯誤：以錯誤訊息提示、按鈕恢復可按', async () => {
    setup({ route: '/customer-bonus-record/create/customer-9', fixtures: { ADD_CUSTOMER_BONUS: new Error('顧客不存在') } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '顧客不存在', variant: 'error' }))
    expect(screen.getByText('新增')).not.toBeDisabled()
  })
})
