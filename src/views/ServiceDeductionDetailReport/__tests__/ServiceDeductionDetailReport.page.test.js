// 保護「服務扣項明細表」：
// - 進頁查「現在」到本月底（目前行為）、設計師／服務／抽成類別不限；搜尋列改日期、設計師，服務下拉、抽成類別下拉各自送出對應條件
//   （設計師清空送空陣列、服務清除送空陣列、抽成類別選「全部」送空陣列）
// - 每筆一列：日期（台灣時間）、帳單編號、服務歸屬空白顯示「預設」；長數字（超過 7 個字元）四捨五入到小數 2 位，不可把小數變成 .00；
//   合計列＝各列加總
// - 匯出 CSV：每筆一列＋合計列，欄位與表格一致
// - 沒有資料顯示「無資料」；後端回 null 時提示「請選擇日期與設計師」；報表、抽成類別查詢失敗時不整頁錯誤
// 報表搜尋列（MerchantSearchBar）與服務下拉換成替身；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { chooseNative } from '../../__tests__/stockKit.test'
import { csvRows, filterWith, lastSearchBar, rowCells, searchBars } from '../../__tests__/staffReportKit.test'
import ServiceDeductionDetailReport from '..'

jest.mock('components/MerchantSearchBar/index', () => require('../../__tests__/staffReportKit.test').searchBarModule)
jest.mock('components/ServicesIncludesTicketsAutoComplete', () => require('../../__tests__/staffReportKit.test').servicePickerModule)
jest.mock('react-csv', () => require('../../__tests__/staffReportKit.test').csvModule)
jest.setTimeout(20000)

const DAY = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const record = (extra = {}) => ({
  date: DAY,
  orderNo: 'A001',
  type: '服務',
  item: '剪髮',
  designerName: '小美',
  cash: 1000,
  handlingFeeOnSales: 10,
  deductionOnSales: 20,
  helperPriceOnSales: 30,
  truthPerformance: 940,
  specialRake_truthPerformance: 0,
  specialRake_specialRake: 0,
  category_categoryName: '',
  category_normalTruthPerformance: 940,
  category_normalRake: 376,
  category_designateTruthPerformance: 0,
  category_designateRake: 0,
  category_nonDesignateTruthPerformance: 0,
  category_nonDesignateRake: 0,
  percentage: 40,
  serviceRake: 376,
  handlingFeeOnSalary: 0,
  deductionOnSalary: 0,
  helperPriceOnSalary: 0,
  summary: 376,
  ...extra,
})
const RECORDS = [
  record(),
  record({ orderNo: 'A002', category_categoryName: '染髮', cash: 12345.678, truthPerformance: 0.1 + 0.2, handlingFeeOnSalary: 0.0012345, summary: 1234567.891 }),
]
const ATTRIBUTIONS = [
  { label: '依服務歸屬', value: 'CATEGORY' },
  { label: '特殊抽成', value: 'SPECIAL' },
]
const setup = (extra = {}) =>
  renderPage(<ServiceDeductionDetailReport />, {
    route: '/service-deduction-detail-report',
    fixtures: {
      FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: { getUserServiceDeductionDetialMultiple: RECORDS },
      USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS },
      ...extra,
    },
  })
const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE')
  return list[list.length - 1].variables.input
}

beforeEach(() => {
  loginAs()
  searchBars.length = 0
})
afterEach(cleanup)

describe('服務扣項明細表：查詢條件', () => {
  it('進頁查現在到本月底、條件不限；搜尋列只顯示日期、篩選內的搜尋列只顯示設計師且不讀網址日期', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const input = callsOf(calls, 'FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE')[0].variables.input
    expect(input.dateRange.startDate).toBeGreaterThanOrEqual(before)
    expect(input.dateRange.endDate).toBe(endOfMonth(new Date()).getTime())
    expect(input).toMatchObject({ userId: [], serviceIds: [], rakeWays: [] })
    expect(lastSearchBar('datePicker')).toMatchObject({ visible: ['datePicker'], outside: true, lastInLeaderBoard: true })
    expect(lastSearchBar('employee')).toMatchObject({ visible: ['employee'], stopGetQueryString: true })
  })

  it('搜尋列改日期與設計師；設計師清空時送空陣列', async () => {
    const { calls, settle } = setup()
    await settle()
    const range = { startDate: new Date(2026, 8, 1).getTime(), endDate: new Date(2026, 8, 30, 23, 59, 59, 999).getTime() }
    filterWith({ ...lastSearchBar('datePicker').values, ...range }, 'datePicker')
    await wait(() => expect(lastInput(calls).dateRange).toEqual(range))
    filterWith({ ...lastSearchBar('employee').values, employeeId: ['u1'] }, 'employee')
    await wait(() => expect(lastInput(calls).userId).toEqual(['u1']))
    filterWith({ ...lastSearchBar('employee').values, employeeId: '' }, 'employee')
    await wait(() => expect(lastInput(calls).userId).toEqual([]))
  })

  it('服務下拉送出服務 id、清除送空陣列；搜尋列把服務設成 null 時也送空陣列', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('選服務（測試）'))
    await wait(() => expect(lastInput(calls).serviceIds).toBe('s-1'))
    expect(screen.getByTestId('service-picker').getAttribute('data-value')).toBe('"s-1"')
    fireEvent.click(screen.getByText('清除服務（測試）'))
    await wait(() => expect(lastInput(calls).serviceIds).toEqual([]))
    filterWith({ ...lastSearchBar('employee').values, serviceId: null }, 'employee')
    await settle()
    expect(lastInput(calls).serviceIds).toEqual([])
  })

  it('抽成類別送出 [類別]，選「全部」送空陣列', async () => {
    const { calls, settle } = setup()
    await settle()
    const select = screen.getByLabelText('抽成類別')
    chooseNative(select, '特殊抽成')
    await wait(() => expect(lastInput(calls).rakeWays).toEqual(['SPECIAL']))
    chooseNative(select, '全部')
    await wait(() => expect(lastInput(calls).rakeWays).toEqual([]))
  })
})

