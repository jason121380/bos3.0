// 保護「帳單詳細」的會員卡銷售（PannelMemberShipCardSells／MemberShipCardSells）：
// - 既有帳單的會員卡（服務人員、卡、價格、到期日、第三方卡券、備註）原樣帶回並展開；鎖價卡不能改價格
// - 到期日：可改到期日並送出；早於帳單隔天、晚於 50 年後、無效時在欄位下方說明原因
// - 永久會籍：勾選後到期日為空（不送日期）；取消勾選時依「原帳單的有效天數」重算到期日（購買日＋有效天數；
//   原帳單沒存有效天數時用卡的預設天數；新選的卡從帳單日期起算）
// - 改價格、服務人員、第三方卡券、備註後送出；清除此列、刪除此列、新增項目、從清單選擇會員卡
// - 鍵盤：服務人員 → 會員卡 →（價格沒鎖）價格 → 到期日 → 永久會籍 → 第三方卡券 → 備註 → 下一列；
//   鎖價且永久的卡從會員卡直接跳永久會籍、鎖價有期限的卡跳到期日；選定卡後游標自動移到下一欄；
//   價格沒鎖的永久會籍從價格跳永久會籍（到期日停用跳不過去）
// - 直接點另一列的欄位：游標留在點的欄位，過程中也不先跳到該列的服務人員
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { callsOf } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, checkoutAndGetInput, summaryValue, loginForTest, pickEmployee,
  MEMBERSHIP, DESIGNER, ASSISTANT, BILL_DATE,
  findDialog, queryDialog,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

// 鎖價、永久（有效天數 0）的會員卡
const LIFETIME = { ...MEMBERSHIP, uuid: 'membership-2', no: 'M02', name: '終身卡', sellPrice: 20000, effecitveDay: 0, isLocked: 'TRUE' }
// 鎖價、一年期的會員卡
const LOCKED_YEAR = { ...MEMBERSHIP, uuid: 'membership-3', no: 'M03', name: '銀卡', sellPrice: 1500, isLocked: 'TRUE' }
const PURCHASE = new Date(2026, 9, 1).getTime()
const membershipOrder = (card, extra = {}) => ({
  expiryDate: new Date(2027, 9, 21).getTime(),
  purchaseDate: PURCHASE,
  validDayCount: 30,
  price: card.sellPrice,
  thirdPartyPayId: null,
  remark: '',
  seller: { id: DESIGNER.userId },
  membership: { uuid: card.uuid, isLocked: card.isLocked, effecitveDay: card.effecitveDay },
  ...extra,
})

const open = (order, overrides = {}) =>
  setup({
    order,
    GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP, LIFETIME, LOCKED_YEAR] } },
    FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageLimit: 50, pageOffset: 0, data: [MEMBERSHIP] } },
    FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [] },
    ...overrides,
  })
const withCards = (...rows) => makeOrder({ membershipOrders: rows })

const cardInputs = () => screen.getAllByPlaceholderText('會員卡名稱/代號')
const rowEl = i => cardInputs()[i].closest('.mb-6')
const sellerOf = i => within(rowEl(i)).getByPlaceholderText('服務人員姓名/編號')
const priceOf = i => screen.getByTestId(`memberShipCardSells-${i}-price`)
const dateOf = i => within(rowEl(i)).getByLabelText(/^選擇日期/)
const lifetimeOf = i => within(rowEl(i)).getByLabelText('永久會籍')
const thirdPartyOf = i => within(rowEl(i)).getByPlaceholderText('第三方卡券')
const remarkOf = i => rowEl(i).querySelector('input[name="remark"]')
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))
const pickCard = async (input, card) => {
  fireEvent.change(input, { target: { value: card.name.slice(0, 1) } })
  fireEvent.click(await screen.findByText(`${card.name} - ${card.no}`))
}
const membershipHeader = () => screen.getAllByTestId('merchantSell')[1]
const dayOf = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

describe('帳單詳細：會員卡帶回原帳單', () => {
  it('有會員卡的帳單自動展開；鎖價卡不能改價格；永久卡沒有到期日', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP), membershipOrder(LIFETIME, { expiryDate: null })))
    await pageReady(page)
    expect(membershipHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(cardInputs()[0]).toHaveValue('金卡-365天')
    expect(dateOf(0)).toHaveValue('2027/10/21')
    expect(priceOf(1)).toBeDisabled()
    expect(lifetimeOf(1)).toBeChecked()
    expect(dateOf(1)).toBeDisabled()
  })

  it('收合會員卡：標題列顯示已填筆數與金額', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP), membershipOrder(LIFETIME, { expiryDate: null })))
    await pageReady(page)
    fireEvent.click(membershipHeader())
    await wait(() => expect(membershipHeader()).toHaveTextContent('已填 2 筆 · 23,000'))
  })
})

