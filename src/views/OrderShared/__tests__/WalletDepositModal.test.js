import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { Provider as BillProvider } from 'context/keyInContext'
import { renderPage, callsOf } from '../../../__tests__/testkit.test'
import WalletDepositModal from '../WalletDepositModal'

// 為什麼重要：「異動入金」直接改顧客的儲值餘額（錢）。守住：
// - 扣除一定以負數送出、儲值以正數送出；預設方向依角色權限（只有扣除權限時預設扣除），沒有任何權限時擋下不送
// - 日期、金額、設計師、顧客、付款方式缺一不可，缺了提示原因且不送出；金額一律取絕對值整數
// - 成功才提示、重新查詢餘額並關閉；後端回失敗或錯誤時提示原因、按鈕恢復可按、彈窗不關（使用者可修正再送）
// - 現金不顯示手續費負擔方
// 設計師／顧客自動完成與日期選擇器以簡化版代替（各自另有測試），這裡只驗證彈窗本身的送出邏輯；GraphQL 由模擬 link 回應。

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('components/EmployeeAutoComplete', () => ({ onChange, value }) => (
  <button type="button" data-testid="pick-designer" data-value={value || ''} onClick={() => onChange({ userId: 'designer-2' })}>
    選設計師
  </button>
))
jest.mock('components/CustomerAutoComplete', () => ({ onChange, value }) => (
  <button type="button" data-testid="pick-customer" data-value={value || ''} onClick={() => onChange({ id: 'customer-2' })}>
    選顧客
  </button>
))
// 與真實日期選擇器相同：選好時回傳 Date，桌機輸入未完成時回傳 Invalid Date
jest.mock('ui/date-picker', () => ({
  DateTimePicker: ({ value, onChange }) => (
    <input aria-label="日期" data-value={value} onChange={e => onChange(new Date(e.target.value === '輸入未完成' ? NaN : e.target.value))} />
  ),
}))

afterEach(cleanup)

const PAYMENTS = { merchantPayWays: [{ id: 'pay-1', name: '信用卡' }, { id: 'pay-2', name: 'LINE Pay' }] }
const BOTH = { allowDepositAddition: true, allowDepositDeduction: true }

function setup({ identity = BOTH, bill = { customerId: 'customer-1', designerId: 'designer-1' }, walletDeposit = { walletDeposit: true } } = {}) {
  const onClose = jest.fn()
  const refetch = jest.fn()
  const page = renderPage(
    <BillProvider value={{ bill }}>
      <WalletDepositModal openWalletDeposit onClose={onClose} response={{ refetch }} identity={identity} />
    </BillProvider>,
    { fixtures: { PAYMENTS, walletDeposit } }
  )
  return { ...page, onClose, refetch }
}

const field = name => document.querySelector(`[name="${name}"]`)
const optionTexts = select => [...select.options].filter(o => !o.hidden).map(o => o.textContent)
const choose = (select, text) => {
  const option = [...select.options].find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const confirmButton = () => screen.getByRole('button', { name: /^確認/ })
const sent = calls => callsOf(calls, 'walletDeposit').map(c => c.variables.input)

const fillAndSubmit = async ({ settle }, { money = '1000', payType = '信用卡' } = {}) => {
  await settle()
  fireEvent.change(field('money'), { target: { value: money } })
  if (payType) choose(field('payType'), payType)
}

describe('付款方式', () => {
  it('付款方式清單載入前只有「現金」可選，載入後列出店家的付款方式', async () => {
    const page = setup()
    expect(optionTexts(field('payType'))).toEqual(['現金', 'None'])
    await page.settle()
    expect(optionTexts(field('payType'))).toEqual(['現金', '信用卡', 'LINE Pay'])
  })

  it('現金不顯示手續費負擔方；其他付款方式才顯示', async () => {
    const page = setup()
    await page.settle()
    expect(field('handlingFeeDecountWay')).not.toBeNull()
    choose(field('payType'), '現金')
    expect(field('handlingFeeDecountWay')).toBeNull()
  })
})

describe('送出', () => {
  it('儲值：以正數送出帳單的顧客與設計師、付款方式、手續費負擔方與備註；成功後提示、重新查詢餘額並關閉', async () => {
    const page = setup()
    await fillAndSubmit(page)
    choose(field('handlingFeeDecountWay'), '由客人負擔')
    fireEvent.change(field('remark'), { target: { value: '生日儲值' } })
    expect(confirmButton()).toHaveTextContent('確認儲值')
    fireEvent.click(confirmButton())
    await wait(() => expect(page.onClose).toHaveBeenCalled())
    expect(sent(page.calls)).toEqual([
      {
        customerId: 'customer-1',
        designerId: 'designer-1',
        money: 1000,
        payType: '信用卡',
        date: expect.any(Number),
        remark: '生日儲值',
        handlingFeeDecountWay: 'BYCUSTOMER',
      },
    ])
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功儲值入金', variant: 'success' })
    expect(page.refetch).toHaveBeenCalled()
  })

  it('扣除：金額以負數送出；只有扣除權限時預設就是扣除', async () => {
    const page = setup({ identity: { allowDepositAddition: false, allowDepositDeduction: true } })
    await fillAndSubmit(page, { money: '500' })
    expect(confirmButton()).toHaveTextContent('確認扣除')
    fireEvent.click(confirmButton())
    await wait(() => expect(page.onClose).toHaveBeenCalled())
    expect(sent(page.calls)[0].money).toBe(-500)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功扣除入金', variant: 'success' })
  })

  it('兩種權限都有時可切換成扣除', async () => {
    const page = setup()
    await fillAndSubmit(page, { money: '300' })
    fireEvent.click(screen.getByRole('button', { name: '扣除' }))
    fireEvent.click(confirmButton())
    await wait(() => expect(page.onClose).toHaveBeenCalled())
    expect(sent(page.calls)[0].money).toBe(-300)
  })

  it('輸入負數或小數：取絕對值的整數（扣除與否由方向決定，不由正負號）', async () => {
    const page = setup()
    await fillAndSubmit(page, { money: '-250.8' })
    expect(field('money')).toHaveValue(250)
    fireEvent.click(confirmButton())
    await wait(() => expect(page.onClose).toHaveBeenCalled())
    expect(sent(page.calls)[0].money).toBe(250)
  })

  it('改選設計師、顧客與日期：以選取的值送出', async () => {
    const page = setup()
    await fillAndSubmit(page)
    fireEvent.click(screen.getByTestId('pick-designer'))
    fireEvent.click(screen.getByTestId('pick-customer'))
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '2026/10/20 09:00' } })
    fireEvent.click(confirmButton())
    await wait(() => expect(page.onClose).toHaveBeenCalled())
    expect(sent(page.calls)[0]).toEqual(
      expect.objectContaining({ designerId: 'designer-2', customerId: 'customer-2', date: new Date('2026/10/20 09:00').getTime() })
    )
  })
})

