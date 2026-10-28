// src/hooks 契約測試（3/6）：useFetchGetIsOptimizationPrintModeOn ～ useFetchGetUserMerchant
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
import * as useFetchGetIsOptimizationPrintModeOn from 'hooks/useFetchGetIsOptimizationPrintModeOn'
import * as useFetchGetIsPrintDetailDisplayOnSalaryReport from 'hooks/useFetchGetIsPrintDetailDisplayOnSalaryReport'
import * as useFetchGetIsReportListExtended from 'hooks/useFetchGetIsReportListExtended'
import * as useFetchGetIsUsingMathRoundInDesignerDailyReport from 'hooks/useFetchGetIsUsingMathRoundInDesignerDailyReport'
import * as useFetchGetIsZeroValueHiddenOnDailyReport from 'hooks/useFetchGetIsZeroValueHiddenOnDailyReport'
import * as useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import * as useFetchGetLatestOrderStatus from 'hooks/useFetchGetLatestOrderStatus'
import * as useFetchGetLineConnectedUser from 'hooks/useFetchGetLineConnectedUser'
import * as useFetchGetLogoDisplayOnInvoice from 'hooks/useFetchGetLogoDisplayOnInvoice'
import * as useFetchGetMainEvent from 'hooks/useFetchGetMainEvent'
import * as useFetchGetMembership from 'hooks/useFetchGetMembership'
import * as useFetchGetMembershipCategory from 'hooks/useFetchGetMembershipCategory'
import * as useFetchGetMembershipSellReport from 'hooks/useFetchGetMembershipSellReport'
import * as useFetchGetMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import * as useFetchGetMerchantAvatar from 'hooks/useFetchGetMerchantAvatar'
import * as useFetchGetMerchantBookingNotificationSetting from 'hooks/useFetchGetMerchantBookingNotificationSetting'
import * as useFetchGetMerchantCheckinSettings from 'hooks/useFetchGetMerchantCheckinSettings'
import * as useFetchGetMerchantClockInSetting from 'hooks/useFetchGetMerchantClockInSetting'
import * as useFetchGetMerchantCusExternalLink from 'hooks/useFetchGetMerchantCusExternalLink'
import * as useFetchGetMerchantDailyPerformanceReport from 'hooks/useFetchGetMerchantDailyPerformanceReport'
import * as useFetchGetMerchantDesignerCalendar from 'hooks/useFetchGetMerchantDesignerCalendar'
import * as useFetchGetMerchantDesignerWeekCalendar from 'hooks/useFetchGetMerchantDesignerWeekCalendar'
import * as useFetchGetMerchantExternalLink from 'hooks/useFetchGetMerchantExternalLink'
import * as useFetchGetMerchantFakePerformanceReference from 'hooks/useFetchGetMerchantFakePerformanceReference'
import * as useFetchGetMerchantHairCondition from 'hooks/useFetchGetMerchantHairCondition'
import * as useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import * as useFetchGetMerchantParticipatingList from 'hooks/useFetchGetMerchantParticipatingList'
import * as useFetchGetMerchantPointValueSettings from 'hooks/useFetchGetMerchantPointValueSettings'
import * as useFetchGetMerchantPrintFormatSettings from 'hooks/useFetchGetMerchantPrintFormatSettings'
import * as useFetchGetMerchantRakeReference from 'hooks/useFetchGetMerchantRakeReference'
import * as useFetchGetMerchantReservationTime from 'hooks/useFetchGetMerchantReservationTime'
import * as useFetchGetMessageDisplayOnInvoice from 'hooks/useFetchGetMessageDisplayOnInvoice'
import * as useFetchGetMoneyFlow from 'hooks/useFetchGetMoneyFlow'
import * as useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import * as useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard from 'hooks/useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard'
import * as useFetchGetMultiMerchantsLeaderBoard from 'hooks/useFetchGetMultiMerchantsLeaderBoard'
import * as useFetchGetMultiMerchantsLeaderBoardExcel from 'hooks/useFetchGetMultiMerchantsLeaderBoardExcel'
import * as useFetchGetNonDesignateBookingRecipients from 'hooks/useFetchGetNonDesignateBookingRecipients'
import * as useFetchGetOrderInputByQueueId from 'hooks/useFetchGetOrderInputByQueueId'
import * as useFetchGetOrderList from 'hooks/useFetchGetOrderList'
import * as useFetchGetOrderListDateAuth from 'hooks/useFetchGetOrderListDateAuth'
import * as useFetchGetOrderStaticDetail from 'hooks/useFetchGetOrderStaticDetail'
import * as useFetchGetOverallPerformanceAnalysisReport from 'hooks/useFetchGetOverallPerformanceAnalysisReport'
import * as useFetchGetParameterAboutBookingSetting from 'hooks/useFetchGetParameterAboutBookingSetting'
import * as useFetchGetParameterAboutCustomerSetting from 'hooks/useFetchGetParameterAboutCustomerSetting'
import * as useFetchGetParameterAboutSettingFunction from 'hooks/useFetchGetParameterAboutSettingFunction'
import * as useFetchGetParameterCheckoutAndSalaryItemsSetting from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'
import * as useFetchGetParameterOrderCreateSetting from 'hooks/useFetchGetParameterOrderCreateSetting'
import * as useFetchGetParameterReportSetting from 'hooks/useFetchGetParameterReportSetting'
import * as useFetchGetPayWays from 'hooks/useFetchGetPayWays'
import * as useFetchGetPicking from 'hooks/useFetchGetPicking'
import * as useFetchGetPickingRecords from 'hooks/useFetchGetPickingRecords'
import * as useFetchGetPinnedTableDefStructures from 'hooks/useFetchGetPinnedTableDefStructures'
import * as useFetchGetProductCostIsDisplayInProductReport from 'hooks/useFetchGetProductCostIsDisplayInProductReport'
import * as useFetchGetProductInventoryList from 'hooks/useFetchGetProductInventoryList'
import * as useFetchGetProductInvoicingRecordReport from 'hooks/useFetchGetProductInvoicingRecordReport'
import * as useFetchGetProductLeaderBoardV2 from 'hooks/useFetchGetProductLeaderBoardV2'
import * as useFetchGetProductPurpose from 'hooks/useFetchGetProductPurpose'
import * as useFetchGetProductReserveCheck from 'hooks/useFetchGetProductReserveCheck'
import * as useFetchGetPurchaseRecords from 'hooks/useFetchGetPurchaseRecords'
import * as useFetchGetQrcodeCheckinCode from 'hooks/useFetchGetQrcodeCheckinCode'
import * as useFetchGetQrcodeDisplayOnInvoice from 'hooks/useFetchGetQrcodeDisplayOnInvoice'
import * as useFetchGetSalaryUserList from 'hooks/useFetchGetSalaryUserList'
import * as useFetchGetSingleServiceItemV2 from 'hooks/useFetchGetSingleServiceItemV2'
import * as useFetchGetSpecificBookingNotificationDayCount from 'hooks/useFetchGetSpecificBookingNotificationDayCount'
import * as useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'
import * as useFetchGetTicketRecordsForOrder from 'hooks/useFetchGetTicketRecordsForOrder'
import * as useFetchGetTicketRecordsForOrderV2 from 'hooks/useFetchGetTicketRecordsForOrderV2'
import * as useFetchGetUESUsingSetting from 'hooks/useFetchGetUESUsingSetting'
import * as useFetchGetUserBookingRecordList from 'hooks/useFetchGetUserBookingRecordList'
import * as useFetchGetUserHelperRetrieve from 'hooks/useFetchGetUserHelperRetrieve'
import * as useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'

