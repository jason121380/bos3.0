// 保護「費用分析表」：
// ① 進頁以現在時間查本月（後端依日期取月份）；換月份重查；報表匯出以同一日期查詢、回來的網址以連結下載；「列印」呼叫瀏覽器列印。
// ② 會員卡未啟用時，「會員卡收入」與「第三方卡券…(會員卡)」兩科目沒有金額就不列（有金額照列）；啟用時全部列出。
// ③ 表格（參數「費用分析顯示百分比」開／關兩種欄位）：加項、扣項、各自佔小計的 %、總佔比
//    （收入類科目＝收入÷營收分母；其他＝|收入＋支出|÷營收分母，營收分母＝營業收入、店販收入、會員卡收入、卡券販賣(先入業績)的收入合計）、
//    小計、損益與損益率。
//    已修正：營收分母為 0（例如該月只有支出）時總佔比原本顯示「Infinity%」，改為空白。
// ④ 報表查詢失敗不整頁錯誤、不跳技術錯誤訊息（已修正：原本 forEach 讀 undefined 被 catch 後再跳一次程式錯誤提示）；
//    科目資料格式壞掉（科目名稱為 null）仍由 catch 提示。
// 列印抬頭（merchantNamePrint）屬列印範本，不在修改範圍。日期選擇器以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { openSnackbar } from 'elements/snackbars'
import CostAnalysisReport from '..'
import Results from '../Results'

const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ dateChange }) => (
    <button type="button" onClick={() => dateChange(mockNextDate.value)}>
      換日期（測試）
    </button>
  ),
}))
jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.setTimeout(20000)

const tw = (y, m, d, h = 0) => Date.UTC(y, m - 1, d, h - 8)
const flow = (subjectName, cashRevenue, cashExpenditure) => ({ subjectName, cashRevenue, cashExpenditure })
const FLOWS = [
  flow('營業收入', 10000, 0),
  flow('店販收入', 2000, 0),
  flow('會員卡收入', 0, 0),
  flow('第三方卡券A(會員卡)', 0, 0),
  flow('第三方卡券B(會員卡)', 300, 0),
  flow('薪資', 0, -6000),
  flow('房租', 500, -3000),
]
const statement = flows => ({ merchantIncomeStatementV2: { businessIncomeDetail: { moneyFlowSetConnection: flows } } })
const setup = (fixtures = {}, options = {}) =>
  renderPage(<CostAnalysisReport />, {
    fixtures: {
      GET_MERCHANT_INCOME_STATEMENTV2: statement(FLOWS),
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      GET_CARPTDISPLAY: { getParameterReportSetting: { CARPTDisplay: true } },
      GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL: { merchantIncomeStatementV2Excel: 'https://files.example/cost.xlsx' },
      ...fixtures,
    },
    ...options,
  })
const rows = () => within(screen.getByRole('table')).getAllByRole('row').map(r => [...r.querySelectorAll('th, td')].map(c => c.textContent))

let anchorClick
beforeEach(() => {
  loginAs()
  mockNextDate.value = null
  anchorClick = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  anchorClick.mockRestore()
})

describe('費用分析表：查詢、匯出、列印', () => {
  it('進頁以現在時間查詢；換月份重查；匯出以同一日期查詢並下載；列印', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_MERCHANT_INCOME_STATEMENTV2')[0].variables.date
    expect(first).toBeGreaterThanOrEqual(before)
    expect(first).toBeLessThanOrEqual(Date.now())
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 1, 24) - 1 }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(callsOf(calls, 'GET_MERCHANT_INCOME_STATEMENTV2').pop().variables).toEqual({ date: tw(2026, 9, 1) })
    fireEvent.click(screen.getByRole('button', { name: /報表匯出/ }))
    await settle()
    expect(callsOf(calls, 'GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL')[0].variables).toEqual({ date: tw(2026, 9, 1) })
    expect(anchorClick).toHaveBeenCalledTimes(1)
    expect(anchorClick.mock.instances[0].href).toBe('https://files.example/cost.xlsx')
    const print = jest.spyOn(window, 'print').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /列印/ }))
    expect(print).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })

  it('查詢中顯示骨架', async () => {
    const { settle } = setup({}, { delays: { GET_MERCHANT_INCOME_STATEMENTV2: 50 } })
    await wait(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    await settle()
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
  })
})

