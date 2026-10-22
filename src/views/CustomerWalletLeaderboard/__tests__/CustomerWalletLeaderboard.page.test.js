// 保護「顧客入金排行榜」：
// ① 進頁以台灣時間本月 1 日 00:00～月底 23:59:59.999、排序依據「入金儲值」、不限設計師查詢；換日期立即重查。
// ② 排序依據（入金儲值／入金使用）、設計師只改條件，按「搜尋」才查。
// ③ 區間超過 365 天：搜尋與匯出都提示「時間篩選區間不可超過一年」且不查詢；日期選擇器也收到同一個區間檢查。
// ④ 表格：名次、姓名、編號、手機、入金儲值、入金使用；沒有資料顯示「無資料」。
// ⑤ 報表匯出：以目前條件查詢，回來的網址以連結下載一次（之後畫面更新不重複下載）。
// ⑥ 查詢中顯示載入中、條件與搜尋停用；排行榜或設計師清單查詢失敗不整頁錯誤。
// 已知缺口（待 Jason 決定）：報表匯出的 Excel 由後端產生，含顧客姓名與手機，前端無法經 helper/exportCustomerMask 遮罩，需後端依遮罩設定處理。
// 日期選擇器以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端；下載連結的 click 以 spy 攔下。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { openSnackbar } from 'elements/snackbars'
import CustomerWalletLeaderboard from '..'

const mockDateProps = { value: null }
const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: props => {
    mockDateProps.value = props
    return (
      <button type="button" disabled={props.disabled} onClick={() => props.dateChange(mockNextDate.value)}>
        換日期（測試）
      </button>
    )
  },
}))
jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.setTimeout(20000)

const tw = (y, m, d, h = 0, mi = 0, s = 0, ms = 0) => Date.UTC(y, m - 1, d, h - 8, mi, s, ms)
const twMonth = () => {
  const d = new Date(Date.now() + 8 * 3600e3)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1
  return { startDate: tw(y, m, 1), endDate: tw(y, m + 1, 1) - 1 }
}
const BOARD = [
  { customerId: 'c1', customerName: '陳小美', customerPhone: '0911222333', customerNo: 'C01', walletDeposit: 30000, walletUse: 12000.5 },
  { customerId: 'c2', customerName: '王五', customerPhone: '0922333444', customerNo: 'C02', walletDeposit: 0, walletUse: 0 },
]
const USERS = [
  { userId: 'u1', userName: '王小美', userNickName: '小美', userNo: '2' },
  { userId: 'u2', userName: '李阿明', userNickName: null, userNo: '10' },
  { userId: 'u3', userName: '陳大華', userNickName: '', userNo: '' },
]
const XLSX_URL = 'https://files.example/wallet.xlsx'
const setup = (fixtures = {}, options = {}) =>
  renderPage(<CustomerWalletLeaderboard />, {
    fixtures: {
      GET_CUSTOMER_WALLET_LEADERBOARD: { customerWalletLeaderboard: BOARD },
      GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL: { customerWalletLeaderboardExcel: XLSX_URL },
      GET_USERS_ORDERABLE_LIST: { getUserOrderableList: USERS },
      ...fixtures,
    },
    ...options,
  })
const queries = calls => callsOf(calls, 'GET_CUSTOMER_WALLET_LEADERBOARD').map(c => c.variables.input)
const exports = calls => callsOf(calls, 'GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL').map(c => c.variables.input)
const openFilters = () => fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
// 設計師選單的選項（排序依據是原生 select，它的 option 不算）
const designerOptions = () => within(screen.getByRole('listbox')).queryAllByRole('option').map(o => o.textContent)
const chooseOrderType = label => {
  const select = screen.getByLabelText('排序依據')
  fireEvent.change(select, { target: { value: String([...select.options].findIndex(o => o.textContent === label)) } })
}

let anchorClick
beforeEach(() => {
  loginAs()
  mockNextDate.value = null
  anchorClick = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  anchorClick.mockRestore()
})

