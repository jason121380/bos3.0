// 保護「客戶列表」：查詢條件（店家、分頁、關鍵字、偏好／最近設計師、生日、排序、會員卡篩選、黑名單）送出正確；
// 每位顧客顯示姓名（連到顧客詳細）、電話、編號、設計師、上次消費日（台灣時間）、性別、生日（民國年/月/日）、來源與黑名單標示；
// 店家開啟會員卡時才顯示會員卡欄（最後一張卡的名稱、效期或「永久」、備註）與會員／效期／黑名單篩選；
// 刪除客人：未設刪除密碼時直接刪除，有設時要輸入密碼確認，送出勾選的顧客 id 與密碼，成功後清除勾選並重新查詢，失敗提示並可再按。
// GraphQL 全由 testkit 的模擬 link 回應，不刪除真實顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, MERCHANT_ID } from '../../../__tests__/testkit.test'
import CustomerManagementList from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('components/EmployeeAutoComplete', () => ({ label, onChange }) => (
  <button type="button" onClick={() => onChange({ userId: `${label}-id` })}>選{label}</button>
))

const CUSTOMERS = [
  {
    id: 'c1',
    name: 'amy 陳',
    cellphone: '0912345678',
    no: 'C01',
    latestDesigner: { id: 'd1', name: '王小美' },
    preferDesigner: { id: 'd2', name: 'Amy' },
    lastTime: new Date(2026, 9, 21, 23, 40).getTime(),
    birthday: { year: '79', month: '2', day: '28' },
    gender: 'FEMALE',
    source: '朋友介紹',
    membershipPurchaseRecord: [
      { membershipName: '舊年卡', expiryDay: new Date(2025, 0, 1).getTime(), remark: '' },
      { membershipName: '金卡', expiryDay: null, remark: 'VIP' },
    ],
    isUnwelcome: true,
  },
  {
    id: 'c2',
    name: '林先生',
    cellphone: '0922333444',
    no: null,
    latestDesigner: null,
    preferDesigner: null,
    lastTime: null,
    birthday: null,
    gender: 'MALE',
    source: null,
    membershipPurchaseRecord: [{ membershipName: '銀卡', expiryDay: new Date(2027, 0, 31).getTime(), remark: null }],
    isUnwelcome: false,
  },
  {
    id: 'c3',
    name: '王小姐',
    cellphone: '0933',
    no: 'C03',
    gender: 'UNKNOWN',
    membershipPurchaseRecord: [],
    isUnwelcome: false,
  },
]

const setup = ({ active = true, passwordUsing = false, fixtures = {} } = {}) =>
  renderPage(<CustomerManagementList />, {
    fixtures: {
      FETCH_CUSTOMERS: { customers: { customers: CUSTOMERS, pageLimit: 50, pageOffset: 0, totalCount: 3 } },
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
      GET_MERCHANT_PASSWORD: { merchantPassword: { deleteCustomer: { isUsing: passwordUsing } } },
      DELETE_CUSTOMERS: { deleteCustomer: true },
      ...fixtures,
    },
    route: '/management/customers',
  })

