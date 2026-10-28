// 大型頁：格子尺寸浮層改 ui/popover（受控 open＝Boolean(anchorEl)、不接 onOpenChange，點外側／Esc 不關閉，同原 Popper；錨點以 virtualRef 指向 anchorEl，
// 開啟時不搶焦點、z-index 維持原 20），Slider 為 ui/slider；
// 載入遮罩改原生 div（#Backdrop 有全域樣式，關閉時同原 Backdrop 以 visibility hidden 保留在畫面上）；Page 根元素不加 ui-root（box-sizing 會改變行事曆格子寬度）
import { Slider } from 'ui/slider'
import { Popover, PopoverAnchor, PopoverContent } from 'ui/popover'
import { LoaderCircle, SlidersHorizontal, ListFilter } from 'lucide-react'
import Page from 'components/Page'
import useFetchMerchant from 'hooks/useFetchMerchant'
import { useState, useEffect, useRef } from 'react'
import CalendarColorClip, { RESERVATION_COLORS } from 'components/CalendarColorClip'
import DateSelector from 'components/DateSelector'
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
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import { useSelector } from 'react-redux'
import produce from 'immer';
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Switch } from 'ui/switch'

import OrderTable from './OrderTable'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'
import isPasswordRequired from 'helper/passwordRequired'
import { PageHeader } from 'ui/page-header'

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
  const notifiedChangeRef = useRef(null)

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

    tidyData.forEach(des => {
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
            style.backgroundColor = isCheckin ? RESERVATION_COLORS.checkedIn : RESERVATION_COLORS.notCheckedIn
          } else if (isDone) return
        } else {
          switch (item.type) {
            case 'RH':
              style.backgroundColor = RESERVATION_COLORS.unavailable
              style.height = `${timeCost * calendarSize.height - 2}px`
              calendar[index].type = 'HOLIDAY'
              checkHorR(timeCost, startTime, false)
              break;
            case 'HOLIDAY':
              style.backgroundColor = RESERVATION_COLORS.unavailable
              style.height = `${timeCost * calendarSize.height - 2}px`
              checkHorR(timeCost, startTime, false)
              break;
            case 'EVENT':
              style.backgroundColor = RESERVATION_COLORS.event
              style.height = `${timeCost * calendarSize.height - 2}px`
              break;
            case 'RESERVATION':
              style.height = `${timeCost * calendarSize.height - 2}px`
              item.isBookingCostUsing && checkHorR(timeCost, startTime, true, isDone)
              switch (bookingStatus) {
                case '預約成功':
                  style.backgroundColor = isDesignate ? RESERVATION_COLORS.designate : RESERVATION_COLORS.nonDesignate
                  // item.nameToDisplay = item.nameToDisplay + ` - ${isDesignate ? '預約成功(指定)' : '預約成功(不指定)'}`
                  break;
                case '待審核':
                  style.backgroundColor = RESERVATION_COLORS.pending
                  // item.nameToDisplay = item.nameToDisplay + ' - 待審核'
                  break;
                case '已完成':
                  style.backgroundColor = RESERVATION_COLORS.completed
                  break;
                default:
                  break;
              }
              break;
            default:
              // 其他值不處理（與原本沒有 default 時相同）
              break
          }

          if (isCusCheckRequired && bookingCusCheck) {
            style.backgroundColor = RESERVATION_COLORS.cusCheck
          }

          if (isDone) {
            style.backgroundColor = RESERVATION_COLORS.done
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
      // 查詢失敗（data 為 undefined）時顯示空的時間軸與不指定欄，不整頁壞（Jason 2026/10/22 fix all）
      const data = idx(DesignerCalendar, _ => _.data.getMerchantDesignerCalendar) || {}
      // 深拷貝：handleTidyOrder 會排序、改型別，不直接改查詢結果（Apollo v3 開發模式為唯讀，也避免改到快取）
      setCalendarRowData({
        designate: cloneDeep(data.merchantDesignerCalendar || []),
        nonDesignate: cloneDeep(data.nonDesignateCalendar || { designerName: null, calendar: [] }),
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
      // 同一筆推播只提示一次：之後調整格子、切換報到模式等重算表格時不再提示（Jason 2026/10/22 fix all）
      if (calendarRowData.changeData && calendarRowData.changeData !== notifiedChangeRef.current &&
        (unCheckDisplay || calendarRowData.changeData.bookingStatus !== 'UNCHECK')) {
        notifiedChangeRef.current = calendarRowData.changeData
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

  // 以下設定查詢失敗（data 為 undefined）時沿用與初始值相同的預設，不整頁壞（Jason 2026/10/22 fix all）
  useEffect(() => {
    if (!nameType.loading) {
      const data = idx(nameType, _ => _.data.getDesignerNameForCustomerSide) || 'NAME'
      setDesignerName(data)
    }
  }, [nameType.loading])

  useEffect(() => {
    if (!bookingRemarkDisplay.loading) {
      const data = idx(bookingRemarkDisplay, _ => _.data.getIsBookingRemarkDisplay) || false
      setRemarkDisplay(data)
    }
  }, [bookingRemarkDisplay.loading])

  useEffect(() => {
    if (!cusBookingRemarkDisplay.loading) {
      const data = idx(cusBookingRemarkDisplay, _ => _.data.getIsCusBookingRemarkDisplay) || false
      setCusRemarkDisplay(data)
    }
  }, [cusBookingRemarkDisplay.loading])

  useEffect(() => {
    if (!getEventDisplay.loading) {
      const data = idx(getEventDisplay, _ => _.data.getParameterAboutSettingFunction.isEventDisplayOnDayBookingRecord) || false
      setEventDisplay(data)
    }
  }, [getEventDisplay.loading])

  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      const data = idx(getMerchantCheckinSettings, _ => _.data.getMerchantCheckinSettings) || {
        isBookingCheckinEnabled: false,
        isUnDoneBookingManualNotify: false,
      }
      setCheckinSettings(data)
    }
  }, [getMerchantCheckinSettings.loading])

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing) || false
      setBookingCusCheck(data)
    }
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    if (!getBookingTypeForSocket.loading) {
      const data = idx(getBookingTypeForSocket, _ => _.data.getBookingTypeForSocket)
      // 讀不到推播類型時維持預設（提示待審核）
      setUnCheckDisplay(data ? data.includes('UNCHECK') : true)
    }
  }, [getBookingTypeForSocket.loading])

  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      const data = idx(getBookinHistoryDisplay, _ => _.data.getParameterAboutBookingSetting.isBookingHistoryDisplay) || false
      setBookingHistoryDisplay(data)
    }
  }, [getBookinHistoryDisplay.loading])

  return (
    // 不在 Page 加 ui-root：其 box-sizing 基礎樣式會改變下方自訂格線（OrderTable）的實際寬高；改為只包住新元件區塊
    <Page title="單日預約紀錄">
      {/* 載入遮罩：原 aria-hidden 讀屏無從得知載入中；改 role=status（visibility hidden 時讀屏自然略過），下方行事曆容器同步 aria-busy */}
      <div
        id='Backdrop'
        role="status"
        aria-live="polite"
        className="fixed inset-0 flex items-center justify-center !opacity-100 z-[1300] ![background:rgba(0,0,0,0)]"
        style={{ visibility: (!(!merchant.loading && !DesignerCalendar.loading && orderRange.length && (calendarData.designate.length || calendarData.nonDesignate.length))) ? undefined : 'hidden' }}
      >
        <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
        <span className="sr-only">預約紀錄載入中…</span>
      </div>
      <PageHeader
        title="單日預約紀錄"
        actions={
          <>
            <div className="flex items-center gap-4">
              <DateSelector
                date={date}
                attributes={['today', 'tomorrow', 'datomorrow', 'startDate']}
                dateChange={value => setDate(value)}
                onlyStart
              />
            </div>
            {checkinSettings.isBookingCheckinEnabled && (
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={handleFilterClick}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
            )}
          </>
        }
      />

      {showFilter && checkinSettings.isBookingCheckinEnabled && (
        <Card className="ui-root mb-4 flex flex-row flex-wrap items-center gap-6 p-5">
          {checkinSettings.isBookingCheckinEnabled && (
            <div
              className={cn(
                'flex min-w-[180px] items-center gap-3 rounded-lg border border-solid px-4 py-2 transition-colors',
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
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-label text-text-secondary">報到狀態篩選</span>
              <NativeSelect
                aria-label="報到狀態篩選"
                className="min-w-[140px]"
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
      <div aria-busy={(!(!merchant.loading && !DesignerCalendar.loading && orderRange.length && (calendarData.designate.length || calendarData.nonDesignate.length))) || undefined}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 [&>div]:w-fit">
          <CalendarColorClip
            eventDisplay={eventDisplay}
            bookingCusCheck={bookingCusCheck}
            checkinMode={checkinMode}
            bookingHistoryDisplay={bookingHistoryDisplay}
          />
          <span className="ui-root">
            <Button
              variant="ghost"
              size="icon"
              className="text-accent"
              aria-label="調整格子寬度與高度"
              aria-expanded={open}
              onClick={handleClick}
            >
              <SlidersHorizontal strokeWidth={1.75} />
            </Button>
          </span>
          <Popover open={open}>
            <PopoverAnchor virtualRef={{ current: anchorEl }} />
            <PopoverContent
              side="left"
              align="start"
              sideOffset={0}
              className="z-[20] flex flex-col gap-4 py-3.5 pl-3.5 pr-5"
              onOpenAutoFocus={e => e.preventDefault()}
              aria-label="調整格子尺寸"
            >
              <div className="flex justify-between gap-2">
                <span className="text-label text-text-secondary [word-break:keep-all]">寬度</span>
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
            </PopoverContent>
          </Popover>
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
            cancelPasswordUsing={isPasswordRequired(cancelBookingUsing, 'cancelReservation')}
          /> : ''
        }
      </div>
    </Page >
  )
}

export default Calendar
