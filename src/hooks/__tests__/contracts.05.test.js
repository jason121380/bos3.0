// src/hooks 契約測試（5/6）：useFetchServiceTicket ～ useFetchSettingMerchantFakePerformanceReference
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
import * as useFetchServiceTicket from 'hooks/useFetchServiceTicket'
import * as useFetchServices from 'hooks/useFetchServices'
import * as useFetchServiecAndTicketList from 'hooks/useFetchServiecAndTicketList'
import * as useFetchSetAddEmployeeClockInSchedule from 'hooks/useFetchSetAddEmployeeClockInSchedule'
import * as useFetchSetAdminBookingTimes from 'hooks/useFetchSetAdminBookingTimes'
import * as useFetchSetBookingCancelCheckin from 'hooks/useFetchSetBookingCancelCheckin'
import * as useFetchSetBookingCheckin from 'hooks/useFetchSetBookingCheckin'
import * as useFetchSetBookingCusCheckRequired from 'hooks/useFetchSetBookingCusCheckRequired'
import * as useFetchSetBookingLineNotifySettings from 'hooks/useFetchSetBookingLineNotifySettings'
import * as useFetchSetBookingNoShow from 'hooks/useFetchSetBookingNoShow'
import * as useFetchSetBookingTypeForSocket from 'hooks/useFetchSetBookingTypeForSocket'
import * as useFetchSetCreateInventory from 'hooks/useFetchSetCreateInventory'
import * as useFetchSetCreateMerchantVendor from 'hooks/useFetchSetCreateMerchantVendor'
import * as useFetchSetCreateNewAuthority from 'hooks/useFetchSetCreateNewAuthority'
import * as useFetchSetCreateResignedUser from 'hooks/useFetchSetCreateResignedUser'
import * as useFetchSetCustomerHairInfo from 'hooks/useFetchSetCustomerHairInfo'
import * as useFetchSetCustomerIsUnwelcome from 'hooks/useFetchSetCustomerIsUnwelcome'
import * as useFetchSetCustomerReference from 'hooks/useFetchSetCustomerReference'
import * as useFetchSetDeductionSetting from 'hooks/useFetchSetDeductionSetting'
import * as useFetchSetDelayBookingCheckinTime from 'hooks/useFetchSetDelayBookingCheckinTime'
import * as useFetchSetDeleteMerchantVendor from 'hooks/useFetchSetDeleteMerchantVendor'
import * as useFetchSetDisableBookingDayLimit from 'hooks/useFetchSetDisableBookingDayLimit'
import * as useFetchSetEmployeeClockInSchedule from 'hooks/useFetchSetEmployeeClockInSchedule'
import * as useFetchSetEndMainEvent from 'hooks/useFetchSetEndMainEvent'
import * as useFetchSetEventRuleGroupUsing from 'hooks/useFetchSetEventRuleGroupUsing'
import * as useFetchSetIsBookingCusCheckUsing from 'hooks/useFetchSetIsBookingCusCheckUsing'
import * as useFetchSetIsCBRDStylist from 'hooks/useFetchSetIsCBRDStylist'
import * as useFetchSetIsDisplayNonBankAccountInBankTransferReport from 'hooks/useFetchSetIsDisplayNonBankAccountInBankTransferReport'
import * as useFetchSetLockDateSettings from 'hooks/useFetchSetLockDateSettings'
import * as useFetchSetLockUserSalaryItem from 'hooks/useFetchSetLockUserSalaryItem'
import * as useFetchSetMainEventUsing from 'hooks/useFetchSetMainEventUsing'
import * as useFetchSetMerchantAvatar from 'hooks/useFetchSetMerchantAvatar'
import * as useFetchSetMerchantBookingNotificationSetting from 'hooks/useFetchSetMerchantBookingNotificationSetting'
import * as useFetchSetMerchantCheckinSettings from 'hooks/useFetchSetMerchantCheckinSettings'
import * as useFetchSetMerchantDesignateTimeNonDesignateBookingLimit from 'hooks/useFetchSetMerchantDesignateTimeNonDesignateBookingLimit'
import * as useFetchSetMerchantHairCondition from 'hooks/useFetchSetMerchantHairCondition'
import * as useFetchSetMerchantRakeReference from 'hooks/useFetchSetMerchantRakeReference'
import * as useFetchSetMerchantReservationTime from 'hooks/useFetchSetMerchantReservationTime'
import * as useFetchSetMultipleUpdateProductIsPublished from 'hooks/useFetchSetMultipleUpdateProductIsPublished'
import * as useFetchSetMultipleUpdateProductVendor from 'hooks/useFetchSetMultipleUpdateProductVendor'
import * as useFetchSetNonDesignateBookingRecipients from 'hooks/useFetchSetNonDesignateBookingRecipients'
import * as useFetchSetOrderDetailMerchantLogo from 'hooks/useFetchSetOrderDetailMerchantLogo'
import * as useFetchSetOrderRanking from 'hooks/useFetchSetOrderRanking'
import * as useFetchSetOrderRankingAndComment from 'hooks/useFetchSetOrderRankingAndComment'
import * as useFetchSetParameterAboutBookingSetting from 'hooks/useFetchSetParameterAboutBookingSetting'
import * as useFetchSetParameterAboutCustomerSetting from 'hooks/useFetchSetParameterAboutCustomerSetting'
import * as useFetchSetParameterAboutSettingFunction from 'hooks/useFetchSetParameterAboutSettingFunction'
import * as useFetchSetParameterCheckoutAndSalaryItemsSetting from 'hooks/useFetchSetParameterCheckoutAndSalaryItemsSetting'
import * as useFetchSetParameterOrderCreateSetting from 'hooks/useFetchSetParameterOrderCreateSetting'
import * as useFetchSetParameterReportSetting from 'hooks/useFetchSetParameterReportSetting'
import * as useFetchSetPerformanceRuleFromPersonProfile from 'hooks/useFetchSetPerformanceRuleFromPersonProfile'
import * as useFetchSetPinnedTable from 'hooks/useFetchSetPinnedTable'
import * as useFetchSetPurchaseStockIn from 'hooks/useFetchSetPurchaseStockIn'
import * as useFetchSetPurchaseStockInUndo from 'hooks/useFetchSetPurchaseStockInUndo'
import * as useFetchSetSpecificBookingNotificationDayCount from 'hooks/useFetchSetSpecificBookingNotificationDayCount'
import * as useFetchSetUESUsingSetting from 'hooks/useFetchSetUESUsingSetting'
import * as useFetchSetUnlockUserSalaryItem from 'hooks/useFetchSetUnlockUserSalaryItem'
import * as useFetchSetUpdateMerchantVendor from 'hooks/useFetchSetUpdateMerchantVendor'
import * as useFetchSetUpdatePurchaseRecord from 'hooks/useFetchSetUpdatePurchaseRecord'
import * as useFetchSetUpdateServicesLaunchedStatus from 'hooks/useFetchSetUpdateServicesLaunchedStatus'
import * as useFetchSetUserAvatar from 'hooks/useFetchSetUserAvatar'
import * as useFetchSetUserDisplaySituation from 'hooks/useFetchSetUserDisplaySituation'
import * as useFetchSetUserSalaryMonthlyCheckoutV2 from 'hooks/useFetchSetUserSalaryMonthlyCheckoutV2'
import * as useFetchSettingAccountingSubjects from 'hooks/useFetchSettingAccountingSubjects'
import * as useFetchSettingAccountingType from 'hooks/useFetchSettingAccountingType'
import * as useFetchSettingCommissionWay from 'hooks/useFetchSettingCommissionWay'
import * as useFetchSettingDeductionItems from 'hooks/useFetchSettingDeductionItems'
import * as useFetchSettingEmployeeSchedule from 'hooks/useFetchSettingEmployeeSchedule'
import * as useFetchSettingHelperCategory from 'hooks/useFetchSettingHelperCategory'
import * as useFetchSettingJobTitlePoint from 'hooks/useFetchSettingJobTitlePoint'
import * as useFetchSettingMerchantBankSettings from 'hooks/useFetchSettingMerchantBankSettings'
import * as useFetchSettingMerchantFakePerformanceReference from 'hooks/useFetchSettingMerchantFakePerformanceReference'

