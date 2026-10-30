// 保護「員工資料」的紀錄類分頁：
// - 帳單紀錄：以員工 id 查帳單；金額四捨五入加千分位，業績合計＝服務＋店販＋卡券使用＋會員卡；有活動券才顯示活動券欄、
//   會員卡啟用或有會員卡業績才顯示會員卡欄、紅利啟用或有點數折抵才顯示折抵欄；分頁在畫面上切片，每頁筆數改變回到第一頁。
// - 打卡紀錄：以員工 id 與分頁查詢；時間、日期（台灣時間）與 Google 地圖連結；換頁、每頁筆數送出的參數。
// - 抽成報表：以員工 id 與日期區間查詢（預設今天 00:00～23:59:59.999，網址帶區間時沿用）；各列為服務＋卡券金額四捨五入；
//   會員卡欄位在會員卡啟用或有會員卡數字時才顯示；沒有資料顯示「無資料」。
// GraphQL 全由模擬 link 回應，不連後端。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { renderDetail, EMP_ID } from './employeeDetailKit.test'

jest.setTimeout(20000)

const at = (d, h, m, s = 0) => new Date(2026, 9, d, h, m, s).getTime()
const order = (id, overrides = {}) => ({
  id,
  orderNo: `A${id}`,
  date: at(19, 14, 30), // 2026/10/19 週一
  isDesignate: true,
  customerName: '陳小姐',
  customerCellphone: '0912345678',
  designerName: '王小美',
  designerNo: '07',
  otherPayName: '',
  service: 1200.4,
  product: 300.6,
  membership: 0,
  usedTicket: 500,
  ticketSellIntoPerformance: 0,
  ticketSellNotIntoPerformance: 0,
  otherPayWayForDecount: 0,
  walletUsedForDecount: 0,
  bonusDecountForReport: 0,
  businessCash: 1501,
  remark: '',
  raffleCount: 0,
  TPTName: { service: [], product: [], membership: [], overAll: [] },
  ...overrides,
})

