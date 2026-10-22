// 保護「重新開單」的會員卡銷售與使用預收卡：
// - 會員卡：選卡帶入售價與到期日（依卡的有效天數）、可改價格、到期日、備註，勾「永久會籍」時不送到期日，取消勾選時依購買日／帳單日重算；
//   到期日超出允許範圍要說明原因；只填一半（缺服務人員、缺會員卡）或到期日無效的列不能送出，要提示缺什麼；刪掉與清掉的列不送出。
// - 使用預收卡：只有選了顧客才出現；選顧客名下的預收卡後依該卡的助理設定顯示助理欄，送出所選的卡與助理；清除時一併清空。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupQueue, loaded, baseQueue, retry, summaryValue, pickOption, inputOf, panel, panelOf, fieldInput, ticketRecordsFixture,
  DESIGNER, ASSISTANT, CARD, CUSTOMER, TICKET_RECORD, DATE,
} from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const cards = () => panel('會員卡銷售')
const cardRow = index => ({
  seller: () => inputOf(cards().getByTestId(`merchantSsell-${index}-employee`)),
  card: () => inputOf(cards().getByTestId(`memberShipCardSells-${index}-product`)),
  price: () => inputOf(cards().getByTestId(`memberShipCardSells-${index}-price`)),
})
const expand = title => fireEvent.click(within(panelOf(title)).getByRole('button', { expanded: false }))
const permanent = () => cards().getByText('永久會籍').closest('label').querySelector('input')
const membershipOrder = (overrides = {}) => ({
  sellerId: DESIGNER.userId,
  membershipUUID: CARD.uuid,
  price: 12000,
  thirdPartyCouponMerchantId: null,
  remark: '',
  purchaseDate: DATE,
  expiryDate: new Date(2027, 9, 21).getTime(),
  ...overrides,
})

