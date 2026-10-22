// 保護：個人頁「預約表」與員工資料預約表（設計師單週預約表）的操作。
// 點空白時段：新預約（帶店家、日期、設計師）／關閉預約；不可預約時段改為「開啟預約」。
// 點預約色塊：顯示顧客、電話、日期時間、指定、同行人數、備註、報到狀態、提醒日期，可結帳、接受或取消預約；已結帳的預約直接開帳單。
// 點公休色塊：編輯公休（逐 30 分鐘切換，取消勾選的時段改為可預約）。各動作成功後重抓週曆並關窗、失敗時提示並可再按。
// 表頭欄寬依重疊預約數與公休數計算；可預約人數＝上限－已預約（不低於 0）；切換週別、報到狀態篩選會重新整理資料。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays, endOfWeek, format, setHours, setMinutes, startOfWeek } from 'date-fns'
import React from 'react'

import { currentLocation, renderPage } from '__tests__/testkit.test'
import Reservation from '../DesignerWeekReservation'
import { openSnackbar } from 'elements/snackbars'

const WEEK = startOfWeek(new Date(2026, 9, 14)).getTime() // 2026/10/11（日），已過去的一週
const FUTURE_WEEK = startOfWeek(new Date(2099, 0, 7)).getTime()
const at = (week, day, hour, minute = 0) => setMinutes(setHours(addDays(week, day), hour), minute).getTime()

const mockApi = {}
let mockCalendarInput
let mockNameType = 'NAME'
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('hooks/useFetchMerchant', () => () => ({ loading: false, data: { merchant: { openingHours: '10:00:00', closingHours: '20:00:00' } } }))
jest.mock('hooks/useFetchGetDesignerNameForCustomerSide', () => () => ({ loading: !!mockApi.settingsLoading, data: { getDesignerNameForCustomerSide: mockNameType } }))
jest.mock('hooks/useFetchGetIsBookingRemarkDisplay', () => () => ({ loading: !!mockApi.settingsLoading, data: { getIsBookingRemarkDisplay: mockApi.remarkDisplay } }))
jest.mock('hooks/useFetchGetIsCusBookingRemarkDisplay', () => () => ({ loading: !!mockApi.settingsLoading, data: { getIsCusBookingRemarkDisplay: mockApi.cusRemarkDisplay } }))
jest.mock('hooks/useFetchGetMerchantDesignerWeekCalendar', () => ({ input }) => {
  mockCalendarInput = input
  return mockApi.calendar(input)
})
jest.mock('hooks/useFetchAdminBookingTime', () => ({
  __esModule: true,
  default: () => ({ adminBookingTime: (...a) => mockApi.adminBookingTime(...a) }),
  useFetchAdminBookingTimeAllStore: () => ({ adminBookingTimeAllStore: (...a) => mockApi.allStore(...a) }),
}))
jest.mock('hooks/useFetchVerifyBooking', () => () => ({ verifyBooking: (...a) => mockApi.verifyBooking(...a) }))
jest.mock('hooks/useFetchSetAdminBookingTimes', () => () => ({ setTimes: (...a) => mockApi.setTimes(...a) }))

