import Page from 'components/Page'
import { Switch } from 'ui/switch'
import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import { CalendarDays, ChartColumn, Clock, FileText, KeyRound, Percent, Receipt, User, Wallet } from 'lucide-react'
import { Provider } from 'context/designerContext'
import useFetchMerchantDesigner, {
  useFetcDesignerFixedSalaryItemsLazy,
} from 'hooks/useFetchMerchantDesigner'
import { useFetchOrdersLazy } from 'hooks/useFetchOrders'
import { useFetchGetIsCustomerBonusActiveLazy } from 'hooks/useFetchGetIsCustomerBonusActive'
import { useFetchGetOrderListLazy } from 'hooks/useFetchGetOrderList'
import { useFetchDesignerRakeReportLazy } from 'hooks/useFetchDesignersRakeReport'
import { useFetchMerchantSalaryIncreaseItemsLazy } from 'hooks/useFetchMerchantSalaryIncreaseItems'
import { useFetchMerchantSalaryDecreaseItemsLazy } from 'hooks/useFetchMerchantSalaryDecreaseItems'
import { useFetchUserAttendanceLazy } from 'hooks/useFetchUser'
import { useFetchUserSalaryReportLazy } from 'hooks/useFetchUserSalaryReport'
import { useFetchGetIsDisplayFakePerformanceInSalaryReportLazy } from 'hooks/useFetchGetIsDisplayFakePerformanceInSalaryReport'
import { useFetchGetIsMemberShipCardActiveLazy } from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetBookinHistoryDisplay } from 'hooks/useFetchGetParameterAboutBookingSetting'
import idx from 'idx'
import produce from 'immer'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import useFetchProfile from 'hooks/useFetchProfile'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { startOfDay, endOfDay } from 'date-fns'
import useFetchSettingUserFixedSaleryItem from 'hooks/useFetchSettingUserFixedSalaryItem'
import { useFetchGetIsEPWDDisplayLazy } from 'hooks/useFetchGetIsEPWDDisplay'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'

import AttendanceRecord from './AttendanceRecord'
import General from './General'
import OrderRecord from './OrderRecord'
import Permission from './Permission'
import ProfitSharing from './ProfitSharing'
import DesignerWeekReservation from 'components/ReservationCalendar/DesignerWeekReservation'
import Security from './Security'
import PaySlip from './PaySlip'
import RakeReport from './RakeReport'
import SalaryItems from './SalaryItems'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import { roleSectionAuthority } from 'helper/rolePageAuthority'
import { PageHeader } from 'ui/page-header'

// 分頁載入中：與舊版 CircularProgress 相同時機顯示
const TabLoading = () => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="載入中">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-[320px] w-full rounded-lg" />
  </div>
)

