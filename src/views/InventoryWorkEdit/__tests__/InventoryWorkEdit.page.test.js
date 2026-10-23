// 保護「編輯盤點」（繼續盤點草稿）：草稿已盤點的商品帶入當時的目前庫存與盤點數量、其他商品為未盤點；
// 建立時間（台灣時間）與建立者；儲存／完成盤點送出草稿 id、現在時間、已填的明細，完成時有未填的擋下；
// 刪除草稿要先確認，確認後送出草稿 id、成功回列表、失敗提示；送出失敗可再送；查詢失敗不白屏。
// GraphQL 全由 testkit 模擬，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES } from '../../__tests__/stockKit.test'
import InventoryWorkEdit from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const INVENTORY = [
  { productId: 'p-1', productNo: 'P10', productName: '洗髮精', productCategoryId: 'cat-1', count: 8 },
  { productId: 'p-2', productNo: 'P2', productName: '護髮油', productCategoryId: 'cat-2', count: 3 },
  { productId: 'p-3', productNo: 'P3', productName: '髮蠟', productCategoryId: 'cat-1', count: -2 },
]
const DRAFT = {
  id: 'inv-9',
  date: Date.UTC(2026, 9, 21, 1, 5), // 台灣 09:05
  isDraft: true,
  creatorName: '王小美',
  details: [
    { productId: 'p-1', productName: '洗髮精', productNo: 'P10', productCategoryId: 'cat-1', currentCount: 7, inventoryCount: 6 },
    { productId: 'p-9', productName: '已刪除商品', productNo: 'X', productCategoryId: 'cat-1', currentCount: 1, inventoryCount: 1 },
  ],
}

