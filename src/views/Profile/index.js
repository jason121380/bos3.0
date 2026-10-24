import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import { CalendarDays, ChartColumn, CircleDollarSign, Lock, Pin, Receipt, Star, Timer, User, Users } from 'lucide-react'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { Switch } from 'ui/switch'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import idx from 'idx'
import { useFetchUserSalaryReportLazy } from 'hooks/useFetchUserSalaryReport'
import { startOfMonth, startOfDay, endOfDay } from 'date-fns'
import { useFetchUserAttendanceLazy } from 'hooks/useFetchUser'
import produce from 'immer'
import { useFetchDesignerRakeReportLazy } from 'hooks/useFetchDesignersRakeReport'
import { useFetchUserHelperRetrieveLazy } from 'hooks/useFetchGetUserHelperRetrieve'
import useFetchProfile from 'hooks/useFetchProfile'
import { useFetchGetOrderListLazy } from 'hooks/useFetchGetOrderList'
import { useFetchGetIsCustomerBonusActiveLazy } from 'hooks/useFetchGetIsCustomerBonusActive'
import { useFetchGetIsMemberShipCardActiveLazy } from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchIsPriceDisplayOnDailyReportSettingLazy } from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import { useFetchDesignerReportLazy } from 'hooks/useFetchDesignerDailyReport'
import { useFetchGetIsZeroValueHiddenOnDailyReportLazy } from 'hooks/useFetchGetIsZeroValueHiddenOnDailyReport'
import { useFetchGetIsDisplayFakePerformanceInSalaryReportLazy } from 'hooks/useFetchGetIsDisplayFakePerformanceInSalaryReport'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { useFetchGetIsEPWDDisplayLazy } from 'hooks/useFetchGetIsEPWDDisplay'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import { useFetchGetBookinHistoryDisplay } from 'hooks/useFetchGetParameterAboutBookingSetting'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import useFetchGetUserPinnedTableSettings from 'hooks/useFetchGetUserPinnedTableSettings'
import useFetchGetPinnedTableDefStructures from 'hooks/useFetchGetPinnedTableDefStructures'
import pagenationLabel from './../../helper/pagenationLabel'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'

import General from './General'
import OrderRecord from './OrderRecord'
import Permission from './Permission'
import DesignerWeekReservation from 'components/ReservationCalendar/DesignerWeekReservation'
import HelperSelfRecord from './HelperSelfRecord'
import Security from './Security'
import PinnedTable from './PinnedTable'
import PaySlip from './PaySlip'
import RakeReport from './RakeReport'
import AttendanceRecord from './AttendanceRecord'
import DesignerSelfRecord from './DesignerSelfRecord'
import { roleSectionAuthority } from 'helper/rolePageAuthority'

