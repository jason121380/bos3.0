// 保護「重新開單」的付款、紅利與重試前的整理：
// - 其他付款方式：選付款方式後可輸入金額，金額不能超過應付金額；取消付款方式時金額歸 0；全部項目都由第三方卡券支付時不收其他付款。
// - 扣入金：可用額度是顧客目前的入金餘額（佇列帳單建立失敗時沒有扣款），輸入不能超過餘額，也不能超過帳單金額。
// - 項目金額減到比已扣的入金／其他付款／點數折抵還少時，三者一起歸 0，避免現金應收變成負數。
// - 紅利點數：扣點不能超過顧客剩餘點數；店家設定換算比率時折抵金額由扣點換算、不能手動改；店家開自動給點時依應收金額給點，
//   「綁定 LINE 才給點」而顧客沒綁定時不給點。
// - 頁首流水號（店家開啟時）、備註、佇列帳單缺欄位時的預設值都照實送出；欄位還在載入時「重試」停用並說明。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupQueue, loaded, baseQueue, retry, summaryValue, pickOption, fieldInput, panel, inputOf, ticketRecordsFixture,
  CUSTOMER, SERVICE, TICKET_RECORD,
} from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const withCustomer = (overrides = {}) => baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false, ...overrides })
const payment = () => panel('其他付款方式')
const bonus = () => panel('紅利點數')
const bonusField = label => fieldInput(bonus(), label)

describe('重新開單：其他付款方式', () => {
  it('選付款方式後輸入金額：超過應付金額不接受；重試送出付款方式與金額', async () => {
    const page = setupQueue()
    await loaded(page)
    await pickOption(inputOf(payment().getByTestId('payment')), '信用卡')
    const amount = await payment().findByTestId('信用卡金額')
    const amountInput = inputOf(amount)
    fireEvent.focusIn(amountInput)
    fireEvent.change(amountInput, { target: { value: '300' } })
    await wait(() => expect(summaryValue('其他付款方式')).toHaveTextContent('300'))
    expect(summaryValue('現金應收')).toHaveTextContent('500')
    fireEvent.change(amountInput, { target: { value: '900' } })
    expect(amountInput).toHaveValue('300')
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: ['信用卡'], amountByOtherPay: 300 }))
  })

  it('取消付款方式：金額歸 0、不送付款方式', async () => {
    const page = setupQueue({ queue: baseQueue({ payType: ['信用卡'], amountByOtherPay: 300 }) })
    await loaded(page)
    expect(summaryValue('其他付款方式')).toHaveTextContent('300')
    const select = inputOf(payment().getByTestId('payment'))
    fireEvent.focusIn(select)
    fireEvent.mouseDown(payment().getByLabelText('清除'))
    await wait(() => expect(summaryValue('其他付款方式')).toHaveTextContent(/^0$/))
    expect(payment().queryByTestId('信用卡金額')).toBeNull()
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ payType: [], amountByOtherPay: 0 }))
  })

  it('全部項目都由第三方卡券支付：其他付款方式歸 0，也不能再輸入金額', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-2' }],
        payType: ['信用卡'],
        amountByOtherPay: 200,
      }),
    })
    await loaded(page)
    await wait(() => expect(summaryValue('其他付款方式')).toHaveTextContent(/^0$/))
    const amountInput = inputOf(payment().getByTestId('信用卡金額'))
    fireEvent.change(amountInput, { target: { value: '100' } })
    expect(amountInput).toHaveValue('0')
  })

  it('其他付款金額不為 0 時，付款方式清單載入完成前「重試」停用並說明載入中', async () => {
    const page = setupQueue({ queue: baseQueue({ payType: ['信用卡'], amountByOtherPay: 300 }) }, { delays: { merchantPayWays: 1000 } })
    await screen.findByText(/重新開單 \(A777\)/)
    await wait(() => expect(screen.getByRole('status')).toHaveTextContent('資料載入中，請稍候'))
    expect(screen.getByTestId('checkout')).toBeDisabled()
    await page.settle()
    await wait(() => expect(screen.getByTestId('checkout')).not.toBeDisabled())
  })
})

