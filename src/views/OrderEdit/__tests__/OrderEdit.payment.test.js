// 保護「帳單詳細」的其他付款方式、扣入金與紅利點數（Payment／PaymentCustomerWallet／PanelBonus／Bonus）：
// - 其他付款方式：選付款方式後輸入金額送出；金額不可超過應付（超過時維持原值）；全部項目都用第三方卡券時沒有應付金額，不能輸入；
//   清掉付款方式時金額歸 0、不送付款方式
// - 扣入金：可用額度＝顧客目前入金餘額＋這張帳單原本扣的入金；不可超過可用額度、也不可超過應付（扣掉紅利折抵）；
//   原帳單扣入金為空時視為 0；有入金權限時可開啟「異動入金」彈窗再關閉
// - 紅利點數：店家啟用紅利或原帳單有紅利時顯示；扣點不可超過顧客剩餘點數＋本單給點；折抵不可超過應付；負數或非數字不接受；
//   店家設定點數換算時，折抵依扣點自動換算且不可手動改；店家設定自動給點時給點不可手動改；收合時標題列顯示折抵金額
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單或入金。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { callsOf } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, withCustomer, checkoutAndGetInput, summaryValue, loginForTest, SIMPLE_SERVICE_ORDER,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

const paymentInput = () => screen.getByPlaceholderText('選擇付款方式')
const amountInput = () => screen.getByTestId('LINE Pay金額')
const pickPayment = async () => {
  fireEvent.click(paymentInput())
  fireEvent.click(await screen.findByTestId('-LINE Pay'))
}
const walletInput = () => screen.getByText(/^扣入金\(/).parentElement.querySelector('input')

describe('帳單詳細：其他付款方式', () => {
  it('選付款方式、輸入不超過應付的金額：送出付款方式與金額；超過應付時維持原值；聚焦時整段選取', async () => {
    const page = setup()
    await pageReady(page)
    await pickPayment()
    fireEvent.change(amountInput(), { target: { value: '300' } })
    await wait(() => expect(summaryValue('其他付款方式')).toHaveTextContent('300'))
    fireEvent.change(amountInput(), { target: { value: '900' } })
    expect(amountInput()).toHaveValue('300')
    amountInput().focus()
    expect(amountInput().selectionEnd).toBe(3)
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: ['LINE Pay'], amountByOtherPay: 300 }))
  })

  it('清掉付款方式：金額歸 0、不送付款方式', async () => {
    const page = setup({ order: makeOrder({ payType: ['LINE Pay'], amountByOtherPay: 300 }) })
    await pageReady(page)
    await wait(() => expect(amountInput()).toHaveValue('300'))
    paymentInput().focus()
    fireEvent.mouseDown(await screen.findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(screen.queryByTestId('LINE Pay金額')).toBeNull())
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: [], amountByOtherPay: 0 }))
  })

  it('全部項目都用第三方卡券：沒有應付金額，其他付款金額輸入不被接受', async () => {
    const page = setup({
      order: makeOrder({ payType: ['LINE Pay'], serviceOrders: [{ ...SIMPLE_SERVICE_ORDER, thirdPartyPayId: 'tp-1' }] }),
    })
    await pageReady(page)
    fireEvent.change(amountInput(), { target: { value: '100' } })
    expect(amountInput()).toHaveValue('0')
    expect(summaryValue('現金應收')).toHaveTextContent(/^0$/)
  })
})

describe('帳單詳細：扣入金', () => {
  it('可用額度＝入金餘額＋原帳單扣的入金；不超過額度與應付才接受；捲動滑鼠滾輪不會改到金額', async () => {
    const page = setup({ order: withCustomer({ walletPay: 200 }), customerWallet: { customerWallet: 500 } })
    await pageReady(page)
    expect(await screen.findByText('扣入金(700可用)')).toBeInTheDocument()
    fireEvent.change(walletInput(), { target: { value: '750' } })
    expect(walletInput()).toHaveValue(200)
    fireEvent.change(walletInput(), { target: { value: '650' } })
    expect(walletInput()).toHaveValue(650)
    walletInput().focus()
    fireEvent.wheel(walletInput())
    expect(document.activeElement).not.toBe(walletInput())
    const input = await checkoutAndGetInput(page.calls)
    expect(input.walletPay).toBe(650)
  })

  it('扣入金不可超過應付金額（800 元的帳單扣不到 900）', async () => {
    const page = setup({ order: withCustomer(), customerWallet: { customerWallet: 1000 } })
    await pageReady(page)
    await screen.findByText('扣入金(1000可用)')
    fireEvent.change(walletInput(), { target: { value: '900' } })
    expect(walletInput()).toHaveValue(0)
    fireEvent.change(walletInput(), { target: { value: '800' } })
    expect(walletInput()).toHaveValue(800)
  })

  it('原帳單扣入金為空：視為 0，可用額度只有入金餘額', async () => {
    const page = setup({ order: withCustomer({ walletPay: null }), customerWallet: { customerWallet: 500 } })
    await pageReady(page)
    expect(await screen.findByText('扣入金(500可用)')).toBeInTheDocument()
    expect((await checkoutAndGetInput(page.calls)).walletPay).toBe(0)
  })

  it('顧客沒有入金餘額、原帳單也沒扣：不顯示扣入金欄位', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    expect(screen.queryByText(/^扣入金\(/)).toBeNull()
  })

  it('有入金權限：開啟「異動入金」彈窗後可關閉', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    fireEvent.click(await screen.findByText('異動入金', { selector: 'button' }))
    const modal = (await screen.findByRole('heading', { name: '異動入金' })).closest('[role=dialog]')
    fireEvent.click(within(modal).getByText('返回', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('異動入金', { selector: 'h3' })).toBeNull())
  })
})