const reservations = week => [
  {
    type: 'RESERVATION', ids: ['r1'], startTime: at(week, 1, 11), endTime: at(week, 1, 12), timeCost: 2, bookingStatus: '預約成功', isDesignate: true,
    nameToDisplay: '王小明', customerId: 'c1', customerCellphone: '0912000111', remark: '剪短', remarkForCustomer: '怕痛', companionCount: 1,
    isCheckin: true, isDone: false, displayBirthdayIcon: true, notificationDate: at(week, 0, 9), notificationDayCount: 1,
  },
  {
    type: 'RESERVATION', ids: ['r2'], startTime: at(week, 1, 11), endTime: at(week, 1, 13), timeCost: 4, bookingStatus: '待審核', isDesignate: false,
    nameToDisplay: '陳小美', customerCellphone: '0922', remark: '', remarkForCustomer: '', companionCount: 0, isCheckin: false, isDone: false,
  },
  { type: 'RESERVATION', ids: ['r3'], startTime: at(week, 1, 15), endTime: at(week, 1, 16), timeCost: 2, bookingStatus: '預約成功', nameToDisplay: '已結帳客', isDone: true, createdOrderId: 'ord9' },
  { type: 'HOLIDAY', ids: [], startTime: at(week, 1, 17), endTime: at(week, 1, 18), timeCost: 2, nameToDisplay: '休1' },
  { type: 'HOLIDAY', ids: [], startTime: at(week, 2, 12), endTime: at(week, 2, 13, 30), timeCost: 3, nameToDisplay: '公休' },
  { type: 'HOLIDAY', ids: [], startTime: at(week, 3, 12), endTime: at(week, 3, 13), timeCost: 2, nameToDisplay: '休A' },
  { type: 'RH', ids: [], startTime: at(week, 3, 12, 30), endTime: at(week, 3, 13, 30), timeCost: 2, nameToDisplay: '休B' },
]
const calendarResult = (week, extra = {}) => ({
  loading: false,
  refetch: mockApi.refetch,
  data: {
    getMerchantDesignerWeekCalendar: {
      merchantUnappointCalendar: [],
      merchantDesignerCalendar: [{ designerId: 'd1', designerName: '王大明', designerNickname: '小明', bookingLimit: 1, calendar: reservations(week), ...extra }],
    },
  },
})

const props = { designerId: 'd1', checkinSettings: { isBookingCheckinEnabled: true }, bookingCusCheck: false, checkinMode: false, bookingHistoryDisplay: true }
const renderTab = (extra = {}, week = WEEK) => {
  window.history.pushState({}, '', `/profile/reservation?startDate=${week}`)
  return renderPage(<Reservation {...props} {...extra} />, { route: '/profile/reservation' })
}
// 色塊第一個 span 是「（生日圖示）＋名稱」
const chip = name => {
  const found = [...document.querySelectorAll('#darkBorder')].find(el => el.firstChild.textContent.replace('🎂', '') === name)
  if (!found) throw new Error(`找不到色塊：${name}`)
  return found
}
const dialogBody = () => screen.getByRole('dialog')
const titles = () => [...document.querySelectorAll('.ManagementReservationRecord > div:first-child > div')].slice(1)
// 某一天（欄）的時段格：欄的第 index 個子元素
const slotOf = (dayIndex, time) => {
  const column = document.querySelectorAll('.ManagementReservationRecord > div:nth-child(2) > div')[dayIndex + 1]
  const range = [...column.children].filter(el => el.className.includes('h-[70px]'))
  const start = at(WEEK, dayIndex, 10)
  return range[(time - start) / 1800000]
}

