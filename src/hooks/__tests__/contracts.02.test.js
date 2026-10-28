// src/hooks 契約測試（2/6）：useFetchDestroyQueueById ～ useFetchGetIsOpenDateRangeInOrderMangement
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
import * as useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import * as useFetchDestroyUserSalaryMonthlyCheckoutRecord from 'hooks/useFetchDestroyUserSalaryMonthlyCheckoutRecord'
import * as useFetchEmployeeSaleSetting from 'hooks/useFetchEmployeeSaleSetting'
import * as useFetchEmployeeSchedule from 'hooks/useFetchEmployeeSchedule'
import * as useFetchEndEventRuleGroup from 'hooks/useFetchEndEventRuleGroup'
import * as useFetchGetAccountingSubjects from 'hooks/useFetchGetAccountingSubjects'
import * as useFetchGetActionsBannedAfterDailyCheckout from 'hooks/useFetchGetActionsBannedAfterDailyCheckout'
import * as useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import * as useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import * as useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import * as useFetchGetBookingLineNotifySettings from 'hooks/useFetchGetBookingLineNotifySettings'
import * as useFetchGetBookingManagement from 'hooks/useFetchGetBookingManagement'
import * as useFetchGetBookingTypeForSocket from 'hooks/useFetchGetBookingTypeForSocket'
import * as useFetchGetBusinessAnalysisReport from 'hooks/useFetchGetBusinessAnalysisReport'
import * as useFetchGetBusinessItemsMonthlyReport from 'hooks/useFetchGetBusinessItemsMonthlyReport'
import * as useFetchGetBusinessItemsMonthlyReportExcel from 'hooks/useFetchGetBusinessItemsMonthlyReportExcel'
import * as useFetchGetCheckIsCustomerNoUsed from 'hooks/useFetchGetCheckIsCustomerNoUsed'
import * as useFetchGetConsumptionAnalyticsDashboard from 'hooks/useFetchGetConsumptionAnalyticsDashboard'
import * as useFetchGetCustomerBonusDepositRecords from 'hooks/useFetchGetCustomerBonusDepositRecords'
import * as useFetchGetCustomerBonusRecord from 'hooks/useFetchGetCustomerBonusRecord'
import * as useFetchGetCustomerCheckTicket from 'hooks/useFetchGetCustomerCheckTicket'
import * as useFetchGetCustomerConsumptionLeaderboard from 'hooks/useFetchGetCustomerConsumptionLeaderboard'
import * as useFetchGetCustomerConsumptionLeaderboardExcel from 'hooks/useFetchGetCustomerConsumptionLeaderboardExcel'
import * as useFetchGetCustomerDataMarkedDefault from 'hooks/useFetchGetCustomerDataMarkedDefault'
import * as useFetchGetCustomerEventTicketsForMerchant from 'hooks/useFetchGetCustomerEventTicketsForMerchant'
import * as useFetchGetCustomerHairInfo from 'hooks/useFetchGetCustomerHairInfo'
import * as useFetchGetCustomerOrders from 'hooks/useFetchGetCustomerOrders'
import * as useFetchGetCustomerReference from 'hooks/useFetchGetCustomerReference'
import * as useFetchGetCustomerSMSRecord from 'hooks/useFetchGetCustomerSMSRecord'
import * as useFetchGetCustomerWalletLeaderboard from 'hooks/useFetchGetCustomerWalletLeaderboard'
import * as useFetchGetCustomerWalletLeaderboardExcel from 'hooks/useFetchGetCustomerWalletLeaderboardExcel'
import * as useFetchGetDeductionSettings from 'hooks/useFetchGetDeductionSettings'
import * as useFetchGetDesignationSettingForOrderCreate from 'hooks/useFetchGetDesignationSettingForOrderCreate'
import * as useFetchGetDesignerNameDisplayOnInvoice from 'hooks/useFetchGetDesignerNameDisplayOnInvoice'
import * as useFetchGetDesignerNameForCustomerSide from 'hooks/useFetchGetDesignerNameForCustomerSide'
import * as useFetchGetDesignerNameForReportType from 'hooks/useFetchGetDesignerNameForReportType'
import * as useFetchGetDesignerPerformance from 'hooks/useFetchGetDesignerPerformance'
import * as useFetchGetDesignerPerformanceExcel from 'hooks/useFetchGetDesignerPerformanceExcel'
import * as useFetchGetDisableBookingDayLimit from 'hooks/useFetchGetDisableBookingDayLimit'
import * as useFetchGetEmployeeClockInSchedule from 'hooks/useFetchGetEmployeeClockInSchedule'
import * as useFetchGetEmployeeClockInScheduleExcel from 'hooks/useFetchGetEmployeeClockInScheduleExcel'
import * as useFetchGetEmployeePayslipPrintStyle from 'hooks/useFetchGetEmployeePayslipPrintStyle'
import * as useFetchGetEmployeePickingPurpose from 'hooks/useFetchGetEmployeePickingPurpose'
import * as useFetchGetEmployeeResignationList from 'hooks/useFetchGetEmployeeResignationList'
import * as useFetchGetEventRuleGroup from 'hooks/useFetchGetEventRuleGroup'
import * as useFetchGetHelperDailyReport from 'hooks/useFetchGetHelperDailyReport'
import * as useFetchGetHelperMonthlyReport from 'hooks/useFetchGetHelperMonthlyReport'
import * as useFetchGetHelperPerformance from 'hooks/useFetchGetHelperPerformance'
import * as useFetchGetInventorys from 'hooks/useFetchGetInventorys'
import * as useFetchGetIsAbleToChangeDateTimeInOrder from 'hooks/useFetchGetIsAbleToChangeDateTimeInOrder'
import * as useFetchGetIsAutoSetPreferDesignerForOrderCreate from 'hooks/useFetchGetIsAutoSetPreferDesignerForOrderCreate'
import * as useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import * as useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import * as useFetchGetIsBookingRemarkDisplay from 'hooks/useFetchGetIsBookingRemarkDisplay'
import * as useFetchGetIsBorrowDisplayInSalaryOverview from 'hooks/useFetchGetIsBorrowDisplayInSalaryOverview'
import * as useFetchGetIsCBRDStylist from 'hooks/useFetchGetIsCBRDStylist'
import * as useFetchGetIsCusBookingRemarkDisplay from 'hooks/useFetchGetIsCusBookingRemarkDisplay'
import * as useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import * as useFetchGetIsCustomerSelfCreateActive from 'hooks/useFetchGetIsCustomerSelfCreateActive'
import * as useFetchGetIsDisplayFakePerformanceInSalaryReport from 'hooks/useFetchGetIsDisplayFakePerformanceInSalaryReport'
import * as useFetchGetIsDisplayHelperRetrieveInDailyReport from 'hooks/useFetchGetIsDisplayHelperRetrieveInDailyReport'
import * as useFetchGetIsDisplayNonBankAccountInBankTransferReport from 'hooks/useFetchGetIsDisplayNonBankAccountInBankTransferReport'
import * as useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import * as useFetchGetIsEPWDDisplay from 'hooks/useFetchGetIsEPWDDisplay'
import * as useFetchGetIsEmployeeScheduleUndoActive from 'hooks/useFetchGetIsEmployeeScheduleUndoActive'
import * as useFetchGetIsEmployeeScheduleWorkingHourDisplay from 'hooks/useFetchGetIsEmployeeScheduleWorkingHourDisplay'
import * as useFetchGetIsHelperDesignationSetting from 'hooks/useFetchGetIsHelperDesignationSetting'
import * as useFetchGetIsLockDateDisplaySetting from 'hooks/useFetchGetIsLockDateDisplaySetting'
import * as useFetchGetIsLockDateSetting from 'hooks/useFetchGetIsLockDateSetting'
import * as useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import * as useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard from 'hooks/useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard'
import * as useFetchGetIsOpenDateRangeInOrderMangement from 'hooks/useFetchGetIsOpenDateRangeInOrderMangement'

