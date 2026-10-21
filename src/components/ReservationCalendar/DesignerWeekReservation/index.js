// 設計師單週預約表：個人檔案（/profile/reservation）與員工資料（/management/employee/:id/reservation）共用（2026/10/21 合併，原本兩份幾乎相同）。
// 資料整理與單週預約紀錄共用 ../weekCalendar；載入遮罩為原生 div（#Backdrop 有全域樣式，關閉時同原 Backdrop 以 visibility hidden 保留在畫面上）
import { LoaderCircle } from 'lucide-react'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Field } from 'ui/input'
import useFetchMerchant from 'hooks/useFetchMerchant'
import idx from 'idx'
import { useState, useEffect, useRef, Fragment } from 'react'
import CalendarColorClip from 'components/CalendarColorClip'
import DateSelector from 'components/DateSelector'
import { startOfWeek, endOfWeek } from 'date-fns'
import useFetchGetDesignerNameForCustomerSide from 'hooks/useFetchGetDesignerNameForCustomerSide'
import useFetchGetMerchantDesignerWeekCalendar from 'hooks/useFetchGetMerchantDesignerWeekCalendar'
import useFetchGetIsBookingRemarkDisplay from 'hooks/useFetchGetIsBookingRemarkDisplay'
import useFetchGetIsCusBookingRemarkDisplay from 'hooks/useFetchGetIsCusBookingRemarkDisplay'
import { Card } from 'ui/card'

import { cn } from 'ui/utils'
import { buildWeekCalendar } from '../weekCalendar'
import OrderTable from './OrderTable'

// className：卡片外距由頁面決定（個人檔案 mt-6、員工資料 pt-4，維持合併前各自的版面）
function DesignerWeekReservation({ designerId, checkinSettings, bookingCusCheck, checkinMode, bookingHistoryDisplay, className }) {
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
      // 資料整理與單週預約紀錄共用（../weekCalendar）；只看一位設計師、格高 70px
      const { openTime, orderRange, calendarData } = buildWeekCalendar({
        DesignerCalendar, merchant, date, height,
        isOne: true,
        checkinMode, bookingCusCheck, checkinSettings, checkedType
      })
      setOpenTime(openTime)
      setOrderRange(orderRange)
      setCalendarData(calendarData)
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
      {/* 載入遮罩：比照單日預約紀錄改 role=status＋aria-live，下方行事曆卡片同步 aria-busy */}
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
      <Card className={cn('px-5 pb-5', className)} aria-busy={(merchant.loading || DesignerCalendar.loading) || undefined}>
        <div className="flex gap-[10px] flex-wrap items-center justify-between">
          <div className="flex gap-[10px] flex-wrap items-center justify-between">
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

export default DesignerWeekReservation
