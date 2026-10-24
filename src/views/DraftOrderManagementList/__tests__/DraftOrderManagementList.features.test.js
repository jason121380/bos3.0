// 保護「掛單列表」的其餘功能（遮罩設定晚到／失敗見 DraftOrderManagementList.page.test.js）：
// - 查詢參數：預設今天整天（台灣時間）、1000 筆、不篩選（null／空陣列）；快速選擇日期保留其他條件；篩選設計師、帳單來源
// - 列表：編號與星期、顧客、設計師（姓＋名／編號）、各項金額千分位、第三方卡券名稱、其他付款方式；明細展開；查看掛單連結保留網址日期
// - 匯出：遮罩依姓名長度；設定不遮罩時完整姓名電話；會員卡／點數欄
// - 刪除：已日結的不能勾；未設密碼直接刪、設了先輸入密碼；失敗提示並清空勾選
// - 結帳：未設密碼直接以掛單內容重新結帳（isPending: false），成功導到帳單列表；設密碼時先輸入密碼並帶上；失敗提示
// - 列印：依列印格式寫入列印視窗；合計＝服務＋店販＋會員卡（皆不含第三方卡券）＋卡券販賣(不入業績)（與帳單列表一致，Jason 2026/10/22），付現再扣入金、其他付款、點數折抵
// - 店家關閉掛單功能時導回打帳單
// GraphQL 全由 testkit 的模擬 link 回應，不建立、不刪除真實帳單；列印視窗以假物件取代。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT, networkRequests } from '../../../__tests__/testkit.test'
import DraftOrderManagementList from '..'
import { serviceOrders, productOrders, membershipOrders, thirdParty, weekDisplay } from '../draftOrderListHelpers'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('qrcode', () => ({
  toDataURL: (url, cb) => (url ? cb(null, `data:qr:${url}`) : cb(new Error('沒有網址'))),
}))

const draft = (overrides = {}) => ({
  id: 'd-1',
  no: 'D001',
  date: new Date(2026, 9, 19, 11, 5).getTime(),
  isDesignate: true,
  customerLeftWallet: 0,
  serviceFakeTotal: 1300.4,
  productFakeTotal: 450,
  membershipFakeTotal: 0,
  payType2: null,
  remark: '老客人',
  ticketSellIntoPerformance: 0,
  ticketSellNotIntoPerformance: 300,
  performanceIncome: 1750,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: -350,
  otherPayWayForDecount: -100,
  amountByOtherPay: 100,
  walletUsedForDecount: -200,
  businessCash: 1500,
  customer: { id: 'c-1', name: '陳小姐', cellphone: '0912345678', no: 'C01' },
  designer: { id: 'u-1', name: '王小美', nickName: '小美', designerNo: '01', firstName: '小美', lastName: '王' },
  isCloseAccount: false,
  serviceOrders: [
    { id: 's-1', price: 1000, thirdPartyPayName: null, thirdPartyPayId: null, service: { id: 'svc-1', name: '剪髮' }, helperList: [{ helper: { id: 'h-1' }, type: '助理', isDesignate: false, helperDeductionType: 'PERCENT' }] },
    { id: 's-2', price: 300, thirdPartyPayName: '團購券', thirdPartyPayId: 'tp-1', service: { id: 'svc-2', name: '洗髮' }, helperList: [] },
  ],
  productOrders: [
    { product: { id: 'p-1' }, price: 200, count: 2, thirdPartyPayName: null, thirdPartyPayId: null, seller: { id: 'u-1' } },
    { product: { id: 'p-2' }, price: 50, count: 1, thirdPartyPayName: '團購券', thirdPartyPayId: 'tp-1', seller: { id: 'u-1' } },
  ],
  ticketOrders: [{ id: 't-1', service: { id: 'svc-3' }, price: 150, count: 2, availableCount: 5, remark: '', intoPerformanceWhileBuying: false }],
  useTicketOrders: [{ id: 'ut-1', helperList: [{ helper: { id: 'h-2' }, type: '洗髮', isDesignate: true, helperDeductiontype: 'AMOUNT' }] }],
  membershipOrders: [],
  useTicketTotal: 0,
  staticDetail: [
    { designerName: '王小美', serviceType: '項目消費', itemName: '剪髮', count: 1, price: 1000, helperList: [{ helperName: '小助', helperType: '助理', helperNo: 'H1' }, { helperName: '阿洗', helperType: '洗髮', helperNo: '' }] },
    { designerName: '王小美', serviceType: '店販銷售', itemName: '洗髮精', count: 2, price: 200, helperList: [] },
    { designerName: '王小美', serviceType: '會員卡銷售', itemName: '金卡', count: 1, price: 600, helperList: [] },
    { designerName: '王小美', serviceType: '卡券販賣(不入業績)', itemName: '護髮券', count: 2, price: 150, helperList: [] },
    { designerName: '王小美', serviceType: '卡券販賣(入業績)', itemName: '剪髮券', count: 1, price: 500, helperList: [] },
    { designerName: '王小美', serviceType: '卡券使用', itemName: '十次卡', count: 1, price: 333.339, helperList: [] },
  ],
  walletPay: 200,
  customerLeftBonus: 88,
  bonusDecountForReport: -30,
  bonusDecount: 30,
  bonusDeposit: 10,
  bonusUsed: 0,
  source: '現場',
  ...overrides,
})

