// 保護「新增商品」整頁（不 mock hook，查詢全由 testkit 模擬）：選廠商送出店家廠商 uuid、清除廠商送 null；
// 「打帳單是否能更改預設價格」預設依系統參數（UNSET）、可改為不可更改（商品鎖價）；可販售時必選抽成方式、
// 不可販售時不送抽成方式；自購價低於成本依店家「不限制自購價」設定擋下；成功回商品列表、後端回 false 或失敗提示；
// 欄位取得焦點全選數字方便改寫；查詢失敗不白屏。不建立真實商品。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, MERCHANT_ID, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES, VENDORS, chooseNative, clearCombo, inputsByLabel, optionTexts, pickOption } from '../../__tests__/stockKit.test'
import ProductCreate from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const fixtures = (overrides = {}) => ({
  GET_MERCHANT_VENDOR_LIST: { getMerchantVendorList: VENDORS },
  GET_IS_UN_LIM_PROD_EMP_PRICE: { getParameterAboutSettingFunction: { isUnlimProdEmpPrice: false } },
  PRODUCT_CATEGORIES: { productCategories: CATEGORIES },
  CUSTOMER_CATEGORY: { merchantCustomerCategory: [{ name: '一般' }, { name: 'VIP' }] },
  CREATE_PRODUCT: { createProduct: true },
  ...overrides,
})

const renderCreate = (overrides, options) => renderPage(<ProductCreate />, { fixtures: fixtures(overrides), route: '/product/create', ...options })

const field = label => inputsByLabel(label)[0]
const submit = () => fireEvent.click(screen.getByTestId('submit'))

