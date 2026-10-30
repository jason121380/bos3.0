// 保護「掛單詳細」列印收據的其餘內容與格式（A4／80mm 的基本內容見 DraftOrderEdit.print.test.js）：
// - 收據上方依店家設定顯示 Logo、QR code、訊息（任一項開啟才有這一列）；
// - 每個項目都要列出：服務（助理沒有編號時印姓名）、店販、預收卡販賣、會員卡（感熱紙）、使用預收卡；第三方卡券的項目照常列出；
// - 有顧客且有紅利時印增點／扣點／折抵，不印點數餘額（Jason 2026/10/24）；合計與付現金額與打帳單收據同一算法（billPaymentSummary）；
//   沒選設計師或不留客資時印「未選擇」；
// - 57mm 感熱紙與其他格式的紙寬；店家設定「延後關閉列印視窗」時先列印、10 秒後才關，否則 1 秒後關閉。
// 收據是交給顧客的對帳依據，少印或印錯就會有糾紛。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單；列印視窗以假物件攔截。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft,
  pageReady,
  makeOrder,
  serviceOrder,
  customerDetail,
  CUSTOMER,
  DESIGNER,
  HELPER,
  SERVICE,
  PRODUCT,
  TICKET,
  YEAR_CARD,
} from './draftPageKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

// 攔截列印視窗：記下寫入的 HTML 與 print／close
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
afterEach(() => {
  jest.useRealTimers()
  cleanup()
})

const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const printReady = async () => {
  const button = await screen.findByRole('button', { name: '列印' })
  // 收據設定（Logo／QR code／訊息）載入前列印鈕停用
  await wait(() => expect(button).not.toBeDisabled())
  return button
}
const print = async () => {
  fireEvent.click(await printReady())
  return written.join('')
}

// 沒有編號的助理：收據印姓名
const NO_NUMBER_HELPER = { userId: 'helper-2', userName: '張助理', userNickName: '', userNo: '' }
const fullOrder = () =>
  makeOrder({
    customer: CUSTOMER,
    bonusDeposit: 8,
    bonusUsed: 20,
    bonusDecount: 20,
    serviceOrders: [
      serviceOrder(SERVICE, {
        thirdPartyPayId: 'tp-1',
        helperList: [{ id: 'h-1', type: '洗髮-A', isDesignate: false, helperDeductionType: 'FIXED', helper: { id: NO_NUMBER_HELPER.userId } }],
      }),
    ],
    productOrders: [
      {
        id: 'po-1',
        name: PRODUCT.name,
        count: 2,
        price: 1200,
        thirdPartyPayId: 'tp-2',
        seller: { id: DESIGNER.userId },
        product: { id: PRODUCT.id, isLocked: 'FALSE' },
      },
    ],
    ticketOrders: [
      {
        id: 'to-1',
        price: 6000,
        count: 1,
        availableCount: 10,
        remark: '',
        service: { id: TICKET.id, isLocked: 'FALSE' },
        intoPerformanceWhileBuying: false,
      },
    ],
    membershipOrders: [
      {
        purchaseDate: null,
        validDayCount: null,
        expiryDate: null,
        price: 12000,
        thirdPartyPayId: 'tp-1',
        remark: '',
        seller: { id: DESIGNER.userId },
        membership: { uuid: YEAR_CARD.uuid, isLocked: 'FALSE', effecitveDay: 365 },
      },
    ],
    useTicketOrders: [{ id: 'record-1', name: '剪髮10次卡', price: 600, pricePerCount: 600, service: { id: TICKET.id }, helperList: [] }],
  })
const fullFixtures = (options = {}) => ({
  order: fullOrder(),
  customer: customerDetail(),
  customerBonusActive: true,
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 100 }] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER, NO_NUMBER_HELPER] },
  GetTicket: ({ input }) => ({
    ticketRecords: {
      data: [{ id: 'record-1', name: '剪髮10次卡', price: 600, remark: '', service: { id: TICKET.id, helperDeductionSetting: [] } }].filter(
        r => !input.ids || input.ids.includes(r.id)
      ),
    },
  }),
  ...options,
})