describe('重新開單：扣入金', () => {
  it('可用額度為顧客入金餘額；超過餘額或帳單金額不接受，額度內接受並送出', async () => {
    const page = setupQueue({ queue: withCustomer(), customerWallet: { customerWallet: 500 } })
    await loaded(page)
    const wallet = fieldInput(payment(), '扣入金(500可用)')
    fireEvent.focusIn(wallet)
    fireEvent.change(wallet, { target: { value: '600' } })
    expect(wallet).toHaveValue(0)
    fireEvent.change(wallet, { target: { value: '300' } })
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent('300'))
    expect(summaryValue('現金應收')).toHaveTextContent('500')
    // 捲動滑鼠滾輪不改數字（離開欄位）
    wallet.focus()
    fireEvent.wheel(wallet)
    expect(document.activeElement).not.toBe(wallet)
    const input = await retry(page.calls)
    expect(input.walletPay).toBe(300)
  })

  it('餘額大於帳單金額時：扣入金不能超過帳單金額', async () => {
    const page = setupQueue({ queue: withCustomer(), customerWallet: { customerWallet: 5000 } })
    await loaded(page)
    const wallet = fieldInput(payment(), '扣入金(5000可用)')
    fireEvent.change(wallet, { target: { value: '900' } })
    expect(wallet).toHaveValue(0)
  })

  it('沒有入金餘額的顧客不顯示扣入金欄', async () => {
    const page = setupQueue({ queue: withCustomer() })
    await loaded(page)
    expect(payment().queryByText(/扣入金/)).toBeNull()
  })
})

// 換顧客時扣入金清空（2026/10/22 Jason：換顧客要清空）。原本清空的程式在扣入金欄元件裡，但沒有顧客時那個元件不顯示，
// 清除顧客或改輸入新手機時清空不會執行，原顧客的扣入金照樣送出（coverage wave 1）
describe('重新開單：清除顧客或改輸入新手機時扣入金清空', () => {
  const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
  const queuedWithWallet = () => withCustomer({ walletPay: 300 })

  it('改輸入新手機：扣入金歸 0，重試送出的扣入金為 0', async () => {
    const page = setupQueue({ queue: queuedWithWallet(), customerWallet: { customerWallet: 1000 } })
    await loaded(page)
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent('300'))
    fireEvent.focusIn(customerInput())
    fireEvent.change(customerInput(), { target: { value: '0933000111' } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent(/^0$/))
    expect(summaryValue('現金應收')).toHaveTextContent('800')
    const input = await retry(page.calls)
    expect(input.customerId).toBeUndefined()
    expect(input.customerCellphone).toBe('0933000111')
    expect(input.walletPay).toBe(0)
  })

  it('清除顧客：扣入金歸 0（之後再輸入手機，送出的扣入金也是 0）', async () => {
    const page = setupQueue({ queue: queuedWithWallet(), customerWallet: { customerWallet: 1000 } })
    await loaded(page)
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent('300'))
    fireEvent.focusIn(customerInput())
    fireEvent.mouseDown(customerInput().parentElement.querySelector('[aria-label="清除"]'))
    await wait(() => expect(customerInput()).toHaveValue(''))
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent(/^0$/))
    fireEvent.change(customerInput(), { target: { value: '0933000222' } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    const input = await retry(page.calls)
    expect(input.walletPay).toBe(0)
  })

  it('原顧客不變（含編輯顧客資料儲存後）：佇列帶入的扣入金照原值送出', async () => {
    const page = setupQueue({
      queue: queuedWithWallet(), customerWallet: { customerWallet: 1000 }, SET_CUSTOMER: { updateCustomer: true },
    })
    await loaded(page)
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
    fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    await page.settle()
    expect(summaryValue('扣入金')).toHaveTextContent('300')
    const input = await retry(page.calls)
    expect(input.walletPay).toBe(300)
  })
})

describe('重新開單：項目金額減少', () => {
  it('項目金額減到比扣入金與其他付款還少時，扣入金、其他付款、點數折抵一起歸 0', async () => {
    const page = setupQueue({
      queue: withCustomer({ walletPay: 300, payType: ['信用卡'], amountByOtherPay: 200, bonusDecount: 100 }),
      customerWallet: { customerWallet: 500 },
    })
    await loaded(page)
    expect(summaryValue('扣入金')).toHaveTextContent('300')
    fireEvent.change(inputOf(screen.getByTestId('service-0-price')), { target: { value: '400' } })
    await wait(() => expect(summaryValue('扣入金')).toHaveTextContent(/^0$/))
    expect(summaryValue('其他付款方式')).toHaveTextContent(/^0$/)
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ walletPay: 0, amountByOtherPay: 0, bonusDecount: 0 }))
  })
})

