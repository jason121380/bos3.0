// 打帳單整頁測試共用的模擬資料與櫃台操作（本身也是測試檔：直接執行時檢查「載入打帳單時每支查詢都有模擬回應」，
// 確保其他測試不是靠 testkit 自動補的空資料剛好通過；被其他測試 import 時只提供資料與函式）。
// 資料全部是假的（不連後端、不建立真實帳單）：一位設計師＋一位助理、四種鎖價設定的服務、店販、預收卡、會員卡、第三方卡券、付款方式、顧客。
import React from 'react'
import { fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import OrderCreate from '../OrderCreate'

const isMain = expect.getState().testPath === __filename

export const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
export const HELPER = { userId: 'helper-1', userName: '李助理', userNickName: null, userNo: '02' }

// isLocked：'FALSE' 可改價、'TRUE'／'UNSET' 鎖價；isBindedThirdPartTicketLocked：服務綁定的第三方卡券是否鎖定
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
export const SERVICE_LOCKED = {
  id: 'service-2',
  no: 'S02',
  name: '設計染髮',
  price: 2000,
  isLocked: 'TRUE',
  isNoCash: false,
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'TRUE',
}
export const SERVICE_UNSET = {
  id: 'service-3',
  no: 'S03',
  name: '頭皮護理',
  price: 1200,
  isLocked: 'UNSET',
  isNoCash: true,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: 'UNSET',
}
export const SERVICES = [SERVICE, SERVICE_LOCKED, SERVICE_UNSET]

export const PRODUCT = { id: 'product-1', no: 'P01', name: '洗髮精', isUsing: true, sellPrice: 450, isLocked: 'FALSE' }
export const PRODUCT_LOCKED = { id: 'product-2', no: 'P02', name: '護髮油', isUsing: true, sellPrice: 600, isLocked: 'TRUE' }

export const TICKET = {
  id: 'ticket-1',
  no: 'T01',
  name: '剪髮十次卡',
  price: 7000,
  ticketAvailableCount: 10,
  isLocked: 'FALSE',
  remark: '',
  ServiceCategory: { name: '剪髮' },
}
export const TICKET_LOCKED = {
  id: 'ticket-2',
  no: 'T02',
  name: '護髮五次卡',
  price: 5000,
  ticketAvailableCount: 5,
  isLocked: 'TRUE',
  remark: '限本店',
  ServiceCategory: { name: '護髮' },
}

export const MEMBERSHIP = { uuid: 'm-1', no: 'M01', name: '金卡', sellPrice: 3000, effecitveDay: 365, isLocked: 'FALSE' }
export const MEMBERSHIP_FOREVER = { uuid: 'm-2', no: 'M02', name: '永久卡', sellPrice: 9000, effecitveDay: 0, isLocked: 'TRUE' }

export const THIRD_PARTY = [
  { id: 'tp-1', name: '團購券', fee: 10, type: 'PERCENT' },
  { id: 'tp-2', name: '禮券', fee: 100, type: 'CASH' },
]

export const CUSTOMER = { id: 'customer-1', name: '陳小姐', cellphone: '0912345678', no: 'C01' }
export const CUSTOMER_DETAIL = {
  ...CUSTOMER,
  gender: 'FEMALE',
  email: 'chen@example.com',
  lineId: 'chenline',
  nickName: '小陳',
  birthday: { year: '80', month: '1', day: '2' },
  category: 'VIP',
  address: '台北市',
  remark: null,
  preferDesigner: { id: DESIGNER.userId, name: DESIGNER.userName },
  latestDesigner: null,
  source: null,
  membershipPurchaseRecord: [],
  isUnwelcome: false,
  isLineBinded: false,
}

const authorities = (addition = true, deduction = false) => ({
  getMerchantAuthorities: [
    {
      id: 'auth-1',
      authorityName: '店長',
      authoritySettings: JSON.stringify([
        {
          pageTitle: '客戶管理',
          pageAuthority: [
            { pageName: '入金(儲值)', authority: addition },
            { pageName: '入金(扣除)', authority: deduction },
          ],
        },
      ]),
    },
  ],
})
export { authorities }

export const pageFixtures = (overrides = {}) => ({
  // 打帳單設定
  GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'DESIGNATE' },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_IS_CUS_WALLET_USAGE_FOR_ORDER: { getParameterOrderCreateSetting: { isCusWalletUsageForOrder: true } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  GET_LAST_ORDER_STATUS: { getLatestOrderStatus: { orderNo: 'A001', isDesignate: true } },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  SET_UPDATE_USER_ORDERABLE_LIST: { updateUserOrderableList: true },
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: 'A4' },
  GET_ORDER_WITHOUT_CUSTOMER_SETTING: { orderWithoutCustomerDefault: true },
  GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE: { getIsAutoSetPreferDesignerForOrderCreate: false },
  GET_IS_LOCK_DATE: { getIsDateLock: false },
  GET_IS_LOCK_DATE_DISPLAY: { getIsDateLockDisplay: false },
  GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER: { getIsAbleToChangeDateTimeInOrderCreate: false },
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: false },
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  PRODUCT_CATEGORIES: { productCategories: [{ id: 'pc-1', name: '洗護' }] },
  // 人員與品項
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER] },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: SERVICES.length, pageOffset: 0, pageLimit: 50, data: SERVICES } },
  ServiceCategories: { serviceCategories: [{ id: 'cat-1', name: '剪髮' }] },
  service: { service: { helperDeductionSetting: [] } },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT, PRODUCT_LOCKED] } },
  // 店販「從清單選擇」彈窗的商品清單（hooks/useFetchProducts 的查詢沒有名稱，模擬 link 以 'undefined' 為鍵）
  undefined: {
    products: {
      totalCount: 2,
      pageLimit: 50,
      pageOffset: 0,
      data: [PRODUCT, PRODUCT_LOCKED].map(p => ({ ...p, isAvailableForSale: true, productCategory: { id: 'pc-1', name: '洗護' } })),
    },
  },
  GET_TICKETS: { tickets: [TICKET, TICKET_LOCKED] },
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP, MEMBERSHIP_FOREVER] } },
  FETCH_MEMBERSHIPS_FOR_MODAL: {
    memberships: {
      pageLimit: 50,
      pageOffset: 0,
      data: [MEMBERSHIP, MEMBERSHIP_FOREVER].map(m => ({ ...m, membershipCategory: { id: 'mc-1', uuid: 'mc-1', name: '會員' } })),
    },
  },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', no: '1', name: '會員', isUsing: true }] },
  FETCH_THIRDPARTYS: { merchant: { id: 'merchant-1', thirdpartyCoupons: THIRD_PARTY } },
  FETCH_THIRDPARTYS_FOR_CREATE_ORDER: { merchant: { thirdpartyCoupons: THIRD_PARTY } },
  merchantPayWays: { merchantPayWays: [{ id: 'pay-1', type: 'OTHER', name: 'LINE Pay', fee: 0 }] },
  GetTicket: { ticketRecords: { data: [], totalCount: 0, pageLimit: 50, pageOffset: 0 } },
  // 顧客
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER] } },
  FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? CUSTOMER_DETAIL : null }),
  customerWallet: { customerWallet: 1500 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 30 }, { bonus: -10 }] },
  GET_TICKET_RECORDS_FOR_ORDERS_V2: { ticketRecordsForOrderV2: [] },
  GET_TICKET_RECORDS_FOR_ORDERS: { ticketRecordsForOrder: [] },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: authorities(),
  // 送出
  FETCH_CREATE_ORDER: { createOrder2: 'A1024' },
  // 明細與收據
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: v => ({ customer: v.id ? { id: CUSTOMER.id, name: CUSTOMER.name } : null }),
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: SERVICES.map(({ id, name }) => ({ id, name })) } },
  FETCH_THIRDPARTYS_IN_ORDER_DETAIL: { merchant: { thirdpartyCoupons: THIRD_PARTY.map(({ id, name }) => ({ id, name })) } },
  GET_PRODUCTS_IN_ORDER_DETAIL: { products: { data: [PRODUCT, PRODUCT_LOCKED].map(({ id, name }) => ({ id, name })) } },
  GET_TICKETS_IN_ORDER_DETAIL: { tickets: [TICKET, TICKET_LOCKED].map(({ id, name }) => ({ id, name })) },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'BOTH' },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: 'https://example.com', imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
  ...overrides,
})

