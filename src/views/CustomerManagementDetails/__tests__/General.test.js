// 保護顧客詳細「基本資料」分頁：個資（電話、生日、地址、Email、LINE）原樣顯示、客資建立日以台灣時間；
// 黑名單設定送出 { customerId, input: 與目前相反 }，成功後重新查詢顧客；
// 編輯客戶彈窗：帶入原資料、顧客編號 500ms 後查重（排除自己）、生日民國年／月／日限制、Enter 依序跳欄、送出的 input 正確；
// 建立預約彈窗：預設今天 10:00、選服務人員、時長、備註後送出 bookingV2 的內容正確，沒選服務人員時提示。
// GraphQL 全由 testkit 的模擬 link 回應，不寫入真實顧客或預約。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { format, setHours, startOfDay, setMinutes } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, typeLikeBrowser, MERCHANT_ID } from '../../../__tests__/testkit.test'
import { renderDetails, CUSTOMER } from './detailsKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
// 日期選擇器本體另有測試：以輸入框代替（輸入完整日期時間字串，與真實選擇器「換日保留原時間」相同）
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ label, value, onChange }) => (
    <input aria-label={label} data-value={String(value)} onChange={e => onChange(new Date(e.target.value))} />
  ),
}))
jest.mock('components/BookingRecordListAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="booking-designer" data-value={JSON.stringify(value)}>
    <button type="button" onClick={() => onChange({ id: 'u-1', userId: 'designer-1' })}>選服務人員</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除服務人員</button>
  </div>
))

const USERS = { users: { users: [{ id: 'd1', name: '王小美' }, { id: 'd2', name: 'Amy' }] } }
const fixtures = (overrides = {}) => ({
  FETCH_USERS: USERS,
  CUSTOMER_CATEGORY: { merchantCustomerCategory: [] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
  SET_CUSTOMER: { updateCustomer: true },
  SET_CUSTOMER_ISUNWELCOME: { setCustomerIsUnwelcome: true },
  bookingV2: { bookingV2: { id: 'bk-1', status: 'BOOKED', date: 1 } },
  ...overrides,
})
const setup = (overrides = {}, options = {}) => renderDetails({ fixtures: fixtures(overrides), ...options })

const row = label => screen.getByText(label, { selector: 'dt' }).parentElement
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('基本資料', () => {
  it('顯示顧客資料：編號、姓名、Email、LINE、暱稱、生日、電話、地址、來源、設計師、備註、建立日', async () => {
    const utils = setup()
    await utils.settle()
    expect(row('客戶編號')).toHaveTextContent('C01')
    expect(row('姓名')).toHaveTextContent('陳小姐')
    expect(row('Email')).toHaveTextContent('chen@example.com')
    expect(row('LineID')).toHaveTextContent('chen01')
    expect(row('客戶暱稱')).toHaveTextContent('小陳')
    expect(row('生日')).toHaveTextContent('79/2/28')
    expect(row('電話')).toHaveTextContent('0912345678')
    expect(row('地址')).toHaveTextContent('台北市信義區')
    expect(row('客戶來源')).toHaveTextContent('朋友介紹')
    expect(row('最近設計師')).toHaveTextContent('王小美')
    expect(row('偏好設計師')).toHaveTextContent('Amy')
    expect(row('備註')).toHaveTextContent('怕冷')
    expect(row('客資建立時間')).toHaveTextContent('2025/01/02')
  })

  // 已知缺口（待 Jason 決定）：性別欄只把 UNKNOWN 轉成「未知」，男／女直接顯示英文代碼 MALE／FEMALE
  // （views/CustomerManagementDetails/General/CustomerInfo.js:58）。建議：改用 types 的 gender 對照（列表頁已在用）。
  it('已知缺口：性別顯示英文代碼；未知顯示「未知」；沒有生日、來源、設計師時留白', async () => {
    const utils = setup()
    await utils.settle()
    expect(row('性別')).toHaveTextContent('FEMALE')
    cleanup()
    const unknown = renderDetails({
      fixtures: fixtures({
        FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, gender: 'UNKNOWN', birthday: null, source: null, latestDesigner: null, preferDesigner: null } },
      }),
    })
    await unknown.settle()
    expect(row('性別')).toHaveTextContent('未知')
    expect(row('生日').querySelector('dd')).toHaveTextContent('')
    expect(row('客戶來源').querySelector('dd').textContent).toBe('')
    expect(row('最近設計師').querySelector('dd').textContent).toBe('')
    expect(row('偏好設計師').querySelector('dd').textContent).toBe('')
  })

  it('設為黑名單：送出相反的設定，成功提示並重新查詢顧客', async () => {
    const utils = setup()
    await utils.settle()
    const before = callsOf(utils.calls, 'FETCH_CUSTOMER_DETAIL').length
    fireEvent.click(screen.getByText('設為黑名單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '設定成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'SET_CUSTOMER_ISUNWELCOME')[0].variables).toEqual({ customerId: 'c1', input: true })
    await wait(() => expect(callsOf(utils.calls, 'FETCH_CUSTOMER_DETAIL').length).toBeGreaterThan(before))
    expect(screen.getByText('設為黑名單')).not.toBeDisabled()
  })

  // 已知缺口（待 Jason 決定）：判斷成功與否用的是整個 mutation 回應物件（永遠有值），不是 data.setCustomerIsUnwelcome，
  // 後端回 false 時仍提示「設定成功」，「設定失敗」分支永遠到不了（views/CustomerManagementDetails/General/CustomerInfo.js:36）。
  it('已知缺口：黑名單顧客顯示解除黑名單（送出 false），後端回 false 仍提示設定成功；錯誤以訊息提示', async () => {
    const utils = setup({
      FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, isUnwelcome: true } },
      SET_CUSTOMER_ISUNWELCOME: { setCustomerIsUnwelcome: false },
    })
    await utils.settle()
    fireEvent.click(screen.getByText('解除黑名單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '設定成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'SET_CUSTOMER_ISUNWELCOME')[0].variables).toEqual({ customerId: 'c1', input: false })
    expect(openSnackbar).not.toHaveBeenCalledWith({ message: '設定失敗', variant: 'warning' })
    cleanup()
    const errored = setup({ SET_CUSTOMER_ISUNWELCOME: new Error('沒有權限') })
    await errored.settle()
    fireEvent.click(screen.getByText('設為黑名單'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '沒有權限', variant: 'error' }))
    expect(screen.getByText('設為黑名單')).not.toBeDisabled()
  })
})

