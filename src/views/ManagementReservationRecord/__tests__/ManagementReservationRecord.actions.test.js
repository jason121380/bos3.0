// 保護「單日預約紀錄」點格子後的預約操作（ChoseEvent 與各區塊）：櫃台在這裡新增／修改／取消預約、報到、設定名額。守住：
// - 新增指定／不指定預約：電話、姓名必填（缺了提示且不送出）；送出的欄位（日期時間＝點的那一格、設計師、時長、備註、佔名額、待確認）
// - 關閉／開放某時段的預約；不指定時段的可預約人數上限（不可為負；上限為 0 時不能收不指定預約）
// - 預約明細：接受／取消（店家設定取消密碼時先輸入密碼）、報到／取消報到、延遲服務通知、未出席、未來預訂待確認
// - 編輯預約：時間只能是整點或半點、一定要有顧客、指定時一定要有服務人員；送出的 updateOrder 內容就是畫面上的值
// - 每個動作成功才提示、重抓行事曆並關窗；失敗時提示原因、按鈕恢復可按、彈窗不關
// 原本的已知缺口已於 2026/10/22 修正（Jason fix all，見各測試註解）。顧客／服務人員自動完成與日期選擇器以簡化版代替（各自另有測試）；
// GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實預約。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { setupRecord, pageReady, designerCell, ndsCell, block, reservation, entry, at, AMY, DAY_START } from './recordKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ value, onChange, label, localeText }) => (
    <input aria-label={label || (localeText && localeText.toolbarTitle)} data-value={value} onChange={e => onChange(new Date(Number(e.target.value)))} />
  ),
}))
jest.mock('components/CustomerAutoComplete', () => ({ onChange, value }) => (
  <div data-testid="customer-picker" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: '' })}>清除顧客</button>
    <button type="button" onClick={() => onChange({ id: 'c-9' })}>選顧客</button>
  </div>
))
jest.mock('components/BookingRecordListAutoComplete', () => ({ onChange, value }) => (
  <div data-testid="designer-picker" data-value={value || ''}>
    <button type="button" onClick={() => onChange({ id: '' })}>清除服務人員</button>
    <button type="button" onClick={() => onChange({ id: 'row-2', userId: 'd-2' })}>選服務人員</button>
  </div>
))

beforeEach(() => loginAs())
afterEach(cleanup)

const DESIGNERS = [
  base => ({
    ...AMY(base),
    calendar: [
      ...AMY(base).calendar,
      reservation(base, 10, 30, 1, {
        ids: ['b-3'], nameToDisplay: '黃小姐', bookingStatus: '預約成功', isDesignate: false, isCheckin: true, isNoShow: true,
        customerId: 'c-3', customerCellphone: '0933', isCusCheckRequired: true,
      }),
      reservation(base, 12, 0, 1, { ids: ['b-4'], nameToDisplay: '已完成客', bookingStatus: '已完成', customerId: 'c-4' }),
      reservation(base, 13, 0, 1, { ids: ['b-5'], nameToDisplay: '取消客', bookingStatus: '設計師已取消', customerId: 'c-5' }),
      entry('EVENT', at(base, 16), 99, { ids: ['e-1'], nameToDisplay: '奇怪時長的事件' }),
      entry('RH', at(base, 17), 1, { nameToDisplay: '休息' }),
    ],
  }),
]
const NDS = base => ({
  designerName: '不指定',
  calendar: [
    reservation(base, 10, 0, 1, {
      ids: ['n-1'], nameToDisplay: '路人甲', bookingStatus: '預約成功', customerId: 'c-7', isCheckin: false, remark: '第一次',
      remarkForCustomer: '靠窗', notificationDayCount: 1,
    }),
    reservation(base, 11, 0, 1, { ids: ['n-2'], nameToDisplay: '路人乙', bookingStatus: '預約成功', customerId: 'c-8', isCheckin: true }),
    reservation(base, 12, 0, 1, { ids: ['n-3'], nameToDisplay: '路人丙', bookingStatus: '預約成功', customerId: 'c-6', isCheckin: null }),
  ],
})

const row = (h, m = 0) => (h - 10) * 2 + m / 30
const sentOf = (calls, name) => callsOf(calls, name).map(c => c.variables)
const calendarCalls = calls => callsOf(calls, 'getMerchantDesignerCalendar').length
const dialog = () => document.querySelector('.ManagementReservationRecordDialog')
const field = label => within(dialog()).getByLabelText(new RegExp(`^${label}`))
const selectWithOption = text => [...dialog().querySelectorAll('select')].find(s => [...s.options].some(o => o.textContent === text))
const choose = (select, text) => fireEvent.change(select, { target: { value: [...select.options].find(o => o.textContent === text).value } })
const button = name => within(dialog()).getByRole('button', { name })
const closedDialog = () => wait(() => expect(dialog()).toBeNull())

