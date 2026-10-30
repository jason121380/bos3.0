// 保護「編輯商品／複製商品」：帶入原商品（含「打帳單是否能更改預設價格」以商品自己的設定 isLockedOriginalValue 帶入、廠商、抽成）；
// 儲存送出的完整商品內容（售價同步到各顧客分類售價、不可販售時售價為 0 且不送抽成方式）；
// 自購價低於成本時依店家「不限制自購價」設定擋下；名稱、類別、單位必填；儲存並上一筆／下一筆依商品列表順序換頁；
// 複製商品：代號與名稱加「的副本」，以「新增」送出（帶目前店家、不帶原商品 id）；查詢失敗不白屏。
// GraphQL 全由 testkit 模擬，不連後端、不建立真實商品。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, MERCHANT_ID, PAGE_CRASH_TEXT, typeLikeBrowser } from '../../../__tests__/testkit.test'
import { CATEGORIES, VENDORS, byQueryText, chooseNative, clearCombo, inputsByLabel, optionTexts, pickOption } from '../../__tests__/stockKit.test'
import ProductEdit from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const PRODUCT = {
  id: 'p-1',
  no: 'P01',
  name: '洗髮精',
  isAvailableForSale: true,
  isPublished: true,
  productCategory: { id: 'cat-1', name: '洗髮' },
  cost: 120,
  sellPrice: 1200,
  employeePrice: 600,
  stockUnit: '瓶',
  safeHigh: 50,
  safeLow: 5,
  commissionWay: 'byPrice',
  commission: 10,
  customerSellSetting: [
    { category: '一般', price: 1200 },
    { category: 'VIP', price: 1100 },
  ],
  isLocked: true,
  isLockedOriginalValue: 'TRUE',
  merchantVendor: { merchantVendorUUId: 'mv-1' },
}

const LIST = [{ id: 'p-0' }, { id: 'p-1' }, { id: 'p-2' }]

const fixtures = (overrides = {}) => ({
  undefined: byQueryText([['totalCount', { products: { data: LIST, totalCount: 3 } }]]),
  FETCH_PRODUCT: { product: PRODUCT },
  GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
  GET_IS_UN_LIM_PROD_EMP_PRICE: { getParameterAboutSettingFunction: { isUnlimProdEmpPrice: false } },
  PRODUCT_CATEGORIES: { productCategories: CATEGORIES },
  SET_PRODUCT: { updateProduct: true },
  CREATE_PRODUCT: { createProduct: true },
  ...overrides,
})

const renderEdit = (overrides, { id = 'p-1', ...options } = {}) =>
  renderPage(<ProductEdit match={{ params: { id } }} />, {
    fixtures: fixtures(overrides),
    route: `/product/edit/${id}`,
    ...options,
  })

const field = label => inputsByLabel(label)[0]
const saveButton = () => screen.getByRole('button', { name: '儲存' })

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
  window.history.pushState({}, '', '/product/edit/p-1')
})
afterEach(cleanup)

