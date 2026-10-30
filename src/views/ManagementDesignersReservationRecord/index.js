// 大型頁：格子尺寸浮層改 ui/popover（受控 open＝Boolean(anchorEl)、不接 onOpenChange，點外側／Esc 不關閉，同原 Popper；錨點以 virtualRef 指向 anchorEl，
// 開啟時不搶焦點、z-index 維持原 20），Slider 為 ui/slider；
// 載入遮罩改原生 div（#Backdrop 有全域樣式，關閉時同原 Backdrop 以 visibility hidden 保留在畫面上）；Page 根元素不加 ui-root（box-sizing 會改變行事曆格子寬度）
import { Slider } from 'ui/slider'
import { Popover, PopoverAnchor, PopoverContent } from 'ui/popover'
import { LoaderCircle, SlidersHorizontal, ListFilter } from 'lucide-react'
import Page from 'components/Page'
import useFetchMerchant from 'hooks/useFetchMerchant'
import idx from 'idx'
import { storedMerchantId } from 'lib/stored-merchant'
import isPasswordRequired from 'helper/passwordRequired'
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
import produce from 'immer'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { cn } from 'ui/utils'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Switch } from 'ui/switch'

import { buildWeekCalendar } from 'components/ReservationCalendar/weekCalendar'
import OrderTable from './OrderTable'
import { PageHeader } from 'ui/page-header'
import QueryFailed from 'components/QueryFailed'

