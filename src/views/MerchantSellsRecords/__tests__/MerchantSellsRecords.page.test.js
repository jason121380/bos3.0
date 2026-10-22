// 保護「店販抽成明細」：
// ① 查詢條件：預設台灣時間本月 1 日 00:00～今天 23:59:59.999、每頁 1000 筆第 1 頁、不限設計師／顧客／商品；
//    篩選列與商品欄改條件後依新條件重查，且回到第 1 頁（已修正：原本沿用目前頁碼，在後面頁換條件可能整頁空白）。
// ② 表格：依帳單日期由舊到新、台灣日期、設計師／顧客／商品的「名稱 / 代號」、抽成方式中文；
//    明細「小計」＝四捨五入(單價×數量)，與合計列同一算法（已修正：原本是 數量×四捨五入後單價，單價有小數時明細加總與合計不符）。
// ③ 分頁：頁數說明、下一頁送出頁碼、改每頁筆數回第 1 頁。
// ④ 匯出：與畫面同順序；商品沒有代號時只寫名稱（已修正：原本寫成「名稱/null」）；顧客姓名經 helper/exportCustomerMask，只有遮罩設定查詢成功且為 false 才匯出完整姓名（已修正：原本一律完整）。
// ⑤ 查詢失敗、載入中不整頁錯誤。
// 篩選列與商品欄以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MerchantSellsRecords from '..'

const mockBars = []
const mockNextFilter = { value: {} }
jest.mock('components/MerchantSearchBar/index', () => props => {
  mockBars.push(props)
  return (
    <button type="button" onClick={() => props.onFilter({ ...props.values, ...mockNextFilter.value })}>
      篩選列（測試）
    </button>
  )
})
jest.mock('components/ProductAutoComplete', () => ({ onChange, value }) => (
  <div data-testid="product" data-value={value}>
    <button type="button" onClick={() => onChange({ id: 'p9' })}>選商品（測試）</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除商品（測試）</button>
  </div>
))
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

const order = (id, extra) => ({
  id,
  name: '洗髮精',
  product: { id: 'p1', no: 'A01', name: '洗髮精' },
  seller: { id: 'u1', name: '小美', designerNo: 'D1' },
  count: 1,
  price: 350,
  price2: 350,
  commission: 35,
  handlingFee: 0,
  rakeType: 'byPrice',
  order: { id: `o-${id}`, no: 100, date: tw(2026, 10, 2, 10), customer: { no: 'C01', name: '陳小美' } },
  ...extra,
})
const DATA = [
  // 晚的排在後面
  order('r2', {
    count: 3, price: 333.4, price2: 1000.2, commission: 100.02, handlingFee: 10.4, rakeType: 'fixed',
    product: { id: 'p2', no: null, name: '護髮乳' }, seller: { id: 'u2', name: '阿明', designerNo: '' },
    order: { id: 'o2', no: 102, date: tw(2026, 10, 22, 0, 10), customer: { no: null, name: '歐陽娜娜' } },
  }),
  order('r1', { order: { id: 'o1', no: 101, date: tw(2026, 10, 21, 23, 50), customer: { no: 'C01', name: '陳小美' } } }),
  order('r3', { rakeType: 'byCost', price: 99.5, count: 2, commission: 19.9, price2: 199, order: { id: 'o3', no: 103, date: tw(2026, 10, 22, 9), customer: { no: '', name: '王五' } } }),
]
const productOrders = v => ({
  productOrders: { totalCount: 1500, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, data: DATA },
})
const setup = (fixtures = {}, options = {}) =>
  renderPage(<MerchantSellsRecords />, { fixtures: { PRODUCT_ORDERS: productOrders, ...fixtures }, ...options })
const inputs = calls => callsOf(calls, 'PRODUCT_ORDERS').map(c => c.variables.input)
const bodyRows = () =>
  within(screen.getByRole('table')).getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell').map(c => c.textContent))
const csvRows = () => JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))

beforeEach(() => {
  loginAs()
  mockBars.length = 0
  mockNextFilter.value = {}
})
afterEach(cleanup)

