// 保護「帳單詳細」的預收卡販賣（PannelCouponSells／CouponSells）與使用預收卡（PannelCouponUse／CouponUse）：
// - 預收卡販賣：既有帳單的卡券（可使用次數、價格、張數、備註）原樣帶回並展開；改可使用次數／價格／張數（非數字時次數與張數視為 1、
//   價格視為 0）、備註後送出；清除此列、刪除此列、新增項目、從清單選擇卡券；鎖價卡券不能改次數與價格；
//   帳單不允許改卡券販賣（例如已有人用過這張卡）時不能改、也沒有清除／刪除／新增
// - 鍵盤：卡券 →（價格沒鎖）可使用次數 → 價格 → 張數 → 備註 → 下一列；鎖價卡券從卡券直接跳備註；選定卡券後游標自動移到下一欄
// - 使用預收卡：有顧客的帳單才顯示；帶回原本用的卡、金額與助理；卡券不能改（編輯帳單不得編輯預收卡使用），可以改助理並送出
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { callsOf } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, withCustomer, checkoutAndGetInput, summaryValue, loginForTest, pickEmployee,
  TICKET, TICKET_RECORD, ASSISTANT, DESIGNER,
  findDialog, queryDialog,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

// 鎖價的卡券
const LOCKED_TICKET = { ...TICKET, id: 'ticket-2', no: 'T02', name: '護髮五次卡', price: 4000, ticketAvailableCount: 5, isLocked: 'TRUE' }
const ticketOrder = (ticket, extra = {}) => ({
  id: `to-${ticket.id}`,
  name: ticket.name,
  price: ticket.price,
  count: 1,
  availableCount: ticket.ticketAvailableCount,
  remark: '',
  intoPerformanceWhileBuying: false,
  service: { id: ticket.id, no: ticket.no, name: ticket.name, price: ticket.price, isLocked: ticket.isLocked },
  ...extra,
})
const twoTickets = (overrides = {}) =>
  makeOrder({ ticketOrders: [ticketOrder(TICKET, { remark: '週年慶' }), ticketOrder(LOCKED_TICKET)], ...overrides })

const open = (overrides = {}) =>
  setup({
    order: twoTickets(),
    GET_TICKETS: { tickets: [TICKET, LOCKED_TICKET] },
    ServiceCategories: { serviceCategories: [{ id: 'sc-1', name: '剪髮' }] },
    ...overrides,
  })

const couponInputs = () => screen.getAllByPlaceholderText('卡券名稱/代號')
const rowEl = i => couponInputs()[i].closest('.mb-6')
const fieldOf = (i, name) => rowEl(i).querySelector(`input[name="${name}"]`)
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))
const pickTicket = async (input, name) => {
  fireEvent.change(input, { target: { value: name.slice(0, 1) } })
  await wait(() => expect(document.querySelector(`[data-testid$="-${name}"]`)).not.toBeNull())
  fireEvent.click(document.querySelector(`[data-testid$="-${name}"]`))
}

