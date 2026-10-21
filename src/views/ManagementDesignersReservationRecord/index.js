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
import CalendarColorClip from 'components/CalendarColorClip'
import DateSelector from 'components/DateSelector'
import { startOfWeek, endOfWeek } from 'date-fns'
import useFetchGetDesignerNameForCustomerSide from 'hooks/useFetchGetDesignerNameForCustomerSide'
import useFetchGetMerchantDesignerWeekCalendar from 'hooks/useFetchGetMerchantDesignerWeekCalendar'
import useFetchGetIsBookingRemarkDisplay from 'hooks/useFetchGetIsBookingRemarkDisplay'
import useFetchGetIsCusBookingRemarkDisplay from 'hooks/useFetchGetIsCusBookingRemarkDisplay'
import { useFetchGetCheckinSettingsForCalendar } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import { useFetchGetBookinHistoryDisplay } from 'hooks/useFetchGetParameterAboutBookingSetting'
import { useFetchGetCancelBookingUsing } from 'hooks/useFetchMerchantPassword'
import produce from 'immer';
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Switch } from 'ui/switch'

import { buildWeekCalendar } from 'components/ReservationCalendar/weekCalendar'
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

  const handleRefetch = () => {
    DesignerCalendar.refetch()
    ndsRef.current = []
  }

  useEffect(() => {
    if (!nameType.loading) {
      const data = idx(nameType, _ => _.data.getDesignerNameForCustomerSide)
      setDesignerName(data)
    }
  }, [nameType.loading])


  useEffect(() => {
    if (!merchant.loading && !DesignerCalendar.loading) {
      // 資料整理與個人檔案、員工資料的預約表共用（components/ReservationCalendar/weekCalendar）
      const { openTime, orderRange, calendarData } = buildWeekCalendar({
        DesignerCalendar, merchant, date,
        height: calendarSize.height,
        isOne: designerId.length === 1 && designerId[0] !== '',
        checkinMode, bookingCusCheck, checkinSettings, checkedType
      })
      setOpenTime(openTime)
      setOrderRange(orderRange)
      setCalendarData(calendarData)
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