describe('費用分析表：表格', () => {
  it('顯示百分比：會員卡未啟用時略過沒有金額的會員卡科目；加項、扣項、%、總佔比、小計、損益', async () => {
    const { settle } = setup()
    await settle()
    expect(rows()).toEqual([
      ['', '加項', '%', '扣項', '%', '總佔比'],
      ['營業收入', '10000', '78.13%', '', '', '83.33%'],
      ['店販收入', '2000', '15.63%', '', '', '16.67%'],
      ['第三方卡券B(會員卡)', '300', '2.34%', '', '', ''],
      ['薪資', '', '', '-6000', '66.67%', '50%'],
      ['房租', '500', '3.91%', '-3000', '33.33%', '20.83%'],
      ['小計', '12800', '100%', '-9000', '100%', ''],
      ['損益', '3800', '29.69%', '', '', ''],
    ])
  })

  it('不顯示百分比（參數關閉或查詢失敗）：只有加項、扣項、總佔比；會員卡啟用時全部科目都列', async () => {
    const { settle } = setup({
      GET_CARPTDISPLAY: new Error('壞了'),
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
    })
    await settle()
    expect(rows()).toEqual([
      ['', '加項', '扣項', '總佔比'],
      ['營業收入', '10000', '', '83.33%'],
      ['店販收入', '2000', '', '16.67%'],
      ['會員卡收入', '', '', ''],
      ['第三方卡券A(會員卡)', '', '', ''],
      ['第三方卡券B(會員卡)', '300', '', ''],
      ['薪資', '', '-6000', '50%'],
      ['房租', '500', '-3000', '20.83%'],
      ['小計', '12800', '-9000', ''],
      ['損益', '3800', '', '29.69%'],
    ])
  })

  // 已修正：營收分母為 0 時原本顯示「Infinity%」
  it('只有支出（營收分母為 0）：總佔比空白、損益率 0%', async () => {
    const { settle } = setup({ GET_MERCHANT_INCOME_STATEMENTV2: statement([flow('營業收入', 0, 0), flow('薪資', 0, -6000)]) })
    await settle()
    expect(rows()).toEqual([
      ['', '加項', '%', '扣項', '%', '總佔比'],
      ['營業收入', '', '', '', '', ''],
      ['薪資', '', '', '-6000', '100%', ''],
      ['小計', '0', '100%', '-6000', '100%', ''],
      ['損益', '-6000', '0%', '', '', ''],
    ])
    expect(screen.queryByText(/Infinity/)).toBeNull()
  })

  // 已修正：原本 forEach 讀 undefined 被 catch 後再跳一次程式錯誤提示
  it('報表查詢失敗不整頁錯誤、不另跳錯誤提示，表格只有小計與損益', async () => {
    const { settle } = setup({ GET_MERCHANT_INCOME_STATEMENTV2: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(openSnackbar).not.toHaveBeenCalled()
    expect(rows().map(r => r[0])).toEqual(['', '小計', '損益'])
  })

  it('科目名稱為 null（資料格式壞掉）時以錯誤提示，不整頁錯誤', async () => {
    const { settle } = setup({ GET_MERCHANT_INCOME_STATEMENTV2: statement([flow('營業收入', 100, 0), flow(null, 0, -10)]) })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })

  it('Results 沒有科目資料時不畫表格與匯出鈕；外框 class 不帶多餘空白', () => {
    const { container } = renderPage(<Results />)
    expect(container.querySelector('table')).toBeNull()
    expect(screen.queryByRole('button', { name: /報表匯出/ })).toBeNull()
    expect(container.querySelector('.CostAnalysisReportTableContainer').className).toBe('CostAnalysisReportTableContainer flex w-full flex-wrap flex justify-between')
  })
})
