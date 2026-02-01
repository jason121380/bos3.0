/** @jsxImportSource @emotion/react */
import {
  Card, Container, CircularProgress, Backdrop, Grid,
  FormControl, InputLabel, Select, MenuItem , Popper,
  Slider, IconButton, Switch, Typography
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune';
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import useFetchMerchant from 'hooks/useFetchMerchant'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import CalendarColorClip from 'components/CalendarColorClip'
import DateSelector from 'components/DateSelector'
import {
  getYear, getMonth, getDate, addMinutes, differenceInMinutes, startOfWeek,
  endOfWeek, addDays, format, isSameDay, getHours, getMinutes, setHours, setMinutes,
  startOfDay
} from 'date-fns'
import useFetchGetDesignerNameForCustomerSide from 'hooks/useFetchGetDesignerNameForCustomerSide'
import useFetchGetMerchantDesignerWeekCalendar from 'hooks/useFetchGetMerchantDesignerWeekCalendar'
import useFetchGetIsBookingRemarkDisplay from 'hooks/useFetchGetIsBookingRemarkDisplay'
import useFetchGetIsCusBookingRemarkDisplay from 'hooks/useFetchGetIsCusBookingRemarkDisplay'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import { useFetchGetBookinHistoryDisplay } from 'hooks/useFetchGetParameterAboutBookingSetting'
import { useFetchGetCancelBookingUsing } from 'hooks/useFetchMerchantPassword'
import { cloneDeep } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer';

import OrderTable from './OrderTable'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: 0,
  }),
  card: css({
    marginTop: theme.spacing(3),
    padding: '0px 20px 20px',
    // width: 'fit-content',
    // marginRight: 'auto',
    // marginLeft: 'auto'
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
  }),
  autoComplete: css({
    width: '200px' + '!important'
  }),
}

