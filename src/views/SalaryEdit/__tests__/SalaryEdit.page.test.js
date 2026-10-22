// 保護「薪資維護」（某位員工某月的加扣項）：
// - 店家設定的加項／扣項依 sorting 排列並帶入員工已存的金額；不在店家設定內的已存項目列在下方「自訂項目」；
//   會員卡未啟用且會員卡獎金為 0 時不顯示該項。
// - 加項小計、扣項小計與「實際匯款金額」＝加項合計－扣項合計（含自訂項目），改金額即時重算；清空或輸入非數字視為 0。
// - 儲存送出的 SET_USER_SALARY_ITEM：員工 id、月份、備註與所有「有名稱且金額不為 0」的加扣項（不含內部用的 source 欄位），
//   成功後回薪資總覽；「儲存並上一筆／下一筆」依已月結員工的順序存檔後前往相鄰員工。已鎖定時欄位停用、沒有儲存按鈕。
// - 月份以網址 ?date= 為準（台灣時間）；店家開啟出勤統計時顯示打卡統計。
// GraphQL 全由模擬 link 回應，不連後端、不改真實薪資。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import SalaryEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SEPT = new Date(2026, 8, 1).getTime()

const RECORD = {
  totalTruthPerformance: 123456.78,
  designateTruthPerformance: 80000.04,
  nonDesignateTruthPerformance: 43456.74,
  specialTruthPerformance: 5000,
  designateRake: 32000,
  nonDesignateRake: 13037,
  specialRake: 500,
  productPerformance: 9000,
  productRake: 900,
  membershipPerformance: 0,
  membershipRake: 0,
  deductionItemOnSalary: 350,
  helperPaidPriceOnSalary: 1200,
  helperPaidPointOnSalary: 12,
  helperRetrievePrice: 800,
  helperRetrievePoint: 8,
  otherPayHandlingFeeOnSalary: 45.55,
  walletDepositHandlingFee: 30,
}

const baseFixtures = ({
  locked = false,
  memberActive = false,
  attendance = true,
  record = RECORD,
  autoSet = false,
  increase = [
    { itemName: '工資', price: 30000, type: 'INCREASE' },
    { itemName: '業績抽成', price: 12000, type: 'INCREASE' },
    { itemName: '交通津貼', price: 1500, type: 'INCREASE' },
  ],
  decrease = [
    { itemName: '勞健保費', price: 1200, type: 'DECREASE' },
    { itemName: '罰款', price: 300, type: 'DECREASE' },
    { itemName: '員工借支', price: 0, type: 'DECREASE' },
  ],
  remark = '九月補登',
} = {}) => ({
  GET_MERCHANT_SALARY_INCREASE_ITEMS: {
    getMerchantSalaryIncreaseItems: [
      { id: 'i2', itemSetting: '業績抽成', type: 'INCREASE', sorting: 2 },
      { id: 'i1', itemSetting: '工資', type: 'INCREASE', sorting: 1 },
      { id: 'i3', itemSetting: '會員卡獎金', type: 'INCREASE', sorting: 3 },
    ],
  },
  GET_MERCHANT_SALARY_DECREASE_ITEMS: {
    getMerchantSalaryDecreaseItems: [
      { id: 'd2', itemSetting: '員工借支', type: 'DECREASE', sorting: 2 },
      { id: 'd1', itemSetting: '勞健保費', type: 'DECREASE', sorting: 1 },
    ],
  },
  GET_USER_SALARY_ITEM: { userSalaryItemRecord: { userId: 'u2', increaseItem: increase, decreaseItem: decrease } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: memberActive },
  FETCH_USER_SALARY: { user: { id: 'u2', name: '小美', designerNo: 'A02', remarkForSalary: remark, salary: { id: 's1' } } },
  FETCH_USER_IS_SALARYCHECKED: { user: { isSalaryItemLocked: locked } },
  GET_ALL_USERS_SALARY_ITEMS: {
    users: {
      users: [
        { id: 'u1', name: '阿明', isSalaryChecked: true },
        { id: 'u2', name: '小美', isSalaryChecked: true },
        { id: 'u3', name: '未結', isSalaryChecked: false },
        { id: 'u4', name: '老王', isSalaryChecked: true },
      ],
    },
  },
  GET_USERS_IS_MONTH_CHECKOUT: {
    users: {
      users: [
        { id: 'u1', isSalaryChecked: true },
        { id: 'u2', isSalaryChecked: true },
        { id: 'u3', isSalaryChecked: false },
        { id: 'u4', isSalaryChecked: true },
      ],
    },
  },
  FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2: {
    getUserSalaryMonthlyCheckoutRecordV2: { salaryMonthlyCheckoutRecord: record, isHelperRetrireveAutoSet: autoSet },
  },
  GET_ATTENDANCE_STATISTICS: { getParameterCheckoutAndSalaryItemsSetting: { isAttendanceStatisticsDisplayOnUserSalary: attendance } },
  GET_ATTENDANCE_STATUS: { attendanceRecords: [{ totalClockInDays: 22, absenteeismDays: 1, totalLateMinutes: 15 }] },
  SET_USER_SALARY_ITEM: { setUserSalaryItem: true },
})

