// 保護打帳單「消費明細」彈窗：畫面明細與收據（A4／感熱紙 80mm／57mm／其他格式）列出每一項消費、助理、第三方卡券、
// 其他付款、扣入金、紅利點數，金額與帳單一致；收據依店家設定印出 Logo／QR code／訊息；
// 從明細結帳／結帳並列印／掛單與快捷鍵（F9 結帳、F8 結帳並列印）只成立一張帳單，連續打單時成立後清空帳單留在本頁；
// 店販／會員卡缺欄位時在明細內也擋下；店家關閉掛單時明細不顯示掛單；送出失敗提示錯誤、按鈕恢復。
// GraphQL 全由模擬 link 回應，不建立真實帳單；列印視窗以假物件攔截（斷言寫入的 HTML）。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import {
  setupPage, waitPageReady, pickEmployee, pickService, pickCustomer, checkoutButton, sentOrder, fieldInput,
  DESIGNER, HELPER, PRODUCT, TICKET, MEMBERSHIP, button, buttons, queryButton, findButton,
} from './orderCreateKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

let written
let printWindow
beforeEach(() => {
  loginAs()
  written = []
  printWindow = {
    document: { write: html => written.push(html), close: jest.fn() },
    print: jest.fn(),
    close: jest.fn(),
  }
  window.open = jest.fn(() => printWindow)
})
afterEach(cleanup)

// 沒有編號的助理：收據印姓名
const HELPER_NO_NUMBER = { userId: 'helper-2', userName: '張學徒', userNickName: null, userNo: '' }
const RECORDS = [
  {
    ticketName: '護髮五次卡', remark: '', price: 1000,
    ticketRecordForOrder: [{ id: 'tr-3', no: '3', name: '護髮五次卡', price: 1000, remark: '', helperSetting: [] }],
  },
]
const richFixtures = (overrides = {}) => ({
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER, HELPER_NO_NUMBER] },
  service: {
    service: { helperDeductionSetting: [{ type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'PERCENT' }] },
  },
  GET_TICKET_RECORDS_FOR_ORDERS_V2: { ticketRecordsForOrderV2: RECORDS },
  GET_TICKET_RECORDS_FOR_ORDERS: { ticketRecordsForOrder: [{ id: 'tr-3', name: '護髮五次卡', price: 1000, remark: '' }] },
  GetTicket: v => ({ ticketRecords: { data: (v.input.ids || []).map(id => ({ id, price: 1000 })) } }),
  ...overrides,
})

const designerInputs = () => screen.getAllByPlaceholderText('服務人員姓名/編號')
const thirdParty = (index, name) => async () => {
  const input = screen.getAllByPlaceholderText('第三方卡券')[index]
  fireEvent.click(input)
  fireEvent.click(await screen.findByTestId(name))
}
// 掛單前的確認對話框（openSnackbar 的 orderPending 參數）；不用「最後一次提示」，避免上一個測試晚到的提示混進來
const pendingConfirm = () => [...openSnackbar.mock.calls].reverse().find(([arg]) => arg.orderPending)[0]
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

// 一張什麼都有的帳單：顧客、服務（兩位助理＋團購券）、店販（禮券）、預收卡販賣、使用預收卡、會員卡（團購券）、
// LINE Pay 100、扣入金 200、紅利給點 5／扣點 10／折抵 50
const fillRichBill = async calls => {
  await waitPageReady()
  await pickCustomer(calls)
  await pickEmployee()
  await pickService()
  await pickEmployee(await screen.findByPlaceholderText('助理-洗髮'), HELPER)
  await pickEmployee(screen.getByPlaceholderText('助理-吹整'), HELPER_NO_NUMBER)
  await thirdParty(0, '團購券')()

  fireEvent.click(screen.getByTestId('merchantSell'))
  await pickEmployee(designerInputs()[1], HELPER)
  fireEvent.change(screen.getByPlaceholderText('商品代號/名稱'), { target: { value: '洗' } })
  fireEvent.click(await screen.findByTestId(`undefined-${PRODUCT.name}`))
  await thirdParty(1, '禮券')()

  fireEvent.click(screen.getByTestId('couponSells'))
  fireEvent.change(screen.getByPlaceholderText('卡券名稱/代號'), { target: { value: '剪髮' } })
  fireEvent.click(await screen.findByTestId(`undefined-${TICKET.name}`))

  fireEvent.click(screen.getByTestId('panelCouponUse'))
  fireEvent.click(screen.getByPlaceholderText('卡券代號/名稱'))
  fireEvent.click(await screen.findByTestId('-護髮五次卡'))

  fireEvent.click(screen.getByTestId('memberShipCardSells'))
  await pickEmployee(designerInputs()[2], HELPER)
  fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '金' } })
  fireEvent.click(await screen.findByTestId(`undefined-${MEMBERSHIP.name}`))
  await thirdParty(2, '團購券')()

  fireEvent.click(screen.getByPlaceholderText('選擇付款方式'))
  fireEvent.click(await screen.findByTestId('-LINE Pay'))
  fireEvent.change(await screen.findByTestId('LINE Pay金額'), { target: { value: '100' } })
  await wait(() => expect(screen.getByTestId('LINE Pay金額')).toHaveValue('100'))
  const wallet = document.querySelector('input[name="walletPay"]')
  fireEvent.change(wallet, { target: { value: '200' } })
  await wait(() => expect(wallet).toHaveValue('200'))

  await screen.findByText('剩餘點數: 20')
  fireEvent.change(fieldInput('點數給點'), { target: { value: '5' } })
  fireEvent.change(fieldInput('點數扣點'), { target: { value: '10' } })
  fireEvent.change(fieldInput('點數折抵金額'), { target: { value: '50' } })
  await wait(() => expect(fieldInput('點數折抵金額')).toHaveValue('50'))
}

