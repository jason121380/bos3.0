// 保護「薪資條」（列印給員工的薪資明細）：
// - 每位員工一張：店名－月份－姓名；加項／扣項逐項列出（每 6 項換一列），加項合計、扣項合計為各項加總，實領薪資取後端 summary，
//   業績類四捨五入到小數一位；沒有任何加扣項的員工顯示 0 的空白薪資條；只有加項或只有扣項時另一邊顯示「無扣項／無加項」。
// - 店家設定：顯示虛業績欄、顯示出勤天數、列印樣式、列印時間（「不顯示列印明細」或「隱藏列印日期」任一開啟就不印）、不換行模式。
// - 篩選設計師只顯示該位；匯出送出月份與篩選的設計師並下載後端回傳的網址；列印呼叫瀏覽器列印。
// 查詢月份預設為上個月（台灣時間）。GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import EmployeePayslip from '..'

jest.setTimeout(20000)

const items = (prefix, prices, type) => prices.map((price, i) => ({ itemName: `${prefix}${i + 1}`, price, type }))

const REPORT = [
  {
    userId: 'u1',
    name: '小美',
    summary: 41234,
    increaseItem: items('加', [30000, 5000, 4000, 3000, 2000, 1000, 500], 'INCREASE'),
    decreaseItem: items('扣', [1000, 900, 800, 700, 600, 500, 66], 'DECREASE'),
    specialTruthPerformance: 1234.56,
    designateTruthPerformance: 80000.04,
    nonDesignateTruthPerformance: 43456.75,
    truthPerformance: 124691.35,
    helperPointRetrieve: 12.34,
    fakePerformanceTotal: 130000.26,
    performanceDecountItem: 300.44,
    handlingFeeOnSales: 99.95,
    remark: '含年終',
    workingDays: 22,
  },
  { userId: 'u2', name: '阿明', summary: -300, increaseItem: [], decreaseItem: [{ itemName: '罰款', price: 300, type: 'DECREASE' }], workingDays: 3 },
  { userId: 'u3', name: '新人', summary: 0, increaseItem: [], decreaseItem: [], workingDays: 0 },
  { userId: 'u4', name: '老王', summary: 100, increaseItem: [{ itemName: '工資', price: 100, type: 'INCREASE' }], decreaseItem: [], workingDays: 1 },
]

const settings = ({ fake = true, epwd = true, style = 'LARGE', printDetail = false, optimization = true, dateHidden = false } = {}) => ({
  GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT: { getIsDisplayFakePerformanceInSalaryReport: fake },
  GET_IS_EPWD_DISPLAY: { getIsEPWDDisplay: epwd },
  GET_EMPLOYEE_PAYSLIP_PRINT_STYLE: { getEmployeePayslipPrintStyle: style },
  GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT: { getIsPrintDetailDisplayOnSalaryReport: printDetail },
  GET_PAYSLIP_OPTIMIZATION: { getParameterCheckoutAndSalaryItemsSetting: { isPayslipOptimizationPrintModeOn: optimization } },
  GET_IS_PRINT_DATE_HIDDEN: { getParameterCheckoutAndSalaryItemsSetting: { isPrintDateHiddenForPayslip: dateHidden } },
})

const setup = ({ report = REPORT, fixtures = {}, ...options } = {}) =>
  renderPage(<EmployeePayslip />, {
    route: '/salary/payslip',
    fixtures: {
      FETCH_USER_SALARY_REPORT: { userSalaryReport: report },
      GET_USERS_ORDERABLE_LIST: {
        getUserOrderableList: [
          { userId: 'u1', userName: '小美', userNickName: '', userNo: 'A01' },
          { userId: 'u2', userName: '阿明', userNickName: '', userNo: 'A02' },
        ],
      },
      GET_USER_SALARY_EXCEL: { userSalaryReportExcel: 'https://files.example.com/salary-202609.xlsx' },
      ...settings(options),
      ...fixtures,
    },
  })

