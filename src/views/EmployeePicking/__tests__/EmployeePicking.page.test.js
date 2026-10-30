// 保護「材料自購登錄」列表：進頁以本月 1 日到今天（台灣時間）查詢；依領料人、分類（全部＝不限）篩選送出的條件；
// 列表與合計（數量、小計）、匯出含合計列；日結後禁止領料（PICKING）時已結帳的紀錄不可勾選、全選只選未結帳的；
// 刪除送出所選紀錄 id；查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端、不刪真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import EmployeePicking from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const DATE = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21
const RECORDS = [
  {
    id: 'pk-1',
    date: DATE,
    productName: '洗髮精',
    productNo: 'P01',
    price: 600,
    count: 2,
    total: 1200,
    purpose: '自用',
    remark: '試用',
    Picker: { id: 'user-a', name: '王小美', designerNo: 'A01' },
    isClosed: true,
  },
  {
    id: 'pk-2',
    date: DATE,
    productName: '毛巾',
    productNo: '',
    price: 50,
    count: 3,
    total: 150,
    purpose: '店用',
    remark: '',
    Picker: { id: 'user-b', name: '李助理', designerNo: null },
    isClosed: false,
  },
]

const fixtures = (overrides = {}) => ({
  FETCH_PICKING_RECORD: { pickingRecords: { PickingRecord: RECORDS, totalCount: 2, pageLimit: 1000, pageOffset: 0 } },
  GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT: { getActionsBannedAfterDailyCheckout: [] },
  PRODUCT_CATEGORIES: {
    productCategories: [
      { id: 'cat-1', no: 'C1', name: '洗髮' },
      { id: 'cat-2', no: '', name: '雜項' },
    ],
  },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'user-a', userName: '王小美', userNickName: '', userNo: 'A01' }] },
  deletePicking: { deletePicking: true },
  ...overrides,
})

const renderList = overrides => renderPage(<EmployeePicking />, { fixtures: fixtures(overrides), route: '/employee/picking' })
const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_PICKING_RECORD')
  return list[list.length - 1].variables.input
}
const rowOf = text => screen.getByText(text).closest('tr')

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('材料自購登錄列表', () => {
  it('以本月到今天（台灣時間）查詢；列表、領料人編號、合計；匯出含合計列', async () => {
    const { settle, calls } = renderList()
    await settle()
    const now = new Date()
    expect(lastInput(calls)).toEqual({
      pageLimit: 1000,
      pageOffset: 0,
      start: startOfMonth(now).getTime(),
      end: endOfDay(now).getTime(),
      productCategoryId: [],
    })
    expect(screen.getByText('共 2 筆')).toBeInTheDocument()
    const first = rowOf('P01 / 洗髮精')
    expect(within(first).getByText('2026/10/21')).toBeInTheDocument()
    expect(within(first).getByText(/王小美/).textContent).toBe('王小美/A01')
    expect(within(first).getByRole('link', { name: '編輯' })).toHaveAttribute('href', '/employee/picking/edit/pk-1')
    expect(within(rowOf('毛巾')).getByText('李助理').textContent).toBe('李助理')
    const total = screen.getByText('合計').closest('tr')
    expect(
      Array.from(total.querySelectorAll('td'))
        .map(td => td.textContent)
        .slice(5, 7)
    ).toEqual(['5', '1,350'])
    const csv = exportedCsv()
    expect(csv).toContain('"2026/10/21","P01 / 洗髮精","600","2","1200","王小美/A01","自用","試用"')
    expect(csv).toContain('"2026/10/21","毛巾","50","3","150","李助理","店用",""')
    expect(csv).toContain('"合計","","","5","1350","","",""')
  })

  it('篩選：分類送出分類 id、選「全部」不限；領料人送出人員 id；換成上個月重查', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    pickOption('分類', '洗髮/C1')
    await settle()
    expect(lastInput(calls).productCategoryId).toEqual(['cat-1'])
    pickOption('分類', '全部')
    await settle()
    expect(lastInput(calls).productCategoryId).toEqual([])
    pickOption('分類', '雜項')
    await settle()
    expect(lastInput(calls).productCategoryId).toEqual(['cat-2'])
    pickOption('設計師編號/姓名', '王小美-A01')
    await settle()
    expect(lastInput(calls).pickerId).toBe('user-a')
    pickQuickDate('上個月')
    await settle()
    const last = subMonths(new Date(), 1)
    expect(lastInput(calls)).toMatchObject({ start: startOfMonth(last).getTime(), end: endOfMonth(last).getTime() })
  })

  it('沒有禁止領料：全選選全部；刪除送出所選 id 並提示', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()
    fireEvent.click(screen.getByTestId('order-checkbox-1'))
    fireEvent.click(screen.getByTestId('order-checkbox-0'))
    fireEvent.click(screen.getByTestId('order-checkbox-0'))
    const listCalls = callsOf(calls, 'FETCH_PICKING_RECORD').length
    fireEvent.click(within(screen.getByRole('toolbar', { name: '批次操作' })).getByRole('button', { name: /刪除/ }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除 員工領料/自購 成功', variant: 'success' }))
    expect(callsOf(calls, 'deletePicking')[0].variables).toEqual({ id: ['pk-2'] })
    // 刪除後重抓清單、清空勾選，不整頁重新整理（保留篩選與捲動位置）
    await wait(() => expect(callsOf(calls, 'FETCH_PICKING_RECORD').length).toBeGreaterThan(listCalls))
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()
  })

  it('日結後禁止領料：已結帳的不可勾選，全選只選未結帳的、再按取消', async () => {
    const { settle } = renderList({ GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT: { getActionsBannedAfterDailyCheckout: ['PICKING'] } })
    await settle()
    expect(screen.getByTestId('order-checkbox-0')).toBeDisabled()
    expect(screen.getByTestId('order-checkbox-1')).toBeEnabled()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '全選' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()
  })

  it('沒有紀錄：全選停用、合計 0；查詢失敗不進錯誤畫面', async () => {
    const { settle } = renderList({ FETCH_PICKING_RECORD: { pickingRecords: { PickingRecord: [], totalCount: 0 } } })
    await settle()
    expect(screen.getByRole('checkbox', { name: '全選' })).toBeDisabled()
    cleanup()
    const failed = renderPage(<EmployeePicking />, { fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('材料自購登錄')[0]).toBeInTheDocument()
  })
})
