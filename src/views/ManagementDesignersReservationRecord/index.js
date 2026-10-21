// 大型頁：格子尺寸浮層保留相容層 Popper（anchorEl 開關、不因點外側關閉；換 Radix Popover 會改變焦點與關閉行為），Slider 為 ui/slider；
// 載入遮罩改原生 div（#Backdrop 有全域樣式，關閉時同原 Backdrop 以 visibility hidden 保留在畫面上）；Page 根元素不加 ui-root（box-sizing 會改變行事曆格子寬度）
import { Slider } from 'ui/slider'
import { Popper } from 'ui/overlay-compat'
import { LoaderCircle, SlidersHorizontal } from 'lucide-react'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchMerchant from 'hooks/useFetchMerchant'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import CalendarColorClip, { RESERVATION_COLORS } from 'components/CalendarColorClip'
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
import produce from 'immer';
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Switch } from 'ui/switch'

import OrderTable from './OrderTable'

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
    height: 40,
    breakWidth: 45
  })
  const [anchorEl, setAnchorEl] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)
  const open = Boolean(anchorEl);
  const filterOpen = showFilter;
  const ndsRef = useRef([])

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleFilterClick = () => {
    setShowFilter(!showFilter);
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
            style.backgroundColor = isCheckin ? RESERVATION_COLORS.checkedIn : RESERVATION_COLORS.notCheckedIn
          } else if (isDone) return
        } else {
          switch (order.type) {
            case 'RH':
              style.backgroundColor = RESERVATION_COLORS.unavailable
              style.height = `${timeCost * calendarSize.height - 2}px`
              calendar[index].type = 'HOLIDAY'
              break;
            case 'HOLIDAY':
              style.backgroundColor = RESERVATION_COLORS.unavailable
              style.height = `${timeCost * calendarSize.height - 2}px`
              break;
            case 'SH':
              style.backgroundColor = RESERVATION_COLORS.unavailable
              style.height = `${timeCost * calendarSize.height - 2}px`
              calendar[index].type = 'HOLIDAY'
              break;
            case 'RESERVATION':
              style.height = `${timeCost * calendarSize.height - 2}px`
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
            height: `${calendarSize.height - 2}px`
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
      // 查詢失敗（data 為 undefined）時解構會拋錯→整頁白屏；改以空陣列帶過，畫面顯示空的週曆
      const weekCalendar = idx(DesignerCalendar, _ => _.data.getMerchantDesignerWeekCalendar) || {}
      const merchantDesignerCalendar = weekCalendar.merchantDesignerCalendar || []
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
      const data = idx(getMerchantCheckinSettings, _ => _.data.getMerchantCheckinSettings)
      setCheckinSettings(data)
    }
  }, [getMerchantCheckinSettings.loading])

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
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
    // 不在 Page 加 ui-root：其 box-sizing 基礎樣式會改變下方自訂格線（OrderTable）的實際寬高；改為只包住新元件區塊
    <Page title="單週預約紀錄">
      {/* 載入遮罩：比照單日預約紀錄改 role=status＋aria-live，下方行事曆容器同步 aria-busy */}
      <div
        id='Backdrop'
        role="status"
        aria-live="polite"
        className="fixed inset-0 flex items-center justify-center !opacity-100 z-[999] ![background:rgba(0,0,0,0)]"
        style={{ visibility: (merchant.loading || DesignerCalendar.loading) ? undefined : 'hidden' }}
      >
        <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
        <span className="sr-only">預約紀錄載入中…</span>
      </div>
      <AdminPageHeader
        title="單週預約紀錄"
        onFilterClick={handleFilterClick}
        showFilter={filterOpen}
      >
        <div className="flex items-center gap-4">
          <DateSelector
            date={{ startDate: startOfWeek(date).getTime(), endDate: endOfWeek(date).getTime() }}
            attributes={['lastweek', 'thisweek', 'nextweek', 'startDate']}
            dateChange={({ startDate }) => setDate(startDate)}
          />
        </div>
      </AdminPageHeader>

      {showFilter && (
        <Card className="ui-root mb-4 flex flex-row flex-wrap items-center gap-8 p-6">
          <div className="flex min-w-[240px] flex-col gap-2">
            <span className="text-label text-text-secondary">指定設計師</span>
            <BookingRecordListAutoComplete
              label="搜尋姓名或編號..."
              fullWidth
              value={(designerId[0] !== '' && designerId.length === 1) ? designerId[0] : ''}
              onChange={value => {
                if (value.id === '') {
                  setDesignerId([''])
                } else {
                  setDesignerId([value.userId])
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: 'rgb(var(--surface))',
                  height: '40px'
                }
              }}
            />
          </div>

          {checkinSettings.isBookingCheckinEnabled && (
            <div
              className={cn(
                'mt-auto flex h-10 items-center gap-3 rounded-lg border border-solid px-4 py-2 transition-colors',
                checkinMode ? 'border-accent/20 bg-accent/8' : 'border-border bg-surface'
              )}
            >
              <span className="text-body font-medium text-text">報到模式</span>
              <Switch
                aria-label="報到模式"
                checked={checkinMode}
                onChange={(e, v) => {
                  setCheckinMode(v)
                  if (!v) setCheckedType('')
                }}
              />
            </div>
          )}

          {checkinSettings.isBookingCheckinEnabled && checkinMode && (
            <div className="flex min-w-[160px] flex-col gap-2">
              <span className="text-label text-text-secondary">報到狀態</span>
              <NativeSelect
                aria-label="報到狀態"
                onChange={e => setCheckedType(e.target.value)}
                value={checkedType}
              >
                <NativeSelectOption value="">全部顯示</NativeSelectOption>
                <NativeSelectOption value={true}>報到成功</NativeSelectOption>
                <NativeSelectOption value={false}>未報到</NativeSelectOption>
              </NativeSelect>
            </div>
          )}
        </Card>
      )}
      <div aria-busy={(merchant.loading || DesignerCalendar.loading) || undefined}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <CalendarColorClip
            bookingCusCheck={bookingCusCheck}
            checkinMode={checkinMode}
            bookingHistoryDisplay={bookingHistoryDisplay}
          />
          <span className="ui-root">
            <Button
              variant="ghost"
              size="icon"
              className="text-accent"
              aria-label="調整格子高度"
              aria-expanded={open}
              onClick={handleClick}
            >
              <SlidersHorizontal strokeWidth={1.75} />
            </Button>
          </span>
          <Popper placement='left-start' open={open} anchorEl={anchorEl} style={{ zIndex: 20 }}>
            <Card className="ui-root flex flex-col gap-4 overflow-visible py-3.5 pl-3.5 pr-5 shadow-float">
              <div className="flex justify-between gap-2">
                <span className="text-label text-text-secondary [word-break:keep-all]">高度</span>
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
            </Card>
          </Popper>
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
      </div>
    </Page>
  )
}

export default Calendar