const orderFixtures = ({ orders, summary = {}, bonus = false, member = false }) => ({
  GET_ORDER_LIST_FOR_DETAIL: { getOrderList: { intervalSummary: { membership: 0, bonusDecountForReport: 0, ...summary }, orderList: orders } },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonus },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: member },
})
const headers = () => screen.getAllByRole('columnheader').map(th => th.textContent)
const rowOf = no => Array.from(screen.getByText(`#${no}`).closest('tr').querySelectorAll('td')).map(td => td.textContent)
const choose = (select, text) =>
  fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('帳單紀錄', () => {
  it('以員工 id 查詢；金額、週幾、業績合計（服務＋店販＋卡券使用＋會員卡）', async () => {
    const orders = [
      order('1'),
      // 週二～週六
      ...[20, 21, 22, 23, 24].map(d => order(`w${d}`, { date: at(d, 10, 0) })),
      order('2', {
        date: at(25, 9, 0), // 週日
        isDesignate: false,
        designerNo: null,
        membership: 2000,
        TPTName: { service: ['A卡', 'B卡'], product: ['C卡'], membership: ['D卡'], overAll: [] },
        otherPayName: 'LINE Pay',
        otherPayWayForDecount: 100,
        remark: '熟客',
      }),
    ]
    const { calls } = renderDetail('orderRecord', { fixtures: orderFixtures({ orders }) })
    await screen.findByText('#A1')
    expect(callsOf(calls, 'GET_ORDER_LIST_FOR_DETAIL')[0].variables).toEqual({ input: { designerId: EMP_ID } })
    expect(screen.getByText('共 7 筆, 1 / 1')).toBeInTheDocument()
    expect(['w20', 'w21', 'w22', 'w23', 'w24'].map(no => rowOf(`A${no}`)[1].slice(-3))).toEqual(['(二)', '(三)', '(四)', '(五)', '(六)'])
    // 會員卡未啟用但有會員卡業績（intervalSummary.membership 為 0）→ 不顯示會員卡欄；紅利未啟用且無折抵 → 不顯示
    expect(headers()).not.toContain('會員卡消費')
    expect(headers()).not.toContain('點數折抵金額')
    expect(headers()).not.toContain('活動券')
    expect(rowOf('A1')).toEqual([
      '詳情', '#A12026/10/19/(一)', '陳小姐0912345678', '王小美/07', 'Y',
      '1,200', '301', '0', '0', '0', '0', '2,001', '1,501', '',
    ])
    expect(rowOf('A2')).toEqual([
      '詳情', '#A22026/10/25/(日)', '陳小姐0912345678', '王小美', 'N',
      '1,200含 A卡, 含 B卡', '301含 C卡', '0', '0', '0', '100LINE Pay', '4,001', '1,501', '熟客',
    ])
    expect(screen.getAllByText('詳情')[0].closest('a')).toHaveAttribute('href', '/order/1')
  })

  it('會員卡啟用、紅利啟用、有活動券時顯示對應欄位', async () => {
    const orders = [order('1', { raffleCount: 2, membership: 999.5, bonusDecountForReport: 50, TPTName: { service: [], product: [], membership: ['D卡'], overAll: [] } })]
    renderDetail('orderRecord', { fixtures: orderFixtures({ orders, member: true, bonus: true }) })
    await screen.findByText('#A1')
    await wait(() => expect(headers()).toContain('活動券'))
    expect(headers()).toContain('會員卡消費')
    expect(headers()).toContain('點數折抵金額')
    const cells = rowOf('A1')
    expect(cells).toContain('2')
    expect(cells).toContain('1,000含 D卡')
    expect(cells).toContain('50')
  })

  it('會員卡未啟用但期間有會員卡業績、紅利未啟用但有點數折抵時仍顯示', async () => {
    renderDetail('orderRecord', {
      fixtures: orderFixtures({ orders: [order('1')], summary: { membership: 100, bonusDecountForReport: 30 } }),
    })
    await screen.findByText('#A1')
    await wait(() => expect(headers()).toContain('會員卡消費'))
    expect(headers()).toContain('點數折抵金額')
  })

  it('每頁筆數改為 5：只顯示前 5 筆，下一頁顯示其餘並重新查詢', async () => {
    const orders = Array.from({ length: 7 }, (_, i) => order(String(i + 1)))
    const { calls } = renderDetail('orderRecord', { fixtures: orderFixtures({ orders }) })
    await screen.findByText('#A7')
    choose(screen.getByLabelText('每頁筆數'), '5')
    await wait(() => expect(screen.queryByText('#A6')).toBeNull())
    expect(screen.getByText('共 7 筆, 1 / 2')).toBeInTheDocument()
    const before = callsOf(calls, 'GET_ORDER_LIST_FOR_DETAIL').length
    fireEvent.click(screen.getByLabelText('下一頁'))
    await screen.findByText('#A6')
    expect(screen.queryByText('#A1')).toBeNull()
    expect(screen.getByText('共 7 筆, 2 / 2')).toBeInTheDocument()
    expect(callsOf(calls, 'GET_ORDER_LIST_FOR_DETAIL').length).toBeGreaterThan(before)
  })

  it('查詢中顯示載入骨架', async () => {
    renderDetail('orderRecord', { fixtures: orderFixtures({ orders: [order('1')] }), delays: { GET_ORDER_LIST_FOR_DETAIL: 1000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByText('#A1')).toBeInTheDocument()
  })
})

describe('打卡紀錄', () => {
  const attendance = v => ({
    user: {
      id: EMP_ID,
      name: '王小美',
      attendanceRecords: {
        pageLimit: v.allAttendanceInput.pageLimit,
        pageOffset: v.allAttendanceInput.pageOffset,
        totalCount: 120,
        records: [
          { latitude: 25.03, longitude: 121.56, checkinDateTime: at(21, 9, 2, 5) },
          { latitude: 25.04, longitude: 121.57, checkinDateTime: at(21, 18, 30, 0) },
        ],
      },
    },
  })

  it('以員工 id 與分頁查詢；顯示時間、日期與地圖連結；換頁、每頁筆數送出新參數', async () => {
    const { calls } = renderDetail('AttendanceRecord', { fixtures: { FETCH_USER_ATTENDANCE: attendance } })
    await screen.findByText('09:02:05')
    expect(callsOf(calls, 'FETCH_USER_ATTENDANCE')[0].variables).toEqual({
      userInput: { id: EMP_ID },
      allAttendanceInput: { pageLimit: 50, pageOffset: 0 },
    })
    expect(screen.getAllByText('2026/10/21')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: '地點' })[0]).toHaveAttribute('href', 'https://www.google.com/maps?q=25.03,121.56')
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() =>
      expect(callsOf(calls, 'FETCH_USER_ATTENDANCE').map(c => c.variables.allAttendanceInput)).toContainEqual({ pageLimit: 50, pageOffset: 1 })
    )
    await screen.findByText('09:02:05')
    choose(screen.getByLabelText('每頁筆數'), '10')
    await wait(() =>
      expect(callsOf(calls, 'FETCH_USER_ATTENDANCE').map(c => c.variables.allAttendanceInput)).toContainEqual({ pageLimit: 10, pageOffset: 0 })
    )
  })
})

