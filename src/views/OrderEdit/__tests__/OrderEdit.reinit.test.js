// 保護「帳單詳細」：同一張帳單被重新查詢時，不可把櫃檯已改的內容蓋回原帳單。
// 為什麼會重新查詢：Apollo 快取不正規化（addTypename: false，正式環境與測試相同），頁面與各區塊以不同查詢讀同一張帳單
// （FETCH_ORDER、FETRCH_SERVICE_ORDER、FETCH_PRODUCT_ORDER…都寫入 order(orderId)），某一區塊後來才掛載
// （例如不留客資的帳單選了顧客，「使用預收卡」區塊出現）時重抓帳單，其他查詢的資料因此不完整、跟著重抓；
// 原本頁面與各區塊在帳單「每次」查詢完成時都重新帶入原帳單，櫃檯剛改的價格、數量、備註、指定方式…全被蓋掉。
// 現在：同一張帳單只在第一次查到時帶入。GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { callsOf } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, checkoutAndGetInput, summaryValue, loginForTest,
  OTHER_CUSTOMER, DESIGNER, PRODUCT, TICKET, MEMBERSHIP, BILL_DATE,
} from './orderEditKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const customerSearch = { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: v => ({ customers: { customers: v.input.keyword ? [OTHER_CUSTOMER] : [] } }) }

// 不留客資、什麼項目都有的帳單
const order = () =>
  makeOrder({
    productOrders: [
      {
        id: 'po-1',
        name: PRODUCT.name,
        count: 1,
        price: 1200,
        thirdPartyPayId: null,
        isLocked: 'FALSE',
        seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' },
        product: { id: PRODUCT.id, no: PRODUCT.no, name: PRODUCT.name, isLocked: 'FALSE' },
      },
    ],
    ticketOrders: [
      {
        id: 'to-1',
        name: TICKET.name,
        price: 6000,
        count: 1,
        availableCount: 10,
        remark: '週年慶',
        intoPerformanceWhileBuying: false,
        service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000, isLocked: 'FALSE' },
      },
    ],
    membershipOrders: [
      {
        expiryDate: new Date(2027, 9, 21).getTime(),
        purchaseDate: BILL_DATE,
        validDayCount: 365,
        price: 3000,
        thirdPartyPayId: null,
        remark: '',
        seller: { id: DESIGNER.userId },
        membership: { uuid: MEMBERSHIP.uuid, isLocked: 'FALSE', effecitveDay: 365 },
      },
    ],
  })

const membershipRemark = () =>
  screen.getAllByPlaceholderText('會員卡名稱/代號')[0].closest('.mb-6').querySelector('input[name="remark"]')

const pickOtherCustomer = async () => {
  fireEvent.click(screen.getByLabelText('不留客資'))
  act(() => customerInput().focus())
  fireEvent.change(customerInput(), { target: { value: '0922' } })
  fireEvent.click(await screen.findByText('林先生/0922333444/C02', {}, { timeout: 3000 }))
}

describe('帳單詳細：同一張帳單重新查詢時不蓋掉已改的內容', () => {
  it('不留客資的帳單改了各項內容後選顧客（使用預收卡區塊出現、帳單重新查詢）：改過的內容都留著', async () => {
    const page = setup({ ...customerSearch, order: order(), GET_TICKETS: { tickets: [TICKET] } })
    await pageReady(page)
    const ordersBefore = callsOf(page.calls, 'FETCH_ORDER').length

    fireEvent.change(screen.getByDisplayValue('800'), { target: { value: '900' } })
    fireEvent.change(screen.getByTestId('merchantSsell-0-count'), { target: { value: '3' } })
    const couponRemark = screen.getByDisplayValue('週年慶')
    fireEvent.change(couponRemark, { target: { value: '母親節' } })
    fireEvent.change(membershipRemark(), { target: { value: '送禮' } })
    fireEvent.change(screen.getByTestId('remark'), { target: { value: '改過的備註' } })
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('900'))

    await pickOtherCustomer()
    // 使用預收卡區塊出現後重新查詢帳單（快取不正規化，其他帳單查詢也跟著重抓）
    await wait(() => expect(callsOf(page.calls, 'FETCH_ORDER').length).toBeGreaterThan(ordersBefore))
    await page.settle()

    // 畫面上仍是改過的內容
    expect(screen.getByDisplayValue('900')).toBeInTheDocument()
    expect(screen.getByTestId('merchantSsell-0-count')).toHaveValue('3')
    expect(screen.getByDisplayValue('母親節')).toBeInTheDocument()
    expect(screen.getByTestId('remark')).toHaveValue('改過的備註')
    expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    expect(membershipRemark()).toHaveValue('送禮')

    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(
      expect.objectContaining({
        customerId: OTHER_CUSTOMER.id,
        withoutCustomerData: false,
        isDesignate: false,
        remark: '改過的備註',
      })
    )
    expect(input.serviceOrders).toEqual([expect.objectContaining({ price: 900 })])
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, count: 3 })])
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, remark: '母親節' })])
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid, remark: '送禮' })])
  })

  it('選了顧客馬上填扣入金、帳單重新查詢較晚完成：扣入金不會被清掉', async () => {
    const page = setup(
      { ...customerSearch, order: order(), customerWallet: { customerWallet: 1000 } },
      // 會員卡查詢晚回：選顧客後帳單重新查詢的連鎖（各帳單查詢互相讓對方資料不完整而重抓）在櫃檯填完扣入金之後才結束
      { delays: { FETCH_MEMBERSHIP_ORDER: 400 } }
    )
    await pageReady(page)
    const ordersBefore = callsOf(page.calls, 'FETCH_ORDER').length
    await pickOtherCustomer()
    const wallet = () => screen.getByText(/^扣入金\(/).parentElement.querySelector('input')
    await wait(() => expect(wallet()).toBeInTheDocument())
    fireEvent.change(wallet(), { target: { value: '300' } })
    expect(wallet()).toHaveValue(300)
    await wait(() => expect(callsOf(page.calls, 'FETCH_ORDER').length).toBeGreaterThan(ordersBefore + 1))
    await page.settle()
    expect(wallet()).toHaveValue(300)
    expect((await checkoutAndGetInput(page.calls)).walletPay).toBe(300)
  })
})
