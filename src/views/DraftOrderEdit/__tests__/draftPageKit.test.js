// 「掛單詳細」整頁測試共用的模擬資料與操作（本身也是測試檔：直接執行時驗證預設資料能完整載入整頁；被 import 時只提供函式）。
// 為什麼需要：掛單頁一次發出約 40 支查詢（帳單本身、各區塊的帳單片段、設定、選項清單、列印明細），
// 每個測試只想改其中一兩項（例如「這張掛單有店販」「店家開了第三方卡券」），共用一份預設資料才不會各檔各寫一份而互相走樣。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立或修改真實帳單。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import DraftOrderEdit from '..'

const isMain = expect.getState().testPath === __filename

export const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
export const HELPER = { userId: 'helper-1', userName: '李助理', userNickName: 'Lee', userNo: '02' }
export const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }
export const SERVICE = {
  id: 'service-1',
  no: 'S01',
  name: '精緻剪髮',
  price: 800,
  isLocked: 'FALSE',
  isNoCash: false,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: 'FALSE',
  isUsing: true,
}
export const SERVICE2 = {
  id: 'service-2',
  no: 'S02',
  name: '設計染髮',
  price: 2000,
  isLocked: 'FALSE',
  isNoCash: false,
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'TRUE',
  isUsing: true,
}
export const PRODUCT = { id: 'product-1', no: 'P01', name: '洗髮精', sellPrice: 1200, isLocked: 'FALSE', isUsing: true, isAvailableForSale: true }
export const PRODUCT2 = { id: 'product-2', no: 'P02', name: '護髮油', sellPrice: 500, isLocked: 'FALSE', isUsing: true, isAvailableForSale: true }
export const TICKET = { id: 'ticket-1', no: 'T01', name: '剪髮10次卡', price: 6000, ticketAvailableCount: 10, isLocked: 'FALSE', isUsing: true }
export const TICKET_LOCKED = { id: 'ticket-2', no: 'T02', name: '護髮5次卡', price: 3000, ticketAvailableCount: 5, isLocked: 'TRUE', isUsing: true }
export const YEAR_CARD = { uuid: 'card-1', no: 'M01', name: '年卡', sellPrice: 12000, effecitveDay: 365, isLocked: 'FALSE', membershipCategory: { id: 'mc-1', uuid: 'mc-1', name: '年卡類' } }
export const FOREVER_CARD = { uuid: 'card-2', no: 'M02', name: '永久卡', sellPrice: 30000, effecitveDay: 0, isLocked: 'TRUE', membershipCategory: { id: 'mc-1', uuid: 'mc-1', name: '年卡類' } }
// 第三方卡券：百分比手續費與固定金額手續費各一
export const THIRD_PARTY = [
  { id: 'tp-1', name: '街口券', fee: 10, type: 'PERCENT' },
  { id: 'tp-2', name: '定額券', fee: 100, type: 'FIXED' },
]

export const serviceOrder = (service = SERVICE, overrides = {}) => ({
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
  ...overrides,
})

