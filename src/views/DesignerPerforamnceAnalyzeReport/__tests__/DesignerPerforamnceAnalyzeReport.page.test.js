// 保護「設計師業績分析表」：
// - 進頁以本月 1 日到現在（台灣時間）、所有設計師、虛業績查詢；改日期、切實業績時自動重查；選設計師後按「搜尋」送出設計師 id
// - 設計師下拉：依編號自然排序；關鍵字比對編號（完全相同）、暱稱、姓名；顯示暱稱（沒有時姓名）與編號
// - 結果：所有數字為 0 的設計師不顯示；每位一張卡（列印範本，不改，只驗證內容）；會員卡欄在店家啟用或有人有會員卡業績時顯示
// - 報表匯出：以目前條件查詢後端 Excel，取得網址後開啟下載
// - 比較模式：設定條件（最多 3 組，每組日期、業績依據、設計師），刪除指定的那一組；確定後以各組條件查比較報表並分組顯示；沒有條件時不查詢
// - 查詢失敗（設計師清單、報表）時不整頁錯誤，報表失敗後可再按搜尋、不停在載入中
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不產生真的檔案。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { comboOptions, openCombo, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import { spyAnchorClicks } from '../../__tests__/staffReportKit.test'
import DesignerPerforamnceAnalyzeReport from '..'

jest.setTimeout(30000)

const USERS = [
  { userId: 'u10', userName: '陳十', userNickName: null, userNo: '10' },
  { userId: 'u2', userName: '王小美', userNickName: 'Amy', userNo: '2' },
  { userId: 'u0', userName: '沒編號', userNickName: '  ', userNo: null },
  { userId: 'u3', userName: '李阿明', userNickName: '', userNo: 'A3' },
]
const typeRow = (typeName, extra = {}) => ({
  typeName,
  orderTypeCount: 3,
  orderTypePercentage: 60.123,
  orderTypeDesignateCount: 2,
  orderTypeDesignatePercentage: 66.666,
  orderTypeNonDesignateCount: 1,
  orderTypeNonDesignatePercentage: 33.333,
  currentOrderTypePerformance: 3000.4,
  currentOrderTypePerformancePercentage: 75.5,
  currentOrderTypeAveragePrice: 1000.1,
  ...extra,
})
const designer = (designerName, extra = {}) => ({
  designerName,
  merchantName: '總店',
  totalPerformance: 5000.4,
  totalOrderCount: 5,
  orderAveragePrice: 1000.08,
  orderDesignateCount: 3,
  orderDesignatePercentage: 60,
  orderNonDesignateCount: 2,
  orderNonDesignatePercentage: 40,
  productPerformance: 500.6,
  productPerformancePercentage: 9.0909,
  membershipPerformance: 0,
  membershipPerformancePercentage: 0,
  serviceTypeAnalyze: [typeRow('剪髮'), typeRow('染髮', { orderTypeCount: 2, orderTypeDesignateCount: 1, orderTypeNonDesignateCount: 1, currentOrderTypePerformance: 2000 })],
  ...extra,
})
const ZERO = designer('休假', {
  totalPerformance: 0, totalOrderCount: 0, orderAveragePrice: 0, orderDesignateCount: 0, orderDesignatePercentage: 0, orderNonDesignateCount: 0,
  orderNonDesignatePercentage: 0, productPerformance: 0, productPerformancePercentage: 0, serviceTypeAnalyze: [],
})
const FIXTURES = {
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: USERS },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
  GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: { designerPerforamnceAnalyzeReport: [designer('王小美'), ZERO] },
  FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL: { designerPerforamnceAnalyzeExcel: 'https://files.example/analyze.xlsx' },
  GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT: ({ input }) => ({
    designerPerforamnceAnalyzeCompareReport: input.map((_, i) => (i === 1 ? [ZERO] : [designer(`第${i + 1}組設計師`)])),
  }),
}
const setup = (extra = {}, options = {}) =>
  renderPage(<DesignerPerforamnceAnalyzeReport />, { route: '/designer-perforamnce-analyze-report', fixtures: { ...FIXTURES, ...extra }, ...options })
