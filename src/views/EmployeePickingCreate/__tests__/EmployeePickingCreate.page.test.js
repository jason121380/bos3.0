// 保護「新增材料自購」：選商品帶入員工自購價、數量 1、小計；改價格或數量重算小計與合計；可直接打商品名稱（非清單商品）；
// 沒選領料人、用途或有未填商品的列時不能送出；送出內容（日期時間戳、商品列〔去掉空白列與彈窗用欄位〕、領料人、用途、備註）；
// 網址帶 date 時以該日期新增（連續新增時保留）；「連續新增自購」記在瀏覽器；從商品清單挑選帶回的價格數量與清單一致、
// 關閉清單後商品選項仍只列已上架的；Enter 依序跳欄；查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端、不建立真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { CATEGORIES, USERS, byQueryText, chooseNative, clearCombo, inputsByLabel, optionTexts, pickOption } from '../../__tests__/stockKit.test'
import EmployeePickingCreate from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const PRODUCTS = [
  { id: 'p-1', no: 'P01', name: '洗髮精', employeePrice: 600, cost: 400, stockUnit: '瓶', productCategory: { id: 'cat-1', name: '洗髮' } },
  { id: 'p-2', no: 'P02', name: '護髮油', employeePrice: 250, cost: 150, stockUnit: '瓶', productCategory: { id: 'cat-2', name: '護髮' } },
  { id: 'p-3', no: null, name: '毛巾', employeePrice: 50, cost: 30, stockUnit: '條', productCategory: null },
]

const fixtures = (overrides = {}) => ({
  GET_EMPLOYEE_PICKING_PURPOSE: { getEmployeePickingPurpose: ['自用', '店用'] },
  undefined: byQueryText([['employeePrice', { products: { data: PRODUCTS } }]]),
  GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: { productCategories: CATEGORIES },
  GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
  addPicking: { addPicking: true },
  ...overrides,
})

const renderCreate = (overrides, { search = '', ...options } = {}) =>
  renderPage(<EmployeePickingCreate location={{ search }} />, {
    fixtures: fixtures(overrides),
    route: `/employee/picking/create${search}`,
    ...options,
  })

const rows = () => inputsByLabel('選擇商品')
const prices = () => inputsByLabel('自購價')
const counts = () => inputsByLabel('數量')
const field = label => inputsByLabel(label)[0]
const footer = () => screen.getByText(/^合計：/).textContent
const submitButton = () => screen.getByRole('button', { name: '新增' })

