// 保護「薪資總表/月結」：
// - 每位員工的實際匯款金額＝加項－扣項；上方「實際匯款金額合計」為全部員工加總（四捨五入）；扣項以負數顯示；
//   開啟「員工借支另列」時扣項不含員工借支、借支另成一欄（借支不重複扣）。報表匯出內容與畫面金額一致。
// - 未鎖定：全部員工都列出；全選只選在職員工（離職員工不能月結）；月結（帶入／不帶入加扣項）送出的名單與月份正確。
// - 已鎖定：加扣項皆為 0 的員工不列出、不能刪除月結、沒有月結按鈕；「取消鎖定薪資」送出所選月份。
// - 刪除月結紀錄送出所選員工與月份；狀態篩選送出 CHECKED／UNCHECKED；月結備註改動即送出該月份備註。
// - 月份以台灣時間計算（網址的 startDate，沒有時為上個月 1 日 00:00）。
// GraphQL 全由模擬 link 回應；月結／鎖定的確認對話框（openSnackbar）以 mock 驗證帶入的參數，不真的月結。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfMonth, subMonths } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import SalaryOverview from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SEPT = new Date(2026, 8, 1).getTime()
const SEPT_END = new Date(2026, 8, 30, 23, 59, 59, 999).getTime()
const ROUTE = `/salary/overview?startDate=${SEPT}&endDate=${SEPT_END}`

const user = (id, name, overrides = {}) => ({
  id,
  name,
  designerNo: `D-${id}`,
  isOnDuty: true,
  increaseItem: 0,
  decreaseItem: 0,
  increaseItemDetail: [],
  decreaseItemDetail: [],
  isSalaryChecked: false,
  ...overrides,
})

const USERS = [
  user('a', '小美', {
    increaseItem: 50000,
    decreaseItem: 3000,
    isSalaryChecked: true,
    decreaseItemDetail: [
      { itemName: '勞健保費', price: 2000, type: 'decrease' },
      { itemName: '員工借支', price: 1000, type: 'decrease' },
    ],
  }),
  user('b', '阿明', { increaseItem: 30000.6 }),
  user('c', '老王', { isOnDuty: false, increaseItem: 1000, isSalaryChecked: true }),
  user('d', '新人', { designerNo: null }),
]

const fixtures = ({ locked = false, borrow = false, users = USERS, ...rest } = {}) => ({
  GET_SALARY_USER_LIST: { getSalaryUserList: users },
  FETCH_SALARY_ITEM_LOCK: { isSalaryitemLocked: locked },
  FETCH_IS_SALARY_CHECKED: { isSalaryChacked: false },
  GET_IS_BORROW_IN_SALARY_OVERVIEW: { getIsBorrowDisplayInSalaryOverview: borrow },
  GET_LATEST_MONTLY_CHECKOUT_TIME: { merchantLatestMonthlyCheckoutTime: null },
  GET_MERCHANT_MONTHLY_CHECKOUT_REMARK: { merchantMonthlyCheckoutRemark: '九月加發獎金' },
  ...rest,
})

const setup = (options = {}, route = ROUTE) => renderPage(<SalaryOverview />, { route, fixtures: fixtures(options) })
const row = name => screen.getByText(name).closest('tr')
const cells = name => Array.from(row(name).querySelectorAll('td')).map(td => td.textContent)
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))

const realLocation = window.location
let reload
beforeEach(() => {
  loginAs()
  reload = jest.fn()
  delete window.location
  window.location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '', reload }
})
afterEach(() => {
  cleanup()
  window.location = realLocation
})

