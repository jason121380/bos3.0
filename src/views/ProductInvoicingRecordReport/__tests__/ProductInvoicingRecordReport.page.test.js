// 保護「商品進銷貨報表」：
// ① 進頁以台灣時間「本月 1 日 00:00～今天 23:59:59.999」（網址有 startDate／endDate 時用網址的）、三種類型、不限商品查詢；換日期立即重查。
// ② 類型（店販／自購／進貨）與加入商品只改條件，按「搜尋」才查；商品清空時自動重查全部；「全選」加入全部商品。
// ③ 商品選單：顯示「代號 - 名稱」（沒有代號顯示「無代號」），可依代號或名稱搜尋；沒有代號的商品也能選
//    （已修正：原本 filterOptions 遇到沒有代號的商品一律濾掉，畫面上的「無代號」永遠出不來）。
// ④ 表格：台灣日期、類型中文、合計數量＝明細加總；「列印」呼叫瀏覽器列印。
// ⑤ 商品清單或報表查詢失敗都不整頁錯誤；報表查詢失敗後仍可按「搜尋」重試
//    （已修正：原本商品查詢失敗時 options 為 undefined、全選讀 undefined 整頁拋錯；報表失敗後搜尋鈕一直停用）。
// 列印抬頭（merchantNamePrint）屬列印範本，不在本測試修改範圍。日期選擇器以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ProductInvoicingRecordReport from '..'
import Results from '../Results'

const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ date, dateChange }) => (
    <button type="button" data-start={date.startDate} data-end={date.endDate} onClick={() => dateChange(mockNextDate.value)}>
      換日期（測試）
    </button>
  ),
}))
jest.setTimeout(20000)

const tw = (y, m, d, h = 0, mi = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h - 8, mi, s, ms)
const twToday = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
}
const PRODUCTS = [
  { id: 'p1', no: 'A01', name: '洗髮精' },
  { id: 'p2', no: 'B02', name: '護髮乳' },
  { id: 'p3', no: null, name: '贈品梳子' },
]
const REPORT = [
  { date: tw(2026, 10, 21, 23, 40), no: 'S-1', productName: '洗髮精', productNo: 'A01', unit: '瓶', type: 'SALE', count: 2 },
  { date: tw(2026, 10, 22, 0, 10), no: 'P-1', productName: '洗髮精', productNo: 'A01', unit: '瓶', type: 'PURCHASE', count: 10 },
  { date: tw(2026, 10, 22, 9, 0), no: 'K-1', productName: '護髮乳', productNo: 'B02', unit: '條', type: 'PICKING', count: 1 },
]
const setup = (fixtures = {}, options = {}) =>
  renderPage(<ProductInvoicingRecordReport />, {
    fixtures: {
      GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: PRODUCTS } },
      GET_PRODUCT_INVOICING_RECORD_REPOPT: { productInvoicingRecordReport: REPORT },
      ...fixtures,
    },
    ...options,
  })
const reports = calls => callsOf(calls, 'GET_PRODUCT_INVOICING_RECORD_REPOPT').map(c => c.variables)
const productInput = () => screen.getAllByLabelText('加入商品').find(el => el.tagName === 'INPUT')
const openFilters = () => fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
const optionTexts = () => screen.queryAllByRole('option').map(o => o.textContent)

