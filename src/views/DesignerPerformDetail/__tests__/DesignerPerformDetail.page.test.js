// 保護「設計師細項分析」：
// - 進頁不查詢；搜尋列選了設計師才以「日期區間＋設計師」查業績、來客、服務項目、店販、帳單紀錄、互助紀錄五支查詢
// - 業績分析：總業績＝服務＋店販，各項占比（分母為 0 時 0.00%，不可顯示 Infinity%）
// - 來客分析：總客次＝指定＋不指定，指定／不指定、男／女／未知占比
// - 服務項目分析：各類別占總服務業績、券使用、客次比，單項指定率，單項客單價（無條件捨去）；客次為 0 時比例與單價為 0
// - 店販分析：占總店販業績比、占總客次比、單項客次單價（無條件捨去，不顯示一長串小數）
// - 帳單紀錄：筆數、帳單編號／日期（台灣時間）、客戶、設計師、指定 Y/N、扣除其他付款／第三方手續費後的服務與店販消費、第三方付款名稱、詳情連結
//   （已知缺口：查詢沒有 status，「帳單狀態」欄空白）
// - 互助紀錄：日期（台灣時間）、帳單編號、服務項目、人員（設計師／代號），金額欄與表頭對齊
// - 查詢失敗時不整頁錯誤
// 報表搜尋列（MerchantSearchBar）換成替身；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfMonth } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { filterWith, headerTexts, lastSearchBar, searchBars } from '../../__tests__/staffReportKit.test'
import DesignerPerformDetail from '..'

jest.mock('components/MerchantSearchBar/index', () => require('../../__tests__/staffReportKit.test').searchBarModule)
jest.setTimeout(20000)

const DAY = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const RANGE = { startDate: new Date(2026, 9, 1).getTime(), endDate: new Date(2026, 9, 31, 23, 59, 59, 999).getTime() }
const ANALYTICS = {
  serviceFake: 6000,
  productSales: 4000,
  useTicketSales: 1500,
  sellTicketSales: 300.4,
  customerAvgAmount: 1000.5,
  designateCustomerCount: 6,
  notDesignateCustomerCount: 4,
  maleCustomerCount: 3,
  femaleCustomerCount: 5,
  unKnowCustomerCount: 2,
}
const SERVICES = [
  { id: 'sc-1', no: 'S1', name: '剪髮', analytics: { serviceFakeTotal: 3000.4, useTicketTotal: 200, customerCount: 3, designateCount: 2, notDesignateCustomer: 1 } },
  { id: 'sc-2', no: 'S2', name: '染髮', analytics: { serviceFakeTotal: 1000, useTicketTotal: 0, customerCount: 0, designateCount: 1, notDesignateCustomer: 0 } },
]
const PRODUCTS = [
  { id: 'pc-1', no: 'P1', name: '洗髮精類', analytics: { productAmountTotal: 1000, customerCount: 3 } },
  { id: 'pc-2', no: 'P2', name: '護髮類', analytics: { productAmountTotal: 0, customerCount: 0 } },
]
const ORDERS = [
  {
    id: 'o-1', no: 'A001', date: DAY, isDesignate: true,
    customer: { id: 'c-1', name: '王客', cellphone: '0912000111' },
    designer: { id: 'u1', name: '小美', designerNo: 'A01' },
    serviceFakeTotal: 1000.4, serviceOtherPayFee: 10, serviceThirdPartyPayFee: 0,
    productFakeTotal: 500.5, productOtherPayFee: 0.2, productThirdPartyPayFee: 0,
    ticketFakeTotal: 300, ticketOtherPayFee: 0, ticketThirdPartyPayFee: 0,
    useTicketTotal: 100, walletPay: 50, amountByOtherPay: 20, payType2: 'LINE Pay', cashTotal: 900,
    serviceOrders: [{ id: 'so-1', price: 1000, thirdPartyPayName: '街口' }, { id: 'so-2', price: 0, thirdPartyPayName: null }],
  },
  {
    id: 'o-2', no: 'A002', date: DAY, isDesignate: false, customer: null, designer: null,
    serviceFakeTotal: 0, serviceOtherPayFee: 0, serviceThirdPartyPayFee: 0, productFakeTotal: 0, productOtherPayFee: 0, productThirdPartyPayFee: 0,
    ticketFakeTotal: 0, ticketOtherPayFee: 0, ticketThirdPartyPayFee: 0, useTicketTotal: 0, walletPay: 0, amountByOtherPay: 0, payType2: '', cashTotal: 0,
    serviceOrders: [],
  },
]
const HELPS = [
  { id: 'h-1', fixCommissionAmount: 100, point: 2, commissionPercent: 10, commissionAmount: 50, serviceOrder: { id: 'so-1', name: '剪髮', order: { id: 'o-1', no: 'A001', date: DAY, previewItem: ['剪髮', '洗髮'], designer: { id: 'u1', name: '小美', designerNo: 'A01' } } } },
  { id: 'h-2', fixCommissionAmount: 0, point: 1, commissionPercent: 0, commissionAmount: 0, serviceOrder: { id: 'so-3', name: '洗髮', order: { id: 'o-3', no: 'A003', date: DAY, previewItem: ['洗髮'], designer: { id: 'u2', name: '阿明', designerNo: null } } } },
]
const FIXTURES = {
  FETCH_DESIGNER_SALES_DETAIL: { user: { salesAnalytics: ANALYTICS } },
  FETCH_SERVICE_CATEGORY_ANALYTICS: { serviceCategories: SERVICES },
  MERCHANT_SALES_ANALYTICS: { productCategories: PRODUCTS },
  DESIGNER_ORDER_RECORDS: { orders: { orders: ORDERS } },
  SERVICE_ORDER_HELPERS: { serviceOrderHelpers: { data: HELPS } },
}
const QUERIES = Object.keys(FIXTURES)
const setup = (extra = {}) => renderPage(<DesignerPerformDetail />, { route: '/designer/perform/detail', fixtures: { ...FIXTURES, ...extra } })
const pickDesigner = async settle => {
  filterWith({ ...lastSearchBar().values, ...RANGE, employeeId: 'u1' })
  await settle()
}
const cardOf = title => screen.getByText(title).closest('.ui-root') || screen.getByText(title).parentElement.parentElement
const rowsOf = root => Array.from(root.querySelectorAll('tbody tr')).map(r => Array.from(r.querySelectorAll('td')).map(td => td.textContent))
const tableOf = title => {
  let el = screen.getByText(title)
  while (el && !el.querySelector('table')) el = el.parentElement
  return el.querySelector('table')
}

