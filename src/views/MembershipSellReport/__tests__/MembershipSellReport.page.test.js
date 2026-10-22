// 保護「會員卡銷售報表」：
// ① 查詢條件：預設查台灣時間「今天 00:00～23:59:59.999」、設計師／顧客／會員卡未選時送 null；篩選列改條件後依新條件重查。
// ② 表格：帳單日期以台灣時間顯示、帳單編號連到帳單詳細、到期日空白顯示「永久會籍」、手續費／業績／抽成四捨五入到小數 2 位，
//    合計列＝各明細列加總。
// ③ 匯出：明細與合計列與畫面一致；顧客姓名經 helper/exportCustomerMask——只有遮罩設定查詢成功且為 false 才匯出完整姓名，
//    設定為 true、查詢失敗一律遮罩（已修正，Jason 2026/10/22 長期授權）。
// ④ 沒有資料顯示「無資料」；報表查詢失敗不整頁錯誤（已修正：原本 data 為 undefined 時 reportData.forEach 整頁拋錯）。
// 篩選列（MerchantSearchBar）以替身代替，記錄頁面傳入的條件；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MembershipSellReport from '..'

const mockBars = []
const mockNextFilter = { value: {} }
jest.mock('components/MerchantSearchBar/index', () => props => {
  mockBars.push(props)
  return (
    <button type="button" onClick={() => props.onFilter({ ...props.values, ...mockNextFilter.value })}>
      {`篩選列：${props.visible.join(',')}`}
    </button>
  )
})
jest.mock('react-csv', () => ({
  CSVLink: ({ data, filename, children }) => (
    <a data-testid="csv" data-filename={filename} data-rows={JSON.stringify(data)} href="#csv">
      {children}
    </a>
  ),
}))
jest.setTimeout(20000)

// 台灣時間 → 時間戳（與裝置時區無關）
const tw = (y, m, d, h = 0, mi = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h - 8, mi, s, ms)
const twToday = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
}

const ROWS = [
  {
    orderId: 'o1', orderNo: 1001, orderDate: tw(2026, 10, 21, 23, 50), designerName: '小美', customerName: '陳小美',
    membershipName: '金卡', sellPrice: 3000, count: 1, summary: 3000, handlingFee: 30.456, truth: 2969.544, rake: 296.9544,
    remark: '首購', expiryDate: tw(2027, 10, 21, 0, 10),
  },
  {
    orderId: 'o2', orderNo: 1002, orderDate: tw(2026, 10, 22, 0, 5), designerName: '阿明', customerName: '歐陽娜娜',
    membershipName: '銀卡', sellPrice: 1500, count: 2, summary: 3000, handlingFee: 0, truth: 3000, rake: 150.006,
    remark: null, expiryDate: null,
  },
]

const setup = (fixtures = {}, options = {}) =>
  renderPage(<MembershipSellReport />, {
    fixtures: { GET_MEMBERSHIP_SELL_REPORT: { membershipSellReport: ROWS }, ...fixtures },
    ...options,
  })
const csvRows = () => JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))

beforeEach(() => {
  loginAs()
  mockBars.length = 0
  mockNextFilter.value = {}
})
afterEach(cleanup)

describe('會員卡銷售報表：查詢條件', () => {
  it('預設查台灣時間今天整天，未選的條件送 null；篩選列的條件改變後依新條件重查', async () => {
    const { calls, settle } = setup()
    await settle()
    const [y, m, d] = twToday()
    expect(callsOf(calls, 'GET_MEMBERSHIP_SELL_REPORT')[0].variables).toEqual({
      input: {
        dateRange: { startDate: tw(y, m, d), endDate: tw(y, m, d, 23, 59, 59, 999) },
        designerId: null,
        customerId: null,
        membershipId: null,
      },
    })
    // 日期一個篩選列、其餘條件收進另一個篩選列（不讀網址日期）
    expect(mockBars.map(p => p.visible.join(','))).toContain('datePicker')
    const filterBar = mockBars.find(p => p.visible.includes('membershipcard'))
    expect(filterBar.visible).toEqual(['employee', 'customer', 'membershipcard'])
    expect(filterBar.stopGetQueryString).toBe(true)

    mockNextFilter.value = { startDate: tw(2026, 10, 1), endDate: tw(2026, 10, 31, 23, 59, 59, 999), employeeId: 'u1', customerId: 'c1', membershipId: 'm1' }
    fireEvent.click(screen.getByText('篩選列：employee,customer,membershipcard'))
    await settle()
    let last = callsOf(calls, 'GET_MEMBERSHIP_SELL_REPORT').pop()
    expect(last.variables).toEqual({
      input: {
        dateRange: { startDate: tw(2026, 10, 1), endDate: tw(2026, 10, 31, 23, 59, 59, 999) },
        designerId: 'u1',
        customerId: 'c1',
        membershipId: 'm1',
      },
    })
    // 日期篩選列換日期
    mockNextFilter.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 1, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('篩選列：datePicker'))
    await settle()
    last = callsOf(calls, 'GET_MEMBERSHIP_SELL_REPORT').pop()
    expect(last.variables.input.dateRange).toEqual({ startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 1, 23, 59, 59, 999) })
  })
})

