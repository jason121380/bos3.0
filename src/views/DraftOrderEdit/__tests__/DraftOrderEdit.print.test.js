// 保護「掛單詳細」的列印收據：櫃台按「列印」交給顧客的收據，內容必須是這張掛單——帳單編號、設計師、顧客、
// 每個服務（含助理編號）、店販數量與小計、合計與付現金額；A4 用 #printMain、感熱紙用 #printThermal，依店家的列印格式設定。
// 2026/10/21 起列印資料由 useDraftPrint 提供、送出與金額由 useDraftCheckout 提供（自 Footer.js 原樣搬出），列印範本仍在 Footer.js；
// 這裡確保拆檔後收據內容與格式不變。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單；列印視窗以假物件攔截。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import DraftOrderEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
const HELPER = { userId: 'helper-1', userName: '李助理', userNickName: 'Lee', userNo: '02' }
const SERVICE = { id: 'service-1', no: 'S01', name: '精緻剪髮', price: 800, isLocked: false, isNoCash: false, bindedThirdPartTicket: null, isBindedThirdPartTicketLocked: false }
const PRODUCT = { id: 'product-1', no: 'P01', name: '洗髮精', sellPrice: 1200, isLocked: false, isUsing: true, isAvailableForSale: true }

const ORDER = {
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
  remark: '',
  customer: { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' },
  designer: { id: DESIGNER.userId, name: DESIGNER.userName, designerNo: '01' },
  serviceOrders: [
    {
      id: 'so-1',
      name: SERVICE.name,
      price: 800,
      thirdPartyPayName: null,
      thirdPartyPayId: null,
      service: { id: SERVICE.id, name: SERVICE.name, no: SERVICE.no, isLocked: false, isNoCash: false, isBindedThirdPartTicketLocked: false },
      helperList: [{ id: 'h-1', type: '洗髮-A', isDesignate: true, helperDeductionType: 'FIXED', helper: { id: HELPER.userId, designerNo: '02', lastName: '李', firstName: '助理' } }],
    },
  ],
  productOrders: [
    { id: 'po-1', name: PRODUCT.name, count: 2, price: 1200, thirdPartyPayId: null, seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' }, product: { id: PRODUCT.id, no: PRODUCT.no, name: PRODUCT.name, isLocked: false } },
  ],
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
}

const fixtures = ({ layout = 'A4' } = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  FETCH_ORDER: { order: ORDER },
  FETRCH_SERVICE_ORDER: { order: ORDER },
  FETCH_PRODUCT_ORDER: { order: ORDER },
  FETCH_MEMBERSHIP_ORDER: { order: ORDER },
  FETCH_CUSTOMER_DETAIL: { customer: { ...ORDER.customer, membershipPurchaseRecord: [], isLineBinded: false } },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT] } },
  service: { service: { helperDeductionSetting: [] } },
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: false } } },
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  // 列印用：格式設定、項目名稱、顧客、設計師名稱顯示方式；收據不顯示 Logo／QR code／訊息（不必轉圖）
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: layout },
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: { customer: { name: '陳小姐' } },
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: [SERVICE] } },
  // 未命名的商品查詢（明細用與選擇窗用）回同一份商品
  undefined: { products: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [PRODUCT] } },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'BOTH' },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: 'https://example.com', imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
})

// 攔截列印視窗：記下寫入的 HTML
let written
beforeEach(() => {
  loginAs()
  written = []
  window.open = jest.fn(() => ({
    document: { write: html => written.push(html), close: () => {} },
    print: () => {},
    close: () => {},
  }))
})
afterEach(cleanup)

const setup = layout =>
  renderPage(<DraftOrderEdit match={{ params: { id: 'order-1' } }} />, {
    fixtures: fixtures({ layout }),
    route: '/draft-order/order-1',
  })

const printReceipt = async () => {
  const print = await screen.findByRole('button', { name: '列印' })
  // 收據設定（Logo／QR code／訊息）載入前列印鈕停用
  await wait(() => expect(print).not.toBeDisabled())
  // 等明細（服務名稱、助理）都帶入後再印
  await wait(() => expect(document.getElementById('printMain')).toHaveTextContent('助理:02'))
  fireEvent.click(print)
  expect(window.open).toHaveBeenCalledTimes(1)
  return written.join('')
}

describe('掛單詳細：列印收據', () => {
  it('A4：寫入 #printMain，收據有帳單編號、設計師、顧客、服務（含助理編號）、店販數量與小計、合計', async () => {
    setup('A4')
    const html = await printReceipt()
    expect(html.startsWith('<html><body onload="window.print()" style="margin: 0mm 5mm;">')).toBe(true)
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    expect(text).toContain('帳單編號：A123')
    expect(text).toContain('設計師:王小美(Amy)')
    expect(text).toContain('顧客:陳小姐')
    expect(text).toMatch(/精緻剪髮 助理:02 800x1/)
    // 店販：單價×數量的小計與數量
    expect(text).toMatch(/洗髮精 1200 2 2400/)
    expect(text).toContain('合計：3200')
    expect(text).toContain('付現金額：3200')
  })

  it('感熱紙 80mm：寫入 #printThermal，紙寬 78mm，結尾有致謝語', async () => {
    setup('感熱紙(80mm)')
    const html = await printReceipt()
    expect(html.startsWith('<html style="width: 78mm;"><style>@page {margin: 1mm; width:78mm;}</style>')).toBe(true)
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    expect(text).toContain('帳單編號：A123')
    expect(text).toMatch(/精緻剪髮 800 1 800 助理:02/)
    expect(text).toContain('謝謝惠顧,歡迎下次光臨!')
  })
})
