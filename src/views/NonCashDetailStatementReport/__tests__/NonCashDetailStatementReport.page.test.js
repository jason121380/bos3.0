// 保護「非現金明細對帳單」：
// - 預設查今天 00:00～23:59:59.999（台灣時間）、依日期排序、不限設計師；快速選擇改查該區間
// - 排序切換（日期／設計師）送出 orderBy，再按一次已選的不改變；選設計師後按搜尋送出設計師 id，沒選送出空陣列
// - 表格：各其他付款方式與第三方卡券的「金額／手續費（四捨五入）」、入金使用；點數折抵欄在啟用點數或區間內有點數折抵時顯示；合計列依名稱加總
// - 匯出 CSV：客戶姓名依「客資遮罩」設定（helper/exportCustomerMask：只有查詢成功且設定為 false 才不遮罩；設定晚到也重算），合計列
// - 對帳單或點數設定查詢失敗不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import NonCashDetailStatementReport from '..'

jest.setTimeout(30000)

const DESIGNERS = [
  { userId: 'd-1', userName: '阿美', userNickName: '', userNo: 'D1' },
  { userId: 'd-2', userName: '阿文', userNickName: '', userNo: 'D2' },
]
const ROWS = [
  {
    date: Date.UTC(2026, 9, 19, 16, 30), // 台灣 2026/10/20
    serialNumber: 1, orderNo: 'A001', customerName: '王小美', designerNo: 'D1', designerName: '阿美',
    otherPay: [{ name: 'LINE Pay', price: 1000, handlingFee: 25.6 }],
    thirdPartTicket: [{ name: '旅遊券', price: 500, handlingFee: 10.4 }],
    walletUsed: 0, bonusDecount: 0,
  },
  {
    date: Date.UTC(2026, 9, 20, 16, 30), // 台灣 2026/10/21
    serialNumber: 2, orderNo: 'A002', customerName: '陳大文', designerNo: 'D2', designerName: '阿文',
    otherPay: [{ name: 'LINE Pay', price: 2000, handlingFee: 51.2 }],
    thirdPartTicket: [{ name: '旅遊券', price: 0, handlingFee: 0 }],
    walletUsed: 300, bonusDecount: 50,
  },
]
const STATEMENT = {
  nonCashDetailStatement: ROWS,
  summary: { orderCount: 2, walletUsed: 300, bonusDecount: 50 },
  thirdPartTicketUsing: ['旅遊券'],
  otherPayUsing: ['LINE Pay'],
}
const fixtures = ({ statement = STATEMENT, bonus = false, marked = false, ...extra } = {}) => ({
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: DESIGNERS },
  GET_NON_CASH_DETAIL_STATEMENT: { nonCashDetailStatement: statement },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonus },
  GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: marked },
  ...extra,
})
const setup = ({ fixtureOptions, ...options } = {}) =>
  renderPage(<NonCashDetailStatementReport />, { fixtures: fixtures(fixtureOptions), route: '/report/non-cash-statement', ...options })
