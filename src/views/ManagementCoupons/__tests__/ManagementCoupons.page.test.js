// 保護「卡券管理」（卡券販賣紀錄／卡券使用紀錄）：
// - 進頁面即以本月（台灣時間月初～今天結束）或網址帶的 startDate／endDate 查詢兩份報表；查詢條件（日期、設計師、顧客、卡券）
//   以「查詢」一次送出：販賣紀錄的 input 帶 dateRange 與 ticketIds，使用紀錄的 input 帶分頁、ticketIds 放在 input 外
// - 販賣紀錄在前端分頁、合計金額（四捨五入到小數 2 位）與張數；使用紀錄由後端分頁，換頁／改每頁筆數重新查詢
// - 兩份報表的匯出內容與合計列；查詢中顯示載入骨架
// 共用的 DateSelector／MerchantSearchBar／TicketsAutocpmplete 以替身取代（各自另有測試），這裡只驗證頁面如何接它們的值。
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfMonth, endOfDay } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ManagementCoupons from '..'

jest.setTimeout(30000)

jest.mock('components/DateSelector', () => ({ dateChange, date }) => (
  <div>
    <span data-testid="date-range">{`${date.startDate}-${date.endDate}`}</span>
    <button type="button" onClick={() => dateChange({ startDate: new Date(2026, 8, 1).getTime(), endDate: new Date(2026, 8, 30, 23, 59, 59, 999).getTime() })}>
      選九月
    </button>
  </div>
))
jest.mock('components/MerchantSearchBar/index', () => ({ values, onFilter }) => (
  <button type="button" onClick={() => onFilter({ ...values, employeeId: 'designer-1', customerId: 'customer-1' })}>
    選設計師與顧客
  </button>
))
jest.mock('components/TicketsAutocpmplete', () => ({ value, onChange }) => (
  <button type="button" data-value={JSON.stringify(value)} onClick={() => onChange(['t1', 't2'])}>
    選卡券
  </button>
))

const SOLD = Array.from({ length: 7 }, (_, i) => ({
  orderId: `o${i + 1}`,
  orderDate: new Date(2026, 9, 1, 0, 30).getTime(),
  orderNo: `A00${i + 1}`,
  customerName: `顧客${i + 1}`,
  customerPhone: `09120000${i + 1}`,
  designerName: '王小美',
  designerNo: 'D01',
  ticketName: '護髮十次卡',
  ticketNo: 'T01',
  price: 333.335,
  totalCount: 10,
  leftCount: i,
}))

