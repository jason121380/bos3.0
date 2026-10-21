import { addDays, setHours, startOfWeek } from 'date-fns'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'
import { buildWeekCalendar, tidyWeekCalendar } from '../weekCalendar'

// 為什麼重要：單週預約紀錄、個人檔案、員工資料三個預約表共用這份資料整理（原本各一份、已出現不一致）。
// 這些測試守住櫃台看預約表時依賴的規則：可預約人數怎麼算、哪些時段標成不可預約、重疊預約怎麼並排、
// 跨日預約怎麼拆、報到模式與篩選顯示什麼。改壞任何一條，三個頁面會同時顯示錯誤的名額或色塊。

const weekStart = startOfWeek(new Date(2026, 9, 21)).getTime() // 2026/10/18（日）
const at = (day, hour) => setHours(addDays(weekStart, day), hour).getTime()
const ev = o => Object.assign({
  type: 'RESERVATION', ids: [], startTime: 0, endTime: 0, timeCost: 2, nameToDisplay: '客人', isDesignate: true,
  bookingStatus: '預約成功', isCheckin: null, isCusCheckRequired: false, isDone: false, createdOrderId: null, isNoShow: false,
}, o)
const designer = (calendar, extra = {}) => Object.assign({ designerId: 'd1', designerName: '甲', bookingLimit: 2, calendar }, extra)
const base = { date: weekStart, height: 70, isOne: true, checkinMode: false, bookingCusCheck: false, checkinSettings: { isBookingCheckinEnabled: false }, checkedType: '' }
const tidy = (designers, options = {}, unpoint = []) => tidyWeekCalendar(designers, unpoint, at(0, 10), { ...base, ...options })
const slot = (day, hour) => at(day, hour) // 每 30 分鐘一格，key 為該格開始時間

test('可預約人數：已完成的預約不佔名額，進行中的才算（三個預約表一致）', () => {
  const week = tidy([designer([
    ev({ ids: ['a'], startTime: at(1, 13), endTime: at(1, 14), isDone: true }),
    ev({ ids: ['b'], startTime: at(1, 13), endTime: at(1, 14) }),
  ])])
  expect(week[1].countOrder[slot(1, 13)]).toBe(1)
  expect(week[1].bookingLimit).toBe(2)
})

test('同時段重疊的預約放在同一組並排，欄寬依最多重疊數加一', () => {
  const week = tidy([designer([
    ev({ ids: ['a'], startTime: at(1, 10), endTime: at(1, 11) }),
    ev({ ids: ['b'], startTime: setHours(addDays(weekStart, 1), 10).getTime() + 1800000, endTime: at(1, 11) + 1800000 }),
    ev({ ids: ['c'], startTime: at(1, 15), endTime: at(1, 16) }),
  ])])
  const groups = week[1].orderGroup.map(g => g.data.map(d => d.key))
  expect(groups).toEqual([['a', 'b'], ['c']])
  expect(week[1].length).toBe(3)
  // 第二筆晚 30 分鐘開始：在組內往下偏移一格（70px＋1）
  expect(week[1].orderGroup[0].data[1].style.marginTop).toBe('71px')
})

test('公休、例假（RH）、特休（SH）都標為不可預約時段，RH／SH 一律當公休處理', () => {
  const week = tidy([designer([
    ev({ type: 'HOLIDAY', startTime: at(2, 12), endTime: at(2, 13) }),
    ev({ type: 'RH', startTime: at(3, 12), endTime: at(3, 13) }),
    ev({ type: 'SH', startTime: at(4, 12), endTime: at(4, 13) }),
  ])])
  ;[2, 3, 4].forEach(day => {
    expect(week[day].countHoliday[slot(day, 12)]).toBeTruthy()
    expect(week[day].breakGroup[0].data[0].type).toBe('HOLIDAY')
    expect(week[day].breakGroup[0].data[0].style.backgroundColor).toBe(RESERVATION_COLORS.unavailable)
  })
})

test('色塊顏色：指定／不指定／待審核／已完成狀態／需確認／已結帳各自對應同一份色票', () => {
  const week = tidy([designer([
    ev({ ids: ['designate'], startTime: at(1, 10), endTime: at(1, 11) }),
    ev({ ids: ['non'], startTime: at(2, 10), endTime: at(2, 11), isDesignate: false }),
    ev({ ids: ['pending'], startTime: at(3, 10), endTime: at(3, 11), bookingStatus: '待審核' }),
    ev({ ids: ['completed'], startTime: at(4, 10), endTime: at(4, 11), bookingStatus: '已完成' }),
    ev({ ids: ['cusCheck'], startTime: at(5, 10), endTime: at(5, 11), isCusCheckRequired: true }),
    ev({ ids: ['done'], startTime: at(6, 10), endTime: at(6, 11), isDone: true }),
  ])], { bookingCusCheck: true })
  const color = day => week[day].orderGroup[0].data[0].style.backgroundColor
  expect(color(1)).toBe(RESERVATION_COLORS.designate)
  expect(color(2)).toBe(RESERVATION_COLORS.nonDesignate)
  expect(color(3)).toBe(RESERVATION_COLORS.pending)
  expect(color(4)).toBe(RESERVATION_COLORS.completed)
  expect(color(5)).toBe(RESERVATION_COLORS.cusCheck)
  expect(color(6)).toBe(RESERVATION_COLORS.done)
  expect(week[1].orderGroup[0].data[0].style.height).toBe('138px') // 2 格 × 70 − 2
})

