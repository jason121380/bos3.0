// 保護「掛單詳細」的預收卡：
// - 預收卡販賣：掛單帶回的卡券（可使用次數、價格、張數、備註、購買時是否入業績）要原樣送出；選卡券帶入卡券的次數與價格，
//   改次數／價格／張數／備註、清除、刪除、新增、從清單選擇後按「儲存」，送出的 ticketOrders 必須就是畫面上的內容；
//   價格鎖定的卡券不能改次數、價格、張數；帳單不允許編輯卡券販賣時，卡券欄與增刪鈕都停用／隱藏；Enter 依序跳欄。
// - 使用預收卡：有顧客的掛單帶回使用的預收卡（不可更換、金額不可改）與助理；改助理後送出新的助理，業績合計含使用預收卡金額。
// 送錯就是卡券張數、顧客剩餘次數或業績錯。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft, pageReady, pick, saveDraft, summaryValue, makeOrder, panel, panelHeader, customerDetail,
  CUSTOMER, HELPER, TICKET, TICKET_LOCKED,
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

const ticketOrder = (ticket = TICKET, overrides = {}) => ({
  id: `to-${ticket.id}`,
  name: ticket.name,
  price: ticket.price,
  count: 1,
  availableCount: ticket.ticketAvailableCount,
  remark: '週年慶',
  service: { id: ticket.id, no: ticket.no, name: ticket.name, price: ticket.price, isLocked: ticket.isLocked },
  intoPerformanceWhileBuying: true,
  ...overrides,
})

const coupons = () => panel('預收卡販賣')
const couponInput = index => coupons().getAllByPlaceholderText('卡券名稱/代號')[index]
const field = (label, index = 0) => coupons().getAllByText(label, { selector: 'label' })[index].parentElement.querySelector('input')
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
const focusOn = el => act(() => el.focus())
const expectFocused = el => wait(() => expect(document.activeElement).toBe(el))

const setup = async (options = {}) => {
  const page = setupDraft({ order: makeOrder({ ticketOrders: [ticketOrder()] }), ...options })
  await pageReady(page)
  return page
}

describe('掛單詳細：預收卡販賣帶回與修改', () => {
  it('帶回原掛單的卡券並原樣送出（含購買時入業績）；金額彙總有預收卡販賣', async () => {
    const page = await setup()
    expect(couponInput(0)).toHaveValue('剪髮10次卡(T01)')
    expect(field('可使用次數')).toHaveValue('10')
    expect(field('備註')).toHaveValue('週年慶')
    expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000')
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id, availableCount: 10, price: 6000, count: 1, remark: '週年慶', intoPerformanceWhileBuying: true }),
    ])
  })

  it('改次數、價格、張數、備註後送出新內容；次數與張數輸入非數字視為 1、價格視為 0', async () => {
    const page = await setup()
    fireEvent.change(field('可使用次數'), { target: { value: '12' } })
    fireEvent.change(field('價格'), { target: { value: '5000' } })
    fireEvent.change(field('張數'), { target: { value: '2' } })
    fireEvent.change(field('備註'), { target: { value: '老客價' } })
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('10,000'))
    let input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id, availableCount: 12, price: 5000, count: 2, remark: '老客價' }),
    ])
    fireEvent.change(field('可使用次數'), { target: { value: 'x' } })
    fireEvent.change(field('價格'), { target: { value: 'x' } })
    fireEvent.change(field('張數'), { target: { value: 'x' } })
    expect([field('可使用次數'), field('價格'), field('張數')].map(i => i.value)).toEqual(['1', '0', '1'])
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.ticketOrders[0]).toEqual(expect.objectContaining({ availableCount: 1, price: 0, count: 1 }))
  })

  it('換卡券：帶入新卡券的次數與價格；價格鎖定的卡券不能改次數、價格、張數，焦點跳到備註', async () => {
    const page = await setup()
    pick(couponInput(0), TICKET_LOCKED.name)
    await wait(() => expect(field('可使用次數')).toHaveValue('5'))
    expect(field('價格')).toHaveValue('3000')
    ;['可使用次數', '價格', '張數'].forEach(label => expect(field(label)).toBeDisabled())
    await expectFocused(field('備註'))
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET_LOCKED.id, availableCount: 5, price: 3000 })])
  })

  it('換成可改價的卡券：焦點跳到可使用次數', async () => {
    await setup({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET_LOCKED)] }) })
    pick(couponInput(0), TICKET.name)
    await wait(() => expect(field('可使用次數')).toHaveValue('10'))
    await expectFocused(field('可使用次數'))
  })

  it('帳單不允許編輯卡券販賣：卡券欄與次數、價格、張數停用，沒有清除／刪除／新增', async () => {
    await setup({ order: makeOrder({ ticketOrders: [ticketOrder()], isTicketSellingEditable: false }) })
    expect(couponInput(0)).toBeDisabled()
    ;['可使用次數', '價格', '張數'].forEach(label => expect(field(label)).toBeDisabled())
    expect(coupons().queryByTestId('couponSells-0-clear')).toBeNull()
    expect(coupons().queryByTestId('couponSells-0-add')).toBeNull()
  })
})