const lastVariables = (calls, name = 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT') => {
  const list = callsOf(calls, name)
  return list[list.length - 1].variables
}
const cards = () => Array.from(document.querySelectorAll('.printLongCard'))
const cardRows = cardEl => Array.from(cardEl.querySelectorAll('tbody tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
const dialog = () => screen.getByRole('dialog')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師業績分析表：查詢', () => {
  it('進頁以本月到現在、所有設計師、虛業績查詢；改日期、切實業績自動重查；選設計師後搜尋送出 id', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT')[0].variables
    expect(first.input.startDate).toBe(startOfMonth(new Date()).getTime())
    expect(first.input.endDate).toBeGreaterThanOrEqual(before)
    expect(first).toMatchObject({ designerIds: [], displayReference: 'FAKE' })
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastVariables(calls).input).toEqual({ startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() })
    )
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await wait(() => expect(lastVariables(calls).displayReference).toBe('TRUTH'))
    await settle()
    fireEvent.click(screen.getByText('實業績'))
    await settle()
    expect(lastVariables(calls).displayReference).toBe('TRUTH')
    pickOption('設計師篩選', 'Amy - 2')
    pickOption('設計師篩選', '陳十 - 10')
    // 已選的以暱稱（沒有暱稱時姓名）顯示
    expect(screen.getAllByText('Amy').length).toBeGreaterThan(0)
    expect(screen.getAllByText('陳十').length).toBeGreaterThan(0)
    const count = callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT').length
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT').length).toBeGreaterThan(count))
    expect(lastVariables(calls).designerIds).toEqual(['u2', 'u10'])
  })

  it('設計師下拉依編號自然排序（空編號最後）；顯示暱稱或姓名＋編號；關鍵字比對編號、暱稱、姓名', async () => {
    const { settle } = setup()
    await settle()
    openCombo('設計師篩選')
    expect(comboOptions().map(o => o.textContent)).toEqual(['Amy - 2', '陳十 - 10', '李阿明 - A3', '沒編號'])
    const input = openCombo('設計師篩選', { typed: 'a3' })
    expect(comboOptions().map(o => o.textContent)).toEqual(['李阿明 - A3'])
    fireEvent.change(input, { target: { value: 'am' } })
    expect(comboOptions().map(o => o.textContent)).toEqual(['Amy - 2'])
    fireEvent.change(input, { target: { value: '陳' } })
    expect(comboOptions().map(o => o.textContent)).toEqual(['陳十 - 10'])
    fireEvent.change(input, { target: { value: '1' } })
    expect(comboOptions()).toHaveLength(0)
    fireEvent.change(input, { target: { value: '   ' } })
    expect(comboOptions()).toHaveLength(4)
  })

  it('店家設定隱藏虛實切換鈕時不顯示業績依據', async () => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: true } })
    await settle()
    expect(screen.queryByText('實業績')).toBeNull()
  })

  it('報表匯出：以目前條件查詢後端 Excel，取得網址後開啟下載', async () => {
    const clicks = spyAnchorClicks()
    try {
      const { calls, settle } = setup()
      await settle()
      fireEvent.click(screen.getByText('報表匯出'))
      await wait(() => expect(clicks.hrefs).toEqual(['https://files.example/analyze.xlsx']))
      expect(lastVariables(calls, 'FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL')).toEqual(lastVariables(calls))
    } finally {
      clicks.restore()
    }
  })
})

