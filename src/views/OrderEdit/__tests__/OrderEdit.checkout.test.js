// 保護「帳單詳細」的金額彙總與送出（Footer）：
// - 一張含服務（含助理、第三方卡券）、店販、預收卡、使用預收卡、會員卡的既有帳單，金額彙總要照原帳單算對
//   （業績合計含第三方卡券付的服務、店販、會員卡金額〔四頁以打帳單為準〕，現金應收扣掉第三方卡券、扣入金、其他付款與紅利折抵），
//   重新結帳送出的內容與原帳單一致
// - 送出前的檢查：店販缺服務人員／商品、會員卡缺服務人員／會員卡、到期日無效、服務缺項目時擋下並提示原因，不送出
// - 送出成功後依進來的網址回到正確的列表（訂單列表、帶日期區間的訂單列表、掛單列表、網路訂單）
// - 送出失敗（儲存、重新結帳）：留在本頁，按鈕恢復可按、可以再送一次
// - 狀態：待付款也是「重新結帳」、從網路訂單進來（status=edit）只能儲存、從結帳進來（status=checkout）不顯示儲存
// - F9 快捷鍵：與按下主要按鈕相同（店家開啟重新結帳密碼時先跳密碼視窗）
// - 付款金額超過應付時（例如改低服務價格），扣入金、其他付款與紅利折抵自動歸零，現金應收不會變負數
// - 紅利給點規則：依現金應收自動算給點（規則比帳單晚到也一樣）；店家設定「需綁定 LINE 才給點」而顧客沒綁定時不給點
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { callsOf, currentLocation } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, makeFullOrder, withCustomer, checkoutAndGetInput, summaryValue, button, loginForTest,
  DESIGNER, ASSISTANT, CUSTOMER, SERVICE, LOCKED_SERVICE, PRODUCT, TICKET, MEMBERSHIP, TICKET_RECORD, CUSTOMER_DETAIL,
  pickEmployee,
  statusEl,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

const fullOrderFixtures = (overrides = {}) => ({
  order: makeFullOrder(),
  GetTicket: { ticketRecords: { data: [TICKET_RECORD] } },
  customerWallet: { customerWallet: 1000 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 50 }] },
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
  ...overrides,
})

const errorShown = message =>
  wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message, variant: 'error' })))

describe('帳單詳細：完整帳單的金額彙總與重新結帳', () => {
  it('各項消費、付款與合計照原帳單計算', async () => {
    const page = setup(fullOrderFixtures())
    await pageReady(page)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('600'))
    expect(summaryValue('服務消費')).toHaveTextContent('2,300')
    expect(summaryValue('店販消費')).toHaveTextContent('2,400')
    expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000')
    expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000')
    expect(summaryValue('扣入金')).toHaveTextContent('200')
    expect(summaryValue('其他付款方式')).toHaveTextContent('300')
    expect(summaryValue('紅利點數折抵')).toHaveTextContent('10')
    // 業績合計＝服務 2300＋店販 2400＋使用預收卡 600＋會員卡 3000（第三方卡券付的服務 1500、店販 2400 照樣入業績）
    expect(summaryValue('業績合計')).toHaveTextContent('8,300')
    // 現金應收＝不含第三方卡券的服務 800＋店販 0＋預收卡 6000＋會員卡 3000－扣入金 200－其他付款 300－紅利折抵 10
    expect(summaryValue('現金應收')).toHaveTextContent('9,290')
  })

  // 為什麼：四頁金額彙總的預覽以打帳單為準（Jason 2026/10/22）。打帳單、掛單詳細的業績合計計入第三方卡券付的會員卡售價全額，
  // 帳單詳細原本排除（這張帳單會顯示 5,300），同一張帳單在不同頁數字不同。預覽只顯示在畫面，不送後端（後端依品項明細自己算業績）；
  // 現金應收照舊不含這張會員卡（不由店家收款）。
  it('會員卡用第三方卡券：業績合計計入售價全額，現金應收不含這張會員卡', async () => {
    const full = makeFullOrder()
    const page = setup(fullOrderFixtures({
      order: makeFullOrder({ membershipOrders: [{ ...full.membershipOrders[0], thirdPartyPayId: 'tp-1' }] }),
    }))
    await pageReady(page)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('600'))
    expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000')
    // 服務 2300＋店販 2400＋使用預收卡 600＋會員卡 3000
    expect(summaryValue('業績合計')).toHaveTextContent('8,300')
    // 服務 800＋預收卡 6000－扣入金 200－其他付款 300－紅利折抵 10
    expect(summaryValue('現金應收')).toHaveTextContent('6,290')
  })

  it('重新結帳送出原帳單的顧客、各項消費、付款與紅利（不帶手機、不帶鎖定欄位）', async () => {
    const page = setup(fullOrderFixtures())
    await pageReady(page)
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(
      expect.objectContaining({
        customerId: CUSTOMER.id,
        customerCellphone: '',
        withoutCustomerData: false,
        designerId: DESIGNER.userId,
        isDesignate: true,
        walletPay: 200,
        amountByOtherPay: 300,
        payType: ['LINE Pay'],
        bonusDecount: 10,
        bonusUsed: 10,
        isPending: false,
      })
    )
    expect(input.raffleRecord).toBeUndefined()
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({
        serviceId: SERVICE.id,
        price: 800,
        serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId, type: '助理-洗髮', isDesignate: true })],
      }),
      expect.objectContaining({ serviceId: LOCKED_SERVICE.id, price: 1500, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
    expect(input.serviceOrders[0].isLocked).toBeUndefined()
    expect(input.productOrders).toEqual([
      expect.objectContaining({ productId: PRODUCT.id, sellerId: DESIGNER.userId, price: 1200, count: 2, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
    expect(input.ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id, price: 6000, count: 1, availableCount: 10, remark: '週年慶' }),
    ])
    expect(input.useTicketOrders).toEqual([expect.objectContaining({ customerTicketId: TICKET_RECORD.id })])
    expect(input.membershipOrders).toEqual([
      expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid, sellerId: DESIGNER.userId, price: 3000 }),
    ])
  })
})

