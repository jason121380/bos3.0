// 保護「商品列表」整頁：查詢送出的分頁、關鍵字、分類條件（換條件回到第一頁、清除篩選保留每頁筆數）；
// 成本欄與匯出檔依「商品列表是否顯示成本」設定；停用商品不可編輯、全選只選啟用中的商品；
// 批次操作送出的內容：刪除（依店家設定需不需要刪除密碼）、上下架、廠商、商品類別，成功後清空勾選，失敗提示錯誤；
// 匯出檔變更時間以台灣時間。GraphQL 全由 testkit 模擬，不連後端、不刪改真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES, VENDORS, byQueryText, chooseNative, exportedCsv } from '../../__tests__/stockKit.test'
import Products from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

// 台灣時間 2026/10/21 00:30
const UPDATED = Date.UTC(2026, 9, 20, 16, 30)
const PRODUCTS = [
  {
    id: 'p-1',
    no: 'P01',
    name: '洗髮精',
    cost: 120,
    isUsing: true,
    sellPrice: 1200,
    employeePrice: 600,
    stockUnit: '瓶',
    updatedAt: UPDATED,
    productCategory: { id: 'cat-1', name: '洗髮' },
    creator: { id: 'u-1', name: '店長' },
  },
  {
    id: 'p-2',
    no: null,
    name: '舊款髮蠟',
    cost: 80,
    isUsing: false,
    sellPrice: 350,
    employeePrice: 200,
    stockUnit: '個',
    updatedAt: UPDATED,
    productCategory: null,
    creator: null,
  },
  {
    id: 'p-3',
    no: 'P03',
    name: '護髮油',
    cost: 300,
    isUsing: true,
    sellPrice: 900,
    employeePrice: 450,
    stockUnit: '瓶',
    updatedAt: UPDATED,
    productCategory: { id: 'cat-2', name: '護髮' },
    creator: { id: 'u-1', name: '店長' },
  },
]

const fixtures = (overrides = {}) => ({
  undefined: byQueryText([
    ['totalCount', vars => ({ products: { data: PRODUCTS, totalCount: 120, pageLimit: vars.input.pageLimit || 50, pageOffset: vars.input.pageOffset || 0 } })],
  ]),
  PRODUCT_CATEGORIES: { productCategories: CATEGORIES },
  GET_MERCHANT_PASSWORD: { merchantPassword: { deleteProduct: { isUsing: false } } },
  GET_PRODUCT_COST_IS_DISPLAY: { getIsProductCostDisplay: true },
  GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
  DEL_PRODUCTS: { deleteProducts: true },
  SET_PRODUCTS_CATEGORY: { multipleUpdateProductCategory: true },
  MultipleUpdateProductIsPublished: { multipleUpdateProductIsPublished: true },
  MultipleUpdateProductVendor: { multipleUpdateProductVendor: true },
  ...overrides,
})

const renderList = (overrides, options) =>
  renderPage(<Products />, { fixtures: fixtures(overrides), route: '/products', ...options })

const productQueries = calls => callsOf(calls, undefined)
const lastInput = calls => {
  const list = productQueries(calls)
  return list[list.length - 1].variables.input
}
const rowOf = name => screen.getByText(name).closest('tr')
const toolbar = () => screen.getByRole('toolbar', { name: '批次操作' })

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('商品列表：查詢條件', () => {
  it('第一次查詢每頁 50 筆、第一頁；關鍵字、分類、換頁、每頁筆數送出對應條件；換條件回到第一頁；清除篩選保留每頁筆數', async () => {
    const { settle, calls } = renderList()
    await settle()
    expect(productQueries(calls)[0].variables.input).toEqual({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: [] })
    expect(screen.getByText('共 120 筆資料')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    expect(lastInput(calls)).toMatchObject({ pageOffset: 1 })

    chooseNative(screen.getByLabelText('每頁筆數'), '25')
    await settle()
    expect(lastInput(calls)).toMatchObject({ pageLimit: 25 })

    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '洗髮' } })
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(lastInput(calls)).toMatchObject({ keyword: '洗髮', pageLimit: 25 })

    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    const categoryButton = screen.getByRole('button', { name: '護髮' })
    fireEvent.click(categoryButton)
    await settle()
    // 換分類：回到第一頁，否則第 2 頁可能沒有資料
    expect(lastInput(calls)).toMatchObject({ categoryIds: ['cat-2'], pageOffset: 0, pageLimit: 25 })
    expect(screen.getByRole('button', { name: '護髮' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '清除篩選' }))
    await settle()
    expect(lastInput(calls)).toEqual({ keyword: '', categoryIds: [], pageLimit: 25, pageOffset: 0 })
    expect(screen.getByRole('button', { name: '護髮' })).toBeEnabled()
  })

  it('沒有商品：顯示 0 筆、全選停用；查詢失敗：不進錯誤畫面', async () => {
    const { settle } = renderList({ undefined: { products: { data: [], totalCount: 0 } } })
    await settle()
    expect(screen.getByText('共 0 筆資料')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: '全選' })).toBeDisabled()
    cleanup()
    const failed = renderPage(<Products />, { fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('商品列表')[0]).toBeInTheDocument()
  })
})