const DRAFTS = [
  draft(),
  draft({
    id: 'd-2', no: 'D002', date: new Date(2026, 9, 20, 9, 0).getTime(), isDesignate: false, payType2: ['街口'],
    customer: { id: 'c-2', name: '王明', cellphone: '0922111222', no: 'C02' },
    designer: { id: 'u-2', name: '阿哲', nickName: '', designerNo: '', firstName: '哲', lastName: '阿' },
    serviceOrders: [], productOrders: [{ product: { id: 'p-3' }, price: 80, count: 1, thirdPartyPayName: '商品券', thirdPartyPayId: 'tp-2', seller: { id: 'u-2' } }],
    membershipOrders: [{ seller: { id: 'u-2' }, purchaseDate: 1, expiryDate: 2, price: 900, thirdPartyPayId: 'tp-3', thirdPartyPayName: '會員券', remark: '', membership: { uuid: 'm-1', name: '金卡' } }],
    staticDetail: [],
  }),
  draft({ id: 'd-3', no: 'D003', date: new Date(2026, 9, 21, 9, 0).getTime(), isCloseAccount: true, customer: { id: 'c-3', name: '歐陽小明', cellphone: '0933444555', no: 'C03' } }),
  draft({ id: 'd-4', no: 'D004', date: new Date(2026, 9, 22, 9, 0).getTime() }),
  draft({ id: 'd-5', no: 'D005', date: new Date(2026, 9, 23, 9, 0).getTime() }),
  draft({ id: 'd-6', no: 'D006', date: new Date(2026, 9, 24, 9, 0).getTime() }),
  draft({ id: 'd-7', no: 'D007', date: new Date(2026, 9, 25, 9, 0).getTime() }),
]

const fixtures = (extra = {}) => ({
  FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: DRAFTS.length, orders: DRAFTS } },
  GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_MERCHANT_PASSWORD_IS_USING: { merchantPassword: { deleteOrder: { isUsing: false }, reCheckoutOrder: { isUsing: false } } },
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: 'A4' },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'NAME' },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: null, imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
  DELETE_ORDER: { deleteOrder: true },
  reCheckoutOrder: { reCheckoutOrder: { id: 'd-1' } },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'u-1', userName: '王小美', userNickName: '', userNo: '01' }] },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [{ id: 'c1', name: '王小明', cellphone: '0912', no: 'A1' }] } },
  merchantPayWays: { merchantPayWays: [{ id: 'p1', type: 'onSales', name: '信用卡', fee: 2 }] },
  FETCH_THIRDPARTYS: { merchant: { id: 'm', thirdpartyCoupons: [{ id: 't1', name: '街口', fee: 1, type: 'A' }] } },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] },
  ...extra,
})
const setup = (extra = {}, options = {}) =>
  renderPage(<DraftOrderManagementList />, { fixtures: fixtures(extra), route: '/management/draft-orders', ...options })

