// 保護：預約週曆資料整理的邊界情況（補 weekCalendar.test.js）——重疊的公休並排、未知狀態不上色、
// 週六跨到下週日的預約只留本週那段、剛好結束在午夜的預約不多拆一段、預約早於營業時間時週曆往前延伸、星期標題。
import { addDays, endOfWeek, setHours, setMinutes, startOfWeek } from 'date-fns'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'
import { buildWeekCalendar, tidyWeekCalendar, weekDisplay } from '../weekCalendar'

const weekStart = startOfWeek(new Date(2026, 9, 21)).getTime() // 2026/10/18（日）
const at = (day, hour, minute = 0) => setMinutes(setHours(addDays(weekStart, day), hour), minute).getTime()
const ev = o => Object.assign({
  type: 'RESERVATION', ids: [], startTime: 0, endTime: 0, timeCost: 2, nameToDisplay: '客人', isDesignate: true,
  bookingStatus: '預約成功', isCheckin: null, isCusCheckRequired: false, isDone: false, createdOrderId: null, isNoShow: false,
}, o)
const designer = (calendar, extra = {}) => Object.assign({ designerId: 'd1', designerName: '甲', bookingLimit: 2, calendar }, extra)
const base = { date: weekStart, height: 70, isOne: true, checkinMode: false, bookingCusCheck: false, checkinSettings: { isBookingCheckinEnabled: false }, checkedType: '' }
const tidy = (designers, options = {}) => tidyWeekCalendar(designers, [], at(0, 10), { ...base, ...options })
const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
const build = calendar =>
  buildWeekCalendar({
    DesignerCalendar: { loading: false, data: { getMerchantDesignerWeekCalendar: { merchantUnappointCalendar: [], merchantDesignerCalendar: [designer(calendar)] } } },
    merchant,
    date: weekStart,
    ...base,
  })

test('星期標題：英文星期轉成「週(一)」等，未知值回傳 undefined', () => {
  expect(weekDisplay('Monday')).toBe(' 週(一)')
  expect(weekDisplay('Sunday')).toBe(' 週(日)')
  expect(weekDisplay('Funday')).toBeUndefined()
})

test('同時段的公休（含例假）並排成一組，第二筆依開始時間往下偏移；欄寬依重疊數加一', () => {
  const week = tidy([designer([
    ev({ type: 'HOLIDAY', startTime: at(2, 12), endTime: at(2, 13) }),
    ev({ type: 'RH', startTime: at(2, 12, 30), endTime: at(2, 13, 30) }),
    ev({ type: 'SH', startTime: at(2, 15), endTime: at(2, 16) }),
  ])])
  expect(week[2].breakGroup.map(g => g.data.length)).toEqual([2, 1])
  expect(week[2].breakGroup[0].data[1].style.marginTop).toBe('71px')
  expect(week[2].breakLength).toBe(3)
  // 不可預約時段只以「有沒有」使用（countHoliday[d] 為真即標示）；目前每筆公休會被計兩次（全部項目與公休各算一次），12:30 兩筆公休記為 4
  expect(week[2].countHoliday[at(2, 12, 30)]).toBe(4)
  expect(week[2].countHoliday[at(2, 15)]).toBe(2)
})

test('未知的預約狀態、未知的型別不上色（維持原本沒有 default 時的行為）', () => {
  const week = tidy([designer([
    ev({ ids: ['x'], startTime: at(1, 10), endTime: at(1, 11), bookingStatus: '設計師已取消' }),
    ev({ ids: ['y'], type: 'OTHER', startTime: at(1, 14), endTime: at(1, 15) }),
  ])])
  const all = week[1].orders.flatMap(g => g.data)
  expect(all.find(d => d.key === 'x').style.backgroundColor).toBeUndefined()
  expect(all.find(d => d.key === 'y').style).toEqual({})
  expect(RESERVATION_COLORS.designate).toBeTruthy()
})

test('週六晚上跨到下週日的預約：只保留本週週六那一段', () => {
  const { calendarData } = build([ev({ ids: ['late'], startTime: at(6, 22), endTime: at(7, 2), timeCost: 8, nameToDisplay: '跨週' })])
  expect(calendarData[6].orderGroup.flatMap(g => g.data).map(d => [d.nameToDisplay, d.timeCost])).toEqual([['跨週', 4]])
  expect(endOfWeek(weekStart).getTime()).toBeLessThan(at(7, 0))
})

test('剛好結束在午夜的預約不拆出第二天的空段', () => {
  const { calendarData } = build([ev({ ids: ['mid'], startTime: at(2, 22), endTime: at(3, 0), timeCost: 4, nameToDisplay: '到午夜' })])
  expect(calendarData[3].orderGroup).toEqual([])
  expect(calendarData[2].orderGroup.flatMap(g => g.data).map(d => d.nameToDisplay)).toEqual(['到午夜'])
})

test('預約早於開店、晚於打烊：時段列往前、往後延伸', () => {
  const { orderRange } = build([ev({ ids: ['early'], startTime: at(1, 8), endTime: at(1, 21), timeCost: 26 })])
  expect(orderRange[0][0]).toBe(at(0, 8))
  expect(orderRange[0][orderRange[0].length - 1]).toBe(at(0, 21))
})

test('零長度（起訖相同）的預約與同時開始的預約視為重疊、並排成一組', () => {
  const week = tidy([designer([
    ev({ ids: ['zero'], startTime: at(1, 10), endTime: at(1, 10), timeCost: 0 }),
    ev({ ids: ['full'], startTime: at(1, 10), endTime: at(1, 11) }),
    ev({ type: 'HOLIDAY', startTime: at(2, 10), endTime: at(2, 10), timeCost: 0 }),
    ev({ type: 'HOLIDAY', startTime: at(2, 10), endTime: at(2, 11) }),
  ])])
  expect(week[1].orderGroup.map(g => g.data.map(d => d.key))).toEqual([['zero', 'full']])
  expect(week[2].breakGroup.map(g => g.data.length)).toEqual([2])
})

test('啟用報到但沒選篩選時全部顯示；同一格先進行中後已完成，已完成不加名額', () => {
  const week = tidy([designer([
    ev({ ids: ['a'], startTime: at(1, 10), endTime: at(1, 11), isCheckin: true }),
    ev({ ids: ['b'], startTime: at(1, 10), endTime: at(1, 11), isCheckin: false, isDone: true }),
  ])], { checkinSettings: { isBookingCheckinEnabled: true }, checkedType: '' })
  expect(week[1].orderGroup.flatMap(g => g.data).map(d => d.key)).toEqual(['a', 'b'])
  expect(week[1].countOrder[at(1, 10)]).toBe(1)
})

test('多位設計師時，沒有 id 的預約以「型別-序號」當 key', () => {
  const week = tidy([designer([ev({ ids: [], startTime: at(1, 10), endTime: at(1, 11) })])], { isOne: false })
  expect(week[1].orderGroup[0].data[0].key).toBe('RESERVATION-0')
})
