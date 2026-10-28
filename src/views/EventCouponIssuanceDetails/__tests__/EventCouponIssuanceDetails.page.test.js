// 保護「活動發券明細」：預設查台灣今天整天、每頁 50 筆；換日期區間重查；篩選活動後按搜尋帶入活動 id；
// 換頁與每頁筆數送出的分頁參數；明細列（帳單日期為台灣日期、帳單連結、手機端與簡訊）；沒有資料與查詢失敗時顯示空狀態。
// 日期區間選擇器與活動多選以替身代替（各有自己的測試）。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfDay, endOfDay } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickOption } from '../../__tests__/settingsPageKit.test'
import EventCouponIssuanceDetails from '..'

jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ date, dateChange }) => (
    <div data-testid="date-selector" data-start={date.startDate} data-end={date.endDate}>
      <button type="button" onClick={() => dateChange({ startDate: 1000, endDate: 2000 })}>
        換日期（測試）
      </button>
    </div>
  ),
}))
jest.mock('components/MainEventAutocomplete', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <button type="button" data-value={JSON.stringify(value)} onClick={() => onChange(['e1', 'e2'])}>
      選活動（測試）
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

// 台灣 2026/10/22 00:30（UTC 10/21 16:30）
const TW_1022 = Date.UTC(2026, 9, 21, 16, 30)
const record = overrides => ({
  number: 'V0001',
  eventName: '周年慶',
  ruleName: '滿千送券',
  orderDate: TW_1022,
  orderNo: 123,
  orderId: 'o1',
  customerName: '陳小美',
  customerCellphone: '0911222333',
  isCustomerSideUsing: true,
  isSMSSended: false,
  ...overrides,
})
const RECORDS = [record(), record({ number: 'V0002', orderNo: null, orderId: 'o2', isCustomerSideUsing: false, isSMSSended: true })]
const page = (data = RECORDS, extra = {}) => ({ voucherIssuanceRecord: { data, pageLimit: 50, pageOffset: 0, totalCount: 120, ...extra } })
const setup = (fixtures = {}) =>
  renderPage(<EventCouponIssuanceDetails />, {
    fixtures: { FETCH_GET_VOUCHER_ISSUANCE_RECORD: page(), ...fixtures },
    route: '/event-coupon-issuance-details',
  })
const queries = calls => callsOf(calls, 'FETCH_GET_VOUCHER_ISSUANCE_RECORD').map(c => c.variables.input)
const last = calls => queries(calls)[queries(calls).length - 1]

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('活動發券明細', () => {
  it('預設查詢台灣今天整天、每頁 50 筆、不限活動；列出明細', async () => {
    const { calls } = setup()
    expect(await screen.findByText('共 120 筆資料')).toBeInTheDocument()
    expect(queries(calls)[0]).toEqual({
      pageLimit: 50,
      pageOffset: 0,
      startDate: startOfDay(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
      eventIds: [],
    })
    const first = within(screen.getByText('V0001').closest('tr'))
    expect(first.getByText('2026/10/22')).toBeInTheDocument()
    expect(first.getByText('#123')).toHaveAttribute('href', '/order/o1')
    expect(first.getByText('是')).toBeInTheDocument()
    expect(first.getByText('否')).toBeInTheDocument()
    const second = screen.getByText('V0002').closest('tr')
    expect(second.querySelector('a[href="/order/o2"]').textContent).toBe('')
  })

  it('換日期區間時以新區間重查', async () => {
    const { calls } = setup()
    await screen.findByText('共 120 筆資料')
    fireEvent.click(screen.getByText('換日期（測試）'))
    await wait(() => expect(last(calls)).toEqual(expect.objectContaining({ startDate: 1000, endDate: 2000 })))
    expect(screen.getByTestId('date-selector')).toHaveAttribute('data-start', '1000')
  })

  it('篩選活動：選了活動不會自動查，按搜尋才帶入活動 id；再按篩選收起', async () => {
    const { calls } = setup()
    await screen.findByText('共 120 筆資料')
    fireEvent.click(screen.getByText('篩選'))
    fireEvent.click(screen.getByText('選活動（測試）'))
    expect(screen.getByText('選活動（測試）')).toHaveAttribute('data-value', '["e1","e2"]')
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(queries(calls)).toHaveLength(1)
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(queries(calls)).toHaveLength(2))
    expect(last(calls).eventIds).toEqual(['e1', 'e2'])
    fireEvent.click(screen.getByText('篩選'))
    expect(screen.queryByText('選活動（測試）')).toBeNull()
  })

  it('換頁送出頁碼；改每頁筆數時回到第一頁', async () => {
    const { calls } = setup({
      FETCH_GET_VOUCHER_ISSUANCE_RECORD: v => page(RECORDS, { pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset }),
    })
    await screen.findByText('共 120 筆資料')
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(last(calls)).toEqual(expect.objectContaining({ pageOffset: 1, pageLimit: 50 })))
    await screen.findByText('共 120 筆資料')
    pickOption(screen.getByLabelText('每頁筆數'), '25')
    await wait(() => expect(last(calls)).toEqual(expect.objectContaining({ pageOffset: 0, pageLimit: 25 })))
  })

  it('沒有資料時顯示無發券明細資料', async () => {
    const { calls, settle } = setup({ FETCH_GET_VOUCHER_ISSUANCE_RECORD: page([], { totalCount: 0 }) })
    await settle()
    expect(queries(calls)).toHaveLength(1)
    expect(await screen.findByText('無發券明細資料')).toBeInTheDocument()
    expect(screen.getByText('共 0 筆資料')).toBeInTheDocument()
  })

  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('查詢失敗時顯示無法載入資料與重新查詢，不整頁壞', async () => {
    const { settle } = renderPage(<EventCouponIssuanceDetails />, { fallback: 'error', route: '/event-coupon-issuance-details' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  })
})