// 依呼叫次數回應不同結果（第 n 次用第 n 個，超過用最後一個）
const sequence = (...responses) => {
  let i = 0
  return () => responses[Math.min(i++, responses.length - 1)]
}

const setup = (opts = {}) => setupRecord({ designers: DESIGNERS, nds: NDS, ...opts })

describe('新增指定預約', () => {
  it('電話、姓名必填；填好後送出點的那一格與設計師、時長、備註、名額與待確認', async () => {
    const utils = setup({ settings: { cusCheck: true }, fixtures: { bookingV2: { bookingV2: { id: 'new-1' } } } })
    await pageReady(utils)
    fireEvent.click(designerCell(0, row(11)))
    await screen.findByRole('button', { name: '關閉預約' })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫電話', variant: 'warning' })
    fireEvent.change(field('顧客電話'), { target: { value: '0955666777' } })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫顧客', variant: 'warning' })
    expect(sentOf(utils.calls, 'bookingV2')).toHaveLength(0)

    fireEvent.change(field('顧客姓名'), { target: { value: '吳小姐' } })
    choose(selectWithOption('30分鐘'), '1.5小時')
    fireEvent.change(field('備註'), { target: { value: '染髮' } })
    fireEvent.change(field('顧客備註'), { target: { value: '怕痛' } })
    fireEvent.click(within(dialog()).getByLabelText('佔用顧客端預約名額'))
    fireEvent.click(within(dialog()).getByLabelText('未來預訂(待確認)'))
    const before = calendarCalls(utils.calls)
    fireEvent.click(button('預約'))
    await closedDialog()
    expect(sentOf(utils.calls, 'bookingV2')).toEqual([
      {
        BookingV2Input: {
          merchantId: 'merchant-1',
          dateTime: at(DAY_START, 11),
          designerId: 'd-1',
          name: '吳小姐',
          cellphone: '0955666777',
          friends: [],
          designerServiceIds: [],
          remark: '染髮',
          remarkForCustomer: '怕痛',
          timeCost: 3,
          isBookingCostUsing: false,
          isCusCheckRequired: true,
        },
      },
    ])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '預約成功', variant: 'success' })
    await wait(() => expect(calendarCalls(utils.calls)).toBe(before + 1))
  })

  it('後端沒回預約 id：不提示、不關窗；後端回錯誤：提示原因、按鈕恢復可按', async () => {
    const utils = setup({
      fixtures: { bookingV2: sequence({ bookingV2: { id: null } }, new Error('該時段已額滿')) },
    })
    await pageReady(utils)
    fireEvent.click(designerCell(0, row(11)))
    await screen.findByRole('button', { name: '關閉預約' })
    fireEvent.change(field('顧客電話'), { target: { value: '0955' } })
    fireEvent.change(field('顧客姓名'), { target: { value: '吳' } })
    fireEvent.click(button('預約'))
    await wait(() => expect(sentOf(utils.calls, 'bookingV2')).toHaveLength(1))
    await utils.settle()
    expect(openSnackbar).not.toHaveBeenCalled()
    expect(button('預約')).toBeDisabled()
    cleanup()

    const again = setup({ fixtures: { bookingV2: new Error('該時段已額滿') } })
    await pageReady(again)
    fireEvent.click(designerCell(0, row(11)))
    await screen.findByRole('button', { name: '關閉預約' })
    fireEvent.change(field('顧客電話'), { target: { value: '0955' } })
    fireEvent.change(field('顧客姓名'), { target: { value: '吳' } })
    fireEvent.click(button('預約'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '該時段已額滿', variant: 'error' }))
    expect(button('預約')).not.toBeDisabled()
    expect(dialog()).not.toBeNull()
  })
})