let written
let printWindow
const originalSetTimeout = window.setTimeout
beforeEach(() => {
  loginAs()
  written = []
  printWindow = {
    document: { write: html => written.push(html), querySelector: () => ({ innerHTML: '舊內容' }), close: jest.fn() },
    print: jest.fn(),
    close: jest.fn(),
  }
  window.open = jest.fn(() => printWindow)
})
afterEach(() => {
  cleanup()
  window.setTimeout = originalSetTimeout
})

// 攔截列印視窗的延遲列印／關閉計時器（只攔回呼內操作 newWin 的），手動執行
const captureWindowTimers = () => {
  const captured = []
  window.setTimeout = (fn, ms, ...args) => {
    if (typeof fn === 'function' && /newWin\.(print|close)/.test(fn.toString())) {
      captured.push({ fn, ms })
      return 0
    }
    return originalSetTimeout.call(window, fn, ms, ...args)
  }
  return {
    run: () => {
      window.setTimeout = originalSetTimeout
      captured.forEach(({ fn }) => fn())
      return captured.map(({ ms }) => ms)
    },
  }
}

const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_PENDING_ORDERS')
  return list[list.length - 1].variables.input
}
const rowOf = no => screen.getByText(`#${no}`).closest('tr')
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const field = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (label, text) => {
  fireEvent.click(field(label))
  fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === text))
}
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)

describe('掛單列表：查詢', () => {
  it('預設查今天整天、1000 筆、不篩選；快速選擇「昨天」只改日期', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'FETCH_PENDING_ORDERS')[0].variables.input).toEqual({
      dateRange: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      designerId: null,
      customerId: null,
      otherPayWay: null,
      thirdPartTicketId: null,
      sources: [],
      pageLimit: 1000,
      pageOffset: 0,
    })
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    await wait(() =>
      expect(lastInput(calls)).toMatchObject({
        dateRange: { startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() },
        pageLimit: 1000,
        sources: [],
      })
    )
  })

  it('篩選設計師與帳單來源，送出設計師 id 與來源陣列；再按篩選收起', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    await settle()
    choose('設計師編號/姓名', '王小美-01')
    await wait(() => expect(lastInput(calls).designerId).toBe('u-1'))
    await settle()
    choose('帳單來源', '路過')
    await wait(() => expect(lastInput(calls)).toMatchObject({ designerId: 'u-1', sources: ['路過'] }))
    await settle()
    choose('其他付款方式', '信用卡')
    await wait(() => expect(lastInput(calls).otherPayWay).toBe('信用卡'))
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByText('設計師編號/姓名')).toBeNull()
  })

  it('查詢中顯示骨架', async () => {
    const { settle } = setup({}, { delays: { FETCH_PENDING_ORDERS: 300 } })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
  })

  it('沒有掛單時顯示空狀態', async () => {
    const { settle } = setup({ FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 0, orders: [] } } })
    await settle()
    expect(screen.getByText('此區間沒有掛單')).toBeInTheDocument()
    expect(screen.getByLabelText('全選')).toBeDisabled()
  })

  it('店家關閉掛單功能時提示並導回打帳單', async () => {
    const { settle } = setup({ GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: true } } })
    await settle()
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '掛單功能已關閉' })
    expect(currentLocation()).toBe('/order/create')
  })

  it('掛單查詢失敗時以空列表顯示，不整頁錯誤（Jason 2026/10/22）', async () => {
    const { settle } = setup({ FETCH_PENDING_ORDERS: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('此區間沒有掛單')).toBeInTheDocument()
  })
})