describe('抽成報表', () => {
  const analytics = (overrides = {}) => ({
    servicePerformanceFakeTotal: 10000.4,
    ticketUsagePerformanceFakeTotal: 2000.4,
    serviceThirdPartHandlingFeeOnSales: 100.6,
    ticketThirdPartHandlingFeeOnSales: 20.4,
    servicePerformanceDecountItem: 50,
    ticketPerformanceDecountItem: 10,
    truthPerformanceWithoutHelper: 11820.3,
    servicePerformanceDesignateTruthTotalBeforeHelperDecount: 8000,
    ticketDesignateTruthBeforeHelperDecount: 1000,
    servicePerformanceNonDesignateTruthTotalBeforeHelperDecount: 1800,
    ticketNonDesignateTruthBeforeHelperDecount: 1020,
    servicePerformanceDecountHelperUsagePrice: 300,
    ticketPerformanceDecountHelperUsage: 0,
    servicePerformanceTruthTotal: 9500,
    ticketUsagePerformanceTruthTotal: 2020,
    servicePerformanceDesignateTruthTotal: 7700,
    ticketUsagePerformanceDesignateTruthTotal: 1000,
    servicePerformanceNonDesignateTruthTotal: 1800,
    ticketUsagePerformanceNonDesignateTruthTotal: 1020,
    servicePerformanceRake: 3800,
    ticketPerformanceRake: 808,
    servicePerformanceDesignateRake: 3080,
    ticketPerformanceDesignateRake: 400,
    servicePerformanceNonDesignateRake: 720,
    ticketPerformanceNonDesignateRake: 408,
    specialRake: 12.5,
    serviceThirdPartHandlingFeeOnSalary: 30,
    ticketThirdPartHandlingFeeOnSalary: 5,
    serviceSalaryDecountItem: 15,
    ticketSalaryDecountItem: 5,
    serviceSalaryDecountHelperUsagePrice: 100.2,
    ticketSalaryDecountHelperUsagePrice: 0.4,
    serviceSalaryShouldBePaid: 3655.3,
    ticketSalaryShouldBePaid: 798.4,
    productPerformanceFakeTotal: 3000,
    productThirdPartHandlingFeeOnSales: 30,
    productPerformanceTruthTotal: 2970,
    productRakeByCost: 100,
    productRakeByFixed: 50.4,
    productRakeByPrice: 49.4,
    productThirdPartHandlingFeeOnSalary: 3,
    membershipPerformanceFakeTotal: 0,
    membershipThirdPartHandlingFeeOnSales: 0,
    membershipPerformanceTruthTotal: 0,
    membershipRakeByCost: 0,
    membershipRakeByFixed: 0,
    membershipRakeByPrice: 0,
    membershipThirdPartHandlingFeeOnSalary: 0,
    helperRetrievePriceNoPoint: 200,
    helperRetrievePoint: 12.6,
    helperRetrievePriceOnlyPoint: 126,
    helperPointPaid: 5,
    helperPricePaid: 50,
    walletDepositHandlingFeeByDesigner: 8,
    totalSalaryShouldBePaid: 4700.6,
    ...overrides,
  })
  const report = (overrides, user = {}) => ({
    FETCH_DESIGNER_RAKE_REPORT: {
      userRakeReport: [{ user: { id: EMP_ID, name: '王小美', nickName: 'Amy', designerNo: '07', ...user }, salesAnalytics: analytics(overrides) }],
    },
  })
  const value = label => screen.getAllByText(label)[0].closest('tr').querySelectorAll('td')[1].textContent

  afterEach(() => window.history.replaceState(null, '', '/'))

  it('預設查今天；各列金額為服務＋卡券四捨五入；會員卡未啟用且無會員卡數字時不顯示會員卡欄位', async () => {
    const { calls } = renderDetail('rakeReport', {
      fixtures: { ...report(), GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false } },
    })
    await screen.findByText('總應領薪資')
    expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')[0].variables).toEqual({
      input: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      designerIds: [EMP_ID],
    })
    expect(screen.getByText('07 Amy 王小美')).toBeInTheDocument()
    expect(value('服務虛業績')).toBe('12001')
    expect(value('扣業績 - 付款手續費')).toBe('121')
    expect(value('扣業績 - 扣項')).toBe('60')
    expect(value('服務實業績')).toBe('11820')
    expect(value('實業績 - 指定')).toBe('9000')
    expect(value('實業績 - 不指定')).toBe('2820')
    expect(value('扣業績 - 使用互助')).toBe('300')
    expect(value('服務實業績 扣使用互助')).toBe('11520')
    expect(value('指定(實) - 扣互助')).toBe('8700')
    expect(value('不指定(實) - 扣互助')).toBe('2820')
    expect(value('服務換算抽成')).toBe('4608')
    expect(value('指定抽成')).toBe('3480')
    expect(value('不指定抽成')).toBe('1128')
    expect(value('特殊抽成')).toBe('13')
    expect(value('扣薪水 - 付款手續費')).toBe('35')
    expect(value('扣薪水 - 扣項')).toBe('20')
    expect(value('扣薪水 - 使用互助')).toBe('101')
    expect(value('服務應領金額')).toBe('4454')
    expect(value('店販業績')).toBe('3000')
    expect(value('店販抽成')).toBe('200')
    expect(value('互助獲得 - 點數/換算金額')).toBe('13/126')
    expect(value('總應領薪資')).toBe('4701')
    expect(screen.queryByText('會員卡業績')).toBeNull()
  })

  it.each([
    ['會員卡啟用', {}, true],
    ['有會員卡業績', { membershipPerformanceFakeTotal: 1000 }, false],
    ['有會員卡手續費', { membershipThirdPartHandlingFeeOnSales: 10 }, false],
    ['有會員卡實業績', { membershipPerformanceTruthTotal: 990 }, false],
    ['有會員卡抽成', { membershipRakeByCost: 40, membershipRakeByFixed: 30, membershipRakeByPrice: 30.4 }, false],
  ])('%s時顯示會員卡欄位', async (_name, overrides, active) => {
    renderDetail('rakeReport', { fixtures: { ...report(overrides), GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active } } })
    await screen.findByText('總應領薪資')
    await wait(() => expect(screen.getByText('會員卡業績')).toBeInTheDocument())
    expect(screen.getByText('會員卡抽成')).toBeInTheDocument()
  })

  it('沒有編號與暱稱時標題只有姓名；沒有資料時顯示無資料', async () => {
    renderDetail('rakeReport', { fixtures: report({}, { designerNo: null, nickName: '' }) })
    await screen.findByText('總應領薪資')
    expect(screen.getByText('王小美', { selector: '.MuiTypography-root, span, div' })).toBeInTheDocument()
    cleanup()
    renderDetail('rakeReport', { fixtures: { FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: [] } } })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })

  it('網址帶日期區間時沿用；換成昨天後以新區間查詢', async () => {
    const start = new Date(2026, 9, 1).getTime()
    const end = endOfDay(new Date(2026, 9, 15)).getTime()
    window.history.replaceState(null, '', `/?startDate=${start}&endDate=${end}`)
    const { calls } = renderDetail('rakeReport', { fixtures: report() })
    await screen.findByText('總應領薪資')
    expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')[0].variables.input).toEqual({ startDate: start, endDate: end })
    fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '昨天' }))
    const y = subDays(new Date(), 1)
    await wait(() =>
      expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT').map(c => c.variables.input)).toContainEqual({
        startDate: startOfDay(y).getTime(),
        endDate: endOfDay(y).getTime(),
      })
    )
  })

  it('查詢中顯示載入骨架', async () => {
    renderDetail('rakeReport', { fixtures: report(), delays: { FETCH_DESIGNER_RAKE_REPORT: 1000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByText('總應領薪資')).toBeInTheDocument()
  })
})

