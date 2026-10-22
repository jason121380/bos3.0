// 保護「帳單詳細」的項目消費（服務列，PannelService／Services）：既有帳單的服務、助理、第三方卡券要原樣帶回，
// 櫃檯改動後重新結帳送出的就是改過的內容：
// - 助理欄位依服務的助理抽成設定展開（同一種助理多個名額各一欄），帶回原本的助理與「指定」（依名額類型對應，
//   不依位置）；改助理、勾「指定」後送出
// - 第三方卡券：顯示扣完後業績（百分比或固定金額）；選卡券／清掉卡券後送出；綁定卡券鎖定的服務不能改卡券
// - 改價格（非數字視為 0）、清除此列、刪除此列、新增項目、在服務欄重新打字（該列先清空）、從清單選擇服務
// - 收合時標題列顯示已填筆數與金額
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { callsOf } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, checkoutAndGetInput, summaryValue, loginForTest, pickEmployee,
  SERVICE, LOCKED_SERVICE, ASSISTANT, DESIGNER,
  findDialog, queryDialog,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

// 精緻剪髮有「助理」抽成，兩個名額（洗髮、吹整）；其他服務沒有助理
const HELPER_SETTING = [{ type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'CASH' }]
const serviceDetail = v => ({ service: { helperDeductionSetting: v.serviceId === SERVICE.id ? HELPER_SETTING : [] } })

const serviceOrderOf = (service, extra = {}) => ({
  id: `so-${service.id}`,
  name: service.name,
  price: service.price,
  thirdPartyPayName: null,
  thirdPartyPayId: null,
  service: {
    id: service.id,
    name: service.name,
    no: service.no,
    isLocked: service.isLocked,
    isNoCash: service.isNoCash,
    isBindedThirdPartTicketLocked: service.isBindedThirdPartTicketLocked,
  },
  helperList: [],
  ...extra,
})
const WASH_HELPER = {
  id: 'h-1',
  type: '助理-洗髮',
  isDesignate: false,
  helperDeductionType: 'CASH',
  helper: { id: ASSISTANT.userId, designerNo: '02', lastName: '李', firstName: '助理' },
}
// 第 1 列：精緻剪髮（洗髮助理已填）；第 2 列：鎖價、綁定團購券且鎖定卡券的頭皮護理
const twoServices = () =>
  makeOrder({
    serviceOrders: [
      serviceOrderOf(SERVICE, { helperList: [WASH_HELPER] }),
      serviceOrderOf(LOCKED_SERVICE, { thirdPartyPayId: 'tp-1', thirdPartyPayName: '團購券' }),
    ],
  })

const servicesFixtures = (overrides = {}) => ({
  order: twoServices(),
  service: serviceDetail,
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
  FETCH_SERVICES: { services: { totalCount: 60, pageOffset: 0, pageLimit: 50, data: [SERVICE, LOCKED_SERVICE] } },
  ServiceCategories: { serviceCategories: [{ id: 'sc-1', name: '剪髮' }] },
  ...overrides,
})

const panel = () => document.getElementById('panel-content')
const serviceInputs = () => within(panel()).getAllByPlaceholderText('服務名稱/代號')
const priceInputs = () => panel().querySelectorAll('input[name="price"]')
const thirdPartyInputs = () => within(panel()).queryAllByPlaceholderText('第三方卡券')
const helpersReady = () => wait(() => expect(within(panel()).getByPlaceholderText('助理-吹整')).toBeInTheDocument())

