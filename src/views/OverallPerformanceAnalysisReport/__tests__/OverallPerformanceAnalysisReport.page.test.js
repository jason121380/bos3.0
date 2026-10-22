// 保護「多店業績統計表」：
// - 進頁查本月 1 日～月底（台灣時間）、不限店家、業績包含「業績」；改日期重查
// - 選店家、業績包含（多選）後按搜尋送出店家 id 與包含項目；移除全部店家立即以不限店家重查
// - 表格：欄位依店家清單；每日一列「yyyy/MM/dd  (星期)」；後端各店資料順序與店家清單不同時以店家名稱對應
// - 區間合計（四捨五入）、實際工作天數、單日平均、當月預估；匯出 CSV 與畫面一致（區間合計不論順序都四捨五入）
// - 報表回來前匯出不可用；查詢失敗不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickQuickDate } from '../../__tests__/stockKit.test'
import OverallPerformanceAnalysisReport from '..'

jest.setTimeout(30000)

const MERCHANTS = JSON.stringify({ allMerchants: [{ id: 'm-1', name: '台北店' }, { id: 'm-2', name: '台中店' }], groups: [], merchants: [] })
const NAMES = ['台北店', '台中店', '高雄店']
// 後端回傳順序：第 1 家相同、後兩家與店家清單相反（驗證以名稱對應）
const ORDER = ['台北店', '高雄店', '台中店']
const byName = values => ORDER.map(name => ({ merchantName: name, performance: values[name] }))
const day = i => Date.UTC(2026, 9, 18 + i, 16, 30) // 台灣 2026/10/19（一）起
const REPORT = {
  merchantNameList: NAMES,
  performanceAnalysis: [0, 1, 2, 3, 4, 5, 6].map(i => ({
    date: day(i),
    merchantPerformance: byName({ 台北店: 1000 * (i + 1), 台中店: 100 * (i + 1), 高雄店: 10 * (i + 1) }),
  })),
  performanceSummary: byName({ 台北店: 28000.4, 台中店: 2800.6, 高雄店: 280.5 }),
  workingDay: ORDER.map(name => ({ merchantName: name, dayCount: { 台北店: 7, 台中店: 6, 高雄店: 5 }[name] })),
  averagePerformance: byName({ 台北店: 4000, 台中店: 466.77, 高雄店: 56.1 }),
  expectedPerformanceAllMonth: byName({ 台北店: 124000, 台中店: 14000, 高雄店: 1700 }),
}
const setup = ({ report = REPORT, ...options } = {}) =>
  renderPage(<OverallPerformanceAnalysisReport />, {
    fixtures: {
      GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS },
      FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT: { overallPerformanceAnalysisReport: report },
    },
    route: '/report/overall-performance',
    ...options,
  })
const lastInput = calls => callsOf(calls, 'FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT').pop().variables.input
// 以第一格文字找列（日期格含兩個空白，不能用 getByText 的預設空白正規化）
const rowOf = text =>
  [...document.querySelectorAll('tbody tr')]
    .map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
    .find(cells => cells[0] === text)
const thisMonth = () => ({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('多店業績統計表', () => {
  it('進頁查本月、不限店家、只含業績；快速選擇「上個月」重查', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT')[0].variables.input).toEqual({
      storeIds: [],
      dateRange: thisMonth(),
      performanceInclude: ['SERVICE'],
    })
    pickQuickDate('上個月')
    await wait(() =>
      expect(lastInput(calls).dateRange).toEqual({
        startDate: startOfMonth(subMonths(new Date(), 1)).getTime(),
        endDate: endOfMonth(subMonths(new Date(), 1)).getTime(),
      })
    )
  })

  it('選店家與業績包含後搜尋；移除全部店家立即以不限店家重查', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('全選'))
    fireEvent.click(screen.getByText('店販'))
    fireEvent.click(screen.getByText('會員卡'))
    fireEvent.click(screen.getByText('業績'))
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() =>
      expect(lastInput(calls)).toEqual({ storeIds: ['m-1', 'm-2'], dateRange: thisMonth(), performanceInclude: ['PRODUCT', 'MEMBERSHIP'] })
    )
    await settle()
    fireEvent.mouseDown(screen.getByLabelText('移除 台北店'))
    fireEvent.mouseDown(screen.getByLabelText('移除 台中店'))
    await wait(() => expect(lastInput(calls)).toEqual({ storeIds: [], dateRange: thisMonth(), performanceInclude: ['PRODUCT', 'MEMBERSHIP'] }))
  })

  it('表格依店家清單排列、以名稱對應各店資料；每日列帶星期；彙總列', async () => {
    const { settle } = setup()
    await settle()
    expect([...document.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['日期', ...NAMES])
    const days = [...document.querySelectorAll('tbody tr')].slice(0, 7).map(tr => tr.querySelector('td').textContent)
    expect(days).toEqual([
      '2026/10/19  (一)', '2026/10/20  (二)', '2026/10/21  (三)', '2026/10/22  (四)', '2026/10/23  (五)', '2026/10/24  (六)', '2026/10/25  (日)',
    ])
    expect(rowOf('2026/10/19  (一)')).toEqual(['2026/10/19  (一)', '1,000', '100', '10'])
    expect(rowOf('區間合計')).toEqual(['區間合計', '28,000', '2,801', '281'])
    expect(rowOf('實際工作天數')).toEqual(['實際工作天數', '7', '6', '5'])
    expect(rowOf('單日平均')).toEqual(['單日平均', '4,000', '466.77', '56.1'])
    expect(rowOf('當月預估')).toEqual(['當月預估', '124,000', '14,000', '1,700'])
  })

  it('匯出 CSV 與畫面一致：每日、區間合計（四捨五入）、工作天數、單日平均、當月預估', async () => {
    const { settle } = setup()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"日期","台北店","台中店","高雄店"')
    expect(csv).toContain('"2026/10/19  (一)","1000","100","10"')
    expect(csv).toContain('"2026/10/25  (日)","7000","700","70"')
    expect(csv).toContain('"區間合計","28000","2801","281"')
    expect(csv).toContain('"實際工作天數","7","6","5"')
    expect(csv).toContain('"單日平均","4000","466.77","56.1"')
    expect(csv).toContain('"當月預估","124000","14000","1700"')
  })

  it('報表回來前匯出不可用；回來後可下載', async () => {
    const { settle } = setup({ delays: { FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT: 200 } })
    expect(screen.getByText('報表匯出').closest('button')).toBeDisabled()
    fireEvent.click(screen.getByText('報表匯出').closest('a'))
    await settle()
    expect(screen.getByText('報表匯出').closest('button')).not.toBeDisabled()
    fireEvent.click(screen.getByText('報表匯出').closest('a'))
  })

  it('沒有店家清單時不顯示表格、匯出維持空的；查詢失敗不整頁錯誤', async () => {
    const empty = setup({ report: { ...REPORT, merchantNameList: null } })
    await empty.settle()
    expect(document.querySelector('table')).toBeNull()
    expect(screen.getByText('報表匯出').closest('button')).toBeDisabled()
    cleanup()
    const failed = setup({ fixtures: { GET_USER_MERCHANTS: { getUserMerchant: MERCHANTS } }, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
