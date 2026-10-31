// 依「操作名稱」給的假資料（畫面掃描用，不連任何後端）。
// 為什麼要有：自動補齊只看欄位名稱猜「清單或物件」，同一個名稱在不同查詢裡形狀可能不同
// （例如 moneyFlow 在報表是清單、在收支詳細依 id 讀單筆是物件；nonCashDetailStatement 外層是物件、內層同名欄位是清單），
// 名稱也常常看不出是清單（designerMonthlyReport、increaseItem…）。這些查詢在這裡逐一寫出形狀。
// 規則：值寫 [] 表示清單（空清單）、寫 [{…}] 表示有一筆（沒寫到的欄位由 fake-graphql 的 fill 自動補齊）、
// 寫物件表示物件。只需要寫到「自動補齊會猜錯」的那一層。
// 每一項都對應 e2e/known-issues.js 移除前的「假資料不足」頁面；改查詢時順手對照。
const NOW = Date.parse('2026-10-30T02:00:00.000Z')

const subject = { id: 'as-1', name: '雜支', number: '6001', inoutType: 'EXPENDITURE' }
const person = { id: 'user-1', name: '測試店長', designerNo: 'D001' }
const categoriesPerformance = [{ categoriesName: '剪髮', performance: 1000, count: 2 }]
const businessRow = {
  cutomerCount: 0,
  productPerformance: 0,
  totalPerformance: 0,
  totalIncome: 0,
  serviceCategoriesPerformance: categoriesPerformance,
}
const performanceSummary = { categoryData: [] }

