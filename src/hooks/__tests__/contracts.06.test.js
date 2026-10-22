// src/hooks 契約測試（6/6）：useFetchSettingMerchantMonthlyCheckoutRemark ～ useRemoveUserFromMerchant
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
import * as useFetchSettingMerchantMonthlyCheckoutRemark from 'hooks/useFetchSettingMerchantMonthlyCheckoutRemark'
import * as useFetchSettingMerchantPassword from 'hooks/useFetchSettingMerchantPassword'
import * as useFetchSettingMerchantSalaryDecreaseItem from 'hooks/useFetchSettingMerchantSalaryDecreaseItem'
import * as useFetchSettingMerchantSalaryIncreaseItem from 'hooks/useFetchSettingMerchantSalaryIncreaseItem'
import * as useFetchSettingMultipleUpdateProductCategory from 'hooks/useFetchSettingMultipleUpdateProductCategory'
import * as useFetchSettingRestoreDailyAccount from 'hooks/useFetchSettingRestoreDailyAccount'
import * as useFetchSettingTheme from 'hooks/useFetchSettingTheme'
import * as useFetchSettingUpdateUserOrderableList from 'hooks/useFetchSettingUpdateUserOrderableList'
import * as useFetchSettingUserBookingLimit from 'hooks/useFetchSettingUserBookingLimit'
import * as useFetchSettingUserClockIn from 'hooks/useFetchSettingUserClockIn'
import * as useFetchSettingUserDeductionWay from 'hooks/useFetchSettingUserDeductionWay'
import * as useFetchSettingUserFixedSalaryItem from 'hooks/useFetchSettingUserFixedSalaryItem'
import * as useFetchSettingUserSaleryItem from 'hooks/useFetchSettingUserSaleryItem'
import * as useFetchShortcut from 'hooks/useFetchShortcut'
import * as useFetchSingleServiceReportExcelV2 from 'hooks/useFetchSingleServiceReportExcelV2'
import * as useFetchSortMerchantCusExternalLink from 'hooks/useFetchSortMerchantCusExternalLink'
import * as useFetchSortMerchantExternalLink from 'hooks/useFetchSortMerchantExternalLink'
import * as useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import * as useFetchThirdPartTicket from 'hooks/useFetchThirdPartTicket'
import * as useFetchTicketRecords from 'hooks/useFetchTicketRecords'
import * as useFetchTicketSellOverview from 'hooks/useFetchTicketSellOverview'
import * as useFetchTickets from 'hooks/useFetchTickets'
import * as useFetchUndoEmployeeSchedule from 'hooks/useFetchUndoEmployeeSchedule'
import * as useFetchUnspecifiedBookingTimes from 'hooks/useFetchUnspecifiedBookingTimes'
import * as useFetchUpdateAttendantRecord from 'hooks/useFetchUpdateAttendantRecord'
import * as useFetchUpdateAuthority from 'hooks/useFetchUpdateAuthority'
import * as useFetchUpdateBonusDeposit from 'hooks/useFetchUpdateBonusDeposit'
import * as useFetchUpdateCustomer from 'hooks/useFetchUpdateCustomer'
import * as useFetchUpdateCustomerProfile from 'hooks/useFetchUpdateCustomerProfile'
import * as useFetchUpdateCustomerType from 'hooks/useFetchUpdateCustomerType'
import * as useFetchUpdateEventRuleGroup from 'hooks/useFetchUpdateEventRuleGroup'
import * as useFetchUpdateInventory from 'hooks/useFetchUpdateInventory'
import * as useFetchUpdateMainEvent from 'hooks/useFetchUpdateMainEvent'
import * as useFetchUpdateMembership from 'hooks/useFetchUpdateMembership'
import * as useFetchUpdateMembershipCategory from 'hooks/useFetchUpdateMembershipCategory'
import * as useFetchUpdateMerchantCusExternalLink from 'hooks/useFetchUpdateMerchantCusExternalLink'
import * as useFetchUpdateMerchantExternalLink from 'hooks/useFetchUpdateMerchantExternalLink'
import * as useFetchUpdateMerchantPointValueSetting from 'hooks/useFetchUpdateMerchantPointValueSetting'
import * as useFetchUpdateMoneyFlow from 'hooks/useFetchUpdateMoneyFlow'
import * as useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import * as useFetchUpdatePayment from 'hooks/useFetchUpdatePayment'
import * as useFetchUpdatePicking from 'hooks/useFetchUpdatePicking'
import * as useFetchUpdateProduct from 'hooks/useFetchUpdateProduct'
import * as useFetchUpdateProductCategory from 'hooks/useFetchUpdateProductCategory'
import * as useFetchUpdateService from 'hooks/useFetchUpdateService'
import * as useFetchUpdateServiceCategory from 'hooks/useFetchUpdateServiceCategory'
import * as useFetchUpdateThirdPartTicket from 'hooks/useFetchUpdateThirdPartTicket'
import * as useFetchUpdateUserMerchantIdentity from 'hooks/useFetchUpdateUserMerchantIdentity'
import * as useFetchUpdateWalletDeposit from 'hooks/useFetchUpdateWalletDeposit'
import * as useFetchUsedTicketRecords from 'hooks/useFetchUsedTicketRecords'
import * as useFetchUser from 'hooks/useFetchUser'
import * as useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import * as useFetchUserLoginForLine from 'hooks/useFetchUserLoginForLine'
import * as useFetchUserSalaryDetail from 'hooks/useFetchUserSalaryDetail'
import * as useFetchUserSalaryItemRecord from 'hooks/useFetchUserSalaryItemRecord'
import * as useFetchUserSalaryMonthlyCheckoutRecordV2 from 'hooks/useFetchUserSalaryMonthlyCheckoutRecordV2'
import * as useFetchUserSalaryReport from 'hooks/useFetchUserSalaryReport'
import * as useFetchUsers from 'hooks/useFetchUsers'
import * as useFetchVerificationCode from 'hooks/useFetchVerificationCode'
import * as useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import * as useFetchViewer from 'hooks/useFetchViewer'
import * as useFetchWaitCloseOrderDate from 'hooks/useFetchWaitCloseOrderDate'
import * as useFetchWalletDeposit from 'hooks/useFetchWalletDeposit'
import * as useFetchWalletDepositDetail from 'hooks/useFetchWalletDepositDetail'
import * as useFetchWalletDepositRecord from 'hooks/useFetchWalletDepositRecord'
import * as useFetchWalletUseRecord from 'hooks/useFetchWalletUseRecord'
import * as useFetchsSetMerchantClockInSetting from 'hooks/useFetchsSetMerchantClockInSetting'
import * as useFetctSetUpdateDefaultAuthority from 'hooks/useFetctSetUpdateDefaultAuthority'
import * as useForgotPasswordVerify from 'hooks/useForgotPasswordVerify'
import * as useRemoveUserFromMerchant from 'hooks/useRemoveUserFromMerchant'