describe('編輯商品', () => {
  it('帶入原商品：代號、名稱、類別、廠商、售價成本自購價、單位、鎖價設定（商品自己的設定）、抽成', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(callsOf(calls, 'FETCH_PRODUCT')[0].variables).toEqual({ productId: 'p-1' })
    expect(screen.getAllByText('編輯商品')[0]).toBeInTheDocument()
    expect(field('代號')).toHaveValue('P01')
    expect(field('名稱')).toHaveValue('洗髮精')
    expect(field('商品類別').selectedOptions[0].textContent).toBe('C1 洗髮')
    expect(field('選擇廠商')).toHaveValue('V01 大和')
    expect(field('店販售價')).toHaveValue(1200)
    expect(field('成本價格')).toHaveValue(120)
    expect(field('員工自購價格')).toHaveValue(600)
    expect(field('庫存單位').selectedOptions[0].textContent).toBe('瓶')
    expect(field('打帳單是否能更改預設價格').selectedOptions[0].textContent).toBe('不可更改')
    expect(field('抽成方式').selectedOptions[0].textContent).toBe('售價(%)')
    expect(field('抽成數字%')).toHaveValue(10)
  })

  it('改售價同步到各顧客分類售價；儲存送出完整商品內容，成功回商品列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.change(field('名稱'), { target: { value: '洗髮精 1000ml' } })
    fireEvent.change(field('代號'), { target: { value: 'P01A' } })
    fireEvent.change(field('店販售價'), { target: { value: '1500' } })
    fireEvent.change(field('成本價格'), { target: { value: '130' } })
    fireEvent.change(field('員工自購價格'), { target: { value: '700' } })
    chooseNative(field('商品類別'), 'C2 護髮')
    chooseNative(field('庫存單位'), '組')
    chooseNative(field('打帳單是否能更改預設價格'), '依系統參數設定')
    chooseNative(field('抽成方式'), '固定金額')
    expect(field('抽成數字')).toBeTruthy()
    fireEvent.change(field('抽成數字'), { target: { value: '50' } })
    pickOption('選擇廠商', '(無代號) 美髮材料行', { typed: '材料' })
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功儲存商品變更' }))
    expect(callsOf(calls, 'SET_PRODUCT')[0].variables.input).toEqual({
      itemId: 'p-1',
      no: 'P01A',
      name: '洗髮精 1000ml',
      cost: 130,
      sellPrice: 1500,
      employeePrice: 700,
      safeLow: 5,
      safeHigh: 50,
      stockUnit: '組',
      commissionWay: 'fixed',
      commission: 50,
      customerSellSetting: [
        { category: '一般', price: 1500 },
        { category: 'VIP', price: 1500 },
      ],
      ProductCategoryId: 'cat-2',
      isAvailableForSale: true,
      isPublished: true,
      isLocked: 'UNSET',
      VendorId: 'mv-2',
    })
    await wait(() => expect(currentLocation()).toBe('/products'))
  })

  it('改為不可販售：售價歸零、隱藏抽成；改為不上架；清除廠商送出 null', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    const [forSale, published] = screen.getAllByRole('switch')
    fireEvent.click(forSale)
    expect(screen.queryByLabelText('店販售價')).toBeNull()
    expect(screen.queryByText('抽成')).toBeNull()
    fireEvent.click(published)
    clearCombo(field('選擇廠商'))
    fireEvent.click(saveButton())
    await wait(() => expect(callsOf(calls, 'SET_PRODUCT')).toHaveLength(1))
    expect(callsOf(calls, 'SET_PRODUCT')[0].variables.input).toMatchObject({
      isAvailableForSale: false,
      isPublished: false,
      sellPrice: 0,
      commission: 0,
      VendorId: null,
    })
  })

  it('自購價低於成本：店家未開放時擋下並提示，不送出；開放時可儲存', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.change(field('員工自購價格'), { target: { value: '100' } })
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '自購價不可低於成本價' }))
    expect(callsOf(calls, 'SET_PRODUCT')).toHaveLength(0)
    expect(saveButton()).toBeEnabled()
    cleanup()

    const second = renderEdit({ GET_IS_UN_LIM_PROD_EMP_PRICE: { getParameterAboutSettingFunction: { isUnlimProdEmpPrice: true } } })
    await second.settle()
    fireEvent.change(field('員工自購價格'), { target: { value: '100' } })
    fireEvent.click(saveButton())
    await wait(() => expect(callsOf(second.calls, 'SET_PRODUCT')).toHaveLength(1))
    expect(callsOf(second.calls, 'SET_PRODUCT')[0].variables.input.employeePrice).toBe(100)
  })

  it('名稱、類別、單位任一空白：儲存鈕停用', async () => {
    const { settle } = renderEdit()
    await settle()
    expect(screen.queryByText(/^尚缺：/)).toBeNull()
    fireEvent.change(field('名稱'), { target: { value: '' } })
    expect(saveButton()).toBeDisabled()
    // 停用時說出缺什麼（STYLE.md §6），只列目前真的缺的欄位
    expect(screen.getByText('尚缺：名稱')).toHaveAttribute('role', 'status')
    // 名稱的 onChange 在 produce updater 裡才讀 event.target，要用 typeLikeBrowser 才會真的填回（CLAUDE.md 踩雷）
    typeLikeBrowser(field('名稱'), '洗髮精')
    chooseNative(field('商品類別'), 'None')
    expect(saveButton()).toBeDisabled()
    expect(screen.getByText('尚缺：商品類別')).toBeInTheDocument()
    chooseNative(field('商品類別'), 'C1 洗髮')
    chooseNative(field('庫存單位'), 'None')
    expect(saveButton()).toBeDisabled()
    expect(screen.getByText('尚缺：庫存單位')).toBeInTheDocument()
  })

  it('儲存並上一筆／下一筆：依商品列表順序換到前後一筆；第一筆不能上一筆、最後一筆不能下一筆', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '儲存並下一筆' }))
    await wait(() => expect(currentLocation()).toBe('/product/edit/p-2'))
    expect(callsOf(calls, 'SET_PRODUCT')).toHaveLength(1)
    cleanup()

    const prev = renderEdit()
    await prev.settle()
    fireEvent.click(screen.getByRole('button', { name: '儲存並上一筆' }))
    await wait(() => expect(currentLocation()).toBe('/product/edit/p-0'))
    cleanup()

    const first = renderEdit({ FETCH_PRODUCT: { product: { ...PRODUCT, id: 'p-0' } } }, { id: 'p-0' })
    await first.settle()
    expect(screen.getByRole('button', { name: '儲存並上一筆' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '儲存並下一筆' })).toBeEnabled()
    cleanup()

    const last = renderEdit({ FETCH_PRODUCT: { product: { ...PRODUCT, id: 'p-2' } } }, { id: 'p-2' })
    await last.settle()
    expect(screen.getByRole('button', { name: '儲存並下一筆' })).toBeDisabled()
  })

  it('儲存失敗：提示錯誤，按鈕恢復可再儲存', async () => {
    const { settle } = renderEdit({ SET_PRODUCT: new Error('代號重複') })
    await settle()
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(saveButton()).toBeEnabled()
  })

  it('廠商選項顯示代號（無代號時標示）與暱稱，可依代號、名稱、暱稱篩選', async () => {
    const { settle } = renderEdit()
    await settle()
    expect(optionTexts('選擇廠商', { typed: '' })).toEqual(['V01 大和', '(無代號) 美髮材料行'])
    expect(optionTexts('選擇廠商', { typed: 'V01' })).toEqual(['V01 大和'])
    expect(optionTexts('選擇廠商', { typed: '大和' })).toEqual(['V01 大和'])
  })

  it('不可販售的商品：售價帶 0、沒有抽成區塊，抽成方式不送出；無代號帶空白；滾輪不改數字', async () => {
    const { settle, calls } = renderEdit({
      FETCH_PRODUCT: {
        product: { ...PRODUCT, no: null, isAvailableForSale: false, merchantVendor: null, isLockedOriginalValue: 'FALSE' },
      },
    })
    await settle()
    expect(field('代號')).toHaveValue('')
    expect(screen.queryByText('抽成方式')).toBeNull()
    expect(field('打帳單是否能更改預設價格').selectedOptions[0].textContent).toBe('可更改')
    fireEvent.wheel(field('成本價格'))
    fireEvent.wheel(field('員工自購價格'))
    fireEvent.click(saveButton())
    await wait(() => expect(callsOf(calls, 'SET_PRODUCT')).toHaveLength(1))
    const { input } = callsOf(calls, 'SET_PRODUCT')[0].variables
    expect(input.sellPrice).toBe(0)
    expect(input).not.toHaveProperty('commissionWay')
    expect(input.VendorId).toBeNull()
    // 改回可販售：售價、抽成歸零，出現抽成區塊
    fireEvent.click(screen.getAllByRole('switch')[0])
    expect(field('店販售價')).toHaveValue(0)
    fireEvent.wheel(field('店販售價'))
    fireEvent.wheel(field('抽成數字'))
  })
})