describe('重新開單：會員卡銷售', () => {
  it('選服務人員與會員卡：帶入售價與一年後到期；改價格與備註後重試送出', async () => {
    const page = setupQueue()
    await loaded(page)
    expect(panelOf('會員卡銷售')).toHaveAttribute('data-state', 'closed')
    expand('會員卡銷售')
    const row = cardRow(0)
    await pickOption(row.seller(), 'Amy-01')
    await pickOption(row.card(), '年卡 - M01')
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('12,000'))
    fireEvent.change(row.price(), { target: { value: '10000' } })
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('10,000'))
    fireEvent.change(row.price(), { target: { value: '' } })
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent(/^0$/))
    fireEvent.change(row.price(), { target: { value: '10000' } })
    fireEvent.change(fieldInput(cards(), '備註'), { target: { value: '週年慶' } })
    const input = await retry(page.calls)
    expect(input.membershipOrders).toEqual([
      expect.objectContaining({ sellerId: DESIGNER.userId, membershipUUID: CARD.uuid, price: 10000, remark: '週年慶' }),
    ])
    // 到期日＝今天起算有效天數（365 天）
    const expected = addDays(new Date(), CARD.effecitveDay)
    expect(new Date(input.membershipOrders[0].expiryDate).toDateString()).toBe(expected.toDateString())
  })

  it('佇列帶回的永久會籍：到期日欄停用，重試送出不帶到期日', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder({ expiryDate: null })] }) })
    await loaded(page)
    expect(permanent()).toBeChecked()
    expect(cards().getByPlaceholderText('YYYY/MM/DD')).toBeDisabled()
    const input = await retry(page.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: CARD.uuid, expiryDate: null })])
  })

  it('選有效天數為 0 的卡：視為永久會籍，不送到期日', async () => {
    const page = setupQueue({ FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [{ ...CARD, uuid: 'card-0', no: 'M00', name: '終身卡', effecitveDay: 0 }] } } })
    await loaded(page)
    await pickOption(cardRow(0).seller(), 'Amy-01')
    await pickOption(cardRow(0).card(), '終身卡 - M00')
    await wait(() => expect(permanent()).toBeChecked())
    const input = await retry(page.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: 'card-0', expiryDate: null })])
  })

  it('剛選的卡取消「永久會籍」：到期日依帳單日加上有效天數', async () => {
    const page = setupQueue()
    await loaded(page)
    const row = cardRow(0)
    await pickOption(row.seller(), 'Amy-01')
    await pickOption(row.card(), '年卡 - M01')
    fireEvent.click(permanent())
    await wait(() => expect(permanent()).toBeChecked())
    fireEvent.click(permanent())
    await wait(() => expect(permanent()).not.toBeChecked())
    expect(cards().getByPlaceholderText('YYYY/MM/DD')).toHaveValue('2027/10/21')
    const input = await retry(page.calls)
    expect(new Date(input.membershipOrders[0].expiryDate).toDateString()).toBe(addDays(new Date(DATE), 365).toDateString())
  })

  // 佇列帶回的永久會籍沒有有效天數：原本取消勾選後到期日變成無效日期、重試被擋「會員卡到期日有誤」（coverage wave 1，2026/10/22）。
  // 改為依會員卡清單的有效天數，與剛選的卡相同（帳單日＋有效天數）
  it('佇列帶回的永久會籍取消勾選：到期日依會員卡清單的有效天數（帳單日起算）', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder({ expiryDate: null })] }) })
    await loaded(page)
    expect(permanent()).toBeChecked()
    fireEvent.click(permanent())
    await wait(() => expect(permanent()).not.toBeChecked())
    expect(cards().getByPlaceholderText('YYYY/MM/DD')).toHaveValue('2027/10/21')
    const input = await retry(page.calls)
    expect(new Date(input.membershipOrders[0].expiryDate).toDateString()).toBe(addDays(new Date(DATE), 365).toDateString())
  })

  it('佇列帶回的永久會籍、會員卡已不在清單：取消勾選後到期日空白待選，重試提示「會員卡到期日有誤」', async () => {
    const page = setupQueue({
      queue: baseQueue({ membershipOrders: [membershipOrder({ membershipUUID: 'card-gone', expiryDate: null })] }),
    })
    await loaded(page)
    fireEvent.click(permanent())
    await wait(() => expect(permanent()).not.toBeChecked())
    expect(cards().getByPlaceholderText('YYYY/MM/DD')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '會員卡到期日有誤', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('從日期選擇器改到期日後送出新的到期日', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder()] }) })
    await loaded(page)
    fireEvent.click(cards().getByPlaceholderText('YYYY/MM/DD'))
    const dialog = await screen.findByRole('dialog', { name: '選擇日期' })
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2027年10月25日' }))
    fireEvent.click(within(dialog).getByText('確認'))
    await wait(() => expect(cards().getByPlaceholderText('YYYY/MM/DD')).toHaveValue('2027/10/25'))
    const input = await retry(page.calls)
    expect(new Date(input.membershipOrders[0].expiryDate).toDateString()).toBe(new Date(2027, 9, 25).toDateString())
  })

  it('到期日早於帳單隔天或晚於 50 年：欄位下方說明允許範圍', async () => {
    const early = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder({ expiryDate: DATE })] }) })
    await loaded(early)
    expect(cards().getByText('時間不得小於2026/10/22')).toBeInTheDocument()
    cleanup()
    const late = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder({ expiryDate: new Date(2080, 0, 1).getTime() })] }) })
    await loaded(late)
    expect(cards().getByText('時間不得大於2076/10/21')).toBeInTheDocument()
  })

  it('到期日無效：欄位說明「時間有誤」，重試時提示「會員卡到期日有誤」不送出', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder({ expiryDate: 'Invalid Date' })] }) })
    await loaded(page)
    expect(cards().getByText('時間有誤')).toBeInTheDocument()
    // 改備註時無效的到期日仍以「Invalid Date」送進帳單
    fireEvent.change(fieldInput(cards(), '備註'), { target: { value: '補登' } })
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '會員卡到期日有誤', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('只選會員卡沒選服務人員：提示「請選擇會員卡的服務人員」；只選服務人員：提示「請選擇會員卡」', async () => {
    const page = setupQueue()
    await loaded(page)
    await pickOption(cardRow(0).card(), '年卡 - M01')
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇會員卡的服務人員', variant: 'error' }))
    fireEvent.click(cards().getByTestId('merchantSsell-0-clear'))
    await pickOption(cardRow(0).seller(), 'Amy-01')
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇會員卡', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('新增、刪除、清除列：刪掉與清掉的會員卡不送出', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder(), membershipOrder({ price: 5000 })] }) })
    await loaded(page)
    expect(summaryValue('會員卡販賣')).toHaveTextContent('17,000')
    expect(cards().queryByTestId('merchantSsell-0-delete')).toBeNull()
    fireEvent.click(cards().getByTestId('merchantSsell-1-delete'))
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('12,000'))
    fireEvent.click(cards().getByTestId('merchantSsell-0-add'))
    expect(cardRow(1).card()).toHaveValue('')
    fireEvent.click(cards().getByTestId('merchantSsell-1-clear'))
    fireEvent.click(cards().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent(/^0$/))
    // 剩一列時清除：回到空白
    fireEvent.click(cards().getByTestId('merchantSsell-1-delete'))
    fireEvent.click(cards().getByTestId('merchantSsell-0-clear'))
    expect(cardRow(0).card()).toHaveValue('')
    const input = await retry(page.calls)
    expect(input.membershipOrders).toEqual([])
  })

  it('第三方卡券付的會員卡：顯示扣完後業績、不收現金；取消卡券後照常收現金', async () => {
    const page = setupQueue({
      queue: baseQueue({ membershipOrders: [membershipOrder()] }),
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await loaded(page)
    expect(summaryValue('現金應收')).toHaveTextContent('12,800')
    const ticket = fieldInput(cards(), '第三方卡券')
    await pickOption(ticket, '團購券')
    expect(await cards().findByText('扣完後業績:10800')).toBeInTheDocument()
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent(/^800$/))
    expect(summaryValue('業績合計')).toHaveTextContent(/^800$/)
    // 在第三方卡券按 Enter 跳到備註
    fireEvent.focusIn(ticket)
    fireEvent.keyDown(ticket, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(fieldInput(cards(), '備註')))
    fireEvent.focusIn(ticket)
    fireEvent.mouseDown(cards().getByLabelText('清除'))
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('12,800'))
  })

  it('鍵盤 Enter 依序移到下一欄；在備註按 Enter 新增下一列', async () => {
    const page = setupQueue({ queue: baseQueue({ membershipOrders: [membershipOrder()] }) })
    await loaded(page)
    const row = cardRow(0)
    fireEvent.focusIn(row.seller())
    // 其他按鍵不移動焦點
    fireEvent.keyDown(row.seller(), { key: 'a' })
    expect(document.activeElement).not.toBe(row.card())
    fireEvent.keyDown(row.seller(), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(row.card()))
    fireEvent.keyDown(row.card(), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(row.price()))
    fireEvent.keyDown(row.price(), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(cards().getByPlaceholderText('YYYY/MM/DD')))
    fireEvent.keyDown(cards().getByPlaceholderText('YYYY/MM/DD'), { key: 'Enter' })
    const remark = fieldInput(cards(), '備註')
    fireEvent.keyDown(remark, { key: 'a' })
    fireEvent.keyDown(remark, { key: 'Enter' })
    await wait(() => expect(cards().getByTestId('merchantSsell-1-employee')).toBeInTheDocument())
  })
})

