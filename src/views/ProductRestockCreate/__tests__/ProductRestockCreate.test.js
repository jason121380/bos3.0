// 保護「新增商品進貨」：只能選有綁定廠商的商品、選商品帶入成本為進貨價、合計＝Σ(進貨價×數量)；
// 沒選操作者或有未選商品／數量 0 的列時不能送出；送出的進貨單內容（日期為台灣時間的時間戳、商品 id、數量、進貨價、操作者、備註）；
// 「新增並入庫」依店家入庫密碼設定（需要時先輸入密碼）新增後逐張入庫，送出中不可重複送出、失敗可重送；
// 從商品清單挑選（分類／廠商篩選、排序、勾選、改價格數量）帶回的進貨價與數量要與清單上看到的一致；
// 查詢失敗時頁面不白屏。GraphQL 全由 testkit 模擬，不連後端、不建立真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import {
  CATEGORIES,
  RESTOCK_PRODUCTS,
  USERS,
  VENDORS,
  inputsByLabel,
  clearCombo,
  optionTexts,
  pickOption,
  stockInUsing,
} from '../../__tests__/stockKit.test'
import ProductRestockCreate from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const fixtures = (overrides = {}) => ({
  GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: RESTOCK_PRODUCTS } },
  GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
  GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: { productCategories: CATEGORIES },
  GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
  GET_STOCK_IN_USING: stockInUsing(false, false),
  CREATE_PURCHASE: { createPurchase: ['new-1', 'new-2'] },
  SET_PURCHASE_STOCK_IN: { setPurchaseStockIn: true },
  ...overrides,
})

const renderCreate = (overrides, options) =>
  renderPage(<ProductRestockCreate />, { fixtures: fixtures(overrides), route: '/product/restock/create', ...options })

const rows = () => inputsByLabel('選擇商品')
const priceInputs = () => inputsByLabel('價格')
const countInputs = () => inputsByLabel('數量')
const total = () => screen.getByText(/^合計：/).querySelector('span').textContent
const addButton = () => screen.getByRole('button', { name: '新增' })
const addAndStockIn = () => screen.getByRole('button', { name: '新增並入庫' })

