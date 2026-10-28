// 保護「編輯進貨單」：帶入原進貨單（商品、數量、進貨價、備註），商品選項只查該廠商的商品；
// 改商品帶入成本為進貨價、合計＝Σ(進貨價×數量)、有未選商品或數量 0 的列時不能儲存；
// 儲存送出的內容（進貨單 uuid、商品 id／數量／進貨價、備註）；刪除、入庫（依入庫密碼設定）成功後回列表、失敗可重試；
// 已入庫的單唯讀，只能「取消入庫」，取消成功後畫面回到可編輯；入庫時間以台灣時間顯示；
// 從商品清單挑選帶回的進貨價與數量與清單上一致；查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import {
  CATEGORIES,
  RESTOCK_PRODUCTS,
  clearCombo,
  inputsByLabel,
  optionTexts,
  pickOption,
  stockInUsing,
} from '../../__tests__/stockKit.test'
import ProductRestockEdit from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const RECORD = {
  uuid: 'pr-1',
  date: Date.UTC(2026, 9, 20, 16, 30),
  vendorName: '大和貿易',
  vendorUUId: 'mv-1',
  operatorID: 'user-a',
  operatorName: '王小美',
  purchaseProduct: [
    { productID: 'p-1', productName: '洗髮精', count: 3, unitPrice: 120 },
    { productID: 'p-2', productName: '護髮油', count: 1, unitPrice: 300 },
  ],
  remark: '月初補貨',
  stockInDate: null,
}

const fixtures = (overrides = {}) => ({
  GET_PURCHASE_RECORD_FOR_EDIT: { purchaseRecord: RECORD },
  GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: RESTOCK_PRODUCTS } },
  GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: { productCategories: CATEGORIES },
  GET_STOCK_IN_USING: stockInUsing(false, false),
  UPDATE_PURCHASE: { updatePurchase: true },
  DELETE_PURCHASE: { deletePurchase: true },
  SET_PURCHASE_STOCK_IN: { setPurchaseStockIn: true },
  SET_PURCHASE_STOCK_IN_UNDO: { setPurchaseStockInUndo: true },
  ...overrides,
})

const renderEdit = (overrides, options) =>
  renderPage(<ProductRestockEdit />, {
    fixtures: fixtures(overrides),
    path: '/product/restock/edit/:id',
    route: '/product/restock/edit/pr-1',
    ...options,
  })