describe('掛單列表：列表與匯出', () => {
  it('列出編號／星期、顧客、設計師（姓名／編號）、金額千分位、第三方卡券與其他付款方式；查看連結與明細', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.getByText('共 7 筆')).toBeInTheDocument()
    const r1 = within(rowOf('D001'))
    expect(r1.getByText('2026/10/19/(一)')).toBeInTheDocument()
    expect(r1.getByText('王小美/01')).toBeInTheDocument()
    expect(r1.getByText('1,300')).toBeInTheDocument()
    // 服務、店販與第三方卡券欄都標示「含 團購券」（服務與商品同名只列一次）
    expect(r1.getAllByText('含 團購券')).toHaveLength(3)
    expect(r1.getByLabelText('查看掛單').getAttribute('href')).toBe('/draft-order/d-1')
    const r2 = within(rowOf('D002'))
    expect(r2.getByText('阿哲')).toBeInTheDocument()
    expect(r2.getByText('街口')).toBeInTheDocument()
    expect(r2.getByText('含 商品券')).toBeInTheDocument()
    ;['(三)', '(四)', '(五)', '(六)', '(日)', '(二)'].forEach(w => expect(screen.getAllByText(w, { exact: false }).length).toBeGreaterThan(0))
    // 明細
    fireEvent.click(r1.getByLabelText('展開明細'))
    expect(screen.getByText('剪髮(項目消費)')).toBeInTheDocument()
    expect(screen.getByText('助理[小助]')).toBeInTheDocument()
    expect(screen.getByText('333.33')).toBeInTheDocument()
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
    fireEvent.click(r1.getByLabelText('收合明細'))
    expect(screen.queryByText('剪髮(項目消費)')).toBeNull()
    fireEvent.click(screen.getByText('全部展開'))
    expect(screen.getAllByLabelText('收合明細')).toHaveLength(DRAFTS.length)
    fireEvent.click(screen.getByText('全部收合'))
    expect(screen.queryAllByLabelText('收合明細')).toHaveLength(0)
  })

  it('網址帶日期時，查看掛單連結保留日期區間', async () => {
    const start = startOfDay(new Date(2026, 9, 19)).getTime()
    const end = endOfDay(new Date(2026, 9, 19)).getTime()
    const { settle } = setup({}, { route: `/management/draft-orders?startDate=${start}&endDate=${end}` })
    await settle()
    expect(within(rowOf('D001')).getByLabelText('查看掛單').getAttribute('href')).toBe(`/draft-order/d-1?startDate=${start}&endDate=${end}`)
  })

  it('匯出遮罩姓名依長度（2 字、3 字、4 字以上）與手機；金額四捨五入', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(exportedCsv()).toContain('陳*姐 0912***678'))
    const csv = exportedCsv()
    expect(csv).toContain('"#D002","2026/10/20/(二)","王* 0922***222"')
    expect(csv).toContain('歐陽*明 0933***555')
    expect(csv).toContain('"王小美/01","Y","1500","1300","450"')
  })

  it('店家設定不遮罩時，前端 CSV 仍遮罩姓名電話', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('陳*姐 0912***678'))
    expect(exportedCsv()).not.toContain('0912345678')
  })

  it('設計師沒有編號（null）時匯出只有姓名，不帶「/null」（Jason 2026/10/22）', async () => {
    const { settle } = setup({
      FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft({ designer: { id: 'u-9', name: '小林', designerNo: null, firstName: '林', lastName: '小' } })] } },
    })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('"小林"'))
    expect(exportedCsv()).not.toContain('null')
  })

  it('未啟用會員卡、掛單也沒有會員卡金額時不顯示「會員卡販賣」欄；有會員卡金額或啟用會員卡時顯示（Jason 2026/10/22）', async () => {
    const { settle } = setup({
      FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft()] } },
    })
    await settle()
    expect(headers()).not.toContain('會員卡販賣')
    await wait(() => expect(exportedCsv()).toContain('營業現金應收'))
    expect(exportedCsv()).not.toContain('會員卡販賣')
    cleanup()
    // 有一筆掛單含會員卡金額（D002 900）
    const withMembership = setup()
    await withMembership.settle()
    expect(headers()).toContain('會員卡販賣')
    await wait(() => expect(exportedCsv()).toContain('會員卡販賣'))
    cleanup()
    const active = setup({
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
      FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft()] } },
    })
    await active.settle()
    expect(headers()).toContain('會員卡販賣')
  })

  it('有點數折抵或啟用點數時顯示點數欄；兩者皆無時不顯示', async () => {
    const { settle } = setup({ FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft({ bonusDecount: 0 })] } } })
    await settle()
    expect(headers()).not.toContain('點數折抵金額(-)')
    await wait(() => expect(exportedCsv()).toContain('營業現金應收'))
    expect(exportedCsv()).not.toContain('點數折抵金額')
    cleanup()
    const second = setup({ GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } })
    await second.settle()
    expect(headers()).toContain('點數折抵金額(-)')
    await wait(() => expect(exportedCsv()).toContain('點數折抵金額(-)'))
  })

  it('純函式：各類第三方卡券名稱以「含」串接，服務與商品同名只列一次；不認得的星期回傳 undefined', () => {
    const o = DRAFTS[0]
    expect(serviceOrders(o)).toBe('含 團購券')
    expect(productOrders({ productOrders: [{ thirdPartyPayName: 'A' }, { thirdPartyPayName: 'B' }] })).toBe('含 A, 含 B')
    expect(membershipOrders({ membershipOrders: [{ thirdPartyPayName: 'M1' }, { thirdPartyPayName: null }, { thirdPartyPayName: 'M2' }] })).toBe('含 M1, 含 M2')
    expect(serviceOrders({ serviceOrders: [{ thirdPartyPayName: 'S1' }, { thirdPartyPayName: 'S2' }] })).toBe('含 S1, 含 S2')
    expect(thirdParty({ serviceOrders: [{ thirdPartyPayName: 'A' }, { thirdPartyPayName: null }], productOrders: [{ thirdPartyPayName: 'A' }, { thirdPartyPayName: 'B' }, { thirdPartyPayName: null }] })).toBe('含 A, 含 B')
    expect(weekDisplay('x')).toBeUndefined()
  })
})

