// 保護「掛單詳細」：掛單（暫存帳單）帶回原內容、「儲存」仍是掛單（isPending: true）、「結帳」才正式成立（isPending: false），
// 店家關閉掛單功能時要導回打帳單。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不改真實帳單。
// 「編輯顧客資料」改姓名／生日後儲存，送出的要是新姓名與新生日（以 typeLikeBrowser 照瀏覽器方式輸入；fireEvent.change 會誤判成送出舊姓名）。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import DraftOrderEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
const SERVICE = {
  id: 'service-1',
  no: 'S01',
  name: '精緻剪髮',
  price: 800,
  isLocked: false,
  isNoCash: false,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: false,
}

const makeOrder = (overrides = {}) => ({
  id: 'order-1',
  no: 'A123',
  date: new Date(2026, 9, 21, 10, 30).getTime(),
  payType: [],
  walletPay: 0,
  isReserved: false,
  isDesignate: true,
  isCloseAccount: false,
  amountByOtherPay: 0,
  status: '待付款',
  remark: '老客人',
  customer: { id: 'no-customer', no: '', name: '不留客資', cellphone: '' },
  designer: { id: DESIGNER.userId, name: DESIGNER.userName, designerNo: '01' },
  serviceOrders: [
    {
      id: 'so-1',
      name: SERVICE.name,
      price: 800,
      thirdPartyPayName: null,
      thirdPartyPayId: null,
      service: { id: SERVICE.id, name: SERVICE.name, no: SERVICE.no, isLocked: false, isNoCash: false, isBindedThirdPartTicketLocked: false },
      helperList: [],
    },
  ],
  productOrders: [],
  ticketOrders: [],
  membershipOrders: [],
  useTicketOrders: [],
  staticDetail: [],
  isServiceEditable: true,
  isProductEditable: true,
  isTicketSellingEditable: true,
  isTicketUsageEditable: true,
  bonusDecount: 0,
  bonusDeposit: 0,
  bonusUsed: 0,
  source: null,
  serialNumber: null,
  raffleRecord: [],
  ...overrides,
})

const fixtures = ({ order = makeOrder(), password = false, ...overrides } = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: {
      bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } },
    },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  GET_IS_COMBO_SETTING: { getParameterAboutSettingFunction: { isComboUsing: false } },
  // 帳單本身：頁面與各區塊分別查詢同一張帳單的不同欄位，回同一份資料
  FETCH_ORDER: { order },
  FETRCH_SERVICE_ORDER: { order },
  FETCH_PRODUCT_ORDER: { order },
  FETCH_MEMBERSHIP_ORDER: { order },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  service: { service: { helperDeductionSetting: [] } },
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: password } } },
  reCheckoutOrder: { reCheckoutOrder: { id: 'order-1' } },
  UpdateOrder: { updateOrder: { id: 'order-1' } },
  // 有顧客時：入金、紅利與入金異動權限
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authoritySettings: JSON.stringify([
          {
            pageTitle: '客戶管理',
            pageAuthority: [
              { pageName: '入金(儲值)', authority: false },
              { pageName: '入金(扣除)', authority: false },
            ],
          },
        ]),
      },
    ],
  },
  ...overrides,
})

const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }

const draftFixtures = ({ disablePendingOrder = false, FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL = { customer: null }, ...options } = {}) => ({
  ...fixtures(options),
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder } },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  // 列印用明細
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL,
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: [SERVICE] } },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'NAME' },
})

const setup = (options = {}) =>
  renderPage(<DraftOrderEdit match={{ params: { id: 'order-1' } }} />, {
    fixtures: draftFixtures(options),
    route: '/draft-order/order-1',
  })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('掛單詳細：載入', () => {
  it('標題顯示掛單編號，服務人員與服務照原掛單帶入，業績合計正確', async () => {
    setup()
    expect(await screen.findByText(/掛單詳細 \(A123\)/)).toBeInTheDocument()
    await wait(() => expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('Amy-01'))
    await wait(() => expect(screen.getByPlaceholderText('服務名稱/代號')).toHaveValue('精緻剪髮(S01)'))
    await wait(() => expect(screen.getAllByText('業績合計')[0].nextSibling).toHaveTextContent('800'))
  })

  it('店家關閉掛單功能：提示並導回打帳單', async () => {
    setup({ disablePendingOrder: true })
    await wait(() => expect(currentLocation()).toBe('/order/create'))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning', message: '掛單功能已關閉' }))
  })
})