describe('掛單詳細：收據內容', () => {
  it('A4：Logo、QR code、訊息都開啟時印在上方；所有項目與紅利都印出，不印點數餘額', async () => {
    const page = setupDraft(
      fullFixtures({
        GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://example.com/logo.png' } },
        GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://example.com/line', imageUrl: 'qr' } },
        GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '感謝光臨' } },
      })
    )
    await pageReady(page)
    // Logo 與 QR code 轉成圖片後才列印
    await wait(() => expect(document.querySelectorAll('#printMain img')).toHaveLength(2))
    await wait(() => expect(document.getElementById('printMain')).toHaveTextContent('助理:張助理'))
    const html = await print()
    expect(html.startsWith('<html><body onload="window.print()" style="margin: 0mm 5mm;">')).toBe(true)
    expect(html).toContain('感謝光臨')
    const t = text(html)
    expect(t).toContain('顧客:陳小姐')
    expect(t).toMatch(/精緻剪髮 助理:張助理 800x1/)
    expect(t).toMatch(/洗髮精 1200 2 2400/)
    expect(t).toMatch(/剪髮10次卡 6000 1 6000/)
    expect(t).toMatch(/剪髮10次卡 600 1 600/)
    expect(t).toContain('增點：8')
    expect(t).toContain('扣點：20')
    expect(t).toContain('折抵：20')
    expect(t).not.toContain('點數餘額')
    expect(t).toContain('卡券金額：6000')
  })

  it('感熱紙：只開訊息時上方只有訊息（QR code 開啟但沒有圖不印）；會員卡也印出，紅利分兩行', async () => {
    const page = setupDraft(
      fullFixtures({
        layout: '感熱紙(80mm)',
        GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://example.com/line', imageUrl: null } },
        GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '週一公休' } },
      })
    )
    await pageReady(page)
    await wait(() => expect(document.getElementById('printThermal')).toHaveTextContent('年卡'))
    const html = await print()
    expect(html).toContain('週一公休')
    expect(document.querySelectorAll('#printThermal img')).toHaveLength(0)
    const t = text(html)
    expect(t).toMatch(/年卡 12000 1 12000/)
    expect(t).toMatch(/剪髮10次卡 6000 1 6000/)
    expect(t).toContain('增點：8 扣點：20')
    expect(t).toContain('折抵：20')
    expect(t).not.toContain('點數餘額')
  })

  // Jason 2026/10/22「照建議」：掛單列印的合計／付現金額（含紅利點數折抵的處理）以打帳單收據為準（helper/billPaymentSummary）：
  // 合計＝應付帳款（第三方卡券支付的服務／店販／會員卡不計、預收卡販賣計入、使用預收卡不計）；
  // 付現金額＝合計 − 扣入金 − 其他付款方式 − 紅利點數折抵。原本合計印業績合計（含第三方卡券與使用預收卡、不含預收卡販賣）。
  it.each([
    ['A4', 'A4'],
    ['感熱紙', '感熱紙(80mm)'],
  ])('%s：合計與付現金額與打帳單收據同一算法（第三方卡券不計、預收卡販賣計入、扣掉紅利點數折抵）', async (_, layout) => {
    const page = setupDraft(fullFixtures({ layout }))
    await pageReady(page)
    await wait(() => expect(document.getElementById(layout === 'A4' ? 'printMain' : 'printThermal')).toHaveTextContent('洗髮精'))
    const t = text(await print())
    // 服務 800、店販 2400、會員卡 12000 都用第三方卡券 → 不計；預收卡販賣 6000 計入；使用預收卡 600 不計
    expect(t).toContain('合計：6000')
    // 6000 − 扣入金 0 − 其他付款 0 − 紅利點數折抵 20
    expect(t).toContain('付現金額：5980')
  })

  it('沒選設計師、不留客資：設計師與顧客都印「未選擇」，不印紅利', async () => {
    const page = setupDraft({
      order: makeOrder({ designer: null }),
      customerBonusActive: true,
      FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: null },
    })
    await pageReady(page)
    const t = text(await print())
    expect(t).toContain('設計師:未選擇')
    expect(t).toContain('顧客:未選擇')
    expect(t).not.toContain('增點')
  })

  it('沒有服務的掛單：收據不列服務', async () => {
    const page = setupDraft({
      order: makeOrder({
        serviceOrders: [],
        productOrders: [
          {
            id: 'po-1',
            name: PRODUCT.name,
            count: 1,
            price: 1200,
            thirdPartyPayId: null,
            seller: { id: DESIGNER.userId },
            product: { id: PRODUCT.id, isLocked: 'FALSE' },
          },
        ],
      }),
    })
    await pageReady(page)
    await wait(() => expect(document.getElementById('printMain')).toHaveTextContent('洗髮精'))
    const t = text(await print())
    expect(t).not.toContain('精緻剪髮')
    expect(t).toContain('合計：1200')
  })
})

describe('掛單詳細：列印格式與列印視窗', () => {
  it('感熱紙 57mm：紙寬 56mm；只開 Logo 時上方只有 Logo、沒有訊息', async () => {
    await pageReady(
      setupDraft({
        layout: '感熱紙(57mm)',
        GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://example.com/logo.png' } },
      })
    )
    await wait(() => expect(document.querySelectorAll('#printThermal img')).toHaveLength(1))
    const html = await print()
    expect(html.startsWith('<html style="width: 56mm;"><style>@page {margin: 1mm; width:56mm;}</style>')).toBe(true)
    expect(document.querySelector('#printThermal textarea')).toHaveValue('')
  })

  it('其他格式：不限紙寬，用感熱紙版面', async () => {
    await pageReady(setupDraft({ layout: '其他' }))
    const html = await print()
    expect(html.startsWith('<html><style>@page {margin: 1mm;}</style><body onload="window.print()">')).toBe(true)
    expect(html).toContain('謝謝惠顧,歡迎下次光臨!')
  })

  it('一般：寫入後 1 秒關閉列印視窗', async () => {
    await pageReady(setupDraft())
    const button = await printReady()
    jest.useFakeTimers()
    fireEvent.click(button)
    expect(printWindow.document.close).toHaveBeenCalled()
    expect(printWindow.close).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(printWindow.close).toHaveBeenCalled()
  })

  it('店家設定延後關閉：0.1 秒後列印、10 秒後才關閉', async () => {
    await pageReady(setupDraft({ closureDelayed: true }))
    const button = await printReady()
    jest.useFakeTimers()
    fireEvent.click(button)
    expect(printWindow.document.close).not.toHaveBeenCalled()
    jest.advanceTimersByTime(100)
    expect(printWindow.print).toHaveBeenCalled()
    jest.advanceTimersByTime(9800)
    expect(printWindow.close).not.toHaveBeenCalled()
    jest.advanceTimersByTime(100)
    expect(printWindow.close).toHaveBeenCalled()
  })
})