describe('掛單列表：刪除', () => {
  it('已日結的不能勾；全選、取消全選；未設密碼直接刪除，成功後清空勾選並重抓', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(within(rowOf('D003')).getByLabelText('選取 #D003')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText(`已選 ${DRAFTS.length} 筆`)).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 0 筆')).toBeInTheDocument()
    fireEvent.click(within(rowOf('D001')).getByLabelText('選取 #D001'))
    fireEvent.click(within(rowOf('D002')).getByLabelText('選取 #D002'))
    fireEvent.click(within(rowOf('D002')).getByLabelText('選取 #D002'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    const before = callsOf(calls, 'FETCH_PENDING_ORDERS').length
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '帳單刪除中', variant: 'warning' })
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['d-1'], password: '' })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除掛單成功', variant: 'success' }))
    await wait(() => expect(callsOf(calls, 'FETCH_PENDING_ORDERS').length).toBeGreaterThan(before))
  })

  it('設刪除密碼：先輸入密碼，取消不送；確認送出密碼；失敗提示並清空勾選', async () => {
    const { calls, settle } = setup({
      GET_MERCHANT_PASSWORD_IS_USING: { merchantPassword: { deleteOrder: { isUsing: true }, reCheckoutOrder: { isUsing: false } } },
      DELETE_ORDER: new Error('密碼錯誤'),
    })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('選取 #D001'))
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('刪除掛單？')).toBeInTheDocument()
    expect(dialog.getByLabelText('刪除密碼')).toBeInTheDocument()
    fireEvent.click(dialog.getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(0)
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '7788' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['d-1'], password: '7788' })
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('密碼錯誤') }))
    )
    expect(screen.getByText('已選 0 筆')).toBeInTheDocument()
  })
})

