// src/hooks 契約測試（4/6）：useFetchGetUserOrderableList ～ useFetchServiceOrderHelpers
// 保護什麼：頁面透過這些 hook 讀寫後端，hook 一旦把參數組錯（漏了店家 id、日期、帳單內容）、快取策略寫錯
// （設定類應為 cache-first 並登記 settingsQuery、交易與報表應為 cache-and-network），或回傳值形狀變了，
// 頁面會送出錯誤的帳單／顯示舊資料／整頁拋錯。每一列鎖住一個 hook 的完整契約（量測方式見 hookContract.test.js）：
//   expect     登入狀態下掛載後送出的查詢與 variables、回傳值形狀、呼叫回傳函式（mutation／lazy query）送出的內容、
//              mutation Promise 解析出的 data 欄位、每支查詢實際的 fetchPolicy
//   loggedOut  沒有 userMerchant 時（hook 讀 localStorage 的店家 id 者）送出的內容：店家 id 為 null、不拋錯
//   noArgs／withDefaults  不帶參數或省略有預設值的欄位時送出的預設值
//   failure    API 失敗時頁面拿到的形狀：loading 結束、帶 error、data 為 undefined（頁面據此防呆，hook 不拋錯）
// args 裡的 'xxx-v'、{ probe: 'xxx' } 是標記值，用來確認 hook 把頁面給的參數原樣（或依規則組合後）放進 variables。
// 改 hook 的查詢條件或快取策略是有意的，就同步改這裡對應的列；不是有意的，這裡會失敗。
import { runContractRows } from './hookContract.test'
import * as useFetchGetUserOrderableList from 'hooks/useFetchGetUserOrderableList'
import * as useFetchGetUserPinnedTable from 'hooks/useFetchGetUserPinnedTable'
import * as useFetchGetUserPinnedTableSettings from 'hooks/useFetchGetUserPinnedTableSettings'
import * as useFetchGetUserSalaryDetailExcel from 'hooks/useFetchGetUserSalaryDetailExcel'
import * as useFetchGetUserSalaryExcel from 'hooks/useFetchGetUserSalaryExcel'
import * as useFetchGetUserSalaryTransferReport from 'hooks/useFetchGetUserSalaryTransferReport'
import * as useFetchGetUserServiceDeductionDetailMultiple from 'hooks/useFetchGetUserServiceDeductionDetailMultiple'
import * as useFetchGetUsingOrderQueue from 'hooks/useFetchGetUsingOrderQueue'
import * as useFetchGetVendor from 'hooks/useFetchGetVendor'
import * as useFetchGetVoucherIssuanceRecord from 'hooks/useFetchGetVoucherIssuanceRecord'
import * as useFetchGetisDailyCheckoutBlockedByDraftOrder from 'hooks/useFetchGetisDailyCheckoutBlockedByDraftOrder'
import * as useFetchGetMerchantIncomeStatementV2Excel from 'hooks/useFetchGetMerchantIncomeStatementV2Excel'
import * as useFetchHelperLeaderboard from 'hooks/useFetchHelperLeaderboard'
import * as useFetchIsPriceDisplayOnDailyReport from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import * as useFetchIsSalaryChecked from 'hooks/useFetchIsSalaryChecked'
import * as useFetchIsSalaryitemLocked from 'hooks/useFetchIsSalaryitemLocked'
import * as useFetchLoginSMS from 'hooks/useFetchLoginSMS'
import * as useFetchLoginV2 from 'hooks/useFetchLoginV2'
import * as useFetchMerchant from 'hooks/useFetchMerchant'
import * as useFetchMerchantBankSettings from 'hooks/useFetchMerchantBankSettings'
import * as useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import * as useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import * as useFetchMerchantDailyReportV3 from 'hooks/useFetchMerchantDailyReportV3'
import * as useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import * as useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import * as useFetchMerchantDesignateTimeNonDesignateBookingLimit from 'hooks/useFetchMerchantDesignateTimeNonDesignateBookingLimit'
import * as useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import * as useFetchMerchantDesigners from 'hooks/useFetchMerchantDesigners'
import * as useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import * as useFetchMerchantImmediatePerformanceReport from 'hooks/useFetchMerchantImmediatePerformanceReport'
import * as useFetchMerchantIncomeStatementV2 from 'hooks/useFetchMerchantIncomeStatementV2'
import * as useFetchMerchantIncomeStatementV2ForOuterStore from 'hooks/useFetchMerchantIncomeStatementV2ForOuterStore'
import * as useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import * as useFetchMerchantLatestMonthlyCheckoutTime from 'hooks/useFetchMerchantLatestMonthlyCheckoutTime'
import * as useFetchMerchantLeaderBoard from 'hooks/useFetchMerchantLeaderBoard'
import * as useFetchMerchantMonthlyCheckoutRemark from 'hooks/useFetchMerchantMonthlyCheckoutRemark'
import * as useFetchMerchantOtherPayWayDetailReport from 'hooks/useFetchMerchantOtherPayWayDetailReport'
import * as useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import * as useFetchMerchantPayWays from 'hooks/useFetchMerchantPayWays'
import * as useFetchMerchantSalaryDecreaseItems from 'hooks/useFetchMerchantSalaryDecreaseItems'
import * as useFetchMerchantSalaryIncreaseItems from 'hooks/useFetchMerchantSalaryIncreaseItems'
import * as useFetchMoneyAccountDetail from 'hooks/useFetchMoneyAccountDetail'
import * as useFetchMoneyFlowCategoryReport from 'hooks/useFetchMoneyFlowCategoryReport'
import * as useFetchMoneyFlowDailyReport from 'hooks/useFetchMoneyFlowDailyReport'
import * as useFetchMoneyFlowTransferReport from 'hooks/useFetchMoneyFlowTransferReport'
import * as useFetchMultipleUpdateMembershipCategory from 'hooks/useFetchMultipleUpdateMembershipCategory'
import * as useFetchNonCashDetailStatement from 'hooks/useFetchNonCashDetailStatement'
import * as useFetchNonDesignationBooking from 'hooks/useFetchNonDesignationBooking'
import * as useFetchOrder from 'hooks/useFetchOrder'
import * as useFetchOrderWithoutCustomerDefault from 'hooks/useFetchOrderWithoutCustomerDefault'
import * as useFetchOrders from 'hooks/useFetchOrders'
import * as useFetchPayment from 'hooks/useFetchPayment'
import * as useFetchPayments from 'hooks/useFetchPayments'
import * as useFetchProduct from 'hooks/useFetchProduct'
import * as useFetchProductCategories from 'hooks/useFetchProductCategories'
import * as useFetchProductCategory from 'hooks/useFetchProductCategory'
import * as useFetchProductConsumeList from 'hooks/useFetchProductConsumeList'
import * as useFetchProductOrders from 'hooks/useFetchProductOrders'
import * as useFetchProductTreeview from 'hooks/useFetchProductTreeview'
import * as useFetchProducts from 'hooks/useFetchProducts'
import * as useFetchProfile from 'hooks/useFetchProfile'
import * as useFetchReCheckoutOrder from 'hooks/useFetchReCheckoutOrder'
import * as useFetchReCheckoutOrderFromQueue from 'hooks/useFetchReCheckoutOrderFromQueue'
import * as useFetchRedoEmployeeSchedule from 'hooks/useFetchRedoEmployeeSchedule'
import * as useFetchRegister from 'hooks/useFetchRegister'
import * as useFetchService from 'hooks/useFetchService'
import * as useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import * as useFetchServiceCategory from 'hooks/useFetchServiceCategory'
import * as useFetchServiceCategoryCreate from 'hooks/useFetchServiceCategoryCreate'
import * as useFetchServiceOrderHelpers from 'hooks/useFetchServiceOrderHelpers'

