// 重新開單頁面測試共用的假資料與操作（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證假資料本身）。
// 為什麼需要：重新開單的帳單內容全部來自佇列裡保存的 OrderInput（JSON 字串），各區塊（服務、店販、預收卡、使用預收卡、會員卡、
// 付款、紅利）各自解析同一份資料；測試需要一份「每一區都有內容」的佇列帳單，與一組回應所有設定查詢的 fixtures。
// 這份佇列帳單本身必須是一張能通過重試前檢核（helper/billVerify）的帳單，否則測「重試送出原內容」沒有意義——下方的自我測試保護這點。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import React from 'react'
import { fireEvent, screen, wait, within } from '@testing-library/react'
import { handleTidyBill, checkServicesOrders, checkProductOrders, checkMembershipOrders } from 'helper/billVerify'
import { renderPage } from '../../../__tests__/testkit.test'
import QueueOrderEdit from '..'

const isMain = expect.getState().testPath === __filename

export const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
export const ASSISTANT = { userId: 'designer-2', userName: '李助理', userNickName: '', userNo: '02' }
export const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }
export const OTHER_CUSTOMER = { id: 'customer-2', no: 'C02', name: '林先生', cellphone: '0922333444' }

export const SERVICE = {
  id: 'service-1',
  no: 'S01',
  name: '精緻剪髮',
  price: 800,
  isLocked: false,
  isNoCash: false,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: 'FALSE',
}
export const SERVICE_DYE = {
  id: 'service-2',
  no: 'S02',
  name: '染髮',
  price: 2000,
  isLocked: 'TRUE',
  isNoCash: false,
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'TRUE',
}
export const PRODUCT = { id: 'product-1', no: 'P01', name: '洗髮精', sellPrice: 300, isUsing: true, isLocked: false }
export const TICKET = {
  id: 'ticket-1',
  no: 'T01',
  name: '護髮五次卡',
  price: 1000,
  ticketAvailableCount: 5,
  remark: '',
  isLocked: false,
}
export const CARD = { uuid: 'card-1', no: 'M01', name: '年卡', sellPrice: 12000, effecitveDay: 365, isLocked: false }
export const THIRD_PARTIES = [
  { id: 'tp-1', name: '團購券', fee: 10, type: 'PERCENT' },
  { id: 'tp-2', name: '禮券', fee: 100, type: 'FIXED' },
]
// 顧客名下的預收卡紀錄（使用預收卡）
export const TICKET_RECORD = {
  id: 'ct-1',
  name: '護髮五次卡',
  price: 200,
  remark: '剩 4 次',
  service: {
    id: 'ticket-1',
    name: '護髮五次卡',
    price: 200,
    helperDeductionSetting: [{ type: '助理', nameList: ['護髮'], helperDeductionType: 'FIXED' }],
  },
}

export const DATE = new Date(2026, 9, 21, 15, 0).getTime()

// 佇列中保存的是送出當時的 OrderInput（JSON 字串）。base：只有一個服務、不留客資
export const baseQueue = (overrides = {}) => ({
  no: 'A777',
  date: DATE,
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

// 每一區都有內容的佇列帳單：有顧客、服務帶助理與第三方卡券、店販、預收卡販賣、使用預收卡、會員卡、其他付款與紅利
export const richQueue = (overrides = {}) =>
  baseQueue({
    customerId: CUSTOMER.id,
    withoutCustomerData: false,
    isDesignate: true,
    serviceOrders: [
      {
        serviceId: SERVICE.id,
        price: 800,
        thirdPartyCouponMerchantId: null,
        serviceOrderHelpers: [{ type: '助理-洗髮', helperId: ASSISTANT.userId, isDesignate: true, helperDeductionType: 'FIXED' }],
      },
      { serviceId: SERVICE_DYE.id, price: 2000, thirdPartyCouponMerchantId: 'tp-1', serviceOrderHelpers: [] },
    ],
    productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 2, thirdPartyCouponMerchantId: null }],
    ticketOrders: [
      { serviceId: TICKET.id, availableCount: 5, price: 1000, count: 1, remark: '送一次', intoPerformanceWhileBuying: false },
    ],
    useTicketOrders: [
      {
        customerTicketId: TICKET_RECORD.id,
        price: 200,
        useTicketOrderHelpers: [{ type: '助理-護髮', helperId: ASSISTANT.userId, isDesignate: false, helperDeductiontype: 'FIXED' }],
      },
    ],
    membershipOrders: [
      {
        sellerId: DESIGNER.userId,
        membershipUUID: CARD.uuid,
        price: 12000,
        thirdPartyCouponMerchantId: null,
        remark: '',
        purchaseDate: DATE,
        expiryDate: new Date(2027, 9, 21).getTime(),
      },
    ],
    walletPay: 100,
    bonusDecount: 50,
    bonusDeposit: 0,
    bonusUsed: 0,
    source: '朋友介紹',
    serialNumber: '0007',
    ...overrides,
  })

// 使用預收卡的 GetTicket：依 ids 查（金額彙總、助理欄位）時只回那幾筆；依顧客查（自動完成）時回顧客名下全部
export const ticketRecordsFixture = records => ({ input }) => {
  const data = input.ids ? records.filter(r => input.ids.includes(r.id)) : records
  return { ticketRecords: { totalCount: data.length, pageOffset: 0, pageLimit: 1000, data } }
}

export const servicesPage = data => ({ services: { totalCount: data.length, pageOffset: 0, pageLimit: 50, data } })