describe('帳單詳細：會員卡到期日', () => {
  it('改到期日：送出新的到期日', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    fireEvent.click(dateOf(0))
    const picker = await findDialog()
    fireEvent.click(within(picker).getByLabelText('2027年10月15日'))
    const input = await checkoutAndGetInput(page.calls)
    expect(dayOf(new Date(input.membershipOrders[0].expiryDate))).toBe(new Date(2027, 9, 15).getTime())
  })

  it('到期日早於帳單隔天、晚於 50 年後、或無效：欄位下方說明原因', async () => {
    const page = open(
      withCards(
        membershipOrder(MEMBERSHIP, { expiryDate: BILL_DATE }),
        membershipOrder(MEMBERSHIP, { expiryDate: new Date(2080, 0, 1).getTime() }),
        membershipOrder(MEMBERSHIP, { expiryDate: 'not-a-date' })
      )
    )
    await pageReady(page)
    expect(within(rowEl(0)).getByText('時間不得小於2026/10/22')).toBeInTheDocument()
    expect(within(rowEl(1)).getByText('時間不得大於2076/10/21')).toBeInTheDocument()
    expect(within(rowEl(2)).getByText('時間有誤')).toBeInTheDocument()
  })

  it('勾永久會籍：不送到期日；取消勾選：以購買日＋原帳單的有效天數重算', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(dateOf(0)).toBeDisabled())
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(dateOf(0)).toHaveValue('2026/10/31'))
    expect((await checkoutAndGetInput(page.calls)).membershipOrders[0].expiryDate).toBe(addDays(PURCHASE, 30).getTime())
  })

  it('原帳單沒存有效天數的永久卡取消勾選：以購買日＋卡的預設天數重算', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP, { expiryDate: null, validDayCount: null })))
    await pageReady(page)
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(dateOf(0)).toHaveValue('2027/10/01'))
    expect((await checkoutAndGetInput(page.calls)).membershipOrders[0].expiryDate).toBe(addDays(PURCHASE, 365).getTime())
  })

  it('新選的卡勾了永久又取消：從帳單日期起算卡的預設天數', async () => {
    const page = open(makeOrder())
    await pageReady(page)
    await pickEmployee(sellerOf(0), DESIGNER.userName)
    await pickCard(cardInputs()[0], MEMBERSHIP)
    fireEvent.click(await within(rowEl(0)).findByLabelText('永久會籍'))
    await wait(() => expect(dateOf(0)).toBeDisabled())
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(dateOf(0)).toHaveValue('2027/10/21'))
    expect((await checkoutAndGetInput(page.calls)).membershipOrders[0].expiryDate).toBe(addDays(BILL_DATE, 365).getTime())
  })

  // 為什麼重要：終身卡（有效天數 0）沒有可帶的到期日。原本取消「永久會籍」時到期日＝帳單日（新選的卡）或購買日（原帳單的卡）＋0，
  // 是已經過期、又早於日期欄可選最早日期（帳單隔天）的日子，重新結帳照樣送出「當天就到期」的會員卡。
  // 改為到期日留空待櫃檯選，重新結帳時以 checkMembershipOrders 擋下「會員卡到期日有誤」（同重新開單，Codex review PR #265）
  it('新選的終身卡取消「永久會籍」：到期日留空，重新結帳提示「會員卡到期日有誤」不送出', async () => {
    const page = open(makeOrder())
    await pageReady(page)
    await pickEmployee(sellerOf(0), DESIGNER.userName)
    await pickCard(cardInputs()[0], LIFETIME)
    await wait(() => expect(lifetimeOf(0)).toBeChecked())
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(lifetimeOf(0)).not.toBeChecked())
    expect(dateOf(0)).toHaveValue('')
    expect(dateOf(0)).not.toBeDisabled()
    fireEvent.click(await screen.findByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '會員卡到期日有誤', variant: 'error' })))
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })

  it('原帳單的終身卡（沒存有效天數）取消「永久會籍」：不以購買日當天為到期日，重新結帳提示「會員卡到期日有誤」', async () => {
    const page = open(withCards(membershipOrder(LIFETIME, { expiryDate: null, validDayCount: null })))
    await pageReady(page)
    expect(lifetimeOf(0)).toBeChecked()
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(lifetimeOf(0)).not.toBeChecked())
    expect(dateOf(0)).toHaveValue('')
    fireEvent.click(await screen.findByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '會員卡到期日有誤', variant: 'error' })))
    expect(callsOf(page.calls, 'reCheckoutOrder')).toHaveLength(0)
  })
})