beforeEach(() => {
  localStorage.setItem('userMerchant', { id: 'm1' })
  mockNameType = 'NAME'
  mockApi.remarkDisplay = true
  mockApi.cusRemarkDisplay = true
  mockApi.settingsLoading = false
  mockApi.refetch = jest.fn()
  mockApi.calendar = () => calendarResult(WEEK)
  mockApi.adminBookingTime = jest.fn(() => Promise.resolve({ data: { adminBookingTime: { designerId: 'd1' } } }))
  mockApi.allStore = jest.fn()
  mockApi.verifyBooking = jest.fn(() => Promise.resolve({ data: { verifyBooking: { id: 'r1' } } }))
  mockApi.setTimes = jest.fn(() => Promise.resolve({ data: { adminBookingTimes: true } }))
  openSnackbar.mockClear()
})
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('週曆版面', () => {
  it('以網址的週查詢該設計師；表頭欄寬依重疊預約與公休數；可預約人數不低於 0；顯示生日圖示、備註與報到圖示', () => {
    renderTab()
    expect(mockCalendarInput).toEqual({
      dateRange: { startDate: WEEK, endDate: endOfWeek(WEEK).getTime() },
      designerIds: ['d1'],
      forceDisplay: true,
    })
    const widths = titles().map(t => t.style.width)
    // 日：無資料 150；一：最多兩筆重疊（欄 3）＋公休（2）→ 300+75+30；二：一個公休 → 150；三：兩筆重疊公休 → 180
    expect(widths.slice(0, 4)).toEqual(['150px', '405px', '150px', '180px'])
    expect(titles()[1]).toHaveTextContent(`${format(at(WEEK, 1, 0), 'M/dd')} 週(一)`)
    // 11:00 兩筆預約、上限 1 → 0；10:00 沒有預約 → 1
    expect(slotOf(1, at(WEEK, 1, 11))).toHaveTextContent('0')
    expect(slotOf(1, at(WEEK, 1, 10))).toHaveTextContent('1')
    expect(slotOf(0, at(WEEK, 0, 10))).toHaveTextContent('可預約人數1')
    // 有公休的欄：不可預約時段標示
    expect(slotOf(1, at(WEEK, 1, 17)).firstChild).toHaveAttribute('title', '不可預約時段')
    expect(chip('王小明')).toHaveTextContent('🎂王小明怕痛剪短')
    // 已報到顯示報到圖示；過去未報到顯示未報到圖示
    expect(chip('王小明').querySelectorAll('svg')).toHaveLength(1)
    expect(chip('陳小美').querySelectorAll('svg')).toHaveLength(1)
  })

  it('未來的未報到預約不顯示圖示；關閉報到功能時不顯示報到狀態篩選與圖示', () => {
    mockApi.calendar = () => calendarResult(FUTURE_WEEK)
    renderTab({}, FUTURE_WEEK)
    expect(chip('陳小美').querySelectorAll('svg')).toHaveLength(0)
    cleanup()
    mockApi.calendar = () => calendarResult(WEEK)
    renderTab({ checkinSettings: { isBookingCheckinEnabled: false } })
    expect(screen.queryByText('報到狀態')).toBeNull()
    expect(chip('王小明').querySelectorAll('svg')).toHaveLength(0)
  })

  it('報到狀態篩選：選「報到成功」只留已報到的預約；切到上週重新查詢', () => {
    renderTab()
    const select = screen.getByText('報到狀態').parentElement.querySelector('select')
    fireEvent.change(select, { target: { value: '1' } })
    expect(chip('王小明')).toBeInTheDocument()
    expect(() => chip('陳小美')).toThrow()
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '上週' }), { key: 'Enter' })
    expect(mockCalendarInput.dateRange.startDate).toBe(startOfWeek(addDays(new Date(), -7)).getTime())
  })

  it('顯示設定還在載入時：設計師名稱與備註先用預設（不顯示備註）', () => {
    mockApi.settingsLoading = true
    renderTab()
    expect(chip('王小明').querySelector('#remark')).toBeNull()
    expect(chip('王小明').querySelector('#cusRemark')).toBeNull()
  })

  it('沒有網址參數時查本週；載入中顯示遮罩、不畫週曆', () => {
    window.history.pushState({}, '', '/profile/reservation')
    mockApi.calendar = () => ({ loading: true, refetch: () => {} })
    renderPage(<Reservation {...props} className="mt-6" />)
    expect(mockCalendarInput.dateRange.startDate).toBe(startOfWeek(new Date()).getTime())
    expect(document.getElementById('Backdrop').style.visibility).toBe('')
    expect(screen.queryByText('時間')).toBeNull()
  })
})

