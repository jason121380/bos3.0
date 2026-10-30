// 保護「編輯入金」（/topup/edit/:id）：載入原入金後帶入日期、設計師、顧客、付款方式、手續費負擔方、備註；
// 由客人負擔手續費時金額欄顯示「入金＋手續費」（客人實付）；必填欄位缺少時顯示錯誤、選取後清除；
// 儲存送出 { id, input }，刪除送出 { id }，成功都以 history.replace 導回入金管理（上一頁不再回到編輯頁），後端回 false 或錯誤時提示並可再按。
// GraphQL 全由 testkit 的模擬 link 回應，不修改真實入金。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import TopUpEdit from '..'

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
    <button type="button" onClick={() => onChange({ userId: 'designer-2' })}>
      選{fieldProps.label}
    </button>
    {fieldProps.error && <span>{fieldProps.helperText}</span>}
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ value, onChange, fieldProps }) => (
  <div data-testid="customer" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: 'customer-2' })}>
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
const DETAIL = {
  id: 'dep-1',
  date: new Date(2026, 9, 21, 15, 5).getTime(),
  money: 1000,
  payType: '信用卡',
  Customer: { id: 'customer-1', name: '陳小姐' },
  Maker: { id: 'designer-1', name: '王小美' },
  remark: '週年慶',
  handlingFeeDecountWay: 'BYCUSTOMER',
  handlingFeeDecountPrice: -30,
}

let history
const setup = (fixtures = {}, options = {}) =>
  renderPage(
    <>
      <TopUpEdit match={{ params: { id: 'dep-1' } }} />
      <Route
        render={props => {
          history = props.history
          return null
        }}
      />
    </>,
    {
      fixtures: {
        PAYMENTS,
        walletDepositDetail: { walletDepositDetail: DETAIL },
        SET_WALLET_DEPOSIT: { updateWalletDeposit: true },
        DELETE_WALLET_DEPOSIT: { deleteWalletDeposit: true },
        ...fixtures,
      },
      route: '/topup/edit/dep-1',
      ...options,
    }
  )