describe('服務扣項明細表：表格與匯出', () => {
  it('日期以台灣時間、服務歸屬空白顯示預設；長數字四捨五入到小數 2 位；合計列', async () => {
    const { settle } = setup()
    await settle()
    const first = rowCells('#A001')
    expect(first.slice(0, 6)).toEqual([' 2026/10/21', '#A001', '服務', '剪髮', '小美', '1,000'])
    expect(first[12]).toBe('預設')
    const second = rowCells('#A002')
    expect(second[12]).toBe('染髮')
    // 12345.678 → 12,345.68（不可變成 12,346.00）；0.30000000000000004 → 0.30；1234567.891 → 1,234,567.89
    expect(second[5]).toBe('12,345.68')
    expect(second[9]).toBe('0.30')
    expect(second[24]).toBe('1,234,567.89')
    // 四捨五入後為 0 的長數字顯示 0
    expect(second[21]).toBe('0')
    const total = rowCells('合計')
    // 1000 + 12345.678 = 13345.678 → 13,345.68；940 + 0.3 = 940.3；376 + 1234567.891 = 1234943.891 → 1,234,943.89
    expect(total[5]).toBe('13,345.68')
    expect(total[9]).toBe('940.3')
    expect(total[24]).toBe('1,234,943.89')
    expect(total[19]).toBe('')
  })

  it('匯出：每筆一列＋合計列（長數字四捨五入到小數 2 位）', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(csvRows()).toHaveLength(3))
    const [first, second, total] = csvRows()
    expect(first).toEqual({
      日期: '2026/10/21', 帳單編號: '#A001', 類別: '服務', 項目: '剪髮', 設計師: '小美', 金額: 1000,
      '手續費(扣業績)': 10, '扣項(扣業績)': 20, '互助(扣業績)': 30, 實業績: 940, '實業績(依特殊抽成)': 0, '特殊抽成(依特殊抽成)': 0,
      服務歸屬: '', '不分實業績(依服務歸屬)': 940, '不分實業績 抽成(依服務歸屬)': 376, '指定實業績(依服務歸屬)': 0,
      '指定實業績 抽成(依服務歸屬)': 0, '不指定實業績(依服務歸屬)': 0, '不指定實業績 抽成(依服務歸屬)': 0, '%': 40,
      服務抽成: 376, '手續費(扣薪水)': 0, '扣項(扣薪水)': 0, '互助(扣薪水)': 0, 小計: 376,
    })
    expect(second).toMatchObject({ 帳單編號: '#A002', 金額: 12345.678, 實業績: '0.30', 服務歸屬: '染髮', 小計: '1234567.89' })
    expect(total).toMatchObject({ 日期: '合計', 帳單編號: '', 金額: '13345.68', 實業績: 940.3, '%': '', 小計: '1234943.89' })
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '服務扣項明細表.csv')
  })

  it('沒有資料顯示無資料；後端回 null 時提示選擇日期與設計師', async () => {
    const { settle } = setup({ FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: { getUserServiceDeductionDetialMultiple: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const nulled = setup({ FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: { getUserServiceDeductionDetialMultiple: null } })
    await nulled.settle()
    expect(screen.getByText('請選擇日期與設計師')).toBeInTheDocument()
  })

  it('載入中顯示骨架；報表、抽成類別查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup(
      { FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: new Error('查詢失敗'), USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: new Error('查詢失敗') }
    )
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('報表匯出')).toBeInTheDocument()
    expect(document.querySelector('table')).toBeNull()
  })
})
