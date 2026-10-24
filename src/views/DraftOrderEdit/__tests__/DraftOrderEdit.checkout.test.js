// 保護「掛單詳細」送出前的檢查與結帳流程（useDraftCheckout）：
// - 店販／會員卡缺服務人員、缺商品／會員卡、會員卡到期日有誤時，「儲存」與「結帳」都不送出並提示原因，按鈕恢復可按；
// - 儲存失敗時提示錯誤、留在本頁；送出中按鈕停用並說明「處理中」；
// - F9 快捷鍵結帳（店家設重新結帳密碼時改跳密碼視窗，可取消）；
// - 金額彙總：多筆店販、預收卡、使用預收卡的合計正確；其他付款＋扣入金＋折抵超過應付時三者歸零（避免現金應收變負數）；
// - 掛單沒有服務人員時說明尚缺。
// 檢查漏掉就會送出殘缺的帳單；金額錯就是收錢錯。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import billPaymentSummary from 'helper/billPaymentSummary'
import { formatNumber } from 'ui/format'
import {
  setupDraft, pageReady, pick, saveDraft, summaryValue, makeOrder, serviceOrder, panel, panelHeader, customerDetail,
  CUSTOMER, DESIGNER, SERVICE, SERVICE2, TICKET,
} from './draftPageKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const save = () => screen.getByTestId('savedraft')
const checkout = () => screen.getByTestId('checkout')
const productRow = field => {
  const el = panel('店販銷售').getByTestId(`merchantSsell-0-${field}`)
  return el.tagName === 'INPUT' ? el : el.querySelector('input')
}
const cardRow = () => panel('會員卡銷售')

// 按下按鈕後：提示這個原因、沒有送出、按鈕恢復可按
const expectBlocked = async (button, calls, message) => {
  await wait(() => expect(button()).not.toBeDisabled())
  fireEvent.click(button())
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message })))
  expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(0)
  await wait(() => expect(button()).not.toBeDisabled())
}

describe('掛單詳細：送出前檢查', () => {
  it('店販選了服務人員但沒選商品：儲存與結帳都提示「請選擇店販商品」', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('店販銷售'))
    pick(productRow('employee'), 'Amy-01')
    await expectBlocked(save, page.calls, '請選擇店販商品')
    await expectBlocked(checkout, page.calls, '請選擇店販商品')
  })

  it('店販選了商品但沒選服務人員：儲存與結帳都提示「請選擇店販的服務人員」', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('店販銷售'))
    pick(productRow('product'), 'P01 - 洗髮精 - 1200')
    await expectBlocked(save, page.calls, '請選擇店販的服務人員')
    await expectBlocked(checkout, page.calls, '請選擇店販的服務人員')
  })

  it('會員卡選了服務人員但沒選卡：儲存與結帳都提示「請選擇會員卡」', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('會員卡銷售'))
    pick(cardRow().getAllByPlaceholderText('服務人員姓名/編號')[0], 'Amy-01')
    await expectBlocked(save, page.calls, '請選擇會員卡')
    await expectBlocked(checkout, page.calls, '請選擇會員卡')
  })

  it('會員卡選了卡但沒選服務人員：儲存與結帳都提示「請選擇會員卡的服務人員」', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('會員卡銷售'))
    pick(cardRow().getByPlaceholderText('會員卡名稱/代號'), '永久卡 - M02')
    await expectBlocked(save, page.calls, '請選擇會員卡的服務人員')
    await expectBlocked(checkout, page.calls, '請選擇會員卡的服務人員')
  })

  it('會員卡到期日有誤：結帳提示「會員卡到期日有誤」', async () => {
    const page = setupDraft({
      order: makeOrder({
        membershipOrders: [{ purchaseDate: null, validDayCount: 365, expiryDate: new Date(2026, 0, 1).getTime(), price: 12000, thirdPartyPayId: null, remark: '', seller: { id: DESIGNER.userId }, membership: { uuid: 'card-1', isLocked: 'FALSE', effecitveDay: 365 } }],
      }),
    })
    await pageReady(page)
    await expectBlocked(checkout, page.calls, '會員卡到期日有誤')
  })

  it('掛單沒有服務人員：儲存與結帳停用並說明尚缺服務人員', async () => {
    const page = setupDraft({ order: makeOrder({ designer: null, serialNumber: undefined }) })
    await pageReady(page)
    expect(save()).toBeDisabled()
    expect(checkout()).toBeDisabled()
    expect(save().parentElement.getAttribute('title')).toBe('尚缺：服務人員')
  })
})