describe('點時段', () => {
  it('空白時段：新預約連結帶店家、日期、設計師；關閉預約成功後重抓並關窗', async () => {
    renderTab()
    const time = at(WEEK, 0, 10)
    fireEvent.click(slotOf(0, time))
    const link = within(dialogBody()).getByText('新預約').closest('a')
    expect(link).toHaveAttribute('href', `/customer/reservation/m1?usingLineLogin=0&date=${time}&designerId=d1`)
    fireEvent.click(within(dialogBody()).getByText('關閉預約'))
    expect(mockApi.adminBookingTime).toHaveBeenCalledWith({ appointable: false, datetime: time, designerId: 'd1' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(mockApi.refetch).toHaveBeenCalledTimes(1)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '變更成功', variant: 'success' })
  })

  it('不可預約時段改為「開啟預約」；失敗時提示並可再按；取消關窗', async () => {
    mockApi.adminBookingTime = jest.fn(() => Promise.reject(new Error('時段已有預約')))
    renderTab()
    fireEvent.click(slotOf(1, at(WEEK, 1, 17)))
    const open = within(dialogBody()).getByText('開啟預約').closest('button')
    fireEvent.click(open)
    expect(mockApi.adminBookingTime).toHaveBeenCalledWith(expect.objectContaining({ appointable: true }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '時段已有預約', variant: 'error' }))
    expect(open).not.toBeDisabled()
    fireEvent.click(within(dialogBody()).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('後端回傳沒有設計師 id 時不關窗', async () => {
    mockApi.adminBookingTime = jest.fn(() => Promise.resolve({ data: { adminBookingTime: {} } }))
    renderTab()
    fireEvent.click(slotOf(0, at(WEEK, 0, 10)))
    fireEvent.click(within(dialogBody()).getByText('關閉預約'))
    await act(() => Promise.resolve())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(mockApi.refetch).not.toHaveBeenCalled()
  })

  it('報到模式：只有新預約，沒有開關預約', () => {
    renderTab({ checkinMode: true })
    fireEvent.click(slotOf(0, at(WEEK, 0, 10)))
    expect(within(dialogBody()).getByText('新預約')).toBeInTheDocument()
    expect(within(dialogBody()).queryByText('關閉預約')).toBeNull()
    fireEvent.keyDown(dialogBody(), { key: 'Escape' })
  })
})

describe('點預約色塊', () => {
  it('顯示預約資料；接受預約成功後重抓並關窗', async () => {
    renderTab()
    fireEvent.click(chip('王小明'))
    const body = dialogBody()
    expect(body).toHaveTextContent('姓名: 王小明')
    expect(body).toHaveTextContent('電話: 0912000111')
    expect(body).toHaveTextContent(`日期: ${format(at(WEEK, 1, 11), 'yyyy/MM/dd')}`)
    expect(body).toHaveTextContent('預約時間: 11:00')
    expect(body).toHaveTextContent('指定/不指定: 指定')
    expect(body).toHaveTextContent('設計師: 王大明')
    expect(body).toHaveTextContent('同行人數: 1')
    expect(body).toHaveTextContent('備註: 剪短')
    expect(body).toHaveTextContent('顧客備註: 怕痛')
    expect(body).toHaveTextContent('報到狀態: 報到成功')
    expect(body).toHaveTextContent(`提醒日期: ${format(at(WEEK, 0, 9), 'yyyy/MM/dd')} (1天前)`)
    expect(within(body).getByText('編輯').closest('a')).toHaveAttribute('href', '/order/r1?status=edit')
    expect(within(body).getByText('結帳').closest('a')).toHaveAttribute('href', '/order/r1?status=checkout')
    // 預約成功：不顯示「接受預約」
    expect(within(body).queryByText('接受預約')).toBeNull()
    fireEvent.click(within(body).getByText('取消預約'))
    expect(mockApi.verifyBooking).toHaveBeenCalledWith({ orderId: 'r1', isApproval: false })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(openSnackbar).toHaveBeenCalledWith({ message: '已取消預約', variant: 'success' })
    expect(mockApi.refetch).toHaveBeenCalledTimes(1)
  })

  // 已修正（Jason 2026/10/22 fix all）：判斷待審核原本讀 rest.status（週曆資料沒有這個欄位，只有 bookingStatus），
  // 待審核的預約被當成「預約成功」開啟、多一個「編輯」連結；改讀 rest.bookingStatus
  it('待審核預約：可接受預約、沒有編輯（只有結帳）；不指定時設計師顯示不指定、未報到', async () => {
    renderTab()
    fireEvent.click(chip('陳小美'))
    const body = dialogBody()
    expect(body).toHaveTextContent('設計師: 不指定')
    expect(body).toHaveTextContent('報到狀態: 未報到')
    expect(body).not.toHaveTextContent('提醒日期')
    expect(within(body).queryByText('編輯')).toBeNull()
    expect(within(body).getByText('結帳').closest('a')).toHaveAttribute('href', '/order/r2?status=checkout')
    fireEvent.click(within(body).getByText('接受預約'))
    expect(mockApi.verifyBooking).toHaveBeenCalledWith({ orderId: 'r2', isApproval: true })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已接受預約', variant: 'success' }))
  })

  it('審核失敗提示錯誤；後端沒回 id 時不關窗，但「關閉」可按', async () => {
    mockApi.verifyBooking = jest.fn(() => Promise.reject(new Error('已被取消')))
    renderTab()
    fireEvent.click(chip('陳小美'))
    fireEvent.click(within(dialogBody()).getByText('接受預約'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已被取消', variant: 'error' }))
    mockApi.verifyBooking = jest.fn(() => Promise.resolve({ data: { verifyBooking: {} } }))
    fireEvent.click(within(dialogBody()).getByText('接受預約'))
    await act(() => Promise.resolve())
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // 已修正（Jason 2026/10/22 fix all）：後端沒回 id 時「關閉」原本維持停用，只能按 Esc／點背景關；改為回應後即可按
    fireEvent.click(within(dialogBody()).getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('已結帳的預約：直接在新分頁開帳單', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => {})
    renderTab()
    fireEvent.click(chip('已結帳客'))
    expect(open).toHaveBeenCalledWith('/order/ord9', '_blank')
    expect(screen.queryByRole('dialog')).toBeNull()
    open.mockRestore()
  })

  it('顯示暱稱設定：有暱稱用暱稱、沒有用本名', () => {
    mockNameType = 'NICKNAME'
    renderTab()
    fireEvent.click(chip('王小明'))
    expect(dialogBody()).toHaveTextContent('設計師: 小明')
    cleanup()
    mockApi.calendar = () => calendarResult(WEEK, { designerNickname: null })
    renderTab()
    fireEvent.click(chip('王小明'))
    expect(dialogBody()).toHaveTextContent('設計師: 王大明')
  })

  // 已修正（Jason 2026/10/22 fix all）：「本名＋暱稱」原本判斷 designerName === 'BOTH'（永遠不成立，只顯示本名；
  // 本名剛好是「BOTH」時反而加上暱稱），改為 designerNameType === 'BOTH'
  it('顯示設定為 BOTH：本名(暱稱)；沒有暱稱只顯示本名；本名剛好是「BOTH」不影響', () => {
    mockNameType = 'BOTH'
    renderTab()
    fireEvent.click(chip('王小明'))
    expect(dialogBody()).toHaveTextContent('設計師: 王大明(小明)')
    fireEvent.click(within(dialogBody()).getByRole('button', { name: '關閉' }))
    cleanup()
    mockApi.calendar = () => calendarResult(WEEK, { designerNickname: '' })
    renderTab()
    fireEvent.click(chip('王小明'))
    expect(dialogBody()).toHaveTextContent('設計師: 王大明')
    expect(dialogBody()).not.toHaveTextContent('王大明(')
    cleanup()
    mockNameType = 'NAME'
    mockApi.calendar = () => calendarResult(WEEK, { designerName: 'BOTH' })
    renderTab()
    fireEvent.click(chip('王小明'))
    expect(dialogBody()).toHaveTextContent('設計師: BOTH')
    expect(dialogBody()).not.toHaveTextContent('BOTH(')
  })
})

describe('點公休色塊（編輯公休）', () => {
  const holiday = name => chip(name)

  it('列出公休每 30 分鐘時段；取消勾選的時段送出為可預約；成功後關窗、重抓', async () => {
    renderTab()
    fireEvent.click(holiday('公休'))
    const body = dialogBody()
    expect(within(body).getByText('編輯公休')).toBeInTheDocument()
    const slots = within(body).getAllByRole('button').filter(b => /^\d\d:\d\d$/.test(b.textContent))
    expect(slots.map(b => [b.textContent, b.getAttribute('aria-pressed')])).toEqual([
      ['12:00', 'true'],
      ['12:30', 'true'],
      ['13:00', 'true'],
    ])
    fireEvent.click(slots[1])
    expect(within(body).getByRole('button', { name: '12:30' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(within(body).getByRole('button', { name: '確定' }))
    expect(mockApi.setTimes).toHaveBeenCalledWith({ input: { designerId: 'd1', datetimes: [at(WEEK, 2, 12, 30)], appointable: true } })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯成功', variant: 'success' })
    expect(mockApi.refetch).toHaveBeenCalledTimes(1)
  })

  it('後端回傳失敗：提示並可再按；拋錯：提示錯誤；取消關窗', async () => {
    mockApi.setTimes = jest.fn(() => Promise.resolve({ data: { adminBookingTimes: false } }))
    renderTab()
    fireEvent.click(holiday('休A'))
    const confirm = within(dialogBody()).getByRole('button', { name: '確定' })
    fireEvent.click(confirm)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯失敗', variant: 'warning' }))
    expect(confirm).not.toBeDisabled()
    mockApi.setTimes = jest.fn(() => Promise.reject(new Error('連線中斷')))
    fireEvent.click(confirm)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '連線中斷', variant: 'error' }))
    expect(mockApi.setTimes).toHaveBeenCalledWith({ input: { designerId: 'd1', datetimes: [], appointable: true } })
    fireEvent.click(within(dialogBody()).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('送出中按取消不關窗；Esc 關窗', async () => {
    let release
    mockApi.setTimes = jest.fn(() => new Promise(resolve => (release = resolve)))
    renderTab()
    fireEvent.click(holiday('休B'))
    fireEvent.click(within(dialogBody()).getByRole('button', { name: '確定' }))
    expect(within(dialogBody()).getByRole('button', { name: '取消' })).toBeDisabled()
    await act(async () => release({ data: { adminBookingTimes: false } }))
    fireEvent.keyDown(dialogBody(), { key: 'Escape' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('備註過長時的捲動動畫（依色塊與備註高度）', () => {
  const sizes = {}
  const define = (prop, key) =>
    Object.defineProperty(window.HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        const entry = sizes[this.id] || sizes[this.getAttribute && this.getAttribute('data-size')]
        return entry ? entry[key] : 0
      },
    })
  beforeAll(() => {
    define('offsetHeight', 'h')
    define('offsetWidth', 'w')
  })
  afterAll(() => {
    delete window.HTMLElement.prototype.offsetHeight
    delete window.HTMLElement.prototype.offsetWidth
  })
  const remarkOf = name => chip(name).querySelector('#remark')
  const cusOf = name => chip(name).querySelector('#cusRemark')

  it.each([
    ['兩種備註都很長：兩者都捲動', { remark: 40, cusRemark: 40 }, [true, true]],
    ['只有店家備註長', { remark: 40, cusRemark: 10 }, [true, false]],
    ['只有顧客備註長', { remark: 10, cusRemark: 40 }, [false, true]],
    ['都不長', { remark: 20, cusRemark: 20 }, [false, false]],
  ])('小色塊、%s', (_name, heights, [remarkAnimated, cusAnimated]) => {
    sizes.darkBorder = { h: 60, w: 100 }
    sizes.remark = { h: heights.remark }
    sizes.cusRemark = { h: heights.cusRemark }
    renderTab()
    expect(remarkOf('王小明').classList.contains('textAnimation')).toBe(remarkAnimated)
    expect(cusOf('王小明').classList.contains('textAnimation')).toBe(cusAnimated)
  })

  it('大色塊：清掉捲動樣式；只顯示一種備註時不加動畫', () => {
    sizes.darkBorder = { h: 200, w: 300 }
    sizes.remark = { h: 40 }
    sizes.cusRemark = { h: 40 }
    renderTab()
    expect(remarkOf('王小明').classList.contains('textAnimation')).toBe(false)
    expect(remarkOf('王小明').style.wordBreak).toBe('')
    cleanup()
    sizes.darkBorder = { h: 200, w: 300 }
    mockApi.remarkDisplay = false
    renderTab()
    expect(remarkOf('王小明')).toBeNull()
    expect(cusOf('王小明').style.whiteSpace).toBe('')
    cleanup()
    sizes.darkBorder = { h: 200, w: 300 }
    mockApi.remarkDisplay = true
    mockApi.cusRemarkDisplay = false
    renderTab()
    expect(cusOf('王小明')).toBeNull()
    cleanup()
    sizes.darkBorder = { h: 60, w: 100 }
    renderTab()
    expect(remarkOf('王小明').classList.contains('textAnimation')).toBe(false)
  })
})

describe('currentLocation', () => {
  it('新預約連結是站內連結（點了不離開 SPA）', () => {
    renderTab()
    fireEvent.click(slotOf(0, at(WEEK, 0, 10)))
    fireEvent.click(within(dialogBody()).getByText('新預約'))
    expect(currentLocation()).toContain('/customer/reservation/m1')
  })
})
