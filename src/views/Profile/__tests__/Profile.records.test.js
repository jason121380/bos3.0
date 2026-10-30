// 保護「個人頁」的紀錄與報表分頁（都只查登入者自己的資料，以 localStorage 的登入者 id 查詢）：
// - 帳單紀錄：金額四捨五入加千分位、業績合計＝服務＋店販＋卡券使用＋會員卡；活動券／會員卡／點數折抵欄依資料與設定顯示；分頁在畫面上切片。
// - 打卡紀錄：時間、日期與地圖連結；換頁與每頁筆數送出的參數；沒有紀錄顯示無資料。
// - 抽成報表：以今天 00:00～23:59:59.999 查詢，金額為服務＋卡券四捨五入；沒有資料顯示無資料。
// - 薪資條：上個月 1 日；只顯示自己；合計與業績；沒有加扣項時顯示 0 的空白薪資條；換月份重新查詢。
// - 設計師日報表：單號（指定加 *）、類別、項目、金額、業績；超過六位數不顯示小數；日合計／累計；「隱藏 0 值」時兩欄皆 0 的列不顯示。
// - 互助日報表：依互助者分組、依編號排序；顯示金額設定與「點數換算金額」不顯示金額；店販品項；店販業績＝各品項單價×數量加總；
//   累計欄＝當月 1 日到所選日期（另以同一支查詢查整月）的加總。
// GraphQL 全由模擬 link 回應，不連後端。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, format, startOfDay, startOfMonth } from 'date-fns'
import { loginAs, callsOf, PAGE_CRASH_TEXT, USER_ID } from '../../../__tests__/testkit.test'
import { renderProfile } from './profileKit.test'

jest.setTimeout(20000)