describe('帳單詳細：改會員卡後重新結帳', () => {
  it('改價格、服務人員、第三方卡券與備註：送出改過的內容；價格輸入非數字視為 0', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    fireEvent.change(priceOf(0), { target: { value: 'x' } })
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent(/^0$/))
    fireEvent.change(priceOf(0), { target: { value: '2800' } })
    await pickEmployee(sellerOf(0), ASSISTANT.userName)
    fireEvent.click(thirdPartyOf(0))
    fireEvent.click(await within(document.body).findByTestId('團購券'))
    expect(await within(rowEl(0)).findByText('扣完後業績:2,520')).toBeInTheDocument()
    fireEvent.change(remarkOf(0), { target: { value: '生日禮' } })
    const input = await checkoutAndGetInput(page.calls)
    expect(input.membershipOrders).toEqual([
      expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid, price: 2800, sellerId: ASSISTANT.userId, thirdPartyCouponMerchantId: 'tp-1', remark: '生日禮' }),
    ])
  })

  it('清掉第三方卡券：送出 null', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP, { thirdPartyPayId: 'tp-1' })))
    await pageReady(page)
    thirdPartyOf(0).focus()
    fireEvent.mouseDown(await within(rowEl(0)).findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(within(rowEl(0)).queryByText(/扣完後業績/)).toBeNull())
    expect((await checkoutAndGetInput(page.calls)).membershipOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })

  // 為什麼重要：「扣完後業績」是櫃台判斷這張會員卡實際入多少業績的依據。原本會員卡一律按比例算，
  // 固定金額（手續費 100 元）的卡券會顯示 3000 ×（100−100）% = 0，與服務、店販（PERCENT 按比例、其他類型減去金額）不一致。
  it('原帳單用固定金額的第三方卡券：扣完後業績＝價格－手續費', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP, { thirdPartyPayId: 'tp-2' })))
    await pageReady(page)
    // 3000 − 100 = 2900
    expect(await within(rowEl(0)).findByText('扣完後業績:2,900')).toBeInTheDocument()
  })

  it('清除第 2 列、刪除第 2 列：該列不送出', async () => {
    const order = withCards(membershipOrder(MEMBERSHIP), membershipOrder(LIFETIME, { expiryDate: null }))
    const page = open(order)
    await pageReady(page)
    fireEvent.click(within(rowEl(1)).getByLabelText('清除此列', { selector: 'button' }))
    await wait(() => expect(cardInputs()[1]).toHaveValue(''))
    let input = await checkoutAndGetInput(page.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid })])
    cleanup()

    const again = open(order)
    await pageReady(again)
    fireEvent.click(within(rowEl(1)).getByLabelText('刪除此列', { selector: 'button' }))
    await wait(() => expect(cardInputs()).toHaveLength(1))
    input = await checkoutAndGetInput(again.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid })])
  })

  it('只有一列時清除：清成空白列，不送出會員卡', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    fireEvent.click(within(rowEl(0)).getByLabelText('清除此列', { selector: 'button' }))
    await wait(() => expect(cardInputs()[0]).toHaveValue(''))
    expect((await checkoutAndGetInput(page.calls)).membershipOrders).toEqual([])
  })

  it('新增項目後選永久卡：送出不帶到期日；選定後游標移到永久會籍', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    // 店販列也有同樣的 testid，會員卡在後
    const adds = screen.getAllByTestId('merchantSsell-0-add')
    fireEvent.click(adds[adds.length - 1])
    await wait(() => expect(cardInputs()).toHaveLength(2))
    await pickEmployee(sellerOf(1), DESIGNER.userName)
    await pickCard(cardInputs()[1], LIFETIME)
    await focused(lifetimeOf(1))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.membershipOrders).toEqual([
      expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid }),
      expect.objectContaining({ membershipUUID: LIFETIME.uuid, price: 20000, expiryDate: null, sellerId: DESIGNER.userId }),
    ])
  })

  it('選定價格不鎖的卡後游標移到價格、鎖價有期限的卡移到到期日', async () => {
    const page = open(makeOrder())
    await pageReady(page)
    await pickCard(cardInputs()[0], MEMBERSHIP)
    await focused(priceOf(0))
    await pickCard(cardInputs()[0], LOCKED_YEAR)
    await focused(dateOf(0))
  })

  it('從清單選擇會員卡：加入後帶入該卡', async () => {
    const page = open(makeOrder())
    await pageReady(page)
    fireEvent.click(membershipHeader())
    fireEvent.click(screen.getByLabelText('從清單選擇會員卡', { selector: 'button' }))
    const dialog = within(await findDialog())
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[0])
    await wait(() => expect(queryDialog()).toBeNull())
    await wait(() => expect(cardInputs()[0]).toHaveValue('金卡-365天'))
    expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000')
  })
})

