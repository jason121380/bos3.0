// 保護「客資篩選匯出」：查詢條件（關鍵字、偏好／最近設計師、生日、來源、黑名單、來店消費＋所屬、最後消費區間或基準日前後天數、分頁）送出正確，
// 條件寫回網址（?pageSetting=）且從網址帶回時還原篩選與日期欄的啟用狀態；列表顯示個資欄位（電話、生日）與黑名單紅字，
// 連到顧客詳細時帶 backto=customer-filter；「報表匯出」以目前條件向後端要檔案網址並開啟；刪除客人同客戶列表（密碼確認）。
// 匯出檔由後端產生。店家關掉「報表匯出客資遮碼」時，按鈕停用並說明原因；設定不是明確關閉時仍開啟後端回的網址。
// GraphQL 全由 testkit 的模擬 link 回應，不刪除真實顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import CustomerFilterExport from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('components/EmployeeAutoComplete', () => ({ label, onChange }) => (
  <button type="button" onClick={() => onChange({ userId: `${label}-id` })}>
    選{label}
  </button>
))
jest.mock('components/BelongAutocomplete', () => ({ value, onChange }) => (
  <button type="button" data-testid="belong" data-value={JSON.stringify(value)} onClick={() => onChange(['信義店'])}>
    選所屬店家
  </button>
))
jest.mock('ui/date-picker', () => ({
  DatePicker: ({ label, value, onChange, disabled }) => (
    <input
      aria-label={label}
      disabled={disabled}
      data-value={value === null ? '' : String(value)}
      onChange={e => onChange(new Date(e.target.value))}
    />
  ),
}))

const CUSTOMERS = [
  {
    id: 'c1',
    name: 'amy 陳',
    no: 'C01',
    cellphone: '0912345678',
    latestDesigner: { name: '王小美' },
    preferDesigner: { name: 'Amy' },
    lastTime: new Date(2026, 9, 21, 23, 40).getTime(),
    gender: 'FEMALE',
    birthday: { year: '79', month: '2', day: '28' },
    source: '朋友介紹',
    isUnwelcome: true,
  },
  { id: 'c2', name: '林先生', no: null, cellphone: '0922333444', gender: 'MALE', birthday: null, lastTime: null, isUnwelcome: false },
]

const DEFAULT = {
  keyword: '',
  preferDesigner: '',
  latestDesigner: '',
  birthday: { year: '', month: '', day: '' },
  source: '',
  pageLimit: 50,
  pageOffset: 0,
  consumptionRange: null,
  baseDateRange: null,
  customerIsCome: null,
  isUnwelcome: 'ALL',
  category: [],
}

const setup = ({ fixtures = {}, route = '/management/customer-filter-export' } = {}) =>
  renderPage(<CustomerFilterExport />, {
    fixtures: {
      FETCH_CUSTOMER_WITHOUT_SORTING: { customersWithoutSorting: { customers: CUSTOMERS, pageLimit: 50, pageOffset: 0, totalCount: 120 } },
      GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
      GET_MERCHANT_PASSWORD: { merchantPassword: { deleteCustomer: { isUsing: false } } },
      FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL: { customersWithoutSortingExcel: 'https://files.example.com/customers.xlsx' },
      DELETE_CUSTOMERS: { deleteCustomer: true },
      ...fixtures,
    },
    route,
  })

const lastInput = calls => callsOf(calls, 'FETCH_CUSTOMER_WITHOUT_SORTING').pop().variables.input
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const toolbar = () => screen.getByRole('toolbar', { hidden: true })
const urlSetting = () => JSON.parse(new URLSearchParams(currentLocation().split('?')[1]).get('pageSetting'))
const openDialog = () => fireEvent.click(screen.getByText('篩選最後消費週期'))
const confirmDialog = () => fireEvent.click(screen.getByText('確認'))

let openSpy
beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
  openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
})
afterEach(() => {
  openSpy.mockRestore()
  cleanup()
})