const openDetail = async () => {
  fireEvent.click(button('明細'))
  await findButton('結帳並列印')
  return within(document.getElementById('DivIdToPrint'))
}

describe('消費明細：完整帳單', () => {
  it('畫面明細與 A4 收據列出每一項消費、助理、第三方卡券與付款；結帳並列印成立後印出帳單編號', async () => {
    const { calls } = setupPage(richFixtures())
    await fillRichBill(calls)
    const modal = await openDetail()

    // 畫面明細
    expect(modal.getByText('指定')).toBeInTheDocument()
    expect(modal.getByText(/顧客:陳小姐/)).toBeInTheDocument()
    expect(modal.getByText('精緻剪髮')).toBeInTheDocument()
    expect(modal.getAllByText('團購券').length).toBeGreaterThanOrEqual(1)
    expect(modal.getByText(`${PRODUCT.name}*1`)).toBeInTheDocument()
    expect(modal.getByText('禮券')).toBeInTheDocument()
    expect(modal.getByText(`${TICKET.name}含(${TICKET.ticketAvailableCount})次*1`)).toBeInTheDocument()
    expect(modal.getByText('護髮五次卡')).toBeInTheDocument()
    expect(modal.getByText(MEMBERSHIP.name)).toBeInTheDocument()
    expect(modal.getByText('LINE Pay').nextSibling).toHaveTextContent('100')
    expect(modal.getByText('扣入金').nextSibling).toHaveTextContent('200')
    // 應付：服務、店販、會員卡都用第三方卡券（不收現）→ 只有預收卡 7000
    expect(modal.getByText('應付帳款').parentElement).toHaveTextContent('7000')
    // 現金應收 = 7000 − 扣入金 200 − LINE Pay 100 − 折抵 50
    expect(modal.getByText('現金應收').parentElement).toHaveTextContent('6,650')

    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const input = sentOrder(calls)
    expect(input.useTicketOrders).toEqual([{ customerTicketId: 'tr-3', useTicketOrderHelpers: [] }])
    const receipt = text(written.join(''))
    expect(receipt).toContain('帳單編號：A1024')
    expect(receipt).toContain('顧客：陳小姐')
    // 助理：有編號印編號、沒編號印姓名
    expect(receipt).toContain('助理:02')
    expect(receipt).toContain('助理:張學徒')
    expect(receipt).toMatch(/洗髮精 450x1/)
    expect(receipt).toContain(`${TICKET.name}含(${TICKET.ticketAvailableCount})次 7000`)
    expect(receipt).toContain('護髮五次卡 1000')
    expect(receipt).toContain(`${MEMBERSHIP.name} 3000`)
    expect(receipt).toContain('扣入金：200')
    expect(receipt).toContain('入金餘額：1300')
    // 點數餘額 = 20 + 5 − 10
    expect(receipt).toContain('增點：5')
    expect(receipt).toContain('點數餘額：15')
    expect(receipt).toContain('卡券金額：7000')
    expect(receipt).toContain('付現金額：6650')
    expect(printWindow.document.close).toHaveBeenCalled()
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('感熱紙 80mm：收據表格列出每一項與助理', async () => {
    const { calls } = setupPage(richFixtures({ GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: '感熱紙(80mm)' } }))
    await fillRichBill(calls)
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const html = written.join('')
    expect(html.startsWith('<html><style>@page {margin: 1mm; width:78mm;}</style>')).toBe(true)
    const receipt = text(html)
    expect(receipt).toContain('帳單編號：A1024')
    expect(receipt).toContain('精緻剪髮 800 1 800')
    expect(receipt).toContain('助理:02')
    expect(receipt).toContain('洗髮精 450 1 450')
    expect(receipt).toContain(`${TICKET.name}含(${TICKET.ticketAvailableCount})次 7000 1 7000`)
    expect(receipt).toContain('護髮五次卡 1000 1 1000')
    expect(receipt).toContain(`${MEMBERSHIP.name} 3000 3000`)
    expect(receipt).toContain('折抵：50')
    expect(receipt).toContain('謝謝惠顧')
  })
})

describe('消費明細：收據格式與裝飾', () => {
  const simple = async (overrides, { customer = false } = {}) => {
    const page = setupPage(overrides)
    await waitPageReady()
    if (customer) await pickCustomer(page.calls)
    await pickEmployee()
    if (!customer) fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    return page
  }

  it('其他紙張格式：以不限寬度的感熱紙格式列印；店家設定延遲關閉列印視窗時先列印再關閉', async () => {
    await simple({
      GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: '其他' },
      GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: true } },
    })
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(written.join('').startsWith('<html><style>@page {margin: 1mm;}</style><body onload="window.print()">')).toBe(true)
    await wait(() => expect(printWindow.print).toHaveBeenCalled())
    expect(printWindow.document.close).not.toHaveBeenCalled()
  })

  it('收據顯示 Logo、QR code 與訊息（A4 與感熱紙相同）', async () => {
    await simple({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://example.com/logo.png' } },
      GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://example.com', imageUrl: 'https://example.com/qr.png' } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '歡迎再度光臨' } },
    })
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const html = written.join('')
    expect(html).toContain('歡迎再度光臨')
    expect((html.match(/<img /g) || []).length).toBe(2)
  })

  it('只顯示訊息（沒有 Logo、QR code）：收據只有訊息', async () => {
    await simple({
      GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: '感熱紙(57mm)' },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '週一公休' } },
    })
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const html = written.join('')
    expect(html).toContain('週一公休')
    expect(html).not.toContain('<img ')
  })

  it('不指定、沒有其他付款：明細顯示「不指定」與「無」', async () => {
    await simple({ GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'NONDESIGNATE' } })
    const modal = await openDetail()
    expect(modal.getByText('不指定')).toBeInTheDocument()
    expect(modal.getByText('無')).toBeInTheDocument()
  })
})

