// src/hooks 契約測試（1/6）：useFetchAccountingSubjects ～ useFetchDesignersRakeReport
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
import * as useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import * as useFetchAccountingType from 'hooks/useFetchAccountingType'
import * as useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import * as useFetchAddCustomerBonus from 'hooks/useFetchAddCustomerBonus'
import * as useFetchAddPicking from 'hooks/useFetchAddPicking'
import * as useFetchAdminBookingTime from 'hooks/useFetchAdminBookingTime'
import * as useFetchAttendanceRecords from 'hooks/useFetchAttendanceRecords'
import * as useFetchAttendanceRecordsExcel from 'hooks/useFetchAttendanceRecordsExcel'
import * as useFetchBatchSettingForDeduction from 'hooks/useFetchBatchSettingForDeduction'
import * as useFetchBatchSettingForHelper from 'hooks/useFetchBatchSettingForHelper'
import * as useFetchBooking from 'hooks/useFetchBooking'
import * as useFetchChangePassword from 'hooks/useFetchChangePassword'
import * as useFetchCheckIsCustomerExistForOuterStore from 'hooks/useFetchCheckIsCustomerExistForOuterStore'
import * as useFetchCheckPageAuthority from 'hooks/useFetchCheckPageAuthority'
import * as useFetchCloseDailyAccountV3 from 'hooks/useFetchCloseDailyAccountV3'
import * as useFetchCreateCoupon from 'hooks/useFetchCreateCoupon'
import * as useFetchCreateEventRuleGroup from 'hooks/useFetchCreateEventRuleGroup'
import * as useFetchCreateMainEvent from 'hooks/useFetchCreateMainEvent'
import * as useFetchCreateMembership from 'hooks/useFetchCreateMembership'
import * as useFetchCreateMembershipCategory from 'hooks/useFetchCreateMembershipCategory'
import * as useFetchCreateMerchantCusExternalLink from 'hooks/useFetchCreateMerchantCusExternalLink'
import * as useFetchCreateMerchantExternalLink from 'hooks/useFetchCreateMerchantExternalLink'
import * as useFetchCreateMerchantPointValueSetting from 'hooks/useFetchCreateMerchantPointValueSetting'
import * as useFetchCreateMoneyFlow from 'hooks/useFetchCreateMoneyFlow'
import * as useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import * as useFetchCreatePayment from 'hooks/useFetchCreatePayment'
import * as useFetchCreateProduct from 'hooks/useFetchCreateProduct'
import * as useFetchCreateProductCategory from 'hooks/useFetchCreateProductCategory'
import * as useFetchCreatePurchase from 'hooks/useFetchCreatePurchase'
import * as useFetchCreateService from 'hooks/useFetchCreateService'
import * as useFetchCreateThirdPartTicket from 'hooks/useFetchCreateThirdPartTicket'
import * as useFetchCreateUser from 'hooks/useFetchCreateUser'
import * as useFetchCustomer from 'hooks/useFetchCustomer'
import * as useFetchCustomerCancelOrder from 'hooks/useFetchCustomerCancelOrder'
import * as useFetchCustomerCouponReport from 'hooks/useFetchCustomerCouponReport'
import * as useFetchCustomerOrders from 'hooks/useFetchCustomerOrders'
import * as useFetchCustomerSelfCreate from 'hooks/useFetchCustomerSelfCreate'
import * as useFetchCustomerVerifySMS from 'hooks/useFetchCustomerVerifySMS'
import * as useFetchCustomerWallet from 'hooks/useFetchCustomerWallet'
import * as useFetchCustomerWalletReport from 'hooks/useFetchCustomerWalletReport'
import * as useFetchCustomers from 'hooks/useFetchCustomers'
import * as useFetchCustomersWithoutSortingExcel from 'hooks/useFetchCustomersWithoutSortingExcel'
import * as useFetchDailyClockInRecord from 'hooks/useFetchDailyClockInRecord'
import * as useFetchDailyMoneyFlowReport from 'hooks/useFetchDailyMoneyFlowReport'
import * as useFetchDeleteAttendantRecord from 'hooks/useFetchDeleteAttendantRecord'
import * as useFetchDeleteAuthority from 'hooks/useFetchDeleteAuthority'
import * as useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import * as useFetchDeleteCustomer from 'hooks/useFetchDeleteCustomer'
import * as useFetchDeleteInventory from 'hooks/useFetchDeleteInventory'
import * as useFetchDeleteMembership from 'hooks/useFetchDeleteMembership'
import * as useFetchDeleteMembershipCategory from 'hooks/useFetchDeleteMembershipCategory'
import * as useFetchDeleteMerchantCusExternalLink from 'hooks/useFetchDeleteMerchantCusExternalLink'
import * as useFetchDeleteMerchantExternalLink from 'hooks/useFetchDeleteMerchantExternalLink'
import * as useFetchDeleteMerchantPointValueSetting from 'hooks/useFetchDeleteMerchantPointValueSetting'
import * as useFetchDeleteMoneyFlow from 'hooks/useFetchDeleteMoneyFlow'
import * as useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import * as useFetchDeletePayment from 'hooks/useFetchDeletePayment'
import * as useFetchDeletePicking from 'hooks/useFetchDeletePicking'
import * as useFetchDeleteProductCategory from 'hooks/useFetchDeleteProductCategory'
import * as useFetchDeleteProducts from 'hooks/useFetchDeleteProducts'
import * as useFetchDeletePurchase from 'hooks/useFetchDeletePurchase'
import * as useFetchDeleteService from 'hooks/useFetchDeleteService'
import * as useFetchDeleteServiceCategories from 'hooks/useFetchDeleteServiceCategories'
import * as useFetchDeleteThirdPartTicket from 'hooks/useFetchDeleteThirdPartTicket'
import * as useFetchDeleteWalletDeposit from 'hooks/useFetchDeleteWalletDeposit'
import * as useFetchDesignerBookingTimes from 'hooks/useFetchDesignerBookingTimes'
import * as useFetchDesignerDailyReport from 'hooks/useFetchDesignerDailyReport'
import * as useFetchDesignerMonthlyReport from 'hooks/useFetchDesignerMonthlyReport'
import * as useFetchDesignerPerformanceAnalyzeExcel from 'hooks/useFetchDesignerPerformanceAnalyzeExcel'
import * as useFetchDesignerPerformanceAnalyzeReport from 'hooks/useFetchDesignerPerformanceAnalyzeReport'
import * as useFetchDesignersLeaderboard from 'hooks/useFetchDesignersLeaderboard'
import * as useFetchDesignersRakeReport from 'hooks/useFetchDesignersRakeReport'

