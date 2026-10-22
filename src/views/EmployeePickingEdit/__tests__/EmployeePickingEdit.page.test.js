// 保護「編輯材料自購」：帶入原紀錄（日期以台灣時間顯示）；商品選項只列已上架的（原本選的即使下架也保留），可依代號或名稱篩選；
// 儲存送出的內容（日期時間戳、商品、單價、數量、小計＝單價×數量、用途、備註、領料人）；刪除送出這筆 id；
// 各欄位按 Enter 依序跳到下一欄（日期欄按 Enter 跳欄、不開月曆）；查詢失敗不白屏。
// GraphQL 全由 testkit 模擬，不連後端、不改真實資料。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { USERS, byQueryText, chooseNative, clearCombo, inputsByLabel, optionTexts, pickOption } from '../../__tests__/stockKit.test'
import EmployeePickingEdit from '..'

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

jest.setTimeout(30000)

const DATE = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const PICKING = {
  id: 'pk-1',
  date: DATE,
  productName: '舊款髮蠟',
  productNo: 'P09',
  price: 200,
  count: 2,
  total: 400,
  purpose: '自用',
  remark: '試用',
  Picker: { id: 'user-a', name: '王小美', designerNo: 'A01' },
}
const PRODUCTS = [
  { id: 'p-1', no: 'P01', name: '洗髮精', sellPrice: 1200, isPublished: true },
  { id: 'p-9', no: 'P09', name: '舊款髮蠟', sellPrice: 350, isPublished: false },
  { id: 'p-8', no: 'P08', name: '下架商品', sellPrice: 10, isPublished: false },
  { id: 'p-7', no: null, name: '沒有代號', sellPrice: 10, isPublished: true },
]

const renderEdit = (overrides, options) =>
  renderPage(<EmployeePickingEdit />, {
    fixtures: {
      FETCH_GET_PICKING: { picking: PICKING },
      GET_EMPLOYEE_PICKING_PURPOSE: { getEmployeePickingPurpose: ['自用', '店用'] },
      undefined: byQueryText([['isPublished', { products: { data: PRODUCTS } }]]),
      GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
      UPDATE_PICKING: { updatePicking: true },
      deletePicking: { deletePicking: true },
      ...overrides,
    },
    path: '/employee/picking/edit/:id',
    route: '/employee/picking/edit/pk-1',
    ...options,
  })