describe('掛單詳細：預收卡販賣列的新增、清除與刪除', () => {
  it('新增一列選卡券後兩列都送出；刪除第二列後只送第一列', async () => {
    const page = await setup()
    fireEvent.click(coupons().getByTestId('couponSells-0-add'))
    await wait(() => expect(coupons().getAllByPlaceholderText('卡券名稱/代號')).toHaveLength(2))
    expect(coupons().queryByTestId('couponSells-0-delete')).toBeNull()
    pick(couponInput(1), TICKET_LOCKED.name)
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('9,000'))
    fireEvent.click(coupons().getByTestId('couponSells-1-delete'))
    await wait(() => expect(coupons().getAllByPlaceholderText('卡券名稱/代號')).toHaveLength(1))
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders.map(t => t.serviceId)).toEqual([TICKET.id])
  })

  it('只有一列時清除：整列清空，不送出卡券', async () => {
    const page = await setup()
    fireEvent.click(coupons().getByTestId('couponSells-0-clear'))
    await wait(() => expect(couponInput(0)).toHaveValue(''))
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([])
  })

  it('兩列時清除第一列：第二列照送', async () => {
    const page = await setup({ order: makeOrder({ ticketOrders: [ticketOrder(), ticketOrder(TICKET_LOCKED)] }) })
    fireEvent.click(coupons().getByTestId('couponSells-0-clear'))
    await wait(() => expect(couponInput(0)).toHaveValue(''))
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET_LOCKED.id, price: 3000 })])
  })
})

describe('掛單詳細：預收卡販賣收合、從清單選擇與 Enter 跳欄', () => {
  it('掛單沒有卡券：預設收合；收合時顯示已填筆數與小計', async () => {
    const page = setupDraft()
    await pageReady(page)
    expect(panelHeader('預收卡販賣')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(panelHeader('預收卡販賣'))
    pick(couponInput(0), TICKET.name)
    await wait(() => expect(field('價格')).toHaveValue('6000'))
    fireEvent.click(panelHeader('預收卡販賣'))
    await wait(() => expect(panelHeader('預收卡販賣')).toHaveTextContent('已填 1 筆 · 6,000'))
  })

  it('從清單選擇預收卡：卡券清單還在載入時不開窗', async () => {
    // 卡券清單遲遲不回來（測試結束前都不回）
    setupDraft({}, { delays: { GET_TICKETS: 60000 } })
    await screen.findByText(/掛單詳細 \(A123\)/)
    fireEvent.click(panelHeader('預收卡販賣'))
    fireEvent.click(coupons().getByRole('button', { name: '從清單選擇預收卡' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('從清單選擇預收卡：按「關閉」不加入；第一列空白時「加入」帶入第一列', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('預收卡販賣'))
    fireEvent.click(coupons().getByRole('button', { name: '從清單選擇預收卡' }))
    let dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(couponInput(0)).toHaveValue('')
    fireEvent.click(coupons().getByRole('button', { name: '從清單選擇預收卡' }))
    dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(couponInput(0)).toHaveValue('剪髮10次卡(T01)'))
    const input = await saveDraft(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, price: 6000, intoPerformanceWhileBuying: false })])
  })

  it('卡券 → 可使用次數 → 價格 → 張數 → 備註 → 自動新增下一列並跳到卡券', async () => {
    await setup()
    focusOn(couponInput(0))
    enter(couponInput(0))
    const available = field('可使用次數')
    await expectFocused(available)
    // 進可使用次數欄時整欄選取
    expect([available.selectionStart, available.selectionEnd]).toEqual([0, available.value.length])
    enter(available)
    await expectFocused(field('價格'))
    fireEvent.keyDown(field('價格'), { key: '1' })
    expect(document.activeElement).toBe(field('價格'))
    enter(field('價格'))
    await expectFocused(field('張數'))
    enter(field('張數'))
    await expectFocused(field('備註'))
    fireEvent.keyDown(field('備註'), { key: 'a' })
    enter(field('備註'))
    await wait(() => expect(coupons().getAllByPlaceholderText('卡券名稱/代號')).toHaveLength(2))
    await expectFocused(couponInput(1))
  })

  it('已選卡券的列在卡券欄打字或退格：焦點留在卡券欄，不跳到可使用次數或備註', async () => {
    await setup({ order: makeOrder({ ticketOrders: [ticketOrder(), ticketOrder(TICKET_LOCKED)] }) })
    focusOn(couponInput(0))
    fireEvent.keyDown(couponInput(0), { key: 'Backspace' })
    fireEvent.keyDown(couponInput(0), { key: 'a' })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(document.activeElement).toBe(couponInput(0))
    // 價格鎖定的卡券同樣不跳到備註
    focusOn(couponInput(1))
    fireEvent.keyDown(couponInput(1), { key: 'Backspace' })
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(document.activeElement).toBe(couponInput(1))
  })

  it('價格鎖定的卡券：卡券 Enter 直接跳到備註；兩列時第一列備註 Enter 只移到下一列', async () => {
    await setup({ order: makeOrder({ ticketOrders: [ticketOrder(TICKET_LOCKED), ticketOrder()] }) })
    focusOn(couponInput(0))
    enter(couponInput(0))
    await expectFocused(field('備註', 0))
    enter(field('備註', 0))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(coupons().getAllByPlaceholderText('卡券名稱/代號')).toHaveLength(2)
  })
})