const lastMonth = () => format(subMonths(new Date(), 1), 'yyyy/MM')
const slip = name => screen.getByText(`測試店 - ${lastMonth()} - ${name}`).closest('.EmployeePayslipTable')
const summaryRow = name => {
  const tables = slip(name).querySelectorAll('table')
  const rows = tables[tables.length - 1].querySelectorAll('tr')
  const cells = tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
  return { head: cells(rows[0]), values: cells(rows[1]) }
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資條', () => {
  it('每位員工一張：逐項列出加扣項，合計、實領與業績（四捨五入一位）', async () => {
    const { calls } = setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    // 查詢上個月
    expect(format(callsOf(calls, 'FETCH_USER_SALARY_REPORT')[0].variables.date, 'yyyy/MM')).toBe(lastMonth())
    const amy = within(slip('小美'))
    expect(amy.getByText('加7')).toBeInTheDocument()
    expect(amy.getByText('扣7')).toBeInTheDocument()
    // 第 7 項前換列（每 6 項一列）
    const firstBody = slip('小美').querySelector('.renderItem')
    expect(firstBody.querySelectorAll('tr')).toHaveLength(1)
    expect(summaryRow('小美')).toEqual({
      head: [
        '加項合計',
        '扣項合計',
        '實領薪資',
        '互助獲得(點)',
        '指定實業績',
        '不指定實業績',
        '特抽總業績',
        '總實業績',
        '總虛業績',
        '扣項-扣業績',
        '手續費-扣業績',
        '備註',
      ],
      values: ['45500', '4566', '41234', '12.3', '80000', '43456.8', '1234.6', '124691.4', '130000.3', '300.4', '100', '含年終'],
    })
    // 出勤天數、不換行模式、列印時間
    expect(amy.getByText('天數: 22')).toBeInTheDocument()
    expect(amy.getByText('加1')).toHaveClass('nowrap')
    expect(amy.getByText(/^列印時間：/)).toBeInTheDocument()
  })

  it('只有扣項顯示「無加項」、只有加項顯示「無扣項」；沒有加扣項顯示 0 的空白薪資條', async () => {
    setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    expect(within(slip('阿明')).getByText('無加項')).toBeInTheDocument()
    expect(summaryRow('阿明').values.slice(0, 3)).toEqual(['0', '300', '-300'])
    expect(within(slip('老王')).getByText('無扣項')).toBeInTheDocument()
    const empty = within(slip('新人'))
    expect(empty.getByText('無加項')).toBeInTheDocument()
    expect(empty.getByText('無扣項')).toBeInTheDocument()
    expect(empty.getByText('實領薪資')).toBeInTheDocument()
    expect(empty.getByText('天數: 0')).toBeInTheDocument()
    // 第二張起有分隔線，樣式依店家設定
    const separators = document.querySelectorAll('p.merchantNamePrint')
    expect(separators).toHaveLength(3)
    separators.forEach(p => expect(p).toHaveClass('LARGE'))
  })

  it('店家設定關閉時：不顯示虛業績欄與出勤天數、列印樣式預設 SMALL、可換行；「不顯示列印明細」時不印列印時間', async () => {
    setup({ fake: false, epwd: false, style: null, optimization: false, printDetail: true })
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    expect(summaryRow('小美').head).not.toContain('總虛業績')
    expect(within(slip('小美')).queryByText(/天數/)).toBeNull()
    expect(within(slip('小美')).getByText('加1')).not.toHaveClass('nowrap')
    expect(screen.queryByText(/^列印時間：/)).toBeNull()
    document.querySelectorAll('p.merchantNamePrint').forEach(p => expect(p).toHaveClass('SMALL'))
  })

  it('「隱藏列印日期」開啟時不印列印時間', async () => {
    const { settle } = setup({ dateHidden: true })
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    await settle()
    expect(screen.queryByText(/^列印時間：/)).toBeNull()
  })

  it('篩選設計師：只顯示該位的薪資條', async () => {
    const { settle } = setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    await settle()
    fireEvent.click(screen.getByLabelText('設計師編號/姓名'))
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '阿明-A02'))
    await wait(() => expect(screen.queryByText(`測試店 - ${lastMonth()} - 小美`)).toBeNull())
    expect(slip('阿明')).toBeInTheDocument()
    expect(screen.queryByText(`測試店 - ${lastMonth()} - 老王`)).toBeNull()
  })

  it('報表匯出：送出月份與篩選的設計師，下載後端回傳的檔案網址；列印呼叫瀏覽器列印', async () => {
    const clicked = []
    jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      clicked.push(this.getAttribute('href'))
    })
    window.print = jest.fn()
    const { calls, settle } = setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    await settle()
    fireEvent.click(screen.getByLabelText('設計師編號/姓名'))
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '小美-A01'))
    fireEvent.click(screen.getByRole('button', { name: '報表匯出' }))
    await wait(() => expect(clicked).toEqual(['https://files.example.com/salary-202609.xlsx']))
    const { variables } = callsOf(calls, 'GET_USER_SALARY_EXCEL')[0]
    expect(variables.designerId).toBe('u1')
    expect(format(variables.date, 'yyyy/MM')).toBe(lastMonth())
    fireEvent.click(screen.getByRole('button', { name: '列印' }))
    expect(window.print).toHaveBeenCalled()
  })

  it('換月份：查詢所選月份', async () => {
    const { calls } = setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '本月' }))
    const thisMonth = startOfMonth(new Date()).getTime()
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_REPORT').map(c => c.variables.date)).toContain(thisMonth))
  })

  it('當月沒有薪資資料時顯示「無資料」', async () => {
    setup({ report: [] })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })

  // 薪資條用不到店家加項／扣項設定：原本查詢後整理卻從未使用、查詢失敗時整頁錯誤，已移除（Jason 2026/10/22）。
  it('不查詢店家加扣項設定；薪資條照常顯示', async () => {
    const { calls, settle } = setup()
    await screen.findByText(`測試店 - ${lastMonth()} - 小美`)
    await settle()
    expect(callsOf(calls, 'GET_MERCHANT_SALARY_INCREASE_ITEMS')).toHaveLength(0)
    expect(callsOf(calls, 'GET_MERCHANT_SALARY_DECREASE_ITEMS')).toHaveLength(0)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