describe('消費明細：送出', () => {
  const prepare = async (overrides, options) => {
    const page = setupPage(overrides, options)
    await waitPageReady()
    await pickEmployee()
    // 「不留客資」記在本機：同一測試第二次進入時已勾選
    if (!screen.getByLabelText('不留客資').checked) fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    return page
  }

  it('連續打單：明細內結帳成功後關閉明細、清空帳單留在本頁', async () => {
    localStorage.setItem('stayInCreateOrder', true)
    const { calls } = await prepare()
    await openDetail()
    fireEvent.click(buttons('結帳').slice(-1)[0])
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(queryButton('結帳並列印')).toBeNull())
    await wait(() => expect(designerInputs()[0]).toHaveValue(''))
    expect(currentLocation()).toBe('/order/create')
  })

  it('一般模式：明細內結帳成功後導到帳單列表；失敗時提示錯誤', async () => {
    const { calls } = await prepare()
    await openDetail()
    fireEvent.click(buttons('結帳').slice(-1)[0])
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
    cleanup()

    const { calls: calls2 } = await prepare({ FETCH_CREATE_ORDER: new Error('庫存不足') })
    await openDetail()
    const inDetail = buttons('結帳')
    fireEvent.click(inDetail[inDetail.length - 1])
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('庫存不足') })))
    expect(callsOf(calls2, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    // 失敗後按鈕恢復，可直接再按（不必返回重開明細）
    await wait(() => expect(buttons('結帳').slice(-1)[0]).not.toBeDisabled())
    expect(button('結帳並列印')).not.toBeDisabled()
    fireEvent.click(buttons('結帳').slice(-1)[0])
    await wait(() => expect(callsOf(calls2, 'FETCH_CREATE_ORDER')).toHaveLength(2))
  })

  it('連續打單：結帳並列印成功後列印、0.5 秒後關閉明細並清空帳單', async () => {
    localStorage.setItem('stayInCreateOrder', true)
    const { calls } = await prepare()
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    await wait(() => expect(queryButton('結帳並列印')).toBeNull())
    await wait(() => expect(designerInputs()[0]).toHaveValue(''))
  })

  it('快捷鍵：F9 結帳（只送一次）', async () => {
    const { calls } = await prepare()
    await openDetail()
    fireEvent.keyDown(document, { code: 'F9' })
    fireEvent.keyDown(document, { code: 'F9' })
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('快捷鍵：F8 結帳並列印；其他按鍵不動作', async () => {
    const { calls } = await prepare()
    await openDetail()
    fireEvent.keyDown(document, { code: 'KeyA' })
    fireEvent.keyDown(document, { code: 'F8' })
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
  })

  it('明細內掛單：確認後以 isPending 送出並導到掛單列表', async () => {
    const { calls } = await prepare()
    await openDetail()
    const pending = buttons('掛單')
    fireEvent.click(pending[pending.length - 1])
    expect(pendingConfirm()).toEqual(expect.objectContaining({ orderPending: true }))
    act(() => pendingConfirm().usehandleCreateDraftOrder())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isPending).toBe(true)
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
  })

  it('連續打單時明細內掛單：成功後重新載入頁面；失敗提示錯誤', async () => {
    localStorage.setItem('stayInCreateOrder', true)
    const { location } = window
    delete window.location
    window.location = { ...location, reload: jest.fn() }
    try {
      await prepare()
      await openDetail()
      let pending = buttons('掛單')
      fireEvent.click(pending[pending.length - 1])
      act(() => pendingConfirm().usehandleCreateDraftOrder())
      await wait(() => expect(window.location.reload).toHaveBeenCalled())
      cleanup()

      await prepare({ FETCH_CREATE_ORDER: new Error('網路暫斷') })
      await openDetail()
      pending = buttons('掛單')
      fireEvent.click(pending[pending.length - 1])
      act(() => pendingConfirm().usehandleCreateDraftOrder())
      await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('網路暫斷') })))
    } finally {
      window.location = location
    }
  })

  it('店家關閉掛單：明細不顯示掛單', async () => {
    await prepare({ GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: true } } })
    await openDetail()
    expect(queryButton('掛單')).toBeNull()
  })

  // 明細內被逐列檢查擋下後，「結帳」「結帳並列印」恢復可按：不必返回重開明細，就能在同一個明細內依序試三種送出
  const expectEnabled = async () => {
    await wait(() => expect(buttons('結帳').slice(-1)[0]).not.toBeDisabled())
    expect(button('結帳並列印')).not.toBeDisabled()
  }
  const submitAllWays = async count => {
    await openDetail()
    fireEvent.click(buttons('結帳').slice(-1)[0])
    await wait(() => expect(count()).toBe(1))
    await expectEnabled()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(count()).toBe(2))
    await expectEnabled()
    const pending = buttons('掛單')
    fireEvent.click(pending[pending.length - 1])
    act(() => pendingConfirm().usehandleCreateDraftOrder())
    await wait(() => expect(count()).toBe(3))
    await expectEnabled()
  }

  it('店販缺商品：明細內結帳、結帳並列印、掛單都擋下並提示', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    fireEvent.click(screen.getByTestId('merchantSell'))
    await pickEmployee(designerInputs()[1], HELPER)
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    await submitAllWays(() => openSnackbar.mock.calls.filter(([a]) => a.message === '請選擇店販商品').length)
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
    expect(window.open).not.toHaveBeenCalled()
  })

  it('店販缺服務人員、會員卡缺卡或缺服務人員：明細內三種送出都擋下並提示', async () => {
    const cases = [
      {
        message: '請選擇店販的服務人員',
        fill: async () => {
          fireEvent.click(screen.getByTestId('merchantSell'))
          fireEvent.change(screen.getByPlaceholderText('商品代號/名稱'), { target: { value: '洗' } })
          fireEvent.click(await screen.findByTestId(`undefined-${PRODUCT.name}`))
        },
      },
      {
        message: '請選擇會員卡',
        fill: async () => {
          fireEvent.click(screen.getByTestId('memberShipCardSells'))
          await pickEmployee(designerInputs()[2], HELPER)
        },
      },
      {
        message: '請選擇會員卡的服務人員',
        fill: async () => {
          fireEvent.click(screen.getByTestId('memberShipCardSells'))
          fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '金' } })
          fireEvent.click(await screen.findByTestId(`undefined-${MEMBERSHIP.name}`))
        },
      },
    ]
    for (const { message, fill } of cases) {
      openSnackbar.mockClear()
      loginAs()
      const { calls } = setupPage()
      await waitPageReady()
      await pickEmployee()
      fireEvent.click(screen.getByLabelText('不留客資'))
      await fill()
      await wait(() => expect(checkoutButton()).not.toBeDisabled())
      await submitAllWays(() => openSnackbar.mock.calls.filter(([a]) => a.message === message).length)
      expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
      cleanup()
    }
  })
})

