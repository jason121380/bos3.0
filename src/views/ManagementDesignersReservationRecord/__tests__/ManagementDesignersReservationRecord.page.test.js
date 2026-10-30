// 保護「單週預約紀錄」：櫃台以週為單位看全店（或指定一位設計師）的預約。守住：
// - 查詢送出畫面選的那一週（週日 00:00 到週六 23:59:59.999）與指定的設計師（沒指定送空陣列＝全店）
// - 全店模式：顯示全店不可預約時段，點空白格可新預約（帶日期時間的預約連結）、關閉全店預約；點全店不可預約可開啟
// - 指定一位設計師：顯示可預約人數與公休，點空白格關閉該設計師的預約、點公休開「編輯公休」
// - 預約明細：接受／取消（取消密碼）、未出席；已開單的預約另開帳單頁；報到圖示、報到模式與報到狀態篩選
// - 設定或行事曆查詢失敗時不整頁壞（顯示空的週曆）
// 原本的已知缺口已於 2026/10/22 修正（Jason fix all）：OrderTable.js 的待審核判斷（rest.status→rest.bookingStatus）、
// 本名＋暱稱設定（designerName→designerNameType）、審核窗後端沒回 id 時「取消」仍可按、預約歷史／取消密碼／報到設定查詢失敗不整頁壞。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實預約。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, currentLocation } from '../../../__tests__/testkit.test'
import Calendar from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ value, onChange, localeText }) => (
    <input aria-label={localeText && localeText.toolbarTitle} data-value={value} onChange={e => onChange(new Date(Number(e.target.value)))} />
  ),
}))
jest.mock('components/BookingRecordListAutoComplete', () => ({ onChange, value }) => (
  <div data-testid="designer-picker" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: '' })}>
      全部設計師
    </button>
    <button type="button" onClick={() => onChange({ id: 'row-1', userId: 'd-1' })}>
      只看王小美
    </button>
  </div>
))

