// 保護「帳單列表」的其餘功能（基本列表與遮罩設定晚到見 OrderManagementList.page.test.js）：
// - 日期權限：依角色的帳單列表日期權限（orderListDateAuth）與「開放區間查詢」設定決定快速選項與日期欄；未開放區間時只能選單日
// - 查詢參數：快速選擇日期改查該日整天（台灣時間）；篩選設計師、其他付款方式送出對應參數（沒選付款方式送空字串）
// - 匯出：遮罩時姓名依長度遮（2 字「王*」、3 字「陳*姐」、4 字以上留前 2 字）、手機留前 4 後 3；流水號、會員卡、點數欄依設定
// - 明細：查詢所有帳單的明細並可逐筆／全部展開；第三方卡券與其他付款方式名稱
// - 刪除：只能勾「已完成且未日結」的帳單；未設刪除密碼直接刪、設了先輸入密碼；失敗提示並清空勾選
// - 列印：依列印格式（A4／感熱紙 80mm／57mm／其他）寫入列印視窗；合計＝服務＋店販＋會員卡（不含第三方卡券）＋卡券販賣(不入業績)，
//   付現＝合計−入金使用−其他付款；點數資訊在啟用點數或該單有點數時才印；延遲關閉設定
// - 查詢失敗時提示縮小日期區間；日期權限查詢失敗時視為沒有日期權限、列表照常顯示（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不刪除真實帳單；列印視窗以假物件取代。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, networkRequests } from '../../../__tests__/testkit.test'
import OrderManagementList from '..'
import { weekDisplay, renderTpName, linkDisabled } from '../orderListHelpers'

// 按下匯出連結並回傳產生的 CSV 文字。點擊後 LazyCSVLink 把 data URI 寫回 href；後面接一個擋下預設動作的監聽，避免 jsdom 試著導覽（未實作）
const clickExportCsv = link => {
  const stop = event => event.preventDefault()
  window.addEventListener('click', stop)
  try {
    fireEvent.click(link)
  } finally {
    window.removeEventListener('click', stop)
  }
  return decodeURIComponent(link.getAttribute('href'))
}

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
// QR code 產生：有網址才成功（模擬產生失敗時不設圖）；用一般函式，避免 CRA 的 resetMocks 清掉實作
jest.mock('qrcode', () => ({
  toDataURL: (url, cb) => (url ? cb(null, `data:qr:${url}`) : cb(new Error('沒有網址'))),
}))

const order = (overrides = {}) => ({
  id: 'o-1',
  date: new Date(2026, 9, 19, 11, 5).getTime(),
  orderNo: 'A001',
  isDesignate: true,
  customerName: '陳小姐',
  customerCellphone: '0912345678',
  customerNo: 'C01',
  designerName: '王小美',
  designerNo: '01',
  otherPayName: null,
  isCloseAccount: false,
  service: 1200,
  product: 400,
  membership: 0,
  usedTicket: 0,
  ticketSellIntoPerformance: 0,
  performanceIncome: 1600,
  ticketSellNotIntoPerformance: 0,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  bonusDecountForReport: 0,
  businessCash: 1600,
  remark: '',
  TPTName: { service: [], product: [], membership: [], overAll: [] },
  source: null,
  raffleCount: 0,
  status: '已完成',
  serialNumber: null,
  ...overrides,
})

const ORDERS = [
  order(),
  order({
    id: 'o-2',
    orderNo: 'A002',
    customerName: '王明',
    customerCellphone: '0922111222',
    designerNo: null,
    isDesignate: false,
    date: new Date(2026, 9, 20, 9, 0).getTime(),
    serialNumber: 'S-9',
    otherPayName: '街口',
    otherPayWayForDecount: -300,
    TPTName: { service: ['集點卡', '團購券'], product: ['商品券'], membership: ['會員券'], overAll: ['全單券'] },
  }),
  order({
    id: 'o-3',
    orderNo: 'A003',
    customerName: '歐陽小明',
    customerCellphone: '0933444555',
    isCloseAccount: true,
    date: new Date(2026, 9, 21, 9, 0).getTime(),
  }),
  order({ id: 'o-4', orderNo: 'A004', customerName: '李四', status: '建立中', date: new Date(2026, 9, 22, 9, 0).getTime() }),
  order({ id: 'o-5', orderNo: 'A005', customerName: '周五', status: '已作廢', date: new Date(2026, 9, 23, 9, 0).getTime() }),
  order({ id: 'o-6', orderNo: 'A006', date: new Date(2026, 9, 24, 9, 0).getTime() }),
  order({ id: 'o-7', orderNo: 'A007', date: new Date(2026, 9, 25, 9, 0).getTime() }),
]

