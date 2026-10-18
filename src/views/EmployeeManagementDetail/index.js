/** @jsxImportSource @emotion/react */
import {
  Container, Divider, Tab, Tabs, colors, CircularProgress, Grid, Switch,
  Typography
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
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
import useFetchProfile from 'hooks/useFetchProfile'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { startOfDay, endOfDay } from 'date-fns'
import useFetchSettingUserFixedSaleryItem from 'hooks/useFetchSettingUserFixedSalaryItem'
import { useFetchGetIsEPWDDisplayLazy } from 'hooks/useFetchGetIsEPWDDisplay'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'

import AttendanceRecord from './AttendanceRecord'
import General from './General'
import OrderRecord from './OrderRecord'
import Permission from './Permission'
import ProfitSharing from './ProfitSharing'
import Reservation from './Reservation'
import Security from './Security'
import PaySlip from './PaySlip'
import RakeReport from './RakeReport'
import SalaryItems from './SalaryItems'

const styles = {
  root: css({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    minHeight: '100vh',
  }),
  sidebar: css({
    backgroundColor: 'transparent',
    padding: '0px',
    border: 'none',
    position: 'sticky',
    top: theme.spacing(2),
  }),
  menuItem: (active) => css({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '8px',
    backgroundColor: 'transparent',
    color: active ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
    fontWeight: active ? 'bold' : 500,
    fontSize: '14.5px',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface))',
    },
  }),
  content: css({
    backgroundColor: 'transparent',
  }),
}

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
    }
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
  }, [designerRakeReportLazyData.loading])

  useEffect(() => {
    getRakeReport()
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
  }, [merchantSalaryDecreaseItemsLazyData.loading, designerFixedSalaryItemsLazyData.loading])

  useEffect(() => {
    if (!profile.loading) {
      const loginUserAuthName = idx(profile, _ => _.data.me.merchantIdentity.authorityName)
      setLoginUserAuthName(loginUserAuthName)
    }
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
  }, [designer.loading])

  useEffect(() => {
    if (!merchantAuthData.loading && !profile.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthName = idx(profile, _ => _.data.me.merchantIdentity.authorityName)
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)

      const tmpArr = JSON.parse(userAuth[0].authoritySettings).filter(
        d => d.pageTitle === '編輯員工'
      )[0].pageAuthority
      setItemAuthority(tmpArr)
    }
  }, [merchantAuthData.loading, profile.loading])
  const tabValue = [
    { value: 'general', label: '基本資料' },
    { value: 'orderRecord', label: '訂單紀錄' },
    { value: 'profitSharing', label: '抽成設定' },
    { value: 'rakeReport', label: '抽成報表' },
    { value: 'reservation', label: '預約表' },
    { value: 'paySlip', label: '薪資條' },
    { value: 'salaryItems', label: '薪資加扣項' },
    { value: 'security', label: '密碼與安全' },
    { value: 'AttendanceRecord', label: '打卡紀錄' },
  ]
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

  const findTabName = () => {
    const findData = tabValue.find(itemValue => itemValue.value === currentTab)
    return findData.label
  }

  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      const data = idx(getMerchantCheckinSettings, _ => _.data.getMerchantCheckinSettings)
      setCheckinSettings(data)
    }
  }, [getMerchantCheckinSettings.loading])


  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      const data = getBookinHistoryDisplay.data.getParameterAboutBookingSetting.isBookingHistoryDisplay
      setBookingHistoryDisplay(data)
    }
  }, [getBookinHistoryDisplay.loading])

  return (
    <Page css={styles.root} title={`${designerName} - ${findTabName()}`}>
      <Container maxWidth={false}>
        <AdminPageHeader title={`${designerName} - 個人設定`} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={2.5} lg={2}>
            <div css={styles.sidebar}>
              {itemValue.map(item => (
                <div
                  key={item.value}
                  css={styles.menuItem(currentTab === item.value)}
                  onClick={() => history.push(item.value)}
                >
                  {item.label}
                </div>
              ))}
              {checkinSettings.isBookingCheckinEnabled && currentTab === 'reservation' && (
                <div style={{ marginTop: '24px', padding: '16px 20px', borderTop: '1px solid #eee' }}>
                  <Typography sx={{ fontSize: 14, color: 'rgb(var(--text-secondary))', mb: 1 }}>報到模式</Typography>
                  <Switch
                    checked={checkinMode}
                    onChange={(e, v) => setCheckinMode(v)}
                    size="small"
                  />
                </div>
              )}
            </div>
          </Grid>

          <Grid item xs={12} md={9.5} lg={10}>
            <div css={styles.content}>
              {currentTab === 'general' && (
                <General
                  designerId={id}
                  setNameInHeader={setNameInHeader}
                  itemAuthority={itemAuthority}
                />
              )}
              {
                currentTab === 'orderRecord' && (orderRecords.loading || orderRecords.data === undefined ?
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 150 }}>
                    <CircularProgress />
                  </div> :
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
              {currentTab === 'AttendanceRecord' && (uerAttendanceLazyData.loading || uerAttendanceLazyData.data === undefined ?
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 150 }}>
                  <CircularProgress />
                </div> : idx(attendance, _ =>
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
                        <Reservation
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
                        ) ? <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 150 }}>
                          <CircularProgress />
                        </div>
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
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
}

export default Settings