test('報到模式：只顯示未完成的預約（報到成功／未報到兩色），不顯示公休與已完成', () => {
  const week = tidy([designer([
    ev({ ids: ['in'], startTime: at(1, 10), endTime: at(1, 11), isCheckin: true }),
    ev({ ids: ['out'], startTime: at(1, 12), endTime: at(1, 13), isCheckin: false }),
    ev({ ids: ['done'], startTime: at(1, 14), endTime: at(1, 15), isDone: true }),
    ev({ type: 'HOLIDAY', startTime: at(1, 16), endTime: at(1, 17) }),
  ])], { checkinMode: true })
  const keys = week[1].orderGroup.map(g => g.data[0].key)
  expect(keys).toEqual(['in', 'out'])
  expect(week[1].orderGroup[0].data[0].style.backgroundColor).toBe(RESERVATION_COLORS.checkedIn)
  expect(week[1].orderGroup[1].data[0].style.backgroundColor).toBe(RESERVATION_COLORS.notCheckedIn)
  expect(week[1].breakGroup).toEqual([])
  expect(week[1].countHoliday).toEqual({})
})

test('報到狀態篩選：啟用報到時只顯示所選狀態的預約；未啟用報到時不篩選', () => {
  const calendar = () => [designer([
    ev({ ids: ['in'], startTime: at(1, 10), endTime: at(1, 11), isCheckin: true }),
    ev({ ids: ['out'], startTime: at(1, 12), endTime: at(1, 13), isCheckin: false }),
  ])]
  const enabled = { checkinSettings: { isBookingCheckinEnabled: true } }
  expect(tidy(calendar(), { ...enabled, checkedType: true })[1].orderGroup.map(g => g.data[0].key)).toEqual(['in'])
  expect(tidy(calendar(), { checkedType: true })[1].orderGroup.map(g => g.data[0].key)).toEqual(['in', 'out'])
})

test('多位設計師（單週預約紀錄未選人）：不顯示個人公休，改顯示全店不可預約時段', () => {
  const week = tidy([
    designer([ev({ ids: ['a'], startTime: at(1, 10), endTime: at(1, 11) }), ev({ type: 'HOLIDAY', startTime: at(1, 12), endTime: at(1, 13) })]),
    designer([ev({ ids: ['b'], startTime: at(1, 10), endTime: at(1, 11) })], { designerId: 'd2' }),
  ], { isOne: false }, [{ id: 'u1', date: at(2, 18) }])
  expect(week[1].breakGroup).toEqual([])
  expect(week[2].breakGroup[0].data[0]).toMatchObject({ key: 'u1', nameToDisplay: '全店不可預約', type: 'HOLIDAY' })
})

test('跨日預約拆成兩天各自顯示；週曆時段列依營業時間與預約延伸', () => {
  const DesignerCalendar = { loading: false, data: { getMerchantDesignerWeekCalendar: { merchantUnappointCalendar: [], merchantDesignerCalendar: [
    designer([ev({ ids: ['x'], startTime: at(2, 22), endTime: at(3, 2), timeCost: 8, nameToDisplay: '跨日' })]),
  ] } } }
  const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
  const { openTime, orderRange, calendarData } = buildWeekCalendar({ DesignerCalendar, merchant, date: weekStart, ...base })
  expect(openTime).toEqual({ open: { hour: '10', minute: '00' }, close: { hour: '20', minute: '00' } })
  expect(orderRange).toHaveLength(7)
  const dayItems = day => calendarData[day].orderGroup.flatMap(g => g.data).map(d => [d.nameToDisplay, d.timeCost])
  expect(dayItems(2)).toEqual([['跨日', 4]]) // 22:00～24:00 共 4 格
  expect(dayItems(3)).toEqual([['跨日', 4]]) // 00:00～02:00 共 4 格
})

test('查詢失敗（data 為 undefined）或本週沒有資料：回傳空週曆，不拋錯（避免整頁白屏）', () => {
  const merchant = { data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }
  const failed = buildWeekCalendar({ DesignerCalendar: { loading: false }, merchant, date: weekStart, ...base })
  expect(failed.calendarData).toHaveLength(7)
  expect(failed.calendarData[0]).toMatchObject({ bookingLimit: 0, orderGroup: [], breakGroup: [] })
})
