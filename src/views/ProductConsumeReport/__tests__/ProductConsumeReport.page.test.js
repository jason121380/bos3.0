// 保護「商品消耗明細」：
// ① 查詢條件：預設台灣時間本月 1 日 00:00 起到現在、設計師未選送 null、用途固定送 []；篩選列換設計師後依新條件重查（空字串仍送 null）。
// ② 用途下拉列出後端的用途；選了用途時明細與彙總都只列該用途，選「全部」列出全部（彙總含「合計」列並加粗）。
// ③ 匯出：明細（台灣日期）＋空行＋彙總表頭＋彙總，隨用途篩選同步；匯出不含顧客資料。
// ④ 用途或明細查詢失敗都不整頁錯誤（已修正：原本 purpose 為 undefined 讀 .length、明細為 undefined 讀 .productConsumeRecord 整頁拋錯）。
// 篩選列（MerchantSearchBar）以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ProductConsumeReport from '..'

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

const tw = (y, m, d, h = 0, mi = 0) => Date.UTC(y, m - 1, d, h - 8, mi)
const twMonthStart = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  return tw(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)
}

const record = (purpose, extra = {}) => ({
  date: tw(2026, 10, 21, 23, 30), designerNo: 'D1', designerName: '小美', productNo: 'P1', productName: '洗髮精',
  count: 2, unit: '瓶', unitCost: 100, unitPrice: 350, subTotal: 700, purpose, ...extra,
})
const LIST = {
  productConsumeRecord: [record('店用'), record('贈送', { date: tw(2026, 10, 1, 0, 10), productNo: 'P2', productName: '護髮乳', count: 1, subTotal: 350 })],
  productConsumeSummary: [
    { purpose: '店用', cost: 200, price: 700, count: 2 },
    { purpose: '贈送', cost: 100, price: 350, count: 1 },
    { purpose: '合計', cost: 300, price: 1050, count: 3 },
  ],
}
const setup = (fixtures = {}) =>
  renderPage(<ProductConsumeReport />, {
    fixtures: { GET_PRODUCT_CONSUME_LIST: { productConsumeList: LIST }, GET_PRODUCT_PURPOSE: { getProductPurpose: ['店用', '贈送'] }, ...fixtures },
  })
const csvRows = () => JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))
const tables = () => screen.getAllByRole('table')
const bodyText = table => within(table).getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell').map(c => c.textContent))
const choosePurpose = label => {
  const select = screen.getByLabelText('用途')
  const index = [...select.options].findIndex(o => o.textContent === label)
  fireEvent.change(select, { target: { value: String(index) } })
}

beforeEach(() => {
  loginAs()
  mockBars.length = 0
  mockNextFilter.value = {}
})
afterEach(cleanup)