const SLOT = 1800000
const WEEK_START = new Date(2025, 2, 9).getTime() // 週日
const WEEK_END = new Date(2025, 2, 15, 23, 59, 59, 999).getTime()
const ROUTE = `/management/reservation/designers?startDate=${WEEK_START}&endDate=${WEEK_END}`
const at = (day, h, m = 0) => new Date(2025, 2, 9 + day, h, m).getTime()
const item = (type, start, cost, extra = {}) => ({
  type,
  ids: [],
  startTime: start,
  endTime: start + cost * SLOT,
  timeCost: cost,
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
const AMY = {
  designerId: 'd-1',
  designerName: '王小美',
  designerNickname: 'Amy',
  designerNo: '01',
  bookingLimit: 2,
  calendar: [
    item('RESERVATION', at(1, 10), 2, {
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
      isCheckin: false,
      notificationDayCount: 1,
      notificationDate: at(0, 9),
      displayBirthdayIcon: true,
    }),
    item('RESERVATION', at(1, 10, 30), 1, {
      ids: ['b-2'],
      nameToDisplay: '林先生',
      bookingStatus: '待審核',
      isBookingCostUsing: true,
      customerId: 'c-2',
      customerCellphone: '0922',
    }),
    item('RESERVATION', at(1, 12), 1, { ids: ['b-5'], nameToDisplay: '已開單客', bookingStatus: '預約成功', isDone: true, createdOrderId: 'o-9' }),
    item('RESERVATION', at(2, 10), 1, {
      ids: ['b-3'],
      nameToDisplay: '黃小姐',
      bookingStatus: '已完成',
      isCheckin: true,
      isNoShow: true,
      customerId: 'c-3',
      customerCellphone: '0933',
    }),
    item('RESERVATION', at(3, 10), 1, {
      ids: ['b-4'],
      nameToDisplay: '取消客',
      bookingStatus: '設計師已取消',
      customerId: 'c-4',
      customerCellphone: '0944',
    }),
    item('HOLIDAY', at(1, 14), 2, { ids: ['h-1'], nameToDisplay: '公休' }),
  ],
}
const UNAPPOINT = [{ id: 'u-1', date: at(3, 15) }]

const settings = ({ nameType = 'NAME', remark = false, cusRemark = false, checkin = false, cusCheck = false, cancelPassword = false } = {}) => ({
  undefined: { merchant: { id: 'merchant-1', openingHours: '10:00:00', closingHours: '20:00:00' } },
  getDesignerNameForCustomerSide: { getDesignerNameForCustomerSide: nameType },
  GET_BOOKING_REMARK_DISPLAY: { getIsBookingRemarkDisplay: remark },
  GET_CUS_BOOKING_REMARK_DISPLAY: { getIsCusBookingRemarkDisplay: cusRemark },
  GET_CHECKIN_SETTING_FOR_CALENDAR: { getMerchantCheckinSettings: { isBookingCheckinEnabled: checkin, isUnDoneBookingManualNotify: false } },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: cusCheck },
  GET_BOOKING_HISTORY_DISPLAY: { getParameterAboutBookingSetting: { isBookingHistoryDisplay: false } },
  GET_CANCEL_BOOKING_USING: { merchantPassword: { cancelReservation: { isUsing: cancelPassword } } },
})

const setup = ({ designers = [AMY], unappoint = UNAPPOINT, fixtures = {}, route = ROUTE, delays, ...opts } = {}) =>
  renderPage(<Calendar />, {
    route,
    delays,
    fixtures: {
      ...settings(opts),
      getMerchantDesignerCalendar: { getMerchantDesignerWeekCalendar: { merchantDesignerCalendar: designers, merchantUnappointCalendar: unappoint } },
      ...fixtures,
    },
  })
const ready = async utils => {
  await utils.settle()
  await screen.findByText('時間')
}

const table = () => document.querySelector('.ManagementReservationRecord')
const dayTitles = () => [...table().children[0].children].slice(1).map(el => el.textContent)
const timeLabels = () => [...table().children[1].children[0].children].map(el => el.textContent)
const dayCell = (day, row) => table().children[1].children[1 + day].children[row]
const row = (h, m = 0) => (h - 10) * 2 + m / 30
const block = name => {
  const found = [...document.querySelectorAll('#darkBorder')].find(el => el.firstChild.textContent.replace('🎂', '') === name)
  if (!found) throw new Error(`找不到色塊：${name}`)
  return found
}
const hasBlock = name => [...document.querySelectorAll('#darkBorder')].some(el => el.firstChild.textContent.replace('🎂', '') === name)
const dialog = () => document.querySelector('.ManagementReservationRecordDialog')
const button = name => within(dialog()).getByRole('button', { name })
const closedDialog = () => wait(() => expect(dialog()).toBeNull())
const sentOf = (calls, name) => callsOf(calls, name).map(c => c.variables)
const sequence = (...responses) => {
  let i = 0
  return () => responses[Math.min(i++, responses.length - 1)]
}
const onlyAmy = async utils => {
  fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
  fireEvent.click(screen.getByRole('button', { name: '只看王小美' }))
  await utils.settle()
  await wait(() => expect(dayCell(1, row(11)).textContent).toBe('2'))
}

beforeEach(() => {
  loginAs()
  window.open = jest.fn()
})
afterEach(cleanup)

describe('查詢與版面', () => {
  it('查詢送出畫面選的那一週、全店（設計師空陣列）；表頭為一週七天，時間軸為營業時間', async () => {
    // 取消密碼設定晚到：週曆照常先顯示
    const utils = setup({ delays: { GET_CANCEL_BOOKING_USING: 200 } })
    await ready(utils)
    expect(sentOf(utils.calls, 'getMerchantDesignerCalendar').pop()).toEqual({
      input: { dateRange: { startDate: WEEK_START, endDate: WEEK_END }, designerIds: [] },
    })
    expect(dayTitles()).toEqual(['3/09 週(日)', '3/10 週(一)', '3/11 週(二)', '3/12 週(三)', '3/13 週(四)', '3/14 週(五)', '3/15 週(六)'])
    expect(timeLabels()[0]).toBe('10:00')
    expect(timeLabels()[timeLabels().length - 1]).toBe('20:00')
    expect(document.getElementById('Backdrop')).toHaveStyle('visibility: hidden')
  })

  it('指定設計師後只查那一位；選回全部設計師時送空陣列', async () => {
    const utils = setup()
    await ready(utils)
    await onlyAmy(utils)
    expect(sentOf(utils.calls, 'getMerchantDesignerCalendar').pop().input.designerIds).toEqual(['d-1'])
    expect(screen.getByTestId('designer-picker')).toHaveAttribute('data-value', 'd-1')
    fireEvent.click(screen.getByRole('button', { name: '全部設計師' }))
    await utils.settle()
    expect(sentOf(utils.calls, 'getMerchantDesignerCalendar').pop().input.designerIds).toEqual([])
    expect(screen.getByTestId('designer-picker')).toHaveAttribute('data-value', '')
  })

  it('換週：查詢新的一週', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.change(screen.getByLabelText('起始時間'), { target: { value: String(new Date(2025, 2, 19).getTime()) } })
    await utils.settle()
    expect(sentOf(utils.calls, 'getMerchantDesignerCalendar').pop().input.dateRange).toEqual({
      startDate: new Date(2025, 2, 16).getTime(),
      endDate: new Date(2025, 2, 22, 23, 59, 59, 999).getTime(),
    })
  })

  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('行事曆與設定查詢失敗：顯示無法載入資料與重新查詢，不進錯誤畫面', async () => {
    const utils = setup({
      fixtures: {
        getMerchantDesignerCalendar: new Error('壞了'),
        GET_BOOKING_HISTORY_DISPLAY: new Error('壞了'),
        GET_CANCEL_BOOKING_USING: new Error('壞了'),
        GET_CHECKIN_SETTING_FOR_CALENDAR: new Error('壞了'),
        getDesignerNameForCustomerSide: new Error('壞了'),
        GET_BOOKING_REMARK_DISPLAY: new Error('壞了'),
        GET_CUS_BOOKING_REMARK_DISPLAY: new Error('壞了'),
        GET_IS_BOOKING_CUS_CHECK_USING: new Error('壞了'),
      },
    })
    // 查詢失敗時不畫週曆表格（ready 會等表頭「時間」），只等查詢都回來
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  })

  // Jason 2026/10/22 fix all：index.js 的預約歷史顯示（:158）、取消密碼（:318）讀查詢結果前原本沒有防呆，報到設定失敗時（:145）
  // 會把 checkinSettings 設成 undefined，三者任一失敗都整頁進錯誤畫面；改以 idx 加預設值（不顯示歷史、報到功能關閉）；取消密碼讀不到時一律要求密碼（helper/passwordRequired，Codex review PR #270）。
  it('預約歷史顯示、取消密碼或報到設定查詢失敗：週曆照常顯示、可開預約明細；取消密碼讀不到時先要求密碼，其餘直接取消', async () => {
    for (const name of ['GET_BOOKING_HISTORY_DISPLAY', 'GET_CANCEL_BOOKING_USING', 'GET_CHECKIN_SETTING_FOR_CALENDAR']) {
      const utils = setup({ fixtures: { [name]: new Error('壞了') } })
      await ready(utils)
      expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
      expect(hasBlock('陳小姐')).toBe(true)
      // 報到功能未開啟時不顯示報到圖示
      expect(block('陳小姐').querySelector('.lucide-square-x')).toBeNull()
      fireEvent.click(block('陳小姐'))
      await screen.findByText('電話: 0912000111')
      fireEvent.click(button('取消預約'))
      if (name === 'GET_CANCEL_BOOKING_USING') {
        // 讀不到取消密碼設定：一律先要求密碼、不直接送出（fail closed，Codex review PR #270 P1）
        expect(await screen.findByLabelText('取消預約密碼')).toBeInTheDocument()
        expect(sentOf(utils.calls, 'verifyBooking')).toHaveLength(0)
      } else {
        // 沒有取消密碼：直接送出，不跳密碼欄
        await wait(() => expect(sentOf(utils.calls, 'verifyBooking')).toHaveLength(1))
        expect(screen.queryByLabelText('取消預約密碼')).toBeNull()
      }
      cleanup()
    }
  })
})

