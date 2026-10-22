// 保護「設計師業績月報表」：
// - 進頁以「現在」為起訖（目前行為）、後端固定回虛實業績（performanceDisplay: TRUTH）；快速選擇改查新區間
// - 全部數字為 0 的列不顯示；依業績排序：月份由小到大、同月依業績高到低，跨月時每月加小計；
//   依設計師排序：設計師名稱排序（含英數字時依字碼、其餘依語系）、同人依月份，多位設計師且跨月時每人加小計
// - 業績依據切換虛／實：服務卡券業績、客單價改用對應欄位；總業績＝服務卡券＋店販（＋會員卡）
// - 會員卡欄：店家啟用會員卡，或區間內有會員卡業績時顯示（原本以尚未建立的排序結果判斷，資料有會員卡業績也不顯示）
// - 合計列不含小計；匯出 CSV 與表格一致（月份 yyyy/MM 以台灣時間）
// - 已知缺口（待 Jason 決定）：「客單價」的小計／合計是各列客單價直接相加，不是總業績÷總客數，目前鎖住現況
// - 查詢中匯出、列印停用；報表查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import { csvRows, headerTexts } from '../../__tests__/staffReportKit.test'
import DesignerMonthlyReport from '..'

jest.mock('react-csv', () => require('../../__tests__/staffReportKit.test').csvModule)
jest.setTimeout(20000)

const SEPT = Date.UTC(2026, 7, 31, 16, 30) // 台灣 2026/09/01 00:30
const OCT = Date.UTC(2026, 8, 30, 16, 30) // 台灣 2026/10/01 00:30
const row = (designerName, date, monthIndex, extra = {}) => ({
  date,
  designerName,
  monthIndex,
  fakePerformance: 0,
  truthPerformance: 0,
  orderTotalCount: 0,
  orderDesignateCount: 0,
  orderNonDesignateCount: 0,
  orderAverageFakePerformance: 0,
  orderAverageTruthPerformance: 0,
  productFakePerformance: 0,
  membershipFakePerformance: 0,
  ...extra,
})
const ROWS = [
  row('陳美', SEPT, 0, { fakePerformance: 10000.4, truthPerformance: 9000.4, orderTotalCount: 10, orderDesignateCount: 6, orderNonDesignateCount: 4, orderAverageFakePerformance: 1000.4, orderAverageTruthPerformance: 900.4, productFakePerformance: 500.4 }),
  row('阿明', SEPT, 0, { fakePerformance: 20000, truthPerformance: 18000, orderTotalCount: 10, orderDesignateCount: 5, orderNonDesignateCount: 5, orderAverageFakePerformance: 2000, orderAverageTruthPerformance: 1800 }),
  row('陳美', OCT, 1, { fakePerformance: 5000, truthPerformance: 4500, orderTotalCount: 5, orderDesignateCount: 3, orderNonDesignateCount: 2, orderAverageFakePerformance: 1000, orderAverageTruthPerformance: 900, productFakePerformance: 100 }),
  row('老王', SEPT, 0),
]

const setup = (extra = {}, options = {}) =>
  renderPage(<DesignerMonthlyReport />, {
    route: '/designer-monthly-report',
    fixtures: {
      GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: ROWS },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      ...extra,
    },
    ...options,
  })
const bodyRows = () => Array.from(document.querySelectorAll('tbody tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師業績月報表：查詢與排序', () => {
  it('進頁以現在為起訖、固定查虛實業績；快速選擇昨天改查昨天', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const { input } = callsOf(calls, 'GET_DESIGNER_MONTHLY_REPORT')[0].variables
    expect(input.performanceDisplay).toBe('TRUTH')
    expect(input.dateRange.startDate).toBe(input.dateRange.endDate)
    expect(input.dateRange.startDate).toBeGreaterThanOrEqual(before)
    pickQuickDate('昨天')
    await wait(() => {
      const list = callsOf(calls, 'GET_DESIGNER_MONTHLY_REPORT')
      expect(list[list.length - 1].variables.input).toEqual({
        dateRange: { startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() },
        performanceDisplay: 'TRUTH',
      })
    })
  })

  it('依業績排序：月份由小到大、同月業績高到低、跨月每月加小計；全為 0 的列不顯示；合計不含小計', async () => {
    const { settle } = setup()
    await settle()
    expect(headerTexts()).toEqual(['月份', '設計師', '總業績', '服務卡券業績(虛)', '總客數', '客單價', '指定', '不指定', '店販金額'])
    expect(bodyRows()).toEqual([
      ['2026/09', '阿明', '20000', '20000', '10', '2000', '5', '5', '0'],
      ['2026/09', '陳美', '10500', '10000', '10', '1000', '6', '4', '500'],
      // 已知缺口（待 Jason 決定）：小計／合計的客單價是各列客單價相加（1000.4＋2000），不是 30000÷20
      ['', '小計', '30500', '30000', '20', '3000', '11', '9', '500'],
      ['2026/10', '陳美', '5100', '5000', '5', '1000', '3', '2', '100'],
      ['', '小計', '5100', '5000', '5', '1000', '3', '2', '100'],
      ['合計', '', '35600', '35000', '25', '4000', '14', '11', '600'],
    ])
    expect(screen.queryByText('老王')).toBeNull()
  })

  it('只有一個月份時不加小計', async () => {
    const { settle } = setup({ GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: ROWS.filter(r => r.monthIndex === 0) } })
    await settle()
    expect(bodyRows().map(r => r[1])).toEqual(['阿明', '陳美', ''])
  })

  it('依設計師排序：名稱排序、同人依月份、多位設計師且跨月時每人加小計；再按一次不改變排序', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    await wait(() => expect(bodyRows()[0][1]).toBe('阿明'))
    expect(bodyRows().map(r => r.slice(0, 3))).toEqual([
      ['2026/09', '阿明', '20000'],
      ['', '小計', '20000'],
      ['2026/09', '陳美', '10500'],
      ['2026/10', '陳美', '5100'],
      ['', '小計', '15600'],
      ['合計', '', '35600'],
    ])
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    expect(screen.getByText('設計師', { selector: 'button' })).toHaveAttribute('aria-pressed', 'true')
    expect(bodyRows()[1][1]).toBe('小計')
  })

  it('依設計師排序：含英數字的名稱依字碼排序；都在同一個月時不加小計', async () => {
    const rows = [row('Bob', SEPT, 0, { fakePerformance: 1 }), row('陳美', SEPT, 0, { fakePerformance: 2 }), row('Amy', SEPT, 0, { fakePerformance: 3 }), row('阿明', SEPT, 0, { fakePerformance: 4 })]
    const { settle } = setup({ GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: rows } })
    await settle()
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    await wait(() => expect(bodyRows()[0][1]).toBe('Amy'))
    expect(bodyRows().map(r => r[1])).toEqual(['Amy', 'Bob', '阿明', '陳美', ''])
  })

  it('依設計師排序：只有一位設計師時不加小計', async () => {
    const { settle } = setup({ GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: ROWS.filter(r => r.designerName === '陳美') } })
    await settle()
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    await wait(() => expect(bodyRows().map(r => r[0])).toEqual(['2026/09', '2026/10', '合計']))
  })
})