describe('重新開單：紅利點數', () => {
  const bonusOn = { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true }, GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 30 }, { bonus: 20 }] } }

  it('顯示剩餘點數；扣點不能超過剩餘點數加本次給點；負數與非數字不接受；給點可手動輸入', async () => {
    const page = setupQueue({ queue: withCustomer(), ...bonusOn })
    await loaded(page)
    expect(screen.getByText('剩餘點數: 50')).toBeInTheDocument()
    // 沒有點數異動時區塊收合，點標題展開
    fireEvent.click(within(screen.getByTestId('panelRemark')).getByText('紅利點數'))
    fireEvent.change(bonusField('點數給點'), { target: { value: '10' } })
    await wait(() => expect(bonusField('點數給點')).toHaveValue('10'))
    fireEvent.change(bonusField('點數扣點'), { target: { value: '61' } })
    expect(bonusField('點數扣點')).toHaveValue('0')
    fireEvent.change(bonusField('點數扣點'), { target: { value: '-1' } })
    fireEvent.change(bonusField('點數扣點'), { target: { value: 'abc' } })
    expect(bonusField('點數扣點')).toHaveValue('0')
    fireEvent.change(bonusField('點數扣點'), { target: { value: '60' } })
    await wait(() => expect(bonusField('點數扣點')).toHaveValue('60'))
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusDeposit: 10, bonusUsed: 60 }))
    expect(callsOf(page.calls, 'GET_CUSTOMER_BONUS_RECORD')[0].variables).toEqual({ customerId: CUSTOMER.id })
  })

  // 為什麼：四頁金額彙總的預覽以打帳單為準（Jason 2026/10/22）。打帳單的現金應收會扣紅利點數折抵、付款與折抵列出這一項；
  // 重新開單原本漏扣（佇列帶 50 元折抵時現金應收仍顯示 800），也沒列出折抵。預覽只顯示在畫面，送出的 bonusDecount 不變。
  it('紅利點數折抵：金額彙總列出折抵，現金應收扣掉折抵（比照打帳單）', async () => {
    const page = setupQueue({ queue: withCustomer({ bonusDecount: 50 }), ...bonusOn })
    await loaded(page)
    expect(summaryValue('紅利點數折抵')).toHaveTextContent(/^50$/)
    // 服務 800－紅利折抵 50
    expect(summaryValue('現金應收')).toHaveTextContent(/^750$/)
    expect(summaryValue('業績合計')).toHaveTextContent(/^800$/)
    const input = await retry(page.calls)
    expect(input.bonusDecount).toBe(50)
  })

  it('收合時標題顯示折抵金額', async () => {
    const page = setupQueue({ queue: withCustomer({ bonusDecount: 50 }), ...bonusOn })
    await loaded(page)
    // 佇列帶有折抵：區塊自動展開
    expect(screen.getByTestId('panelRemark')).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByTestId('panelRemark'))
    expect(screen.getByTestId('panelRemark')).toHaveTextContent('折抵 50')
  })

  it('店家設定換算比率：顯示比率，折抵金額由扣點換算且不能手動改', async () => {
    const page = setupQueue({
      queue: withCustomer({ bonusUsed: 0 }),
      ...bonusOn,
      GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: true, bonusConversionRate: 10 } },
    })
    await loaded(page)
    expect(screen.getByText('換算比率: 10')).toBeInTheDocument()
    expect(bonusField('點數折抵金額')).toBeDisabled()
    fireEvent.change(bonusField('點數扣點'), { target: { value: '45' } })
    await wait(() => expect(bonusField('點數折抵金額')).toHaveValue('4'))
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ bonusUsed: 45, bonusDecount: 4 }))
  })

  it('店家開自動給點：依應收金額給點且給點欄停用', async () => {
    const page = setupQueue({
      queue: withCustomer(),
      ...bonusOn,
      GET_BONUS_REWARD_RULE: { getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 2, mode: 'ROUNDDOWN' } } } },
    })
    await loaded(page)
    await wait(() => expect(bonusField('點數給點')).toHaveValue('16'))
    expect(bonusField('點數給點')).toBeDisabled()
    const input = await retry(page.calls)
    expect(input.bonusDeposit).toBe(16)
  })

  it('自動給點限定綁定 LINE 的顧客：顧客沒綁定時不給點', async () => {
    const page = setupQueue({
      queue: withCustomer({ bonusDeposit: 5 }),
      ...bonusOn,
      GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: true } },
      GET_BONUS_REWARD_RULE: { getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } } },
    })
    await loaded(page)
    await wait(() => expect(bonusField('點數給點')).toHaveValue('0'))
    const input = await retry(page.calls)
    expect(input.bonusDeposit).toBe(0)
  })

  it('自動給點限定綁定 LINE：已綁定的顧客照規則給點', async () => {
    const page = setupQueue({
      queue: withCustomer(),
      ...bonusOn,
      FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, membershipPurchaseRecord: [], isLineBinded: true } },
      GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: true } },
      GET_BONUS_REWARD_RULE: { getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDUP' } } } },
    })
    await loaded(page)
    await wait(() => expect(bonusField('點數給點')).toHaveValue('8'))
  })
})

