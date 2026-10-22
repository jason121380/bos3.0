// 保護「互助日報表」：
// - 以網址或日期選擇的那一天查詢（date＝選取日的時間戳，台灣時間）、人員類別不限；選人員類別送出 identity；換日期或類別時重新讀「點數換算金額」設定
// - 每位助理一張卡：標題「代號 暱稱 姓名 日期（台灣時間） 互助報表」；每筆互助連到帳單；只有點數的紀錄金額欄留白、點數為 0 留白；合計列
// - 日合計／累計：店家設定顯示點數換算金額時顯示「點數/換算金額」；會員卡兩列在啟用會員卡或累計有會員卡數字時才顯示
// - 設計師欄名依「報表顯示設計師代號」設定
// - 列印區塊：每 4 張卡一組（列印範本，不改，只驗證分組與最佳化列印模式的樣式掛鉤）
// - 沒有資料顯示「無資料」；報表、人員類別查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfDay, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import DecreaseDailyReport from '..'

jest.setTimeout(20000)

const DAY = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const summary = (extra = {}) => ({
  priceRetrieveWithoutPoint: 1200,
  priceRetrieveFromPoint: 300,
  point: 3,
  productPerformance: 5000,
  productRake: 500,
  membershipPerformance: 0,
  membershipRake: 0,
  ...extra,
})
const helper = (id, extra = {}) => ({
  user: { id, name: `助理${id}`, nickName: '', designerNo: '' },
  helperRecord: [],
  helperRecordPriceSummary: 0,
  helperRecordPointSummary: 0,
  summaryCurrentDay: summary(),
  summaryTillNow: summary(),
  ...extra,
})
const AMY = helper('h1', {
  user: { id: 'h1', name: '王小美', nickName: 'Amy', designerNo: 'A01' },
  helperRecord: [
    { orderId: 'o-1', orderNo: '1001', isDesignate: true, itemName: '洗髮\n護髮', designer: { nameForReport: '阿明' }, price: 1200, point: 0 },
    { orderId: 'o-2', orderNo: '1002', isDesignate: false, itemName: '剪髮', designer: null, price: 0, point: 3 },
  ],
  helperRecordPriceSummary: 1200,
  helperRecordPointSummary: 3,
  summaryTillNow: summary({ priceRetrieveWithoutPoint: 12000, point: 30, priceRetrieveFromPoint: 3000 }),
})
const FIXTURES = {
  GET_HELPER_DAILY_REPORT: { helperDailyReport: [AMY, helper('h2'), helper('h3'), helper('h4'), helper('h5')] },
  GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isHelperPointPriceDisplay: true } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_IS_OPTIMIZATION_PRINT_MODES: { getIsOptimizationPrintModeOn: false },
  GET_DESIGNER_NAME_FOR_REPORT_TYPE: { getDesignerNameForReportType: 'NAME' },
  MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: [{ id: 'jt-1', jobTitle: '助理' }, { id: 'jt-2', jobTitle: '設計師' }] },
}
const setup = (extra = {}, route = `/decrease-daily-report?startDate=${DAY}&endDate=${DAY}`) =>
  renderPage(<DecreaseDailyReport />, { route, fixtures: { ...FIXTURES, ...extra } })
const lastInput = calls => {
  const list = callsOf(calls, 'GET_HELPER_DAILY_REPORT')
  return list[list.length - 1].variables.input
}
const screenCard = name => screen.getAllByText(new RegExp(name)).find(n => n.closest('.noprint')).closest('.noprint')
const summaryRow = (card, label) =>
  Array.from(within(card).getByText(label, { exact: false }).closest('tr').querySelectorAll('td')).map(td => td.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('互助日報表：查詢條件', () => {
  it('以網址指定的那一天查詢；選人員類別送 identity；換日期或類別時重新讀點數換算設定', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(lastInput(calls)).toEqual({ date: DAY, identity: [] })
    const settingCalls = () => callsOf(calls, 'GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT').length
    const before = settingCalls()
    pickOption('人員類別', '設計師')
    await wait(() => expect(lastInput(calls)).toEqual({ date: DAY, identity: ['jt-2'] }))
    await settle()
    pickQuickDate('昨天')
    await wait(() => expect(lastInput(calls)).toEqual({ date: startOfDay(subDays(new Date(), 1)).getTime(), identity: ['jt-2'] }))
    await settle()
    expect(settingCalls()).toBeGreaterThan(before)
  })

  it('沒有指定日期時以現在查詢；列印抬頭為店名與日期', async () => {
    window.print = jest.fn()
    const before = Date.now()
    const { calls, settle } = setup({}, '/decrease-daily-report')
    await settle()
    expect(lastInput(calls).date).toBeGreaterThanOrEqual(before)
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(document.querySelector('.merchantNamePrint .merchantNamePrint').textContent).toContain('測試店')
  })
})

