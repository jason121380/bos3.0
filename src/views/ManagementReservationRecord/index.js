/** @jsxImportSource @emotion/react */
import {
  Card, Container, CircularProgress, Backdrop, Switch,
  Grid, FormControl, InputLabel, Select, MenuItem,
  Typography, Popper, Slider, IconButton, Button,
  Collapse
} from '@mui/material'
import { Tune as TuneIcon } from 'ui/icons'
import Page from 'components/Page'
import useFetchMerchant from 'hooks/useFetchMerchant'
import { useState, useEffect, useRef } from 'react'
import CalendarColorClip from 'components/CalendarColorClip'
import DateSelector from 'components/DateSelector'
import AdminPageHeader from 'components/AdminPageHeader'
import {
  getYear, getMonth, getDate, startOfDay, endOfDay,
  addMinutes, differenceInMinutes, subMinutes, isSameDay
} from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchGetDesignerNameForCustomerSide from 'hooks/useFetchGetDesignerNameForCustomerSide'
import useFetchGetMerchantDesignerCalendar from 'hooks/useFetchGetMerchantDesignerCalendar'
import useFetchGetIsBookingRemarkDisplay from 'hooks/useFetchGetIsBookingRemarkDisplay'
import useFetchGetIsCusBookingRemarkDisplay from 'hooks/useFetchGetIsCusBookingRemarkDisplay'
import useFetchGetParameterAboutSettingFunction from 'hooks/useFetchGetParameterAboutSettingFunction'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetBookingTypeForSocket from 'hooks/useFetchGetBookingTypeForSocket'
import { useFetchGetBookinHistoryDisplay } from 'hooks/useFetchGetParameterAboutBookingSetting'
import { useFetchGetCancelBookingUsing } from 'hooks/useFetchMerchantPassword'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import { useSelector } from 'react-redux'
import produce from 'immer';

import OrderTable from './OrderTable'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  }),
  card: css({
    marginTop: theme.spacing(1.5),
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
  }),
  cardHeader: css({
    textAlign: 'center',
    fontSize: '36px',
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    boxShadow: '5px 2px 5px grey',
    borderRight: '2px solid black',
  }),
  opacity: css({
    opacity: '1 !important',
    zIndex: 999,
    background: 'rgba(0,0,0,0) !important',
  }),
  headerWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > div': {
      width: 'fit-content',
    }
  })
}