describe('全店模式', () => {
  it('不顯示可預約人數與設計師公休，只顯示全店不可預約；預約色塊依狀態上色', async () => {
    const utils = setup()
    await ready(utils)
    expect(dayCell(1, row(11)).textContent).toBe('')
    expect(hasBlock('公休')).toBe(false)
    expect(block('全店不可預約')).toHaveStyle(`background-color: ${RESERVATION_COLORS.unavailable}`)
    expect(block('陳小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.designate}`)
    expect(block('林先生')).toHaveStyle(`background-color: ${RESERVATION_COLORS.pending}`)
    expect(block('已開單客')).toHaveStyle(`background-color: ${RESERVATION_COLORS.done}`)
    expect(screen.getByText('🎂陳小姐')).toBeInTheDocument()
    // 重疊的兩筆並排各占一半
    expect(block('陳小姐').style.width).toBe('50%')
  })

  it('點空白格：新預約連到顧客預約頁（帶時間、不帶設計師）；關閉全店預約送該時段', async () => {
    const utils = setup({
      fixtures: { adminBookingTimeAllStore: sequence(new Error('有預約'), { adminBookingTimeAllStore: { storeId: 'merchant-1' } }) },
    })
    await ready(utils)
    fireEvent.click(dayCell(2, row(11)))
    await screen.findByRole('button', { name: '關閉全店預約' })
    expect(within(dialog()).getByText('新預約').closest('a')).toHaveAttribute(
      'href',
      `/customer/reservation/merchant-1?usingLineLogin=0&date=${at(2, 11)}&designerId=`
    )
    fireEvent.click(button('關閉全店預約'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '有預約', variant: 'error' }))
    fireEvent.click(button('關閉全店預約'))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '變更成功', variant: 'success' })
    expect(sentOf(utils.calls, 'adminBookingTimeAllStore')[1]).toEqual({ input: { datetime: at(2, 11), appointable: false } })
  })

  it('點全店不可預約：開啟全店預約送 appointable: true；不可預約的空白格點了沒反應；後端沒回店家時不關窗', async () => {
    const utils = setup({
      fixtures: {
        adminBookingTimeAllStore: sequence({ adminBookingTimeAllStore: { storeId: null } }, { adminBookingTimeAllStore: { storeId: 'merchant-1' } }),
      },
    })
    await ready(utils)
    fireEvent.click(dayCell(3, row(15)))
    expect(dialog()).toBeNull()
    fireEvent.click(block('全店不可預約'))
    fireEvent.click(await screen.findByRole('button', { name: '開啟全店預約' }))
    await wait(() => expect(sentOf(utils.calls, 'adminBookingTimeAllStore')).toHaveLength(1))
    await utils.settle()
    expect(button('開啟全店預約')).toBeDisabled()
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await closedDialog()
    fireEvent.click(block('全店不可預約'))
    fireEvent.click(await screen.findByRole('button', { name: '開啟全店預約' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'adminBookingTimeAllStore')[1]).toEqual({ input: { datetime: at(3, 15), appointable: true } })
    // 取消鈕關窗
    fireEvent.click(dayCell(2, row(11)))
    fireEvent.click(await screen.findByRole('button', { name: '取消' }))
    await closedDialog()
  })
})

