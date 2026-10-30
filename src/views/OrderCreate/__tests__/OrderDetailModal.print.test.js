// 保護打帳單「消費明細」彈窗的「結帳並列印」：按一次只成立一張帳單，成立後才印收據，收據上的帳單編號是後端回傳的這張帳單，
// 內容（設計師、服務、合計、付現金額）與畫面明細一致；成立失敗時不列印、按鈕恢復可再按。列印格式依店家設定（A4／感熱紙）。
// 2026/10/21 起彈窗的資料、送出與列印分別在 useOrderDetailItems／useOrderDetailCheckout（自 OrderDetailModal.js 原樣搬出），
// 列印範本仍在 OrderDetailModal.js；這裡確保拆檔後流程與收據不變。GraphQL 全由模擬 link 回應，不建立真實帳單；列印視窗以假物件攔截。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import OrderCreate from '../OrderCreate'

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

const fixtures = ({ layout = 'A4', ...overrides } = {}) => ({
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
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_ORDER_WITHOUT_CUSTOMER_SETTING: { orderWithoutCustomerDefault: true },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  service: { service: { helperDeductionSetting: [] } },
  FETCH_CREATE_ORDER: { createOrder2: 'A1024' },
  // 明細與收據
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: layout },
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: { customer: null },
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: [SERVICE] } },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'BOTH' },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: 'https://example.com', imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
  ...overrides,
})

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

const setup = options => renderPage(<OrderCreate />, { fixtures: fixtures(options), route: '/order/create' })

// 服務人員 → 不留客資 → 服務，開「明細」
const openDetail = async () => {
  await screen.findByText(/#A001/)
  const designer = screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
  fireEvent.change(designer, { target: { value: '王' } })
  fireEvent.click(await screen.findByTestId('employee-王小美'))
  fireEvent.click(await screen.findByLabelText('不留客資'))
  fireEvent.change(screen.getByPlaceholderText('服務名稱/代號'), { target: { value: '剪' } })
  fireEvent.click(await screen.findByTestId('S01'))
  const detail = screen.getByRole('button', { name: '明細' })
  await wait(() => expect(detail).not.toBeDisabled())
  fireEvent.click(detail)
  const title = await screen.findByText('消費明細')
  return within(title.closest('[role="dialog"]') || document.body)
}

describe('打帳單 消費明細：結帳並列印', () => {
  it('Esc 與點背景維持明細開啟，返回按鈕仍可關閉', async () => {
    setup()
    const modal = await openDetail()
    const title = screen.getByRole('heading', { name: '消費明細' })
    const root = title.closest('[role="dialog"]')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(title).toBeInTheDocument()
    fireEvent.pointerDown(root.previousElementSibling)
    fireEvent.click(root.previousElementSibling)
    expect(title).toBeInTheDocument()
    const back = modal.getByRole('button', { name: '返回' })
    expect(back).toBeEnabled()
    fireEvent.click(back)
    await wait(() => expect(title).not.toBeInTheDocument())
  })

  it('A4：只成立一張帳單，成立後以後端回傳的帳單編號列印 #printMain 收據', async () => {
    const { calls } = setup()
    const modal = await openDetail()
    // 畫面明細：服務與金額
    expect(modal.getAllByText('精緻剪髮')[0]).toBeInTheDocument()
    fireEvent.click(modal.getByRole('button', { name: '結帳並列印' }))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 800 }),
    ])
    const html = written.join('')
    expect(html.startsWith('<html><body onload="window.print()" style="margin: 0mm 5mm;">')).toBe(true)
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    expect(text).toContain('帳單編號：A1024')
    expect(text).toContain('設計師:王小美(Amy)')
    expect(text).toContain('顧客：未選擇')
    expect(text).toMatch(/精緻剪髮 800x1/)
    expect(text).toContain('合計：800')
    expect(text).toContain('付現金額：800')
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '帳單新增成功', variant: 'success' }))
  })

  it('感熱紙 57mm：列印 #printThermal，紙寬 56mm', async () => {
    setup({ layout: '感熱紙(57mm)' })
    const modal = await openDetail()
    fireEvent.click(modal.getByRole('button', { name: '結帳並列印' }))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const html = written.join('')
    expect(html.startsWith('<html><style>@page {margin: 1mm; width:56mm;}</style><body onload="window.print()" style="width:56mm">')).toBe(true)
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    expect(text).toMatch(/精緻剪髮 800 1 800/)
    expect(text).toContain('付現金額：800')
  })

  it('成立失敗：不開列印視窗、提示錯誤，按鈕恢復可再按', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: new Error('庫存不足') })
    const modal = await openDetail()
    const button = modal.getByRole('button', { name: '結帳並列印' })
    fireEvent.click(button)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('庫存不足') }))
    )
    expect(window.open).not.toHaveBeenCalled()
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    await wait(() => expect(button).not.toBeDisabled())
  })
})
