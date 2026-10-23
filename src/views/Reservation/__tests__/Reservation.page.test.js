// 保護顧客端／櫃台「預約服務」頁（/customer/reservation/:merchantId，LINE 預約或單週預約紀錄的「新預約」都進到這裡）。守住：
// - 網址帶的日期、設計師會預先帶入；指定設計師時查該設計師的可預約時段，不指定時查全店不指定時段；不可預約的時段不能選
// - 換設計師時清空已選的時間；手機號碼須為 09 開頭 10 碼，姓名、時間（指定時含設計師）都有才能送出
// - 指定送 bookingV2（含 LINE userId）、不指定送 nonDesignationBooking；成功後記住顧客姓名電話、導到預約行事曆並提示
// - 從 LINE 進來（usingLineLogin 未帶或為 1）：登入 LIFF 取 userId、帶入上次的姓名電話；預約完成後把預約資訊傳回 LINE 並關閉視窗
// 原本的已知缺口已於 2026/10/22 修正（Jason fix all，見各測試註解）。日期選擇器以簡化版代替；LIFF SDK 以假物件代替；GraphQL 全由模擬 link 回應，不建立真實預約。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import Reservation from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => ({
  DatePicker: ({ value, onChange, label }) => (
    <input aria-label={label} data-value={value} onChange={e => onChange(e.target.value === '' ? null : new Date(Number(e.target.value) || e.target.value))} />
  ),
}))

const MERCHANT = 'merchant-1'
const DAY = new Date(2025, 2, 10).getTime()
const at = (h, m = 0) => new Date(2025, 2, 10, h, m).getTime()
const DESIGNERS = [
  { id: 'd-1', name: '王小美', nickName: 'Amy' },
  { id: 'd-2', name: '李大華', nickName: null },
]

// 兩支沒有名稱的查詢（設計師清單、店家 LIFF）共用 'undefined' 鍵：回應同時含兩者，依查詢欄位各取所需
const anonymous = { viewer: { anonymous: { designers: { totalCount: 2, data: DESIGNERS }, merchant: { id: MERCHANT, reservationLiff: 'liff-123' } } } }
const fixtures = (extra = {}) => ({
  undefined: anonymous,
  designerBookingTimes: ({ GetBookingTimesInput }) => ({
    getBookingTimes: [
      { time: at(10), status: '可預約', orders: [] },
      { time: at(10, 30), status: '不可預約', orders: [] },
      { time: at(11) + (GetBookingTimesInput.designerId === 'd-2' ? 30 * 60000 : 0), status: '可預約', orders: [] },
    ],
  }),
  unspecifiedBookingTimes: {
    unspecifiedBookingTimes: [
      { time: at(14), status: '可預約' },
      { time: at(14, 30), status: '不可預約' },
    ],
  },
  ...extra,
})

const setup = ({ search = '?usingLineLogin=0', extra } = {}) => {
  const location = { pathname: `/customer/reservation/${MERCHANT}`, search }
  return renderPage(<Reservation match={{ params: { id: MERCHANT } }} location={location} />, {
    route: `/customer/reservation/${MERCHANT}${search}`,
    path: '/customer/reservation/:id',
    fixtures: fixtures(extra),
  })
}

const optionTexts = select => [...select.options].map(o => o.textContent)
const choose = (select, text) => fireEvent.change(select, { target: { value: [...select.options].find(o => o.textContent === text).value } })
const fillCustomer = (name, phone) => {
  fireEvent.change(screen.getByTestId('customer-name-0'), { target: { value: name } })
  fireEvent.change(screen.getByTestId('customer-cellphone-0'), { target: { value: phone } })
}
const submit = () => screen.getByTestId('booking-submit')

// 預約失敗、取不到 LINE 資料時，頁面原本在 catch 裡把錯誤再拋出（訊息變成「undefined: …」），形成沒人接的 rejection；
// 2026/10/22 改為提示錯誤、不再拋出（Jason fix all）。沒人接的 rejection 會讓 Jest 判測試失敗，因此這裡不再攔截。
let liff
beforeEach(() => {
  localStorage.clear()
  liff = {
    init: jest.fn(() => Promise.resolve()),
    isLoggedIn: jest.fn(() => true),
    getProfile: jest.fn(() => Promise.resolve({ userId: 'U-line-1' })),
    login: jest.fn(() => Promise.resolve()),
    closeWindow: jest.fn(),
    sendMessages: jest.fn(),
  }
  window.liff = liff
})
afterEach(() => {
  cleanup()
  delete window.liff
})