// 填好一張可送出的進貨單：洗髮精 3 件、操作者王小美
async function fillValidPurchase() {
  pickOption('選擇商品', 'P01 洗髮精')
  fireEvent.change(countInputs()[0], { target: { value: '3' } })
  pickOption('操作者', 'A01 王小美')
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增商品進貨：填單與送出', () => {
  it('商品選項只列有綁定廠商的商品；選商品帶入成本為進貨價，合計＝進貨價×數量；未選操作者前不能送出', async () => {
    const { settle } = renderCreate()
    await settle()
    expect(optionTexts('選擇商品')).toEqual(['P01 洗髮精', 'P02 護髮油'])
    pickOption('選擇商品', 'P02 護髮油', { typed: '護髮' })
    expect(priceInputs()[0]).toHaveValue(300)
    expect(addButton()).toBeDisabled()
    fireEvent.change(countInputs()[0], { target: { value: '2' } })
    expect(total()).toBe('600')
    // 改進貨價
    fireEvent.change(priceInputs()[0], { target: { value: '250' } })
    expect(total()).toBe('500')
    expect(addButton()).toBeDisabled()
    pickOption('操作者', 'A01 王小美')
    expect(addButton()).toBeEnabled()
    expect(addAndStockIn()).toBeEnabled()
  })

  it('依代號或名稱篩選商品；操作者選項顯示編號與姓名', async () => {
    const { settle } = renderCreate()
    await settle()
    expect(optionTexts('選擇商品', { typed: 'P02' })).toEqual(['P02 護髮油'])
    expect(optionTexts('選擇商品', { typed: '洗髮' })).toEqual(['P01 洗髮精'])
    fireEvent.keyDown(rows()[0], { key: 'Escape' })
    expect(optionTexts('操作者')).toEqual(['A01 王小美', ' 李助理'])
    // 打出編號時，選定後的欄位文字帶編號
    pickOption('操作者', 'A01 王小美', { typed: 'A01' })
    expect(inputsByLabel('操作者')[0]).toHaveValue('A01 王小美')
    // 再打開：已選的操作者標示為選取
    pickOption('操作者', ' 李助理')
    expect(inputsByLabel('操作者')[0]).toHaveValue('李助理')
  })

  it('負數價格或數量改為 0 並提示', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P01 洗髮精')
    fireEvent.change(priceInputs()[0], { target: { value: '-5' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    expect(priceInputs()[0]).toHaveValue(0)
    openSnackbar.mockClear()
    fireEvent.change(countInputs()[0], { target: { value: '-1' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    expect(countInputs()[0]).toHaveValue(0)
  })

  it('送出「新增」：進貨單內容為今天（台灣時間）、商品 id／數量／進貨價、操作者與備註（去頭尾空白），成功後回列表', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    const before = Date.now()
    await fillValidPurchase()
    // 第二列：護髮油 1 件
    fireEvent.click(screen.getByRole('button', { name: '新增一列' }))
    expect(rows()).toHaveLength(2)
    pickOption('選擇商品', 'P02 護髮油', { index: 1 })
    fireEvent.change(countInputs()[1], { target: { value: '1' } })
    expect(total()).toBe('660')
    fireEvent.change(screen.getByLabelText('備註'), { target: { value: '  月初補貨  ' } })
    fireEvent.click(addButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增進貨', variant: 'success' }))
    const { input } = callsOf(calls, 'CREATE_PURCHASE')[0].variables
    expect(input).toEqual({
      operatorId: 'user-a',
      date: expect.any(Number),
      productList: [
        { productId: 'p-1', count: 3, unitPrice: 120 },
        { productId: 'p-2', count: 1, unitPrice: 300 },
      ],
      remark: '月初補貨',
    })
    expect(input.date).toBeLessThanOrEqual(Date.now())
    expect(input.date).toBeGreaterThanOrEqual(before - 60000)
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(0)
    await wait(() => expect(currentLocation()).toBe('/product/restock/'))
  })

  it('改進貨日期：送出所選那天台灣時間 0 點的時間戳', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    await fillValidPurchase()
    fireEvent.click(screen.getByLabelText('進貨日期'))
    const now = new Date()
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: `${now.getFullYear()}年${now.getMonth() + 1}月15日` }))
    await wait(() => expect(screen.getByLabelText('進貨日期')).toHaveValue(
      `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/15`
    ))
    fireEvent.click(addButton())
    await wait(() => expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(1))
    // 選日子保留原本的時刻（同舊版），日期是台灣時間的 15 日
    const sent = new Date(callsOf(calls, 'CREATE_PURCHASE')[0].variables.input.date)
    expect([sent.getFullYear(), sent.getMonth(), sent.getDate()]).toEqual([now.getFullYear(), now.getMonth(), 15])
  })

  it('刪除第二列、清除已選商品：該列回到未選，不能送出', async () => {
    const { settle } = renderCreate()
    await settle()
    await fillValidPurchase()
    fireEvent.click(screen.getByRole('button', { name: '新增一列' }))
    expect(addButton()).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '刪除此列' }))
    expect(rows()).toHaveLength(1)
    expect(addButton()).toBeEnabled()
    // 清除商品：進貨價與數量歸零、不能送出
    clearCombo(rows()[0])
    expect(priceInputs()[0]).toHaveValue(0)
    expect(addButton()).toBeDisabled()
    // 清除操作者
    pickOption('選擇商品', 'P01 洗髮精')
    fireEvent.change(countInputs()[0], { target: { value: '1' } })
    expect(addButton()).toBeEnabled()
    clearCombo(inputsByLabel('操作者')[0])
    expect(addButton()).toBeDisabled()
  })

  it('數量欄按 Enter：到下一列；最後一列時自動新增一列。價格欄按 Enter 不出錯', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P01 洗髮精')
    fireEvent.focusIn(priceInputs()[0])
    fireEvent.keyDown(priceInputs()[0], { key: 'Enter' })
    fireEvent.keyDown(priceInputs()[0], { key: 'Enter' })
    fireEvent.keyDown(priceInputs()[0], { key: 'Tab' })
    fireEvent.focusIn(countInputs()[0])
    fireEvent.keyDown(countInputs()[0], { key: 'Enter' })
    expect(rows()).toHaveLength(2)
    // 第一列的 Enter 再按一次：只移到第二列，不再新增
    fireEvent.keyDown(countInputs()[0], { key: 'Enter' })
    fireEvent.keyDown(countInputs()[0], { key: 'a' })
    expect(rows()).toHaveLength(2)
  })

  it('後端回空清單：提示新增失敗、可再送出；送出失敗：提示錯誤、可再送出', async () => {
    const { settle, calls } = renderCreate({ CREATE_PURCHASE: { createPurchase: [] } })
    await settle()
    await fillValidPurchase()
    fireEvent.click(addButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增進貨失敗', variant: 'error' }))
    expect(addButton()).toBeEnabled()
    expect(currentLocation()).toBe('/product/restock/create')
    cleanup()

    openSnackbar.mockClear()
    const second = renderCreate({ CREATE_PURCHASE: new Error('廠商已停用') })
    await second.settle()
    await fillValidPurchase()
    fireEvent.click(addButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '廠商已停用', variant: 'error' }))
    expect(addButton()).toBeEnabled()
    expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(1)
  })
})