const setup = ({ id = 'u2', fixtures, ...options } = {}) =>
  renderPage(<SalaryEdit match={{ params: { id } }} location={{ search: `?date=${SEPT}` }} />, {
    route: `/salary/edit/${id}?date=${SEPT}`,
    fixtures: { ...baseFixtures(options), ...fixtures },
  })

const ready = async () => {
  await screen.findAllByText(/薪資加項小計/)
  await screen.findByText('實際匯款金額')
}
const increaseTitle = () => screen.getAllByText(/薪資加項小計/)[0].textContent
const decreaseTitle = () => screen.getAllByText(/薪資扣項小計/)[0].textContent
const actualTransfer = () => screen.getByText('實際匯款金額').parentElement.querySelector('.text-heading').textContent
const overviewValue = label => screen.getByText(label).parentElement.querySelector('.text-heading').textContent
const sentInput = calls => callsOf(calls, 'SET_USER_SALARY_ITEM')[0].variables.input
const increaseCard = () => screen.getAllByText(/薪資加項小計/)[0].closest('.ui-root').parentElement
const decreaseCard = () => screen.getAllByText(/薪資扣項小計/)[0].closest('.ui-root').parentElement

const realLocation = window.location
beforeEach(() => {
  loginAs()
  delete window.location
  window.location = { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', search: '', hash: '', reload: jest.fn() }
})
afterEach(() => {
  cleanup()
  window.location = realLocation
})

describe('薪資維護：帶入與金額', () => {
  it('依店家設定排序帶入已存金額；自訂項目列在下方；小計與實際匯款金額', async () => {
    const { calls } = setup()
    await ready()
    expect(screen.getByText('小美 2026/09 薪資表')).toBeInTheDocument()
    expect(screen.getByLabelText('備註')).toHaveValue('九月補登')
    // 已知缺口（待 Jason 決定）：SalaryEdit/index.js:186 帶入已存金額的加項時取 findData.sorting，但已存紀錄（GET_USER_SALARY_ITEM）沒有 sorting 欄位，
    // 有已存金額的加項失去排序、改依店家設定查詢回來的順序顯示（扣項取 data2.sorting 正常），儲存時 sorting 也送出 undefined；
    // 建議改用店家設定的 data.sorting。這裡鎖住目前行為：設定依序回傳「業績抽成(2)、工資(1)」時畫面也是這個順序。
    // 會員卡未啟用、獎金為 0 → 不顯示會員卡獎金
    const incLabels = within(increaseCard()).getAllByText(/^(工資|業績抽成|會員卡獎金)$/).map(n => n.textContent)
    expect(incLabels).toEqual(['業績抽成', '工資'])
    expect(screen.getByLabelText('工資')).toHaveValue('30000')
    expect(screen.getByLabelText('業績抽成')).toHaveValue('12000')
    expect(within(increaseCard()).getByLabelText('薪資加項科目')).toHaveValue('交通津貼')
    expect(within(increaseCard()).getByLabelText('加項金額')).toHaveValue(1500)
    expect(increaseTitle()).toBe('小美 (A02) - 薪資加項小計:43500')
    // 扣項：勞健保費(1)、員工借支(2，未填為 0)；罰款為自訂項目
    expect(screen.getByLabelText('勞健保費')).toHaveValue('1200')
    expect(screen.getByLabelText('員工借支')).toHaveValue('0')
    expect(within(decreaseCard()).getByLabelText('薪資扣項科目')).toHaveValue('罰款')
    expect(within(decreaseCard()).getByLabelText('扣項金額')).toHaveValue('300')
    expect(decreaseTitle()).toBe('小美 (A02) - 薪資扣項小計:1500')
    expect(actualTransfer()).toBe('42000')
    // 查詢月份為網址的 date
    expect(callsOf(calls, 'GET_USER_SALARY_ITEM')[0].variables.input).toEqual({ designerId: 'u2', date: SEPT })
    expect(callsOf(calls, 'FETCH_USER_SALARY')[0].variables).toEqual({ input: { id: 'u2' }, date: SEPT })
    expect(callsOf(calls, 'GET_ATTENDANCE_STATUS')[0].variables.input).toEqual({
      userId: 'u2',
      dateRange: { startDate: SEPT, endDate: new Date(2026, 8, 30, 23, 59, 59, 999).getTime() },
    })
  })

  it('月結紀錄：業績、抽成四捨五入到小數一位；會員卡業績為 0 且未啟用時不顯示；互助未自動帶入時提示', async () => {
    setup()
    await ready()
    await wait(() => expect(overviewValue('總實業績')).toBe('123456.8'))
    expect(overviewValue('指定抽成')).toBe('32000')
    expect(overviewValue('不指定抽成')).toBe('13037')
    expect(overviewValue('店販抽成')).toBe('900')
    expect(screen.queryByText('會員卡實業績')).toBeNull()
    expect(overviewValue('服務/卡券扣項')).toBe('350')
    expect(screen.getByText('互助使用總金額').parentElement.querySelector('.text-heading').textContent).toBe('1200(12)')
    expect(screen.getByText('互助獲得總金額').parentElement.querySelector('.text-heading').textContent).toBe('800(8)')
    expect(screen.getByText('(未自動帶入下方)')).toBeInTheDocument()
    expect(screen.getByText('手續費').parentElement.querySelector('.text-heading').textContent).toBe('45.6/ 30')
    const designate = screen.getByText('指定實業績').parentElement.querySelectorAll('.text-heading')
    expect(Array.from(designate).map(n => n.textContent)).toEqual(['80000', '43456.7'])
    // 出勤統計
    expect(screen.getByText('總打卡天數：22')).toBeInTheDocument()
    expect(screen.getByText('總曠職天數：1')).toBeInTheDocument()
    expect(screen.getByText('總遲到分鐘數：15')).toBeInTheDocument()
  })

  it('會員卡啟用：保留會員卡獎金欄位、顯示會員卡業績；互助已自動帶入時不提示；未開出勤統計時不顯示', async () => {
    setup({ memberActive: true, autoSet: true, attendance: false, record: { ...RECORD, membershipPerformance: 2000, membershipRake: 200 } })
    await ready()
    expect(screen.getByLabelText('會員卡獎金')).toHaveValue('0')
    await wait(() => expect(screen.getByText('會員卡實業績')).toBeInTheDocument())
    expect(Array.from(screen.getByText('店販實業績').parentElement.querySelectorAll('.text-heading')).map(n => n.textContent)).toEqual(['9000', '2000'])
    expect(Array.from(screen.getByText('店販抽成').parentElement.querySelectorAll('.text-heading')).map(n => n.textContent)).toEqual(['900', '200'])
    expect(screen.queryByText('(未自動帶入下方)')).toBeNull()
    expect(screen.queryByText('總打卡天數：22')).toBeNull()
  })

  it('會員卡未啟用但當月有會員卡業績時仍顯示；月結紀錄欄位為空時顯示 0', async () => {
    setup({ record: { membershipPerformance: 0, membershipRake: 50 } })
    await ready()
    await wait(() => expect(screen.getByText('會員卡抽成')).toBeInTheDocument())
    expect(overviewValue('總實業績')).toBe('0')
    expect(overviewValue('指定抽成')).toBe('0')
  })

  it('沒有已存加扣項時：店家設定項目皆為 0，自訂項目為一列空白；備註空白', async () => {
    setup({ increase: [], decrease: [], remark: null })
    await ready()
    expect(screen.getByLabelText('工資')).toHaveValue('0')
    expect(screen.getByLabelText('勞健保費')).toHaveValue('0')
    expect(within(increaseCard()).getByLabelText('薪資加項科目')).toHaveValue('')
    expect(within(decreaseCard()).getByLabelText('薪資扣項科目')).toHaveValue('')
    expect(screen.getByLabelText('備註')).toHaveValue('')
    expect(increaseTitle()).toBe('小美 (A02) - 薪資加項小計:0')
    expect(actualTransfer()).toBe('0')
  })

  it('開啟出勤統計但當月沒有出勤紀錄時不顯示統計', async () => {
    setup({ fixtures: { GET_ATTENDANCE_STATUS: { attendanceRecords: [] } } })
    await ready()
    expect(screen.queryByText(/總打卡天數/)).toBeNull()
  })

  it('員工沒有編號時標題不加括號', async () => {
    setup({ fixtures: { FETCH_USER_SALARY: { user: { id: 'u2', name: '小美', designerNo: '', remarkForSalary: '', salary: { id: 's1' } } } } })
    await ready()
    expect(increaseTitle()).toBe('小美  - 薪資加項小計:43500')
    expect(decreaseTitle()).toBe('小美  - 薪資扣項小計:1500')
  })

  it('改金額即時重算小計與實際匯款金額；清空或非數字視為 0', async () => {
    setup()
    await ready()
    fireEvent.change(screen.getByLabelText('工資'), { target: { name: 'price', value: '31000.5' } })
    expect(increaseTitle()).toBe('小美 (A02) - 薪資加項小計:44500.5')
    fireEvent.change(screen.getByLabelText('業績抽成'), { target: { name: 'price', value: '' } })
    expect(increaseTitle()).toBe('小美 (A02) - 薪資加項小計:32500.5')
    fireEvent.change(screen.getByLabelText('勞健保費'), { target: { name: 'price', value: 'abc' } })
    expect(decreaseTitle()).toBe('小美 (A02) - 薪資扣項小計:300')
    fireEvent.change(screen.getByLabelText('員工借支'), { target: { name: 'price', value: '2000' } })
    expect(decreaseTitle()).toBe('小美 (A02) - 薪資扣項小計:2300')
    // 自訂項目
    fireEvent.change(within(increaseCard()).getByLabelText('加項金額'), { target: { value: '' } })
    fireEvent.change(within(decreaseCard()).getByLabelText('扣項金額'), { target: { value: 'x' } })
    expect(decreaseTitle()).toBe('小美 (A02) - 薪資扣項小計:2000')
    fireEvent.change(within(decreaseCard()).getByLabelText('扣項金額'), { target: { value: '450' } })
    expect(increaseTitle()).toBe('小美 (A02) - 薪資加項小計:31000.5')
    expect(actualTransfer()).toBe(String(31000.5 - 2450))
  })
})

describe('薪資維護：儲存', () => {
  it('儲存送出所有有名稱且金額不為 0 的加扣項、月份與備註，成功後回薪資總覽', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.change(screen.getByLabelText('備註'), { target: { value: '九月補登獎金' } })
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' }))
    expect(sentInput(calls)).toEqual({
      userId: 'u2',
      date: SEPT,
      remark: '九月補登獎金',
      // 加項的 sorting 目前為 undefined（見上方已知缺口）
      userSalaryItem: [
        { itemName: '業績抽成', price: 12000, type: 'INCREASE', sorting: undefined },
        { itemName: '工資', price: 30000, type: 'INCREASE', sorting: undefined },
        { itemName: '勞健保費', price: 1200, type: 'DECREASE', sorting: 1 },
        { itemName: '交通津貼', price: 1500, type: 'INCREASE' },
        { itemName: '罰款', price: 300, type: 'DECREASE' },
      ],
    })
    expect(sentInput(calls).userSalaryItem.map(i => i.itemName)).toEqual(['業績抽成', '工資', '勞健保費', '交通津貼', '罰款'])
    expect(window.location.href).toBe(`/salary/overview?date=${SEPT}`)
  })

  it('新增、修改、刪除自訂項目後送出的就是畫面上的項目；與店家設定同名的自訂項目不重複送出', async () => {
    const { calls } = setup()
    await ready()
    const inc = within(increaseCard())
    fireEvent.click(inc.getByLabelText('新增一項'))
    const names = inc.getAllByLabelText('薪資加項科目')
    expect(names).toHaveLength(2)
    // 新增後游標移到新的一列科目
    await wait(() => expect(document.activeElement).toBe(names[1]))
    fireEvent.change(names[1], { target: { name: 'itemName', value: '全勤獎金' } })
    fireEvent.change(inc.getAllByLabelText('加項金額')[1], { target: { name: 'price', value: '2000' } })
    // 刪除第一列（交通津貼）
    fireEvent.click(inc.getAllByLabelText('刪除此項')[0])
    expect(inc.getAllByLabelText('薪資加項科目').map(n => n.value)).toEqual(['全勤獎金'])
    // 扣項：新增一列名稱與店家設定相同（勞健保費），送出時只留店家設定那一筆
    const dec = within(decreaseCard())
    fireEvent.click(dec.getByLabelText('新增一項'))
    await wait(() => expect(document.activeElement).toBe(dec.getAllByLabelText('薪資扣項科目')[1]))
    fireEvent.change(dec.getAllByLabelText('薪資扣項科目')[1], { target: { name: 'itemName', value: '勞健保費' } })
    fireEvent.change(dec.getAllByLabelText('扣項金額')[1], { target: { name: 'price', value: '99' } })
    fireEvent.click(dec.getAllByLabelText('刪除此項')[0])
    expect(dec.getAllByLabelText('薪資扣項科目').map(n => n.value)).toEqual(['勞健保費'])
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    await wait(() => expect(callsOf(calls, 'SET_USER_SALARY_ITEM')).toHaveLength(1))
    expect(sentInput(calls).userSalaryItem).toEqual([
      { itemName: '業績抽成', price: 12000, type: 'INCREASE' },
      { itemName: '工資', price: 30000, type: 'INCREASE' },
      { itemName: '勞健保費', price: 1200, type: 'DECREASE', sorting: 1 },
      { itemName: '全勤獎金', price: 2000, type: 'INCREASE' },
    ])
  })

  it('返回：不儲存直接回薪資總覽', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    expect(window.location.href).toBe(`/salary/overview?date=${SEPT}`)
    expect(callsOf(calls, 'SET_USER_SALARY_ITEM')).toHaveLength(0)
  })

  // 自訂項目改成與店家設定同名時只送店家設定那一筆
  const renameCustomToDuplicates = () => {
    fireEvent.change(within(increaseCard()).getByLabelText('薪資加項科目'), { target: { name: 'itemName', value: '工資' } })
    fireEvent.change(within(decreaseCard()).getByLabelText('薪資扣項科目'), { target: { name: 'itemName', value: '勞健保費' } })
  }
  // 自訂加項改成同名；扣項新增一列同名（保留原本的罰款）
  const addDuplicateRows = () => {
    fireEvent.change(within(increaseCard()).getByLabelText('薪資加項科目'), { target: { name: 'itemName', value: '工資' } })
    fireEvent.click(within(decreaseCard()).getByLabelText('新增一項'))
    fireEvent.change(within(decreaseCard()).getAllByLabelText('薪資扣項科目')[1], { target: { name: 'itemName', value: '勞健保費' } })
    fireEvent.change(within(decreaseCard()).getAllByLabelText('扣項金額')[1], { target: { name: 'price', value: '1' } })
  }
  const PARAMETER_ITEMS = [
    { itemName: '業績抽成', price: 12000, type: 'INCREASE' },
    { itemName: '工資', price: 30000, type: 'INCREASE' },
    { itemName: '勞健保費', price: 1200, type: 'DECREASE', sorting: 1 },
  ]
  const WITH_FINE = [...PARAMETER_ITEMS, { itemName: '罰款', price: 300, type: 'DECREASE' }]

  it('儲存並下一筆：存檔後前往下一位已月結員工（跳過未月結者）', async () => {
    const { calls } = setup()
    await ready()
    addDuplicateRows()
    fireEvent.click(await screen.findByRole('button', { name: '儲存並下一筆' }))
    await wait(() => expect(window.location.href).toBe(`/salary/edit/u4?date=${SEPT}`))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' })
    expect(sentInput(calls)).toEqual({ userId: 'u2', date: SEPT, remark: '九月補登', userSalaryItem: WITH_FINE })
  })

  it('儲存並上一筆：存檔後前往上一位已月結員工', async () => {
    const { calls } = setup()
    await ready()
    addDuplicateRows()
    fireEvent.click(await screen.findByRole('button', { name: '儲存並上一筆' }))
    await wait(() => expect(window.location.href).toBe(`/salary/edit/u1?date=${SEPT}`))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' })
    expect(sentInput(calls)).toEqual({ userId: 'u2', date: SEPT, remark: '九月補登', userSalaryItem: WITH_FINE })
  })

  it('儲存：自訂加項與店家設定同名時只送店家設定那一筆', async () => {
    const { calls } = setup()
    await ready()
    renameCustomToDuplicates()
    fireEvent.click(screen.getByRole('button', { name: '儲存' }))
    await wait(() => expect(callsOf(calls, 'SET_USER_SALARY_ITEM')).toHaveLength(1))
    expect(sentInput(calls).userSalaryItem).toEqual(PARAMETER_ITEMS)
  })

  it('目前員工不在已月結名單時視為第一位（沒有「上一筆」）', async () => {
    setup({ id: 'u3' })
    await ready()
    expect(await screen.findByRole('button', { name: '儲存並下一筆' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '儲存並上一筆' })).toBeNull()
  })

  it('第一位沒有「上一筆」、最後一位沒有「下一筆」', async () => {
    setup({ id: 'u1' })
    await ready()
    expect(await screen.findByRole('button', { name: '儲存並下一筆' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '儲存並上一筆' })).toBeNull()
    cleanup()
    setup({ id: 'u4' })
    await ready()
    expect(await screen.findByRole('button', { name: '儲存並上一筆' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '儲存並下一筆' })).toBeNull()
  })

  it('已鎖定：欄位停用，沒有儲存與上一筆／下一筆，也不能新增或刪除自訂項目', async () => {
    setup({ locked: true })
    await ready()
    await wait(() => expect(screen.getByLabelText('工資')).toBeDisabled())
    expect(within(increaseCard()).getByLabelText('薪資加項科目')).toBeDisabled()
    expect(screen.queryByRole('button', { name: '儲存' })).toBeNull()
    expect(screen.queryByRole('button', { name: '儲存並下一筆' })).toBeNull()
    expect(screen.queryByLabelText('新增一項')).toBeNull()
    expect(screen.queryByRole('button', { name: '返回' })).toBeInTheDocument()
  })
})