beforeEach(() => {
  loginAs()
  searchBars.length = 0
})
afterEach(cleanup)

describe('設計師細項分析：查詢', () => {
  it('進頁不查詢、搜尋列顯示日期／設計師／付款，預設本月到今天、設計師不限', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(QUERIES.map(q => callsOf(calls, q).length)).toEqual([0, 0, 0, 0, 0])
    expect(lastSearchBar()).toMatchObject({
      visible: ['datePicker', 'employee', 'payment'],
      outside: true,
      values: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(new Date()).getTime(), employeeId: '' },
    })
  })

  it('選了設計師才以日期區間＋設計師送出五支查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    await pickDesigner(settle)
    expect(callsOf(calls, 'FETCH_DESIGNER_SALES_DETAIL')[0].variables).toEqual({ input: { id: 'u1' }, date: RANGE })
    expect(callsOf(calls, 'FETCH_SERVICE_CATEGORY_ANALYTICS')[0].variables).toEqual({ input: { ...RANGE, userId: 'u1' } })
    expect(callsOf(calls, 'MERCHANT_SALES_ANALYTICS')[0].variables).toEqual({ input: { paranoid: true }, analytics: { ...RANGE, userId: 'u1' } })
    expect(callsOf(calls, 'DESIGNER_ORDER_RECORDS')[0].variables).toEqual({ input: { ...RANGE, employeeId: 'u1' } })
    expect(callsOf(calls, 'SERVICE_ORDER_HELPERS')[0].variables).toEqual({ input: { ...RANGE, helperId: 'u1' } })
  })
})