describe('客資篩選匯出：列表與網址', () => {
  // 本檔第一個測試：模組層的 once 旗標在第一次載入完成後才開始把條件寫回網址
  it('預設條件查詢；第一次載入不改網址，之後條件改變才寫回網址', async () => {
    const utils = setup()
    await utils.settle()
    expect(lastInput(utils.calls)).toEqual(DEFAULT)
    expect(currentLocation()).toBe('/management/customer-filter-export')
    choose(screen.getByLabelText('黑名單篩選'), '顯示黑名單')
    await wait(() => expect(lastInput(utils.calls).isUnwelcome).toBe('UNWELCOME'))
    await utils.settle()
    expect(urlSetting()).toEqual({ ...DEFAULT, isUnwelcome: 'UNWELCOME' })
  })

  it('列表：姓名連到顧客詳細（帶 backto）、編號、設計師、上次消費日、性別、生日、電話、來源；黑名單整列紅字', async () => {
    const utils = setup()
    await utils.settle()
    expect(screen.getByText('共 120 筆')).toBeInTheDocument()
    const r1 = screen.getByText('amy 陳').closest('tr')
    expect(screen.getByText('amy 陳').closest('a')).toHaveAttribute('href', '/management/customers/c1/general?backto=customer-filter')
    expect(within(r1).getByLabelText('編輯客戶')).toHaveAttribute('href', '/management/customers/c1/general?backto=customer-filter')
    ;['A', 'C01', '王小美', 'Amy', '2026/10/21', '女', '79/2/28', '0912345678', '朋友介紹'].forEach(text =>
      expect(within(r1).getByText(text)).toBeInTheDocument()
    )
    expect(r1.className).toContain('text-[red]')
    const r2 = screen.getByText('林先生').closest('tr')
    expect(r2.className).not.toContain('text-[red]')
    expect(within(r2).getByText('男')).toBeInTheDocument()
  })

  it('從網址帶回條件：最後消費區間（基準日欄停用）並還原關鍵字、來店消費與所屬', async () => {
    const saved = { ...DEFAULT, keyword: '陳', customerIsCome: true, category: ['信義店'], consumptionRange: { startDate: 1000, endDate: null } }
    const utils = setup({ route: `/management/customer-filter-export?pageSetting=${encodeURIComponent(JSON.stringify(saved))}` })
    await utils.settle()
    expect(callsOf(utils.calls, 'FETCH_CUSTOMER_WITHOUT_SORTING').some(c => c.variables.input.keyword === '陳')).toBe(true)
    expect(screen.getByPlaceholderText('搜尋關鍵字')).toHaveValue('陳')
    expect(screen.getByTestId('belong')).toHaveAttribute('data-value', '["信義店"]')
    fireEvent.click(screen.getByText('篩選'))
    expect(screen.getByRole('button', { name: '有' })).toHaveAttribute('aria-pressed', 'true')
    openDialog()
    expect(screen.getByLabelText('最後消費開始日期')).toHaveAttribute('data-value', '1000')
    expect(screen.getByLabelText('最後消費開始日期')).not.toBeDisabled()
    expect(screen.getByLabelText('基準日期')).toBeDisabled()
  })

  it('從網址帶回條件：基準日（最後消費區間停用）；只有結束日也算區間；都沒有則全部可用', async () => {
    const withBase = { ...DEFAULT, baseDateRange: { baseDate: 5000, dayNumber: 30, toDate: 'GREATERTHAN' } }
    setup({ route: `/management/customer-filter-export?pageSetting=${encodeURIComponent(JSON.stringify(withBase))}` })
    openDialog()
    expect(screen.getByLabelText('基準日期')).toHaveAttribute('data-value', '5000')
    expect(screen.getByLabelText('最後消費開始日期')).toBeDisabled()
    expect(inputOf('天數')).toHaveValue(30)
    cleanup()

    const withEnd = { ...DEFAULT, consumptionRange: { endDate: 9000 } }
    setup({ route: `/management/customer-filter-export?pageSetting=${encodeURIComponent(JSON.stringify(withEnd))}` })
    openDialog()
    expect(screen.getByLabelText('最後消費結束日期')).toHaveAttribute('data-value', '9000')
    expect(screen.getByLabelText('基準日期')).toBeDisabled()
    cleanup()

    setup({ route: `/management/customer-filter-export?pageSetting=${encodeURIComponent(JSON.stringify(DEFAULT))}` })
    openDialog()
    expect(screen.getByLabelText('基準日期')).not.toBeDisabled()
    expect(screen.getByLabelText('最後消費開始日期')).not.toBeDisabled()
  })
})