const ROWS = [
  {
    id: 'useFetchDestroyQueueById',
    hook: useFetchDestroyQueueById.default,
    args: [],
    invoke: [{ fn: 'destroyQueueById', args: [{ queueId: 'queueId-v' }] }],
    expect: {
      initial: [],
      shape: { destroyQueueById: 'function' },
      invoked: [
        {
          fn: 'destroyQueueById',
          calls: [{ operationName: 'DELETE_QUEUE', variables: { queueId: 'queueId-v' } }],
          resolved: ['destroyQueueById'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDestroyUserSalaryMonthlyCheckoutRecord',
    hook: useFetchDestroyUserSalaryMonthlyCheckoutRecord.default,
    args: [],
    invoke: [{ fn: 'destroyUserSalaryMonthlyCheckoutRecord', args: [{ date: 'date-v', userIds: ['userIds-1'] }] }],
    expect: {
      initial: [],
      shape: { destroyUserSalaryMonthlyCheckoutRecord: 'function' },
      invoked: [
        {
          fn: 'destroyUserSalaryMonthlyCheckoutRecord',
          calls: [{ operationName: 'DESTROY_CHECKOUT_RECORD', variables: { date: 'date-v', userIds: ['userIds-1'] } }],
          resolved: ['destroyUserSalaryMonthlyCheckoutRecord'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchEmployeeSaleSetting.useFetchSetUserRake',
    hook: useFetchEmployeeSaleSetting.useFetchSetUserRake,
    args: [],
    invoke: [{ fn: 'fetchSetUserRake', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { fetchSetUserRake: 'function' },
      invoked: [
        {
          fn: 'fetchSetUserRake',
          calls: [{ operationName: 'FETCH_SET_USER_RAKE', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserRake'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchEmployeeSaleSetting.useFetchUpdateUserIdentity',
    hook: useFetchEmployeeSaleSetting.useFetchUpdateUserIdentity,
    args: [],
    invoke: [{ fn: 'fetchUpdateUserIdentity', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { fetchUpdateUserIdentity: 'function' },
      invoked: [
        {
          fn: 'fetchUpdateUserIdentity',
          calls: [{ operationName: 'FETCH_UPDATE_USER_IDENTITY', variables: { input: { probe: 'input' } } }],
          resolved: ['updateUserIdentity'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchEmployeeSchedule',
    hook: useFetchEmployeeSchedule.default,
    args: [],
    expect: {
      initial: [{ operationName: 'FETCH_EMPLOYEE_SCHEDULE', variables: {} }],
      shape: { loading: false, called: true, data: ['getEmployeeSchedule'] },
      policies: { FETCH_EMPLOYEE_SCHEDULE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchEndEventRuleGroup',
    hook: useFetchEndEventRuleGroup.default,
    args: [],
    invoke: [{ fn: 'endEventRuleGroup', args: ['groupId-v'] }],
    expect: {
      initial: [],
      shape: { endEventRuleGroup: 'function' },
      invoked: [
        {
          fn: 'endEventRuleGroup',
          calls: [{ operationName: 'END_EVENT_RULE_GROUP', variables: { groupId: 'groupId-v' } }],
          resolved: ['endEventRuleGroup'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchGetAccountingSubjects',
    hook: useFetchGetAccountingSubjects.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ACCOUNTING_SUBJECTS', variables: {} }],
      shape: { loading: false, called: true, data: ['accountingSubjects'] },
      policies: { GET_ACCOUNTING_SUBJECTS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetActionsBannedAfterDailyCheckout',
    hook: useFetchGetActionsBannedAfterDailyCheckout.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT', variables: {} }],
      shape: { loading: false, called: true, data: ['getActionsBannedAfterDailyCheckout'] },
      policies: { GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetAttribution',
    hook: useFetchGetAttribution.default,
    args: [],
    expect: {
      initial: [{ operationName: 'USE_FETCH_GET_ATTRIBUTIONS', variables: {} }],
      shape: { loading: false, called: true, data: ['getAttribution'] },
      policies: { USE_FETCH_GET_ATTRIBUTIONS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetAttribution.useFetchGetAttributionLazy',
    hook: useFetchGetAttribution.useFetchGetAttributionLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'USE_FETCH_GET_ATTRIBUTIONS', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getAttribution'] }],
      policies: { USE_FETCH_GET_ATTRIBUTIONS: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetAttribution.useFetchGetAttributionForRake',
    hook: useFetchGetAttribution.useFetchGetAttributionForRake,
    args: [],
    expect: {
      initial: [{ operationName: 'USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE', variables: {} }],
      shape: { loading: false, called: true, data: ['getAttributionForRake'] },
      policies: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBindedThirdPartTicketLockedSetting',
    hook: useFetchGetBindedThirdPartTicketLockedSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING', variables: {} }],
      shape: { loading: false, called: true, data: ['getBindedThirdPartTicketLockedSetting'] },
      policies: { GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBonusRewardRule',
    hook: useFetchGetBonusRewardRule.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_BONUS_REWARD_RULE', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_BONUS_REWARD_RULE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBookingLineNotifySettings',
    hook: useFetchGetBookingLineNotifySettings.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GetBookingLineNotifySettings', variables: {} }],
      shape: { loading: false, called: true, data: ['getBookingLineNotifySettings'] },
      policies: { GetBookingLineNotifySettings: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBookingManagement',
    hook: useFetchGetBookingManagement.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_BOOKING_MANAGEMENT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['bookingManagement'] },
      policies: { GET_BOOKING_MANAGEMENT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBookingTypeForSocket',
    hook: useFetchGetBookingTypeForSocket.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_BOOKING_TYPE_FOR_SOCKET', variables: {} }],
      shape: { loading: false, called: true, data: ['getBookingTypeForSocket'] },
      policies: { GET_IS_BOOKING_TYPE_FOR_SOCKET: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBusinessAnalysisReport',
    hook: useFetchGetBusinessAnalysisReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_BUSINESS_ANALYSIS_DATA', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['businessAnalysisReport'] },
      policies: { GET_BUSINESS_ANALYSIS_DATA: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBusinessItemsMonthlyReport',
    hook: useFetchGetBusinessItemsMonthlyReport.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_BUSINESS_ITEMS_MOTHLY_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['businessItemsMonthlyReport'] },
      policies: { GET_BUSINESS_ITEMS_MOTHLY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetBusinessItemsMonthlyReportExcel',
    hook: useFetchGetBusinessItemsMonthlyReportExcel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['businessItemsMonthlyReportExcel'] }],
      policies: { GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCheckIsCustomerNoUsed',
    hook: useFetchGetCheckIsCustomerNoUsed.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' }, customerId: 'customerId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_CHECK_IS_CUSTOMER_NO_USED',
              variables: { input: { probe: 'input' }, customerId: 'customerId-v' },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['checkIsCustomerNoUsed'] }],
      policies: { GET_CHECK_IS_CUSTOMER_NO_USED: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetConsumptionAnalyticsDashboard',
    hook: useFetchGetConsumptionAnalyticsDashboard.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_CONSUMPTION_ANALYTICS_DASHDOARD', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['consumptionAnalyticsDashboard'] }],
      policies: { GET_CONSUMPTION_ANALYTICS_DASHDOARD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerBonusDepositRecords',
    hook: useFetchGetCustomerBonusDepositRecords.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_BONUS_DEPOSIT_RECORDS', variables: {} }],
      shape: { loading: false, called: true, data: ['customerBonusDepositRecords'] },
      policies: { GET_CUSTOMER_BONUS_DEPOSIT_RECORDS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerBonusDepositRecords.useFetchGetCustomerBonusDepositRecord',
    hook: useFetchGetCustomerBonusDepositRecords.useFetchGetCustomerBonusDepositRecord,
    args: [{ bonusId: 'bonusId-v' }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_BONUS_DEPOSIT_RECORD', variables: { bonusId: 'bonusId-v' } }],
      shape: { loading: false, called: true, data: ['customerBonusDepositRecord'] },
      policies: { GET_CUSTOMER_BONUS_DEPOSIT_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerBonusRecord',
    hook: useFetchGetCustomerBonusRecord.default,
    args: [{ customerId: 'customerId-v' }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_BONUS_RECORD', variables: { customerId: 'customerId-v' } }],
      shape: { loading: false, called: true, data: ['customerBonusRecord'] },
      policies: { GET_CUSTOMER_BONUS_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerBonusRecord.useFetchGetCustomerBonusRecordLazy',
    hook: useFetchGetCustomerBonusRecord.useFetchGetCustomerBonusRecordLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { customerId: 'customerId-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        { fn: 0, calls: [{ operationName: 'GET_CUSTOMER_BONUS_RECORD', variables: { customerId: 'customerId-v' } }] },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerBonusRecord'] }],
      policies: { GET_CUSTOMER_BONUS_RECORD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerCheckTicket',
    hook: useFetchGetCustomerCheckTicket.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        { fn: 0, calls: [{ operationName: 'GET_CUSTOMER_CHECK_TICKET', variables: { input: { probe: 'input' } } }] },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerCheckTicket'] }],
      policies: { GET_CUSTOMER_CHECK_TICKET: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerConsumptionLeaderboard',
    hook: useFetchGetCustomerConsumptionLeaderboard.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_CUSTOMER_CONSUMPYION_LEADERBOARD', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerConsumptionLeaderboard'] }],
      policies: { GET_CUSTOMER_CONSUMPYION_LEADERBOARD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerConsumptionLeaderboardExcel',
    hook: useFetchGetCustomerConsumptionLeaderboardExcel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            { operationName: 'GET_CUSTOMER_CONSUMPYION_LEADERBOARD_EXECEL', variables: { input: { probe: 'input' } } },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerConsumptionLeaderboardExcel'] }],
      policies: { GET_CUSTOMER_CONSUMPYION_LEADERBOARD_EXECEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerDataMarkedDefault',
    hook: useFetchGetCustomerDataMarkedDefault.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_DATA_MARKED', variables: {} }],
      shape: { loading: false, called: true, data: ['getCustomerDataMarkedDefault'] },
      policies: { GET_CUSTOMER_DATA_MARKED: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerEventTicketsForMerchant',
    hook: useFetchGetCustomerEventTicketsForMerchant.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['customerEventTicketsForMerchant'] },
      policies: { GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerHairInfo',
    hook: useFetchGetCustomerHairInfo.default,
    args: ['customerId-v'],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_HAIR_INFO', variables: { customerId: 'customerId-v' } }],
      shape: { loading: false, called: true, data: ['getCustomerHairInfo'] },
      policies: { GET_CUSTOMER_HAIR_INFO: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerOrders',
    hook: useFetchGetCustomerOrders.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_ORDER_LIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getCustomerOrders'] },
      policies: { GET_CUSTOMER_ORDER_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerReference',
    hook: useFetchGetCustomerReference.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_REFERENCE', variables: {} }],
      shape: { loading: false, called: true, data: ['getCustomerReference'] },
      policies: { GET_CUSTOMER_REFERENCE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerReference.useFetchGetCustomerReferenceLazy',
    hook: useFetchGetCustomerReference.useFetchGetCustomerReferenceLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_CUSTOMER_REFERENCE', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getCustomerReference'] }],
      policies: { GET_CUSTOMER_REFERENCE: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetCustomerSMSRecord',
    hook: useFetchGetCustomerSMSRecord.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_SMS_RECORD', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['customerSMSRecord'] },
      policies: { GET_CUSTOMER_SMS_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetCustomerWalletLeaderboard',
    hook: useFetchGetCustomerWalletLeaderboard.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_CUSTOMER_WALLET_LEADERBOARD', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerWalletLeaderboard'] }],
      policies: { GET_CUSTOMER_WALLET_LEADERBOARD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetCustomerWalletLeaderboardExcel',
    hook: useFetchGetCustomerWalletLeaderboardExcel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customerWalletLeaderboardExcel'] }],
      policies: { GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetDeductionSettings.useFetchDeductionSettings',
    hook: useFetchGetDeductionSettings.useFetchDeductionSettings,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_MULTIPLE_DEDUCTION_SETTINGS', variables: {} }],
      shape: { loading: false, called: true, data: ['getDeductionSettings'] },
      policies: { GET_MULTIPLE_DEDUCTION_SETTINGS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDeductionSettings.useFetchDeductionSetting',
    hook: useFetchGetDeductionSettings.useFetchDeductionSetting,
    args: ['DeductionSettingId-v'],
    expect: {
      initial: [{ operationName: 'GET_DEDUCTION_SETTING', variables: { DeductionSettingId: 'DeductionSettingId-v' } }],
      shape: { loading: false, called: true, data: ['getDeductionSetting'] },
      policies: { GET_DEDUCTION_SETTING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignationSettingForOrderCreate',
    hook: useFetchGetDesignationSettingForOrderCreate.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DESIGNATION_SETTING_FOR_ORDER_CREATE', variables: {} }],
      shape: { loading: false, called: true, data: ['getDesignationSettingForOrderCreate'] },
      policies: { GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignerNameDisplayOnInvoice',
    hook: useFetchGetDesignerNameDisplayOnInvoice.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DESIGNER_NAME_DISPLAY_ON_INVOICE', variables: {} }],
      shape: { loading: false, called: true, data: ['getDesignerNameDisplayOnInvoice'] },
      policies: { GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignerNameForCustomerSide',
    hook: useFetchGetDesignerNameForCustomerSide.default,
    args: [],
    expect: {
      initial: [{ operationName: 'getDesignerNameForCustomerSide', variables: {} }],
      shape: { loading: false, called: true, data: ['getDesignerNameForCustomerSide'] },
      policies: { getDesignerNameForCustomerSide: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignerNameForReportType',
    hook: useFetchGetDesignerNameForReportType.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DESIGNER_NAME_FOR_REPORT_TYPE', variables: {} }],
      shape: { loading: false, called: true, data: ['getDesignerNameForReportType'] },
      policies: { GET_DESIGNER_NAME_FOR_REPORT_TYPE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignerPerformance',
    hook: useFetchGetDesignerPerformance.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_DESIGNER_PERFORMANCE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['designerPerformance'] },
      policies: { GET_DESIGNER_PERFORMANCE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetDesignerPerformanceExcel',
    hook: useFetchGetDesignerPerformanceExcel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'GET_DESIGNER_PERFORMANCE_EXCEL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['designerPerformanceExcel'] }],
      policies: { GET_DESIGNER_PERFORMANCE_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetDisableBookingDayLimit',
    hook: useFetchGetDisableBookingDayLimit.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_DISABLE_BOOKING_DAY_LIMIT', variables: {} }],
      shape: { loading: false, called: true, data: ['getDisableBookingDayLimit'] },
      policies: { GET_DISABLE_BOOKING_DAY_LIMIT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetEmployeeClockInSchedule',
    hook: useFetchGetEmployeeClockInSchedule.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_EMPLOYEE_CLOCK_IN_SCHEDULE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getEmployeeClockInSchedule'] },
      policies: { GET_EMPLOYEE_CLOCK_IN_SCHEDULE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetEmployeeClockInScheduleExcel',
    hook: useFetchGetEmployeeClockInScheduleExcel.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            { operationName: 'FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL', variables: { input: { probe: 'input' } } },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['getEmployeeClockInScheduleExcel'] }],
      policies: { FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetEmployeePayslipPrintStyle',
    hook: useFetchGetEmployeePayslipPrintStyle.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_EMPLOYEE_PAYSLIP_PRINT_STYLE', variables: {} }],
      shape: { loading: false, called: true, data: ['getEmployeePayslipPrintStyle'] },
      policies: { GET_EMPLOYEE_PAYSLIP_PRINT_STYLE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetEmployeePickingPurpose',
    hook: useFetchGetEmployeePickingPurpose.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_EMPLOYEE_PICKING_PURPOSE', variables: {} }],
      shape: { loading: false, called: true, data: ['getEmployeePickingPurpose'] },
      policies: { GET_EMPLOYEE_PICKING_PURPOSE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetEmployeeResignationList',
    hook: useFetchGetEmployeeResignationList.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_EMPLOYEE_RESIGNATION_LIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getEmployeeResignationList'] },
      policies: { GET_EMPLOYEE_RESIGNATION_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetEventRuleGroup',
    hook: useFetchGetEventRuleGroup.default,
    args: [{ ruleGroupId: 'ruleGroupId-v' }],
    expect: {
      initial: [{ operationName: 'GET_EVENT_RULE_GROUP', variables: { ruleGroupId: 'ruleGroupId-v' } }],
      shape: { loading: false, called: true, data: ['eventRuleGroup'] },
      policies: { GET_EVENT_RULE_GROUP: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetHelperDailyReport',
    hook: useFetchGetHelperDailyReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_HELPER_DAILY_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['helperDailyReport'] },
      policies: { GET_HELPER_DAILY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetHelperMonthlyReport.useFetchGetHelperMonthlyReport',
    hook: useFetchGetHelperMonthlyReport.useFetchGetHelperMonthlyReport,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_HELPER_MONTHLY_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['helperMonthlyReport'] },
      policies: { GET_HELPER_MONTHLY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetHelperPerformance.useFetchGetHelperPerformance',
    hook: useFetchGetHelperPerformance.useFetchGetHelperPerformance,
    args: [{ input: { probe: 'input' }, jobTitle: 'jobTitle-v' }],
    expect: {
      initial: [
        { operationName: 'GET_HELPER_PERFORMANCE', variables: { input: { probe: 'input' }, jobTitle: 'jobTitle-v' } },
      ],
      shape: { loading: false, called: true, data: ['helperPerformanceReport'] },
      policies: { GET_HELPER_PERFORMANCE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetInventorys.useFetchGetInventorysLazy',
    hook: useFetchGetInventorys.useFetchGetInventorysLazy,
    args: [{ input: { probe: 'input' } }],
    invoke: [{ fn: 0, args: [] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_INVENTORYS', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getInventorys'] }],
      policies: { GET_INVENTORYS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchGetInventorys.useFetchGetInventory',
    hook: useFetchGetInventorys.useFetchGetInventory,
    args: [{ inventoryId: 'inventoryId-v' }],
    expect: {
      initial: [{ operationName: 'GET_INVENTORY', variables: { inventoryId: 'inventoryId-v' } }],
      shape: { loading: false, called: true, data: ['getInventory'] },
      policies: { GET_INVENTORY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsAbleToChangeDateTimeInOrder',
    hook: useFetchGetIsAbleToChangeDateTimeInOrder.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsAbleToChangeDateTimeInOrderCreate'] },
      policies: { GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsAutoSetPreferDesignerForOrderCreate',
    hook: useFetchGetIsAutoSetPreferDesignerForOrderCreate.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsAutoSetPreferDesignerForOrderCreate'] },
      policies: { GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsBonusConversion',
    hook: useFetchGetIsBonusConversion.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_BONUS_CONVERSION', variables: {} }],
      shape: { loading: false, called: true, data: ['getParameterAboutSettingFunction'] },
      policies: { GET_IS_BONUS_CONVERSION: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsBookingCusCheckUsing',
    hook: useFetchGetIsBookingCusCheckUsing.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_BOOKING_CUS_CHECK_USING', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsBookingCusCheckUsing'] },
      policies: { GET_IS_BOOKING_CUS_CHECK_USING: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsBookingRemarkDisplay',
    hook: useFetchGetIsBookingRemarkDisplay.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_BOOKING_REMARK_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsBookingRemarkDisplay'] },
      policies: { GET_BOOKING_REMARK_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsBorrowDisplayInSalaryOverview',
    hook: useFetchGetIsBorrowDisplayInSalaryOverview.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_BORROW_IN_SALARY_OVERVIEW', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsBorrowDisplayInSalaryOverview'] },
      policies: { GET_IS_BORROW_IN_SALARY_OVERVIEW: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsCBRDStylist',
    hook: useFetchGetIsCBRDStylist.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_CBRD_STYLIST', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsCBRDStylist'] },
      policies: { GET_IS_CBRD_STYLIST: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsCusBookingRemarkDisplay',
    hook: useFetchGetIsCusBookingRemarkDisplay.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CUS_BOOKING_REMARK_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsCusBookingRemarkDisplay'] },
      policies: { GET_CUS_BOOKING_REMARK_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsCustomerBonusActive',
    hook: useFetchGetIsCustomerBonusActive.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_BONUS', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsCustomerBonusActive'] },
      policies: { GET_CUSTOMER_BONUS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsCustomerBonusActive.useFetchGetIsCustomerBonusActiveLazy',
    hook: useFetchGetIsCustomerBonusActive.useFetchGetIsCustomerBonusActiveLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_CUSTOMER_BONUS', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getIsCustomerBonusActive'] }],
      policies: { GET_CUSTOMER_BONUS: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetIsCustomerSelfCreateActive',
    hook: useFetchGetIsCustomerSelfCreateActive.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_SELF_CREATE_ACTIVE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getIsCustomerSelfCreateActive'] },
      policies: { GET_CUSTOMER_SELF_CREATE_ACTIVE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsDisplayFakePerformanceInSalaryReport',
    hook: useFetchGetIsDisplayFakePerformanceInSalaryReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDisplayFakePerformanceInSalaryReport'] },
      policies: { GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsDisplayFakePerformanceInSalaryReport.useFetchGetIsDisplayFakePerformanceInSalaryReportLazy',
    hook: useFetchGetIsDisplayFakePerformanceInSalaryReport.useFetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    args: [],
    invoke: [{ fn: 'fetchGetIsDisplayFakePerformanceInSalaryReportLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: {
        fetchGetIsDisplayFakePerformanceInSalaryReportLazy: 'function',
        getIsDisplayFakePerformanceInSalaryReportLazyData: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchGetIsDisplayFakePerformanceInSalaryReportLazy',
          calls: [{ operationName: 'GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT', variables: {} }],
        },
      ],
      shapeAfter: {
        fetchGetIsDisplayFakePerformanceInSalaryReportLazy: 'function',
        getIsDisplayFakePerformanceInSalaryReportLazyData: {
          loading: false,
          called: true,
          data: ['getIsDisplayFakePerformanceInSalaryReport'],
        },
      },
      policies: { GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetIsDisplayHelperRetrieveInDailyReport',
    hook: useFetchGetIsDisplayHelperRetrieveInDailyReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDisplayHelperRetrieveInDailyReport'] },
      policies: { GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsDisplayNonBankAccountInBankTransferReport',
    hook: useFetchGetIsDisplayNonBankAccountInBankTransferReport.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDisplayNonBankAccountInBankTransferReport'] },
      policies: { GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsDisplayTogglePerformanceButton',
    hook: useFetchGetIsDisplayTogglePerformanceButton.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDisplayTogglePerformanceButton'] },
      policies: { GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsEPWDDisplay',
    hook: useFetchGetIsEPWDDisplay.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_EPWD_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsEPWDDisplay'] },
      policies: { GET_IS_EPWD_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsEPWDDisplay.useFetchGetIsEPWDDisplayLazy',
    hook: useFetchGetIsEPWDDisplay.useFetchGetIsEPWDDisplayLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_IS_EPWD_DISPLAY', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['getIsEPWDDisplay'] }],
      policies: { GET_IS_EPWD_DISPLAY: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetIsEmployeeScheduleUndoActive',
    hook: useFetchGetIsEmployeeScheduleUndoActive.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsEmployeeScheduleUndoActive'] },
      policies: { GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsEmployeeScheduleWorkingHourDisplay',
    hook: useFetchGetIsEmployeeScheduleWorkingHourDisplay.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsEmployeeScheduleWorkingHourDisplay'] },
      policies: { GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsHelperDesignationSetting',
    hook: useFetchGetIsHelperDesignationSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_HELPER_DESIGNATION_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsHelperDesignationDisplay'] },
      policies: { GET_HELPER_DESIGNATION_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsLockDateDisplaySetting',
    hook: useFetchGetIsLockDateDisplaySetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_LOCK_DATE_DISPLAY', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDateLockDisplay'] },
      policies: { GET_IS_LOCK_DATE_DISPLAY: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsLockDateSetting',
    hook: useFetchGetIsLockDateSetting.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_LOCK_DATE', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsDateLock'] },
      policies: { GET_IS_LOCK_DATE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsMemberShipCardActive',
    hook: useFetchGetIsMemberShipCardActive.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_MEMBERSHIP_CARD_ACTIVE', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsMemberShipCardActive'] },
      policies: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsMemberShipCardActive.useFetchGetIsMemberShipCardActiveLazy',
    hook: useFetchGetIsMemberShipCardActive.useFetchGetIsMemberShipCardActiveLazy,
    args: [],
    invoke: [{ fn: 'memberActiveLazy', args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: { memberActiveLazy: 'function', memberActiveLazyData: { loading: false, called: false } },
      invoked: [{ fn: 'memberActiveLazy', calls: [{ operationName: 'GET_IS_MEMBERSHIP_CARD_ACTIVE', variables: {} }] }],
      shapeAfter: {
        memberActiveLazy: 'function',
        memberActiveLazyData: { loading: false, called: true, data: ['getIsMemberShipCardActive'] },
      },
      policies: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 'cache-first' },
    },
  },
  {
    id: 'useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard',
    hook: useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsMonthlyAverageDisplayForMerchantLeaderBoard'] },
      policies: { GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchGetIsOpenDateRangeInOrderMangement',
    hook: useFetchGetIsOpenDateRangeInOrderMangement.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT', variables: {} }],
      shape: { loading: false, called: true, data: ['getIsOpenDateRangeInOrderMangement'] },
      policies: { GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
]

describe('useFetchDestroyQueueById ～ useFetchGetIsOpenDateRangeInOrderMangement', () => {
  runContractRows(ROWS)
})
