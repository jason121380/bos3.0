// 保護「掛單詳細」的收款與點數：
// - 其他付款方式：選了付款方式才能填金額，金額不得超過應付（扣掉第三方卡券的項目與扣入金後），超過時保留原值；取消付款方式時金額歸零；
//   應付為 0（全部項目都用第三方卡券）時已填的其他付款金額歸零。
// - 扣入金：顯示顧客可用入金（同一位顧客時含這張掛單原本扣的），扣款不得超過可用入金與應付；換成別的顧客時扣入金歸零。
// - 紅利點數：剩餘點數＝顧客點數紀錄加總；扣點不得超過剩餘＋本次給點、折抵不得超過顧客實際要付的金額；店家設定換算比率時折抵依扣點自動換算；
//   店家設定自動給點時依金額給點（綁 LINE 才給的設定下，未綁 LINE 不給）；不留客資時不顯示紅利。
// 金額彙總的現金應收必須跟著變，送出的 amountByOtherPay／walletPay／bonus* 必須就是畫面上的數字。
// GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft, pageReady, pick, clearField, saveDraft, summaryValue, makeOrder, serviceOrder, panelHeader, customerDetail,
  CUSTOMER, SERVICE,
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

const CUSTOMER2 = { id: 'customer-2', no: 'C02', name: '林先生', cellphone: '0922000111' }
const PAY_WAYS = { merchantPayWays: [{ id: 'pay-1', type: 'CARD', name: '信用卡', fee: 0 }, { id: 'pay-2', type: 'OTHER', name: '轉帳', fee: 0 }] }
const labelInput = label => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('input')
const paymentInput = () => screen.getByPlaceholderText('選擇付款方式')

const setup = async (options = {}, delays) => {
  const page = setupDraft({ merchantPayWays: PAY_WAYS, ...options }, { delays })
  await pageReady(page)
  return page
}
const withCustomer = (orderOverrides = {}, options = {}, delays) =>
  setup({
    order: makeOrder({ customer: CUSTOMER, ...orderOverrides }),
    customer: customerDetail(),
    otherCustomers: { [CUSTOMER2.id]: customerDetail(CUSTOMER2) },
    FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER, CUSTOMER2] } },
    ...options,
  }, delays)

describe('掛單詳細：其他付款方式', () => {
  it('選付款方式後填金額：現金應收扣掉該金額；超過應付不接受；取消付款方式後金額歸零', async () => {
    const page = await setup()
    pick(paymentInput(), '信用卡')
    const amount = await screen.findByTestId('信用卡金額')
    act(() => amount.focus())
    expect([amount.selectionStart, amount.selectionEnd]).toEqual([0, amount.value.length])
    fireEvent.change(amount, { target: { value: '300' } })
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('500'))
    fireEvent.change(amount, { target: { value: '900' } })
    expect(amount).toHaveValue('300')
    let input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: ['信用卡'], amountByOtherPay: 300 }))

    clearField(paymentInput())
    await wait(() => expect(screen.queryByTestId('信用卡金額')).toBeNull())
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('800'))
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: [], amountByOtherPay: 0 }))
  })

  it('掛單帶回付款方式與金額', async () => {
    const page = await setup({ order: makeOrder({ payType: ['轉帳'], amountByOtherPay: 200 }) })
    expect(screen.getByTestId('轉帳金額')).toHaveValue('200')
    expect(paymentInput()).toHaveValue('轉帳')
    const input = await saveDraft(page.calls)
    expect(input.amountByOtherPay).toBe(200)
  })

  it('全部項目都用第三方卡券（應付 0）：已填的其他付款金額歸零，也不能再填', async () => {
    const page = await setup({
      order: makeOrder({ payType: ['轉帳'], amountByOtherPay: 200, serviceOrders: [serviceOrder(SERVICE, { thirdPartyPayId: 'tp-2' })] }),
    })
    await wait(() => expect(screen.getByTestId('轉帳金額')).toHaveValue('0'))
    fireEvent.change(screen.getByTestId('轉帳金額'), { target: { value: '100' } })
    expect(screen.getByTestId('轉帳金額')).toHaveValue('0')
    const input = await saveDraft(page.calls)
    expect(input.amountByOtherPay).toBe(0)
  })

  it('有店販、預收卡、會員卡時，其他付款上限含這些金額（第三方卡券的店販除外）', async () => {
    const page = await setup({
      order: makeOrder({
        payType: ['轉帳'],
        productOrders: [
          { id: 'po-1', name: '洗髮精', count: 1, price: 1200, thirdPartyPayId: null, seller: { id: 'designer-1' }, product: { id: 'product-1', isLocked: 'FALSE' } },
          { id: 'po-2', name: '護髮油', count: 1, price: 500, thirdPartyPayId: 'tp-1', seller: { id: 'designer-1' }, product: { id: 'product-2', isLocked: 'FALSE' } },
        ],
        ticketOrders: [{ id: 'to-1', price: 1000, count: 1, availableCount: 10, remark: '', service: { id: 'ticket-1', isLocked: 'FALSE' }, intoPerformanceWhileBuying: false }],
        membershipOrders: [{ purchaseDate: null, validDayCount: null, expiryDate: null, price: 2000, thirdPartyPayId: null, remark: '', seller: { id: 'designer-1' }, membership: { uuid: 'card-2', isLocked: 'TRUE', effecitveDay: 0 } }],
      }),
    })
    // 服務 800＋店販 1200＋預收卡 1000＋會員卡 2000＝5000
    fireEvent.change(screen.getByTestId('轉帳金額'), { target: { value: '5000' } })
    expect(screen.getByTestId('轉帳金額')).toHaveValue('5000')
    const input = await saveDraft(page.calls)
    expect(input.amountByOtherPay).toBe(5000)
  })
})