describe('掛單列表：結帳', () => {
  const expectedOrderInput = {
    date: DRAFTS[0].date,
    amountByOtherPay: 100,
    customerCellphone: '',
    customerId: 'c-1',
    isDesignate: true,
    payType: [],
    isPending: false,
    serviceOrders: [
      // 服務助理讀查詢的 helperDeductionType（送出的欄位名仍是 helperDeductiontype），Jason 2026/10/22
      { serviceId: 'svc-1', price: 1000, serviceOrderHelpers: [{ helperDeductiontype: 'PERCENT', helperId: 'h-1', isDesignate: false, type: '助理' }], thirdPartyCouponMerchantId: null },
      { serviceId: 'svc-2', price: 300, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-1' },
    ],
    productOrders: [
      { productId: 'p-1', price: 200, count: 2, sellerId: 'u-1', thirdPartyCouponMerchantId: null },
      { productId: 'p-2', price: 50, count: 1, sellerId: 'u-1', thirdPartyCouponMerchantId: 'tp-1' },
    ],
    useTicketOrders: [{ customerTicketId: 'ut-1', useTicketOrderHelpers: [{ helperDeductiontype: 'AMOUNT', helperId: 'h-2', isDesignate: true, type: '洗髮' }] }],
    designerId: 'u-1',
    ticketOrders: [{ serviceId: 'svc-3', availableCount: 5, price: 150, count: 2, remark: '', intoPerformanceWhileBuying: false }],
    membershipOrders: [],
    walletPay: 200,
    bonusDecount: 30,
    bonusDeposit: 10,
    bonusUsed: 0,
    remark: '老客人',
    source: '現場',
    serialNumber: undefined,
  }

  it('未設結帳密碼：直接以掛單內容重新結帳（isPending: false），成功導到帳單列表', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'reCheckoutOrder')[0].variables
    expect(input.updateOrderId).toBe('d-1')
    expect(input.orderInput).toEqual(expectedOrderInput)
    expect(input.password).toBeUndefined()
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '結帳成功', variant: 'success' })
  })

  it('會員卡與其他付款方式的掛單：帶入付款方式與會員卡內容', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(within(rowOf('D002')).getByLabelText('結帳'))
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    expect(callsOf(calls, 'reCheckoutOrder')[0].variables.input.orderInput).toMatchObject({
      payType: ['街口'],
      membershipOrders: [{ sellerId: 'u-2', membershipUUID: 'm-1', purchaseDate: 1, expiryDate: 2, price: 900, thirdPartyCouponMerchantId: 'tp-3', remark: '' }],
    })
  })

  it('結帳成功且後端回了新帳單 id：改開那張帳單詳細', async () => {
    const { settle } = setup({ reCheckoutOrder: { reCheckoutOrder: { id: 'closed-bill' } } })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    await wait(() => expect(currentLocation()).toBe('/order/closed-bill'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '結帳成功', variant: 'success' })
  })

  it('結帳連線失敗但掛單已不在清單：不再送第二次，改到帳單列表', async () => {
    const { calls, settle } = setup({
      reCheckoutOrder: () => {
        throw new Error('Failed to fetch')
      },
      DRAFT_STILL_PENDING: { pendingOrders: { totalCount: 0, orders: [] } },
    })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'warning',
      message: '這張掛單已結帳，請到帳單列表確認，不要重複結帳',
    })))
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('結帳連線失敗且無法確認掛單狀態：按鈕保持停用，不再送出', async () => {
    const { calls, settle } = setup({
      reCheckoutOrder: () => {
        throw new Error('Failed to fetch')
      },
      DRAFT_STILL_PENDING: { pendingOrders: { orders: [] } },
    })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({
      message: '無法確認結帳是否成功。請先到帳單列表查看，不要重複結帳。',
    })))
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
    expect(within(rowOf('D001')).getByLabelText('結帳')).toBeDisabled()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
  })

  it('結帳失敗時提示錯誤、可再按', async () => {
    const { calls, settle } = setup({ reCheckoutOrder: new Error('已日結') })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('已日結') }))
    )
    await wait(() => expect(within(rowOf('D001')).getByLabelText('結帳')).not.toBeDisabled())
    expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1)
  })

  it('設結帳密碼：先輸入編輯帳單密碼，送出時帶上密碼；成功導到帳單列表', async () => {
    const { calls, settle } = setup({
      GET_MERCHANT_PASSWORD_IS_USING: { merchantPassword: { deleteOrder: { isUsing: false }, reCheckoutOrder: { isUsing: true } } },
    })
    await settle()
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('掛單結帳')).toBeInTheDocument()
    expect(dialog.getByLabelText('編輯帳單密碼')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '1357' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    const { input } = callsOf(calls, 'reCheckoutOrder')[0].variables
    expect(input).toEqual({ updateOrderId: 'd-1', orderInput: expectedOrderInput, password: '1357' })
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('設結帳密碼但密碼錯誤：提示錯誤、可再按確認', async () => {
    const { calls, settle } = setup({
      GET_MERCHANT_PASSWORD_IS_USING: { merchantPassword: { deleteOrder: { isUsing: false }, reCheckoutOrder: { isUsing: true } } },
      reCheckoutOrder: new Error('密碼錯誤'),
    })
    await settle()
    fireEvent.click(within(rowOf('D002')).getByLabelText('結帳'))
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('密碼錯誤') }))
    )
    await wait(() => expect(screen.getByTestId('confirm')).not.toBeDisabled())
    expect(callsOf(calls, 'reCheckoutOrder')[0].variables.input.updateOrderId).toBe('d-2')
  })
})