const ROWS = [
  {
    id: 'useFetchGetUserOrderableList',
    hook: useFetchGetUserOrderableList.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_USERS_ORDERABLE_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserOrderableList'] },
      policies: { GET_USERS_ORDERABLE_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserPinnedTable',
    hook: useFetchGetUserPinnedTable.default,
    args: [{ skip: false }],
    expect: {
      initial: [{ operationName: 'GET_USERS_PINNED_TABLE', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserPinnedTable'] },
      policies: { GET_USERS_PINNED_TABLE: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_USERS_PINNED_TABLE', variables: {} }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserPinnedTableSettings',
    hook: useFetchGetUserPinnedTableSettings.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_USER_PINNED_TABLE_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserPinnedTableSettings'] },
      policies: { GET_USER_PINNED_TABLE_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserSalaryDetailExcel.useFetchGetUserSalaryDetailExceLazy',
    hook: useFetchGetUserSalaryDetailExcel.useFetchGetUserSalaryDetailExceLazy,
    args: [],
    invoke: [{ fn: 'getUserSalaryDetailExceLazy', args: [{ variables: { date: 'date-v' } }] }],
    expect: {
      initial: [],
      shape: {
        getUserSalaryDetailExceLazy: 'function',
        getUserSalaryDetailExceLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'getUserSalaryDetailExceLazy',
          calls: [{ operationName: 'GET_USER_SALARY_DETAIL_EXCEL', variables: { date: 'date-v' } }],
        },
      ],
      shapeAfter: {
        getUserSalaryDetailExceLazy: 'function',
        getUserSalaryDetailExceLazyData: { loading: false, called: true, data: ['getUserSalaryDetailExcel'] },
      },
      policies: { GET_USER_SALARY_DETAIL_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUserSalaryExcel.useFetchGetUserSalaryExcelLazy',
    hook: useFetchGetUserSalaryExcel.useFetchGetUserSalaryExcelLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { date: 'date-v', designerId: 'designerId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_USER_SALARY_EXCEL', variables: { date: 'date-v', designerId: 'designerId-v' } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['userSalaryReportExcel'] }],
      policies: { GET_USER_SALARY_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUserSalaryTransferReport',
    hook: useFetchGetUserSalaryTransferReport.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_GET_USER_SALARY_TRANSFER_REPORT', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['userSalaryTransferReport'] },
      policies: { FETCH_GET_USER_SALARY_TRANSFER_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserServiceDeductionDetailMultiple',
    hook: useFetchGetUserServiceDeductionDetailMultiple.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getUserServiceDeductionDetialMultiple'] },
      policies: { FETCH_USER_SERVICE_DEDUCTION_DETAIL_MULTIPLE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUsingOrderQueue',
    hook: useFetchGetUsingOrderQueue.default,
    args: [{ skip: false }],
    expect: {
      initial: [{ operationName: 'GET_USING_ORDER_QUEUE', variables: {} }],
      shape: { loading: false, called: true, data: ['getUsingOrderQueue'] },
      policies: { GET_USING_ORDER_QUEUE: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_USING_ORDER_QUEUE', variables: {} }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetVendor',
    hook: useFetchGetVendor.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_VENDOR', variables: {} }],
      shape: { loading: false, called: true, data: ['getVendor'] },
      policies: { GET_VENDOR: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetVendor.useFetchGetMerchantVendorList',
    hook: useFetchGetVendor.useFetchGetMerchantVendorList,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_VENDOR_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantVendorList'] },
      policies: { GET_MERCHANT_VENDOR_LIST: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetVendor.useFetchGetMerchantVendor',
    hook: useFetchGetVendor.useFetchGetMerchantVendor,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'getMerchantVendor', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getMerchantVendor'] },
      policies: { getMerchantVendor: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetVoucherIssuanceRecord.useFetchGetVoucherIssuanceRecordLazy',
    hook: useFetchGetVoucherIssuanceRecord.useFetchGetVoucherIssuanceRecordLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'FETCH_GET_VOUCHER_ISSUANCE_RECORD', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['voucherIssuanceRecord'] }],
      policies: { FETCH_GET_VOUCHER_ISSUANCE_RECORD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetisDailyCheckoutBlockedByDraftOrder',
    hook: useFetchGetisDailyCheckoutBlockedByDraftOrder.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDailyCheckoutBlockedByDraftOrder'] },
      policies: { GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantIncomeStatementV2Excel',
    hook: useFetchGetMerchantIncomeStatementV2Excel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { date: 'date-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL', variables: { date: 'date-v' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['merchantIncomeStatementV2Excel'] }],
      policies: { GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchHelperLeaderboard',
    hook: useFetchHelperLeaderboard.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_HELPER_LEADERBOARD', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['helperLeaderboard'] },
      policies: { FETCH_HELPER_LEADERBOARD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchIsPriceDisplayOnDailyReport',
    hook: useFetchIsPriceDisplayOnDailyReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT', variables: {} }],
      shape: { loading: false, called: true, data: ['getPriceDisplayOnDailyReportDefault'] },
      policies: { GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchIsPriceDisplayOnDailyReport.useFetchIsPriceDisplayOnDailyReportSettingLazy',
    hook: useFetchIsPriceDisplayOnDailyReport.useFetchIsPriceDisplayOnDailyReportSettingLazy,
    args: [],
    invoke: [{ fn: 'fetchIsPriceDisplayOnDailyReportSettingLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: {
        fetchIsPriceDisplayOnDailyReportSettingLazy: 'function',
        isPriceDisplayOnDailyReportSettingLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchIsPriceDisplayOnDailyReportSettingLazy',
          calls: [{ operationName: 'GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT', variables: {} }],
        },
      ],
      shapeAfter: {
        fetchIsPriceDisplayOnDailyReportSettingLazy: 'function',
        isPriceDisplayOnDailyReportSettingLazyData: {
          loading: false,
          called: true,
          data: ['getPriceDisplayOnDailyReportDefault'],
        },
      },
      policies: { GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: 'cache-first' },
    },
  },
  {
    id: 'useFetchIsSalaryChecked',
    hook: useFetchIsSalaryChecked.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_IS_SALARY_CHECKED', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['isSalaryChacked'] },
      policies: { FETCH_IS_SALARY_CHECKED: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchIsSalaryitemLocked',
    hook: useFetchIsSalaryitemLocked.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_SALARY_ITEM_LOCK', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['isSalaryitemLocked'] },
      policies: { FETCH_SALARY_ITEM_LOCK: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchLoginSMS',
    hook: useFetchLoginSMS.default,
    args: [],
    invoke: [{ fn: 'loginSMS', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { loginSMS: 'function' },
      invoked: [
        {
          fn: 'loginSMS',
          calls: [{ operationName: 'LoginSMS', variables: { input: { probe: 'input' } } }],
          resolved: ['customerLoginSMS'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchLoginV2',
    hook: useFetchLoginV2.default,
    args: [],
    invoke: [{ fn: 'loginV2', args: [{ cellphone: 'cellphone-v', password: 'password-v', isKeepLogin: true }] }],
    expect: {
      initial: [],
      shape: { loginV2: 'function' },
      invoked: [
        {
          fn: 'loginV2',
          calls: [
            {
              operationName: 'LOGINV2',
              variables: { input: { cellphone: 'cellphone-v', password: 'password-v', isKeepLogin: true } },
            },
          ],
          resolved: ['userLoginV2'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchMerchant',
    hook: useFetchMerchant.default,
    args: [],
    expect: {
      initial: [{ variables: {} }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchant.useFetchMerchantPermission',
    hook: useFetchMerchant.useFetchMerchantPermission,
    args: [],
    expect: {
      // 查詢名稱維持原本的 FETCH_THIRDPARTYS（與第三方卡券查詢同名；後端可能依名稱記錄或判斷，前端不改名，Jason 2026/10/22）
      initial: [{ operationName: 'FETCH_THIRDPARTYS', variables: {} }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { FETCH_THIRDPARTYS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchant.useFetchTHirdPartys',
    hook: useFetchMerchant.useFetchTHirdPartys,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_THIRDPARTYS', variables: {} }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { FETCH_THIRDPARTYS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchant.useFetchThirdPartysInOrderDetail',
    hook: useFetchMerchant.useFetchThirdPartysInOrderDetail,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_THIRDPARTYS_IN_ORDER_DETAIL', variables: {} }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { FETCH_THIRDPARTYS_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchant.useFetchThirdPartysForCreateOrder',
    hook: useFetchMerchant.useFetchThirdPartysForCreateOrder,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_THIRDPARTYS_FOR_CREATE_ORDER', variables: {} }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { FETCH_THIRDPARTYS_FOR_CREATE_ORDER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchant.useFethcMonthlyCloseStatus',
    hook: useFetchMerchant.useFethcMonthlyCloseStatus,
    args: ['date-v'],
    expect: {
      initial: [{ operationName: 'FETCH_MONTHLY_CLOSE_STATUS', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchant'] },
      policies: { FETCH_MONTHLY_CLOSE_STATUS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantBankSettings',
    hook: useFetchMerchantBankSettings.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_BANK_SETTINGS', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantBankSettings'] },
      policies: { GET_MERCHANT_BANK_SETTINGS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantCommissionWay',
    hook: useFetchMerchantCommissionWay.default,
    args: [],
    expect: {
      initial: [{ operationName: 'MERCHANT_COMMISSION_WAY', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantCommissionWay'] },
      policies: { MERCHANT_COMMISSION_WAY: 'cache-first' },
    },
    loggedOut: { initial: [{ operationName: 'MERCHANT_COMMISSION_WAY', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantCustomerCategory',
    hook: useFetchMerchantCustomerCategory.default,
    args: [],
    expect: {
      initial: [{ operationName: 'CUSTOMER_CATEGORY', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantCustomerCategory'] },
      policies: { CUSTOMER_CATEGORY: 'cache-first' },
    },
    loggedOut: { initial: [{ operationName: 'CUSTOMER_CATEGORY', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDailyReportV3',
    hook: useFetchMerchantDailyReportV3.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'FETCH_MERCHANT_DAILY_REPORTV3', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['merchantDailyReportV2'] },
      policies: { FETCH_MERCHANT_DAILY_REPORTV3: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDashboard',
    hook: useFetchMerchantDashboard.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'FETCH_MERCHNAT_DASHBOARD', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['merchantDashboard'] },
      policies: { FETCH_MERCHNAT_DASHBOARD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDeductionItems',
    hook: useFetchMerchantDeductionItems.default,
    args: [],
    expect: {
      initial: [{ operationName: 'MERCHANT_DEDUCTION_ITEMS', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantDeductionItems'] },
      policies: { MERCHANT_DEDUCTION_ITEMS: 'cache-first' },
    },
    loggedOut: { initial: [{ operationName: 'MERCHANT_DEDUCTION_ITEMS', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDesignateTimeNonDesignateBookingLimit',
    hook: useFetchMerchantDesignateTimeNonDesignateBookingLimit.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_NON_DESIGNATE_BOOKING_LIMIT', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchantDesignateTimeNonDesignateBookingLimit'] },
      policies: { FETCH_NON_DESIGNATE_BOOKING_LIMIT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDesigner',
    hook: useFetchMerchantDesigner.default,
    args: [{ designerId: 'designerId-v' }],
    expect: {
      initial: [{ operationName: 'DESIGNER', variables: { designerId: 'designerId-v' } }],
      shape: { loading: false, called: true, data: ['merchantDesigner'] },
      policies: { DESIGNER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDesigner.useFetcDesignerFixedSalaryItemsLazy',
    hook: useFetchMerchantDesigner.useFetcDesignerFixedSalaryItemsLazy,
    args: [],
    invoke: [{ fn: 'fetcDesignerFixedSalaryItemsLazy', args: [{ variables: { designerId: 'designerId-v' } }] }],
    expect: {
      initial: [],
      shape: {
        fetcDesignerFixedSalaryItemsLazy: 'function',
        designerFixedSalaryItemsLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetcDesignerFixedSalaryItemsLazy',
          calls: [{ operationName: 'FETCH_DESIGNER_FIXED_SALARY_ITEMS', variables: { designerId: 'designerId-v' } }],
        },
      ],
      shapeAfter: {
        fetcDesignerFixedSalaryItemsLazy: 'function',
        designerFixedSalaryItemsLazyData: { loading: false, called: true, data: ['merchantDesigner'] },
      },
      policies: { FETCH_DESIGNER_FIXED_SALARY_ITEMS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchMerchantDesigner.useFetcDesignerInOrderDetail',
    hook: useFetchMerchantDesigner.useFetcDesignerInOrderDetail,
    args: [{ designerId: 'designerId-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_DESIGNER_IN_ORDER_DETAIL', variables: { designerId: 'designerId-v' } }],
      shape: { loading: false, called: true, data: ['merchantDesigner'] },
      policies: { FETCH_DESIGNER_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantDesigners',
    hook: useFetchMerchantDesigners.default,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_DESIGNERS', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantDesigners'] },
      policies: { FETCH_DESIGNERS: 'cache-and-network' },
    },
    loggedOut: { initial: [{ operationName: 'FETCH_DESIGNERS', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantHelperItems',
    hook: useFetchMerchantHelperItems.default,
    args: [],
    expect: {
      initial: [{ operationName: 'MERCHANT_HELPER_ITEMS', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantHelperItems'] },
      policies: { MERCHANT_HELPER_ITEMS: 'cache-first' },
    },
    loggedOut: { initial: [{ operationName: 'MERCHANT_HELPER_ITEMS', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantImmediatePerformanceReport',
    hook: useFetchMerchantImmediatePerformanceReport.default,
    args: [{ input: { probe: 'input' }, displayReference: 'displayReference-v' }],
    expect: {
      initial: [
        {
          operationName: 'FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT',
          variables: { input: { probe: 'input' }, displayReference: 'displayReference-v' },
        },
      ],
      shape: { loading: false, called: true, data: ['merchantImmediatePerformanceReport'] },
      policies: { FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT: 'cache-and-network' },
    },
    withDefaults: {
      args: [{ input: { probe: 'input' } }],
      expect: {
        initial: [
          {
            operationName: 'FETCH_MERCHANT_IMMEDIATE_PERFORM_REPORT',
            variables: { input: { probe: 'input' }, displayReference: 'FAKE' },
          },
        ],
      },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantIncomeStatementV2',
    hook: useFetchMerchantIncomeStatementV2.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_INCOME_STATEMENTV2', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchantIncomeStatementV2'] },
      policies: { GET_MERCHANT_INCOME_STATEMENTV2: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantIncomeStatementV2ForOuterStore',
    hook: useFetchMerchantIncomeStatementV2ForOuterStore.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchantIncomeStatementV2ForOuterStore'] },
      policies: { GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantJobTitlePoint',
    hook: useFetchMerchantJobTitlePoint.default,
    args: [],
    expect: {
      initial: [{ operationName: 'MERCHANT_JOBTITLE_POINT', variables: { merchantId: 'merchant-1' } }],
      shape: { loading: false, called: true, data: ['merchantJobTitlePoint'] },
      policies: { MERCHANT_JOBTITLE_POINT: 'cache-first' },
    },
    loggedOut: { initial: [{ operationName: 'MERCHANT_JOBTITLE_POINT', variables: { merchantId: null } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantJobTitlePoint.useFetchMerchantJobTitleForEmployeeList',
    hook: useFetchMerchantJobTitlePoint.useFetchMerchantJobTitleForEmployeeList,
    args: [],
    invoke: [{ fn: 0, args: [] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_MERCHANT_JOBTITLE', variables: { merchantId: 'merchant-1' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['merchantJobTitlePoint'] }],
      policies: { GET_MERCHANT_JOBTITLE: 'cache-first' },
    },
    loggedOut: {
      initial: [],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_MERCHANT_JOBTITLE', variables: { merchantId: null } }] }],
    },
  },
  {
    id: 'useFetchMerchantLatestMonthlyCheckoutTime',
    hook: useFetchMerchantLatestMonthlyCheckoutTime.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_LATEST_MONTLY_CHECKOUT_TIME', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchantLatestMonthlyCheckoutTime'] },
      policies: { GET_LATEST_MONTLY_CHECKOUT_TIME: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantLeaderBoard',
    hook: useFetchMerchantLeaderBoard.default,
    args: [
      {
        startDay: 'startDay-v',
        endDay: 'endDay-v',
        merchantId: 'merchantId-v',
        reference: 'reference-v',
        isIncludeProductPerformance: true,
        isIncludeMembershipPerformance: true,
      },
    ],
    expect: {
      initial: [
        {
          operationName: 'SET_MERCHANT_LEARDER_BOARD',
          variables: {
            reference: 'reference-v',
            isIncludeProductPerformance: true,
            isIncludeMembershipPerformance: true,
            startDay: 'startDay-v',
            endDay: 'endDay-v',
            merchantId: 'merchantId-v',
          },
        },
      ],
      shape: { loading: false, called: true, data: ['merchantLeaderBoard'] },
      policies: { SET_MERCHANT_LEARDER_BOARD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantMonthlyCheckoutRemark',
    hook: useFetchMerchantMonthlyCheckoutRemark.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_MONTHLY_CHECKOUT_REMARK', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['merchantMonthlyCheckoutRemark'] },
      policies: { GET_MERCHANT_MONTHLY_CHECKOUT_REMARK: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantOtherPayWayDetailReport',
    hook: useFetchMerchantOtherPayWayDetailReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_OTHER_PAYMENT_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['merchantOtherPayWayDetailReport'] },
      policies: { GET_MERCHANT_OTHER_PAYMENT_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPassword',
    hook: useFetchMerchantPassword.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_PASSWORD', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPassword'] },
      policies: { GET_MERCHANT_PASSWORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPassword.useFetchMerchantPasswordIsUsing',
    hook: useFetchMerchantPassword.useFetchMerchantPasswordIsUsing,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_PASSWORD_IS_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPassword'] },
      policies: { GET_MERCHANT_PASSWORD_IS_USING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPassword.useFetchGetStockInIsUsing',
    hook: useFetchMerchantPassword.useFetchGetStockInIsUsing,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_STOCK_IN_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPassword'] },
      policies: { GET_STOCK_IN_USING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPassword.useFetchGetDeleteOrderUsing',
    hook: useFetchMerchantPassword.useFetchGetDeleteOrderUsing,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DELETE_ORDER_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPassword'] },
      policies: { GET_DELETE_ORDER_USING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPassword.useFetchGetCancelBookingUsing',
    hook: useFetchMerchantPassword.useFetchGetCancelBookingUsing,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CANCEL_BOOKING_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPassword'] },
      policies: { GET_CANCEL_BOOKING_USING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantPayWays',
    hook: useFetchMerchantPayWays.default,
    args: [],
    expect: {
      initial: [{ operationName: 'merchantPayWays', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantPayWays'] },
      policies: { merchantPayWays: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantSalaryDecreaseItems',
    hook: useFetchMerchantSalaryDecreaseItems.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_SALARY_DECREASE_ITEMS', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantSalaryDecreaseItems'] },
      policies: { GET_MERCHANT_SALARY_DECREASE_ITEMS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantSalaryDecreaseItems.useFetchMerchantSalaryDecreaseItemsLazy',
    hook: useFetchMerchantSalaryDecreaseItems.useFetchMerchantSalaryDecreaseItemsLazy,
    args: [],
    invoke: [{ fn: 'fetchMerchantSalaryDecreaseItemsLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: {
        fetchMerchantSalaryDecreaseItemsLazy: 'function',
        merchantSalaryDecreaseItemsLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchMerchantSalaryDecreaseItemsLazy',
          calls: [{ operationName: 'GET_MERCHANT_SALARY_DECREASE_ITEMS', variables: {} }],
        },
      ],
      shapeAfter: {
        fetchMerchantSalaryDecreaseItemsLazy: 'function',
        merchantSalaryDecreaseItemsLazyData: { loading: false, called: true, data: ['getMerchantSalaryDecreaseItems'] },
      },
      policies: { GET_MERCHANT_SALARY_DECREASE_ITEMS: 'cache-first' },
    },
  },
  {
    id: 'useFetchMerchantSalaryIncreaseItems',
    hook: useFetchMerchantSalaryIncreaseItems.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_SALARY_INCREASE_ITEMS', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantSalaryIncreaseItems'] },
      policies: { GET_MERCHANT_SALARY_INCREASE_ITEMS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMerchantSalaryIncreaseItems.useFetchMerchantSalaryIncreaseItemsLazy',
    hook: useFetchMerchantSalaryIncreaseItems.useFetchMerchantSalaryIncreaseItemsLazy,
    args: [],
    invoke: [{ fn: 'fetchMerchantSalaryIncreaseItemsLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: {
        fetchMerchantSalaryIncreaseItemsLazy: 'function',
        merchantSalaryIncreaseItemsLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchMerchantSalaryIncreaseItemsLazy',
          calls: [{ operationName: 'GET_MERCHANT_SALARY_INCREASE_ITEMS', variables: {} }],
        },
      ],
      shapeAfter: {
        fetchMerchantSalaryIncreaseItemsLazy: 'function',
        merchantSalaryIncreaseItemsLazyData: { loading: false, called: true, data: ['getMerchantSalaryIncreaseItems'] },
      },
      policies: { GET_MERCHANT_SALARY_INCREASE_ITEMS: 'cache-first' },
    },
  },
  {
    id: 'useFetchMoneyAccountDetail',
    hook: useFetchMoneyAccountDetail.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'MONEY_ACCOUNT_DETAIL', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['moneyAccountDetail'] },
      policies: { MONEY_ACCOUNT_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMoneyFlowCategoryReport',
    hook: useFetchMoneyFlowCategoryReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MONEY_FLOW_CATEGORY_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['moneyFlowCategoryReport'] },
      policies: { GET_MONEY_FLOW_CATEGORY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMoneyFlowDailyReport',
    hook: useFetchMoneyFlowDailyReport.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_MONEY_FLOW__REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['moneyFlowDailyReport'] },
      policies: { GET_MONEY_FLOW__REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMoneyFlowTransferReport',
    hook: useFetchMoneyFlowTransferReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MONEY_FLOW_TRANSFER_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['moneyFlowTransferReport'] },
      policies: { GET_MONEY_FLOW_TRANSFER_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchMultipleUpdateMembershipCategory',
    hook: useFetchMultipleUpdateMembershipCategory.default,
    args: [],
    invoke: [{ fn: 'multipleUpdateMembershipCategory', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { multipleUpdateMembershipCategory: 'function' },
      invoked: [
        {
          fn: 'multipleUpdateMembershipCategory',
          calls: [{ operationName: 'multipleUpdateMembershipCategory', variables: { input: { probe: 'input' } } }],
          resolved: ['multipleUpdateMembershipCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchNonCashDetailStatement',
    hook: useFetchNonCashDetailStatement.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_NON_CASH_DETAIL_STATEMENT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['nonCashDetailStatement'] },
      policies: { GET_NON_CASH_DETAIL_STATEMENT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchNonDesignationBooking',
    hook: useFetchNonDesignationBooking.default,
    args: [],
    invoke: [{ fn: 'nonDesignationBooking', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { nonDesignationBooking: 'function' },
      invoked: [
        {
          fn: 'nonDesignationBooking',
          calls: [{ operationName: 'NON_DESIGNATION_BOOKING', variables: { input: { probe: 'input' } } }],
          resolved: ['nonDesignationBooking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchOrder',
    hook: useFetchOrder.default,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_ORDER', variables: { orderId: 'id-v' } }],
      shape: { loading: false, called: true, data: ['order'] },
      policies: { FETCH_ORDER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchOrder.useFetchServiceOrders',
    hook: useFetchOrder.useFetchServiceOrders,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETRCH_SERVICE_ORDER', variables: { orderId: 'id-v' } }],
      shape: { loading: false, called: true, data: ['order'] },
      policies: { FETRCH_SERVICE_ORDER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchOrder.useFetchProductOrder',
    hook: useFetchOrder.useFetchProductOrder,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_PRODUCT_ORDER', variables: { orderId: 'id-v' } }],
      shape: { loading: false, called: true, data: ['order'] },
      policies: { FETCH_PRODUCT_ORDER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchOrder.useFetchUseMembershipOrder',
    hook: useFetchOrder.useFetchUseMembershipOrder,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIP_ORDER', variables: { orderId: 'id-v' } }],
      shape: { loading: false, called: true, data: ['order'] },
      policies: { FETCH_MEMBERSHIP_ORDER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchOrder.useFetchOrderForPrint',
    hook: useFetchOrder.useFetchOrderForPrint,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { orderId: 'orderId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'FETCH_ORDER_FOR_PRINT', variables: { orderId: 'orderId-v' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['order'] }],
      policies: { FETCH_ORDER_FOR_PRINT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchOrderWithoutCustomerDefault',
    hook: useFetchOrderWithoutCustomerDefault.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ORDER_WITHOUT_CUSTOMER_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['orderWithoutCustomerDefault'] },
      policies: { GET_ORDER_WITHOUT_CUSTOMER_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchOrders.useFetchOrdersLazy',
    hook: useFetchOrders.useFetchOrdersLazy,
    args: [],
    invoke: [{ fn: 'fetchOrdersLazy', args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: { fetchOrdersLazy: 'function', ordersLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchOrdersLazy',
          calls: [{ operationName: 'FETCH_ORDERS_FOR_EMPLOYEE_DETAIL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: { fetchOrdersLazy: 'function', ordersLazyData: { loading: false, called: true, data: ['orders'] } },
      policies: { FETCH_ORDERS_FOR_EMPLOYEE_DETAIL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchOrders.useFetchDesignerOrderRecords',
    hook: useFetchOrders.useFetchDesignerOrderRecords,
    args: [{ probe: 'input' }],
    invoke: [{ fn: 'fetchDesignerOrderRecords', args: [] }],
    expect: {
      initial: [],
      shape: { fetchDesignerOrderRecords: 'function', designerOrderRecords: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchDesignerOrderRecords',
          calls: [{ operationName: 'DESIGNER_ORDER_RECORDS', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: {
        fetchDesignerOrderRecords: 'function',
        designerOrderRecords: { loading: false, called: true, data: ['orders'] },
      },
      policies: { DESIGNER_ORDER_RECORDS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchOrders.useFetchOrdersFastCheckLazy',
    hook: useFetchOrders.useFetchOrdersFastCheckLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'FETCH_ORDERS_FOR_FAST_CHECK', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['orders'] }],
      policies: { FETCH_ORDERS_FOR_FAST_CHECK: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchOrders.useFetchPendingOrders',
    hook: useFetchOrders.useFetchPendingOrders,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_PENDING_ORDERS', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['pendingOrders'] },
      policies: { FETCH_PENDING_ORDERS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchPayment',
    hook: useFetchPayment.default,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'PAYMENT', variables: { id: 'id-v' } }],
      shape: { data: { merchantPayWay: 'object' }, loading: false, refetch: 'function' },
      policies: { PAYMENT: 'cache-and-network' },
    },
    failure: {
      loading: false,
      error: { graphQLErrors: 'array', clientErrors: 'array', networkError: null, message: '模擬 API 失敗：PAYMENT' },
      refetch: 'function',
    },
  },
  {
    id: 'useFetchPayments',
    hook: useFetchPayments.default,
    args: [],
    expect: {
      initial: [{ operationName: 'PAYMENTS', variables: {} }],
      shape: { data: { merchantPayWays: 'array' }, loading: false, refetch: 'function' },
      policies: { PAYMENTS: 'cache-first' },
    },
    failure: {
      error: { graphQLErrors: 'array', clientErrors: 'array', networkError: null, message: '模擬 API 失敗：PAYMENTS' },
      loading: false,
      refetch: 'function',
    },
  },
  {
    id: 'useFetchProduct',
    hook: useFetchProduct.default,
    args: [{ productId: 'productId-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_PRODUCT', variables: { productId: 'productId-v' } }],
      shape: { loading: false, called: true, data: ['product'] },
      policies: { FETCH_PRODUCT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProductCategories',
    hook: useFetchProductCategories.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'PRODUCT_CATEGORIES', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['productCategories'] },
      policies: { PRODUCT_CATEGORIES: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'PRODUCT_CATEGORIES', variables: { input: { paranoid: true } } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProductCategories.useFetchProductCategoriesInCreatePicking',
    hook: useFetchProductCategories.useFetchProductCategoriesInCreatePicking,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['productCategories'] },
      policies: { GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING: 'cache-and-network' },
    },
    noArgs: {
      initial: [{ operationName: 'GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING', variables: { input: { paranoid: true } } }],
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProductCategories.useFetchMerchantSalesAnalytics',
    hook: useFetchProductCategories.useFetchMerchantSalesAnalytics,
    args: [{ input: { probe: 'input' }, analytics: 'analytics-v' }],
    invoke: [{ fn: 'fetchMerchantSalesAnalytics', args: [] }],
    expect: {
      initial: [],
      shape: { fetchMerchantSalesAnalytics: 'function', merchantSalesAnalytics: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchMerchantSalesAnalytics',
          calls: [
            {
              operationName: 'MERCHANT_SALES_ANALYTICS',
              variables: { input: { probe: 'input' }, analytics: 'analytics-v' },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchMerchantSalesAnalytics: 'function',
        merchantSalesAnalytics: { loading: false, called: true, data: ['productCategories'] },
      },
      policies: { MERCHANT_SALES_ANALYTICS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchProductCategory',
    hook: useFetchProductCategory.default,
    args: [{ categoryId: 'categoryId-v' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_CATEGORY', variables: { categoryId: 'categoryId-v' } }],
      shape: { data: { productCategory: 'object' }, loading: false, refetch: 'function' },
      policies: { GET_PRODUCT_CATEGORY: 'cache-and-network' },
    },
    failure: {
      loading: false,
      error: {
        graphQLErrors: 'array',
        clientErrors: 'array',
        networkError: null,
        message: '模擬 API 失敗：GET_PRODUCT_CATEGORY',
      },
      refetch: 'function',
    },
  },
  {
    id: 'useFetchProductConsumeList',
    hook: useFetchProductConsumeList.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_CONSUME_LIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['productConsumeList'] },
      policies: { GET_PRODUCT_CONSUME_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProductOrders',
    hook: useFetchProductOrders.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'PRODUCT_ORDERS', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['productOrders'] },
      policies: { PRODUCT_ORDERS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProductTreeview',
    hook: useFetchProductTreeview.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_CATEGORIES_TREEVIEW', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['productCategories'] },
      policies: { GET_PRODUCT_CATEGORIES_TREEVIEW: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_PRODUCT_CATEGORIES_TREEVIEW', variables: { input: { paranoid: true } } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts',
    hook: useFetchProducts.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    noArgs: { initial: [{ variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInAutoComplete',
    hook: useFetchProducts.useFetchProductsInAutoComplete,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_IN_AUTO_COMPLETE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { GET_PRODUCT_IN_AUTO_COMPLETE: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_PRODUCT_IN_AUTO_COMPLETE', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInEmployeePicking',
    hook: useFetchProducts.useFetchProductsInEmployeePicking,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    noArgs: { initial: [{ variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInEmployeePickingEdit',
    hook: useFetchProducts.useFetchProductsInEmployeePickingEdit,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    noArgs: { initial: [{ variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInProductRestock',
    hook: useFetchProducts.useFetchProductsInProductRestock,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_IN_PRODUCT_RESTOCK', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { GET_PRODUCT_IN_PRODUCT_RESTOCK: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_PRODUCT_IN_PRODUCT_RESTOCK', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInOrderDetail',
    hook: useFetchProducts.useFetchProductsInOrderDetail,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    noArgs: { initial: [{ variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProducts.useFetchProductsInTransferList',
    hook: useFetchProducts.useFetchProductsInTransferList,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_IN_TRANSFERLIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['products'] },
      policies: { GET_PRODUCT_IN_TRANSFERLIST: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_PRODUCT_IN_TRANSFERLIST', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProfile.useFetchMePermissions',
    hook: useFetchProfile.useFetchMePermissions,
    args: [],
    expect: {
      // 查詢名稱維持原本的 FETCH_THIRDPARTYS（同上，不改名）
      initial: [{ operationName: 'FETCH_THIRDPARTYS', variables: {} }],
      shape: { loading: false, called: true, data: ['me'] },
      policies: { FETCH_THIRDPARTYS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProfile',
    hook: useFetchProfile.default,
    args: [],
    expect: {
      initial: [{ operationName: 'PROFILE', variables: {} }],
      shape: { loading: false, called: true, data: ['me'] },
      policies: { PROFILE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchProfile.useFetchProfileIdentity',
    hook: useFetchProfile.useFetchProfileIdentity,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_PROFILE_IDENDITY', variables: {} }],
      shape: { loading: false, called: true, data: ['me'] },
      policies: { FETCH_PROFILE_IDENDITY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  // Jason 2026/10/22 fix all：原本 fetchPolicy 寫在 useLazyQuery 的第三個參數（Apollo 不讀，實際為 cache-first），
  // 且送出 PROFILE 查詢沒有宣告的 orders 變數；改為 fetchPolicy 放進第二個參數、不送 orders
  {
    id: 'useFetchProfile.useLazyFetchProfile',
    hook: useFetchProfile.useLazyFetchProfile,
    args: [],
    invoke: [{ fn: 'fetchProfile', args: [] }],
    expect: {
      initial: [],
      shape: { fetchProfile: 'function', profile: { loading: false, called: false } },
      invoked: [{ fn: 'fetchProfile', calls: [{ operationName: 'PROFILE', variables: {} }] }],
      shapeAfter: { fetchProfile: 'function', profile: { loading: false, called: true, data: ['me'] } },
      policies: { PROFILE: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchReCheckoutOrder',
    hook: useFetchReCheckoutOrder.default,
    args: [],
    invoke: [{ fn: 'fetchReCheckoutOrder', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { fetchReCheckoutOrder: 'function' },
      invoked: [
        {
          fn: 'fetchReCheckoutOrder',
          calls: [{ operationName: 'reCheckoutOrder', variables: { input: { probe: 'input' } } }],
          resolved: ['reCheckoutOrder'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchReCheckoutOrderFromQueue',
    hook: useFetchReCheckoutOrderFromQueue.default,
    args: [],
    invoke: [{ fn: 'reCheckoutOrderFromQueue', args: [{ queueId: 'queueId-v' }] }],
    expect: {
      initial: [],
      shape: { reCheckoutOrderFromQueue: 'function' },
      invoked: [
        {
          fn: 'reCheckoutOrderFromQueue',
          calls: [{ operationName: 'RECHECKOUT_ORDER_FOM_QUEUE', variables: { queueId: 'queueId-v' } }],
          resolved: ['reCheckoutOrderFromQueue'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchRedoEmployeeSchedule',
    hook: useFetchRedoEmployeeSchedule.default,
    args: [],
    invoke: [{ fn: 'redoEmployeeSchedule', args: [{ currentScheduleId: 'currentScheduleId-v' }] }],
    expect: {
      initial: [],
      shape: { redoEmployeeSchedule: 'function' },
      invoked: [
        {
          fn: 'redoEmployeeSchedule',
          calls: [{ operationName: 'REDO_EMPLOYEE_SCHEDULE', variables: { currentScheduleId: 'currentScheduleId-v' } }],
          resolved: ['redoEmployeeSchedule'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchRegister',
    hook: useFetchRegister.default,
    args: [],
    invoke: [{ fn: 'register', args: [{ cellphone: 'cellphone-v' }] }],
    expect: {
      initial: [],
      shape: { register: 'function' },
      invoked: [
        {
          fn: 'register',
          calls: [{ operationName: 'SIGN_UP', variables: { input: { cellphone: 'cellphone-v' } } }],
          resolved: ['userSignup'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchService',
    hook: useFetchService.default,
    args: [{ serviceId: 'serviceId-v' }],
    expect: {
      initial: [{ operationName: 'service', variables: { serviceId: 'serviceId-v' } }],
      shape: { loading: false, called: true, data: ['service'] },
      policies: { service: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchService.useLazyFetchService',
    hook: useFetchService.useLazyFetchService,
    args: [],
    invoke: [{ fn: 'getService', args: [{ serviceId: 'serviceId-v' }] }],
    expect: {
      initial: [],
      shape: { loading: false, called: false },
      invoked: [{ fn: 'getService', calls: [{ operationName: 'service', variables: { serviceId: 'serviceId-v' } }] }],
      shapeAfter: { loading: false, called: true, data: ['service'] },
      policies: { service: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchService.useLazyFetchServiceNew',
    hook: useFetchService.useLazyFetchServiceNew,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { serviceId: 'serviceId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'service', variables: { serviceId: 'serviceId-v' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['service'] }],
      policies: { service: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchServiceCategories',
    hook: useFetchServiceCategories.default,
    args: [],
    expect: {
      initial: [{ operationName: 'ServiceCategories', variables: {} }],
      shape: { loading: false, called: true, data: ['serviceCategories'] },
      policies: { ServiceCategories: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServiceCategories.useLazyFetchServiceCategoriesAnalytics',
    hook: useFetchServiceCategories.useLazyFetchServiceCategoriesAnalytics,
    args: [{ probe: 'input' }],
    invoke: [{ fn: 'fetchServiceCategoriesAnalytics', args: [] }],
    expect: {
      initial: [],
      shape: {
        fetchServiceCategoriesAnalytics: 'function',
        serviceCategoriesAnalytics: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchServiceCategoriesAnalytics',
          calls: [{ operationName: 'FETCH_SERVICE_CATEGORY_ANALYTICS', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: {
        fetchServiceCategoriesAnalytics: 'function',
        serviceCategoriesAnalytics: { loading: false, called: true, data: ['serviceCategories'] },
      },
      policies: { FETCH_SERVICE_CATEGORY_ANALYTICS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchServiceCategory',
    hook: useFetchServiceCategory.default,
    args: [{ categoryId: 'categoryId-v' }],
    expect: {
      initial: [{ operationName: 'GET_SERVICE_CATEGORY', variables: { categoryId: 'categoryId-v' } }],
      shape: { loading: false, called: true, data: ['serviceCategory'] },
      policies: { GET_SERVICE_CATEGORY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServiceCategoryCreate',
    hook: useFetchServiceCategoryCreate.default,
    args: [],
    invoke: [
      {
        fn: 'createServiceCategory',
        args: [
          {
            no: 'no-v',
            name: 'name-v',
            attribution: 'attribution-v',
            remark: 'remark-v',
            OfficialBrandMerchantId: 'OfficialBrandMerchantId-v',
          },
        ],
      },
    ],
    expect: {
      initial: [],
      shape: { createServiceCategory: 'function' },
      invoked: [
        {
          fn: 'createServiceCategory',
          calls: [
            {
              variables: {
                input: {
                  no: 'no-v',
                  name: 'name-v',
                  attribution: 'attribution-v',
                  remark: 'remark-v',
                  OfficialBrandMerchantId: 'OfficialBrandMerchantId-v',
                },
              },
            },
          ],
          resolved: ['createServiceCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchServiceOrderHelpers.useLazyFetchServiceOrderHelpers',
    hook: useFetchServiceOrderHelpers.useLazyFetchServiceOrderHelpers,
    args: [{ probe: 'input' }],
    invoke: [{ fn: 'fetchServiceOrderHelpers', args: [] }],
    expect: {
      initial: [],
      shape: { fetchServiceOrderHelpers: 'function', serviceOrderHelpers: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchServiceOrderHelpers',
          calls: [{ operationName: 'SERVICE_ORDER_HELPERS', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: {
        fetchServiceOrderHelpers: 'function',
        serviceOrderHelpers: { loading: false, called: true, data: ['serviceOrderHelpers'] },
      },
      policies: { SERVICE_ORDER_HELPERS: 'cache-and-network' },
    },
  },
]

describe('useFetchGetUserOrderableList ～ useFetchServiceOrderHelpers', () => {
  runContractRows(ROWS)
})
