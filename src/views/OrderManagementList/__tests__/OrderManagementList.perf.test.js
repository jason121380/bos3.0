// 保護「帳單列表」效能修正 A（Jason 2026/10/31）不改變行為：
// - 報表匯出改為按下才產生：載入、重畫時不產生 CSV；按下後的檔案內容與原本 react-csv CSVLink 逐字相同
//   （下方預期字串是改版前以同一份假資料從原本的 CSVLink 取得的；遮罩、欄位順序、四捨五入／無條件捨去、流水號、會員卡與點數欄都在內）
// - 列元件 memo：勾選一列時不重畫其他列（以每列都會呼叫的 truncateDecimal 次數判斷，只驗「遠少於整張表」，不驗精確次數）
// GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { buildURI } from 'react-csv/lib/core'
import truncateDecimal from 'helper/truncateDecimal'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import OrderManagementList from '..'

jest.mock('react-csv/lib/core', () => {
  const actual = jest.requireActual('react-csv/lib/core')
  return { ...actual, buildURI: jest.fn() }
})
jest.mock('helper/truncateDecimal', () => ({ __esModule: true, default: jest.fn() }))

jest.setTimeout(30000)

const order = (o = {}) => ({
  id: 'o-1',
  date: new Date(2026, 9, 21, 11, 5).getTime(),
  orderNo: 'A001',
  isDesignate: true,
  customerName: '陳小姐',
  customerCellphone: '0912345678',
  customerNo: 'C01',
  designerName: '王小美',
  designerNo: '01',
  otherPayName: null,
  isCloseAccount: false,
  service: 1200.6,
  product: 400.4,
  membership: 300.5,
  usedTicket: 33.789,
  ticketSellIntoPerformance: 10.5,
  performanceIncome: 1600,
  ticketSellNotIntoPerformance: 2.5,
  usedTicketForDecount: -33.789,
  thirdPartTicketForDecount: -5.5,
  otherPayWayForDecount: -7.49,
  walletUsedForDecount: -100,
  bonusDecountForReport: -20,
  businessCash: 1600.5,
  remark: '備註,"引號"',
  TPTName: { service: [], product: [], membership: [], overAll: [] },
  source: 'LINE',
  raffleCount: 0,
  status: '已完成',
  serialNumber: 'S-1',
  ...o,
})
const ORDERS = [
  order(),
  order({
    id: 'o-2',
    orderNo: 'A002',
    customerName: '歐陽小明',
    customerCellphone: '0933555555',
    raffleCount: 2,
    designerNo: null,
    serialNumber: null,
    remark: null,
    source: null,
    isDesignate: false,
  }),
  order({ id: 'o-3', orderNo: 'A003', status: '建立中', customerName: '王五', customerCellphone: '' }),
]
const fixtures = (orders, { marked = true, membership = true, bonus = true, serial = true } = {}) => ({
  GET_ORDER_LIST_DATE_AUTH: {
    orderListDateAuth: { lastmonth: true, thismonth: true, dbyesterday: true, yesterday: true, today: true, selector: true },
  },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: membership },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonus },
  GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: marked },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: serial } },
  GET_ORDER_LIST: {
    getOrderList: {
      intervalSummary: {
        service: 0,
        product: 0,
        usedTicket: 0,
        ticketSellIntoPerformance: 0,
        performanceIncome: 0,
        ticketSellNotIntoPerformance: 0,
        usedTicketForDecount: 0,
        thirdPartTicketForDecount: 0,
        otherPayWayForDecount: 0,
        walletUsedForDecount: 0,
        businessCash: 0,
        walletDeposit: 0,
        membership: 0,
        bonusDecountForReport: 0,
      },
      orderList: orders,
    },
  },
  GET_ORDER_STATIC_DETAIL: { getOrderStaticDetail: [] },
})
const setup = (orders, options) => renderPage(<OrderManagementList />, { fixtures: fixtures(orders, options), route: '/management/orders' })

const clickExportCsv = () => {
  const link = screen.getByText('報表匯出').closest('a')
  const stop = event => event.preventDefault()
  window.addEventListener('click', stop)
  try {
    fireEvent.click(link)
  } finally {
    window.removeEventListener('click', stop)
  }
  return decodeURIComponent(link.getAttribute('href'))
}

beforeEach(() => {
  loginAs()
  // CRA 的 resetMocks 會在每個測試前清掉 mock 實作，放在 beforeEach 才有效
  buildURI.mockImplementation(jest.requireActual('react-csv/lib/core').buildURI)
  truncateDecimal.mockImplementation(jest.requireActual('helper/truncateDecimal').default)
})
afterEach(cleanup)