describe('帳單詳細：送出後回到哪一頁', () => {
  it('一般進入：重新結帳成功回訂單列表', async () => {
    const page = setup()
    await pageReady(page)
    await checkoutAndGetInput(page.calls)
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('從結帳進來（?status=checkout）：成功後回訂單列表', async () => {
    const page = setup({}, { route: '/order/order-1?status=checkout' })
    await pageReady(page)
    await checkoutAndGetInput(page.calls)
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('從帶日期區間的訂單列表進來：成功後回到同一個日期區間', async () => {
    const page = setup({}, { route: '/order/order-1?startDate=1760000000000xyz&endDate=1760086400000' })
    await pageReady(page)
    await checkoutAndGetInput(page.calls)
    await wait(() =>
      expect(currentLocation()).toBe('/management/orders?startDate=1760000000000&endDate=1760086400000')
    )
  })

  it('有預約的帳單掛單成功回掛單列表', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功', isReserved: true }) })
    await pageReady(page)
    fireEvent.click(button('掛單'))
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
  })

  it('預約成功的帳單按「儲存」成功後回網路訂單', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功' }) })
    await pageReady(page)
    fireEvent.click(button('儲存'))
    await wait(() => expect(currentLocation()).toBe('/management/weborders'))
  })

  it('儲存失敗（例如網路中斷）：留在本頁，儲存、掛單、結帳恢復可按，可以再試一次', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功', isReserved: true }), UpdateOrder: new Error('網路中斷') })
    await pageReady(page)
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(page.calls, 'UpdateOrder')).toHaveLength(1))
    await wait(() => expect(button('儲存')).not.toBeDisabled())
    expect(button('掛單')).not.toBeDisabled()
    expect(screen.getByTestId('checkout')).not.toBeDisabled()
    expect(currentLocation()).toBe('/order/order-1')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(page.calls, 'UpdateOrder')).toHaveLength(2))
  })

  it('重新結帳失敗：留在本頁，按鈕恢復可按', async () => {
    const page = setup({ reCheckoutOrder: new Error('網路中斷') })
    await pageReady(page)
    await checkoutAndGetInput(page.calls)
    await wait(() => expect(screen.getByTestId('checkout')).not.toBeDisabled())
    expect(currentLocation()).toBe('/order/order-1')
  })
})

