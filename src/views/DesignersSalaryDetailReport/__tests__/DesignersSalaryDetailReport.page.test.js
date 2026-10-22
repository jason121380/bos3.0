// 保護「薪資明細表」（各員工某月的加扣項總表）：
// - 預設查上個月 1 日（台灣時間）；快速選擇「本月」改查本月 1 日；網址指定日期時查該月
// - 加項表：店家使用中的加項依序成欄，員工沒有該項顯示 0；加項合計、指定／不指定／特殊抽業績、點數四捨五入；合計列＝各員工加總
// - 扣項表：實發金額、使用中的扣項（員工沒有扣項或沒有該項顯示 0）、扣項合計；合計列；店家沒有使用中的扣項時只有固定欄
// - 報表匯出：以目前月份查詢後端 Excel，取得網址後開新視窗下載
// - 列印呼叫瀏覽器列印；查詢失敗、回傳 null 時不整頁錯誤
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不產生真的檔案。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { startOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import DesignersSalaryDetailReport from '..'

jest.setTimeout(20000)

const SEPT = new Date(2026, 8, 1).getTime()
const USERS = [
  {
    userName: '王小美',
    userNo: 'A01',
    userHelperIdentity: '設計師',
    increase: [
      { itemName: '工資', price: 30000 },
      { itemName: '業績抽成', price: 12000.5 },
    ],
    increaseSum: 42000.5,
    decrease: [{ itemName: '勞健保費', price: 1200 }],
    decreaseSum: 1200,
    actualPaidPrice: 40800.5,
    designatePerformance: 80000.4,
    nonDesignatePerformance: 40000.6,
    helperRetrievePoint: 10.5,
    specialTruthPerformance: 5000,
  },
  {
    userName: '李助理',
    userNo: 'B01',
    userHelperIdentity: '助理',
    increase: [],
    increaseSum: 0,
    decrease: [],
    decreaseSum: 0,
    actualPaidPrice: 0,
    designatePerformance: 0,
    nonDesignatePerformance: 0,
    helperRetrievePoint: 3,
    specialTruthPerformance: 0,
  },
  {
    userName: '陳設計',
    userNo: 'A02',
    userHelperIdentity: '設計師',
    increase: [{ itemName: '工資', price: 28000 }],
    increaseSum: 28000,
    decrease: [{ itemName: '罰款', price: 300 }],
    decreaseSum: 300,
    actualPaidPrice: 27700,
    designatePerformance: 100,
    nonDesignatePerformance: 200,
    helperRetrievePoint: 0,
    specialTruthPerformance: 0,
  },
]
const detail = (extra = {}) => ({
  getUserSalaryDetail: {
    userSalaryDetail: USERS,
    usingSalaryIncreaseItem: [
      { order: 1, name: '工資' },
      { order: 2, name: '業績抽成' },
    ],
    usingSalaryDecreaseItem: [
      { order: 1, name: '勞健保費' },
      { order: 2, name: '罰款' },
    ],
    ...extra,
  },
})
const setup = (extra = {}, route = '/designers-salary-detail') =>
  renderPage(<DesignersSalaryDetailReport />, {
    route,
    fixtures: { FETCH_DESIGNERS_SALARY_DETAIL: detail(), GET_USER_SALARY_DETAIL_EXCEL: { getUserSalaryDetailExcel: 'https://files.example/salary.xlsx' }, ...extra },
  })
const tables = () => document.querySelectorAll('table')
const rowsOf = table => Array.from(table.querySelectorAll('tbody tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
const headsOf = table => Array.from(table.querySelectorAll('thead th')).map(th => th.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資明細表', () => {
  it('預設查上個月 1 日；快速選擇本月改查本月 1 日', async () => {
    const { calls, settle } = setup()
    await settle()
    const now = new Date()
    expect(callsOf(calls, 'FETCH_DESIGNERS_SALARY_DETAIL')[0].variables).toEqual({ date: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime() })
    pickQuickDate('本月')
    await wait(() => {
      const list = callsOf(calls, 'FETCH_DESIGNERS_SALARY_DETAIL')
      expect(list[list.length - 1].variables).toEqual({ date: startOfMonth(now).getTime() })
    })
  })

  it('加項表：使用中的加項成欄、沒有該項顯示 0、四捨五入；合計列', async () => {
    const { settle } = setup({}, `/designers-salary-detail?startDate=${SEPT}&endDate=${SEPT}`)
    await settle()
    const [increase] = tables()
    expect(headsOf(increase)).toEqual(['代號', '姓名', '身份', '工資', '業績抽成', '加項合計', '指定業績', '不指定業績', '特殊抽業績', '點數'])
    expect(rowsOf(increase)).toEqual([
      ['A01', '王小美', '設計師', '30000', '12000.5', '42001', '80000', '40001', '5000', '11'],
      ['B01', '李助理', '助理', '0', '0', '0', '0', '0', '0', '3'],
      ['A02', '陳設計', '設計師', '28000', '0', '28000', '100', '200', '0', '0'],
      // 工資 58000、業績抽成 12000.5→12001；加項合計 70000.5→70001；指定 80100.4→80100；不指定 40200.6→40201；點數 13.5→14
      ['合計:', '', '', '58000', '12001', '70001', '80100', '40201', '5000', '14'],
    ])
  })

  it('扣項表：實發金額、使用中的扣項（沒有扣項或沒有該項顯示 0）、扣項合計與合計列', async () => {
    const { settle } = setup()
    await settle()
    const [, decrease] = tables()
    expect(headsOf(decrease)).toEqual(['代號', '姓名', '實發金額', '勞健保費', '罰款', '扣項合計'])
    expect(rowsOf(decrease)).toEqual([
      ['A01', '王小美', '40801', '1200', '0', '1200'],
      ['B01', '李助理', '0', '0', '0', '0'],
      ['A02', '陳設計', '27700', '0', '300', '300'],
      ['合計:', '', '68501', '1200', '300', '1500'],
    ])
  })

  it('店家沒有使用中的加扣項時只有固定欄', async () => {
    const { settle } = setup({ FETCH_DESIGNERS_SALARY_DETAIL: detail({ usingSalaryIncreaseItem: [], usingSalaryDecreaseItem: [] }) })
    await settle()
    const [increase, decrease] = tables()
    expect(headsOf(increase)).toEqual(['代號', '姓名', '身份', '加項合計', '指定業績', '不指定業績', '特殊抽業績', '點數'])
    expect(headsOf(decrease)).toEqual(['代號', '姓名', '實發金額', '扣項合計'])
    expect(rowsOf(decrease).pop()).toEqual(['合計:', '', '68501', '1500'])
  })

  it('報表匯出：以目前月份查詢後端 Excel 並開新視窗下載', async () => {
    window.open = jest.fn()
    const { calls, settle } = setup({}, `/designers-salary-detail?startDate=${SEPT}&endDate=${SEPT}`)
    await settle()
    expect(window.open).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('報表匯出'))
    await wait(() => expect(window.open).toHaveBeenCalledWith('https://files.example/salary.xlsx'))
    expect(callsOf(calls, 'GET_USER_SALARY_DETAIL_EXCEL')[0].variables).toEqual({ date: SEPT })
  })

  it('列印呼叫瀏覽器列印；載入中顯示骨架；查詢失敗、回傳 null 時不整頁錯誤', async () => {
    window.print = jest.fn()
    const { settle } = setup({ FETCH_DESIGNERS_SALARY_DETAIL: new Error('查詢失敗') })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(tables()).toHaveLength(0)
    cleanup()
    const nulled = setup({ FETCH_DESIGNERS_SALARY_DETAIL: { getUserSalaryDetail: null } })
    await nulled.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