export const setupPage = (overrides, options) =>
  renderPage(<OrderCreate />, { fixtures: pageFixtures(overrides), route: '/order/create', ...options })

// 依按鈕名稱（aria-label 或文字）找按鈕。為什麼不用 getByRole：打帳單 DOM 很大，role 查詢每次都要算整頁的無障礙樹，
// 一次就要 0.3～2 秒，整頁流程測試會慢十倍；這裡直接比對 button 元素
const accessibleName = el => (el.getAttribute('aria-label') || el.textContent).trim()
export const buttonsIn = (container, name) =>
  [...container.querySelectorAll('button')].filter(b => (name instanceof RegExp ? name.test(accessibleName(b)) : accessibleName(b) === name))
export const buttons = name => buttonsIn(document.body, name)
export const queryButton = (name, container = document.body) => {
  const list = buttonsIn(container, name)
  if (list.length > 1) throw new Error(`找到 ${list.length} 個「${name}」按鈕`)
  return list[0] || null
}
export const button = (name, container = document.body) => {
  const found = queryButton(name, container)
  if (!found) throw new Error(`找不到「${name}」按鈕`)
  return found
}
export const findButton = async (name, container) => {
  let found
  await wait(() => {
    found = button(name, container)
  })
  return found
}
export const currentDialog = () => document.querySelector('[role="dialog"]')
export const findDialog = async () => {
  let found
  await wait(() => {
    found = currentDialog()
    if (!found) throw new Error('沒有開啟的對話框')
  })
  return found
}