const rows = () => inputsByLabel('選擇商品')
const priceInputs = () => inputsByLabel('價格')
const countInputs = () => inputsByLabel('數量')
const total = () => screen.getByText(/^合計：/).querySelector('span').textContent
const saveButton = () => screen.getByRole('button', { name: '儲存' })

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('編輯進貨單：未入庫', () => {
  it('帶入原進貨單；商品選項只查該廠商的商品；合計＝Σ進貨價×數量', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(callsOf(calls, 'GET_PURCHASE_RECORD_FOR_EDIT')[0].variables).toEqual({ purchaseUUId: 'pr-1' })
    expect(callsOf(calls, 'GET_PRODUCT_IN_PRODUCT_RESTOCK')[0].variables.input).toEqual({
      keyword: '',
      categoryIds: [],
      merchantVendorUUIds: ['mv-1'],
    })
    expect(screen.getByText('進貨資訊-大和貿易')).toBeInTheDocument()
    expect(screen.getByLabelText('進貨日期')).toHaveValue('2026/10/21')
    expect(rows().map(i => i.value)).toEqual(['洗髮精', '護髮油'])
    expect(priceInputs().map(i => i.value)).toEqual(['120', '300'])
    expect(countInputs().map(i => i.value)).toEqual(['3', '1'])
    expect(total()).toBe('660')
    expect(screen.getByLabelText('操作者')).toHaveValue('王小美')
    expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '入庫' })).toBeEnabled()
    expect(saveButton()).toBeEnabled()
  })

  it('改數量、進貨價與備註後儲存：送出進貨單 uuid、商品 id／數量／進貨價與備註，成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.change(countInputs()[0], { target: { value: '5' } })
    fireEvent.change(priceInputs()[1], { target: { value: '280' } })
    expect(total()).toBe('880')
    fireEvent.change(screen.getByLabelText('備註'), { target: { value: '改單' } })
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯成功', variant: 'success' }))
    expect(callsOf(calls, 'UPDATE_PURCHASE')[0].variables).toEqual({
      input: {
        purchaseUUId: 'pr-1',
        productList: [
          { productId: 'p-1', count: 5, unitPrice: 120 },
          { productId: 'p-2', count: 1, unitPrice: 280 },
        ],
        remark: '改單',
      },
    })
    await wait(() => expect(currentLocation()).toBe('/product/restock/'))
  })

  it('已知缺口（待 Jason 決定）：改進貨日期不會送出（儲存的內容沒有日期欄位）', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.click(screen.getByLabelText('進貨日期'))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月15日' }))
    await wait(() => expect(screen.getByLabelText('進貨日期')).toHaveValue('2026/10/15'))
    fireEvent.click(saveButton())
    await wait(() => expect(callsOf(calls, 'UPDATE_PURCHASE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_PURCHASE')[0].variables.input).not.toHaveProperty('date')
  })

  it('改選商品帶入成本為進貨價；依代號或名稱篩選；清除商品後不能儲存；新增、刪除列', async () => {
    const { settle } = renderEdit()
    await settle()
    expect(optionTexts('選擇商品', { typed: 'P10' })).toEqual(['P10 髮蠟'])
    fireEvent.keyDown(rows()[0], { key: 'Escape' })
    pickOption('選擇商品', 'P10 髮蠟', { index: 1, typed: '髮蠟' })
    expect(rows()[1]).toHaveValue('髮蠟')
    expect(priceInputs()[1]).toHaveValue(80)
    expect(total()).toBe('440')

    clearCombo(rows()[1])
    expect(saveButton()).toBeDisabled()
    // 清除後該列進貨價與數量歸零，合計不可變成 NaN
    expect(total()).toBe('360')
    expect(priceInputs()[1]).toHaveValue(0)
    fireEvent.click(screen.getAllByRole('button', { name: '刪除此列' })[0])
    expect(rows()).toHaveLength(1)
    expect(saveButton()).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '新增一列' }))
    expect(rows()).toHaveLength(2)
    // 新列數量 0：不能儲存
    expect(saveButton()).toBeDisabled()
  })

  it('負數改為 0 並提示；價格欄 Enter 不出錯，數量欄 Enter 到下一列、最後一列時新增一列', async () => {
    const { settle } = renderEdit()
    await settle()
    fireEvent.change(priceInputs()[0], { target: { value: '-1' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    expect(priceInputs()[0]).toHaveValue(0)
    fireEvent.change(countInputs()[0], { target: { value: '-2' } })
    expect(countInputs()[0]).toHaveValue(0)

    fireEvent.focusIn(rows()[0])
    fireEvent.focusIn(priceInputs()[0])
    expect(() => fireEvent.keyDown(priceInputs()[0], { key: 'Enter' })).not.toThrow()
    expect(() => fireEvent.keyDown(priceInputs()[0], { key: 'Enter' })).not.toThrow()
    // 同一列連續選兩次商品（第二次時價格欄已是焦點目標）
    pickOption('選擇商品', 'P10 髮蠟')
    pickOption('選擇商品', 'P01 洗髮精')
    expect(rows()[0]).toHaveValue('洗髮精')
    fireEvent.keyDown(priceInputs()[0], { key: 'a' })
    fireEvent.focusIn(countInputs()[0])
    fireEvent.keyDown(countInputs()[0], { key: 'Enter' })
    expect(rows()).toHaveLength(2)
    fireEvent.keyDown(countInputs()[1], { key: 'Enter' })
    expect(rows()).toHaveLength(3)
    fireEvent.keyDown(countInputs()[1], { key: 'b' })
    expect(rows()).toHaveLength(3)
  })

  it('儲存失敗或後端回 false：提示並可再儲存', async () => {
    const { settle } = renderEdit({ UPDATE_PURCHASE: { updatePurchase: false } })
    await settle()
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯失敗', variant: 'error' }))
    expect(saveButton()).toBeEnabled()
    cleanup()

    openSnackbar.mockClear()
    const second = renderEdit({ UPDATE_PURCHASE: new Error('進貨單已入庫') })
    await second.settle()
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '進貨單已入庫', variant: 'error' }))
    expect(saveButton()).toBeEnabled()
  })

  it('刪除：送出這張單的 uuid，成功回列表；失敗提示錯誤；後端回 false 不提示成功', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(calls, 'DELETE_PURCHASE')[0].variables).toEqual({ purchaseUUIds: ['pr-1'] })
    await wait(() => expect(currentLocation()).toBe('/product/restock/'))
    cleanup()

    openSnackbar.mockClear()
    const second = renderEdit({ DELETE_PURCHASE: new Error('已有銷貨') })
    await second.settle()
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已有銷貨', variant: 'error' }))
    cleanup()

    openSnackbar.mockClear()
    const third = renderEdit({ DELETE_PURCHASE: { deletePurchase: false } })
    await third.settle()
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    fireEvent.click(screen.getByTestId('confirm-delete')) // 二次確認
    await wait(() => expect(callsOf(third.calls, 'DELETE_PURCHASE')).toHaveLength(1))
    await third.settle()
    expect(openSnackbar).not.toHaveBeenCalled()
    expect(currentLocation()).toBe('/product/restock/edit/pr-1')
  })

  it('入庫（不需密碼）：直接送出這張單 uuid 與空密碼，成功回列表；失敗提示、按鈕恢復', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '入庫成功' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '' } })
    await wait(() => expect(currentLocation()).toBe('/product/restock/'))
    cleanup()

    openSnackbar.mockClear()
    const second = renderEdit({ SET_PURCHASE_STOCK_IN: new Error('庫存異常') })
    await second.settle()
    fireEvent.click(screen.getByRole('button', { name: '入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '庫存異常' }))
    expect(screen.getByRole('button', { name: '入庫' })).toBeEnabled()
  })

  it('入庫（需要密碼）：先跳「進貨單入庫」密碼框，確認後以密碼送出；取消關閉', async () => {
    const { settle, calls } = renderEdit({ GET_STOCK_IN_USING: stockInUsing(true, true) })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '入庫' }))
    let dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('進貨單入庫')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '入庫' }))
    dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('入庫密碼'), { target: { value: '2468' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(1))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '2468' } })
  })
})

