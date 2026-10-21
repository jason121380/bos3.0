// 個人頁「預約表」分頁渲染測試（fix/profile-reservation-white）：API 回空資料或查詢失敗時不可在 render 階段拋錯（整頁白屏）
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { startOfWeek, setHours, addDays } from 'date-fns'
import Reservation from '../Reservation'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'

// #RRGGBB → 瀏覽器正規化後的 rgb(r, g, b)
const cssColor = hex => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`

const weekStart = startOfWeek(new Date())
const at = (day, hour) => setHours(addDays(weekStart, day), hour).getTime()
const weekResult = merchantDesignerCalendar => ({
  loading: false,
  refetch: () => {},
  data: { getMerchantDesignerWeekCalendar: { merchantUnappointCalendar: [], merchantDesignerCalendar } },
})

let mockCalendar
jest.mock('hooks/useFetchMerchant', () => () => ({ loading: false, data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }))
jest.mock('hooks/useFetchGetDesignerNameForCustomerSide', () => () => ({ loading: false, data: { getDesignerNameForCustomerSide: 'NAME' } }))
jest.mock('hooks/useFetchGetIsBookingRemarkDisplay', () => () => ({ loading: false, data: { getIsBookingRemarkDisplay: true } }))
jest.mock('hooks/useFetchGetIsCusBookingRemarkDisplay', () => () => ({ loading: false, data: { getIsCusBookingRemarkDisplay: true } }))
jest.mock('hooks/useFetchGetMerchantDesignerWeekCalendar', () => () => mockCalendar())
jest.mock('hooks/useFetchAdminBookingTime', () => ({ __esModule: true, default: () => ({}), useFetchAdminBookingTimeAllStore: () => ({}) }))
jest.mock('hooks/useFetchVerifyBooking', () => () => ({}))
jest.mock('hooks/useFetchSetAdminBookingTimes', () => () => ({}))

const props = { designerId: 'd1', checkinSettings: { isBookingCheckinEnabled: true }, bookingCusCheck: true, checkinMode: false, bookingHistoryDisplay: true }
const renderTab = (extra = {}) => render(<MemoryRouter initialEntries={['/profile/reservation']}><Reservation {...props} {...extra} /></MemoryRouter>)

beforeEach(() => {
  localStorage.setItem('userMerchant', JSON.stringify({ id: 'm1' }))
})

test('有預約、公休、跨日預約時正常渲染週曆', () => {
  mockCalendar = () => weekResult([{
    designerId: 'd1', designerName: 'A', designerNickname: 'a', bookingLimit: 2,
    calendar: [
      { type: 'RESERVATION', ids: ['r1'], startTime: at(1, 11), endTime: at(1, 12), timeCost: 2, bookingStatus: '預約成功', isDesignate: true, nameToDisplay: '王小明', isCheckin: false, isDone: false },
      { type: 'RESERVATION', ids: ['r2'], startTime: at(1, 11), endTime: at(1, 13), timeCost: 4, bookingStatus: '待審核', nameToDisplay: '李', isCheckin: true, isDone: false },
      { type: 'RESERVATION', ids: ['r3'], startTime: at(2, 22), endTime: at(3, 2), timeCost: 8, bookingStatus: '預約成功', nameToDisplay: '跨日', isDone: false },
      { type: 'HOLIDAY', ids: [], startTime: at(4, 14), endTime: at(4, 15), timeCost: 2, nameToDisplay: '休' },
      { type: 'RH', ids: [], startTime: at(5, 14), endTime: at(5, 15), timeCost: 2, nameToDisplay: '休' },
    ],
  }])
  renderTab()
  expect(screen.getByText('時間')).toBeTruthy()
  expect(screen.getByText('王小明')).toBeTruthy()
  // 色塊顏色與圖例同一份色票（原本個人頁用 #005fff／#69b8dd，與圖例的指定藍、待審核青不同色）
  const chipColor = name => screen.getByText(name).parentElement.style.backgroundColor
  expect(chipColor('王小明')).toBe(cssColor(RESERVATION_COLORS.designate))
  expect(chipColor('李')).toBe(cssColor(RESERVATION_COLORS.pending))
})

test('報到模式也可渲染', () => {
  renderTab({ checkinMode: true })
  expect(screen.getByText('時間')).toBeTruthy()
})

test('本週沒有任何行事曆資料（merchantDesignerCalendar 為空陣列）時不白屏，顯示空週曆', () => {
  mockCalendar = () => weekResult([])
  renderTab()
  expect(screen.getByText('時間')).toBeTruthy()
  // 每格「可預約人數」小標下方的數字為 0（版面比照主預約頁，小標與數字分兩行）
  const labels = screen.getAllByText('可預約人數')
  expect(labels.length).toBeGreaterThan(0)
  labels.forEach(label => expect(label.nextSibling.textContent).toBe('0'))
})

test('查詢失敗（data 為 undefined）時不白屏', () => {
  mockCalendar = () => ({ loading: false, refetch: () => {}, data: undefined })
  renderTab()
  expect(screen.getByText('時間')).toBeTruthy()
})
