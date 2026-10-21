// 保護「重新開單」（打帳單佇列送出失敗的帳單）：佇列裡的帳單內容要原樣帶回，「重試」要先成立帳單、成功後才刪除佇列；
// 成立失敗時保留佇列並提示，避免帳單遺失。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不建立真實帳單。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import QueueOrderEdit from '..'

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


// 佇列中保存的是送出當時的 OrderInput（JSON 字串）
const queuedInput = (overrides = {}) => ({
  no: 'A777',
  date: new Date(2026, 9, 21, 15, 0).getTime(),
  isDesignate: false,
  isReserved: false,
  payType: [],
  amountByOtherPay: 0,
  walletPay: 0,
  customerCellphone: '',
  designerId: DESIGNER.userId,
  serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
  remark: '佇列重送',
  withoutCustomerData: true,
  isPending: false,
  ...overrides,
})

const makeOrder = () => ({})
const fixtures = ({ queue = queuedInput(), order = makeOrder(), password = false, ...overrides } = {}) => ({
  GET_ORDER_INPUT_BY_QUEUE_ID: { getOrderInputByQueueId: JSON.stringify(queue) },
  FETCH_CREATE_ORDER: { createOrder2: 'A777' },
  DELETE_QUEUE: { destroyQueueById: true },
  // 服務清單（判斷第三方卡券是否鎖定），與自動完成共用同一份服務資料
  FETCH_SERVICES: {
    services: {
      totalCount: 1,
      pageOffset: 0,
      pageLimit: 50,
      data: [{ ...SERVICE, isUsing: true, helperDeductionSetting: [], serviceCategory: { id: 'cat-1', name: '剪髮' } }],
    },
  },
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


const setup = (options = {}) =>
  renderPage(<QueueOrderEdit match={{ params: { id: 'queue-1' } }} />, {
    fixtures: fixtures(options),
    route: '/queue-order-edit/queue-1',
  })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('重新開單：載入佇列中的帳單', () => {
  it('標題顯示帳單編號，服務人員與服務照佇列內容帶入', async () => {
    const { calls } = setup()
    expect(await screen.findByText(/重新開單 \(A777\)/)).toBeInTheDocument()
    expect(callsOf(calls, 'GET_ORDER_INPUT_BY_QUEUE_ID')[0].variables).toEqual({ queueId: 'queue-1' })
    await wait(() => expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('Amy-01'))
    // 服務欄（此頁的服務欄沒有 placeholder，以顯示值找）
    expect(await screen.findByDisplayValue('精緻剪髮(S01)')).toBeInTheDocument()
    await wait(() => expect(screen.getAllByText('業績合計')[0].nextSibling).toHaveTextContent('800'))
  })
})

describe('重新開單：重試', () => {
  it('先成立帳單，成功後才刪除佇列並回帳單列表', async () => {
    const { calls } = setup()
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(1))
    const { input } = callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables
    expect(input.designerId).toBe(DESIGNER.userId)
    expect(input.withoutCustomerData).toBe(true)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
    expect(callsOf(calls, 'DELETE_QUEUE')[0].variables).toEqual({ queueId: 'queue-1' })
    // 成立帳單在刪除佇列之前
    const order = calls.map(c => c.operationName)
    expect(order.indexOf('FETCH_CREATE_ORDER')).toBeLessThan(order.indexOf('DELETE_QUEUE'))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('佇列中是掛單：重試後回掛單列表', async () => {
    const { calls } = setup({ queue: queuedInput({ isPending: true }) })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.isPending).toBe(true)
  })

  it('成立帳單失敗：提示「重結失敗」且不刪除佇列（帳單不遺失）', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: new Error('伺服器忙碌') })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    // 失敗後頁面會重新整理（jsdom 不支援導覽，這裡只確認不刪佇列與提示）
    fireEvent.click(retry)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('重結失敗') }))
    )
    expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(0)
    expect(currentLocation()).toBe('/queue-order-edit/queue-1')
  })

  it('後端未回傳帳單編號時不刪除佇列', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: { createOrder2: null } })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(0)
  })
})