const ROWS = [
  {
    id: 'useFetchServiceTicket',
    hook: useFetchServiceTicket.default,
    args: [{ serviceId: 'serviceId-v' }],
    expect: {
      initial: [{ operationName: 'service', variables: { serviceId: 'serviceId-v' } }],
      shape: { loading: false, called: true, data: ['service'] },
      policies: { service: 'default(cache-first)' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServiceTicket.useLazyFetchService',
    hook: useFetchServiceTicket.useLazyFetchService,
    args: [],
    invoke: [{ fn: 'getService', args: [{ serviceId: 'serviceId-v' }] }],
    expect: {
      initial: [],
      shape: { loading: false, called: false },
      invoked: [{ fn: 'getService', calls: [{ operationName: 'service', variables: { serviceId: 'serviceId-v' } }] }],
      shapeAfter: { loading: false, called: true, data: ['service'] },
      policies: { service: 'default(cache-first)' },
    },
  },
  {
    id: 'useFetchServices',
    hook: useFetchServices.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_SERVICES', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['services'] },
      policies: { FETCH_SERVICES: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'FETCH_SERVICES', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServices.useFetchServicesForAutoComplete',
    hook: useFetchServices.useFetchServicesForAutoComplete,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_SERVICES_FOR_AUTOCOMPLETE', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['services'] },
      policies: { GET_SERVICES_FOR_AUTOCOMPLETE: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_SERVICES_FOR_AUTOCOMPLETE', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServices.useFetchServicesInOrderDetail',
    hook: useFetchServices.useFetchServicesInOrderDetail,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_SERVICES_IN_ORDER_DETAIL', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['services'] },
      policies: { GET_SERVICES_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_SERVICES_IN_ORDER_DETAIL', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchServices.useFetchServicesForTransferList',
    hook: useFetchServices.useFetchServicesForTransferList,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_SERVICES_FOR_TRANSFERLIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['services'] },
      policies: { GET_SERVICES_FOR_TRANSFERLIST: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_SERVICES_FOR_TRANSFERLIST', variables: { input: {} } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  // 參數 input 目前沒有用到：查詢不帶條件，一律取全部服務與票券。
  {
    id: 'useFetchServiecAndTicketList',
    hook: useFetchServiecAndTicketList.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_SERVICES_AND_TICKETS', variables: {} }],
      shape: { loading: false, called: true, data: ['getServiecAndTicketList'] },
      policies: { GET_SERVICES_AND_TICKETS: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_SERVICES_AND_TICKETS', variables: {} }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchSetAddEmployeeClockInSchedule',
    hook: useFetchSetAddEmployeeClockInSchedule.default,
    args: [],
    invoke: [{ fn: 'addEmployeeClockInSchedule', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { addEmployeeClockInSchedule: 'function' },
      invoked: [
        {
          fn: 'addEmployeeClockInSchedule',
          calls: [{ operationName: 'SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE', variables: { input: { probe: 'input' } } }],
          resolved: ['addAttendantRecord'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetAdminBookingTimes',
    hook: useFetchSetAdminBookingTimes.default,
    args: [],
    invoke: [{ fn: 'setTimes', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setTimes: 'function' },
      invoked: [
        {
          fn: 'setTimes',
          calls: [{ operationName: 'SET_ADMIN_BOOKING_TIMES', variables: { input: { probe: 'input' } } }],
          resolved: ['adminBookingTimes'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingCancelCheckin',
    hook: useFetchSetBookingCancelCheckin.default,
    args: [],
    invoke: [{ fn: 'setBookingCancelCheckin', args: ['inputData-v'] }],
    expect: {
      initial: [],
      shape: { setBookingCancelCheckin: 'function' },
      invoked: [
        {
          fn: 'setBookingCancelCheckin',
          calls: [{ operationName: 'SET_BOOKING_CANCEL_CHECK_IN', variables: { input: 'inputData-v' } }],
          resolved: ['bookingCancelCheckin'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingCheckin',
    hook: useFetchSetBookingCheckin.default,
    args: [],
    invoke: [{ fn: 'setBookingCheckin', args: ['inputData-v'] }],
    expect: {
      initial: [],
      shape: { setBookingCheckin: 'function' },
      invoked: [
        {
          fn: 'setBookingCheckin',
          calls: [{ operationName: 'SET_BOOKING_CHECK_IN', variables: { input: 'inputData-v' } }],
          resolved: ['bookingCheckin'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingCusCheckRequired',
    hook: useFetchSetBookingCusCheckRequired.default,
    args: [],
    invoke: [{ fn: 'setBookingCusCheckRequired', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setBookingCusCheckRequired: 'function' },
      invoked: [
        {
          fn: 'setBookingCusCheckRequired',
          calls: [{ operationName: 'SET_IS_BOOKING_CUS_CHECK_REQUIRED', variables: { input: { probe: 'input' } } }],
          resolved: ['setBookingCusCheckRequired'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingLineNotifySettings',
    hook: useFetchSetBookingLineNotifySettings.default,
    args: [],
    invoke: [{ fn: 'setBookingLineNotifySettings', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setBookingLineNotifySettings: 'function' },
      invoked: [
        {
          fn: 'setBookingLineNotifySettings',
          calls: [{ operationName: 'SetBookingLineNotifySettings', variables: { input: { probe: 'input' } } }],
          resolved: ['setBookingLineNotifySettings'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingNoShow',
    hook: useFetchSetBookingNoShow.default,
    args: [],
    invoke: [{ fn: 'setBookingNoShow', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setBookingNoShow: 'function' },
      invoked: [
        {
          fn: 'setBookingNoShow',
          calls: [{ operationName: 'SET_BOOKING_NO_SHOW', variables: { input: { probe: 'input' } } }],
          resolved: ['setBookingNoShow'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetBookingTypeForSocket',
    hook: useFetchSetBookingTypeForSocket.default,
    args: [],
    invoke: [{ fn: 'setTypeForSocket', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setTypeForSocket: 'function' },
      invoked: [
        {
          fn: 'setTypeForSocket',
          calls: [{ operationName: 'SET_IS_BOOKING_TYPE_FOR_SOCKET', variables: { input: { probe: 'input' } } }],
          resolved: ['setBookingTypeForSocket'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCreateInventory',
    hook: useFetchSetCreateInventory.default,
    args: [],
    invoke: [{ fn: 'createInventory', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createInventory: 'function' },
      invoked: [
        {
          fn: 'createInventory',
          calls: [{ operationName: 'SET_CREATE_INVENTORY', variables: { input: { probe: 'input' } } }],
          resolved: ['createInventory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCreateMerchantVendor',
    hook: useFetchSetCreateMerchantVendor.default,
    args: [],
    invoke: [{ fn: 'createMerchantVendor', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createMerchantVendor: 'function' },
      invoked: [
        {
          fn: 'createMerchantVendor',
          calls: [{ operationName: 'SET_CREATE_MERCHANT_VENDOR', variables: { input: { probe: 'input' } } }],
          resolved: ['createMerchantVendor'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCreateNewAuthority',
    hook: useFetchSetCreateNewAuthority.default,
    args: [],
    invoke: [{ fn: 'createNewAuthority', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createNewAuthority: 'function' },
      invoked: [
        {
          fn: 'createNewAuthority',
          calls: [{ operationName: 'SET_CREATE_NEW_AUTHORITY', variables: { input: { probe: 'input' } } }],
          resolved: ['createNewAuthority'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCreateResignedUser',
    hook: useFetchSetCreateResignedUser.default,
    args: [],
    invoke: [{ fn: 'setCreateResignedUser', args: [{ userIds: ['userIds-1'] }] }],
    expect: {
      initial: [],
      shape: { setCreateResignedUser: 'function' },
      invoked: [
        {
          fn: 'setCreateResignedUser',
          calls: [{ operationName: 'SET_CREATE_RESIGNED_USER', variables: { userIds: ['userIds-1'] } }],
          resolved: ['createResignedUser'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCustomerHairInfo',
    hook: useFetchSetCustomerHairInfo.default,
    args: [],
    invoke: [{ fn: 'setCustomerHairInfo', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setCustomerHairInfo: 'function' },
      invoked: [
        {
          fn: 'setCustomerHairInfo',
          calls: [{ operationName: 'SET_CUSTOMER_HAIR_INFO', variables: { input: { probe: 'input' } } }],
          resolved: ['setCustomerHairInfo'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCustomerIsUnwelcome',
    hook: useFetchSetCustomerIsUnwelcome.default,
    args: [],
    invoke: [{ fn: 'setCustomerIsUnwelcome', args: [{ customerId: 'customerId-v', input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setCustomerIsUnwelcome: 'function' },
      invoked: [
        {
          fn: 'setCustomerIsUnwelcome',
          calls: [
            {
              operationName: 'SET_CUSTOMER_ISUNWELCOME',
              variables: { customerId: 'customerId-v', input: { probe: 'input' } },
            },
          ],
          resolved: ['setCustomerIsUnwelcome'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetCustomerReference',
    hook: useFetchSetCustomerReference.default,
    args: [],
    invoke: [{ fn: 'setCustomerReference', args: [{ references: 'references-v' }] }],
    expect: {
      initial: [],
      shape: { setCustomerReference: 'function' },
      invoked: [
        {
          fn: 'setCustomerReference',
          calls: [{ operationName: 'SET_CUSTOMER_REFERENCE', variables: { references: 'references-v' } }],
          resolved: ['setCustomerReference'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDeductionSetting.useFetchCreateDeductionSetting',
    hook: useFetchSetDeductionSetting.useFetchCreateDeductionSetting,
    args: [],
    invoke: [{ fn: 'createDeductionSetting', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { createDeductionSetting: 'function' },
      invoked: [
        {
          fn: 'createDeductionSetting',
          calls: [{ operationName: 'CREATE_DEDUCTION_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['createDeductionSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDeductionSetting.useFetchUpdateDeductionSetting',
    hook: useFetchSetDeductionSetting.useFetchUpdateDeductionSetting,
    args: [],
    invoke: [{ fn: 'updateDeductionSetting', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateDeductionSetting: 'function' },
      invoked: [
        {
          fn: 'updateDeductionSetting',
          calls: [{ operationName: 'UPDATE_DEDUCTION_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['updateDeductionSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDeductionSetting.useFetchDeleteDeductionSetting',
    hook: useFetchSetDeductionSetting.useFetchDeleteDeductionSetting,
    args: [],
    invoke: [{ fn: 'deleteDeductionSetting', args: ['DeductionId-v'] }],
    expect: {
      initial: [],
      shape: { deleteDeductionSetting: 'function' },
      invoked: [
        {
          fn: 'deleteDeductionSetting',
          calls: [{ operationName: 'DELETE_DEDUCTION_SETTING', variables: { DeductionId: 'DeductionId-v' } }],
          resolved: ['deleteDeductionSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDelayBookingCheckinTime',
    hook: useFetchSetDelayBookingCheckinTime.default,
    args: [],
    invoke: [{ fn: 'setDelayBookingCheckinTime', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setDelayBookingCheckinTime: 'function' },
      invoked: [
        {
          fn: 'setDelayBookingCheckinTime',
          calls: [{ operationName: 'SET_DELAY_BOOKING_CHECKIN_TIMME', variables: { input: { probe: 'input' } } }],
          resolved: ['delayBookingCheckinTime'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDeleteMerchantVendor',
    hook: useFetchSetDeleteMerchantVendor.default,
    args: [],
    invoke: [{ fn: 'deleteMerchantVendor', args: [{ merchantVendorUUIds: ['merchantVendorUUIds-1'] }] }],
    expect: {
      initial: [],
      shape: { deleteMerchantVendor: 'function' },
      invoked: [
        {
          fn: 'deleteMerchantVendor',
          calls: [
            {
              operationName: 'SET_DELETE_MERCHANT_VENDOR',
              variables: { merchantVendorUUIds: ['merchantVendorUUIds-1'] },
            },
          ],
          resolved: ['deleteMerchantVendor'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetDisableBookingDayLimit',
    hook: useFetchSetDisableBookingDayLimit.default,
    args: [],
    invoke: [{ fn: 'setDisableBookingDayLimit', args: [{ count: 10 }] }],
    expect: {
      initial: [],
      shape: { setDisableBookingDayLimit: 'function' },
      invoked: [
        {
          fn: 'setDisableBookingDayLimit',
          calls: [{ operationName: 'SET_DISABLE_BOOKING_DAY_LIMIT', variables: { count: 10 } }],
          resolved: ['setDisableBookingDayLimit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetEmployeeClockInSchedule',
    hook: useFetchSetEmployeeClockInSchedule.default,
    args: [],
    invoke: [{ fn: 'setEmployeeClockInSchedule', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setEmployeeClockInSchedule: 'function' },
      invoked: [
        {
          fn: 'setEmployeeClockInSchedule',
          calls: [{ operationName: 'SET_EMPLOYEE_CLOCK_IN_SCHDULE', variables: { input: { probe: 'input' } } }],
          resolved: ['setEmployeeClockInSchedule'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetEndMainEvent',
    hook: useFetchSetEndMainEvent.default,
    args: [],
    invoke: [{ fn: 'setMainEndEvent', args: [{ eventId: 'eventId-v' }] }],
    expect: {
      initial: [],
      shape: { setMainEndEvent: 'function' },
      invoked: [
        {
          fn: 'setMainEndEvent',
          calls: [{ operationName: 'SET_END_MAIN_EVENT', variables: { eventId: 'eventId-v' } }],
          resolved: ['endMainEvent'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetEventRuleGroupUsing',
    hook: useFetchSetEventRuleGroupUsing.default,
    args: [],
    invoke: [{ fn: 'setEventRuleGroupUsing', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setEventRuleGroupUsing: 'function' },
      invoked: [
        {
          fn: 'setEventRuleGroupUsing',
          calls: [{ operationName: 'SET_EVENT_RULE_GROUP_USING', variables: { input: { probe: 'input' } } }],
          resolved: ['setEventRuleGroupUsing'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetIsBookingCusCheckUsing',
    hook: useFetchSetIsBookingCusCheckUsing.default,
    args: [],
    invoke: [{ fn: 'setIsBookingCusCheckUsing', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setIsBookingCusCheckUsing: 'function' },
      invoked: [
        {
          fn: 'setIsBookingCusCheckUsing',
          calls: [{ operationName: 'SET_IS_BOOKING_CUS_CHECK_USING', variables: { input: { probe: 'input' } } }],
          resolved: ['setIsBookingCusCheckUsing'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetIsCBRDStylist',
    hook: useFetchSetIsCBRDStylist.default,
    args: [],
    invoke: [{ fn: 'setCBRDStylistData', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setCBRDStylistData: 'function' },
      invoked: [
        {
          fn: 'setCBRDStylistData',
          calls: [{ operationName: 'SET_IS_CBRD_STYLIST', variables: { input: { probe: 'input' } } }],
          resolved: ['setIsCBRDStylist'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetIsDisplayNonBankAccountInBankTransferReport',
    hook: useFetchSetIsDisplayNonBankAccountInBankTransferReport.default,
    args: [],
    invoke: [{ fn: 'setIsDisplayNonBankAccountInBankTransferReport', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setIsDisplayNonBankAccountInBankTransferReport: 'function' },
      invoked: [
        {
          fn: 'setIsDisplayNonBankAccountInBankTransferReport',
          calls: [
            {
              operationName: 'SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT',
              variables: { input: { probe: 'input' } },
            },
          ],
          resolved: ['setIsDisplayNonBankAccountInBankTransferReport'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetLockDateSettings',
    hook: useFetchSetLockDateSettings.default,
    args: [],
    invoke: [{ fn: 'setLockDate', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setLockDate: 'function' },
      invoked: [
        {
          fn: 'setLockDate',
          calls: [{ operationName: 'SET_LOCK_DATE', variables: { input: { probe: 'input' } } }],
          resolved: ['setDateLock'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetLockUserSalaryItem',
    hook: useFetchSetLockUserSalaryItem.default,
    args: [],
    invoke: [{ fn: 'setUserSalaryItemLock', args: [{ date: 'date-v' }] }],
    expect: {
      initial: [],
      shape: { setUserSalaryItemLock: 'function' },
      invoked: [
        {
          fn: 'setUserSalaryItemLock',
          calls: [{ operationName: 'SET_USER_SALARY_ITEM_LOCK', variables: { date: 'date-v' } }],
          resolved: ['lockUserSalaryItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMainEventUsing',
    hook: useFetchSetMainEventUsing.default,
    args: [],
    invoke: [{ fn: 'setMainEventUsing', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMainEventUsing: 'function' },
      invoked: [
        {
          fn: 'setMainEventUsing',
          calls: [{ operationName: 'SET_MAIN_EVENT_USING', variables: { input: { probe: 'input' } } }],
          resolved: ['setMainEventUsing'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantAvatar',
    hook: useFetchSetMerchantAvatar.default,
    args: [],
    invoke: [{ fn: 'setMerchantAvatar', args: [{ file: 'file-v' }] }],
    expect: {
      initial: [],
      shape: { setMerchantAvatar: 'function' },
      invoked: [
        {
          fn: 'setMerchantAvatar',
          calls: [{ operationName: 'SET_MERCHANT_AVATAR', variables: { file: 'file-v' } }],
          resolved: ['setMerchantAvatar'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantBookingNotificationSetting',
    hook: useFetchSetMerchantBookingNotificationSetting.default,
    args: [],
    invoke: [{ fn: 'setMerchantBookingNotificationSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantBookingNotificationSetting: 'function' },
      invoked: [
        {
          fn: 'setMerchantBookingNotificationSetting',
          calls: [
            { operationName: 'SET_MERCHANT_BOOKING_NOTIFICATION_SETTING', variables: { input: { probe: 'input' } } },
          ],
          resolved: ['setMerchantBookingNotificationSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantCheckinSettings',
    hook: useFetchSetMerchantCheckinSettings.default,
    args: [],
    invoke: [{ fn: 'setMerchantCheckin', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantCheckin: 'function' },
      invoked: [
        {
          fn: 'setMerchantCheckin',
          calls: [{ operationName: 'SET_MERCHANT_CHECKIN_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantCheckinSettings'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantDesignateTimeNonDesignateBookingLimit',
    hook: useFetchSetMerchantDesignateTimeNonDesignateBookingLimit.default,
    args: [],
    invoke: [{ fn: 'setMerchantNonDesignateBookingLimit', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantNonDesignateBookingLimit: 'function' },
      invoked: [
        {
          fn: 'setMerchantNonDesignateBookingLimit',
          calls: [
            { operationName: 'SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT', variables: { input: { probe: 'input' } } },
          ],
          resolved: ['setMerchantDesignateTimeNonDesignateBookingLimit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantHairCondition',
    hook: useFetchSetMerchantHairCondition.default,
    args: [],
    invoke: [{ fn: 'setMerchantHairCondition', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantHairCondition: 'function' },
      invoked: [
        {
          fn: 'setMerchantHairCondition',
          calls: [{ operationName: 'SET_MERCHANT_HAIR_CONDITION', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantHairCondition'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantRakeReference',
    hook: useFetchSetMerchantRakeReference.default,
    args: [],
    invoke: [{ fn: 'setRakeReference', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setRakeReference: 'function' },
      invoked: [
        {
          fn: 'setRakeReference',
          calls: [{ operationName: 'SET_MERCHANT_RAKE_REFERENCE', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantRakeReference'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMerchantReservationTime',
    hook: useFetchSetMerchantReservationTime.default,
    args: [],
    invoke: [{ fn: 'setMerchantReservationTime', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantReservationTime: 'function' },
      invoked: [
        {
          fn: 'setMerchantReservationTime',
          calls: [{ operationName: 'SET_MERCHANT_REVERVATION_TIME', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantReservationTime'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMultipleUpdateProductIsPublished',
    hook: useFetchSetMultipleUpdateProductIsPublished.default,
    args: [],
    invoke: [{ fn: 'setPublished', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setPublished: 'function' },
      invoked: [
        {
          fn: 'setPublished',
          calls: [{ operationName: 'MultipleUpdateProductIsPublished', variables: { input: { probe: 'input' } } }],
          resolved: ['multipleUpdateProductIsPublished'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetMultipleUpdateProductVendor',
    hook: useFetchSetMultipleUpdateProductVendor.default,
    args: [],
    invoke: [{ fn: 'setVendor', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setVendor: 'function' },
      invoked: [
        {
          fn: 'setVendor',
          calls: [{ operationName: 'MultipleUpdateProductVendor', variables: { input: { probe: 'input' } } }],
          resolved: ['multipleUpdateProductVendor'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetNonDesignateBookingRecipients',
    hook: useFetchSetNonDesignateBookingRecipients.default,
    args: [],
    invoke: [{ fn: 'setBookingRecipients', args: [{ userIds: ['userIds-1'] }] }],
    expect: {
      initial: [],
      shape: { setBookingRecipients: 'function' },
      invoked: [
        {
          fn: 'setBookingRecipients',
          calls: [{ operationName: 'SET_NONDESIGNATE_BOOKING_RECIOIENTS', variables: { userIds: ['userIds-1'] } }],
          resolved: ['setNonDesignateBookingRecipients'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetOrderDetailMerchantLogo',
    hook: useFetchSetOrderDetailMerchantLogo.default,
    args: [],
    invoke: [{ fn: 'uploadMerchantLogo', args: [{ file: 'file-v' }] }],
    expect: {
      initial: [],
      shape: { uploadMerchantLogo: 'function' },
      invoked: [
        {
          fn: 'uploadMerchantLogo',
          calls: [{ operationName: 'SET_ORDER_DETAIL_MERCHANT_LOGO', variables: { file: 'file-v' } }],
          resolved: ['setOrderDetailMerchantLogo'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetOrderRanking',
    hook: useFetchSetOrderRanking.default,
    args: [],
    invoke: [{ fn: 'setOrderRanking', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setOrderRanking: 'function' },
      invoked: [
        {
          fn: 'setOrderRanking',
          calls: [{ operationName: 'SET_ORDER_RANKING', variables: { input: { probe: 'input' } } }],
          resolved: ['setOrderRanking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetOrderRankingAndComment',
    hook: useFetchSetOrderRankingAndComment.default,
    args: [],
    invoke: [{ fn: 'setOrderRankingAndComment', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setOrderRankingAndComment: 'function' },
      invoked: [
        {
          fn: 'setOrderRankingAndComment',
          calls: [{ operationName: 'SET_ORDER_RANKING_AND_COMMENT', variables: { input: { probe: 'input' } } }],
          resolved: ['setOrderRankingAndComment'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterAboutBookingSetting',
    hook: useFetchSetParameterAboutBookingSetting.default,
    args: [],
    invoke: [{ fn: 'setParameterAboutBookingSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setParameterAboutBookingSetting: 'function' },
      invoked: [
        {
          fn: 'setParameterAboutBookingSetting',
          calls: [{ operationName: 'SET_PARAMETER_ABOUT_BOOKING_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setParameterAboutBookingSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterAboutCustomerSetting',
    hook: useFetchSetParameterAboutCustomerSetting.default,
    args: [],
    invoke: [{ fn: 'setParameterAboutCustomerSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setParameterAboutCustomerSetting: 'function' },
      invoked: [
        {
          fn: 'setParameterAboutCustomerSetting',
          calls: [{ operationName: 'SET_PARAMETER_ABOUT_CUSTOMER_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setParameterAboutCustomerSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterAboutSettingFunction',
    hook: useFetchSetParameterAboutSettingFunction.default,
    args: [],
    invoke: [{ fn: 'setParameterAboutSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setParameterAboutSetting: 'function' },
      invoked: [
        {
          fn: 'setParameterAboutSetting',
          calls: [{ operationName: 'SET_PARAMETER_ABOUT_SETTING_FUNCTION', variables: { input: { probe: 'input' } } }],
          resolved: ['setParameterAboutSettingFunction'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterCheckoutAndSalaryItemsSetting',
    hook: useFetchSetParameterCheckoutAndSalaryItemsSetting.default,
    args: [],
    invoke: [{ fn: 'setCheckoutAndSalaryItems', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setCheckoutAndSalaryItems: 'function' },
      invoked: [
        {
          fn: 'setCheckoutAndSalaryItems',
          calls: [
            {
              operationName: 'SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING',
              variables: { input: { probe: 'input' } },
            },
          ],
          resolved: ['setParameterCheckoutAndSalaryItemsSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterOrderCreateSetting',
    hook: useFetchSetParameterOrderCreateSetting.default,
    args: [],
    invoke: [{ fn: 'setParameterOrderCreateSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setParameterOrderCreateSetting: 'function' },
      invoked: [
        {
          fn: 'setParameterOrderCreateSetting',
          calls: [{ operationName: 'SET_PARAMETER_ORDER_CREATE_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setParameterOrderCreateSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetParameterReportSetting',
    hook: useFetchSetParameterReportSetting.default,
    args: [],
    invoke: [{ fn: 'setParameterReportSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setParameterReportSetting: 'function' },
      invoked: [
        {
          fn: 'setParameterReportSetting',
          calls: [{ operationName: 'SET_PARAMETER_REPORT_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setParameterReportSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetPerformanceRuleFromPersonProfile',
    hook: useFetchSetPerformanceRuleFromPersonProfile.default,
    args: [],
    invoke: [{ fn: 'setPersonProfile', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setPersonProfile: 'function' },
      invoked: [
        {
          fn: 'setPersonProfile',
          calls: [
            { operationName: 'SET_PERFORMANCE_RULE_FROM_PERSONAL_PROFILE', variables: { input: { probe: 'input' } } },
          ],
          resolved: ['setPerformanceRuleFromPersonProfile'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetPinnedTable',
    hook: useFetchSetPinnedTable.default,
    args: [],
    invoke: [{ fn: 'setPinnedTable', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { setPinnedTable: 'function' },
      invoked: [
        {
          fn: 'setPinnedTable',
          calls: [{ operationName: 'SET_PINNED_TABLE', variables: { input: { probe: 'input' } } }],
          resolved: ['setPinnedTable'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetPurchaseStockIn',
    hook: useFetchSetPurchaseStockIn.default,
    args: [],
    invoke: [{ fn: 'setStockIn', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { setStockIn: 'function' },
      invoked: [
        {
          fn: 'setStockIn',
          calls: [{ operationName: 'SET_PURCHASE_STOCK_IN', variables: { input: { probe: 'input' } } }],
          resolved: ['purchaseStockIn'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetPurchaseStockInUndo',
    hook: useFetchSetPurchaseStockInUndo.default,
    args: [],
    invoke: [{ fn: 'setStockInUndo', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { setStockInUndo: 'function' },
      invoked: [
        {
          fn: 'setStockInUndo',
          calls: [{ operationName: 'SET_PURCHASE_STOCK_IN_UNDO', variables: { input: { probe: 'input' } } }],
          resolved: ['purchaseStockInUndo'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetSpecificBookingNotificationDayCount',
    hook: useFetchSetSpecificBookingNotificationDayCount.default,
    args: [],
    invoke: [{ fn: 'setSpecificBookingNotificationDayCount', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setSpecificBookingNotificationDayCount: 'function' },
      invoked: [
        {
          fn: 'setSpecificBookingNotificationDayCount',
          calls: [
            { operationName: 'SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT', variables: { input: { probe: 'input' } } },
          ],
          resolved: ['setSpecificBookingNotificationDayCount'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUESUsingSetting',
    hook: useFetchSetUESUsingSetting.default,
    args: [],
    invoke: [{ fn: 'setUESUsingSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUESUsingSetting: 'function' },
      invoked: [
        {
          fn: 'setUESUsingSetting',
          calls: [{ operationName: 'SET_UES_USEING_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setUESUsingSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUnlockUserSalaryItem',
    hook: useFetchSetUnlockUserSalaryItem.default,
    args: [],
    invoke: [{ fn: 'setUserSalaryItemUnlock', args: [{ date: 'date-v' }] }],
    expect: {
      initial: [],
      shape: { setUserSalaryItemUnlock: 'function' },
      invoked: [
        {
          fn: 'setUserSalaryItemUnlock',
          calls: [{ operationName: 'SET_USER_SALARY_ITEM_UNLOCK', variables: { date: 'date-v' } }],
          resolved: ['unlockUserSalaryItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUpdateMerchantVendor',
    hook: useFetchSetUpdateMerchantVendor.default,
    args: [],
    invoke: [{ fn: 'updateMerchantVendor', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateMerchantVendor: 'function' },
      invoked: [
        {
          fn: 'updateMerchantVendor',
          calls: [{ operationName: 'SET_UPDATE_MERCHANT_VENDOR', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMerchantVendor'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUpdatePurchaseRecord',
    hook: useFetchSetUpdatePurchaseRecord.default,
    args: [],
    invoke: [{ fn: 'updatePurchase', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updatePurchase: 'function' },
      invoked: [
        {
          fn: 'updatePurchase',
          calls: [{ operationName: 'UPDATE_PURCHASE', variables: { input: { probe: 'input' } } }],
          resolved: ['updatePurchase'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUpdateServicesLaunchedStatus',
    hook: useFetchSetUpdateServicesLaunchedStatus.default,
    args: [],
    invoke: [{ fn: 'updateLaunched', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateLaunched: 'function' },
      invoked: [
        {
          fn: 'updateLaunched',
          calls: [{ operationName: 'UPDATE_SERVICES_LAUNCGED_STATUS', variables: { input: { probe: 'input' } } }],
          resolved: ['updateServicesLaunchedStatus'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUserAvatar',
    hook: useFetchSetUserAvatar.default,
    args: [],
    invoke: [{ fn: 'setUserAvatar', args: [{ file: 'file-v' }] }],
    expect: {
      initial: [],
      shape: { setUserAvatar: 'function' },
      invoked: [
        {
          fn: 'setUserAvatar',
          calls: [{ operationName: 'SET_USER_AVATAR', variables: { file: 'file-v' } }],
          resolved: ['setUserAvatar'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUserDisplaySituation',
    hook: useFetchSetUserDisplaySituation.default,
    args: [],
    invoke: [{ fn: 'setUserDisplaySituation', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserDisplaySituation: 'function' },
      invoked: [
        {
          fn: 'setUserDisplaySituation',
          calls: [{ operationName: 'FETCH_SET_USER_DISPLAY_SITIUATION', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserDisplaySituation'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSetUserSalaryMonthlyCheckoutV2',
    hook: useFetchSetUserSalaryMonthlyCheckoutV2.default,
    args: [],
    invoke: [{ fn: 'setUserSalaryMonthlyCheckoutV2', args: [{ input: { probe: 'input' }, date: 'date-v' }] }],
    expect: {
      initial: [],
      shape: { setUserSalaryMonthlyCheckoutV2: 'function' },
      invoked: [
        {
          fn: 'setUserSalaryMonthlyCheckoutV2',
          calls: [
            {
              operationName: 'FETCH_USER_MONTHLY_CHECKOUT_V2',
              variables: { input: { probe: 'input' }, date: 'date-v' },
            },
          ],
          resolved: ['setUserSalaryMonthlyCheckout_V2'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingAccountingSubjects',
    hook: useFetchSettingAccountingSubjects.default,
    args: [],
    invoke: [{ fn: 'setAccountSubjects', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setAccountSubjects: 'function' },
      invoked: [
        {
          fn: 'setAccountSubjects',
          calls: [{ operationName: 'SET_ACCOUNTING_SUBJECTS', variables: { input: { probe: 'input' } } }],
          resolved: ['setAccountingSubjects'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingAccountingType',
    hook: useFetchSettingAccountingType.default,
    args: [],
    invoke: [{ fn: 'setAccountType', args: [{ typeList: 'typeList-v' }] }],
    expect: {
      initial: [],
      shape: { setAccountType: 'function' },
      invoked: [
        {
          fn: 'setAccountType',
          calls: [{ operationName: 'SET_ACCOUNTING_TYPE', variables: { typeList: 'typeList-v' } }],
          resolved: ['setAccountingType'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingCommissionWay',
    hook: useFetchSettingCommissionWay.default,
    args: [],
    invoke: [{ fn: 'setCommission', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setCommission: 'function' },
      invoked: [
        {
          fn: 'setCommission',
          calls: [{ operationName: 'SETTING_COMMISSION_WAY', variables: { input: { probe: 'input' } } }],
          resolved: ['settingCommissionWay'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingDeductionItems',
    hook: useFetchSettingDeductionItems.default,
    args: [],
    invoke: [{ fn: 'setDeductionitems', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setDeductionitems: 'function' },
      invoked: [
        {
          fn: 'setDeductionitems',
          calls: [{ operationName: 'SEIING_DEDUCTION_ITEMS', variables: { input: { probe: 'input' } } }],
          resolved: ['settingDeductionItems'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingEmployeeSchedule',
    hook: useFetchSettingEmployeeSchedule.default,
    args: [],
    invoke: [
      { fn: 'setEmployeeSchedule', args: [{ schedule: 'schedule-v', currentScheduleId: 'currentScheduleId-v' }] },
    ],
    expect: {
      initial: [],
      shape: { setEmployeeSchedule: 'function' },
      invoked: [
        {
          fn: 'setEmployeeSchedule',
          calls: [
            {
              operationName: 'SET_EMPLOYEE_SCHEDULE',
              variables: { schedule: 'schedule-v', currentScheduleId: 'currentScheduleId-v' },
            },
          ],
          resolved: ['setEmployeeSchedule'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingHelperCategory',
    hook: useFetchSettingHelperCategory.default,
    args: [],
    invoke: [{ fn: 'setHelperCategory', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setHelperCategory: 'function' },
      invoked: [
        {
          fn: 'setHelperCategory',
          calls: [{ operationName: 'SET_HELPER_CATEGORY', variables: { input: { probe: 'input' } } }],
          resolved: ['setHelperCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingJobTitlePoint',
    hook: useFetchSettingJobTitlePoint.default,
    args: [],
    invoke: [{ fn: 'setJobTitlePoint', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setJobTitlePoint: 'function' },
      invoked: [
        {
          fn: 'setJobTitlePoint',
          calls: [{ operationName: 'setting_JobTitle_Point', variables: { input: { probe: 'input' } } }],
          resolved: ['settingJobTitlePoint'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMerchantBankSettings',
    hook: useFetchSettingMerchantBankSettings.default,
    args: [],
    invoke: [{ fn: 'setMerchantBankSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantBankSetting: 'function' },
      invoked: [
        {
          fn: 'setMerchantBankSetting',
          calls: [{ operationName: 'SET_MERCHANT_BANKS_SETTINGS', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantBankSettings'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMerchantFakePerformanceReference',
    hook: useFetchSettingMerchantFakePerformanceReference.default,
    args: [],
    invoke: [{ fn: 'settingMerchantFakePerformanceRefer', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { settingMerchantFakePerformanceRefer: 'function' },
      invoked: [
        {
          fn: 'settingMerchantFakePerformanceRefer',
          calls: [{ operationName: 'SET_MERCHANT_FAKE_PERFORMANCE_REFER', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantFakePerformanceReference'],
        },
      ],
      policies: {},
    },
  },
]

describe('useFetchServiceTicket ～ useFetchSettingMerchantFakePerformanceReference', () => {
  runContractRows(ROWS)
})