describe('商品消耗明細', () => {
  it('預設查台灣時間本月 1 日起到現在、設計師送 null；換設計師後重查', async () => {
    const before = Date.now()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'GET_PRODUCT_CONSUME_LIST')[0].variables.input
    expect(first.dateRange.startDate).toBe(twMonthStart())
    expect(first.dateRange.endDate).toBeGreaterThanOrEqual(before)
    expect(first.dateRange.endDate).toBeLessThanOrEqual(Date.now())
    expect(first.designerId).toBeNull()
    expect(first.purpose).toEqual([])
    expect(mockBars.find(p => p.visible.includes('employee')).stopGetQueryString).toBe(true)

    mockNextFilter.value = { employeeId: 'u1' }
    fireEvent.click(screen.getByText('篩選列：employee'))
    await settle()
    expect(callsOf(calls, 'GET_PRODUCT_CONSUME_LIST').pop().variables.input.designerId).toBe('u1')
    // 清掉設計師（空字串）仍送 null
    mockNextFilter.value = { employeeId: '' }
    fireEvent.click(screen.getByText('篩選列：employee'))
    await settle()
    expect(callsOf(calls, 'GET_PRODUCT_CONSUME_LIST').pop().variables.input.designerId).toBeNull()
    // 日期篩選列換日期
    mockNextFilter.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59) }
    fireEvent.click(screen.getByText('篩選列：datePicker'))
    await settle()
    expect(callsOf(calls, 'GET_PRODUCT_CONSUME_LIST').pop().variables.input.dateRange).toEqual({ startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59) })
  })

  it('明細查詢中顯示載入中', async () => {
    const { settle } = renderPage(<ProductConsumeReport />, { delays: { GET_PRODUCT_CONSUME_LIST: 50 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
  })

  it('全部用途：列出全部明細與彙總（合計加粗），匯出含明細、空行、彙總', async () => {
    const { settle } = setup()
    await settle()
    const [detail, summary] = tables()
    expect(bodyText(detail)).toEqual([
      ['2026/10/21', 'D1', '小美', 'P1', '洗髮精', '2', '瓶', '100', '350', '700', '店用'],
      ['2026/10/01', 'D1', '小美', 'P2', '護髮乳', '1', '瓶', '100', '350', '350', '贈送'],
    ])
    expect(bodyText(summary)).toEqual([['店用', '200', '700', '2'], ['贈送', '100', '350', '1'], ['合計', '300', '1,050', '3']])
    expect(within(summary).getByText('合計')).toHaveStyle('font-weight: bold')
    expect(within(summary).getByText('店用')).not.toHaveStyle('font-weight: bold')
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '商品消耗明細.csv')
    expect(csvRows()).toEqual([
      { 領料日期: '2026/10/21', 員工編號: 'D1', 員工姓名: '小美', 商品編號: 'P1', 商品名稱: '洗髮精', 數量: 2, 單位: '瓶', 成本: 100, 單價: 350, 小計: 700, 用途: '店用' },
      { 領料日期: '2026/10/01', 員工編號: 'D1', 員工姓名: '小美', 商品編號: 'P2', 商品名稱: '護髮乳', 數量: 1, 單位: '瓶', 成本: 100, 單價: 350, 小計: 350, 用途: '贈送' },
      { 領料日期: '' },
      { 領料日期: '', 員工編號: '成本', 員工姓名: '金額', 商品編號: '數量' },
      { 領料日期: '店用', 員工編號: 200, 員工姓名: 700, 商品編號: 2 },
      { 領料日期: '贈送', 員工編號: 100, 員工姓名: 350, 商品編號: 1 },
      { 領料日期: '合計', 員工編號: 300, 員工姓名: 1050, 商品編號: 3 },
    ])
  })

  it('選用途後明細、彙總與匯出只列該用途；改回「全部」恢復全部', async () => {
    const { settle } = setup()
    await settle()
    const select = screen.getByLabelText('用途')
    expect([...select.options].map(o => o.textContent).filter(Boolean)).toEqual(['全部', '店用', '贈送'])
    choosePurpose('贈送')
    const [detail, summary] = tables()
    expect(bodyText(detail).map(r => r[4])).toEqual(['護髮乳'])
    expect(bodyText(summary)).toEqual([['贈送', '100', '350', '1']])
    expect(csvRows()).toEqual([
      { 領料日期: '2026/10/01', 員工編號: 'D1', 員工姓名: '小美', 商品編號: 'P2', 商品名稱: '護髮乳', 數量: 1, 單位: '瓶', 成本: 100, 單價: 350, 小計: 350, 用途: '贈送' },
      { 領料日期: '' },
      { 領料日期: '', 員工編號: '成本', 員工姓名: '金額', 商品編號: '數量' },
      { 領料日期: '贈送', 員工編號: 100, 員工姓名: 350, 商品編號: 1 },
    ])
    choosePurpose('全部')
    expect(bodyText(tables()[0])).toHaveLength(2)
    expect(csvRows()).toHaveLength(7)
  })

  it('沒有用途時用途下拉停用', async () => {
    const { settle } = setup({ GET_PRODUCT_PURPOSE: { getProductPurpose: [] } })
    await settle()
    expect(screen.getByLabelText('用途')).toBeDisabled()
  })

  // 已修正：用途查詢失敗時 purpose 為 undefined，原本讀 purpose.length 整頁拋錯
  it('用途查詢失敗不整頁錯誤，用途下拉停用、明細照常顯示', async () => {
    const { settle } = setup({ GET_PRODUCT_PURPOSE: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByLabelText('用途')).toBeDisabled()
    expect(bodyText(tables()[0])).toHaveLength(2)
  })

  // 已修正：明細查詢失敗時 productConsumeList 為 undefined，原本 Results 讀 .productConsumeRecord 整頁拋錯
  it('明細查詢失敗不整頁錯誤，表格為空、匯出為空', async () => {
    const { settle } = setup({ GET_PRODUCT_CONSUME_LIST: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(bodyText(tables()[0])).toEqual([])
    expect(bodyText(tables()[1])).toEqual([])
    expect(csvRows()).toEqual([])
  })
})