async function fillValid() {
  pickOption('選擇商品', 'P01 洗髮精')
  pickOption('領料人', 'A01 王小美')
  chooseNative(field('用途'), '自用')
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增材料自購：填單與送出', () => {
  it('選商品帶入自購價、數量 1；改價格數量重算小計與合計；未填領料人或用途不能送出', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    expect(callsOf(calls, undefined)[0].variables.input).toEqual({ keyword: '', categoryIds: [], isPublished: true })
    expect(submitButton()).toBeDisabled()
    expect(optionTexts('選擇商品')).toEqual(['P01 洗髮精', 'P02 護髮油', '無代號 毛巾'])
    pickOption('選擇商品', 'P01 洗髮精')
    expect(prices()[0]).toHaveValue(600)
    expect(counts()[0]).toHaveValue(1)
    fireEvent.change(counts()[0], { target: { value: '3' } })
    expect(screen.getByText('1800')).toBeInTheDocument()
    fireEvent.change(prices()[0], { target: { value: '550' } })
    expect(footer()).toBe('合計：1650')
    expect(submitButton()).toBeDisabled()
    pickOption('領料人', 'A01 王小美', { typed: 'A01' })
    expect(field('領料人')).toHaveValue('A01 王小美')
    expect(submitButton()).toBeDisabled()
    chooseNative(field('用途'), '自用')
    expect(submitButton()).toBeEnabled()
  })

  it('負數改為 0 並提示；直接打商品名稱（非清單商品）也能送出', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    fireEvent.change(rows()[0], { target: { value: '自備染膏' } })
    expect(rows()[0]).toHaveValue('自備染膏')
    fireEvent.change(prices()[0], { target: { value: '-10' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    fireEvent.change(prices()[0], { target: { value: '120' } })
    fireEvent.change(counts()[0], { target: { value: '-1' } })
    expect(counts()[0]).toHaveValue(0)
    fireEvent.change(counts()[0], { target: { value: '2' } })
    pickOption('領料人', ' 李助理')
    chooseNative(field('用途'), '店用')
    fireEvent.change(field('備註'), { target: { value: '客人指定' } })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'addPicking')).toHaveLength(1))
    expect(callsOf(calls, 'addPicking')[0].variables.input).toMatchObject({
      productList: [{ productName: '自備染膏', productNo: '', price: 120, count: 2, total: 240 }],
      PickerId: 'user-b',
      purpose: '店用',
      remark: '客人指定',
    })
  })

  it('送出：日期為今天、去掉空白列；成功提示並回列表', async () => {
    const { settle, calls } = renderCreate()
    await settle()
    await fillValid()
    fireEvent.click(screen.getByRole('button', { name: '新增一列' }))
    expect(rows()).toHaveLength(2)
    // 有未填商品的列：不能送出
    expect(submitButton()).toBeDisabled()
    pickOption('選擇商品', 'P02 護髮油', { index: 1 })
    expect(submitButton()).toBeEnabled()
    fireEvent.click(screen.getAllByRole('button', { name: '新增一列' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: '刪除此列' })[1])
    expect(rows()).toHaveLength(2)
    const before = Date.now()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增領料', variant: 'success' }))
    const { input } = callsOf(calls, 'addPicking')[0].variables
    expect(input.date).toBeLessThanOrEqual(Date.now())
    expect(input.date).toBeGreaterThan(before - 120000)
    expect(input).toMatchObject({ PickerId: 'user-a', purpose: '自用', remark: '' })
    expect(input.productList).toEqual([
      { productName: '洗髮精', productNo: 'P01', price: 600, cost: 400, unit: '瓶', total: 600, count: 1 },
      { productName: '護髮油', productNo: 'P02', price: 250, cost: 150, unit: '瓶', total: 250, count: 1 },
    ])
    await wait(() => expect(currentLocation()).toBe('/employee/picking'))
  })

  it('網址帶 date：以該日期新增；改日期寫回網址並送出新日期（台灣時間）', async () => {
    const day = new Date(2026, 9, 5, 9, 0).getTime()
    const { settle, calls } = renderCreate(undefined, { search: `?date=${day}` })
    await settle()
    expect(field('日期')).toHaveValue('2026/10/05')
    expect(currentLocation()).toBe(`/employee/picking/create?date=${day}`)
    fireEvent.click(field('日期'))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月3日' }))
    fireEvent.click(within(dialog).getByText('確認'))
    await wait(() => expect(field('日期')).toHaveValue('2026/10/03'))
    expect(currentLocation()).toMatch(/^\/employee\/picking\/create\?date=\d+$/)
    await fillValid()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'addPicking')).toHaveLength(1))
    const sent = new Date(callsOf(calls, 'addPicking')[0].variables.input.date)
    expect([sent.getFullYear(), sent.getMonth() + 1, sent.getDate()]).toEqual([2026, 10, 3])
  })

  it('網址帶未來日期：日期欄提示「時間有誤」；改成今天以前後提示消失', async () => {
    const future = new Date(new Date().getFullYear() + 1, 0, 10).getTime()
    const { settle } = renderCreate(undefined, { search: `?date=${future}` })
    await settle()
    expect(screen.getByText('時間有誤')).toBeInTheDocument()
    fireEvent.click(field('日期'))
    const dialog = await screen.findByRole('dialog')
    const now = new Date()
    // 回到今天所在月份並選 1 日
    for (let i = 0; i < 24 && !within(dialog).queryByRole('gridcell', { name: `${now.getFullYear()}年${now.getMonth() + 1}月1日` }); i += 1) {
      fireEvent.click(within(dialog).getByRole('button', { name: '上個月' }))
    }
    fireEvent.click(within(dialog).getByRole('gridcell', { name: `${now.getFullYear()}年${now.getMonth() + 1}月1日` }))
    fireEvent.click(within(dialog).getByText('確認'))
    await wait(() => expect(screen.queryByText('時間有誤')).toBeNull())
  })

  it('連續新增自購：勾選記在瀏覽器，送出成功後留在新增頁（不回列表）；取消勾選移除記錄', async () => {
    const { settle } = renderCreate(undefined, { search: '?date=1791993600000' })
    await settle()
    const stay = screen.getByRole('checkbox')
    fireEvent.click(stay)
    expect(JSON.parse(localStorage.getItem('stayInCreatePicking'))).toBe(true)
    await fillValid()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增領料', variant: 'success' }))
    expect(currentLocation()).not.toBe('/employee/picking')
    fireEvent.click(stay)
    expect(localStorage.getItem('stayInCreatePicking')).toBeNull()
    cleanup()

    // 已記住連續新增、網址沒有日期
    localStorage.setItem('stayInCreatePicking', true)
    openSnackbar.mockClear()
    const again = renderCreate()
    await again.settle()
    expect(screen.getByRole('checkbox')).toBeChecked()
    await fillValid()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增領料', variant: 'success' }))
    expect(currentLocation()).toBe('/employee/picking/create')
  })

  it('後端回 false 提示新增失敗；送出失敗提示錯誤；都可再送出', async () => {
    const { settle } = renderCreate({ addPicking: { addPicking: false } })
    await settle()
    await fillValid()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增領料失敗', variant: 'error' }))
    expect(submitButton()).toBeEnabled()
    cleanup()

    openSnackbar.mockClear()
    const second = renderCreate({ addPicking: new Error('已日結，不可新增') })
    await second.settle()
    await fillValid()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已日結，不可新增', variant: 'error' }))
    expect(submitButton()).toBeEnabled()
  })

  it('兩列時只改到該列：價格、數量、名稱、清除', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P01 洗髮精')
    fireEvent.click(screen.getByRole('button', { name: '新增一列' }))
    pickOption('選擇商品', 'P02 護髮油', { index: 1 })
    fireEvent.change(prices()[1], { target: { value: '200' } })
    fireEvent.change(counts()[1], { target: { value: '2' } })
    fireEvent.change(rows()[1], { target: { value: '護髮油（大）' } })
    clearCombo(rows()[0])
    expect(prices().map(i => i.value)).toEqual(['0', '200'])
    expect(counts().map(i => i.value)).toEqual(['0', '2'])
    expect(rows()[1]).toHaveValue('護髮油（大）')
    expect(footer()).toBe('合計：400')
  })

  it('清除商品：該列歸零、不能送出；清除領料人：不能送出', async () => {
    const { settle } = renderCreate()
    await settle()
    await fillValid()
    expect(submitButton()).toBeEnabled()
    clearCombo(rows()[0])
    expect(prices()[0]).toHaveValue(0)
    expect(submitButton()).toBeDisabled()
    pickOption('選擇商品', 'P02 護髮油')
    clearCombo(field('領料人'))
    expect(submitButton()).toBeDisabled()
  })

  it('Enter 依序跳欄：商品→自購價→數量→（下一列或新增一列）；領料人→用途→備註', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P01 洗髮精')
    fireEvent.focusIn(rows()[0])
    fireEvent.keyDown(rows()[0], { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(prices()[0]))
    fireEvent.focusIn(prices()[0])
    fireEvent.keyDown(prices()[0], { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(counts()[0]))
    fireEvent.focusIn(counts()[0])
    fireEvent.keyDown(counts()[0], { key: 'Enter' })
    expect(rows()).toHaveLength(2)
    await wait(() => expect(document.activeElement).toBe(rows()[1]))
    // 第一列的數量再按 Enter：移到第二列，不再新增
    fireEvent.focusIn(counts()[0])
    fireEvent.keyDown(counts()[0], { key: 'Enter' })
    expect(rows()).toHaveLength(2)
    ;[rows()[1], prices()[0], counts()[0], field('領料人')].forEach(input => fireEvent.keyDown(input, { key: 'b' }))
    // 未選商品的列按 Enter 不跳
    fireEvent.keyDown(rows()[1], { key: 'Enter' })

    fireEvent.focusIn(field('領料人'))
    fireEvent.keyDown(field('領料人'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('用途')))
    fireEvent.focusIn(field('用途'))
    fireEvent.keyDown(field('用途'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('備註')))
    fireEvent.focusIn(field('備註'))
    fireEvent.keyDown(field('用途'), { key: 'c' })
    fireEvent.wheel(prices()[0])
    fireEvent.wheel(counts()[0])
  })
})