describe('互助日報表：卡片內容', () => {
  it('標題（台灣日期）、互助紀錄連到帳單、只有點數的紀錄金額留白、合計列', async () => {
    const { settle } = setup()
    await settle()
    const card = screenCard('王小美')
    expect(within(card).getByText('A01 Amy 王小美 10/21/2026 互助報表')).toBeInTheDocument()
    expect(within(card).getByText('#1001').closest('a')).toHaveAttribute('href', '/order/o-1')
    const rows = within(card).getAllByRole('row').map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
    expect(rows[1]).toEqual(['#1001', '洗髮\n護髮', '阿明', '1,200', ''])
    expect(rows[2]).toEqual(['#1002', '剪髮', '', '', '3'])
    expect(rows[3]).toEqual(['合計', '', '', '1,200', '3'])
    expect(within(card).getAllByRole('columnheader').map(th => th.textContent).slice(0, 5)).toEqual(['#', '項目', '設計師', '金額', '點'])
    // 沒有代號、暱稱時標題只有姓名
    expect(within(screenCard('助理h2')).getByText(/助理h2 10\/21\/2026 互助報表/)).toBeInTheDocument()
  })

  it('顯示點數換算金額時為「點數/換算金額」；未啟用會員卡且累計為 0 時不顯示會員卡列', async () => {
    const { settle } = setup()
    await settle()
    const card = screenCard('王小美')
    expect(summaryRow(card, '互助獲得金額')).toEqual(['互助獲得金額(不含點)', '1,200', '12,000'])
    expect(summaryRow(card, '點數/換算金額')).toEqual(['互助獲得(點)點數/換算金額', '3/300', '30/3,000'])
    expect(summaryRow(card, '店販業績')).toEqual(['店販業績', '5,000', '5,000'])
    expect(summaryRow(card, '店販抽成')).toEqual(['店販抽成', '500', '500'])
    expect(within(card).queryByText('會員卡業績')).toBeNull()
  })

  it('不顯示換算金額時只顯示點數；報表設計師欄依設定顯示「#設」', async () => {
    const { settle } = setup({
      GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isHelperPointPriceDisplay: false } },
      GET_DESIGNER_NAME_FOR_REPORT_TYPE: { getDesignerNameForReportType: 'NO' },
    })
    await settle()
    const card = screenCard('王小美')
    await wait(() => expect(summaryRow(card, '互助獲得 - 點數')).toEqual(['互助獲得 - 點數', '3', '30']))
    expect(within(card).getByText('#設')).toBeInTheDocument()
  })

  it('啟用會員卡，或累計有會員卡業績／抽成時顯示會員卡兩列', async () => {
    const report = [
      helper('m1', { summaryTillNow: summary({ membershipPerformance: 800 }) }),
      helper('m2', { summaryTillNow: summary({ membershipRake: 80 }) }),
      helper('m3'),
    ]
    const { settle } = setup({ GET_HELPER_DAILY_REPORT: { helperDailyReport: report } })
    await settle()
    expect(summaryRow(screenCard('助理m1'), '會員卡業績')).toEqual(['會員卡業績', '0', '800'])
    expect(summaryRow(screenCard('助理m2'), '會員卡抽成')).toEqual(['會員卡抽成', '0', '80'])
    expect(within(screenCard('助理m3')).queryByText('會員卡業績')).toBeNull()
    cleanup()
    const active = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true }, GET_HELPER_DAILY_REPORT: { helperDailyReport: [helper('m3')] } })
    await active.settle()
    await wait(() => expect(within(screenCard('助理m3')).getByText('會員卡業績')).toBeInTheDocument())
  })

  it('列印區塊每 4 張卡一組；最佳化列印模式時項目欄加列印樣式', async () => {
    const { settle } = setup({ GET_IS_OPTIMIZATION_PRINT_MODES: { getIsOptimizationPrintModeOn: true } })
    await settle()
    const groups = document.querySelectorAll('.DecreaseDailyReportCardPrintContainer')
    expect(Array.from(groups).map(g => g.querySelectorAll('.DecreaseDailyReportCardPrint').length)).toEqual([4, 1])
    await wait(() => expect(groups[0].querySelector('.itemPrint')).not.toBeNull())
    const printRows = Array.from(groups[0].querySelectorAll('tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
    expect(printRows).toContainEqual(['#1002', '剪髮', '', '', '3'])
    expect(printRows).toContainEqual(['互助獲得(點)點數/換算金額', '3/300', '30/3000'])
  })

  it('列印區塊：不顯示換算金額、會員卡列與一般列印模式', async () => {
    const { settle } = setup({
      GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: { getPriceDisplayOnDailyReportDefault: { isHelperPointPriceDisplay: false } },
      GET_HELPER_DAILY_REPORT: { helperDailyReport: [helper('p1', { summaryTillNow: summary({ membershipRake: 5 }) }), helper('p2', { summaryTillNow: summary({ membershipPerformance: 9 }) }), helper('p3')] },
    })
    await settle()
    const group = document.querySelector('.DecreaseDailyReportCardPrintContainer')
    expect(group.querySelector('.itemPrint')).toBeNull()
    const cards = group.querySelectorAll('.DecreaseDailyReportCardPrint')
    expect(cards).toHaveLength(3)
    await wait(() => expect(within(cards[0]).getByText('互助獲得 - 點數')).toBeInTheDocument())
    expect(within(cards[0]).getByText('會員卡抽成')).toBeInTheDocument()
    expect(within(cards[1]).getByText('會員卡業績')).toBeInTheDocument()
    expect(within(cards[2]).queryByText('會員卡業績')).toBeNull()
  })

  it('沒有資料顯示無資料', async () => {
    const { settle } = setup({ GET_HELPER_DAILY_REPORT: { helperDailyReport: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('報表、人員類別查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup({ GET_HELPER_DAILY_REPORT: new Error('查詢失敗'), MERCHANT_JOBTITLE_POINT: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})