describe('掛單詳細：送出中與失敗', () => {
  it('儲存送出中：按鈕停用並說明處理中；失敗時提示錯誤、留在本頁且可再按', async () => {
    const page = setupDraft({ reCheckoutOrder: new Error('網路中斷') }, { delays: { reCheckoutOrder: 300 } })
    await pageReady(page)
    await wait(() => expect(save()).not.toBeDisabled())
    fireEvent.click(save())
    await wait(() => expect(save()).toBeDisabled())
    expect(save().parentElement.getAttribute('title')).toBe('處理中，請稍候')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('網路中斷') })))
    await wait(() => expect(save()).not.toBeDisabled())
    expect(screen.getByTestId('testkit-location')).toHaveTextContent('/draft-order/order-1')
  })
})

describe('掛單詳細：從帶日期區間的掛單列表進來', () => {
  // 掛單列表的「查看掛單」連結帶著列表的日期區間（?startDate=…&endDate=…），結帳成功後回到同一區間的帳單列表
  it('結帳成功：提示成功、不提示錯誤，回到帶同一日期區間的帳單列表', async () => {
    const search = '?startDate=1760976000000&endDate=1761062399999'
    const page = setupDraft({}, { route: `/draft-order/order-1${search}` })
    await pageReady(page)
    await wait(() => expect(checkout()).not.toBeDisabled())
    fireEvent.click(checkout())
    await wait(() => expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(1))
    await wait(() => expect(screen.getByTestId('testkit-location')).toHaveTextContent(`/management/orders${search}`))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success', message: '掛單結帳成功' }))
    expect(openSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })

  // 舊寫法 split('=')[1].substring：查詢沒有「=」時拋 TypeError，結帳已成功卻被當成失敗
  it('網址查詢不是日期區間：結帳成功仍回到帳單列表，不提示錯誤', async () => {
    const page = setupDraft({}, { route: '/draft-order/order-1?reprint' })
    await pageReady(page)
    await wait(() => expect(checkout()).not.toBeDisabled())
    fireEvent.click(checkout())
    await wait(() => expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(1))
    await wait(() => expect(screen.getByTestId('testkit-location')).toHaveTextContent('/management/orders'))
    expect(screen.getByTestId('testkit-location')).not.toHaveTextContent('startDate')
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success', message: '掛單結帳成功' }))
    expect(openSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })

  it('日期區間前面還有其他參數：結帳成功仍帶回 startDate 與 endDate', async () => {
    const search = '?source=LINE&startDate=1760976000000&endDate=1761062399999'
    const page = setupDraft({}, { route: `/draft-order/order-1${search}` })
    await pageReady(page)
    await wait(() => expect(checkout()).not.toBeDisabled())
    fireEvent.click(checkout())
    await wait(() => expect(screen.getByTestId('testkit-location')).toHaveTextContent('/management/orders?startDate=1760976000000&endDate=1761062399999'))
    expect(openSnackbar).not.toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }))
  })
})

describe('掛單詳細：F9 快捷鍵', () => {
  it('沒設重新結帳密碼：按 F9 直接結帳；其他按鍵不動作', async () => {
    const page = setupDraft()
    await pageReady(page)
    await wait(() => expect(checkout()).not.toBeDisabled())
    fireEvent.keyDown(document, { code: 'F8' })
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
    fireEvent.keyDown(document, { code: 'F9' })
    await wait(() => expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(1))
    expect(callsOf(page.calls, 'reCheckoutOrder')[0].variables.input.orderInput.isPending).toBe(false)
    await wait(() => expect(screen.getByTestId('testkit-location')).toHaveTextContent('/management/orders'))
  })

  it('有設重新結帳密碼：按 F9 跳出密碼視窗，按取消關閉且不送出', async () => {
    const page = setupDraft({ password: true })
    await pageReady(page)
    fireEvent.keyDown(document, { code: 'F9' })
    expect(await screen.findByLabelText('密碼')).toBeInTheDocument()
    fireEvent.click(screen.getByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByLabelText('密碼')).toBeNull())
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })
})