describe('指定一位設計師', () => {
  it('顯示可預約人數（扣掉佔名額的預約、超額為 0）與公休；點空白格關閉該設計師的預約', async () => {
    const utils = setup({ fixtures: { adminBookingTime: { adminBookingTime: { designerId: 'd-1' } } } })
    await ready(utils)
    await onlyAmy(utils)
    expect(dayCell(1, row(10)).textContent).toBe('1')
    expect(dayCell(1, row(10, 30)).textContent).toBe('0')
    // 沒有並排的那天顯示「可預約人數:」
    expect(dayCell(0, row(10)).textContent).toBe('可預約人數:2')
    expect(block('公休')).toBeInTheDocument()
    expect(hasBlock('全店不可預約')).toBe(false)
    fireEvent.click(dayCell(1, row(11)))
    await screen.findByRole('button', { name: '關閉預約' })
    expect(within(dialog()).getByText('新預約').closest('a')).toHaveAttribute(
      'href',
      `/customer/reservation/merchant-1?usingLineLogin=0&date=${at(1, 11)}&designerId=d-1`
    )
    fireEvent.click(button('關閉預約'))
    await closedDialog()
    expect(sentOf(utils.calls, 'adminBookingTime')).toEqual([{ input: { appointable: false, datetime: at(1, 11), designerId: 'd-1' } }])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '變更成功', variant: 'success' })
    fireEvent.click(dayCell(1, row(11)))
    fireEvent.click(await screen.findByRole('button', { name: '取消' }))
    await closedDialog()
  })

  it('關閉預約失敗：提示原因、可再按；沒回設計師時不關窗；取消鈕關窗', async () => {
    const utils = setup({ fixtures: { adminBookingTime: sequence(new Error('不行'), { adminBookingTime: { designerId: null } }) } })
    await ready(utils)
    await onlyAmy(utils)
    fireEvent.click(dayCell(1, row(11)))
    fireEvent.click(await screen.findByRole('button', { name: '關閉預約' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '不行', variant: 'error' }))
    fireEvent.click(button('關閉預約'))
    await wait(() => expect(sentOf(utils.calls, 'adminBookingTime')).toHaveLength(2))
    await utils.settle()
    expect(dialog()).not.toBeNull()
    // 後端沒回設計師（結果不明）：「關閉預約」維持停用避免重複送出，「取消」可按來關窗（af7ec13 修正，Jason 2026/10/22 fix all）
    expect(button('關閉預約')).toBeDisabled()
    expect(button('取消')).not.toBeDisabled()
    fireEvent.click(button('取消'))
    await closedDialog()
  })

  it('點公休開「編輯公休」，列出該段的每 30 分', async () => {
    const utils = setup()
    await ready(utils)
    await onlyAmy(utils)
    fireEvent.click(block('公休'))
    expect(await screen.findByText('編輯公休')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '14:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '14:30' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('編輯公休')).toBeNull())
    // Esc 也關閉
    fireEvent.click(block('公休'))
    await screen.findByText('編輯公休')
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('編輯公休')).toBeNull())
  })
})

