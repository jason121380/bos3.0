// 保護「設計師日報表」（卡片與列印區塊皆為列印範本，不改，只驗證內容）：
// - 以網址或日期選擇的那一天查詢（date＝當天 23:59:59.999，台灣時間）；沒有指定時以現在查詢
// - 每位設計師一張卡：標題「代號 暱稱 姓名 日期（台灣時間） 日報表」，分頁時加「- 目前/總頁數」、非第一頁有「承上張」、非最後一頁有「接續下張」且不顯示合計
// - 帳單列：單號（指定加 *）連到帳單、「項目消費」顯示「消費」；金額十萬以上取整數、其餘小數 1 位
// - 日合計／累計：依「顯示金額」「隱藏 0 值」「顯示互助獲得」「互助點數換算金額」「四捨五入」設定與會員卡啟用與否增減列
// - 列印區塊每 4 位一組；店家開「四捨五入」時列印區塊也四捨五入，換日期後列印內容要跟著換（不可留著上一天的資料）
// - 沒有資料顯示「無資料」；報表與各項設定查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import EmployeeDailyReport from '..'

jest.setTimeout(30000)

const DAY = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const FIELDS = [
  'performanceFakeTotal', 'performanceTruthTotal', 'performanceDesignateTruthTotal', 'performanceNonDesignateTruthTotal', 'performanceWithSpecialRake',
  'orderTotalCount', 'designateOrderCount', 'nonDesignateOrderCount', 'productFakeTotal', 'productRake', 'customerAveragePrice', 'orderAveragePrice',
  'helperRetrievePoint', 'helperRetrievePrice', 'helperPaidPoint', 'walletDeposit', 'orderTypeCount', 'orderTypeAveragePrice', 'customerDesignateCount',
  'customerNonDesignateCount', 'customerTotalCount', 'thirdPartHandlingFee', 'deductionItem', 'helperPaidPrice', 'helperPaidPriceFromPoint',
  'helpGetNoPoint', 'membershipFakeTotal', 'membershipRake',
]
const filled = value => Object.fromEntries(FIELDS.map(f => [f, value]))
const summary = (base, extra = {}) => ({ ...filled(base), ...extra })
const designer = (id, extra = {}) => ({
  user: { id, name: `設計師${id}`, nickName: '', designerNo: '' },
  orderRecord: [],
  currentDay: summary(0),
  tillNow: summary(0),
  currentTruthSummary: 0,
  currentFakeSummary: 0,
  isLastPage: true,
  totalPageCount: 1,
  currentPageOrder: 1,
  ...extra,
})
// 各項都有數字（當天）
const AMY = designer('d1', {
  user: { id: 'd1', name: '王小美', nickName: 'Amy', designerNo: 'A01' },
  orderRecord: [
    { orderId: 'o-1', designation: true, orderNo: '1001', category: '項目消費', itemName: '剪髮', fakePerformance: 1234.56, truthPerformance: 1000.04, truthPerformanceWithHelperUsage: 900 },
    { orderId: 'o-2', designation: false, orderNo: '1002', category: '店販', itemName: '洗髮精', fakePerformance: 123456.7, truthPerformance: 0, truthPerformanceWithHelperUsage: 0 },
  ],
  currentDay: summary(2, { performanceFakeTotal: 1000, orderTotalCount: 4, orderTypeCount: 5, helperPaidPriceFromPoint: -30.26, membershipFakeTotal: 0, membershipRake: 0 }),
  tillNow: summary(20, { performanceFakeTotal: 10000, orderTotalCount: 30, orderTypeCount: 40, helperPaidPriceFromPoint: -300, membershipFakeTotal: 500, membershipRake: 0 }),
  currentFakeSummary: 124691.26,
  currentTruthSummary: 1000.04,
  totalPageCount: 2,
  currentPageOrder: 1,
  isLastPage: false,
})
// 第 2 頁：承上張，當天全為 0、累計有數字
const AMY_P2 = designer('d1', {
  user: AMY.user,
  totalPageCount: 2,
  currentPageOrder: 2,
  tillNow: summary(7, { membershipFakeTotal: 0, membershipRake: 3 }),
})
const ZERO = designer('d3')
const others = ['d4', 'd5', 'd6'].map(id => designer(id))
const REPORT = [AMY, AMY_P2, ZERO, ...others]

const settings = ({ price = true, helperPointPrice = true, hiddenZero = true, member = false, printMode = false, helperRetrieve = true, mathRound = false } = {}) => ({
  GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isPriceDisplayOnDailyReport: price, isHelperPointPriceDisplay: helperPointPrice } },
  GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT: { getIsZeroValueHiddenOnDailyReport: hiddenZero },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: member },
  GET_IS_OPTIMIZATION_PRINT_MODES: { getIsOptimizationPrintModeOn: printMode },
  GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT: { getIsDisplayHelperRetrieveInDailyReport: helperRetrieve },
  GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: { getIsUsingMathRoundInDesignerDailyReport: mathRound },
})
const setup = (options = {}, extra = {}, route = `/employee-daily-report?startDate=${DAY}&endDate=${DAY}`) =>
  renderPage(<EmployeeDailyReport />, {
    route,
    fixtures: { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: REPORT }, ...settings(options), ...extra },
  })
