import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { CalendarDays, ChartColumn, CircleDollarSign, Lock, Receipt, SlidersHorizontal, Star, Timer, User, UserCheck, Users } from 'lucide-react'
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

import ParameterTabContent from './ParameterTabContent'
import {
  requiredColumnOptions,
  createDefaultPasswordSetting,
  createDefaultMerchantBankSettings,
  createDefaultMerchantBookingNotification,
  createDefaultBookingLineNotify,
  createDefaultAboutReport,
  createDefaultCheckoutAndSalaryItem,
  createDefaultHairCondition,
  createDefaultOrderCreateSetting,
  createDefaultAboutSettingFunction,
  createDefaultAboutBooking,
  createDefaultAboutCustomer,
  createDefaultCheckinSettings,
} from './parameterDefaults'

import produce from 'immer'
import idx from 'idx'
import { memo, useState, useEffect, Fragment } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import QueryFailed from 'components/QueryFailed'

// 初始值（parameterDefaults）與各分頁區塊（ParameterTabContent）已拆到同資料夾；查詢、effect、儲存仍在此檔，內容不變

function Parameter() {
  const merchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const [inputEnable, setInputEnable] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [service, setService] = useState({
    deductionItems: [{ name: '' }],
    salaryIncreaseItem: [{ itemSetting: '', sorting: 1 }],
    salaryDecreaseItem: [{ itemSetting: '', sorting: 1 }]
  })
  const [passwordSetting, setPasswordSetting] = useState(createDefaultPasswordSetting())
  const [merchantBankSettings, setMerchantBankSettings] = useState(createDefaultMerchantBankSettings())

  // value
  const [merchantFakePerformanceRefer, setMerchantFakePerformanceRefer] = useState('PERFORMANCE')
  const [isLockDate, setIsLockDate] = useState(false)
  const [isMerchantClockInSetting, setIsMerchantClockInSetting] = useState([])
  const [displayNonBankAccountInBankTransferReport, setDisplayNonBankAccountInBankTransferReport] = useState(false)
  const [merchantBookingNotification, setMerchantBookingNotification] = useState(createDefaultMerchantBookingNotification())

  const [BookingLineNotify, setBookingLineNotify] = useState(createDefaultBookingLineNotify())
  const [aboutReport, setAboutReport] = useState(createDefaultAboutReport())
  const [checkoutAndSalaryItem, setCheckoutAndSalaryItem] = useState(createDefaultCheckoutAndSalaryItem())
  const [externalLink, setExternalLink] = useState([])
  const [merchantReservation, setMerchantReservation] = useState(true)
  const [hairCondition, setHairCondition] = useState(createDefaultHairCondition())
  const [NDBRecipients, setNDBRecipients] = useState([])
  const [orderCreateSetting, setOrderCreateSetting] = useState(createDefaultOrderCreateSetting())
  const [cusExternalLink, setCusExternalLink] = useState([])
  const [aboutSettingFunction, setAboutSettingFunction] = useState(createDefaultAboutSettingFunction())
  const [reference, setReference] = useState([])
  const [merchantLogo, setMerchantLogo] = useState(null)
  const [merchantRakeReferemce, setMerchantRakeReferemce] = useState({
    designate: 'FAKE',
    nonDesignate: 'FAKE',
  })
  const [aboutBooking, setAboutBooking] = useState(createDefaultAboutBooking())
  const [aboutCustomer, setAboutCustomer] = useState(createDefaultAboutCustomer())
  const [notificationDayCount, setNotificationDayCount] = useState(false)
  const [disableDayLimit, setDisableDayLimit] = useState(null)
  const [checkinSettings, setCheckinSettings] = useState(createDefaultCheckinSettings())
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
    if (!merchantIsLockDateSettingData.loading && merchantIsLockDateSettingData.data) {
      const isLockDate = idx(merchantIsLockDateSettingData, _ => _.data.getIsDateLock)
      setIsLockDate(isLockDate)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantIsLockDateSettingData.loading])
  useEffect(() => {
    if (!merchantBankSettingsData.loading && merchantBankSettingsData.data) {
      const merchantBankSettings = idx(
        merchantBankSettingsData,
        _ => _.data.getMerchantBankSettings
      )
      setMerchantBankSettings(merchantBankSettings)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantBankSettingsData.loading])
  useEffect(() => {
    if (!merchantFakePerformanceReferData.loading && merchantFakePerformanceReferData.data) {
      const merchantFakePerformanceRefer = idx(
        merchantFakePerformanceReferData,
        _ => _.data.getMerchantFakePerformanceReference
      )
      setMerchantFakePerformanceRefer(merchantFakePerformanceRefer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantFakePerformanceReferData.loading])
  useEffect(() => {
    if (
      !merchantDeductionItems.loading &&
      !merchantSalaryIncreaseItems.loading &&
      !merchantSalaryDecreaseItems.loading &&
      merchantDeductionItems.data &&
      merchantSalaryIncreaseItems.data &&
      merchantSalaryDecreaseItems.data
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [
    merchantDeductionItems.loading,
    merchantSalaryIncreaseItems.loading,
    merchantSalaryDecreaseItems.loading
  ])
  useEffect(() => {
    if (!merchantPassword.loading && merchantPassword.data) {
      const merchantPasswordData = idx(merchantPassword, _ => _.data.merchantPassword)
      setPasswordSetting(merchantPasswordData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantPassword.loading])
  useEffect(() => {
    if (!merchantClockInSettingData.loading && merchantClockInSettingData.data) {
      const getMerchantClockInSetting = idx(
        merchantClockInSettingData,
        _ => _.data.getMerchantClockInSetting
      )
      setIsMerchantClockInSetting(getMerchantClockInSetting)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantClockInSettingData.loading])
  useEffect(() => {
    if (!isDisplayNonBankAccountInBankTransferReport.loading && isDisplayNonBankAccountInBankTransferReport.data) {
      const isDisplayNonBankAccountInBankTransferReportData = idx(
        isDisplayNonBankAccountInBankTransferReport, _ => _.data.getIsDisplayNonBankAccountInBankTransferReport)
      setDisplayNonBankAccountInBankTransferReport(isDisplayNonBankAccountInBankTransferReportData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isDisplayNonBankAccountInBankTransferReport.loading])
  useEffect(() => {
    if (!merchantBookingNotificationSetting.loading && merchantBookingNotificationSetting.data) {
      const data = idx(merchantBookingNotificationSetting, _ => _.data.getMerchantBookingNotificationSetting)
      setMerchantBookingNotification(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantBookingNotificationSetting.loading])
  useEffect(() => {
    if (!bookingLineNotifySettings.loading && bookingLineNotifySettings.data) {
      const data = idx(bookingLineNotifySettings, _ => _.data.getBookingLineNotifySettings)
      setBookingLineNotify(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [bookingLineNotifySettings.loading])
  useEffect(() => {
    if (!getParameterReportSetting.loading && getParameterReportSetting.data) {
      const data = idx(getParameterReportSetting, _ => _.data.getParameterReportSetting)
      setAboutReport(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterReportSetting.loading])
  useEffect(() => {
    if (!getParameterCheckoutAndSalaryItemsSetting.loading && getParameterCheckoutAndSalaryItemsSetting.data) {
      const data = idx(getParameterCheckoutAndSalaryItemsSetting, _ => _.data.getParameterCheckoutAndSalaryItemsSetting)
      setCheckoutAndSalaryItem(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterCheckoutAndSalaryItemsSetting.loading])
  useEffect(() => {
    if (!getMerchantExternalLink.loading && getMerchantExternalLink.data) {
      const data = idx(getMerchantExternalLink, _ => _.data.merchantExternalLink)
      setExternalLink(data)
    }
    // 連結的新增／編輯／刪除／排序直接送出 mutation 後重抓（refetch 不會改變 loading），清單要跟著重抓的資料更新
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantExternalLink.loading, getMerchantExternalLink.data])
  useEffect(() => {
    if (!getMerchantReservationTime.loading && getMerchantReservationTime.data) {
      const data = idx(getMerchantReservationTime, _ => _.data.getMerchantReservationTime)
      setMerchantReservation(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantReservationTime.loading])
  useEffect(() => {
    if (!getMerchantHairCondition.loading && getMerchantHairCondition.data) {
      const data = idx(getMerchantHairCondition, _ => _.data.getMerchantHairCondition)
      setHairCondition(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantHairCondition.loading])
  useEffect(() => {
    if (!nonDesignateBookingRecipients.loading && !lineConnectedUser.loading && nonDesignateBookingRecipients.data && lineConnectedUser.data) {
      const idArray = idx(nonDesignateBookingRecipients, _ => _.data.nonDesignateBookingRecipients).map(d => d.id)
      const lineConnectedIds = idx(lineConnectedUser, _ => _.data.getLineConnectedUser)
      const select = lineConnectedIds.filter(d => idArray.includes(d.id))
      setNDBRecipients(select)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [nonDesignateBookingRecipients.loading, lineConnectedUser.loading])
  useEffect(() => {
    if (!getParameterOrderCreateSetting.loading && getParameterOrderCreateSetting.data) {
      const data = idx(getParameterOrderCreateSetting,_=>_.data.getParameterOrderCreateSetting)
      setOrderCreateSetting(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterOrderCreateSetting.loading])
  useEffect(() => {
    if (!getMerchantCusExternalLink.loading && getMerchantCusExternalLink.data) {
      const data = idx(getMerchantCusExternalLink,_=>_.data.merchantCusExternalLink)
      setCusExternalLink(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantCusExternalLink.loading, getMerchantCusExternalLink.data])
  useEffect(() => {
    if (!getParameterAboutSettingFunction.loading && getParameterAboutSettingFunction.data) {
      const data = idx(getParameterAboutSettingFunction,_=>_.data.getParameterAboutSettingFunction)
      setAboutSettingFunction(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterAboutSettingFunction.loading])
  useEffect(() => {
    if (!getCustomerReference.loading && getCustomerReference.data) {
      const data = idx(getCustomerReference,_=>_.data.getCustomerReference)
      setReference(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getCustomerReference.loading])
  useEffect(() => {
    if (!getMerchantAvatar.loading && getMerchantAvatar.data) {
      const data = idx(getMerchantAvatar,_=>_.data.getMerchantAvatar)
      setMerchantLogo(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantAvatar.loading])
  useEffect(() => {
    if (!getMerchantRakeReference.loading && getMerchantRakeReference.data) {
      const data = idx(getMerchantRakeReference,_=>_.data.getMerchantRakeReference)
      setMerchantRakeReferemce(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantRakeReference.loading])
  useEffect(() => {
    if (!getParameterAboutBookingSetting.loading && getParameterAboutBookingSetting.data) {
      // 複製再補預設值（查詢結果唯讀）
      const data = cloneDeep(idx(getParameterAboutBookingSetting,_=>_.data.getParameterAboutBookingSetting))
      const { bookingNotificationPhone } = data
      if (bookingNotificationPhone.length === 0) {
        data.bookingNotificationPhone = ['']
      }
      setAboutBooking(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterAboutBookingSetting.loading])
  useEffect(() => {
    if (!getParameterAboutCustomerSetting.loading && getParameterAboutCustomerSetting.data) {
      const data = cloneDeep(idx(getParameterAboutCustomerSetting,_=>_.data.getParameterAboutCustomerSetting))
      data.requiredColumnForNewCustomer = requiredColumnOptions.filter(d => data.requiredColumnForNewCustomer.includes(d.value))
      setAboutCustomer(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getParameterAboutCustomerSetting.loading])
  useEffect(() => {
    if (!getSpecificBookingNotificationDayCount.loading && getSpecificBookingNotificationDayCount.data) {
      const data = idx(getSpecificBookingNotificationDayCount,_=>_.data.getSpecificBookingNotificationDayCount)
      setNotificationDayCount(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getSpecificBookingNotificationDayCount.loading])
  useEffect(() => {
    if (!getDisableBookingDayLimit.loading && getDisableBookingDayLimit.data) {
      const data = idx(getDisableBookingDayLimit,_=>_.data.getDisableBookingDayLimit)
      setDisableDayLimit(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getDisableBookingDayLimit.loading])
  useEffect(() => {
    if (!getMerchantCheckinSettings.loading && getMerchantCheckinSettings.data) {
      const data = idx(getMerchantCheckinSettings,_=>_.data.getMerchantCheckinSettings)
      setCheckinSettings(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantCheckinSettings.loading])
  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading && getIsBookingCusCheckUsing.data) {
      const data = idx(getIsBookingCusCheckUsing,_=>_.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBookingCusCheckUsing.loading])
  useEffect(() => {
    if (!getBookingTypeForSocket.loading && getBookingTypeForSocket.data) {
      const data = idx(getBookingTypeForSocket,_=>_.data.getBookingTypeForSocket)
      setBookingTypeForSocket(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBookingTypeForSocket.loading])
  useEffect(() => {
    if (!getUESUsingSetting.loading && getUESUsingSetting.data) {
      const data = idx(getUESUsingSetting,_=>_.data.getUESUsingSetting)
      setUESUsing(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getUESUsingSetting.loading])
  useEffect(() => {
    if (!getIsCBRDStylist.loading && getIsCBRDStylist.data) {
      const data = idx(getIsCBRDStylist,_=>_.data.getIsCBRDStylist)
      setCBRDStylist(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsCBRDStylist.loading])

  // 任一設定查詢失敗（查詢結果沒有資料）時不可編輯與存檔：存檔會把所有設定一起送出，讀不到的部分會以空白預設值蓋掉後端設定
  const settingQueries = [
    merchantDeductionItems, merchantSalaryIncreaseItems, merchantSalaryDecreaseItems, merchantPassword,
    merchantFakePerformanceReferData, merchantBankSettingsData, merchantIsLockDateSettingData, merchantClockInSettingData,
    isDisplayNonBankAccountInBankTransferReport, merchantBookingNotificationSetting, bookingLineNotifySettings,
    getParameterReportSetting, getParameterCheckoutAndSalaryItemsSetting, getMerchantExternalLink, getMerchantReservationTime,
    getMerchantHairCondition, lineConnectedUser, nonDesignateBookingRecipients, getParameterOrderCreateSetting,
    getMerchantCusExternalLink, getParameterAboutSettingFunction, getCustomerReference, getMerchantAvatar,
    getMerchantRakeReference, getParameterAboutBookingSetting, getParameterAboutCustomerSetting,
    getSpecificBookingNotificationDayCount, getDisableBookingDayLimit, getMerchantCheckinSettings,
    getIsBookingCusCheckUsing, getBookingTypeForSocket, getUESUsingSetting, getIsCBRDStylist,
  ]
  const queryFailed = settingQueries.some(query => Boolean(query.error))

    //  判斷頁面資料是否都讀取完成的
  useEffect(() => {
    setInputEnable(
      !isClick &&
      !queryFailed &&
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
    queryFailed,
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
  //   if (!merchantTeachingModeSettingData.loading && merchantTeachingModeSettingData.data) {
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
    const newPasswordSetting = cloneDeep(passwordSetting)
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
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    }).finally(() => setIsClick(false))
  }

  const [selectTab, setSelectTab] = useState('orderCreate')
  const handleTabsChange = (event, value) => setSelectTab(value)
  const tabs = [
    { value: 'orderCreate', label: '打帳單', icon: Receipt },
    { value: 'employeeSchedule', label: '排班及打卡', icon: Timer },
    { value: 'salary', label: '薪資', icon: CircleDollarSign },
    { value: 'report', label: '報表', icon: ChartColumn },
    { value: 'booking', label: '預約', icon: CalendarDays },
    { value: 'performanceRake', label: '業績依據及抽成', icon: Star },
    { value: 'password', label: '密碼', icon: Lock },
    { value: 'function', label: '功能設定', icon: SlidersHorizontal },
    { value: 'customerTracking', label: '顧客追蹤', icon: UserCheck },
    { value: 'customer', label: '顧客端', icon: Users },
    { value: 'designer', label: '設計師端', icon: User },
  ]
  return (
    <Page className="ui-root" title="系統參數設定">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="系統參數設定" />
        {queryFailed && (
          <QueryFailed
            description="部分設定讀取失敗，暫時不能儲存，以免空白值蓋掉原本的設定。"
            onRetry={() => settingQueries.filter(query => query.error).forEach(query => query.refetch())}
          />
        )}
        <Tabs
          className="md:flex md:items-stretch"
          value={selectTab}
          onValueChange={value => handleTabsChange(null, value)}
          activationMode="manual"
        >
          <SettingsTabsList>
            {tabs.map((tab, index) => (
              <SettingsTabsTrigger key={index} value={tab.value} icon={tab.icon}>{tab.label}</SettingsTabsTrigger>
            ))}
          </SettingsTabsList>
          <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
            <SettingsSectionHeading title={tabs.find(tab => tab.value === selectTab)?.label} />
            <ParameterTabContent
              selectTab={selectTab}
              orderCreateSetting={orderCreateSetting}
              setOrderCreateSetting={setOrderCreateSetting}
              inputEnable={inputEnable}
              uploadMerchantLogo={uploadMerchantLogo}
              reference={reference}
              setReference={setReference}
              isMerchantClockInSetting={isMerchantClockInSetting}
              setIsMerchantClockInSetting={setIsMerchantClockInSetting}
              merchantClockInSettingData={merchantClockInSettingData}
              UESUsing={UESUsing}
              setUESUsing={setUESUsing}
              service={service}
              handleServiceChange={handleServiceChange}
              merchantBankSettings={merchantBankSettings}
              setDisplayNonBankAccountInBankTransferReport={setDisplayNonBankAccountInBankTransferReport}
              displayNonBankAccountInBankTransferReport={displayNonBankAccountInBankTransferReport}
              handleMerchantBankSettings={handleMerchantBankSettings}
              checkoutAndSalaryItem={checkoutAndSalaryItem}
              setCheckoutAndSalaryItem={setCheckoutAndSalaryItem}
              aboutReport={aboutReport}
              setAboutReport={setAboutReport}
              aboutBooking={aboutBooking}
              setAboutBooking={setAboutBooking}
              bookingCusCheck={bookingCusCheck}
              setBookingCusCheck={setBookingCusCheck}
              merchantBookingNotification={merchantBookingNotification}
              setMerchantBookingNotification={setMerchantBookingNotification}
              lineConnectedUser={lineConnectedUser}
              NDBRecipients={NDBRecipients}
              setNDBRecipients={setNDBRecipients}
              notificationDayCount={notificationDayCount}
              setNotificationDayCount={setNotificationDayCount}
              BookingLineNotify={BookingLineNotify}
              setBookingLineNotify={setBookingLineNotify}
              checkinSettings={checkinSettings}
              setCheckinSettings={setCheckinSettings}
              bookingTypeForSocket={bookingTypeForSocket}
              setBookingTypeForSocket={setBookingTypeForSocket}
              merchantReservation={merchantReservation}
              setMerchantReservation={setMerchantReservation}
              merchantFakePerformanceRefer={merchantFakePerformanceRefer}
              setMerchantFakePerformanceRefer={setMerchantFakePerformanceRefer}
              merchantRakeReferemce={merchantRakeReferemce}
              setMerchantRakeReferemce={setMerchantRakeReferemce}
              setPasswordSetting={setPasswordSetting}
              passwordSetting={passwordSetting}
              aboutSettingFunction={aboutSettingFunction}
              setAboutSettingFunction={setAboutSettingFunction}
              setMerchantAvatar={setMerchantAvatar}
              merchantLogo={merchantLogo}
              setMerchantLogo={setMerchantLogo}
              aboutCustomer={aboutCustomer}
              setAboutCustomer={setAboutCustomer}
              cusExternalLink={cusExternalLink}
              getMerchantCusExternalLink={getMerchantCusExternalLink}
              externalLink={externalLink}
              getMerchantExternalLink={getMerchantExternalLink}
              CBRDStylist={CBRDStylist}
              setCBRDStylist={setCBRDStylist}
              hairCondition={hairCondition}
              setHairCondition={setHairCondition}
            />
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
        </Tabs>
      </div>
    </Page>
  )
}
export default memo(Parameter)