describe('預約明細', () => {
  it('顯示顧客與預約資訊；編輯、結帳連到帳單頁；已開單的另開帳單', async () => {
    const utils = setup({ checkin: true })
    await ready(utils)
    fireEvent.click(block('陳小姐'))
    await screen.findByText('電話: 0912000111')
    const d = within(dialog())
    expect(d.getByRole('link', { name: '陳小姐' })).toHaveAttribute('href', '/management/customers/c-1/invoices')
    expect(d.getByText('日期: 2025/03/10')).toBeInTheDocument()
    expect(d.getByText('預約時間: 10:00')).toBeInTheDocument()
    expect(d.getByText('設計師: 王小美')).toBeInTheDocument()
    expect(d.getByText('同行人數: 1')).toBeInTheDocument()
    expect(d.getByText('報到狀態: 未報到')).toBeInTheDocument()
    expect(d.getByText('提醒日期: 2025/03/09 (1天前)')).toBeInTheDocument()
    expect(d.getByText('編輯').closest('a')).toHaveAttribute('href', '/order/b-1?status=edit')
    expect(d.getByText('結帳').closest('a')).toHaveAttribute('href', '/order/b-1?status=checkout')
    expect(d.queryByRole('button', { name: '接受預約' })).toBeNull()
    fireEvent.click(button('關閉'))
    await closedDialog()

    fireEvent.click(block('黃小姐'))
    await screen.findByText('電話: 0933')
    expect(within(dialog()).getByText('設計師: 不指定')).toBeInTheDocument()
    expect(within(dialog()).getByText('出席狀況: 未出席')).toBeInTheDocument()
    expect(within(dialog()).getByText('報到狀態: 報到成功')).toBeInTheDocument()
    expect(within(dialog()).queryByRole('button', { name: '接受預約' })).toBeNull()
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await closedDialog()

    fireEvent.click(block('已開單客'))
    expect(window.open).toHaveBeenCalledWith('/order/o-9', '_blank')
  })

  // af7ec13 修正（Jason 2026/10/22 fix all）：OrderTable.js 原本以 `rest.status` 判斷待審核（週曆資料的欄位是 bookingStatus），
  // 待審核的預約也開成「預約成功」的明細（有「編輯」連結）；改讀 bookingStatus 後開審核窗，沒有「編輯」。
  it('待審核的預約開審核窗（沒有「編輯」連結）；接受預約送 isApproval: true', async () => {
    const utils = setup({
      fixtures: { verifyBooking: sequence(new Error('已過期'), { verifyBooking: { id: null } }, { verifyBooking: { id: 'b-2' } }) },
    })
    await ready(utils)
    fireEvent.click(block('林先生'))
    await screen.findByText('電話: 0922')
    expect(within(dialog()).queryByText('編輯')).toBeNull()
    fireEvent.click(button('接受預約'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已過期', variant: 'error' }))
    fireEvent.click(button('接受預約'))
    await wait(() => expect(sentOf(utils.calls, 'verifyBooking')).toHaveLength(2))
    await utils.settle()
    expect(dialog()).not.toBeNull()
    fireEvent.click(button('接受預約'))
    await closedDialog()
    expect(sentOf(utils.calls, 'verifyBooking')[2]).toEqual({ input: { orderId: 'b-2', isApproval: true, isFromPC: true, password: '' } })
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已接受預約', variant: 'success' })
  })

  it('取消預約：沒有取消密碼直接送；有密碼時先輸入（取消會清空）再送；設計師已取消的不能再取消', async () => {
    const utils = setup({ cancelPassword: true, fixtures: { verifyBooking: { verifyBooking: { id: 'b-1' } } } })
    await ready(utils)
    fireEvent.click(block('取消客'))
    await screen.findByText('電話: 0944')
    expect(within(dialog()).queryByRole('button', { name: '取消預約' })).toBeNull()
    fireEvent.click(button('關閉'))
    await closedDialog()

    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消預約' }))
    fireEvent.change(await screen.findByLabelText('取消預約密碼'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByLabelText('取消預約密碼')).toBeNull())
    fireEvent.click(button('取消預約'))
    fireEvent.change(await screen.findByLabelText('取消預約密碼'), { target: { value: '5678' } })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'verifyBooking')).toEqual([{ input: { orderId: 'b-1', isApproval: false, isFromPC: true, password: '5678' } }])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已取消預約', variant: 'success' })
    cleanup()

    const noPwd = setup({ fixtures: { verifyBooking: { verifyBooking: { id: 'b-1' } } } })
    await ready(noPwd)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消預約' }))
    await closedDialog()
    expect(sentOf(noPwd.calls, 'verifyBooking')).toEqual([{ input: { orderId: 'b-1', isApproval: false, isFromPC: true, password: '' } }])
  })

  it('未出席：未標記送 true、已標記送 false；失敗時按鈕恢復、不關窗', async () => {
    const utils = setup({ fixtures: { SET_BOOKING_NO_SHOW: sequence(new Error('失敗'), { setBookingNoShow: true }) } })
    await ready(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '未出席' }))
    await wait(() => expect(sentOf(utils.calls, 'SET_BOOKING_NO_SHOW')).toHaveLength(1))
    await wait(() => expect(button('未出席')).not.toBeDisabled())
    fireEvent.click(block('黃小姐'))
    fireEvent.click(button('關閉'))
    await closedDialog()
    fireEvent.click(block('黃小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消未出席' }))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '設定成功', variant: 'success' })
    expect(sentOf(utils.calls, 'SET_BOOKING_NO_SHOW')).toEqual([
      { input: { bookingIds: ['b-1'], isNoShow: true } },
      { input: { bookingIds: ['b-3'], isNoShow: false } },
    ])
  })
})