const useRow = () => panel('使用預收卡')
const withCustomer = (overrides = {}) =>
  baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false, ...overrides })

describe('重新開單：使用預收卡', () => {
  it('沒有顧客時不顯示「使用預收卡」', async () => {
    const page = setupQueue()
    await loaded(page)
    expect(screen.queryByText('使用預收卡', { selector: 'p' })).toBeNull()
  })

  it('選顧客名下的預收卡：帶入金額與助理欄，選助理並勾指定後重試送出', async () => {
    const page = setupQueue({ queue: withCustomer() })
    await loaded(page)
    expect(panelOf('使用預收卡')).toHaveAttribute('data-state', 'closed')
    expand('使用預收卡')
    await pickOption(fieldInput(useRow(), '預收卡'), '護髮五次卡 剩 4 次')
    await wait(() => expect(fieldInput(useRow(), '金額')).toHaveValue('200'))
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('200'))
    const helper = useRow().getByPlaceholderText('助理-護髮')
    await pickOption(helper, '李助理-02')
    const designate = useRow().getAllByText('指定')[0].closest('label').querySelector('input')
    fireEvent.click(designate)
    const input = await retry(page.calls)
    expect(input.useTicketOrders).toEqual([
      {
        customerTicketId: TICKET_RECORD.id,
        useTicketOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId, isDesignate: true })],
      },
    ])
  })

  // 「金額」只顯示卡券單價：原本可編輯，輸入的文字被寫進「選的預收卡」（customerTicketId），送出時換成一張不存在的卡券。
  // 比照帳單詳細／掛單詳細／打帳單改為唯讀（coverage wave 1，2026/10/22）
  it('金額欄唯讀：在金額欄輸入不會換掉選的預收卡', async () => {
    const page = setupQueue({ queue: withCustomer() })
    await loaded(page)
    expand('使用預收卡')
    await pickOption(fieldInput(useRow(), '預收卡'), '護髮五次卡 剩 4 次')
    const amount = fieldInput(useRow(), '金額')
    await wait(() => expect(amount).toHaveValue('200'))
    expect(amount).toBeDisabled()
    fireEvent.change(amount, { target: { value: '50' } })
    const input = await retry(page.calls)
    expect(input.useTicketOrders).toEqual([expect.objectContaining({ customerTicketId: TICKET_RECORD.id })])
  })

  it('依預收卡服務的助理設定顯示助理欄：沒有設定時不顯示，兩種設定各一欄', async () => {
    const recordWith = helperDeductionSetting => ({ ...TICKET_RECORD, service: { ...TICKET_RECORD.service, helperDeductionSetting } })
    const page = setupQueue({ queue: withCustomer(), GetTicket: ticketRecordsFixture([recordWith([])]) })
    await loaded(page)
    await pickOption(fieldInput(useRow(), '預收卡'), '護髮五次卡 剩 4 次')
    await wait(() => expect(fieldInput(useRow(), '金額')).toHaveValue('200'))
    expect(useRow().queryByText('指定')).toBeNull()
    cleanup()
    const two = setupQueue({
      queue: withCustomer(),
      GetTicket: ticketRecordsFixture([
        recordWith([
          { type: '助理', nameList: ['洗髮'], helperDeductionType: 'FIXED' },
          { type: '設計師', nameList: ['剪髮'], helperDeductionType: 'FIXED' },
        ]),
      ]),
    })
    await loaded(two)
    await pickOption(fieldInput(useRow(), '預收卡'), '護髮五次卡 剩 4 次')
    expect(await useRow().findByPlaceholderText('助理-洗髮')).toBeInTheDocument()
    expect(useRow().getByPlaceholderText('設計師-剪髮')).toBeInTheDocument()
  })

  it('單價有很多位小數時金額顯示到小數第一位；趨近 0 時顯示 0', async () => {
    const recordWith = price => ({ ...TICKET_RECORD, service: { ...TICKET_RECORD.service, price } })
    const page = setupQueue({
      queue: withCustomer({ useTicketOrders: [{ customerTicketId: TICKET_RECORD.id, price: 0, useTicketOrderHelpers: [] }] }),
      GetTicket: ticketRecordsFixture([recordWith(33.333333)]),
    })
    await loaded(page)
    await wait(() => expect(fieldInput(useRow(), '金額')).toHaveValue('33.3'))
    cleanup()
    const tiny = setupQueue({
      queue: withCustomer({ useTicketOrders: [{ customerTicketId: TICKET_RECORD.id, price: 0, useTicketOrderHelpers: [] }] }),
      GetTicket: ticketRecordsFixture([recordWith(0.0400001)]),
    })
    await loaded(tiny)
    await wait(() => expect(fieldInput(useRow(), '金額')).toHaveValue('0'))
  })
})