describe('商品列表：顯示與匯出', () => {
  it('顯示成本時有成本欄、匯出含成本；未分類、無代號、無變更者的顯示；變更時間以台灣時間', async () => {
    const { settle } = renderList()
    await settle()
    expect(screen.getByRole('columnheader', { name: '成本' })).toBeInTheDocument()
    const first = rowOf('洗髮精')
    expect(within(first).getByText('1,200')).toBeInTheDocument()
    expect(within(first).getByText('2026/10/21')).toBeInTheDocument()
    const old = rowOf('舊款髮蠟')
    expect(within(old).getByText('無代號')).toBeInTheDocument()
    expect(within(old).getByText('未分類')).toBeInTheDocument()
    // 停用商品不可編輯
    expect(within(old).getByRole('link', { name: '編輯商品' })).toHaveAttribute('aria-disabled', 'true')
    expect(within(first).getByRole('link', { name: '編輯商品' })).toHaveAttribute('href', '/product/edit/p-1')
    expect(within(first).getByRole('link', { name: '複製商品' })).toHaveAttribute('href', '/product/duplicate/p-1')

    await wait(() => expect(exportedCsv()).toContain('成本'))
    const csv = exportedCsv()
    expect(csv).toContain('"P01","洗髮","洗髮精","120","瓶","1200","600","店長","2026/10/21"')
    expect(csv).toContain('"","未分類","舊款髮蠟","80","個","350","200","","2026/10/21"')
  })

  it('不顯示成本時沒有成本欄，匯出也不含成本', async () => {
    const { settle } = renderList({ GET_PRODUCT_COST_IS_DISPLAY: { getIsProductCostDisplay: false } })
    await settle()
    expect(screen.queryByRole('columnheader', { name: '成本' })).toBeNull()
    await wait(() => expect(exportedCsv()).not.toContain('成本'))
    expect(exportedCsv()).toContain('"P01","洗髮","洗髮精","瓶","1200","600","店長","2026/10/21"')
    expect(exportedCsv()).toContain('"","未分類","舊款髮蠟","個","350","200","","2026/10/21"')
  })
})