const lastInput = calls => callsOf(calls, 'FETCH_CUSTOMERS').pop().variables.input
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const toolbar = () => screen.getByRole('toolbar', { hidden: true })
const DEFAULT_INPUT = {
  merchantId: MERCHANT_ID,
  pageLimit: 50,
  pageOffset: 0,
  keyword: '',
  preferDesigner: '',
  latestDesigner: '',
  birthday: { year: '', month: '', day: '' },
  searchingOrder: 'UPDATEDAT',
  orderWay: 'DESC',
  membershipPreference: { membership: 'UNSET', membershipValidity: 'ALL' },
  isUnwelcome: 'ALL',
}

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('客戶列表：顯示', () => {
  it('預設條件查詢；每位顧客的姓名連結、電話、編號、設計師、上次消費日、性別、生日、來源與黑名單', async () => {
    const utils = setup()
    await utils.settle()
    expect(lastInput(utils.calls)).toEqual(DEFAULT_INPUT)
    expect(screen.getByText('共 3 筆')).toBeInTheDocument()
    expect(screen.getByText('新增').closest('a')).toHaveAttribute('href', '/management/customer/create')
    const r1 = screen.getByText('amy 陳').closest('tr')
    expect(screen.getByText('amy 陳').closest('a')).toHaveAttribute('href', '/management/customers/c1')
    expect(within(r1).getByLabelText('編輯客戶')).toHaveAttribute('href', '/management/customers/c1')
    expect(within(r1).getByText('A')).toBeInTheDocument()
    ;['0912345678', 'C01', '王小美', 'Amy', '2026/10/21', '女', '79/2/28', '朋友介紹', '黑名單'].forEach(text =>
      expect(within(r1).getByText(text)).toBeInTheDocument()
    )
    // 會員卡欄：顯示最後一張（金卡、無效期顯示永久、備註）
    expect(within(r1).getByText('金卡')).toBeInTheDocument()
    expect(within(r1).getByText('效期： 永久')).toBeInTheDocument()
    expect(within(r1).getByText('備註： VIP')).toBeInTheDocument()
    expect(within(r1).queryByText('舊年卡')).toBeNull()
    const r2 = screen.getByText('林先生').closest('tr')
    expect(within(r2).getByText('男')).toBeInTheDocument()
    expect(within(r2).getByText('效期： 2027/01/31')).toBeInTheDocument()
    expect(within(r2).queryByText(/備註/)).toBeNull()
    expect(within(r2).queryByText('黑名單')).toBeNull()
    expect(within(screen.getByText('王小姐').closest('tr')).getByText('未知')).toBeInTheDocument()
  })

  it('未開啟會員卡：不顯示會員卡欄與會員／黑名單篩選', async () => {
    const utils = setup({ active: false })
    await utils.settle()
    expect(screen.queryByText('會員卡')).toBeNull()
    expect(screen.queryByLabelText('會員')).toBeNull()
    expect(screen.queryByLabelText('黑名單篩選')).toBeNull()
  })
})

describe('客戶列表：查詢條件', () => {
  it('排序、呈現順序、會員（選「是」才出現效期）、效期、黑名單篩選改變時重新查詢', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('篩選'))
    choose(screen.getByLabelText('顧客排序方式'), '依序顧客編號')
    await wait(() => expect(lastInput(utils.calls).searchingOrder).toBe('NO'))
    choose(screen.getByLabelText('呈現順序'), '由小到大')
    await wait(() => expect(lastInput(utils.calls).orderWay).toBe('ASC'))
    expect(screen.queryByLabelText('效期')).toBeNull()
    choose(screen.getByLabelText('會員'), '是')
    await wait(() => expect(lastInput(utils.calls).membershipPreference).toEqual({ membership: 'ALL', membershipValidity: 'ALL' }))
    choose(await screen.findByLabelText('效期'), '已過期')
    await wait(() => expect(lastInput(utils.calls).membershipPreference).toEqual({ membership: 'ALL', membershipValidity: 'EXPIRED' }))
    choose(screen.getByLabelText('黑名單篩選'), '排除黑名單')
    await wait(() => expect(lastInput(utils.calls).isUnwelcome).toBe('WELCOME'))
    choose(screen.getByLabelText('會員'), '否')
    await wait(() => expect(lastInput(utils.calls).membershipPreference.membership).toBe('NONE'))
    expect(screen.queryByLabelText('效期')).toBeNull()
  })

  it('搜尋列：關鍵字、最近／偏好設計師、生日送出；清除回到預設條件', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '陳' } })
    fireEvent.keyDown(screen.getByPlaceholderText('搜尋關鍵字'), { key: 'Enter' })
    await wait(() => expect(lastInput(utils.calls).keyword).toBe('陳'))
    fireEvent.click(screen.getByText('選最近設計師編號/姓名'))
    await wait(() => expect(lastInput(utils.calls).latestDesigner).toBe('最近設計師編號/姓名-id'))
    fireEvent.click(screen.getByText('選偏好設計師編號/姓名'))
    await wait(() => expect(lastInput(utils.calls).preferDesigner).toBe('偏好設計師編號/姓名-id'))
    fireEvent.change(inputOf('民國年'), { target: { value: '79' } })
    fireEvent.change(inputOf('月'), { target: { value: '2' } })
    fireEvent.change(inputOf('日'), { target: { value: '28' } })
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(utils.calls).birthday).toEqual({ year: '79', month: '2', day: '28' }))
    fireEvent.click(screen.getByText('清除').closest('button'))
    await wait(() => expect(lastInput(utils.calls)).toEqual(DEFAULT_INPUT))
  })

  it('沒有選定店家時 merchantId 為 null（清除後亦同）', async () => {
    loginAs({ merchant: null })
    const utils = setup()
    await utils.settle()
    expect(lastInput(utils.calls).merchantId).toBeNull()
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '陳' } })
    fireEvent.keyDown(screen.getByPlaceholderText('搜尋關鍵字'), { key: 'Enter' })
    await wait(() => expect(lastInput(utils.calls).keyword).toBe('陳'))
    fireEvent.click(screen.getByText('清除').closest('button'))
    await wait(() => expect(lastInput(utils.calls)).toEqual({ ...DEFAULT_INPUT, merchantId: null }))
  })

  it('換頁送出 pageOffset、改每頁筆數送出 pageLimit', async () => {
    const utils = setup({ fixtures: { FETCH_CUSTOMERS: { customers: { customers: CUSTOMERS, pageLimit: 50, pageOffset: 0, totalCount: 300 } } } })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(lastInput(utils.calls).pageOffset).toBe(1))
    await utils.settle()
    choose(screen.getByLabelText('每頁筆數'), '1000')
    await wait(() => expect(lastInput(utils.calls).pageLimit).toBe(1000))
  })
})