const USED = [
  {
    id: 'r1',
    price: 100.005,
    name: '護髮',
    no: 'T01',
    order: { id: 'buy-1', date: new Date(2026, 8, 1, 0, 30).getTime(), no: 'B001', customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678' }, designer: { id: 'd2', name: '李店長', designerNo: 'D02' } },
    service: { id: 's1', name: '護髮十次卡' },
    usageOrder: { id: 'use-1', no: 'U001', date: new Date(2026, 9, 2, 0, 30).getTime(), designer: { id: 'd1', name: '王小美', designerNo: 'D01' } },
  },
  {
    id: 'r2',
    price: 50,
    name: '護髮',
    no: 'T01',
    order: { id: 'buy-2', date: new Date(2026, 8, 5).getTime(), no: 'B002', customer: { id: 'c2', name: '林先生', cellphone: '0922333444' }, designer: { id: 'd1', name: '王小美', designerNo: 'D01' } },
    service: { id: 's1', name: '護髮十次卡' },
    usageOrder: { id: 'use-2', no: 'U002', date: new Date(2026, 9, 3).getTime(), designer: { id: 'd1', name: '王小美', designerNo: 'D01' } },
  },
]

const fixtures = (overrides = {}) => ({
  FETCH_TICKET_SELL_OVERVIEW: { ticketSellOverview: SOLD },
  FETCH_USED_TICKET_RECORDS: v => ({ usedTicketRecords: { data: USED, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, totalCount: 120 } }),
  ...overrides,
})
const START = new Date(2026, 9, 1).getTime()
const END = new Date(2026, 9, 21, 23, 59, 59, 999).getTime()
const setup = ({ route = `/management/coupons?startDate=${START}&endDate=${END}`, ...overrides } = {}) =>
  renderPage(<ManagementCoupons />, { fixtures: fixtures(overrides), route, delays: overrides.delays })

const card = title => screen.getByText(title, { selector: 'h2' }).closest('.ui-root')
const csvOf = title => decodeURIComponent(within(card(title)).getByText('報表匯出').closest('a').getAttribute('href'))
const lastCall = (calls, name) => callsOf(calls, name).slice(-1)[0].variables

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('卡券管理：查詢條件', () => {
  it('網址帶日期時以網址日期查詢兩份報表（販賣紀錄 dateRange；使用紀錄帶分頁、ticketIds 在 input 外）', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_TICKET_SELL_OVERVIEW')[0].variables).toEqual({
      input: { dateRange: { startDate: START, endDate: END }, ticketIds: [], designerId: '', customerId: '' },
    })
    expect(callsOf(calls, 'FETCH_USED_TICKET_RECORDS')[0].variables).toEqual({
      input: { startDate: START, endDate: END, designerId: '', customerId: '', pageLimit: 50, pageOffset: 0 },
      ticketIds: [],
    })
  })

  it('網址沒有日期時預設本月月初～今天結束（台灣時間）', async () => {
    const { calls, settle } = setup({ route: '/management/coupons' })
    await settle()
    const { dateRange } = callsOf(calls, 'FETCH_TICKET_SELL_OVERVIEW')[0].variables.input
    expect(dateRange).toEqual({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() })
  })

  it('改日期、設計師與顧客、卡券後按查詢，兩份報表都以新條件重新查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('篩選', { selector: 'button, button *' }))
    fireEvent.click(screen.getByText('選九月'))
    fireEvent.click(screen.getByText('選設計師與顧客'))
    fireEvent.click(screen.getByText('選卡券'))
    expect(screen.getByText('選卡券')).toHaveAttribute('data-value', '["t1","t2"]')
    const before = callsOf(calls, 'FETCH_TICKET_SELL_OVERVIEW').length
    fireEvent.click(screen.getByText('查詢', { selector: 'button, button *' }))
    await wait(() => expect(callsOf(calls, 'FETCH_TICKET_SELL_OVERVIEW').length).toBeGreaterThan(before))
    await settle()
    const sep = { startDate: new Date(2026, 8, 1).getTime(), endDate: new Date(2026, 8, 30, 23, 59, 59, 999).getTime() }
    expect(lastCall(calls, 'FETCH_TICKET_SELL_OVERVIEW')).toEqual({
      input: { dateRange: sep, ticketIds: ['t1', 't2'], designerId: 'designer-1', customerId: 'customer-1' },
    })
    expect(lastCall(calls, 'FETCH_USED_TICKET_RECORDS')).toEqual({
      input: { ...sep, designerId: 'designer-1', customerId: 'customer-1', pageLimit: 50, pageOffset: 0 },
      ticketIds: ['t1', 't2'],
    })
  })

  it('查詢中顯示載入骨架、查詢鈕停用；查詢失敗時不整頁壞', async () => {
    const slow = setup({ delays: { FETCH_TICKET_SELL_OVERVIEW: 300, FETCH_USED_TICKET_RECORDS: 300 } })
    expect(screen.getAllByLabelText('載入中')).toHaveLength(2)
    await wait(() => expect(screen.getByText('查詢', { selector: 'button, button *' }).closest('button')).toBeDisabled())
    await slow.settle()
    expect(screen.queryAllByLabelText('載入中')).toHaveLength(0)
    cleanup()
    const failed = setup({ FETCH_TICKET_SELL_OVERVIEW: new Error('x'), FETCH_USED_TICKET_RECORDS: new Error('x') })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByLabelText('載入中')).toHaveLength(2)
  })
})