describe('帳單詳細：預收卡販賣帶回與修改', () => {
  it('有卡券的帳單自動展開、游標在第一張卡；鎖價卡券不能改次數、價格與張數', async () => {
    const page = open()
    await pageReady(page)
    expect(screen.getByTestId('couponSells')).toHaveAttribute('aria-expanded', 'true')
    await focused(couponInputs()[0])
    expect(fieldOf(0, 'remark')).toHaveValue('週年慶')
    expect(fieldOf(0, 'price')).not.toBeDisabled()
    expect(fieldOf(1, 'availableCount')).toBeDisabled()
    expect(fieldOf(1, 'price')).toBeDisabled()
    expect(fieldOf(1, 'count')).toBeDisabled()
  })

  it('改可使用次數、價格、張數與備註後送出；次數與張數輸入非數字視為 1、價格視為 0', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.change(fieldOf(0, 'availableCount'), { target: { value: '12' } })
    fireEvent.change(fieldOf(0, 'price'), { target: { value: '5000' } })
    fireEvent.change(fieldOf(0, 'count'), { target: { value: '2' } })
    fireEvent.change(fieldOf(0, 'remark'), { target: { value: '老客優惠' } })
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('14,000'))
    let input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders[0]).toEqual(
      expect.objectContaining({ serviceId: TICKET.id, availableCount: 12, price: 5000, count: 2, remark: '老客優惠' })
    )
    cleanup()

    const again = open()
    await pageReady(again)
    fireEvent.change(fieldOf(0, 'availableCount'), { target: { value: 'x' } })
    fireEvent.change(fieldOf(0, 'price'), { target: { value: 'x' } })
    fireEvent.change(fieldOf(0, 'count'), { target: { value: 'x' } })
    input = await checkoutAndGetInput(again.calls)
    expect(input.ticketOrders[0]).toEqual(expect.objectContaining({ availableCount: 1, price: 0, count: 1 }))
  })

  it('清除第 2 列：該列不送出；刪除第 2 列：只剩第 1 列', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('couponSells-1-clear'))
    await wait(() => expect(couponInputs()[1]).toHaveValue(''))
    let input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id })])
    cleanup()

    const again = open()
    await pageReady(again)
    fireEvent.click(screen.getByTestId('couponSells-1-delete'))
    await wait(() => expect(couponInputs()).toHaveLength(1))
    input = await checkoutAndGetInput(again.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id })])
  })

  it('只有一列時清除：清成空白列，不送出卡券', async () => {
    const page = open({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET)] }) })
    await pageReady(page)
    fireEvent.click(screen.getByTestId('couponSells-0-clear'))
    await wait(() => expect(couponInputs()[0]).toHaveValue(''))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([])
  })

  it('新增項目後選卡券：送出新卡券的次數與價格；選定後游標移到可使用次數（鎖價卡券則移到備註）', async () => {
    const page = open({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET)] }) })
    await pageReady(page)
    fireEvent.click(screen.getByTestId('couponSells-0-add'))
    await wait(() => expect(couponInputs()).toHaveLength(2))
    await focused(couponInputs()[1])
    await pickTicket(couponInputs()[1], LOCKED_TICKET.name)
    await focused(fieldOf(1, 'remark'))
    fireEvent.click(screen.getByTestId('couponSells-1-add'))
    await wait(() => expect(couponInputs()).toHaveLength(3))
    await pickTicket(couponInputs()[2], TICKET.name)
    await focused(fieldOf(2, 'availableCount'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id }),
      expect.objectContaining({ serviceId: LOCKED_TICKET.id, price: 4000, availableCount: 5, count: 1 }),
      expect.objectContaining({ serviceId: TICKET.id, price: 6000, availableCount: 10 }),
    ])
  })

  it('清掉卡券欄（選取被移除）：該列不送出', async () => {
    const page = open({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET)] }) })
    await pageReady(page)
    couponInputs()[0].focus()
    fireEvent.mouseDown(await within(rowEl(0)).findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent(/^0$/))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([])
  })

  it('帳單不允許改卡券販賣：欄位停用，沒有清除、刪除與新增', async () => {
    const page = open({ order: twoTickets({ isTicketSellingEditable: false }) })
    await pageReady(page)
    expect(couponInputs()[0]).toBeDisabled()
    expect(fieldOf(0, 'price')).toBeDisabled()
    expect(screen.queryByTestId('couponSells-0-clear')).toBeNull()
    expect(screen.queryByTestId('couponSells-1-delete')).toBeNull()
    expect(screen.queryByTestId('couponSells-1-add')).toBeNull()
  })

  it('收合預收卡販賣：標題列顯示已填筆數與金額', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('couponSells'))
    await wait(() => expect(screen.getByTestId('couponSells')).toHaveTextContent('已填 2 筆 · 10,000'))
  })
})

describe('帳單詳細：預收卡販賣游標', () => {
  // 為什麼重要：點另一列的欄位時，該列變成「目前列」會觸發「游標移到第一欄（卡券）」，原本不管焦點是否已在本列欄位上，
  // 游標會先被拉到卡券欄（打字可能打進卡券搜尋），店販／會員卡已修過，這裡比照
  it('從第 1 列直接點第 2 列的價格、再點回第 1 列的備註：游標留在點的欄位，過程中也不會先跳到該列的卡券欄', async () => {
    const page = open({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET), ticketOrder(TICKET, { id: 'to-2' })] }) })
    await pageReady(page)
    await focused(couponInputs()[0])
    const couponFocused = [jest.fn(), jest.fn()]
    couponInputs().forEach((input, i) => input.addEventListener('focus', couponFocused[i]))
    act(() => fieldOf(1, 'price').focus())
    await page.settle()
    expect(document.activeElement).toBe(fieldOf(1, 'price'))
    act(() => fieldOf(0, 'remark').focus())
    await page.settle()
    expect(document.activeElement).toBe(fieldOf(0, 'remark'))
    expect(couponFocused[0]).not.toHaveBeenCalled()
    expect(couponFocused[1]).not.toHaveBeenCalled()
  })
})

describe('帳單詳細：預收卡販賣鍵盤操作', () => {
  it('卡券 → 可使用次數 → 價格 → 張數 → 備註 → 下一列；鎖價卡券直接跳備註；最後一列的備註按 Enter 新增一列', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.keyDown(couponInputs()[0], { key: 'a' })
    enter(couponInputs()[0])
    await focused(fieldOf(0, 'availableCount'))
    expect(fieldOf(0, 'availableCount').selectionEnd).toBe(2)
    enter(fieldOf(0, 'availableCount'))
    await focused(fieldOf(0, 'price'))
    expect(fieldOf(0, 'price').selectionEnd).toBe(4)
    enter(fieldOf(0, 'price'))
    await focused(fieldOf(0, 'count'))
    enter(fieldOf(0, 'count'))
    await focused(fieldOf(0, 'remark'))
    fireEvent.keyDown(fieldOf(0, 'remark'), { key: 'a' })
    enter(fieldOf(0, 'remark'))
    await focused(couponInputs()[1])
    enter(couponInputs()[1])
    await focused(fieldOf(1, 'remark'))
    enter(fieldOf(1, 'remark'))
    await wait(() => expect(couponInputs()).toHaveLength(3))
    await focused(couponInputs()[2])
  })
})