describe('關閉／開放時段', () => {
  it('空白時段「關閉預約」送 appointable: false；休息時段「開啟預約」送 true', async () => {
    const utils = setup({ fixtures: { adminBookingTime: { adminBookingTime: { designerId: 'd-1' } } } })
    await pageReady(utils)
    fireEvent.click(designerCell(0, row(11)))
    fireEvent.click(await screen.findByRole('button', { name: '關閉預約' }))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '變更成功', variant: 'success' })
    fireEvent.click(designerCell(0, row(17)))
    fireEvent.click(await screen.findByRole('button', { name: '開啟預約' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'adminBookingTime')).toEqual([
      { input: { appointable: false, datetime: at(DAY_START, 11), designerId: 'd-1' } },
      { input: { appointable: true, datetime: at(DAY_START, 17), designerId: 'd-1' } },
    ])
  })

  it('失敗時提示原因、可再按；後端沒回設計師時不關窗', async () => {
    const utils = setup({ fixtures: { adminBookingTime: sequence(new Error('已有預約'), { adminBookingTime: { designerId: null } }) } })
    await pageReady(utils)
    fireEvent.click(designerCell(0, row(11)))
    fireEvent.click(await screen.findByRole('button', { name: '關閉預約' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已有預約', variant: 'error' }))
    expect(button('關閉預約')).not.toBeDisabled()
    fireEvent.click(button('關閉預約'))
    await wait(() => expect(sentOf(utils.calls, 'adminBookingTime')).toHaveLength(2))
    await utils.settle()
    expect(dialog()).not.toBeNull()
    expect(openSnackbar).toHaveBeenCalledTimes(1)
  })

  it('報到模式下不顯示關閉／開啟預約', async () => {
    const utils = setup({ settings: { checkin: true } })
    await pageReady(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await utils.settle()
    fireEvent.click(designerCell(0, row(11)))
    await screen.findByRole('button', { name: '預約' })
    expect(screen.queryByRole('button', { name: '關閉預約' })).toBeNull()
  })
})

describe('不指定時段：預約與可預約人數', () => {
  const LIMIT = limit => ({ FETCH_NON_DESIGNATE_BOOKING_LIMIT: { merchantDesignateTimeNonDesignateBookingLimit: { date: at(DAY_START, 15), limit } } })

  it('查詢點的那一格的人數上限；電話、姓名必填；送出不指定預約的欄位', async () => {
    const utils = setup({
      settings: { cusCheck: true },
      fixtures: { ...LIMIT(2), NON_DESIGNATION_BOOKING: { nonDesignationBooking: { id: 'nd-1' } } },
    })
    await pageReady(utils)
    fireEvent.click(ndsCell(row(15)))
    await screen.findByRole('button', { name: '設定可預約人數上限' })
    await utils.settle()
    expect(sentOf(utils.calls, 'FETCH_NON_DESIGNATE_BOOKING_LIMIT').pop()).toEqual({ date: at(DAY_START, 15) })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫電話', variant: 'warning' })
    fireEvent.change(field('顧客電話'), { target: { value: '0911' } })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫顧客', variant: 'warning' })
    fireEvent.change(field('顧客姓名'), { target: { value: '路人丁' } })
    choose(selectWithOption('30分鐘'), '2小時')
    fireEvent.change(field('備註'), { target: { value: '洗髮' } })
    fireEvent.change(field('顧客備註'), { target: { value: '趕時間' } })
    fireEvent.click(within(dialog()).getByLabelText('未來預訂(待確認)'))
    fireEvent.click(button('預約'))
    await closedDialog()
    expect(sentOf(utils.calls, 'NON_DESIGNATION_BOOKING')).toEqual([
      {
        input: {
          bookingDate: at(DAY_START, 15),
          cellphone: '0911',
          customerName: '路人丁',
          storeId: 'merchant-1',
          remark: '洗髮',
          remarkForCustomer: '趕時間',
          timeCost: 4,
          isCusCheckRequired: true,
        },
      },
    ])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '預約成功', variant: 'success' })
  })

  it('人數上限為 0（或沒有設定）時不能收不指定預約', async () => {
    const utils = setup({ fixtures: LIMIT(0) })
    await pageReady(utils)
    fireEvent.click(ndsCell(row(15)))
    await screen.findByRole('button', { name: '設定可預約人數上限' })
    await utils.settle()
    fireEvent.change(field('顧客電話'), { target: { value: '0911' } })
    fireEvent.change(field('顧客姓名'), { target: { value: '路人丁' } })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '此時段可預約人數設定為0', variant: 'warning' })
    cleanup()

    const unset = setup({ fixtures: { FETCH_NON_DESIGNATE_BOOKING_LIMIT: { merchantDesignateTimeNonDesignateBookingLimit: null } } })
    await pageReady(unset)
    fireEvent.click(ndsCell(row(15)))
    await screen.findByRole('button', { name: '設定可預約人數上限' })
    await unset.settle()
    fireEvent.change(field('顧客電話'), { target: { value: '0911' } })
    fireEvent.change(field('顧客姓名'), { target: { value: '路人丁' } })
    fireEvent.click(button('預約'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '此時段可預約人數設定為0', variant: 'warning' })
    expect(sentOf(unset.calls, 'NON_DESIGNATION_BOOKING')).toHaveLength(0)
    fireEvent.click(button('取消'))
    await closedDialog()
  })

  it('不指定預約失敗：提示原因、按鈕恢復；沒回 id 時不關窗', async () => {
    const utils = setup({ fixtures: { ...LIMIT(3), NON_DESIGNATION_BOOKING: sequence(new Error('電話格式錯誤'), { nonDesignationBooking: { id: null } }) } })
    await pageReady(utils)
    fireEvent.click(ndsCell(row(15)))
    await screen.findByRole('button', { name: '設定可預約人數上限' })
    await utils.settle()
    fireEvent.change(field('顧客電話'), { target: { value: '09' } })
    fireEvent.change(field('顧客姓名'), { target: { value: '丁' } })
    fireEvent.click(button('預約'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '電話格式錯誤', variant: 'error' }))
    expect(button('預約')).not.toBeDisabled()
    fireEvent.click(button('預約'))
    await wait(() => expect(sentOf(utils.calls, 'NON_DESIGNATION_BOOKING')).toHaveLength(2))
    await utils.settle()
    expect(dialog()).not.toBeNull()
  })

  it('設定可預約人數上限：顯示時段，負數擋下；送出該時段與新上限；可切回預約', async () => {
    const utils = setup({
      fixtures: {
        ...LIMIT(2),
        SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT: { setMerchantDesignateTimeNonDesignateBookingLimit: { merchant: 'merchant-1' } },
      },
    })
    await pageReady(utils)
    fireEvent.click(ndsCell(row(15)))
    fireEvent.click(await screen.findByRole('button', { name: '設定可預約人數上限' }))
    expect(within(dialog()).getByText('可預約人數設定')).toBeInTheDocument()
    await utils.settle()
    expect(within(dialog()).getByText(/2025\/03\/10\s+15:00/)).toBeInTheDocument()
    expect(field('人數')).toHaveValue(2)
    fireEvent.click(button('回到預約'))
    expect(field('顧客電話')).toBeInTheDocument()
    fireEvent.click(button('設定可預約人數上限'))
    fireEvent.change(field('人數'), { target: { value: '-1' } })
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '預約人數有誤', variant: 'warning' })
    fireEvent.change(field('人數'), { target: { value: '5' } })
    fireEvent.click(button('儲存'))
    await closedDialog()
    expect(sentOf(utils.calls, 'SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT')).toEqual([{ input: { date: at(DAY_START, 15), limit: 5 } }])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '設定完成', variant: 'success' })
  })

  // Jason 2026/10/22 fix all：人數欄清空時 parseInt('') 得到 NaN，ChoseEvent.js 原本只擋 '' 與負數，NaN 會照送（JSON 變成 null）；
  // 改判 `!Number.isInteger(limit) || limit < 0`，清空時提示「預約人數有誤」、不送出。
  it('人數清空時擋下、不送出；後端回失敗或錯誤時提示且不關窗', async () => {
    const utils = setup({
      fixtures: {
        ...LIMIT(2),
        SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT: sequence(
          { setMerchantDesignateTimeNonDesignateBookingLimit: { merchant: null } },
          new Error('沒有權限')
        ),
      },
    })
    await pageReady(utils)
    fireEvent.click(ndsCell(row(15)))
    fireEvent.click(await screen.findByRole('button', { name: '設定可預約人數上限' }))
    await utils.settle()
    fireEvent.change(field('人數'), { target: { value: '' } })
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '預約人數有誤', variant: 'warning' })
    await utils.settle()
    expect(sentOf(utils.calls, 'SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT')).toEqual([])
    fireEvent.change(field('人數'), { target: { value: '3' } })
    fireEvent.click(button('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '設定失敗', variant: 'error' }))
    expect(sentOf(utils.calls, 'SET_MERCHANT_NON_DESIGNATE_BOOKING_LIMIT')[0].input.limit).toBe(3)
    fireEvent.click(button('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '沒有權限', variant: 'error' }))
    expect(button('儲存')).not.toBeDisabled()
    fireEvent.click(button('取消'))
    await closedDialog()
  })
})