describe('店販抽成明細：查詢條件與分頁', () => {
  it('預設查台灣時間本月、第 1 頁 1000 筆、不限條件；篩選列傳入目前條件', async () => {
    const { calls, settle } = setup()
    await settle()
    const [y, m, d] = twToday()
    expect(inputs(calls)[0]).toEqual({
      pageLimit: 1000, pageOffset: 0,
      startDate: tw(y, m, 1), endDate: tw(y, m, d, 23, 59, 59, 999),
      productId: '', sellerId: '', customerIds: [],
    })
    expect(mockBars[0].visible).toEqual(['datePicker', 'employee', 'customer'])
  })

  it('分頁：說明文字、下一頁送頁碼、改每頁筆數回第 1 頁', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(screen.getByText(/1500 筆資料/).textContent.replace(/\s/g, '')).toBe('1500筆資料,1/2')
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ pageOffset: 1, pageLimit: 1000 })
    const perPage = screen.getByLabelText('每頁筆數')
    fireEvent.change(perPage, { target: { value: String([...perPage.options].findIndex(o => o.textContent === '50')) } })
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ pageOffset: 0, pageLimit: 50 })
  })

  // 已修正：在後面頁換條件，原本沿用目前頁碼
  it('換篩選條件或商品後依新條件查詢並回到第 1 頁', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    expect(inputs(calls).pop().pageOffset).toBe(1)
    mockNextFilter.value = { employeeId: 'u2', customerId: 'c9', startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('篩選列（測試）'))
    await settle()
    expect(inputs(calls).pop()).toEqual({
      pageLimit: 1000, pageOffset: 0,
      startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999),
      productId: '', sellerId: 'u2', customerIds: ['c9'],
    })
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    fireEvent.click(screen.getByText('選商品（測試）'))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ productId: 'p9', pageOffset: 0 })
    expect(screen.getByTestId('product')).toHaveAttribute('data-value', 'p9')
    fireEvent.click(screen.getByText('清除商品（測試）'))
    await settle()
    expect(inputs(calls).pop().productId).toBe('')
  })
})

describe('店販抽成明細：表格、合計與匯出', () => {
  it('依日期由舊到新，名稱／代號、抽成方式；小計＝四捨五入(單價×數量)，合計為明細加總', async () => {
    const { settle } = setup()
    await settle()
    expect(bodyRows()).toEqual([
      ['2026/10/21', '#101', '小美 / D1', '陳小美 / C01', '洗髮精 / A01', '350', '1', '350', '0', '350', '35(售價)'],
      ['2026/10/22', '#102', '阿明', '歐陽娜娜', '護髮乳', '333', '3', '1,000', '10', '1,000', '100(固定金額)'],
      ['2026/10/22', '#103', '小美 / D1', '王五', '洗髮精 / A01', '100', '2', '199', '0', '199', '20(毛利)'],
      // 合計：數量 6、小計 350+1000.2+199=1549.2→1549、手續費 10、業績 1549、抽成 154.92→155
      ['合計', '', '6', '1,549', '10', '1,549', '155'],
    ])
  })

  it('遮罩設定為 false：匯出完整姓名，順序與畫面相同、含合計列', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    await settle()
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '店販抽成明細.csv')
    expect(csvRows()).toEqual([
      { 日期: '2026/10/21', 帳單編號: '#101', 設計師姓名代號: '小美 / D1', 顧客姓名代號: '陳小美 / C01', 商品名稱代號: '洗髮精/A01', 實際售價: 350, 數量: 1, 小計: 350, 手續費: 0, '販賣業績(實)': 350, '抽成(方式)': '35(售價)' },
      { 日期: '2026/10/22', 帳單編號: '#102', 設計師姓名代號: '阿明', 顧客姓名代號: '歐陽娜娜', 商品名稱代號: '護髮乳', 實際售價: 333, 數量: 3, 小計: 1000, 手續費: 10, '販賣業績(實)': 1000, '抽成(方式)': '100(固定金額)' },
      { 日期: '2026/10/22', 帳單編號: '#103', 設計師姓名代號: '小美 / D1', 顧客姓名代號: '王五', 商品名稱代號: '洗髮精/A01', 實際售價: 100, 數量: 2, 小計: 199, 手續費: 0, '販賣業績(實)': 199, '抽成(方式)': '20(毛利)' },
      { 日期: '合計', 帳單編號: '', 設計師姓名代號: '', 顧客姓名代號: '', 商品名稱代號: '', 實際售價: '', 數量: 6, 小計: 1549, 手續費: 10, '販賣業績(實)': 1549, '抽成(方式)': 155 },
    ])
  })

  // 已修正：匯出原本一律含完整顧客姓名
  it.each([
    ['設定為 true', { GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true } }],
    ['設定查詢失敗', { GET_CUSTOMER_DATA_MARKED: new Error('壞了') }],
  ])('%s：匯出的顧客姓名遮罩（保留顧客代號），畫面不遮', async (_, fixtures) => {
    const { settle } = setup(fixtures)
    await settle()
    await wait(() => expect(csvRows().slice(0, 3).map(r => r.顧客姓名代號)).toEqual(['陳*美 / C01', '歐陽*娜娜', '王*']))
    expect(screen.getByText('陳小美 / C01')).toBeInTheDocument()
  })

  it('載入中顯示骨架；查詢失敗不整頁錯誤、不顯示表格', async () => {
    const { settle } = setup({ PRODUCT_ORDERS: new Error('壞了') }, { delays: { PRODUCT_ORDERS: 50 } })
    await wait(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('沒有資料：只有合計列（0）', async () => {
    const { settle } = setup({ PRODUCT_ORDERS: v => ({ productOrders: { totalCount: 0, pageLimit: 1000, pageOffset: 0, data: [] } }) })
    await settle()
    expect(bodyRows()).toEqual([['合計', '', '0', '0', '0', '0', '0']])
  })
})