function Settings({ match, history }) {
  const employeeId = JSON.parse(localStorage.getItem('user')).id
  const urlParams = new URLSearchParams(window.location.search)
  const getMerchantCheckinSettings = useFetchGetCheckinSettingsForCalendar()
  const getUserPinnedTableSettings = useFetchGetUserPinnedTableSettings()
  const getPinnedTableDefStructures = useFetchGetPinnedTableDefStructures()
  const [checkinMode, setCheckinMode] = useState(false)
  const [checkinSettings, setCheckinSettings] = useState({
    isBookingCheckinEnabled: false,
    isUnDoneBookingManualNotify: false,
  })
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [orderPage, setOrderPage] = useState({
    offset: 0,
    limit: 50
  })

  const [resultsSetting, setResultsSetting] = useState({
    attendanceRecords: {
      pageLimit: 50,
      pageOffset: 0,
    },
  })

  const [getLastMonth, setGetLastMonth] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime(),
  })

  const [dateForHelper, setDateForHelper] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [dateForDailyReport, setDateForDailyReport] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })

  const [rakeReportDate, setRakeReportDate] = useState({
    startDate: urlParams.has('startDate')
      ? +urlParams.get('startDate')
      : startOfDay(new Date()).getTime(),
    endDate: urlParams.has('endDate') ? +urlParams.get('endDate') : endOfDay(new Date()).getTime(),
  })

  const [userPaySlip, setUserPaySlip] = useState([])
  const [rakeReport, setRakeReport] = useState([])
  const [displayReport, setDisplayReport] = useState(false)
  const [itemAuthority, setItemAuthority] = useState([])
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const { tab: currentTab } = match.params
  const profile = useFetchProfile()
  const merchantAuthData = useFetchMerchantAuthorities()
  const [orderRecords, setOrderRecords] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [orderLength, setOrderLength] = useState(0)
  const [submitValue, setSubmitValue] = useState({
    pages: [],
    stores: []
  })

  const [customerBonusActiveLazy, customerBonusActiveData] = useFetchGetIsCustomerBonusActiveLazy()
  const { memberActiveLazy, memberActiveLazyData } = useFetchGetIsMemberShipCardActiveLazy()
  const { getOrderListLazy, getOrderListLazyData } = useFetchGetOrderListLazy()
  const tabValue = [
    { value: 'general', label: '基本資料' },
    { value: 'orderRecord', label: '帳單紀錄' },
    { value: 'reservation', label: '預約表' },
    { value: 'designerSelfRecord', label: '設計師日報表' },
    { value: 'helperSelfRecord', label: '互助日報表' },
    { value: 'rakeReport', label: '抽成報表' },
    { value: 'paySlip', label: '薪資條' },
    { value: 'security', label: '密碼設定' },
    { value: 'AttendanceRecord', label: '打卡紀錄' },
    { value: 'pinnedTable', label: '功能釘選' },
  ]
  // 設定頁樣板（STYLE §12）：全部分頁用左選單；tabIcons 只供 SettingsTabsTrigger 呈現，不改 tabValue／權限過濾／路由。
  const tabIcons = {
    general: User,
    orderRecord: Receipt,
    reservation: CalendarDays,
    designerSelfRecord: ChartColumn,
    helperSelfRecord: Users,
    rakeReport: Star,
    paySlip: CircleDollarSign,
    security: Lock,
    AttendanceRecord: Timer,
    pinnedTable: Pin,
  }
  const [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData] = useFetchGetIsEPWDDisplayLazy()
  const getBookinHistoryDisplay = useFetchGetBookinHistoryDisplay()
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)

  useEffect(() => {
    if (!getUserPinnedTableSettings.loading) {
      const data = idx(getUserPinnedTableSettings, _ => _.data.getUserPinnedTableSettings)
      if (data) {
        const pages = JSON.parse(data.pinnedSettings).map(d => d.name)
        setSubmitValue({
          pages: pages,
          stores: data.usingStoreIds.filter(id => JSON.parse(localStorage.getItem('userMerchant')).id !== id)
        })
      }
    }
  }, [getUserPinnedTableSettings.loading])

  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      // 查詢失敗時以 false（不顯示）為預設（Jason 2026/10/22；原本整頁錯誤）
      const data = Boolean(idx(getBookinHistoryDisplay, _ => _.data.getParameterAboutBookingSetting.isBookingHistoryDisplay))
      setBookingHistoryDisplay(data)
    }
  }, [getBookinHistoryDisplay.loading])

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

  // 檢查權限 ------------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!merchantAuthData.loading && !profile.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthId = idx(profile, _ => _.data.me.merchantIdentity.authorityId)
      const tmpArr = roleSectionAuthority(merchantAuth, loginUserAuthId, '個人檔案')
      setItemAuthority(tmpArr)
    }
  }, [merchantAuthData.loading, profile.loading])
  const itemValue = []
  itemAuthority.forEach(data => {
    tabValue.forEach(data2 => {
      if (data.pageName === data2.label && data.authority === true) {
        itemValue.push({ value: data2.value, label: data2.label })
      }
    })
  })
  // ------------------------------------------------------------------------------------------------------
  useEffect(() => {
    switch (currentTab) {
      case 'general':
        break
      case 'orderRecord':
        orderLength === 0 && getOrderRecordsData()
        break
      case 'reservation':
        break
      case 'designerSelfRecord':
        designerReportData.length === 0 && getDesignerSelfRecord()
        break
      case 'helperSelfRecord':
        report.length === 0 && getHelperSelfRecord()
        break
      case 'rakeReport':
        rakeReport.length === 0 && getRakeReport()
        break
      case 'paySlip':
        userPaySlip.length === 0 && getPaySlip()
        break
      case 'security':
        break
      case 'AttendanceRecord':
        attendance.length === 0 && getAttendanceRecord()
        break
      default:
        // 其他值不處理（與原本沒有 default 時相同）
        break
    }
  }, [currentTab])

  useEffect(() => {
    switch (currentTab) {
      case 'orderRecord':
        getOrderRecordsData()
        break
      case 'designerSelfRecord':
        getDesignerSelfRecord()
        break
      case 'rakeReport':
        getRakeReport()
        break
      case 'helperSelfRecord':
        getHelperSelfRecord()
        break
      case 'paySlip':
        getPaySlip()
        break
      case 'AttendanceRecord':
        getAttendanceRecord()
        break
      default:
        break
    }
  }, [dateForHelper, dateForDailyReport, rakeReportDate, getLastMonth, resultsSetting])

  // 訂單記錄 ------------------------------------------------------------------------------------------------------
  const getOrderRecordsData = () => {
    getOrderListLazy({
      variables: {
        input: {
          designerId: employeeId,
        },
      },
    })
    customerBonusActiveLazy()
    memberActiveLazy()
  }


  useEffect(() => {
    if (
      !getOrderListLazyData.loading && getOrderListLazyData.data !== undefined &&
      !memberActiveLazyData.loading && memberActiveLazyData.data !== undefined &&
      // 等紅利設定查詢回來再讀（Jason 2026/10/22；原本紅利設定比帳單晚回時讀 undefined 整頁錯誤）
      !customerBonusActiveData.loading
    ) {
      const performance = idx(getOrderListLazyData, _ => _.data.getOrderList.intervalSummary.membership)
      const active = idx(memberActiveLazyData, _ => _.data.getIsMemberShipCardActive)
      const length = idx(getOrderListLazyData, _ => _.data.getOrderList.orderList.length)
      const bonusDecount = getOrderListLazyData.data.getOrderList.intervalSummary.bonusDecountForReport
      setOrderRecords(getOrderListLazyData)
      setBonusDisplay(idx(customerBonusActiveData, _ => _.data.getIsCustomerBonusActive) || bonusDecount !== 0)
      setOrderLength(length)
      setMembershipDisplay(active || performance !== 0)
    }
  }, [getOrderListLazyData.loading, memberActiveLazyData.loading, customerBonusActiveData.loading])

  // 設計師日報表 ------------------------------------------------------------------------------------------------------
  const [designerReportData, setDesignerReportData] = useState([])
  const [priceDisplayOnReport, setPriceDisplayOnReport] = useState(false)
  const [isHelperPointPriceDisplay, setIsHelperPointPriceDisplay] = useState(false)

  const { fetchDesignerReportLazy, designerReportLazyData } = useFetchDesignerReportLazy()
  const {
    fetchIsPriceDisplayOnDailyReportSettingLazy,
    isPriceDisplayOnDailyReportSettingLazyData,
  } = useFetchIsPriceDisplayOnDailyReportSettingLazy()

  const {
    fetchGetIsZeroValueHiddenOnDailyReportLazy,
    getIsZeroValueHiddenOnDailyReportLazyData,
  } = useFetchGetIsZeroValueHiddenOnDailyReportLazy()

  const getDesignerSelfRecord = () => {
    fetchIsPriceDisplayOnDailyReportSettingLazy()
    fetchGetIsZeroValueHiddenOnDailyReportLazy()
    fetchDesignerReportLazy({
      variables: {
        date: dateForDailyReport.endDate,
        designerIds: [employeeId],
      },
    })
  }
  useEffect(() => {
    if ((!designerReportLazyData.loading, designerReportLazyData.data !== undefined)) {
      setDesignerReportData(designerReportLazyData)
    }
  }, [designerReportLazyData.loading])

  useEffect(() => {
    if (
      !isPriceDisplayOnDailyReportSettingLazyData.loading &&
      isPriceDisplayOnDailyReportSettingLazyData.data !== undefined
    ) {
      const isPriceDisplayOnDailyReport = idx(
        isPriceDisplayOnDailyReportSettingLazyData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isPriceDisplayOnDailyReport
      )
      const isHelperPointPriceDisplay = idx(
        isPriceDisplayOnDailyReportSettingLazyData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setPriceDisplayOnReport(isPriceDisplayOnDailyReport)
      setIsHelperPointPriceDisplay(isHelperPointPriceDisplay)
    }
  }, [isPriceDisplayOnDailyReportSettingLazyData.loading])
  const [isHiddenZero, setIsHiddenZero] = useState(false)

  useEffect(() => {
    if (
      !getIsZeroValueHiddenOnDailyReportLazyData.loading &&
      getIsZeroValueHiddenOnDailyReportLazyData.data !== undefined
    ) {
      setIsHiddenZero(
        idx(
          getIsZeroValueHiddenOnDailyReportLazyData,
          _ => _.data.getIsZeroValueHiddenOnDailyReport
        )
      )
    }
  }, [getIsZeroValueHiddenOnDailyReportLazyData.loading])

  // 互助日報表 ------------------------------------------------------------------------------------------------------
  const [report, setReport] = useState([])
  const {
    fetchUserHelperRetrieveLazy,
    userHelperRetrieveLazyData,
  } = useFetchUserHelperRetrieveLazy()
  // 「累計」欄：同一支查詢另查當月 1 日到所選日期（Jason 2026/10/22；原本累計欄只初始化為 0、從未填入）
  const {
    fetchUserHelperRetrieveLazy: fetchUserHelperRetrieveMonthLazy,
    userHelperRetrieveLazyData: userHelperRetrieveMonthLazyData,
  } = useFetchUserHelperRetrieveLazy()
  const [helperPointPriceDisplay, setHelperPointPriceDisplay] = useState(false)
  const getHelperSelfRecord = () => {
    fetchUserHelperRetrieveLazy({
      variables: {
        input: {
          startDate: dateForHelper.endDate,
          endDate: dateForHelper.endDate,
          designerId: employeeId,
        },
      },
    })
    fetchUserHelperRetrieveMonthLazy({
      variables: {
        input: {
          startDate: startOfMonth(dateForHelper.endDate).getTime(),
          endDate: dateForHelper.endDate,
          designerId: employeeId,
        },
      },
    })
    fetchIsPriceDisplayOnDailyReportSettingLazy()
  }

  useEffect(() => {
    if ((!userHelperRetrieveLazyData.loading, userHelperRetrieveLazyData.data !== undefined)) {
      const usersName = []
      const reportData = []
      idx(userHelperRetrieveLazyData, _ =>
        _.data.getUserHelperRetrieve.helperRecord.forEach((data, index) => {
          if (!usersName.includes(data.helper.id)) {
            usersName.push(data.helper.id)
            reportData.push({
              user: data.helper,
              helperRecord: [],
              productRecord: [],
              helperFeeTillNow: 0,
              helperPointTillNow: 0,
              productPerformanceTillNow: 0,
              productRakeTillNow: 0,
              summaryNoPoint: 0,
              summaryOnlyPoint: 0,
            })
          }
        })
      )
      idx(userHelperRetrieveLazyData, _ =>
        _.data.getUserHelperRetrieve.productRecord.forEach((data, index) => {
          if (!usersName.includes(data.seller.id)) {
            usersName.push(data.seller.id)
            reportData.push({
              user: data.seller,
              helperRecord: [],
              productRecord: [],
              helperFeeTillNow: 0,
              helperPointTillNow: 0,
              productPerformanceTillNow: 0,
              productRakeTillNow: 0,
              summaryNoPoint: 0,
              summaryOnlyPoint: 0,
            })
          }
        })
      )

      reportData.forEach(data => {
        idx(userHelperRetrieveLazyData, _ =>
          _.data.getUserHelperRetrieve.helperRecord.forEach(data2 => {
            if (data.user.id === data2.helper.id) {
              data.helperRecord.push(data2)
            }
          })
        )
      })
      reportData.forEach(data => {
        idx(userHelperRetrieveLazyData, _ =>
          _.data.getUserHelperRetrieve.productRecord.forEach(data2 => {
            if (data.user.id === data2.seller.id) {
              data.productRecord.push(data2)
            }
          })
        )
      })
      // 累計：依互助者加總當月 1 日到所選日期的紀錄（整月查詢還沒回來時為 0）
      const monthHelperRecord = idx(userHelperRetrieveMonthLazyData, _ => _.data.getUserHelperRetrieve.helperRecord) || []
      const monthProductRecord = idx(userHelperRetrieveMonthLazyData, _ => _.data.getUserHelperRetrieve.productRecord) || []
      const sumOf = (list, pick) => list.reduce((accu, curVal) => accu + (pick(curVal) || 0), 0)
      const tillNowReport = reportData.map(data => {
        const helperRecordTillNow = monthHelperRecord.filter(d => idx(d, _ => _.helper.id) === data.user.id)
        const productRecordTillNow = monthProductRecord.filter(d => idx(d, _ => _.seller.id) === data.user.id)
        return {
          ...data,
          helperFeeTillNow: sumOf(helperRecordTillNow, d => d.helperFee),
          helperPointTillNow: sumOf(helperRecordTillNow, d => d.helperPoint),
          productPerformanceTillNow: sumOf(productRecordTillNow, d => d.productUnitPrice * d.productCount),
          productRakeTillNow: sumOf(productRecordTillNow, d => d.productRake),
          summaryNoPoint: sumOf(helperRecordTillNow, d => d.helperFeeNoPoint),
          summaryOnlyPoint: sumOf(helperRecordTillNow, d => d.helperFeeOnlyPoint),
        }
      })
      setReport(tillNowReport)
      setDisplayReport(false)
    }
  }, [userHelperRetrieveLazyData.loading, userHelperRetrieveMonthLazyData.loading])

  useEffect(() => {
    if (
      !isPriceDisplayOnDailyReportSettingLazyData.loading &&
      isPriceDisplayOnDailyReportSettingLazyData.data !== undefined
    ) {
      const helperPointPriceDisplay = idx(
        isPriceDisplayOnDailyReportSettingLazyData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setHelperPointPriceDisplay(helperPointPriceDisplay)
    }
  }, [isPriceDisplayOnDailyReportSettingLazyData.loading])

  // 抽成報表----------------------------------------------------------------------------------------

  const {
    fetchDesignerRakeReportLazy,
    designerRakeReportLazyData,
  } = useFetchDesignerRakeReportLazy()

  const getRakeReport = () => {
    fetchDesignerRakeReportLazy({
      variables: {
        input: {
          startDate: startOfDay(rakeReportDate.startDate).getTime(),
          endDate: endOfDay(rakeReportDate.endDate).getTime(),
        },
        designerIds: [employeeId],
      },
    })
  }

  useEffect(() => {
    if (!designerRakeReportLazyData.loading && designerRakeReportLazyData.data !== undefined) {
      setRakeReport(designerRakeReportLazyData)
    }
  }, [designerRakeReportLazyData.loading])

  // 薪資條----------------------------------------------------------------------------------------
  const [displayFakePerformanceIn, setDisplayFakePerformanceIn] = useState(false)
  const { fetchUserSalaryReportLazy, userSalaryReportLazyData } = useFetchUserSalaryReportLazy()
  const {
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    getIsDisplayFakePerformanceInSalaryReportLazyData,
  } = useFetchGetIsDisplayFakePerformanceInSalaryReportLazy()
  const getPaySlip = () => {
    fetchUserSalaryReportLazy({
      variables: {
        date: getLastMonth.startDate,
      },
    })
    getIsEPWDDisplayLazy()
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy()
  }

  useEffect(() => {
    if (!userSalaryReportLazyData.loading && userSalaryReportLazyData.data !== undefined) {
      setUserPaySlip(userSalaryReportLazyData)
    }
  }, [userSalaryReportLazyData.loading])

  useEffect(() => {
    if (
      (!getIsDisplayFakePerformanceInSalaryReportLazyData.loading,
        getIsDisplayFakePerformanceInSalaryReportLazyData.data !== undefined)
    ) {
      setDisplayFakePerformanceIn(
        idx(
          getIsDisplayFakePerformanceInSalaryReportLazyData,
          _ => _.data.getIsDisplayFakePerformanceInSalaryReport
        )
      )
    }
  }, [getIsDisplayFakePerformanceInSalaryReportLazyData.loading])

  // 打卡記錄 ----------------------------------------------------------------------------------------
  const { fetchUserAttendanceLazy, uerAttendanceLazyData } = useFetchUserAttendanceLazy()
  const [attendance, setAttendance] = useState([])

  const getAttendanceRecord = () => {
    fetchUserAttendanceLazy({
      variables: {
        userInput: { id: employeeId },
        allAttendanceInput: {
          pageLimit: resultsSetting.attendanceRecords.pageLimit,
          pageOffset: resultsSetting.attendanceRecords.pageOffset,
        },
      },
    })
  }

  useEffect(() => {
    if (!uerAttendanceLazyData.loading && uerAttendanceLazyData.data !== undefined) {
      setAttendance(uerAttendanceLazyData)
    }
  }, [uerAttendanceLazyData.loading])


  const handlePageChange = ({ name, value, key }) => {
    setResultsSetting(
      produce(draft => {
        draft[name].pageOffset = key === 'pageLimit' ? 0 : resultsSetting[name].pageOffset
        draft[name][key] = value
      })
    )
  }

  const handleOnChangePage = (event, newPage) => {
    setOrderPage({
      ...orderPage,
      offset: newPage,
    })
  }

  const handleOnChangeRowsPerPage = event => {
    setOrderPage({
      ...orderPage,
      limit: event.target.value,
      offset: 0,
    })
  }
  const handleTabsChange = (event, value) => {
    history.push(value)
  }

  if (profile.loading) return 'Loading...'

  // 網址分頁不在分頁清單（permission 分頁自初版起不在清單、角色也沒有對應頁面權限）時導回基本資料
  const currentTabItem = tabValue.find(itemValue => itemValue.value === currentTab)
  if (!currentTabItem) return <Redirect to="/profile/general" />
  const findTabName = () => currentTabItem.label

  // 頁面外距由 #printContainer 提供；分頁籤用 ui/tabs（onValueChange 以 (null, value) 轉接原 handleTabsChange，activationMode="manual" 保留鍵盤以 Enter/Space 選取）。
  // 設定頁樣板（STYLE §12）：所有分頁（含訂單／預約／日報／抽成／薪資條／打卡等報表型分頁）一律桌機左選單＋右分段標題、手機頂部橫向捲動分頁
  // （Jason 2026/10/20「要放在左側」；比照員工資料、顧客詳細資料）。左選單加 noprint，列印時只印右側內容。
  // handleTabsChange（history.push 路由）、value、權限過濾 itemValue 與各分頁內容/存值一字未動。
  return (
    <Page className="ui-root" title={`${profile.data.me.name} - ${findTabName()}`}>
      <div className="w-full">
        <AdminPageHeader title='變更帳戶資訊' subTitle='設定'>
          {checkinSettings.isBookingCheckinEnabled && currentTab === 'reservation' && (
            <div className='CheckinMode flex items-center gap-1 text-body text-text'>
              <span>報到模式</span><Switch aria-label="報到模式" checked={checkinMode} onChange={(e, v) => setCheckinMode(v)} />
            </div>
          )}
        </AdminPageHeader>
        <Tabs
          onValueChange={value => handleTabsChange(null, value)}
          value={currentTab}
          activationMode="manual"
          className="md:flex md:items-stretch"
        >
          {itemValue.length > 0 ? (
            <SettingsTabsList className="noprint">
              {itemValue.map(tab => (
                <SettingsTabsTrigger key={tab.value} value={tab.value} icon={tabIcons[tab.value]}>{tab.label}</SettingsTabsTrigger>
              ))}
              <SettingsTabsTrigger value='pinnedTable' icon={tabIcons.pinnedTable}>功能釘選</SettingsTabsTrigger>
            </SettingsTabsList>
          ) : null}
          <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
            <SettingsSectionHeading title={findTabName()} />
            <div>
          {currentTab === 'general' && <General />}
          {currentTab === 'orderRecord' && (
            getOrderListLazyData.error ? <QueryFailed onRetry={getOrderRecordsData} /> :
            getOrderListLazyData.loading || getOrderListLazyData.data === undefined ?
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div> :
              <OrderRecord
                pagenationLabel={pagenationLabel}
                bonusDisplay={bonusDisplay}
                profileOrders={getOrderListLazyData}
                handleOnChangePage={handleOnChangePage}
                handleOnChangeRowsPerPage={handleOnChangeRowsPerPage}
                membershipDisplay={membershipDisplay}
                rowsPerPage={orderPage.limit}
                page={orderPage.offset}
                totalCount={orderLength}
                loading={!getOrderListLazyData.loading && getOrderListLazyData.data !== undefined}
              />
          )}
          {currentTab === 'reservation' && (
            <DesignerWeekReservation
              className="mt-6"
              designerId={employeeId}
              checkinSettings={checkinSettings}
              bookingCusCheck={bookingCusCheck} 
              checkinMode={checkinMode}
              bookingHistoryDisplay={bookingHistoryDisplay}
            />
          )}
          {currentTab === 'helperSelfRecord' && (
            userHelperRetrieveLazyData.error ? <QueryFailed onRetry={getHelperSelfRecord} /> :
            <HelperSelfRecord
              setDateForHelper={setDateForHelper}
              dateForHelper={dateForHelper}
              helperReport={report}
              titleDate={dateForHelper.endDate}
              priceDisplayOnReport={helperPointPriceDisplay}
              isLoading={
                userHelperRetrieveLazyData.loading || userHelperRetrieveLazyData.data === undefined
              }
            />
          )}
          {currentTab === 'designerSelfRecord' && (
            designerReportLazyData.error ? <QueryFailed onRetry={getDesignerSelfRecord} /> :
            <DesignerSelfRecord
              setDateForHelper={setDateForDailyReport}
              dateForHelper={dateForDailyReport}
              titleDate={dateForDailyReport.endDate}
              startDateOfMonth={startOfMonth(dateForDailyReport.endDate)}
              designerDailyReport={idx(designerReportData, _ => _.data.designerDailyReport)}
              priceDisplayOnReport={priceDisplayOnReport}
              isHelperPointPriceDisplay={isHelperPointPriceDisplay}
              isHiddenZero={isHiddenZero}
              isLoading={
                designerReportLazyData.loading || designerReportLazyData.data === undefined ||
                isPriceDisplayOnDailyReportSettingLazyData.loading || isPriceDisplayOnDailyReportSettingLazyData.data === undefined ||
                getIsZeroValueHiddenOnDailyReportLazyData.loading || getIsZeroValueHiddenOnDailyReportLazyData.data === undefined
              }
            />
          )}
          {currentTab === 'security' && <Security />}
          {currentTab === 'permission' && <Permission />}
          {currentTab === 'paySlip' && (
            userSalaryReportLazyData.error ? <QueryFailed onRetry={getPaySlip} /> :
            <PaySlip
              userPaySlip={idx(userPaySlip, _ =>
                _.data.userSalaryReport.filter(data => data.userId === employeeId)
              )}
              setGetLastMonth={setGetLastMonth}
              getLastMonth={getLastMonth}
              isDisplayFakePerformance={displayFakePerformanceIn}
              isLoading={
                userSalaryReportLazyData.loading || userSalaryReportLazyData.data === undefined
              }
              EPWDDisplay={getIsEPWDDisplayLazyData.data && getIsEPWDDisplayLazyData.data.getIsEPWDDisplay}
            />
          )}
          {currentTab === 'AttendanceRecord' && (
            uerAttendanceLazyData.error ? <QueryFailed onRetry={getAttendanceRecord} /> :
            uerAttendanceLazyData.loading || uerAttendanceLazyData.data === undefined ?
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div> :
              <AttendanceRecord
                pagenationLabel={pagenationLabel}
                results={idx(attendance, _ => _.data.user.attendanceRecords.records)}
                onChangePage={(_event, page) =>
                  handlePageChange({
                    value: page,
                    key: 'pageOffset',
                    name: 'attendanceRecords',
                  })
                }
                onChangeRowsPerPage={event => {
                  handlePageChange({
                    value: idx(event, _ => _.target.value),
                    key: 'pageLimit',
                    name: 'attendanceRecords',
                  })
                }}
                page={{
                  limit: idx(attendance, _ => _.data.user.attendanceRecords.pageLimit),
                  offset: idx(attendance, _ => _.data.user.attendanceRecords.pageOffset),
                  count: idx(attendance, _ => _.data.user.attendanceRecords.totalCount),
                }}
              />
          )
          }
          {currentTab === 'rakeReport' && (
            designerRakeReportLazyData.error ? <QueryFailed onRetry={getRakeReport} /> :
            <RakeReport
              loading={
                designerRakeReportLazyData.loading || designerRakeReportLazyData.data === undefined
              }
              designerRakeReport={idx(designerRakeReportLazyData, _ => _.data.userRakeReport)}
              setRakeReportDate={setRakeReportDate}
              rakeReportDate={rakeReportDate}
            />
          )}

          {currentTab === 'pinnedTable' && (
            <PinnedTable
              submitValue={submitValue}
              setSubmitValue={setSubmitValue}
              isLoading={getUserPinnedTableSettings.loading || getPinnedTableDefStructures.loading}
              pages={
                getPinnedTableDefStructures.loading ? [] : JSON.parse(getPinnedTableDefStructures.data.getPinnedTableDefStructures)
              }
            />
          )}
            </div>
          </div>
        </Tabs>
      </div>
    </Page>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
}

export default Settings