function Calendar() {
  const reservationData = useSelector(state => state.reservation.reservationData)
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const merchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const nameType = useFetchGetDesignerNameForCustomerSide()
  const bookingRemarkDisplay = useFetchGetIsBookingRemarkDisplay()
  const cusBookingRemarkDisplay = useFetchGetIsCusBookingRemarkDisplay()
  const getEventDisplay = useFetchGetParameterAboutSettingFunction()
  const getMerchantCheckinSettings = useFetchGetCheckinSettingsForCalendar()
  const getBookingTypeForSocket = useFetchGetBookingTypeForSocket()
  const getBookinHistoryDisplay = useFetchGetBookinHistoryDisplay()
  const cancelBookingUsing = useFetchGetCancelBookingUsing()

  const [date, setDate] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const DesignerCalendar = useFetchGetMerchantDesignerCalendar({
    input: {
      dateRange: date
    }
  })
  const merchant = useFetchMerchant()
  const [orderRange, setOrderRange] = useState([])
  const [remarkDisplay, setRemarkDisplay] = useState(false)
  const [cusRemarkDisplay, setCusRemarkDisplay] = useState(false)
  const [calendarData, setCalendarData] = useState({
    designate: [],
    nonDesignate: []
  })
  const [calendarRowData, setCalendarRowData] = useState({
    designate: [],
    nonDesignate: null,
    changeData: null
  })
  const [designerName, setDesignerName] = useState('NAME')
  const [eventDisplay, setEventDisplay] = useState(false)
  const [checkinSettings, setCheckinSettings] = useState({
    isBookingCheckinEnabled: false,
    isUnDoneBookingManualNotify: false,
  })
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [checkinMode, setCheckinMode] = useState(false)
  const [checkedType, setCheckedType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editOrder, setEditOrder] = useState({})
  const [unCheckDisplay, setUnCheckDisplay] = useState(true)
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)
  const [calendarSize, setCalendarSize] = useState({
    width: 95,
    height: 40,
    breakHeight: 45
  })
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const open = Boolean(anchorEl);
  const ndsRef = useRef([])

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
  };

  const handleRefetch = () => {
    DesignerCalendar.refetch()
    ndsRef.current = []
  }

  const handleTidyOrder = (tidyData, startTime, nondes = false) => {
    const arr = []
    const finalData = []

    tidyData.map(des => {
      const countOrder = {}
      const countHoliday = {}
      const { calendar, ...rest } = des
      calendar.sort((a, b) => a.startTime - b.startTime)
      const checkHorR = (cost, startTime, isOrder, isDone = false) => {

        for (let i = 0; i < cost; i++) {
          const time = addMinutes(startTime, 30 * i).getTime()
          if (isOrder) {
            if (countOrder[time] === undefined) {
              countOrder[time] = (isDone ? 0 : 1)
            } else {
              countOrder[time] = countOrder[time] + (isDone ? 0 : 1)
            }
          } else {
            if (checkinMode) return
            if (!countHoliday[time]) {
              countHoliday[time] = 1
            } else {
              countHoliday[time] = countHoliday[time] + 1
            }
          }
        }
      }
      const isOrder = []
      const isBreak = []
      calendar.forEach((item, index) => {
        const style = {};
        const {
          timeCost, startTime, bookingStatus, isDesignate, isCusCheckRequired, isCheckin,
          isDone, createdOrderId, isNoShow
        } = item
        if (!unCheckDisplay && bookingStatus === '待審核') return
        if (checkinSettings.isBookingCheckinEnabled && item.type === 'RESERVATION') {
          if (checkedType !== '') {
            if (isCheckin !== checkedType) return
          }
        }
        if (checkinMode) {
          if (item.type === 'RESERVATION' && !isDone) {
            style.height = `${timeCost * calendarSize.height - 2}px`
            item.isBookingCostUsing && checkHorR(timeCost, startTime, true)
            style.backgroundColor = isCheckin ? 'green' : '#78909c'
          } else if (isDone) return
        } else {
          switch (item.type) {
            case 'RH':
              style.backgroundColor = '#202D50'
              style.height = `${timeCost * calendarSize.height - 2}px`
              calendar[index].type = 'HOLIDAY'
              checkHorR(timeCost, startTime, false)
              break;
            case 'HOLIDAY':
              style.backgroundColor = '#202D50'
              style.height = `${timeCost * calendarSize.height - 2}px`
              checkHorR(timeCost, startTime, false)
              break;
            case 'EVENT':
              style.backgroundColor = '#66BB6A'
              style.height = `${timeCost * calendarSize.height - 2}px`
              break;
            case 'RESERVATION':
              style.height = `${timeCost * calendarSize.height - 2}px`
              item.isBookingCostUsing && checkHorR(timeCost, startTime, true, isDone)
              switch (bookingStatus) {
                case '預約成功':
                  style.backgroundColor = isDesignate ? '#1A73E8' : '#F06292'
                  // item.nameToDisplay = item.nameToDisplay + ` - ${isDesignate ? '預約成功(指定)' : '預約成功(不指定)'}`
                  break;
                case '待審核':
                  style.backgroundColor = '#4FC3F7'
                  // item.nameToDisplay = item.nameToDisplay + ' - 待審核'
                  break;
                case '已完成':
                  style.backgroundColor = '#AB47BC'
                  break;
                default:
                  break;
              }
              break;
          }

          if (isCusCheckRequired && bookingCusCheck) {
            style.backgroundColor = '#FF9800'
          }

          if (isDone) {
            style.backgroundColor = '#BDBDBD'
          }

        }
        const customData = {
          nameToDisplay: item.nameToDisplay,
          type: item.type,
          designer: rest.designerName,
          start: item.startTime,
          end: item.endTime,
          timeCost: item.timeCost,
          isDesignate: item.isDesignate,
          remarkForCustomer: item.remarkForCustomer,
          remark: item.remark,
          customerId: item.customerId,
          isUnwelcome: item.isUnwelcome,
          bookingStatus: item.bookingStatus,
          isBookingCostUsing: item.isBookingCostUsing,
          customerCellphone: item.customerCellphone,
          companionCount: item.companionCount,
          notificationDayCount: item.notificationDayCount,
          notificationDate: item.notificationDate,
          displayBirthdayIcon: item.displayBirthdayIcon,
          isCheckin: item.isCheckin,
          isCusCheckRequired,
          isDone,
          createdOrderId,
          isNoShow
        };

        if (item.type === 'RESERVATION' || item.type === 'EVENT') {
          if (checkinMode && (item.type === 'EVENT' || item.isDone)) return
          isOrder.push({
            key: item.ids.length ? item.ids[0] : `${item.type}-${index}`,
            customData,
            dates: item.startTime,
            style
          })
        } else {
          isBreak.push({
            key: item.ids.length ? item.ids[0] : `${item.type}-${index}`,
            customData,
            dates: item.startTime,
            style
          })
        }

        return {
          key: item.ids.length ? item.ids[0] : `${item.type}-${index}`,
          customData,
          dates: item.startTime,
          style
        };
      })

      arr.push({
        ...rest, countOrder, countHoliday, isBreak, isOrder
      })
    });

    arr.forEach(({ isBreak, isOrder, ...d }) => {
      const isOrderGroups = [];
      const isBreakGroups = [];
      let length = 1
      let breakLength = 0
      for (let i = 0; i < isBreak.length; i++) {
        const parentStyle = {}
        const time1 = isBreak[i];
        if (time1.isProcessed) continue; // 跳過已處理過的時間

        const currentGroup = [time1];
        for (let j = i + 1; j < isBreak.length; j++) {
          const time2 = isBreak[j];
          if (time2.isProcessed) {
            continue;
          } // 跳過已處理過的時間

          if (
            // 判斷時間是否重疊
            (time2.customData.start >= time1.customData.start && time2.customData.start < time1.customData.end)
            || (time2.customData.end > time1.customData.start && time2.customData.end <= time1.customData.end)
            || (time2.customData.start <= time1.customData.start && time2.customData.end >= time1.customData.end)
          ) {
            currentGroup.push(time2);
            time2.isProcessed = true; // 標記已處理過的時間
          }
        }
        const firstTime = currentGroup[0].dates
        const distance = differenceInMinutes(new Date(firstTime), new Date(startTime)) / 30
        parentStyle.top = `${Math.abs(distance) * calendarSize.height + 1}px`
        if (nondes) {
          parentStyle.left = `1px`
        }
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(firstTime), new Date(d.dates)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * calendarSize.height + 1}px`
          }
        })

        if (!checkinMode) {
          isBreakGroups.push({ data: currentGroup, parentStyle });
          if (currentGroup.length >= breakLength) {
            breakLength = currentGroup.length + 1
          }
        }
      }
      for (let i = 0; i < isOrder.length; i++) {
        const parentStyle = {}
        const time1 = isOrder[i];
        if (time1.isProcessed) continue; // 跳過已處理過的時間

        const currentGroup = [time1];
        for (let j = i + 1; j < isOrder.length; j++) {
          const time2 = isOrder[j];
          if (time2.isProcessed) {
            continue;
          } // 跳過已處理過的時間

          if (
            // 判斷時間是否重疊
            (time2.customData.start >= time1.customData.start && time2.customData.start < time1.customData.end)
            || (time2.customData.end > time1.customData.start && time2.customData.end <= time1.customData.end)
            || (time2.customData.start <= time1.customData.start && time2.customData.end >= time1.customData.end)
          ) {
            currentGroup.push(time2);
            time2.isProcessed = true; // 標記已處理過的時間
          }
        }
        const firstTime = currentGroup[0].dates
        const distance = differenceInMinutes(new Date(firstTime), new Date(startTime)) / 30
        parentStyle.top = `${Math.abs(distance) * calendarSize.height + 1}px`
        if (nondes) {
          parentStyle.left = `1px`
        }
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(firstTime), new Date(d.dates)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * calendarSize.height + 1}px`
          }
        })

        isOrderGroups.push({ data: currentGroup, parentStyle });
        if (currentGroup.length >= length) {
          length = currentGroup.length + 1
        }
      }
      finalData.push({
        ...d,
        length,
        breakLength,
        isOrderGroups,
        isBreakGroups
      })
    })
    return finalData
  }

  const handleSetTimeRange = (desData, ndsData) => {
    const [startHour, startMinute] = merchant.data.merchant.openingHours.slice(0, 5).split(':')
    const [closeHour, closeMinute] = merchant.data.merchant.closingHours.slice(0, 5).split(':')

    const year = getYear(date.startDate)
    const month = getMonth(date.startDate)
    const day = getDate(date.startDate)

    let orderTimeStart = new Date(year, month, day, startHour, startMinute).getTime()
    let orderTimeEnd = new Date(year, month, day, closeHour, closeMinute).getTime()
    const arr = []

    ndsData.forEach(({ startTime, endTime }) => {
      if (startTime < orderTimeStart) orderTimeStart = startTime
      if (endTime > orderTimeEnd) {
        orderTimeEnd = subMinutes(endTime, 30).getTime()
      }
    })
    desData.forEach(({ calendar }) => {
      calendar.forEach(({ startTime, endTime, type }) => {
        if (type !== 'RESERVATION' && type !== 'EVENT') return
        if (startTime < orderTimeStart) orderTimeStart = startTime
        if (endTime > orderTimeEnd) {
          orderTimeEnd = subMinutes(endTime, 30).getTime()
        }
      })
    })

    // if (startMinute === 30) {
    //   arr.push('')
    // }

    for (let i = orderTimeStart; i <= orderTimeEnd; i += 1800000) {
      arr.push(i)
    }

    // if (closeMinute === 30) {
    //   arr.push('')
    // }
    setOrderRange(arr)
    return arr
  }

  useEffect(() => {
    if (!DesignerCalendar.loading) {
      const data = DesignerCalendar.data.getMerchantDesignerCalendar
      setCalendarRowData({
        designate: data.merchantDesignerCalendar,
        nonDesignate: data.nonDesignateCalendar,
        changeData: null
      })
    }
  }, [DesignerCalendar.loading])

  useEffect(() => {
    if (reservationData) {
      const { calendarData, ...changeData } = JSON.parse(reservationData)
      if (isSameDay(new Date(changeData.date), new Date(date.startDate))) {
        setCalendarRowData({
          designate: calendarData.merchantDesignerCalendar,
          nonDesignate: calendarData.nonDesignateCalendar,
          changeData: changeData
        })
      }
    }
  }, [reservationData])

  useEffect(() => {
    if (calendarRowData.nonDesignate && !merchant.loading) {
      const timeRange = handleSetTimeRange(calendarRowData.designate, calendarRowData.nonDesignate.calendar)
      const designate = handleTidyOrder(calendarRowData.designate, timeRange[0])
      const nonDesignate = handleTidyOrder([calendarRowData.nonDesignate], timeRange[0], true)
      setCalendarData({
        designate, nonDesignate: nonDesignate[0]
      })
      if (calendarRowData.changeData && (unCheckDisplay || calendarRowData.changeData.bookingStatus !== 'UNCHECK')) {
        const { actionType, bookingDataId } = calendarRowData.changeData
        switch (actionType) {
          case 'CREATE':
            openSnackbar({
              variant: 'success',
              message: '有一筆新預約'
            })
            break;
          default:
            openSnackbar({
              variant: 'warning',
              message: '預約紀錄已更新'
            })
            if (bookingDataId === editOrder.id) {
              setModalOpen(false)
            }
            break;
        }

      }
    }

  }, [
    checkinMode, checkinSettings.isBookingCheckinEnabled,
    calendarRowData, checkedType, unCheckDisplay, merchant.loading,
    calendarSize
  ])

  useEffect(() => {
    if (!nameType.loading) {
      const data = nameType.data.getDesignerNameForCustomerSide
      setDesignerName(data)
    }
  }, [nameType.loading])

  useEffect(() => {
    if (!bookingRemarkDisplay.loading) {
      const data = bookingRemarkDisplay.data.getIsBookingRemarkDisplay
      setRemarkDisplay(data)
    }
  }, [bookingRemarkDisplay.loading])

  useEffect(() => {
    if (!cusBookingRemarkDisplay.loading) {
      const data = cusBookingRemarkDisplay.data.getIsCusBookingRemarkDisplay
      setCusRemarkDisplay(data)
    }
  }, [cusBookingRemarkDisplay.loading])

  useEffect(() => {
    if (!getEventDisplay.loading) {
      const data = getEventDisplay.data.getParameterAboutSettingFunction.isEventDisplayOnDayBookingRecord
      setEventDisplay(data)
    }
  }, [getEventDisplay.loading])

  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      const data = getMerchantCheckinSettings.data.getMerchantCheckinSettings
      setCheckinSettings(data)
    }
  }, [getMerchantCheckinSettings.loading])

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = getIsBookingCusCheckUsing.data.getIsBookingCusCheckUsing
      setBookingCusCheck(data)
    }
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    if (!getBookingTypeForSocket.loading) {
      const data = getBookingTypeForSocket.data.getBookingTypeForSocket
      setUnCheckDisplay(data.includes('UNCHECK'))
    }
  }, [getBookingTypeForSocket.loading])

  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      const data = getBookinHistoryDisplay.data.getParameterAboutBookingSetting.isBookingHistoryDisplay
      setBookingHistoryDisplay(data)
    }
  }, [getBookinHistoryDisplay.loading])

  return (
    <Page title="單日預約紀錄">
      <Backdrop id='Backdrop' css={styles.opacity} open={!(!merchant.loading && !DesignerCalendar.loading && orderRange.length && (calendarData.designate.length || calendarData.nonDesignate.length))}>
        <CircularProgress />
      </Backdrop>
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title="單日預約紀錄"
          onFilterClick={handleFilterClick}
          showFilter={showFilter}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <DateSelector
              date={date}
              attributes={['today', 'tomorrow', 'datomorrow', 'startDate']}
              dateChange={value => setDate(value)}
              onlyStart
            />
          </div>
        </AdminPageHeader>

        <Collapse in={showFilter}>
          <Card sx={{
            mb: 2,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '24px',
            border: '1px solid rgb(var(--border))',
            flexWrap: 'wrap'
          }}>
            {checkinSettings.isBookingCheckinEnabled && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                backgroundColor: checkinMode ? 'rgba(26, 115, 232, 0.05)' : 'rgb(var(--surface))',
                borderRadius: '10px',
                border: checkinMode ? '1px solid rgba(26, 115, 232, 0.2)' : '1px solid rgb(var(--border))',
                transition: 'all 0.3s ease',
                minWidth: '180px'
              }}>
                <Typography sx={{ fontSize: 14, fontWeight: '800', color: 'rgb(var(--text))' }}>報到模式</Typography>
                <Switch
                  size="small"
                  checked={checkinMode}
                  onChange={(e, v) => {
                    setCheckinMode(v)
                    if (!v) setCheckedType('')
                  }}
                  color="primary"
                />
              </div>
            )}

            {checkinSettings.isBookingCheckinEnabled && checkinMode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeIn 0.3s ease'
              }}>
                <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: 'rgb(var(--text-secondary))', whiteSpace: 'nowrap' }}>報到狀態篩選</Typography>
                <FormControl variant="outlined" size="small" style={{ minWidth: '140px' }}>
                  <Select
                    onChange={e => setCheckedType(e.target.value)}
                    value={checkedType}
                    sx={{ borderRadius: '8px', backgroundColor: 'rgb(var(--background))' }}
                    displayEmpty
                  >
                    <MenuItem value=""><em>全部顯示</em></MenuItem>
                    <MenuItem value={true}>報到成功</MenuItem>
                    <MenuItem value={false}>未報到</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}
          </Card>
        </Collapse>
        <div style={{ marginTop: '12px' }}>
          <div css={styles.headerWrap} style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <CalendarColorClip
              eventDisplay={eventDisplay}
              bookingCusCheck={bookingCusCheck}
              checkinMode={checkinMode}
              bookingHistoryDisplay={bookingHistoryDisplay}
            />
            <IconButton onClick={handleClick} sx={{ color: 'rgb(var(--accent))' }}>
              <TuneIcon />
            </IconButton>
            <Popper placement='left-start' open={open} anchorEl={anchorEl} style={{ zIndex: 20 }}>
              <Card style={{ padding: '14px 18px 14px 14px', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <span style={{ wordBreak: 'keep-all' }}>寬度</span>
                  <Slider
                    style={{ width: 150 }}
                    sx={{ color: 'rgb(var(--accent))' }}
                    max={150}
                    value={calendarSize.width}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => {
                      setCalendarSize(
                        produce(draft => {
                          draft.width = v
                        })
                      )
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <span style={{ wordBreak: 'keep-all' }}>高度</span>
                  <Slider
                    style={{ width: 150 }}
                    sx={{ color: 'rgb(var(--accent))' }}
                    max={70}
                    value={calendarSize.height}
                    valueLabelDisplay="auto"
                    onChange={(e, v) => {
                      setCalendarSize(
                        produce(draft => {
                          draft.height = v
                        })
                      )
                    }}
                  />
                </div>
              </Card>
            </Popper>
          </div>
          {(!merchant.loading && orderRange.length && (calendarData.designate.length || calendarData.nonDesignate.length)) ?
            <OrderTable
              orderRange={orderRange}
              calendarData={calendarData}
              designerNameType={designerName}
              merchantId={merchantId}
              remarkDisplay={remarkDisplay}
              cusRemarkDisplay={cusRemarkDisplay}
              bookingCusCheck={bookingCusCheck}
              refetchData={handleRefetch}
              ndsRef={ndsRef}
              checkinSettings={checkinSettings}
              loading={DesignerCalendar.loading}
              checkinMode={checkinMode}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              editOrder={editOrder}
              setEditOrder={setEditOrder}
              calendarSize={calendarSize}
              cancelPasswordUsing={cancelBookingUsing.loading ? false : cancelBookingUsing.data.merchantPassword.cancelReservation.isUsing}
            /> : ''
          }
        </div>
      </Container>
    </Page >
  )
}

export default Calendar
