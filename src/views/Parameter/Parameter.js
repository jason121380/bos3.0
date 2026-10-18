import { Tab, Tabs } from '@mui/material'
import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import useFetchMerchantSalaryIncreaseItems from 'hooks/useFetchMerchantSalaryIncreaseItems'
import useFetchMerchantSalaryDecreaseItems from 'hooks/useFetchMerchantSalaryDecreaseItems'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchMerchantFakePerformanceRefer from 'hooks/useFetchGetMerchantFakePerformanceReference'
import useFetchSettingDeductionItems from 'hooks/useFetchSettingDeductionItems'
import useFetchSettingMerchantSalaryIncreaseItem from 'hooks/useFetchSettingMerchantSalaryIncreaseItem'
import useFetchSettingMerchantSalaryDecreaseItem from 'hooks/useFetchSettingMerchantSalaryDecreaseItem'
import useFetchSetMerchantPassword from 'hooks/useFetchSettingMerchantPassword'
import useFetchSettingMerchantFakePerformanceRefer from 'hooks/useFetchSettingMerchantFakePerformanceReference'
import useFetchMerchantBankSettings from 'hooks/useFetchMerchantBankSettings'
import useFetchSettingMerchantBankSettings from 'hooks/useFetchSettingMerchantBankSettings'
import useFetchSetLockDateSettings from 'hooks/useFetchSetLockDateSettings'
import useFetchGetIsLockDateSetting from 'hooks/useFetchGetIsLockDateSetting'
import useFetchGetMerchantClockInSetting from 'hooks/useFetchGetMerchantClockInSetting'
import useFetchsSetMerchantClockInSetting from 'hooks/useFetchsSetMerchantClockInSetting'
import useFetchGetIsDisplayNonBankAccountInBankTransferReport from 'hooks/useFetchGetIsDisplayNonBankAccountInBankTransferReport'
import useFetchSetIsDisplayNonBankAccountInBankTransferReport from 'hooks/useFetchSetIsDisplayNonBankAccountInBankTransferReport'
import useFetchGetMerchantBookingNotificationSetting from 'hooks/useFetchGetMerchantBookingNotificationSetting'
import useFetchSetMerchantBookingNotificationSetting from 'hooks/useFetchSetMerchantBookingNotificationSetting'
import useFetchGetBookingLineNotifySettings from 'hooks/useFetchGetBookingLineNotifySettings'
import useFetchSetBookingLineNotifySettings from 'hooks/useFetchSetBookingLineNotifySettings'
import useFetchSetOrderDetailMerchantLogo from 'hooks/useFetchSetOrderDetailMerchantLogo'
import useFetchGetParameterReportSetting from 'hooks/useFetchGetParameterReportSetting'
import useFetchSetParameterReportSetting from 'hooks/useFetchSetParameterReportSetting'
import useFetchGetParameterCheckoutAndSalaryItemsSetting from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'
import useFetchSetParameterCheckoutAndSalaryItemsSetting from 'hooks/useFetchSetParameterCheckoutAndSalaryItemsSetting'
import useFetchGetMerchantExternalLink from 'hooks/useFetchGetMerchantExternalLink'
import useFetchGetMerchantReservationTime from 'hooks/useFetchGetMerchantReservationTime'
import useFetchSetMerchantReservationTime from 'hooks/useFetchSetMerchantReservationTime'
import useFetchGetMerchantHairCondition from 'hooks/useFetchGetMerchantHairCondition'
import useFetchSetMerchantHairCondition from 'hooks/useFetchSetMerchantHairCondition'
import useFetchGetLineConnectedUser from 'hooks/useFetchGetLineConnectedUser'
import useFetchGetNonDesignateBookingRecipients from 'hooks/useFetchGetNonDesignateBookingRecipients'
import useFetchSetNonDesignateBookingRecipients from 'hooks/useFetchSetNonDesignateBookingRecipients'
import useFetchGetParameterOrderCreateSetting from 'hooks/useFetchGetParameterOrderCreateSetting'
import useFetchSetParameterOrderCreateSetting from 'hooks/useFetchSetParameterOrderCreateSetting'
import useFetchGetMerchantCusExternalLink from 'hooks/useFetchGetMerchantCusExternalLink'
import useFetchGetParameterAboutSettingFunction from 'hooks/useFetchGetParameterAboutSettingFunction'
import useFetchSetParameterAboutSettingFunction from 'hooks/useFetchSetParameterAboutSettingFunction'
import useFetchGetCustomerReference from 'hooks/useFetchGetCustomerReference'
import useFetchSetCustomerReference from 'hooks/useFetchSetCustomerReference'
import useFetchGetMerchantAvatar from 'hooks/useFetchGetMerchantAvatar'
import useFetchSetMerchantAvatar from 'hooks/useFetchSetMerchantAvatar'
import useFetchGetMerchantRakeReference from 'hooks/useFetchGetMerchantRakeReference'
import useFetchSetMerchantRakeReference from 'hooks/useFetchSetMerchantRakeReference'
import useFetchGetParameterAboutBookingSetting from 'hooks/useFetchGetParameterAboutBookingSetting'
import useFetchSetParameterAboutBookingSetting from 'hooks/useFetchSetParameterAboutBookingSetting'
import useFetchGetParameterAboutCustomerSetting from 'hooks/useFetchGetParameterAboutCustomerSetting'
import useFetchSetParameterAboutCustomerSetting from 'hooks/useFetchSetParameterAboutCustomerSetting'
import useFetchGetSpecificBookingNotificationDayCount from 'hooks/useFetchGetSpecificBookingNotificationDayCount'
import useFetchSetSpecificBookingNotificationDayCount from 'hooks/useFetchSetSpecificBookingNotificationDayCount'
import useFetchGetDisableBookingDayLimit from 'hooks/useFetchGetDisableBookingDayLimit'
import useFetchSetDisableBookingDayLimit from 'hooks/useFetchSetDisableBookingDayLimit'
import useFetchGetMerchantCheckinSettings from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchSetMerchantCheckinSettings from 'hooks/useFetchSetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import useFetchSetIsBookingCusCheckUsing from 'hooks/useFetchSetIsBookingCusCheckUsing'
import useFetchGetBookingTypeForSocket from 'hooks/useFetchGetBookingTypeForSocket'
import useFetchSetBookingTypeForSocket from 'hooks/useFetchSetBookingTypeForSocket'
import useFetchGetUESUsingSetting from 'hooks/useFetchGetUESUsingSetting'
import useFetchSetUESUsingSetting from 'hooks/useFetchSetUESUsingSetting'
import useFetchGetIsCBRDStylist from 'hooks/useFetchGetIsCBRDStylist'
import useFetchSetIsCBRDStylist from 'hooks/useFetchSetIsCBRDStylist'

