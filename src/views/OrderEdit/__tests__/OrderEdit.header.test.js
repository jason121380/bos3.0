// 保護「帳單詳細」頁首（Header）與快捷組合：
// - 抽獎流水號：帳單有抽獎紀錄時顯示按鈕，點開列出流水號與規則名稱，再點收起；沒有紀錄時不顯示
// - 帳單速查：點按鈕開啟帳單速查視窗
// - 流水號：店家啟用時可改，送出改過的流水號；清空時送 null；未啟用時不顯示
// - 組合商品（快捷組合）：店家啟用且各品項清單載入後才能按；選一個組合，組合內的服務、店販、預收卡、會員卡加進帳單
//   （原本只有空白列的區塊直接取代空白列、已有項目的區塊加在後面），並展開對應區塊；查無組合時顯示「無資料」；可關閉
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import {
  setup, pageReady, makeOrder, checkoutAndGetInput, summaryValue, loginForTest, pickEmployee,
  DESIGNER, ASSISTANT, SERVICE, LOCKED_SERVICE, PRODUCT, TICKET, MEMBERSHIP,
  findDialog, queryDialog,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

describe('帳單詳細：抽獎流水號與帳單速查', () => {
  it('有抽獎紀錄：點按鈕列出流水號與規則，再點收起', async () => {
    const page = setup({ order: makeOrder({ raffleRecord: [{ number: 'R-0001', ruleName: '滿千抽' }, { number: 'R-0002', ruleName: '週年慶' }] }) })
    await pageReady(page)
    const raffle = screen.getByLabelText('抽獎流水號', { selector: 'button' })
    expect(raffle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(raffle)
    expect(raffle).toHaveAttribute('aria-expanded', 'true')
    const table = (await screen.findByText('R-0001')).closest('table')
    expect(within(table).getByText('滿千抽')).toBeInTheDocument()
    expect(within(table).getByText('R-0002')).toBeInTheDocument()
    fireEvent.click(raffle)
    expect(raffle).toHaveAttribute('aria-expanded', 'false')
  })

  it('沒有抽獎紀錄：不顯示抽獎流水號按鈕', async () => {
    const page = setup()
    await pageReady(page)
    expect(screen.queryByLabelText('抽獎流水號', { selector: 'button' })).toBeNull()
  })

  it('點「帳單速查」開啟帳單速查視窗', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.click(screen.getByText('帳單速查', { selector: 'button' }))
    expect(await screen.findByText('帳單速查', { selector: 'h2, h2 *' })).toBeInTheDocument()
  })
})

describe('帳單詳細：流水號', () => {
  const serialOn = { GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: true } } }

  it('店家啟用流水號：帶回原流水號，改過後送出新流水號', async () => {
    const page = setup({ ...serialOn, order: makeOrder({ serialNumber: '0007' }) })
    await pageReady(page)
    const serial = screen.getByPlaceholderText('流水號')
    await wait(() => expect(serial).toHaveValue('0007'))
    fireEvent.change(serial, { target: { value: '0012' } })
    expect((await checkoutAndGetInput(page.calls)).serialNumber).toBe('0012')
  })

  it('清空流水號：送出 null', async () => {
    const page = setup({ ...serialOn, order: makeOrder({ serialNumber: '0007' }) })
    await pageReady(page)
    fireEvent.change(screen.getByPlaceholderText('流水號'), { target: { value: '' } })
    expect((await checkoutAndGetInput(page.calls)).serialNumber).toBeNull()
  })

  it('店家未啟用流水號：不顯示流水號欄位', async () => {
    const page = setup()
    await pageReady(page)
    expect(screen.queryByPlaceholderText('流水號')).toBeNull()
  })
})