const SUMMARY = {
  service: 1234.567,
  product: 400,
  usedTicket: 0,
  ticketSellIntoPerformance: 0,
  performanceIncome: 1600,
  ticketSellNotIntoPerformance: 0,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  businessCash: 1600,
  walletDeposit: 0,
  membership: 0,
  bonusDecountForReport: 0,
}

const PRINT_ORDER = {
  id: 'o-1',
  no: 'A001',
  date: new Date(2026, 9, 19, 11, 5).getTime(),
  walletUsedForDecount: -200,
  otherPayWayForDecount: -100,
  bonusDeposit: 10,
  bonusUsed: 0,
  bonusDecountForReport: -30,
  customerLeftBonus: 88,
  customerLeftWallet: 500,
  customer: { name: '陳小姐' },
  designer: { id: 'u-1', name: '王小美', designerNo: '01' },
  serviceOrders: [
    { price: 1000, thirdPartyPayName: null },
    { price: 300, thirdPartyPayName: '團購券' },
  ],
  productOrders: [
    { price: 200, count: 2, thirdPartyPayName: null },
    { price: 50, count: 1, thirdPartyPayName: '商品券' },
  ],
  membershipOrders: [
    { price: 600, thirdPartyPayName: null },
    { price: 900, thirdPartyPayName: '會員券' },
  ],
  staticDetail: [
    {
      designerName: '王小美',
      serviceType: '項目消費',
      itemName: '剪髮',
      count: 1,
      price: 1000,
      helperList: [
        { helperName: '小助', helperType: '助理', helperNo: 'H1' },
        { helperName: '阿洗', helperType: '洗髮', helperNo: '' },
      ],
    },
    { designerName: '王小美', serviceType: '店販銷售', itemName: '洗髮精', count: 2, price: 200, helperList: [] },
    { designerName: '王小美', serviceType: '會員卡銷售', itemName: '金卡', count: 1, price: 600, helperList: [] },
    { designerName: '王小美', serviceType: '卡券販賣(不入業績)', itemName: '護髮券', count: 2, price: 150, helperList: [] },
    { designerName: '王小美', serviceType: '卡券販賣(入業績)', itemName: '剪髮券', count: 1, price: 500, helperList: [] },
    { designerName: '王小美', serviceType: '卡券使用', itemName: '剪髮十次卡', count: 1, price: 333.335, helperList: [] },
  ],
}

const fixtures = (extra = {}) => ({
  GET_ORDER_LIST_DATE_AUTH: {
    orderListDateAuth: { lastmonth: true, thismonth: true, dbyesterday: true, yesterday: true, today: true, selector: true },
  },
  GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT: { getIsOpenDateRangeInOrderMangement: true },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: true },
  GET_ORDER_LIST: { getOrderList: { intervalSummary: SUMMARY, orderList: ORDERS } },
  GET_ORDER_STATIC_DETAIL: v => ({
    getOrderStaticDetail: (v.orderIds || [])
      .filter(id => id !== 'o-7')
      .map(id => ({
        orderId: id,
        orderStaticDetail:
          id === 'o-1'
            ? [
                {
                  designerName: '王小美',
                  serviceType: '項目消費',
                  itemName: '剪髮',
                  count: 1,
                  price: 1200,
                  helperList: [{ helperName: '小助', helperNo: 'H1', helperType: '助理' }],
                },
                { designerName: '王小美', serviceType: '卡券使用', itemName: '十次卡', count: 1, price: 333.339, helperList: [] },
              ]
            : [],
      })),
  }),
  GET_MERCHANT_PASSWORD: { merchantPassword: { deleteOrder: { isUsing: false } } },
  GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: 'A4' },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'NAME' },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: true } },
  GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
  GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: false, url: null, imageUrl: null } },
  GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
  FETCH_ORDER_FOR_PRINT: { order: PRINT_ORDER },
  DELETE_ORDER: { deleteOrder: true },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'u-1', userName: '王小美', userNickName: '', userNo: '01' }] },
  merchantPayWays: { merchantPayWays: [{ id: 'p1', type: 'onSales', name: '信用卡', fee: 2 }] },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [{ id: 'c1', name: '王小明', cellphone: '0912', no: 'A1' }] } },
  FETCH_THIRDPARTYS: { merchant: { id: 'm', thirdpartyCoupons: [{ id: 't1', name: '街口', fee: 1, type: 'A' }] } },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] },
  ...extra,
})
const setup = (extra = {}, options = {}) =>
  renderPage(<OrderManagementList />, { fixtures: fixtures(extra), route: '/management/orders', ...options })

