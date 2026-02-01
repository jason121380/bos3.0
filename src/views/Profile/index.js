/** @jsxImportSource @emotion/react */
import {
  Container, Divider, Tab, Tabs, colors, CircularProgress, Grid, Switch,
  Typography
} from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'
import OrderRecord from './OrderRecord'
import Permission from './Permission'
import Reservation from './Reservation'
import HelperSelfRecord from './HelperSelfRecord'
import Security from './Security'
import PinnedTable from './PinnedTable'
import PaySlip from './PaySlip'
import RakeReport from './RakeReport'
import AttendanceRecord from './AttendanceRecord'
import DesignerSelfRecord from './DesignerSelfRecord'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  tabs: css({
    marginTop: theme.spacing(1),
  }),
  divider: css({
    backgroundColor: colors.grey[300] + '!important',
    borderColor: colors.grey[300] + '!important',
  }),
  content: css({
    marginTop: theme.spacing(3),
  }),
}

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
    { value: 'orderRecord', label: '訂單紀錄' },
    { value: 'reservation', label: '預約表' },
    { value: 'designerSelfRecord', label: '設計師日報表' },
    { value: 'helperSelfRecord', label: '互助日報表' },
    { value: 'rakeReport', label: '抽成報表' },
    { value: 'paySlip', label: '薪資條' },
    { value: 'security', label: '密碼設定' },
    { value: 'AttendanceRecord', label: '打卡紀錄' },
    { value: 'pinnedTable', label: '功能釘選' },
  ]
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
      const data = getBookinHistoryDisplay.data.getParameterAboutBookingSetting.isBookingHistoryDisplay
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
      const loginUserAuthName = idx(profile, _ => _.data.me.merchantIdentity.authorityName)
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)

      const tmpArr = JSON.parse(userAuth[0].authoritySettings).filter(
        d => d.pageTitle === '個人檔案'
      )[0].pageAuthority
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
      !memberActiveLazyData.loading && memberActiveLazyData.data !== undefined
    ) {
      const performance = idx(getOrderListLazyData, _ => _.data.getOrderList.intervalSummary.membership)
      const active = idx(memberActiveLazyData, _ => _.data.getIsMemberShipCardActive)
      const length = idx(getOrderListLazyData, _ => _.data.getOrderList.orderList.length)
      const bonusDecount = getOrderListLazyData.data.getOrderList.intervalSummary.bonusDecountForReport
      setOrderRecords(getOrderListLazyData)
      setBonusDisplay(customerBonusActiveData.data.getIsCustomerBonusActive || bonusDecount !== 0)
      setOrderLength(length)
      setMembershipDisplay(active || performance !== 0)
    }
  }, [getOrderListLazyData.loading, memberActiveLazyData.loading])

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
      setReport(reportData)
      setDisplayReport(false)
    }
  }, [userHelperRetrieveLazyData.loading])

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

  const findTabName = () => {
    const findData = tabValue.find(itemValue => itemValue.value === currentTab)
    return findData.label
  }

  return (
    <Page css={styles.root} title={`${profile.data.me.name} - ${findTabName()}`}>
      <Container maxWidth="lg">
        <Grid container justifyContent='space-between' alignItems='center' >
          <Grid item>
            <PageTitle title='變更帳戶資訊' subTitle='設定' />
          </Grid>
          {checkinSettings.isBookingCheckinEnabled && currentTab === 'reservation' && (
            <Grid className='CheckinMode' style={{ display: 'flex', alignItems: 'center' }} item >
              <Typography sx={{ fontSize: 16 }}>報到模式</Typography><Switch checked={checkinMode} onChange={(e, v) => setCheckinMode(v)} />
            </Grid>
          )}
        </Grid>
        {itemValue.length > 0 ? (
          <Tabs
            css={styles.tabs}
            onChange={handleTabsChange}
            scrollButtons="auto"
            value={currentTab}
            variant="scrollable"
          >
            {itemValue.map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
            <Tab label='功能釘選' value='pinnedTable' />
          </Tabs>
        ) : null}
        <Divider css={styles.divider} />
        <div css={styles.content}>
          {currentTab === 'general' && <General />}
          {currentTab === 'orderRecord' && (
            getOrderListLazyData.loading || getOrderListLazyData.data === undefined ?
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 150 }}>
                <CircularProgress />
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
            <Reservation
              designerId={employeeId}
              checkinSettings={checkinSettings}
              bookingCusCheck={bookingCusCheck} 
              checkinMode={checkinMode}
              bookingHistoryDisplay={bookingHistoryDisplay}
            />
          )}
          {currentTab === 'helperSelfRecord' && (
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
            uerAttendanceLazyData.loading || uerAttendanceLazyData.data === undefined ?
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 150 }}>
                <CircularProgress />
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
      </Container>
    </Page>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
}

export default Settings
