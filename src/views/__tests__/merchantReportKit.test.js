// 店家日報表、店家區間累計表共用的測試資料（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試；被 import 時只提供資料與函式）。
// 數字刻意帶小數，驗證畫面四捨五入；分類有一筆全 0（不顯示）。
const isMain = expect.getState().testPath === __filename

export const CATEGORIES = [
  { name: '剪髮', performance: 6000, totalCount: 6, designationCount: 4, nonDesignationCount: 2, orderTypeCount: 7, orderTypeAveragePerformance: 857.14, averagePerformance: 1000 },
  { name: '染髮', performance: 8001, totalCount: 4, designationCount: 2, nonDesignationCount: 2, orderTypeCount: 4, orderTypeAveragePerformance: 2000.25, averagePerformance: 2000.25 },
  { name: '燙髮', performance: 0, totalCount: 0, designationCount: 0, nonDesignationCount: 0, orderTypeCount: 0, orderTypeAveragePerformance: 0, averagePerformance: 0 },
]

export const CURRENT_DAY = {
  service: 10000.4,
  product: 2000.6,
  usedTicket: 500,
  ticketSellIntoPerformance: 1500,
  performanceIncome: 14001,
  ticketSellNotIntoPerformance: 800,
  usedTicketForDecount: 300,
  thirdPartTicketForDecount: 200,
  otherPayWayForDecount: 1000,
  walletUsedForDecount: 400,
  businessCash: 12101,
  orderDesignateCount: 6,
  orderNonDesignateCount: 4,
  orderCount: 10,
  orderAveragePrice: 1400.1,
  walletDepositTotal: 3000,
  walletUsedTotal: 400,
  ticketSellTotal: 2300,
  ticketUsedTital: 800,
  membership: 0,
  categoryPerformance: CATEGORIES,
}

const flow = (subjectNumber, subjectName, cashRevenue, cashExpenditure, remark = '') => ({ subjectNumber, subjectName, cashRevenue, cashExpenditure, remark })

export const dailyReport = (currentDay = {}, extra = {}) => ({
  currentDay: { ...CURRENT_DAY, ...currentDay },
  pickingRecord: [],
  generalMoneyFlow: [flow('G1', '營業收入', 12101.234, 0)],
  moneyFlow: [flow('4101', '學費', 500, 0, '十月'), flow('5101', '水電', 0, 300.555)],
  moneyFlowNotCash: [flow('6101', '匯款', 0, 10000)],
  businessCash: 12101,
  cashBalance: 12300.6,
  summaryRevenue: 12601,
  summaryExpenditure: 300.555,
  orderTotalCount: 10,
  orderDesignateCount: 6,
  orderNonDesignateCount: 4,
  orderMaleCount: 3,
  orderFemaleCount: 6,
  orderUnknownCount: 1,
  ...extra,
})

export const DASHBOARD = {
  intervalSummary: {},
  otherPayway: [
    { paywayName: 'LINE Pay', usedPrice: 1500, usedPriceWithNoCash: 1200 },
    { paywayName: '街口', usedPrice: 300, usedPriceWithNoCash: 300 },
  ],
  thirdPartTicket: [
    { ticketName: '旅遊券', usedPrice: 200, usedPriceWithNoCash: 200 },
    { ticketName: 'LINE Pay', usedPrice: 100, usedPriceWithNoCash: 0 },
  ],
  walletDeposit: [{ paywayName: '現金', usedPrice: 3000, usedPriceWithNoCash: 0 }],
}

// 第 i 個表格（含相容層表格）的每一列儲存格文字
export const tableRows = table =>
  [...table.querySelectorAll('tr')].map(tr => [...tr.querySelectorAll('th, td')].map(cell => cell.textContent))
export const tableWith = text => [...document.querySelectorAll('table')].find(table => table.textContent.includes(text))

if (isMain) {
  describe('merchantReportKit', () => {
    it('dailyReport 以預設資料補上覆寫的欄位', () => {
      expect(dailyReport({ membership: 5 }, { businessCash: 1 })).toMatchObject({ currentDay: { membership: 5, service: 10000.4 }, businessCash: 1 })
    })
  })
}