let written
let printWindow
beforeEach(() => {
  loginAs()
  written = []
  printWindow = {
    document: { write: html => written.push(html), querySelector: () => ({ innerHTML: '舊內容' }) },
    print: jest.fn(),
    close: jest.fn(),
  }
  window.open = jest.fn(() => printWindow)
})
afterEach(cleanup)

const lastInput = calls => {
  const list = callsOf(calls, 'GET_ORDER_LIST')
  return list[list.length - 1].variables.input
}
const rowOf = no => screen.getByText(new RegExp(`^#${no}`)).closest('tr')
// 匯出檔內容：按下「報表匯出」才產生（效能修正 A），網址在 jsdom 以 data URI 寫回連結上；擋下 jsdom 的導覽
const exportedCsv = () => clickExportCsv(screen.getByText('報表匯出').closest('a'))
const quickOptions = () => {
  fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
  const list = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map(o => o.textContent)
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
  return list
}
const field = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (label, text) => {
  fireEvent.click(field(label))
  fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === text))
}

describe('帳單列表：日期權限', () => {
  it('開放區間查詢且有全部權限：快速選項含上個月、本月，並有起訖兩個日期欄', async () => {
    const { settle } = setup()
    await settle()
    expect(quickOptions()).toEqual(['上個月', '本月', '前天', '昨天', '今天'])
    expect(screen.getByRole('button', { name: '起始時間' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '結束時間' })).toBeInTheDocument()
  })

  it('未開放區間查詢：沒有上個月／本月，只能選單日（選了日期查該日整天）', async () => {
    const { calls, settle } = setup({ GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT: { getIsOpenDateRangeInOrderMangement: false } })
    await settle()
    expect(screen.queryByRole('button', { name: '結束時間' })).toBeNull()
    const picker = screen.getByRole('button', { name: '選擇日期' })
    fireEvent.click(picker)
    const target = subDays(new Date(), 3)
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('gridcell', { name: `${target.getFullYear()}年${target.getMonth() + 1}月${target.getDate()}日` })
    )
    // 選日後 DateSelector 重繪，月曆隨之關閉（不必按確認）
    await wait(() => expect(lastInput(calls).dateRange.endDate).toBe(endOfDay(target).getTime()))
    expect(startOfDay(lastInput(calls).dateRange.startDate).getTime()).toBe(startOfDay(target).getTime())
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(quickOptions()).toEqual(['前天', '昨天', '今天'])
  })

  it('沒有自選日期權限、只有今天：只有「今天」快速選項、沒有日期欄', async () => {
    const { settle } = setup({
      GET_ORDER_LIST_DATE_AUTH: {
        orderListDateAuth: { lastmonth: true, thismonth: false, dbyesterday: false, yesterday: false, today: true, selector: false },
      },
    })
    await settle()
    expect(quickOptions()).toEqual(['上個月', '今天'])
    expect(screen.queryByRole('button', { name: '起始時間' })).toBeNull()
  })

  it('快速選擇「昨天」後改查昨天整天（台灣時間）', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '昨天' }))
    await wait(() =>
      expect(lastInput(calls).dateRange).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    )
  })

  it('日期權限查詢失敗時視為沒有日期權限（沒有快速選項、沒有日期欄），列表照常顯示（Jason 2026/10/22）', async () => {
    const { settle } = setup({ GET_ORDER_LIST_DATE_AUTH: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('報表匯出')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '起始時間' })).toBeNull()
    expect(screen.queryByRole('combobox', { name: '快速選擇日期區間' })).toBeNull()
  })
})

