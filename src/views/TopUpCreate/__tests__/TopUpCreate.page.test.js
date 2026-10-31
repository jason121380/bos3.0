// 保護「新增入金」：預設日期為現在；付款方式選項為「現金」＋店家的支付方式，選現金時不顯示手續費負擔方；
// 金額、設計師、顧客、付款方式為必填（缺少時顯示錯誤、選取後清除），金額上限 2147483647；
// 送出的 input（日期時間戳、金額為數字、設計師、顧客、付款方式、手續費負擔方、備註）正確，成功導回入金管理，
// 後端回 false 或錯誤時提示並可再按。GraphQL 全由 testkit 的模擬 link 回應，不建立真實入金。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import format from 'date-fns/format'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import TopUpCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('ui/date-picker', () => ({
  MobileDateTimePicker: ({ value, onChange, slots, format: fmt }) => (
    <div>
      {slots.field({ value: new Date(value), format: fmt, onClick: () => {} })}
      <input aria-label="選擇日期時間" onChange={e => onChange(new Date(e.target.value))} />
    </div>
  ),
}))
jest.mock('components/EmployeeAutoComplete', () => ({ value, onChange, fieldProps }) => (
  <div data-testid="designer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ userId: 'designer-1' })}>
      選{fieldProps.label}
    </button>
    {fieldProps.error && <span>{fieldProps.helperText}</span>}
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ value, onChange, fieldProps }) => (
  <div data-testid="customer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: 'customer-1' })}>
      選{fieldProps.label}
    </button>
    {fieldProps.error && <span>{fieldProps.helperText}</span>}
  </div>
))

const PAYMENTS = {
  merchantPayWays: [
    { id: 'pay-1', name: '信用卡' },
    { id: 'pay-2', name: 'LINE Pay' },
  ],
}

const setup = (fixtures = {}, options = {}) =>
  renderPage(<TopUpCreate />, {
    fixtures: { PAYMENTS, walletDeposit: { walletDeposit: true }, ...fixtures },
    route: '/topup/create',
    ...options,
  })