describe('帳單列表效能修正：報表匯出按下才產生', () => {
  it('載入與重畫時不產生 CSV；按下後內容與改版前的 CSVLink 逐字相同（遮罩、欄位、捨入、流水號、會員卡與點數欄）', async () => {
    const { settle } = setup(ORDERS)
    await screen.findByText(/#A001/)
    await settle()
    // 勾選、展開都會重畫列表：不應因此產生 CSV
    fireEvent.click(within(screen.getByText(/^#A001/).closest('tr')).getByLabelText('展開明細'))
    expect(buildURI).not.toHaveBeenCalled()

    const csv = clickExportCsv()
    expect(buildURI).toHaveBeenCalledTimes(1)
    expect(csv).toBe(
      'data:text/csv;charset=utf-8,﻿' +
        [
          '"帳單編號","時間","客戶","設計師","指定","活動券","營業現金應收","服務消費","店販消費","會員卡販賣","卡券使用(入業績)","卡券販賣(入業績)","業績收入","卡券販賣(不入業績)","卡券使用(-)","第三方卡券(-)","其他付款方式(-)","入金使用(-)","點數折抵金額(-)","備註","帳單來源"',
          '"#A001 (S-1)","2026/10/21/(三)","陳*姐 0912***678","王小美/01","Y","0","1601","1201","400","301","33.78","11","1600","3","-34","-5","-7","-100","-20","備註,"引號"","LINE"',
          '"#A002","2026/10/21/(三)","歐陽*明 0933***555","王小美","N","2","1601","1201","400","301","33.78","11","1600","3","-34","-5","-7","-100","-20","",""',
          '"#A003 (S-1)","2026/10/21/(三)","王* ***","王小美/01","Y","0","1601","1201","400","301","33.78","11","1600","3","-34","-5","-7","-100","-20","備註,"引號"","LINE"',
        ].join('\n')
    )
    // 下載屬性與檔名不變
    expect(screen.getByText('報表匯出').closest('a')).toHaveAttribute('download', '帳單列表.csv')
  })

  it('未啟用會員卡、點數、流水號時不含兩欄與流水號；店家設定不遮罩時前端 CSV 仍遮罩', async () => {
    const { settle } = setup(ORDERS, { marked: false, membership: false, bonus: false, serial: false })
    await screen.findByText(/#A001/)
    await settle()
    const csv = clickExportCsv()
    expect(csv.split('\n')[0]).toBe(
      'data:text/csv;charset=utf-8,﻿"帳單編號","時間","客戶","設計師","指定","活動券","營業現金應收","服務消費","店販消費","卡券使用(入業績)","卡券販賣(入業績)","業績收入","卡券販賣(不入業績)","卡券使用(-)","第三方卡券(-)","其他付款方式(-)","入金使用(-)","備註","帳單來源"'
    )
    expect(csv).toContain('"#A001","2026/10/21/(三)","陳*姐 0912***678","王小美/01","Y","0","1601","1201","400","33.78"')
    expect(csv).not.toContain('0912345678')
  })

  it('每次按下都依當下的帳單重新產生（不是沿用第一次的結果）', async () => {
    const { settle } = setup(ORDERS)
    await screen.findByText(/#A001/)
    await settle()
    const first = clickExportCsv()
    const second = clickExportCsv()
    expect(buildURI).toHaveBeenCalledTimes(2)
    expect(second).toBe(first)
  })
})

describe('帳單列表效能修正：列元件 memo', () => {
  it('勾選一列只重畫該列，不重畫整張表', async () => {
    const many = Array.from({ length: 8 }, (_, i) => order({ id: `o-${i}`, orderNo: `B${i}`, serialNumber: null }))
    const { settle } = setup(many)
    await screen.findByText(/#B0/)
    await settle()
    const before = truncateDecimal.mock.calls.length
    fireEvent.click(screen.getByTestId('order-checkbox-3'))
    expect(screen.getByTestId('order-checkbox-3')).toBeChecked()
    expect(screen.getByText('#B3').closest('tr')).toHaveAttribute('data-state', 'selected')
    // 每列重畫呼叫 2 次；重畫整張表是 16 次。只要求遠少於整張表，不綁精確次數
    const rerenderedCalls = truncateDecimal.mock.calls.length - before
    expect(rerenderedCalls).toBeGreaterThan(0)
    expect(rerenderedCalls).toBeLessThanOrEqual(4)
  })
})
