// 保護「帳單詳細／重新結帳」：既有帳單的內容要原樣帶回畫面（服務人員、服務、金額），重新結帳／儲存送出的內容要與原帳單一致，
// 店家開啟重新結帳密碼時必須輸入密碼才送出。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不改真實帳單。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import OrderEdit from '..'

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
  status: '已完成',
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
const button = name => screen.getByText(name, { selector: 'button' })

const setup = (options = {}, route = '/order/order-1') =>
  renderPage(<OrderEdit match={{ params: { id: 'order-1' } }} />, { fixtures: fixtures(options), route })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('帳單詳細：載入既有帳單', () => {
  it('標題顯示帳單編號，服務人員、服務項目與金額照原帳單帶入', async () => {
    setup()
    expect(await screen.findByText(/帳單詳細 \(A123\)/)).toBeInTheDocument()
    await wait(() => expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('Amy-01'))
    await wait(() => expect(screen.getByPlaceholderText('服務名稱/代號')).toHaveValue('精緻剪髮(S01)'))
    // 已完成的帳單：主要動作是「重新結帳」
    expect(await screen.findByTestId('checkout')).toHaveTextContent('重新結帳')
    await wait(() => expect(screen.getAllByText('業績合計')[0].nextSibling).toHaveTextContent('800'))
  })
})

describe('帳單詳細：重新結帳', () => {
  it('未設重新結帳密碼：直接送出，內容與原帳單一致（帳單 id、服務人員、服務與金額）', async () => {
    const { calls } = setup()
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'reCheckoutOrder')[0].variables
    expect(input.updateOrderId).toBe('order-1')
    expect(input.password).toBe('')
    expect(input.orderInput.isPending).toBe(false)
    expect(input.orderInput.designerId).toBe(DESIGNER.userId)
    expect(input.orderInput.withoutCustomerData).toBe(true)
    expect(input.orderInput.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '帳單重新結帳成功', variant: 'success' }))
    )
  })

  it('店家開啟重新結帳密碼：先跳密碼視窗，輸入後才以該密碼送出', async () => {
    const { calls } = setup({ password: true })
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    expect(await screen.findByText('重新結帳', { selector: 'h2, h2 *' })).toBeInTheDocument()
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(0)

    const pwd = screen.getByLabelText('密碼')
    fireEvent.change(pwd, { target: { value: '1234' } })
    // 密碼以 * 遮罩顯示
    expect(pwd).toHaveValue('****')
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    expect(callsOf(calls, 'reCheckoutOrder')[0].variables.input.password).toBe('1234')
  })

  it('送出失敗時提示錯誤，不跳轉', async () => {
    const { calls } = setup({ reCheckoutOrder: new Error('帳單已關帳，無法重新結帳') })
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).not.toBeDisabled())
    fireEvent.click(checkout)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'error', message: expect.stringContaining('帳單已關帳') })
      )
    )
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
    await wait(() => expect(checkout).not.toBeDisabled())
  })
})

describe('帳單詳細：已結算的帳單', () => {
  it('已關帳的帳單不能重新結帳，並說明「帳單已結算」', async () => {
    setup({ order: makeOrder({ isCloseAccount: true }) })
    const checkout = await screen.findByTestId('checkout')
    await wait(() => expect(checkout).toBeDisabled())
    expect(screen.getByRole('status')).toHaveTextContent('帳單已結算')
  })
})

describe('帳單詳細：預約成功的帳單', () => {
  it('主要動作為「結帳」，另可「儲存」；儲存送出 updateOrder 並帶原帳單 id', async () => {
    const { calls } = setup({ order: makeOrder({ status: '預約成功', customer: CUSTOMER }) })
    expect(await screen.findByTestId('checkout')).toHaveTextContent('結帳')
    const save = button('儲存')
    await wait(() => expect(save).not.toBeDisabled())
    fireEvent.click(save)
    await wait(() => expect(callsOf(calls, 'UpdateOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'UpdateOrder')[0].variables
    expect(input.updateOrderId).toBe('order-1')
    expect(input.orderInput.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '帳單儲存成功', variant: 'success' }))
    )
  })

  it('不留客資的預約單不能「儲存」（儲存需要顧客），並說明缺少顧客', async () => {
    setup({ order: makeOrder({ status: '預約成功' }) })
    await screen.findByTestId('checkout')
    await wait(() => expect(button('儲存')).toBeDisabled())
    expect(button('儲存').parentElement).toHaveAttribute('title', '尚缺：顧客')
  })

  it('有預約的帳單可以掛單，掛單以 isPending 送出', async () => {
    const { calls } = setup({ order: makeOrder({ status: '預約成功', isReserved: true, customer: CUSTOMER }) })
    await screen.findByTestId('checkout')
    const pending = button('掛單')
    await wait(() => expect(pending).not.toBeDisabled())
    fireEvent.click(pending)
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    expect(callsOf(calls, 'reCheckoutOrder')[0].variables.input.orderInput.isPending).toBe(true)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '掛單成功' })))
  })
})