describe('薪資總表：金額', () => {
  it('實際匯款金額＝加項－扣項，合計為全部員工加總；扣項顯示為負數', async () => {
    const { settle, calls } = setup()
    await screen.findByText('共 4 筆')
    await settle()
    // 47000 + 30000.6 + 1000 + 0 = 78000.6 → 四捨五入 78,001
    expect(screen.getByText('78,001')).toBeInTheDocument()
    expect(cells('小美')).toEqual(['', '詳情', '小美', 'D-a', '50,000', '-3,000', '47,000'])
    expect(cells('阿明')).toEqual(['', '未結算', '阿明', 'D-b', '30,000.6', '0', '30,000.6'])
    expect(cells('新人')).toEqual(['', '未結算', '新人', '-', '0', '0', '0'])
    expect(within(row('老王')).getByText('(已離職)')).toBeInTheDocument()
    // 已結算的「詳情」連到該員工該月的加扣項；未結算為停用按鈕
    expect(within(row('小美')).getByText('詳情').closest('a')).toHaveAttribute('href', `/salary/edit/a?date=${SEPT}`)
    expect(within(row('阿明')).getByText('未結算').closest('button')).toBeDisabled()
    // 查詢月份＝網址的 startDate
    expect(callsOf(calls, 'GET_SALARY_USER_LIST')[0].variables).toEqual({ input: 'ALL', date: SEPT })
    expect(callsOf(calls, 'FETCH_SALARY_ITEM_LOCK')[0].variables).toEqual({ date: SEPT })
    expect(callsOf(calls, 'GET_USERS_IS_MONTH_CHECKOUT')[0].variables.input).toEqual({ MerchantId: 'merchant-1', usagelimit: 'SALARY' })
  })

  it('員工借支另列：扣項不含借支、借支另一欄（負數），實際匯款金額不變', async () => {
    setup({ borrow: true })
    await screen.findByText('共 4 筆')
    await wait(() => expect(screen.getByText('員工借支')).toBeInTheDocument())
    expect(cells('小美')).toEqual(['', '詳情', '小美', 'D-a', '50,000', '-2,000', '-1,000', '47,000'])
    // 沒有扣項的員工：借支 0
    expect(cells('阿明')).toEqual(['', '未結算', '阿明', 'D-b', '30,000.6', '0', '0', '30,000.6'])
  })

  it('報表匯出：姓名、代號、加項、扣項（負數）、實際匯款金額', async () => {
    setup()
    await screen.findByText('共 4 筆')
    const csv = exportedCsv()
    expect(csv).toContain('"姓名","代號","薪資加項","薪資扣項","實際匯款金額"')
    expect(csv).toContain('"小美","D-a","50000","-3000","47000"')
    expect(csv).toContain('"阿明","D-b","30000.6","0","30000.6"')
  })

  it('月結備註：帶入該月份備註，修改即送出該月份與內容；有月結完成時間時顯示', async () => {
    const lastCheckout = new Date(2026, 9, 2, 14, 5).getTime()
    const { calls, settle } = setup({
      GET_LATEST_MONTLY_CHECKOUT_TIME: { merchantLatestMonthlyCheckoutTime: lastCheckout },
      SET_MERCHANT_MONTHLY_CHECKOUT_REMARK: { setMerchantMonthlyCheckoutRemark: true },
    })
    await screen.findByText('共 4 筆')
    await settle()
    expect(screen.getByText('2026/09 月結備註')).toBeInTheDocument()
    expect(screen.getByText('2026/10/02 14:05')).toBeInTheDocument()
    const remark = screen.getByLabelText('月結備註')
    expect(remark).toHaveValue('九月加發獎金')
    fireEvent.change(remark, { target: { value: '九月加發獎金，十月補發' } })
    expect(remark).toHaveValue('九月加發獎金，十月補發')
    await wait(() => expect(callsOf(calls, 'SET_MERCHANT_MONTHLY_CHECKOUT_REMARK')).toHaveLength(1))
    expect(callsOf(calls, 'SET_MERCHANT_MONTHLY_CHECKOUT_REMARK')[0].variables).toEqual({ date: SEPT, remark: '九月加發獎金，十月補發' })
  })

  it('沒有備註時欄位空白；網址沒有月份時查上個月 1 日 00:00', async () => {
    const lastMonth = startOfMonth(subMonths(new Date(), 1)).getTime()
    const { calls, settle } = setup({ GET_MERCHANT_MONTHLY_CHECKOUT_REMARK: { merchantMonthlyCheckoutRemark: null } }, '/salary/overview')
    await screen.findByText('共 4 筆')
    await settle()
    expect(screen.getByLabelText('月結備註')).toHaveValue('')
    expect(callsOf(calls, 'GET_SALARY_USER_LIST')[0].variables.date).toBe(lastMonth)
    expect(callsOf(calls, 'FETCH_MONTHLY_CLOSE_STATUS')[0].variables).toEqual({ date: lastMonth })
  })

  it('查詢失敗時顯示錯誤與重新查詢，不是一直載入', async () => {
    const { settle } = renderPage(<SalaryOverview />, { route: ROUTE, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    expect(screen.getByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
  })
})

describe('薪資總表：月結（未鎖定）', () => {
  it('全選只選在職員工；月結帳單帶入加扣項，送出所選員工與月份', async () => {
    setup()
    await screen.findByText('共 4 筆')
    expect(screen.getByLabelText('選取 老王')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 小美')).toBeChecked()
    expect(screen.getByLabelText('選取 阿明')).toBeChecked()
    expect(screen.getByLabelText('選取 新人')).toBeChecked()
    expect(screen.getByLabelText('選取 老王')).not.toBeChecked()
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '月結帳單' }))
    expect(openSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        salaryCheckout: true,
        salaryCheckoutDate: SEPT,
        monthlyCheckoutInput: [[{ userId: 'a' }], [{ userId: 'b' }], [{ userId: 'd' }]],
      })
    )
    // 送出後兩個月結按鈕都停用，避免重複月結
    expect(screen.getByRole('button', { name: '月結帳單' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '月結帳單不帶入加扣項' })).toBeDisabled()
  })

  it('月結帳單不帶入加扣項：每位員工帶 isSalaryItemAutoSet: false', async () => {
    setup({ FETCH_IS_SALARY_CHECKED: { isSalaryChacked: true } })
    await screen.findByText('共 4 筆')
    fireEvent.click(screen.getByLabelText('選取 阿明'))
    fireEvent.click(screen.getByLabelText('選取 小美'))
    fireEvent.click(screen.getByLabelText('選取 阿明'))
    fireEvent.click(await screen.findByRole('button', { name: '重新月結不帶入加扣項' }))
    expect(openSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ salaryCheckout: true, monthlyCheckoutInput: [[{ userId: 'a', isSalaryItemAutoSet: false }]] })
    )
  })

  it('全部取消勾選後操作列收起；再勾選時月結名單只含新勾選的員工', async () => {
    setup()
    await screen.findByText('共 4 筆')
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('0 selected')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '月結帳單' })).toBeNull()
    fireEvent.click(screen.getByLabelText('選取 新人'))
    fireEvent.click(screen.getByRole('button', { name: '月結帳單' }))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ monthlyCheckoutInput: [[{ userId: 'd' }]] }))
  })

  // 刪除後不整頁重新整理（會丟掉狀態篩選與捲動位置）：清空勾選並重抓名單，畫面顯示刪除後的月結狀態（2026/10/28）
  it('刪除月結紀錄：送出所選員工與月份，成功後清空勾選並重抓名單，不重新整理', async () => {
    let deleted = false
    const { calls } = setup({
      DESTROY_CHECKOUT_RECORD: () => {
        deleted = true
        return { destroyUserSalaryMonthlyCheckoutRecord: true }
      },
      GET_SALARY_USER_LIST: () => ({
        getSalaryUserList: USERS.map(u => (deleted && u.id === 'a' ? { ...u, isSalaryChecked: false } : u)),
      }),
    })
    await screen.findByText('共 4 筆')
    expect(cells('小美')[1]).toBe('詳情')
    const listCalls = callsOf(calls, 'GET_SALARY_USER_LIST').length
    fireEvent.click(screen.getByLabelText('選取 小美'))
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await wait(() => expect(callsOf(calls, 'GET_SALARY_USER_LIST').length).toBeGreaterThan(listCalls))
    expect(callsOf(calls, 'DESTROY_CHECKOUT_RECORD')[0].variables).toEqual({ date: SEPT, userIds: ['a'] })
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '刪除成功', variant: 'success' }))
    await wait(() => expect(cells('小美')[1]).toBe('未結算'))
    expect(screen.getByLabelText('選取 小美')).not.toBeChecked()
    expect(reload).not.toHaveBeenCalled()
  })

  it('鎖定薪資：跳確認並帶入月份', async () => {
    setup()
    await screen.findByText('共 4 筆')
    fireEvent.click(screen.getByRole('button', { name: '鎖定薪資' }))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ salaryItemsLock: true, settingDate: SEPT }))
  })

  // B2 #14：「全選」可選名單依鎖定狀態計算（鎖定後只能選有加扣項的在職員工），原本 effect 只看名單、不看鎖定狀態。
  // 以前解鎖靠整頁 reload 掩蓋了這件事；改成重抓後，鎖定確認框按下確定（呼叫傳入的 salaryItemLockDataRefetch），全選範圍必須跟著變
  it('鎖定薪資成功後重抓鎖定狀態：按鈕變成「取消鎖定薪資」、全選只選有加扣項的在職員工，不重新整理', async () => {
    let locked = false
    setup({ FETCH_SALARY_ITEM_LOCK: () => ({ isSalaryitemLocked: locked }) })
    await screen.findByText('共 4 筆')
    expect(screen.getByText('新人')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '鎖定薪資' }))
    const { salaryItemLockDataRefetch } = openSnackbar.mock.calls.find(([arg]) => arg.salaryItemsLock)[0]
    locked = true
    act(() => {
      salaryItemLockDataRefetch()
    })
    await screen.findByRole('button', { name: '取消鎖定薪資' })
    await wait(() => expect(screen.queryByText('新人')).toBeNull())
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
  })

  it('狀態篩選送出 CHECKED／UNCHECKED', async () => {
    const { calls } = setup()
    await screen.findByText('共 4 筆')
    // 換狀態後列表重新載入（下拉會重新掛載），每次重新取得欄位
    const pick = text => {
      const select = screen.getByLabelText('狀態')
      fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
    }
    pick('已月結')
    await screen.findByText('共 4 筆')
    await wait(() => expect(callsOf(calls, 'GET_SALARY_USER_LIST').map(c => c.variables.input)).toContain('CHECKED'))
    await screen.findByLabelText('狀態')
    pick('未結算')
    await wait(() => expect(callsOf(calls, 'GET_SALARY_USER_LIST').map(c => c.variables.input)).toContain('UNCHECKED'))
  })

  it('換月份：查詢新月份並把月份寫進網址', async () => {
    const { calls } = setup()
    await screen.findByText('共 4 筆')
    fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '本月' }))
    const thisMonth = startOfMonth(new Date()).getTime()
    await wait(() => expect(callsOf(calls, 'GET_SALARY_USER_LIST').map(c => c.variables.date)).toContain(thisMonth))
    expect(currentLocation()).toBe(`/salary/overview?startDate=${thisMonth}`)
  })
})

