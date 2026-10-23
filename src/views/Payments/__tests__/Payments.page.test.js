// 保護「支付方式設定」列表：
// - 每筆支付方式顯示名稱、手續費（百分比加 %、固定金額只顯示千分位）、扣項方式（業績／薪水／無扣項空白）與「金額是否為0」
// - 勾選（單筆、全選、取消全選、再點一次取消）後按刪除，送出的 ids 恰為勾選的支付方式；成功後清空勾選並提示
// - 編輯連結指向該筆支付方式的編輯頁
// - 查詢失敗時不整頁壞（顯示 0 筆）
// GraphQL 全由 testkit 的模擬 link 回應，不刪除真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import Payments from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const PAY_WAYS = [
  { id: 'p-1', name: 'LINE Pay', fee: 2.5, amountType: 'PERCENT', type: 'onSales', isNoCash: false },
  { id: 'p-2', name: '街口', fee: 1500, amountType: 'AMOUNT', type: 'onSalary', isNoCash: true },
  { id: 'p-3', name: '轉帳', fee: 0, amountType: 'AMOUNT', type: 'none', isNoCash: false },
]

const setup = (fixtures = {}) =>
  renderPage(<Payments />, {
    fixtures: { PAYMENTS: { merchantPayWays: PAY_WAYS }, DELETE_PAYMENT: { deletePayWay: true }, ...fixtures },
    route: '/payments',
  })

beforeEach(() => loginAs())
afterEach(cleanup)

const row = name => screen.getByText(name).closest('tr')

describe('支付方式設定', () => {
  it('列出名稱、手續費（百分比加 %、固定金額千分位）、扣項方式與金額是否為 0', async () => {
    const { settle } = setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    await settle()
    const linePay = within(row('LINE Pay'))
    expect(linePay.getByText('2.5%')).toBeInTheDocument()
    expect(linePay.getByText('業績')).toBeInTheDocument()
    expect(linePay.getByText('否')).toBeInTheDocument()
    const jko = within(row('街口'))
    expect(jko.getByText('1,500')).toBeInTheDocument()
    expect(jko.getByText('薪水')).toBeInTheDocument()
    expect(jko.getByText('是')).toBeInTheDocument()
    const transfer = row('轉帳')
    // 無扣項顯示空白，不顯示 none
    expect(within(transfer).queryByText('none')).toBeNull()
    expect(within(transfer).getByText('0')).toBeInTheDocument()
    expect(screen.getByLabelText('編輯 街口').getAttribute('href')).toBe('/payment/edit/p-2')
  })

  it('勾選兩筆後刪除，送出的 ids 恰為勾選的兩筆；成功後清空勾選、重抓列表並提示', async () => {
    const { calls, settle } = setup()
    await screen.findByText('共 3 筆')
    await settle()
    fireEvent.click(screen.getByLabelText('選取 LINE Pay'))
    fireEvent.click(screen.getByLabelText('選取 轉帳'))
    // 部分勾選：全選框為半選
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    const before = callsOf(calls, 'PAYMENTS').length
    fireEvent.click(screen.getByText('刪除'))
    await wait(() => expect(callsOf(calls, 'DELETE_PAYMENT')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_PAYMENT')[0].variables).toEqual({ ids: ['p-1', 'p-3'] })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除支付方式成功', variant: 'success' }))
    expect(screen.getByLabelText('選取 LINE Pay').checked).toBe(false)
    await wait(() => expect(callsOf(calls, 'PAYMENTS').length).toBeGreaterThan(before))
  })

  it('再點一次已勾選的項目會取消勾選；全選勾選全部、再按一次全部取消', async () => {
    const { calls, settle } = setup()
    await screen.findByText('共 3 筆')
    await settle()
    fireEvent.click(screen.getByLabelText('選取 街口'))
    fireEvent.click(screen.getByLabelText('選取 街口'))
    expect(screen.getByLabelText('選取 街口').checked).toBe(false)
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('全選').checked).toBe(true)
    expect(screen.getByText('已選 3 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByText('刪除'))
    await wait(() => expect(callsOf(calls, 'DELETE_PAYMENT')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_PAYMENT')[0].variables.ids).toEqual(['p-1', 'p-2', 'p-3'])
    await wait(() => expect(screen.getByLabelText('全選').checked).toBe(false))
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 LINE Pay').checked).toBe(false)
  })

  it('查詢失敗時顯示 0 筆、全選停用，不進錯誤畫面', async () => {
    const { settle } = setup({ PAYMENTS: new Error('查詢失敗') })
    expect(await screen.findByText('共 0 筆')).toBeInTheDocument()
    await settle()
    expect(screen.getByLabelText('全選')).toBeDisabled()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