describe('帳單列表：篩選與查詢', () => {
  it('預設不篩選（其他付款方式送空字串）；選設計師與其他付款方式後送出對應參數；再按篩選收起', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_ORDER_LIST')[0].variables.input).toEqual({
      dateRange: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      customerId: '',
      designerId: '',
      otherPayWay: '',
      thirdPartTicketId: '',
      source: [],
    })
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    await settle()
    choose('設計師編號/姓名', '王小美-01')
    await wait(() => expect(lastInput(calls).designerId).toBe('u-1'))
    await settle()
    choose('其他付款方式', '信用卡')
    await wait(() => expect(lastInput(calls)).toMatchObject({ designerId: 'u-1', otherPayWay: '信用卡' }))
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByText('設計師編號/姓名')).toBeNull()
  })

  it('帳單查詢失敗時提示縮小日期區間（31 日以內）', async () => {
    const { settle } = setup({ GET_ORDER_LIST: new Error('區間過大') })
    await settle()
    expect(screen.getByText('時間區間請選擇31日以內')).toBeInTheDocument()
  })

  it('設定類查詢還沒回來時先用預設值：不可刪除密碼、A4、顯示姓名、未啟用點數；區間統計缺漏時顯示 0', async () => {
    const slow = 400
    const { calls, settle } = setup(
      { GET_ORDER_LIST: { getOrderList: { intervalSummary: null, orderList: [order()] } } },
      {
        delays: {
          GET_CUSTOMER_BONUS: slow,
          GET_MERCHANT_PASSWORD: slow,
          GET_MERCHANT_ORDER_PRINT_LAYOUT: slow,
          GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: slow,
        },
      }
    )
    await screen.findByText('#A001')
    expect(screen.getAllByText('0').length).toBeGreaterThan(5)
    fireEvent.click(within(rowOf('A001')).getByLabelText('列印帳單'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    expect(written.join('')).toContain('style="margin: 0mm 5mm;"')
    await settle()
    expect(callsOf(calls, 'FETCH_ORDER_FOR_PRINT')).toHaveLength(1)
  })

  it('查詢中顯示骨架', async () => {
    const { settle } = setup({}, { delays: { GET_ORDER_LIST: 300 } })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
  })

  it('網址帶日期時，查看帳單連結保留日期區間（返回時回到同一區間）', async () => {
    const start = startOfDay(new Date(2026, 9, 19)).getTime()
    const end = endOfDay(new Date(2026, 9, 19)).getTime()
    const { calls, settle } = setup({}, { route: `/management/orders?startDate=${start}&endDate=${end}` })
    await settle()
    expect(lastInput(calls).dateRange).toEqual({ startDate: start, endDate: end })
    expect(within(rowOf('A001')).getByLabelText('查看帳單').getAttribute('href')).toBe(`/order/o-1?startDate=${start}&endDate=${end}`)
  })
})

