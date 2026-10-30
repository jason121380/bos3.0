// 保護「新增盤點」：盤點數量預設帶入目前庫存（負庫存帶 0）、差異＝盤點數量−目前庫存（+ 多、- 少）；
// 只接受整數，清空視為未盤點；儲存盤點（草稿）只送已填的商品、完成盤點時有未填的擋下；送出的日期為現在、
// 內容為商品 id／目前庫存／盤點數量；依分類篩選、依庫存／代號／差異排序（進頁即依預設的庫存排序）；
// 「更新即時庫存」只更新目前庫存、保留已填的盤點數量；送出失敗可再送；查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES } from '../../__tests__/stockKit.test'
import InventoryWorkCreate from '..'

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

const renderCreate = (overrides, options) =>
  renderPage(<InventoryWorkCreate />, {
    fixtures: {
      GET_PRODUCT_INVENTORY: { productInventoryList: INVENTORY },
      GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: { productCategories: CATEGORIES },
      SET_CREATE_INVENTORY: { createInventory: true },
      ...overrides,
    },
    route: '/inventory-work/create',
    ...options,
  })

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(r => r.querySelectorAll('td')[0].textContent)
const countInput = name => screen.getByLabelText(`${name} 盤點數量`)
const diffOf = name => screen.getByText(name).closest('tr').querySelectorAll('td')[4].textContent
const saveDraft = () => fireEvent.click(screen.getAllByRole('button', { name: '儲存盤點' })[0])
const finish = () => fireEvent.click(screen.getAllByRole('button', { name: '完成盤點' })[1])

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增盤點', () => {
  it('盤點數量預設為目前庫存（負庫存帶 0）；進頁依目前庫存由少到多；差異以 +／- 標示', async () => {
    const { settle } = renderCreate()
    await settle()
    // 與編輯頁共用盤點列表後，新增頁仍不顯示建立時間／建立者（只有編輯草稿才有）
    expect(screen.queryByText(/^建立時間:/)).toBeNull()
    expect(names()).toEqual(['髮蠟', '護髮油', '洗髮精'])
    expect(countInput('洗髮精')).toHaveValue('8')
    expect(countInput('髮蠟')).toHaveValue('0')
    expect(diffOf('髮蠟')).toBe('+2')
    expect(diffOf('洗髮精')).toBe('0')
    fireEvent.change(countInput('洗髮精'), { target: { value: '5' } })
    expect(diffOf('洗髮精')).toBe('-3')
    // 非數字清空為未盤點
    fireEvent.change(countInput('護髮油'), { target: { value: 'abc' } })
    expect(countInput('護髮油')).toHaveValue('')
    expect(diffOf('護髮油')).toBe('')
    fireEvent.change(countInput('護髮油'), { target: { value: '' } })
    expect(countInput('護髮油')).toHaveValue('')
    fireEvent.wheel(countInput('護髮油'))
  })

  it('依代號（自然排序）、差異排序；分類篩選與清除', async () => {
    const { settle } = renderCreate()
    await settle()
    fireEvent.change(countInput('洗髮精'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: '代號' }))
    expect(names()).toEqual(['護髮油', '髮蠟', '洗髮精'])
    fireEvent.click(screen.getByRole('button', { name: '差異' }))
    expect(names()).toEqual(['髮蠟', '洗髮精', '護髮油'])
    fireEvent.click(screen.getByRole('button', { name: '差異' }))
    fireEvent.click(screen.getByRole('button', { name: '庫存' }))
    expect(names()).toEqual(['髮蠟', '護髮油', '洗髮精'])

    fireEvent.click(screen.getByRole('button', { name: '洗髮' }))
    expect(screen.getByRole('button', { name: '洗髮' })).toHaveAttribute('aria-pressed', 'true')
    expect(names()).toEqual(['髮蠟', '洗髮精'])
    fireEvent.click(screen.getByRole('button', { name: '護髮' }))
    expect(names()).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: '洗髮' }))
    expect(names()).toEqual(['護髮油'])
    fireEvent.click(screen.getByRole('button', { name: '清除篩選' }))
    expect(names()).toHaveLength(3)
  })

  it('儲存盤點（草稿）：只送已填的商品，日期為現在；成功回盤點作業', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fireEvent.change(countInput('護髮油'), { target: { value: '' } })
    fireEvent.change(countInput('洗髮精'), { target: { value: '7' } })
    const before = Date.now()
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '儲存成功' }))
    const { input } = callsOf(calls, 'SET_CREATE_INVENTORY')[0].variables
    expect(input.isDraft).toBe(true)
    expect(input.date).toBeGreaterThanOrEqual(before)
    expect(input.date).toBeLessThanOrEqual(Date.now())
    expect(input.inventoryDetails).toEqual([
      { productId: 'p-3', currentCount: -2, inventoryCount: 0 },
      { productId: 'p-1', currentCount: 8, inventoryCount: 7 },
    ])
    await wait(() => expect(currentLocation()).toBe('/inventory-work'))
  })

  it('完成盤點：有未填的擋下並提示；全部填好送出 isDraft false', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fireEvent.change(countInput('護髮油'), { target: { value: '' } })
    finish()
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '盤點數量不得為空' })
    expect(callsOf(calls, 'SET_CREATE_INVENTORY')).toHaveLength(0)
    fireEvent.change(countInput('護髮油'), { target: { value: '3' } })
    finish()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '新增成功' }))
    const { input } = callsOf(calls, 'SET_CREATE_INVENTORY')[0].variables
    expect(input.isDraft).toBe(false)
    expect(input.inventoryDetails).toHaveLength(3)
  })

  it('後端回 false：提示儲存失敗／新增失敗並可再送；送出失敗提示錯誤', async () => {
    const { settle } = renderCreate({ SET_CREATE_INVENTORY: { createInventory: false } })
    await settle()
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '儲存失敗' }))
    finish()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '新增失敗' }))
    expect(screen.getAllByRole('button', { name: '完成盤點' })[0]).toBeEnabled()
    cleanup()

    openSnackbar.mockClear()
    const second = renderCreate({ SET_CREATE_INVENTORY: new Error('有未完成的盤點草稿') })
    await second.settle()
    saveDraft()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '有未完成的盤點草稿' }))
    expect(screen.getAllByRole('button', { name: '儲存盤點' })[0]).toBeEnabled()
  })

  it('更新即時庫存：目前庫存換成最新數字，已填的盤點數量保留', async () => {
    let refreshed = false
    const { settle } = renderCreate({
      GET_PRODUCT_INVENTORY: () => ({
        // 更新時髮蠟已不在清單（例如被刪除）：維持原本的目前庫存
        productInventoryList: refreshed ? INVENTORY.filter(d => d.productId !== 'p-3').map(d => ({ ...d, count: d.count + 10 })) : INVENTORY,
      }),
    })
    await settle()
    fireEvent.change(countInput('洗髮精'), { target: { value: '6' } })
    refreshed = true
    fireEvent.click(screen.getByRole('button', { name: /更新即時庫存/ }))
    await settle()
    const row = screen.getByText('洗髮精').closest('tr')
    await wait(() => expect(row.querySelectorAll('td')[2].textContent).toBe('18'))
    expect(countInput('洗髮精')).toHaveValue('6')
    expect(diffOf('洗髮精')).toBe('-12')
    expect(screen.getByText('髮蠟').closest('tr').querySelectorAll('td')[2].textContent).toBe('-2')
  })

  it('更新即時庫存查回空清單：目前庫存不變、不出錯', async () => {
    let refreshed = false
    const { settle } = renderCreate({
      GET_PRODUCT_INVENTORY: () => ({ productInventoryList: refreshed ? null : INVENTORY }),
    })
    await settle()
    refreshed = true
    fireEvent.click(screen.getByRole('button', { name: /更新即時庫存/ }))
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('洗髮精').closest('tr').querySelectorAll('td')[2].textContent).toBe('8')
  })

  it('查詢失敗：不進錯誤畫面', async () => {
    const { settle } = renderPage(<InventoryWorkCreate />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('新增盤點')[0]).toBeInTheDocument()
  })

  it('載入中顯示骨架', async () => {
    const { settle } = renderCreate(undefined, { delays: { GET_PRODUCT_INVENTORY: 300 } })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')).toHaveLength(5)
  })
})
