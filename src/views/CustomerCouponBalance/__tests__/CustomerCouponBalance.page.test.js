// 保護「顧客卡券餘額表」：每張卡券的總量／已使用／剩餘、金額（張數 × 四捨五入後的單張金額）、手續費取絕對值、
// 其他付款方式（沒有顯示「無」）、是否已先入業績，以及合計列；報表匯出檔與畫面同內容並加合計列；
// 以顧客、卡券、偏好設計師、最近設計師篩選時送出的參數（顧客／卡券為陣列，設計師清除後為 null）。GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerCouponBalance from '..'

jest.setTimeout(20000)

jest.mock('components/EmployeeAutoComplete', () => ({ label, value, onChange }) => (
  <div data-testid={label} data-value={String(value)}>
    <button type="button" onClick={() => onChange({ userId: `${label}-1` })}>選{label}</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除{label}</button>
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="customer" data-value={value}>
    <button type="button" onClick={() => onChange({ id: 'customer-1' })}>選顧客</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除顧客</button>
  </div>
))
jest.mock('components/TicketAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="ticket" data-value={value}>
    <button type="button" onClick={() => onChange({ id: 'ticket-1' })}>選卡券</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除卡券</button>
  </div>
))

const coupon = overrides => ({
  customerName: '陳小姐',
  customerNo: 'C01',
  customerCellPhone: '0912345678',
  couponNo: 'T01',
  couponName: '護髮五次卡',
  totalCount: 5,
  usedCount: 2,
  remainingCount: 3,
  singleCouponPrice: 199.6,
  singleCouponPriceDecreaseHandingFee: 180.4,
  otherPaymentName: null,
  isIntoPerformanceWhileBuying: true,
  singleCouponHandingFee: -19.6,
  ...overrides,
})

const REPORT = [
  { data: [coupon()] },
  { data: [coupon({ customerName: '林先生', customerNo: 'C02', customerCellPhone: '0922333444', couponNo: 'T02', couponName: '剪髮卡', totalCount: 2, usedCount: 0, remainingCount: 2, singleCouponPrice: 500, singleCouponPriceDecreaseHandingFee: 500, otherPaymentName: 'LINE Pay', isIntoPerformanceWhileBuying: false, singleCouponHandingFee: 0 })] },
]

const setup = (fixtures = {}) =>
  renderPage(<CustomerCouponBalance />, {
    fixtures: { GET_CUSTOMER_COUPON_BALANCE: { customerCouponBalanceReport: REPORT }, ...fixtures },
  })

const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const lastInput = calls => callsOf(calls, 'GET_CUSTOMER_COUPON_BALANCE').pop().variables.input

beforeEach(() => loginAs())
afterEach(cleanup)

describe('顧客卡券餘額表', () => {
  it('每張卡券的數量與金額（單張金額四捨五入後乘張數）、付款方式、是否先入業績與合計', async () => {
    const utils = setup()
    await utils.settle()
    expect(lastInput(utils.calls)).toEqual({ customerId: [], couponId: [], preferDesignerId: null, latestDesignerId: null })
    const row = screen.getByText('護髮五次卡').closest('tr')
    // 總金額 5 × 200、剩餘金額 3 × 200、單張 200、扣手續費後 180、手續費 |−20|
    ;['1,000', '600', '200', '180', '20', '無', '是', '0912345678'].forEach(text =>
      expect(within(row).getByText(text)).toBeInTheDocument()
    )
    const row2 = screen.getByText('剪髮卡').closest('tr')
    expect(within(row2).getByText('LINE Pay')).toBeInTheDocument()
    expect(within(row2).getByText('否')).toBeInTheDocument()
    const total = screen.getByText('合計').closest('tr')
    // 總金額 1000 + 1000、總量 7、已使用 2、剩餘 5、剩餘金額 600 + 1000、單張合計 round(699.6)、扣手續費後 round(680.4)、手續費 |round(−19.6)|
    expect(within(total).getAllByText('2,000')).toHaveLength(1)
    ;['7', '2', '5', '1,600', '700', '680', '20'].forEach(text => expect(within(total).getByText(text)).toBeInTheDocument())

    const csv = exportedCsv()
    expect(csv).toContain('"C01","陳小姐","0912345678","T01","護髮五次卡","1000","5","2","3","600","200","180","20","無","是"')
    expect(csv).toContain('"C02","林先生","0922333444","T02","剪髮卡","1000","2","0","2","1000","500","500","0","LINE Pay","否"')
    expect(csv).toContain('"合計","","","","","2000","7","2","5","1600","700","680","20"')
  })

  it('篩選：顧客、卡券以陣列送出，設計師以 id 送出；清除後回到空陣列／null', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('選顧客'))
    await wait(() => expect(lastInput(utils.calls).customerId).toEqual(['customer-1']))
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', 'customer-1')
    fireEvent.click(screen.getByText('選卡券'))
    await wait(() => expect(lastInput(utils.calls).couponId).toEqual(['ticket-1']))
    expect(screen.getByTestId('ticket')).toHaveAttribute('data-value', 'ticket-1')
    fireEvent.click(screen.getByText('選偏好設計師'))
    await wait(() => expect(lastInput(utils.calls).preferDesignerId).toBe('偏好設計師-1'))
    fireEvent.click(screen.getByText('選最近設計師'))
    await wait(() => expect(lastInput(utils.calls).latestDesignerId).toBe('最近設計師-1'))
    fireEvent.click(screen.getByText('清除顧客'))
    fireEvent.click(screen.getByText('清除卡券'))
    fireEvent.click(screen.getByText('清除偏好設計師'))
    fireEvent.click(screen.getByText('清除最近設計師'))
    await wait(() =>
      expect(lastInput(utils.calls)).toEqual({ customerId: [], couponId: [], preferDesignerId: null, latestDesignerId: null })
    )
  })

  it('沒有資料時合計為 0', async () => {
    const utils = setup({ GET_CUSTOMER_COUPON_BALANCE: { customerCouponBalanceReport: [] } })
    await utils.settle()
    expect(within(screen.getByText('合計').closest('tr')).getAllByText('0').length).toBeGreaterThan(0)
  })

  // 已知缺口（待 Jason 決定）：查詢失敗時資料為 undefined，effect 直接 forEach 拋錯，整頁進入錯誤畫面
  // （views/CustomerCouponBalance/index.js:44）。建議：查詢失敗時以空陣列處理。
  it('已知缺口：查詢失敗時整頁進入錯誤畫面', async () => {
    const utils = setup({ GET_CUSTOMER_COUPON_BALANCE: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