const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const selectedText = select => (select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent : '')
const money = () => screen.getByLabelText('金額')
const remark = () => screen.getByText('備註').parentElement.querySelector('input')
const save = () => fireEvent.click(screen.getByText('儲存'))

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('編輯入金', () => {
  it('支付方式載入中顯示 loading', async () => {
    setup({}, { delays: { PAYMENTS: 2000 } })
    expect(await screen.findByText('loading..')).toBeInTheDocument()
  })

  it('帶入原入金：由客人負擔手續費時金額為實付（入金＋手續費），其餘欄位照原值', async () => {
    const utils = setup()
    await utils.settle()
    expect(callsOf(utils.calls, 'walletDepositDetail')[0].variables).toEqual({ id: 'dep-1' })
    expect(screen.getByLabelText('日期').value).toBe('2026/10/21 15:05')
    expect(money()).toHaveValue(1030)
    expect(screen.getByTestId('designer')).toHaveAttribute('data-value', 'designer-1')
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', 'customer-1')
    expect(selectedText(screen.getByLabelText('選擇入金儲值手續費負擔方'))).toBe('由客人負擔')
    expect(remark()).toHaveValue('週年慶')
    // 支付方式比原入金晚到時，付款方式下拉正常顯示原值
    expect(selectedText(screen.getByLabelText('付款方式'))).toBe('信用卡')
  })

  it('原入金比支付方式晚到時，付款方式仍顯示原值；未改動直接儲存送出原值並導回入金管理', async () => {
    const utils = setup({}, { delays: { walletDepositDetail: 100 } })
    await screen.findByLabelText('付款方式')
    await utils.settle()
    expect(selectedText(screen.getByLabelText('付款方式'))).toBe('信用卡')
    save()
    await wait(() => expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')).toHaveLength(1))
    expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')[0].variables).toEqual({
      id: 'dep-1',
      input: {
        money: 1030,
        designerId: 'designer-1',
        customerId: 'customer-1',
        payType: '信用卡',
        handlingFeeDecountWay: 'BYCUSTOMER',
        remark: '週年慶',
        date: DETAIL.date,
      },
    })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存入金成功', variant: 'success' }))
    await wait(() => expect(currentLocation()).toBe('/topup'))
    // 以 replace 回列表（取代列表原本把上一頁推回列表的監聽；Jason 2026/10/22 fix all）
    expect(history.action).toBe('REPLACE')
    expect(history.length).toBe(1)
  })

  it('修改日期、金額、設計師、顧客、付款方式、手續費負擔方、備註後儲存', async () => {
    const utils = setup({ walletDepositDetail: { walletDepositDetail: { ...DETAIL, handlingFeeDecountWay: 'BYDESIGNER' } } })
    await utils.settle()
    expect(money()).toHaveValue(1000)
    fireEvent.change(screen.getByLabelText('選擇日期時間'), { target: { value: '2026/10/01 09:00' } })
    fireEvent.wheel(money())
    fireEvent.change(money(), { target: { value: '2000' } })
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(screen.getByLabelText('付款方式'), 'LINE Pay')
    choose(screen.getByLabelText('選擇入金儲值手續費負擔方'), '不扣項')
    fireEvent.change(remark(), { target: { value: '改備註' } })
    save()
    await wait(() => expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')).toHaveLength(1))
    expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')[0].variables.input).toEqual({
      money: 2000,
      designerId: 'designer-2',
      customerId: 'customer-2',
      payType: 'LINE Pay',
      handlingFeeDecountWay: 'WITHOUTHANDLINGFEE',
      remark: '改備註',
      date: new Date(2026, 9, 1, 9, 0).getTime(),
    })
  })

  // 改成「現金」時不再把隱藏欄位裡原本的值（例如 BYCUSTOMER）一起送出（Jason 2026/10/22 fix all）；現金送 WITHOUTHANDLINGFEE（不扣項），
  // 與顧客詳細的入金彈窗相同（後端已確認接受；原本送 null，Jason 2026/10/22「照建議」）
  it('改成現金後手續費負擔方送 WITHOUTHANDLINGFEE；改回其他付款方式時負擔方為未選', async () => {
    const utils = setup()
    await utils.settle()
    choose(screen.getByLabelText('付款方式'), '現金')
    await wait(() => expect(screen.queryByLabelText('選擇入金儲值手續費負擔方')).toBeNull())
    choose(screen.getByLabelText('付款方式'), 'LINE Pay')
    expect(selectedText(screen.getByLabelText('選擇入金儲值手續費負擔方'))).toBe('')
    choose(screen.getByLabelText('付款方式'), '現金')
    save()
    await wait(() => expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')).toHaveLength(1))
    expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')[0].variables.input).toMatchObject({
      payType: '現金',
      handlingFeeDecountWay: 'WITHOUTHANDLINGFEE',
    })
  })

  it('原資料缺必填欄位時：顯示錯誤不送出，選取後錯誤消失；沒有日期時不顯示日期欄', async () => {
    const utils = setup({
      walletDepositDetail: {
        walletDepositDetail: { ...DETAIL, date: null, payType: '', Customer: { id: '' }, Maker: { id: '' }, handlingFeeDecountWay: null },
      },
    })
    await utils.settle()
    expect(screen.queryByLabelText('日期')).toBeNull()
    fireEvent.change(money(), { target: { value: '' } })
    save()
    expect(await screen.findByText('金額為必填')).toBeInTheDocument()
    expect(screen.getByText('設計師為必填')).toBeInTheDocument()
    expect(screen.getByText('顧客為必填')).toBeInTheDocument()
    expect(screen.getByText('付款方式為必填')).toBeInTheDocument()
    fireEvent.click(screen.getByText('選選擇設計師'))
    fireEvent.click(screen.getByText('選選擇顧客'))
    choose(screen.getByLabelText('付款方式'), '信用卡')
    await wait(() => expect(screen.queryByText('付款方式為必填')).toBeNull())
    expect(screen.queryByText('設計師為必填')).toBeNull()
    expect(screen.queryByText('顧客為必填')).toBeNull()
    fireEvent.change(money(), { target: { value: '2147483648' } })
    save()
    expect(await screen.findByText('金額必須小於 2147483647')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'SET_WALLET_DEPOSIT')).toHaveLength(0)
  })

  it('儲存：後端回 false 提示失敗、錯誤以訊息提示，按鈕恢復可按', async () => {
    const utils = setup({ SET_WALLET_DEPOSIT: { updateWalletDeposit: false } })
    await utils.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存入金失敗', variant: 'error' }))
    expect(screen.getByText('儲存')).not.toBeDisabled()
    cleanup()
    const again = setup({ SET_WALLET_DEPOSIT: new Error('入金已日結') })
    await again.settle()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '入金已日結', variant: 'error' }))
  })

  it('刪除：送出入金 id，成功導回入金管理；回 false 或錯誤提示並可再按', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除入金成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_WALLET_DEPOSIT')[0].variables).toEqual({ id: 'dep-1' })
    await wait(() => expect(currentLocation()).toBe('/topup'))
    expect(history.action).toBe('REPLACE')
    expect(history.length).toBe(1)
    cleanup()

    const failed = setup({ DELETE_WALLET_DEPOSIT: { deleteWalletDeposit: false } })
    await failed.settle()
    fireEvent.click(screen.getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除失敗', variant: 'error' }))
    expect(screen.getByText('刪除')).not.toBeDisabled()
    cleanup()

    const errored = setup({ DELETE_WALLET_DEPOSIT: new Error('入金已使用') })
    await errored.settle()
    fireEvent.click(screen.getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '入金已使用', variant: 'error' }))
  })

  // 讀取原入金失敗時以空白表單顯示、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示）；必填檢查擋下儲存
  // （原本 effect 直接讀 data.walletDepositDetail 拋錯；Jason 2026/10/22 fix all）
  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('讀取原入金失敗：顯示無法載入資料與重新查詢，不顯示空白表單', async () => {
    const utils = setup({ walletDepositDetail: new Error('查無入金') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  })

  it('支付方式查詢失敗：付款方式只有現金、不整頁錯誤', async () => {
    const utils = setup({ PAYMENTS: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    const options = Array.from(screen.getByLabelText('付款方式').querySelectorAll('option'))
      .map(o => o.textContent)
      .filter(Boolean)
    expect(options).toEqual(['現金'])
  })
})