describe('帳單詳細：依帳單狀態與來源顯示的按鈕', () => {
  it('待付款的帳單：主要動作為「重新結帳」，成功訊息寫「帳單重新結帳成功」', async () => {
    const page = setup({ order: makeOrder({ status: '待付款' }) })
    await pageReady(page)
    expect(screen.getByTestId('checkout')).toHaveTextContent('重新結帳')
    await checkoutAndGetInput(page.calls)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '帳單重新結帳成功' })))
  })

  it('其他狀態（例如已取消）：不顯示結帳類按鈕', async () => {
    const page = setup({ order: makeOrder({ status: '已取消' }) })
    await pageReady(page)
    expect(screen.queryByTestId('checkout')).toBeNull()
    expect(screen.queryByText('儲存', { selector: 'button' })).toBeNull()
  })

  it('從網路訂單編輯進來（?status=edit）：預約成功的帳單只能儲存，不顯示結帳；停用說明針對儲存', async () => {
    const page = setup({ order: makeOrder({ status: '預約成功' }) }, { route: '/order/order-1?status=edit' })
    await pageReady(page)
    expect(screen.queryByTestId('checkout')).toBeNull()
    expect(button('儲存')).toBeDisabled()
    expect(statusEl()).toHaveTextContent('尚缺：顧客')
  })

  it('從結帳進來（?status=checkout）：預約成功的帳單不顯示「儲存」', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功' }) }, { route: '/order/order-1?status=checkout' })
    await pageReady(page)
    expect(screen.getByTestId('checkout')).toHaveTextContent('結帳')
    expect(screen.queryByText('儲存', { selector: 'button' })).toBeNull()
  })

  it('店家關閉掛單功能：有預約的帳單也不顯示「掛單」', async () => {
    const page = setup({
      order: withCustomer({ status: '預約成功', isReserved: true }),
      GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: true } },
    })
    await pageReady(page)
    expect(screen.queryByText('掛單', { selector: 'button' })).toBeNull()
  })

  it('已結算的預約單：儲存停用並說明「帳單已結算」', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功', isCloseAccount: true }) }, { route: '/order/order-1?status=edit' })
    await pageReady(page)
    expect(button('儲存')).toBeDisabled()
    expect(statusEl()).toHaveTextContent('帳單已結算')
  })
})

describe('帳單詳細：送出前的檢查', () => {
  // 店販第一列（頁首之後的服務人員欄位依序為：頁首、店販、會員卡）
  const productSellerInput = () => screen.getAllByPlaceholderText('服務人員姓名/編號')[1]

  it('店販只選了服務人員、沒選商品：提示「請選擇店販商品」，不送出', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.click(screen.getAllByTestId('merchantSell')[0])
    await pickEmployee(productSellerInput(), DESIGNER.userName)
    fireEvent.click(await screen.findByTestId('checkout'))
    await errorShown('請選擇店販商品')
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })

  it('店販只選了商品、沒選服務人員：提示「請選擇店販的服務人員」；預約單按儲存也一樣擋下', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功' }) })
    await pageReady(page)
    fireEvent.click(screen.getAllByTestId('merchantSell')[0])
    fireEvent.change(screen.getByPlaceholderText('商品代號/名稱'), { target: { value: '洗' } })
    fireEvent.click(await screen.findByText(/洗髮精/, { selector: '[role="option"], [role="option"] *' }))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('1,200'))
    fireEvent.click(button('儲存'))
    await errorShown('請選擇店販的服務人員')
    expect(callsOf(page.calls, 'UpdateOrder')).toHaveLength(0)
    await wait(() => expect(button('儲存')).not.toBeDisabled())
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledTimes(2))
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })
})

