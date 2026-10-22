// 保護「互助業績報表」：
// - 進頁查本月 1 日 00:00 到今天 23:59:59.999（台灣時間）、人員類別不限；選人員類別後送出該類別 id；快速選擇改查新區間
// - 每位人員一列，各類別依序顯示人數、抽成元、指定、抽成點（四捨五入）；最後一列是後端給的合計
// - 會員卡類別：店家啟用會員卡，或合計列的會員卡有任何數字時才顯示（表格與匯出一致）
// - 匯出 CSV：每人一列＋合計，欄名為「類別＋人數／抽成元／指定／抽成點」；換到沒有資料的區間時匯出不可留著上一個區間的資料
// - 沒有資料顯示「無資料」；報表、人員類別查詢失敗時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import { rowCells } from '../../__tests__/staffReportKit.test'
import HelperPerformanceReport from '..'

jest.setTimeout(20000)

const type = (typeName, count, priceNoPoint, designateCount, point) => ({ typeName, count, priceNoPoint, designateCount, point })
const row = (userName, membership = type('會員卡', 0, 0, 0, 0)) => ({
  userNo: userName,
  userName,
  helperPerformance: [type('洗髮', 3.4, 150.5, 1, 2.6), membership],
})
const REPORT = [row('小美'), row('阿明', type('會員卡', 0, 0, 0, 0)), row('合計')]
const JOB_TITLES = [
  { id: 'jt-1', jobTitle: '設計師' },
  { id: 'jt-2', jobTitle: '助理' },
]

const setup = (extra = {}) =>
  renderPage(<HelperPerformanceReport />, {
    route: '/helper-performance',
    fixtures: {
      GET_HELPER_PERFORMANCE: { helperPerformanceReport: REPORT },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
      MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: JOB_TITLES },
      ...extra,
    },
  })
const lastVariables = calls => {
  const list = callsOf(calls, 'GET_HELPER_PERFORMANCE')
  return list[list.length - 1].variables
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('互助業績報表', () => {
  it('進頁查本月到今天、類別不限；選人員類別送出類別 id；快速選擇昨天改查昨天', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_HELPER_PERFORMANCE')[0].variables).toEqual({
      input: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      jobTitle: [],
    })
    pickOption('人員類別', '助理')
    await wait(() => expect(lastVariables(calls).jobTitle).toEqual(['jt-2']))
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastVariables(calls)).toEqual({
        input: { startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() },
        jobTitle: ['jt-2'],
      })
    )
  })

  it('各類別四捨五入；未啟用會員卡且合計沒有會員卡數字時不顯示會員卡欄，匯出也不含', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByText('會員卡指定')).toBeNull()
    expect(rowCells('小美')).toEqual(['小美', '3', '151', '1', '3'])
    expect(rowCells('合計')).toEqual(['合計', '3', '151', '1', '3'])
    await wait(() => expect(exportedCsv()).toContain('"設計名稱","洗髮人數","洗髮抽成元","洗髮指定","洗髮抽成點"'))
    expect(exportedCsv()).toContain('"小美","3","151","1","3"')
    expect(exportedCsv()).toContain('"合計","3","151","1","3"')
    expect(exportedCsv()).not.toContain('會員卡')
  })

  it('啟用會員卡時顯示會員卡欄並匯出', async () => {
    const { settle } = setup({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } })
    await settle()
    await wait(() => expect(screen.getByText('會員卡指定')).toBeInTheDocument())
    expect(rowCells('小美')).toEqual(['小美', '3', '151', '1', '3', '0', '0', '0', '0'])
    await wait(() => expect(exportedCsv()).toContain('"會員卡人數","會員卡抽成元","會員卡指定","會員卡抽成點"'))
  })

  it('未啟用會員卡但合計列的會員卡有數字時仍顯示會員卡欄', async () => {
    const report = [row('小美', type('會員卡', 0, 0, 0, 1.2)), row('合計', type('會員卡', 0, 0, 0, 1.2))]
    const { settle } = setup({ GET_HELPER_PERFORMANCE: { helperPerformanceReport: report } })
    await settle()
    await wait(() => expect(screen.getByText('會員卡指定')).toBeInTheDocument())
    expect(rowCells('小美').slice(-4)).toEqual(['0', '0', '0', '1'])
  })

  it('合計列沒有會員卡類別時視為沒有會員卡數字', async () => {
    const report = [{ userNo: '1', userName: '小美', helperPerformance: [type('洗髮', 1, 1, 1, 1)] }, { userNo: '', userName: '合計', helperPerformance: [type('洗髮', 1, 1, 1, 1)] }]
    const { settle } = setup({ GET_HELPER_PERFORMANCE: { helperPerformanceReport: report } })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('"小美","1","1","1","1"'))
    expect(screen.queryByText('會員卡指定')).toBeNull()
  })

  it('換到沒有資料的區間：顯示無資料，匯出不可留著上一個區間的資料', async () => {
    const { settle } = setup({
      GET_HELPER_PERFORMANCE: ({ input }) => ({
        helperPerformanceReport: input.endDate === endOfDay(new Date()).getTime() ? REPORT : [],
      }),
    })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('"小美"'))
    pickQuickDate('昨天')
    await screen.findByText('無資料')
    await settle()
    expect(exportedCsv()).not.toContain('小美')
  })

  it('只回合計一列時匯出不可留著上一個區間的資料', async () => {
    const { settle } = setup({
      GET_HELPER_PERFORMANCE: ({ input }) => ({
        helperPerformanceReport: input.endDate === endOfDay(new Date()).getTime() ? REPORT : [row('合計')],
      }),
    })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('"小美"'))
    pickQuickDate('昨天')
    await settle()
    await wait(() => expect(screen.queryByText('小美')).toBeNull())
    expect(exportedCsv()).not.toContain('小美')
  })

  it('報表查詢失敗、人員類別查詢失敗時不整頁錯誤', async () => {
    const { settle } = setup({ GET_HELPER_PERFORMANCE: new Error('查詢失敗'), MERCHANT_JOBTITLE_POINT: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('報表匯出')).toBeInTheDocument()
    expect(document.querySelector('table')).toBeNull()
  })
})