const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const money = () => screen.getByLabelText('金額')
const payType = () => screen.getByLabelText('付款方式')
const submit = () => fireEvent.click(screen.getByText('新增'))

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增入金', () => {
  it('預設日期為現在；付款方式為現金＋店家支付方式，選現金時不顯示手續費負擔方', async () => {
    // 頁面在 render 時取「現在」，斷言在 settle 之後；兩者跨過整分時會差一分鐘（CI 曾在 06:57/06:58 失敗），
    // 所以記下前後兩個時間點，預設值必須落在其中之一
    const before = format(new Date(), 'yyyy/MM/dd HH:mm')
    const utils = setup()
    await utils.settle()
    const after = format(new Date(), 'yyyy/MM/dd HH:mm')
    expect([before, after]).toContain(screen.getByLabelText('日期').value)
    const options = Array.from(payType().querySelectorAll('option'))
      .map(o => o.textContent)
      .filter(Boolean)
    expect(options).toEqual(['現金', '信用卡', 'LINE Pay'])
    expect(screen.getByLabelText('選擇入金儲值手續費負擔方')).toBeInTheDocument()
    choose(payType(), '現金')
    await wait(() => expect(screen.queryByLabelText('選擇入金儲值手續費負擔方')).toBeNull())
  })

  it('支付方式載入中只有現金與 None 選項', async () => {
    setup({}, { delays: { PAYMENTS: 300 } })
    const options = Array.from(payType().querySelectorAll('option'))
      .map(o => o.textContent)
      .filter(Boolean)
    expect(options).toEqual(['現金', 'None'])
  })

  it('必填檢查：缺金額、設計師、顧客、付款方式時顯示錯誤不送出；選取後錯誤消失', async () => {
    const utils = setup()
    await utils.settle()
    submit()
    expect(await screen.findByText('金額為必填')).toBeInTheDocument()
    expect(screen.getByText('設計師為必填')).toBeInTheDocument()
    expect(screen.getByText('顧客為必填')).toBeInTheDocument()
    expect(screen.getByText('付款方式為必填')).toBeInTheDocument()
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(payType(), '信用卡')
    await wait(() => expect(screen.queryByText('設計師為必填')).toBeNull())
    expect(screen.queryByText('顧客為必填')).toBeNull()
    expect(screen.queryByText('付款方式為必填')).toBeNull()
    fireEvent.change(money(), { target: { value: '2147483648' } })
    submit()
    expect(await screen.findByText('金額必須小於 2147483647')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'walletDeposit')).toHaveLength(0)
  })

  it('送出：日期、數字金額、設計師、顧客、付款方式、手續費負擔方、備註，成功導回入金管理', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(screen.getByLabelText('選擇日期時間'), { target: { value: '2026/10/20 14:30' } })
    expect(screen.getByLabelText('日期').value).toBe('2026/10/20 14:30')
    fireEvent.wheel(money())
    fireEvent.change(money(), { target: { value: '3000' } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    // 已有錯誤以外的情況選取也不需清錯誤
    choose(payType(), 'LINE Pay')
    choose(screen.getByLabelText('選擇入金儲值手續費負擔方'), '由客人負擔')
    fireEvent.change(screen.getByText('備註').parentElement.querySelector('input'), { target: { value: '週年慶' } })
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增入金', variant: 'success' }))
    expect(callsOf(utils.calls, 'walletDeposit')[0].variables).toEqual({
      input: {
        date: new Date(2026, 9, 20, 14, 30).getTime(),
        money: 3000,
        designerId: 'designer-1',
        customerId: 'customer-1',
        payType: 'LINE Pay',
        handlingFeeDecountWay: 'BYCUSTOMER',
        remark: '週年慶',
      },
    })
    await wait(() => expect(currentLocation()).toBe('/topup'))
  })

  const fillValid = () => {
    fireEvent.change(money(), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(payType(), '現金')
  }

  it('後端回 false：提示新增失敗、按鈕恢復可按', async () => {
    const utils = setup({ walletDeposit: { walletDeposit: false } })
    await utils.settle()
    fillValid()
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增失敗', variant: 'error' }))
    expect(screen.getByText('新增')).not.toBeDisabled()
    expect(currentLocation()).toBe('/topup/create')
  })

  it('送出發生錯誤：以錯誤訊息提示', async () => {
    const utils = setup({ walletDeposit: new Error('顧客不存在') })
    await utils.settle()
    fillValid()
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '顧客不存在', variant: 'error' }))
  })

  // 支付方式查詢失敗時只提供「現金」選項、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示；
  // 原本直接 payments.data.merchantPayWays.map 拋錯；Jason 2026/10/22 fix all）
  it('支付方式查詢失敗：付款方式只有現金、不整頁錯誤', async () => {
    const utils = setup({ PAYMENTS: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    const options = Array.from(payType().querySelectorAll('option'))
      .map(o => o.textContent)
      .filter(Boolean)
    expect(options).toEqual(['現金'])
  })

  // 選過手續費負擔方再改成「現金」時不送出隱藏欄位的值（Jason 2026/10/22 fix all）；現金送 WITHOUTHANDLINGFEE（不扣項），
  // 與顧客詳細的入金彈窗相同（後端已確認接受；原本送 null，後端可能不接受，Jason 2026/10/22「照建議」）
  it('選了手續費負擔方後改成現金：送出 handlingFeeDecountWay 為 WITHOUTHANDLINGFEE', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(money(), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(payType(), 'LINE Pay')
    choose(screen.getByLabelText('選擇入金儲值手續費負擔方'), '由客人負擔')
    choose(payType(), '現金')
    submit()
    await wait(() => expect(callsOf(utils.calls, 'walletDeposit')).toHaveLength(1))
    expect(callsOf(utils.calls, 'walletDeposit')[0].variables.input).toMatchObject({ payType: '現金', handlingFeeDecountWay: 'WITHOUTHANDLINGFEE' })
  })

  it('現金改回其他付款方式：負擔方回到未選（不沿用現金的不扣項），重新選取後送出所選', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(money(), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(payType(), '現金')
    choose(payType(), 'LINE Pay')
    submit()
    await wait(() => expect(callsOf(utils.calls, 'walletDeposit')).toHaveLength(1))
    expect(callsOf(utils.calls, 'walletDeposit')[0].variables.input).toMatchObject({ payType: 'LINE Pay', handlingFeeDecountWay: null })
  })
})
