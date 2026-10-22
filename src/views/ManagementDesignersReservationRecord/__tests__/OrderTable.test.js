// 保護：單週預約紀錄（ManagementDesignersReservationRecord）點預約色塊時帶進彈窗的資料。
// 待審核的預約開「審核」窗（沒有編輯連結），其他開「預約成功」窗；設計師名稱依店家的顯示設定（本名／暱稱／本名(暱稱)）。
// Jason 2026/10/22 fix all：原本讀 rest.status（週曆資料沒有此欄位，只有 bookingStatus）與 designerName === 'BOTH'，
// 與個人頁／員工資料的同一份週曆（components/ReservationCalendar/DesignerWeekReservation/OrderTable）一起修正。
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { addDays, setHours, startOfWeek } from 'date-fns'
import React from 'react'

import { buildWeekCalendar } from 'components/ReservationCalendar/weekCalendar'
import OrderTable from '../OrderTable'

// 彈窗內容另有測試；這裡只看 OrderTable 帶進去的動作類型與設計師名稱
jest.mock('../NewChoseEvent', () => ({ modaltype, editOrder }) => (
  <div data-testid="event">{`${modaltype}|${editOrder.designer ? editOrder.designer.name : ''}`}</div>
))

afterEach(cleanup)

const WEEK = startOfWeek(new Date(2026, 9, 14)).getTime()
const at = (day, hour) => setHours(addDays(WEEK, day), hour).getTime()
const reservation = (id, day, extra) => ({
  type: 'RESERVATION', ids: [id], startTime: at(day, 11), endTime: at(day, 12), timeCost: 2, isDesignate: true,
  bookingStatus: '預約成功', isCheckin: null, isDone: false, ...extra,
})

const renderTable = (designerNameType, designer = {}) => {
  const DesignerCalendar = {
    loading: false,
    data: {
      getMerchantDesignerWeekCalendar: {
        merchantUnappointCalendar: [],
        merchantDesignerCalendar: [{
          designerId: 'd1', designerName: '王大明', designerNickname: '小明', bookingLimit: 1, ...designer,
          calendar: [
            reservation('r1', 1, { nameToDisplay: '成功客' }),
            reservation('r2', 2, { nameToDisplay: '待審客', bookingStatus: '待審核' }),
          ],
        }],
      },
    },
  }
  const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
  const checkinSettings = { isBookingCheckinEnabled: false }
  const { orderRange, calendarData, openTime } = buildWeekCalendar({
    DesignerCalendar, merchant, date: WEEK, height: 40, isOne: true, checkinMode: false, bookingCusCheck: false, checkinSettings, checkedType: '',
  })
  render(
    <OrderTable
      orderRange={orderRange} calendarData={calendarData} designerNameType={designerNameType} merchantId="m1" openTime={openTime}
      refetchData={() => {}} remarkDisplay={false} cusRemarkDisplay={false} isOne designerId={['d1']} ndsRef={{ current: [] }}
      checkinSettings={checkinSettings} checkinMode={false} calendarSize={{ width: 150, height: 40, breakWidth: 45 }} cancelPasswordUsing={false}
    />
  )
}
const openChip = name => {
  fireEvent.click([...document.querySelectorAll('#darkBorder')].find(el => el.firstChild.textContent === name))
  return screen.getByTestId('event').textContent
}

it('待審核的預約開審核窗，其他開預約成功窗（依 bookingStatus）', () => {
  renderTable('NAME')
  expect(openChip('待審客')).toBe('orderCheck|王大明')
  cleanup()
  renderTable('NAME')
  expect(openChip('成功客')).toBe('orderSuccess|王大明')
})

it('設計師名稱依顯示設定：本名、暱稱（沒有暱稱用本名）、本名(暱稱)', () => {
  renderTable('NICKNAME')
  expect(openChip('成功客')).toBe('orderSuccess|小明')
  cleanup()
  renderTable('NICKNAME', { designerNickname: null })
  expect(openChip('成功客')).toBe('orderSuccess|王大明')
  cleanup()
  renderTable('BOTH')
  expect(openChip('成功客')).toBe('orderSuccess|王大明(小明)')
  cleanup()
  renderTable('BOTH', { designerNickname: '' })
  expect(openChip('成功客')).toBe('orderSuccess|王大明')
  cleanup()
  // 本名剛好是「BOTH」時不受影響
  renderTable('NAME', { designerName: 'BOTH' })
  expect(openChip('成功客')).toBe('orderSuccess|BOTH')
})