describe('掛單詳細：儲存與結帳', () => {
  it('儲存：仍為掛單（isPending: true），成功後回掛單列表', async () => {
    const { calls } = setup()
    const save = await screen.findByTestId('savedraft')
    await wait(() => expect(save).not.toBeDisabled())
    fireEvent.click(save)
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'reCheckoutOrder')[0].variables
    expect(input.updateOrderId).toBe('order-1')
    expect(input.orderInput.isPending).toBe(true)
    expect(input.orderInput.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '掛單儲存成功' }))
  })

  it('結帳：正式成立帳單（isPending: false），成功後到帳單列表', async () => {
    const { calls } = setup()
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'reCheckoutOrder')[0].variables
    expect(input.orderInput.isPending).toBe(false)
    expect(input.orderInput.designerId).toBe(DESIGNER.userId)
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '掛單結帳成功' }))
  })

  it('需要重新結帳密碼時先跳密碼視窗，以輸入的密碼送出', async () => {
    const { calls } = setup({ password: true })
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    const pwd = await screen.findByLabelText('密碼')
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(0)
    fireEvent.change(pwd, { target: { value: '9999' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    expect(callsOf(calls, 'reCheckoutOrder')[0].variables.input.password).toBe('9999')
  })

  it('結帳失敗：提示錯誤、留在本頁且可以再按', async () => {
    const { calls } = setup({ reCheckoutOrder: new Error('庫存不足') })
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('庫存不足') }))
    )
    expect(currentLocation()).toBe('/draft-order/order-1')
    await wait(() => expect(checkout).not.toBeDisabled())
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
  })
})

// 編輯顧客資料：改姓名、生日後按「儲存」，送出的 SET_CUSTOMER 要帶新姓名與新生日。
// 曾以 fireEvent.change 觀察到「送出舊姓名」，查證為測試工具的假象（見 testkit 的 typeLikeBrowser），真實瀏覽器正常；
// 這個測試以與瀏覽器相同的方式輸入，保護姓名確實會送出。
const CUSTOMER_DETAIL = {
  ...CUSTOMER,
  gender: 'FEMALE',
  birthday: { year: '80', month: '1', day: '2' },
  remark: '',
  source: '',
  preferDesigner: null,
  membershipPurchaseRecord: [],
  isLineBinded: false,
}
const editCustomerAndSave = async calls => {
  // 顧客資料載入後（顧客欄顯示姓名）才開彈窗，彈窗才會帶入這位顧客
  await wait(() => expect(screen.getByPlaceholderText('顧客姓名/手機號碼/編號').value).toContain('陳小姐'))
  fireEvent.click(await screen.findByRole('button', { name: '編輯顧客資料' }))
  const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
  const nameInput = within(modal).getByText('客戶姓名').parentElement.querySelector('input[name="name"]')
  await wait(() => expect(nameInput).toHaveValue('陳小姐'))
  typeLikeBrowser(nameInput, '陳美美')
  expect(nameInput).toHaveValue('陳美美')
  typeLikeBrowser(modal.querySelector('input[name="year"]'), '81')
  fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
  await wait(() => expect(callsOf(calls, 'SET_CUSTOMER')).toHaveLength(1))
  return callsOf(calls, 'SET_CUSTOMER')[0].variables.input
}

describe('掛單詳細：編輯顧客資料', () => {
  it('改姓名與生日後儲存，送出新姓名與新生日', async () => {
    const { calls } = setup({
      order: makeOrder({ customer: CUSTOMER }),
      FETCH_CUSTOMER_DETAIL: { customer: CUSTOMER_DETAIL },
      // 列印明細也查同一位顧客（同一個快取欄位），要回同一位，不能回 null
      FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: { customer: CUSTOMER_DETAIL },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await screen.findByText(/掛單詳細 \(A123\)/)
    const input = await editCustomerAndSave(calls)
    expect(input).toEqual(
      expect.objectContaining({ customerId: CUSTOMER.id, name: '陳美美', birthday: { year: '81', month: '1', day: '2' } })
    )
  })
})

// 已修正（Jason 2026/10/22 fix all）：手機底部固定列原本一律讓出 56px 給底部導覽列，但掛單詳細的路由不顯示底部導覽列
// （layouts/Dashboard/MobileNav 的 FLOW），列下方露出頁面內容；改為貼齊畫面底部（只讓出 iPhone 安全區）
describe('掛單詳細：底部固定列貼齊畫面底部', () => {
  it('沒有底部導覽列：固定列不讓出 56px', async () => {
    setup()
    await screen.findByText(/掛單詳細 \(/)
    const bar = screen.getByRole('button', { name: '金額彙總明細' }).closest('.fixed')
    expect(bar.className).not.toMatch(/56px/)
    expect(bar.className).toMatch(/(^| )bottom-0( |$)/)
  })
})