describe('帳單詳細：組合商品（快捷組合）', () => {
  const comboOn = { GET_IS_COMBO_SETTING: { getParameterAboutSettingFunction: { isComboUsing: true } } }
  // 組合：一個服務、一個商品、一張預收卡、一張會員卡，另含一個已下架（清單裡找不到）的服務
  const SHORTCUT = {
    id: 'shortcut-1',
    name: '新客套餐',
    services: [{ id: LOCKED_SERVICE.id }, { id: 'service-retired' }],
    products: [{ id: PRODUCT.id }],
    tickets: [{ id: TICKET.id }],
    memberships: [{ uuid: MEMBERSHIP.uuid }],
  }
  const comboFixtures = (overrides = {}) => ({
    ...comboOn,
    GET_SHORTCUTS_FOR_ORDERCREATE: { shortcuts: [SHORTCUT, { id: 'shortcut-2', name: '只有服務', services: [{ id: SERVICE.id }], products: [], tickets: [], memberships: [] }] },
    ...overrides,
  })
  const comboButton = () => screen.getByText('組合商品', { selector: 'button' })
  const openCombo = async () => {
    await wait(() => expect(comboButton()).not.toBeDisabled())
    fireEvent.click(comboButton())
    return within(await findDialog())
  }

  it('店家未啟用：不顯示組合商品', async () => {
    const page = setup()
    await pageReady(page)
    expect(screen.queryByText('組合商品', { selector: 'button' })).toBeNull()
  })

  it('選組合：服務加在原服務後面，店販、預收卡、會員卡取代空白列；對應區塊展開；補上服務人員後送出組合內的項目', async () => {
    const page = setup(comboFixtures())
    await pageReady(page)
    expect(screen.getByTestId('couponSells')).toHaveAttribute('aria-expanded', 'false')
    const dialog = await openCombo()
    fireEvent.click(await dialog.findByText('新客套餐', { selector: 'button' }))
    await wait(() => expect(queryDialog()).toBeNull())
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000'))
    expect(summaryValue('服務消費')).toHaveTextContent('2,300')
    expect(summaryValue('店販消費')).toHaveTextContent('1,200')
    expect(summaryValue('會員卡販賣')).toHaveTextContent('3,000')
    expect(screen.getByTestId('couponSells')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(2)
    expect(screen.getAllByPlaceholderText('商品代號/名稱')).toHaveLength(1)
    expect(screen.getAllByPlaceholderText('卡券名稱/代號')).toHaveLength(1)
    // 組合不含店販與會員卡的服務人員，補上後送出
    const sellers = screen.getAllByPlaceholderText('服務人員姓名/編號')
    await pickEmployee(sellers[1], DESIGNER.userName)
    await pickEmployee(sellers[2], DESIGNER.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders.map(d => d.serviceId)).toEqual([SERVICE.id, LOCKED_SERVICE.id])
    expect(input.serviceOrders[1]).toEqual(expect.objectContaining({ price: 1500, thirdPartyCouponMerchantId: 'tp-1' }))
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, price: 1200, count: 1 })])
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, price: 6000, availableCount: 10, count: 1 })])
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP.uuid, price: 3000, expiryDate: expect.any(Number) })])
  })

  it('再套一次只含服務的組合：服務加在後面，其他區塊不變', async () => {
    const page = setup(comboFixtures())
    await pageReady(page)
    let dialog = await openCombo()
    fireEvent.click(await dialog.findByText('新客套餐', { selector: 'button' }))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000'))
    dialog = await openCombo()
    fireEvent.click(await dialog.findByText('只有服務', { selector: 'button' }))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('3,100'))
    expect(summaryValue('預收卡販賣')).toHaveTextContent('6,000')
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(3)
  })

  it('原服務有助理時套組合：原服務的助理照送', async () => {
    const withHelper = makeOrder({
      serviceOrders: [
        {
          ...makeOrder().serviceOrders[0],
          helperList: [{ id: 'h-1', type: '助理-洗髮', isDesignate: false, helperDeductionType: 'CASH', helper: { id: ASSISTANT.userId } }],
        },
      ],
    })
    const page = setup(
      comboFixtures({
        order: withHelper,
        service: v => ({ service: { helperDeductionSetting: v.serviceId === SERVICE.id ? [{ type: '助理', nameList: ['洗髮'], helperDeductionType: 'CASH' }] : [] } }),
      })
    )
    await pageReady(page)
    await wait(() => expect(screen.getByPlaceholderText('助理-洗髮')).toHaveValue('李助理-02'))
    const dialog = await openCombo()
    fireEvent.click(await dialog.findByText('只有服務', { selector: 'button' }))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('1,600'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId })] }),
      expect.objectContaining({ serviceId: SERVICE.id, serviceOrderHelpers: [] }),
    ])
  })

  it('沒有服務的帳單套組合：組合的服務取代空白列；永久會員卡不帶到期日', async () => {
    const LIFETIME = { ...MEMBERSHIP, uuid: 'membership-2', no: 'M02', name: '終身卡', effecitveDay: 0 }
    const page = setup(
      comboFixtures({
        order: makeOrder({ serviceOrders: [] }),
        FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP, LIFETIME] } },
        GET_SHORTCUTS_FOR_ORDERCREATE: {
          shortcuts: [{ id: 'shortcut-3', name: '終身方案', services: [{ id: SERVICE.id }], products: [], tickets: [], memberships: [{ uuid: LIFETIME.uuid }] }],
        },
      })
    )
    await pageReady(page)
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(1)
    const dialog = await openCombo()
    fireEvent.click(await dialog.findByText('終身方案', { selector: 'button' }))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('800'))
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(1)
    expect(screen.getByLabelText('永久會籍')).toBeChecked()
    await pickEmployee(screen.getAllByPlaceholderText('服務人員姓名/編號')[2], DESIGNER.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, thirdPartyCouponMerchantId: null })])
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: LIFETIME.uuid, expiryDate: null })])
  })

  it('查無組合：顯示「無資料」；按關閉收起視窗', async () => {
    const page = setup(comboFixtures({ GET_SHORTCUTS_FOR_ORDERCREATE: { shortcuts: [] } }))
    await pageReady(page)
    const dialog = await openCombo()
    expect(await dialog.findByText('無資料')).toBeInTheDocument()
    fireEvent.click(dialog.getByRole('button', { name: '關閉' }))
    await wait(() => expect(queryDialog()).toBeNull())
  })
})