// 頁首的「結帳」（明細彈窗內另有一個）
export const checkoutButton = () => buttons('結帳')[0]
// 金額彙總卡的數值（彙總列是「標籤 span＋數值 span」；同名的區塊標題不是 span，略過）
export const summaryValue = label => screen.getAllByText(label).find(el => el.tagName === 'SPAN' && el.nextSibling).nextSibling
// 標籤在上方（ui/input 的 Field）、沒有 for 關聯的輸入框
export const fieldInput = label => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('input')
export const sentOrder = (calls, nth = 0) => callsOf(calls, 'FETCH_CREATE_ORDER')[nth].variables.input

// 從某個人員欄位選人（不指定就用頁首的服務人員）
export const pickEmployee = async (input, person = DESIGNER) => {
  const field = input || screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
  fireEvent.change(field, { target: { value: person.userName.slice(0, 1) } })
  fireEvent.click(await screen.findByTestId(`employee-${person.userName}`))
}

// 第 row 列服務選某個服務
export const pickService = async (service = SERVICE, row = 0) => {
  const field = screen.getAllByPlaceholderText('服務名稱/代號')[row]
  fireEvent.change(field, { target: { value: service.name.slice(0, 2) } })
  fireEvent.click(await screen.findByTestId(service.no))
}

export const waitPageReady = async () => {
  await screen.findByText(/#A001/)
  // 設定（指定方式）載入後才可操作
  await wait(() => expect(button('指定')).not.toBeDisabled())
}

// 搜尋並選定既有顧客（顧客搜尋有 800ms 防抖）
export const pickCustomer = async calls => {
  fireEvent.change(screen.getByPlaceholderText('顧客姓名/手機號碼/編號'), { target: { value: '0912' } })
  fireEvent.click(await screen.findByText('陳小姐/0912345678/C01', {}, { timeout: 3000 }))
  await wait(() => expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(true))
}

if (isMain) {
  jest.setTimeout(20000)
  it('載入打帳單時每支查詢都有模擬回應（其他測試不靠自動補的空資料剛好通過）', async () => {
    loginAs()
    const fixtures = pageFixtures()
    const { calls, settle } = setupPage()
    await waitPageReady()
    await settle()
    const missing = [...new Set(calls.map(c => c.operationName))].filter(name => !Object.prototype.hasOwnProperty.call(fixtures, name))
    expect(missing).toEqual([])
  })
}