describe('報到、名稱、格子', () => {
  const lucide = (el, name) => el.querySelector(`.lucide-${name}`)

  it('報到功能開啟：過時未報到、已報到各有圖示，未出席另有圖示；報到功能關閉時沒有', async () => {
    const utils = setup({ checkin: true })
    await ready(utils)
    expect(lucide(block('陳小姐'), 'square-x')).not.toBeNull()
    expect(lucide(block('黃小姐'), 'clipboard-check')).not.toBeNull()
    expect(lucide(block('黃小姐'), 'calendar-x')).not.toBeNull()
    cleanup()
    setup()
    await screen.findByText('時間')
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    expect(lucide(block('陳小姐'), 'square-x')).toBeNull()
    expect(screen.queryByRole('switch', { name: '報到模式' })).toBeNull()
  })

  it('預約還沒到：不顯示未報到圖示', async () => {
    const start = new Date(2099, 0, 4).getTime()
    const FUTURE = {
      ...AMY,
      calendar: [
        item('RESERVATION', new Date(2099, 0, 5, 10).getTime(), 1, {
          ids: ['f-1'],
          nameToDisplay: '未來客',
          bookingStatus: '預約成功',
          isCheckin: false,
        }),
      ],
    }
    const utils = setup({ checkin: true, designers: [FUTURE], route: `/r?startDate=${start}&endDate=${start + 7 * 86400000 - 1}` })
    await ready(utils)
    expect(lucide(block('未來客'), 'square-x')).toBeNull()
  })

  it('報到模式：只顯示未開單的預約、不顯示全店不可預約與關閉全店預約；報到狀態篩選；關掉時篩選清除', async () => {
    const utils = setup({ checkin: true })
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByLabelText('報到狀態')).toBeNull()
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await wait(() => expect(hasBlock('已開單客')).toBe(false))
    expect(hasBlock('全店不可預約')).toBe(false)
    expect(block('陳小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.notCheckedIn}`)
    expect(block('黃小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.checkedIn}`)
    expect(lucide(block('黃小姐'), 'calendar-x')).toBeNull()
    fireEvent.click(dayCell(2, row(11)))
    await screen.findByText('新預約')
    expect(within(dialog()).queryByRole('button', { name: '關閉全店預約' })).toBeNull()
    fireEvent.click(button('取消'))
    await closedDialog()

    const select = screen.getByLabelText('報到狀態')
    const choose = text => fireEvent.change(select, { target: { value: [...select.options].find(o => o.textContent === text).value } })
    choose('報到成功')
    await wait(() => expect(hasBlock('陳小姐')).toBe(false))
    expect(hasBlock('黃小姐')).toBe(true)
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    expect(hasBlock('全店不可預約')).toBe(true)
  })

  it('報到模式下指定設計師：點空白格沒有關閉預約', async () => {
    const utils = setup({ checkin: true })
    await ready(utils)
    await onlyAmy(utils)
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await utils.settle()
    fireEvent.click(dayCell(1, row(11)))
    await screen.findByText('新預約')
    expect(within(dialog()).queryByRole('button', { name: '關閉預約' })).toBeNull()
  })

  it('預約明細的設計師名稱依顧客端名稱設定：暱稱（沒有暱稱用本名）', async () => {
    const NO_NICK = { ...AMY, designerNickname: null }
    const utils = setup({ nameType: 'NICKNAME' })
    await ready(utils)
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('設計師: Amy')).toBeInTheDocument()
    cleanup()
    setup({ nameType: 'NICKNAME', designers: [NO_NICK] })
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('設計師: 王小美')).toBeInTheDocument()
  })

  // af7ec13 修正（Jason 2026/10/22 fix all）：OrderTable.js 原本以 `designerName === 'BOTH'` 判斷（比對本名），
  // 設定為「本名＋暱稱」時只顯示本名；改為 designerNameType 後顯示「本名(暱稱)」，沒有暱稱時只顯示本名。
  it('名稱設定為「本名＋暱稱」：顯示「本名(暱稱)」，沒有暱稱時只顯示本名', async () => {
    const utils = setup({ nameType: 'BOTH' })
    await ready(utils)
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('設計師: 王小美(Amy)')).toBeInTheDocument()
    cleanup()
    setup({ nameType: 'BOTH', designers: [{ ...AMY, designerName: 'BOTH' }] })
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('設計師: BOTH(Amy)')).toBeInTheDocument()
    fireEvent.click(button('關閉'))
    await closedDialog()
    cleanup()
    setup({ nameType: 'BOTH', designers: [{ ...AMY, designerName: 'BOTH', designerNickname: null }] })
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('設計師: BOTH')).toBeInTheDocument()
  })

  it('調整格子高度：時段列與色塊高度跟著變；再按一次收起', async () => {
    const utils = setup()
    await ready(utils)
    const toggle = screen.getByRole('button', { name: '調整格子高度' })
    fireEvent.click(toggle)
    fireEvent.change(await screen.findByRole('slider'), { target: { value: '60' } })
    await wait(() => expect(dayCell(0, 0)).toHaveStyle('height: 60px'))
    expect(block('陳小姐')).toHaveStyle('height: 118px')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  describe('小格子備註過長改跑馬燈', () => {
    let restore
    beforeEach(() => {
      const h = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
      const w = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
          if (this.id === 'remark' || this.id === 'cusRemark') return this.textContent.length >= 6 ? 34 : 17
          return parseFloat(this.style.height) || 0
        },
      })
      // 色塊寬度是百分比：以 100px 欄寬換算
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get() {
          return parseFloat(this.style.width) || 0
        },
      })
      restore = () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', h)
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', w)
      }
    })
    afterEach(() => restore())

    const r = (day, h, cost, name, remark, cusRemark) =>
      item('RESERVATION', at(day, h), cost, { ids: [name], nameToDisplay: name, bookingStatus: '預約成功', remark, remarkForCustomer: cusRemark })
    const REMARKS = {
      ...AMY,
      calendar: [
        r(0, 10, 1, '都很長', '請準備熱毛巾', '我想要剪短一點'),
        r(0, 11, 1, '備註長', '請準備熱毛巾', '短'),
        r(0, 12, 1, '顧客長', '短', '我想要剪短一點'),
        r(0, 13, 1, '都很短', '短', '短'),
        r(0, 14, 3, '大格子', '請準備熱毛巾', '我想要剪短一點'),
      ],
    }
    const remarkOf = name => block(name).querySelector('#remark')
    const cusRemarkOf = name => block(name).querySelector('#cusRemark')
    const resize = async () => {
      fireEvent.click(screen.getByRole('button', { name: '調整格子高度' }))
      fireEvent.change(await screen.findByRole('slider'), { target: { value: '41' } })
    }

    it('顯示兩種備註時：小格子裡超過一行的加跑馬燈，大格子維持換行', async () => {
      const utils = setup({ designers: [REMARKS], remark: true, cusRemark: true })
      await ready(utils)
      await resize()
      await wait(() => expect(remarkOf('都很長')).toHaveClass('textAnimation'))
      expect(cusRemarkOf('都很長')).toHaveClass('textAnimation')
      expect(remarkOf('備註長')).toHaveClass('textAnimation')
      expect(cusRemarkOf('備註長')).not.toHaveClass('textAnimation')
      expect(cusRemarkOf('顧客長')).toHaveClass('textAnimation')
      expect(remarkOf('顧客長')).not.toHaveClass('textAnimation')
      expect(remarkOf('都很短')).not.toHaveClass('textAnimation')
      expect(remarkOf('大格子')).not.toHaveClass('textAnimation')
      expect(cusRemarkOf('大格子').style.whiteSpace).toBe('')
    })

    it('只顯示一種備註時不加跑馬燈', async () => {
      const utils = setup({ designers: [REMARKS], remark: true })
      await ready(utils)
      await resize()
      await wait(() => expect(block('都很長')).toHaveStyle('height: 39px'))
      expect(remarkOf('都很長')).not.toHaveClass('textAnimation')
      cleanup()
      const again = setup({ designers: [REMARKS], cusRemark: true })
      await ready(again)
      await resize()
      await wait(() => expect(block('大格子')).toHaveStyle('height: 121px'))
      expect(remarkOf('大格子')).toBeNull()
      expect(cusRemarkOf('大格子').style.whiteSpace).toBe('')
    })
  })
})

it('網址：日期選擇寫回網址', async () => {
  const utils = setup()
  await ready(utils)
  fireEvent.change(screen.getByLabelText('起始時間'), { target: { value: String(new Date(2025, 2, 19).getTime()) } })
  await utils.settle()
  expect(currentLocation()).toContain('startDate=')
})