describe('帳單詳細：服務列帶回原帳單', () => {
  it('助理依服務設定展開並帶回原本的助理；第三方卡券顯示扣完後業績；鎖價服務的價格不能改', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    await helpersReady()
    expect(within(panel()).getByPlaceholderText('助理-洗髮')).toHaveValue('李助理-02')
    expect(within(panel()).getByPlaceholderText('助理-吹整')).toHaveValue('')
    expect(priceInputs()[0]).not.toBeDisabled()
    expect(priceInputs()[1]).toBeDisabled()
    // 團購券 10%：1500 扣完 1350；綁定且鎖定的卡券不能改
    expect(within(panel()).getByText('扣完後業績:1350')).toBeInTheDocument()
    expect(thirdPartyInputs()[1]).toBeDisabled()
    expect(thirdPartyInputs()[1]).toHaveValue('團購券')
  })

  it('固定金額的第三方卡券：扣完後業績＝價格減手續費', async () => {
    const order = makeOrder({ serviceOrders: [serviceOrderOf(SERVICE, { thirdPartyPayId: 'tp-2' })] })
    const page = setup(servicesFixtures({ order }))
    await pageReady(page)
    expect(await within(panel()).findByText('扣完後業績:700')).toBeInTheDocument()
  })

  it('原帳單只填第二個名額且勾「指定」：指定照樣帶回；改第一個名額的助理後重新結帳，第二位仍是指定', async () => {
    const order = makeOrder({
      serviceOrders: [serviceOrderOf(SERVICE, { helperList: [{ ...WASH_HELPER, id: 'h-2', type: '助理-吹整', isDesignate: true }] })],
    })
    const page = setup(servicesFixtures({ order }))
    await pageReady(page)
    await helpersReady()
    expect(within(panel()).getByPlaceholderText('助理-吹整')).toHaveValue('李助理-02')
    const designate = within(panel()).getAllByLabelText('指定')
    expect(designate[0]).not.toBeChecked()
    expect(designate[1]).toBeChecked()
    await pickEmployee(within(panel()).getByPlaceholderText('助理-洗髮'), DESIGNER.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders[0].serviceOrderHelpers).toEqual([
      expect.objectContaining({ type: '助理-洗髮', helperId: DESIGNER.userId, isDesignate: false }),
      expect.objectContaining({ type: '助理-吹整', helperId: ASSISTANT.userId, isDesignate: true }),
    ])
  })

  it('原帳單助理的類型與目前設定不同：該名額空白（不誤帶到別的名額）', async () => {
    const order = makeOrder({
      serviceOrders: [serviceOrderOf(SERVICE, { helperList: [{ ...WASH_HELPER, type: '助理-染髮' }] })],
    })
    const page = setup(servicesFixtures({ order }))
    await pageReady(page)
    await helpersReady()
    expect(within(panel()).getByPlaceholderText('助理-洗髮')).toHaveValue('')
  })

  it('店家關閉第三方卡券顯示：沒有綁卡券的服務不顯示卡券欄；綁定且鎖定卡券的服務仍顯示（唯讀）', async () => {
    const page = setup(servicesFixtures({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false } }))
    await pageReady(page)
    await wait(() => expect(thirdPartyInputs()).toHaveLength(1))
    expect(thirdPartyInputs()[0]).toBeDisabled()
  })

  // 帳單服務先到、店家設定後到（設定沒有快取時）
  it('卡券鎖定方式「依店家設定」、店家設定比帳單晚到：設定到了卡券欄照樣鎖定', async () => {
    const unset = { ...SERVICE, id: 'service-3', no: 'S03', name: '造型', isBindedThirdPartTicketLocked: 'UNSET' }
    const order = makeOrder({ serviceOrders: [serviceOrderOf(unset, { thirdPartyPayId: 'tp-1' })] })
    const page = setup(
      servicesFixtures({
        order,
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: { getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false } },
      }),
      { delays: { GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: 300 } }
    )
    await pageReady(page)
    await wait(() => expect(thirdPartyInputs()[0]).toBeDisabled())
  })

  // 店家設定先到、帳單服務後到（設定類查詢已快取時的正式環境順序）
  it('卡券鎖定方式「依店家設定」：店家設定服務的綁定卡券要鎖定時，卡券欄不能改', async () => {
    const unset = { ...SERVICE, id: 'service-3', no: 'S03', name: '造型', isBindedThirdPartTicketLocked: 'UNSET' }
    const order = makeOrder({ serviceOrders: [serviceOrderOf(unset, { thirdPartyPayId: 'tp-1' })] })
    const page = setup(
      servicesFixtures({
        order,
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: { getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false } },
      }),
      { delays: { FETRCH_SERVICE_ORDER: 30 } }
    )
    await pageReady(page)
    await wait(() => expect(thirdPartyInputs()[0]).toBeDisabled())
  })
})

