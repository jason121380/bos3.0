// 帳單詳細（OrderEdit）頁面測試的共用資料與操作（本身也是測試檔：直接執行時驗證這份模擬資料能讓頁面完整載入；
// 被其他測試 import 時只提供資料與函式，比照 src/__tests__/testkit.test.js 的寫法）。
// 為什麼需要：帳單詳細一次發出約 30 支查詢（帳單本身分四支、各區塊的選單與設定），每個流程測試都要同一套「一張有顧客、
// 服務含助理、店販、預收卡、使用預收卡、會員卡、第三方卡券」的帳單；集中一份，測試只寫與該流程有關的差異。
// 全部是模擬資料，不連後端、不建立或修改真實帳單。
import React from 'react'
import { fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import OrderEdit from '..'

const isMain = expect.getState().testPath === __filename

export const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
export const ASSISTANT = { userId: 'designer-2', userName: '李助理', userNickName: '', userNo: '02' }
export const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }
export const OTHER_CUSTOMER = { id: 'customer-2', no: 'C02', name: '林先生', cellphone: '0922333444' }
export const BILL_DATE = new Date(2026, 9, 21, 10, 30).getTime()

export const SERVICE = {
  id: 'service-1',
  no: 'S01',
  name: '精緻剪髮',
  price: 800,
  isLocked: 'FALSE',
  isNoCash: false,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: 'FALSE',
}
// 價格鎖定、綁定第三方卡券的服務
export const LOCKED_SERVICE = {
  id: 'service-2',
  no: 'S02',
  name: '頭皮護理',
  price: 1500,
  isLocked: 'TRUE',
  isNoCash: false,
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'TRUE',
}
export const PRODUCT = {
  id: 'product-1',
  no: 'P01',
  name: '洗髮精',
  sellPrice: 1200,
  isLocked: 'FALSE',
  isUsing: true,
  isAvailableForSale: true,
  productCategory: { id: 'pc-1', name: '洗護' },
}
export const TICKET = {
  id: 'ticket-1',
  no: 'T01',
  name: '剪髮十次卡',
  price: 6000,
  ticketAvailableCount: 10,
  isLocked: 'FALSE',
  isUsing: true,
  remark: '',
}
export const MEMBERSHIP = {
  uuid: 'membership-1',
  no: 'M01',
  name: '金卡',
  sellPrice: 3000,
  effecitveDay: 365,
  isLocked: 'FALSE',
}
export const THIRD_PARTY = [
  { id: 'tp-1', name: '團購券', fee: 10, type: 'PERCENT' },
  { id: 'tp-2', name: '禮券', fee: 100, type: 'CASH' },
]
// 顧客持有、本帳單已使用的預收卡紀錄
export const TICKET_RECORD = {
  id: 'record-1',
  no: 'R01',
  name: '剪髮十次卡',
  remark: '',
  price: 600,
  pricePerCount: 600,
  service: {
    id: TICKET.id,
    name: TICKET.name,
    price: 6000,
    no: TICKET.no,
    helperDeductionSetting: [{ type: '助理', nameList: ['洗髮'], helperDeductionType: 'CASH' }],
  },
}