const at = (d, h, m, s = 0) => new Date(2026, 9, d, h, m, s).getTime()
const choose = (select, text) => fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
const cellsOfRow = tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('個人頁：帳單紀錄', () => {
  const order = (id, overrides = {}) => ({
    id,
    orderNo: `A${id}`,
    date: at(19, 14, 30),
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
    TPTName: { service: [], product: [], membership: [] },
    ...overrides,
  })
  const fixtures = ({ orders, summary = {}, bonus = false, member = false }) => ({
    GET_ORDER_LIST_FOR_DETAIL: { getOrderList: { intervalSummary: { membership: 0, bonusDecountForReport: 0, ...summary }, orderList: orders } },
    GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonus },
    GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: member },
  })
  const headers = () => screen.getAllByRole('columnheader').map(th => th.textContent)
  const row = no => cellsOfRow(screen.getByText(`#${no}`).closest('tr'))

  it('以登入者 id 查詢；週幾、金額、第三方卡券與業績合計', async () => {
    const orders = [
      order('1'),
      ...[20, 21, 22, 23, 24, 25].map(d => order(`w${d}`, { date: at(d, 10, 0) })),
      order('2', { isDesignate: false, designerNo: null, TPTName: { service: ['A卡', 'B卡'], product: ['C卡'], membership: [] }, remark: '熟客' }),
    ]
    const { calls } = renderProfile('orderRecord', { fixtures: fixtures({ orders }) })
    await screen.findByText('#A1')
    expect(callsOf(calls, 'GET_ORDER_LIST_FOR_DETAIL')[0].variables).toEqual({ input: { designerId: USER_ID } })
    expect(screen.getByText('共 8 筆, 1 / 1')).toBeInTheDocument()
    expect(headers()).not.toContain('會員卡消費')
    expect(row('A1')).toEqual(expect.arrayContaining(['#A12026/10/19/(一)', '王小美/07', 'Y', '1,200', '301', '2,001', '1,501']))
    expect(
      ['w20', 'w21', 'w22', 'w23', 'w24', 'w25'].map(no =>
        row(`A${no}`)
          .find(c => c.startsWith(`#A${no}`))
          .slice(-3)
      )
    ).toEqual(['(二)', '(三)', '(四)', '(五)', '(六)', '(日)'])
    expect(row('A2')).toEqual(expect.arrayContaining(['王小美', 'N', '1,200含 A卡, 含 B卡', '301含 C卡', '熟客']))
  })

  it('會員卡、點數折抵、活動券欄依設定或資料顯示', async () => {
    const orders = [
      order('1', { raffleCount: 1, membership: 999.5, bonusDecountForReport: 40, TPTName: { service: [], product: [], membership: ['D卡'] } }),
    ]
    renderProfile('orderRecord', { fixtures: fixtures({ orders, member: true, bonus: true }) })
    await screen.findByText('#A1')
    await wait(() => expect(headers()).toEqual(expect.arrayContaining(['活動券', '會員卡消費', '點數折抵金額'])))
    expect(row('A1')).toEqual(expect.arrayContaining(['1,000含 D卡', '40']))
    cleanup()
    renderProfile('orderRecord', { fixtures: fixtures({ orders: [order('1')], summary: { membership: 10, bonusDecountForReport: 5 } }) })
    await screen.findByText('#A1')
    await wait(() => expect(headers()).toEqual(expect.arrayContaining(['會員卡消費', '點數折抵金額'])))
  })

  it('每頁筆數與換頁：畫面上切片顯示', async () => {
    const orders = Array.from({ length: 7 }, (_, i) => order(String(i + 1)))
    renderProfile('orderRecord', { fixtures: fixtures({ orders }) })
    await screen.findByText('#A7')
    choose(screen.getByLabelText('每頁筆數'), '5')
    await wait(() => expect(screen.queryByText('#A6')).toBeNull())
    expect(screen.getByText('共 7 筆, 1 / 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await screen.findByText('#A6')
    expect(screen.queryByText('#A1')).toBeNull()
  })

  // 紅利設定比帳單晚回時等它回來再顯示（Jason 2026/10/22；修正前讀 undefined 整頁錯誤）。
  it('紅利設定比帳單晚回時等它回來再顯示帳單', async () => {
    renderProfile('orderRecord', { fixtures: fixtures({ orders: [order('1')] }), delays: { GET_CUSTOMER_BONUS: 500 } })
    expect(await screen.findByText('#A1')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})

describe('個人頁：打卡紀錄', () => {
  const attendance = records => v => ({
    user: {
      id: USER_ID,
      name: '王小美',
      attendanceRecords: { pageLimit: v.allAttendanceInput.pageLimit, pageOffset: v.allAttendanceInput.pageOffset, totalCount: 120, records },
    },
  })

  it('時間、日期與地圖連結；換頁、每頁筆數送出新參數', async () => {
    const records = [{ latitude: 25.03, longitude: 121.56, checkinDateTime: at(21, 9, 2, 5) }]
    const { calls } = renderProfile('AttendanceRecord', { fixtures: { FETCH_USER_ATTENDANCE: attendance(records) } })
    await screen.findByText('09:02:05')
    expect(callsOf(calls, 'FETCH_USER_ATTENDANCE')[0].variables).toEqual({
      userInput: { id: USER_ID },
      allAttendanceInput: { pageLimit: 50, pageOffset: 0 },
    })
    expect(screen.getByText('2026/10/21')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '地點' })).toHaveAttribute('href', 'https://www.google.com/maps?q=25.03,121.56')
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

  it('沒有打卡紀錄時顯示無資料；查詢中顯示骨架', async () => {
    renderProfile('AttendanceRecord', { fixtures: { FETCH_USER_ATTENDANCE: attendance([]) }, delays: { FETCH_USER_ATTENDANCE: 1000 } })
    expect(screen.queryByText('無資料')).toBeNull()
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })
})

describe('個人頁：抽成報表', () => {
  it('以今天 00:00～23:59:59.999 與登入者 id 查詢；金額為服務＋卡券四捨五入；沒有資料顯示無資料', async () => {
    const { calls } = renderProfile('rakeReport', {
      fixtures: {
        FETCH_DESIGNER_RAKE_REPORT: {
          userRakeReport: [
            {
              user: { id: USER_ID, name: '王小美', nickName: '', designerNo: '' },
              salesAnalytics: {
                servicePerformanceFakeTotal: 1000.4,
                ticketUsagePerformanceFakeTotal: 200.4,
                totalSalaryShouldBePaid: 450.5,
                membershipPerformanceFakeTotal: 0,
              },
            },
          ],
        },
        GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
      },
    })
    await screen.findByText('總應領薪資')
    expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')[0].variables).toEqual({
      input: { startDate: startOfDay(new Date()).getTime(), endDate: endOfDay(new Date()).getTime() },
      designerIds: [USER_ID],
    })
    const value = label => screen.getAllByText(label)[0].closest('tr').querySelectorAll('td')[1].textContent
    expect(value('服務虛業績')).toBe('1201')
    expect(value('總應領薪資')).toBe('451')
    await wait(() => expect(screen.getByText('會員卡業績')).toBeInTheDocument())
    expect(screen.getByText('王小美')).toBeInTheDocument()
    cleanup()
    renderProfile('rakeReport', { fixtures: { FETCH_DESIGNER_RAKE_REPORT: { userRakeReport: [] } } })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })
})

describe('個人頁：抽成報表（日期）', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it('網址帶日期區間時沿用（起日 00:00、迄日 23:59:59.999）；換成昨天後重新查詢；標題含編號與暱稱', async () => {
    const start = new Date(2026, 9, 1, 15).getTime()
    const end = new Date(2026, 9, 15, 9).getTime()
    window.history.replaceState(null, '', `/?startDate=${start}&endDate=${end}`)
    const { calls } = renderProfile('rakeReport', {
      fixtures: {
        FETCH_DESIGNER_RAKE_REPORT: {
          userRakeReport: [{ user: { id: USER_ID, name: '王小美', nickName: 'Amy', designerNo: '07' }, salesAnalytics: {} }],
        },
      },
    })
    await screen.findByText('07 Amy 王小美')
    expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT')[0].variables.input).toEqual({
      startDate: startOfDay(start).getTime(),
      endDate: endOfDay(end).getTime(),
    })
    fireEvent.click(screen.getByRole('combobox', { name: '快速選擇日期區間' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '昨天' }))
    const y = new Date()
    y.setDate(y.getDate() - 1)
    await wait(() =>
      expect(callsOf(calls, 'FETCH_DESIGNER_RAKE_REPORT').map(c => c.variables.input)).toContainEqual({
        startDate: startOfDay(y).getTime(),
        endDate: endOfDay(y).getTime(),
      })
    )
  })
})