describe('新增商品進貨：新增並入庫', () => {
  it('不需要入庫密碼：新增後把每張新單逐一入庫（空密碼），成功後回列表', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    await fillValidPurchase()
    fireEvent.click(addAndStockIn())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增進貨並入庫', variant: 'success' }))
    expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(1)
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN').map(c => c.variables)).toEqual([
      { input: { purchaseUUId: 'new-1', pwd: '' } },
      { input: { purchaseUUId: 'new-2', pwd: '' } },
    ])
    await wait(() => expect(currentLocation()).toBe('/product/restock/'))
  })

  it('需要入庫密碼：先跳密碼框，確認後新增並以該密碼入庫；入庫失敗提示錯誤、可再試；取消關閉密碼框', async () => {
    const { settle, calls } = renderCreate({
      GET_STOCK_IN_USING: stockInUsing(true, false),
      SET_PURCHASE_STOCK_IN: new Error('入庫密碼錯誤'),
    })
    await settle()
    await fillValidPurchase()
    fireEvent.click(addAndStockIn())
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('進貨單入庫')).toBeInTheDocument()
    expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(0)
    fireEvent.change(within(dialog).getByLabelText('入庫密碼'), { target: { value: '5678' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '入庫密碼錯誤' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')[0].variables).toEqual({ input: { purchaseUUId: 'new-1', pwd: '5678' } })
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: '確認' })).toBeEnabled()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('送出中不可重複送出（按鈕停用），只新增一次', async () => {
    const { settle, calls } = renderCreate(undefined, { delays: { CREATE_PURCHASE: 500 } })
    await settle()
    await fillValidPurchase()
    fireEvent.click(addAndStockIn())
    expect(addAndStockIn()).toBeDisabled()
    fireEvent.click(addAndStockIn())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增進貨並入庫', variant: 'success' }))
    expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(1)
  })

  it('後端沒有建立任何進貨單：提示失敗、不入庫，按鈕恢復可再送出', async () => {
    const { settle, calls } = renderCreate({ CREATE_PURCHASE: { createPurchase: [] } })
    await settle()
    await fillValidPurchase()
    fireEvent.click(addAndStockIn())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增進貨失敗', variant: 'error' }))
    expect(callsOf(calls, 'SET_PURCHASE_STOCK_IN')).toHaveLength(0)
    expect(addAndStockIn()).toBeEnabled()
  })
})

