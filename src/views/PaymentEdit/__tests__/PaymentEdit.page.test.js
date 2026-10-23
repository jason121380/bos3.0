// 保護「編輯支付方式」：
// - 依網址的 id 查詢該筆支付方式並帶入名稱、手續費類別、手續費、扣項方式、金額呈現為0
// - 儲存送出 updatePayWay(id, input)，id 為查到的支付方式、fee 轉成數字；固定金額捨去小數、非數字不接受
// - 成功：重抓支付方式、導回列表並提示；失敗：顯示錯誤、留在本頁
// - 名稱清空時不能儲存
// - 手續費欄聚焦全選、滾輪離開焦點
// 名稱欄的 onChange 在 setState updater 內才讀 event.target.value，以 typeLikeBrowser 輸入（見 CLAUDE.md）。
// GraphQL 全由 testkit 的模擬 link 回應，不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import PaymentEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const PAY_WAY = { id: 'p-9', name: 'LINE Pay', fee: 3, amountType: 'PERCENT', type: 'onSalary', isNoCash: true }

const setup = (fixtures = {}, options = {}) =>
  renderPage(<PaymentEdit match={{ params: { id: 'p-9' } }} />, {
    fixtures: { PAYMENTS: { merchantPayWays: [] }, PAYMENT: { merchantPayWay: PAY_WAY }, UPDATE_PAYMENT: { updatePayWay: true }, ...fixtures },
    route: '/payment/edit/p-9',
    ...options,
  })

const pick = (testId, index) => fireEvent.change(screen.getByTestId(testId), { target: { value: String(index) } })
const feeInput = () => document.querySelector('input[data-testid^="fee-"]')
const submit = () => screen.getByTestId('update-payment')
const selectedText = testId => {
  const select = screen.getByTestId(testId)
  return select.options[select.selectedIndex].textContent
}

describe('編輯支付方式', () => {
  it('依網址 id 查詢並帶入原本的設定', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'PAYMENT')[0].variables).toEqual({ id: 'p-9' })
    expect(screen.getByTestId('name')).toHaveValue('LINE Pay')
    expect(selectedText('fee-category')).toBe('百分比(%)')
    expect(selectedText('payment-deductions')).toBe('薪水')
    expect(feeInput()).toHaveValue('3')
    expect(screen.getByLabelText('金額呈現為0').checked).toBe(true)
    expect(submit()).not.toBeDisabled()
    // 百分比手續費保留小數
    fireEvent.change(feeInput(), { target: { value: '3.5' } })
    expect(feeInput()).toHaveValue('3.5')
  })

  it('改成固定金額、手續費捨去小數、取消金額呈現為0後儲存，送出查到的 id 與數字 fee，並導回列表', async () => {
    const { calls, settle } = setup()
    await settle()
    typeLikeBrowser(screen.getByTestId('name'), '街口支付')
    pick('fee-category', 2) // AMOUNT
    fireEvent.change(feeInput(), { target: { value: '20.6' } })
    expect(feeInput()).toHaveValue('20')
    fireEvent.change(feeInput(), { target: { value: 'abc' } })
    expect(feeInput()).toHaveValue('20')
    pick('payment-deductions', 1) // none
    fireEvent.click(screen.getByLabelText('金額呈現為0'))
    const before = callsOf(calls, 'PAYMENTS').length
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'UPDATE_PAYMENT')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_PAYMENT')[0].variables).toEqual({
      id: 'p-9',
      input: { type: 'none', name: '街口支付', fee: 20, amountType: 'AMOUNT', isNoCash: false },
    })
    await wait(() => expect(currentLocation()).toBe('/payments'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '更新支付方式成功', variant: 'success' })
    expect(callsOf(calls, 'PAYMENTS').length).toBeGreaterThan(before)
  })

  it('名稱清空時不能儲存', async () => {
    const { settle } = setup()
    await settle()
    typeLikeBrowser(screen.getByTestId('name'), '')
    expect(submit()).toBeDisabled()
  })

  it('儲存失敗時顯示錯誤、留在本頁', async () => {
    const { calls, settle } = setup({ UPDATE_PAYMENT: new Error('權限不足') })
    await settle()
    fireEvent.click(submit())
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('權限不足') }))
    )
    expect(callsOf(calls, 'UPDATE_PAYMENT')).toHaveLength(1)
    expect(currentLocation()).toBe('/payment/edit/p-9')
  })

  it('手續費欄聚焦時全選，滾輪時離開焦點', async () => {
    const { settle } = setup()
    await settle()
    const input = feeInput()
    const select = jest.spyOn(input, 'select')
    fireEvent.focusIn(input)
    expect(select).toHaveBeenCalled()
    input.focus()
    fireEvent.wheel(input)
    expect(document.activeElement).not.toBe(input)
  })

  it('查不到這筆支付方式（查詢失敗）時以空表單顯示、儲存不可按，不整頁錯誤（Jason 2026/10/22）', async () => {
    const { settle } = setup({ PAYMENT: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('編輯支付方式', { selector: 'h1' })).toBeInTheDocument()
    expect(submit()).toBeDisabled()
  })
})
