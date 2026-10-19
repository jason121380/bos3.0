/** @jsxImportSource @emotion/react */
// 載入遮罩（Backdrop，#Backdrop 有全域樣式）保留 MUI
import {
  Backdrop
} from '@mui/material'
import { LoaderCircle } from 'lucide-react'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Field } from 'ui/input'
import useFetchMerchant from 'hooks/useFetchMerchant'
import idx from 'idx'
import { useState, useEffect, useRef, Fragment } from 'react'
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
import { cloneDeep } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

import { Card } from 'ui/card'
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

function Calendar({ designerId, checkinSettings, bookingCusCheck, checkinMode, bookingHistoryDisplay }) {
  const urlParams = new URLSearchParams(window.location.search)
  const merchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const nameType = useFetchGetDesignerNameForCustomerSide()
  const bookingRemarkDisplay = useFetchGetIsBookingRemarkDisplay()
  const cusBookingRemarkDisplay = useFetchGetIsCusBookingRemarkDisplay()
  const [date, setDate] = useState(
    urlParams.has('startDate') ? +urlParams.get('startDate') : startOfWeek(new Date()).getTime()
  )
  const DesignerCalendar = useFetchGetMerchantDesignerWeekCalendar({
    input: {
      dateRange: {
        startDate: startOfWeek(date).getTime(),
        endDate: endOfWeek(date).getTime()
      },
      designerIds: [designerId],
      forceDisplay: true
    }
  })
  const merchant = useFetchMerchant()
  const [orderRange, setOrderRange] = useState([])
  const [remarkDisplay, setRemarkDisplay] = useState(false)
  const [cusRemarkDisplay, setCusRemarkDisplay] = useState(false)
  const [calendarData, setCalendarData] = useState([])
  const [designerName, setDesignerName] = useState('NAME')
  const [checkedType, setCheckedType] = useState('')
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
  const height = 70
  const ndsRef = useRef([])

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
    tidyData.forEach((data, index) => {
      const { calendar, ...rest } = data
      calendar.forEach((order, index) => {
        const style = {};
        const {
          timeCost, bookingStatus, isDesignate, isCusCheckRequired, isCheckin,
          isDone, createdOrderId
        } = order

        if (checkinSettings.isBookingCheckinEnabled && order.type === 'RESERVATION') {
          if (checkedType !== '') {
            if (isCheckin !== checkedType) return
          }
        }

        if (checkinMode) {
          if (order.type === 'RESERVATION' && !isDone) {
            style.height = `${timeCost * height - 2}px`
            style.backgroundColor = isCheckin ? 'green' : '#78909c'
          } else if (isDone) return
        } else {
          switch (order.type) {
            case 'RH':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * height - 1}px`
              calendar[index].type = 'HOLIDAY'
              // checkHorR(timeCost, startTime, false)
              break;
            case 'HOLIDAY':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * height - 1}px`
              // checkHorR(timeCost, startTime, false)
              break;
            case 'SH':
              style.backgroundColor = '#414141'
              style.height = `${timeCost * height - 1}px`
              calendar[index].type = 'HOLIDAY'
              // checkHorR(timeCost, startTime, false)
              break;
            case 'RESERVATION':
              style.height = `${timeCost * height - 1}px`
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
          createdOrderId
        };
        allOrder.push({
          key: order.ids.length ? order.ids[0] : `${order.type}-${index}`,
          ...rest,
          ...customData,
          style
        })
      });
    })

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
        // checkHorR(time1.timeCost, time1.start, time1.type === 'RESERVATION')
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
        parentStyle.top = `${Math.abs(distance) * height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * height + 1}px`
          }
        })
        groups.push({ data: currentGroup, parentStyle });
      }
      for (let i = 0; i < filterOrder.length; i++) {
        const parentStyle = {}
        const time1 = filterOrder[i];
        checkHorR(time1.timeCost, time1.start, time1.type === 'RESERVATION')
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
        parentStyle.top = `${Math.abs(distance) * height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * height + 1}px`
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
        parentStyle.top = `${Math.abs(distance) * height + 1}px`
        currentGroup.forEach((d, i) => {
          if (i > 0) {
            const distance = differenceInMinutes(new Date(currentGroup[0].start), new Date(d.start)) / 30
            currentGroup[i].style.marginTop = `${Math.abs(distance) * height + 1}px`
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
    merchant.loading, date, DesignerCalendar.loading, bookingCusCheck,
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

  return (
    <Fragment>
      <Backdrop id='Backdrop' css={styles.opacity} open={merchant.loading || DesignerCalendar.loading}>
        <LoaderCircle className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
      </Backdrop>
      <Card className="mt-6 px-5 pb-5">
        <div css={styles.headerWrap}>
          <div css={styles.headerWrap}>
            <DateSelector
              date={{ startDate: date, endDate: date }}
              attributes={['lastweek', 'thisweek', 'nextweek', 'startDate']}
              dateChange={({ startDate }) => setDate(startDate)}
              margin
            />
            {checkinSettings.isBookingCheckinEnabled && (
              <Field label='報到狀態'>
                <NativeSelect
                  fullWidth={false}
                  style={{ width: 120 }}
                  onChange={e => setCheckedType(e.target.value)}
                  value={checkedType}
                >
                  <NativeSelectOption value=''><em>無</em></NativeSelectOption>
                  <NativeSelectOption value={true}>報到成功</NativeSelectOption>
                  <NativeSelectOption value={false}>未報到</NativeSelectOption>
                </NativeSelect>
              </Field>
            )}
          </div>
          <CalendarColorClip bookingCusCheck={bookingCusCheck} checkinMode={checkinMode} bookingHistoryDisplay={bookingHistoryDisplay}/>
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
            refetchData={handleRefetch}
            DesignerCalendar={DesignerCalendar}
            designerId={designerId}
            ndsRef={ndsRef}
            checkinSettings={checkinSettings}
            checkinMode={checkinMode}
          /> : ''
        }
      </Card>
    </Fragment>
  )
}

export default Calendar
