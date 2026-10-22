// 保護「店販分類抽成明細」：
// ① 查詢條件：預設台灣時間本月 1 日 00:00～今天 23:59:59.999、每頁 1000 筆第 1 頁、分類依設計師、時間由小到大；
//    分類依據與時間排序切換即重查（再按一次已選的不變）；篩選列換條件後回到第 1 頁（已修正：原本沿用目前頁碼）。
// ② 分組：依設計師／商品／帳單日期（台灣時間的同一天，00:10 的帳單算當天）分組，各組後接小計列；合計列為全部加總。
//    明細「小計」＝四捨五入(單價×數量)，小計列四捨五入顯示（已修正：原本明細是 數量×四捨五入後單價、小計列顯示未四捨五入的小數，與合計不符）。
// ③ 匯出：依目前分組；顧客姓名經 helper/exportCustomerMask（已修正：原本一律完整姓名）；商品沒有代號只寫名稱（已修正：原本「名稱/null」）。
// ④ 分頁、載入中、查詢失敗不整頁錯誤。
// 篩選列以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import MerchantCategorySellsRecords from '..'

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
const P1 = { id: 'p1', no: 'A01', name: '洗髮精' }
const P2 = { id: 'p2', no: null, name: '護髮乳' }
const U1 = { id: 'u1', name: '小美', designerNo: 'D1' }
const U2 = { id: 'u2', name: '阿明', designerNo: '' }
const row = (id, extra) => ({
  id, name: '', product: P1, seller: U1, count: 1, price: 350, price2: 350, commission: 35, handlingFee: 0, rakeType: 'byPrice', ...extra,
})
const DATA = [
  row('r1', { order: { id: 'o1', no: 101, date: tw(2026, 10, 21, 23, 50), customer: { no: 'C01', name: '陳小美' } } }),
  row('r2', {
    seller: U2, count: 3, price: 333.4, price2: 1000.2, commission: 100.02, handlingFee: 10.4, rakeType: 'fixed',
    order: { id: 'o2', no: 102, date: tw(2026, 10, 22, 0, 10), customer: { no: null, name: '歐陽娜娜' } },
  }),
  row('r3', {
    product: P2, count: 2, price: 99.5, price2: 199, commission: 19.9, rakeType: 'byCost',
    order: { id: 'o3', no: 103, date: tw(2026, 10, 22, 9), customer: { no: '', name: '王五' } },
  }),
]
const productOrders = v => ({ productOrders: { totalCount: 1500, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, data: DATA } })
const setup = (fixtures = {}, options = {}) =>
  renderPage(<MerchantCategorySellsRecords />, { fixtures: { PRODUCT_ORDERS: productOrders, ...fixtures }, ...options })
const inputs = calls => callsOf(calls, 'PRODUCT_ORDERS').map(c => c.variables.input)
const bodyRows = () =>
  within(screen.getByRole('table')).getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell').map(c => c.textContent))
const csvRows = () => JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))

const R1 = ['2026/10/21', '#101', '小美 / D1', '陳小美 / C01', '洗髮精 / A01', '350', '1', '350', '0', '350', '35(售價)']
const R2 = ['2026/10/22', '#102', '阿明', '歐陽娜娜', '洗髮精 / A01', '333', '3', '1,000', '10', '1,000', '100(固定金額)']
const R3 = ['2026/10/22', '#103', '小美 / D1', '王五', '護髮乳', '100', '2', '199', '0', '199', '20(毛利)']
const subtotal = (price, fee, price2, commission) => ['', '小計', '', '', '', price, fee, price2, commission]
const TOTAL = ['合計', '', '6', '1,549', '10', '1,549', '155']

beforeEach(() => {
  loginAs()
  mockBars.length = 0
  mockNextFilter.value = {}
})
afterEach(cleanup)

describe('店販分類抽成明細：查詢條件', () => {
  it('預設條件；切換分類依據與時間排序即重查，再按已選的不變', async () => {
    const { calls, settle } = setup()
    await settle()
    const [y, m, d] = twToday()
    expect(inputs(calls)[0]).toEqual({
      pageLimit: 1000, pageOffset: 0,
      startDate: tw(y, m, 1), endDate: tw(y, m, d, 23, 59, 59, 999),
      productId: '', customerIds: [], sellerId: '',
      sortWay: 'ASC', productOrderWay: 'DESIGNER',
    })
    expect(mockBars[0].visible).toEqual(['datePicker', 'employee', 'customer', 'product'])
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ productOrderWay: 'PRODUCTNO', sortWay: 'ASC' })
    fireEvent.click(screen.getByRole('button', { name: '由大到小' }))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ productOrderWay: 'PRODUCTNO', sortWay: 'DESC' })
    const count = inputs(calls).length
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    fireEvent.click(screen.getByRole('button', { name: '由大到小' }))
    await settle()
    expect(inputs(calls)).toHaveLength(count)
    expect(screen.getByRole('button', { name: '商品' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '由大到小' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('分頁：下一頁送頁碼、改每頁筆數回第 1 頁；換篩選條件回第 1 頁（已修正）', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(screen.getByText(/1500 筆資料/).textContent.replace(/\s/g, '')).toBe('1500筆資料,1/2')
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ pageOffset: 1 })
    mockNextFilter.value = { employeeId: 'u2', customerId: 'c9', productId: 'p9' }
    fireEvent.click(screen.getByText('篩選列（測試）'))
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ pageOffset: 0, sellerId: 'u2', customerIds: ['c9'], productId: 'p9' })
    fireEvent.click(screen.getByRole('button', { name: '下一頁' }))
    await settle()
    const perPage = screen.getByLabelText('每頁筆數')
    fireEvent.change(perPage, { target: { value: String([...perPage.options].findIndex(o => o.textContent === '25')) } })
    await settle()
    expect(inputs(calls).pop()).toMatchObject({ pageOffset: 0, pageLimit: 25 })
  })
})