describe('消費明細：其他', () => {
  it('結帳並列印失敗：不列印、提示錯誤、按鈕恢復', async () => {
    setupPage({ FETCH_CREATE_ORDER: new Error('庫存不足') })
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('庫存不足') })))
    expect(window.open).not.toHaveBeenCalled()
    await wait(() => expect(button('結帳並列印')).not.toBeDisabled())
  })
})

describe('消費明細：載入中與收據邊界', () => {
  const ready = async (overrides, options) => {
    const page = setupPage(overrides, options)
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    return page
  }

  it('明細資料還在載入時按 F8：不送出也不列印；快捷鍵仍有效，載入完成後再按 F8 照常結帳並列印', async () => {
    const { calls } = await ready({}, { delays: { GET_SERVICES_IN_ORDER_DETAIL: 1500 } })
    fireEvent.click(button('明細'))
    fireEvent.keyDown(document, { code: 'F8' })
    expect(window.open).not.toHaveBeenCalled()
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
    await findButton('結帳並列印')
    fireEvent.keyDown(document, { code: 'F8' })
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
  })

  it('明細資料還在載入時先按 F8 再按 F9：F9 照常結帳', async () => {
    const { calls } = await ready({}, { delays: { GET_SERVICES_IN_ORDER_DETAIL: 1500 } })
    fireEvent.click(button('明細'))
    fireEvent.keyDown(document, { code: 'F8' })
    fireEvent.keyDown(document, { code: 'F9' })
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(window.open).not.toHaveBeenCalled()
  })

  it('明細資料還在載入時按 F9、帳單被逐列檢查擋下：提示缺什麼、不送出；載入完成後按鈕可按', async () => {
    const { calls } = setupPage({}, { delays: { GET_SERVICES_IN_ORDER_DETAIL: 1500 } })
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    fireEvent.click(screen.getByTestId('merchantSell'))
    await pickEmployee(designerInputs()[1], HELPER)
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(button('明細'))
    fireEvent.keyDown(document, { code: 'F9' })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '請選擇店販商品' })))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
    await findButton('結帳並列印')
    await wait(() => expect(button('結帳並列印')).not.toBeDisabled())
  })

  it('明細資料還在載入時按 F9：等同按結帳（送出一次、不列印）', async () => {
    const { calls } = await ready({}, { delays: { GET_SERVICES_IN_ORDER_DETAIL: 1500 } })
    fireEvent.click(button('明細'))
    fireEvent.keyDown(document, { code: 'F9' })
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
    expect(window.open).not.toHaveBeenCalled()
  })

  it('只顯示 Logo（沒有訊息）：收據有 Logo、訊息欄空白；開了 QR code／訊息但沒有圖或內容時不印裝飾列', async () => {
    await ready({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://example.com/logo.png' } },
    })
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    const html = written.join('')
    expect((html.match(/<img /g) || []).length).toBe(1)
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/)
    cleanup()
    loginAs()
    written = []
    // 開了 QR code 但沒有圖、開了訊息但沒有內容：都不印
    await ready({
      GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://example.com', imageUrl: null } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '' } },
    })
    await openDetail()
    fireEvent.click(button('結帳並列印'))
    await wait(() => expect(written.length).toBeGreaterThan(0))
    expect(written.join('')).not.toContain('<textarea')
  })

  it('顧客有其他預收卡紀錄：明細只列出這張帳單使用的那一張', async () => {
    const { calls } = setupPage(richFixtures({
      GET_TICKET_RECORDS_FOR_ORDERS: {
        ticketRecordsForOrder: [
          { id: 'tr-8', name: '其他卡', price: 500, remark: '' },
          { id: 'tr-3', name: '護髮五次卡', price: 1000, remark: '' },
        ],
      },
    }))
    await waitPageReady()
    await pickCustomer(calls)
    await pickEmployee()
    fireEvent.click(screen.getByTestId('panelCouponUse'))
    fireEvent.click(screen.getByPlaceholderText('卡券代號/名稱'))
    fireEvent.click(await screen.findByTestId('-護髮五次卡'))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    const modal = await openDetail()
    expect(modal.getByText('護髮五次卡')).toBeInTheDocument()
    expect(modal.queryByText('其他卡')).toBeNull()
  })
})
