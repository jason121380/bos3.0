// 預約週曆（單週預約紀錄、個人檔案與員工資料的預約表）共用的資料整理：原本三頁各有一份相同的程式（約 300 行），
// 2026/10/21 Jason「四份預約週曆合併成一個元件」後集中在這裡。程式本體照單週預約紀錄（ManagementDesignersReservationRecord）原樣搬移，
// 只把元件內的變數改成參數。buildWeekCalendar 先深拷貝查詢結果再拆跨日預約、改 RH／SH（原本直接改查詢結果）。
// 統一後的差異（原個人檔案頁與其他三頁不同）：已完成的預約不佔用可預約人數；非預約色塊高度與其他頁一致（-2px）。
import idx from 'idx'
import {
  getYear, getMonth, getDate, addMinutes, differenceInMinutes, startOfWeek,
  endOfWeek, addDays, format, isSameDay, getHours, getMinutes, setHours, setMinutes,
  startOfDay
} from 'date-fns'
import cloneDeep from 'lodash/cloneDeep'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'

export const weekDisplay = week => {
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

export function tidyWeekCalendar(tidyData, unpointData, startTime, { date, height, isOne, checkinMode, bookingCusCheck, checkinSettings, checkedType }) {
  const start = startOfWeek(date).getTime()
  const week = []
  const allOrder = []
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
          style.height = `${timeCost * height - 2}px`
          style.backgroundColor = isCheckin ? RESERVATION_COLORS.checkedIn : RESERVATION_COLORS.notCheckedIn
        } else if (isDone) return
      } else {
        switch (order.type) {
          case 'RH':
            style.backgroundColor = RESERVATION_COLORS.unavailable
            style.height = `${timeCost * height - 2}px`
            calendar[index].type = 'HOLIDAY'
            break;
          case 'HOLIDAY':
            style.backgroundColor = RESERVATION_COLORS.unavailable
            style.height = `${timeCost * height - 2}px`
            break;
          case 'SH':
            style.backgroundColor = RESERVATION_COLORS.unavailable
            style.height = `${timeCost * height - 2}px`
            calendar[index].type = 'HOLIDAY'
            break;
          case 'RESERVATION':
            style.height = `${timeCost * height - 2}px`
            switch (bookingStatus) {
              case '預約成功':
                style.backgroundColor = isDesignate ? RESERVATION_COLORS.designate : RESERVATION_COLORS.nonDesignate
                break;
              case '待審核':
                style.backgroundColor = RESERVATION_COLORS.pending
                break;
              case '已完成':
                style.backgroundColor = RESERVATION_COLORS.completed
                break;
              default:
                break;
            }
            break;
        }

        if (isCusCheckRequired && bookingCusCheck) {
          style.backgroundColor = RESERVATION_COLORS.cusCheck
        }

        if (isDone) {
          style.backgroundColor = RESERVATION_COLORS.done
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
          backgroundColor: RESERVATION_COLORS.unavailable,
          height: `${height - 2}px`
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
      // 該設計師本週沒有任何行事曆資料（API 回空陣列）時 tidyData[0] 為 undefined，原寫法會在 render 階段拋錯→整頁白屏；改為無資料時可預約人數 0
      bookingLimit: tidyData[0] ? tidyData[0].bookingLimit : 0
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

// 查詢結果整理成週曆：跨日預約拆成兩天、營業時間、每天的時段列（orderRange）與每天的色塊群組（calendarData）。
// isOne：只看一位設計師（個人頁、員工資料、單週紀錄選一人）時顯示公休／不可預約；多位設計師時改顯示全店不可預約時段。
export function buildWeekCalendar({ DesignerCalendar, merchant, date, ...tidyOptions }) {
  // 查詢失敗（data 為 undefined）時解構會拋錯→整頁白屏；改以空陣列帶過，畫面顯示空的週曆
  const weekCalendar = idx(DesignerCalendar, _ => _.data.getMerchantDesignerWeekCalendar) || {}
  // 深拷貝：下面會拆跨日預約、tidyWeekCalendar 會把 RH／SH 改成 HOLIDAY，不直接改查詢結果（Apollo v3 開發模式為唯讀，也避免改到快取）
  const merchantDesignerCalendar = cloneDeep(weekCalendar.merchantDesignerCalendar || [])
  const merchantUnappointCalendar = weekCalendar.merchantUnappointCalendar || []
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
  const openTime = ({
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


  const calendarData = tidyWeekCalendar(merchantDesignerCalendar, merchantUnappointCalendar, arr[0][0], { date, ...tidyOptions })
  return { openTime, orderRange: arr, calendarData }
}