describe('不送出的情況：提示原因、按鈕恢復可按、彈窗不關', () => {
  const expectBlocked = async (page, message) => {
    fireEvent.click(confirmButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message, variant: 'error' }))
    expect(sent(page.calls)).toEqual([])
    expect(confirmButton()).not.toBeDisabled()
    expect(page.onClose).not.toHaveBeenCalled()
  }

  // 沒有任何入金權限時方向是空的：若照送，金額不會轉負數，等於儲值
  it('沒有儲值也沒有扣除權限', async () => {
    const page = setup({ identity: { allowDepositAddition: false, allowDepositDeduction: false } })
    await fillAndSubmit(page)
    await expectBlocked(page, '沒有異動入金的權限')
  })

  it('日期輸入未完成（Invalid Date）', async () => {
    const page = setup()
    await fillAndSubmit(page)
    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '輸入未完成' } })
    await expectBlocked(page, '日期有誤')
  })

  it('沒有設計師', async () => {
    const page = setup({ bill: { customerId: 'customer-1', designerId: '' } })
    await fillAndSubmit(page)
    await expectBlocked(page, '請選擇設計師')
  })

  it('沒有顧客', async () => {
    const page = setup({ bill: { customerId: '', designerId: 'designer-1' } })
    await fillAndSubmit(page)
    await expectBlocked(page, '請選擇顧客')
  })

  it('沒有選付款方式', async () => {
    const page = setup()
    await fillAndSubmit(page, { payType: null })
    await expectBlocked(page, '請選擇付款方式')
  })

  it('後端回傳未成功：提示「儲值失敗」', async () => {
    const page = setup({ walletDeposit: { walletDeposit: false } })
    await fillAndSubmit(page)
    fireEvent.click(confirmButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲值失敗', variant: 'error' }))
    expect(confirmButton()).not.toBeDisabled()
    expect(page.onClose).not.toHaveBeenCalled()
    expect(page.refetch).not.toHaveBeenCalled()
  })

  it('後端回錯誤：提示錯誤內容', async () => {
    const page = setup({ walletDeposit: new Error('顧客不存在') })
    await fillAndSubmit(page)
    fireEvent.click(confirmButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '顧客不存在', variant: 'error' }))
    expect(page.onClose).not.toHaveBeenCalled()
  })
})

describe('金額欄的操作', () => {
  it('點進金額欄時全選，直接輸入就取代原本的 0', async () => {
    const page = setup()
    await page.settle()
    const select = jest.spyOn(window.HTMLInputElement.prototype, 'select')
    field('money').focus() // React 17 以 focusin 觸發 onFocus
    expect(select).toHaveBeenCalled()
    select.mockRestore()
  })

  it('滑鼠滾輪不會改到金額：滾動時移開焦點', async () => {
    const page = setup()
    await page.settle()
    field('money').focus()
    expect(document.activeElement).toBe(field('money'))
    fireEvent.wheel(field('money'))
    expect(document.activeElement).not.toBe(field('money'))
  })

  it('按「返回」關閉彈窗、不送出', async () => {
    const page = setup()
    await page.settle()
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(page.onClose).toHaveBeenCalled()
    expect(sent(page.calls)).toEqual([])
  })
})

test('異動入金保留受控開啟：Esc 不關閉，只能由原返回按鈕關閉', async () => {
  const { settle, onClose } = setup()
  await settle()
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '返回' }))
  expect(onClose).toHaveBeenCalledTimes(1)
})