describe('設計師業績分析表：結果', () => {
  it('全為 0 的設計師不顯示；卡片內容與合計列；未啟用會員卡且沒有會員卡業績時不顯示會員卡欄', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    expect(cards()).toHaveLength(1)
    const [card] = cards()
    expect(card.textContent).toContain('總店')
    expect(card.textContent).toContain('王小美')
    expect(card.textContent).not.toContain('會員卡業績')
    expect(cardRows(card)).toEqual([
      ['5000', '5', '1000', '3', '60%', '2', '40%', '501', '9.09%'],
      ['剪髮', '3', '60.12%', '2', '66.67%', '1', '33.33%', '3000', '75.5%', '1000'],
      ['染髮', '2', '60.12%', '1', '66.67%', '1', '33.33%', '2000', '75.5%', '1000'],
      // 合計：客數 5、指定 3（60%）、不指定 2（40%）、業績 5000、平均單價 5000÷5＝1000
      ['合計', '5', 'N/A', '3', '60%', '2', '40%', '5000', 'N/A', '1000'],
    ])
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
  })

  it('有人有會員卡業績時顯示會員卡欄；全部都是 0 時顯示無資料', async () => {
    const { settle } = setup({ GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: { designerPerforamnceAnalyzeReport: [designer('王小美', { membershipPerformance: 300.4, membershipPerformancePercentage: 5.678 })] } })
    await settle()
    await wait(() => expect(cards()[0].textContent).toContain('會員卡業績比%'))
    expect(cardRows(cards()[0])[0].slice(-2)).toEqual(['300', '5.68%'])
    cleanup()
    const empty = setup({ GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: { designerPerforamnceAnalyzeReport: [ZERO] } })
    await empty.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('店家啟用會員卡時顯示會員卡欄', async () => {
    const { settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await wait(() => expect(cards()[0].textContent).toContain('會員卡業績'))
  })

  it('沒有服務類別資料的設計師：合計比例與平均單價顯示 N/A', async () => {
    const { settle } = setup({ GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: { designerPerforamnceAnalyzeReport: [designer('王小美', { serviceTypeAnalyze: [] })] } })
    await settle()
    expect(cardRows(cards()[0]).pop()).toEqual(['合計', '0', 'N/A', '0', 'N/A', '0', 'N/A', '0', 'N/A', 'N/A'])
  })

  it('設計師清單、報表查詢失敗時不整頁錯誤；不停在載入中，可再按搜尋', async () => {
    const { calls, settle } = setup({ GET_USERS_ORDERABLE_LIST: new Error('查詢失敗'), GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: new Error('查詢失敗') })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    const search = screen.getByText('搜尋').closest('button')
    expect(search).not.toBeDisabled()
    const count = callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT').length
    fireEvent.click(search)
    await wait(() => expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT').length).toBeGreaterThan(count))
    openCombo('設計師篩選')
    expect(comboOptions()).toHaveLength(0)
  })
})

describe('設計師業績分析表：比較模式', () => {
  const openCompare = async settle => {
    fireEvent.click(screen.getByRole('switch', { name: '比較模式' }))
    await settle()
    fireEvent.click(screen.getByText('設定條件'))
    return dialog()
  }

  it('比較模式隱藏匯出、列印與篩選列；沒有條件按確定不查詢；取消關閉', async () => {
    const { calls, settle } = setup()
    await settle()
    const modal = await openCompare(settle)
    expect(screen.queryByText('報表匯出')).toBeNull()
    expect(screen.queryByText('列印')).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    fireEvent.click(within(modal).getByText('確定'))
    await settle()
    expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT')).toHaveLength(0)
    fireEvent.click(screen.getByText('設定條件'))
    fireEvent.click(within(dialog()).getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('最多 3 組條件；各組設定日期、業績依據、設計師後確定，以各組條件查比較報表並分組顯示', async () => {
    const { calls, settle } = setup()
    await settle()
    const modal = await openCompare(settle)
    fireEvent.click(within(modal).getByText('新增條件'))
    fireEvent.click(within(modal).getByText('新增條件'))
    fireEvent.click(within(modal).getByText('新增條件'))
    expect(within(modal).queryByText('新增條件')).toBeNull()
    expect(within(modal).getAllByRole('button', { name: '刪除條件' })).toHaveLength(3)
    // 第 2 組：昨天、實業績、選 Amy
    fireEvent.keyDown(within(modal).getAllByRole('combobox', { name: '快速選擇日期區間' })[1], { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    fireEvent.click(within(modal).getAllByText('實業績')[1])
    fireEvent.click(within(modal).getAllByText('實業績')[1])
    const third = pickOption('設計師篩選', '陳十 - 10', { container: modal, index: 2 })
    expect(within(modal).getAllByText('陳十').length).toBeGreaterThan(0)
    // 多選下拉選完不會自動關閉：先關掉，再開第 2 組的
    fireEvent.keyDown(third, { key: 'Escape' })
    fireEvent.focusOut(third)
    pickOption('設計師篩選', 'Amy - 2', { container: modal, index: 1 })
    fireEvent.click(within(modal).getByText('確定'))
    await wait(() => expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT')).toHaveLength(1))
    const { input } = lastVariables(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT')
    expect(input).toHaveLength(3)
    expect(input[1]).toEqual({
      dateRange: { startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() },
      designerIds: ['u2'],
      displayReference: 'TRUTH',
    })
    expect(input[2]).toMatchObject({ designerIds: ['u10'] })
    expect(input[0]).toMatchObject({ designerIds: [], displayReference: 'FAKE' })
    expect(input[0].dateRange.startDate).toBe(startOfMonth(new Date()).getTime())
    await settle()
    // 第 1、3 組有資料，第 2 組只有全為 0 的設計師 → 無資料
    expect(cards().map(c => (c.textContent.match(/第\d組設計師/) || [])[0])).toEqual(['第1組設計師', '第3組設計師'])
    expect(screen.getAllByText('無資料')).toHaveLength(1)
    expect(cardRows(cards()[0])[0]).toEqual(['5000', '5', '1000', '3', '60%', '2', '40%', '501', '9.09%'])
    expect(cardRows(cards()[0]).pop()).toEqual(['合計', '5', 'N/A', '3', '60%', '2', '40%', '5000', 'N/A', '1000'])
  })

  it('刪除條件刪除按下的那一組（不是永遠刪第一組）', async () => {
    const { calls, settle } = setup()
    await settle()
    const modal = await openCompare(settle)
    fireEvent.click(within(modal).getByText('新增條件'))
    fireEvent.click(within(modal).getByText('新增條件'))
    fireEvent.click(within(modal).getAllByText('實業績')[0])
    fireEvent.click(within(modal).getAllByRole('button', { name: '刪除條件' })[1])
    expect(within(modal).getAllByRole('button', { name: '刪除條件' })).toHaveLength(1)
    fireEvent.click(within(modal).getByText('確定'))
    await wait(() => expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT')).toHaveLength(1))
    expect(lastVariables(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT').input).toEqual([
      expect.objectContaining({ displayReference: 'TRUTH' }),
    ])
  })

  it('比較報表有會員卡業績時顯示會員卡欄；查詢中顯示載入；查詢失敗時不整頁錯誤', async () => {
    const { calls, settle } = setup(
      {
        GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT: {
          designerPerforamnceAnalyzeCompareReport: [[designer('甲', { membershipPerformance: 100, membershipPerformancePercentage: 2, serviceTypeAnalyze: [] })]],
        },
      },
      { delays: { GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT: 50 } }
    )
    await settle()
    const modal = await openCompare(settle)
    fireEvent.click(within(modal).getByText('新增條件'))
    fireEvent.click(within(modal).getByText('確定'))
    await wait(() => expect(document.querySelector('.animate-spin')).not.toBeNull())
    await settle()
    await wait(() => expect(cards()[0].textContent).toContain('會員卡業績比%'))
    expect(cardRows(cards()[0])[0].slice(-2)).toEqual(['100', '2%'])
    // 沒有服務類別資料：合計比例與平均單價顯示 N/A
    expect(cardRows(cards()[0]).pop()).toEqual(['合計', '0', 'N/A', '0', 'N/A', '0', 'N/A', '0', 'N/A', 'N/A'])
    expect(callsOf(calls, 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT')).toHaveLength(1)
    cleanup()
    const failed = setup({ GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT: new Error('查詢失敗') })
    await failed.settle()
    const modal2 = await openCompare(failed.settle)
    fireEvent.click(within(modal2).getByText('新增條件'))
    fireEvent.click(within(modal2).getByText('確定'))
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('關閉比較模式回到一般結果', async () => {
    const { settle } = setup()
    await settle()
    await openCompare(settle)
    fireEvent.click(within(dialog()).getByText('取消'))
    fireEvent.click(screen.getByRole('switch', { name: '比較模式' }))
    await settle()
    expect(screen.getByText('報表匯出')).toBeInTheDocument()
    expect(cards()).toHaveLength(1)
  })
})