export const makeOrder = (overrides = {}) => ({
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
  serviceOrders: [serviceOrder()],
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

export const customerDetail = (overrides = {}) => ({
  ...CUSTOMER,
  gender: 'FEMALE',
  birthday: { year: '80', month: '1', day: '2' },
  remark: '',
  source: '',
  preferDesigner: null,
  membershipPurchaseRecord: [],
  isLineBinded: false,
  ...overrides,
})

const customerById = (id, customer, otherCustomers) =>
  (customer && customer.id === id ? customer : otherCustomers[id]) || null

// 預設：不留客資的掛單、一個服務；店家沒開第三方卡券、沒開助理指定、沒開紅利；所有選項清單都有資料
export const draftFixtures = ({
  order = makeOrder(),
  password = false,
  disablePendingOrder = false,
  thirdPartTicket = false,
  helperDesignation = false,
  customerBonusActive = false,
  bonusRule = { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } },
  bonusConversion = { isBonusConversion: false, bonusConversionRate: 0 },
  bonusRewardWithLine = false,
  LBCusDisplay = false,
  layout = 'A4',
  closureDelayed = false,
  helperDeductionSetting = {},
  customer = null,
  otherCustomers = {},
  ...overrides
} = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: customerBonusActive },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: bonusRewardWithLine } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: LBCusDisplay } },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: closureDelayed } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: { getParameterAboutSettingFunction: { bonusRewardRule: bonusRule } },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: bonusConversion },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder } },
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: thirdPartTicket },
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: helperDesignation },
  FETCH_THIRDPARTYS: { merchant: { id: 'merchant-1', thirdpartyCoupons: THIRD_PARTY } },
  FETCH_THIRDPARTYS_IN_ORDER_DETAIL: { merchant: { thirdpartyCoupons: THIRD_PARTY } },
  // 帳單本身：頁面與各區塊分別查詢同一張帳單的不同欄位，回同一份資料
  FETCH_ORDER: { order },
  FETRCH_SERVICE_ORDER: { order },
  FETCH_PRODUCT_ORDER: { order },
  FETCH_MEMBERSHIP_ORDER: { order },
  // 選項清單
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SERVICE, SERVICE2] } },
  FETCH_SERVICES: { services: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SERVICE, SERVICE2] } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: [SERVICE, SERVICE2] } },
  ServiceCategories: { serviceCategories: [{ id: 'cat-1', name: '剪髮' }] },
  // 服務的助理設定（依服務 id）；沒寫到的服務沒有助理
  service: ({ serviceId }) => ({ service: { helperDeductionSetting: helperDeductionSetting[serviceId] || [] } }),
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT, PRODUCT2] } },
  // 未命名的商品查詢（選擇窗用與列印明細用）
  undefined: { products: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [PRODUCT, PRODUCT2] } },
  PRODUCT_CATEGORIES: { productCategories: [] },
  GET_TICKETS: { tickets: [TICKET, TICKET_LOCKED] },
  GET_TICKETS_IN_ORDER_DETAIL: { tickets: [TICKET, TICKET_LOCKED] },
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [YEAR_CARD, FOREVER_CARD] } },
  FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageLimit: 50, pageOffset: 0, data: [YEAR_CARD, FOREVER_CARD] } },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', name: '年卡類' }] },
  GET_MEMBERSHIPS_IN_ORDER_DETAIL: { memberships: { data: [YEAR_CARD, FOREVER_CARD] } },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER] } },
  // 顧客
  // 依 id 回顧客：customer 是這張掛單的顧客，otherCustomers 是改選的其他顧客；沒有 id 或查無此人回 null
  FETCH_CUSTOMER_DETAIL: ({ id }) => ({ customer: customerById(id, customer, otherCustomers) }),
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: ({ id }) => ({ customer: customerById(id, customer, otherCustomers) }),
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C99' },
  // 送出
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: password } } },
  reCheckoutOrder: { reCheckoutOrder: { id: 'order-1' } },
  // 列印
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: layout },
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'NAME' },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: null, imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
  ...overrides,
})

export const setupDraft = (options = {}, { route = '/draft-order/order-1', delays } = {}) =>
  renderPage(<DraftOrderEdit match={{ params: { id: 'order-1' } }} />, {
    fixtures: draftFixtures(options),
    route,
    delays,
  })

// 等頁面載入完成（標題出現、所有查詢都回來）
export const pageReady = async ({ settle }) => {
  await screen.findByText(/掛單詳細 \(A123\)/)
  await settle()
}

// 金額彙總卡上某一項的數字（彙總卡與底部固定列各有一份，取第一個）
export const summaryValue = label => screen.getAllByText(label, { selector: 'span' })[0].nextSibling

// 搜尋下拉的 data-testid 掛在外框上（inputProps 併入 InputProps），取裡面的輸入框
export const inputOf = testId => {
  const el = screen.getByTestId(testId)
  return el.tagName === 'INPUT' ? el : el.querySelector('input')
}

// 某個項目區塊（依標題，例如「店販銷售」）：店販與會員卡兩區塊的 data-testid 相同，以區塊範圍查詢
export const panel = title => within(screen.getByText(title, { selector: 'p' }).closest('[data-state]'))
export const panelHeader = title => screen.getByText(title, { selector: 'p' }).closest('[role="button"]')

// 打開搜尋下拉（↓）並點選選項
export const pick = (input, optionText) => {
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.click(within(document.getElementById(input.getAttribute('aria-controls'))).getByText(optionText))
}

// 按搜尋下拉的「清除」（欄位有值且在焦點中才出現）
export const clearField = input => {
  act(() => input.focus())
  fireEvent.mouseDown(within(input.closest('.relative')).getByRole('button', { name: '清除' }))
}

// 按「儲存」（仍為掛單）並回傳送出的 orderInput
export const saveDraft = async calls => {
  const save = screen.getByTestId('savedraft')
  await wait(() => expect(save).not.toBeDisabled())
  fireEvent.click(save)
  await wait(() => expect(calls.filter(c => c.operationName === 'reCheckoutOrder')).toHaveLength(1))
  return calls.filter(c => c.operationName === 'reCheckoutOrder')[0].variables.input.orderInput
}

if (isMain) {
  afterEach(cleanup)
  describe('掛單詳細測試資料', () => {
    it('預設資料能完整載入整頁：標題、服務人員、服務與業績合計，且頁面沒有錯誤畫面', async () => {
      loginAs()
      const page = setupDraft()
      await pageReady(page)
      expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
      expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('Amy-01')
      expect(screen.getByPlaceholderText('服務名稱/代號')).toHaveValue('精緻剪髮(S01)')
      expect(summaryValue('業績合計')).toHaveTextContent('800')
    })
  })
}