const screenCards = () => Array.from(document.querySelectorAll('.noprint')).filter(el => el.querySelector('.printCard'))
const printCards = () => Array.from(document.querySelectorAll('.EmployeeDailyReportCardPrint'))
const rowsOf = el => Array.from(el.querySelectorAll('tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent)).filter(r => r.length)
const labelsOf = el => rowsOf(el).map(r => r[0])
const summaryRow = (el, label) => rowsOf(el).find(r => r[0] === label)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師日報表：查詢與卡片', () => {
  it('以網址指定的那一天結束查詢；快速選擇昨天改查昨天結束；沒有指定時以現在查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    // 先以現在查詢，日期選擇器讀到網址日期後改查該日結束
    await wait(() => expect(callsOf(calls, 'FETCH_DESIGNER_DAILY_REPORT').map(c => c.variables.date)).toContain(endOfDay(DAY).getTime()))
    pickQuickDate('昨天')
    await wait(() => {
      const list = callsOf(calls, 'FETCH_DESIGNER_DAILY_REPORT')
      expect(list[list.length - 1].variables.date).toBe(endOfDay(subDays(new Date(), 1)).getTime())
    })
    cleanup()
    const before = Date.now()
    const plain = setup({}, {}, '/employee-daily-report')
    await plain.settle()
    expect(callsOf(plain.calls, 'FETCH_DESIGNER_DAILY_REPORT')[0].variables.date).toBeGreaterThanOrEqual(before)
  })

  it('卡片標題、分頁提示、帳單列（指定 *、項目消費顯示消費、金額位數）；非最後一頁不顯示合計', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    const [first, second] = screenCards()
    expect(first.textContent).toContain('A01 Amy 王小美 2026/10/21 日報表 - 1/2')
    expect(within(first).getByText('1001*').closest('a')).toHaveAttribute('href', '/order/o-1')
    const rows = rowsOf(first)
    expect(rows[0]).toEqual(['1001*', '消費', '剪髮', '1,234.6', '1,000'])
    expect(rows[1]).toEqual(['1002', '店販', '洗髮精', '123,457', '0'])
    expect(rows[2]).toEqual(['接續下張'])
    expect(rows).toHaveLength(3)
    expect(second.textContent).toContain('- 2/2')
    expect(rowsOf(second)[0]).toEqual(['承上張'])
    expect(screenCards()[2].textContent).toContain('設計師d3 2026/10/21 日報表')
    expect(screenCards()[2].textContent).not.toContain(' - ')
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
  })

  it('隱藏 0 值時：當天或累計有數字的列才顯示；顯示金額時有金額(虛)與合計金額；互助換算金額取絕對值', async () => {
    const report = [{ ...AMY, isLastPage: true, totalPageCount: 1 }, AMY_P2, ZERO]
    const { settle } = setup({}, { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: report } })
    await settle()
    const [amy, page2, zero] = screenCards()
    // 十萬以上取整數
    expect(rowsOf(amy)[2]).toEqual(['合計', '', '', '124,691', '1,000'])
    expect(summaryRow(amy, '金額(虛)')).toEqual(['金額(虛)', '1,000', '10,000'])
    expect(summaryRow(amy, '實業績')).toEqual(['實業績', '2', '20'])
    expect(summaryRow(amy, '互助使用(點)')).toEqual(['互助使用(點)', '2/30.3', '20/300'])
    expect(summaryRow(amy, '客單價')).toEqual(['客單價', '250', '333.3'])
    expect(summaryRow(amy, '平均項次單價')).toEqual(['平均項次單價', '200', '250'])
    expect(summaryRow(amy, '會員卡業績')).toEqual(['會員卡業績', '0', '500'])
    expect(labelsOf(amy)).toContain('互助獲得金額 (不含點)')
    expect(summaryRow(amy, '互助獲得(點)點數/換算金額')).toEqual(['互助獲得(點)點數/換算金額', '2/2', '20/20'])
    // 第 2 頁：當天皆 0、累計有數字 → 列照樣顯示；只有累計會員卡抽成也顯示會員卡
    expect(labelsOf(page2)).toEqual(expect.arrayContaining(['實業績', '手續費', '總客數', '入金儲值', '會員卡抽成', '互助獲得金額 (不含點)']))
    // 全為 0 的設計師：隱藏可隱藏的列，只留固定列
    expect(labelsOf(zero).slice(1)).toEqual(['金額(虛)', '特殊抽成業績', '店販金額', '店販抽成', '互助使用(不含點)', '互助使用(點)'])
  })

  it('不隱藏 0 值、不顯示金額、不顯示互助獲得與換算金額：顯示所有列、互助獲得單列、合計不顯示金額', async () => {
    const report = [{ ...AMY, isLastPage: true, totalPageCount: 1 }, ZERO]
    const { settle } = setup({ price: false, helperPointPrice: false, hiddenZero: false, helperRetrieve: false }, { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: report } })
    await settle()
    const [amy, zero] = screenCards()
    await wait(() => expect(summaryRow(amy, '互助獲得')).toEqual(['互助獲得', '2', '20']))
    expect(rowsOf(amy)[2]).toEqual(['合計', '', '', '', '1,000'])
    expect(labelsOf(amy)).not.toContain('金額(虛)')
    expect(summaryRow(amy, '互助使用(點)')).toEqual(['互助使用(點)', '2', '20'])
    expect(labelsOf(zero)).toEqual(expect.arrayContaining(['實業績', '總客數', '客單價', '入金儲值', '互助獲得']))
    expect(labelsOf(zero)).not.toContain('會員卡業績')
  })

  it('隱藏 0 值且不顯示互助獲得時，全為 0 的設計師不顯示互助獲得；啟用會員卡時都顯示會員卡列', async () => {
    const { settle } = setup({ helperRetrieve: false, member: true }, { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: [ZERO, { ...AMY_P2, currentPageOrder: 1, totalPageCount: 1 }] } })
    await settle()
    const [zero, other] = screenCards()
    await wait(() => expect(labelsOf(zero)).toContain('會員卡業績'))
    expect(labelsOf(zero)).not.toContain('互助獲得')
    expect(summaryRow(other, '互助獲得')).toEqual(['互助獲得', '0', '7'])
  })
})