describe('帳單列表：列表與匯出', () => {
  it('匯出遮罩姓名依長度、手機留前 4 後 3；含流水號、星期、設計師編號，未啟用會員卡與點數時不含兩欄', async () => {
    const { settle } = setup()
    await settle()
    await wait(() => expect(exportedCsv()).toContain('陳*姐 0912***678'))
    const csv = exportedCsv()
    expect(csv).toContain('"#A002 (S-9)","2026/10/20/(二)","王* 0922***222","王小美","N"')
    expect(csv).toContain('歐陽*明 0933***555')
    expect(csv).toContain('"#A001","2026/10/19/(一)"')
    expect(csv).toContain('"王小美/01"')
    expect(csv).not.toContain('會員卡販賣')
    expect(csv).not.toContain('點數折抵金額')
    // 列表：流水號、第三方卡券名稱、其他付款方式名稱
    const row = within(rowOf('A002'))
    expect(row.getByText('#A002 (S-9)')).toBeInTheDocument()
    expect(row.getByText('含 集點卡, 含 團購券')).toBeInTheDocument()
    expect(row.getByText('含 商品券')).toBeInTheDocument()
    expect(row.getByText('含 全單券')).toBeInTheDocument()
    expect(row.getByText('街口')).toBeInTheDocument()
    // 星期顯示
    ;['(三)', '(四)', '(五)', '(六)', '(日)'].forEach(w => expect(screen.getAllByText(w, { exact: false }).length).toBeGreaterThan(0))
  })

  it('不使用流水號時，編號不帶流水號', async () => {
    const { settle } = setup({ GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } } })
    await settle()
    expect(screen.getByText('#A002')).toBeInTheDocument()
    await wait(() => expect(exportedCsv()).toContain('"#A002",'))
  })

  it('啟用會員卡與點數時：列表、區間統計與匯出顯示會員卡與點數欄（會員卡第三方卡券名稱）', async () => {
    const { settle } = setup({
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
      GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
      GET_ORDER_LIST: { getOrderList: { intervalSummary: { ...SUMMARY, membership: 3000, bonusDecountForReport: -50 }, orderList: ORDERS } },
    })
    await settle()
    await wait(() => expect(screen.getByText('店販消費/會員卡消費')).toBeInTheDocument())
    expect(screen.getByText('400 / 3,000')).toBeInTheDocument()
    expect(screen.getByText('入金使用(-)/點數折抵金額(-)')).toBeInTheDocument()
    expect(within(rowOf('A002')).getByText('含 會員券')).toBeInTheDocument()
    await wait(() => expect(exportedCsv()).toContain('會員卡販賣'))
    expect(exportedCsv()).toContain('點數折抵金額(-)')
    // 區間統計：服務消費四捨五入到小數 2 位
    expect(screen.getByText('1,234.57')).toBeInTheDocument()
  })

  it('查詢所有帳單的明細；逐筆展開／收合顯示設計師、項目、價格（卡券使用無條件捨去）、互助人；全部展開／收合', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_ORDER_STATIC_DETAIL').pop().variables.orderIds).toEqual(ORDERS.map(o => o.id))
    fireEvent.click(within(rowOf('A001')).getByLabelText('展開明細'))
    expect(screen.getByText('剪髮(項目消費)')).toBeInTheDocument()
    expect(screen.getByText('助理[小助]')).toBeInTheDocument()
    expect(screen.getByText('333.33')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
    fireEvent.click(within(rowOf('A001')).getByLabelText('收合明細'))
    expect(screen.queryByText('剪髮(項目消費)')).toBeNull()
    fireEvent.click(screen.getByText('全部展開'))
    expect(screen.getByText('剪髮(項目消費)')).toBeInTheDocument()
    expect(screen.getAllByLabelText('收合明細').length).toBe(ORDERS.length)
    fireEvent.click(screen.getByText('全部收合'))
    expect(screen.queryByText('剪髮(項目消費)')).toBeNull()
    // 建立中的帳單不能展開、列印、查看
    expect(within(rowOf('A004')).getByLabelText('展開明細')).toBeDisabled()
    expect(within(rowOf('A004')).getByLabelText('列印帳單')).toBeDisabled()
    expect(within(rowOf('A004')).getByLabelText('查看帳單').getAttribute('aria-disabled')).toBe('true')
  })
})

describe('帳單列表：刪除', () => {
  it('只能勾已完成且未日結的帳單；全選只選這些、再按一次清空', async () => {
    const { settle } = setup()
    await settle()
    expect(within(rowOf('A003')).getByLabelText('選取 #A003')).toBeDisabled()
    expect(within(rowOf('A004')).getByLabelText('選取 #A004')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 4 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('全選').checked).toBe(true)
    fireEvent.click(within(rowOf('A001')).getByLabelText('選取 #A001'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    fireEvent.click(within(rowOf('A001')).getByLabelText('選取 #A001'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 0 筆')).toBeInTheDocument()
  })

  it('未設刪除密碼：直接刪除勾選的帳單，成功後清空勾選並重抓', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(within(rowOf('A001')).getByLabelText('選取 #A001'))
    fireEvent.click(within(rowOf('A002')).getByLabelText('選取 #A002'))
    const before = callsOf(calls, 'GET_ORDER_LIST').length
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '帳單刪除中', variant: 'warning' })
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['o-1', 'o-2'], password: '' })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除帳單成功', variant: 'success' }))
    await wait(() => expect(callsOf(calls, 'GET_ORDER_LIST').length).toBeGreaterThan(before))
  })

  it('設刪除密碼：先輸入密碼，取消不送；確認送出密碼；失敗時提示並清空勾選', async () => {
    const { calls, settle } = setup({
      GET_MERCHANT_PASSWORD: { merchantPassword: { deleteOrder: { isUsing: true } } },
      DELETE_ORDER: new Error('密碼錯誤'),
    })
    await settle()
    fireEvent.click(within(rowOf('A001')).getByLabelText('選取 #A001'))
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    expect(within(screen.getByRole('dialog')).getByText('刪除帳單？')).toBeInTheDocument()
    fireEvent.click(within(screen.getByRole('dialog')).getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(0)
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '7788' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['o-1'], password: '7788' })
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('密碼錯誤') }))
    )
    expect(screen.getByText('已選 0 筆')).toBeInTheDocument()
    expect(screen.getByTestId('delete-password')).toHaveValue('')
  })
})

