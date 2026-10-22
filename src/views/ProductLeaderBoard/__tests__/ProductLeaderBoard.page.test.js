// 保護「商品銷售排行榜」：
// ① 進頁即以台灣時間「本月 1 日 00:00～今天 23:59:59.999」、類型「店販」、不限商品查詢；換日期立即重查（沿用其他條件）。
// ② 類型（店販／自購，可複選）與商品樹狀選單只改條件，按「搜尋」才以新條件查詢。
// ③ 表格與匯出：逐列商品名稱、代號、次數、累計，合計列＝明細加總；資料回來前不顯示匯出與類型切換。
// ④ 查詢失敗後「搜尋」仍可按、可重試（已修正：原本 data 為 undefined 時搜尋鈕一直停用，只能換日期重試）。
// 日期選擇器、商品樹狀選單以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ProductLeaderBoard from '..'

const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ date, dateChange }) => (
    <button type="button" data-start={date.startDate} data-end={date.endDate} onClick={() => dateChange(mockNextDate.value)}>
      換日期（測試）
    </button>
  ),
}))
jest.mock('components/ProductListTreeView', () => ({
  __esModule: true,
  default: ({ onValueChange }) => (
    <button type="button" onClick={() => onValueChange(['p1', 'p2'])}>
      選商品（測試）
    </button>
  ),
}))
jest.mock('react-csv', () => ({
  CSVLink: ({ data, filename, children }) => (
    <a data-testid="csv" data-filename={filename} data-rows={JSON.stringify(data)} href="#csv">
      {children}
    </a>
  ),
}))
jest.setTimeout(20000)

const tw = (y, m, d, h = 0, mi = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h - 8, mi, s, ms)
const twToday = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
}
const BOARD = [
  { merchantName: '測試店', productName: '洗髮精', productNo: 'P1', totalCount: 3, totalPrice: 1050 },
  { merchantName: '測試店', productName: '護髮乳', productNo: 'P2', totalCount: 12, totalPrice: 4800 },
]
const setup = (fixtures = {}, options = {}) =>
  renderPage(<ProductLeaderBoard />, { fixtures: { GET_PRODUCT_LEADERBOAED_V2: { getProductLeaderBoardV2: BOARD }, ...fixtures }, ...options })
const queries = calls => callsOf(calls, 'GET_PRODUCT_LEADERBOAED_V2').map(c => c.variables.input)
const searchButton = () => screen.getByRole('button', { name: '搜尋' })

beforeEach(() => {
  loginAs()
  mockNextDate.value = null
})
afterEach(cleanup)

describe('商品銷售排行榜', () => {
  it('進頁以台灣時間本月查店販；換日期立即重查', async () => {
    const { calls, settle } = setup()
    await settle()
    const [y, m, d] = twToday()
    expect(queries(calls)[0]).toEqual({
      startDay: tw(y, m, 1),
      endDay: tw(y, m, d, 23, 59, 59, 999),
      productIds: [],
      types: ['SELLING'],
    })
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(queries(calls).pop()).toEqual({ startDay: tw(2026, 9, 1), endDay: tw(2026, 9, 30, 23, 59, 59, 999), productIds: [], types: ['SELLING'] })
    expect(screen.getByText('換日期（測試）')).toHaveAttribute('data-start', String(tw(2026, 9, 1)))
  })

  it('類型與商品只改條件，按「搜尋」才查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    const count = queries(calls).length
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('button', { name: '自購' }))
    fireEvent.click(screen.getByText('選商品（測試）'))
    await settle()
    expect(queries(calls)).toHaveLength(count)
    expect(screen.getByRole('button', { name: '自購' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(searchButton())
    await settle()
    expect(queries(calls).pop()).toMatchObject({ productIds: ['p1', 'p2'], types: ['SELLING', 'PICKING'] })
    // 取消店販
    fireEvent.click(screen.getByRole('button', { name: '店販' }))
    fireEvent.click(searchButton())
    await settle()
    expect(queries(calls).pop().types).toEqual(['PICKING'])
  })

  it('表格與匯出：逐列商品、合計列為加總', async () => {
    const { settle } = setup()
    await settle()
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map(r => within(r).getAllByRole('cell').map(c => c.textContent))).toEqual([
      ['洗髮精', 'P1', '3', '1,050'],
      ['護髮乳', 'P2', '12', '4,800'],
      ['合計', '', '15', '5,850'],
    ])
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '商品銷售排行榜.csv')
    expect(JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))).toEqual([
      { 商品名稱: '洗髮精', 商品代號: 'P1', 消費次數: 3, 消費累計: 1050 },
      { 商品名稱: '護髮乳', 商品代號: 'P2', 消費次數: 12, 消費累計: 4800 },
      { 商品名稱: '合計', 消費次數: 15, 消費累計: 5850 },
    ])
  })

  it('資料回來前顯示載入中、搜尋停用，不顯示匯出與類型切換', async () => {
    const { settle } = setup({}, { delays: { GET_PRODUCT_LEADERBOAED_V2: 50 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(searchButton()).toBeDisabled()
    expect(screen.queryByTestId('csv')).toBeNull()
    expect(screen.queryByText('自購')).toBeNull()
    await settle()
    expect(searchButton()).not.toBeDisabled()
    expect(screen.getByTestId('csv')).toBeInTheDocument()
  })

  it('沒有資料：只有合計列（0）', async () => {
    const { settle } = setup({ GET_PRODUCT_LEADERBOAED_V2: { getProductLeaderBoardV2: [] } })
    await settle()
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map(r => within(r).getAllByRole('cell').map(c => c.textContent))).toEqual([['合計', '', '0', '0']])
  })

  // 已修正：查詢失敗時 data 為 undefined，原本搜尋鈕以 !data 停用，無法重試
  it('查詢失敗不整頁錯誤，搜尋鈕可按、按了會重查', async () => {
    let fail = true
    const { calls, settle } = setup({
      GET_PRODUCT_LEADERBOAED_V2: () => (fail ? new Error('壞了') : { getProductLeaderBoardV2: BOARD }),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(searchButton()).not.toBeDisabled()
    const count = queries(calls).length
    fail = false
    fireEvent.click(searchButton())
    await settle()
    expect(queries(calls).length).toBe(count + 1)
    await wait(() => expect(screen.getByText('洗髮精')).toBeInTheDocument())
  })
})