const lastInput = calls => callsOf(calls, 'GET_NON_CASH_DETAIL_STATEMENT').pop().variables.input
// 金額／手續費兩個 span 以「|」相接
const cellText = td => {
  const pair = td.querySelectorAll('span span')
  return pair.length ? [...pair].map(s => s.textContent).join('|') : td.textContent
}
const bodyRows = () => [...document.querySelectorAll('tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(cellText))
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('非現金明細對帳單', () => {
  it('預設查今天、依日期、不限設計師；快速選擇「昨天」改查昨天', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_NON_CASH_DETAIL_STATEMENT')[0].variables.input).toEqual({
      dateRange: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      orderBy: 'DATE',
      designerId: [],
    })
    pickQuickDate('昨天')
    await wait(() =>
      expect(lastInput(calls).dateRange).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    )
  })

  it('排序切換送出 orderBy，再按一次已選的不改變；選設計師後搜尋送出 id，移除後送出空陣列', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    await wait(() => expect(lastInput(calls).orderBy).toBe('DESIGNER'))
    fireEvent.click(screen.getByText('設計師', { selector: 'button' }))
    expect(screen.getByText('設計師', { selector: 'button' })).toHaveAttribute('aria-pressed', 'true')
    await settle()
    pickOption('設計師名稱', '阿文')
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(calls).designerId).toEqual(['d-2']))
    await settle()
    fireEvent.mouseDown(screen.getByLabelText('移除 阿文'))
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(calls).designerId).toEqual([]))
    expect(lastInput(calls).orderBy).toBe('DESIGNER')
  })

  it('表格：付款方式欄位、金額／手續費、入金使用、點數折抵（區間內有折抵即顯示）與合計', async () => {
    const { settle } = setup()
    await settle()
    expect(headers()).toEqual(['帳單日期 ', '序號 ', '帳單編號 ', '客戶姓名', '設計師代號 ', '設計師姓名 ', 'LINE Pay金額  手續費', '旅遊券金額   手續費', '入金使用金額', '點數折抵金額'])
    expect(bodyRows()).toEqual([
      ['2026/10/20', '1', 'A001', '王小美', 'D1', '阿美', '1,000|26', '500|10', '0', '0'],
      ['2026/10/21', '2', 'A002', '陳大文', 'D2', '阿文', '2,000|51', '0|0', '300', '50'],
      ['合計', '3,000|77', '500|10', '300', '50'],
    ])
  })

  it('未啟用點數且區間內沒有點數折抵時不顯示點數欄；啟用時顯示', async () => {
    const statement = { ...STATEMENT, summary: { ...STATEMENT.summary, bonusDecount: 0 } }
    const first = setup({ fixtureOptions: { statement } })
    await first.settle()
    expect(headers()).not.toContain('點數折抵金額')
    expect(exportedCsv()).not.toContain('點數折抵金額')
    cleanup()
    const second = setup({ fixtureOptions: { statement, bonus: true } })
    await second.settle()
    expect(headers()).toContain('點數折抵金額')
  })

  it('匯出：客資遮罩設定為 false 時匯出完整姓名，含合計列', async () => {
    const { settle } = setup()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"帳單日期","序號","帳單編號","客戶姓名","設計師代號","設計師姓名","LINE Pay金額/手續費","第三方卡券旅遊券金額/手續費","入金使用金額","點數折抵金額"')
    expect(csv).toContain('"2026/10/20","1","A001","王小美","D1","阿美","1000/26","500/10","0","0"')
    expect(csv).toContain('"2026/10/21","2","A002","陳大文","D2","阿文","2000/51","0/0","300","50"')
    expect(csv).toContain('"合計","","","","","","3000/77","500/10","300","50"')
  })

  it('匯出：客資遮罩設定開啟或查詢失敗時遮罩姓名；設定晚到時重算', async () => {
    const masked = setup({ fixtureOptions: { marked: true } })
    await masked.settle()
    expect(exportedCsv()).toContain('"A001","王*美"')
    expect(exportedCsv()).toContain('"A002","陳*文"')
    expect(screen.getByText('王小美')).toBeInTheDocument()
    cleanup()
    const failed = setup({ fixtureOptions: { GET_CUSTOMER_DATA_MARKED: new Error('設定查詢失敗') } })
    await failed.settle()
    expect(exportedCsv()).toContain('"A001","王*美"')
    cleanup()
    const late = setup({ delays: { GET_CUSTOMER_DATA_MARKED: 300 } })
    await wait(() => expect(exportedCsv()).toContain('"A001","王*美"'))
    await late.settle()
    expect(exportedCsv()).toContain('"A001","王小美"')
  })

  it('對帳單或點數設定查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ fixtures: { GET_USERS_ORDERABLE_LIST: { getUserOrderableList: DESIGNERS } }, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('搜尋')).toBeInTheDocument()
  })
})
