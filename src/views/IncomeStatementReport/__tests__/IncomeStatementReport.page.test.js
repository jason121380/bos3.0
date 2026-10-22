// 保護「損益表」：
// - 預設以「現在」查當月；快速選擇「上個月」改查上個月 1 日；網址帶的月份直接查詢（台灣時間）
// - 營業科目：收入（四捨五入）與佔收入合計 %、支出（負數）與佔支出合計 %；小計 100%；損益＝收入＋支出、損益率＝損益÷收入（收入為 0 時 0%）
// - 「卡券販賣(不入業績)」「入金儲值(不入業績)」「暫收墊款」列在損益之後、不算收入 %；
//   但支出小計目前把這幾科的支出也算進去（小計≠上方支出列加總、影響損益）——鎖住現況，已知缺口（待 Jason 決定）
// - 匯出 CSV 與畫面同一組科目；查詢失敗不整頁錯誤；列印呼叫瀏覽器列印
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import IncomeStatementReport from '..'

jest.setTimeout(20000)

const subject = (subjectName, cashRevenue, cashExpenditure) => ({ subjectNumber: '', subjectName, cashRevenue, cashExpenditure, remark: '' })
const STATEMENT = [
  subject('服務收入', 30000, 0),
  subject('店販收入', 10000.4, 0),
  subject('薪資', 0, -15000),
  subject('房租', 0, -5000),
  subject('卡券販賣(不入業績)', 8000, 0),
  subject('入金儲值(不入業績) - 現金', 2000, 0),
  subject('入金儲值(不入業績) - 其他支付方式', 0, 0),
  subject('暫收墊款(ex.學費)', 0, -300),
]
const setup = ({ statement = STATEMENT, ...options } = {}) =>
  renderPage(<IncomeStatementReport />, {
    fixtures: { GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE: { merchantIncomeStatementV2ForOuterStore: statement } },
    route: '/report/income-statement',
    ...options,
  })
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent))
// 匯出內容含「%」：jsdom 沒有 createObjectURL，react-csv 直接把 CSV 原文放進 data URI（未編碼），不能 decodeURIComponent
const exportedCsv = () => screen.getByText('報表匯出').closest('a').getAttribute('href')
const lastDate = calls => callsOf(calls, 'GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE').pop().variables.date

beforeEach(() => loginAs())
afterEach(cleanup)

describe('損益表', () => {
  it('預設以現在查詢；快速選擇「上個月」改查上個月 1 日；網址帶的月份直接查詢', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE')[0].variables.date).toBeGreaterThanOrEqual(before)
    pickQuickDate('上個月')
    await wait(() => expect(lastDate(calls)).toBe(startOfMonth(subMonths(new Date(), 1)).getTime()))
    cleanup()
    const start = new Date(2026, 7, 1).getTime()
    const second = setup({ route: `/report/income-statement?startDate=${start}&endDate=${start}` })
    await second.settle()
    expect(lastDate(second.calls)).toBe(start)
    expect(document.querySelector('.merchantNamePrint').textContent).toContain('測試店   2026-08   損益表')
  })

  it('營業科目、小計、損益與非營業科目（支出小計含非營業科目：已知缺口）', async () => {
    const { settle } = setup()
    await settle()
    expect(bodyRows()).toEqual([
      ['服務收入', '30000', '75%', '', ''],
      ['店販收入', '10000', '25%', '', ''],
      ['薪資', '', '', '-15000', '74%'],
      ['房租', '', '', '-5000', '25%'],
      ['小計', '40000', '100%', '-20300', '100%'],
      ['損益', '19700', '49%', '', ''],
      ['卡券販賣(不入業績)', '8000', '', '', ''],
      ['入金儲值(不入業績) - 現金', '2000', '', '', ''],
      ['入金儲值(不入業績) - 其他支付方式', '', '', '', ''],
      ['暫收墊款(ex.學費)', '', '', '-300', ''],
    ])
  })

  it('匯出 CSV：營業科目、小計、損益與非營業科目', async () => {
    const { settle } = setup()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"科目","加項","%","扣項","% "')
    expect(csv).toContain('"服務收入","30000","75%","0","0"')
    expect(csv).toContain('"薪資","0","0","-15000","74%"')
    expect(csv).toContain('"小計","40000","100%","-20300","100%"')
    expect(csv).toContain('"損益","19700","49","",""')
    expect(csv).toContain('"卡券販賣(不入業績)","8000","","0",""')
    expect(csv).toContain('"暫收墊款(ex.學費)","0","","-300",""')
  })

  it('沒有收入時損益率為 0%', async () => {
    const { settle } = setup({ statement: [subject('薪資', 0, -1000)] })
    await settle()
    expect(bodyRows()).toEqual([
      ['薪資', '', '', '-1000', '100%'],
      ['小計', '0', '100%', '-1000', '100%'],
      ['損益', '-1000', '0%', '', ''],
    ])
    expect(exportedCsv()).toContain('"損益","-1000","0","",""')
  })

  it('列印呼叫瀏覽器列印；查詢失敗不整頁錯誤', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    cleanup()
    const failed = setup({ fixtures: {}, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(document.querySelector('table')).toBeNull()
  })
})
