/** @jsxImportSource @emotion/react */
// 大型頁：Backdrop、Popper、Slider 保留 MUI；Page 根元素不加 ui-root（box-sizing 會改變行事曆格子寬度）
import { Backdrop } from 'ui/modal-compat'
import { Popper, Slider } from '@mui/material'
import { LoaderCircle, SlidersHorizontal } from 'lucide-react'
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
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import { useSelector } from 'react-redux'
import produce from 'immer';
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Switch } from 'ui/switch'

import OrderTable from './OrderTable'

const styles = {
  // 載入中遮罩：透明底、置頂（與舊版相同）
  opacity: css({
    opacity: '1 !important',
    zIndex: 999,
    background: 'rgba(0,0,0,0) !important',
  }),
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
    // 不在 Page 加 ui-root：其 box-sizing 基礎樣式會改變下方自訂格線（OrderTable）的實際寬高；改為只包住新元件區塊
    <Page title="單日預約紀錄">
      <Backdrop id='Backdrop' css={styles.opacity} open={!(!merchant.loading && !DesignerCalendar.loading && orderRange.length && (calendarData.designate.length || calendarData.nonDesignate.length))}>
        <LoaderCircle className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
      </Backdrop>
      <AdminPageHeader
        title="單日預約紀錄"
        onFilterClick={handleFilterClick}
        showFilter={showFilter}
      >
        <div className="flex items-center gap-4">
          <DateSelector
            date={date}
            attributes={['today', 'tomorrow', 'datomorrow', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
          />
        </div>
      </AdminPageHeader>

      {showFilter && (
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
      <div>
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
          <Popper placement='left-start' open={open} anchorEl={anchorEl} style={{ zIndex: 20 }}>
            <Card className="ui-root flex flex-col gap-4 overflow-visible py-3.5 pl-3.5 pr-5 shadow-float">
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
    </Page >
  )
}

export default Calendar
