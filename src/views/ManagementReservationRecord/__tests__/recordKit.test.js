// 單日預約紀錄頁面測試共用的假資料與操作（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證假資料本身）。
// 為什麼需要：單日預約紀錄一次讀 11 支設定與行事曆查詢，行事曆的時間必須落在頁面選的那一天；
// 這裡以「網址帶 startDate」把頁面固定在過去的某一天（所有預約都已過時，報到圖示判斷不受執行時間影響），
// 行事曆 fixture 依查詢送出的日期產生資料。GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實預約。
import React from 'react'
import { screen } from '@testing-library/react'
import { renderPage } from '../../../__tests__/testkit.test'
import Calendar from '..'

const isMain = expect.getState().testPath === __filename

export const SLOT = 30 * 60 * 1000
export const DAY = new Date(2025, 2, 10)
export const DAY_START = DAY.getTime()
export const DAY_END = new Date(2025, 2, 10, 23, 59, 59, 999).getTime()
export const ROUTE = `/management/reservation/record?startDate=${DAY_START}&endDate=${DAY_END}`

// base：該天 00:00（毫秒）
export const at = (base, h, m = 0) => {
  const d = new Date(base)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime()
}

export const entry = (type, startTime, timeCost, extra = {}) => ({
  type,
  ids: [],
  startTime,
  endTime: startTime + timeCost * SLOT,
  timeCost,
  nameToDisplay: '',
  isDesignate: false,
  bookingStatus: null,
  isUnwelcome: false,
  customerId: null,
  customerCellphone: null,
  remark: '',
  remarkForCustomer: '',
  isBookingCostUsing: false,
  companionCount: 0,
  notificationDayCount: null,
  notificationDate: null,
  displayBirthdayIcon: false,
  isCheckin: null,
  isCusCheckRequired: false,
  isDone: false,
  createdOrderId: null,
  isNoShow: false,
  ...extra,
})

export const reservation = (base, h, m, cost, extra) => entry('RESERVATION', at(base, h, m), cost, extra)

// 主要設計師：一筆指定預約（10:00–11:00）＋一筆重疊的待審核（10:30–11:00），兩筆都佔名額
export const AMY = base => ({
  designerId: 'd-1',
  designerName: '王小美',
  designerNickname: 'Amy',
  designerNo: '01',
  bookingLimit: 2,
  calendar: [
    reservation(base, 10, 0, 2, {
      ids: ['b-1'],
      nameToDisplay: '陳小姐',
      isDesignate: true,
      bookingStatus: '預約成功',
      isBookingCostUsing: true,
      customerId: 'c-1',
      customerCellphone: '0912000111',
      remark: '剪髮',
      remarkForCustomer: '想要安靜',
      companionCount: 1,
      notificationDayCount: 2,
      // 兩天前（以日曆日計，不用 48 小時：日光節約切換日會差一小時）
      notificationDate: new Date(new Date(base).getFullYear(), new Date(base).getMonth(), new Date(base).getDate() - 2).getTime(),
      displayBirthdayIcon: true,
      isCheckin: false,
    }),
    reservation(base, 10, 30, 1, {
      ids: ['b-2'],
      nameToDisplay: '林先生',
      bookingStatus: '待審核',
      isBookingCostUsing: true,
      customerId: 'c-2',
      customerCellphone: '0922000222',
      isCheckin: null,
    }),
  ],
})

export const NDS = base => ({
  designerName: '不指定',
  calendar: [],
})

export const calendarResponse = (designers, nds) => ({ input: { dateRange: { startDate } } }) => ({
  getMerchantDesignerCalendar: {
    merchantDesignerCalendar: designers.map(d => (typeof d === 'function' ? d(startDate) : d)),
    nonDesignateCalendar: typeof nds === 'function' ? nds(startDate) : nds,
  },
})

export const settingsFixtures = ({
  nameType = 'NAME',
  remark = false,
  cusRemark = false,
  eventDisplay = false,
  checkin = false,
  manualNotify = false,
  cusCheck = false,
  socketTypes = ['UNCHECK', 'CREATE'],
  history = false,
  cancelPassword = false,
} = {}) => ({
  // hooks/useFetchMerchant 的查詢沒有名稱，模擬 link 以 'undefined' 為鍵
  undefined: { merchant: { id: 'merchant-1', openingHours: '10:00:00', closingHours: '20:00:00' } },
  getDesignerNameForCustomerSide: { getDesignerNameForCustomerSide: nameType },
  GET_BOOKING_REMARK_DISPLAY: { getIsBookingRemarkDisplay: remark },
  GET_CUS_BOOKING_REMARK_DISPLAY: { getIsCusBookingRemarkDisplay: cusRemark },
  GET_PARAMETER_ABOUT_SETTING_FUNCTION: { getParameterAboutSettingFunction: { isEventDisplayOnDayBookingRecord: eventDisplay } },
  GET_CHECKIN_SETTING_FOR_CALENDAR: {
    getMerchantCheckinSettings: { isBookingCheckinEnabled: checkin, isUnDoneBookingManualNotify: manualNotify },
  },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: cusCheck },
  GET_IS_BOOKING_TYPE_FOR_SOCKET: { getBookingTypeForSocket: socketTypes },
  GET_BOOKING_HISTORY_DISPLAY: { getParameterAboutBookingSetting: { isBookingHistoryDisplay: history } },
  GET_CANCEL_BOOKING_USING: { merchantPassword: { cancelReservation: { isUsing: cancelPassword } } },
})

export function setupRecord({ designers = [AMY], nds = NDS, settings, fixtures = {}, route = ROUTE, delays, store } = {}) {
  return renderPage(<Calendar />, {
    route,
    store,
    delays,
    fixtures: {
      ...settingsFixtures(settings),
      getMerchantDesignerCalendar: calendarResponse(designers, nds),
      ...fixtures,
    },
  })
}

// 行事曆表格：表頭與表身（第 1 欄不指定、第 2 欄時間、之後每位設計師一欄）
export const table = () => document.querySelector('.ManagementReservationRecord')
export const tableBody = () => table().children[1]
export const timeLabels = () => [...tableBody().children[1].children].map(el => el.textContent)
export const designerHeaders = () => [...table().children[0].children].slice(2).map(el => el.textContent)
export const designerColumn = i => tableBody().children[2 + i]
// 某位設計師在第 row 個時段的空白格（點了開新增預約）
export const designerCell = (i, row) => designerColumn(i).children[row]
export const ndsCell = row => tableBody().children[0].children[row]
// 預約色塊：以顯示名稱找
export const block = name => {
  const found = [...document.querySelectorAll('#darkBorder')].find(el => el.firstChild.textContent.replace('🎂', '') === name)
  if (!found) throw new Error(`找不到色塊：${name}`)
  return found
}
export const hasBlock = name => [...document.querySelectorAll('#darkBorder')].some(el => el.firstChild.textContent.replace('🎂', '') === name)
export const pageReady = async utils => {
  await utils.settle()
  await screen.findByText('時間')
}

if (isMain) {
  it('假資料：預約時間落在查詢的那一天，佔用 timeCost 個 30 分鐘', () => {
    const amy = AMY(DAY_START)
    expect(new Date(amy.calendar[0].startTime).getDate()).toBe(10)
    expect(amy.calendar[0].endTime - amy.calendar[0].startTime).toBe(2 * SLOT)
    expect(calendarResponse([AMY], NDS)({ input: { dateRange: { startDate: DAY_START } } }).getMerchantDesignerCalendar.merchantDesignerCalendar[0].designerId).toBe('d-1')
  })
}