describe('個人頁：薪資條', () => {
  const lastMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime()
  const slip = overrides => ({
    userId: USER_ID,
    name: '王小美',
    summary: 3500,
    increaseItem: Array.from({ length: 7 }, (_, i) => ({ itemName: `加${i + 1}`, price: 500, type: 'INCREASE' })),
    decreaseItem: Array.from({ length: 7 }, (_, i) => ({ itemName: `扣${i + 1}`, price: 0, type: 'DECREASE' })),
    helperPointRetrieve: 1.26,
    designateTruthPerformance: 1000.04,
    nonDesignateTruthPerformance: 0,
    specialTruthPerformance: 0,
    truthPerformance: 1000.04,
    fakePerformanceTotal: 1200.06,
    performanceDecountItem: 0,
    handlingFeeOnSales: 0,
    remark: '',
    workingDays: 20,
    ...overrides,
  })
  const fixtures = (report, { fake = true, epwd = true } = {}) => ({
    FETCH_USER_SALARY_REPORT: { userSalaryReport: report },
    GET_IS_EPWD_DISPLAY: { getIsEPWDDisplay: epwd },
    GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT: { getIsDisplayFakePerformanceInSalaryReport: fake },
  })
  const title = name => `測試店 - ${format(lastMonthStart(), 'yyyy/MM')} - ${name}`
  const lastTableCells = card => {
    const tables = card.querySelectorAll('table')
    const rows = tables[tables.length - 1].querySelectorAll('tr')
    const cells = tr => Array.from(tr.querySelectorAll('th, td')).map(c => c.textContent)
    return { head: cells(rows[0]), values: cells(rows[1]) }
  }

  it('查上個月；只顯示自己；合計與業績、虛業績欄、出勤天數；換月份重新查詢', async () => {
    const { calls } = renderProfile('paySlip', { fixtures: fixtures([slip(), slip({ userId: 'other', name: '別人' })]) })
    await screen.findByText(title('王小美'))
    expect(callsOf(calls, 'FETCH_USER_SALARY_REPORT')[0].variables).toEqual({ date: lastMonthStart() })
    expect(screen.queryByText(title('別人'))).toBeNull()
    expect(screen.getByText('天數: 20')).toBeInTheDocument()
    // 「顯示虛業績」設定可能比薪資資料晚到
    await wait(() => expect(lastTableCells(document).head).toContain('總虛業績'))
    const cells = lastTableCells(document)
    expect(cells.values.slice(0, 5)).toEqual(['3,500', '0', '3,500', '1.3', '1,000'])
    fireEvent.click(screen.getByRole('button', { name: '本月' }))
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_REPORT').map(c => c.variables.date)).toContain(startOfMonth(new Date()).getTime()))
  })

  it('沒有加扣項時顯示 0 的空白薪資條；只有扣項、只有加項；不顯示虛業績與天數', async () => {
    renderProfile('paySlip', {
      fixtures: fixtures(
        [
          slip({ increaseItem: [], decreaseItem: [] }),
          slip({ userId: USER_ID, name: '只有扣項', increaseItem: [] }),
          slip({ name: '只有加項', decreaseItem: [] }),
        ],
        { fake: false, epwd: false }
      ),
    })
    expect(await screen.findByText(title('王小美'))).toBeInTheDocument()
    expect(screen.getByText('無加項')).toBeInTheDocument()
    expect(screen.getByText(title('只有扣項'))).toBeInTheDocument()
    expect(screen.getByText(title('只有加項'))).toBeInTheDocument()
    expect(screen.queryByText(/天數/)).toBeNull()
    expect(screen.queryByText('總虛業績')).toBeNull()
  })

  it('沒有資料顯示無資料', async () => {
    renderProfile('paySlip', { fixtures: fixtures([]) })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })
})