beforeEach(() => {
  loginAs()
  mockNextDate.value = null
})
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('商品進銷貨報表：查詢', () => {
  it('進頁以台灣時間本月、三種類型、不限商品查詢；換日期立即重查', async () => {
    const { calls, settle } = setup()
    await settle()
    const [y, m, d] = twToday()
    const all = reports(calls)
    expect(all.length).toBeGreaterThan(0)
    all.forEach(v =>
      expect(v).toEqual({
        input: { startDate: tw(y, m, 1), endDate: tw(y, m, d, 23, 59, 59, 999) },
        productId: [],
        recordType: ['SALE', 'PICKING', 'PURCHASE'],
      })
    )
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(reports(calls).pop().input).toEqual({ startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) })
  })

  it('網址帶 startDate／endDate 時用網址的日期', async () => {
    window.history.pushState({}, '', `/?startDate=${tw(2026, 8, 1)}&endDate=${tw(2026, 8, 31, 23, 59, 59, 999)}`)
    const { calls, settle } = setup()
    await settle()
    expect(reports(calls)[0].input).toEqual({ startDate: tw(2026, 8, 1), endDate: tw(2026, 8, 31, 23, 59, 59, 999) })
    expect(screen.getByText('換日期（測試）')).toHaveAttribute('data-start', String(tw(2026, 8, 1)))
  })

  it('類型只改條件，按「搜尋」才以新類型查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    const count = reports(calls).length
    openFilters()
    fireEvent.click(screen.getByRole('button', { name: '進貨' }))
    await settle()
    expect(reports(calls)).toHaveLength(count)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(reports(calls).pop().recordType).toEqual(['SALE', 'PICKING'])
  })

  it('加入商品後按搜尋送出商品 id；全部移除時自動重查全部商品', async () => {
    const { calls, settle } = setup()
    await settle()
    openFilters()
    fireEvent.click(productInput())
    expect(optionTexts()).toEqual(['A01 - 洗髮精', 'B02 - 護髮乳', '無代號 - 贈品梳子'])
    fireEvent.click(screen.getByRole('option', { name: 'B02 - 護髮乳' }))
    // 依代號、名稱搜尋（不分大小寫）；沒有代號的商品可依名稱找到
    fireEvent.change(productInput(), { target: { value: 'a01' } })
    expect(optionTexts()).toEqual(['A01 - 洗髮精'])
    fireEvent.change(productInput(), { target: { value: '梳子' } })
    expect(optionTexts()).toEqual(['無代號 - 贈品梳子'])
    fireEvent.click(screen.getByRole('option', { name: '無代號 - 贈品梳子' }))
    fireEvent.focusOut(productInput())
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(reports(calls).pop().productId).toEqual(['p2', 'p3'])

    const count = reports(calls).length
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 護髮乳' }))
    await settle()
    expect(reports(calls)).toHaveLength(count)
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 贈品梳子' }))
    await settle()
    expect(reports(calls)).toHaveLength(count + 1)
    expect(reports(calls).pop().productId).toEqual([])
  })

  it('「全選」加入全部商品', async () => {
    const { calls, settle } = setup()
    await settle()
    openFilters()
    fireEvent.click(screen.getByRole('button', { name: '全選' }))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(reports(calls).pop().productId).toEqual(['p1', 'p2', 'p3'])
  })
})

describe('商品進銷貨報表：表格與列印', () => {
  it('台灣日期、類型中文、合計數量', async () => {
    const { settle } = setup()
    await settle()
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map(r => within(r).getAllByRole('cell').map(c => c.textContent))).toEqual([
      ['2026/10/21', 'S-1', '洗髮精', 'A01', '瓶', '店販', '2'],
      ['2026/10/22', 'P-1', '洗髮精', 'A01', '瓶', '進貨', '10'],
      ['2026/10/22', 'K-1', '護髮乳', 'B02', '條', '自購', '1'],
      ['', '', '合計', '13'],
    ])
  })

  it('不認得的類型顯示空白；沒有資料時合計為 0', () => {
    const { container, unmount } = renderPage(<Results reportData={[{ ...REPORT[0], type: 'OTHER' }]} />)
    const cells = [...container.querySelectorAll('tbody tr')][0].querySelectorAll('td')
    expect(cells[5].textContent).toBe('')
    unmount()
    renderPage(<Results />)
    expect(screen.getByText('合計').nextSibling.textContent).toBe('0')
  })

  it('「列印」呼叫瀏覽器列印；資料載入中停用', async () => {
    const print = jest.spyOn(window, 'print').mockImplementation(() => {})
    const { settle } = setup({}, { delays: { GET_PRODUCT_INVOICING_RECORD_REPOPT: 50 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '列印' })).toBeDisabled()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '列印' }))
    expect(print).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })
})

describe('商品進銷貨報表：查詢失敗', () => {
  // 已修正：商品查詢失敗時 options 為 undefined，原本選單與「全選」整頁拋錯
  it('商品清單查詢失敗不整頁錯誤，全選不拋錯、報表照常', async () => {
    const { calls, settle } = setup({ GET_PRODUCT_IN_AUTO_COMPLETE: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openFilters()
    fireEvent.click(screen.getByRole('button', { name: '全選' }))
    fireEvent.click(productInput())
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(reports(calls).pop().productId).toEqual([])
    expect(screen.getByText('S-1')).toBeInTheDocument()
  })

  // 已修正：報表查詢失敗時 data 為 undefined，原本搜尋鈕、類型、全選一直停用，無法重試
  it('報表查詢失敗後可按「搜尋」重試', async () => {
    let fail = true
    const { calls, settle } = setup({
      GET_PRODUCT_INVOICING_RECORD_REPOPT: () => (fail ? new Error('壞了') : { productInvoicingRecordReport: REPORT }),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openFilters()
    expect(screen.getByRole('button', { name: '搜尋' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: '進貨' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: '列印' })).toBeDisabled()
    fail = false
    fireEvent.click(screen.getByRole('button', { name: '進貨' }))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(reports(calls).pop().recordType).toEqual(['SALE', 'PICKING'])
    await wait(() => expect(screen.getByText('S-1')).toBeInTheDocument())
  })
})