describe('客戶列表：刪除客人', () => {
  it('勾選：單筆、全選、取消全選', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 amy 陳')).toBeChecked()
    expect(within(toolbar()).getByText('已選 3 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
  })

  it('未設刪除密碼：直接刪除勾選的顧客（密碼空白），成功清除勾選並重新查詢', async () => {
    const utils = setup()
    await utils.settle()
    const before = callsOf(utils.calls, 'FETCH_CUSTOMERS').length
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除客戶中', variant: 'warning' })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除客戶', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_CUSTOMERS')[0].variables).toEqual({ customerIds: ['c2'], password: '' })
    expect(callsOf(utils.calls, 'FETCH_CUSTOMERS').length).toBeGreaterThan(before)
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
  })

  it('有刪除密碼：輸入密碼確認後送出；取消則關閉並清除勾選', async () => {
    const utils = setup({ passwordUsing: true })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    expect(await screen.findByText('刪除客人', { selector: 'h2' })).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '9999' } })
    fireEvent.click(screen.getByText('取消'))
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
    expect(callsOf(utils.calls, 'DELETE_CUSTOMERS')).toHaveLength(0)

    fireEvent.click(screen.getByLabelText('選取 amy 陳'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    expect(screen.getByTestId('delete-password')).toHaveValue('')
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '1234' } })
    fireEvent.click(screen.getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除客戶', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_CUSTOMERS')[0].variables).toEqual({ customerIds: ['c1'], password: '1234' })
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
  })

  it('刪除失敗（密碼錯誤）：提示錯誤、對話框保留且按鈕恢復可按', async () => {
    const utils = setup({ passwordUsing: true, fixtures: { DELETE_CUSTOMERS: new Error('刪除密碼錯誤') } })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    fireEvent.change(await screen.findByTestId('delete-password'), { target: { value: '0000' } })
    fireEvent.click(screen.getByText('確認'))
    expect(screen.getByText('確認')).toBeDisabled()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除密碼錯誤', variant: 'error' }))
    expect(screen.getByText('確認')).not.toBeDisabled()
    expect(screen.getByTestId('delete-password')).toBeInTheDocument()
  })
})