describe('複製商品', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/product/duplicate/p-1')
  })

  it('代號、名稱加「的副本」；以新增送出（目前店家、不帶原商品 id），成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(screen.getAllByText('新增商品')[0]).toBeInTheDocument()
    expect(field('代號')).toHaveValue('P01的副本')
    expect(field('名稱')).toHaveValue('洗髮精的副本')
    expect(screen.queryByRole('button', { name: '儲存並下一筆' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功新增商品' }))
    const { input } = callsOf(calls, 'CREATE_PRODUCT')[0].variables
    expect(input).not.toHaveProperty('itemId')
    expect(input).toMatchObject({
      OfficialBrandMerchantId: MERCHANT_ID,
      no: 'P01的副本',
      name: '洗髮精的副本',
      ProductCategoryId: 'cat-1',
      sellPrice: 1200,
      isLocked: 'TRUE',
      VendorId: 'mv-1',
    })
    expect(callsOf(calls, 'SET_PRODUCT')).toHaveLength(0)
    await wait(() => expect(currentLocation()).toBe('/products'))
  })

  it('自購價低於成本擋下；新增失敗提示錯誤、可再送出', async () => {
    const { settle, calls } = renderEdit({ CREATE_PRODUCT: new Error('代號重複') })
    await settle()
    fireEvent.change(field('員工自購價格'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '自購價不可低於成本價' }))
    expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(0)
    fireEvent.change(field('員工自購價格'), { target: { value: '600' } })
    fireEvent.click(screen.getByRole('button', { name: '新增' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled()
  })
})

describe('查詢失敗', () => {
  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('所有查詢失敗：顯示無法載入資料與重新查詢，不進錯誤畫面', async () => {
    const { settle } = renderPage(<ProductEdit match={{ params: { id: 'p-1' } }} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  })
})