describe('掛單詳細：使用預收卡', () => {
  const USED = {
    id: 'record-1',
    name: '剪髮10次卡',
    price: 600,
    pricePerCount: 600,
    service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000 },
    helperList: [{ id: 'uh-1', type: '洗髮-A', isDesignate: false, helperDeductiontype: 'FIXED', helper: { id: HELPER.userId } }],
  }
  // 顧客的卡券紀錄：依 ids 查（計算使用金額、展開助理設定）或依顧客查（下拉選項）
  const ticketRecords = ({ input }) => ({
    ticketRecords: {
      data: [
        {
          id: 'record-1',
          name: '剪髮10次卡',
          price: 600,
          remark: '',
          service: { id: TICKET.id, helperDeductionSetting: [{ type: '洗髮', nameList: ['A', 'B'], helperDeductionType: 'FIXED' }] },
        },
      ].filter(r => !input.ids || input.ids.includes(r.id)),
    },
  })
  const setupWithUsage = async (useTicketOrders = [USED]) => {
    const page = setupDraft({
      order: makeOrder({ customer: CUSTOMER, useTicketOrders }),
      customer: customerDetail(),
      GetTicket: ticketRecords,
    })
    await pageReady(page)
    return page
  }

  it('帶回使用的預收卡（不可更換、金額不可改）與助理；改第二位助理後送出', async () => {
    const page = await setupWithUsage()
    const usage = panel('使用預收卡')
    await wait(() => expect(usage.getByPlaceholderText('卡券名稱/代號')).toHaveValue('剪髮10次卡 '))
    expect(usage.getByPlaceholderText('卡券名稱/代號')).toBeDisabled()
    const price = usage.getByText('金額', { selector: 'label' }).parentElement.querySelector('input')
    expect(price).toHaveValue('600')
    expect(price).toBeDisabled()
    // 業績合計含使用預收卡的金額
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('600'))
    expect(summaryValue('業績合計')).toHaveTextContent('1,400')
    // 助理：原本的洗髮-A，加上依卡券服務設定展開的洗髮-B
    const helperB = await usage.findByPlaceholderText('洗髮-B')
    expect(usage.getByPlaceholderText('洗髮-A')).toHaveValue('Lee-02')
    pick(helperB, 'Lee-02')
    // 選定後該欄重新建立（key 含助理 id），重新取欄位
    await wait(() => expect(usage.getByPlaceholderText('洗髮-B')).toHaveValue('Lee-02'))
    const input = await saveDraft(page.calls)
    expect(input.useTicketOrders).toEqual([
      {
        customerTicketId: 'record-1',
        useTicketOrderHelpers: [
          expect.objectContaining({ type: '洗髮-A', helperId: HELPER.userId }),
          expect.objectContaining({ type: '洗髮-B', helperId: HELPER.userId }),
        ],
      },
    ])
  })

  it('沒有使用預收卡：區塊收合，不送出使用預收卡；收合時不顯示筆數', async () => {
    const page = await setupWithUsage([])
    expect(panelHeader('使用預收卡')).toHaveAttribute('aria-expanded', 'false')
    expect(panelHeader('使用預收卡')).not.toHaveTextContent('已填')
    fireEvent.click(panelHeader('使用預收卡'))
    await wait(() => expect(panelHeader('使用預收卡')).toHaveAttribute('aria-expanded', 'true'))
    expect(panel('使用預收卡').queryByText('金額', { selector: 'label' })).toBeNull()
    const input = await saveDraft(page.calls)
    expect(input.useTicketOrders).toEqual([])
  })
})
