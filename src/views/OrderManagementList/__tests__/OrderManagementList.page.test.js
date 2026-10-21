// 保護「帳單列表」：預設查詢今天整天（以裝置時區的當日 00:00～23:59:59.999）、區間彙總與每張帳單的金額正確顯示（千分位）、
// 建立中的帳單不顯示金額只標示「帳單建立中」、空資料顯示 0 筆。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應。
import React from 'react'
import { cleanup, screen, wait, within } from '@testing-library/react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import OrderManagementList from '..'

jest.setTimeout(20000)

const order = (overrides = {}) => ({
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

const fixtures = (orders = []) => ({
  GET_ORDER_LIST_DATE_AUTH: {
    orderListDateAuth: { lastmonth: true, thismonth: true, dbyesterday: true, yesterday: true, today: true, selector: true },
  },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false },
  GET_ORDER_LIST: {
    getOrderList: {
      intervalSummary: {
        service: orders.reduce((t, o) => t + o.service, 0),
        product: orders.reduce((t, o) => t + o.product, 0),
        usedTicket: 0,
        ticketSellIntoPerformance: 0,
        performanceIncome: orders.reduce((t, o) => t + o.performanceIncome, 0),
        ticketSellNotIntoPerformance: 0,
        usedTicketForDecount: 0,
        thirdPartTicketForDecount: 0,
        otherPayWayForDecount: 0,
        walletUsedForDecount: 0,
        businessCash: orders.reduce((t, o) => t + o.businessCash, 0),
        walletDeposit: 0,
        membership: 0,
        bonusDecountForReport: 0,
      },
      orderList: orders,
    },
  },
  GET_ORDER_STATIC_DETAIL: { getOrderStaticDetail: [] },
})

const setup = orders => renderPage(<OrderManagementList />, { fixtures: fixtures(orders), route: '/management/orders' })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('帳單列表', () => {
  it('預設查詢今天整天的帳單', async () => {
    const { calls } = setup([])
    await wait(() => expect(callsOf(calls, 'GET_ORDER_LIST').length).toBeGreaterThan(0))
    const { dateRange } = callsOf(calls, 'GET_ORDER_LIST')[0].variables.input
    expect(dateRange).toEqual({ startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() })
  })

  it('沒有帳單時顯示 0 筆，不進錯誤畫面', async () => {
    const { settle } = setup([])
    expect(await screen.findByText(/共 0 筆/)).toBeInTheDocument()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  it('列出每張帳單的編號、顧客、設計師與營業現金應收（千分位），並顯示筆數', async () => {
    const { settle } = setup([
      order(),
      order({ id: 'o-2', orderNo: 'A002', customerName: '林先生', customerNo: 'C02', businessCash: 2500, service: 2500, product: 0, performanceIncome: 2500 }),
    ])
    expect(await screen.findByText(/共 2 筆/)).toBeInTheDocument()
    await settle()
    const row1 = screen.getByText('#A001').closest('tr')
    expect(within(row1).getByText(/陳小姐/)).toBeInTheDocument()
    expect(within(row1).getByText('(C01)')).toBeInTheDocument()
    expect(within(row1).getByText(/王小美/)).toBeInTheDocument()
    expect(within(row1).getAllByText('1,600')[0]).toBeInTheDocument()
    const row2 = screen.getByText('#A002').closest('tr')
    expect(within(row2).getAllByText('2,500')[0]).toBeInTheDocument()
    // 區間彙總：營業現金合計 4,100
    expect(screen.getAllByText('4,100')[0]).toBeInTheDocument()
  })

  it('建立中的帳單只標示「帳單建立中」，不顯示金額', async () => {
    const { settle } = setup([order({ status: '建立中', businessCash: 999 })])
    expect(await screen.findByText('帳單建立中')).toBeInTheDocument()
    await settle()
    const row = screen.getByText('#A001').closest('tr')
    expect(within(row).queryByText('999')).toBeNull()
  })
})