describe('編輯進貨單：已入庫', () => {
  const STOCKED = { ...RECORD, stockInDate: Date.UTC(2026, 9, 21, 7, 45) }

  it('唯讀：不能刪除、儲存；入庫時間以台灣時間顯示；只能取消入庫', async () => {
    const { settle } = renderEdit({ GET_PURCHASE_RECORD_FOR_EDIT: { purchaseRecord: STOCKED } })
    await settle()
    expect(screen.getByText('入庫時間：2026/10/21 15:45')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '刪除' })).toBeNull()
    expect(screen.queryByRole('button', { name: '儲存' })).toBeNull()
    expect(priceInputs()[0]).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: '從商品清單挑選' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消入庫' })).toBeEnabled()
  })

  it('取消入庫（不需密碼）：送出後提示並重新讀取，畫面回到可編輯', async () => {
    let stocked = true
    const { settle, calls } = renderEdit({
      GET_PURCHASE_RECORD_FOR_EDIT: () => ({ purchaseRecord: stocked ? STOCKED : RECORD }),
      SET_PURCHASE_STOCK_IN_UNDO: () => {
        stocked = false
        return { setPurchaseStockInUndo: true }
      },
    })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '取消入庫' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '取消入庫成功' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN_UNDO')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '' } })
    await settle()
    expect(callsOf(calls, 'GET_PURCHASE_RECORD_FOR_EDIT').length).toBeGreaterThan(1)
    await wait(() => expect(screen.getByRole('button', { name: '入庫' })).toBeInTheDocument())
    expect(saveButton()).toBeEnabled()
  })

  it('取消入庫（需要密碼）：密碼框標題為「進貨單取消入庫」；失敗提示錯誤、按鈕恢復', async () => {
    const { settle, calls } = renderEdit({
      GET_PURCHASE_RECORD_FOR_EDIT: { purchaseRecord: STOCKED },
      GET_STOCK_IN_USING: stockInUsing(false, true),
      SET_PURCHASE_STOCK_IN_UNDO: new Error('已有銷貨'),
    })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '取消入庫' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('進貨單取消入庫')).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('取消入庫密碼'), { target: { value: '1357' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '已有銷貨' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN_UNDO')[0].variables).toEqual({ input: { purchaseUUId: 'pr-1', pwd: '1357' } })
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: '確認' })).toBeEnabled()
  })
})