function Settings({ match, history }) {
  const { tab: currentTab, id } = match.params
  const designer = useFetchMerchantDesigner({ designerId: id })
  const profile = useFetchProfile()
  const merchantAuthData = useFetchMerchantAuthorities()
  const getMerchantCheckinSettings = useFetchGetCheckinSettingsForCalendar()
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [checkinMode, setCheckinMode] = useState(false)
  const [clickedUserAuthName, setClickedUserAuthName] = useState(null)
  const [nameInHeader, setNameInHeader] = useState('')
  const urlParams = new URLSearchParams(window.location.search)
  const [resultsSetting, setResultsSetting] = useState({
    orders: {
      pageLimit: 50,
      pageOffset: 0,
    },
    attendanceRecords: {
      pageLimit: 50,
      pageOffset: 0,
    },
  })
  const [checkinSettings, setCheckinSettings] = useState({
    isBookingCheckinEnabled: false,
    isUnDoneBookingManualNotify: false,
  })

  const [getLastMonth, setGetLastMonth] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime(),
  })
  const [rakeReportDate, setRakeReportDate] = useState({
    startDate: urlParams.has('startDate')
      ? +urlParams.get('startDate')
      : startOfDay(new Date()).getTime(),
    endDate: urlParams.has('endDate') ? +urlParams.get('endDate') : endOfDay(new Date()).getTime(),
  })
  const [userPaySlip, setUserPaySlip] = useState([])
  const [loginUserAuthName, setLoginUserAuthName] = useState(null)
  const [rakeReport, setRakeReport] = useState([])

  const [salaryIncreaseItemsReformatted, setSalaryIncreaseItemsReformatted] = useState([])
  const [salaryDecreaseItemsReformatted, setSalaryDecreaseItemsReformatted] = useState([])
  const [salaryDecreaseItemsReformatted2, setSalaryDecreaseItemsReformatted2] = useState([])
  const [increaseSecondContent, setIncreaseSecondContent] = useState({
    increaseItems: [{ itemName: '', price: 0, type: 'INCREASE' }],
  })
  const [decreaseSecondContent, setDecreaseSecondContent] = useState({
    decreaseItems: [{ itemName: '', price: 0, type: 'DECREASE' }],
  })
  const [itemAuthority, setItemAuthority] = useState([])
  const { setUserFixedSalaryItem } = useFetchSettingUserFixedSaleryItem()
  const [designerName, setDesignerName] = useState('')
  const [orderRecords, setOrderRecords] = useState([])
  const [isDisplayFakePerformance, setIsDisplayFakePerformance] = useState(false)
  const [attendance, setAttendance] = useState([])
  const [bonusDisplay, setBonusDisplay] = useState(false)

  const { fetchOrdersLazy, ordersLazyData } = useFetchOrdersLazy()
  const [customerBonusActiveLazy, customerBonusActiveData] = useFetchGetIsCustomerBonusActiveLazy()
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  const { memberActiveLazy, memberActiveLazyData } = useFetchGetIsMemberShipCardActiveLazy()
  const { getOrderListLazy, getOrderListLazyData } = useFetchGetOrderListLazy()
  const {
    fetchDesignerRakeReportLazy,
    designerRakeReportLazyData,
  } = useFetchDesignerRakeReportLazy()
  const {
    fetchMerchantSalaryIncreaseItemsLazy,
    merchantSalaryIncreaseItemsLazyData,
  } = useFetchMerchantSalaryIncreaseItemsLazy()

  const {
    fetchMerchantSalaryDecreaseItemsLazy,
    merchantSalaryDecreaseItemsLazyData,
  } = useFetchMerchantSalaryDecreaseItemsLazy()

  const {
    fetcDesignerFixedSalaryItemsLazy,
    designerFixedSalaryItemsLazyData,
  } = useFetcDesignerFixedSalaryItemsLazy()

  const { fetchUserSalaryReportLazy, userSalaryReportLazyData } = useFetchUserSalaryReportLazy()

  const {
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    getIsDisplayFakePerformanceInSalaryReportLazyData,
  } = useFetchGetIsDisplayFakePerformanceInSalaryReportLazy()
  const { fetchUserAttendanceLazy, uerAttendanceLazyData } = useFetchUserAttendanceLazy()
  const [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData] = useFetchGetIsEPWDDisplayLazy()

  const getBookinHistoryDisplay = useFetchGetBookinHistoryDisplay()
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    switch (currentTab) {
      case 'general':
        break
      case 'orderRecord':
        orderRecords.length === 0 && getOrderRecordsData()
        break
      case 'profitSharing':
        break
      case 'rakeReport':
        rakeReport.length === 0 && getRakeReport()
        break
      case 'reservation':
        break
      case 'paySlip':
        userPaySlip.length === 0 && getSalaryReport()
        break
      case 'salaryItems':
        salaryIncreaseItemsReformatted.length === 0 && getSalaryItems()
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [currentTab] 變動時執行；attendance.length、getAttendanceRecord、getOrderRecordsData、getRakeReport、getSalaryItems、getSalaryReport、orderRecords.length、rakeReport.length、salaryIncreaseItemsReformatted.length、userPaySlip.length 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [currentTab])

  useEffect(() => {
    switch (currentTab) {
      case 'orderRecord':
        getOrderRecordsData()
        break
      case 'paySlip':
        getSalaryReport()
        break
      case 'AttendanceRecord':
        getAttendanceRecord()
        break
      default:
        break
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [resultsSetting, getLastMonth] 變動時執行；currentTab、getAttendanceRecord、getOrderRecordsData、getSalaryReport 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [resultsSetting, getLastMonth])

  const getOrderRecordsData = () => {
    getOrderListLazy({
      variables: {
        input: {
          designerId: id,
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
      !customerBonusActiveData.loading && customerBonusActiveData.data !== undefined
    ) {
      const performance = idx(getOrderListLazyData, _ => _.data.getOrderList.intervalSummary.membership)
      const active = idx(memberActiveLazyData, _ => _.data.getIsMemberShipCardActive)
      const bonusDecount = idx(getOrderListLazyData, _ => _.data.getOrderList.intervalSummary.bonusDecountForReport)
      setBonusDisplay(customerBonusActiveData.data.getIsCustomerBonusActive || bonusDecount !== 0)
      setMembershipDisplay(active || performance !== 0)
      setOrderRecords(getOrderListLazyData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getOrderListLazyData.loading, memberActiveLazyData.loading, customerBonusActiveData.loading])

  const getRakeReport = () => {
    if (currentTab === 'rakeReport') {
      fetchDesignerRakeReportLazy({
        variables: {
          input: rakeReportDate,
          designerIds: [id],
        },
      })
    }
  }

  useEffect(() => {
    if (!designerRakeReportLazyData.loading && designerRakeReportLazyData.data !== undefined) {
      setRakeReport(designerRakeReportLazyData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designerRakeReportLazyData.loading])

  useEffect(() => {
    getRakeReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（getRakeReport）；只在 [rakeReportDate] 變動時呼叫，補上會每次 render 重跑
  }, [rakeReportDate])

  const getSalaryItems = () => {
    if (currentTab === 'salaryItems') {
      fetchMerchantSalaryIncreaseItemsLazy()
      fetchMerchantSalaryDecreaseItemsLazy()
      fetcDesignerFixedSalaryItemsLazy({
        variables: {
          designerId: id,
        },
      })
    }
  }

  const getSalaryReport = () => {
    fetchUserSalaryReportLazy({
      variables: {
        date: getLastMonth.startDate,
      },
    })
    getIsEPWDDisplayLazy()
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy()
  }

  useEffect(() => {
    if (
      !userSalaryReportLazyData.loading &&
      userSalaryReportLazyData.data !== undefined &&
      !getIsDisplayFakePerformanceInSalaryReportLazyData.loading &&
      getIsDisplayFakePerformanceInSalaryReportLazyData.data !== undefined
    ) {
      const FakePerformance = idx(
        getIsDisplayFakePerformanceInSalaryReportLazyData,
        _ => _.data.getIsDisplayFakePerformanceInSalaryReport
      )

      setIsDisplayFakePerformance(FakePerformance)
      setUserPaySlip(userSalaryReportLazyData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [userSalaryReportLazyData.loading, getIsDisplayFakePerformanceInSalaryReportLazyData.loading])

  // 初始化薪資加項需要的state
  useEffect(() => {
    if (
      !merchantSalaryIncreaseItemsLazyData.loading &&
      merchantSalaryIncreaseItemsLazyData.data !== undefined &&
      !designerFixedSalaryItemsLazyData.loading &&
      designerFixedSalaryItemsLazyData.data !== undefined
    ) {
      const initIncrease = []
      const initIncrease2 = []
      const increaseReformatted = idx(merchantSalaryIncreaseItemsLazyData, _ =>
        _.data.getMerchantSalaryIncreaseItems.map(data => ({
          itemName: data.itemSetting,
          price: 0,
          type: data.type,
          sorting: data.sorting,
        }))
      )
      const increaseFixeSalaryItems = idx(
        designerFixedSalaryItemsLazyData,
        _ => _.data.merchantDesigner.fixedSalaryItem.increaseItem
      )
      if (increaseFixeSalaryItems !== undefined && increaseReformatted !== undefined) {
        increaseReformatted.forEach(data => {
          if (
            increaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName) !== undefined
          ) {
            initIncrease.push({
              itemName: increaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName)
                .itemName,
              price: increaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName).price,
              type: 'INCREASE',
              sorting: data.sorting,
            })
          } else {
            if (data.itemName !== '會員卡獎金') {
              initIncrease.push({
                itemName: data.itemName,
                price: data.price,
                type: data.type,
                sorting: data.sorting,
              })
            }
          }
        })
        increaseFixeSalaryItems.forEach(data => {
          if (initIncrease.every(data2 => data2.itemName !== data.itemName)) {
            initIncrease2.push({
              itemName: data.itemName,
              price: data.price,
              type: 'INCREASE',
            })
          }
        })
      }

      if (initIncrease.length > 0) {
        setSalaryIncreaseItemsReformatted(initIncrease)
      } else {
        setSalaryIncreaseItemsReformatted(increaseReformatted)
      }
      if (initIncrease2.length > 0) {
        setIncreaseSecondContent(pre => {
          return { increaseItems: initIncrease2 }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantSalaryIncreaseItemsLazyData.loading, designerFixedSalaryItemsLazyData.loading])

  // 初始化薪資扣項需要的state
  useEffect(() => {
    if (
      !merchantSalaryDecreaseItemsLazyData.loading &&
      merchantSalaryDecreaseItemsLazyData.data !== undefined &&
      !designerFixedSalaryItemsLazyData.loading &&
      designerFixedSalaryItemsLazyData.data !== undefined
    ) {
      const initDecrease = []
      const initDecrease2 = []
      const decreaseReformatted = idx(merchantSalaryDecreaseItemsLazyData, _ =>
        _.data.getMerchantSalaryDecreaseItems.map(data => ({
          itemName: data.itemSetting,
          price: 0,
          type: data.type,
          sorting: data.sorting,
        }))
      )
      const decreaseFixeSalaryItems = idx(
        designerFixedSalaryItemsLazyData,
        _ => _.data.merchantDesigner.fixedSalaryItem.decreaseItem
      )
      if (decreaseFixeSalaryItems !== undefined && decreaseReformatted !== undefined) {
        decreaseReformatted.forEach(data => {
          if (
            decreaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName) !== undefined
          ) {
            initDecrease.push({
              itemName: decreaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName)
                .itemName,
              price: decreaseFixeSalaryItems.find(data2 => data2.itemName === data.itemName).price,
              type: 'DECREASE',
              sorting: data.sorting,
            })
          } else {
            initDecrease.push({
              itemName: data.itemName,
              price: data.price,
              type: data.type,
              sorting: data.sorting,
            })
          }
        })
        decreaseFixeSalaryItems.forEach(data => {
          if (initDecrease.every(data2 => data2.itemName !== data.itemName)) {
            initDecrease2.push({
              itemName: data.itemName,
              price: data.price,
              type: 'DECREASE',
            })
          }
        })
      }

      if (initDecrease.length > 0) {
        setSalaryDecreaseItemsReformatted(initDecrease)
      } else {
        setSalaryDecreaseItemsReformatted(decreaseReformatted)
      }
      if (initDecrease2.length > 0) {
        setDecreaseSecondContent(pre => {
          return { decreaseItems: initDecrease2 }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantSalaryDecreaseItemsLazyData.loading, designerFixedSalaryItemsLazyData.loading])

  useEffect(() => {
    if (!profile.loading) {
      const loginUserAuthName = idx(profile, _ => _.data.me.merchantIdentity.authorityName)
      setLoginUserAuthName(loginUserAuthName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [profile.loading])
  useEffect(() => {
    if (!designer.loading) {
      setDesignerName(idx(designer, _ => _.data.merchantDesigner.name))
      const clickedUserAuthName = idx(
        designer,
        _ => _.data.merchantDesigner.merchantIdentity.authorityName
      )
      setClickedUserAuthName(clickedUserAuthName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designer.loading])

  useEffect(() => {
    if (!merchantAuthData.loading && !profile.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthId = idx(profile, _ => _.data.me.merchantIdentity.authorityId)
      const tmpArr = roleSectionAuthority(merchantAuth, loginUserAuthId, '編輯員工')
      setItemAuthority(tmpArr)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [merchantAuthData.loading, profile.loading])
  const tabValue = [
    { value: 'general', label: '基本資料' },
    { value: 'orderRecord', label: '帳單紀錄' },
    { value: 'profitSharing', label: '抽成設定' },
    { value: 'rakeReport', label: '抽成報表' },
    { value: 'reservation', label: '預約表' },
    { value: 'paySlip', label: '薪資條' },
    { value: 'salaryItems', label: '薪資加扣項' },
    { value: 'security', label: '密碼與安全' },
    { value: 'AttendanceRecord', label: '打卡紀錄' },
  ]
  const tabIcons = {
    general: User,
    orderRecord: Receipt,
    profitSharing: Percent,
    rakeReport: ChartColumn,
    reservation: CalendarDays,
    paySlip: FileText,
    salaryItems: Wallet,
    security: KeyRound,
    AttendanceRecord: Clock,
  }
  // function TabItem(props) {
  const itemValue = []

  // useEffect(() => {
  itemAuthority.forEach(data => {
    tabValue.forEach(data2 => {
      if (data.pageName === data2.label && data.authority === true) {
        itemValue.push({ value: data2.value, label: data2.label })
      }
    })
  })

  const getAttendanceRecord = () => {
    fetchUserAttendanceLazy({
      variables: {
        userInput: { id: id },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [uerAttendanceLazyData.loading])

  const handleTabsChange = (event, newValue) => {
    history.push(newValue)
  }
  const handlePageChange = ({ name, value, key }) => {
    setResultsSetting(
      produce(draft => {
        draft[name].pageOffset = key === 'pageLimit' ? 0 : resultsSetting[name].pageOffset
        draft[name][key] = value
      })
    )
  }

  // 網址分頁不在分頁清單（例如沒帶分頁、手打錯；permission 分頁自初版起不在清單、角色也沒有對應頁面權限）時導回基本資料
  const currentTabItem = tabValue.find(itemValue => itemValue.value === currentTab)
  const findTabName = () => (currentTabItem ? currentTabItem.label : '')

  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      const data = idx(getMerchantCheckinSettings, _ => _.data.getMerchantCheckinSettings)
      // 報到設定查詢失敗時保留預設值，不讓整頁拋錯（2026/10/30 自動掃描發現）
      if (data) setCheckinSettings(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantCheckinSettings.loading])


  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      // 查詢失敗時以 false（不顯示）為預設（Jason 2026/10/22；原本整頁錯誤）
      const data = Boolean(idx(getBookinHistoryDisplay, _ => _.data.getParameterAboutBookingSetting.isBookingHistoryDisplay))
      setBookingHistoryDisplay(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBookinHistoryDisplay.loading])

  if (!currentTabItem) return <Redirect to={`/management/employee/${id}/general`} />

  return (
    <Page className="ui-root min-h-screen" title={`${designerName} - ${findTabName()}`}>
      <PageHeader
        title={`${designerName} - 個人設定`}
      />

      {/* 設定頁樣板（STYLE §12，比照顧客詳細資料）：桌機左選單＋右內容、手機頂部橫向捲動分頁；
          分頁切換仍是 history.push(分頁值)（同舊版點選），activationMode="manual"：方向鍵只移動焦點，Enter／點擊才切換；分頁內容元件不動 */}
      <Tabs
        className="md:flex md:items-stretch"
        onValueChange={value => handleTabsChange(null, value)}
        value={currentTab}
        activationMode="manual"
      >
        <SettingsTabsList aria-label="員工設定分類" className="noprint">
          {itemValue.map(item => (
            <SettingsTabsTrigger key={item.value} value={item.value} icon={tabIcons[item.value]}>{item.label}</SettingsTabsTrigger>
          ))}
        </SettingsTabsList>

        <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
          <SettingsSectionHeading title={findTabName()} />
          {checkinSettings.isBookingCheckinEnabled && currentTab === 'reservation' && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-label text-text-secondary">報到模式</span>
              <Switch
                aria-label="報到模式"
                checked={checkinMode}
                onChange={(e, v) => setCheckinMode(v)}
              />
            </div>
          )}
          <div>
              {currentTab === 'general' && (
                <General
                  designerId={id}
                  setNameInHeader={setNameInHeader}
                  itemAuthority={itemAuthority}
                />
              )}
              {
                currentTab === 'orderRecord' && (getOrderListLazyData.error ? <QueryFailed onRetry={getOrderRecordsData} /> : orderRecords.loading || orderRecords.data === undefined ?
                  <TabLoading /> :
                  idx(
                    orderRecords,
                    _ =>
                      _.data.getOrderList.orderList && (
                        <OrderRecord
                          bonusDisplay={bonusDisplay}
                          results={_.data.getOrderList.orderList}
                          membershipDisplay={membershipDisplay}
                          onChangePage={(_event, page) =>
                            handlePageChange({
                              value: page,
                              key: 'pageOffset',
                              name: 'orders',
                            })
                          }
                          onChangeRowsPerPage={event => {
                            handlePageChange({
                              value: idx(event, _ => _.target.value),
                              key: 'pageLimit',
                              name: 'orders',
                            })
                          }}
                          page={{
                            limit: resultsSetting.orders.pageLimit,
                            offset: resultsSetting.orders.pageOffset,
                            count: _.data.getOrderList.orderList.length,
                          }}
                        />
                      )
                  ))}
              {currentTab === 'AttendanceRecord' && (uerAttendanceLazyData.error ? <QueryFailed onRetry={getAttendanceRecord} /> : uerAttendanceLazyData.loading || uerAttendanceLazyData.data === undefined ?
                <TabLoading /> : idx(attendance, _ =>
                  _.data.user.attendanceRecords && (
                    <AttendanceRecord
                      results={_.data.user.attendanceRecords.records}
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
                        limit: _.data.user.attendanceRecords.pageLimit,
                        offset: _.data.user.attendanceRecords.pageOffset,
                        count: _.data.user.attendanceRecords.totalCount,
                      }}
                    />
                  )
                ))}
              {currentTab === 'rakeReport' && (
                designerRakeReportLazyData.error ? <QueryFailed onRetry={getRakeReport} /> :
                <RakeReport
                  rakeReportDate={rakeReportDate}
                  setRakeReportDate={setRakeReportDate}
                  designerRakeReport={idx(designerRakeReportLazyData, _ => _.data.userRakeReport)}
                  loading={
                    designerRakeReportLazyData.loading || designerRakeReportLazyData.data === undefined
                  }
                />
              )}
              {idx(
                designer,
                _ =>
                  _.data.merchantDesigner && (
                    <Provider value={{ designer: _.data.merchantDesigner }}>
                      {currentTab === 'reservation' && (
                        <DesignerWeekReservation
                          className="pt-4"
                          designerId={id}
                          checkinSettings={checkinSettings}
                          bookingCusCheck={bookingCusCheck}
                          checkinMode={checkinMode}
                          bookingHistoryDisplay={bookingHistoryDisplay}
                        />
                      )}
                      {currentTab === 'security' && (
                        <Security designerId={id} refetch={designer.refetch} />
                      )}
                      {currentTab === 'permission' && <Permission designerId={id} />}
                      {currentTab === 'profitSharing' && (
                        <ProfitSharing
                          designerId={id}
                          refetch={designer.refetch}
                          designerDataLoading={designer.loading}
                          itemAuthority={itemAuthority}
                        />
                      )}
                      {currentTab === 'paySlip' && (
                        <PaySlip
                          userPaySlip={idx(userPaySlip, _ =>
                            _.data.userSalaryReport.filter(d => {
                              return d.userId === id
                            })
                          )}
                          date={getLastMonth}
                          setGetLastMonth={setGetLastMonth}
                          isDisplayFakePerformance={isDisplayFakePerformance}
                          EPWDDisplay={getIsEPWDDisplayLazyData.data.getIsEPWDDisplay}
                          loading={
                            !userSalaryReportLazyData.loading &&
                            userSalaryReportLazyData.data !== undefined &&
                            !getIsDisplayFakePerformanceInSalaryReportLazyData.loading &&
                            getIsDisplayFakePerformanceInSalaryReportLazyData.data !== undefined &&
                            !getIsEPWDDisplayLazyData.loading &&
                            getIsEPWDDisplayLazyData.loading !== undefined
                          }
                        />
                      )}
                      {currentTab === 'salaryItems' && (
                        (
                          merchantSalaryIncreaseItemsLazyData.loading ||
                          merchantSalaryIncreaseItemsLazyData.data === undefined ||
                          designerFixedSalaryItemsLazyData.loading ||
                          designerFixedSalaryItemsLazyData.data === undefined
                        ) ? (merchantSalaryIncreaseItemsLazyData.error || designerFixedSalaryItemsLazyData.error
                          ? <QueryFailed onRetry={getSalaryItems} />
                          : <TabLoading />)
                          : <SalaryItems
                            salaryIncreaseItemsReformatted={salaryIncreaseItemsReformatted}
                            setSalaryIncreaseItemsReformatted={setSalaryIncreaseItemsReformatted}
                            salaryDecreaseItemsReformatted={salaryDecreaseItemsReformatted}
                            setSalaryDecreaseItemsReformatted={setSalaryDecreaseItemsReformatted}
                            increaseSecondContent={increaseSecondContent}
                            setIncreaseSecondContent={setIncreaseSecondContent}
                            decreaseSecondContent={decreaseSecondContent}
                            setDecreaseSecondContent={setDecreaseSecondContent}
                            setUserFixedSalaryItem={setUserFixedSalaryItem}
                            designerId={id}
                            salaryDecreaseItemsReformatted2={salaryDecreaseItemsReformatted2}
                          />
                      )}
                    </Provider>
                  )
              )}
          </div>
        </div>
      </Tabs>
    </Page>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
}

export default Settings