describe('顧客入金排行榜：查詢', () => {
  it('進頁以台灣時間本月、入金儲值、不限設計師查詢；換日期立即重查', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(queries(calls)).toEqual([{ orderType: 'DEPOSIT', designerIds: [], dateRange: twMonth() }])
    mockNextDate.value = { startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(queries(calls).pop().dateRange).toEqual({ startDate: tw(2026, 9, 1), endDate: tw(2026, 9, 30, 23, 59, 59, 999) })
  })

  it('排序依據、設計師只改條件，按「搜尋」才查', async () => {
    const { calls, settle } = setup()
    await settle()
    openFilters()
    chooseOrderType('入金使用')
    fireEvent.click(inputOf('設計師篩選'))
    fireEvent.click(screen.getByRole('option', { name: '李阿明 - 10' }))
    fireEvent.click(screen.getByRole('option', { name: '陳大華' }))
    fireEvent.click(screen.getByRole('option', { name: '小美 - 2' }))
    // 已選的設計師以暱稱（沒有或空白暱稱用姓名）顯示
    expect(screen.getByRole('button', { name: '移除 陳大華' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移除 李阿明' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移除 小美' })).toBeInTheDocument()
    await settle()
    expect(queries(calls)).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(queries(calls).pop()).toEqual({ orderType: 'USE', designerIds: ['u2', 'u3', 'u1'], dateRange: twMonth() })
  })

  it('設計師清單查詢失敗不整頁錯誤，設計師選單沒有選項、排行榜照常', async () => {
    const { settle } = setup({ GET_USERS_ORDERABLE_LIST: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    openFilters()
    fireEvent.click(inputOf('設計師篩選'))
    expect(designerOptions()).toEqual([])
    expect(screen.getByText('陳小美')).toBeInTheDocument()
  })

  it('設計師選項：暱稱（沒有用姓名）＋編號，依編號完全相同、暱稱或姓名搜尋', async () => {
    const { settle } = setup()
    await settle()
    openFilters()
    fireEvent.click(inputOf('設計師篩選'))
    expect(designerOptions()).toEqual(['小美 - 2', '李阿明 - 10', '陳大華'])
    fireEvent.change(inputOf('設計師篩選'), { target: { value: '1' } })
    expect(designerOptions()).toHaveLength(0)
    fireEvent.change(inputOf('設計師篩選'), { target: { value: '10' } })
    expect(designerOptions()).toEqual(['李阿明 - 10'])
    fireEvent.change(inputOf('設計師篩選'), { target: { value: '小美' } })
    expect(designerOptions()).toEqual(['小美 - 2'])
    fireEvent.change(inputOf('設計師篩選'), { target: { value: '大華' } })
    expect(designerOptions()).toEqual(['陳大華'])
    fireEvent.change(inputOf('設計師篩選'), { target: { value: '  ' } })
    expect(designerOptions()).toHaveLength(3)
  })

  it('區間超過 365 天：搜尋與匯出都提示且不查詢；日期選擇器收到相同的區間檢查', async () => {
    const { calls, settle } = setup()
    await settle()
    const { rangelimit } = mockDateProps.value
    expect(rangelimit({ startDate: tw(2025, 1, 1), endDate: tw(2026, 1, 1) })).toBe(false)
    expect(rangelimit({ startDate: tw(2025, 1, 1), endDate: tw(2026, 1, 2) })).toBe(true)
    mockNextDate.value = { startDate: tw(2025, 1, 1), endDate: tw(2026, 1, 2, 12) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(queries(calls)).toHaveLength(1)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '時間篩選區間不可超過一年', variant: 'error' })
    fireEvent.click(screen.getByRole('button', { name: /報表匯出/ }))
    await settle()
    expect(exports(calls)).toHaveLength(0)
    expect(openSnackbar).toHaveBeenCalledTimes(2)
  })
})

describe('顧客入金排行榜：表格與匯出', () => {
  it('表格：名次、姓名、編號、手機、入金儲值、入金使用', async () => {
    const { settle } = setup()
    await settle()
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map(r => within(r).getAllByRole('cell').map(c => c.textContent))).toEqual([
      ['1', '陳小美', 'C01', '0911222333', '30,000', '12,000.5'],
      ['2', '王五', 'C02', '0922333444', '0', '0'],
    ])
  })

  it('沒有資料顯示「無資料」', async () => {
    const { settle } = setup({ GET_CUSTOMER_WALLET_LEADERBOARD: { customerWalletLeaderboard: [] } })
    await settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('報表匯出以目前條件查詢，回來的網址下載一次（之後畫面更新不重複下載）', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /報表匯出/ }))
    await settle()
    expect(exports(calls)).toEqual([{ orderType: 'DEPOSIT', designerIds: [], dateRange: twMonth() }])
    expect(anchorClick).toHaveBeenCalledTimes(1)
    expect(anchorClick.mock.instances[0].href).toBe(XLSX_URL)
    openFilters()
    chooseOrderType('入金使用')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(queries(calls).pop().orderType).toBe('USE')
    expect(anchorClick).toHaveBeenCalledTimes(1)
  })

  it('查詢中顯示載入中、條件與搜尋停用；查詢失敗不整頁錯誤', async () => {
    const { settle } = setup({ GET_CUSTOMER_WALLET_LEADERBOARD: new Error('壞了') }, { delays: { GET_CUSTOMER_WALLET_LEADERBOARD: 50 } })
    await wait(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    expect(screen.getByText('換日期（測試）')).toBeDisabled()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeDisabled()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    await wait(() => expect(screen.getByRole('button', { name: '搜尋' })).not.toBeDisabled())
  })
})