describe('新增材料自購：從商品清單挑選', () => {
  const dialog = () => screen.getByRole('dialog')
  const modalRow = name => within(dialog()).getByText(name).closest('tr')
  const modalNames = () =>
    within(dialog())
      .getAllByRole('row')
      .slice(1)
      .map(r => r.querySelectorAll('td')[5].textContent)
  const openModal = async overrides => {
    const utils = renderCreate(overrides)
    await utils.settle()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    await screen.findByRole('dialog')
    return utils
  }

  it('依分類篩選（未分類商品不出錯）、清除；勾選並改價格數量，帶回的與清單一致；關閉後商品選項仍只查已上架的', async () => {
    const { settle, calls } = await openModal()
    expect(modalNames()).toEqual(['洗髮精', '護髮油', '毛巾'])
    expect(within(modalRow('毛巾')).getAllByRole('cell')[1].textContent).toBe('無代號')
    fireEvent.click(within(dialog()).getByRole('button', { name: '護髮' }))
    expect(modalNames()).toEqual(['護髮油'])
    const oil = modalRow('護髮油')
    fireEvent.click(within(oil).getByRole('checkbox'))
    fireEvent.change(within(oil).getByLabelText('數量'), { target: { value: '2' } })
    fireEvent.change(within(oil).getByLabelText('價格'), { target: { value: '0' } })
    fireEvent.wheel(within(oil).getByLabelText('價格'))
    fireEvent.wheel(within(oil).getByLabelText('數量'))
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除篩選' }))
    expect(within(modalRow('護髮油')).getByRole('checkbox')).toBeChecked()
    // 先改再勾選
    const shampoo = modalRow('洗髮精')
    fireEvent.change(within(shampoo).getByLabelText('價格'), { target: { value: '500' } })
    fireEvent.change(within(shampoo).getByLabelText('數量'), { target: { value: '' } })
    fireEvent.click(within(shampoo).getByRole('checkbox'))
    // 勾選後取消
    fireEvent.click(within(modalRow('毛巾')).getByRole('checkbox'))
    fireEvent.click(within(modalRow('毛巾')).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['護髮油', '洗髮精'])
    expect(prices().map(i => i.value)).toEqual(['0', '500'])
    expect(counts().map(i => i.value)).toEqual(['2', '1'])
    await settle()
    const productQueries = callsOf(calls, undefined)
    expect(productQueries[productQueries.length - 1].variables.input).toMatchObject({ isPublished: true })
  })

  it('勾選後清空數量：數量視為 1；沒有商品時清單為空', async () => {
    await openModal()
    const oil = modalRow('護髮油')
    fireEvent.click(within(oil).getByRole('checkbox'))
    fireEvent.change(within(oil).getByLabelText('數量'), { target: { value: '' } })
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(counts()[0]).toHaveValue(1)
    cleanup()
    await openModal({ undefined: byQueryText([['employeePrice', { products: { data: [] } }]]) })
    expect(modalNames()).toEqual([])
  })

  it('外面已填好的列（價格、數量、小計都大於 0）保留在前面；關閉不變更', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P02 護髮油')
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['護髮油'])
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(modalRow('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['護髮油', '洗髮精'])
  })

  it('已知缺口（待 Jason 決定）：沒勾選就按確定會清掉外面已填的列；外面價格為 0 的列（贈品）帶回時被丟掉', async () => {
    const { settle } = renderCreate()
    await settle()
    pickOption('選擇商品', 'P02 護髮油')
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual([''])

    pickOption('選擇商品', 'P02 護髮油')
    fireEvent.change(prices()[0], { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    await screen.findByRole('dialog')
    fireEvent.click(within(modalRow('洗髮精')).getByRole('checkbox'))
    fireEvent.click(within(dialog()).getAllByRole('button', { name: '確定' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(rows().map(i => i.value)).toEqual(['洗髮精'])
  })
})

describe('新增材料自購：載入中與查詢失敗', () => {
  it('載入中：新增列與清單鈕無作用、送出鈕不出現', async () => {
    const { settle } = renderCreate(undefined, { delays: { GET_USERS_FOR_CREATE_PICKING: 800 } })
    fireEvent.click(await screen.findByRole('button', { name: '新增一列' }))
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    expect(rows()).toHaveLength(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('button', { name: '新增' })).toBeNull()
    await settle()
    expect(submitButton()).toBeInTheDocument()
  })

  it('所有查詢失敗：頁面仍顯示，不進錯誤畫面；用途停用', async () => {
    const { settle } = renderPage(<EmployeePickingCreate location={{ search: '' }} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('新增材料自購')[0]).toBeInTheDocument()
    expect(field('用途')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '從商品清單選取' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