describe('卡券管理：卡券販賣紀錄', () => {
  it('前端分頁：每頁 5 筆時顯示前 5 筆、合計只算本頁；換頁顯示其餘', async () => {
    const { settle } = setup()
    await settle()
    const sold = () => within(card('卡券販賣紀錄'))
    expect(sold().getByText('共 7 筆')).toBeInTheDocument()
    expect(sold().getAllByText('詳情')).toHaveLength(7)
    // 合計：333.335 四捨五入成 333.34 × 7 = 2333.38；總張數 70、現餘 0+…+6 = 21
    const total = sold().getByText('合計').closest('tr')
    expect(within(total).getByText('2333.38')).toBeInTheDocument()
    expect(within(total).getByText('70')).toBeInTheDocument()
    expect(within(total).getByText('21')).toBeInTheDocument()
    fireEvent.change(sold().getByLabelText('每頁筆數'), { target: { value: '0' } })
    await wait(() => expect(sold().getAllByText('詳情')).toHaveLength(5))
    expect(within(sold().getByText('合計').closest('tr')).getByText('1666.7')).toBeInTheDocument()
    fireEvent.click(sold().getByLabelText('下一頁'))
    await wait(() => expect(sold().getAllByText('詳情')).toHaveLength(2))
    expect(sold().getByText('A006')).toBeInTheDocument()
    expect(sold().getByText('A006').closest('tr').querySelector('a')).toHaveAttribute('href', '/order/o6')
  })

  it('匯出內容：帳單編號／日期、客戶、設計師、卡券、金額與合計列', async () => {
    const { settle } = setup()
    await settle()
    const csv = csvOf('卡券販賣紀錄')
    expect(csv).toContain('"#A001_2026/10/01","顧客1 091200001","王小美 D01","T01","護髮十次卡","333.34","10","0"')
    expect(csv).toContain('"","","","","合計","2333.38","70","21"')
  })
})

describe('卡券管理：卡券使用紀錄', () => {
  it('列出使用與購買帳單（含詳情連結）、顧客、使用帳單的設計師，合計金額', async () => {
    const { settle } = setup()
    await settle()
    const used = within(card('卡券使用紀錄'))
    expect(used.getByText('共 120 筆')).toBeInTheDocument()
    const first = used.getByText('U001').closest('tr')
    expect(within(first).getByText('B001')).toBeInTheDocument()
    expect(within(first).getByText('2026/10/02')).toBeInTheDocument()
    expect(within(first).getByText('2026/09/01')).toBeInTheDocument()
    expect([...first.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/order/use-1', '/order/buy-1'])
    expect(within(first).getByText('陳小姐')).toBeInTheDocument()
    expect(within(first).getByText('王小美')).toBeInTheDocument()
    expect(within(first).getByText('100.01')).toBeInTheDocument()
    expect(within(used.getByText('合計').closest('tr')).getByText('150.01')).toBeInTheDocument()
  })

  // 已知缺口（待 Jason 決定）：使用紀錄的匯出「設計師」欄取購買帳單的設計師（ManagementCoupons/UsagedResults.js:26），
  // 畫面上同一欄顯示的是使用帳單的設計師（:102-104），兩者不一致；匯出內容也未經 exportCustomerMask 遮罩顧客姓名與手機
  // （販賣紀錄 BoughtResults.js:43 同樣未遮罩）。鎖住目前行為。
  it('匯出內容：使用／購買帳單、客戶（未遮罩）、購買帳單的設計師、卡券、金額與合計列', async () => {
    const { settle } = setup()
    await settle()
    const csv = csvOf('卡券使用紀錄')
    expect(csv).toContain('"#U001_2026/10/02","#B001_2026/09/01","陳小姐 0912345678","李店長 D02","T01","護髮十次卡","100.01"')
    expect(csv).toContain('"","","","","","合計","150.01"')
  })

  it('後端分頁：換頁送出 pageOffset、改每頁筆數送出 pageLimit 並回到第一頁', async () => {
    const { calls, settle } = setup()
    await settle()
    const used = () => within(card('卡券使用紀錄'))
    fireEvent.click(used().getByLabelText('下一頁'))
    await wait(() => expect(lastCall(calls, 'FETCH_USED_TICKET_RECORDS').input.pageOffset).toBe(1))
    await settle()
    fireEvent.change(used().getByLabelText('每頁筆數'), { target: { value: '1' } })
    await wait(() => expect(lastCall(calls, 'FETCH_USED_TICKET_RECORDS').input).toMatchObject({ pageLimit: 10, pageOffset: 0 }))
  })
})