describe('帳單詳細：送出前的檢查（會員卡與服務）', () => {
  // 會員卡第一列的服務人員欄位：頁首、店販之後的第三個
  const membershipSellerInput = () => screen.getAllByPlaceholderText('服務人員姓名/編號')[2]
  const pickMembership = async () => {
    fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '金' } })
    fireEvent.click(await screen.findByText('金卡 - M01'))
  }

  it('會員卡只選了服務人員：提示「請選擇會員卡」', async () => {
    const page = setup()
    await pageReady(page)
    await pickEmployee(membershipSellerInput(), DESIGNER.userName)
    fireEvent.click(await screen.findByTestId('checkout'))
    await errorShown('請選擇會員卡')
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })

  it('會員卡只選了卡、沒選服務人員：提示「請選擇會員卡的服務人員」', async () => {
    const page = setup()
    await pageReady(page)
    await pickMembership()
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000'))
    fireEvent.click(await screen.findByTestId('checkout'))
    await errorShown('請選擇會員卡的服務人員')
  })

  it('會員卡沒有設定有效天數（後端回 null），算不出到期日：提示「會員卡到期日有誤」', async () => {
    const page = setup({
      FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [{ ...MEMBERSHIP, effecitveDay: null }] } },
    })
    await pageReady(page)
    await pickEmployee(membershipSellerInput(), DESIGNER.userName)
    await pickMembership()
    fireEvent.click(await screen.findByTestId('checkout'))
    await errorShown('會員卡到期日有誤')
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })

  it('原帳單的服務項目已不存在（後端回傳的服務沒有 id）：提示「請選擇服務項目」，不送出', async () => {
    const broken = { ...makeOrder().serviceOrders[0], service: { ...makeOrder().serviceOrders[0].service, id: null } }
    const page = setup({ order: makeOrder({ serviceOrders: [broken] }) })
    await pageReady(page)
    fireEvent.click(await screen.findByTestId('checkout'))
    await errorShown('請選擇服務項目')
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })

  it('預約單儲存時，會員卡缺卡、服務缺項目也一樣擋下', async () => {
    const page = setup({ order: withCustomer({ status: '預約成功' }) })
    await pageReady(page)
    await pickEmployee(membershipSellerInput(), DESIGNER.userName)
    fireEvent.click(button('儲存'))
    await errorShown('請選擇會員卡')
    expect(callsOf(page.calls, 'UpdateOrder')).toHaveLength(0)
  })

  it('預約單儲存時，原帳單的服務沒有 id：提示「請選擇服務項目」', async () => {
    const broken = { ...makeOrder().serviceOrders[0], service: { ...makeOrder().serviceOrders[0].service, id: null } }
    const page = setup({ order: withCustomer({ status: '預約成功', serviceOrders: [broken] }) })
    await pageReady(page)
    fireEvent.click(button('儲存'))
    await errorShown('請選擇服務項目')
    expect(callsOf(page.calls, 'UpdateOrder')).toHaveLength(0)
  })
})

describe('帳單詳細：F9 快捷鍵與重新結帳密碼', () => {
  const pressF9 = () => fireEvent.keyDown(document, { code: 'F9', key: 'F9' })

  it('按 F9 等同按下重新結帳；其他按鍵不動作', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.keyDown(document, { code: 'F8', key: 'F8' })
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
    pressF9()
    await wait(() => expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(1))
  })

  it('店家開啟重新結帳密碼：F9 先跳密碼視窗；按取消關閉視窗、不送出', async () => {
    const page = setup({ password: true })
    await pageReady(page)
    pressF9()
    const title = await screen.findByText('重新結帳', { selector: 'h2, h2 *' })
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
    const dialog = title.closest('[role="dialog"]')
    fireEvent.click(within(dialog).getByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('重新結帳', { selector: 'h2, h2 *' })).toBeNull())
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })
})

describe('帳單詳細：付款與紅利的自動調整', () => {
  it('扣入金加其他付款超過應付金額時，三種付款與紅利折抵都歸零（現金應收不會是負數）', async () => {
    const page = setup({
      order: withCustomer({ walletPay: 500, amountByOtherPay: 400, payType: ['LINE Pay'], bonusDecount: 0 }),
      customerWallet: { customerWallet: 1000 },
    })
    await pageReady(page)
    await wait(() => expect(summaryValue('其他付款方式')).toHaveTextContent(/^0$/))
    expect(summaryValue('扣入金')).toHaveTextContent(/^0$/)
    expect(summaryValue('現金應收')).toHaveTextContent('800')
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ walletPay: 0, amountByOtherPay: 0, bonusDecount: 0 }))
  })

  const bonusRule = { getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } } }
  const lineOnly = { getParameterAboutSettingFunction: { isBonusRewardWithLine: true } }
  // 頁面載入完成後把服務價格改成 900：給點依新的現金應收重算
  const changePriceAndCheckout = async page => {
    await pageReady(page)
    fireEvent.change(screen.getByDisplayValue('800'), { target: { value: '900' } })
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('900'))
    return checkoutAndGetInput(page.calls)
  }

  it('店家設定自動給點（每 100 元 1 點）：現金應收改成 900 元，送出給點 9 點', async () => {
    const input = await changePriceAndCheckout(setup({ order: withCustomer(), GET_BONUS_REWARD_RULE: bonusRule }))
    expect(input.bonusDeposit).toBe(9)
  })

  it('給點規則比帳單晚到（帳單金額先算好）：規則到了照樣依現金應收給點', async () => {
    const page = setup({ order: withCustomer({ bonusDeposit: 0 }), GET_BONUS_REWARD_RULE: bonusRule }, { delays: { GET_BONUS_REWARD_RULE: 300 } })
    await pageReady(page)
    expect((await checkoutAndGetInput(page.calls)).bonusDeposit).toBe(8)
  })

  it('限 LINE 綁定才給點：顧客沒綁定 LINE 給 0 點', async () => {
    const page = setup({ order: withCustomer({ bonusDeposit: 3 }), GET_BONUS_REWARD_RULE: bonusRule, GET_IS_BONUS_REWARD_WITH_LINE: lineOnly })
    expect((await changePriceAndCheckout(page)).bonusDeposit).toBe(0)
  })

  it('限 LINE 綁定才給點：顧客已綁定 LINE 依規則給點', async () => {
    const page = setup({
      order: withCustomer(),
      GET_BONUS_REWARD_RULE: bonusRule,
      GET_IS_BONUS_REWARD_WITH_LINE: lineOnly,
      FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER_DETAIL, isLineBinded: true } },
    })
    expect((await changePriceAndCheckout(page)).bonusDeposit).toBe(9)
  })
})

