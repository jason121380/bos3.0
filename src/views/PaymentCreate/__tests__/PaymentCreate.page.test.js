// 保護「新增支付方式」：
// - 名稱、手續費類別、手續費扣項方式都填了才能按「新增」
// - 手續費：非數字輸入不接受；固定金額無條件捨去成整數、百分比保留小數；送出時 fee 轉成數字
// - 「金額呈現為0」勾選後送出 isNoCash: true
// - 成功：重抓支付方式、導回列表並提示；失敗：顯示錯誤、留在本頁
// - 手續費欄聚焦時全選、滾輪不改值（離開焦點）
// 名稱欄的 onChange 在 setState updater 內才讀 event.target.value，因此以 typeLikeBrowser 輸入（見 CLAUDE.md）。
// GraphQL 全由 testkit 的模擬 link 回應，不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import PaymentCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const setup = (fixtures = {}) =>
  renderPage(<PaymentCreate />, {
    fixtures: { PAYMENTS: { merchantPayWays: [] }, CREATE_PAYMENT: { addPayWay: true }, ...fixtures },
    route: '/payment/create',
  })

// NativeSelect 的 <option> value 是選項索引（第 0 個是 disabled 的提示）
const pick = (testId, index) => fireEvent.change(screen.getByTestId(testId), { target: { value: String(index) } })
const feeInput = () => document.querySelector('input[data-testid^="fee-"]')
const submit = () => screen.getByTestId('create-payment')

// 停用鈕旁的「尚缺：…」（STYLE.md §6，2026/10/30）：讓使用者知道還差哪些欄位
const missingText = () => (screen.queryByText(/^尚缺：/) || {}).textContent

const fillValid = () => {
  typeLikeBrowser(screen.getByTestId('name'), '信用卡')
  pick('fee-category', 1) // PERCENT 百分比(%)
  pick('payment-deductions', 2) // onSales 業績
}

describe('新增支付方式', () => {
  it('必填欄位未填完時不能新增；填完名稱、類別、扣項方式才可按', async () => {
    const { settle } = setup()
    await settle()
    expect(submit()).toBeDisabled()
    expect(missingText()).toMatch(/名稱.*手續費類別.*手續費扣項方式/)
    expect(submit()).toHaveAttribute('aria-describedby', 'payment-create-missing')
    typeLikeBrowser(screen.getByTestId('name'), '信用卡')
    expect(submit()).toBeDisabled()
    expect(missingText()).not.toMatch(/名稱/)
    pick('fee-category', 1)
    expect(submit()).toBeDisabled()
    expect(missingText()).toBe('尚缺：手續費扣項方式')
    pick('payment-deductions', 1)
    expect(submit()).not.toBeDisabled()
    expect(missingText()).toBeUndefined()
  })

  it('百分比手續費保留小數、勾選金額呈現為0，送出 fee 為數字並導回列表', async () => {
    const { calls, settle } = setup()
    await settle()
    fillValid()
    expect(screen.getByText('手續費 - 百分比(%)')).toBeInTheDocument()
    fireEvent.change(feeInput(), { target: { value: '2.75' } })
    // 非數字輸入不接受，維持原值
    fireEvent.change(feeInput(), { target: { value: '2.7a' } })
    expect(feeInput()).toHaveValue('2.75')
    fireEvent.click(screen.getByLabelText('金額呈現為0'))
    const before = callsOf(calls, 'PAYMENTS').length
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_PAYMENT')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_PAYMENT')[0].variables.input).toEqual({
      type: 'onSales',
      name: '信用卡',
      fee: 2.75,
      amountType: 'PERCENT',
      isNoCash: true,
    })
    await wait(() => expect(currentLocation()).toBe('/payments'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '新增支付方式成功', variant: 'success' })
    expect(callsOf(calls, 'PAYMENTS').length).toBeGreaterThan(before)
  })

  it('固定金額的手續費無條件捨去成整數', async () => {
    const { calls, settle } = setup()
    await settle()
    typeLikeBrowser(screen.getByTestId('name'), '現金券')
    pick('fee-category', 2) // AMOUNT 固定金額
    pick('payment-deductions', 3) // onSalary 薪水
    expect(screen.getByText('手續費 - 固定金額')).toBeInTheDocument()
    fireEvent.change(feeInput(), { target: { value: '15.9' } })
    expect(feeInput()).toHaveValue('15')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_PAYMENT')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_PAYMENT')[0].variables.input).toMatchObject({ fee: 15, amountType: 'AMOUNT', type: 'onSalary', isNoCash: false })
  })

  it('新增失敗時顯示錯誤、留在本頁', async () => {
    const { calls, settle } = setup({ CREATE_PAYMENT: new Error('名稱重複') })
    await settle()
    fillValid()
    fireEvent.click(submit())
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('名稱重複') }))
    )
    expect(callsOf(calls, 'CREATE_PAYMENT')).toHaveLength(1)
    expect(currentLocation()).toBe('/payment/create')
  })

  it('手續費欄聚焦時全選內容，滾動滑鼠滾輪時離開焦點（避免滾輪改到數字）', async () => {
    const { settle } = setup()
    await settle()
    const input = feeInput()
    const select = jest.spyOn(input, 'select')
    fireEvent.focusIn(input)
    expect(select).toHaveBeenCalled()
    input.focus()
    expect(document.activeElement).toBe(input)
    fireEvent.wheel(input)
    expect(document.activeElement).not.toBe(input)
  })
})