describe('客資篩選匯出：查詢條件', () => {
  it('搜尋列：關鍵字（連同來店消費與所屬）、最近／偏好設計師、生日、來源送出；清除回到預設', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('篩選'))
    fireEvent.click(screen.getByRole('button', { name: '有' }))
    fireEvent.click(await screen.findByText('選所屬店家'))
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '陳' } })
    fireEvent.keyDown(screen.getByPlaceholderText('搜尋關鍵字'), { key: 'Enter' })
    await wait(() => expect(lastInput(utils.calls)).toMatchObject({ keyword: '陳', customerIsCome: true, category: ['信義店'] }))
    fireEvent.click(screen.getByText('選最近設計師編號/姓名'))
    await wait(() => expect(lastInput(utils.calls).latestDesigner).toBe('最近設計師編號/姓名-id'))
    fireEvent.click(screen.getByText('選偏好設計師編號/姓名'))
    await wait(() => expect(lastInput(utils.calls).preferDesigner).toBe('偏好設計師編號/姓名-id'))
    fireEvent.change(inputOf('民國年'), { target: { value: '79' } })
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(utils.calls).birthday).toEqual({ year: '79', month: '', day: '' }))
    choose(screen.getByLabelText('客戶來源'), '網路')
    await wait(() => expect(lastInput(utils.calls).source).toBe('網路'))
    fireEvent.click(screen.getByText('清除').closest('button'))
    await wait(() => expect(lastInput(utils.calls)).toEqual(DEFAULT))
    expect(currentLocation()).toMatch(/^\/management\/customer-filter-export/)
  })

  it('來店消費：選「無」顯示所屬；選「全部」隱藏並清空所屬；再按一次已選項目回到全部', async () => {
    const utils = setup()
    await utils.settle()
    expect(screen.queryByTestId('belong')).toBeNull()
    fireEvent.click(screen.getByText('篩選'))
    fireEvent.click(screen.getByRole('button', { name: '無' }))
    fireEvent.click(screen.getByText('選所屬店家'))
    expect(screen.getByTestId('belong')).toHaveAttribute('data-value', '["信義店"]')
    fireEvent.click(screen.getByRole('button', { name: '全部' }))
    expect(screen.queryByTestId('belong')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '有' }))
    expect(screen.getByTestId('belong')).toHaveAttribute('data-value', '[]')
    fireEvent.click(screen.getByRole('button', { name: '有' }))
    expect(screen.queryByTestId('belong')).toBeNull()
  })

  it('最後消費區間：選開始／結束日期後停用基準日，確認送出區間與來店之顧客', async () => {
    const utils = setup()
    await utils.settle()
    openDialog()
    choose(screen.getByLabelText('來店之顧客'), '無')
    fireEvent.change(screen.getByLabelText('最後消費開始日期'), { target: { value: '2026/09/01' } })
    expect(screen.getByLabelText('基準日期')).toBeDisabled()
    fireEvent.change(screen.getByLabelText('最後消費結束日期'), { target: { value: '2026/09/30' } })
    confirmDialog()
    await wait(() =>
      expect(lastInput(utils.calls)).toMatchObject({
        consumptionRange: { startDate: new Date(2026, 8, 1).getTime(), endDate: new Date(2026, 8, 30).getTime() },
        baseDateRange: null,
        customerIsCome: false,
      })
    )
    await wait(() => expect(screen.queryByText('更多篩選')).toBeNull())
  })

  it('基準日前後天數：選基準日後停用區間，選之後、天數，確認送出；清除回到未設定', async () => {
    const utils = setup()
    await utils.settle()
    openDialog()
    expect(screen.getByLabelText('之前/之後')).toBeDisabled()
    fireEvent.change(screen.getByLabelText('基準日期'), { target: { value: '2026/10/01' } })
    expect(screen.getByLabelText('最後消費開始日期')).toBeDisabled()
    choose(screen.getByLabelText('之前/之後'), '之後')
    fireEvent.wheel(inputOf('天數'))
    fireEvent.change(inputOf('天數'), { target: { value: '30' } })
    confirmDialog()
    await wait(() =>
      expect(lastInput(utils.calls)).toMatchObject({
        baseDateRange: { baseDate: new Date(2026, 9, 1).getTime(), dayNumber: 30, toDate: 'GREATERTHAN' },
        consumptionRange: null,
        customerIsCome: true,
      })
    )
    await utils.settle()
    openDialog()
    fireEvent.click(
      within(screen.getByText('更多篩選').closest('[role="dialog"]') || document.body)
        .getAllByText('清除')
        .pop()
    )
    await wait(() => expect(lastInput(utils.calls)).toMatchObject({ baseDateRange: null, consumptionRange: null }))
    expect(currentLocation()).toMatch(/^\/management\/customer-filter-export/)
  })

  it('都沒選日期按確認：只更新來店之顧客；取消不送出', async () => {
    const utils = setup()
    await utils.settle()
    openDialog()
    fireEvent.click(screen.getByText('取消'))
    await wait(() => expect(screen.queryByText('更多篩選')).toBeNull())
    openDialog()
    choose(screen.getByLabelText('來店之顧客'), '無')
    confirmDialog()
    await wait(() => expect(lastInput(utils.calls)).toMatchObject({ customerIsCome: false, baseDateRange: null, consumptionRange: null }))
  })

  it('網址同時帶區間與基準日時，確認不改日期條件', async () => {
    const both = {
      ...DEFAULT,
      consumptionRange: { startDate: 1000, endDate: 2000 },
      baseDateRange: { baseDate: 5000, dayNumber: 3, toDate: 'LESSTHAN' },
    }
    const utils = setup({ route: `/management/customer-filter-export?pageSetting=${encodeURIComponent(JSON.stringify(both))}` })
    await utils.settle()
    const before = callsOf(utils.calls, 'FETCH_CUSTOMER_WITHOUT_SORTING').length
    openDialog()
    confirmDialog()
    await utils.settle()
    expect(callsOf(utils.calls, 'FETCH_CUSTOMER_WITHOUT_SORTING')).toHaveLength(before)
  })

  it('換頁送出 pageOffset、改每頁筆數送出 pageLimit', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(lastInput(utils.calls).pageOffset).toBe(1))
    await utils.settle()
    choose(screen.getByLabelText('每頁筆數'), '1000')
    await wait(() => expect(lastInput(utils.calls).pageLimit).toBe(1000))
  })
})