const field = label => inputsByLabel(label)[0]
const total = () => screen.getByText(/^合計：/).textContent

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('編輯材料自購', () => {
  it('帶入原紀錄：日期（台灣時間）、商品、單價、數量、領料人、用途、備註、合計', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    expect(callsOf(calls, 'FETCH_GET_PICKING')[0].variables).toEqual({ input: 'pk-1' })
    expect(field('日期')).toHaveValue('2026/10/21')
    expect(field('選擇商品')).toHaveValue('舊款髮蠟')
    expect(field('自購價')).toHaveValue(200)
    expect(field('數量')).toHaveValue(2)
    expect(field('領料人')).toHaveValue('王小美')
    expect(field('用途').selectedOptions[0].textContent).toBe('自用')
    expect(field('備註')).toHaveValue('試用')
    expect(total()).toBe('合計：400')
  })

  it('商品選項只列已上架的與原本選的；可依代號或名稱（不分大小寫）篩選；無代號的不列', async () => {
    const { settle } = renderEdit()
    await settle()
    expect(optionTexts('選擇商品', { typed: '' })).toEqual(['P01洗髮精', 'P09舊款髮蠟'])
    expect(optionTexts('選擇商品', { typed: 'p01' })).toEqual(['P01洗髮精'])
    expect(optionTexts('選擇商品', { typed: '髮蠟' })).toEqual(['P09舊款髮蠟'])
  })

  it('改商品、數量、領料人、用途、備註、日期後儲存：送出完整內容與小計，成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    // 已知缺口（待 Jason 決定）：改選商品帶入的是店販售價（sellPrice），不是員工自購價；查詢沒有自購價欄位
    pickOption('選擇商品', 'P01洗髮精', { typed: 'P01' })
    expect(field('自購價')).toHaveValue(1200)
    fireEvent.change(field('自購價'), { target: { value: '600' } })
    fireEvent.change(field('數量'), { target: { value: '3' } })
    expect(total()).toBe('合計：1,800')
    pickOption('領料人', '李助理', { typed: '李' })
    chooseNative(field('用途'), '店用')
    fireEvent.change(field('備註'), { target: { value: '店內使用' } })
    fireEvent.click(field('日期'))
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月15日' }))
    fireEvent.click(within(dialog).getByText('確認'))
    await wait(() => expect(field('日期')).toHaveValue('2026/10/15'))
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '更新領料成功', variant: 'success' }))
    const { id, input } = callsOf(calls, 'UPDATE_PICKING')[0].variables
    expect(id).toBe('pk-1')
    expect(input).toEqual({
      date: expect.any(Number),
      productName: '洗髮精',
      productNo: 'P01',
      price: 600,
      count: 3,
      purpose: '店用',
      remark: '店內使用',
      PickerId: 'user-b',
      total: 1800,
    })
    const sent = new Date(input.date)
    expect([sent.getFullYear(), sent.getMonth() + 1, sent.getDate()]).toEqual([2026, 10, 15])
    await wait(() => expect(currentLocation()).toBe('/employee/picking'))
  })

  it('清除商品與領料人：商品、單價清空，領料人送空字串；單價清空顯示空白；儲存失敗提示錯誤', async () => {
    const { settle, calls } = renderEdit({ UPDATE_PICKING: new Error('已日結，不可修改') })
    await settle()
    clearCombo(field('選擇商品'))
    expect(field('自購價')).toHaveValue(null)
    clearCombo(field('領料人'))
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已日結，不可修改', variant: 'error' }))
    expect(callsOf(calls, 'UPDATE_PICKING')[0].variables.input).toMatchObject({
      productName: '',
      productNo: '',
      price: 0,
      PickerId: '',
    })
    fireEvent.change(field('備註'), { target: { value: '' } })
    expect(field('備註')).toHaveValue('')
  })

  it('刪除：送出這筆 id，成功回列表', async () => {
    const { settle, calls } = renderEdit()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除 員工領料/自購 成功', variant: 'success' }))
    expect(callsOf(calls, 'deletePicking')[0].variables).toEqual({ id: 'pk-1' })
    await wait(() => expect(currentLocation()).toBe('/employee/picking'))
  })

  it('Enter 依序跳欄：日期（不開月曆）→商品→自購價→數量→領料人→用途→備註', async () => {
    const { settle } = renderEdit()
    await settle()
    fireEvent.keyDown(field('日期'), { key: 'Enter' })
    expect(screen.queryByRole('dialog')).toBeNull()
    await wait(() => expect(document.activeElement).toBe(field('選擇商品')))
    fireEvent.keyDown(field('選擇商品'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('自購價')))
    fireEvent.keyDown(field('自購價'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('數量')))
    fireEvent.keyDown(field('數量'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('領料人')))
    fireEvent.keyDown(field('領料人'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('用途')))
    fireEvent.keyDown(field('用途'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(field('備註')))
    // 其他按鍵不跳欄
    ;['日期', '選擇商品', '自購價', '數量', '領料人', '用途'].forEach(label => fireEvent.keyDown(field(label), { key: 'a' }))
    expect(document.activeElement).toBe(field('備註'))
    // 欄位取得焦點時記錄目前位置；滾輪讓數字欄失焦
    fireEvent.focusIn(field('選擇商品'))
    fireEvent.focusIn(field('自購價'))
    fireEvent.focusIn(field('數量'))
    fireEvent.focusIn(field('領料人'))
    fireEvent.wheel(field('自購價'))
    fireEvent.wheel(field('數量'))
  })

  it('查詢失敗：不進錯誤畫面；沒有用途設定時用途停用', async () => {
    const { settle } = renderPage(<EmployeePickingEdit />, {
      fallback: 'error',
      path: '/employee/picking/edit/:id',
      route: '/employee/picking/edit/pk-1',
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('編輯材料自購')[0]).toBeInTheDocument()
    expect(field('用途')).toBeDisabled()
  })
})