describe('帳單詳細：會員卡游標', () => {
  it('從第 1 列直接點第 2 列的會員卡、價格欄：游標留在點的欄位，過程中也不會先跳到第 2 列的服務人員', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP), membershipOrder(MEMBERSHIP)))
    await pageReady(page)
    act(() => sellerOf(0).focus())
    const sellerFocused = jest.fn()
    sellerOf(1).addEventListener('focus', sellerFocused)
    act(() => cardInputs()[1].focus())
    await page.settle()
    expect(document.activeElement).toBe(cardInputs()[1])
    act(() => priceOf(0).focus())
    await page.settle()
    expect(document.activeElement).toBe(priceOf(0))
    expect(sellerFocused).not.toHaveBeenCalled()
  })
})

describe('帳單詳細：會員卡鍵盤操作', () => {
  it('服務人員 → 會員卡 → 價格 → 到期日 → 永久會籍 → 第三方卡券 → 備註 → 下一列（最後一列新增一列）', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP), membershipOrder(LIFETIME, { expiryDate: null }), membershipOrder(LOCKED_YEAR)))
    await pageReady(page)
    fireEvent.keyDown(sellerOf(0), { key: 'a' })
    enter(sellerOf(0))
    await focused(cardInputs()[0])
    fireEvent.keyDown(cardInputs()[0], { key: 'a' })
    enter(cardInputs()[0])
    await focused(priceOf(0))
    fireEvent.keyDown(priceOf(0), { key: 'a' })
    expect(document.activeElement).toBe(priceOf(0))
    enter(priceOf(0))
    await focused(dateOf(0))
    lifetimeOf(0).focus()
    enter(lifetimeOf(0))
    await focused(thirdPartyOf(0))
    enter(thirdPartyOf(0))
    await focused(remarkOf(0))
    fireEvent.keyDown(remarkOf(0), { key: 'a' })
    enter(remarkOf(0))
    await focused(sellerOf(1))
    // 鎖價的永久卡：會員卡按 Enter 跳永久會籍
    enter(sellerOf(1))
    await focused(cardInputs()[1])
    enter(cardInputs()[1])
    await focused(lifetimeOf(1))
    enter(lifetimeOf(1))
    await focused(thirdPartyOf(1))
    enter(thirdPartyOf(1))
    await focused(remarkOf(1))
    enter(remarkOf(1))
    await focused(sellerOf(2))
    // 鎖價有期限的卡：會員卡按 Enter 跳到期日
    enter(sellerOf(2))
    await focused(cardInputs()[2])
    enter(cardInputs()[2])
    await focused(dateOf(2))
    enter(remarkOf(2))
    await wait(() => expect(cardInputs()).toHaveLength(4))
    await focused(sellerOf(3))
  })

  // 已修正（Jason 2026/10/22 fix all）：「永久會籍」勾選框按 Enter 原本一律跳第三方卡券；店家沒開第三方卡券時欄位不存在，
  // 游標停在原地。比照重新開單：沒開第三方卡券時跳備註
  it('沒開第三方卡券：永久會籍 Enter 跳到備註', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP)), { GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false } })
    await pageReady(page)
    expect(within(rowEl(0)).queryByPlaceholderText('第三方卡券')).toBeNull()
    act(() => lifetimeOf(0).focus())
    enter(lifetimeOf(0))
    await focused(remarkOf(0))
  })

  // 為什麼重要：勾了「永久會籍」時到期日欄停用，原本價格按 Enter 一律跳到期日，焦點跳不過去、游標停在價格，
  // 只能改用滑鼠。比照打帳單／掛單詳細：永久會籍時價格 Enter 跳「永久會籍」勾選框；取消勾選後照常跳到期日
  it('價格沒鎖的永久會籍：價格 Enter 跳到「永久會籍」；取消勾選後跳到期日', async () => {
    const page = open(withCards(membershipOrder(MEMBERSHIP, { expiryDate: null })))
    await pageReady(page)
    expect(lifetimeOf(0)).toBeChecked()
    act(() => priceOf(0).focus())
    enter(priceOf(0))
    await focused(lifetimeOf(0))
    fireEvent.click(lifetimeOf(0))
    await wait(() => expect(lifetimeOf(0)).not.toBeChecked())
    act(() => priceOf(0).focus())
    enter(priceOf(0))
    await focused(dateOf(0))
  })
})