describe('預約明細', () => {
  it('顯示顧客、時間、設計師、同行人數、備註、提醒日期與報到狀態；結帳連到帳單頁', async () => {
    const utils = setup({ settings: { checkin: true } })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    await screen.findByText('電話: 0912000111')
    const d = within(dialog())
    expect(d.getByRole('link', { name: '陳小姐' })).toHaveAttribute('href', '/management/customers/c-1/invoices')
    expect(d.getByText('日期: 2025/03/10')).toBeInTheDocument()
    expect(d.getByText('預約時間: 10:00')).toBeInTheDocument()
    expect(d.getByText('指定/不指定: 指定')).toBeInTheDocument()
    expect(d.getByText('設計師: 王小美')).toBeInTheDocument()
    expect(d.getByText('同行人數: 1')).toBeInTheDocument()
    expect(d.getByText('備註: 剪髮')).toBeInTheDocument()
    expect(d.getByText('顧客備註: 想要安靜')).toBeInTheDocument()
    expect(d.getByText('報到狀態: 未報到')).toBeInTheDocument()
    expect(d.getByText('提醒日期: 2025/03/08 (2天前)')).toBeInTheDocument()
    expect(d.queryByText('出席狀況: 未出席')).toBeNull()
    expect(d.getByText('結帳').closest('a')).toHaveAttribute('href', '/order/b-1?status=checkout')
    // 已成功的預約不再顯示「接受預約」
    expect(d.queryByRole('button', { name: '接受預約' })).toBeNull()
    expect(d.queryByRole('button', { name: '延遲服務時間' })).toBeNull()
    fireEvent.click(button('關閉'))
    await closedDialog()

    fireEvent.click(block('黃小姐'))
    await screen.findByText('電話: 0933')
    expect(within(dialog()).getByText('設計師: 不指定')).toBeInTheDocument()
    expect(within(dialog()).getByText('報到狀態: 報到成功')).toBeInTheDocument()
    expect(within(dialog()).getByText('出席狀況: 未出席')).toBeInTheDocument()
    expect(within(dialog()).queryByText(/提醒日期/)).toBeNull()
  })

  it('依狀態顯示動作：待審核可接受、已完成不能編輯／接受、設計師已取消不能取消；報到功能關閉時沒有報到', async () => {
    const utils = setup()
    await pageReady(utils)
    fireEvent.click(block('林先生'))
    await screen.findByText('電話: 0922000222')
    expect(button('接受預約')).toBeInTheDocument()
    expect(button('編輯')).toBeInTheDocument()
    expect(within(dialog()).queryByText('結帳')).toBeNull()
    expect(within(dialog()).queryByRole('button', { name: '報到' })).toBeNull()
    expect(within(dialog()).queryByText(/報到狀態/)).toBeNull()
    fireEvent.click(button('關閉'))
    await closedDialog()

    fireEvent.click(block('已完成客'))
    await screen.findByText(/^電話:/)
    expect(within(dialog()).queryByRole('button', { name: '編輯' })).toBeNull()
    expect(within(dialog()).queryByRole('button', { name: '接受預約' })).toBeNull()
    expect(button('取消預約')).toBeInTheDocument()
    fireEvent.click(button('關閉'))
    await closedDialog()

    fireEvent.click(block('取消客'))
    await screen.findByText(/^電話:/)
    expect(within(dialog()).queryByRole('button', { name: '編輯' })).toBeNull()
    expect(within(dialog()).queryByRole('button', { name: '取消預約' })).toBeNull()
    expect(button('接受預約')).toBeInTheDocument()
  })

  it('接受預約：送 isApproval: true、從電腦操作、不帶密碼；成功提示並重抓', async () => {
    const utils = setup({ fixtures: { verifyBooking: { verifyBooking: { id: 'b-2' } } } })
    await pageReady(utils)
    fireEvent.click(block('林先生'))
    const before = calendarCalls(utils.calls)
    fireEvent.click(await screen.findByRole('button', { name: '接受預約' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'verifyBooking')).toEqual([{ input: { orderId: 'b-2', isApproval: true, isFromPC: true, password: '' } }])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已接受預約', variant: 'success' })
    await wait(() => expect(calendarCalls(utils.calls)).toBe(before + 1))
  })

  it('取消預約（沒有取消密碼）：直接送 isApproval: false', async () => {
    const utils = setup({ fixtures: { verifyBooking: { verifyBooking: { id: 'b-1' } } } })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消預約' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'verifyBooking')).toEqual([{ input: { orderId: 'b-1', isApproval: false, isFromPC: true, password: '' } }])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已取消預約', variant: 'success' })
  })

  it('取消預約（店家設定取消密碼）：先輸入密碼，取消時清空；確認時連同密碼送出，錯誤時提示並可重試', async () => {
    const utils = setup({
      settings: { cancelPassword: true },
      fixtures: { verifyBooking: sequence(new Error('密碼錯誤'), { verifyBooking: { id: 'b-1' } }, { verifyBooking: { id: null } }) },
    })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消預約' }))
    const pwd = await screen.findByLabelText('取消預約密碼')
    // 真實 OrderTable → ChoseEvent → PasswordDialog：密碼窗原無 onClose，Esc 不可傳到父窗。
    fireEvent.keyDown(pwd, { key: 'Escape', keyCode: 27 })
    expect(pwd).toBeInTheDocument()
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2)
    fireEvent.change(pwd, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByLabelText('取消預約密碼')).toBeNull())
    expect(button('取消預約')).toBeInTheDocument()
    // 重開後沒輸入密碼直接確認：送出空密碼（先前輸入的已清除）
    fireEvent.click(button('取消預約'))
    await screen.findByLabelText('取消預約密碼')
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '密碼錯誤', variant: 'error' }))
    expect(sentOf(utils.calls, 'verifyBooking')[0].input.password).toBe('')
    fireEvent.change(screen.getByLabelText('取消預約密碼'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'verifyBooking')[1]).toEqual({ input: { orderId: 'b-1', isApproval: false, isFromPC: true, password: '1234' } })
    expect(screen.queryByLabelText('取消預約密碼')).toBeNull()
  })

  it('接受預約後端沒回 id：不提示、不關窗', async () => {
    const utils = setup({ fixtures: { verifyBooking: { verifyBooking: { id: null } } } })
    await pageReady(utils)
    fireEvent.click(block('林先生'))
    fireEvent.click(await screen.findByRole('button', { name: '接受預約' }))
    await wait(() => expect(sentOf(utils.calls, 'verifyBooking')).toHaveLength(1))
    await utils.settle()
    expect(dialog()).not.toBeNull()
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('報到／取消報到：送預約 id 與「不是手機」；失敗時提示原因', async () => {
    const utils = setup({
      settings: { checkin: true },
      fixtures: { SET_BOOKING_CHECK_IN: sequence(new Error('尚未到報到時間'), { bookingCheckin: true }), SET_BOOKING_CANCEL_CHECK_IN: sequence(new Error('已開單'), { bookingCancelCheckin: true }) },
    })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '報到' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '尚未到報到時間', variant: 'error' }))
    fireEvent.click(button('報到'))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '報到成功', variant: 'success' })
    expect(sentOf(utils.calls, 'SET_BOOKING_CHECK_IN')[1]).toEqual({ input: { bookingId: 'b-1', isCellphone: false } })

    fireEvent.click(block('黃小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消報到' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已開單', variant: 'error' }))
    fireEvent.click(button('取消報到'))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '已取消報到', variant: 'success' })
    expect(sentOf(utils.calls, 'SET_BOOKING_CANCEL_CHECK_IN')[1]).toEqual({ input: { bookingId: 'b-3', isCellphone: false } })
  })

  it('延遲服務時間（店家開啟手動通知）：選分鐘數後寄出；失敗時按鈕恢復、不關窗', async () => {
    const utils = setup({
      settings: { checkin: true, manualNotify: true },
      fixtures: { SET_DELAY_BOOKING_CHECKIN_TIMME: sequence(new Error('簡訊額度不足'), { delayBookingCheckinTime: true }) },
    })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '延遲服務時間' }))
    expect(within(dialog()).getByText(/尚須多久時間完成服務/)).toBeInTheDocument()
    fireEvent.click(button('15分'))
    fireEvent.click(button('儲存'))
    await wait(() => expect(sentOf(utils.calls, 'SET_DELAY_BOOKING_CHECKIN_TIMME')).toHaveLength(1))
    await wait(() => expect(button('儲存')).not.toBeDisabled())
    expect(dialog()).not.toBeNull()
    fireEvent.click(button('儲存'))
    await closedDialog()
    expect(sentOf(utils.calls, 'SET_DELAY_BOOKING_CHECKIN_TIMME')[1]).toEqual({ input: { bookingId: 'b-1', delayTime: 15 } })
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '簡訊已寄出', variant: 'success' })

    // 延遲通知的關閉鈕
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '延遲服務時間' }))
    fireEvent.click(button('關閉'))
    await closedDialog()
  })

  it('未出席：未標記的送 isNoShow: true，已標記的送 false（取消未出席）；失敗時不關窗', async () => {
    const utils = setup({ fixtures: { SET_BOOKING_NO_SHOW: sequence(new Error('失敗'), { setBookingNoShow: true }) } })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '未出席' }))
    await wait(() => expect(sentOf(utils.calls, 'SET_BOOKING_NO_SHOW')).toHaveLength(1))
    await wait(() => expect(button('未出席')).not.toBeDisabled())
    fireEvent.click(button('未出席'))
    await closedDialog()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '設定成功', variant: 'success' })
    fireEvent.click(block('黃小姐'))
    fireEvent.click(await screen.findByRole('button', { name: '取消未出席' }))
    await closedDialog()
    expect(sentOf(utils.calls, 'SET_BOOKING_NO_SHOW')).toEqual([
      { input: { bookingIds: ['b-1'], isNoShow: true } },
      { input: { bookingIds: ['b-1'], isNoShow: true } },
      { input: { bookingIds: ['b-3'], isNoShow: false } },
    ])
  })

  it('未來預訂（待確認）勾選：送出預約 id 與勾選狀態，成功後畫面跟著勾；失敗時提示', async () => {
    const utils = setup({
      settings: { cusCheck: true },
      fixtures: { SET_IS_BOOKING_CUS_CHECK_REQUIRED: sequence({ setBookingCusCheckRequired: true }, new Error('無法修改')) },
    })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    const box = await screen.findByLabelText('未來預訂(待確認)')
    expect(box).not.toBeChecked()
    fireEvent.click(box)
    await wait(() => expect(screen.getByLabelText('未來預訂(待確認)')).toBeChecked())
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯成功', variant: 'success' })
    fireEvent.click(screen.getByLabelText('未來預訂(待確認)'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '無法修改', variant: 'error' }))
    expect(screen.getByLabelText('未來預訂(待確認)')).toBeChecked()
    expect(sentOf(utils.calls, 'SET_IS_BOOKING_CUS_CHECK_REQUIRED')).toEqual([
      { input: { bookingId: 'b-1', isRequired: true } },
      { input: { bookingId: 'b-1', isRequired: false } },
    ])
  })

  it('事件內容：顯示時間與時長，時長不在選項內時留空', async () => {
    const utils = setup()
    await pageReady(utils)
    fireEvent.click(block('奇怪時長的事件'))
    expect(await screen.findByText(/^時間: 2025\/03\/10\s+16:00$/)).toBeInTheDocument()
    expect(within(dialog()).getByText('事件時長:')).toBeInTheDocument()
    expect(within(dialog()).getByDisplayValue('奇怪時長的事件')).toBeInTheDocument()
    // 按 Esc 關閉
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await closedDialog()
  })
})