describe('薪資維護：鍵盤連續輸入', () => {
  it('加項：Enter 依序跳到下一個金額，最後一項跳到自訂科目，科目 Enter 跳到金額，金額 Enter 跳到扣項', async () => {
    setup({ memberActive: true, increase: [{ itemName: '交通津貼', price: 1500, type: 'INCREASE' }] })
    await ready()
    const wage = screen.getByLabelText('工資')
    wage.focus()
    fireEvent.keyDown(wage, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(screen.getByLabelText('業績抽成')))
    fireEvent.keyDown(screen.getByLabelText('業績抽成'), { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByLabelText('業績抽成'))
    fireEvent.keyDown(screen.getByLabelText('業績抽成'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(screen.getByLabelText('會員卡獎金')))
    fireEvent.keyDown(screen.getByLabelText('會員卡獎金'), { key: 'Enter' })
    const incName = within(increaseCard()).getByLabelText('薪資加項科目')
    await wait(() => expect(document.activeElement).toBe(incName))
    fireEvent.keyDown(incName, { key: 'a' })
    fireEvent.keyDown(incName, { key: 'Enter' })
    const incPrice = within(increaseCard()).getByLabelText('加項金額')
    await wait(() => expect(document.activeElement).toBe(incPrice))
    fireEvent.keyDown(incPrice, { key: 'a' })
    expect(document.activeElement).toBe(incPrice)
    // 滾輪不改金額（先移開焦點）
    fireEvent.wheel(incPrice)
    expect(document.activeElement).not.toBe(incPrice)
    incPrice.focus()
    fireEvent.keyDown(incPrice, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(screen.getByLabelText('勞健保費')))
  })

  // 已知缺口（待 Jason 決定）：SalaryIncrease.js:167 判斷「是否最後一項」用店家設定的項目數（含被隱藏的會員卡獎金），
  // 會員卡未啟用而隱藏會員卡獎金時，在最後一個加項按 Enter 會把游標指到不存在的第 N+1 項：輸入框的 ref 先被 React 清成 null，
  // SalaryIncrease.js:122-123 的 effect 只排除 undefined、對 null 呼叫 focus() 拋錯，整頁變錯誤畫面（輸入到一半的加扣項全部消失）。
  // 建議改用 increaseCombined.length（扣項已是如此），並在 effect 改判斷 textFieldRef.current 是否存在。
  it('會員卡獎金被隱藏時，在最後一個加項按 Enter 目前整頁進入錯誤畫面（鎖住現況）', async () => {
    setup({ increase: [] })
    await ready()
    const last = screen.getByLabelText('業績抽成')
    last.focus()
    fireEvent.keyDown(last, { key: 'Enter' })
    expect(await screen.findByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })

  it('加項自訂項目有多列時，金額 Enter 跳到下一列科目', async () => {
    setup()
    await ready()
    const inc = within(increaseCard())
    fireEvent.click(inc.getByLabelText('新增一項'))
    const firstPrice = inc.getAllByLabelText('加項金額')[0]
    firstPrice.focus()
    fireEvent.keyDown(firstPrice, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(inc.getAllByLabelText('薪資加項科目')[1]))
  })

  it('扣項：Enter 依序跳到下一個金額，最後一項跳到自訂科目；多列時金額 Enter 跳到下一列科目', async () => {
    setup()
    await ready()
    const dec = within(decreaseCard())
    const labor = screen.getByLabelText('勞健保費')
    labor.focus()
    fireEvent.keyDown(labor, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(screen.getByLabelText('員工借支')))
    fireEvent.keyDown(screen.getByLabelText('員工借支'), { key: 'a' })
    fireEvent.keyDown(screen.getByLabelText('員工借支'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(dec.getByLabelText('薪資扣項科目')))
    fireEvent.keyDown(dec.getByLabelText('薪資扣項科目'), { key: 'a' })
    fireEvent.keyDown(dec.getByLabelText('薪資扣項科目'), { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(dec.getByLabelText('扣項金額')))
    // 只有一列：Enter 不移動
    fireEvent.keyDown(dec.getByLabelText('扣項金額'), { key: 'Enter' })
    expect(document.activeElement).toBe(dec.getByLabelText('扣項金額'))
    fireEvent.click(dec.getByLabelText('新增一項'))
    const firstPrice = dec.getAllByLabelText('扣項金額')[0]
    firstPrice.focus()
    fireEvent.keyDown(firstPrice, { key: 'Enter' })
    await wait(() => expect(document.activeElement).toBe(dec.getAllByLabelText('薪資扣項科目')[1]))
  })
})