describe('帳單詳細：從清單選擇卡券', () => {
  it('選分類、加入：卡券帶入空白列並送出', async () => {
    const page = open({ order: makeOrder() })
    await pageReady(page)
    // 沒有卡券的帳單預設收合，先展開
    fireEvent.click(screen.getByTestId('couponSells'))
    fireEvent.click(screen.getByLabelText('從清單選擇預收卡', { selector: 'button' }))
    const dialog = within(await findDialog())
    fireEvent.click(dialog.getByRole('button', { name: '剪髮' }))
    await wait(() => expect(callsOf(page.calls, 'GET_TICKETS').some(c => (c.variables.categoryIds || []).includes('sc-1'))).toBe(true))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[0])
    await wait(() => expect(queryDialog()).toBeNull())
    const input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, price: 6000, availableCount: 10 })])
  })

  it('按關閉：不加卡券', async () => {
    const page = open({ order: makeOrder() })
    await pageReady(page)
    fireEvent.click(screen.getByTestId('couponSells'))
    fireEvent.click(screen.getByLabelText('從清單選擇預收卡', { selector: 'button' }))
    const dialog = within(await findDialog())
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(queryDialog()).toBeNull())
    const input = await checkoutAndGetInput(page.calls)
    expect(input.ticketOrders).toEqual([])
  })

  it('卡券清單還在載入：按「從清單選擇」不開啟', async () => {
    setup({ order: makeOrder() }, { delays: { GET_TICKETS: 2000 } })
    await screen.findByText(/帳單詳細 \(A123\)/)
    fireEvent.click(await screen.findByTestId('couponSells'))
    fireEvent.click(await screen.findByLabelText('從清單選擇預收卡', { selector: 'button' }))
    expect(queryDialog()).toBeNull()
  })
})

describe('帳單詳細：使用預收卡', () => {
  const usage = (extra = {}) => ({
    id: TICKET_RECORD.id,
    name: TICKET_RECORD.name,
    price: 600,
    pricePerCount: 600,
    service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000 },
    helperList: [
      { id: 'uh-1', type: '助理-洗髮', isDesignate: false, helperDeductiontype: 'CASH', helper: { id: ASSISTANT.userId } },
    ],
    ...extra,
  })
  const ticketRecords = { GetTicket: { ticketRecords: { data: [TICKET_RECORD] } } }

  it('不留客資的帳單不顯示使用預收卡', async () => {
    const page = setup()
    await pageReady(page)
    expect(screen.queryByText('使用預收卡', { selector: 'p' })).toBeNull()
  })

  it('有顧客的帳單：帶回用的卡、金額與助理；卡券不能改；改助理後送出新的助理', async () => {
    const page = setup({ ...ticketRecords, order: withCustomer({ useTicketOrders: [usage()] }) })
    await pageReady(page)
    const panel = screen.getByText('使用預收卡', { selector: 'p' }).closest('[data-state]')
    const card = within(panel).getByPlaceholderText('卡券名稱/代號')
    await wait(() => expect(card).toHaveValue('剪髮十次卡 '))
    expect(card).toBeDisabled()
    expect(within(panel).getByDisplayValue('600')).toBeDisabled()
    await wait(() => expect(within(panel).getByPlaceholderText('助理-洗髮')).toHaveValue('李助理-02'))
    // 助理欄與同列輸入框同高（size medium：36px、手機 40px；原本 small 34px 比同列矮 2px，Jason 2026/10/22 fix all）
    const helper = within(panel).getByPlaceholderText('助理-洗髮')
    expect(helper.closest('.min-h-9')).not.toBeNull()
    expect(helper.closest('.min-h-8')).toBeNull()
    await pickEmployee(within(panel).getByPlaceholderText('助理-洗髮'), DESIGNER.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.useTicketOrders).toEqual([
      {
        customerTicketId: TICKET_RECORD.id,
        useTicketOrderHelpers: [expect.objectContaining({ type: '助理-洗髮', helperId: DESIGNER.userId })],
      },
    ])
  })

  it('沒有使用預收卡的帳單：區塊收合，展開後只有空白的卡券欄', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    const header = screen.getByText('使用預收卡', { selector: 'p' }).closest('button, [aria-expanded]')
    expect(header).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'true')
    const panel = header.closest('[data-state]')
    expect(within(panel).getByPlaceholderText('卡券名稱/代號')).toHaveValue('')
    expect(within(panel).queryByText('金額')).toBeNull()
  })
})