module.exports = {
  // 收支詳細（四個路由）：依 id 讀單筆
  GET_MONEY_FLOW: {
    moneyFlow: {
      id: 'mf-1',
      date: NOW,
      accountingSubject: subject,
      amount: 1000,
      inoutType: 'EXPENDITURE',
      user: person,
      walletType: null,
      remark: '',
      relationUser: null,
    },
  },
  GET_BUSINESS_ITEMS_MOTHLY_REPORT: {
    businessItemsMonthlyReport: {
      businessItemsReportData: [{ ...businessRow, date: NOW }],
      businessItemsReportDataTotal: businessRow,
      businessItemsReportDataDesignation: businessRow,
      businessItemsReportDataNonDesignation: businessRow,
      businessItemsReportDataDesignationProportion: businessRow,
      businessItemsReportDataPerformanceProportion: businessRow,
    },
  },
  GET_ACCOUNTING_TYPE: { getAccountingType: ['現金', '匯款'] },
  GET_CUSTOMER_BONUS_DEPOSIT_RECORD: {
    customerBonusDepositRecord: { customerId: 'cus-1', date: NOW, bonus: 100, designerId: 'user-1', remark: '' },
  },
  // 活動與規則：日期欄位名稱（*Default、*ForGroup）看不出是時間戳
  GET_MERCHANT_EVENT: {
    mainEvent: {
      nameDefault: '週年慶',
      startDateDefault: NOW,
      endDateDefault: NOW,
      endDateActual: NOW,
      isSMSNotifyDefault: false,
      maxCountDefault: 1,
      isUsingDefault: true,
      isPublic: false,
      merchantIds: ['merchant-1'],
    },
  },
  GET_MERCHANT_EVENT_FOR_RULES: {
    mainEvent: { nameDefault: '週年慶', startDateDefault: NOW, endDateDefault: NOW, isSMSNotifyDefault: false, maxCountDefault: 1 },
  },
  GET_EVENT_RULE_GROUP: {
    eventRuleGroup: {
      mainEventId: 'id-1',
      nameForGroup: '滿額贈',
      nameDefault: '週年慶',
      startDateDefault: NOW,
      endDateDefault: NOW,
      startDateForGroup: NOW,
      endDateForGroup: NOW,
      endDateActual: NOW,
      isSMSNotifyForGroup: false,
      maxCountForGroup: 1,
      maxCountPerOrder: 1,
      maxCountDefault: 1,
      thresholdPrice: 0,
      consumptionTypeUsing: false,
      consumptionTypeRules: [],
      payTypeUsing: false,
      merchants: [{ id: 'merchant-1' }],
      walletDepositRules: [],
    },
  },
  GET_LINE_CONNECTED_USER: { getLineConnectedUser: [] },
  // 佇列帳單：後端回 JSON 字串
  GET_ORDER_INPUT_BY_QUEUE_ID: {
    getOrderInputByQueueId: JSON.stringify({
      no: 'Q001',
      date: NOW,
      isDesignate: false,
      isReserved: false,
      payType: 'CASH',
      amountByOtherPay: 0,
      walletPay: 0,
      designerId: 'user-1',
      serviceOrders: [],
      productOrders: [],
      ticketOrders: [],
      membershipOrders: [],
      remark: '',
      withoutCustomerData: true,
      isPending: false,
    }),
  },
  // 兩支查詢共用這個操作名稱（單日與單週），根欄位不同
  getMerchantDesignerCalendar: {
    getMerchantDesignerCalendar: { merchantDesignerCalendar: [], nonDesignateCalendar: { designerName: null, calendar: [] } },
    getMerchantDesignerWeekCalendar: { merchantDesignerCalendar: [], merchantUnappointCalendar: [] },
  },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  GET_EVENT_JOIN_MERCHANTS: { eventJoinedMerchants: JSON.stringify({ allMerchants: [], groups: [], merchants: [] }) },
  GET_USER_SALARY_ITEM: { userSalaryItemRecord: { userId: 'user-1', increaseItem: [], decreaseItem: [] } },
  GET_CUSTOMER_COUPON_BALANCE: { customerCouponBalanceReport: [] },
  GET_CUSTOMER_WALLET_BALANCE: { customerWalletReport: { customerWalletReport: [], pageLimit: 10, pageOffset: 0, totalCount: 0 } },
  GET_DESIGNER_MONTHLY_REPORT: { designerMonthlyReport: [] },
  GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: { designerPerforamnceAnalyzeReport: [] },
  FETCH_DESIGNERS_LEADERBOARD: { designerLeaderboard: { designerLeaderBoard: [], monthlyAveragePerformanceTotal: 0 } },
  FETCH_HELPER_LEADERBOARD: { helperLeaderboard: [] },
  USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: [{ label: '剪髮', value: 'CUT' }] },
  USE_FETCH_GET_ATTRIBUTIONS: { getAttribution: [{ name: '剪髮', value: 'CUT' }] },
  MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: [] },
  GET_HELPER_DAILY_REPORT: { helperDailyReport: [] },
  GET_HELPER_PERFORMANCE: { helperPerformanceReport: [] },
  FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: {
    merchantImmediatePerformanceReport: {
      wholeStore: performanceSummary,
      users: [{ ...performanceSummary, userId: 'user-1', userName: '測試店長' }],
    },
  },
  FETCH_DESIGNERS_SALARY_DETAIL: {
    getUserSalaryDetail: { userSalaryDetail: [], usingSalaryIncreaseItem: [], usingSalaryDecreaseItem: [] },
  },
  GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE: { merchantIncomeStatementV2ForOuterStore: [] },
  GET_INVENTORYS: { getInventorys: { draft: [], checked: [] } },
  GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT: {
    getMerchantPointValueSetting: { id: 'id-1', name: '一般', retrievePointWay: 'FIXED', retrieveFixed: 0, retrieveSegmentSetting: [] },
  },
  GET_USER_MERCHANTS_FOR_MANAGEMENT: { advancedManagerMerchants: JSON.stringify({ allMerchants: [], groups: [], merchants: [] }) },
  FETCH_USED_TICKET_RECORDS: { usedTicketRecords: { data: [], pageLimit: 10, pageOffset: 0, totalCount: 0 } },
  FETCH_TICKET_SELL_OVERVIEW: { ticketSellOverview: [] },
  GET_MEMBERSHIP_SELL_REPORT: { membershipSellReport: [] },
  FETCH_GET_USER_SALARY_TRANSFER_REPORT: { userSalaryTransferReport: [] },
  FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT: { merchantDailyPerformanceReport: [{ date: NOW, performance: performanceSummary }] },
  GET_VENDOR: { getVendor: [] },
  GET_MONEY_FLOW_CATEGORY_REPORT: {
    moneyFlowCategoryReport: { revenueSummary: 0, expenditureSummary: 0, moneyFlowCategoryReport: [] },
  },
  GET_MONEY_FLOW_TRANSFER_REPORT: { moneyFlowTransferReport: [] },
  GET_MMULTI_MERCHANTS_LEADER_BOARD: { multiMerchantsLeaderBoard: [] },
  GET_NON_CASH_DETAIL_STATEMENT: {
    nonCashDetailStatement: { nonCashDetailStatement: [], summary: {}, thirdPartTicketUsing: [], otherPayUsing: [] },
  },
  GET_MERCHANT_OTHER_PAYMENT_REPORT: { merchantOtherPayWayDetailReport: { merchantOtherPayWayDetailReport: [], usedPayType: [] } },
  GET_PRODUCT_INVOICING_RECORD_REPOPT: { productInvoicingRecordReport: [] },
  GET_PRODUCT_LEADERBOAED_V2: { getProductLeaderBoardV2: [] },
  FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: { getUserServiceDeductionDetialMultiple: [] },
  GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: [{ id: 'id-1', name: '第三方券', type: 'NORMAL', handlingFee: 0, isNoCash: false }] },
  GET_CONSUMPTION_ANALYTICS_DASHDOARD: {
    consumptionAnalyticsDashboard: {
      orderCustomer: {
        orderAgeDistribution: [],
        customerConsumptionRanking: {
          customerConsumptionCountRanking: [],
          customerConsumptionPriceRanking: [],
          customerConsumptionPricePerCountRanking: [],
        },
        sourceRatio: [],
      },
      weeklyOrderCountRanking: [],
      productSalesRanking: { productSalesVolumeRanking: [], productSalesPriceRanking: [] },
      performanceTrend: [],
    },
  },
}