import AboutSalaryAddAndDeduction from './AboutSalaryAddAndDeduction'
import NonDesignationBookingLimitSetting from './NonDesignationBookingLimitSetting'
import PasswordSetting from './PasswordSetting'
import AboutMerchantFakePerformanceReference from './AboutMerchantFakePerformanceReference'
import AboutMerchantRakePerformanceRefer from './AboutMerchantRakePerformanceRefer'
import AboutPriceDisplayOnDailyReport from './AboutPriceDisplayOnDailyReport'
import AboutMonthCheckoutAddSalaryItems from './AboutMonthCheckoutAddSalaryItems'
import AboutMerchantBankSettings from './AboutMerchantBankSettings'
import IsReservationNeedReview from './IsReservationNeedReview'
import AboutOrderCreate from './AboutOrderCreate'
import AboutOrderDetail from './AboutOrderDetail'
import AboutOtherReport from './AboutOtherReport'
import AboutSettingFunction from './AboutSettingFunction'
import AboutEmployeeSchedule from './AboutEmployeeSchedule'
import BookingNotificationSetting from './BookingNotificationSetting'
import AboutCustomerSideSetting from './AboutCustomerSideSetting'
import AboutCustomerBooking from './AboutCustomerBooking'
import AboutDesignerSideExternalLink from './AboutDesignerSideExternalLink'
import MerchantReservationTimes from './MerchantReservationTimes'
import AboutCustomerTracking from './AboutCustomerTracking'
import AboutCustomerSideExternalLink from './AboutCustomerSideExternalLink.js'
import AboutCustomerSettingFunction from './AboutCustomerSettingFunction.js'
import AboutOrderSource from './AboutOrderSource.js'
import BookingNotificationLineAtSetting from './BookingNotificationLineAtSetting.js'
import BookingCheckInNotificationSetting from './BookingCheckInNotificationSetting.js'
import AttendanceEmployeeScheduleSetting from './AttendanceEmployeeScheduleSetting.js'
import ReservationSettingForStylist from './ReservationSettingForStylist.js'

import produce from 'immer'
import idx from 'idx'
import { memo, useState, useEffect, Fragment } from 'react'
import _ from 'lodash'