describe('不指定設計師', () => {
  it('查全店不指定時段（網址帶的日期），不可預約的時段不能選；手機格式錯誤時提示且不能送出', async () => {
    const utils = setup({ search: `?usingLineLogin=0&date=${at(14)}` })
    await utils.settle()
    expect(callsOf(utils.calls, 'unspecifiedBookingTimes').pop().variables).toEqual({
      UnspecifiedBookingTimesInput: { storeId: MERCHANT, date: at(14) },
    })
    expect(screen.getByTestId('designer-not-assigned')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByTestId('designer-name')).toBeNull()
    const time = screen.getByTestId('service-time')
    expect(optionTexts(time)).toEqual(['', '14:00', '14:30'])
    expect([...time.options].find(o => o.textContent === '14:30')).toBeDisabled()
    // 網址帶的時間已選好
    expect(time.options[time.selectedIndex].textContent).toBe('14:00')
    expect(submit()).toBeDisabled()
    fillCustomer('吳小姐', '0912')
    expect(screen.getByText('＊請輸入有效手機號碼')).toBeInTheDocument()
    expect(submit()).toBeDisabled()
    fireEvent.change(screen.getByTestId('customer-cellphone-0'), { target: { value: '0912345678' } })
    expect(screen.queryByText('＊請輸入有效手機號碼')).toBeNull()
    expect(submit()).not.toBeDisabled()
    // 清空電話：不顯示格式錯誤，但仍不能送出
    fireEvent.change(screen.getByTestId('customer-cellphone-0'), { target: { value: '' } })
    expect(screen.queryByText('＊請輸入有效手機號碼')).toBeNull()
    expect(submit()).toBeDisabled()
  })

  it('送出 nonDesignationBooking（時段、電話、姓名、店家）；記住顧客、導到預約行事曆並提示；不經 LINE 時不傳訊息', async () => {
    const utils = setup({ extra: { NON_DESIGNATION_BOOKING: { nonDesignationBooking: { id: 'nd-1', status: '預約成功' } } } })
    await utils.settle()
    choose(screen.getByTestId('service-time'), '14:00')
    choose(screen.getByTestId('reference'), '朋友推薦')
    expect(screen.getByTestId('reference').options[screen.getByTestId('reference').selectedIndex].textContent).toBe('朋友推薦')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/management/reservation/calendar'))
    expect(callsOf(utils.calls, 'NON_DESIGNATION_BOOKING').map(c => c.variables)).toEqual([
      { input: { bookingDate: at(14), cellphone: '0912345678', customerName: '吳小姐', storeId: MERCHANT } },
    ])
    expect(JSON.parse(JSON.parse(localStorage.getItem('customer')))).toEqual({ name: '吳小姐', cellphone: '0912345678' })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '預約成功', variant: 'success' })
    expect(liff.init).not.toHaveBeenCalled()
    expect(liff.sendMessages).not.toHaveBeenCalled()
  })

  it('換日期：重新查該日的時段；無效日期不理會', async () => {
    const utils = setup()
    await utils.settle()
    const next = new Date(2025, 2, 12).getTime()
    fireEvent.change(screen.getByLabelText('希望服務日期'), { target: { value: String(next) } })
    await utils.settle()
    expect(callsOf(utils.calls, 'unspecifiedBookingTimes').pop().variables.UnspecifiedBookingTimesInput.date).toBe(next)
    const count = callsOf(utils.calls, 'unspecifiedBookingTimes').length
    fireEvent.change(screen.getByLabelText('希望服務日期'), { target: { value: 'abc' } })
    fireEvent.change(screen.getByLabelText('希望服務日期'), { target: { value: '' } })
    await utils.settle()
    expect(callsOf(utils.calls, 'unspecifiedBookingTimes')).toHaveLength(count)
    expect(screen.getByLabelText('希望服務日期')).toHaveAttribute('data-value', String(next))
  })
})

