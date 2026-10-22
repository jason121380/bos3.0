// 保護「收支科目設定」：
// - 載入後只帶入「使用中」的科目，依收入（REVENUE）／支出分到兩區；收付方式逐筆帶入；沒有資料時各區留一列空白
// - 新增列、刪除列、修改代號／名稱／收付方式後儲存：送出 setAccountingSubjects({ revenue, expenditure }) 與
//   setAccountingType(typeList)，typeList 去掉空白的收付方式；儲存後提示並停留在本頁網址
// - 切換分頁只切換顯示，三區保持掛載、編輯中的內容不會因切換而消失
// - 儲存失敗時不整頁壞（錯誤只記在 console）；科目或收付方式查詢失敗時停用儲存並提示
// GraphQL 全由 testkit 的模擬 link 回應，不改真實設定。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AccountingSetting from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SUBJECTS = [
  { id: 's1', number: 'R01', name: '技術收入', inoutType: 'REVENUE', isUsing: true },
  { id: 's2', number: 'E01', name: '房租', inoutType: 'EXPENDITURE', isUsing: true },
  { id: 's3', number: 'E02', name: '停用的科目', inoutType: 'EXPENDITURE', isUsing: false },
  { id: 's4', number: 'R02', name: '停用的收入', inoutType: 'REVENUE', isUsing: false },
]

const setup = (fixtures = {}) =>
  renderPage(<AccountingSetting />, {
    fixtures: {
      GET_ACCOUNTING_TYPE: { getAccountingType: ['現金', '匯款'] },
      GET_ACCOUNTING_SUBJECTS: { accountingSubjects: SUBJECTS },
      SET_ACCOUNTING_SUBJECTS: { setAccountingSubjects: true },
      SET_ACCOUNTING_TYPE: { setAccountingType: true },
      ...fixtures,
    },
    route: '/accountingSetting',
  })

let logSpy
beforeEach(() => {
  loginAs()
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  logSpy.mockRestore()
})

const byId = id => document.getElementById(id)
// 每列的兩個圖示：[0] 刪除、[1] 新增
const rowIcons = inputId => byId(inputId).closest('.items-end').querySelectorAll('svg')
const tab = name => screen.getByRole('tab', { name })
const switchTab = name => fireEvent.mouseDown(tab(name), { button: 0 })