// 攔截列印視窗的延遲列印／關閉計時器（只攔回呼內操作 newWin 的），測試時手動執行，不必真的等 10 秒；
// 其他計時器（模擬後端、wait）照常交給原本的 setTimeout
const originalSetTimeout = window.setTimeout
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
afterEach(() => {
  window.setTimeout = originalSetTimeout
})

describe('帳單列表：列印', () => {
  const printOf = async (calls, no = 'A001') => {
    fireEvent.click(within(rowOf(no)).getByLabelText('列印帳單'))
    await wait(() => expect(window.open).toHaveBeenCalledTimes(1))
    return written.join('')
  }

  it('A4：查詢該帳單並寫入 #printMain；合計不含第三方卡券、付現扣入金與其他付款；有點數時印點數；1 秒後關閉', async () => {
    const { calls, settle } = setup()
    await settle()
    const timers = captureWindowTimers()
    const html = await printOf(calls)
    const timeouts = timers.run()
    expect(callsOf(calls, 'FETCH_ORDER_FOR_PRINT')[0].variables).toEqual({ orderId: 'o-1' })
    expect(html).toContain('<body onload="window.print()" style="margin: 0mm 5mm;">')
    expect(html).toContain('測試店')
    expect(html).toContain('2026/10/19 11:05')
    expect(html).toContain('客戶：陳小姐')
    expect(html).toContain('設計師：王小美')
    expect(html).toContain('助理:H1')
    expect(html).toContain('助理:阿洗')
    // 合計 = 服務 1000 + 店販 400 + 會員卡 600 + 卡券販賣(不入業績) 300 = 2300（第三方卡券付的服務 300、商品 50、會員卡 900 不計）；付現 = 2300 − 200 − 100
    expect(html).toContain('合計：2300')
    expect(html).toContain('付現金額：2000')
    expect(html).toContain('卡券金額：300')
    expect(html).toContain('扣入金：200')
    expect(html).toContain('入金餘額：500')
    expect(html).toContain('增點：10')
    expect(html).toContain('折抵：30')
    expect(html).toContain('點數餘額：88')
    expect(printWindow.print).toHaveBeenCalled()
    expect(printWindow.close).toHaveBeenCalled()
    expect(timeouts).toEqual([1000])
  })

  it.each([
    ['感熱紙(80mm)', '@page {margin: 1mm; width:78mm;}'],
    ['感熱紙(57mm)', '@page {margin: 1mm; width:56mm;}'],
    ['其他', '<html><style>@page {margin: 1mm;}</style><body onload="window.print()">'],
  ])('%s：寫入 #printThermal 的內容', async (layout, head) => {
    const { calls, settle } = setup({ GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: layout } })
    await settle()
    const html = await printOf(calls)
    expect(html).toContain(head)
    expect(html).toContain('謝謝惠顧,歡迎下次光臨!')
    expect(html).toContain('洗髮精')
    expect(html).toContain('助理:H1')
  })

  it('延遲關閉列印視窗：100 毫秒後列印、10 秒後關閉', async () => {
    const { calls, settle } = setup({ GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: true } } })
    await settle()
    printWindow.document.querySelector = () => null
    const timers = captureWindowTimers()
    await printOf(calls)
    const timeouts = timers.run()
    expect(timeouts).toEqual([100, 10000])
    expect(printWindow.print).toHaveBeenCalled()
    expect(printWindow.close).toHaveBeenCalled()
  })

  it('不留客資的帳單、沒有點數也未啟用點數時不印點數', async () => {
    const { calls, settle } = setup({
      FETCH_ORDER_FOR_PRINT: { order: { ...PRINT_ORDER, customer: { name: '不留客資' } } },
    })
    await settle()
    let html = await printOf(calls)
    expect(html).not.toContain('增點')
    cleanup()
    window.open.mockClear()
    written = []
    const second = setup({ FETCH_ORDER_FOR_PRINT: { order: { ...PRINT_ORDER, bonusDeposit: 0, bonusUsed: 0, bonusDecountForReport: 0 } } })
    await second.settle()
    html = await printOf(second.calls)
    expect(html).not.toContain('增點')
  })

  it('未有點數但啟用點數時仍印點數（熱感紙版排成兩列）', async () => {
    const { calls, settle } = setup({
      GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
      GET_MERCHANT_ORDER_PRINT_LAYOUT: { getMerchantPrintFormatSettings: '感熱紙(80mm)' },
      FETCH_ORDER_FOR_PRINT: { order: { ...PRINT_ORDER, bonusDeposit: 0, bonusUsed: 0, bonusDecountForReport: 0 } },
    })
    await settle()
    const html = await printOf(calls)
    expect(html).toContain('增點：0')
  })

  it('收據抬頭：顯示 logo（抓圖轉成 data URL）、QR code（依網址產生）與訊息', async () => {
    const { calls, settle } = setup({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://img.example/logo.png' } },
      GET_QRCODE_DISPLAY_ON_INVOICE: {
        getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://line.me/x', imageUrl: 'https://img.example/qr.png' },
      },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '感謝光臨' } },
    })
    await settle()
    expect(networkRequests).toContain('https://img.example/logo.png')
    await wait(() => expect(document.querySelector('#printMain img[src^="data:"]')).not.toBeNull())
    const html = await printOf(calls)
    expect(html).toContain('data:qr:https://line.me/x')
    expect(html).toContain('感謝光臨')
  })

  it('收據抬頭：只開 QR code 但沒有圖、只開訊息時只印訊息；只開訊息但沒有內容時不印抬頭', async () => {
    const before = networkRequests.length
    const { calls, settle } = setup({
      GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://line.me/x', imageUrl: null } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: '週一公休' } },
    })
    await settle()
    // 預設 logo 沒有網址（isDisplay false、imageUrl null），不該 fetch(null)
    expect(networkRequests.slice(before)).not.toContain('null')
    // 抬頭訊息欄是唯讀（onChange 不動作）
    const textarea = document.querySelector('#printMain textarea')
    fireEvent.change(textarea, { target: { value: '改不了' } })
    fireEvent.change(document.querySelector('#printThermal textarea'), { target: { value: '改不了' } })
    let html = await printOf(calls)
    expect(html).toContain('週一公休')
    expect(html).not.toContain('<img')
    cleanup()
    window.open.mockClear()
    written = []
    const second = setup({ GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: null } } })
    await second.settle()
    html = await printOf(second.calls)
    expect(html).not.toContain('<textarea')
  })

  it('logo 抓不到時不影響列印（不印 logo）', async () => {
    const { calls, settle } = setup({
      GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://img.example/broken.png' } },
      GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: true, message: null } },
    })
    window.fetch = jest.fn(() => Promise.reject(new Error('404')))
    await settle()
    const html = await printOf(calls)
    expect(window.fetch).toHaveBeenCalledWith('https://img.example/broken.png')
    expect(html).toContain('結帳單')
  })
})

describe('帳單列表：純函式', () => {
  it('weekDisplay 不認得的值回傳 undefined；renderTpName 以「含」串接；linkDisabled 只在停用時加屬性', () => {
    expect(weekDisplay('Funday')).toBeUndefined()
    expect(renderTpName(['A'])).toBe('含 A')
    expect(renderTpName([])).toBe('')
    expect(linkDisabled(false)).toEqual({})
    expect(linkDisabled(true)).toMatchObject({ 'aria-disabled': true, tabIndex: -1 })
  })
})