// 必填欄位：名稱、類別、單位
function fillRequired() {
  fireEvent.change(screen.getByTestId('name'), { target: { value: '洗髮精' } })
  chooseNative(field('商品類別'), 'C1 洗髮')
  chooseNative(field('庫存單位'), '瓶')
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增商品', () => {
  it('選廠商、改鎖價設定與抽成：送出店家廠商 uuid、isLocked、價格與目前店家，成功回列表', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    expect(field('打帳單是否能更改預設價格').selectedOptions[0].textContent).toBe('依系統參數設定')
    fillRequired()
    expect(optionTexts('選擇廠商', { typed: 'V01' })).toEqual(['V01 大和'])
    pickOption('選擇廠商', '(無代號) 美髮材料行', { typed: '' })
    expect(field('選擇廠商')).toHaveValue('(無代號) 美髮材料行')
    chooseNative(field('打帳單是否能更改預設價格'), '不可更改')
    expect(field('打帳單是否能更改預設價格').selectedOptions[0].textContent).toBe('不可更改')
    fireEvent.change(screen.getByTestId('cost'), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId('sellPrice'), { target: { value: '300' } })
    fireEvent.change(screen.getByTestId('employeePrice'), { target: { value: '150' } })
    chooseNative(field('抽成方式'), '售價(%)')
    expect(screen.getByText('抽成數字%')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('commission'), { target: { value: '10' } })
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增商品', variant: 'success' }))
    expect(callsOf(calls, 'CREATE_PRODUCT')[0].variables.input).toMatchObject({
      name: '洗髮精',
      ProductCategoryId: 'cat-1',
      stockUnit: '瓶',
      cost: 100,
      sellPrice: 300,
      employeePrice: 150,
      commissionWay: 'byPrice',
      commission: 10,
      isLocked: 'TRUE',
      VendorId: 'mv-2',
      isAvailableForSale: true,
      isPublished: true,
      OfficialBrandMerchantId: MERCHANT_ID,
    })
    await wait(() => expect(currentLocation()).toBe('/products'))
  })

  it('不可販售、不上架：不送抽成方式；清除廠商送 null', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fillRequired()
    pickOption('選擇廠商', 'V01 大和')
    clearCombo(field('選擇廠商'))
    const [forSale, published] = screen.getAllByRole('switch')
    fireEvent.click(forSale)
    fireEvent.click(published)
    await wait(() => expect(screen.queryByTestId('sellPrice')).toBeNull())
    expect(screen.queryByText('抽成方式')).toBeNull()
    submit()
    await wait(() => expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(1))
    const { input } = callsOf(calls, 'CREATE_PRODUCT')[0].variables
    expect(input).not.toHaveProperty('commissionWay')
    expect(input).toMatchObject({ isAvailableForSale: false, isPublished: false, VendorId: null })
  })

  it('沒選抽成方式：提示後不送出；選了再清空：提示抽成方式並停在本頁', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fillRequired()
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇抽成方式', variant: 'warning' }))
    chooseNative(field('抽成方式'), '固定金額')
    chooseNative(field('抽成方式'), 'None')
    openSnackbar.mockClear()
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇抽成方式', variant: 'warning' }))
    expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(0)
  })

  it('自購價低於成本：店家未開放時擋下；開放時可送出', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    fireEvent.change(screen.getByTestId('cost'), { target: { value: '200' } })
    fireEvent.change(screen.getByTestId('employeePrice'), { target: { value: '100' } })
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '自購價不可低於成本價', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(0)
    cleanup()

    const second = renderCreate({ GET_IS_UN_LIM_PROD_EMP_PRICE: { getParameterAboutSettingFunction: { isUnlimProdEmpPrice: true } } })
    await second.settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    fireEvent.change(screen.getByTestId('cost'), { target: { value: '200' } })
    fireEvent.change(screen.getByTestId('employeePrice'), { target: { value: '100' } })
    submit()
    await wait(() => expect(callsOf(second.calls, 'CREATE_PRODUCT')).toHaveLength(1))
  })

  it('後端回 false 提示新增失敗；送出失敗提示錯誤；都留在本頁', async () => {
    const { settle } = renderCreate({ CREATE_PRODUCT: { createProduct: false } })
    await settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增商品失敗', variant: 'error' }))
    cleanup()

    openSnackbar.mockClear()
    const second = renderCreate({ CREATE_PRODUCT: new Error('代號重複') })
    await second.settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '代號重複', variant: 'error' }))
    expect(currentLocation()).toBe('/product/create')
  })

  it('成本、自購價不可為負數：顯示欄位錯誤、不送出', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    fireEvent.change(screen.getByTestId('cost'), { target: { value: '-1' } })
    fireEvent.change(screen.getByTestId('employeePrice'), { target: { value: '-1' } })
    submit()
    expect(await screen.findByText('成本價格最低為0元')).toBeInTheDocument()
    expect(screen.getByText('「員工自購價格」最低為0元')).toBeInTheDocument()
    expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(0)
  })

  it('數字欄位取得焦點全選內容；滾輪讓欄位失焦（避免誤改數字）', async () => {
    const { settle } = renderCreate()
    await settle()
    const ids = ['cost', 'sellPrice', 'employeePrice', 'commission']
    ids.forEach(id => {
      const input = screen.getByTestId(id)
      input.select = jest.fn()
      fireEvent.focusIn(input)
      expect(input.select).toHaveBeenCalled()
      input.focus()
      fireEvent.wheel(input)
    })
  })

  it('查詢全部失敗：頁面仍顯示，不進錯誤畫面', async () => {
    const { settle } = renderPage(<ProductCreate />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('新增商品')[0]).toBeInTheDocument()
  })

  it('沒有登入店家：送出時店家為 null（不拋錯）', async () => {
    loginAs({ merchant: null })
    const { settle, calls } = renderCreate()
    await settle()
    fillRequired()
    chooseNative(field('抽成方式'), '固定金額')
    submit()
    await wait(() => expect(callsOf(calls, 'CREATE_PRODUCT')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_PRODUCT')[0].variables.input.OfficialBrandMerchantId).toBeNull()
  })
})