describe('新增商品進貨：從商品清單挑選', () => {
  const dialog = () => screen.getByRole('dialog')
  const modalRow = name => within(dialog()).getByText(name).closest('tr')
  const modalNames = () =>
    within(dialog())
      .getAllByRole('row')
      .slice(1)
      .map(r => r.querySelectorAll('td')[4].textContent)

  async function openModal() {
    const utils = renderCreate()
    await utils.settle()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    return utils
  }

  it('依分類、廠商篩選與清除；排序依編號、庫存多到少、少到多', async () => {
    await openModal()
    expect(within(dialog()).getByText('所有商品')).toBeInTheDocument()
    expect(modalNames()).toEqual(['洗髮精', '護髮油'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '護髮' }))
    expect(modalNames()).toEqual(['護髮油'])
    // 分類＋廠商
    fireEvent.click(within(dialog()).getByRole('button', { name: '大和貿易' }))
    expect(modalNames()).toEqual([])
    fireEvent.click(within(dialog()).getByRole('button', { name: '洗髮' }))
    expect(modalNames()).toEqual(['洗髮精'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))
    expect(modalNames()).toEqual(['洗髮精', '護髮油'])
    // 只篩廠商
    fireEvent.click(within(dialog()).getByRole('button', { name: '美髮材料行' }))
    expect(modalNames()).toEqual(['護髮油'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))

    fireEvent.click(within(dialog()).getByRole('button', { name: '庫存少到多' }))
    expect(modalNames()).toEqual(['護髮油', '洗髮精'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '庫存多到少' }))
    expect(modalNames()).toEqual(['洗髮精', '護髮油'])
    fireEvent.click(within(dialog()).getByRole('button', { name: '編號' }))
    expect(modalNames()).toEqual(['洗髮精', '護髮油'])
  })

  it('勾選後改數量、進貨價：帶回的進貨價與數量與清單上一致，已選的單列保留；合計重算', async () => {
    const { calls } = await openModal()
    const row = modalRow('洗髮精')
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.change(within(row).getByLabelText('數量'), { target: { value: '4' } })
    fireEvent.change(within(row).getByLabelText('價格'), { target: { value: '110' } })
    expect(within(row).getByText('440')).toBeInTheDocument()
    // 先改價格、再勾選
    const second = modalRow('護髮油')
    fireEvent.change(within(second).getByLabelText('價格'), { target: { value: '250' } })
    fireEvent.change(within(second).getByLabelText('數量'), { target: { value: '2' } })
    fireEvent.click(within(second).getByRole('checkbox'))
    // 換分類再回來：已勾選的保留勾選與數量
    fireEvent.click(within(dialog()).getByRole('button', { name: '護髮' }))
    expect(within(modalRow('護髮油')).getByRole('checkbox')).toBeChecked()
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))
    expect(within(modalRow('洗髮精')).getByRole('checkbox')).toBeChecked()
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())

    expect(rows()).toHaveLength(2)
    expect(priceInputs().map(i => i.value)).toEqual(['110', '250'])
    expect(countInputs().map(i => i.value)).toEqual(['4', '2'])
    expect(total()).toBe('940')
    pickOption('操作者', 'A01 王小美')
    fireEvent.click(addButton())
    await wait(() => expect(callsOf(calls, 'CREATE_PURCHASE')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_PURCHASE')[0].variables.input.productList).toEqual([
      { productId: 'p-1', count: 4, unitPrice: 110 },
      { productId: 'p-2', count: 2, unitPrice: 250 },
    ])
  })

  it('勾選後把進貨價改成 0（贈品）：帶回的進貨價是 0，與清單上顯示的相同', async () => {
    await openModal()
    const row = modalRow('洗髮精')
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.change(within(row).getByLabelText('數量'), { target: { value: '2' } })
    fireEvent.change(within(row).getByLabelText('價格'), { target: { value: '0' } })
    expect(within(row).getByLabelText('價格')).toHaveValue(0)
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(priceInputs()[0]).toHaveValue(0)
    expect(countInputs()[0]).toHaveValue(2)
  })

  it('取消勾選的商品不帶回；外面已選好的列保留在前面', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P02 護髮油')
    fireEvent.change(countInputs()[0], { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    const row = modalRow('洗髮精')
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.change(within(row).getByLabelText('數量'), { target: { value: '3' } })
    fireEvent.click(within(modalRow('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(modalRow('護髮油')).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(countInputs().map(i => i.value)).toEqual(['5', '3'])
    expect(priceInputs().map(i => i.value)).toEqual(['300', '120'])
  })

  it('負數改 0 並提示；數量或價格清空時數量視為 1、價格視為 0；未分類商品依分類篩選不出錯', async () => {
    const UNCATEGORIZED = { ...RESTOCK_PRODUCTS[0], id: 'p-4', no: 'P20', name: '贈品梳', productCategory: null }
    const { settle } = renderCreate({
      GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: [...RESTOCK_PRODUCTS, UNCATEGORIZED] } },
    })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    expect(modalRow('贈品梳').querySelectorAll('td')[2].textContent).toBe('')
    const row = modalRow('洗髮精')
    fireEvent.change(within(row).getByLabelText('數量'), { target: { value: '-2' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.change(within(row).getByLabelText('數量'), { target: { value: '' } })
    fireEvent.change(within(row).getByLabelText('價格'), { target: { value: '' } })
    fireEvent.click(within(dialog()).getByRole('button', { name: '洗髮' }))
    expect(modalNames()).toEqual(['洗髮精'])
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(countInputs()[0]).toHaveValue(1)
    expect(priceInputs()[0]).toHaveValue(0)
  })

  it('沒有可進貨的商品：清單為空', async () => {
    const { settle } = renderCreate({ GET_PRODUCT_IN_PRODUCT_RESTOCK: { products: { data: [] } } })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    expect(modalNames()).toEqual([])
  })

  it('沒勾選任何商品就按確定：進貨列回到一列空白（已知缺口：會清掉外面已填的列，待 Jason 決定）；關閉不變更', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P02 護髮油')
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(priceInputs()[0]).toHaveValue(300)

    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    // 已知缺口（待 Jason 決定）：外面已選的護髮油被清掉
    expect(rows()).toHaveLength(1)
    expect(rows()[0]).toHaveValue('')
    pickOption('操作者', 'A01 王小美')
    expect(addButton()).toBeDisabled()
  })
})

describe('新增商品進貨：載入中與查詢失敗', () => {
  it('載入中：新增列、商品清單鈕無作用，送出鈕不出現', async () => {
    const { settle } = renderCreate(undefined, { delays: { GET_USERS_FOR_CREATE_PICKING: 800 } })
    fireEvent.click(await screen.findByRole('button', { name: '新增一列' }))
    fireEvent.click(screen.getByRole('button', { name: '從商品清單挑選' }))
    expect(rows()).toHaveLength(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('button', { name: '新增' })).toBeNull()
    await settle()
    expect(addButton()).toBeInTheDocument()
  })

  it('所有查詢失敗：頁面仍顯示，不進錯誤畫面', async () => {
    const { settle } = renderPage(<ProductRestockCreate />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('新增商品進貨')[0]).toBeInTheDocument()
  })
})