describe('帳單詳細：其他載入與金額情況', () => {
  it('原帳單沒有服務人員：結帳停用並說明缺服務人員', async () => {
    const page = setup({ order: makeOrder({ designer: null }) })
    await pageReady(page)
    await wait(() => expect(screen.getByTestId('checkout')).toBeDisabled())
    expect(statusEl()).toHaveTextContent('尚缺：服務人員')
  })

  it('改備註：送出新的備註', async () => {
    const page = setup()
    await pageReady(page)
    const remark = screen.getByTestId('remark')
    expect(remark).toHaveValue('老客人')
    fireEvent.change(remark, { target: { value: '改約下週' } })
    expect((await checkoutAndGetInput(page.calls)).remark).toBe('改約下週')
  })

  it('原帳單備註為空：備註欄空白', async () => {
    const page = setup({ order: makeOrder({ remark: null }) })
    await pageReady(page)
    expect(screen.getByTestId('remark')).toHaveValue('')
  })

  it('清掉店販的商品欄（服務人員還在）：店販消費以 0 計、不會變成 NaN；結帳時提示缺商品', async () => {
    const product = (id, count) => ({
      id: `po-${id}`, name: PRODUCT.name, count, price: 1200, thirdPartyPayId: null,
      seller: { id: DESIGNER.userId }, product: { id: PRODUCT.id, no: PRODUCT.no, name: PRODUCT.name, isLocked: 'FALSE' },
    })
    for (const rows of [[product('a', 1)], [product('a', 1), product('b', 2)]]) {
      const page = setup({ order: makeOrder({ productOrders: rows }) })
      await pageReady(page)
      const input = screen.getAllByPlaceholderText('商品代號/名稱')[0]
      input.focus()
      fireEvent.mouseDown(await within(input.closest('.mb-6')).findByLabelText('清除', { selector: 'button' }))
      await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(rows.length === 1 ? /^0$/ : '2,400'))
      expect(summaryValue('業績合計')).not.toHaveTextContent('NaN')
      fireEvent.click(screen.getByTestId('checkout'))
      await errorShown('請選擇店販商品')
      cleanup()
    }
  })

  it('用了兩張預收卡：使用預收卡金額為兩張合計', async () => {
    const second = { ...TICKET_RECORD, id: 'record-2', price: 450 }
    const usage = record => ({
      id: record.id, name: record.name, price: record.price, pricePerCount: record.price,
      service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000 }, helperList: [],
    })
    const page = setup({
      order: withCustomer({ useTicketOrders: [usage(TICKET_RECORD), usage(second)] }),
      GetTicket: { ticketRecords: { data: [TICKET_RECORD, second] } },
    })
    await pageReady(page)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('1,050'))
    expect(summaryValue('業績合計')).toHaveTextContent('1,850')
  })

  it('會員卡用第三方卡券：不計入現金應收', async () => {
    const membership = { ...makeFullOrder().membershipOrders[0], thirdPartyPayId: 'tp-1' }
    const page = setup({ order: makeOrder({ membershipOrders: [membership] }) })
    await pageReady(page)
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000'))
    expect(summaryValue('現金應收')).toHaveTextContent(/^800$/)
  })

  it('只賣會員卡（沒有服務）的帳單：項目消費收合、只有一列空白，照樣可重新結帳', async () => {
    const page = setup({ order: makeOrder({ serviceOrders: [], membershipOrders: makeFullOrder().membershipOrders }) })
    await pageReady(page)
    expect(screen.getByTestId('panelService')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(1)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([])
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid })])
  })
})