describe('掛單詳細：扣入金', () => {
  const wallet = amounts => ({ customerWallet: ({ customerId }) => ({ customerWallet: amounts[customerId] || 0 }) })

  it('同一位顧客：可用入金含這張掛單原本扣的；扣款不得超過可用入金與應付', async () => {
    const page = await withCustomer({ walletPay: 200 }, wallet({ [CUSTOMER.id]: 500 }))
    const field = await screen.findByText('扣入金(700可用)', { selector: 'label' })
    const input = field.parentElement.querySelector('input')
    expect(input).toHaveValue(200)
    act(() => input.focus())
    fireEvent.change(input, { target: { value: '600' } })
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('200'))
    // 超過可用入金（700）不接受
    fireEvent.change(input, { target: { value: '750' } })
    expect(input).toHaveValue(600)
    // 捲動滑鼠滾輪時離開欄位，避免誤改金額
    fireEvent.wheel(input)
    expect(document.activeElement).not.toBe(input)
    const saved = await saveDraft(page.calls)
    expect(saved.walletPay).toBe(600)
  })

  it('扣款不得超過應付（扣掉其他付款後）', async () => {
    const page = await withCustomer({ payType: ['轉帳'], amountByOtherPay: 300 }, wallet({ [CUSTOMER.id]: 5000 }))
    const input = (await screen.findByText('扣入金(5000可用)', { selector: 'label' })).parentElement.querySelector('input')
    fireEvent.change(input, { target: { value: '600' } })
    expect(input).toHaveValue(0)
    fireEvent.change(input, { target: { value: '500' } })
    const saved = await saveDraft(page.calls)
    expect(saved.walletPay).toBe(500)
  })

  it('原掛單沒有扣入金紀錄（null）時可用入金只算顧客餘額；換成別的顧客時扣入金歸零、顯示新顧客的入金', async () => {
    const page = await withCustomer({ walletPay: null }, wallet({ [CUSTOMER.id]: 300, [CUSTOMER2.id]: 900 }))
    const input = (await screen.findByText('扣入金(300可用)', { selector: 'label' })).parentElement.querySelector('input')
    fireEvent.change(input, { target: { value: '100' } })
    await wait(() => expect(input).toHaveValue(100))
    const customerInput = screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
    act(() => customerInput.focus())
    pick(customerInput, '林先生/0922000111/C02')
    const next = (await screen.findByText('扣入金(900可用)', { selector: 'label' })).parentElement.querySelector('input')
    await wait(() => expect(next).toHaveValue(0))
    const saved = await saveDraft(page.calls)
    expect(saved).toEqual(expect.objectContaining({ customerId: CUSTOMER2.id, walletPay: 0 }))
  })

  it('顧客沒有可用入金：不顯示扣入金', async () => {
    await withCustomer({}, wallet({}))
    expect(screen.queryByText(/扣入金\(/, { selector: 'label' })).toBeNull()
  })
})