describe('個人頁：設計師日報表', () => {
  const day = (overrides = {}) => ({
    performanceFakeTotal: 3000,
    performanceTruthTotal: 2800.26,
    performanceDesignateTruthTotal: 2000,
    performanceNonDesignateTruthTotal: 800.26,
    thirdPartHandlingFee: 0,
    performanceWithSpecialRake: 0,
    productFakeTotal: 500,
    productRake: 50,
    helperPaidPrice: 0,
    helperPaidPoint: 2,
    helperPaidPriceFromPoint: -20,
    helperRetrievePoint: 0,
    orderTotalCount: 3,
    designateOrderCount: 2,
    nonDesignateOrderCount: 1,
    orderAveragePrice: 1000,
    orderTypeCount: 4,
    orderTypeAveragePrice: 750,
    walletDeposit: 0,
    ...overrides,
  })
  const report = (overrides = {}) => ({
    user: { id: USER_ID, name: '王小美', nickName: 'Amy', designerNo: '07' },
    orderRecord: [
      {
        orderId: 'o1',
        designation: true,
        orderNo: 'A001',
        category: '項目消費',
        itemName: '剪髮',
        fakePerformance: 1000.04,
        truthPerformance: 950.06,
      },
      {
        orderId: 'o2',
        designation: false,
        orderNo: 'A002',
        category: '店販',
        itemName: '洗髮精',
        fakePerformance: 123456.7,
        truthPerformance: 100000.4,
      },
    ],
    currentDay: day(),
    tillNow: day({ performanceFakeTotal: 30000, orderTotalCount: 30 }),
    currentTruthSummary: 101950.46,
    currentFakeSummary: 124456.74,
    isLastPage: true,
    totalPageCount: 1,
    currentPageOrder: 1,
    ...overrides,
  })
  const fixtures = ({ reports = [report()], price = true, pointPrice = true, hidden = false } = {}) => ({
    FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: reports },
    GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: {
      getPriceDisplayOnDailyReportDefault: { isPriceDisplayOnDailyReport: price, isHelperPointPriceDisplay: pointPrice },
    },
    GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT: { getIsZeroValueHiddenOnDailyReport: hidden },
  })
  const summary = label => cellsOfRow(screen.getByText(label).closest('tr')).slice(1)

  it('以登入者 id 與今天查詢；明細、合計、日合計與累計', async () => {
    const { calls } = renderProfile('designerSelfRecord', { fixtures: fixtures() })
    await screen.findByText('A001*')
    expect(callsOf(calls, 'FETCH_DESIGNER_DAILY_REPORT')[0].variables.designerIds).toEqual([USER_ID])
    expect(screen.getByText(`07 Amy 王小美 ${format(new Date(), 'yyyy/MM/dd')} 日報表`)).toBeInTheDocument()
    expect(cellsOfRow(screen.getByText('A001*').closest('tr'))).toEqual(['A001*', '消費', '剪髮', '1,000', '950.1'])
    // 超過六位數不顯示小數
    expect(cellsOfRow(screen.getByText('A002').closest('tr'))).toEqual(['A002', '店販', '洗髮精', '123,457', '100,000'])
    expect(cellsOfRow(screen.getByText('合計').closest('tr'))).toEqual(['合計', '', '', '124,457', '101,950'])
    expect(summary('金額(虛)')).toEqual(['3,000', '30,000'])
    expect(summary('實業績')).toEqual(['2,800.3', '2,800.3'])
    expect(summary('互助使用(點)')).toEqual(['2/20', '2/20'])
    expect(summary('客單價')).toEqual(['1,000', '1,000'])
    expect(summary('平均項次單價')).toEqual(['750', '7,500'])
    expect(summary('手續費')).toEqual(['0', '0'])
  })

  it('隱藏 0 值：日合計與累計都為 0 的列不顯示；不顯示金額時合計金額空白、點數不換算', async () => {
    renderProfile('designerSelfRecord', { fixtures: fixtures({ hidden: true, price: false, pointPrice: false }) })
    await screen.findByText('A001*')
    await wait(() => expect(screen.queryByText('手續費')).toBeNull())
    expect(screen.queryByText('入金儲值')).toBeNull()
    expect(screen.queryByText('互助獲得')).toBeNull()
    expect(screen.queryByText('金額(虛)')).toBeNull()
    expect(summary('實業績')).toEqual(['2,800.3', '2,800.3'])
    expect(summary('互助使用(點)')).toEqual(['2', '2'])
    expect(cellsOfRow(screen.getByText('合計').closest('tr'))).toEqual(['合計', '', '', '', '101,950'])
  })

  it('多頁：非第一頁顯示「承上張」、非最後一頁顯示「接續下張」；沒有明細；沒有編號暱稱只顯示姓名', async () => {
    const reports = [
      report({ isLastPage: false, totalPageCount: 2, currentPageOrder: 1 }),
      report({ orderRecord: [], totalPageCount: 2, currentPageOrder: 2, user: { id: USER_ID, name: '王小美', nickName: '', designerNo: null } }),
    ]
    renderProfile('designerSelfRecord', { fixtures: fixtures({ reports }) })
    expect(await screen.findByText('接續下張')).toBeInTheDocument()
    expect(screen.getByText('承上張')).toBeInTheDocument()
    expect(screen.getByText(`07 Amy 王小美 ${format(new Date(), 'yyyy/MM/dd')} 日報表 - 1/2`)).toBeInTheDocument()
    expect(screen.getByText(`王小美 ${format(new Date(), 'yyyy/MM/dd')} 日報表 - 2/2`)).toBeInTheDocument()
  })

  it('隱藏 0 值時：當日為 0 但累計不為 0 的列照常顯示', async () => {
    const zero = day({
      performanceFakeTotal: 0,
      performanceTruthTotal: 0,
      performanceDesignateTruthTotal: 0,
      performanceNonDesignateTruthTotal: 0,
      thirdPartHandlingFee: 0,
      helperRetrievePoint: 0,
      orderTotalCount: 0,
      designateOrderCount: 0,
      nonDesignateOrderCount: 0,
      orderAveragePrice: 0,
      orderTypeCount: 0,
      orderTypeAveragePrice: 0,
      walletDeposit: 0,
    })
    const till = day({ thirdPartHandlingFee: 5, helperRetrievePoint: 2, walletDeposit: 300 })
    renderProfile('designerSelfRecord', { fixtures: fixtures({ hidden: true, reports: [report({ currentDay: zero, tillNow: till })] }) })
    await screen.findByText('A001*')
    await wait(() => expect(screen.getByText('入金儲值')).toBeInTheDocument())
    for (const label of [
      '實業績',
      '指定實業績',
      '不指定實業績',
      '手續費',
      '互助獲得',
      '總客數',
      '指定客',
      '不指定客',
      '客單價',
      '客項次(服務)',
      '平均項次單價',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(summary('入金儲值')).toEqual(['0', '300'])
  })

  // 當天沒有客人（筆數 0）時客單價與平均項次單價顯示 0（Jason 2026/10/22；修正前直接相除顯示 NaN）。
  it('當天沒有客人時客單價與平均項次單價顯示 0', async () => {
    const zero = day({ performanceFakeTotal: 0, orderTotalCount: 0, orderTypeCount: 0 })
    renderProfile('designerSelfRecord', { fixtures: fixtures({ reports: [report({ currentDay: zero, tillNow: zero })] }) })
    await screen.findByText('A001*')
    expect(summary('客單價')).toEqual(['0', '0'])
    expect(summary('平均項次單價')).toEqual(['0', '0'])
  })

  it('沒有資料顯示無資料；按「今天」以今天結束時間重新查詢', async () => {
    const { calls } = renderProfile('designerSelfRecord', { fixtures: fixtures({ reports: [] }) })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '今天' }))
    await wait(() => expect(callsOf(calls, 'FETCH_DESIGNER_DAILY_REPORT').map(c => c.variables.date)).toContain(endOfDay(new Date()).getTime()))
  })
})