describe('設計師細項分析：各區塊', () => {
  it('業績分析與來客分析：合計與占比', async () => {
    const { settle } = setup()
    await settle()
    await pickDesigner(settle)
    expect(rowsOf(tableOf('業績分析'))).toEqual([
      ['10,000', '6,000', '4,000', '1,500', '300'],
      ['100%', '60.00%', '40.00%', '15.00%'],
    ])
    expect(rowsOf(tableOf('來客分析'))).toEqual([
      ['10', '1,000.5', '6', '4', '3', '5', '2'],
      ['60.00%', '40.00%', '30.00%', '50.00%', '20.00%'],
    ])
  })

  it('沒有服務與店販業績時占比顯示 0.00%（不可顯示 Infinity%）；沒有客人時占比為 0.00%', async () => {
    const zero = { ...ANALYTICS, serviceFake: 0, productSales: 0, useTicketSales: 500, designateCustomerCount: 0, notDesignateCustomerCount: 0, maleCustomerCount: 0, femaleCustomerCount: 0, unKnowCustomerCount: 0 }
    const { settle } = setup({ FETCH_DESIGNER_SALES_DETAIL: { user: { salesAnalytics: zero } } })
    await settle()
    await pickDesigner(settle)
    expect(rowsOf(tableOf('業績分析'))[1]).toEqual(['100%', '0.00%', '0.00%', '0.00%'])
    expect(rowsOf(tableOf('來客分析'))[1]).toEqual(['0.00%', '0.00%', '0.00%', '0.00%', '0.00%'])
  })

  it('服務項目分析：各比例、單項指定率、單項客單價（無條件捨去）；客次為 0 時為 0', async () => {
    const { settle } = setup()
    await settle()
    await pickDesigner(settle)
    expect(rowsOf(tableOf('服務項目分析'))).toEqual([
      ['S1', '剪髮', '3,000', '75.00%', '200', '100.00%', '3', '100.00%', '2', '1', '66.67%', '1,000'],
      ['S2', '染髮', '1,000', '25.00%', '0', '0.00%', '0', '0.00%', '1', '0', '0.00%', '0'],
    ])
  })

  it('店販分析：表頭為店販業績比與客次比；單項客次單價無條件捨去；沒有業績時為 0', async () => {
    const { settle } = setup()
    await settle()
    await pickDesigner(settle)
    expect(headerTexts(tableOf('店販分析'))).toEqual(['類別代號', '類別名稱', '店販業績', '占總店販業績比', '客次', '占總客次比', '單項客次單價'])
    expect(rowsOf(tableOf('店販分析'))).toEqual([
      ['P1', '洗髮精類', '1,000', '100.00%', '3', '100.00%', '333'],
      ['P2', '護髮類', '0', '0.00%', '0', '0.00%', '0'],
    ])
  })

  it('帳單紀錄：筆數、台灣日期、客戶、設計師、指定、扣手續費後的消費、第三方付款名稱、詳情連結', async () => {
    const { settle } = setup()
    await settle()
    await pickDesigner(settle)
    expect(screen.getByText('共 2 筆')).toBeInTheDocument()
    const table = tableOf('帳單紀錄')
    expect(headerTexts(table).slice(5, 7)).toEqual(['服務消費(虛)', '店販消費(虛)'])
    // 已知缺口（待 Jason 決定）：DESIGNER_ORDER_RECORDS 查詢沒有 status 欄位，「帳單狀態」欄永遠空白（要補需改查詢）
    expect(rowsOf(table)).toEqual([
      ['A0012026/10/21', '王客0912000111', '小美 / A01', 'Y', '', '990含 街口', '500', '300', '100', '50', '20LINE Pay', '1,491', '900', '詳情'],
      ['A0022026/10/21', '', ' / ', 'N', '', '0', '0', '0', '0', '0', '0', '0', '0', '詳情'],
    ])
    expect(within(table).getAllByText('詳情')[0].closest('a')).toHaveAttribute('href', '/order/o-1')
  })

  it('互助紀錄：日期（台灣時間）、帳單編號、服務項目、人員，金額欄與表頭對齊', async () => {
    const { settle } = setup()
    await settle()
    await pickDesigner(settle)
    const table = tableOf('互助紀錄')
    expect(headerTexts(table)).toEqual(['日期', '帳單編號', '服務項目', '人員', '抽固定金額', '點數', '抽%', '抽%換算'])
    expect(rowsOf(table)).toEqual([
      ['2026/10/21', '#A001', '剪髮、洗髮', '小美 / A01', '100', '2', '10', '50'],
      ['2026/10/21', '#A003', '洗髮', '阿明', '0', '1', '0', '0'],
    ])
  })

  it('查詢失敗時不整頁錯誤、不顯示區塊', async () => {
    const failed = Object.fromEntries(QUERIES.map(q => [q, new Error('查詢失敗')]))
    const { settle } = setup(failed)
    await settle()
    await pickDesigner(settle)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('設計師細項分析')).toBeInTheDocument()
    expect(document.querySelector('table')).toBeNull()
  })

  it('後端回空資料時不顯示區塊', async () => {
    const { settle } = setup({
      FETCH_DESIGNER_SALES_DETAIL: { user: { salesAnalytics: null } },
      FETCH_SERVICE_CATEGORY_ANALYTICS: { serviceCategories: null },
      MERCHANT_SALES_ANALYTICS: { productCategories: null },
      DESIGNER_ORDER_RECORDS: { orders: { orders: null } },
      SERVICE_ORDER_HELPERS: { serviceOrderHelpers: null },
    })
    await settle()
    await pickDesigner(settle)
    await wait(() => expect(document.querySelector('table')).toBeNull())
    expect(cardOf('設計師細項分析')).toBeTruthy()
  })
})
