// 保護「商品進貨作業」列表：載入即查全部進貨單（status ALL）、依廠商篩選送出的是「廠商」uuid（vendor.uuid，不是店家廠商 uuid）；
// 日期、異動時間、入庫時間以台灣時間顯示；未入庫的單可勾選刪除（已入庫的不可選，全選只選未入庫），刪除送出所選 uuid、刪除後清空勾選並重查；
// 入庫／取消入庫依店家「是否需要密碼」設定：需要時先跳密碼框、送出密碼，不需要時直接送出；失敗提示錯誤、可再試；
// 設定或列表查詢失敗時頁面不白屏。GraphQL 全由 testkit 模擬，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { VENDORS, pickOption, stockInUsing } from '../../__tests__/stockKit.test'
import ProductRestock from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

// 台灣時間 2026/10/21 00:30（UTC 前一天 16:30）：海外時區跑也要顯示 10/21
const TW_DATE = Date.UTC(2026, 9, 20, 16, 30)
const RECORDS = [
  {
    uuid: 'pr-1',
    no: 'R001',
    date: TW_DATE,
    vendorName: '大和貿易',
    operatorName: '王小美',
    summary: 12000,
    updatedAt: Date.UTC(2026, 9, 21, 2, 5),
    remark: '月初補貨',
    stockInDate: null,
  },
  {
    uuid: 'pr-2',
    no: 'R002',
    date: TW_DATE,
    vendorName: '美髮材料行',
    operatorName: '李助理',
    summary: 300,
    updatedAt: Date.UTC(2026, 9, 21, 2, 5),
    remark: '',
    stockInDate: Date.UTC(2026, 9, 21, 7, 45),
  },
  {
    uuid: 'pr-3',
    no: 'R003',
    date: TW_DATE,
    vendorName: '大和貿易',
    operatorName: '王小美',
    summary: 80,
    updatedAt: Date.UTC(2026, 9, 21, 2, 5),
    remark: '',
    stockInDate: null,
  },
]

const fixtures = (overrides = {}) => ({
  GET_PURCHASE_RECORDS: { purchaseRecords: RECORDS },
  GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
  GET_STOCK_IN_USING: stockInUsing(false, false),
  SET_PURCHASE_STOCK_IN: { setPurchaseStockIn: true },
  SET_PURCHASE_STOCK_IN_UNDO: { setPurchaseStockInUndo: true },
  DELETE_PURCHASE: { deletePurchase: true },
  ...overrides,
})

const renderList = (overrides, options) =>
  renderPage(<ProductRestock />, { fixtures: fixtures(overrides), ...options })