const serviceOrder = (service, extra = {}) => ({
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

export const SIMPLE_SERVICE_ORDER = serviceOrder(SERVICE)

// 只有一項服務、不留客資的最小帳單（與 OrderEdit.page.test 相同）
export const makeOrder = (overrides = {}) => ({
  id: 'order-1',
  no: 'A123',
  date: BILL_DATE,
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
  serviceOrders: [SIMPLE_SERVICE_ORDER],
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

// 一張「什麼都有」的帳單：有顧客、服務含助理、鎖價的第三方卡券服務、店販、預收卡、使用預收卡、兩張會員卡（一張永久）
export const makeFullOrder = (overrides = {}) =>
  makeOrder({
    customer: CUSTOMER,
    walletPay: 200,
    payType: ['LINE Pay'],
    amountByOtherPay: 300,
    serviceOrders: [
      serviceOrder(SERVICE, {
        helperList: [
          {
            id: 'h-1',
            type: '助理-洗髮',
            isDesignate: true,
            helperDeductionType: 'CASH',
            helper: { id: ASSISTANT.userId, designerNo: '02', lastName: '李', firstName: '助理' },
          },
        ],
      }),
      serviceOrder(LOCKED_SERVICE, { thirdPartyPayId: 'tp-1', thirdPartyPayName: '團購券' }),
    ],
    productOrders: [
      {
        id: 'po-1',
        name: PRODUCT.name,
        count: 2,
        price: 1200,
        thirdPartyPayId: 'tp-1',
        isLocked: 'FALSE',
        seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' },
        product: { id: PRODUCT.id, no: PRODUCT.no, name: PRODUCT.name, isLocked: 'FALSE' },
      },
    ],
    ticketOrders: [
      {
        id: 'to-1',
        name: TICKET.name,
        price: 6000,
        count: 1,
        availableCount: 10,
        remark: '週年慶',
        intoPerformanceWhileBuying: false,
        service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000, isLocked: 'FALSE' },
      },
    ],
    useTicketOrders: [
      {
        id: TICKET_RECORD.id,
        name: TICKET_RECORD.name,
        price: 600,
        pricePerCount: 600,
        service: { id: TICKET.id, no: TICKET.no, name: TICKET.name, price: 6000 },
        helperList: [
          {
            id: 'uh-1',
            type: '助理-洗髮',
            isDesignate: false,
            helperDeductiontype: 'CASH',
            helper: { id: ASSISTANT.userId, firstName: '助理', lastName: '李', designerNo: '02' },
          },
        ],
      },
    ],
    membershipOrders: [
      {
        expiryDate: new Date(2027, 9, 21).getTime(),
        purchaseDate: BILL_DATE,
        validDayCount: 365,
        price: 3000,
        thirdPartyPayId: null,
        remark: '',
        seller: { id: DESIGNER.userId },
        membership: { uuid: MEMBERSHIP.uuid, isLocked: 'FALSE', effecitveDay: 365 },
      },
    ],
    bonusDecount: 10,
    bonusDeposit: 5,
    bonusUsed: 10,
    raffleRecord: [{ number: 'R-0001', ruleName: '滿千抽' }],
    ...overrides,
  })

export const withCustomer = (overrides = {}) => makeOrder({ customer: CUSTOMER, ...overrides })

export const CUSTOMER_DETAIL = {
  ...CUSTOMER,
  gender: 'FEMALE',
  birthday: { year: '80', month: '1', day: '2' },
  email: null,
  address: null,
  lineId: null,
  nickName: null,
  category: null,
  remark: null,
  source: null,
  preferDesigner: null,
  membershipPurchaseRecord: [],
  isLineBinded: false,
}

const ROLE_ALL_WALLET = JSON.stringify([
  {
    pageTitle: '客戶管理',
    pageAuthority: [
      { pageName: '入金(儲值)', authority: true },
      { pageName: '入金(扣除)', authority: true },
    ],
  },
])

// order：帳單；其餘鍵覆蓋個別查詢的回應
export const fixtures = ({ order = makeOrder(), password = false, ...overrides } = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, ASSISTANT] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
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
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false },
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: false },
  FETCH_THIRDPARTYS: { merchant: { id: 'merchant-1', thirdpartyCoupons: THIRD_PARTY } },
  // 帳單本身：頁面與各區塊分別查詢同一張帳單的不同欄位，回同一份資料
  FETCH_ORDER: { order },
  FETRCH_SERVICE_ORDER: { order },
  FETCH_PRODUCT_ORDER: { order },
  FETCH_MEMBERSHIP_ORDER: { order },
  GET_SERVICES_FOR_AUTOCOMPLETE: {
    services: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SERVICE, LOCKED_SERVICE] },
  },
  service: { service: { helperDeductionSetting: [] } },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT] } },
  GET_TICKETS: { tickets: [TICKET] },
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP] } },
  merchantPayWays: { merchantPayWays: [{ id: 'pay-1', type: 'OTHER', name: 'LINE Pay', fee: 0 }] },
  GetTicket: { ticketRecords: { data: [] } },
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: password } } },
  reCheckoutOrder: { reCheckoutOrder: { id: 'order-1' } },
  UpdateOrder: { updateOrder: { id: 'order-1' } },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } },
  // 依 id 回顧客資料；沒有 id（不留客資、清掉顧客）時與後端相同回 null
  FETCH_CUSTOMER_DETAIL: v => ({
    customer: v.id === CUSTOMER.id ? CUSTOMER_DETAIL : v.id ? { ...CUSTOMER_DETAIL, ...OTHER_CUSTOMER, id: v.id } : null,
  }),
  // 有顧客時：入金、紅利與入金異動權限
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: [{ id: 'auth-1', authoritySettings: ROLE_ALL_WALLET }] },
  ...overrides,
})

