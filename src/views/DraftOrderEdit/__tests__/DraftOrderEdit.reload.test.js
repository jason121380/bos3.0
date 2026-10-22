// 保護「掛單詳細」改內容後再選顧客：不留客資的掛單改價格、取消「不留客資」、選既有顧客（或以手機快速新增），
// 掛單不得被重設回原內容（價格回到原價、不留客資又被勾回、顧客沒帶上），儲存送出的必須是畫面上改過的內容。
// 為什麼會被重設：有顧客時才掛上的「使用預收卡」區塊會重抓同一張帳單（FETCH_ORDER），四支帳單查詢共用 order(orderId) 根欄位、
// 快取不正規化（addTypename: false），寫入會整個取代帳單物件，頁面原本以「每次查詢結果改變就重新帶入」的 effect 因而把整張掛單蓋回原樣。
// GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { setupDraft, pageReady, pick, saveDraft, summaryValue, makeOrder, customerDetail, CUSTOMER, SERVICE, TICKET } from './draftPageKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const priceInput = () => screen.getByTestId('service-0-price')

describe('掛單詳細：改內容後選顧客，不會被重設回原掛單', () => {
  it('不留客資的掛單改價格 800→950、取消不留客資、選既有顧客：儲存送出 950、這位顧客、withoutCustomerData false', async () => {
    const page = setupDraft({
      FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER] } },
      otherCustomers: { [CUSTOMER.id]: customerDetail() },
    })
    await pageReady(page)
    expect(screen.getByLabelText('不留客資')).toBeChecked()
    fireEvent.change(priceInput(), { target: { value: '950' } })
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    act(() => customerInput().focus())
    pick(customerInput(), '陳小姐/0912345678/C01')
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    // 有顧客後「使用預收卡」區塊掛上、重抓帳單；等所有查詢回來
    await page.settle()
    expect(screen.getByLabelText('不留客資')).not.toBeChecked()
    expect(customerInput()).toHaveValue('陳小姐/0912345678/C01')
    expect(priceInput()).toHaveValue('950')
    expect(summaryValue('業績合計')).toHaveTextContent('950')
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ customerId: CUSTOMER.id, withoutCustomerData: false }))
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 950 })])
  })

  it('不留客資的掛單改價格、取消不留客資、以手機快速新增顧客：儲存送出 950 與這支手機', async () => {
    const page = setupDraft({
      FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } },
      FETCH_ADD_CUSTOMER: { addCustomer: { id: 'customer-new', name: '', cellphone: '0911222333', gender: 'MALE', category: '', birthday: { year: '', month: '', day: '' } } },
      otherCustomers: { 'customer-new': customerDetail({ id: 'customer-new', name: '', no: '', cellphone: '0911222333' }) },
    })
    await pageReady(page)
    fireEvent.change(priceInput(), { target: { value: '950' } })
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    fireEvent.change(customerInput(), { target: { value: '0911222333' } })
    fireEvent.click(await screen.findByText('新增 "0911222333"'))
    fireEvent.click(screen.getByRole('button', { name: '新增顧客' }))
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    await screen.findByText('編輯客戶資料')
    await page.settle()
    expect(screen.getByLabelText('不留客資')).not.toBeChecked()
    expect(priceInput()).toHaveValue('950')
    fireEvent.click(screen.getByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ customerId: 'customer-new', withoutCustomerData: false }))
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 950 })])
  })
})

// 只有預收卡販賣要收現金的掛單：帳單內容帶入時，預收卡販賣區塊稍後才把卡券寫回帳單；
// 這一瞬間「應收」算成 0，若同時帶回的入金／其他付款／點數折抵大於 0，會被「應收小於 0 時歸零」的檢查清掉。
// 帳單帶入時要連同預收卡販賣一起帶入，原掛單的付款才不會被清掉
describe('掛單詳細：只有預收卡販賣的掛單，帶回原本的付款', () => {
  const ticketOnlyOrder = overrides =>
    makeOrder({
      serviceOrders: [],
      ticketOrders: [
        { id: 'to-1', price: 6000, count: 1, availableCount: 10, remark: '', service: { id: TICKET.id, isLocked: 'FALSE' }, intoPerformanceWhileBuying: false },
      ],
      ...overrides,
    })

  it('不留客資：其他付款 1000 帶回並原樣送出', async () => {
    const page = setupDraft({ order: ticketOnlyOrder({ amountByOtherPay: 1000, payType: ['LINE Pay'] }) })
    await pageReady(page)
    const input = await saveDraft(page.calls)
    expect(input.amountByOtherPay).toBe(1000)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, price: 6000, count: 1 })])
  })

  it('有顧客：點數折抵 20 帶回並原樣送出', async () => {
    const page = setupDraft({
      order: ticketOnlyOrder({ customer: CUSTOMER, bonusUsed: 20, bonusDecount: 20 }),
      customer: customerDetail(),
      customerBonusActive: true,
      GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 100 }] },
    })
    await pageReady(page)
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusDecount: 20, bonusUsed: 20, customerId: CUSTOMER.id }))
  })
})
