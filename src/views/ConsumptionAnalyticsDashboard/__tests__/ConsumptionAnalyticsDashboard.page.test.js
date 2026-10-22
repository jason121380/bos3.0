// 保護「消費分析儀表板」整頁：
// ① 查詢條件：預設台灣時間本月 1 日 00:00～月底 23:59:59.999、虛業績、總和業績、不限設計師（網址的日期由日期選擇器帶入，見 DateSelector 測試）；
//    換日期立即重查；虛／實業績、總和／平均、設計師篩選只改條件，按「搜尋」才查；區間超過一年提示不查。
// ② 「虛／實業績」切換依參數設定 getIsDisplayTogglePerformanceButton：true 隱藏、false 或查詢失敗顯示（與其他報表同一慣例）。
// ③ 設計師篩選：選項依編號排序（見 employeeNoSort.test.js），以暱稱（沒有暱稱用姓名）＋編號顯示，可依編號（完全相同）、暱稱、姓名搜尋。
// ④ 後端資料轉成各圖表的資料：性別三項、回流率三項、排行榜只取前 10 名、星期轉中文（不認得的星期留空）、
//    業績趨勢以台灣時間的月份命名，依「設計師／總和」與篩選的業績項目加總；全部為 0 的性別／年齡／星期圖顯示無資料。
// ⑤ 視窗寬度改變時圖表跟著調整，離開頁面移除監聽；查詢中顯示骨架；查詢失敗不整頁錯誤。
// recharts、日期選擇器以替身代替；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { openSnackbar } from 'elements/snackbars'
import ConsumptionAnalyticsDashboard from '..'