function Calendar() {
  const merchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const nameType = useFetchGetDesignerNameForCustomerSide()
  const bookingRemarkDisplay = useFetchGetIsBookingRemarkDisplay()
  const cusBookingRemarkDisplay = useFetchGetIsCusBookingRemarkDisplay()
  const getMerchantCheckinSettings = useFetchGetCheckinSettingsForCalendar()
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const getBookinHistoryDisplay = useFetchGetBookinHistoryDisplay()
  const cancelBookingUsing = useFetchGetCancelBookingUsing()
  const [designerId, setDesignerId] = useState([''])
  const [date, setDate] = useState(startOfWeek(new Date()).getTime())
  const DesignerCalendar = useFetchGetMerchantDesignerWeekCalendar({
    input: {
      dateRange: {
        startDate: startOfWeek(date).getTime(),
        endDate: endOfWeek(date).getTime()
      },
      designerIds: designerId.length === 1 && designerId[0] === '' ? [] : designerId
    }
  })
  const merchant = useFetchMerchant()
  const [orderRange, setOrderRange] = useState([])
  const [remarkDisplay, setRemarkDisplay] = useState(false)
  const [cusRemarkDisplay, setCusRemarkDisplay] = useState(false)
  const [calendarData, setCalendarData] = useState([])
  const [designerName, setDesignerName] = useState('NAME')
  const [checkinSettings, setCheckinSettings] = useState({
    isBookingCheckinEnabled: false,
    isUnDoneBookingManualNotify: false,
  })
  const [openTime, setOpenTime] = useState({
    open: {
      hour: '',
      minute: '',
    },
    close: {
      hour: '',
      minute: '',
    }
  })
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [checkinMode, setCheckinMode] = useState(false)
  const [checkedType, setCheckedType] = useState('')
  const [calendarSize, setCalendarSize] = useState({
    width: 150,
    height: 70,
    breakWidth: 75
  })
  const [anchorEl, setAnchorEl] = useState(null);
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)
  const open = Boolean(anchorEl);
  const ndsRef = useRef([])

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return ' 週(一)'
      case 'Tuesday':
        return ' 週(二)'
      case 'Wednesday':
        return ' 週(三)'
      case 'Thursday':
        return ' 週(四)'
      case 'Friday':
        return ' 週(五)'
      case 'Saturday':
        return ' 週(六)'
      case 'Sunday':
        return ' 週(日)'
      default:
        break
    }
  }

  const handleRefetch = () => {
    DesignerCalendar.refetch()
    ndsRef.current = []
  }

  const handleTidyOrder = (tidyData, unpointData, startTime) => {
    const start = startOfWeek(date).getTime()
    const week = []
    const allOrder = []
    const isOne = designerId.length === 1 && designerId[0] !== ''
    tidyData.forEach((data, index) => {
      const { calendar, ...rest } = data
      calendar.forEach((order, index) => {
        const style = {};
        const {
          timeCost, bookingStatus, isDesignate, isCusCheckRequired, isCheckin,
          isDone, createdOrderId, isNoShow
        } = order

        if (checkinSettings.isBookingCheckinEnabled && order.type === 'RESERVATION') {
          if (checkedType !== '') {
            if (isCheckin !== checkedType) return
          }
        }

        if (checkinMode) {
          if (order.type === 'RESERVATION' && !isDone) {
            style.height = `${timeCost * calendarSize.height - 2}px`
            style.backgroundColor = isCheckin ? 'green' : '#78909c'
          } else if (isDone) return
        } else {
          switch (order.type) {
            case 'RH':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * calendarSize.height - 1}px`
              calendar[index].type = 'HOLIDAY'
              // checkHorR(timeCost, startTime, false)
              break;
            case 'HOLIDAY':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * calendarSize.height - 1}px`
              // checkHorR(timeCost, startTime, false)
              break;
            case 'SH':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * calendarSize.height - 1}px`
              calendar[index].type = 'HOLIDAY'
              // checkHorR(timeCost, startTime, false)
              break;
            case 'RESERVATION':
              style.height = `${timeCost * calendarSize.height - 1}px`
              // order.isBookingCostUsing && checkHorR(timeCost, startTime, true)
              switch (bookingStatus) {
                case '預約成功':
                  style.backgroundColor = isDesignate ? '#005fff' : '#e56969'
                  // item.nameToDisplay = item.nameToDisplay + ` - ${isDesignate ? '預約成功(指定)' : '預約成功(不指定)'}`
                  break;
                case '待審核':
                  style.backgroundColor = '#69b8dd'
                  // item.nameToDisplay = item.nameToDisplay + ' - 待審核'
                  break;
                case '已完成':
                  style.backgroundColor = 'purple'
                  break;
                default:
                  break;
              }
              break;
          }
  
          if (isCusCheckRequired && bookingCusCheck) {
            style.backgroundColor = '#ff9800'
          }

          if (isDone) {
            style.backgroundColor ='#9a9a9a'
          }

        }

        const customData = {
          nameToDisplay: order.nameToDisplay,
          type: order.type,
          designer: rest.designerName,
          start: order.startTime,
          end: order.endTime,
          timeCost: order.timeCost,
          isDesignate: order.isDesignate,
          remarkForCustomer: order.remarkForCustomer,
          remark: order.remark,
          customerId: order.customerId,
          isUnwelcome: order.isUnwelcome,
          bookingStatus: order.bookingStatus,
          isBookingCostUsing: order.isBookingCostUsing,
          customerCellphone: order.customerCellphone,
          companionCount: order.companionCount,
          notificationDayCount: order.notificationDayCount,
          notificationDate: order.notificationDate,
          displayBirthdayIcon: order.displayBirthdayIcon,
          isCheckin: order.isCheckin,
          isCusCheckRequired,
          isDone,
          createdOrderId,
          isNoShow
        };
        if (isOne) {
          allOrder.push({
            key: order.ids.length ? order.ids[0] : `${order.type}-${index}`,
            ...rest,
            ...customData,
            style
          })
        } else if (order.type !== 'RH' && order.type !== 'HOLIDAY' && order.type !== 'SH') {
          allOrder.push({
            key: order.ids.length ? order.ids[0] : `${order.type}-${index}`,
            ...rest,
            ...customData,
            style
          })
        }
      });
    })

    if (!isOne) {
      unpointData.forEach(d => {
        !checkinMode && allOrder.push({
          type: 'HOLIDAY',
          start: d.date,
          end: d.date + 1800000,
          key: d.id,
          timeCost: 1,
          nameToDisplay: '全店不可預約',
          style: {
            backgroundColor: '#414141',
            height: `${calendarSize.height - 1}px`
          }
        })
      })
    }

    for (let i = start; i <= addDays(start, 6).getTime(); i = addDays(i, 1).getTime()) {
      const title = format(i, 'M/dd') + weekDisplay(format(i, 'eeee'))
      const hour = getHours(startTime)
      const minutes = getMinutes(startTime)
      const date = setMinutes(setHours(new Date(i), hour), minutes).getTime()
      week.push({
        title,
        date,
        orders: [],
        bookingLimit: tidyData[0].bookingLimit
      })
    }

    allOrder.sort((a, b) => a.start - b.start)

    week.forEach(({ date }, index) => {
      const filterData = allOrder.filter(d => isSameDay(d.start, date))
      const filterOrder = cloneDeep(allOrder.filter(d => isSameDay(d.start, date) && d.type === 'RESERVATION'))
      const filterBreak = cloneDeep(allOrder.filter(d => isSameDay(d.start, date) && d.type === 'HOLIDAY'))
      const countOrder = {}
      const countHoliday = {}
      const groups = [];
      const orderGroup = []
      const breakGroup = []
      let length = 1
      let breakLength = 0

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

      for (let i = 0; i < filterData.length; i++) {
        const parentStyle = {}
        const time1 = filterData[i];
        checkHorR(time1.timeCost, time1.start, time1.type === 'RESERVATION', time1.isDone)
        if (time1.isProcessed) continue; // 跳過已處理過的時間

        const currentGroup = [time1];
        for (let j = i + 1; j < filterData.length; j++) {
          const time2 = filterData[j];
          if (time2.isProcessed) {
            continue;
          } // 跳過已處理過的時間

          if (
            // 判斷時間是否重疊
            (time2.start >= time1.start && time2.start < time1.end)
            || (time2.end > time1.start && time2.end <= time1.end)
            || (time2.start <= time1.start && time2.end >= time1.end)
          ) {
            currentGroup.push(time2);
            time2.isProcessed = true; // 標記已處理過的時間
          }
        }
        const firstTime = currentGroup[0].start
        const distance = differenceInMinutes(new Date(firstTime), new Date(date)) / 30
        parentStyle.top = `${Math.abs(distance) * calendarSize.height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * calendarSize.height + 1}px`
          }
        })
        groups.push({ data: currentGroup, parentStyle });
      }
      for (let i = 0; i < filterOrder.length; i++) {
        const parentStyle = {}
        const time1 = filterOrder[i];
        // checkHorR(time1.timeCost, time1.start, time1.type === 'RESERVATION', time1.isDone)
        if (time1.isProcessed) continue; // 跳過已處理過的時間

        const currentGroup = [time1];
        for (let j = i + 1; j < filterOrder.length; j++) {
          const time2 = filterOrder[j];
          if (time2.isProcessed) {
            continue;
          } // 跳過已處理過的時間

          if (
            // 判斷時間是否重疊
            (time2.start >= time1.start && time2.start < time1.end)
            || (time2.end > time1.start && time2.end <= time1.end)
            || (time2.start <= time1.start && time2.end >= time1.end)
          ) {
            currentGroup.push(time2);
            time2.isProcessed = true; // 標記已處理過的時間
          }
        }
        const firstTime = currentGroup[0].start
        const distance = differenceInMinutes(new Date(firstTime), new Date(date)) / 30
        parentStyle.top = `${Math.abs(distance) * calendarSize.height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * calendarSize.height + 1}px`
          }
        })
        orderGroup.push({ data: currentGroup, parentStyle });
        if (currentGroup.length >= length) {
          length = currentGroup.length + 1
        }
      }
      for (let i = 0; i < filterBreak.length; i++) {
        const parentStyle = {}
        const time1 = filterBreak[i];
        checkHorR(time1.timeCost, time1.start, time1.type === 'RESERVATION')
        if (time1.isProcessed) continue; // 跳過已處理過的時間

        const currentGroup = [time1];
        for (let j = i + 1; j < filterBreak.length; j++) {
          const time2 = filterBreak[j];
          if (time2.isProcessed) {
            continue;
          } // 跳過已處理過的時間

          if (
            // 判斷時間是否重疊
            (time2.start >= time1.start && time2.start < time1.end)
            || (time2.end > time1.start && time2.end <= time1.end)
            || (time2.start <= time1.start && time2.end >= time1.end)
          ) {
            currentGroup.push(time2);
            time2.isProcessed = true; // 標記已處理過的時間
          }
        }
        const firstTime = currentGroup[0].start
        const distance = differenceInMinutes(new Date(firstTime), new Date(date)) / 30
        parentStyle.top = `${Math.abs(distance) * calendarSize.height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * calendarSize.height + 1}px`
          }
        })
        if (!checkinMode) {
          breakGroup.push({ data: currentGroup, parentStyle });
          if (currentGroup.length >= breakLength) {
            breakLength = currentGroup.length + 1
          }
        }
      }
      week[index].orders = [...groups]
      week[index].orderGroup = [...orderGroup]
      week[index].breakGroup = [...breakGroup]
      week[index].countOrder = countOrder
      week[index].countHoliday = countHoliday
      week[index].length = length
      week[index].breakLength = breakLength
    })

    return week
  }

  useEffect(() => {
    if (!nameType.loading) {
      const data = idx(nameType, _ => _.data.getDesignerNameForCustomerSide)
      setDesignerName(data)
    }
  }, [nameType.loading])


  useEffect(() => {
    if (!merchant.loading && !DesignerCalendar.loading) {
      const { merchantDesignerCalendar, merchantUnappointCalendar } = idx(DesignerCalendar, _ => _.data.getMerchantDesignerWeekCalendar)
      merchantDesignerCalendar.forEach(({ calendar }, index1) => {
        calendar.forEach(({ type, startTime, endTime, timeCost, ...rest }, index2) => {
          if (type === 'RESERVATION' && !isSameDay(startTime, endTime)) {
            const newStartTime = startOfDay(endTime).getTime()
            const newTimeCost = (endTime - newStartTime) / 1800000
            if (newStartTime < endOfWeek(date).getTime() && newStartTime !== endTime) {
              merchantDesignerCalendar[index1].calendar.push({
                type,
                startTime: newStartTime,
                endTime,
                timeCost: newTimeCost,
                ...rest
              })
            }
            merchantDesignerCalendar[index1].calendar[index2].endTime = newStartTime - 1800000
            merchantDesignerCalendar[index1].calendar[index2].timeCost = timeCost - newTimeCost
          }
        })
      });
      const [startHour, startMinute] = idx(merchant, _ =>
        _.data.merchant.openingHours.slice(0, 5).split(':')
      )
      const [closeHour, closeMinute] = idx(merchant, _ =>
        _.data.merchant.closingHours.slice(0, 5).split(':')
      )
      setOpenTime({
        open: {
          hour: startHour,
          minute: startMinute,
        },
        close: {
          hour: closeHour,
          minute: closeMinute,
        }
      })

      const newDate = startOfWeek(date)
      const [year, month, day] = [getYear(newDate), getMonth(newDate), getDate(newDate)]
      let orderTimeStart = new Date(year, month, day, startHour, startMinute).getTime()
      let orderTimeEnd = new Date(year, month, day, closeHour, closeMinute).getTime()
      const arr = []

      merchantDesignerCalendar.forEach(({ calendar }) => {
        calendar.forEach(({ startTime, endTime, type }) => {
          if (type === 'RESERVATION') {
            const [startHour, startMinute] = [getHours(startTime), getMinutes(startTime)]
            const [endHour, endMinute] = [getHours(endTime), getMinutes(endTime)]
            const start = new Date(year, month, day, startHour, startMinute).getTime()
            const end = new Date(year, month, day, endHour, endMinute).getTime()
            if (start < orderTimeStart) orderTimeStart = start
            if (end > orderTimeEnd) {
              orderTimeEnd = end
            }
          }
        })
      })

      for (let i = 0; i < 7; i++) {
        const start = addDays(orderTimeStart, i).getTime()
        const end = addDays(orderTimeEnd, i).getTime()
        const arr2 = []
        for (let i = start; i <= end; i += 1800000) {
          arr2.push(i)
        }
        arr.push(arr2)
      }

      setOrderRange(arr)

      const test = handleTidyOrder(merchantDesignerCalendar, merchantUnappointCalendar, arr[0][0])
      setCalendarData(test)
    }
  }, [
    merchant.loading, date, DesignerCalendar.loading, bookingCusCheck, calendarSize,
    checkinMode, checkinSettings.isBookingCheckinEnabled, checkedType
  ])

  useEffect(() => {
    if (!bookingRemarkDisplay.loading) {
      const data = idx(bookingRemarkDisplay, _ => _.data.getIsBookingRemarkDisplay)
      setRemarkDisplay(data)
    }
  }, [bookingRemarkDisplay.loading])

  useEffect(() => {
    if (!cusBookingRemarkDisplay.loading) {
      const data = idx(cusBookingRemarkDisplay, _ => _.data.getIsCusBookingRemarkDisplay)
      setCusRemarkDisplay(data)
    }
  }, [cusBookingRemarkDisplay.loading])

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
    if (!getBookinHistoryDisplay.loading) {
      const data = getBookinHistoryDisplay.data.getParameterAboutBookingSetting.isBookingHistoryDisplay
      setBookingHistoryDisplay(data)
    }
  }, [getBookinHistoryDisplay.loading])

  return (
    <Page title="單週預約紀錄">
      <Backdrop id='Backdrop' css={styles.opacity} open={merchant.loading || DesignerCalendar.loading}>
        <CircularProgress />
      </Backdrop>
      <Container maxWidth={false} css={styles.container}>
        <Grid container justifyContent='space-between' alignItems='center' >
          <Grid className='CheckinMode' item>
            <PageTitle title='單週預約紀錄' subTitle='WEEK RESERVATION RECORDS' />
          </Grid>
          {checkinSettings.isBookingCheckinEnabled && (
            <Grid style={{ display: 'flex', alignItems: 'center' }} item >
              <Typography sx={{ fontSize: 16 }} >報到模式</Typography><Switch checked={checkinMode} onChange={(e, v) => setCheckinMode(v)} />
            </Grid>
          )}
        </Grid>
        <Card css={styles.card}>
          <div css={styles.headerWrap}>
            <div css={styles.headerWrap}>
              <DateSelector
                date={{ startDate: date, endDate: date }}
                attributes={['lastweek', 'thisweek', 'nextweek', 'startDate']}
                dateChange={({ startDate }) => setDate(startDate)}
                margin
              />
              <BookingRecordListAutoComplete
                label="設計師姓名/編號"
                css={styles.autoComplete}
                value={(designerId[0] !== '' && designerId.length === 1) ? designerId[0] : ''}
                onChange={value => {
                  if (value.id === '') {
                    setDesignerId([''])
                  } else {
                    setDesignerId([value.userId])
                  }
                }}
              />
              {checkinSettings.isBookingCheckinEnabled && (
                <FormControl variant="outlined" style={{ width: 120 }} >
                  <InputLabel>報到狀態</InputLabel>
                  <Select
                    label='報到狀態'
                    onChange={e => setCheckedType(e.target.value)}
                    value={checkedType}
                  >
                    <MenuItem value=''><em>無</em></MenuItem>
                    <MenuItem value={true}>報到成功</MenuItem>
                    <MenuItem value={false}>未報到</MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>
            <div css={styles.headerWrap}>
              <CalendarColorClip
                bookingCusCheck={bookingCusCheck}
                checkinMode={checkinMode}
                bookingHistoryDisplay={bookingHistoryDisplay}
              />
              <IconButton onClick={handleClick}>
                <TuneIcon/>
              </IconButton>
              <Popper placement='left-start' open={open} anchorEl={anchorEl} style={{ zIndex: 20 }}>
                <Card style={{ padding: '14px 18px 14px 14px', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: 16  }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                    <span style={{ wordBreak: 'keep-all' }}>寬度</span>
                    <Slider
                      style={{ width: 150 }}
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
                  {/* <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                    <span style={{ wordBreak: 'keep-all' }}>不可預約</span>
                    <Slider
                      style={{ width: 200 }}
                      max={75}
                      value={calendarSize.breakWidth}
                      valueLabelDisplay="auto"
                      onChange={(e, v) => {
                        setCalendarSize(
                          produce(draft => {
                            draft.breakWidth = v
                          })
                        )
                      }}
                    />
                  </div> */}
                </Card>
              </Popper>
            </div>
          </div>
          {!merchant.loading && orderRange.length ?
            <OrderTable
              orderRange={orderRange}
              calendarData={calendarData}
              designerNameType={designerName}
              merchantId={merchantId}
              openTime={openTime}
              remarkDisplay={remarkDisplay}
              cusRemarkDisplay={cusRemarkDisplay}
              bookingCusCheck={bookingCusCheck}
              refetchData={handleRefetch}
              DesignerCalendar={DesignerCalendar}
              isOne={designerId.length === 1 && designerId[0] !== ''}
              designerId={designerId}
              ndsRef={ndsRef}
              colWidth={calendarSize.width}
              calendarSize={calendarSize}
              checkinSettings={checkinSettings}
              checkinMode={checkinMode}
              cancelPasswordUsing={cancelBookingUsing.loading ? false : cancelBookingUsing.data.merchantPassword.cancelReservation.isUsing}
            /> : ''
          }
        </Card>
      </Container>
    </Page>
  )
}

export default Calendar