const rowOf = no => screen.getByText(no).closest('tr')

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('商品進貨作業列表', () => {
  it('載入時查全部進貨單，日期與時間以台灣時間顯示，已入庫的單顯示「取消入庫」與查看連結', async () => {
    const { settle, calls } = renderList()
    await settle()
    expect(callsOf(calls, 'GET_PURCHASE_RECORDS')[0].variables).toEqual({ input: { status: 'ALL', vendorUUIds: [] } })
    expect(screen.getByText('共 3 筆資料')).toBeInTheDocument()

    const first = rowOf('R001')
    expect(within(first).getByText('2026/10/21')).toBeInTheDocument()
    expect(within(first).getByText('2026/10/21 10:05')).toBeInTheDocument()
    expect(within(first).getByText('12,000')).toBeInTheDocument()
    expect(within(first).getByRole('button', { name: '確認入庫' })).toBeInTheDocument()
    expect(within(first).getByRole('link', { name: '編輯進貨單' })).toHaveAttribute('href', '/product/restock/edit/pr-1')

    const stocked = rowOf('R002')
    expect(within(stocked).getByText('2026/10/21 15:45')).toBeInTheDocument()
    expect(within(stocked).getByRole('button', { name: '取消入庫' })).toBeInTheDocument()
    expect(within(stocked).getByRole('link', { name: '查看進貨單' })).toBeInTheDocument()
    // 已入庫的單不可勾選刪除
    expect(within(stocked).getByRole('checkbox')).toBeDisabled()
  })

  it('依廠商篩選：選項優先顯示暱稱，搜尋送出所選的廠商 uuid；清空篩選後自動重查全部', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    pickOption('選擇廠商', '大和')
    // 沒有暱稱的廠商顯示名稱
    pickOption('選擇廠商', '美髮材料行')
    fireEvent.click(screen.getByRole('button', { name: /搜尋/ }))
    await settle()
    const searches = callsOf(calls, 'GET_PURCHASE_RECORDS')
    expect(searches[searches.length - 1].variables.input).toEqual({ status: 'ALL', vendorUUIds: ['vendor-1', 'vendor-2'] })

    // 移除所有已選廠商：自動以空條件重查
    const before = callsOf(calls, 'GET_PURCHASE_RECORDS').length
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 大和貿易' }))
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 美髮材料行' }))
    await settle()
    const after = callsOf(calls, 'GET_PURCHASE_RECORDS')
    expect(after.length).toBeGreaterThan(before)
    expect(after[after.length - 1].variables.input.vendorUUIds).toEqual([])
  })

  it('不需要密碼：按「確認入庫」直接送出該單 uuid、空密碼，成功後提示並重查', async () => {
    const { settle, calls } = renderList()
    await settle()
    const before = callsOf(calls, 'GET_PURCHASE_RECORDS').length
    fireEvent.click(within(rowOf('R001')).getByRole('button', { name: '確認入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '入庫成功' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '' } })
    await settle()
    expect(callsOf(calls, 'GET_PURCHASE_RECORDS').length).toBeGreaterThan(before)
  })

  it('不需要密碼：取消入庫直接送出；失敗時提示錯誤訊息', async () => {
    const { settle, calls } = renderList({ SET_PURCHASE_STOCK_IN_UNDO: new Error('已有銷貨，不可取消入庫') })
    await settle()
    fireEvent.click(within(rowOf('R002')).getByRole('button', { name: '取消入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '已有銷貨，不可取消入庫' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN_UNDO')[0].variables).toEqual({ input: { purchaseUUId: 'pr-2', pwd: '' } })
  })

  it('需要密碼：先跳「進貨單入庫」密碼框，輸入密碼確認後才送出；失敗時密碼框保留可重試', async () => {
    const { settle, calls } = renderList({
      GET_STOCK_IN_USING: stockInUsing(true, true),
      SET_PURCHASE_STOCK_IN: new Error('密碼錯誤'),
    })
    await settle()
    fireEvent.click(within(rowOf('R001')).getByRole('button', { name: '確認入庫' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('進貨單入庫')).toBeInTheDocument()
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(0)
    fireEvent.change(within(dialog).getByLabelText('入庫密碼'), { target: { value: '1234' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '密碼錯誤' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '1234' } })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // 取消：關閉密碼框
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('需要密碼：取消入庫的密碼框標題與欄位不同，確認後送出取消入庫並關閉密碼框', async () => {
    const { settle, calls } = renderList({ GET_STOCK_IN_USING: stockInUsing(true, true) })
    await settle()
    fireEvent.click(within(rowOf('R002')).getByRole('button', { name: '取消入庫' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('進貨單取消入庫')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('取消入庫密碼'), { target: { value: '9999' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '取消入庫成功' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN_UNDO')[0].variables).toEqual({ input: { purchaseUUId: 'pr-2', pwd: '9999' } })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('需要密碼但只有取消入庫要：入庫直接送出，不跳密碼框', async () => {
    const { settle, calls } = renderList({ GET_STOCK_IN_USING: stockInUsing(false, true) })
    await settle()
    fireEvent.click(within(rowOf('R003')).getByRole('button', { name: '確認入庫' }))
    await wait(() => expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(1))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('入庫／取消入庫送出中再按一次：不重複送出', async () => {
    const { settle, calls } = renderList(undefined, {
      delays: { SET_PURCHASE_STOCK_IN: 400, SET_PURCHASE_STOCK_IN_UNDO: 400 },
    })
    await settle()
    fireEvent.click(within(rowOf('R001')).getByRole('button', { name: '確認入庫' }))
    fireEvent.click(within(rowOf('R003')).getByRole('button', { name: '確認入庫' }))
    fireEvent.click(within(rowOf('R002')).getByRole('button', { name: '取消入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '入庫成功' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(1)
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN_UNDO')).toHaveLength(0)
  })

  it('全選只選未入庫的單；刪除送出所選 uuid，成功後提示、清空勾選並重查', async () => {
    const { settle, calls } = renderList()
    await settle()
    const selectAll = screen.getByRole('checkbox', { name: '全選' })
    fireEvent.click(selectAll)
    expect(screen.getByText('已選取 2 筆項目')).toBeInTheDocument()
    // 取消一筆、再勾回
    fireEvent.click(within(rowOf('R003')).getByRole('checkbox'))
    expect(screen.getByText('已選取 1 筆項目')).toBeInTheDocument()
    fireEvent.click(within(rowOf('R003')).getByRole('checkbox'))
    const before = callsOf(calls, 'GET_PURCHASE_RECORDS').length
    fireEvent.click(within(screen.getByRole('toolbar', { name: '批次操作' })).getByRole('button', { name: /刪除/ }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(calls, 'DELETE_PURCHASE')[0].variables).toEqual({ purchaseUUIds: ['pr-1', 'pr-3'] })
    await settle()
    expect(callsOf(calls, 'GET_PURCHASE_RECORDS').length).toBeGreaterThan(before)
    // 已刪除的單不可再留在勾選中（否則再按刪除會送出不存在的單）
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()

    // 全選後再按一次全選：全部取消
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()
  })

  it('刪除失敗：提示錯誤、不重查；後端回 false 時不提示成功', async () => {
    const { settle, calls } = renderList({ DELETE_PURCHASE: new Error('單據已入庫') })
    await settle()
    fireEvent.click(within(rowOf('R001')).getByRole('checkbox'))
    const before = callsOf(calls, 'GET_PURCHASE_RECORDS').length
    fireEvent.click(within(screen.getByRole('toolbar', { name: '批次操作' })).getByRole('button', { name: /刪除/ }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '單據已入庫', variant: 'error' }))
    expect(callsOf(calls, 'GET_PURCHASE_RECORDS')).toHaveLength(before)
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ DELETE_PURCHASE: { deletePurchase: false } })
    await second.settle()
    fireEvent.click(within(rowOf('R001')).getByRole('checkbox'))
    fireEvent.click(within(screen.getByRole('toolbar', { name: '批次操作' })).getByRole('button', { name: /刪除/ }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(callsOf(second.calls, 'DELETE_PURCHASE')).toHaveLength(1))
    await second.settle()
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('沒有未入庫的單：全選停用', async () => {
    const { settle } = renderList({ GET_PURCHASE_RECORDS: { purchaseRecords: [RECORDS[1]] } })
    await settle()
    expect(screen.getByRole('checkbox', { name: '全選' })).toBeDisabled()
  })

  it('入庫密碼設定、廠商、進貨單查詢全部失敗：頁面仍顯示，不進錯誤畫面', async () => {
    const { settle } = renderPage(<ProductRestock />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('商品進貨作業')[0]).toBeInTheDocument()
  })
})
