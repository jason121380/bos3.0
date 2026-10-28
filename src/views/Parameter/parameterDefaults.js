// 系統參數設定各區塊的初始值（自 Parameter.js 原樣搬出）。
// 用工廠函式而非共用常數：與原本 useState({...}) 相同，每次 render 都產生新物件，不會在元件間共用同一份可變物件。

export const requiredColumnOptions = [
  { label: '暱稱', value: 'NICKNAME' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Line ID', value: 'LINEID' },
  { label: '生日', value: 'BIRTHDAY' },
  { label: '地址', value: 'ADDRESS' },
]

export const createDefaultPasswordSetting = () => ({
  superPassword: '',
  reCheckoutOrder: { password: '', isUsing: false },
  deleteOrder: { password: '', isUsing: false },
  deleteService: { password: '', isUsing: false },
  deleteProduct: { password: '', isUsing: false },
  restoreCheckout: { password: '', isUsing: false },
  deleteCustomer: { password: '', isUsing: false },
  editMoneyFlow: { password: '', isUsing: false },
  purchaseStockIn: { password: '', isUsing: false },
  purchaseStockInUndo: { password: '', isUsing: false },
  cancelReservation: { password: '', isUsing: false },
})

export const createDefaultMerchantBankSettings = () => ({
  remitterBankName: '',
  remitterBankAccount: '',
  remitterBankBranchCode: '',
  remitterBankBranchName: '',
  remitterName: '',
  trustorName: '',
  trustorPhone: '',
})

export const createDefaultMerchantBookingNotification = () => ({
  "customerCreateBooking": {
    "customer": false,
    "designer": false,
    "merchant": false
  },
  "customerCancelBooking": {
    "customer": false,
    "designer": false,
    "merchant": false
  },
  "designerCreateBooking": {
    "customer": false,
    "designer": false,
    "merchant": false
  },
  "designerCancelBooking": {
    "customer": false,
    "designer": false,
    "merchant": false
  },
  "bookingUpdated": {
    "customer": false,
    "designer": false,
    "merchant": false
  }
})

export const createDefaultBookingLineNotify = () => ({
  "cusCreateBooking": {
    "customer": [],
    "designer": [],
    "merchant": []
  },
  "cusCancelBooking": {
    "customer": [],
    "designer": [],
    "merchant": []
  },
  "designerCreateBooking": {
    "customer": [],
    "designer": [],
    "merchant": []
  },
  "designerCancelBooking": {
    "customer": [],
    "designer": [],
    "merchant": []
  },
  "bookingUpdated": {
    "customer": [],
    "designer": [],
    "merchant": []
  }
})

export const createDefaultAboutReport = () => ({
  isPriceDisplayOnDailyReport: false,
  isOptimizationPrintModeOn: false,
  isServiceNameDisplayByCategory: false,
  isDisplayHelperRetrieveInDailyReport: false,
  isZeroValueHiddenOnDailyReport: false,
  isHelperPointPriceDisplay: false,
  isUsingMathRoundInDesignerDailyReport: false,
  isNoCashWalletGroupedInMDR: false,
  designerNameForReportType: 'NAME',
  isDesignerSalaryDisplayOnBalanceReport: false,
  isCustomerDataMarked: false,
  isMonthlyAverageDisplayForDesignerLeaderBoard: false,
  isMonthlyAverageDisplayForMerchantLeaderBoard: false,
  isProductCostDisplay: false,
  isServiceTicketMerged: false,
  isOpenDateRangeInOrderMangement: false,
  isDisplayTogglePerformanceButton: false,
  CARPTDisplay: false,
  isDRROCDisplay: false,
  isDRRPEVDisplay: false,
  isEDCIFilterDisplay: false,
  isMultiStoreStaffPerfMergedHL: false,
  isMultiStoreStaffPerfMergedDL: false,
  multiStorePerfRef: 'EACH',
  isTSNoOT: false,
  nonCashDisplay: false
})

export const createDefaultCheckoutAndSalaryItem = () => ({
  isSalaryItemAutoSetWhileMonthlyCheckout: false,
  isHelperRetrieveAutoSetForMonthlyCheckout: false,
  isDisplayFakePerformanceInSalaryReport: false,
  isBorrowDisplayInSalaryOverview: false,
  isPrintDetailDisplayOnSalaryReport: true,
  isEPWDDisplay: true,
  isPayslipOptimizationPrintModeOn: false,
  employeePayslipPrintStyle: 'SMALL',
  isAttendanceStatisticsDisplayOnUserSalary: false,
  isPrintDateHiddenForPayslip: false,
})

export const createDefaultHairCondition = () => ({
  "hairProperties": [],
  "scalpProperties": [],
  "permAppliance": [],
  "permPotion": [],
  "hairColorCategory": [],
  "hairColor": []
})

export const createDefaultOrderCreateSetting = () => ({
  isHelperDesignationDisplay: false,
  isThirdPartTicketDisplay: false,
  isDateLockDisplay: false,
  isDetailBottomed: false,
  orderWithoutCustomerDefault: false,
  isQuickOrderModeOn: false,
  isAbleToChangeDateTimeInOrderCreate: false,
  isAutoSetPreferDesigner: false,
  isTicketSellSubItem: false,
  printFormat: 'A4',
  designerNameDisplayOnInvoice: 'NAME',
  isServiceLocked: 'FALSE',
  isProductLocked: 'FALSE',
  isTicketLocked: 'FALSE',
  designationSettingForOrderCreate: '',
  isServiceBindedThirdPartTicketLocked: false,
  isPrintWindowClosureDelayed: false,
  isOrderSerialNumberUsing: false,
  isLBCusDisplay: true,
  isCusWalletUsageForOrder: true,
  logoDisplayOnInvoice: {
    isDisplay: false,
    imageUrl: null
  },
  messageDisplayOnInvoice: {
    isDisplay: false,
    message: null
  },
  qrcodeDisplayOnInvoice: {
    isDisplay: false,
    url: null,
    imageUrl: null
  },
})

export const createDefaultAboutSettingFunction = () => ({
  isMemberShipCardActive: false,
  isCustomerBonusActive: false,
  isComboUsing: false,
  isAutoClearAddedTimeInScheduleTable: false,
  isMerchantScheduleDisplay: false,
  isPriceDisplayOnCustomerSide: false,
  isDailyCheckoutBlockedByDraftOrder: false,
  isEmployeeScheduleWorkingHourDisplay: true,
  isReportListExtended: true,
  isEmployeeScheduleUndoActive: true,
  isCustomerSelfCreateActive: false,
  isBookingTimeNoLimit: false,
  designerNameForCustomerSide: "BOTH",
  actionsBannedAfterDailyCheckout: [],
  isBonusConversion: false,
  bonusConversionRate: 0,
  isWalletFinNonNeg: false,
  isBonusRewardWithLine: false,
  isUnlimProdEmpPrice: false,
  disablePendingOrder: false,
  openingTimeForDisplay: {
    openingHoursForDisplay: "00:00:00",
    closingHoursForDisplay: "00:00:00",
  },
  bonusRewardRule: {
    isUsing: false,
    rule: {
      price: 0,
      bonus: 0,
      mode: 'ROUNDING',
    }
  }
})

export const createDefaultAboutBooking = () => ({
  "nonDesignationOrderLimit": 0,
  "designationOrderLimit": 0,
  "isBookingAutoAccept": false,
  "isNDBNeedVerify": false,
  "isCustomerBookedableInSameDay": false,
  "isRTCUsing": false,
  "isBookingRemarkDisplay": false,
  "isCusBookingRemarkDisplay": true,
  "isBirthdayIconDisplay": false,
  "bookingLimitPerCellphoneInSameDay": null,
  "disableBookingDayLimit": null,
  "createBookingDayLimit": null,
  "cancelBookingDayLimitByActionDate": null,
  "cancelBookingDayLimitByServiceDate": null,
  "bookingTimeSetting": {
    openingHours: "10:00:00",
    closingHours: "22:00:00"
  },
  "troubleShooting": '',
  "SMSAccount": {
      "account": '',
      "password": ''
  },
  "bookingNotificationPhone": [''],
  "bookingNotificationLine": {
      "isUsing": false,
      "notifyDayCount": 0
  },
  "inviteRatingDayCount": null,
  "cusRatingDayLimit": null,
  isBookingHistoryDisplay: false,
  isDynamicBookingLimitUsing: false,
  cusMaxBookingCount: null,
  isNDBInLimitCount: false
})

export const createDefaultAboutCustomer = () => ({
  "customerSidePageDisplay": {
    "ServiceRecord": false,
    "TicketRecord": true,
    "WalletRecord": false,
    "BonusRecord": true,
    "CustomerMall": false
  },
  "isCustomerProfileSync": false,
  "isArrowDisplayForLine": false,
  "isNRCDisplayForNewCus": false,
  "requiredColumnForNewCustomer": [],
  "isRemarkRequired": true,
  "isCusBookingPreferDesOnly": false,
  "isCusNonDesBookingUsing": true,
  "isBookingItemRequired": false,
  "closeCustomerBooking": false,
  "isBookingPeerDisplay": true,
  "isBookingItemPriceDisplay": true,
  bookingMinumnTimeCost: 0
})

export const createDefaultCheckinSettings = () => ({
  isBookingCheckinEnabled: false,
  isDoneBookingAutoNotify: false,
  isUnDoneBookingAutoNotify: false,
  isUnDoneBookingManualNotify: false,
})