describe('個人頁：互助日報表', () => {
  const person = (id, name, designerNo, nickName = null) => ({ id, name, designerNo, nickName, deductionWay: '' })
  const helper = (helperPerson, overrides = {}) => ({
    date: at(21, 10, 0),
    orderNo: 'A001',
    orderId: 'o1',
    helperPoint: 1.25,
    helperFeeNoPoint: 100,
    helperFeeOnlyPoint: 12.5,
    service: { id: 's1', name: '洗髮', helperDeductionSetting: { type: '' } },
    designer: { id: 'd1', name: '林設計', designerNo: '01', nickName: '', nameForReport: '' },
    helper: helperPerson,
    helperDeductionType: '',
    helperType: '',
    helperMoneyGivenWay: '金額',
    helperFee: -100.4,
    ...overrides,
  })
  const product = (seller, overrides = {}) => ({
    orderId: 'o2',
    orderNo: 'A002',
    seller,
    productName: '洗髮精',
    productUnitPrice: 100,
    productCount: 2,
    productRake: 20.4,
    ...overrides,
  })
  const fixtures = ({ helperRecord, productRecord = [], price = true }) => ({
    GET_USER_HELPER_RETRIEVE: { getUserHelperRetrieve: { helperRecord, productRecord, membershipRecord: [] } },
    GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT: {
      getPriceDisplayOnDailyReportDefault: { isPriceDisplayOnDailyReport: true, isHelperPointPriceDisplay: price },
    },
  })
  // 以標題開頭（原文含多個空白）找到該互助者的卡片
  const cardOf = prefix =>
    within(
      screen
        .getAllByText(/互助報表$/)
        .find(n => n.textContent.startsWith(prefix))
        .closest('.mb-6')
    )

  it('以登入者 id 與今天查詢；依互助者分組並依編號排序（數字、字母、暱稱、姓名）；金額與點數合計', async () => {
    const p10 = person('h10', '十號', '10')
    const p2 = person('h2', '二號', '2')
    const pB = person('hB', '字母', 'B1')
    const pNick = person('hN', '暱稱者', '', '小可')
    const pNick2 = person('hN2', '暱稱二', '', 'Bella')
    const pName = person('hName', '阿名', '')
    const pName2 = person('hName2', 'Ann', '')
    const { calls } = renderProfile('helperSelfRecord', {
      fixtures: fixtures({
        helperRecord: [
          helper(p10),
          helper(p2, { helperFee: -50, helperPoint: 0.5 }),
          helper(p2, { orderNo: 'A003', helperMoneyGivenWay: '點數換算金額', helperFee: -30, helperPoint: 3 }),
          helper(pB),
          helper(pNick),
          helper(pName),
          helper(pNick2),
          helper(pName2),
        ],
        productRecord: [product(p2), product(person('s9', '店販王', 'A9'))],
      }),
    })
    await screen.findAllByText(/互助報表/)
    const { variables } = callsOf(calls, 'GET_USER_HELPER_RETRIEVE')[0]
    expect(variables.input.designerId).toBe(USER_ID)
    expect(variables.input.startDate).toBe(variables.input.endDate)
    const titles = screen.getAllByText(/互助報表$/).map(n => n.textContent.split(` ${format(new Date(), 'yyyy/MM/dd')}`)[0])
    expect(titles).toEqual(['2  二號', '10  十號', 'A9  店販王', 'B1  字母', ' Bella 暱稱二', ' 小可 暱稱者', '  Ann', '  阿名'])
    const two = cardOf('2  二號')
    // 顯示金額：點數換算金額的互助也列出金額
    expect(cellsOfRow(two.getByText('#A003').closest('tr'))).toEqual(['#A003', '洗髮', '林設計', '30', '3'])
    expect(cellsOfRow(two.getByText('#A002').closest('tr'))).toEqual(['#A002', '洗髮精 100x2', '', '20', ''])
    expect(cellsOfRow(two.getByText('合計').closest('tr'))).toEqual(['合計', '', '', '100', '3.5'])
    // 累計欄：整月查詢（此處模擬回應與當日相同）的加總
    expect(cellsOfRow(two.getByText(/互助獲得\(點\)/).closest('tr'))).toEqual(['互助獲得(點)點數/換算金額', '3.5/25', '3.5 /25'])
    expect(cellsOfRow(two.getByText(/互助獲得金額/).closest('tr'))).toEqual(['互助獲得金額(不含點)', '200', '200'])
    expect(cellsOfRow(two.getByText('店販抽成').closest('tr'))).toEqual(['店販抽成', '20', '20.4'])
    expect(two.getByText('#A003').closest('a')).toHaveAttribute('href', '/order/o1')
  })

  it('不顯示換算金額時：點數換算金額的互助不列金額、合計也不含；點數列為「互助獲得 - 點數」', async () => {
    const p2 = person('h2', '二號', '2')
    renderProfile('helperSelfRecord', {
      fixtures: fixtures({
        price: false,
        helperRecord: [helper(p2, { helperFee: -50 }), helper(p2, { orderNo: 'A003', helperMoneyGivenWay: '點數換算金額', helperFee: -30 })],
        productRecord: [product(p2, { productRake: 9.6 })],
      }),
    })
    await screen.findAllByText(/互助報表/)
    expect(cellsOfRow(screen.getByText('#A003').closest('tr'))).toEqual(['#A003', '洗髮', '林設計', '', '1.25'])
    expect(cellsOfRow(screen.getByText('#A001').closest('tr'))[3]).toBe('50')
    // 合計＝互助金額（不含點數換算）＋店販抽成
    expect(cellsOfRow(screen.getByText('合計').closest('tr'))[3]).toBe('60')
    expect(cellsOfRow(screen.getByText('互助獲得 - 點數').closest('tr'))).toEqual(['互助獲得 - 點數', '2.5', '2.5'])
    expect(cellsOfRow(screen.getByText(/互助獲得金額/).closest('tr'))[1]).toBe('50')
  })

  // 店販業績＝各品項單價×數量加總（Jason 2026/10/22；修正前以單價合計×數量合計，100×2＋50×1 顯示 450）。
  // 累計欄＝當月 1 日到所選日期的加總（Jason 2026/10/22；修正前 Profile/index.js 只把累計初始化為 0、從未填入）：
  // 以同一支查詢另查整月，依互助者加總點數、不含點金額、點數換算金額、店販業績與店販抽成。
  it('店販業績逐品項單價×數量加總；累計欄為當月 1 日到所選日期的加總', async () => {
    const p2 = person('h2', '二號', '2')
    const today = {
      helperRecord: [helper(p2, { helperPoint: 1, helperFeeNoPoint: 100, helperFeeOnlyPoint: 10 })],
      productRecord: [product(p2), product(p2, { orderNo: 'A004', productUnitPrice: 50, productCount: 1, productRake: 5 })],
    }
    const month = {
      helperRecord: [
        ...today.helperRecord,
        helper(p2, { orderNo: 'A000', helperPoint: 2.5, helperFeeNoPoint: 300, helperFeeOnlyPoint: 25 }),
        // 欄位為 0 的紀錄照常加總
        helper(p2, { orderNo: 'A00Z', helperPoint: 0, helperFeeNoPoint: 0, helperFeeOnlyPoint: 0, helperFee: 0 }),
      ],
      productRecord: [...today.productRecord, product(p2, { orderNo: 'A005', productUnitPrice: 300, productCount: 3, productRake: 90 })],
    }
    const { calls } = renderProfile('helperSelfRecord', {
      fixtures: {
        ...fixtures({ helperRecord: [] }),
        GET_USER_HELPER_RETRIEVE: v => ({
          getUserHelperRetrieve: { ...(v.input.startDate === v.input.endDate ? today : month), membershipRecord: [] },
        }),
      },
    })
    await screen.findAllByText(/互助報表/)
    await wait(() => expect(cellsOfRow(screen.getByText('店販業績').closest('tr'))).toEqual(['店販業績', '250', '1,150']))
    expect(cellsOfRow(screen.getByText('店販抽成').closest('tr'))).toEqual(['店販抽成', '25', '115.4'])
    expect(cellsOfRow(screen.getByText(/互助獲得\(點\)/).closest('tr'))).toEqual(['互助獲得(點)點數/換算金額', '1/10', '3.5 /35'])
    expect(cellsOfRow(screen.getByText(/互助獲得金額/).closest('tr'))).toEqual(['互助獲得金額(不含點)', '100', '400'])
    // 整月查詢：當月 1 日 00:00 到所選日期，同一位登入者
    const inputs = callsOf(calls, 'GET_USER_HELPER_RETRIEVE').map(c => c.variables.input)
    const day = inputs.find(i => i.startDate === i.endDate)
    expect(inputs).toContainEqual({ startDate: startOfMonth(day.endDate).getTime(), endDate: day.endDate, designerId: USER_ID })
  })

  it('整月查詢失敗時累計欄為 0，當日資料照常顯示', async () => {
    const p2 = person('h2', '二號', '2')
    renderProfile('helperSelfRecord', {
      fixtures: {
        ...fixtures({ helperRecord: [] }),
        GET_USER_HELPER_RETRIEVE: v =>
          v.input.startDate === v.input.endDate
            ? { getUserHelperRetrieve: { helperRecord: [], productRecord: [product(p2)], membershipRecord: [] } }
            : new Error('網路錯誤'),
      },
    })
    await screen.findAllByText(/互助報表/)
    await wait(() => expect(cellsOfRow(screen.getByText('店販業績').closest('tr'))).toEqual(['店販業績', '200', '0']))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // 互助者沒有設計師編號（null）時視為空字串，依姓名排序（Jason 2026/10/22；修正前讀 null.length 整頁錯誤）。
  it('互助者沒有編號（null）時照常顯示', async () => {
    renderProfile('helperSelfRecord', { fixtures: fixtures({ helperRecord: [helper(person('h1', '無號', null))] }) })
    expect(await screen.findByText(/無號 .*互助報表$/)).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  it('沒有資料顯示無資料；查詢中顯示骨架', async () => {
    renderProfile('helperSelfRecord', { fixtures: fixtures({ helperRecord: [] }), delays: { GET_USER_HELPER_RETRIEVE: 1000 } })
    expect(screen.queryByText('無資料')).toBeNull()
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })
})