describe('編輯進貨單：從商品清單挑選', () => {
  const dialog = () => screen.getByRole('dialog')
  const modalRow = name => within(dialog()).getByText(name).closest('tr')
  const modalNames = () =>
    within(dialog())
      .getAllByRole('row')
      .slice(1)
      .map(r => r.querySelectorAll('td')[3].textContent)

  async function openModal(overrides) {
    const utils = renderEdit(overrides)
    await utils.settle()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    return utils
  }

  it('依分類篩選、清除；排序依編號、庫存多到少、少到多', async () => {
    await openModal()
    expect(within(dialog()).getByText('所有商品')).toBeInTheDocument()
    expect(modalNames()).toEqual(['洗髮精', '護髮油', '髮蠟'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '洗髮' }))
    expect(modalNames()).toEqual(['洗髮精', '髮蠟'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '庫存多到少' }))
    expect(modalNames()).toEqual(['髮蠟', '洗髮精', '護髮油'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '庫存少到多' }))
    expect(modalNames()).toEqual(['護髮油', '洗髮精', '髮蠟'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '編號' }))
    expect(modalNames()).toEqual(['洗髮精', '護髮油', '髮蠟'])
  })

  it('勾選商品改數量與進貨價（含 0）：帶回的內容與清單一致並接在原有的列之後；取消勾選的不帶回；負數改 0', async () => {
    const { calls } = await openModal()
    const wax = modalRow('髮蠟')
    fireEvent.click(within(wax).getByRole('checkbox'))
    fireEvent.change(within(wax).getByLabelText('數量'), { target: { value: '6' } })
    fireEvent.change(within(wax).getByLabelText('價格'), { target: { value: '0' } })
    fireEvent.change(within(wax).getByLabelText('價格'), { target: { value: '-3' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    // 換分類再回來保留勾選
    fireEvent.click(within(dialog()).getByRole('button', { name: '護髮' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))
    expect(within(modalRow('髮蠟')).getByRole('checkbox')).toBeChecked()
    const oil = modalRow('護髮油')
    fireEvent.click(within(oil).getByRole('checkbox'))
    fireEvent.click(within(oil).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['洗髮精', '護髮油', '髮蠟'])
    expect(countInputs().map(i => i.value)).toEqual(['3', '1', '6'])
    expect(priceInputs().map(i => i.value)).toEqual(['120', '300', '0'])
    fireEvent.click(saveButton())
    await wait(() => expect(callsOf(calls, 'UPDATE_PURCHASE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_PURCHASE')[0].variables.input.productList[2]).toEqual({
      productId: 'p-3',
      count: 6,
      unitPrice: 0,
    })
  })

  it('沒勾選就按確定或關閉：原有的列不變', async () => {
    await openModal()
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['洗髮精', '護髮油'])
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '關閉' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['洗髮精', '護髮油'])
  })

  it('有未分類的商品：依分類篩選不出錯，未分類的不列入；類別欄空白', async () => {
    const UNCATEGORIZED = { ...RESTOCK_PRODUCTS[2], id: 'p-4', no: 'P20', name: '贈品梳', productCategory: null }
    await openModal({ GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: [...RESTOCK_PRODUCTS, UNCATEGORIZED] } } })
    expect(modalNames()).toContain('贈品梳')
    expect(modalRow('贈品梳').querySelectorAll('td')[2].textContent).toBe('')
    fireEvent.click(within(dialog()).getByRole('button', { name: '洗髮' }))
    expect(modalNames()).toEqual(['洗髮精', '髮蠟'])
  })

  it('數量或價格清空：數量視為 1、價格視為 0', async () => {
    await openModal()
    const wax = modalRow('髮蠟')
    fireEvent.click(within(wax).getByRole('checkbox'))
    fireEvent.change(within(wax).getByLabelText('數量'), { target: { value: '' } })
    fireEvent.change(within(wax).getByLabelText('價格'), { target: { value: '' } })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(countInputs()[2]).toHaveValue(1)
    expect(priceInputs()[2]).toHaveValue(0)
  })

  it('進貨單還沒有任何商品：先改價格與數量再勾選，帶回的就是清單上的價格與數量', async () => {
    const EMPTY = { ...RECORD, purchaseProduct: [{ productID: '', productName: '', count: 0, unitPrice: 0 }] }
    await openModal({ GET_PURCHASE_RECORD_FOR_EDIT: { purchaseRecord: EMPTY } })
    const oil = modalRow('護髮油')
    fireEvent.change(within(oil).getByLabelText('價格'), { target: { value: '275' } })
    fireEvent.change(within(oil).getByLabelText('數量'), { target: { value: '4' } })
    fireEvent.click(within(oil).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['護髮油'])
    expect(priceInputs()[0]).toHaveValue(275)
    expect(countInputs()[0]).toHaveValue(4)
    expect(total()).toBe('1,100')
  })

  it('廠商沒有商品：清單為空', async () => {
    await openModal({ GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: [] } } })
    expect(modalNames()).toEqual([])
  })
})

describe('編輯進貨單：查詢失敗', () => {
  it('所有查詢失敗：頁面仍顯示，不進錯誤畫面', async () => {
    const { settle } = renderPage(<ProductRestockEdit />, {
      fallback: 'error',
      path: '/product/restock/edit/:id',
      route: '/product/restock/edit/pr-1',
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('編輯進貨單')[0]).toBeInTheDocument()
  })

  it('進貨單讀到了但商品、分類查詢失敗：顯示原進貨單，商品清單為空', async () => {
    const { settle } = renderEdit({
      GET_PRODUCT_IN_PRODUCT_RESTOCK: new Error('商品查詢失敗'),
      GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: new Error('分類查詢失敗'),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rows().map(i => i.value)).toEqual(['洗髮精', '護髮油'])
    expect(optionTexts('選擇商品')).toEqual([])
  })

  it('進貨單沒有廠商：商品查詢不限廠商', async () => {
    const { settle, calls } = renderEdit({ GET_PURCHASE_RECORD_FOR_EDIT: { purchaseRecord: { ...RECORD, vendorUUId: null } } })
    await settle()
    expect(callsOf(calls, 'GET_PRODUCT_IN_PRODUCT_RESTOCK')[0].variables.input.merchantVendorUUIds).toEqual([])
  })
})