const renderEdit = (overrides, options) =>
  renderPage(<InventoryWorkEdit match={{ params: { id: 'inv-9' } }} />, {
    fixtures: {
      GET_PRODUCT_INVENTORY: { productInventoryList: INVENTORY },
      GET_INVENTORY: { getInventory: DRAFT },
      GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: { productCategories: CATEGORIES },
      SET_UPDATE_INVENTORY: { updateInventory: true },
      DELETE_INVENTORY: { deleteInventory: true },
      ...overrides,
    },
    route: '/inventory-work/edit/inv-9',
    ...options,
  })

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(r => r.querySelectorAll('td')[0].textContent)
const countInput = name => screen.getByLabelText(`${name} 盤點數量`)
const cells = name => Array.from(screen.getByText(name).closest('tr').querySelectorAll('td')).map(td => td.textContent)
const saveDraft = () => fireEvent.click(screen.getAllByRole('button', { name: '儲存盤點' })[0])
const finish = () => fireEvent.click(screen.getAllByRole('button', { name: '完成盤點' })[0])
// 刪除要先在確認框按確認：測試直接執行確認框的 callback
const confirmDelete = async () => {
  fireEvent.click(screen.getByRole('button', { name: '刪除盤點' }))
  const args = openSnackbar.mock.calls.find(c => c[0].deleteInventoryWork)[0]
  expect(args).toMatchObject({ message: '確定要刪除此盤點紀錄草稿？', resign: true })
  await args.deleteInventoryWorkFunc()
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('編輯盤點', () => {
  it('帶入草稿：已盤點的用草稿當時的庫存與數量，其他商品未盤點；依庫存排序；建立時間與建立者', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(callsOf(calls, 'GET_INVENTORY')[0].variables).toEqual({ inventoryId: 'inv-9' })
    expect(screen.getByText('建立時間:2026/10/21 09:05')).toBeInTheDocument()
    expect(screen.getByText('建立者:王小美')).toBeInTheDocument()
    expect(names()).toEqual(['髮蠟', '護髮油', '洗髮精'])
    expect(cells('洗髮精').slice(2)).toEqual(['7', '', '-1'])
    expect(countInput('洗髮精')).toHaveValue('6')
    expect(countInput('護髮油')).toHaveValue('')
    fireEvent.change(countInput('護髮油'), { target: { value: '5' } })
    expect(cells('護髮油')[4]).toBe('+2')
    fireEvent.change(countInput('髮蠟'), { target: { value: '-' } })
    expect(countInput('髮蠟')).toHaveValue('')
    fireEvent.change(countInput('髮蠟'), { target: { value: '0' } })
    expect(cells('髮蠟')[4]).toBe('+2')
    fireEvent.change(countInput('髮蠟'), { target: { value: '' } })
    fireEvent.wheel(countInput('髮蠟'))
    fireEvent.click(screen.getByRole('button', { name: '代號' }))
    expect(names()).toEqual(['護髮油', '髮蠟', '洗髮精'])
    fireEvent.click(screen.getByRole('button', { name: '差異' }))
    fireEvent.click(screen.getByRole('button', { name: '洗髮' }))
    expect(names()).toEqual(expect.arrayContaining(['洗髮精', '髮蠟']))
    expect(names()).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: '洗髮' }))
    fireEvent.click(screen.getByRole('button', { name: '清除篩選' }))
    expect(names()).toHaveLength(3)
  })

  it('儲存盤點：送出草稿 id、現在時間與已填的明細，成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    const before = Date.now()
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '儲存成功' }))
    const { inventoryId, input } = callsOf(calls, 'SET_UPDATE_INVENTORY')[0].variables
    expect(inventoryId).toBe('inv-9')
    expect(input.isDraft).toBe(true)
    expect(input.date).toBeGreaterThanOrEqual(before)
    expect(input.inventoryDetails).toEqual([{ productId: 'p-1', currentCount: 7, inventoryCount: 6 }])
    await wait(() => expect(currentLocation()).toBe('/inventory-work'))
  })

  it('完成盤點：有未填擋下；全部填好送出 isDraft false；後端回 false 或失敗提示且可再送', async () => {
    const { settle, calls } = renderEdit({ SET_UPDATE_INVENTORY: { updateInventory: false } })
    await settle()
    finish()
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '盤點數量不得為空' })
    expect(callsOf(calls, 'SET_UPDATE_INVENTORY')).toHaveLength(0)
    fireEvent.change(countInput('護髮油'), { target: { value: '3' } })
    fireEvent.change(countInput('髮蠟'), { target: { value: '0' } })
    finish()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '新增失敗' }))
    expect(callsOf(calls, 'SET_UPDATE_INVENTORY')[0].variables.input.isDraft).toBe(false)
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '儲存失敗' }))
    cleanup()

    openSnackbar.mockClear()
    const second = renderEdit({ SET_UPDATE_INVENTORY: new Error('盤點已完成') })
    await second.settle()
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '盤點已完成' }))
    expect(screen.getAllByRole('button', { name: '儲存盤點' })[0]).toBeEnabled()
  })

  it('完成盤點成功：提示並回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.change(countInput('護髮油'), { target: { value: '3' } })
    fireEvent.change(countInput('髮蠟'), { target: { value: '0' } })
    finish()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '新增成功' }))
    expect(callsOf(calls, 'SET_UPDATE_INVENTORY')[0].variables.input.inventoryDetails).toHaveLength(3)
    await wait(() => expect(currentLocation()).toBe('/inventory-work'))
  })

  it('刪除草稿：確認後送出草稿 id，成功回列表；後端回 false 或失敗提示刪除失敗、按鈕恢復', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    await confirmDelete()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '刪除成功' }))
    expect(callsOf(calls, 'DELETE_INVENTORY')[0].variables).toEqual({ inventoryId: 'inv-9' })
    await wait(() => expect(currentLocation()).toBe('/inventory-work'))
    cleanup()

    for (const failure of [{ deleteInventory: false }, new Error('草稿不存在')]) {
      openSnackbar.mockClear()
      const again = renderEdit({ DELETE_INVENTORY: failure })
      await again.settle()
      await confirmDelete()
      await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '刪除失敗' }))
      expect(screen.getByRole('button', { name: '刪除盤點' })).toBeEnabled()
      cleanup()
    }
  })

  it('查詢失敗或查無草稿：不進錯誤畫面', async () => {
    const { settle } = renderPage(<InventoryWorkEdit match={{ params: { id: 'inv-9' } }} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('編輯盤點')[0]).toBeInTheDocument()
    cleanup()
    const missing = renderEdit({ GET_INVENTORY: { getInventory: null } })
    await missing.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