describe('掛單列表：列印', () => {
  const printOf = async (no = 'D001') => {
    fireEvent.click(within(rowOf(no)).getByLabelText('列印帳單'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    return written.join('')
  }

  it('A4：合計＝服務＋店販（不含第三方卡券）＋卡券販賣(不入業績)；付現再扣入金、其他付款與點數折抵；1 秒後關閉', async () => {
    const { settle } = setup()
    await settle()
    const timers = captureWindowTimers()
    const html = await printOf()
    expect(timers.run()).toEqual([1000])
    expect(html).toContain('style="margin: 0mm 5mm;"')
    expect(html).toContain('測試店')
    expect(html).toContain('設計師:王小美')
    expect(html).toContain('顧客:陳小姐')
    expect(html).toContain('助理:H1')
    expect(html).toContain('助理:阿洗')
    // 1000 + 400 + 300 = 1700；付現 1700 − 200 − 100 − 30 = 1370
    expect(html).toContain('合計：1700')
    expect(html).toContain('付現金額：1370')
    expect(html).toContain('卡券金額：300')
    expect(html).toContain('增點：10')
    // 顧客點數餘額 88 有資料，掛單收據仍不印（Jason 2026/10/24）
    expect(html).not.toContain('點數餘額')
    expect(printWindow.document.close).toHaveBeenCalled()
    expect(printWindow.close).toHaveBeenCalled()
  })

  it('合計與付現含會員卡（不含第三方卡券付的會員卡），與帳單列表一致（Jason 2026/10/22）', async () => {
    const { settle } = setup({
      FETCH_PENDING_ORDERS: {
        pendingOrders: {
          pageLimit: 1000, pageOffset: 0, totalCount: 1,
          orders: [draft({
            membershipOrders: [
              { seller: { id: 'u-1' }, purchaseDate: 1, expiryDate: 2, price: 600, thirdPartyPayId: null, thirdPartyPayName: null, remark: '', membership: { uuid: 'm-1', name: '金卡' } },
              { seller: { id: 'u-1' }, purchaseDate: 1, expiryDate: 2, price: 900, thirdPartyPayId: 'tp-3', thirdPartyPayName: '會員券', remark: '', membership: { uuid: 'm-2', name: '銀卡' } },
            ],
          })],
        },
      },
    })
    await settle()
    const html = await printOf()
    // 1000 + 400 + 600 + 300 = 2300；付現 2300 − 200 − 100 − 30 = 1970
    expect(html).toContain('合計：2300')
    expect(html).toContain('付現金額：1970')
  })

  it.each([
    ['感熱紙(80mm)', '<html style="width: 78mm;">'],
    ['感熱紙(57mm)', '<html style="width: 56mm;">'],
    ['其他', '<html><style>@page {margin: 1mm;}</style>'],
  ])('%s：寫入 #printThermal（熱感紙版點數排兩列）', async (layout, head) => {
    const { settle } = setup({ GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: layout } })
    await settle()
    const html = await printOf()
    expect(html).toContain(head)
    expect(html).toContain('謝謝惠顧,歡迎下次光臨!')
    expect(html).toContain('洗髮精')
    expect(html).toContain('折抵：30')
    expect(html).not.toContain('點數餘額')
  })

  it('延遲關閉：100 毫秒後列印、10 秒後關閉', async () => {
    const { settle } = setup({ GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: true } } })
    await settle()
    printWindow.document.querySelector = () => null
    const timers = captureWindowTimers()
    await printOf()
    expect(timers.run()).toEqual([100, 10000])
    expect(printWindow.print).toHaveBeenCalled()
    expect(printWindow.close).toHaveBeenCalled()
  })

  it('不留客資或沒有點數且未啟用點數時不印點數；啟用點數時即使為 0 也印', async () => {
    const noBonus = { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft({ bonusDeposit: 0, bonusUsed: 0, bonusDecountForReport: 0 })] } }
    let ctx = setup({ FETCH_PENDING_ORDERS: { pendingOrders: { pageLimit: 1000, pageOffset: 0, totalCount: 1, orders: [draft({ customer: { id: 'c-0', name: '不留客資', cellphone: '0900000000', no: '' } })] } } })
    await ctx.settle()
    expect(await printOf()).not.toContain('增點')
    cleanup()
    window.open.mockClear()
    written = []
    ctx = setup({ FETCH_PENDING_ORDERS: noBonus })
    await ctx.settle()
    expect(await printOf()).not.toContain('增點')
    cleanup()
    window.open.mockClear()
    written = []
    ctx = setup({ FETCH_PENDING_ORDERS: noBonus, GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } })
    await ctx.settle()
    const zeroBonus = await printOf()
    expect(zeroBonus).toContain('增點：0')
    expect(zeroBonus).not.toContain('點數餘額')
  })

  it('收據抬頭：logo（轉 data URL）、QR code、訊息；只開訊息但沒內容時不印抬頭；logo 抓不到不影響', async () => {
    let ctx = setup({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://img.example/logo.png' } },
      GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://line.me/x', imageUrl: 'https://img.example/qr.png' } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '感謝光臨' } },
    })
    await ctx.settle()
    await wait(() => expect(document.querySelector('#printMain img[src^="data:"]')).not.toBeNull())
    fireEvent.change(document.querySelector('#printMain textarea'), { target: { value: '改不了' } })
    fireEvent.change(document.querySelector('#printThermal textarea'), { target: { value: '改不了' } })
    let html = await printOf()
    expect(html).toContain('data:qr:https://line.me/x')
    expect(html).toContain('感謝光臨')
    cleanup()
    window.open.mockClear()
    written = []
    const beforeLogo = networkRequests.length
    ctx = setup({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
      GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: null, imageUrl: null } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '週一公休' } },
    })
    await ctx.settle()
    expect(networkRequests.slice(beforeLogo)).not.toContain('null')
    html = await printOf()
    expect(html).toContain('週一公休')
    expect(html).not.toContain('<img')
    cleanup()
    window.open.mockClear()
    written = []
    ctx = setup({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://img.example/broken.png' } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: null } },
    })
    window.fetch = jest.fn(() => Promise.reject(new Error('404')))
    await ctx.settle()
    html = await printOf()
    expect(window.fetch).toHaveBeenCalledWith('https://img.example/broken.png')
    expect(html).toContain('結帳單')
    cleanup()
    window.open.mockClear()
    written = []
    ctx = setup({ GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: null } } })
    await ctx.settle()
    expect(await printOf()).not.toContain('<textarea')
  })

  it('設定類查詢還沒回來時先用預設值：不需密碼、A4、顯示姓名、未啟用點數', async () => {
    const slow = 400
    const { calls, settle } = setup({}, {
      delays: { GET_CUSTOMER_BONUS: slow, GET_MERCHANT_PASSWORD_IS_USING: slow, GET_MERCHANT_ORDER_PRINT_LAYOUT: slow, GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: slow },
    })
    await screen.findByText('#D001')
    expect(await printOf()).toContain('style="margin: 0mm 5mm;"')
    fireEvent.click(within(rowOf('D001')).getByLabelText('結帳'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
    await settle()
  })
})