describe('帳單詳細：紅利點數', () => {
  const bonusOn = { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } }
  const bonusField = label => screen.getByText(label).parentElement.querySelector('input')
  const bonusHeader = () => screen.getByTestId('panelRemark')

  it('店家沒啟用紅利、原帳單也沒有紅利：不顯示紅利點數', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    expect(screen.queryByText('紅利點數')).toBeNull()
  })

  it('扣點不可超過剩餘點數＋本單給點；折抵不可超過應付；負數與非數字不接受；給點可手動輸入', async () => {
    const page = setup({ ...bonusOn, order: withCustomer(), GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 30 }, { bonus: -10 }] } })
    await pageReady(page)
    expect(await screen.findByText('剩餘點數: 20')).toBeInTheDocument()
    // 沒有紅利的帳單預設收合
    fireEvent.click(bonusHeader())
    fireEvent.change(bonusField('點數給點'), { target: { value: '5' } })
    fireEvent.change(bonusField('點數扣點'), { target: { value: '26' } })
    expect(bonusField('點數扣點')).toHaveValue('0')
    fireEvent.change(bonusField('點數扣點'), { target: { value: '25' } })
    expect(bonusField('點數扣點')).toHaveValue('25')
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: '801' } })
    expect(bonusField('點數折抵金額')).toHaveValue('0')
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: '-1' } })
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: 'x' } })
    expect(bonusField('點數折抵金額')).toHaveValue('0')
    fireEvent.change(bonusField('點數折抵金額'), { target: { value: '25' } })
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('775'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusDeposit: 5, bonusUsed: 25, bonusDecount: 25 }))
  })

  it('店家設定點數換算（每 5 點折 1 元）：折抵依扣點自動換算、不可手動改；標題列顯示換算比率', async () => {
    const page = setup({
      ...bonusOn,
      order: withCustomer({ bonusUsed: 10 }),
      GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 100 }] },
      GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: true, bonusConversionRate: 5 } },
    })
    await pageReady(page)
    expect(screen.getByText('換算比率: 5')).toBeInTheDocument()
    // 原帳單有紅利：預設展開
    expect(bonusHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(bonusField('點數折抵金額')).toBeDisabled()
    fireEvent.change(bonusField('點數扣點'), { target: { value: '23' } })
    await wait(() => expect(bonusField('點數折抵金額')).toHaveValue('4'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusUsed: 23, bonusDecount: 4 }))
  })

  it('店家設定自動給點：給點不可手動改', async () => {
    const page = setup({
      ...bonusOn,
      order: withCustomer({ bonusDeposit: 8 }),
      GET_BONUS_REWARD_RULE: { getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } } },
    })
    await pageReady(page)
    expect(bonusField('點數給點')).toBeDisabled()
  })

  it('收合紅利點數：標題列顯示折抵金額；再按一次展開', async () => {
    const page = setup({ ...bonusOn, order: withCustomer({ bonusDecount: 50 }) })
    await pageReady(page)
    expect(bonusHeader()).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(bonusHeader())
    await wait(() => expect(bonusHeader()).toHaveTextContent('折抵 50'))
    fireEvent.click(bonusHeader())
    expect(bonusHeader()).toHaveAttribute('aria-expanded', 'true')
  })

  it('改成新顧客（只輸入手機、還沒建立）：紅利欄位仍在，但不顯示也不查剩餘點數', async () => {
    const page = setup({ ...bonusOn, order: withCustomer(), GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 30 }] } })
    await pageReady(page)
    expect(await screen.findByText('剩餘點數: 30')).toBeInTheDocument()
    const recordCalls = callsOf(page.calls, 'GET_CUSTOMER_BONUS_RECORD').length
    fireEvent.change(screen.getByPlaceholderText('顧客姓名/手機號碼/編號'), { target: { value: '0999888777' } })
    fireEvent.click(await screen.findByText('新增 "0999888777"', {}, { timeout: 3000 }))
    await wait(() => expect(screen.queryByText(/剩餘點數/)).toBeNull())
    expect(screen.getByText('紅利點數')).toBeInTheDocument()
    expect(callsOf(page.calls, 'GET_CUSTOMER_BONUS_RECORD')).toHaveLength(recordCalls)
  })
})