const requiredColumnOptions = [
  { label: '暱稱', value: 'NICKNAME' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Line ID', value: 'LINEID' },
  { label: '生日', value: 'BIRTHDAY' },
  { label: '地址', value: 'ADDRESS' },
]

function Parameter() {
  const merchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const [inputEnable, setInputEnable] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [service, setService] = useState({
    deductionItems: [{ name: '' }],
    salaryIncreaseItem: [{ itemSetting: '', sorting: 1 }],
    salaryDecreaseItem: [{ itemSetting: '', sorting: 1 }]
  })
  const [passwordSetting, setPasswordSetting] = useState({
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
  const [merchantBankSettings, setMerchantBankSettings] = useState({
    remitterBankName: '',
    remitterBankAccount: '',
    remitterBankBranchCode: '',
    remitterBankBranchName: '',
    remitterName: '',
    trustorName: '',
    trustorPhone: '',
  })

  // value
  const [merchantFakePerformanceRefer, setMerchantFakePerformanceRefer] = useState('PERFORMANCE')
  const [isLockDate, setIsLockDate] = useState(false)
  const [isMerchantClockInSetting, setIsMerchantClockInSetting] = useState([])
  const [displayNonBankAccountInBankTransferReport, setDisplayNonBankAccountInBankTransferReport] = useState(false)
  const [merchantBookingNotification, setMerchantBookingNotification] = useState(
    {
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
    }
  )

  const [BookingLineNotify, setBookingLineNotify] = useState(
    {
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
    }
  )
  const [aboutReport, setAboutReport] = useState({
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
  const [checkoutAndSalaryItem, setCheckoutAndSalaryItem] = useState({
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
  const [externalLink, setExternalLink] = useState([])
  const [merchantReservation, setMerchantReservation] = useState(true)
  const [hairCondition, setHairCondition] = useState({
    "hairProperties": [],
    "scalpProperties": [],
    "permAppliance": [],
    "permPotion": [],
    "hairColorCategory": [],
    "hairColor": []
  })
  const [NDBRecipients, setNDBRecipients] = useState([])
  const [orderCreateSetting, setOrderCreateSetting] = useState({
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
  const [cusExternalLink, setCusExternalLink] = useState([])
  const [aboutSettingFunction, setAboutSettingFunction] = useState({
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
    isBookingTimeNoLimit: false,
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
  const [reference, setReference] = useState([])
  const [merchantLogo, setMerchantLogo] = useState(null)
  const [merchantRakeReferemce, setMerchantRakeReferemce] = useState({
    designate: 'FAKE',
    nonDesignate: 'FAKE',
  })
  const [aboutBooking, setAboutBooking] = useState({
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
  const [aboutCustomer, setAboutCustomer] = useState({
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
  const [notificationDayCount, setNotificationDayCount] = useState(false)
  const [disableDayLimit, setDisableDayLimit] = useState(null)
  const [checkinSettings, setCheckinSettings] = useState({
    isBookingCheckinEnabled: false,
    isDoneBookingAutoNotify: false,
    isUnDoneBookingAutoNotify: false,
    isUnDoneBookingManualNotify: false,
  })
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [bookingTypeForSocket, setBookingTypeForSocket] = useState([])
  const [UESUsing, setUESUsing] = useState(false)
  const [CBRDStylist, setCBRDStylist] = useState(false)

  // const [teachingModeDisplay, setTeachingModeDisplay] = useState(false)

  // Get
  const merchantDeductionItems = useFetchMerchantDeductionItems()
  const merchantSalaryIncreaseItems = useFetchMerchantSalaryIncreaseItems()
  const merchantSalaryDecreaseItems = useFetchMerchantSalaryDecreaseItems()
  const merchantPassword = useFetchMerchantPassword()
  const merchantFakePerformanceReferData = useFetchMerchantFakePerformanceRefer()
  const merchantBankSettingsData = useFetchMerchantBankSettings()
  const merchantIsLockDateSettingData = useFetchGetIsLockDateSetting()
  const merchantClockInSettingData = useFetchGetMerchantClockInSetting()
  const isDisplayNonBankAccountInBankTransferReport = useFetchGetIsDisplayNonBankAccountInBankTransferReport()
  const merchantBookingNotificationSetting = useFetchGetMerchantBookingNotificationSetting()
  const bookingLineNotifySettings = useFetchGetBookingLineNotifySettings()
  const getParameterReportSetting = useFetchGetParameterReportSetting()
  const getParameterCheckoutAndSalaryItemsSetting = useFetchGetParameterCheckoutAndSalaryItemsSetting()
  const getMerchantExternalLink = useFetchGetMerchantExternalLink()
  const getMerchantReservationTime = useFetchGetMerchantReservationTime()
  const getMerchantHairCondition = useFetchGetMerchantHairCondition()
  const lineConnectedUser = useFetchGetLineConnectedUser()
  const nonDesignateBookingRecipients = useFetchGetNonDesignateBookingRecipients()
  const getParameterOrderCreateSetting = useFetchGetParameterOrderCreateSetting()
  const getMerchantCusExternalLink = useFetchGetMerchantCusExternalLink()
  const getParameterAboutSettingFunction = useFetchGetParameterAboutSettingFunction()
  const getCustomerReference = useFetchGetCustomerReference()
  const getMerchantAvatar = useFetchGetMerchantAvatar({input: merchantId})
  const getMerchantRakeReference = useFetchGetMerchantRakeReference()
  const getParameterAboutBookingSetting = useFetchGetParameterAboutBookingSetting()
  const getParameterAboutCustomerSetting = useFetchGetParameterAboutCustomerSetting()
  const getSpecificBookingNotificationDayCount = useFetchGetSpecificBookingNotificationDayCount()
  const getDisableBookingDayLimit = useFetchGetDisableBookingDayLimit()
  const getMerchantCheckinSettings = useFetchGetMerchantCheckinSettings()
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const getBookingTypeForSocket = useFetchGetBookingTypeForSocket()
  const getUESUsingSetting = useFetchGetUESUsingSetting()
  const getIsCBRDStylist = useFetchGetIsCBRDStylist()

  // const merchantTeachingModeSettingData = useFetchMerchantTeachingModeSetting()

  // Set
  const { setDeductionitems } = useFetchSettingDeductionItems()
  const { setSalaryIncreaseItem } = useFetchSettingMerchantSalaryIncreaseItem()
  const { setSalaryDecreaseItem } = useFetchSettingMerchantSalaryDecreaseItem()
  const { setMerchantPassword } = useFetchSetMerchantPassword()
  const { settingMerchantFakePerformanceRefer } = useFetchSettingMerchantFakePerformanceRefer()
  const { setMerchantBankSetting } = useFetchSettingMerchantBankSettings()
  const { setLockDate } = useFetchSetLockDateSettings()
  const { setMerchantClockInSetting } = useFetchsSetMerchantClockInSetting()
  const { setIsDisplayNonBankAccountInBankTransferReport } = useFetchSetIsDisplayNonBankAccountInBankTransferReport()
  const { setMerchantBookingNotificationSetting } = useFetchSetMerchantBookingNotificationSetting()
  const { setBookingLineNotifySettings } = useFetchSetBookingLineNotifySettings()
  const { uploadMerchantLogo } = useFetchSetOrderDetailMerchantLogo()
  const { setParameterReportSetting } = useFetchSetParameterReportSetting()
  const { setCheckoutAndSalaryItems } = useFetchSetParameterCheckoutAndSalaryItemsSetting()
  const { setMerchantReservationTime } = useFetchSetMerchantReservationTime()
  const { setMerchantHairCondition } = useFetchSetMerchantHairCondition()
  const { setBookingRecipients } = useFetchSetNonDesignateBookingRecipients()
  const { setParameterOrderCreateSetting } = useFetchSetParameterOrderCreateSetting()
  const { setParameterAboutSetting } = useFetchSetParameterAboutSettingFunction()
  const { setCustomerReference } = useFetchSetCustomerReference()
  const { setMerchantAvatar } = useFetchSetMerchantAvatar()
  const { setRakeReference } = useFetchSetMerchantRakeReference()
  const { setParameterAboutBookingSetting } = useFetchSetParameterAboutBookingSetting()
  const { setParameterAboutCustomerSetting } = useFetchSetParameterAboutCustomerSetting()
  const { setSpecificBookingNotificationDayCount } = useFetchSetSpecificBookingNotificationDayCount()
  const { setDisableBookingDayLimit } = useFetchSetDisableBookingDayLimit()
  const { setMerchantCheckin } = useFetchSetMerchantCheckinSettings()
  const { setIsBookingCusCheckUsing } = useFetchSetIsBookingCusCheckUsing()
  const { setTypeForSocket } = useFetchSetBookingTypeForSocket()
  const { setUESUsingSetting } = useFetchSetUESUsingSetting()
  const { setCBRDStylistData } = useFetchSetIsCBRDStylist()

  // const { setMerchantTeachingModeSettings } = useFetchSetMerchantTeachingModeSettings()

  // loading value
  useEffect(() => {
    if (!merchantIsLockDateSettingData.loading) {
      const isLockDate = idx(merchantIsLockDateSettingData, _ => _.data.getIsDateLock)
      setIsLockDate(isLockDate)
    }
  }, [merchantIsLockDateSettingData.loading])
  useEffect(() => {
    if (!merchantBankSettingsData.loading) {
      const merchantBankSettings = idx(
        merchantBankSettingsData,
        _ => _.data.getMerchantBankSettings
      )
      setMerchantBankSettings(merchantBankSettings)
    }
  }, [merchantBankSettingsData.loading])
  useEffect(() => {
    if (!merchantFakePerformanceReferData.loading) {
      const merchantFakePerformanceRefer = idx(
        merchantFakePerformanceReferData,
        _ => _.data.getMerchantFakePerformanceReference
      )
      setMerchantFakePerformanceRefer(merchantFakePerformanceRefer)
    }
  }, [merchantFakePerformanceReferData.loading])
  useEffect(() => {
    if (
      !merchantDeductionItems.loading &&
      !merchantSalaryIncreaseItems.loading &&
      !merchantSalaryDecreaseItems.loading
    ) {
      const deductionItems = idx(merchantDeductionItems.data, _ =>
        _.merchantDeductionItems.length > 0
          ? _.merchantDeductionItems.map(d => ({ name: d.name }))
          : [{ name: '' }]
      )
      const salaryIncreaseItem = idx(merchantSalaryIncreaseItems.data, _ =>
        _.getMerchantSalaryIncreaseItems.length > 0
          ? _.getMerchantSalaryIncreaseItems.map(d => d).sort((a, b) => a.sorting - b.sorting)
          : [{ itemSetting: '', sorting: 1 }]
      )
      const salaryDecreaseItem = idx(merchantSalaryDecreaseItems.data, _ =>
        _.getMerchantSalaryDecreaseItems.length > 0
          ? _.getMerchantSalaryDecreaseItems.map(d => d).sort((a, b) => a.sorting - b.sorting)
          : [{ itemSetting: '', sorting: 1 }]
      )

      setService({
        deductionItems,
        salaryIncreaseItem,
        salaryDecreaseItem
      })
    }
  }, [
    merchantDeductionItems.loading,
    merchantSalaryIncreaseItems.loading,
    merchantSalaryDecreaseItems.loading
  ])
  useEffect(() => {
    if (!merchantPassword.loading) {
      const merchantPasswordData = idx(merchantPassword, _ => _.data.merchantPassword)
      setPasswordSetting(merchantPasswordData)
    }
  }, [merchantPassword.loading])
  useEffect(() => {
    if (!merchantClockInSettingData.loading) {
      const getMerchantClockInSetting = idx(
        merchantClockInSettingData,
        _ => _.data.getMerchantClockInSetting
      )
      setIsMerchantClockInSetting(getMerchantClockInSetting)
    }
  }, [merchantClockInSettingData.loading])
  useEffect(() => {
    if (!isDisplayNonBankAccountInBankTransferReport.loading) {
      const isDisplayNonBankAccountInBankTransferReportData = idx(
        isDisplayNonBankAccountInBankTransferReport, _ => _.data.getIsDisplayNonBankAccountInBankTransferReport)
      setDisplayNonBankAccountInBankTransferReport(isDisplayNonBankAccountInBankTransferReportData)
    }
  }, [isDisplayNonBankAccountInBankTransferReport.loading])
  useEffect(() => {
    if (!merchantBookingNotificationSetting.loading) {
      const data = idx(merchantBookingNotificationSetting, _ => _.data.getMerchantBookingNotificationSetting)
      setMerchantBookingNotification(data)
    }
  }, [merchantBookingNotificationSetting.loading])
  useEffect(() => {
    if (!bookingLineNotifySettings.loading) {
      const data = idx(bookingLineNotifySettings, _ => _.data.getBookingLineNotifySettings)
      setBookingLineNotify(data)
    }
  }, [bookingLineNotifySettings.loading])
  useEffect(() => {
    if (!getParameterReportSetting.loading) {
      const data = idx(getParameterReportSetting, _ => _.data.getParameterReportSetting)
      setAboutReport(data)
    }
  }, [getParameterReportSetting.loading])
  useEffect(() => {
    if (!getParameterCheckoutAndSalaryItemsSetting.loading) {
      const data = idx(getParameterCheckoutAndSalaryItemsSetting, _ => _.data.getParameterCheckoutAndSalaryItemsSetting)
      setCheckoutAndSalaryItem(data)
    }
  }, [getParameterCheckoutAndSalaryItemsSetting.loading])
  useEffect(() => {
    if (!getMerchantExternalLink.loading) {
      const data = idx(getMerchantExternalLink, _ => _.data.merchantExternalLink)
      setExternalLink(data)
    }
  }, [getMerchantExternalLink.loading])
  useEffect(() => {
    if (!getMerchantReservationTime.loading) {
      const data = idx(getMerchantReservationTime, _ => _.data.getMerchantReservationTime)
      setMerchantReservation(data)
    }
  }, [getMerchantReservationTime.loading])
  useEffect(() => {
    if (!getMerchantHairCondition.loading) {
      const data = idx(getMerchantHairCondition, _ => _.data.getMerchantHairCondition)
      setHairCondition(data)
    }
  }, [getMerchantHairCondition.loading])
  useEffect(() => {
    if (!nonDesignateBookingRecipients.loading && !lineConnectedUser.loading) {
      const idArray = idx(nonDesignateBookingRecipients, _ => _.data.nonDesignateBookingRecipients).map(d => d.id)
      const lineConnectedIds = idx(lineConnectedUser, _ => _.data.getLineConnectedUser)
      const select = lineConnectedIds.filter(d => idArray.includes(d.id))
      setNDBRecipients(select)
    }
  }, [nonDesignateBookingRecipients.loading, lineConnectedUser.loading])
  useEffect(() => {
    if(!getParameterOrderCreateSetting.loading){
      const data = idx(getParameterOrderCreateSetting,_=>_.data.getParameterOrderCreateSetting)
      setOrderCreateSetting(data)
    }
  }, [getParameterOrderCreateSetting.loading])
  useEffect(() => {
    if(!getMerchantCusExternalLink.loading){
      const data = idx(getMerchantCusExternalLink,_=>_.data.merchantCusExternalLink)
      setCusExternalLink(data)
    }
  }, [getMerchantCusExternalLink.loading])
  useEffect(() => {
    if(!getParameterAboutSettingFunction.loading){
      const data = idx(getParameterAboutSettingFunction,_=>_.data.getParameterAboutSettingFunction)
      setAboutSettingFunction(data)
    }
  }, [getParameterAboutSettingFunction.loading])
  useEffect(() => {
    if (!getCustomerReference.loading) {
      const data = idx(getCustomerReference,_=>_.data.getCustomerReference)
      setReference(data)
    }
  }, [getCustomerReference.loading])
  useEffect(() => {
    if (!getMerchantAvatar.loading) {
      const data = idx(getMerchantAvatar,_=>_.data.getMerchantAvatar)
      setMerchantLogo(data)
    }
  }, [getMerchantAvatar.loading])
  useEffect(() => {
    if (!getMerchantRakeReference.loading) {
      const data = idx(getMerchantRakeReference,_=>_.data.getMerchantRakeReference)
      setMerchantRakeReferemce(data)
    }
  }, [getMerchantRakeReference.loading])
  useEffect(() => {
    if (!getParameterAboutBookingSetting.loading) {
      const data = idx(getParameterAboutBookingSetting,_=>_.data.getParameterAboutBookingSetting)
      const { bookingNotificationPhone } = data
      if (bookingNotificationPhone.length === 0) {
        data.bookingNotificationPhone = ['']
      }
      setAboutBooking(data)
    }
  }, [getParameterAboutBookingSetting.loading])
  useEffect(() => {
    if (!getParameterAboutCustomerSetting.loading) {
      const data = idx(getParameterAboutCustomerSetting,_=>_.data.getParameterAboutCustomerSetting)
      data.requiredColumnForNewCustomer = requiredColumnOptions.filter(d => data.requiredColumnForNewCustomer.includes(d.value))
      setAboutCustomer(data)
    }
  }, [getParameterAboutCustomerSetting.loading])
  useEffect(() => {
    if (!getSpecificBookingNotificationDayCount.loading) {
      const data = idx(getSpecificBookingNotificationDayCount,_=>_.data.getSpecificBookingNotificationDayCount)
      setNotificationDayCount(data)
    }
  }, [getSpecificBookingNotificationDayCount.loading])
  useEffect(() => {
    if (!getDisableBookingDayLimit.loading) {
      const data = idx(getDisableBookingDayLimit,_=>_.data.getDisableBookingDayLimit)
      setDisableDayLimit(data)
    }
  }, [getDisableBookingDayLimit.loading])
  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      const data = idx(getMerchantCheckinSettings,_=>_.data.getMerchantCheckinSettings)
      setCheckinSettings(data)
    }
  }, [getMerchantCheckinSettings.loading])
  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing,_=>_.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  }, [getIsBookingCusCheckUsing.loading])
  useEffect(() => {
    if (!getBookingTypeForSocket.loading) {
      const data = idx(getBookingTypeForSocket,_=>_.data.getBookingTypeForSocket)
      setBookingTypeForSocket(data)
    }
  }, [getBookingTypeForSocket.loading])
  useEffect(() => {
    if (!getUESUsingSetting.loading) {
      const data = idx(getUESUsingSetting,_=>_.data.getUESUsingSetting)
      setUESUsing(data)
    }
  }, [getUESUsingSetting.loading])
  useEffect(() => {
    if (!getIsCBRDStylist.loading) {
      const data = idx(getIsCBRDStylist,_=>_.data.getIsCBRDStylist)
      setCBRDStylist(data)
    }
  }, [getIsCBRDStylist.loading])

    //  判斷頁面資料是否都讀取完成的
  useEffect(() => {
    setInputEnable(
      !isClick &&
      !merchantDeductionItems.loading &&
      !merchantSalaryIncreaseItems.loading &&
      !merchantSalaryDecreaseItems.loading &&
      !merchantPassword.loading &&
      !merchantFakePerformanceReferData.loading &&
      !merchantBankSettingsData.loading &&
      !merchantIsLockDateSettingData.loading &&
      !merchantClockInSettingData.loading &&
      !isDisplayNonBankAccountInBankTransferReport.loading &&
      !merchantBookingNotificationSetting.loading &&
      !bookingLineNotifySettings.loading &&
      !getParameterReportSetting.loading &&
      !getParameterCheckoutAndSalaryItemsSetting.loading &&
      !getMerchantExternalLink.loading &&
      !getMerchantReservationTime.loading &&
      !getMerchantHairCondition.loading &&
      !lineConnectedUser.loading &&
      !nonDesignateBookingRecipients.loading &&
      !getParameterOrderCreateSetting.loading &&
      !getMerchantCusExternalLink.loading &&
      !getParameterAboutSettingFunction.loading &&
      !getCustomerReference.loading &&
      !getMerchantAvatar.loading &&
      !getMerchantRakeReference.loading &&
      !getParameterAboutBookingSetting.loading &&
      !getParameterAboutCustomerSetting.loading &&
      !getSpecificBookingNotificationDayCount.loading &&
      !getDisableBookingDayLimit.loading &&
      !getMerchantCheckinSettings.loading &&
      !getIsBookingCusCheckUsing.loading &&
      !getBookingTypeForSocket.loading &&
      !getUESUsingSetting.loading &&
      !getIsCBRDStylist.loading
    )
  }, [
    isClick,
    merchantDeductionItems.loading,
    merchantSalaryIncreaseItems.loading,
    merchantSalaryDecreaseItems.loading,
    merchantPassword.loading,
    merchantFakePerformanceReferData.loading,
    merchantBankSettingsData.loading,
    merchantIsLockDateSettingData.loading,
    merchantClockInSettingData.loading,
    isDisplayNonBankAccountInBankTransferReport.loading,
    merchantBookingNotificationSetting.loading,
    bookingLineNotifySettings.loading,
    getParameterReportSetting.loading,
    getParameterCheckoutAndSalaryItemsSetting.loading,
    getMerchantExternalLink.loading,
    getMerchantReservationTime.loading,
    getMerchantHairCondition.loading,
    lineConnectedUser.loading,
    nonDesignateBookingRecipients.loading,
    getParameterOrderCreateSetting.loading,
    getMerchantCusExternalLink.loading,
    getParameterAboutSettingFunction.loading,
    getCustomerReference.loading,
    getMerchantAvatar.loading,
    getMerchantRakeReference.loading,
    getParameterAboutBookingSetting.loading,
    getParameterAboutCustomerSetting.loading,
    getSpecificBookingNotificationDayCount.loading,
    getDisableBookingDayLimit.loading,
    getMerchantCheckinSettings.loading,
    getIsBookingCusCheckUsing.loading,
    getBookingTypeForSocket.loading,
    getUESUsingSetting.loading,
    getIsCBRDStylist.loading,
  ])



  // useEffect(() => {
  //   if (!merchantTeachingModeSettingData.loading) {
  //     const teachingModeDisplay = idx(
  //       merchantTeachingModeSettingData,
  //       _ => _.data.getMerchantTeachingModeSetting
  //     )
  //     setTeachingModeDisplay(teachingModeDisplay)
  //   }
  // }, [merchantTeachingModeSettingData.loading])


  // handle onchange or onclick
  const handleServiceChange = ({ changedData, key }) => {
    setService(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleMerchantBankSettings = ({ changedData, key }) => {
    setMerchantBankSettings(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleSubmit = async () => {
    setIsClick(true)
    const newSalaryIncreaseItem = service.salaryIncreaseItem
      .filter(data => data.itemSetting !== '')
      .map(data => {
        return {
          itemSetting: data.itemSetting,
          sorting: data.sorting,
        }
      })
    const newSalaryDecreaseItem = service.salaryDecreaseItem
      .filter(data => data.itemSetting !== '')
      .map(data => {
        return {
          itemSetting: data.itemSetting,
          sorting: data.sorting,
        }
      })
    const newPasswordSetting = _.cloneDeep(passwordSetting)
    delete newPasswordSetting.reCheckoutOrder.__typename
    delete newPasswordSetting.deleteOrder.__typename
    delete newPasswordSetting.restoreCheckout.__typename
    delete newPasswordSetting.__typename
    delete newPasswordSetting.editMoneyFlow.__typename
    
    await Promise.all([
      setDeductionitems({input: service.deductionItems,}),
      setSalaryIncreaseItem({ input: newSalaryIncreaseItem }),
      setSalaryDecreaseItem({ input: newSalaryDecreaseItem }),
      setMerchantPassword({ input: newPasswordSetting }),
      settingMerchantFakePerformanceRefer({ input: merchantFakePerformanceRefer }),
      setMerchantBankSetting({ input: merchantBankSettings }),
      setLockDate({ input: isLockDate }),
      setMerchantClockInSetting({input: isMerchantClockInSetting,}),
      setIsDisplayNonBankAccountInBankTransferReport({input: displayNonBankAccountInBankTransferReport,}),
      setMerchantBookingNotificationSetting({input: merchantBookingNotification}),
      setBookingLineNotifySettings({input: BookingLineNotify}),
      setParameterReportSetting({input: aboutReport}),
      setCheckoutAndSalaryItems({input: checkoutAndSalaryItem}),
      setMerchantReservationTime({input: merchantReservation}),
      setMerchantHairCondition({input: hairCondition}),
      setBookingRecipients({userIds: NDBRecipients.map(d => d.id)}),
      setParameterOrderCreateSetting({input: {
        ...orderCreateSetting,
        logoDisplayOnInvoice: orderCreateSetting.logoDisplayOnInvoice.isDisplay,
        qrcodeDisplayOnInvoice: {
          isDisplay: orderCreateSetting.qrcodeDisplayOnInvoice.isDisplay,
          url: orderCreateSetting.qrcodeDisplayOnInvoice.url
        }
      }}),
      setParameterAboutSetting({input: aboutSettingFunction}),
      setCustomerReference({references: reference}),
      setRakeReference({input: merchantRakeReferemce}),
      setParameterAboutBookingSetting({ input: aboutBooking }),
      setSpecificBookingNotificationDayCount({ input: notificationDayCount }),
      setDisableBookingDayLimit({count: disableDayLimit}),
      setMerchantCheckin({ input: checkinSettings }),
      setParameterAboutCustomerSetting({ input: {
        ...aboutCustomer,
        requiredColumnForNewCustomer: aboutCustomer.requiredColumnForNewCustomer.map(d => d.value)
      } }),
      setIsBookingCusCheckUsing({input: bookingCusCheck}),
      setTypeForSocket({ input: bookingTypeForSocket }),
      setUESUsingSetting({ input: UESUsing }),
      setCBRDStylistData({ input: CBRDStylist }),
    ]).then(() => {
      openSnackbar({ message: '儲存成功!', variant: 'success' })
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
    }).finally(() => setIsClick(false))
  }

  const [selectTab, setSelectTab] = useState('orderCreate')
  const tabs = [
    { value: 'orderCreate', label: '打帳單' },
    { value: 'employeeSchedule', label: '排班及打卡' },
    { value: 'salary', label: '薪資' },
    { value: 'report', label: '報表' },
    { value: 'booking', label: '預約' },
    { value: 'performanceRake', label: '業績依據及抽成' },
    { value: 'password', label: '密碼' },
    { value: 'function', label: '功能設定' },
    { value: 'customerTracking', label: '顧客追蹤' },
    { value: 'customer', label: '顧客端' },
    { value: 'designer', label: '設計師端' },
  ]
  return (
    <Page className="ui-root" title="系統參數設定">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="系統參數設定" />
        <Tabs
          scrollButtons="auto"
          variant="scrollable"
          value={selectTab}
          onChange={(event, value) => setSelectTab(value)}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
        {selectTab === 'orderCreate' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutOrderCreate
              orderCreateSetting={orderCreateSetting}
              setOrderCreateSetting={setOrderCreateSetting}
              inputEnable={inputEnable}
            />
            <AboutOrderDetail
              orderCreateSetting={orderCreateSetting}
              setOrderCreateSetting={setOrderCreateSetting}
              uploadMerchantLogo={uploadMerchantLogo}
              inputEnable={inputEnable}
            />
            <AboutOrderSource
              reference={reference}
              setReference={setReference}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'employeeSchedule' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutEmployeeSchedule
              isMerchantClockInSetting={isMerchantClockInSetting}
              setIsMerchantClockInSetting={setIsMerchantClockInSetting}
              loading={merchantClockInSettingData.loading}
              inputEnable={inputEnable}
            />
            <AttendanceEmployeeScheduleSetting
              UESUsing={UESUsing}
              setUESUsing={setUESUsing}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'salary' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutSalaryAddAndDeduction
              service={service}
              onChange={handleServiceChange}
              inputEnable={inputEnable}
            />
            <AboutMerchantBankSettings
              merchantBankSettings={merchantBankSettings}
              setDisplayNonBankAccountInBankTransferReport={setDisplayNonBankAccountInBankTransferReport}
              displayNonBankAccountInBankTransferReport={displayNonBankAccountInBankTransferReport}
              onChange={handleMerchantBankSettings}
              inputEnable={inputEnable}
            />
            <AboutMonthCheckoutAddSalaryItems
              inputEnable={inputEnable}
              checkoutAndSalaryItem={checkoutAndSalaryItem}
              setCheckoutAndSalaryItem={setCheckoutAndSalaryItem}
            />
          </div>
        )}
        {selectTab === 'report' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutPriceDisplayOnDailyReport
              aboutReport={aboutReport}
              setAboutReport={setAboutReport}
              inputEnable={inputEnable}
            />
            <AboutOtherReport
              inputEnable={inputEnable}
              aboutReport={aboutReport}
              setAboutReport={setAboutReport}
            />
          </div>
        )}
        {selectTab === 'booking' && (
          <div className="mt-6 flex flex-col gap-6">
            <NonDesignationBookingLimitSetting
              aboutBooking={aboutBooking}
              setAboutBooking={setAboutBooking}
              inputEnable={inputEnable}
            />
            <IsReservationNeedReview
              aboutBooking={aboutBooking}
              setAboutBooking={setAboutBooking}
              bookingCusCheck={bookingCusCheck}
              setBookingCusCheck={setBookingCusCheck}
              inputEnable={inputEnable}
            />
            <BookingNotificationSetting
              aboutBooking={aboutBooking}
              setAboutBooking={setAboutBooking}
              merchantBookingNotification={merchantBookingNotification}
              setMerchantBookingNotification={setMerchantBookingNotification}
              inputEnable={inputEnable}
            />
            <BookingNotificationLineAtSetting
              aboutBooking={aboutBooking}
              setAboutBooking={setAboutBooking}
              lineConnectedUser={!lineConnectedUser.loading ? idx(lineConnectedUser, _ => _.data.getLineConnectedUser) : []}
              NDBRecipients={NDBRecipients}
              setNDBRecipients={setNDBRecipients}
              notificationDayCount={notificationDayCount}
              setNotificationDayCount={setNotificationDayCount}
              BookingLineNotify={BookingLineNotify}
              setBookingLineNotify={setBookingLineNotify}
              inputEnable={inputEnable}
            />
            <BookingCheckInNotificationSetting
              checkinSettings={checkinSettings}
              setCheckinSettings={setCheckinSettings}
              bookingTypeForSocket={bookingTypeForSocket}
              setBookingTypeForSocket={setBookingTypeForSocket}
              inputEnable={inputEnable}
            />
            <MerchantReservationTimes
              inputEnable={inputEnable}
              merchantReservation={merchantReservation}
              setMerchantReservation={setMerchantReservation}
            />
          </div>
        )}
        {selectTab === 'performanceRake' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutMerchantFakePerformanceReference
              merchantFakePerformanceRefer={merchantFakePerformanceRefer}
              setMerchantFakePerformanceRefer={setMerchantFakePerformanceRefer}
              inputEnable={inputEnable}
            />
            <AboutMerchantRakePerformanceRefer
              merchantRakeReferemce={merchantRakeReferemce}
              setMerchantRakeReferemce={setMerchantRakeReferemce}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'password' && (
          <div className="mt-6 flex flex-col gap-6">
            <PasswordSetting
              setPasswordSetting={setPasswordSetting}
              passwordSetting={passwordSetting}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'function' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutSettingFunction
              aboutSettingFunction={aboutSettingFunction}
              setAboutSettingFunction={setAboutSettingFunction}
              setMerchantAvatar={setMerchantAvatar}
              merchantLogo={merchantLogo}
              setMerchantLogo={setMerchantLogo}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'customer' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutCustomerSideSetting
              aboutCustomer={aboutCustomer}
              setAboutCustomer={setAboutCustomer}
              inputEnable={inputEnable}
            />
            <AboutCustomerSettingFunction
              aboutCustomer={aboutCustomer}
              setAboutCustomer={setAboutCustomer}
              requiredColumnOptions={requiredColumnOptions}
              inputEnable={inputEnable}
            />
            <AboutCustomerBooking
              aboutCustomer={aboutCustomer}
              setAboutCustomer={setAboutCustomer}
              inputEnable={inputEnable}
            />
            <AboutCustomerSideExternalLink
              cusExternalLink={cusExternalLink}
              refetchLink={getMerchantCusExternalLink.refetch}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'designer' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutDesignerSideExternalLink
              externalLink={externalLink}
              refetchLink={getMerchantExternalLink.refetch}
              inputEnable={inputEnable}
            />
            <ReservationSettingForStylist
              CBRDStylist={CBRDStylist}
              setCBRDStylist={setCBRDStylist}
              inputEnable={inputEnable}
            />
          </div>
        )}
        {selectTab === 'customerTracking' && (
          <div className="mt-6 flex flex-col gap-6">
            <AboutCustomerTracking
              hairCondition={hairCondition}
              setHairCondition={setHairCondition}
              inputEnable={inputEnable}
            />
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!inputEnable}
            data-testid="parameter"
          >
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}
export default memo(Parameter)