describe('帳單詳細：改服務列後重新結帳', () => {
  it('填第二位助理、勾「指定」：送出兩位助理與指定', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    await helpersReady()
    await pickEmployee(within(panel()).getByPlaceholderText('助理-吹整'), DESIGNER.userName)
    const designate = within(panel()).getAllByLabelText('指定')
    fireEvent.click(designate[1])
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders[0].serviceOrderHelpers).toEqual([
      expect.objectContaining({ type: '助理-洗髮', helperId: ASSISTANT.userId, isDesignate: false }),
      expect.objectContaining({ type: '助理-吹整', helperId: DESIGNER.userId, isDesignate: true }),
    ])
  })

  it('改價格：送出新價格；輸入非數字視為 0', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    fireEvent.change(priceInputs()[0], { target: { value: '650' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,150'))
    fireEvent.change(priceInputs()[0], { target: { value: 'abc' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('1,500'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders[0]).toEqual(expect.objectContaining({ serviceId: SERVICE.id, price: 0 }))
  })

  it('清除第 1 列：該列的服務與助理清空，不送出；第 2 列照送', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    await helpersReady()
    fireEvent.click(screen.getByTestId('service-0-clear'))
    await wait(() => expect(serviceInputs()[0]).toHaveValue(''))
    expect(within(panel()).queryByPlaceholderText('助理-洗髮')).toBeNull()
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: LOCKED_SERVICE.id })])
  })

  it('清除第 2 列：第 1 列的服務與助理照送', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    await helpersReady()
    fireEvent.click(screen.getByTestId('service-1-clear'))
    await wait(() => expect(serviceInputs()[1]).toHaveValue(''))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId })] }),
    ])
  })

  it('第 2 列改選沒有綁卡券的服務：該列卡券清空，第 1 列的助理照送', async () => {
    const page = setup(servicesFixtures({ order: makeOrder({ serviceOrders: [serviceOrderOf(SERVICE, { helperList: [WASH_HELPER] }), serviceOrderOf(LOCKED_SERVICE)] }) }))
    await pageReady(page)
    await helpersReady()
    fireEvent.change(serviceInputs()[1], { target: { value: '剪' } })
    fireEvent.click(await within(document.body).findByTestId('S01'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('1,600'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId })] }),
      expect.objectContaining({ serviceId: SERVICE.id, price: 800, thirdPartyCouponMerchantId: null }),
    ])
  })

  it('刪除第 2 列：只送出第 1 列', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(serviceInputs()).toHaveLength(1))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id })])
  })

  it('新增項目：新的一列游標在服務欄；選了綁定卡券的服務，送出帶該卡券', async () => {
    const page = setup(servicesFixtures({ order: makeOrder() }))
    await pageReady(page)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    await wait(() => expect(document.activeElement).toBe(serviceInputs()[1]))
    fireEvent.change(serviceInputs()[1], { target: { value: '頭皮' } })
    fireEvent.click(await within(document.body).findByTestId('S02'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,300'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id }),
      expect.objectContaining({ serviceId: LOCKED_SERVICE.id, price: 1500, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
  })

  it('在服務欄重新打字：該列先清空（服務、價格、助理），選定新服務前不送出這列', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    await helpersReady()
    fireEvent.change(serviceInputs()[0], { target: { value: '頭' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('1,500'))
    expect(within(panel()).queryByPlaceholderText('助理-洗髮')).toBeNull()
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: LOCKED_SERVICE.id })])
  })

  it('選第三方卡券後送出該卡券；清掉卡券後送出 null', async () => {
    const order = makeOrder({ serviceOrders: [serviceOrderOf(SERVICE)] })
    const page = setup(servicesFixtures({ order }))
    await pageReady(page)
    const tp = thirdPartyInputs()[0]
    fireEvent.click(tp)
    fireEvent.click(await within(document.body).findByTestId('禮券'))
    expect(await within(panel()).findByText('扣完後業績:700')).toBeInTheDocument()
    // 第三方卡券不計入現金應收
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent(/^0$/))
    tp.focus()
    fireEvent.mouseDown(await within(panel()).findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('800'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })

  it('收合「項目消費」：標題列顯示已填筆數與金額；再按一次展開', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    const header = screen.getByTestId('panelService')
    fireEvent.click(header)
    await wait(() => expect(header).toHaveTextContent('已填 2 筆 · 2,300'))
    expect(panel()).not.toBeVisible()
    fireEvent.click(header)
    expect(panel()).toBeVisible()
  })
})

describe('帳單詳細：從清單選擇服務', () => {
  it('選分類、翻頁、加入：服務加到最後一列並帶出該服務的助理欄位，彈窗自動關閉', async () => {
    const page = setup(servicesFixtures({ order: makeOrder({ serviceOrders: [serviceOrderOf(LOCKED_SERVICE)] }) }))
    await pageReady(page)
    fireEvent.click(within(panel()).getByLabelText('從清單選擇服務', { selector: 'button' }))
    const dialog = within(await findDialog())
    fireEvent.click(dialog.getByRole('button', { name: '剪髮' }))
    await wait(() =>
      expect(callsOf(page.calls, 'FETCH_SERVICES').some(c => (c.variables.input.categoryIds || []).includes('sc-1'))).toBe(true)
    )
    fireEvent.click(dialog.getByRole('button', { name: '下一頁' }))
    await wait(() => expect(callsOf(page.calls, 'FETCH_SERVICES').some(c => c.variables.input.pageOffset === 1)).toBe(true))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[0])
    await wait(() => expect(queryDialog()).toBeNull())
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    await wait(() => expect(within(panel()).getByPlaceholderText('助理-吹整')).toBeInTheDocument())
    const input = await checkoutAndGetInput(page.calls)
    expect(input.serviceOrders.map(d => d.serviceId)).toEqual([LOCKED_SERVICE.id, SERVICE.id])
  })

  it('按關閉：不加服務，下次開啟回到全部分類、第一頁', async () => {
    const page = setup(servicesFixtures())
    await pageReady(page)
    fireEvent.click(within(panel()).getByLabelText('從清單選擇服務', { selector: 'button' }))
    const dialog = within(await findDialog())
    fireEvent.click(dialog.getByRole('button', { name: '剪髮' }))
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(queryDialog()).toBeNull())
    expect(serviceInputs()).toHaveLength(2)
    fireEvent.click(within(panel()).getByLabelText('從清單選擇服務', { selector: 'button' }))
    expect(await screen.findByText('所有服務')).toBeInTheDocument()
  })

  it('服務清單還在載入時按「從清單選擇」：不開啟彈窗', async () => {
    setup(servicesFixtures(), { delays: { FETCH_SERVICES: 2000 } })
    await screen.findByText(/帳單詳細 \(A123\)/)
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    fireEvent.click(within(panel()).getByLabelText('從清單選擇服務', { selector: 'button' }))
    expect(queryDialog()).toBeNull()
  })
})