describe('店販分類抽成明細：分組、小計與合計', () => {
  it('依設計師分組（預設）', async () => {
    const { settle } = setup()
    await settle()
    expect(bodyRows()).toEqual([R1, R3, subtotal('549', '0', '549', '55'), R2, subtotal('1,000', '10', '1,000', '100'), TOTAL])
  })

  it('依商品分組', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '商品' }))
    await settle()
    expect(bodyRows()).toEqual([R1, R2, subtotal('1,350', '10', '1,350', '135'), R3, subtotal('199', '0', '199', '20'), TOTAL])
  })

  it('依帳單日期（台灣時間）分組：10/22 00:10 的帳單算 10/22', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '時間' }))
    await settle()
    expect(bodyRows()).toEqual([R1, subtotal('350', '0', '350', '35'), R2, R3, subtotal('1,199', '10', '1,199', '120'), TOTAL])
  })

  it('沒有資料：只有合計列（0），匯出只有合計列', async () => {
    const { settle } = setup({ PRODUCT_ORDERS: { productOrders: { totalCount: 0, pageLimit: 1000, pageOffset: 0, data: [] } } })
    await settle()
    expect(bodyRows()).toEqual([['合計', '', '0', '0', '0', '0', '0']])
    expect(csvRows()).toEqual([{ 日期: '合計', 數量: 0, 小計: 0, 手續費: 0, '販賣業績(實)': 0, '抽成(方式)': 0 }])
  })

  it('載入中顯示骨架；查詢失敗不整頁錯誤、不顯示表格', async () => {
    const { settle } = setup({ PRODUCT_ORDERS: new Error('壞了') }, { delays: { PRODUCT_ORDERS: 50 } })
    await wait(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
  })
})

describe('店販分類抽成明細：匯出', () => {
  it('遮罩設定為 false：依目前分組匯出完整姓名、小計列、合計列', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    await settle()
    expect(screen.getByTestId('csv')).toHaveAttribute('data-filename', '店販抽成明細.csv')
    expect(csvRows()).toEqual([
      { 日期: '2026/10/21', 帳單編號: '#101', 姓名: '小美', '顧客姓名/代號': '陳小美 / C01', 商品名稱代號: '洗髮精/A01', 實際售價: 350, 數量: 1, 小計: 350, 手續費: 0, '販賣業績(實)': 350, '抽成(方式)': '35(售價)' },
      { 日期: '2026/10/22', 帳單編號: '#103', 姓名: '小美', '顧客姓名/代號': '王五', 商品名稱代號: '護髮乳', 實際售價: 100, 數量: 2, 小計: 199, 手續費: 0, '販賣業績(實)': 199, '抽成(方式)': '20(毛利)' },
      { '顧客姓名/代號': '小計', 小計: 549, 手續費: 0, '販賣業績(實)': 549, '抽成(方式)': 54.9 },
      { 日期: '2026/10/22', 帳單編號: '#102', 姓名: '阿明', '顧客姓名/代號': '歐陽娜娜', 商品名稱代號: '洗髮精/A01', 實際售價: 333, 數量: 3, 小計: 1000, 手續費: 10, '販賣業績(實)': 1000.2, '抽成(方式)': '100(固定金額)' },
      { '顧客姓名/代號': '小計', 小計: 3 * 333.4, 手續費: 10.4, '販賣業績(實)': 1000.2, '抽成(方式)': 100.02 },
      { 日期: '合計', 數量: 6, 小計: 1549, 手續費: 10, '販賣業績(實)': 1549, '抽成(方式)': 155 },
    ])
  })

  // 已修正：匯出原本一律含完整顧客姓名
  it.each([
    ['設定為 true', { GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true } }],
    ['設定查詢失敗', { GET_CUSTOMER_DATA_MARKED: new Error('壞了') }],
  ])('%s：匯出的顧客姓名遮罩（保留顧客代號），畫面不遮', async (_, fixtures) => {
    const { settle } = setup(fixtures)
    await settle()
    await wait(() =>
      expect(csvRows().filter(r => r.帳單編號).map(r => r['顧客姓名/代號'])).toEqual(['陳*美 / C01', '王*', '歐陽*娜娜'])
    )
    expect(screen.getByText('陳小美 / C01')).toBeInTheDocument()
  })
})