describe('收支科目設定', () => {
  it('只帶入使用中的科目並依收入／支出分區；收付方式逐筆帶入', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(byId('revenueNumber-0')).toHaveValue('R01'))
    expect(byId('revenueName-0')).toHaveValue('技術收入')
    expect(byId('revenueNumber-1')).toBeNull()
    expect(byId('expenditureNumber-0')).toHaveValue('E01')
    expect(byId('expenditureName-0')).toHaveValue('房租')
    expect(byId('expenditureNumber-1')).toBeNull()
    expect(byId('accountingTypeName-0')).toHaveValue('現金')
    expect(byId('accountingTypeName-1')).toHaveValue('匯款')
  })

  it('新增、修改、刪除各區的列後儲存，送出的科目與收付方式正確（空白收付方式不送出）', async () => {
    const { calls, settle } = setup()
    await settle()
    await wait(() => expect(byId('revenueNumber-0')).toHaveValue('R01'))

    // 收入：新增一列並填入
    fireEvent.click(rowIcons('revenueNumber-0')[1])
    fireEvent.change(byId('revenueNumber-1'), { target: { value: 'R03' } })
    fireEvent.change(byId('revenueName-1'), { target: { value: '商品收入' } })
    fireEvent.change(byId('revenueName-0'), { target: { value: '技術服務收入' } })

    // 支出：切到支出分頁，新增兩列、刪掉原本的第一列
    switchTab('支出科目設定')
    expect(tab('支出科目設定').getAttribute('aria-selected')).toBe('true')
    fireEvent.click(rowIcons('expenditureNumber-0')[1])
    fireEvent.click(rowIcons('expenditureNumber-0')[1])
    fireEvent.change(byId('expenditureNumber-1'), { target: { value: 'E09' } })
    fireEvent.change(byId('expenditureName-1'), { target: { value: '水電' } })
    fireEvent.change(byId('expenditureNumber-0'), { target: { value: 'E00' } })
    fireEvent.click(rowIcons('expenditureNumber-0')[0])
    expect(byId('expenditureNumber-0')).toHaveValue('E09')

    // 收付方式：新增一列不填（空白不送）、改第一筆、刪第二筆
    switchTab('收付方式設定')
    fireEvent.click(rowIcons('accountingTypeName-0')[1])
    fireEvent.change(byId('accountingTypeName-0'), { target: { value: '現金收款' } })
    fireEvent.click(rowIcons('accountingTypeName-1')[0])
    expect(byId('accountingTypeName-1')).toHaveValue('')

    // 切回收入分頁：先前的編輯仍在（三區保持掛載）
    switchTab('收入科目設定')
    expect(byId('revenueName-1')).toHaveValue('商品收入')

    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')).toHaveLength(1))
    expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')[0].variables.input).toEqual({
      revenue: [
        { number: 'R01', name: '技術服務收入' },
        { number: 'R03', name: '商品收入' },
      ],
      expenditure: [
        { number: 'E09', name: '水電' },
        { number: '', name: '' },
      ],
    })
    await wait(() => expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')).toHaveLength(1))
    expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')[0].variables).toEqual({ typeList: ['現金收款'] })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功!', variant: 'success' })
    expect(currentLocation()).toBe('/accountingSetting')
    // 儲存成功後重抓科目與收付方式
    await wait(() => expect(callsOf(calls, 'GET_ACCOUNTING_SUBJECTS').length).toBeGreaterThan(1))
    await wait(() => expect(callsOf(calls, 'GET_ACCOUNTING_TYPE').length).toBeGreaterThan(1))
  })

  it('刪除收入的唯一一列後區塊為空，可再從其他區儲存', async () => {
    const { calls, settle } = setup()
    await settle()
    await wait(() => expect(byId('revenueNumber-0')).toHaveValue('R01'))
    fireEvent.click(rowIcons('revenueNumber-0')[0])
    expect(byId('revenueNumber-0')).toBeNull()
    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')).toHaveLength(1))
    expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')[0].variables.input.revenue).toEqual([])
  })

  it('沒有任何科目與收付方式時，三區各留一列空白；儲存送出空白科目、空的收付方式清單', async () => {
    const { calls, settle } = setup({
      GET_ACCOUNTING_TYPE: { getAccountingType: [] },
      GET_ACCOUNTING_SUBJECTS: { accountingSubjects: [] },
    })
    await settle()
    expect(byId('revenueNumber-0')).toHaveValue('')
    expect(byId('expenditureNumber-0')).toHaveValue('')
    expect(byId('accountingTypeName-0')).toHaveValue('')
    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')).toHaveLength(1))
    expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')[0].variables).toEqual({ typeList: [] })
    expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')[0].variables.input).toEqual({
      revenue: [{ number: '', name: '' }],
      expenditure: [{ number: '', name: '' }],
    })
  })

  it('儲存失敗時不整頁壞，錯誤記在 console', async () => {
    const { settle } = setup({
      SET_ACCOUNTING_SUBJECTS: new Error('科目儲存失敗'),
      SET_ACCOUNTING_TYPE: new Error('收付方式儲存失敗'),
    })
    await settle()
    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('科目儲存失敗')))
    await wait(() => expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('收付方式儲存失敗')))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // Jason 2026/10/22「照建議」：任一查詢失敗時停用「儲存」並提示，避免把讀不到的科目／收付方式存成空白（覆蓋後端既有設定）。
  const saveButton = () => screen.getByText('儲存').closest('button')
  const LOAD_FAILED = '收支科目或收付方式讀取失敗，請重新整理後再設定'

  it('科目查詢失敗時收入、支出各留一列空白；停用儲存並提示', async () => {
    const { settle, calls } = setup({ GET_ACCOUNTING_SUBJECTS: new Error('查詢失敗') })
    await settle()
    expect(byId('revenueNumber-0')).toHaveValue('')
    expect(byId('expenditureNumber-0')).toHaveValue('')
    expect(byId('accountingTypeName-0')).toHaveValue('現金')
    expect(saveButton()).toBeDisabled()
    expect(screen.getByText(LOAD_FAILED)).toBeInTheDocument()
    fireEvent.click(saveButton())
    expect(callsOf(calls, 'SET_ACCOUNTING_SUBJECTS')).toHaveLength(0)
    expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')).toHaveLength(0)
  })

  it('收付方式查詢失敗時留一列空白（同科目查詢失敗），不整頁錯誤；停用儲存並提示', async () => {
    const { settle, calls } = setup({ GET_ACCOUNTING_TYPE: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(byId('accountingTypeName-0')).toHaveValue('')
    expect(byId('revenueNumber-0')).not.toHaveValue('')
    expect(saveButton()).toBeDisabled()
    expect(screen.getByText(LOAD_FAILED)).toBeInTheDocument()
    fireEvent.click(saveButton())
    expect(callsOf(calls, 'SET_ACCOUNTING_TYPE')).toHaveLength(0)
  })

  it('兩個查詢都成功時可儲存、不顯示讀取失敗提示', async () => {
    const { settle } = setup()
    await settle()
    expect(saveButton()).toBeEnabled()
    expect(screen.queryByText(LOAD_FAILED)).toBeNull()
  })
})