describe('設計師日報表：四捨五入與列印區塊', () => {
  it('列印區塊每 4 位一組；最佳化列印模式時項目欄加列印樣式', async () => {
    const { settle } = setup({ printMode: true })
    await settle()
    const groups = document.querySelectorAll('.EmployeeDailyReportCardPrintContainer')
    expect(Array.from(groups).map(g => g.querySelectorAll('.EmployeeDailyReportCardPrint').length)).toEqual([4, 2])
    await wait(() => expect(groups[0].querySelector('thead .itemPrint')).not.toBeNull())
    expect(printCards()[0].textContent).toContain('A01 Amy 王小美 10/21/2026 日報表 - 1/2')
  })

  it('四捨五入設定：卡片與列印區塊的金額、平均都取整數', async () => {
    const report = [{ ...AMY, isLastPage: true, totalPageCount: 1 }, AMY_P2, ZERO]
    const { settle } = setup({ mathRound: true }, { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: report } })
    await settle()
    const [amy] = screenCards()
    await wait(() => expect(rowsOf(amy)[0]).toEqual(['1001*', '消費', '剪髮', '1,235', '1,000']))
    expect(rowsOf(amy)[2]).toEqual(['合計', '', '', '124,691', '1,000'])
    expect(summaryRow(amy, '客單價')).toEqual(['客單價', '250', '333'])
    expect(summaryRow(amy, '平均項次單價')).toEqual(['平均項次單價', '200', '250'])
    expect(summaryRow(amy, '互助使用(點)')).toEqual(['互助使用(點)', '2/30', '20/300'])
    const print = printCards()[0]
    expect(rowsOf(print)[0]).toEqual(['1001*', '消費', '剪髮', '1235', '1000'])
  })

  it('四捨五入設定下換日期，列印區塊改成新日期的資料（不可留著上一天的資料）', async () => {
    const yesterdayEnd = endOfDay(subDays(new Date(), 1)).getTime()
    const { settle } = setup(
      { mathRound: true },
      {
        FETCH_DESIGNER_DAILY_REPORT: ({ date }) => ({
          designerDailyReport: date === yesterdayEnd ? [designer('y1', { user: { id: 'y1', name: '昨天的人', nickName: '', designerNo: '' } })] : [ZERO],
        }),
      }
    )
    await settle()
    await wait(() => expect(printCards()[0].textContent).toContain('設計師d3'))
    pickQuickDate('昨天')
    await settle()
    await wait(() => expect(screenCards()[0].textContent).toContain('昨天的人'))
    await wait(() => expect(printCards()[0].textContent).toContain('昨天的人'))
    expect(printCards()).toHaveLength(1)
  })

  it('沒有資料顯示無資料；報表與各項設定查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup({}, { FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const failed = setup({}, {
      FETCH_DESIGNER_DAILY_REPORT: new Error('查詢失敗'),
    })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    cleanup()
    const settingFailed = setup({}, {
      GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT: new Error('查詢失敗'),
      GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: new Error('查詢失敗'),
    })
    await settingFailed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screenCards().length).toBeGreaterThan(0)
  })
})