describe('指定設計師', () => {
  it('網址帶設計師：預設指定並查該設計師的時段；換設計師清空已選時間並重查', async () => {
    const utils = setup({ search: `?usingLineLogin=0&designerId=d-1&date=${at(10)}` })
    await utils.settle()
    expect(screen.getByTestId('designer-assigned')).toHaveAttribute('aria-pressed', 'true')
    const designer = screen.getByTestId('designer-name')
    expect(optionTexts(designer)).toEqual(['', 'Amy', '李大華'])
    expect(callsOf(utils.calls, 'designerBookingTimes').pop().variables).toEqual({
      GetBookingTimesInput: { designerId: 'd-1', storeId: MERCHANT, date: at(10) },
    })
    const time = screen.getByTestId('service-time')
    expect(optionTexts(time)).toEqual(['', '10:00', '10:30', '11:00'])
    expect(time.options[time.selectedIndex].textContent).toBe('10:00')
    choose(designer, '李大華')
    await utils.settle()
    expect(callsOf(utils.calls, 'designerBookingTimes').pop().variables.GetBookingTimesInput.designerId).toBe('d-2')
    const cleared = screen.getByTestId('service-time')
    expect(cleared.options[cleared.selectedIndex].textContent).toBe('')
    expect(optionTexts(screen.getByTestId('service-time'))).toContain('11:30')
  })

  it('指定但沒選設計師不能送出；送出 bookingV2（設計師、時段、姓名電話）', async () => {
    const utils = setup({ extra: { bookingV2: { bookingV2: { id: 'b-1', status: '預約成功' } } } })
    await utils.settle()
    choose(screen.getByTestId('service-time'), '14:00')
    fillCustomer('吳小姐', '0912345678')
    expect(submit()).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('designer-assigned'))
    // 已選了不指定的時段，但還沒選設計師
    expect(submit()).toBeDisabled()
    choose(screen.getByTestId('designer-name'), 'Amy')
    await utils.settle()
    choose(screen.getByTestId('service-time'), '11:00')
    expect(submit()).not.toBeDisabled()
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/management/reservation/calendar'))
    expect(callsOf(utils.calls, 'bookingV2').map(c => c.variables)).toEqual([
      { BookingV2Input: { lineId: undefined, merchantId: MERCHANT, dateTime: at(11), designerId: 'd-1', name: '吳小姐', cellphone: '0912345678' } },
    ])
    expect(openSnackbar).toHaveBeenCalledWith({ message: '預約成功', variant: 'success' })
  })

  it('切換指定／不指定：再按已選的不變；切回不指定時隱藏設計師並改送不指定預約', async () => {
    const utils = setup({ search: '?usingLineLogin=0&designerId=d-1', extra: { NON_DESIGNATION_BOOKING: { nonDesignationBooking: { id: 'nd-1', status: '預約成功' } } } })
    await utils.settle()
    fireEvent.click(screen.getByTestId('designer-assigned'))
    expect(screen.getByTestId('designer-assigned')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByTestId('designer-not-assigned'))
    expect(screen.queryByTestId('designer-name')).toBeNull()
    choose(screen.getByTestId('service-time'), '14:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(utils.calls, 'NON_DESIGNATION_BOOKING')).toHaveLength(1))
    expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(0)
  })
})

