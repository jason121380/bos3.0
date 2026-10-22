// 保護「編輯紅利點數紀錄」：載入原紀錄後帶入日期、設計師、顧客、點數、備註；載入中不可按儲存；
// 儲存前依序檢查日期、設計師、顧客、點數，缺什麼提示什麼且不送出；送出 { bonusId: 網址 id, bonusInput: 表單內容 }，
// 成功導回紅利紀錄列表，後端回 false 或錯誤時提示並可再按。GraphQL 全由 testkit 的模擬 link 回應，不修改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerBonusRecordEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('ui/date-picker', () => {
  const MockPicker = ({ label, value, onChange, slots, format }) => (
    <div>
      {slots && slots.field ? slots.field({ value: new Date(value), format, onClick: () => {} }) : null}
      <input aria-label={`選擇${label}`} onChange={e => onChange(e.target.value === '' ? null : new Date(e.target.value))} />
    </div>
  )
  return { MobileDatePicker: MockPicker }
})
jest.mock('components/EmployeeAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="designer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ userId: 'designer-2', userName: 'Amy' })}>選設計師</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除設計師</button>
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="customer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: 'customer-2', name: '林先生' })}>選顧客</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除顧客</button>
  </div>
))

const RECORD = {
  customerId: 'customer-1',
  designerId: 'designer-1',
  date: new Date(2026, 9, 21, 15, 30).getTime(),
  bonus: 30,
  remark: '生日禮',
}

const setup = (fixtures = {}, options = {}) =>
  renderPage(<CustomerBonusRecordEdit />, {
    fixtures: {
      GET_CUSTOMER_BONUS_DEPOSIT_RECORD: { customerBonusDepositRecord: RECORD },
      UPDATE_BONUS_DEPOSIT: { updateBonusDeposit: true },
      ...fixtures,
    },
    path: '/customer-bonus-record/edit/:id',
    route: '/customer-bonus-record/edit/bonus-7',
    ...options,
  })

const fieldInput = label => screen.getByText(label).parentElement.querySelector('input')
const save = () => fireEvent.click(screen.getByText('儲存'))

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('編輯紅利點數紀錄', () => {
  it('載入中不可儲存；載入後帶入原紀錄並以網址 id 查詢', async () => {
    const utils = setup()
    expect(screen.getByText('儲存')).toBeDisabled()
    await utils.settle()
    expect(callsOf(utils.calls, 'GET_CUSTOMER_BONUS_DEPOSIT_RECORD')[0].variables).toEqual({ bonusId: 'bonus-7' })
    expect(screen.getByText('儲存')).not.toBeDisabled()
    expect(screen.getByLabelText('日期')).toHaveValue('2026/10/21')
    expect(screen.getByTestId('designer')).toHaveAttribute('data-value', 'designer-1')
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', 'customer-1')
    expect(fieldInput('紅利點數')).toHaveValue(30)
    expect(fieldInput('備註')).toHaveValue('生日禮')
  })

  it('依序檢查日期、設計師、顧客、點數，缺少時提示且不送出', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/01' } })
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '' } })
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '日期格式有誤', variant: 'warning' })
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/01' } })
    fireEvent.click(screen.getByText('清除設計師'))
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇設計師', variant: 'warning' })
    fireEvent.click(screen.getByText('選設計師'))
    fireEvent.click(screen.getByText('清除顧客'))
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇顧客', variant: 'warning' })
    fireEvent.click(screen.getByText('選顧客'))
    fireEvent.change(fieldInput('紅利點數'), { target: { value: '' } })
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入點數', variant: 'warning' })
    expect(callsOf(utils.calls, 'UPDATE_BONUS_DEPOSIT')).toHaveLength(0)
    expect(screen.getByText('儲存')).not.toBeDisabled()
  })

  it('未改動直接儲存：送出原紀錄內容（點數為數字），成功導回列表', async () => {
    const utils = setup()
    await utils.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'UPDATE_BONUS_DEPOSIT')[0].variables).toEqual({
      input: { bonusId: 'bonus-7', bonusInput: RECORD },
    })
    await wait(() => expect(currentLocation()).toBe('/customer-bonus-record'))
  })

  // 已知缺口（待 Jason 決定）：編輯頁改過點數後送出的是輸入框字串（'45'），新增頁會 parseInt 轉整數，編輯頁沒有
  // （views/CustomerBonusRecordEdit/index.js:64 直接送 submitData）。若後端 bonus 為 Int，改過點數的編輯會被拒絕。
  // 建議：比照新增頁送出前 parseInt(bonus, 10)。
  it('修改日期、設計師、顧客、點數（小數捨去）、備註後送出；已知缺口：點數以字串送出', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026/10/01' } })
    fireEvent.click(screen.getByText('選設計師'))
    fireEvent.click(screen.getByText('選顧客'))
    fireEvent.focusIn(fieldInput('紅利點數'))
    fireEvent.wheel(fieldInput('紅利點數'))
    fireEvent.change(fieldInput('紅利點數'), { target: { value: '45.9' } })
    fireEvent.change(fieldInput('備註'), { target: { value: '補登' } })
    save()
    await wait(() => expect(callsOf(utils.calls, 'UPDATE_BONUS_DEPOSIT')).toHaveLength(1))
    expect(callsOf(utils.calls, 'UPDATE_BONUS_DEPOSIT')[0].variables.input).toEqual({
      bonusId: 'bonus-7',
      bonusInput: {
        customerId: 'customer-2',
        designerId: 'designer-2',
        date: new Date(2026, 9, 1).getTime(),
        bonus: '45',
        remark: '補登',
      },
    })
  })

  it('後端回 false：提示儲存失敗、不導頁、按鈕恢復可按', async () => {
    const utils = setup({ UPDATE_BONUS_DEPOSIT: { updateBonusDeposit: false } })
    await utils.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存失敗', variant: 'error' }))
    expect(currentLocation()).toBe('/customer-bonus-record/edit/bonus-7')
    expect(screen.getByText('儲存')).not.toBeDisabled()
  })

  it('儲存發生錯誤：以錯誤訊息提示、按鈕恢復可按', async () => {
    const utils = setup({ UPDATE_BONUS_DEPOSIT: new Error('紀錄不存在') })
    await utils.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '紀錄不存在', variant: 'error' }))
    expect(screen.getByText('儲存')).not.toBeDisabled()
  })

  // 已知缺口（待 Jason 決定）：讀取原紀錄失敗（或查無紀錄回 null）時，effect 以 undefined／null 取代表單資料，
  // 下一次渲染讀 submitData.date 拋錯，整頁進入錯誤畫面（views/CustomerBonusRecordEdit/index.js:30）。建議：查無資料時保留預設值並提示。
  it('已知缺口：讀取原紀錄失敗時整頁進入錯誤畫面', async () => {
    const utils = setup({ GET_CUSTOMER_BONUS_DEPOSIT_RECORD: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
