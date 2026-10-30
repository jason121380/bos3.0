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
  type: 'RESERVATION',
  ids: [id],
  startTime: at(day, 11),
  endTime: at(day, 12),
  timeCost: 2,
  isDesignate: true,
  bookingStatus: '預約成功',
  isCheckin: null,
  isDone: false,
  ...extra,
})

const renderTable = (designerNameType, designer = {}) => {
  const DesignerCalendar = {
    loading: false,
    data: {
      getMerchantDesignerWeekCalendar: {
        merchantUnappointCalendar: [],
        merchantDesignerCalendar: [
          {
            designerId: 'd1',
            designerName: '王大明',
            designerNickname: '小明',
            bookingLimit: 1,
            ...designer,
            calendar: [reservation('r1', 1, { nameToDisplay: '成功客' }), reservation('r2', 2, { nameToDisplay: '待審客', bookingStatus: '待審核' })],
          },
        ],
      },
    },
  }
  const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
  const checkinSettings = { isBookingCheckinEnabled: false }
  const { orderRange, calendarData, openTime } = buildWeekCalendar({
    DesignerCalendar,
    merchant,
    date: WEEK,
    height: 40,
    isOne: true,
    checkinMode: false,
    bookingCusCheck: false,
    checkinSettings,
    checkedType: '',
  })
  render(
    <OrderTable
      orderRange={orderRange}
      calendarData={calendarData}
      designerNameType={designerNameType}
      merchantId="m1"
      openTime={openTime}
      refetchData={() => {}}
      remarkDisplay={false}
      cusRemarkDisplay={false}
      isOne
      designerId={['d1']}
      ndsRef={{ current: [] }}
      checkinSettings={checkinSettings}
      checkinMode={false}
      calendarSize={{ width: 150, height: 40, breakWidth: 45 }}
      cancelPasswordUsing={false}
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

// B2 #17（2026/10/30）：「是否顯示預約備註／顧客備註」設定由父層查詢設定，可能比週曆資料晚到。
// 設定晚到時，備註過長的色塊要套上跑馬燈；原本 effect 只看週曆資料，設定變了不重算，備註就被截斷看不到。
describe('備註跑馬燈：顯示備註的設定比週曆晚到', () => {
  const proto = window.HTMLElement.prototype
  const original = {
    offsetHeight: Object.getOwnPropertyDescriptor(proto, 'offsetHeight'),
    offsetWidth: Object.getOwnPropertyDescriptor(proto, 'offsetWidth'),
  }
  beforeEach(() => {
    // jsdom 不排版；模擬「色塊 40px 高、備註換成兩行以上（≥34px）」
    Object.defineProperty(proto, 'offsetHeight', { configurable: true, get: () => 40 })
    Object.defineProperty(proto, 'offsetWidth', { configurable: true, get: () => 100 })
  })
  afterEach(() => {
    Object.defineProperty(proto, 'offsetHeight', original.offsetHeight)
    Object.defineProperty(proto, 'offsetWidth', original.offsetWidth)
  })

  it('設定由不顯示改為顯示後，過長的兩種備註都套上跑馬燈', () => {
    const DesignerCalendar = {
      loading: false,
      data: {
        getMerchantDesignerWeekCalendar: {
          merchantUnappointCalendar: [],
          merchantDesignerCalendar: [
            {
              designerId: 'd1',
              designerName: '王大明',
              designerNickname: '小明',
              bookingLimit: 1,
              calendar: [reservation('r1', 1, { nameToDisplay: '成功客', remark: '很長的預約備註', remarkForCustomer: '很長的顧客備註' })],
            },
          ],
        },
      },
    }
    const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
    const checkinSettings = { isBookingCheckinEnabled: false }
    const { orderRange, calendarData, openTime } = buildWeekCalendar({
      DesignerCalendar,
      merchant,
      date: WEEK,
      height: 40,
      isOne: true,
      checkinMode: false,
      bookingCusCheck: false,
      checkinSettings,
      checkedType: '',
    })
    const ndsRef = { current: [] }
    const props = {
      orderRange,
      calendarData,
      designerNameType: 'NAME',
      merchantId: 'm1',
      openTime,
      refetchData: () => {},
      isOne: true,
      designerId: ['d1'],
      ndsRef,
      checkinSettings,
      checkinMode: false,
      calendarSize: { width: 150, height: 40, breakWidth: 45 },
      cancelPasswordUsing: false,
    }
    const { rerender } = render(<OrderTable {...props} remarkDisplay={false} cusRemarkDisplay={false} />)
    expect(document.querySelector('#remark')).toBeNull()
    rerender(<OrderTable {...props} remarkDisplay cusRemarkDisplay />)
    expect(document.querySelector('#remark')).toHaveClass('textAnimation')
    expect(document.querySelector('#cusRemark')).toHaveClass('textAnimation')
  })
})