describe('商品列表：批次操作', () => {
  it('全選只選啟用中的商品；再按一次全選取消全部', async () => {
    const { settle } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(within(toolbar()).getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: '全選' }))
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()
  })

  it('刪除（不需密碼）：直接送出所選商品 id，成功後提示、清空勾選並重查；失敗提示錯誤', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(rowOf('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: /刪除/ }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除商品', variant: 'success' }))
    expect(callsOf(calls, 'DEL_PRODUCTS')[0].variables.itemIds).toEqual(['p-1', 'p-3'])
    expect(callsOf(calls, 'DEL_PRODUCTS')[0].variables.password).toBeUndefined()
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ DEL_PRODUCTS: new Error('商品已有銷售紀錄') })
    await second.settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: /刪除/ }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '商品已有銷售紀錄', variant: 'error' }))
  })

  it('刪除（需要密碼）：先跳刪除密碼框，確認後送出密碼；取消關閉不刪除', async () => {
    const { settle, calls } = renderList({ GET_MERCHANT_PASSWORD: { merchantPassword: { deleteProduct: { isUsing: true } } } })
    await settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: /刪除/ }))
    let dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    // 按 Esc 也只關閉
    fireEvent.click(within(toolbar()).getByRole('button', { name: /刪除/ }))
    dialog = await screen.findByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'DEL_PRODUCTS')).toHaveLength(0)

    fireEvent.click(within(toolbar()).getByRole('button', { name: /刪除/ }))
    dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('刪除密碼'), { target: { value: 'pw' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(callsOf(calls, 'DEL_PRODUCTS')).toHaveLength(1))
    expect(callsOf(calls, 'DEL_PRODUCTS')[0].variables).toEqual({ itemIds: ['p-1'], password: 'pw' })
  })

  it('編輯上架狀態：選「下架」送出所選商品與 false，成功後關閉、清空勾選；失敗提示錯誤；取消不送出', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯上架狀態' }))
    let dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    // 取消也清空勾選
    expect(screen.getByRole('toolbar', { name: '批次操作', hidden: true }).closest('[hidden]')).not.toBeNull()

    fireEvent.click(within(rowOf('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯上架狀態' }))
    dialog = await screen.findByRole('dialog')
    chooseNative(dialog.querySelector('select'), '下架')
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '設定成功' }))
    expect(callsOf(calls, 'MultipleUpdateProductIsPublished')[0].variables).toEqual({
      input: { productIds: ['p-3'], isPublished: false },
    })
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ MultipleUpdateProductIsPublished: new Error('權限不足') })
    await second.settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯上架狀態' }))
    dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '權限不足' }))
    expect(callsOf(second.calls, 'MultipleUpdateProductIsPublished')[0].variables.input.isPublished).toBe(true)
  })

  it('編輯廠商：未選廠商不能確認；選定後送出所選商品與店家廠商 uuid；失敗提示錯誤', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯廠商' }))
    const dialog = await screen.findByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: '確認' })
    expect(confirm).toBeDisabled()
    const input = dialog.querySelector('input')
    fireEvent.focusIn(input)
    fireEvent.click(input)
    // 選項：沒有代號顯示（無代號），有暱稱顯示暱稱；可用代號、名稱或暱稱篩選
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['V01 大和', '(無代號) 美髮材料行'])
    fireEvent.change(input, { target: { value: '美髮' } })
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['(無代號) 美髮材料行'])
    fireEvent.click(screen.getByRole('option', { name: '(無代號) 美髮材料行' }))
    expect(input).toHaveValue('(無代號) 美髮材料行')
    expect(confirm).toBeEnabled()
    fireEvent.click(confirm)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '設定成功' }))
    expect(callsOf(calls, 'MultipleUpdateProductVendor')[0].variables).toEqual({
      input: { productIds: ['p-1'], MerchantVendorId: 'mv-2' },
    })
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ MultipleUpdateProductVendor: new Error('廠商不存在') })
    await second.settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯廠商' }))
    const dialog2 = await screen.findByRole('dialog')
    const input2 = dialog2.querySelector('input')
    fireEvent.focusIn(input2)
    fireEvent.click(input2)
    fireEvent.click(screen.getByRole('option', { name: 'V01 大和' }))
    fireEvent.click(within(dialog2).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '廠商不存在' }))
    // 清除廠商：確認鈕停用
    const field = dialog2.querySelector('input')
    fireEvent.focusIn(field)
    fireEvent.mouseDown(within(field.closest('.ui-root')).getByRole('button', { name: '清除' }))
    expect(within(dialog2).getByRole('button', { name: '確認' })).toBeDisabled()
  })

  it('編輯商品類別：送出所選商品與類別，成功後重查、清空勾選；失敗提示錯誤；關閉不送出', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯商品類別' }))
    let dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯商品類別' }))
    dialog = await screen.findByRole('dialog')
    chooseNative(dialog.querySelector('select'), 'C2 護髮')
    const before = productQueries(calls).length
    fireEvent.click(within(dialog).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯商品類別成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_PRODUCTS_CATEGORY')[0].variables).toEqual({
      input: { productIds: ['p-1'], categoryId: 'cat-2' },
    })
    await settle()
    expect(productQueries(calls).length).toBeGreaterThan(before)
    cleanup()

    openSnackbar.mockClear()
    const second = renderList({ SET_PRODUCTS_CATEGORY: new Error('類別已刪除') })
    await second.settle()
    fireEvent.click(within(rowOf('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(toolbar()).getByRole('button', { name: '編輯商品類別' }))
    dialog = await screen.findByRole('dialog')
    chooseNative(dialog.querySelector('select'), 'C1 洗髮')
    fireEvent.click(within(dialog).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '類別已刪除', variant: 'error' }))
  })
})