describe('掛單詳細：金額彙總', () => {
  const product = (id, price, count) => ({
    id: `po-${id}`, name: id, count, price, thirdPartyPayId: null, seller: { id: DESIGNER.userId }, product: { id, isLocked: 'FALSE' },
  })
  const ticket = (id, price, count) => ({
    id: `to-${id}`, price, count, availableCount: 10, remark: '', service: { id, isLocked: 'FALSE' }, intoPerformanceWhileBuying: false,
  })

  it('多筆店販與預收卡：店販消費、預收卡販賣、業績合計與現金應收正確', async () => {
    const page = setupDraft({
      order: makeOrder({
        productOrders: [product('product-1', 1200, 2), product('product-2', 500, 1)],
        ticketOrders: [ticket(TICKET.id, 6000, 1), ticket('ticket-2', 3000, 2)],
      }),
    })
    await pageReady(page)
    expect(summaryValue('店販消費')).toHaveTextContent('2,900')
    expect(summaryValue('預收卡販賣')).toHaveTextContent('12,000')
    // 業績合計不含預收卡販賣（購買當下不入業績），現金應收含
    expect(summaryValue('業績合計')).toHaveTextContent('3,700')
    expect(summaryValue('現金應收')).toHaveTextContent('15,700')
  })

  // 為什麼：v3.10241410 實機驗收時，帳單詳細的現金應收已改呼叫 billPaymentSummary（PR #297），
  // 掛單詳細畫面仍用本地算式。同一張帳單的預覽必須與打帳單、帳單詳細同一個 helper。
  // 使用預收卡只進業績合計、不進現金應收；第三方卡券付的服務／店販／會員卡相反（進業績、不進現金應收）。
  // 未選商品的店販列價格為 0，算進去與排除的結果相同。
  it('現金應收與打帳單同一支 billPaymentSummary：扣第三方卡券、扣入金、其他付款與紅利折抵', async () => {
    const order = makeOrder({
      customer: CUSTOMER,
      payType: ['轉帳'],
      walletPay: 100,
      amountByOtherPay: 50,
      bonusDecount: 20,
      serviceOrders: [serviceOrder(SERVICE), serviceOrder(SERVICE2, { thirdPartyPayId: 'tp-1' })],
      productOrders: [
        { id: 'po-1', name: '洗髮精', count: 2, price: 1200, thirdPartyPayId: null, seller: { id: DESIGNER.userId }, product: { id: 'product-1', isLocked: 'FALSE' } },
        { id: 'po-2', name: '護髮油', count: 1, price: 500, thirdPartyPayId: 'tp-1', seller: { id: DESIGNER.userId }, product: { id: 'product-2', isLocked: 'FALSE' } },
        { id: 'po-empty', name: '', count: 1, price: 0, thirdPartyPayId: null, seller: { id: DESIGNER.userId }, product: { id: '', isLocked: 'FALSE' } },
      ],
      ticketOrders: [ticket(TICKET.id, 6000, 1)],
      membershipOrders: [
        { purchaseDate: null, validDayCount: null, expiryDate: null, price: 3000, thirdPartyPayId: null, remark: '', seller: { id: DESIGNER.userId }, membership: { uuid: 'card-2', isLocked: 'TRUE', effecitveDay: 0 } },
        { purchaseDate: null, validDayCount: null, expiryDate: null, price: 12000, thirdPartyPayId: 'tp-1', remark: '', seller: { id: DESIGNER.userId }, membership: { uuid: 'card-1', isLocked: 'FALSE', effecitveDay: 365 } },
      ],
      useTicketOrders: [
        { id: 'record-1', name: '剪髮10次卡', price: 600, pricePerCount: 600, service: { id: TICKET.id }, helperList: [] },
        { id: 'record-2', name: '剪髮10次卡', price: 650, pricePerCount: 650, service: { id: TICKET.id }, helperList: [] },
      ],
    })
    const page = setupDraft({
      order,
      customer: customerDetail(),
      merchantPayWays: { merchantPayWays: [{ id: 'pay-2', type: 'OTHER', name: '轉帳', fee: 0 }] },
      GetTicket: ({ input }) => ({
        ticketRecords: {
          data: [
            { id: 'record-1', name: '剪髮10次卡', price: 600, remark: '', service: { id: TICKET.id, helperDeductionSetting: [] } },
            { id: 'record-2', name: '剪髮10次卡', price: 650, remark: '', service: { id: TICKET.id, helperDeductionSetting: [] } },
          ].filter(r => !input.ids || input.ids.includes(r.id)),
        },
      }),
    })
    await pageReady(page)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('1,250'))

    // 頁面寫回 bill 的形狀（thirdPartyPayId → thirdPartyCouponMerchantId）。helper 只讀這些欄位。
    const { cashDue } = billPaymentSummary({
      serviceOrders: order.serviceOrders.map(d => ({ price: d.price, thirdPartyCouponMerchantId: d.thirdPartyPayId })),
      productOrders: order.productOrders.map(d => ({ price: d.price, count: d.count, productId: d.product.id, thirdPartyCouponMerchantId: d.thirdPartyPayId })),
      membershipOrders: order.membershipOrders.map(d => ({ price: d.price, thirdPartyCouponMerchantId: d.thirdPartyPayId })),
      ticketOrders: order.ticketOrders.map(d => ({ price: d.price, count: d.count })),
      walletPay: order.walletPay,
      amountByOtherPay: order.amountByOtherPay,
      bonusDecount: order.bonusDecount,
    })
    // 800＋店販 2400＋預收卡販賣 6000＋會員卡 3000－扣入金 100－其他付款 50－紅利折抵 20。
    // 第三方卡券（染髮 2000、護髮油 500、年卡 12000）與使用預收卡 1250 不計。未選商品列價格 0。
    expect(cashDue).toBe(12030)
    const cashDueText = formatNumber(cashDue)
    screen.getAllByText('現金應收', { selector: 'span' }).forEach(label => {
      expect(label.nextSibling).toHaveTextContent(cashDueText)
    })
    // 業績合計仍含第三方卡券與使用預收卡、不含預收卡販賣：2800＋2900＋1250＋15000
    expect(summaryValue('業績合計')).toHaveTextContent('21,950')
    expect(summaryValue('服務消費')).toHaveTextContent('2,800')
    expect(summaryValue('店販消費')).toHaveTextContent('2,900')
    expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000')
    expect(summaryValue('會員卡銷售')).toHaveTextContent('15,000')
  })

  it('使用兩張預收卡：使用預收卡金額為兩張合計並計入業績', async () => {
    const used = id => ({ id, name: '剪髮10次卡', price: 600, pricePerCount: 600, service: { id: TICKET.id }, helperList: [] })
    const page = setupDraft({
      order: makeOrder({ customer: CUSTOMER, useTicketOrders: [used('record-1'), used('record-2')] }),
      customer: customerDetail(),
      GetTicket: ({ input }) => ({
        ticketRecords: {
          data: [
            { id: 'record-1', name: '剪髮10次卡', price: 600, remark: '', service: { id: TICKET.id, helperDeductionSetting: [] } },
            { id: 'record-2', name: '剪髮10次卡', price: 650, remark: '', service: { id: TICKET.id, helperDeductionSetting: [] } },
          ].filter(r => !input.ids || input.ids.includes(r.id)),
        },
      }),
    })
    await pageReady(page)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('1,250'))
    expect(summaryValue('業績合計')).toHaveTextContent('2,050')
  })

  it('其他付款＋扣入金＋折抵超過應付：三者歸零，現金應收不會變負數', async () => {
    const page = setupDraft({ order: makeOrder({ payType: ['轉帳'], amountByOtherPay: 1000, bonusDecount: 0 }) })
    await pageReady(page)
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('800'))
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ amountByOtherPay: 0, walletPay: 0, bonusDecount: 0 }))
  })
})