const ROWS = [
  {
    id: 'useFetchGetIsOptimizationPrintModeOn',
    hook: useFetchGetIsOptimizationPrintModeOn.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_OPTIMIZATION_PRINT_MODES', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsOptimizationPrintModeOn'] },
      policies: { GET_IS_OPTIMIZATION_PRINT_MODES: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsPrintDetailDisplayOnSalaryReport',
    hook: useFetchGetIsPrintDetailDisplayOnSalaryReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsPrintDetailDisplayOnSalaryReport'] },
      policies: { GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsReportListExtended',
    hook: useFetchGetIsReportListExtended.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_REPORT_LIST_EXTENDED', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsReportListExtended'] },
      policies: { GET_IS_REPORT_LIST_EXTENDED: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsUsingMathRoundInDesignerDailyReport',
    hook: useFetchGetIsUsingMathRoundInDesignerDailyReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsUsingMathRoundInDesignerDailyReport'] },
      policies: { GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsZeroValueHiddenOnDailyReport',
    hook: useFetchGetIsZeroValueHiddenOnDailyReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsZeroValueHiddenOnDailyReport'] },
      policies: { GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsZeroValueHiddenOnDailyReport.useFetchGetIsZeroValueHiddenOnDailyReportLazy',
    hook: useFetchGetIsZeroValueHiddenOnDailyReport.useFetchGetIsZeroValueHiddenOnDailyReportLazy,
    args: [],
    invoke: [{ fn: 'fetchGetIsZeroValueHiddenOnDailyReportLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: {
        fetchGetIsZeroValueHiddenOnDailyReportLazy: 'function',
        getIsZeroValueHiddenOnDailyReportLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchGetIsZeroValueHiddenOnDailyReportLazy',
          calls: [{ operationName: 'GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT', variables: {} }],
        },
      ],
      shapeAfter: {
        fetchGetIsZeroValueHiddenOnDailyReportLazy: 'function',
        getIsZeroValueHiddenOnDailyReportLazyData: {
          loading: false,
          called: true,
          data: ['getIsZeroValueHiddenOnDailyReport'],
        },
      },
      policies: { GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetLastCustomerNo',
    hook: useFetchGetLastCustomerNo.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_LAST_CUSTOMER_NO', variables: {} }],
      shape: { loading: false, called: true, data: ['getLastCustomerNo'] },
      policies: { GET_LAST_CUSTOMER_NO: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetLatestOrderStatus',
    hook: useFetchGetLatestOrderStatus.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_LAST_ORDER_STATUS', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['getLatestOrderStatus'] },
      policies: { GET_LAST_ORDER_STATUS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetLineConnectedUser',
    hook: useFetchGetLineConnectedUser.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_LINE_CONNECTED_USER', variables: {} }],
      shape: { loading: false, called: true, data: ['getLineConnectedUser'] },
      policies: { GET_LINE_CONNECTED_USER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetLogoDisplayOnInvoice',
    hook: useFetchGetLogoDisplayOnInvoice.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_LOGO_DISPLAY_INVOICE', variables: {} }],
      shape: { loading: false, called: true, data: ['getLogoDisplayOnInvoice'] },
      policies: { GET_LOGO_DISPLAY_INVOICE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMainEvent',
    hook: useFetchGetMainEvent.default,
    args: [{ eventId: 'eventId-v' }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_EVENT', variables: { eventId: 'eventId-v' } }],
      shape: { loading: false, called: true, data: ['mainEvent'] },
      policies: { GET_MERCHANT_EVENT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMainEvent.useFetchGetMainEvents',
    hook: useFetchGetMainEvent.useFetchGetMainEvents,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MAIN_EVENTS', variables: {} }],
      shape: { loading: false, called: true, data: ['mainEvents'] },
      policies: { GET_MAIN_EVENTS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMainEvent.useFetchGetMainEventForRule',
    hook: useFetchGetMainEvent.useFetchGetMainEventForRule,
    args: [{ eventId: 'eventId-v' }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_EVENT_FOR_RULES', variables: { eventId: 'eventId-v' } }],
      shape: { loading: false, called: true, data: ['mainEvent'] },
      policies: { GET_MERCHANT_EVENT_FOR_RULES: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMainEvent.useFetchGetMainEventsForAutocomplete',
    hook: useFetchGetMainEvent.useFetchGetMainEventsForAutocomplete,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MAIN_EVENTS_FOR_AUTOCOMPLETE', variables: {} }],
      shape: { loading: false, called: true, data: ['mainEvents'] },
      policies: { GET_MAIN_EVENTS_FOR_AUTOCOMPLETE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchGetMemberships',
    hook: useFetchGetMembership.useFetchGetMemberships,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIPS', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['memberships'] },
      policies: { FETCH_MEMBERSHIPS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchGetMembershipsForAutocomplete',
    hook: useFetchGetMembership.useFetchGetMembershipsForAutocomplete,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['memberships'] },
      policies: { FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchGetMembershipsForModal',
    hook: useFetchGetMembership.useFetchGetMembershipsForModal,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIPS_FOR_MODAL', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['memberships'] },
      policies: { FETCH_MEMBERSHIPS_FOR_MODAL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchGetMembership',
    hook: useFetchGetMembership.useFetchGetMembership,
    args: ['membershipUUID-v'],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIP', variables: { membershipUUID: 'membershipUUID-v' } }],
      shape: { loading: false, called: true, data: ['membership'] },
      policies: { FETCH_MEMBERSHIP: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchMembershipsInOrderDetail',
    hook: useFetchGetMembership.useFetchMembershipsInOrderDetail,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_MEMBERSHIPS_IN_ORDER_DETAIL', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['memberships'] },
      policies: { GET_MEMBERSHIPS_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_MEMBERSHIPS_IN_ORDER_DETAIL', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembership.useFetchGetMembershipsForTransferList',
    hook: useFetchGetMembership.useFetchGetMembershipsForTransferList,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIPS_FOR_TRANSFERLIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['memberships'] },
      policies: { FETCH_MEMBERSHIPS_FOR_TRANSFERLIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembershipCategory.useFetchGetMembershipCategories',
    hook: useFetchGetMembershipCategory.useFetchGetMembershipCategories,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIPS_CATEGORY', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['membershipCategories'] },
      policies: { FETCH_MEMBERSHIPS_CATEGORY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembershipCategory.useFetchGetMembershipCategory',
    hook: useFetchGetMembershipCategory.useFetchGetMembershipCategory,
    args: ['categoryUUID-v'],
    expect: {
      initial: [{ operationName: 'FETCH_MEMBERSHIP_CATEGORY', variables: { categoryUUID: 'categoryUUID-v' } }],
      shape: { loading: false, called: true, data: ['membershipCategory'] },
      policies: { FETCH_MEMBERSHIP_CATEGORY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMembershipSellReport',
    hook: useFetchGetMembershipSellReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MEMBERSHIP_SELL_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['membershipSellReport'] },
      policies: { GET_MEMBERSHIP_SELL_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantAuthorities',
    hook: useFetchGetMerchantAuthorities.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_AUTHORITIES', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantAuthorities'] },
      policies: { GET_MERCHANT_AUTHORITIES: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantAuthorities.useFetchMerchantAuthoritiesNameAndId',
    hook: useFetchGetMerchantAuthorities.useFetchMerchantAuthoritiesNameAndId,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_AUTHORITIES', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantAuthorities'] },
      policies: { GET_MERCHANT_AUTHORITIES: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantAvatar',
    hook: useFetchGetMerchantAvatar.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_AVATAR', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getMerchantAvatar'] },
      policies: { GET_MERCHANT_AVATAR: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantBookingNotificationSetting',
    hook: useFetchGetMerchantBookingNotificationSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantBookingNotificationSetting'] },
      policies: { GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantCheckinSettings',
    hook: useFetchGetMerchantCheckinSettings.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_CHECKIN_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantCheckinSettings'] },
      policies: { GET_MERCHANT_CHECKIN_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantCheckinSettings.useFetchGetCheckinSettingsForManagementList',
    hook: useFetchGetMerchantCheckinSettings.useFetchGetCheckinSettingsForManagementList,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantCheckinSettings'] },
      policies: { GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantCheckinSettings.useFetchGetCheckinSettingsForCalendar',
    hook: useFetchGetMerchantCheckinSettings.useFetchGetCheckinSettingsForCalendar,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CHECKIN_SETTING_FOR_CALENDAR', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantCheckinSettings'] },
      policies: { GET_CHECKIN_SETTING_FOR_CALENDAR: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantClockInSetting',
    hook: useFetchGetMerchantClockInSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_CLOCK_IN_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantClockInSetting'] },
      policies: { GET_MERCHANT_CLOCK_IN_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantClockInSetting.useFetchGetMerchantClockInSchedule',
    hook: useFetchGetMerchantClockInSetting.useFetchGetMerchantClockInSchedule,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_CLOCK_IN_SCHEDULE', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantClockInSetting'] },
      policies: { GET_MERCHANT_CLOCK_IN_SCHEDULE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantCusExternalLink',
    hook: useFetchGetMerchantCusExternalLink.default,
    args: [],
    expect: {
      initial: [{ operationName: 'MerchantCusExternalLink', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantCusExternalLink'] },
      policies: { MerchantCusExternalLink: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantDailyPerformanceReport',
    hook: useFetchGetMerchantDailyPerformanceReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [
        { operationName: 'FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT', variables: { input: { probe: 'input' } } },
      ],
      shape: { loading: false, called: true, data: ['merchantDailyPerformanceReport'] },
      policies: { FETCH_GET_MERCHANT_DAILY_PERFORMANCE_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantDesignerCalendar',
    hook: useFetchGetMerchantDesignerCalendar.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'getMerchantDesignerCalendar', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getMerchantDesignerCalendar'] },
      policies: { getMerchantDesignerCalendar: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantDesignerWeekCalendar',
    hook: useFetchGetMerchantDesignerWeekCalendar.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'getMerchantDesignerCalendar', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getMerchantDesignerWeekCalendar'] },
      policies: { getMerchantDesignerCalendar: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantExternalLink',
    hook: useFetchGetMerchantExternalLink.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_EXTERNAL_LINK', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantExternalLink'] },
      policies: { GET_MERCHANT_EXTERNAL_LINK: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantFakePerformanceReference',
    hook: useFetchGetMerchantFakePerformanceReference.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_FAKE_PERFORMANCE_REFER', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantFakePerformanceReference'] },
      policies: { GET_MERCHANT_FAKE_PERFORMANCE_REFER: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantHairCondition',
    hook: useFetchGetMerchantHairCondition.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_HAIR_CONDITION', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantHairCondition'] },
      policies: { GET_MERCHANT_HAIR_CONDITION: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantHairCondition.useFetchGetMerchantHairConditionLazy',
    hook: useFetchGetMerchantHairCondition.useFetchGetMerchantHairConditionLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_MERCHANT_HAIR_CONDITION', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getMerchantHairCondition'] }],
      policies: { GET_MERCHANT_HAIR_CONDITION: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetMerchantName',
    hook: useFetchGetMerchantName.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_NAME', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getMerchantName'] },
      policies: { GET_MERCHANT_NAME: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantParticipatingList',
    hook: useFetchGetMerchantParticipatingList.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_PARTICIPATING_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['merchantParticipatingList'] },
      policies: { GET_MERCHANT_PARTICIPATING_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantPointValueSettings.useFetchGetMerchantPointValueSettingsForSelect',
    hook: useFetchGetMerchantPointValueSettings.useFetchGetMerchantPointValueSettingsForSelect,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantPointValueSettings'] },
      policies: { GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantPointValueSettings.useFetchGetMerchantPointValueSettingsForEdit',
    hook: useFetchGetMerchantPointValueSettings.useFetchGetMerchantPointValueSettingsForEdit,
    args: [{ probe: 'input' }],
    expect: {
      initial: [
        { operationName: 'GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT', variables: { input: { probe: 'input' } } },
      ],
      shape: { loading: false, called: true, data: ['getMerchantPointValueSetting'] },
      policies: { GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantPrintFormatSettings',
    hook: useFetchGetMerchantPrintFormatSettings.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_ORDER_PRINT_LAYOUT', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantPrintFormatSettings'] },
      policies: { GET_MERCHANT_ORDER_PRINT_LAYOUT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantRakeReference',
    hook: useFetchGetMerchantRakeReference.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_RAKE_REFERENCE', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantRakeReference'] },
      policies: { GET_MERCHANT_RAKE_REFERENCE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMerchantReservationTime',
    hook: useFetchGetMerchantReservationTime.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MERCHANT_REVERVATION_TIME', variables: {} }],
      shape: { loading: false, called: true, data: ['getMerchantReservationTime'] },
      policies: { GET_MERCHANT_REVERVATION_TIME: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMessageDisplayOnInvoice',
    hook: useFetchGetMessageDisplayOnInvoice.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MESSAGE_DISPLAY_ON_INVOICE', variables: {} }],
      shape: { loading: false, called: true, data: ['getMessageDisplayOnInvoice'] },
      policies: { GET_MESSAGE_DISPLAY_ON_INVOICE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMoneyFlow',
    hook: useFetchGetMoneyFlow.default,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'GET_MONEY_FLOW', variables: { id: 'id-v' } }],
      shape: { loading: false, called: true, data: ['moneyFlow'] },
      policies: { GET_MONEY_FLOW: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMoneyFlowsForAccounting',
    hook: useFetchGetMoneyFlowsForAccounting.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_MONEY_FLOW_FOR_ACCOUNTING', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['moneyFlows'] },
      policies: { GET_MONEY_FLOW_FOR_ACCOUNTING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard',
    hook: useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD', variables: {} }],
      shape: { loading: false, called: true, data: ['getMonthlyAverageDisplayForDesignerLeaderBoard'] },
      policies: { GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetMultiMerchantsLeaderBoard',
    hook: useFetchGetMultiMerchantsLeaderBoard.default,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [{ variables: { input: { probe: 'input' }, vendorUUId: 'vendorUUId-v', merchantId: 'merchantId-v' } }],
      },
    ],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_MMULTI_MERCHANTS_LEADER_BOARD',
              variables: { input: { probe: 'input' }, vendorUUId: 'vendorUUId-v', merchantId: 'merchantId-v' },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['multiMerchantsLeaderBoard'] }],
      policies: { GET_MMULTI_MERCHANTS_LEADER_BOARD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetMultiMerchantsLeaderBoardExcel',
    hook: useFetchGetMultiMerchantsLeaderBoardExcel.default,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [
          {
            variables: {
              input: { probe: 'input' },
              vendorUUId: 'vendorUUId-v',
              merchantId: 'merchantId-v',
              sortBy: 'sortBy-v',
            },
          },
        ],
      },
    ],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL',
              variables: {
                input: { probe: 'input' },
                vendorUUId: 'vendorUUId-v',
                merchantId: 'merchantId-v',
                sortBy: 'sortBy-v',
              },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['multiMerchantsLeaderBoardExcel'] }],
      policies: { GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetNonDesignateBookingRecipients',
    hook: useFetchGetNonDesignateBookingRecipients.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_NONDESIGNATE_BOOKING_RECIOIENTS', variables: {} }],
      shape: { loading: false, called: true, data: ['nonDesignateBookingRecipients'] },
      policies: { GET_NONDESIGNATE_BOOKING_RECIOIENTS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetOrderInputByQueueId',
    hook: useFetchGetOrderInputByQueueId.default,
    args: ['queueId-v'],
    expect: {
      initial: [{ operationName: 'GET_ORDER_INPUT_BY_QUEUE_ID', variables: { queueId: 'queueId-v' } }],
      shape: { loading: false, called: true, data: ['getOrderInputByQueueId'] },
      policies: { GET_ORDER_INPUT_BY_QUEUE_ID: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetOrderList',
    hook: useFetchGetOrderList.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_ORDER_LIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getOrderList'] },
      policies: { GET_ORDER_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetOrderList.useFetchGetOrderListLazy',
    hook: useFetchGetOrderList.useFetchGetOrderListLazy,
    args: [],
    invoke: [{ fn: 'getOrderListLazy', args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: { getOrderListLazy: 'function', getOrderListLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'getOrderListLazy',
          calls: [{ operationName: 'GET_ORDER_LIST_FOR_DETAIL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: {
        getOrderListLazy: 'function',
        getOrderListLazyData: { loading: false, called: true, data: ['getOrderList'] },
      },
      policies: { GET_ORDER_LIST_FOR_DETAIL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetOrderListDateAuth',
    hook: useFetchGetOrderListDateAuth.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ORDER_LIST_DATE_AUTH', variables: {} }],
      shape: { loading: false, called: true, data: ['orderListDateAuth'] },
      policies: { GET_ORDER_LIST_DATE_AUTH: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetOrderStaticDetail',
    hook: useFetchGetOrderStaticDetail.default,
    args: [['orderIds-1']],
    expect: {
      initial: [{ operationName: 'GET_ORDER_STATIC_DETAIL', variables: { orderIds: ['orderIds-1'] } }],
      shape: { loading: false, called: true, data: ['getOrderStaticDetail'] },
      policies: { GET_ORDER_STATIC_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetOverallPerformanceAnalysisReport',
    hook: useFetchGetOverallPerformanceAnalysisReport.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            { operationName: 'FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT', variables: { input: { probe: 'input' } } },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['overallPerformanceAnalysisReport'] }],
      policies: { FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetParameterAboutBookingSetting',
    hook: useFetchGetParameterAboutBookingSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_ABOUT_BOOKING_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutBookingSetting'] },
      policies: { GET_PARAMETER_ABOUT_BOOKING_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutBookingSetting.useFetchGetBookinHistoryDisplay',
    hook: useFetchGetParameterAboutBookingSetting.useFetchGetBookinHistoryDisplay,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_BOOKING_HISTORY_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutBookingSetting'] },
      policies: { GET_BOOKING_HISTORY_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutCustomerSetting',
    hook: useFetchGetParameterAboutCustomerSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_ABOUT_CUSTOMER_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutCustomerSetting'] },
      policies: { GET_PARAMETER_ABOUT_CUSTOMER_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutSettingFunction',
    hook: useFetchGetParameterAboutSettingFunction.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_ABOUT_SETTING_FUNCTION', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_PARAMETER_ABOUT_SETTING_FUNCTION: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutSettingFunction.useFetchGetIsBonusRewardWithLine',
    hook: useFetchGetParameterAboutSettingFunction.useFetchGetIsBonusRewardWithLine,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_BONUS_REWARD_WITH_LINE', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_IS_BONUS_REWARD_WITH_LINE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutSettingFunction.useFetchGetisUnlimProdEmpPrice',
    hook: useFetchGetParameterAboutSettingFunction.useFetchGetisUnlimProdEmpPrice,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_UN_LIM_PROD_EMP_PRICE', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_IS_UN_LIM_PROD_EMP_PRICE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutSettingFunction.useFetchGetIsComboSetting',
    hook: useFetchGetParameterAboutSettingFunction.useFetchGetIsComboSetting,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_COMBO_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_IS_COMBO_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterAboutSettingFunction.useFetchGetDisablePendingOrder',
    hook: useFetchGetParameterAboutSettingFunction.useFetchGetDisablePendingOrder,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DISBLE_PENDING_ORDER', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_DISBLE_PENDING_ORDER: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterCheckoutAndSalaryItemsSetting',
    hook: useFetchGetParameterCheckoutAndSalaryItemsSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterCheckoutAndSalaryItemsSetting'] },
      policies: { GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetPayslipOptimization',
    hook: useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetPayslipOptimization,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PAYSLIP_OPTIMIZATION', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterCheckoutAndSalaryItemsSetting'] },
      policies: { GET_PAYSLIP_OPTIMIZATION: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetAttendanceStatistics',
    hook: useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetAttendanceStatistics,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ATTENDANCE_STATISTICS', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterCheckoutAndSalaryItemsSetting'] },
      policies: { GET_ATTENDANCE_STATISTICS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetIsPrintDateHiddenForPayslip',
    hook: useFetchGetParameterCheckoutAndSalaryItemsSetting.useFetchGetIsPrintDateHiddenForPayslip,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_PRINT_DATE_HIDDEN', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterCheckoutAndSalaryItemsSetting'] },
      policies: { GET_IS_PRINT_DATE_HIDDEN: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterOrderCreateSetting',
    hook: useFetchGetParameterOrderCreateSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_ORDER_CREATE_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterOrderCreateSetting'] },
      policies: { GET_PARAMETER_ORDER_CREATE_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterOrderCreateSetting.useFetchGetIsPrintWindowClosureDelayed',
    hook: useFetchGetParameterOrderCreateSetting.useFetchGetIsPrintWindowClosureDelayed,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRINT_WINDOW_CLOSURE_DELAYED', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterOrderCreateSetting'] },
      policies: { GET_PRINT_WINDOW_CLOSURE_DELAYED: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterOrderCreateSetting.useFetchGetSerialNumberUsing',
    hook: useFetchGetParameterOrderCreateSetting.useFetchGetSerialNumberUsing,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_SERIAL_NUMBER_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterOrderCreateSetting'] },
      policies: { GET_SERIAL_NUMBER_USING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterOrderCreateSetting.useFetchGetIsLBCusDisplay',
    hook: useFetchGetParameterOrderCreateSetting.useFetchGetIsLBCusDisplay,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_LBCUS_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterOrderCreateSetting'] },
      policies: { GET_IS_LBCUS_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterOrderCreateSetting.useFetchGetIsCusWalletUsageForOrder',
    hook: useFetchGetParameterOrderCreateSetting.useFetchGetIsCusWalletUsageForOrder,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_CUS_WALLET_USAGE_FOR_ORDER', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterOrderCreateSetting'] },
      policies: { GET_IS_CUS_WALLET_USAGE_FOR_ORDER: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterReportSetting',
    hook: useFetchGetParameterReportSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PARAMETER_REPORT_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterReportSetting'] },
      policies: { GET_PARAMETER_REPORT_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterReportSetting.useFetchGetCARPTDISPLAY',
    hook: useFetchGetParameterReportSetting.useFetchGetCARPTDISPLAY,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CARPTDISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterReportSetting'] },
      policies: { GET_CARPTDISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterReportSetting.useFetchGetDRRDataDisplay',
    hook: useFetchGetParameterReportSetting.useFetchGetDRRDataDisplay,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DRR_DATA_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterReportSetting'] },
      policies: { GET_DRR_DATA_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterReportSetting.useFetchGetEmployeeClockInDisplay',
    hook: useFetchGetParameterReportSetting.useFetchGetEmployeeClockInDisplay,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_EMPLOYEECLOCKIN_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterReportSetting'] },
      policies: { GET_EMPLOYEECLOCKIN_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetParameterReportSetting.useFetchGetNonCashDisplay',
    hook: useFetchGetParameterReportSetting.useFetchGetNonCashDisplay,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_NONCASH_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterReportSetting'] },
      policies: { GET_NONCASH_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetPayWays',
    hook: useFetchGetPayWays.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PAY_WAYS', variables: {} }],
      shape: { loading: false, called: true, data: ['payWays'] },
      policies: { GET_PAY_WAYS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetPicking',
    hook: useFetchGetPicking.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_GET_PICKING', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['picking'] },
      policies: { FETCH_GET_PICKING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetPickingRecords',
    hook: useFetchGetPickingRecords.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'FETCH_PICKING_RECORD', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['pickingRecords'] },
      policies: { FETCH_PICKING_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetPinnedTableDefStructures',
    hook: useFetchGetPinnedTableDefStructures.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PINNED_TABLE_DEF_STRUCTURES', variables: {} }],
      shape: { loading: false, called: true, data: ['getPinnedTableDefStructures'] },
      policies: { GET_PINNED_TABLE_DEF_STRUCTURES: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetProductCostIsDisplayInProductReport',
    hook: useFetchGetProductCostIsDisplayInProductReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_COST_IS_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsProductCostDisplay'] },
      policies: { GET_PRODUCT_COST_IS_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetProductInventoryList',
    hook: useFetchGetProductInventoryList.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_INVENTORY_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['productInventoryList'] },
      policies: { GET_PRODUCT_INVENTORY_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetProductInventoryList.useFetchGetProductInventory',
    hook: useFetchGetProductInventoryList.useFetchGetProductInventory,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_INVENTORY', variables: {} }],
      shape: { loading: false, called: true, data: ['productInventoryList'] },
      policies: { GET_PRODUCT_INVENTORY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetProductInventoryList.useFetchGetProductInventoryLazy',
    hook: useFetchGetProductInventoryList.useFetchGetProductInventoryLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_PRODUCT_INVENTORY', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['productInventoryList'] }],
      policies: { GET_PRODUCT_INVENTORY: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetProductInvoicingRecordReport',
    hook: useFetchGetProductInvoicingRecordReport.default,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [{ variables: { input: { probe: 'input' }, productId: 'productId-v', recordType: 'recordType-v' } }],
      },
    ],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_PRODUCT_INVOICING_RECORD_REPOPT',
              variables: { input: { probe: 'input' }, productId: 'productId-v', recordType: 'recordType-v' },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['productInvoicingRecordReport'] }],
      policies: { GET_PRODUCT_INVOICING_RECORD_REPOPT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetProductLeaderBoardV2',
    hook: useFetchGetProductLeaderBoardV2.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        { fn: 0, calls: [{ operationName: 'GET_PRODUCT_LEADERBOAED_V2', variables: { input: { probe: 'input' } } }] },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['getProductLeaderBoardV2'] }],
      policies: { GET_PRODUCT_LEADERBOAED_V2: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetProductPurpose',
    hook: useFetchGetProductPurpose.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_PRODUCT_PURPOSE', variables: {} }],
      shape: { loading: false, called: true, data: ['getProductPurpose'] },
      policies: { GET_PRODUCT_PURPOSE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetProductReserveCheck',
    hook: useFetchGetProductReserveCheck.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        { fn: 0, calls: [{ operationName: 'GET_PRODUCT_RESERVE_CHECK', variables: { input: { probe: 'input' } } }] },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['productReserveCheck'] }],
      policies: { GET_PRODUCT_RESERVE_CHECK: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetPurchaseRecords',
    hook: useFetchGetPurchaseRecords.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_PURCHASE_RECORDS', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['purchaseRecords'] }],
      policies: { GET_PURCHASE_RECORDS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetPurchaseRecords.useFetchGetPurchaseRecordForEdit',
    hook: useFetchGetPurchaseRecords.useFetchGetPurchaseRecordForEdit,
    args: [{ purchaseUUId: 'purchaseUUId-v' }],
    expect: {
      initial: [{ operationName: 'GET_PURCHASE_RECORD_FOR_EDIT', variables: { purchaseUUId: 'purchaseUUId-v' } }],
      shape: { loading: false, called: true, data: ['purchaseRecord'] },
      policies: { GET_PURCHASE_RECORD_FOR_EDIT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetQrcodeCheckinCode',
    hook: useFetchGetQrcodeCheckinCode.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_QRCODE_CHECKIN_MODE', variables: {} }],
      shape: { loading: false, called: true, data: ['getQrcodeCheckinCode'] },
      policies: { GET_QRCODE_CHECKIN_MODE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetQrcodeDisplayOnInvoice',
    hook: useFetchGetQrcodeDisplayOnInvoice.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_QRCODE_DISPLAY_ON_INVOICE', variables: {} }],
      shape: { loading: false, called: true, data: ['getQrcodeDisplayOnInvoice'] },
      policies: { GET_QRCODE_DISPLAY_ON_INVOICE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetSalaryUserList',
    hook: useFetchGetSalaryUserList.default,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'GET_SALARY_USER_LIST', variables: { input: { probe: 'input' }, date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['getSalaryUserList'] },
      policies: { GET_SALARY_USER_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetSingleServiceItemV2',
    hook: useFetchGetSingleServiceItemV2.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'FETCH_GET_SIMGLE_SERVICE_ITEM_V2', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['singleServiceItemV2'] }],
      policies: { FETCH_GET_SIMGLE_SERVICE_ITEM_V2: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetSpecificBookingNotificationDayCount',
    hook: useFetchGetSpecificBookingNotificationDayCount.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT', variables: {} }],
      shape: { loading: false, called: true, data: ['getSpecificBookingNotificationDayCount'] },
      policies: { GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetThirdPartTicketSetting',
    hook: useFetchGetThirdPartTicketSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_THIRD_PART_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsThirdPartTicketDisplay'] },
      policies: { GET_THIRD_PART_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetTicketRecordsForOrder',
    hook: useFetchGetTicketRecordsForOrder.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { customerId: 'customerId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_TICKET_RECORDS_FOR_ORDERS', variables: { customerId: 'customerId-v' } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['ticketRecordsForOrder'] }],
      policies: { GET_TICKET_RECORDS_FOR_ORDERS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetTicketRecordsForOrderV2',
    hook: useFetchGetTicketRecordsForOrderV2.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { customerId: 'customerId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_TICKET_RECORDS_FOR_ORDERS_V2', variables: { customerId: 'customerId-v' } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['ticketRecordsForOrderV2'] }],
      policies: { GET_TICKET_RECORDS_FOR_ORDERS_V2: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUESUsingSetting',
    hook: useFetchGetUESUsingSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_UES_USEING_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getUESUsingSetting'] },
      policies: { GET_UES_USEING_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserBookingRecordList',
    hook: useFetchGetUserBookingRecordList.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_USER_BOOKING_RECORD_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserBookingRecordList'] },
      policies: { GET_USER_BOOKING_RECORD_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserHelperRetrieve.useFetchUserHelperRetrieve',
    hook: useFetchGetUserHelperRetrieve.useFetchUserHelperRetrieve,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_USER_HELPER_RETRIEVE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getUserHelperRetrieve'] },
      policies: { GET_USER_HELPER_RETRIEVE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserHelperRetrieve.useFetchUserHelperRetrieveLazy',
    hook: useFetchGetUserHelperRetrieve.useFetchUserHelperRetrieveLazy,
    args: [],
    invoke: [{ fn: 'fetchUserHelperRetrieveLazy', args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: { fetchUserHelperRetrieveLazy: 'function', userHelperRetrieveLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchUserHelperRetrieveLazy',
          calls: [{ operationName: 'GET_USER_HELPER_RETRIEVE', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: {
        fetchUserHelperRetrieveLazy: 'function',
        userHelperRetrieveLazyData: { loading: false, called: true, data: ['getUserHelperRetrieve'] },
      },
      policies: { GET_USER_HELPER_RETRIEVE: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUserMerchant',
    hook: useFetchGetUserMerchant.default,
    args: [{ skip: false }],
    expect: {
      initial: [{ operationName: 'GET_USER_MERCHANTS', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserMerchant'] },
      policies: { GET_USER_MERCHANTS: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_USER_MERCHANTS', variables: {} }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetUserMerchant.useFetchGetUserMerchantForManagementLazy',
    hook: useFetchGetUserMerchant.useFetchGetUserMerchantForManagementLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_USER_MERCHANTS_FOR_MANAGEMENT', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['advancedManagerMerchants'] }],
      policies: { GET_USER_MERCHANTS_FOR_MANAGEMENT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUserMerchant.useFetchGetEventJoinMerchants',
    hook: useFetchGetUserMerchant.useFetchGetEventJoinMerchants,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { eventId: 'eventId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_EVENT_JOIN_MERCHANTS', variables: { eventId: 'eventId-v' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['eventJoinedMerchants'] }],
      policies: { GET_EVENT_JOIN_MERCHANTS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetUserMerchant.useFetchGetUserGroupsWOCS',
    hook: useFetchGetUserMerchant.useFetchGetUserGroupsWOCS,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_USER_GROUPS_WOCS', variables: {} }],
      shape: { loading: false, called: true, data: ['getUserGroupWOCS'] },
      policies: { GET_USER_GROUPS_WOCS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
]

describe('useFetchGetIsOptimizationPrintModeOn ～ useFetchGetUserMerchant', () => {
  runContractRows(ROWS)
})