describe('重新開單：頁首與備註', () => {
  it('店家開啟流水號：帶回佇列的流水號，可修改或清空；重試送出', async () => {
    const page = setupQueue({
      queue: baseQueue({ serialNumber: '0007' }),
      GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: true } },
    })
    await loaded(page)
    const serial = screen.getByText('流水號').querySelector('input')
    expect(serial).toHaveValue('0007')
    fireEvent.change(serial, { target: { value: '' } })
    expect(serial).toHaveValue('')
    fireEvent.change(serial, { target: { value: '0012' } })
    const input = await retry(page.calls)
    expect(input.serialNumber).toBe('0012')
  })

  it('清空流水號：送出 null', async () => {
    const page = setupQueue({
      queue: baseQueue({ serialNumber: '0007' }),
      GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: true } },
    })
    await loaded(page)
    fireEvent.change(screen.getByText('流水號').querySelector('input'), { target: { value: '' } })
    const input = await retry(page.calls)
    expect(input.serialNumber).toBeNull()
  })

  it('「帳單速查」開啟當天帳單速查視窗', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.click(screen.getByRole('button', { name: '帳單速查' }))
    expect(await screen.findByText('帳單速查', { selector: 'h2, h2 *' })).toBeInTheDocument()
  })

  it('改備註：重試送出新備註', async () => {
    const page = setupQueue()
    await loaded(page)
    expect(inputOf(screen.getByTestId('remark'))).toHaveValue('佇列重送')
    fireEvent.change(inputOf(screen.getByTestId('remark')), { target: { value: '客人改約' } })
    const input = await retry(page.calls)
    expect(input.remark).toBe('客人改約')
  })
})

describe('重新開單：佇列帳單缺欄位時的預設值', () => {
  it('扣入金為 null 視為 0；沒有不留客資、點數、來源、流水號時送出預設值', async () => {
    const queue = baseQueue({ walletPay: null, serialNumber: undefined })
    delete queue.withoutCustomerData
    const page = setupQueue({ queue: { ...queue, customerCellphone: '0911000222' } })
    await loaded(page)
    const input = await retry(page.calls)
    expect(input).toEqual(
      expect.objectContaining({
        walletPay: 0, withoutCustomerData: false, bonusDecount: 0, bonusDeposit: 0, bonusUsed: 0, source: null, serialNumber: null,
        customerCellphone: '0911000222',
      })
    )
  })

  it('佇列帳單沒有帳單日期：「重試」停用並說明缺帳單日期', async () => {
    const page = setupQueue({ queue: baseQueue({ date: null }) })
    await loaded(page)
    expect(screen.getByTestId('checkout')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('尚缺：帳單日期')
  })

  it('使用兩張以上預收卡：彙總加總每張卡的金額', async () => {
    const second = { ...TICKET_RECORD, id: 'ct-2', price: 300, remark: '' }
    const page = setupQueue({
      queue: withCustomer({
        useTicketOrders: [
          { customerTicketId: TICKET_RECORD.id, price: 200, useTicketOrderHelpers: [] },
          { customerTicketId: second.id, price: 300, useTicketOrderHelpers: [] },
        ],
      }),
      GetTicket: ticketRecordsFixture([TICKET_RECORD, second]),
    })
    await loaded(page)
    expect(summaryValue('使用預收卡')).toHaveTextContent('500')
    expect(summaryValue('業績合計')).toHaveTextContent('1,300')
  })
})