describe('從 LINE 進來', () => {
  it('已登入 LINE：以店家的 LIFF id 初始化，帶入上次的姓名電話與 LINE userId；預約成功後把預約資訊傳回 LINE 並關閉視窗', async () => {
    localStorage.setItem('customer', { name: '老客人', cellphone: '0987654321' })
    const utils = setup({ search: '?designerId=d-1', extra: { bookingV2: { bookingV2: { id: 'b-1', status: '預約成功' } } } })
    await utils.settle()
    expect(liff.init).toHaveBeenCalledWith({ liffId: 'liff-123' })
    await wait(() => expect(screen.getByTestId('customer-name-0')).toHaveValue('老客人'))
    expect(screen.getByTestId('customer-cellphone-0')).toHaveValue('0987654321')
    choose(screen.getByTestId('designer-name'), 'Amy')
    await utils.settle()
    choose(screen.getByTestId('service-time'), '10:00')
    fireEvent.click(submit())
    await wait(() => expect(liff.sendMessages).toHaveBeenCalled())
    expect(callsOf(utils.calls, 'bookingV2')[0].variables.BookingV2Input.lineId).toBe('U-line-1')
    expect(liff.closeWindow).toHaveBeenCalled()
    const [[messages]] = liff.sendMessages.mock.calls
    expect(messages[0].type).toBe('text')
    expect(messages[0].text).toContain('恭喜您！您已經預約成功囉！')
    expect(messages[0].text).toContain('姓名: 老客人')
    expect(messages[0].text).toContain('預約日期: 2025/03/10')
    expect(messages[0].text).toContain('預約時間: 10:00')
  })

  // Jason 2026/10/22 fix all：Basic.js 原本以 `designers.data.nickName` 判斷（data 是陣列，永遠沒有 nickName），
  // 傳回 LINE 的「設計師」一律是本名，與下拉選單顯示的暱稱不一致；改為找到該設計師後取 `nickName || name`。
  it('待審核的預約傳回「審核中」訊息，設計師與選單一致（有暱稱用暱稱，沒有用本名）', async () => {
    const utils = setup({ search: '?usingLineLogin=1&designerId=d-1', extra: { bookingV2: { bookingV2: { id: 'b-1', status: '待審核' } } } })
    await utils.settle()
    choose(screen.getByTestId('designer-name'), 'Amy')
    await utils.settle()
    choose(screen.getByTestId('service-time'), '10:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(liff.sendMessages).toHaveBeenCalled())
    const text = liff.sendMessages.mock.calls[0][0][0].text
    expect(text).toContain('預約正在審核中...')
    expect(text).toContain('設計師: Amy')
  })

  it('沒有暱稱的設計師傳回本名；選回空白不拋錯', async () => {
    const again = setup({ search: '?usingLineLogin=1&designerId=d-2', extra: { bookingV2: { bookingV2: { id: 'b-2', status: '待審核' } } } })
    await again.settle()
    // 先選回空白（不拋錯；設計師清空後回到不指定），再切回指定、選設計師
    choose(screen.getByTestId('designer-name'), '')
    fireEvent.click(screen.getByTestId('designer-assigned'))
    choose(screen.getByTestId('designer-name'), '李大華')
    await again.settle()
    choose(screen.getByTestId('service-time'), '10:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(liff.sendMessages).toHaveBeenCalledTimes(1))
    expect(liff.sendMessages.mock.calls[0][0][0].text).toContain('設計師: 李大華')
  })

  it('其他狀態不傳訊息內容（空陣列）；不指定預約的待審核／成功訊息設計師為「不指定」', async () => {
    const bookWith = async status => {
      const utils = setup({ search: '?usingLineLogin=1', extra: { NON_DESIGNATION_BOOKING: { nonDesignationBooking: { id: 'nd-1', status } } } })
      await utils.settle()
      choose(screen.getByTestId('service-time'), '14:00')
      fillCustomer('吳小姐', '0912345678')
      const before = liff.sendMessages.mock.calls.length
      fireEvent.click(submit())
      await wait(() => expect(liff.sendMessages).toHaveBeenCalledTimes(before + 1))
      cleanup()
      return liff.sendMessages.mock.calls[before][0]
    }
    const pending = await bookWith('待審核')
    expect(pending[0].text).toContain('預約正在審核中...')
    expect(pending[0].text).toContain('設計師: 不指定')
    const ok = await bookWith('預約成功')
    expect(ok[0].text).toContain('恭喜您！您已經預約成功囉！')
    expect(ok[0].text).toContain('預約時間: 14:00')
    expect(await bookWith('已取消')).toEqual([])
  })

  it('指定預約回其他狀態：不傳訊息內容', async () => {
    const utils = setup({ search: '?designerId=d-1', extra: { bookingV2: { bookingV2: { id: 'b-1', status: '已取消' } } } })
    await utils.settle()
    choose(screen.getByTestId('designer-name'), 'Amy')
    await utils.settle()
    choose(screen.getByTestId('service-time'), '10:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(liff.sendMessages).toHaveBeenCalledWith([]))
  })

  it('尚未登入 LINE：先登入再取 userId；沒有上次的顧客資料時姓名電話留空', async () => {
    liff.isLoggedIn.mockReturnValue(false)
    const utils = setup({ search: '' })
    await utils.settle()
    await wait(() => expect(liff.login).toHaveBeenCalled())
    await wait(() => expect(liff.getProfile).toHaveBeenCalled())
    expect(screen.getByTestId('customer-name-0')).toHaveValue('')
  })

  it('已登入但沒有上次的顧客資料：姓名電話留空', async () => {
    const utils = setup({ search: '?usingLineLogin=1' })
    await utils.settle()
    await wait(() => expect(liff.getProfile).toHaveBeenCalled())
    expect(screen.getByTestId('customer-name-0')).toHaveValue('')
    localStorage.setItem('customer', {})
    cleanup()
    setup({ search: '?usingLineLogin=1' })
    await wait(() => expect(liff.getProfile).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('customer-cellphone-0')).toHaveValue('')
  })
})

describe('失敗與版面', () => {
  // GraphQL 錯誤的提示由 init-apollo 的 errorLink 負責（測試的模擬 client 沒有 errorLink），頁面不重複提示、也不再拋出
  it('不指定預約失敗：不導頁、不記住顧客，按鈕恢復可按', async () => {
    const utils = setup({ extra: { NON_DESIGNATION_BOOKING: new Error('時段已滿') } })
    await utils.settle()
    choose(screen.getByTestId('service-time'), '14:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(utils.calls, 'NON_DESIGNATION_BOOKING')).toHaveLength(1))
    await wait(() => expect(submit()).not.toBeDisabled())
    await utils.settle()
    expect(currentLocation()).not.toBe('/management/reservation/calendar')
    expect(localStorage.getItem('customer')).toBeNull()
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('指定預約失敗：不導頁、按鈕恢復可按', async () => {
    const utils = setup({ search: `?usingLineLogin=0&designerId=d-1&date=${at(10)}`, extra: { bookingV2: new Error('設計師休假') } })
    await utils.settle()
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(1))
    await wait(() => expect(submit()).not.toBeDisabled())
    await utils.settle()
    expect(currentLocation()).not.toBe('/management/reservation/calendar')
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('預約後的處理出錯（非 GraphQL 錯誤，例如傳回 LINE 失敗）：提示錯誤訊息、按鈕恢復可按', async () => {
    liff.sendMessages.mockImplementation(() => {
      throw new Error('LINE 傳送失敗')
    })
    const assigned = setup({ search: `?usingLineLogin=1&designerId=d-1&date=${at(10)}`, extra: { bookingV2: { bookingV2: { id: 'b-1', status: '預約成功' } } } })
    await assigned.settle()
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: 'LINE 傳送失敗', variant: 'error' }))
    await wait(() => expect(submit()).not.toBeDisabled())
    cleanup()
    openSnackbar.mockClear()
    const nds = setup({ search: '?usingLineLogin=1', extra: { NON_DESIGNATION_BOOKING: { nonDesignationBooking: { id: 'nd-1', status: '預約成功' } } } })
    await nds.settle()
    choose(screen.getByTestId('service-time'), '14:00')
    fillCustomer('吳小姐', '0912345678')
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: 'LINE 傳送失敗', variant: 'error' }))
    await wait(() => expect(submit()).not.toBeDisabled())
  })

  it('LINE 登入後取不到 userId：提示錯誤訊息、不帶入、頁面照常可用', async () => {
    liff.isLoggedIn.mockReturnValue(false)
    liff.getProfile.mockImplementation(() => Promise.reject({ code: '401', message: 'no profile' }))
    const utils = setup({ search: '?usingLineLogin=1' })
    await utils.settle()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: 'no profile', variant: 'error' }))
    expect(screen.getByTestId('booking-submit')).toBeInTheDocument()
  })

  it('標籤寬度：依實際排版量測（jsdom 以假寬度模擬）', async () => {
    const w = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 120 })
    try {
      const utils = setup({ search: '?usingLineLogin=0&designerId=d-1' })
      await utils.settle()
      expect(screen.getByText('服務時間')).toBeInTheDocument()
      expect(screen.getByText('您是如何知道我們的呢')).toBeInTheDocument()
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', w)
    }
  })
})
