// 保護「重新開單」的消費項目：佇列帳單（建立失敗的帳單）裡的服務（含助理與第三方卡券）、店販、預收卡販賣、使用預收卡、會員卡
// 要原樣帶回各區塊並算進金額彙總，「重試」送出的就是這些內容；櫃檯在重試前增刪、修改項目時，彙總與送出的內容要跟著變，
// 清掉或刪掉的列不能留在送出的帳單裡。GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, screen } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupQueue, loaded, richQueue, retry, summaryValue, panelOf,
  DESIGNER, ASSISTANT, SERVICE, SERVICE_DYE, PRODUCT, TICKET, CARD, TICKET_RECORD, CUSTOMER,
} from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('重新開單：佇列帳單的各區項目原樣帶回', () => {
  it('服務、店販、預收卡、使用預收卡、會員卡都顯示並算進彙總；重試送出原內容', async () => {
    const page = setupQueue({ queue: richQueue(), GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await loaded(page)
    // 有內容的區塊自動展開
    ;['項目消費', '店販銷售', '預收卡販賣', '使用預收卡', '會員卡銷售'].forEach(title =>
      expect(panelOf(title)).toHaveAttribute('data-state', 'open')
    )
    expect(screen.getByDisplayValue('精緻剪髮(S01)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('染髮(S02)')).toBeInTheDocument()
    // 第三方卡券（團購券，抽成 10%）：顯示扣完後業績；服務綁定且鎖定的卡券不能改
    expect(screen.getByText('扣完後業績:1,800')).toBeInTheDocument()
    expect(screen.getByDisplayValue('團購券')).toBeDisabled()
    expect(screen.getByDisplayValue('洗髮精')).toBeInTheDocument()
    expect(screen.getByDisplayValue('護髮五次卡(T01)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('送一次')).toBeInTheDocument()
    expect(screen.getByDisplayValue('護髮五次卡 剩 4 次')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('助理-護髮')).toHaveValue('李助理-02')
    expect(screen.getByDisplayValue('年卡-365天')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2027/10/21')).toBeInTheDocument()

    expect(summaryValue('服務消費')).toHaveTextContent('2,800')
    expect(summaryValue('店販消費')).toHaveTextContent('600')
    expect(summaryValue('預收卡販賣')).toHaveTextContent('1,000')
    expect(summaryValue('使用預收卡')).toHaveTextContent('200')
    expect(summaryValue('會員卡販賣')).toHaveTextContent('12,000')
    expect(summaryValue('扣入金')).toHaveTextContent('100')
    expect(summaryValue('紅利點數折抵')).toHaveTextContent(/^50$/)
    // 業績合計＝服務＋店販＋使用預收卡＋會員卡（預收卡販賣在使用時才入業績）
    expect(summaryValue('業績合計')).toHaveTextContent('15,600')
    // 現金應收不含第三方卡券付的服務（染髮 2000），再扣入金 100 與紅利折抵 50。
    // 為什麼：四頁金額彙總的預覽以打帳單為準（Jason 2026/10/22），打帳單的現金應收會扣紅利點數折抵；
    // 重新開單原本漏扣（顯示 14,300），付款與折抵也沒列出紅利點數折抵
    expect(summaryValue('現金應收')).toHaveTextContent('14,250')

    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({
        serviceId: SERVICE.id,
        price: 800,
        serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId, isDesignate: true })],
      }),
      expect.objectContaining({ serviceId: SERVICE_DYE.id, price: 2000, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, sellerId: DESIGNER.userId, price: 300, count: 2 })])
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, price: 1000, count: 1, remark: '送一次' })])
    expect(input.useTicketOrders).toEqual([expect.objectContaining({ customerTicketId: TICKET_RECORD.id })])
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: CARD.uuid, price: 12000, sellerId: DESIGNER.userId })])
    expect(input).toEqual(expect.objectContaining({ walletPay: 100, bonusDecount: 50, source: '朋友介紹', serialNumber: '0007', isDesignate: true }))
  })
})

// 只有「使用預收卡」或總金額為 0 的佇列帳單：沒有要收的金額時不顯示「其他付款方式」，付款方式清單不會載入；
// 原本「重試」要等付款方式清單載入才可按，這類帳單永遠不能重試（coverage wave 1，2026/10/22 修正）
describe('重新開單：沒有要收金額的佇列帳單也能重試', () => {
  const ticketOnly = () =>
    richQueue({
      serviceOrders: [],
      productOrders: [],
      ticketOrders: [],
      membershipOrders: [],
      walletPay: 0,
      bonusDecount: 0,
    })

  it('只有使用預收卡：「重試」可按，送出原本的使用預收卡與助理', async () => {
    const page = setupQueue({ queue: ticketOnly() })
    await loaded(page)
    expect(summaryValue('使用預收卡')).toHaveTextContent('200')
    expect(summaryValue('現金應收')).toHaveTextContent(/^0$/)
    const input = await retry(page.calls)
    expect(input.useTicketOrders).toEqual([
      expect.objectContaining({
        customerTicketId: TICKET_RECORD.id,
        useTicketOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId })],
      }),
    ])
    expect(input.serviceOrders).toEqual([])
    expect(input.customerId).toBe(CUSTOMER.id)
  })

  it('服務金額為 0：「重試」可按並送出該服務', async () => {
    const page = setupQueue({
      queue: richQueue({
        serviceOrders: [{ serviceId: SERVICE.id, price: 0, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }],
        productOrders: [], ticketOrders: [], useTicketOrders: [], membershipOrders: [], walletPay: 0, bonusDecount: 0,
      }),
    })
    await loaded(page)
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 0 })])
  })
})