describe('會員卡銷售報表：表格與合計', () => {
  it('台灣日期、帳單連結、永久會籍、四捨五入到小數 2 位；合計列為明細加總', async () => {
    const { settle } = setup()
    await settle()
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')
    // 表頭＋2 筆＋合計
    expect(rows).toHaveLength(4)
    const cells = r => within(rows[r]).getAllByRole('cell').map(c => c.textContent)
    expect(cells(1)).toEqual(['2026/10/21', '#1001', '小美', '陳小美', '金卡', '3,000', '1', '3,000', '30.46', '2,969.54', '296.95', '首購', '2027/10/21'])
    expect(cells(2)).toEqual(['2026/10/22', '#1002', '阿明', '歐陽娜娜', '銀卡', '1,500', '2', '3,000', '0', '3,000', '150.01', '', '永久會籍'])
    expect(within(rows[1]).getByText('#1001').closest('a')).toHaveAttribute('href', '/order/o1')
    expect(within(rows[1]).getByText('#1001').closest('a')).toHaveAttribute('target', '_blank')
    // 合計：售價 4500、數量 3、小計 6000、手續費 30.46、業績 5969.54、抽成 446.96
    expect(cells(3)).toEqual(['', '', '合計', '4,500', '3', '6,000', '30.46', '5,969.54', '446.96', ''])
  })

  it('查詢進行中顯示載入中，回來後顯示表格', async () => {
    const { settle } = setup({}, { delays: { GET_MEMBERSHIP_SELL_REPORT: 50 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('沒有資料顯示「無資料」，匯出只有合計列（全為 0）', async () => {
    const { settle } = setup({ GET_MEMBERSHIP_SELL_REPORT: { membershipSellReport: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    expect(csvRows()).toEqual([
      { 帳單日期: '', 帳單編號: '', 設計師姓名: ' ', 顧客姓名: '', 會員卡名稱: '合計', 實際售價: 0, 數量: 0, 小計: 0, 手續費: 0, '販賣業績(實)': 0, 抽成: 0, 備註: '', 到期日: '' },
    ])
  })

  // 已修正：查詢失敗時 data 為 undefined，原本 setReportData(undefined) 後 reportData.forEach 整頁拋錯
  it('報表查詢失敗不整頁錯誤，顯示「無資料」', async () => {
    const { settle } = setup({ GET_MEMBERSHIP_SELL_REPORT: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})

describe('會員卡銷售報表：匯出', () => {
  it('遮罩設定為 false：匯出完整姓名，明細與合計列與畫面一致', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    await settle()
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '會員卡銷售報表.csv')
    expect(csvRows()).toEqual([
      {
        帳單日期: '2026/10/21', 帳單編號: '#1001', 設計師姓名: '小美', 顧客姓名: '陳小美', 會員卡名稱: '金卡', 實際售價: 3000,
        數量: 1, 小計: 3000, 手續費: 30.46, '販賣業績(實)': 2969.54, 抽成: 296.95, 備註: '首購', 到期日: '2027/10/21',
      },
      {
        帳單日期: '2026/10/22', 帳單編號: '#1002', 設計師姓名: '阿明', 顧客姓名: '歐陽娜娜', 會員卡名稱: '銀卡', 實際售價: 1500,
        數量: 2, 小計: 3000, 手續費: 0, '販賣業績(實)': 3000, 抽成: 150.01, 備註: null, 到期日: '永久會籍',
      },
      {
        帳單日期: '', 帳單編號: '', 設計師姓名: ' ', 顧客姓名: '', 會員卡名稱: '合計', 實際售價: 4500, 數量: 3, 小計: 6000,
        手續費: 30.46, '販賣業績(實)': 5969.54, 抽成: 446.96, 備註: '', 到期日: '',
      },
    ])
  })

  // 已修正：匯出原本一律含完整顧客姓名
  it.each([
    ['設定為 true', { GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true } }],
    ['設定查詢失敗', { GET_CUSTOMER_DATA_MARKED: new Error('壞了') }],
  ])('%s：匯出的顧客姓名遮罩（畫面不遮）', async (_, fixtures) => {
    const { settle } = setup({
      ...fixtures,
      GET_MEMBERSHIP_SELL_REPORT: { membershipSellReport: [...ROWS, { ...ROWS[1], orderId: 'o3', customerName: null }] },
    })
    await settle()
    await wait(() => expect(csvRows().map(r => r.顧客姓名)).toEqual(['陳*美', '歐陽*娜娜', '', '']))
    expect(screen.getByText('陳小美')).toBeInTheDocument()
  })
})