describe('客資篩選匯出：匯出與刪除', () => {
  it('報表匯出：以目前條件向後端要檔案並開啟回傳的網址；沒有網址則不開啟', async () => {
    const utils = setup()
    await utils.settle()
    choose(screen.getByLabelText('黑名單篩選'), '排除黑名單')
    await utils.settle()
    fireEvent.click(screen.getByText('報表匯出'))
    await wait(() => expect(openSpy).toHaveBeenCalledWith('https://files.example.com/customers.xlsx'))
    expect(callsOf(utils.calls, 'FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL')[0].variables).toEqual({
      input: { ...DEFAULT, isUnwelcome: 'WELCOME' },
    })
    cleanup()
    openSpy.mockClear()
    const empty = setup({ fixtures: { FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL: { customersWithoutSortingExcel: null } } })
    await empty.settle()
    fireEvent.click(screen.getByText('報表匯出'))
    await empty.settle()
    expect(callsOf(empty.calls, 'FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL')).toHaveLength(1)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('店家關閉客資遮罩時停用匯出，並說明伺服器檔無法由前端遮罩', async () => {
    const utils = setup({ fixtures: { GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } } })
    await utils.settle()
    expect(screen.getByRole('alert')).toHaveTextContent('停用下載')
    expect(screen.getByRole('button', { name: '報表匯出' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '報表匯出' }))
    expect(openSpy).not.toHaveBeenCalled()
    expect(callsOf(utils.calls, 'FETCH_CUSTOMERS_WITHOUT_SORTING_EXCEL')).toHaveLength(0)
  })

  it('勾選與直接刪除（未設刪除密碼）：送出勾選的顧客 id，成功清除勾選並重新查詢', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 amy 陳'))
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    const before = callsOf(utils.calls, 'FETCH_CUSTOMER_WITHOUT_SORTING').length
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除客戶', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_CUSTOMERS')[0].variables).toEqual({ customerIds: ['c1'], password: '' })
    expect(callsOf(utils.calls, 'FETCH_CUSTOMER_WITHOUT_SORTING').length).toBeGreaterThan(before)
  })

  it('有刪除密碼：輸入密碼確認後送出；取消則關閉並清除勾選', async () => {
    const utils = setup({ fixtures: { GET_MERCHANT_PASSWORD: { merchantPassword: { deleteCustomer: { isUsing: true } } } } })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    fireEvent.change(await screen.findByTestId('delete-password'), { target: { value: '9' } })
    fireEvent.click(screen.getAllByText('取消').pop())
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    expect(screen.getByLabelText('選取 林先生')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 林先生'))
    fireEvent.click(within(toolbar()).getByText('刪除客人'))
    expect(await screen.findByTestId('delete-password')).toHaveValue('')
    fireEvent.change(screen.getByTestId('delete-password'), { target: { value: '1234' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除客戶', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_CUSTOMERS')[0].variables).toEqual({ customerIds: ['c2'], password: '1234' })
  })
})

// 保護原 md 斷點：只正規化查詢，不改共用 hook 或其他呼叫端。
describe('客資篩選匯出：全螢幕斷點', () => {
  it.each([899, 899.95, 900])('寬度 %s：fullScreen 與原 899.95px 斷點一致', async width => {
    const original = window.matchMedia
    const queries = []
    window.matchMedia = query => {
      queries.push(query)
      return { matches: query === '(max-width:899.95px)' && width <= 899.95, addEventListener() {}, removeEventListener() {} }
    }
    try {
      const utils = setup()
      await utils.settle()
      openDialog()
      const dialog = screen.getByRole('dialog', { name: '更多篩選' })
      expect(dialog.classList.contains('!inset-0')).toBe(width <= 899.95)
      expect(queries).toContain('(max-width:899.95px)')
      expect(queries.some(query => query.startsWith('@media'))).toBe(false)
    } finally {
      cleanup()
      window.matchMedia = original
    }
  })

  it('jsdom 沒有 matchMedia 時 fullScreen 為 false', async () => {
    const original = window.matchMedia
    delete window.matchMedia
    try {
      const utils = setup()
      await utils.settle()
      openDialog()
      expect(screen.getByRole('dialog', { name: '更多篩選' })).not.toHaveClass('!inset-0')
    } finally {
      cleanup()
      window.matchMedia = original
    }
  })
})