function Calendar() {
  const merchantId = storedMerchantId()
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
        endDate: endOfWeek(date).getTime(),
      },
      designerIds: designerId.length === 1 && designerId[0] === '' ? [] : designerId,
    },
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
    },
  })
  const [bookingCusCheck, setBookingCusCheck] = useState(false)
  const [checkinMode, setCheckinMode] = useState(false)
  const [checkedType, setCheckedType] = useState('')
  const [calendarSize, setCalendarSize] = useState({
    width: 150,
    height: 40,
    breakWidth: 45,
  })
  const [anchorEl, setAnchorEl] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const [bookingHistoryDisplay, setBookingHistoryDisplay] = useState(false)
  const open = Boolean(anchorEl)
  const filterOpen = showFilter
  const ndsRef = useRef([])

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleFilterClick = () => {
    setShowFilter(!showFilter)
  }

  const handleRefetch = () => {
    DesignerCalendar.refetch()
    ndsRef.current = []
  }

  useEffect(() => {
    if (!nameType.loading) {
      const data = idx(nameType, _ => _.data.getDesignerNameForCustomerSide)
      setDesignerName(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [nameType.loading])

  useEffect(() => {
    // 任一查詢失敗（data 為 undefined）時不整理資料，畫面改顯示 QueryFailed（2026/10/28）
    if (!merchant.loading && !DesignerCalendar.loading && idx(merchant, _ => _.data.merchant) && DesignerCalendar.data) {
      // 資料整理與個人檔案、員工資料的預約表共用（components/ReservationCalendar/weekCalendar）
      const { openTime, orderRange, calendarData } = buildWeekCalendar({
        DesignerCalendar,
        merchant,
        date,
        height: calendarSize.height,
        isOne: designerId.length === 1 && designerId[0] !== '',
        checkinMode,
        bookingCusCheck,
        checkinSettings,
        checkedType,
      })
      setOpenTime(openTime)
      setOrderRange(orderRange)
      setCalendarData(calendarData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [ merchant.loading, date, DesignerCalendar.loading, booki…] 變動時執行；DesignerCalendar、checkinSettings、designerId、merchant 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [
    merchant.loading,
    date,
    DesignerCalendar.loading,
    bookingCusCheck,
    calendarSize,
    checkinMode,
    checkinSettings.isBookingCheckinEnabled,
    checkedType,
  ])

  useEffect(() => {
    if (!bookingRemarkDisplay.loading) {
      const data = idx(bookingRemarkDisplay, _ => _.data.getIsBookingRemarkDisplay)
      setRemarkDisplay(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [bookingRemarkDisplay.loading])

  useEffect(() => {
    if (!cusBookingRemarkDisplay.loading) {
      const data = idx(cusBookingRemarkDisplay, _ => _.data.getIsCusBookingRemarkDisplay)
      setCusRemarkDisplay(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [cusBookingRemarkDisplay.loading])

  useEffect(() => {
    if (!getMerchantCheckinSettings.loading) {
      // 查詢失敗時視為報到功能關閉，不設成 undefined（畫面會讀 .isBookingCheckinEnabled；Jason 2026/10/22 fix all）
      const data = idx(getMerchantCheckinSettings, _ => _.data.getMerchantCheckinSettings) || {
        isBookingCheckinEnabled: false,
        isUnDoneBookingManualNotify: false,
      }
      setCheckinSettings(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantCheckinSettings.loading])

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    if (!getBookinHistoryDisplay.loading) {
      const data = idx(getBookinHistoryDisplay, _ => _.data.getParameterAboutBookingSetting.isBookingHistoryDisplay) || false
      setBookingHistoryDisplay(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBookinHistoryDisplay.loading])

  return (
    // 不在 Page 加 ui-root：其 box-sizing 基礎樣式會改變下方自訂格線（OrderTable）的實際寬高；改為只包住新元件區塊
    <Page title="單週預約紀錄">
      {/* 載入遮罩：比照單日預約紀錄改 role=status＋aria-live，下方行事曆容器同步 aria-busy */}
      <div
        id="Backdrop"
        role="status"
        aria-live="polite"
        className="fixed inset-0 flex items-center justify-center !opacity-100 z-[1300] ![background:rgba(0,0,0,0)]"
        style={{ visibility: merchant.loading || DesignerCalendar.loading ? undefined : 'hidden' }}
      >
        <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
        <span className="sr-only">預約紀錄載入中…</span>
      </div>
      <PageHeader
        title="單週預約紀錄"
        actions={
          <>
            <div className="flex items-center gap-4">
              <DateSelector
                date={{ startDate: startOfWeek(date).getTime(), endDate: endOfWeek(date).getTime() }}
                attributes={['lastweek', 'thisweek', 'nextweek', 'startDate']}
                dateChange={({ startDate }) => setDate(startDate)}
              />
            </div>
            <Button
              variant="secondary"
              aria-pressed={!!filterOpen}
              onClick={handleFilterClick}
              className={filterOpen ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
            >
              <ListFilter strokeWidth={1.75} />
              篩選
            </Button>
          </>
        }
      />

      {showFilter && (
        <Card className="ui-root mb-4 flex flex-row flex-wrap items-center gap-8 p-6">
          <div className="flex min-w-[240px] flex-col gap-2">
            <span className="text-label text-text-secondary">指定設計師</span>
            <BookingRecordListAutoComplete
              label="搜尋姓名或編號..."
              fullWidth
              value={designerId[0] !== '' && designerId.length === 1 ? designerId[0] : ''}
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
                  height: '40px',
                },
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
              <NativeSelect aria-label="報到狀態" onChange={e => setCheckedType(e.target.value)} value={checkedType}>
                <NativeSelectOption value="">全部顯示</NativeSelectOption>
                <NativeSelectOption value={true}>報到成功</NativeSelectOption>
                <NativeSelectOption value={false}>未報到</NativeSelectOption>
              </NativeSelect>
            </div>
          )}
        </Card>
      )}
      <div aria-busy={merchant.loading || DesignerCalendar.loading || undefined}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <CalendarColorClip bookingCusCheck={bookingCusCheck} checkinMode={checkinMode} bookingHistoryDisplay={bookingHistoryDisplay} />
          <span className="ui-root">
            <Button variant="ghost" size="icon" className="text-accent" aria-label="調整格子高度" aria-expanded={open} onClick={handleClick}>
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
        {DesignerCalendar.error || merchant.error ? (
          <QueryFailed
            onRetry={() => {
              if (DesignerCalendar.error) DesignerCalendar.refetch()
              if (merchant.error) merchant.refetch()
            }}
          />
        ) : !merchant.loading && orderRange.length ? (
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
            cancelPasswordUsing={isPasswordRequired(cancelBookingUsing, 'cancelReservation')}
          />
        ) : (
          ''
        )}
      </div>
    </Page>
  )
}

export default Calendar
