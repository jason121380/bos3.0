// 保護「紅利點數紀錄」列表：顯示每筆紀錄（日期以台灣時間 yyyy/MM/dd、點數、顧客、設計師）與編輯連結；
// 勾選（單筆、全選、取消）後刪除送出的是勾選的紀錄 id，成功才清除勾選並重新查詢，後端回 false 或錯誤要提示且不清除。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不刪除真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerBonusRecord from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const RECORDS = [
  {
    id: 'b1',
    customerName: '陳小姐',
    customerNo: 'C01',
    date: new Date(2026, 9, 21, 23, 30).getTime(),
    bonus: 30,
    designerName: '王小美',
    remark: '生日禮',
  },
  { id: 'b2', customerName: '林先生', customerNo: 'C02', date: new Date(2026, 9, 1, 0, 10).getTime(), bonus: -10, designerName: 'Amy', remark: '' },
]

const setup = (fixtures = {}, options = {}) =>
  renderPage(<CustomerBonusRecord />, {
    fixtures: { GET_CUSTOMER_BONUS_DEPOSIT_RECORDS: { customerBonusDepositRecords: RECORDS }, ...fixtures },
    ...options,
  })

const toolbar = () => screen.getByRole('toolbar', { hidden: true })

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('紅利點數紀錄列表', () => {
  it('顯示每筆紀錄的日期、顧客、點數、設計師與編輯連結，新增鈕連到新增頁', async () => {
    const utils = setup()
    await utils.settle()
    expect(screen.getByText('共 2 筆')).toBeInTheDocument()
    const rows = screen.getAllByTestId('category-row')
    expect(within(rows[0]).getByText('2026/10/21')).toBeInTheDocument()
    expect(within(rows[0]).getByText('陳小姐')).toBeInTheDocument()
    expect(within(rows[0]).getByText('C01')).toBeInTheDocument()
    expect(within(rows[0]).getByText('30')).toBeInTheDocument()
    expect(within(rows[0]).getByText('王小美')).toBeInTheDocument()
    expect(within(rows[0]).getByText('生日禮')).toBeInTheDocument()
    expect(within(rows[1]).getByText('2026/10/01')).toBeInTheDocument()
    expect(within(rows[1]).getByText('-10')).toBeInTheDocument()
    expect(within(rows[0]).getByLabelText('編輯紀錄').closest('a')).toHaveAttribute('href', '/customer-bonus-record/edit/b1')
    expect(screen.getByText('新增紀錄').closest('a')).toHaveAttribute('href', '/customer-bonus-record/create')
  })

  it('沒有紀錄時顯示共 0 筆，全選框不會勾起', async () => {
    const utils = setup({ GET_CUSTOMER_BONUS_DEPOSIT_RECORDS: { customerBonusDepositRecords: [] } })
    await utils.settle()
    expect(screen.getByText('共 0 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('全選')).not.toBeChecked()
  })

  it('勾選單筆、全選、取消全選、再取消單筆時，勾選狀態與批次操作列一致', async () => {
    const utils = setup()
    await utils.settle()
    const [first, second] = screen.getAllByLabelText('選取此筆紀錄')
    fireEvent.click(first)
    expect(first).toBeChecked()
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    expect(within(toolbar()).getByText('已選 1 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(second).toBeChecked()
    expect(screen.getByLabelText('全選')).toBeChecked()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(first).not.toBeChecked()
    expect(second).not.toBeChecked()
    fireEvent.click(second)
    fireEvent.click(second)
    expect(second).not.toBeChecked()
    expect(toolbar().parentElement).toHaveAttribute('hidden')
  })

  it('刪除成功：送出勾選的紀錄 id、提示成功、清除勾選並重新查詢列表', async () => {
    const utils = setup({ DELETE_BONUS_DEPOSIT: { deleteBonusDeposit: true } })
    await utils.settle()
    const before = callsOf(utils.calls, 'GET_CUSTOMER_BONUS_DEPOSIT_RECORDS').length
    fireEvent.click(screen.getAllByLabelText('選取此筆紀錄')[1])
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_BONUS_DEPOSIT')[0].variables).toEqual({ bonusId: ['b2'] })
    await wait(() => expect(callsOf(utils.calls, 'GET_CUSTOMER_BONUS_DEPOSIT_RECORDS').length).toBeGreaterThan(before))
    expect(screen.getAllByLabelText('選取此筆紀錄')[1]).not.toBeChecked()
  })

  it('後端回 false：提示刪除失敗、保留勾選', async () => {
    const utils = setup({ DELETE_BONUS_DEPOSIT: { deleteBonusDeposit: false } })
    await utils.settle()
    fireEvent.click(screen.getAllByLabelText('選取此筆紀錄')[0])
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除失敗', variant: 'warning' }))
    expect(screen.getAllByLabelText('選取此筆紀錄')[0]).toBeChecked()
  })

  it('刪除發生錯誤：以錯誤訊息提示', async () => {
    const utils = setup({ DELETE_BONUS_DEPOSIT: new Error('紀錄已被使用') })
    await utils.settle()
    fireEvent.click(screen.getAllByLabelText('選取此筆紀錄')[0])
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '紀錄已被使用', variant: 'error' }))
  })

  // 列表查詢失敗時以空陣列顯示、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示；
  // 原本傳入 undefined 讓 Results 讀 recordData.length 拋錯；Jason 2026/10/22 fix all）
  it('列表查詢失敗：顯示無法載入資料與重新查詢、不整頁錯誤', async () => {
    // 2026/10/28 稽核 C-1：查詢失敗改顯示 QueryFailed（「無法載入資料」＋「重新查詢」），不再顯示成空表／0 筆，避免誤以為真的沒有資料
    const utils = setup({ GET_CUSTOMER_BONUS_DEPOSIT_RECORDS: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    expect(screen.getByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
  })
})