describe('設計師業績月報表：業績依據、會員卡與匯出', () => {
  it('切到實業績：服務卡券業績、客單價改用實業績欄位；匯出欄名改「(實)」；再按一次不改變', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(headerTexts()).toContain('服務卡券業績(實)'))
    fireEvent.click(screen.getByText('實業績'))
    expect(headerTexts()).toContain('服務卡券業績(實)')
    expect(bodyRows()[0]).toEqual(['2026/09', '阿明', '18000', '18000', '10', '1800', '5', '5', '0'])
    await wait(() => expect(csvRows()[0]).toHaveProperty('服務卡券業績(實)', 18000))
  })

  it('店家設定隱藏虛實切換鈕時不顯示業績依據', async () => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } })
    await settle()
    expect(screen.queryByText('實業績')).toBeNull()
  })

  it('匯出：每列（含小計）＋合計，月份為台灣時間 yyyy/MM；未顯示會員卡時不含會員卡欄', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(csvRows()).toHaveLength(6))
    expect(csvRows()[0]).toEqual({ 月份: '2026/09', 設計師: '阿明', 總業績: 20000, '服務卡券業績(虛)': 20000, 總客數: 10, 客單價: 2000, 指定: 5, 不指定: 5, 店販金額: 0 })
    expect(csvRows()[2]).toMatchObject({ 月份: '', 設計師: '小計', 總業績: 30500 })
    expect(csvRows()[5]).toEqual({ 月份: '合計', 設計師: '', 總業績: 35600, '服務卡券業績(虛)': 35000, 總客數: 25, 客單價: 4000, 指定: 14, 不指定: 11, 店販金額: 600 })
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '設計師業績月報表.csv')
  })

  it('區間內有會員卡業績時即使店家未啟用也顯示會員卡欄，總業績含會員卡', async () => {
    const rows = [row('陳美', SEPT, 0, { fakePerformance: 1000, orderTotalCount: 1, membershipFakePerformance: 300.4 })]
    const { settle } = setup({ GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: rows } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡業績'))
    expect(bodyRows()[0]).toEqual(['2026/09', '陳美', '1300', '1000', '1', '0', '0', '0', '0', '300'])
    expect(bodyRows()[1]).toEqual(['合計', '', '1300', '1000', '1', '0', '0', '0', '0', '300'])
    await wait(() => expect(csvRows()[0]).toHaveProperty('會員卡業績', 300))
    expect(csvRows()[1]).toMatchObject({ 總業績: 1300, 會員卡業績: 300 })
  })

  it('店家啟用會員卡時顯示會員卡欄（含小計列）', async () => {
    const { settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await wait(() => expect(headerTexts()).toContain('會員卡業績'))
    expect(bodyRows()[2]).toEqual(['', '小計', '30500', '30000', '20', '3000', '11', '9', '500', '0'])
  })

  it('查詢中匯出、列印停用；列印呼叫瀏覽器列印；列印抬頭含店名', async () => {
    window.print = jest.fn()
    const { settle } = setup({}, { delays: { GET_DESIGNER_MONTHLY_REPORT: 50 } })
    expect(screen.getByText('列印').closest('button')).toBeDisabled()
    expect(screen.getByText('報表匯出').closest('button')).toBeDisabled()
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint .merchantNamePrint').textContent).toContain('測試店')
  })

  it('報表查詢失敗、回傳 null 時不整頁錯誤', async () => {
    const { settle } = setup({ GET_DESIGNER_MONTHLY_REPORT: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('table')).toBeNull()
    cleanup()
    const nulled = setup({ GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: null } })
    await nulled.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
