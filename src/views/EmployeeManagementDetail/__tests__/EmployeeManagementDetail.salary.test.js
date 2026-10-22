// 保護「員工資料」的薪資類分頁：
// - 薪資條：查上個月 1 日（台灣時間）的薪資報表，只顯示這位員工；加扣項逐項列出、合計為各項加總、業績四捨五入一位；
//   依店家設定顯示虛業績欄與出勤天數；換月份重新查詢；沒有資料顯示「無資料」。
// - 薪資加扣項（每月固定帶入的金額）：依店家設定的加扣項排序帶入員工已存的固定金額（會員卡獎金沒設定時不列），
//   不在店家設定內的列在下方自訂項目；小計即時重算；儲存只送金額大於 0（自訂項目另須有名稱）的項目、不含 sorting，成功後回員工列表。
// GraphQL 全由模擬 link 回應，不連後端、不改真實薪資。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { format, startOfMonth } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { renderDetail, EMP_ID } from './employeeDetailKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const lastMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime()
const items = (prefix, prices, type) => prices.map((price, i) => ({ itemName: `${prefix}${i + 1}`, price, type }))

const SLIP = {
  userId: EMP_ID,
  name: '王小美',
  summary: 38765,
  increaseItem: items('加', [30000, 5000, 3000, 2000, 1000, 500, 1234], 'INCREASE'),
  decreaseItem: items('扣', [1200, 300, 100, 50, 20, 10, 2789], 'DECREASE'),
  helperPointRetrieve: 12.34,
  designateTruthPerformance: 80000.04,
  nonDesignateTruthPerformance: 43456.75,
  specialTruthPerformance: 1234.56,
  truthPerformance: 124691.35,
  fakePerformanceTotal: 130000.26,
  performanceDecountItem: 300.44,
  handlingFeeOnSales: 99.95,
  remark: '含年終',
  workingDays: 22,
}

const slipFixtures = ({ report = [SLIP, { ...SLIP, userId: 'other', name: '別人' }], fake = true, epwd = true } = {}) => ({
  FETCH_USER_SALARY_REPORT: { userSalaryReport: report },
  GET_IS_EPWD_DISPLAY: { getIsEPWDDisplay: epwd },
  GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT: { getIsDisplayFakePerformanceInSalaryReport: fake },
})