const mockCharts = []
jest.mock('recharts', () => {
  const R = require('react')
  const make = name => props => {
    mockCharts.push({ name, props })
    return R.createElement('div', { 'data-recharts': name }, props.children)
  }
  return Object.fromEntries(
    ['ResponsiveContainer', 'PieChart', 'Pie', 'Cell', 'Tooltip', 'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'BarChart', 'Bar', 'LabelList'].map(n => [n, make(n)])
  )
})
const mockNextDate = { value: null }
jest.mock('components/DateSelector', () => ({
  __esModule: true,
  default: ({ date, dateChange, disabled }) => (
    <button type="button" disabled={disabled} data-start={date.startDate} data-end={date.endDate} onClick={() => dateChange(mockNextDate.value)}>
      換日期（測試）
    </button>
  ),
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
const ratio = (m, f, u) => ({ male: { count: m, percentage: m * 10 }, female: { count: f, percentage: f * 10 }, unknown: { count: u, percentage: u * 10 } })
const customer = i => ({ name: `顧客${i}`, cellphone: `09000000${String(i).padStart(2, '0')}`, orderCount: 20 - i, totalPrice: 1000 * (20 - i), pricePerCount: 1000 })
const detail = (service, product, ticketSell, ticketUse, membership) => ({ service, product, ticketSell, ticketUse, membership })
const DASH = {
  orderCustomer: {
    orderGenderRatio: ratio(4, 5, 1),
    orderAgeDistribution: [
      { sorting: 1, ageRange: '20-29', count: 3, percentage: 30 },
      { sorting: 2, ageRange: '30-39', count: 7, percentage: 70 },
    ],
    customerConsumptionRanking: {
      customerConsumptionCountRanking: Array.from({ length: 12 }, (_, i) => customer(i + 1)),
      customerConsumptionPriceRanking: [customer(1)],
      customerConsumptionPricePerCountRanking: [customer(2)],
    },
    sourceRatio: [{ name: 'LINE', count: 3, percentage: 75 }, { name: '路過', count: 1, percentage: 25 }],
    returnedRatio: { new: { count: 2, percentage: 20 }, retented: { count: 5, percentage: 50 }, unReturned: { count: 3, percentage: 30 } },
    newCusStatistics: [{ newCusTotalCount: 2, newCusPercentage: 100, designer: { id: 'u1', name: '小美' }, newCusGenderRatio: ratio(1, 1, 0) }],
  },
  weeklyOrderCountRanking: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'HOLIDAY'].map((week, i) => ({
    sorting: i, week, orderCount: i, pricePerCount: 100 * i,
  })),
  productSalesRanking: {
    productSalesVolumeRanking: [{ name: '洗髮精', categoryName: '洗護', count: 30, price: 9000 }],
    productSalesPriceRanking: [{ name: '護髮乳', categoryName: '洗護', count: 10, price: 12000 }],
  },
  performanceTrend: [
    {
      // 台灣時間 9/1 00:00（UTC 還是 8/31）
      date: tw(2026, 9, 1),
      performances: [
        { userName: '小美', performance: 0, performanceDetail: detail(100, 20, 3, 4, 5) },
        { userName: '阿明', performance: 0, performanceDetail: detail(50, 0, 0, 0, 0) },
      ],
    },
    { date: tw(2026, 10, 1), performances: [{ userName: '小美', performance: 0, performanceDetail: detail(200, 0, 0, 0, 1) }] },
  ],
}
const USERS = [
  { userId: 'u1', userName: '王小美', userNickName: '小美', userNo: '2' },
  { userId: 'u2', userName: '李阿明', userNickName: null, userNo: '10' },
  { userId: 'u3', userName: '陳大華', userNickName: ' ', userNo: null },
]
const setup = (fixtures = {}, options = {}) =>
  renderPage(<ConsumptionAnalyticsDashboard />, {
    fixtures: {
      GET_CONSUMPTION_ANALYTICS_DASHDOARD: { consumptionAnalyticsDashboard: DASH },
      GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: { getIsDisplayTogglePerformanceButton: false },
      GET_USERS_ORDERABLE_LIST: { getUserOrderableList: USERS },
      ...fixtures,
    },
    ...options,
  })
const queries = calls => callsOf(calls, 'GET_CONSUMPTION_ANALYTICS_DASHDOARD').map(c => c.variables.input)
const lastProps = name => [...mockCharts].reverse().find(c => c.name === name).props
const openFilters = () => fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
const designerInput = () => screen.getByText('設計師篩選', { selector: 'label' }).parentElement.querySelector('input')
const cardOf = title => screen.getByText(title).closest('.min-w-0')

beforeEach(() => {
  loginAs()
  mockCharts.length = 0
  mockNextDate.value = null
})
afterEach(cleanup)

describe('消費分析儀表板：查詢條件', () => {
  it('預設查台灣時間本月、虛業績、總和、不限設計師；換日期立即重查', async () => {
    const { calls, settle } = setup()
    await settle()
    const expected = { dateRange: twMonth(), designerIds: [], displayReference: 'FAKE', resultDisplayMode: 'SUM' }
    expect(queries(calls)[0]).toEqual(expected)
    expect(queries(calls).pop()).toEqual(expected)
    mockNextDate.value = { startDate: tw(2026, 1, 1), endDate: tw(2026, 3, 31, 23, 59, 59, 999) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(queries(calls).pop().dateRange).toEqual({ startDate: tw(2026, 1, 1), endDate: tw(2026, 3, 31, 23, 59, 59, 999) })
  })

  it('區間超過一年：提示且不查詢', async () => {
    const { calls, settle } = setup()
    await settle()
    const count = queries(calls).length
    mockNextDate.value = { startDate: tw(2025, 1, 1), endDate: tw(2026, 1, 3) }
    fireEvent.click(screen.getByText('換日期（測試）'))
    await settle()
    expect(queries(calls)).toHaveLength(count)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '時間區間不得超過一年', variant: 'warning' })
  })

  it('虛／實業績、總和／平均、設計師只改條件，按「搜尋」才以新條件查詢；再按已選的不變', async () => {
    const { calls, settle } = setup()
    await settle()
    const count = queries(calls).length
    openFilters()
    fireEvent.click(screen.getByRole('button', { name: '實業績' }))
    fireEvent.click(screen.getByRole('button', { name: '實業績' }))
    fireEvent.click(screen.getByRole('button', { name: '平均業績' }))
    fireEvent.click(screen.getByRole('button', { name: '平均業績' }))
    fireEvent.click(designerInput())
    fireEvent.click(screen.getByRole('option', { name: '李阿明 - 10' }))
    fireEvent.click(screen.getByRole('option', { name: '小美 - 2' }))
    await settle()
    expect(queries(calls)).toHaveLength(count)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(queries(calls).pop()).toEqual({
      dateRange: twMonth(), designerIds: ['u2', 'u1'], displayReference: 'TRUTH', resultDisplayMode: 'AVERAGE',
    })
  })

  it('設計師選項：暱稱（沒有用姓名）＋編號，依編號完全相同、暱稱或姓名搜尋', async () => {
    const { settle } = setup()
    await settle()
    openFilters()
    fireEvent.click(designerInput())
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['小美 - 2', '李阿明 - 10', '陳大華'])
    fireEvent.change(designerInput(), { target: { value: '1' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    fireEvent.change(designerInput(), { target: { value: '10' } })
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['李阿明 - 10'])
    fireEvent.change(designerInput(), { target: { value: '小美' } })
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['小美 - 2'])
    fireEvent.change(designerInput(), { target: { value: '大華' } })
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['陳大華'])
    fireEvent.change(designerInput(), { target: { value: '   ' } })
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it.each([
    ['設定為 true：隱藏虛／實業績切換', { getIsDisplayTogglePerformanceButton: true }, false],
    ['設定為 false：顯示虛／實業績切換', { getIsDisplayTogglePerformanceButton: false }, true],
    ['設定查詢失敗：顯示虛／實業績切換', new Error('壞了'), true],
  ])('%s', async (_, fixture, shown) => {
    const { settle } = setup({ GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON: fixture })
    await settle()
    expect(!!screen.queryByText('實業績')).toBe(shown)
  })
})

describe('消費分析儀表板：圖表資料', () => {
  it('性別、年齡、回流率、來源、新客、排行榜（前 10 名）、星期中文', async () => {
    const { settle } = setup()
    await settle()
    expect(within(cardOf('消費者性別比例')).getByText('女 5單 50%')).toBeInTheDocument()
    expect(within(cardOf('消費者年齡分佈')).getByText('30-39 (7人 70%)')).toBeInTheDocument()
    expect(within(cardOf('顧客回流率')).getAllByText(/單/).map(e => e.textContent)).toEqual(['新客  2單  20%', '回流客  5單  50%', '未回流  3單  30%'])
    expect(within(cardOf('顧客來源比例')).getByText('LINE 3單 75%')).toBeInTheDocument()
    expect(within(cardOf('新客比例')).getByText('小美 2人 100%')).toBeInTheDocument()
    const countRows = within(cardOf('消費總次數排行')).getAllByRole('row').slice(1)
    expect(countRows).toHaveLength(10)
    expect(within(countRows[9]).getByText('顧客10')).toBeInTheDocument()
    expect(within(cardOf('消費總金額排行')).getByText('顧客1')).toBeInTheDocument()
    expect(within(cardOf('消費客單價排行')).getByText('顧客2')).toBeInTheDocument()
    expect(within(cardOf('商品銷售數量排行')).getByText('洗髮精')).toBeInTheDocument()
    expect(within(cardOf('商品銷售金額排行')).getByText('護髮乳')).toBeInTheDocument()
    // 星期轉中文，只取前 10 筆；不認得的星期留空
    expect(lastProps('BarChart').data.map(d => d.name)).toEqual(['(一)', '(二)', '(三)', '(四)', '(五)', '(六)', '(日)', undefined])
  })

  it('業績趨勢：台灣時間月份；設計師逐人加總，總和合併全店；篩選業績項目後重算', async () => {
    const { settle } = setup()
    await settle()
    expect(lastProps('LineChart').data).toEqual([
      { name: '9月', 小美: 132, 阿明: 50 },
      { name: '10月', 小美: 201 },
    ])
    fireEvent.click(screen.getByRole('button', { name: '總和' }))
    await wait(() => expect(lastProps('LineChart').data).toEqual([
      { name: '9月', 全店: 182 },
      { name: '10月', 全店: 201 },
    ]))
    // 取消「項目消費」
    fireEvent.click(screen.getByRole('button', { name: /項目消費/ }))
    fireEvent.click(within(screen.getByRole('listbox')).getByText('項目消費'))
    await wait(() => expect(lastProps('LineChart').data).toEqual([
      { name: '9月', 全店: 32 },
      { name: '10月', 全店: 1 },
    ]))
  })

  it('性別、年齡、星期全部為 0 時顯示無資料', async () => {
    const empty = {
      ...DASH,
      orderCustomer: { ...DASH.orderCustomer, orderGenderRatio: ratio(0, 0, 0), orderAgeDistribution: [{ sorting: 1, ageRange: '20-29', count: 0, percentage: 0 }] },
      weeklyOrderCountRanking: [{ sorting: 1, week: 'MONDAY', orderCount: 0, pricePerCount: 0 }],
    }
    const { settle } = setup({ GET_CONSUMPTION_ANALYTICS_DASHDOARD: { consumptionAnalyticsDashboard: empty } })
    await settle()
    expect(within(cardOf('消費者性別比例')).getByText('無資料')).toBeInTheDocument()
    expect(within(cardOf('消費者年齡分佈')).getByText('無資料')).toBeInTheDocument()
    expect(within(cardOf('週間來客數排行')).getByText('無資料')).toBeInTheDocument()
  })

  it('視窗寬度改變時圖表跟著調整；離開頁面移除監聽', async () => {
    const { settle, unmount } = setup()
    await settle()
    const original = window.innerWidth
    window.innerWidth = 1500
    fireEvent(window, new Event('resize'))
    await wait(() => expect(lastProps('Pie').outerRadius).toBe(120))
    window.innerWidth = 1000
    fireEvent(window, new Event('resize'))
    await wait(() => expect(lastProps('Pie').outerRadius).toBe(90))
    const remove = jest.spyOn(window, 'removeEventListener')
    unmount()
    await wait(() => expect(remove).toHaveBeenCalledWith('resize', expect.any(Function)))
    remove.mockRestore()
    window.innerWidth = original
  })

  it('查詢中顯示骨架、條件停用；查詢失敗不整頁錯誤，圖表顯示無資料', async () => {
    const { settle } = setup({ GET_CONSUMPTION_ANALYTICS_DASHDOARD: new Error('壞了') }, { delays: { GET_CONSUMPTION_ANALYTICS_DASHDOARD: 50 } })
    await wait(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    expect(screen.getByText('換日期（測試）')).toBeDisabled()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeDisabled()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無資料').length).toBeGreaterThan(5)
  })
})