// 店家設定、清單與顧客資料的回應；個別測試以 overrides 改寫
export const fixtures = ({ queue = baseQueue(), ...overrides } = {}) => ({
  GET_ORDER_INPUT_BY_QUEUE_ID: { getOrderInputByQueueId: JSON.stringify(queue) },
  FETCH_CREATE_ORDER: { createOrder2: 'A777' },
  DELETE_QUEUE: { destroyQueueById: true },
  FETCH_SERVICES: servicesPage([
    { ...SERVICE, isUsing: true, serviceCategory: { id: 'cat-1', name: '剪髮' } },
    { ...SERVICE_DYE, isUsing: true, serviceCategory: { id: 'cat-2', name: '染燙' } },
  ]),
  ServiceCategories: { serviceCategories: [{ id: 'cat-1', name: '剪髮' }, { id: 'cat-2', name: '染燙' }] },
  GET_SERVICES_FOR_AUTOCOMPLETE: servicesPage([SERVICE, SERVICE_DYE]),
  service: { service: { helperDeductionSetting: [] } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, ASSISTANT] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false },
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: false },
  FETCH_THIRDPARTYS: { merchant: { id: 'merchant-1', thirdpartyCoupons: THIRD_PARTIES } },
  FETCH_THIRDPARTYS_FOR_CREATE_ORDER: { merchant: { thirdpartyCoupons: THIRD_PARTIES } },
  merchantPayWays: { merchantPayWays: [{ id: 'pay-1', type: 'CARD', name: '信用卡', fee: 0 }] },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT] } },
  GET_TICKETS: { tickets: [TICKET] },
  // 使用預收卡：依顧客查名下預收卡（自動完成），或依 id 查單筆（金額、助理欄位）
  GetTicket: ticketRecordsFixture([TICKET_RECORD]),
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [CARD] } },
  FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageLimit: 50, pageOffset: 0, data: [{ ...CARD, membershipCategory: { id: 'mc-1', uuid: 'mc-1', name: '年卡類' } }] } },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', name: '年卡類' }] },
  // 顧客
  // 依 id 查顧客；沒有 id（不留客資、清除顧客）時後端回 null
  FETCH_CUSTOMER_DETAIL: ({ id }) => ({ customer: id ? { ...CUSTOMER, membershipPurchaseRecord: [], isLineBinded: false } : null }),
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER, OTHER_CUSTOMER] } },
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C99' },
  GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
  FETCH_USERS: { users: { users: [{ id: DESIGNER.userId, name: DESIGNER.userName }] } },
  ...overrides,
})

export const setupQueue = (options = {}, renderOptions = {}) =>
  renderPage(<QueueOrderEdit match={{ params: { id: 'queue-1' } }} />, {
    fixtures: fixtures(options),
    route: '/queue-order-edit/queue-1',
    ...renderOptions,
  })

// 等頁面載入佇列帳單（標題出現帳單編號）且所有查詢都回來
export const loaded = async page => {
  await screen.findByText(/重新開單 \(A777\)/)
  await page.settle()
}

// 自動完成（ui/combobox）：data-testid 常落在輸入框外框上，取得裡面的 input
export const inputOf = el => (el.tagName === 'INPUT' ? el : el.querySelector('input'))
const OPTION = '[role="option"]:not(option)'
// 點輸入框打開選單，再點選文字相符的選項
export const pickOption = async (el, text) => {
  const input = inputOf(el)
  fireEvent.focus(input)
  fireEvent.click(input)
  const option = await screen.findByText(text, { selector: `${OPTION}, ${OPTION} *` })
  fireEvent.click(option.closest(OPTION))
}

// 原生下拉（ui/native-select、分頁的每頁筆數）：依選項文字選取
export const chooseNative = (select, text) => {
  const option = [...select.options].find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}

// 金額彙總卡的數值（同一標籤在彙總卡與底部固定列各一個，取第一個）
export const summaryValue = label => screen.getAllByText(label, { selector: 'span' })[0].nextSibling

// 「重試」：等按鈕可按後按下，回傳送出的 createOrder input
export const retry = async calls => {
  const button = screen.getByTestId('checkout')
  await wait(() => expect(button).not.toBeDisabled())
  fireEvent.click(button)
  await wait(() => expect(calls.filter(c => c.operationName === 'FETCH_CREATE_ORDER')).toHaveLength(1))
  return calls.filter(c => c.operationName === 'FETCH_CREATE_ORDER')[0].variables.input
}

// 依卡片標題找到該區塊（Accordion 根節點帶 data-state）
export const panelOf = title => screen.getByText(title, { selector: 'p' }).closest('[data-state]')
export const panel = title => within(panelOf(title))
// 欄位標籤下方的輸入框（ui/input 的 Field：標籤後接欄位）
export const fieldInput = (scope, label, n = 0) =>
  scope.getAllByText(label, { selector: 'label' })[n].parentElement.querySelector('input, textarea')

if (isMain) {
  describe('queueKit：測試用的佇列帳單', () => {
    it('每一區都有內容的佇列帳單通過重試前檢核（服務、店販、會員卡）', () => {
      const tidy = handleTidyBill(richQueue())
      expect(checkServicesOrders(tidy.serviceOrders)).toEqual({ verify: true })
      expect(checkProductOrders(tidy.productOrders)).toEqual({ verify: true })
      expect(checkMembershipOrders(tidy.membershipOrders)).toEqual({ verify: true })
      // 有顧客時不送手機（以顧客 id 為準）
      expect(handleTidyBill(richQueue({ customerCellphone: '0900' })).customerCellphone).toBe('')
    })
  })
}