const ROWS = [
  {
    id: 'useFetchSettingMerchantMonthlyCheckoutRemark',
    hook: useFetchSettingMerchantMonthlyCheckoutRemark.default,
    args: [],
    invoke: [{ fn: 'setMerchantMerchantMonthlyCheckoutRemark', args: [{ date: 'date-v', remark: 'remark-v' }] }],
    expect: {
      initial: [],
      shape: { setMerchantMerchantMonthlyCheckoutRemark: 'function' },
      invoked: [
        {
          fn: 'setMerchantMerchantMonthlyCheckoutRemark',
          calls: [
            { operationName: 'SET_MERCHANT_MONTHLY_CHECKOUT_REMARK', variables: { date: 'date-v', remark: 'remark-v' } },
          ],
          resolved: ['setMerchantMonthlyCheckoutRemark'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMerchantPassword',
    hook: useFetchSettingMerchantPassword.default,
    args: [],
    invoke: [{ fn: 'setMerchantPassword', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantPassword: 'function' },
      invoked: [
        {
          fn: 'setMerchantPassword',
          calls: [{ operationName: 'SET_MERCHANT_PASSWORD', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantPassword'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMerchantSalaryDecreaseItem',
    hook: useFetchSettingMerchantSalaryDecreaseItem.default,
    args: [],
    invoke: [{ fn: 'setSalaryDecreaseItem', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setSalaryDecreaseItem: 'function' },
      invoked: [
        {
          fn: 'setSalaryDecreaseItem',
          calls: [{ operationName: 'SET_MERCHANT_SALARY_DECREASE_ITEM', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantSalaryDecreaseItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMerchantSalaryIncreaseItem',
    hook: useFetchSettingMerchantSalaryIncreaseItem.default,
    args: [],
    invoke: [{ fn: 'setSalaryIncreaseItem', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setSalaryIncreaseItem: 'function' },
      invoked: [
        {
          fn: 'setSalaryIncreaseItem',
          calls: [{ operationName: 'SET_MERCHANT_SALARY_INCREASE_ITEM', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantSalaryIncreaseItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingMultipleUpdateProductCategory',
    hook: useFetchSettingMultipleUpdateProductCategory.default,
    args: [],
    invoke: [{ fn: 'setProductsCategory', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setProductsCategory: 'function' },
      invoked: [
        {
          fn: 'setProductsCategory',
          calls: [{ operationName: 'SET_PRODUCTS_CATEGORY', variables: { input: { probe: 'input' } } }],
          resolved: ['multipleUpdateProductCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingRestoreDailyAccount',
    hook: useFetchSettingRestoreDailyAccount.default,
    args: [],
    invoke: [{ fn: 'setRestoreDailyAccount', args: [{ date: 'date-v', password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { setRestoreDailyAccount: 'function' },
      invoked: [
        {
          fn: 'setRestoreDailyAccount',
          calls: [{ operationName: 'SET_RESTORE_DAILY_ACCOUNT', variables: { date: 'date-v', password: 'password-v' } }],
          resolved: ['restoreDailyAccount'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingTheme',
    hook: useFetchSettingTheme.default,
    args: [],
    invoke: [{ fn: 'setThemeChangeData', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setThemeChangeData: 'function' },
      invoked: [
        {
          fn: 'setThemeChangeData',
          calls: [{ operationName: 'SET_THEME', variables: { input: { probe: 'input' } } }],
          resolved: ['setTheme'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUpdateUserOrderableList',
    hook: useFetchSettingUpdateUserOrderableList.default,
    args: [],
    invoke: [{ fn: 'setUpdateUserOrderableList', args: [] }],
    expect: {
      initial: [],
      shape: { setUpdateUserOrderableList: 'function' },
      invoked: [
        {
          fn: 'setUpdateUserOrderableList',
          calls: [{ operationName: 'SET_UPDATE_USER_ORDERABLE_LIST', variables: {} }],
          resolved: ['updateUserOrderableList'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUserBookingLimit',
    hook: useFetchSettingUserBookingLimit.default,
    args: [],
    invoke: [{ fn: 'setUserBookingLimit', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserBookingLimit: 'function' },
      invoked: [
        {
          fn: 'setUserBookingLimit',
          calls: [{ operationName: 'SET_USER_DESIGNATE_BOOKING_LIMIT', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserBookingLimit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUserClockIn',
    hook: useFetchSettingUserClockIn.default,
    args: [],
    invoke: [{ fn: 'setUserClockIn', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserClockIn: 'function' },
      invoked: [
        {
          fn: 'setUserClockIn',
          calls: [{ operationName: 'SET_USER_CLOCK_IN', variables: { input: { probe: 'input' } } }],
          resolved: ['userClockIn'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUserDeductionWay',
    hook: useFetchSettingUserDeductionWay.default,
    args: [],
    invoke: [{ fn: 'setUserDeductionWay', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserDeductionWay: 'function' },
      invoked: [
        {
          fn: 'setUserDeductionWay',
          calls: [{ operationName: 'SET_USER_DEDUCTION_WAY', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserDeductionWay'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUserFixedSalaryItem',
    hook: useFetchSettingUserFixedSalaryItem.default,
    args: [],
    invoke: [{ fn: 'setUserFixedSalaryItem', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserFixedSalaryItem: 'function' },
      invoked: [
        {
          fn: 'setUserFixedSalaryItem',
          calls: [{ operationName: 'SET_USER_FIXED_SALARY_ITEM', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserFixedSalaryItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSettingUserSaleryItem',
    hook: useFetchSettingUserSaleryItem.default,
    args: [],
    invoke: [{ fn: 'setUserSalaryItem', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setUserSalaryItem: 'function' },
      invoked: [
        {
          fn: 'setUserSalaryItem',
          calls: [{ operationName: 'SET_USER_SALARY_ITEM', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserSalaryItem'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchShortcut.useShortcuts',
    hook: useFetchShortcut.useShortcuts,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_SHORTCUTS', variables: {} }],
      shape: { loading: false, called: true, data: ['shortcuts'] },
      policies: { GET_SHORTCUTS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchShortcut.useShortcut',
    hook: useFetchShortcut.useShortcut,
    args: ['shortcutId-v'],
    expect: {
      initial: [{ operationName: 'GET_SHORTCUT', variables: { shortcutId: 'shortcutId-v' } }],
      shape: { loading: false, called: true, data: ['shortcut'] },
      policies: { GET_SHORTCUT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchShortcut.useCreateShortcut',
    hook: useFetchShortcut.useCreateShortcut,
    args: [],
    invoke: [{ fn: 'createShort', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { createShort: 'function' },
      invoked: [
        {
          fn: 'createShort',
          calls: [{ operationName: 'CREATE_SHORTCUT', variables: { input: { probe: 'input' } } }],
          resolved: ['createShortcut'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchShortcut.useUpdateShortcut',
    hook: useFetchShortcut.useUpdateShortcut,
    args: [],
    invoke: [{ fn: 'updateShortcut', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateShortcut: 'function' },
      invoked: [
        {
          fn: 'updateShortcut',
          calls: [{ operationName: 'UPDATE_SHORTCUT', variables: { input: { probe: 'input' } } }],
          resolved: ['updateShortcut'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchShortcut.useDeleteShortcut',
    hook: useFetchShortcut.useDeleteShortcut,
    args: [],
    invoke: [{ fn: 'deleteShortcut', args: ['deleteShortcutId-v'] }],
    expect: {
      initial: [],
      shape: { deleteShortcut: 'function' },
      invoked: [
        {
          fn: 'deleteShortcut',
          calls: [{ operationName: 'DELETE_SHORTCUT', variables: { deleteShortcutId: 'deleteShortcutId-v' } }],
          resolved: ['deleteShortcut'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchShortcut.useShortcutsForOrderCreate',
    hook: useFetchShortcut.useShortcutsForOrderCreate,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: {} }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [{ fn: 0, calls: [{ operationName: 'GET_SHORTCUTS_FOR_ORDERCREATE', variables: {} }] }],
      shapeAfter: ['function', { loading: false, called: true, data: ['shortcuts'] }],
      policies: { GET_SHORTCUTS_FOR_ORDERCREATE: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchSingleServiceReportExcelV2',
    hook: useFetchSingleServiceReportExcelV2.default,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' }, sortBy: 'sortBy-v' } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'GET_SINGLE_SERVICE_EXCEL_V2',
              variables: { input: { probe: 'input' }, sortBy: 'sortBy-v' },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['singleServiceItemExcelV2'] }],
      policies: { GET_SINGLE_SERVICE_EXCEL_V2: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchSortMerchantCusExternalLink',
    hook: useFetchSortMerchantCusExternalLink.default,
    args: [],
    invoke: [{ fn: 'sortExternalLink', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { sortExternalLink: 'function' },
      invoked: [
        {
          fn: 'sortExternalLink',
          calls: [{ operationName: 'SORT_MERCHANT_CUS_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['sortMerchantCusExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSortMerchantExternalLink',
    hook: useFetchSortMerchantExternalLink.default,
    args: [],
    invoke: [{ fn: 'sortExternalLink', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { sortExternalLink: 'function' },
      invoked: [
        {
          fn: 'sortExternalLink',
          calls: [{ operationName: 'SORT_MERCHANT_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['sortMerchantExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSystemUpdateRecord',
    hook: useFetchSystemUpdateRecord.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_SYSTEM_UPDATE_RECORD', variables: {} }],
      shape: { loading: false, called: true, data: ['systemUpdateRecord'] },
      policies: { GET_SYSTEM_UPDATE_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchSystemUpdateRecord.useFetchCreateSystemUpdateCreate',
    hook: useFetchSystemUpdateRecord.useFetchCreateSystemUpdateCreate,
    args: [],
    invoke: [{ fn: 'SystemUpdateCreate', args: [{ input: { title: 'title-v', content: 'content-v' } }] }],
    expect: {
      initial: [],
      shape: { SystemUpdateCreate: 'function' },
      invoked: [
        {
          fn: 'SystemUpdateCreate',
          calls: [
            {
              operationName: 'SYSTEM_UPDATE_RECORD_CREATE',
              variables: { input: { title: 'title-v', content: 'content-v' } },
            },
          ],
          resolved: ['createSystemUpdate'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSystemUpdateRecord.useFetchCreateSystemUpdateEdit',
    hook: useFetchSystemUpdateRecord.useFetchCreateSystemUpdateEdit,
    args: [],
    invoke: [{ fn: 'SystemUpdateEdit', args: [{ input: { id: 'id-v', title: 'title-v' } }] }],
    expect: {
      initial: [],
      shape: { SystemUpdateEdit: 'function' },
      invoked: [
        {
          fn: 'SystemUpdateEdit',
          calls: [
            { operationName: 'SYSTEM_UPDATE_RECORD_EDIT', variables: { input: { id: 'id-v', title: 'title-v' } } },
          ],
          resolved: ['updateSystemUpdate'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchSystemUpdateRecord.useFetchCreateSystemUpdateDelete',
    hook: useFetchSystemUpdateRecord.useFetchCreateSystemUpdateDelete,
    args: [],
    invoke: [{ fn: 'SystemUpdateDelete', args: [{ systemUpdateId: 'systemUpdateId-v' }] }],
    expect: {
      initial: [],
      shape: { SystemUpdateDelete: 'function' },
      invoked: [
        {
          fn: 'SystemUpdateDelete',
          calls: [{ operationName: 'SYSTEM_UPDATE_RECORD_DELETE', variables: { systemUpdateId: 'systemUpdateId-v' } }],
          resolved: ['deleteSystemUpdate'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchThirdPartTicket',
    hook: useFetchThirdPartTicket.default,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_THIRD_PARTY_COUPONS', variables: {} }],
      shape: { data: { getThirdPartTicket: 'object' }, loading: false, refetch: 'function' },
      policies: { GET_THIRD_PARTY_COUPONS: 'cache-and-network' },
    },
    failure: {
      error: {
        graphQLErrors: 'array',
        clientErrors: 'array',
        networkError: null,
        message: '模擬 API 失敗：GET_THIRD_PARTY_COUPONS',
      },
      loading: false,
      refetch: 'function',
    },
  },
  {
    id: 'useFetchTicketRecords',
    hook: useFetchTicketRecords.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GetTicket', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['ticketRecords'] },
      policies: { GetTicket: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTicketRecords.useFetchLazyTicketRecords',
    hook: useFetchTicketRecords.useFetchLazyTicketRecords,
    args: [],
    invoke: [{ fn: 'fetchTicketRecod', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { fetchTicketRecod: 'function', response: { loading: false, called: false } },
      invoked: [
        { fn: 'fetchTicketRecod', calls: [{ operationName: 'GetTicket', variables: { input: { probe: 'input' } } }] },
      ],
      shapeAfter: { fetchTicketRecod: 'function', response: { loading: false, called: true, data: ['ticketRecords'] } },
      policies: { GetTicket: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchTicketRecords.useFetchTicketRecordsInOrderDetail',
    hook: useFetchTicketRecords.useFetchTicketRecordsInOrderDetail,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GetTicket', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['ticketRecords'] },
      policies: { GetTicket: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTicketSellOverview.useFetchTicketSellOverviewLazy',
    hook: useFetchTicketSellOverview.useFetchTicketSellOverviewLazy,
    args: [],
    invoke: [{ fn: 0, args: [{ variables: { input: { probe: 'input' } } }] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        { fn: 0, calls: [{ operationName: 'FETCH_TICKET_SELL_OVERVIEW', variables: { input: { probe: 'input' } } }] },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['ticketSellOverview'] }],
      policies: { FETCH_TICKET_SELL_OVERVIEW: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchTickets',
    hook: useFetchTickets.default,
    args: [{ keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' }],
    expect: {
      initial: [
        {
          operationName: 'GET_TICKETS',
          variables: { keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' },
        },
      ],
      shape: { loading: false, called: true, data: ['tickets'] },
      policies: { GET_TICKETS: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_TICKETS', variables: { keyword: '', categoryIds: [] } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTickets.useFetchTicketsInOrderDetail',
    hook: useFetchTickets.useFetchTicketsInOrderDetail,
    args: [{ keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' }],
    expect: {
      initial: [{ operationName: 'GET_TICKETS_IN_ORDER_DETAIL', variables: { keyword: '洗髮', categoryIds: ['cat-1'] } }],
      shape: { loading: false, called: true, data: ['tickets'] },
      policies: { GET_TICKETS_IN_ORDER_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTickets.useFetchTicketsForList',
    hook: useFetchTickets.useFetchTicketsForList,
    args: [{ keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' }],
    expect: {
      initial: [{ operationName: 'GET_TICKETS_FOR_LIST', variables: { keyword: '洗髮', categoryIds: ['cat-1'] } }],
      shape: { loading: false, called: true, data: ['ticketsForList'] },
      policies: { GET_TICKETS_FOR_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTickets.useFetchTicketsForAutocomplete',
    hook: useFetchTickets.useFetchTicketsForAutocomplete,
    args: [],
    expect: {
      initial: [{ operationName: 'GET_TICKETS_FOR_AUTOCOMPLETE', variables: {} }],
      shape: { loading: false, called: true, data: ['ticketsForList'] },
      policies: { GET_TICKETS_FOR_AUTOCOMPLETE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchTickets.useFetchTicketsForTransferList',
    hook: useFetchTickets.useFetchTicketsForTransferList,
    args: [{ keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' }],
    expect: {
      initial: [
        {
          operationName: 'GET_TICKETS_FOR_TRANSFERLIST',
          variables: { keyword: '洗髮', categoryIds: ['cat-1'], isLaunched: true, orderId: 'order-1' },
        },
      ],
      shape: { loading: false, called: true, data: ['tickets'] },
      policies: { GET_TICKETS_FOR_TRANSFERLIST: 'cache-and-network' },
    },
    noArgs: { initial: [{ operationName: 'GET_TICKETS_FOR_TRANSFERLIST', variables: { keyword: '', categoryIds: [] } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUndoEmployeeSchedule',
    hook: useFetchUndoEmployeeSchedule.default,
    args: [],
    invoke: [{ fn: 'undoEmployeeSchedule', args: [{ currentScheduleId: 'currentScheduleId-v' }] }],
    expect: {
      initial: [],
      shape: { undoEmployeeSchedule: 'function' },
      invoked: [
        {
          fn: 'undoEmployeeSchedule',
          calls: [{ operationName: 'UNDO_EMPLOYEE_SCHEDULE', variables: { currentScheduleId: 'currentScheduleId-v' } }],
          resolved: ['undoEmployeeSchedule'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUnspecifiedBookingTimes.useLazyFetchUnspecifiedBookingTimes',
    hook: useFetchUnspecifiedBookingTimes.useLazyFetchUnspecifiedBookingTimes,
    args: [{ storeId: 'storeId-v', date: 'date-v' }],
    invoke: [{ fn: 'fetchUnspecifiedBookingTimes', args: [] }],
    expect: {
      initial: [],
      shape: {
        fetchUnspecifiedBookingTimes: 'function',
        unspecifiedBookingTimesResponse: { loading: false, called: false },
      },
      invoked: [
        {
          fn: 'fetchUnspecifiedBookingTimes',
          calls: [
            {
              operationName: 'unspecifiedBookingTimes',
              variables: { UnspecifiedBookingTimesInput: { storeId: 'storeId-v', date: 'date-v' } },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchUnspecifiedBookingTimes: 'function',
        unspecifiedBookingTimesResponse: { loading: false, called: true, data: ['unspecifiedBookingTimes'] },
      },
      policies: { unspecifiedBookingTimes: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchUpdateAttendantRecord',
    hook: useFetchUpdateAttendantRecord.default,
    args: [],
    invoke: [{ fn: 'updateAttendantRecord', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateAttendantRecord: 'function' },
      invoked: [
        {
          fn: 'updateAttendantRecord',
          calls: [{ operationName: 'UPDATA_ATTENDANT_RECORD', variables: { input: { probe: 'input' } } }],
          resolved: ['updateAttendantRecord'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateAuthority',
    hook: useFetchUpdateAuthority.default,
    args: [],
    invoke: [
      {
        fn: 'updateAuthority',
        args: [{ authorityId: 'authorityId-v', settings: { probe: 'settings' }, authorityName: 'authorityName-v' }],
      },
    ],
    expect: {
      initial: [],
      shape: { updateAuthority: 'function' },
      invoked: [
        {
          fn: 'updateAuthority',
          calls: [
            {
              operationName: 'UPDATE_AUTHORITY',
              variables: {
                authorityId: 'authorityId-v',
                settings: { probe: 'settings' },
                authorityName: 'authorityName-v',
              },
            },
          ],
          resolved: ['updateAuthority'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateBonusDeposit',
    hook: useFetchUpdateBonusDeposit.default,
    args: [],
    invoke: [{ fn: 'updateBonus', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateBonus: 'function' },
      invoked: [
        {
          fn: 'updateBonus',
          calls: [{ operationName: 'UPDATE_BONUS_DEPOSIT', variables: { input: { probe: 'input' } } }],
          resolved: ['updateBonusDeposit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateCustomer',
    hook: useFetchUpdateCustomer.default,
    args: [],
    invoke: [{ fn: 'updateCustomer', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateCustomer: 'function' },
      invoked: [
        {
          fn: 'updateCustomer',
          calls: [{ operationName: 'SET_CUSTOMER', variables: { input: { probe: 'input' } } }],
          resolved: ['updateCustomer'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateCustomerProfile',
    hook: useFetchUpdateCustomerProfile.default,
    args: [],
    invoke: [{ fn: 'updateCustomer', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateCustomer: 'function', updateCustomerResponse: { loading: false, called: false } },
      invoked: [
        {
          fn: 'updateCustomer',
          calls: [{ operationName: 'UpdateCustomerProfile', variables: { input: { probe: 'input' } } }],
          resolved: ['updateCustomerProfile'],
        },
      ],
      shapeAfter: {
        updateCustomer: 'function',
        updateCustomerResponse: { loading: false, called: true, data: ['updateCustomerProfile'] },
      },
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateCustomerType',
    hook: useFetchUpdateCustomerType.default,
    args: [],
    invoke: [{ fn: 'updateCustomer', args: ['recommandCode-v'] }],
    expect: {
      initial: [],
      shape: { updateCustomer: 'function' },
      invoked: [
        {
          fn: 'updateCustomer',
          calls: [{ operationName: 'UpdateCustomerType', variables: { recommandCode: 'recommandCode-v' } }],
          resolved: ['updateCustomerType'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateEventRuleGroup',
    hook: useFetchUpdateEventRuleGroup.default,
    args: [],
    invoke: [{ fn: 'updateRule', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateRule: 'function' },
      invoked: [
        {
          fn: 'updateRule',
          calls: [{ operationName: 'UPDATE_EVENT_RULE_GROUP', variables: { input: { probe: 'input' } } }],
          resolved: ['updateEventRuleGroup'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateInventory',
    hook: useFetchUpdateInventory.default,
    args: [],
    invoke: [{ fn: 'updateInventory', args: [{ input: { probe: 'input' }, inventoryId: 'inventoryId-v' }] }],
    expect: {
      initial: [],
      shape: { updateInventory: 'function' },
      invoked: [
        {
          fn: 'updateInventory',
          calls: [
            {
              operationName: 'SET_UPDATE_INVENTORY',
              variables: { input: { probe: 'input' }, inventoryId: 'inventoryId-v' },
            },
          ],
          resolved: ['updateInventory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMainEvent',
    hook: useFetchUpdateMainEvent.default,
    args: [],
    invoke: [{ fn: 'updateMainEvent', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateMainEvent: 'function' },
      invoked: [
        {
          fn: 'updateMainEvent',
          calls: [{ operationName: 'UPDATE_MERCHANT_EVENT', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMainEvent'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMembership',
    hook: useFetchUpdateMembership.default,
    args: [],
    invoke: [{ fn: 'updateMembership', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateMembership: 'function' },
      invoked: [
        {
          fn: 'updateMembership',
          calls: [{ operationName: 'updateMembership', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMembership'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMembershipCategory',
    hook: useFetchUpdateMembershipCategory.default,
    args: [],
    invoke: [{ fn: 'updateMembershipCategory', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateMembershipCategory: 'function' },
      invoked: [
        {
          fn: 'updateMembershipCategory',
          calls: [{ operationName: 'updateMembershipCategory', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMembershipCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMerchantCusExternalLink',
    hook: useFetchUpdateMerchantCusExternalLink.default,
    args: [],
    invoke: [{ fn: 'updateCusLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateCusLink: 'function' },
      invoked: [
        {
          fn: 'updateCusLink',
          calls: [{ operationName: 'UPDATE_MERCHANT_CUS_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMerchantCusExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMerchantExternalLink',
    hook: useFetchUpdateMerchantExternalLink.default,
    args: [],
    invoke: [{ fn: 'updateLink', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateLink: 'function' },
      invoked: [
        {
          fn: 'updateLink',
          calls: [{ operationName: 'UPDATE_MERCHANT_EXTERNAL_LINK', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMerchantExternalLink'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMerchantPointValueSetting',
    hook: useFetchUpdateMerchantPointValueSetting.default,
    args: [],
    invoke: [{ fn: 'updateMerchantPointValueSetting', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateMerchantPointValueSetting: 'function' },
      invoked: [
        {
          fn: 'updateMerchantPointValueSetting',
          calls: [{ operationName: 'UPDATE_MERCHANT_POINT_VALUE_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['updateMerchantPointValueSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateMoneyFlow',
    hook: useFetchUpdateMoneyFlow.default,
    args: [],
    invoke: [{ fn: 'updateMoneyFlow', args: [{ input: { probe: 'input' }, id: 'id-v', password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { updateMoneyFlow: 'function' },
      invoked: [
        {
          fn: 'updateMoneyFlow',
          calls: [
            {
              operationName: 'USE_FETCH_UPDATE_MONEY_FLOW',
              variables: { input: { probe: 'input' }, id: 'id-v', password: 'password-v' },
            },
          ],
          resolved: ['updateMoneyFlow'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateOrder',
    hook: useFetchUpdateOrder.default,
    args: [],
    invoke: [{ fn: 'updateOrder', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateOrder: 'function' },
      invoked: [
        {
          fn: 'updateOrder',
          calls: [{ operationName: 'UpdateOrder', variables: { input: { probe: 'input' } } }],
          resolved: ['updateOrder'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdatePayment',
    hook: useFetchUpdatePayment.default,
    args: [],
    invoke: [{ fn: 'updatePayment', args: [{ id: 'id-v', input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updatePayment: 'function' },
      invoked: [
        {
          fn: 'updatePayment',
          calls: [{ operationName: 'UPDATE_PAYMENT', variables: { id: 'id-v', input: { probe: 'input' } } }],
          resolved: ['updatePayWay'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdatePicking',
    hook: useFetchUpdatePicking.default,
    args: [],
    invoke: [{ fn: 'updatePicking', args: [{ input: { probe: 'input' }, id: 'id-v' }] }],
    expect: {
      initial: [],
      shape: { updatePicking: 'function' },
      invoked: [
        {
          fn: 'updatePicking',
          calls: [{ operationName: 'UPDATE_PICKING', variables: { id: 'id-v', input: { probe: 'input' } } }],
          resolved: ['updatePicking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateProduct',
    hook: useFetchUpdateProduct.default,
    args: [],
    invoke: [{ fn: 'updateProduct', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateProduct: 'function' },
      invoked: [
        {
          fn: 'updateProduct',
          calls: [{ operationName: 'SET_PRODUCT', variables: { input: { probe: 'input' } } }],
          resolved: ['updateProduct'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateProductCategory',
    hook: useFetchUpdateProductCategory.default,
    args: [],
    invoke: [{ fn: 'updateProductCategory', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateProductCategory: 'function' },
      invoked: [
        {
          fn: 'updateProductCategory',
          calls: [{ operationName: 'UPDATE_PRODUCT_CATEGORY', variables: { input: { probe: 'input' } } }],
          resolved: ['updateProductCategory'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateService',
    hook: useFetchUpdateService.default,
    args: [],
    invoke: [{ fn: 'updateService', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateService: 'function' },
      invoked: [
        {
          fn: 'updateService',
          calls: [{ operationName: 'UPDATE_SERVICE', variables: { input: { probe: 'input' } } }],
          resolved: ['updateService'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateServiceCategory',
    hook: useFetchUpdateServiceCategory.default,
    args: [],
    invoke: [
      {
        fn: 'updateService',
        args: [
          {
            itemId: 'itemId-v',
            no: 'no-v',
            name: 'name-v',
            attribution: 'attribution-v',
            remark: 'remark-v',
            isUsing: true,
          },
        ],
      },
    ],
    expect: {
      initial: [],
      shape: { updateService: 'function' },
      invoked: [
        {
          fn: 'updateService',
          calls: [
            {
              operationName: 'UPDATE_SERVICE_CATEGORY',
              variables: {
                category: {
                  itemId: 'itemId-v',
                  no: 'no-v',
                  name: 'name-v',
                  attribution: 'attribution-v',
                  remark: 'remark-v',
                  isUsing: true,
                },
              },
            },
          ],
          resolved: ['updateServiceCategory'],
        },
      ],
      shapeAfter: { updateService: 'function', data: { updateServiceCategory: null } },
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateThirdPartTicket',
    hook: useFetchUpdateThirdPartTicket.default,
    args: [],
    invoke: [{ fn: 'updateThirdPartyCoupon', args: [{ id: 'id-v', input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateThirdPartyCoupon: 'function' },
      invoked: [
        {
          fn: 'updateThirdPartyCoupon',
          calls: [
            { operationName: 'UPDATE_UPDATE_THIRD_PARTY_COUPON', variables: { id: 'id-v', input: { probe: 'input' } } },
          ],
          resolved: ['updateThirdPartTicket'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateUserMerchantIdentity',
    hook: useFetchUpdateUserMerchantIdentity.default,
    args: [],
    invoke: [{ fn: 'updateUserMerchantIdentity', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { updateUserMerchantIdentity: 'function' },
      invoked: [
        {
          fn: 'updateUserMerchantIdentity',
          calls: [{ operationName: 'FETCH_UPDATE_USER_MERCHANT_IDENTITY', variables: { input: { probe: 'input' } } }],
          resolved: ['updateUserMerchantIdentity'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUpdateWalletDeposit',
    hook: useFetchUpdateWalletDeposit.default,
    args: [],
    invoke: [{ fn: 'updateWalletDeposit', args: [{ id: 'id-v', input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateWalletDeposit: 'function' },
      invoked: [
        {
          fn: 'updateWalletDeposit',
          calls: [{ operationName: 'SET_WALLET_DEPOSIT', variables: { id: 'id-v', input: { probe: 'input' } } }],
          resolved: ['updateWalletDeposit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUsedTicketRecords.useFetchUsedTicketRecordsLazy',
    hook: useFetchUsedTicketRecords.useFetchUsedTicketRecordsLazy,
    args: [{ probe: 'input' }, ['ticketIds-1']],
    invoke: [{ fn: 0, args: [] }],
    expect: {
      initial: [],
      shape: ['function', { loading: false, called: false }],
      invoked: [
        {
          fn: 0,
          calls: [
            {
              operationName: 'FETCH_USED_TICKET_RECORDS',
              variables: { input: { probe: 'input' }, ticketIds: ['ticketIds-1'] },
            },
          ],
        },
      ],
      shapeAfter: ['function', { loading: false, called: true, data: ['usedTicketRecords'] }],
      policies: { FETCH_USED_TICKET_RECORDS: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchUser.useUpdateUserPermission',
    hook: useFetchUser.useUpdateUserPermission,
    args: [{ input: { probe: 'input' } }],
    invoke: [{ fn: 'updateUserPermission', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { updateUserPermission: 'function' },
      invoked: [
        {
          fn: 'updateUserPermission',
          calls: [{ operationName: 'updateUserPermission', variables: { input: { probe: 'input' } } }],
          resolved: ['updateUserPermission'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUser.useFetchUserPermission',
    hook: useFetchUser.useFetchUserPermission,
    args: [{ input: { probe: 'input' } }],
    expect: {
      initial: [{ operationName: 'GetUserPermission', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['user'] },
      policies: { GetUserPermission: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUser.useFetchUserAttendanceLazy',
    hook: useFetchUser.useFetchUserAttendanceLazy,
    args: [],
    invoke: [
      {
        fn: 'fetchUserAttendanceLazy',
        args: [
          { variables: { userInput: { probe: 'userInput' }, allAttendanceInput: { probe: 'allAttendanceInput' } } },
        ],
      },
    ],
    expect: {
      initial: [],
      shape: { fetchUserAttendanceLazy: 'function', uerAttendanceLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchUserAttendanceLazy',
          calls: [
            {
              operationName: 'FETCH_USER_ATTENDANCE',
              variables: { userInput: { probe: 'userInput' }, allAttendanceInput: { probe: 'allAttendanceInput' } },
            },
          ],
        },
      ],
      shapeAfter: {
        fetchUserAttendanceLazy: 'function',
        uerAttendanceLazyData: { loading: false, called: true, data: ['user'] },
      },
      policies: { FETCH_USER_ATTENDANCE: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchUser.useFetchUserSalary',
    hook: useFetchUser.useFetchUserSalary,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_USER_SALARY', variables: { input: { probe: 'input' }, date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['user'] },
      policies: { FETCH_USER_SALARY: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUser.useLazyFetchDesignerSalesDetail',
    hook: useFetchUser.useLazyFetchDesignerSalesDetail,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    invoke: [{ fn: 'fetchDesignerSalesDetail', args: [] }],
    expect: {
      initial: [],
      shape: { fetchDesignerSalesDetail: 'function', designerSalesDetail: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchDesignerSalesDetail',
          calls: [
            { operationName: 'FETCH_DESIGNER_SALES_DETAIL', variables: { input: { probe: 'input' }, date: 'date-v' } },
          ],
        },
      ],
      shapeAfter: {
        fetchDesignerSalesDetail: 'function',
        designerSalesDetail: { loading: false, called: true, data: ['user'] },
      },
      policies: { FETCH_DESIGNER_SALES_DETAIL: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchUser',
    hook: useFetchUser.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_USER', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['user'] },
      policies: { FETCH_USER: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUser.useFetchIsWhiteList',
    hook: useFetchUser.useFetchIsWhiteList,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_IS_WHITE_LIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['user'] },
      policies: { FETCH_IS_WHITE_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUser.useFetchIsUserSalaryChecked',
    hook: useFetchUser.useFetchIsUserSalaryChecked,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [
        { operationName: 'FETCH_USER_IS_SALARYCHECKED', variables: { input: { probe: 'input' }, date: 'date-v' } },
      ],
      shape: { loading: false, called: true, data: ['user'] },
      policies: { FETCH_USER_IS_SALARYCHECKED: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUserGeneral',
    hook: useFetchUserGeneral.default,
    args: [],
    invoke: [{ fn: 'fetchUpdateUserGeneral', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { fetchUpdateUserGeneral: 'function' },
      invoked: [
        {
          fn: 'fetchUpdateUserGeneral',
          calls: [{ operationName: 'UPDATE_USER_INFO', variables: { input: { probe: 'input' } } }],
          resolved: ['setUserInfo'],
        },
      ],
      shapeAfter: { data: { setUserInfo: null }, fetchUpdateUserGeneral: 'function' },
      policies: {},
    },
  },
  {
    id: 'useFetchUserLoginForLine',
    hook: useFetchUserLoginForLine.default,
    args: [],
    invoke: [{ fn: 'loginForLine', args: [{ cellphone: 'cellphone-v', password: 'password-v' }] }],
    expect: {
      initial: [],
      shape: { loginForLine: 'function' },
      invoked: [
        {
          fn: 'loginForLine',
          calls: [
            {
              operationName: 'LOGINFORLINE',
              variables: { input: { cellphone: 'cellphone-v', password: 'password-v' } },
            },
          ],
          resolved: ['userLoginForLine'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchUserSalaryDetail',
    hook: useFetchUserSalaryDetail.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_DESIGNERS_SALARY_DETAIL', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['getUserSalaryDetail'] },
      policies: { FETCH_DESIGNERS_SALARY_DETAIL: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUserSalaryItemRecord',
    hook: useFetchUserSalaryItemRecord.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_USER_SALARY_ITEM', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['userSalaryItemRecord'] },
      policies: { GET_USER_SALARY_ITEM: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUserSalaryMonthlyCheckoutRecordV2',
    hook: useFetchUserSalaryMonthlyCheckoutRecordV2.default,
    args: [{ date: 'date-v', userId: 'userId-v' }],
    expect: {
      initial: [
        {
          operationName: 'FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2',
          variables: { date: 'date-v', userId: 'userId-v' },
        },
      ],
      shape: { loading: false, called: true, data: ['getUserSalaryMonthlyCheckoutRecordV2'] },
      policies: { FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUserSalaryReport',
    hook: useFetchUserSalaryReport.default,
    args: [{ date: 'date-v' }],
    expect: {
      initial: [{ operationName: 'FETCH_USER_SALARY_REPORT', variables: { date: 'date-v' } }],
      shape: { loading: false, called: true, data: ['userSalaryReport'] },
      policies: { FETCH_USER_SALARY_REPORT: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUserSalaryReport.useFetchUserSalaryReportLazy',
    hook: useFetchUserSalaryReport.useFetchUserSalaryReportLazy,
    args: [],
    invoke: [{ fn: 'fetchUserSalaryReportLazy', args: [{ variables: { date: 'date-v' } }] }],
    expect: {
      initial: [],
      shape: { fetchUserSalaryReportLazy: 'function', userSalaryReportLazyData: { loading: false, called: false } },
      invoked: [
        {
          fn: 'fetchUserSalaryReportLazy',
          calls: [{ operationName: 'FETCH_USER_SALARY_REPORT', variables: { date: 'date-v' } }],
        },
      ],
      shapeAfter: {
        fetchUserSalaryReportLazy: 'function',
        userSalaryReportLazyData: { loading: false, called: true, data: ['userSalaryReport'] },
      },
      policies: { FETCH_USER_SALARY_REPORT: 'cache-and-network' },
    },
  },
  {
    id: 'useFetchUsers',
    hook: useFetchUsers.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'FETCH_USERS', variables: { input: { MerchantId: 'merchant-1', probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { FETCH_USERS: 'cache-and-network' },
    },
    loggedOut: { initial: [{ operationName: 'FETCH_USERS', variables: { input: { MerchantId: null, probe: 'input' } } }] },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUsersForCreatePicking',
    hook: useFetchUsers.useFetchUsersForCreatePicking,
    args: [{ probe: 'input' }],
    expect: {
      initial: [
        {
          operationName: 'GET_USERS_FOR_CREATE_PICKING',
          variables: { input: { MerchantId: 'merchant-1', probe: 'input' } },
        },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { GET_USERS_FOR_CREATE_PICKING: 'cache-and-network' },
    },
    loggedOut: {
      initial: [
        { operationName: 'GET_USERS_FOR_CREATE_PICKING', variables: { input: { MerchantId: null, probe: 'input' } } },
      ],
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUserIncrease',
    hook: useFetchUsers.useFetchUserIncrease,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [
        { operationName: 'FETCH_USER_SALARY_INCREASE', variables: { input: { probe: 'input' }, date: 'date-v' } },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { FETCH_USER_SALARY_INCREASE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUserDecrease',
    hook: useFetchUsers.useFetchUserDecrease,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [
        { operationName: 'FETCH_USER_SALARY_DECREASE', variables: { input: { probe: 'input' }, date: 'date-v' } },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { FETCH_USER_SALARY_DECREASE: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUsersSalaryItems',
    hook: useFetchUsers.useFetchUsersSalaryItems,
    args: [{ input: { probe: 'input' }, date: 'date-v' }],
    expect: {
      initial: [
        { operationName: 'GET_ALL_USERS_SALARY_ITEMS', variables: { input: { probe: 'input' }, date: 'date-v' } },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { GET_ALL_USERS_SALARY_ITEMS: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUsersMonthCheckout',
    hook: useFetchUsers.useFetchUsersMonthCheckout,
    args: [{ usagelimit: 10, date: 'date-v' }],
    expect: {
      initial: [
        {
          operationName: 'GET_USERS_IS_MONTH_CHECKOUT',
          variables: { input: { MerchantId: 'merchant-1', usagelimit: 10 }, date: 'date-v' },
        },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { GET_USERS_IS_MONTH_CHECKOUT: 'cache-and-network' },
    },
    loggedOut: {
      initial: [
        {
          operationName: 'GET_USERS_IS_MONTH_CHECKOUT',
          variables: { input: { MerchantId: null, usagelimit: 10 }, date: 'date-v' },
        },
      ],
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUsersInEmployeeSchedule',
    hook: useFetchUsers.useFetchUsersInEmployeeSchedule,
    args: [{ probe: 'input' }],
    expect: {
      initial: [
        {
          operationName: 'GET_USERS_IN_EMPLOYEE_SCHEDULE',
          variables: { input: { MerchantId: 'merchant-1', probe: 'input' } },
        },
      ],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { GET_USERS_IN_EMPLOYEE_SCHEDULE: 'cache-and-network' },
    },
    loggedOut: {
      initial: [
        { operationName: 'GET_USERS_IN_EMPLOYEE_SCHEDULE', variables: { input: { MerchantId: null, probe: 'input' } } },
      ],
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchUsers.useFetchUsersInEmployeeList',
    hook: useFetchUsers.useFetchUsersInEmployeeList,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'GET_USERS_IN_EMPLOYEE_LIST', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['users'] },
      policies: { GET_USERS_IN_EMPLOYEE_LIST: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchVerificationCode',
    hook: useFetchVerificationCode.default,
    args: [],
    invoke: [{ fn: 'fetchVerificationCode', args: [{ cellphone: 'cellphone-v' }] }],
    expect: {
      initial: [],
      shape: { fetchVerificationCode: 'function' },
      invoked: [
        {
          fn: 'fetchVerificationCode',
          calls: [{ operationName: 'forgetPassword', variables: { cellphone: 'cellphone-v' } }],
          resolved: ['forgetPassword'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchVerifyBooking',
    hook: useFetchVerifyBooking.default,
    args: [],
    invoke: [{ fn: 'verifyBooking', args: [{ probe: 'input' }] }],
    expect: {
      initial: [],
      shape: { verifyBooking: 'function' },
      invoked: [
        {
          fn: 'verifyBooking',
          calls: [{ operationName: 'verifyBooking', variables: { input: { probe: 'input' } } }],
          resolved: ['verifyBooking'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchViewer',
    hook: useFetchViewer.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { showAll: true, probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['viewer'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchViewer.useFetchCustomerBookingResults',
    hook: useFetchViewer.useFetchCustomerBookingResults,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['viewer'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchViewer.useLazyFetchCustomerProfile',
    hook: useFetchViewer.useLazyFetchCustomerProfile,
    args: [{ probe: 'input' }],
    invoke: [{ fn: 'fetchCustomerProfile', args: [] }],
    expect: {
      initial: [],
      shape: { fetchCustomerProfile: 'function', customerProfile: { loading: false, called: false } },
      invoked: [{ fn: 'fetchCustomerProfile', calls: [{ variables: { input: { probe: 'input' } } }] }],
      shapeAfter: {
        fetchCustomerProfile: 'function',
        customerProfile: { loading: false, called: true, data: ['viewer'] },
      },
      policies: { '(anonymous)': 'cache-and-network' },
    },
  },
  {
    id: 'useFetchViewer.useFetchMerchantLiff',
    hook: useFetchViewer.useFetchMerchantLiff,
    args: [{ merchantId: 'merchantId-v' }],
    expect: {
      initial: [{ variables: { merchantId: 'merchantId-v' } }],
      shape: { loading: false, called: true, data: ['viewer'] },
      policies: { '(anonymous)': 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchWaitCloseOrderDate',
    hook: useFetchWaitCloseOrderDate.default,
    args: [{ probe: 'input' }],
    expect: {
      initial: [{ operationName: 'waitCloseOrderDate', variables: { input: { probe: 'input' } } }],
      shape: { loading: false, called: true, data: ['waitCloseOrderDate'] },
      policies: { waitCloseOrderDate: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchWalletDeposit',
    hook: useFetchWalletDeposit.default,
    args: [],
    invoke: [{ fn: 'walletDeposit', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { walletDeposit: 'function' },
      invoked: [
        {
          fn: 'walletDeposit',
          calls: [{ operationName: 'walletDeposit', variables: { input: { probe: 'input' } } }],
          resolved: ['walletDeposit'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetchWalletDepositDetail',
    hook: useFetchWalletDepositDetail.default,
    args: [{ id: 'id-v' }],
    expect: {
      initial: [{ operationName: 'walletDepositDetail', variables: { id: 'id-v' } }],
      shape: { loading: false, called: true, data: ['walletDepositDetail'] },
      policies: { walletDepositDetail: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchWalletDepositRecord',
    hook: useFetchWalletDepositRecord.default,
    args: [
      {
        start: 'start-v',
        end: 'end-v',
        pageLimit: 10,
        pageOffset: 10,
        customerId: 'customerId-v',
        designerId: 'designerId-v',
        payType: 'payType-v',
      },
    ],
    expect: {
      initial: [
        {
          operationName: 'walletdepositrecord',
          variables: {
            input: {
              start: 'start-v',
              end: 'end-v',
              pageLimit: 10,
              pageOffset: 10,
              customerId: 'customerId-v',
              designerId: 'designerId-v',
              payType: 'payType-v',
            },
          },
        },
      ],
      shape: { loading: false, called: true, data: ['walletDepositRecord'] },
      policies: { walletdepositrecord: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchWalletUseRecord',
    hook: useFetchWalletUseRecord.default,
    args: [
      {
        start: 'start-v',
        end: 'end-v',
        pageLimit: 10,
        pageOffset: 10,
        customerId: 'customerId-v',
        designerId: 'designerId-v',
      },
    ],
    expect: {
      initial: [
        {
          operationName: 'WALLET_USE_RECORD',
          variables: {
            input: {
              start: 'start-v',
              end: 'end-v',
              pageLimit: 10,
              pageOffset: 10,
              customerId: 'customerId-v',
              designerId: 'designerId-v',
            },
          },
        },
      ],
      shape: { loading: false, called: true, data: ['walletUseRecord'] },
      policies: { WALLET_USE_RECORD: 'cache-and-network' },
    },
    failure: { loading: false, called: true, error: 'error' },
  },
  {
    id: 'useFetchsSetMerchantClockInSetting',
    hook: useFetchsSetMerchantClockInSetting.default,
    args: [],
    invoke: [{ fn: 'setMerchantClockInSetting', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setMerchantClockInSetting: 'function' },
      invoked: [
        {
          fn: 'setMerchantClockInSetting',
          calls: [{ operationName: 'SET_MERCHANT_CLOCK_IN_SETTING', variables: { input: { probe: 'input' } } }],
          resolved: ['setMerchantClockInSetting'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useFetctSetUpdateDefaultAuthority',
    hook: useFetctSetUpdateDefaultAuthority.default,
    args: [],
    invoke: [{ fn: 'setUpdateDefaultAuthority', args: [{ authorityId: 'authorityId-v' }] }],
    expect: {
      initial: [],
      shape: { setUpdateDefaultAuthority: 'function' },
      invoked: [
        {
          fn: 'setUpdateDefaultAuthority',
          calls: [{ operationName: 'SET_UPDATE_DEFAULT_AUTHORITY', variables: { authorityId: 'authorityId-v' } }],
          resolved: ['updateDefaultAuthority'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useForgotPasswordVerify',
    hook: useForgotPasswordVerify.default,
    args: [],
    invoke: [{ fn: 'forgotPasswordVerify', args: [{ cellphone: 'cellphone-v', verifyCode: 'verifyCode-v' }] }],
    expect: {
      initial: [],
      shape: { forgotPasswordVerify: 'function' },
      invoked: [
        {
          fn: 'forgotPasswordVerify',
          calls: [
            {
              operationName: 'FORGOT_PASSWORD_VERFITY',
              variables: { input: { cellphone: 'cellphone-v', verifyCode: 'verifyCode-v' } },
            },
          ],
          resolved: ['forgetPasswordVerify'],
        },
      ],
      policies: {},
    },
  },
  {
    id: 'useRemoveUserFromMerchant',
    hook: useRemoveUserFromMerchant.default,
    args: [],
    invoke: [{ fn: 'setRemoveUserFromMerchant', args: [{ input: { probe: 'input' } }] }],
    expect: {
      initial: [],
      shape: { setRemoveUserFromMerchant: 'function' },
      invoked: [
        {
          fn: 'setRemoveUserFromMerchant',
          calls: [{ operationName: 'SET_REMOVE_USER', variables: { input: { probe: 'input' } } }],
          resolved: ['removeUserFromMerchant'],
        },
      ],
      policies: {},
    },
  },
]

describe('useFetchSettingMerchantMonthlyCheckoutRemark ～ useRemoveUserFromMerchant', () => {
  runContractRows(ROWS)
})