describe('編輯預約', () => {
  const openEdit = async name => {
    fireEvent.click(block(name))
    fireEvent.click(await screen.findByRole('button', { name: '編輯' }))
    await screen.findByRole('button', { name: '儲存' })
  }
  const timeSelect = () => selectWithOption('00:00')

  it('改日期、時段、指定、顧客、服務人員、時長、備註、提醒天數、佔名額後送出 updateOrder', async () => {
    const utils = setup({ fixtures: { UpdateOrder: { updateOrder: { id: 'b-1' } } } })
    await pageReady(utils)
    await openEdit('陳小姐')
    // 預約時間下拉：該天 00:00–23:30 每 30 分
    expect(timeSelect().options).toHaveLength(48)
    const nextDay = new Date(2025, 2, 12, 10, 0).getTime()
    fireEvent.change(within(dialog()).getByLabelText('預約時間'), { target: { value: String(nextDay) } })
    // 換日後時段選項跟著換到新的一天
    await wait(() => expect(timeSelect().value).not.toBe(''))
    choose(timeSelect(), '14:30')
    fireEvent.click(within(dialog()).getByTestId('assign-designer-false'))
    expect(within(dialog()).getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(within(dialog()).getByTestId('assign-designer-true'))
    fireEvent.click(within(dialog()).getByRole('button', { name: '選顧客' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '選服務人員' }))
    expect(within(dialog()).getByTestId('designer-picker')).toHaveAttribute('data-value', 'd-2')
    choose(selectWithOption('30分鐘'), '2.5小時')
    fireEvent.change(field('備註'), { target: { value: '改燙髮' } })
    expect(field('顧客備註')).toHaveAttribute('readonly')
    const days = field('提前通知天數')
    fireEvent.focusIn(days)
    fireEvent.wheel(days)
    fireEvent.change(days, { target: { value: '0' } })
    expect(days).toHaveValue(null)
    fireEvent.change(days, { target: { value: '3' } })
    fireEvent.click(within(dialog()).getByLabelText('佔用顧客端預約名額'))
    fireEvent.click(button('儲存'))
    await closedDialog()
    expect(sentOf(utils.calls, 'UpdateOrder')).toEqual([
      {
        input: {
          orderInput: {
            customerId: 'c-9',
            date: new Date(2025, 2, 12, 14, 30).getTime(),
            designerId: 'd-2',
            isDesignate: true,
            remark: '改燙髮',
            remarkForCustomer: '想要安靜',
            timeCost: 5,
            isBookingCostUsing: false,
          },
          notificationDayCount: 3,
          updateOrderId: 'b-1',
        },
      },
    ])
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '帳單編輯成功', variant: 'success' })
  })

  it('驗證：時間不是整點或半點、沒有顧客、清掉服務人員時擋下不送', async () => {
    const utils = setup()
    await pageReady(utils)
    await openEdit('陳小姐')
    fireEvent.change(within(dialog()).getByLabelText('預約時間'), { target: { value: String(new Date(2025, 2, 10, 10, 15).getTime()) } })
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '時間有誤', variant: 'warning' })
    choose(timeSelect(), '11:00')
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除顧客' }))
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇顧客', variant: 'warning' })
    fireEvent.click(within(dialog()).getByRole('button', { name: '選顧客' }))
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除服務人員' }))
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇服務人員', variant: 'warning' })
    expect(sentOf(utils.calls, 'UpdateOrder')).toHaveLength(0)
    fireEvent.click(button('關閉'))
    await closedDialog()
  })

  it('儲存失敗：提示原因、按鈕恢復；後端沒回 id 時不關窗', async () => {
    const utils = setup({ fixtures: { UpdateOrder: sequence(new Error('時段衝突'), { updateOrder: { id: null } }) } })
    await pageReady(utils)
    await openEdit('陳小姐')
    fireEvent.click(button('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '時段衝突', variant: 'error' }))
    expect(button('儲存')).not.toBeDisabled()
    fireEvent.click(button('儲存'))
    await wait(() => expect(sentOf(utils.calls, 'UpdateOrder')).toHaveLength(2))
    await utils.settle()
    expect(dialog()).not.toBeNull()
  })

  it('不指定預約的編輯：沒有服務人員時送 designerId: null；改成指定卻沒選服務人員時擋下；顯示報到狀態與報到鈕', async () => {
    const utils = setup({
      settings: { checkin: true, cusCheck: true },
      fixtures: {
        UpdateOrder: { updateOrder: { id: 'n-1' } },
        SET_BOOKING_CHECK_IN: { bookingCheckin: true },
        SET_BOOKING_CANCEL_CHECK_IN: { bookingCancelCheckin: true },
        SET_IS_BOOKING_CUS_CHECK_REQUIRED: { setBookingCusCheckRequired: true },
      },
    })
    await pageReady(utils)
    fireEvent.click(block('路人甲'))
    await screen.findByRole('button', { name: '儲存' })
    expect(within(dialog()).getByText('報到狀態: 未報到')).toBeInTheDocument()
    expect(within(dialog()).queryByLabelText('佔用顧客端預約名額')).toBeNull()
    expect(field('提前通知天數')).toHaveValue(1)
    fireEvent.click(within(dialog()).getByLabelText('未來預訂(待確認)'))
    await wait(() => expect(sentOf(utils.calls, 'SET_IS_BOOKING_CUS_CHECK_REQUIRED')).toHaveLength(1))
    fireEvent.click(within(dialog()).getByTestId('assign-designer-true'))
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇服務人員', variant: 'warning' })
    fireEvent.click(within(dialog()).getByTestId('assign-designer-false'))
    fireEvent.click(button('儲存'))
    await closedDialog()
    expect(sentOf(utils.calls, 'UpdateOrder')[0].input.orderInput).toMatchObject({ designerId: null, isDesignate: false, customerId: 'c-7', remark: '第一次' })
    expect(sentOf(utils.calls, 'UpdateOrder')[0].input.notificationDayCount).toBe(1)
    // 改成指定並選了服務人員：送出該服務人員
    fireEvent.click(block('路人甲'))
    await screen.findByRole('button', { name: '儲存' })
    fireEvent.click(within(dialog()).getByTestId('assign-designer-true'))
    fireEvent.click(within(dialog()).getByRole('button', { name: '選服務人員' }))
    fireEvent.click(button('儲存'))
    await closedDialog()
    expect(sentOf(utils.calls, 'UpdateOrder')[1].input.orderInput).toMatchObject({ designerId: 'd-2', isDesignate: true })

    fireEvent.click(block('路人甲'))
    fireEvent.click(await screen.findByRole('button', { name: '報到' }))
    await closedDialog()
    fireEvent.click(block('路人乙'))
    expect(await screen.findByText('報到狀態: 報到成功')).toBeInTheDocument()
    fireEvent.click(button('取消報到'))
    await closedDialog()
    expect(sentOf(utils.calls, 'SET_BOOKING_CHECK_IN')).toEqual([{ input: { bookingId: 'n-1', isCellphone: false } }])
    expect(sentOf(utils.calls, 'SET_BOOKING_CANCEL_CHECK_IN')).toEqual([{ input: { bookingId: 'n-2', isCellphone: false } }])

    // 沒有報到狀態（null）的不指定預約：不顯示報到
    fireEvent.click(block('路人丙'))
    await screen.findByRole('button', { name: '儲存' })
    expect(within(dialog()).queryByText(/報到狀態/)).toBeNull()
    expect(within(dialog()).queryByRole('button', { name: '報到' })).toBeNull()
    // 指定預約編輯時清空服務人員也擋下
    fireEvent.click(within(dialog()).getByRole('button', { name: '清除服務人員' }))
    fireEvent.click(button('儲存'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇服務人員', variant: 'warning' })
  })
})