const lastRowCells = () => {
  const tables = document.querySelectorAll('table')
  const rows = tables[tables.length - 1].querySelectorAll('tr')
  const cells = tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
  return { head: cells(rows[0]), values: cells(rows[1]) }
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資條', () => {
  it('查上個月 1 日；只顯示這位員工；逐項列出、合計與業績（四捨五入一位）、出勤天數', async () => {
    const { calls } = renderDetail('paySlip', { fixtures: slipFixtures() })
    // 標題原文為「店名  -  月份 - 姓名」（多個空白，比對時合併為一個）
    const title = `測試店 - ${format(lastMonthStart(), 'yyyy/MM')} - 王小美`
    expect(await screen.findByText(title)).toBeInTheDocument()
    expect(callsOf(calls, 'FETCH_USER_SALARY_REPORT')[0].variables).toEqual({ date: lastMonthStart() })
    expect(screen.queryByText(/別人/)).toBeNull()
    expect(screen.getByText('天數: 22')).toBeInTheDocument()
    expect(screen.getByText('加7')).toBeInTheDocument()
    expect(screen.getByText('扣7')).toBeInTheDocument()
    expect(lastRowCells()).toEqual({
      head: ['加項合計', '扣項合計', '實領薪資', '互助獲得(點)', '指定實業績', '不指定實業績', '特抽總業績', '總實業績', '總虛業績', '扣項-扣業績', '手續費-扣業績', '備註'],
      values: ['42,734', '4,469', '38,765', '12.3', '80,000', '43,456.8', '1,234.6', '124,691.4', '130,000.3', '300.4', '100', '含年終'],
    })
  })

  it('店家關閉虛業績與出勤天數時不顯示；只有扣項時加項欄空白', async () => {
    renderDetail('paySlip', {
      fixtures: slipFixtures({ report: [{ ...SLIP, increaseItem: [] }], fake: false, epwd: false }),
    })
    await screen.findByText('扣1')
    expect(screen.queryByText(/天數/)).toBeNull()
    expect(lastRowCells().head).not.toContain('總虛業績')
    expect(lastRowCells().values.slice(0, 2)).toEqual(['0', '4,469'])
  })

  it('只有加項時扣項欄空白', async () => {
    renderDetail('paySlip', { fixtures: slipFixtures({ report: [{ ...SLIP, decreaseItem: [] }] }) })
    await screen.findByText('加1')
    expect(lastRowCells().values.slice(0, 2)).toEqual(['42,734', '0'])
  })

  it('換月份：以所選月份重新查詢', async () => {
    const { calls } = renderDetail('paySlip', { fixtures: slipFixtures() })
    await screen.findByText('加1')
    fireEvent.click(screen.getByRole('button', { name: '本月' }))
    await wait(() =>
      expect(callsOf(calls, 'FETCH_USER_SALARY_REPORT').map(c => c.variables.date)).toContain(startOfMonth(new Date()).getTime())
    )
  })

  it('這位員工沒有薪資資料時顯示無資料；查詢中顯示載入骨架', async () => {
    renderDetail('paySlip', { fixtures: slipFixtures({ report: [] }), delays: { FETCH_USER_SALARY_REPORT: 1000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })

  // 當月沒有任何加扣項時顯示「無加項／無扣項」、實領薪資 0（Jason 2026/10/22：PaySlip.js 標題改用 date.startDate 格式化，
  // 修正前把 { startDate } 物件丟給 format 而整頁錯誤）。
  it('當月沒有任何加扣項時顯示無加項、無扣項與實領薪資 0', async () => {
    renderDetail('paySlip', { fixtures: slipFixtures({ report: [{ ...SLIP, increaseItem: [], decreaseItem: [] }] }) })
    expect(await screen.findByText(`測試店 - ${format(lastMonthStart(), 'yyyy/MM')} - 王小美`)).toBeInTheDocument()
    expect(screen.getByText('無加項')).toBeInTheDocument()
    expect(screen.getByText('無扣項')).toBeInTheDocument()
    expect(screen.getByText('實領薪資')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})

describe('薪資加扣項', () => {
  const salaryFixtures = ({ increaseSettings, decreaseSettings, fixed } = {}) => ({
    GET_MERCHANT_SALARY_INCREASE_ITEMS: {
      getMerchantSalaryIncreaseItems: increaseSettings || [
        { id: 'i2', itemSetting: '職務加給', type: 'INCREASE', sorting: 2 },
        { id: 'i1', itemSetting: '工資', type: 'INCREASE', sorting: 1 },
        { id: 'i3', itemSetting: '會員卡獎金', type: 'INCREASE', sorting: 3 },
      ],
    },
    GET_MERCHANT_SALARY_DECREASE_ITEMS: {
      getMerchantSalaryDecreaseItems: decreaseSettings || [
        { id: 'd2', itemSetting: '員工借支', type: 'DECREASE', sorting: 2 },
        { id: 'd1', itemSetting: '勞健保費', type: 'DECREASE', sorting: 1 },
      ],
    },
    FETCH_DESIGNER_FIXED_SALARY_ITEMS: {
      merchantDesigner: {
        fixedSalaryItem: fixed || {
          increaseItem: [
            { itemName: '工資', price: 30000 },
            { itemName: '交通津貼', price: 1500 },
          ],
          decreaseItem: [
            { itemName: '勞健保費', price: 1200 },
            { itemName: '宿舍費', price: 300 },
          ],
        },
      },
    },
    SET_USER_FIXED_SALARY_ITEM: { setUserFixedSalaryItem: true },
  })
  const incCard = () => within(screen.getAllByText(/^薪資加項小計/)[0].closest('.ui-root').parentElement)
  const decCard = () => within(screen.getAllByText(/^薪資扣項小計/)[0].closest('.ui-root').parentElement)
  const incTitle = () => screen.getAllByText(/^薪資加項小計/)[0].textContent
  const decTitle = () => screen.getAllByText(/^薪資扣項小計/)[0].textContent
  const type = (input, value) => fireEvent.change(input, { target: { value } })
  const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存並返回列表' }))
  const sent = calls => callsOf(calls, 'SET_USER_FIXED_SALARY_ITEM')[0].variables.input

  it('依店家設定排序帶入固定金額；會員卡獎金沒設定時不列；自訂項目列在下方；小計', async () => {
    const { calls } = renderDetail('salaryItems', { fixtures: salaryFixtures() })
    await screen.findByLabelText('工資')
    expect(callsOf(calls, 'FETCH_DESIGNER_FIXED_SALARY_ITEMS')[0].variables).toEqual({ designerId: EMP_ID })
    const incLabels = incCard().getAllByText(/^(工資|職務加給|會員卡獎金)$/).map(n => n.textContent)
    expect(incLabels).toEqual(['工資', '職務加給'])
    expect(screen.getByLabelText('工資')).toHaveValue(30000)
    expect(screen.getByLabelText('職務加給')).toHaveValue(0)
    expect(incCard().getByLabelText('薪資加項科目')).toHaveValue('交通津貼')
    expect(incCard().getByLabelText('加項金額')).toHaveValue(1500)
    expect(screen.getByLabelText('勞健保費')).toHaveValue(1200)
    expect(screen.getByLabelText('員工借支')).toHaveValue(0)
    expect(decCard().getByLabelText('薪資扣項科目')).toHaveValue('宿舍費')
    expect(incTitle()).toBe('薪資加項小計:31500')
    expect(decTitle()).toBe('薪資扣項小計:1500')
  })

  it('修改、新增、刪除後小計即時重算；儲存只送金額大於 0 的項目（不含 sorting），成功後回員工列表', async () => {
    const { calls } = renderDetail('salaryItems', { fixtures: salaryFixtures() })
    await screen.findByLabelText('工資')
    type(screen.getByLabelText('工資'), '31000.5')
    type(screen.getByLabelText('職務加給'), '2000')
    type(screen.getByLabelText('職務加給'), '')
    type(screen.getByLabelText('員工借支'), '500')
    type(screen.getByLabelText('勞健保費'), '')
    // 加項：新增一列「全勤獎金」，刪除「交通津貼」；再新增一列空白（不送出）
    fireEvent.click(incCard().getByLabelText('新增一項'))
    type(incCard().getAllByLabelText('薪資加項科目')[1], '全勤獎金')
    type(incCard().getAllByLabelText('加項金額')[1], '2000')
    fireEvent.click(incCard().getAllByLabelText('刪除此項')[0])
    fireEvent.click(incCard().getByLabelText('新增一項'))
    type(incCard().getAllByLabelText('加項金額')[1], '')
    // 扣項：新增「罰款」300，改宿舍費金額；刪除新增的空白列
    fireEvent.click(decCard().getByLabelText('新增一項'))
    type(decCard().getAllByLabelText('薪資扣項科目')[1], '罰款')
    type(decCard().getAllByLabelText('扣項金額')[1], '300')
    type(decCard().getAllByLabelText('扣項金額')[0], '')
    type(decCard().getAllByLabelText('扣項金額')[0], '350')
    fireEvent.click(decCard().getByLabelText('新增一項'))
    fireEvent.click(decCard().getAllByLabelText('刪除此項')[2])
    expect(incTitle()).toBe('薪資加項小計:33000.5')
    expect(decTitle()).toBe('薪資扣項小計:1150')
    save()
    await wait(() => expect(currentLocation()).toBe('/management/employee'))
    expect(sent(calls)).toEqual({
      userId: EMP_ID,
      userFixedSalaryItem: [
        { itemName: '工資', price: 31000.5, type: 'INCREASE' },
        { itemName: '員工借支', price: 500, type: 'DECREASE' },
        { itemName: '全勤獎金', price: 2000, type: 'INCREASE' },
        { itemName: '宿舍費', price: 350, type: 'DECREASE' },
        { itemName: '罰款', price: 300, type: 'DECREASE' },
      ],
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '薪資加扣項儲存成功', variant: 'success' })
  })

  it('後端回 false 時不提示成功、停在本頁', async () => {
    const { calls } = renderDetail('salaryItems', {
      fixtures: { ...salaryFixtures(), SET_USER_FIXED_SALARY_ITEM: { setUserFixedSalaryItem: false } },
    })
    await screen.findByLabelText('工資')
    save()
    await wait(() => expect(callsOf(calls, 'SET_USER_FIXED_SALARY_ITEM')).toHaveLength(1))
    expect(openSnackbar).not.toHaveBeenCalled()
    expect(currentLocation()).toBe(`/management/employee/${EMP_ID}/salaryItems`)
  })

  it('店家沒有加扣項設定時，員工的固定金額全部列為自訂項目', async () => {
    renderDetail('salaryItems', { fixtures: salaryFixtures({ increaseSettings: [], decreaseSettings: [] }) })
    await screen.findAllByText('薪資加項小計:31500')
    expect(incCard().getAllByLabelText('薪資加項科目').map(n => n.value)).toEqual(['工資', '交通津貼'])
    expect(decCard().getAllByLabelText('薪資扣項科目').map(n => n.value)).toEqual(['勞健保費', '宿舍費'])
  })

  it('員工沒有固定金額時：店家設定項目皆為 0、自訂項目一列空白', async () => {
    renderDetail('salaryItems', { fixtures: salaryFixtures({ fixed: { increaseItem: [], decreaseItem: [] } }) })
    await screen.findByLabelText('工資')
    expect(screen.getByLabelText('工資')).toHaveValue(0)
    expect(incCard().getByLabelText('薪資加項科目')).toHaveValue('')
    expect(incTitle()).toBe('薪資加項小計:0')
  })

  it('金額欄位滾動滑鼠滾輪都會先失焦', async () => {
    renderDetail('salaryItems', { fixtures: salaryFixtures() })
    await screen.findByLabelText('工資')
    const still = screen.getAllByRole('spinbutton').filter(input => {
      input.focus()
      fireEvent.wheel(input)
      return document.activeElement === input
    })
    expect(still).toHaveLength(0)
    // 扣項自訂金額不是數字欄位，也一樣失焦
    const decPrice = decCard().getByLabelText('扣項金額')
    decPrice.focus()
    fireEvent.wheel(decPrice)
    expect(document.activeElement).not.toBe(decPrice)
  })

  it('查詢中顯示載入骨架', async () => {
    renderDetail('salaryItems', { fixtures: salaryFixtures(), delays: { FETCH_DESIGNER_FIXED_SALARY_ITEMS: 1000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByLabelText('工資')).toBeInTheDocument()
  })
})