const ROWS = [
  {
    id: 'useFetchAccountingSubjects',
    hook: useFetchAccountingSubjects.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_ACCOUNTING_SUBJECTS', variables: {} }],
      shape: { loading: false, called: true, data: ['accountingSubjects'] },
      policies: { GET_ACCOUNTING_SUBJECTS: 'cache-first' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchAccountingType',
    hook: useFetchAccountingType.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_ACCOUNTING_TYPE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['getAccountingType'] },
      policies: { GET_ACCOUNTING_TYPE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchAddCustomer',
    hook: useFetchAddCustomer.default,
    args: [],
    invoke: [{ fn: 'addCustomer', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { addCustomer: 'function' },
      invoked: [
        {
          fn: 'addCustomer',
          calls: [{ operationName: 'FETCH_ADD_CUSTOMER', variables: { input: { probe: 'input' } } }],
          resolved: ['addCustomer'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchAddCustomerBonus',
    hook: useFetchAddCustomerBonus.default,
    args: [],
    invoke: [{ fn: 'AddCustomerBonus', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { AddCustomerBonus: 'function' },
      invoked: [
        {
          fn: 'AddCustomerBonus',
          calls: [{ operationName: 'ADD_CUSTOMER_BONUS', variables: { input: { probe: 'input' } } }],
          resolved: ['addCustomerBonus'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchAddPicking',
    hook: useFetchAddPicking.default,
    args: [],
    invoke: [{ fn: 'addPicking', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { addPicking: 'function' },
      invoked: [
        {
          fn: 'addPicking',
          calls: [{ operationName: 'addPicking', variables: { input: { probe: 'input' } } }],
          resolved: ['addPicking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchAdminBookingTime',
    hook: useFetchAdminBookingTime.default,
    args: [],
    invoke: [{ fn: 'adminBookingTime', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { adminBookingTime: 'function' },
      invoked: [
        {
          fn: 'adminBookingTime',
          calls: [{ operationName: 'adminBookingTime', variables: { input: { probe: 'input' } } }],
          resolved: ['adminBookingTime'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchAdminBookingTime.useFetchAdminBookingTimeAllStore',
    hook: useFetchAdminBookingTime.useFetchAdminBookingTimeAllStore,
    args: [],
    invoke: [{ fn: 'adminBookingTimeAllStore', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { adminBookingTimeAllStore: 'function' },
      invoked: [
        {
          fn: 'adminBookingTimeAllStore',
          calls: [{ operationName: 'adminBookingTimeAllStore', variables: { input: { probe: 'input' } } }],
          resolved: ['adminBookingTimeAllStore'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchAttendanceRecords.useFetchAttendanceRecordsLazy',
    hook: useFetchAttendanceRecords.useFetchAttendanceRecordsLazy,
    args: [{ probe: 'input' }],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_ALL_ATTENDANCE', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['attendanceRecords'] }],
      policies: { GET_ALL_ATTENDANCE: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchAttendanceRecords.useFetchGetAttendanceStatus',
    hook: useFetchAttendanceRecords.useFetchGetAttendanceStatus,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_ATTENDANCE_STATUS', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['attendanceRecords'] },
      policies: { GET_ATTENDANCE_STATUS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchAttendanceRecordsExcel.useFetchAttendanceRecordsExcelV2',
    hook: useFetchAttendanceRecordsExcel.useFetchAttendanceRecordsExcelV2,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'FETCH_ATTENDANCE_RECORDS_EXCELV2', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['attendanceRecordsExcelV2'] }],
      policies: { FETCH_ATTENDANCE_RECORDS_EXCELV2: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchAttendanceRecordsExcel.useFetchAttendanceRecordsExcelV2ForHR',
    hook: useFetchAttendanceRecordsExcel.useFetchAttendanceRecordsExcelV2ForHR,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['attendanceRecordsExcelV2ForHR'] }],
      policies: { FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchBatchSettingForDeduction',
    hook: useFetchBatchSettingForDeduction.default,
    args: [],
    invoke: [{ fn: 'setBatchSettingForDeduction', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setBatchSettingForDeduction: 'function' },
      invoked: [
        {
          fn: 'setBatchSettingForDeduction',
          calls: [{ operationName: 'SET_BATCH_SETTING_FOR_DEDUCTION', variables: { input: { probe: 'input' } } }],
          resolved: ['batchSettingForDeduction'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchBatchSettingForHelper',
    hook: useFetchBatchSettingForHelper.default,
    args: [],
    invoke: [{ fn: 'setBatchSettingForHelper', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setBatchSettingForHelper: 'function' },
      invoked: [
        {
          fn: 'setBatchSettingForHelper',
          calls: [{ operationName: 'SET_BATCH_SETTING_FOR_HELPER', variables: { input: { probe: 'input' } } }],
          resolved: ['batchSettingForHelper'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchBooking',
    hook: useFetchBooking.default,
    args: [],
    invoke: [{ fn: 'booking', args: [{ probe: 'BookingV2Input' }] }],
    expect: {
      initial: [],
      shape: { booking: 'function' },
      invoked: [
        {
          fn: 'booking',
          calls: [{ operationName: 'bookingV2', variables: { BookingV2Input: { probe: 'BookingV2Input' } } }],
          resolved: ['bookingV2'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchChangePassword',
    hook: useFetchChangePassword.default,
    args: [],
    invoke: [{ fn: 'changePassword', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { changePassword: 'function' },
      invoked: [
        {
          fn: 'changePassword',
          calls: [{ operationName: 'CHANGE_PASSWORD', variables: { input: { probe: 'input' } } }],
          resolved: ['changePassword'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCheckIsCustomerExistForOuterStore',
    hook: useFetchCheckIsCustomerExistForOuterStore.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'CHECK_IS_CUSTOMER_EXIST', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['checkIsCustomerExistForOuterStore'] }],
      policies: { CHECK_IS_CUSTOMER_EXIST: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchCheckPageAuthority',
    hook: useFetchCheckPageAuthority.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'CHECK_PAGE_AUTHORITY', variables: { input: { probe: 'input' } } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['checkPageAuthority'] }],
      policies: { CHECK_PAGE_AUTHORITY: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchCloseDailyAccountV3',
    hook: useFetchCloseDailyAccountV3.default,
    args: [],
    invoke: [{ fn: 'closeDailyAccountV3', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { closeDailyAccountV3: 'function' },
      invoked: [
        {
          fn: 'closeDailyAccountV3',
          calls: [{ operationName: 'closeDailyAccountV3', variables: { input: { probe: 'input' } } }],
          resolved: ['closeDailyAccountV3'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateCoupon',
    hook: useFetchCreateCoupon.default,
    args: [],
    invoke: [{ fn: 'createCoupon', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createCoupon: 'function' },
      invoked: [
        {
          fn: 'createCoupon',
          calls: [{ operationName: 'CREATE_COUPON', variables: { input: { probe: 'input' } } }],
          resolved: ['createService'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateEventRuleGroup',
    hook: useFetchCreateEventRuleGroup.default,
    args: [],
    invoke: [{ fn: 'createRule', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createRule: 'function' },
      invoked: [
        {
          fn: 'createRule',
          calls: [{ operationName: 'CREATE_EVENT_RULE_GROUP', variables: { input: { probe: 'input' } } }],
          resolved: ['createEventRuleGroup'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMainEvent',
    hook: useFetchCreateMainEvent.default,
    args: [],
    invoke: [{ fn: 'createMainEvent', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createMainEvent: 'function' },
      invoked: [
        {
          fn: 'createMainEvent',
          calls: [{ operationName: 'CREATE_MAIN_EVENT', variables: { input: { probe: 'input' } } }],
          resolved: ['createMainEvent'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMembership',
    hook: useFetchCreateMembership.default,
    args: [],
    invoke: [{ fn: 'createMembership', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createMembership: 'function' },
      invoked: [
        {
          fn: 'createMembership',
          calls: [{ operationName: 'createMembership', variables: { input: { probe: 'input' } } }],
          resolved: ['createMembership'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMembershipCategory',
    hook: useFetchCreateMembershipCategory.default,
    args: [],
    invoke: [{ fn: 'createMembershipCategory', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createMembershipCategory: 'function' },
      invoked: [
        {
          fn: 'createMembershipCategory',
          calls: [{ operationName: 'createMembershipCategory', variables: { input: { probe: 'input' } } }],
          resolved: ['createMembershipCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMerchantCusExternalLink',
    hook: useFetchCreateMerchantCusExternalLink.default,
    args: [],
    invoke: [{ fn: 'createCusLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createCusLink: 'function' },
      invoked: [
        {
          fn: 'createCusLink',
          calls: [{ operationName: 'CREATE_MERCHANT_CUS_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['createMerchantCusExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMerchantExternalLink',
    hook: useFetchCreateMerchantExternalLink.default,
    args: [],
    invoke: [{ fn: 'createLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createLink: 'function' },
      invoked: [
        {
          fn: 'createLink',
          calls: [{ operationName: 'CREATE_MERCHANT_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['createMerchantExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMerchantPointValueSetting',
    hook: useFetchCreateMerchantPointValueSetting.default,
    args: [],
    invoke: [{ fn: 'createMerchantPointValueSetting', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createMerchantPointValueSetting: 'function' },
      invoked: [
        {
          fn: 'createMerchantPointValueSetting',
          calls: [{ operationName: 'CREATE_MERCHANT_POINT_VALUE_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['createMerchantPointValueSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateMoneyFlow',
    hook: useFetchCreateMoneyFlow.default,
    args: [],
    invoke: [{ fn: 'createMoneyFlow', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createMoneyFlow: 'function' },
      invoked: [
        {
          fn: 'createMoneyFlow',
          calls: [{ operationName: 'CREATE_MONEY_FLOW', variables: { input: { probe: 'input' } } }],
          resolved: ['createMoneyFlow'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateOrder',
    hook: useFetchCreateOrder.default,
    args: [],
    invoke: [
      { fn: 'createOrder', args: [{ probe: 'input' }] },
      { fn: 'checkOrder', args: [{ probe: 'input' }] },
    ],
    expect: {
      initial: [],
      shape: { createOrder: 'function', checkOrder: 'function' },
      invoked: [
        {
          fn: 'createOrder',
          calls: [{ operationName: 'FETCH_CREATE_ORDER', variables: { input: { probe: 'input' } } }],
          resolved: ['createOrder2'],
        },
        {
          fn: 'checkOrder',
          calls: [{ operationName: 'CHECK_ORDER', variables: { input: { probe: 'input' } } }],
          resolved: ['checkOrder'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreatePayment',
    hook: useFetchCreatePayment.default,
    args: [],
    invoke: [{ fn: 'createPayment', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createPayment: 'function' },
      invoked: [
        {
          fn: 'createPayment',
          calls: [{ operationName: 'CREATE_PAYMENT', variables: { input: { probe: 'input' } } }],
          resolved: ['addPayWay'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateProduct',
    hook: useFetchCreateProduct.default,
    args: [],
    invoke: [{ fn: 'createProduct', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createProduct: 'function' },
      invoked: [
        {
          fn: 'createProduct',
          calls: [{ operationName: 'CREATE_PRODUCT', variables: { input: { probe: 'input' } } }],
          resolved: ['createProduct'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateProductCategory',
    hook: useFetchCreateProductCategory.default,
    args: [],
    invoke: [{ fn: 'createProductCategory', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createProductCategory: 'function' },
      invoked: [
        {
          fn: 'createProductCategory',
          calls: [{ operationName: 'CREATE_PRODUCT_CATEGORY', variables: { input: { probe: 'input' } } }],
          resolved: ['createProductCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreatePurchase',
    hook: useFetchCreatePurchase.default,
    args: [],
    invoke: [{ fn: 'addPurchase', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { addPurchase: 'function' },
      invoked: [
        {
          fn: 'addPurchase',
          calls: [{ operationName: 'CREATE_PURCHASE', variables: { input: { probe: 'input' } } }],
          resolved: ['createPurchase'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateService',
    hook: useFetchCreateService.default,
    args: [],
    invoke: [{ fn: 'createService', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createService: 'function' },
      invoked: [
        {
          fn: 'createService',
          calls: [{ operationName: 'CREATE_SERVICE', variables: { input: { probe: 'input' } } }],
          resolved: ['createService'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateThirdPartTicket',
    hook: useFetchCreateThirdPartTicket.default,
    args: [],
    invoke: [{ fn: 'createThirdPartyCoupon', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createThirdPartyCoupon: 'function' },
      invoked: [
        {
          fn: 'createThirdPartyCoupon',
          calls: [{ operationName: 'CREATE_THIRD_PARTY_COUPON', variables: { input: { probe: 'input' } } }],
          resolved: ['addThirdPartTicket'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCreateUser',
    hook: useFetchCreateUser.default,
    args: [],
    invoke: [{ fn: 'createUser', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createUser: 'function' },
      invoked: [
        {
          fn: 'createUser',
          calls: [{ operationName: 'CREATE_USER', variables: { input: { probe: 'input' } } }],
          resolved: ['createUser'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCustomer',
    hook: useFetchCustomer.default,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_CUSTOMER_DETAIL', variables: { id: 'id-v' } }],
      shape: { loading: false, called: true, data: ['customer'] },
      policies: { FETCH_CUSTOMER_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomer.useFetchCustomerLazy',
    hook: useFetchCustomer.useFetchCustomerLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { id: 'id-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'FETCH_CUSTOMER_DETAIL', variables: { id: 'id-v' } }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['customer'] }],
      policies: { FETCH_CUSTOMER_DETAIL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchCustomer.useFetchCustomerInOrderDetail',
    hook: useFetchCustomer.useFetchCustomerInOrderDetail,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL', variables: { id: 'id-v' } }],
      shape: { loading: false, called: true, data: ['customer'] },
      policies: { FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomerCancelOrder',
    hook: useFetchCustomerCancelOrder.default,
    args: [],
    invoke: [{ fn: 'cancelOrder', args: ['orderId-v'] }],
    expect: {
      initial: [],
      shape: { cancelOrder: 'function' },
      invoked: [
        {
          fn: 'cancelOrder',
          calls: [{ operationName: 'CustomerCancelOrder', variables: { orderId: 'orderId-v' } }],
          resolved: ['customerCancelOrder'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCustomerCouponReport',
    hook: useFetchCustomerCouponReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_COUPON_BALANCE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['customerCouponBalanceReport'] },
      policies: { GET_CUSTOMER_COUPON_BALANCE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomerOrders',
    hook: useFetchCustomerOrders.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_CUSTOMER_ORDERS', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['viewer'] },
      policies: { FETCH_CUSTOMER_ORDERS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomerSelfCreate',
    hook: useFetchCustomerSelfCreate.default,
    args: [],
    invoke: [{ fn: 'setCustomerCreate', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { setCustomerCreate: 'function' },
      invoked: [
        {
          fn: 'setCustomerCreate',
          calls: [{ operationName: 'CUSTOMER_SELF_CREATE', variables: { input: { probe: 'input' } } }],
          resolved: ['customerSelfCreateV2'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCustomerVerifySMS',
    hook: useFetchCustomerVerifySMS.default,
    args: [],
    invoke: [{ fn: 'verifySMS', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { verifySMS: 'function' },
      invoked: [
        {
          fn: 'verifySMS',
          calls: [{ operationName: 'CustomerVerifySMS', variables: { input: { probe: 'input' } } }],
          resolved: ['customerVerifySMS'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchCustomerWallet',
    hook: useFetchCustomerWallet.default,
    args: [{ customerId: 'customerId-v' }],
    expect: {
      initial: [{ operationName: 'customerWallet', variables: { customerId: 'customerId-v' } }],
      shape: { loading: false, called: true, data: ['customerWallet'] },
      policies: { customerWallet: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomerWallet.useLazyFetchCustomerWallet',
    hook: useFetchCustomerWallet.useLazyFetchCustomerWallet,
    args: [{ customerId: 'customerId-v' }],
    invoke: [{ fn: 'fetchCustomerWallet', args: [] }],
    expect: {
      initial: [],
      shape: { fetchCustomerWallet: 'function', response: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchCustomerWallet',
          calls: [{ operationName: 'customerWallet', variables: { customerId: 'customerId-v' } }],
        },
      ],
      shapeAfter: {
        fetchCustomerWallet: 'function',
        response: { loading: false, called: true, data: ['customerWallet'] },
      },
      policies: { customerWallet: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchCustomerWalletReport',
    hook: useFetchCustomerWalletReport.default,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GET_CUSTOMER_WALLET_BALANCE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['customerWalletReport'] },
      policies: { GET_CUSTOMER_WALLET_BALANCE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomers',
    hook: useFetchCustomers.default,
    args: [{ restProbe: 'rest-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_CUSTOMERS', variables: { input: { restProbe: 'rest-v', merchantId: 'merchant-1' } } }],
      shape: { loading: false, called: true, data: ['customers'] },
      policies: { FETCH_CUSTOMERS: 'cache-and-network' },
    },
    loggedOut: { initial: [{ operationName: 'FETCH_CUSTOMERS', variables: { input: { restProbe: 'rest-v', merchantId: null } } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomers.useFetchCustomersWithoutSorting',
    hook: useFetchCustomers.useFetchCustomersWithoutSorting,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_CUSTOMER_WITHOUT_SORTING', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['customersWithoutSorting'] },
      policies: { FETCH_CUSTOMER_WITHOUT_SORTING: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  // 刻意行為：startDate／endDate 目前不送（原始碼已把生日區間註解掉），只有 customerId 有值時才帶 customerId。
  {
    id: 'useFetchCustomers.useFetchCustomersInAutoComplete',
    hook: useFetchCustomers.useFetchCustomersInAutoComplete,
    args: [
      {
        pageLimit: 10,
        pageOffset: 10,
        keyword: 'keyword-v',
        customerId: 'customerId-v',
        startDate: 'startDate-v',
        endDate: 'endDate-v',
        employeeId: 'employeeId-v',
      },
    ],
    expect: {
      initial: [
        {
          operationName: 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE',
          variables: {
            input: {
              merchantId: 'merchant-1',
              pageLimit: 10,
              keyword: 'keyword-v',
              pageOffset: 10,
              customerId: 'customerId-v',
              preferDesigner: 'employeeId-v',
            },
          },
        },
      ],
      shape: { loading: false, called: true, data: ['customers'] },
      policies: { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: 'cache-and-network' },
    },
    loggedOut: {
      initial: [
        {
          operationName: 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE',
          variables: {
            input: {
              merchantId: null,
              pageLimit: 10,
              keyword: 'keyword-v',
              pageOffset: 10,
              customerId: 'customerId-v',
              preferDesigner: 'employeeId-v',
            },
          },
        },
      ],
    },
    withDefaults: {
      args: [
        {
          pageLimit: 10,
          pageOffset: 10,
          customerId: 'customerId-v',
          startDate: 'startDate-v',
          endDate: 'endDate-v',
          employeeId: 'employeeId-v',
        },
      ],
      expect: {
        initial: [
          {
            operationName: 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE',
            variables: {
              input: {
                merchantId: 'merchant-1',
                pageLimit: 10,
                keyword: '',
                pageOffset: 10,
                customerId: 'customerId-v',
                preferDesigner: 'employeeId-v',
              },
            },
          },
        ],
      },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchCustomersWithoutSortingExcel.useFetchCustomersWithoutSortingExcelLazy',
    hook: useFetchCustomersWithoutSortingExcel.useFetchCustomersWithoutSortingExcelLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [{ operationName: 'FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL', variables: { input: { probe: 'input' } } }],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['customersWithoutSortingExcel'] }],
      policies: { FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDailyClockInRecord',
    hook: useFetchDailyClockInRecord.default,
    args: [{ date: 'date-v', designerId: 'designerId-v', distanceFilter: 'distanceFilter-v' }],
    expect: {
      initial: [
        {
          operationName: 'FETCH_DAILY_CLOCKIN_RECORD',
          variables: { date: 'date-v', designerId: 'designerId-v', distanceFilter: 'distanceFilter-v' },
        },
      ],
      shape: { loading: false, called: true, data: ['dailyClockInRecord'] },
      policies: { FETCH_DAILY_CLOCKIN_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDailyClockInRecord.useFetchDailyClockInRecordLazy',
    hook: useFetchDailyClockInRecord.useFetchDailyClockInRecordLazy,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [{ variables: { date: 'date-v', designerId: 'designerId-v', distanceFilter: 'distanceFilter-v' } }],
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
              operationName: 'FETCH_DAILY_CLOCKIN_RECORD',
              variables: { date: 'date-v', designerId: 'designerId-v', distanceFilter: 'distanceFilter-v' },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['dailyClockInRecord'] }],
      policies: { FETCH_DAILY_CLOCKIN_RECORD: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDailyMoneyFlowReport',
    hook: useFetchDailyMoneyFlowReport.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'dailyMoneyFlowReport', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['dailyMoneyFlowReport'] },
      policies: { dailyMoneyFlowReport: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDeleteAttendantRecord',
    hook: useFetchDeleteAttendantRecord.default,
    args: [],
    invoke: [{ fn: 'deleteAttendantRecord', args: ['clockInScheduleUUId-v'] }],
    expect: {
      initial: [],
      shape: { deleteAttendantRecord: 'function' },
      invoked: [
        {
          fn: 'deleteAttendantRecord',
          calls: [{ operationName: 'deleteAttendantRecord', variables: { clockInScheduleUUId: 'clockInScheduleUUId-v' } }],
          resolved: ['deleteAttendantRecord'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteAuthority',
    hook: useFetchDeleteAuthority.default,
    args: [],
    invoke: [{ fn: 'deleteAuthority', args: [{ authorityId: 'authorityId-v' }] }],
    expect: {
      initial: [],
      shape: { deleteAuthority: 'function' },
      invoked: [
        {
          fn: 'deleteAuthority',
          calls: [{ operationName: 'DELETE_AUTHORITY', variables: { authorityId: 'authorityId-v' } }],
          resolved: ['deleteAuthority'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteBonusDeposit',
    hook: useFetchDeleteBonusDeposit.default,
    args: [],
    invoke: [{ fn: 'deleteBonus', args: [{ bonusId: 'bonusId-v' }] }],
    expect: {
      initial: [],
      shape: { deleteBonus: 'function' },
      invoked: [
        {
          fn: 'deleteBonus',
          calls: [{ operationName: 'DELETE_BONUS_DEPOSIT', variables: { bonusId: 'bonusId-v' } }],
          resolved: ['deleteBonusDeposit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteCustomer',
    hook: useFetchDeleteCustomer.default,
    args: [],
    invoke: [{ fn: 'deleteCustomers', args: [{ customerIds: ['customerIds-1'], password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { deleteCustomers: 'function' },
      invoked: [
        {
          fn: 'deleteCustomers',
          calls: [{ operationName: 'DELETE_CUSTOMERS', variables: { customerIds: ['customerIds-1'], password: 'password-v' } }],
          resolved: ['deleteCustomer'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteInventory',
    hook: useFetchDeleteInventory.default,
    args: [],
    invoke: [{ fn: 'deleteInventory', args: [{ inventoryId: 'inventoryId-v' }] }],
    expect: {
      initial: [],
      shape: { deleteInventory: 'function' },
      invoked: [
        {
          fn: 'deleteInventory',
          calls: [{ operationName: 'DELETE_INVENTORY', variables: { inventoryId: 'inventoryId-v' } }],
          resolved: ['deleteInventory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMembership',
    hook: useFetchDeleteMembership.default,
    args: [],
    invoke: [{ fn: 'deleteMembership', args: [['itemUUIDs-1']] }],
    expect: {
      initial: [],
      shape: { deleteMembership: 'function' },
      invoked: [
        {
          fn: 'deleteMembership',
          calls: [{ operationName: 'deleteMembership', variables: { itemUUIDs: ['itemUUIDs-1'] } }],
          resolved: ['deleteMembership'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMembershipCategory',
    hook: useFetchDeleteMembershipCategory.default,
    args: [],
    invoke: [{ fn: 'deleteMembershipCategory', args: [['itemUUIDs-1']] }],
    expect: {
      initial: [],
      shape: { deleteMembershipCategory: 'function' },
      invoked: [
        {
          fn: 'deleteMembershipCategory',
          calls: [{ operationName: 'deleteMembershipCategory', variables: { itemUUIDs: ['itemUUIDs-1'] } }],
          resolved: ['deleteMembershipCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMerchantCusExternalLink',
    hook: useFetchDeleteMerchantCusExternalLink.default,
    args: [],
    invoke: [{ fn: 'deleteCusLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { deleteCusLink: 'function' },
      invoked: [
        {
          fn: 'deleteCusLink',
          calls: [{ operationName: 'DELETE_MERCHANT_CUS_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['deleteMerchantCusExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMerchantExternalLink',
    hook: useFetchDeleteMerchantExternalLink.default,
    args: [],
    invoke: [{ fn: 'deleteLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { deleteLink: 'function' },
      invoked: [
        {
          fn: 'deleteLink',
          calls: [{ operationName: 'DELETE_MERCHANT_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['deleteMerchantExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMerchantPointValueSetting',
    hook: useFetchDeleteMerchantPointValueSetting.default,
    args: [],
    invoke: [{ fn: 'deleteMerchantPointValueSetting', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { deleteMerchantPointValueSetting: 'function' },
      invoked: [
        {
          fn: 'deleteMerchantPointValueSetting',
          calls: [{ operationName: 'DELETE_MERCHANT_POINT_VALUE_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['deleteMerchantPointValueSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteMoneyFlow',
    hook: useFetchDeleteMoneyFlow.default,
    args: [],
    invoke: [{ fn: 'deleteMoneyFlow', args: ['id-v'] }],
    expect: {
      initial: [],
      shape: { deleteMoneyFlow: 'function' },
      invoked: [
        {
          fn: 'deleteMoneyFlow',
          calls: [{ operationName: 'USE_FETCH_DELETE_MONEY_FLOW', variables: { id: 'id-v' } }],
          resolved: ['deleteMoneyFlow'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteOrder',
    hook: useFetchDeleteOrder.default,
    args: [],
    invoke: [{ fn: 'deleteOrders', args: [{ orderIds: ['orderIds-1'], password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { deleteOrders: 'function' },
      invoked: [
        {
          fn: 'deleteOrders',
          calls: [{ operationName: 'DELETE_ORDER', variables: { orderIds: ['orderIds-1'], password: 'password-v' } }],
          resolved: ['deleteOrder'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeletePayment',
    hook: useFetchDeletePayment.default,
    args: [],
    invoke: [{ fn: 'deletePayment', args: [{ ids: ['ids-1'] }] }],
    expect: {
      initial: [],
      shape: { deletePayment: 'function' },
      invoked: [
        {
          fn: 'deletePayment',
          calls: [{ operationName: 'DELETE_PAYMENT', variables: { ids: ['ids-1'] } }],
          resolved: ['deletePayWay'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeletePicking',
    hook: useFetchDeletePicking.default,
    args: [],
    invoke: [{ fn: 'deletePicking', args: ['id-v'] }],
    expect: {
      initial: [],
      shape: { deletePicking: 'function' },
      invoked: [
        {
          fn: 'deletePicking',
          calls: [{ operationName: 'deletePicking', variables: { id: 'id-v' } }],
          resolved: ['deletePicking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteProductCategory',
    hook: useFetchDeleteProductCategory.default,
    args: [],
    invoke: [{ fn: 'deleteProductCategory', args: [{ itemIds: ['itemIds-1'] }] }],
    expect: {
      initial: [],
      shape: { deleteProductCategory: 'function' },
      invoked: [
        {
          fn: 'deleteProductCategory',
          calls: [{ operationName: 'DEL_PRODUCT_CATEGORY', variables: { itemIds: ['itemIds-1'] } }],
          resolved: ['deleteProductCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteProducts',
    hook: useFetchDeleteProducts.default,
    args: [],
    invoke: [{ fn: 'delProducts', args: [{ itemIds: ['itemIds-1'], password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { delProducts: 'function' },
      invoked: [
        {
          fn: 'delProducts',
          calls: [{ operationName: 'DEL_PRODUCTS', variables: { itemIds: ['itemIds-1'], password: 'password-v' } }],
          resolved: ['deleteProduct'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeletePurchase',
    hook: useFetchDeletePurchase.default,
    args: [],
    invoke: [{ fn: 'deletePurchase', args: [{ purchaseUUIds: ['purchaseUUIds-1'] }] }],
    expect: {
      initial: [],
      shape: { deletePurchase: 'function' },
      invoked: [
        {
          fn: 'deletePurchase',
          calls: [{ operationName: 'DELETE_PURCHASE', variables: { purchaseUUIds: ['purchaseUUIds-1'] } }],
          resolved: ['deletePurchase'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteService',
    hook: useFetchDeleteService.default,
    args: [],
    invoke: [{ fn: 'deleteService', args: [{ itemIds: ['itemIds-1'], password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { deleteService: 'function' },
      invoked: [
        {
          fn: 'deleteService',
          calls: [{ operationName: 'DEL_COUPONS', variables: { itemIds: ['itemIds-1'], password: 'password-v' } }],
          resolved: ['deleteService'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteServiceCategories',
    hook: useFetchDeleteServiceCategories.default,
    args: [],
    invoke: [{ fn: 'delServiceCategories', args: [{ categories: 'categories-v' }] }],
    expect: {
      initial: [],
      shape: { delServiceCategories: 'function' },
      invoked: [
        {
          fn: 'delServiceCategories',
          calls: [{ operationName: 'DEL_SERVICE_CATEGORIES', variables: { categories: 'categories-v' } }],
          resolved: ['deleteServiceCategory'],
        },
      ],
      shapeAfter: { data: { deleteServiceCategory: null }, delServiceCategories: 'function' },
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteThirdPartTicket',
    hook: useFetchDeleteThirdPartTicket.default,
    args: [],
    invoke: [{ fn: 'deleteThirdPartyCoupon', args: [{ id: 'id-v' }] }],
    expect: {
      initial: [],
      shape: { deleteThirdPartyCoupon: 'function' },
      invoked: [
        {
          fn: 'deleteThirdPartyCoupon',
          calls: [{ operationName: 'DELETE_THIRD_PARTY_COUPON', variables: { id: 'id-v' } }],
          resolved: ['deleteThirdPartTicket'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDeleteWalletDeposit',
    hook: useFetchDeleteWalletDeposit.default,
    args: [],
    invoke: [{ fn: 'deleteWalletDeposit', args: [{ id: 'id-v' }] }],
    expect: {
      initial: [],
      shape: { deleteWalletDeposit: 'function' },
      invoked: [
        {
          fn: 'deleteWalletDeposit',
          calls: [{ operationName: 'DELETE_WALLET_DEPOSIT', variables: { id: 'id-v' } }],
          resolved: ['deleteWalletDeposit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchDesignerBookingTimes.useLazyFetchDesignerBookingTimes',
    hook: useFetchDesignerBookingTimes.useLazyFetchDesignerBookingTimes,
    args: [{ designerId: 'designerId-v', storeId: 'storeId-v', date: 'date-v' }],
    invoke: [{ fn: 'fetchDesignerBookingTimes', args: [] }],
    expect: {
      initial: [],
      shape: { fetchDesignerBookingTimes: 'function', designerBookingTimesResponse: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchDesignerBookingTimes',
          calls: [
            {
              operationName: 'designerBookingTimes',
              variables: { GetBookingTimesInput: { designerId: 'designerId-v', storeId: 'storeId-v', date: 'date-v' } },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchDesignerBookingTimes: 'function',
        designerBookingTimesResponse: { loading: false, called: true, data: ['getBookingTimes'] },
      },
      policies: { designerBookingTimes: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDesignerDailyReport',
    hook: useFetchDesignerDailyReport.default,
    args: [{ date: 'date-v', designerIds: ['designerIds-1'] }],
    expect: {
      initial: [{ operationName: 'FETCH_DESIGNER_DAILY_REPORT', variables: { date: 'date-v', designerIds: ['designerIds-1'] } }],
      shape: { loading: false, called: true, data: ['designerDailyReport'] },
      policies: { FETCH_DESIGNER_DAILY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDesignerDailyReport.useFetchDesignerReportLazy',
    hook: useFetchDesignerDailyReport.useFetchDesignerReportLazy,
    args: [],
    invoke: [{ fn: 'fetchDesignerReportLazy', args: [{ variables: { date: 'date-v', designerIds: ['designerIds-1'] } }] }],
    expect: {
      initial: [],
      shape: { fetchDesignerReportLazy: 'function', designerReportLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchDesignerReportLazy',
          calls: [
            {
              operationName: 'FETCH_DESIGNER_DAILY_REPORT',
              variables: { date: 'date-v', designerIds: ['designerIds-1'] },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchDesignerReportLazy: 'function',
        designerReportLazyData: { loading: false, called: true, data: ['designerDailyReport'] },
      },
      policies: { FETCH_DESIGNER_DAILY_REPORT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDesignerMonthlyReport',
    hook: useFetchDesignerMonthlyReport.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_DESIGNER_MONTHLY_REPORT', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['designerMonthlyReport'] },
      policies: { GET_DESIGNER_MONTHLY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDesignerPerformanceAnalyzeExcel.useFetchDesignerPerformanceAnalyzeExcelLazy',
    hook: useFetchDesignerPerformanceAnalyzeExcel.useFetchDesignerPerformanceAnalyzeExcelLazy,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [
          {
            variables: {
              input: { probe: 'input' },
              designerIds: ['designerIds-1'],
              displayReference: 'displayReference-v',
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
              operationName: 'FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL',
              variables: {
                input: { probe: 'input' },
                designerIds: ['designerIds-1'],
                displayReference: 'displayReference-v',
              },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['designerPerforamnceAnalyzeExcel'] }],
      policies: { FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDesignerPerformanceAnalyzeReport',
    hook: useFetchDesignerPerformanceAnalyzeReport.default,
    args: [],
    invoke: [
      {
        fn: 0,
        args: [
          {
            variables: {
              input: { probe: 'input' },
              designerIds: ['designerIds-1'],
              displayReference: 'displayReference-v',
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
              operationName: 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT',
              variables: {
                input: { probe: 'input' },
                designerIds: ['designerIds-1'],
                displayReference: 'displayReference-v',
              },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['designerPerforamnceAnalyzeReport'] }],
      policies: { GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDesignerPerformanceAnalyzeReport.useFetchDesignerPerformanceAnalyzeCompareReport',
    hook: useFetchDesignerPerformanceAnalyzeReport.useFetchDesignerPerformanceAnalyzeCompareReport,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT',
              variables: { input: { probe: 'input' } },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['designerPerforamnceAnalyzeCompareReport'] }],
      policies: { GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchDesignersLeaderboard',
    hook: useFetchDesignersLeaderboard.default,
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
          operationName: 'FETCH_DESIGNERS_LEADERBOARD',
          variables: {
            isIncludeProductPerformance: true,
            isIncludeMembershipPerformance: true,
            startDay: 'startDay-v',
            endDay: 'endDay-v',
            merchantId: 'merchantId-v',
            reference: 'reference-v',
          },
        },
      ],
      shape: { loading: false, called: true, data: ['designerLeaderboard'] },
      policies: { FETCH_DESIGNERS_LEADERBOARD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDesignersRakeReport',
    hook: useFetchDesignersRakeReport.default,
    args: [{ input: { probe: 'input' }, designerIds: ['designerIds-1'] }],
    expect: {
      initial: [
        {
          operationName: 'FETCH_DESIGNER_RAKE_REPORT',
          variables: { input: { probe: 'input' }, designerIds: ['designerIds-1'] },
        },
      ],
      shape: { loading: false, called: true, data: ['userRakeReport'] },
      policies: { FETCH_DESIGNER_RAKE_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchDesignersRakeReport.useFetchDesignerRakeReportLazy',
    hook: useFetchDesignersRakeReport.useFetchDesignerRakeReportLazy,
    args: [],
    invoke: [
      {
        fn: 'fetchDesignerRakeReportLazy',
        args: [{ variables: { input: { probe: 'input' }, designerIds: ['designerIds-1'] } }],
      },
    ],
    expect: {
      initial: [],
      shape: { fetchDesignerRakeReportLazy: 'function', designerRakeReportLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchDesignerRakeReportLazy',
          calls: [
            {
              operationName: 'FETCH_DESIGNER_RAKE_REPORT',
              variables: { input: { probe: 'input' }, designerIds: ['designerIds-1'] },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchDesignerRakeReportLazy: 'function',
        designerRakeReportLazyData: { loading: false, called: true, data: ['userRakeReport'] },
      },
      policies: { FETCH_DESIGNER_RAKE_REPORT: 'cache-and-network' },
    },
  },
]

describe('useFetchAccountingSubjects ～ useFetchDesignersRakeReport', () => {
  runContractRows(ROWS)
})