// 以帳單詳細的網址渲染整頁；route 可帶 ?status=…（從訂單列表／網路訂單進來）
export const setup = (options = {}, { route = '/order/order-1', delays } = {}) =>
  renderPage(<OrderEdit match={{ params: { id: 'order-1' } }} />, { fixtures: fixtures(options), route, delays })

export const pageReady = async ({ settle }) => {
  await screen.findByText(/帳單詳細 \(A123\)/)
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
}

export const button = name => screen.getByText(name, { selector: 'button' })

// 整頁有上百個欄位與按鈕，以 role 查詢（要算每個元素的無障礙名稱）每次要數百毫秒；彈窗與狀態列直接以 role 屬性找
export const queryDialog = () => document.querySelector('[role="dialog"]')
export const findDialog = async () => {
  await wait(() => expect(queryDialog()).not.toBeNull())
  return queryDialog()
}
// 排除 downshift（下拉）掛在 body 的螢幕閱讀器播報區 #a11y-status-message：它也是 role="status"，前一個測試留下來時會被誤抓。
// 下拉篩選結果快取後（效能修正 B），選項清單身分固定，downshift 的播報不再每次重畫被重設，較常真的寫出這個區塊
export const statusEl = () => document.querySelector('[role="status"]:not(#a11y-status-message)')

// 主要動作（重新結帳／結帳）可按後按下，回傳送出的 orderInput
export const checkoutAndGetInput = async calls => {
  const checkout = await screen.findByTestId('checkout')
  await wait(() => expect(checkout).not.toBeDisabled())
  fireEvent.click(checkout)
  await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
  return callsOf(calls, 'reCheckoutOrder')[0].variables.input.orderInput
}

// 在服務人員自動完成欄位輸入關鍵字後選人（選項以 testid「employee-姓名」標示）
export const pickEmployee = async (input, name) => {
  fireEvent.change(input, { target: { value: name.slice(0, 1) } })
  const options = await screen.findAllByTestId(`employee-${name}`)
  fireEvent.click(options[options.length - 1])
}

// 金額彙總卡上某一列的數字（「服務消費」「業績合計」…；「預收卡販賣」等也是區塊標題，取後面接著數字欄的那一個）
export const summaryValue = label =>
  screen.getAllByText(label).find(el => el.nextSibling && /tabular-nums/.test(el.nextSibling.className)).nextSibling

export const loginForTest = loginAs

if (isMain) {
  jest.setTimeout(20000)
  beforeEach(() => loginAs())

  describe('帳單詳細的模擬資料', () => {
    it('「什麼都有」的帳單：各區塊照原帳單帶入，頁面不出錯', async () => {
      const page = setup({ order: makeFullOrder() })
      await pageReady(page)
      await wait(() => expect(screen.getByPlaceholderText('顧客姓名/手機號碼/編號')).toHaveValue('陳小姐/0912345678/C01'))
      expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(2)
      expect(screen.getByDisplayValue('週年慶')).toBeInTheDocument()
    })
  })
}