describe('掛單詳細：紅利點數', () => {
  const bonusField = label => labelInput(label)
  const withBonus = (orderOverrides = {}, options = {}, delays) =>
    withCustomer(orderOverrides, {
      customerBonusActive: true,
      GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 50 }, { bonus: 30 }] },
      ...options,
    }, delays)
  // 註：給點設定若比帳單晚到，目前不會自動給點（已回報為 bug，見交接報告），這裡讓帳單晚一點回來（設定先到）
  const SETTINGS_FIRST = { FETCH_ORDER: 300 }

  it('剩餘點數為點數紀錄加總；扣點不得超過剩餘＋給點，折抵不得超過應付；送出點數', async () => {
    const page = await withBonus()
    expect(await screen.findByText('剩餘點數: 80')).toBeInTheDocument()
    // 沒有點數異動的掛單預設收合
    expect(panelHeader('紅利點數')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(panelHeader('紅利點數'))
    fireEvent.change(bonusField('點數給點'), { target: { value: '10' } })
    fireEvent.change(bonusField('點數扣點'), { target: { value: '100' } })
    expect(bonusField('點數扣點')).toHaveValue('0')
    fireEvent.change(bonusField('點數扣點'), { target: { value: '90' } })
    expect(bonusField('點數扣點')).toHaveValue('90')
    // 負數、非數字不接受
    fireEvent.change(bonusField('點數給點'), { target: { value: '-1' } })
    fireEvent.change(bonusField('點數扣點'), { target: { value: 'x' } })
    expect(bonusField('點數給點')).toHaveValue('10')
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: '900' } })
    expect(bonusField('點數折抵金額')).toHaveValue('0')
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: '90' } })
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('710'))
    // 收合時標題顯示折抵金額
    fireEvent.click(panelHeader('紅利點數'))
    await wait(() => expect(panelHeader('紅利點數')).toHaveTextContent('折抵 90'))
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusDeposit: 10, bonusUsed: 90, bonusDecount: 90 }))
  })

  it('掛單已有點數異動：即使店家關閉紅利仍顯示紅利且預設展開', async () => {
    const page = await withCustomer({ bonusUsed: 20, bonusDecount: 20 }, { GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 100 }] } })
    expect(panelHeader('紅利點數')).toHaveAttribute('aria-expanded', 'true')
    expect(bonusField('點數扣點')).toHaveValue('20')
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusUsed: 20, bonusDecount: 20 }))
  })

  it('店家設定換算比率：折抵依扣點自動換算且不能手改，標題顯示比率', async () => {
    const page = await withBonus({}, { bonusConversion: { isBonusConversion: true, bonusConversionRate: 10 } })
    expect(await screen.findByText('換算比率: 10')).toBeInTheDocument()
    fireEvent.click(panelHeader('紅利點數'))
    expect(bonusField('點數折抵金額')).toBeDisabled()
    fireEvent.change(bonusField('點數扣點'), { target: { value: '75' } })
    await wait(() => expect(bonusField('點數折抵金額')).toHaveValue('7'))
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusUsed: 75, bonusDecount: 7 }))
  })

  it('店家設定自動給點：依應付金額給點且不能手改', async () => {
    const page = await withBonus({}, { bonusRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } }, SETTINGS_FIRST)
    fireEvent.click(panelHeader('紅利點數'))
    await wait(() => expect(bonusField('點數給點')).toHaveValue('8'))
    expect(bonusField('點數給點')).toBeDisabled()
    // 改價格後重新計算
    fireEvent.change(screen.getByTestId('service-0-price'), { target: { value: '1260' } })
    await wait(() => expect(bonusField('點數給點')).toHaveValue('13'))
    const input = await saveDraft(page.calls)
    expect(input.bonusDeposit).toBe(13)
  })

  it('自動給點限綁 LINE：未綁 LINE 的顧客不給點，已綁的照金額給', async () => {
    const rule = { bonusRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } }, bonusRewardWithLine: true }
    let page = await withBonus({}, rule, SETTINGS_FIRST)
    fireEvent.click(panelHeader('紅利點數'))
    await wait(() => expect(bonusField('點數給點')).toHaveValue('0'))
    expect(bonusField('點數給點')).toBeDisabled()
    expect((await saveDraft(page.calls)).bonusDeposit).toBe(0)
    cleanup()
    page = await withBonus({}, { ...rule, customer: customerDetail({ isLineBinded: true }) }, SETTINGS_FIRST)
    fireEvent.click(panelHeader('紅利點數'))
    await wait(() => expect(bonusField('點數給點')).toHaveValue('8'))
    expect((await saveDraft(page.calls)).bonusDeposit).toBe(8)
  })

  it('不留客資：不顯示紅利點數', async () => {
    await setup({ customerBonusActive: true })
    expect(screen.queryByText('紅利點數', { selector: 'p' })).toBeNull()
  })
})