describe('薪資總表：已鎖定', () => {
  it('加扣項皆為 0 的員工不列出；全選只含有加扣項的在職員工；不能刪除也沒有月結按鈕', async () => {
    setup({ locked: true })
    await screen.findByText('共 4 筆')
    await wait(() => expect(screen.getByRole('button', { name: '取消鎖定薪資' })).toBeInTheDocument())
    expect(screen.queryByText('新人')).toBeNull()
    expect(cells('阿明')).toEqual(['', '未結算', '阿明', 'D-b', '30,000.6', '0', '30,000.6'])
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '刪除' })).toBeDisabled()
    // 停用時說出原因與下一步（STYLE.md §6）
    expect(screen.getByText('薪資已鎖定，請先按「取消鎖定薪資」才能刪除')).toHaveAttribute('role', 'status')
    expect(screen.queryByRole('button', { name: '月結帳單' })).toBeNull()
    expect(screen.getByLabelText('選取 老王')).not.toBeChecked()
  })

  // 解鎖後不整頁重新整理：重抓鎖定狀態與名單，按鈕變回「鎖定薪資」、加扣項皆為 0 的員工重新出現（2026/10/28）
  it('取消鎖定薪資：送出所選月份，提示並重抓鎖定狀態，不重新整理', async () => {
    let unlocked = false
    const { calls } = setup({
      FETCH_SALARY_ITEM_LOCK: () => ({ isSalaryitemLocked: !unlocked }),
      SET_USER_SALARY_ITEM_UNLOCK: () => {
        unlocked = true
        return { unlockUserSalaryItem: true }
      },
    })
    await screen.findByText('共 4 筆')
    fireEvent.click(await screen.findByRole('button', { name: '取消鎖定薪資' }))
    await wait(() => expect(callsOf(calls, 'SET_USER_SALARY_ITEM_UNLOCK')).toHaveLength(1))
    expect(callsOf(calls, 'SET_USER_SALARY_ITEM_UNLOCK')[0].variables).toEqual({ date: SEPT })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '加扣項已解鎖', variant: 'warning' })
    await screen.findByRole('button', { name: '鎖定薪資' })
    await wait(() => expect(screen.getByText('新人')).toBeInTheDocument())
    expect(reload).not.toHaveBeenCalled()
  })
})