describe('編輯客戶資料', () => {
  const openEdit = async () => {
    fireEvent.click(screen.getByText('編輯'))
    return screen.findByText('編輯客戶資料')
  }

  it('帶入原資料；改姓名、性別、生日、電話、來源、偏好設計師、備註後儲存，送出內容正確並重新查詢', async () => {
    const utils = setup()
    await utils.settle()
    await openEdit()
    expect(inputOf('客戶編號')).toHaveValue('C01')
    expect(inputOf('客戶姓名')).toHaveValue('陳小姐')
    expect(inputOf('民國年')).toHaveValue('79')
    expect(inputOf('電話')).toHaveValue('0912345678')
    typeLikeBrowser(inputOf('客戶姓名'), '陳美美')
    choose(screen.getByLabelText('性別'), '未知')
    fireEvent.change(inputOf('民國年'), { target: { value: '0801' } })
    fireEvent.change(inputOf('民國年'), { target: { value: '80' } })
    fireEvent.change(inputOf('月'), { target: { value: '13' } })
    fireEvent.change(inputOf('月'), { target: { value: '' } })
    fireEvent.change(inputOf('月'), { target: { value: '3' } })
    fireEvent.change(inputOf('日'), { target: { value: '32' } })
    fireEvent.change(inputOf('日'), { target: { value: '' } })
    fireEvent.change(inputOf('日'), { target: { value: '1' } })
    fireEvent.focusIn(inputOf('日'))
    typeLikeBrowser(inputOf('電話'), '0987654321')
    typeLikeBrowser(inputOf('Email'), 'mei@example.com')
    typeLikeBrowser(inputOf('lineId'), 'mei')
    typeLikeBrowser(inputOf('客戶暱稱'), '美美')
    typeLikeBrowser(inputOf('地址'), '新北市')
    choose(screen.getByLabelText('客戶來源'), '網路')
    choose(screen.getByLabelText('偏好設計師'), 'Amy')
    typeLikeBrowser(inputOf('備註'), 'VIP')
    const before = callsOf(utils.calls, 'FETCH_CUSTOMER_DETAIL').length
    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功更新顧客資訊' }))
    expect(callsOf(utils.calls, 'SET_CUSTOMER')[0].variables).toEqual({
      input: {
        customerId: 'c1',
        category: '一般',
        no: 'C01',
        name: '陳美美',
        nickName: '美美',
        cellphone: '0987654321',
        birthday: { year: '80', month: '3', day: '1' },
        PreferDesignerId: 'd2',
        OfficialBrandMerchantId: MERCHANT_ID,
        email: 'mei@example.com',
        address: '新北市',
        lineId: 'mei',
        gender: 'UNKNOWN',
        source: '網路',
        remark: 'VIP',
      },
    })
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    await wait(() => expect(callsOf(utils.calls, 'FETCH_CUSTOMER_DETAIL').length).toBeGreaterThan(before))
  })

  // 已知缺口（待 Jason 決定）：彈窗以 customer.PreferDesignerId 帶入偏好設計師，但顧客查詢回的是 preferDesigner { id }，
  // 所以偏好設計師永遠帶入空白；沒動偏好設計師直接儲存也會送 PreferDesignerId: ''，可能把原本的偏好設計師清掉
  // （views/CustomerManagementDetails/General/CustomerEditModal.js:70）。建議：改用 customer.preferDesigner?.id 帶入。
  it('已知缺口：偏好設計師不會帶入，直接儲存送出空白偏好設計師', async () => {
    const utils = setup()
    await utils.settle()
    await openEdit()
    expect(screen.getByLabelText('偏好設計師').value).toBe('0')
    fireEvent.click(screen.getByText('儲存'))
    await wait(() => expect(callsOf(utils.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(utils.calls, 'SET_CUSTOMER')[0].variables.input.PreferDesignerId).toBe('')
  })

  it('顧客編號：改動後 500ms 查重（帶自己的 id 排除自己），重複顯示錯誤；清空不查', async () => {
    const utils = setup({ GET_CHECK_IS_CUSTOMER_NO_USED: v => ({ checkIsCustomerNoUsed: v.input === 'C02' }) })
    await utils.settle()
    await openEdit()
    await wait(() => expect(callsOf(utils.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')).toHaveLength(1), { timeout: 12000 })
    expect(callsOf(utils.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C01', customerId: 'c1' })
    typeLikeBrowser(inputOf('客戶編號'), 'C02')
    expect(await screen.findByText('客戶編號重複', {}, { timeout: 12000 })).toBeInTheDocument()
    typeLikeBrowser(inputOf('客戶編號'), '')
    await wait(() => expect(screen.queryByText('客戶編號重複')).toBeNull())
  })

  it('Enter 依序跳到下一欄；電話清空時不可儲存；取消關閉', async () => {
    const utils = setup()
    await utils.settle()
    await openEdit()
    const order = ['客戶編號', '客戶姓名', 'Email', 'lineId', '客戶暱稱', '民國年', '月', '日', '電話', '地址']
    order.slice(0, -1).forEach((label, i) => {
      fireEvent.keyDown(inputOf(label), { key: 'Enter' })
      expect(document.activeElement).toBe(inputOf(order[i + 1]))
    })
    fireEvent.keyDown(inputOf('地址'), { key: 'Enter' })
    expect(document.activeElement).toBe(inputOf('地址'))
    fireEvent.keyDown(inputOf('客戶編號'), { key: 'a' })
    typeLikeBrowser(inputOf('電話'), '')
    expect(screen.getByText('儲存')).toBeDisabled()
    fireEvent.click(screen.getByText('取消'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
  })

  it('沒有選定店家時不可儲存（缺品牌店家 id）', async () => {
    loginAs({ merchant: null })
    const utils = setup()
    await utils.settle()
    await openEdit()
    expect(screen.getByText('儲存')).toBeDisabled()
  })

  it('設計師清單載入中：偏好設計師顯示載入中；顧客沒有資料的欄位帶入空白', async () => {
    const utils = setup(
      { FETCH_CUSTOMER_DETAIL: { customer: { id: null, name: '', no: null, birthday: null, membershipPurchaseRecord: [], createdAt: 1 } } },
      { delays: { FETCH_USERS: 2000 } }
    )
    await screen.findByText('編輯')
    await openEdit()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(inputOf('客戶編號')).toHaveValue('')
    expect(inputOf('電話')).toHaveValue('0')
    expect(inputOf('民國年')).toHaveValue('')
    expect(inputOf('客戶姓名')).toHaveValue('')
    await utils.settle()
    expect(screen.queryByText('Loading...')).toBeNull()
  })
})

describe('建立預約', () => {
  const openBooking = async () => {
    fireEvent.click(screen.getByText('建立預約'))
    return screen.findByText('預約')
  }
  const timeSelect = () => screen.getAllByRole('combobox').find(s => Array.from(s.options).some(o => o.textContent === '10:00'))

  it('預設今天 10:00、30 分鐘、佔用名額；未選服務人員時提示', async () => {
    const utils = setup()
    await utils.settle()
    await openBooking()
    const tenOClock = setHours(startOfDay(new Date()), 10).getTime()
    expect(screen.getByLabelText('預約時間')).toHaveAttribute('data-value', String(tenOClock))
    const select = timeSelect()
    expect(select.options).toHaveLength(48)
    expect(select.options[select.selectedIndex].textContent).toBe('10:00')
    expect(screen.getByLabelText('佔用顧客端預約名額')).toBeChecked()
    expect(screen.queryByLabelText('未來預訂(待確認)')).toBeNull()
    fireEvent.click(screen.getByText('預約'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇設計師', variant: 'warning' })
    expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(0)
    fireEvent.click(screen.getByText('取消'))
    await wait(() => expect(screen.queryByText('預約')).toBeNull())
  })

  it('選服務人員、時間、時長、備註、不佔名額、待確認後送出；成功提示並關閉', async () => {
    const utils = setup({ GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: true } })
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    choose(timeSelect(), '14:30')
    choose(screen.getByLabelText('服務時長'), '2小時')
    fireEvent.change(inputOf('備註'), { target: { value: '染髮' } })
    fireEvent.change(inputOf('顧客備註'), { target: { value: '怕冷' } })
    fireEvent.click(screen.getByLabelText('佔用顧客端預約名額'))
    fireEvent.click(screen.getByLabelText('未來預訂(待確認)'))
    fireEvent.click(screen.getByText('預約'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '預約成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'bookingV2')[0].variables).toEqual({
      BookingV2Input: {
        merchantId: MERCHANT_ID,
        dateTime: setMinutes(setHours(startOfDay(new Date()), 14), 30).getTime(),
        designerId: 'designer-1',
        name: '0912345678',
        cellphone: '0912345678',
        friends: [],
        designerServiceIds: [],
        remark: '染髮',
        remarkForCustomer: '怕冷',
        timeCost: 4,
        isBookingCostUsing: false,
        isCusCheckRequired: true,
      },
    })
    await wait(() => expect(screen.queryByText('預約')).toBeNull())
  })

  // 已知缺口（待 Jason 決定）：時間下拉的選項只有「今天」的 48 個時段，先選其他日期再選時間，日期會被換回今天
  // （views/CustomerManagementDetails/General/ChoseEvent.js:39-44、130）。建議：時段以目前選定日期產生，或選時間時只換時分。
  it('已知缺口：選了其他日期後再選時間，預約日期變回今天', async () => {
    const utils = setup()
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    fireEvent.change(screen.getByLabelText('預約時間'), { target: { value: '2030/01/15 10:00' } })
    choose(timeSelect(), '15:00')
    fireEvent.click(screen.getByText('預約'))
    await wait(() => expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(1))
    const sent = callsOf(utils.calls, 'bookingV2')[0].variables.BookingV2Input.dateTime
    expect(format(sent, 'yyyy/MM/dd HH:mm')).toBe(format(setHours(startOfDay(new Date()), 15), 'yyyy/MM/dd HH:mm'))
  })

  it('只換日期：送出選定日期（保留時間）', async () => {
    const utils = setup()
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    fireEvent.change(screen.getByLabelText('預約時間'), { target: { value: '2030/01/15 10:00' } })
    fireEvent.click(screen.getByText('預約'))
    await wait(() => expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(1))
    expect(callsOf(utils.calls, 'bookingV2')[0].variables.BookingV2Input.dateTime).toBe(new Date(2030, 0, 15, 10).getTime())
  })

  // 已知缺口（待 Jason 決定）：選了服務人員又清除後，designerId 變成 { id: '' } 物件，不再等於 ''，
  // 「請選擇設計師」的檢查被跳過，直接送出 designerId: ''（views/CustomerManagementDetails/General/ChoseEvent.js:63、147）。
  it('已知缺口：選了再清除服務人員仍會送出（designerId 為空字串）；後端回錯誤時提示並可再按', async () => {
    const utils = setup({ bookingV2: new Error('請選擇服務人員') })
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    fireEvent.click(screen.getByText('清除服務人員'))
    fireEvent.click(screen.getByText('預約'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇服務人員', variant: 'error' }))
    expect(callsOf(utils.calls, 'bookingV2')[0].variables.BookingV2Input.designerId).toBe('')
    expect(screen.getByText('預約')).not.toBeDisabled()
  })

  it('顧客沒有電話：選了服務人員仍提示請填寫電話、不送出', async () => {
    const utils = setup({ FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, cellphone: '' } } })
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    fireEvent.click(screen.getByText('預約'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請填寫電話', variant: 'warning' })
    expect(callsOf(utils.calls, 'bookingV2')).toHaveLength(0)
  })

  it('後端沒有回預約 id：不提示成功、彈窗不關', async () => {
    const utils = setup({ bookingV2: { bookingV2: { id: null } } })
    await utils.settle()
    await openBooking()
    fireEvent.click(screen.getByText('選服務人員'))
    fireEvent.click(screen.getByText('預約'))
    await utils.settle()
    expect(openSnackbar).not.toHaveBeenCalledWith({ message: '預約成功', variant: 'success' })
    expect(within(document.body).getByText('預約')).toBeInTheDocument()
  })
})
