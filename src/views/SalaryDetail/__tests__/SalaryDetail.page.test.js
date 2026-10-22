// 保護「薪資明細表」的金額：加項總覽每位員工的「加項合計」＝16 個加項之和、「實發金額」目前另含指定／不指定業績（見已知缺口），
// 合計列為各欄全部員工加總；扣項總覽的「減項合計」＝21 個扣項之和、合計列為各欄加總。
// 分頁（換頁、每頁筆數）只影響該表的查詢參數；網址帶的日期換算成該月 1 日（台灣時間）再查詢。
// GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { formatNumber } from 'ui/format'
import SalaryDetail from '..'
import IncreaseResult from '../IncreaseResult'
import DecreaseResult from '../DecreaseResult'

jest.setTimeout(20000)

// 欄位順序與畫面欄位相同
const INCREASE = [
  'wage', 'mealAllowance', 'additionOfDuties', 'laborhealthInsurance', 'attendanceBonus', 'salesBonus', 'salesCommission',
  'specialCommission', 'shampooCommission', 'hairCareCommission', 'hotDyeingCommission', 'otherCommission', 'otherAllowance',
  'reward', 'customerReturn', 'performanceCommission',
]
const DECREASE = [
  'tuition', 'educationFee', 'tourismFund', 'savings', 'welfare', 'laborHealthPremium', 'selfPurchasedMaterials', 'employeeLoan',
  'deductionForSickLeave', 'illegalCharge', 'lateRetreat', 'DeductionOfLiabilityDue', 'giftdeduction', 'managementOfficeEquipment',
  'mutualDeduction', 'advances', 'dormitoryCosts', 'creditCardFee', 'salaryArrears', 'customerArrears', 'derelictionOfDuty',
]
const sum = list => list.reduce((a, b) => a + b, 0)

// 每個欄位給不同的金額，算錯欄位或漏加一項都會讓合計不同
const salaryOf = (fields, base, extra = {}) => ({ ...Object.fromEntries(fields.map((f, i) => [f, base * (i + 1)])), ...extra })
const incUser = (id, name, base) => ({
  id, name, designerNo: `N${id}`, jobTitle: '設計師',
  salary: salaryOf(INCREASE, base, { designateSales: 10000 * base, notDesignateSales: 5000 * base, points: 3 * base }),
})
const decUser = (id, name, base) => ({ id, name, designerNo: `N${id}`, jobTitle: '助理', salary: salaryOf(DECREASE, base) })

const INC_USERS = [incUser('1', '小美', 100), incUser('2', '阿明', 7)]
const DEC_USERS = [decUser('1', '小美', 10), decUser('2', '阿明', 3)]

const setup = ({ route = '/salary/detail', inc = INC_USERS, dec = DEC_USERS } = {}) =>
  renderPage(<SalaryDetail />, {
    route,
    fixtures: {
      FETCH_USER_SALARY_INCREASE: v => ({ users: { totalCount: 45, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, users: inc } }),
      FETCH_USER_SALARY_DECREASE: v => ({ users: { totalCount: 45, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, users: dec } }),
    },
  })

const card = title => screen.getByText(title).closest('.ui-root').parentElement
const cellsOf = tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
const rowIn = (title, name) => cellsOf(within(card(title)).getByText(name).closest('tr'))
// 下拉以選項索引當 value，依顯示文字選取
const choose = (select, text) =>
  fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === text).value } })
const totalIn = title => cellsOf(within(card(title)).getByText('合 計:').closest('tr'))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資明細表：加項總覽', () => {
  it('每位員工各加項、加項合計、實發金額與業績、點數', async () => {
    setup()
    await screen.findByText('加項總覽')
    const s = INC_USERS[0].salary
    const items = INCREASE.map(f => s[f])
    const itemsTotal = sum(items)
    expect(rowIn('加項總覽', '小美')).toEqual([
      'N1', '小美', '設計師',
      // 已知缺口（待 Jason 決定）：IncreaseResult.js:65-82 的「實發金額」把指定業績、不指定業績（營業額，不是薪資）也加進去，
      // 與「加項合計」不同、金額明顯偏高；建議改為與加項合計相同（或依真正的實發公式），這裡鎖住目前行為。
      formatNumber(itemsTotal + s.designateSales + s.notDesignateSales),
      ...items.map(formatNumber),
      formatNumber(itemsTotal),
      formatNumber(s.designateSales), formatNumber(s.notDesignateSales), formatNumber(s.points),
    ])
  })

  it('合計列為各欄全部員工加總', async () => {
    setup()
    await screen.findByText('加項總覽')
    const col = f => sum(INC_USERS.map(u => u.salary[f]))
    const itemsTotal = sum(INCREASE.map(col))
    expect(totalIn('加項總覽')).toEqual([
      '合 計:', '',
      formatNumber(itemsTotal + col('designateSales') + col('notDesignateSales')),
      ...INCREASE.map(f => formatNumber(col(f))),
      formatNumber(itemsTotal),
      formatNumber(col('designateSales')), formatNumber(col('notDesignateSales')), formatNumber(col('points')),
    ])
  })

  // 已知缺口（待 Jason 決定）：IncreaseResult.js:24 的筆數與頁數用「這一頁的人數」而非 totalCount（扣項總覽用 totalCount），
  // 總共 45 人、每頁 20 人時顯示「共 2 筆資料, 1/1 頁」；建議改用 pageSetting.totalCount。
  it('標題的筆數與頁數目前以本頁人數計算（鎖住現況）', async () => {
    setup()
    await screen.findByText('加項總覽')
    expect(within(card('加項總覽')).getByText('共 2 筆資料, 1/1 頁')).toBeInTheDocument()
    expect(within(card('扣項總覽')).getByText('共 45 筆資料, 1/3 頁')).toBeInTheDocument()
  })

  it('換頁與每頁筆數只改加項總覽的查詢；每頁筆數改變時回到第一頁', async () => {
    const { calls, settle } = setup()
    await screen.findByText('加項總覽')
    await settle()
    fireEvent.click(within(card('加項總覽')).getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_INCREASE').map(c => c.variables.input.pageOffset)).toContain(1))
    expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').every(c => c.variables.input.pageOffset === 0)).toBe(true)
    await settle()
    choose(within(card('加項總覽')).getByLabelText('每頁筆數'), '5')
    await wait(() =>
      expect(callsOf(calls, 'FETCH_USER_SALARY_INCREASE').map(c => c.variables.input)).toContainEqual({ pageLimit: 5, pageOffset: 0, isStaff: false })
    )
  })
})

describe('薪資明細表：扣項總覽', () => {
  it('每位員工各扣項與減項合計；合計列為各欄加總', async () => {
    setup()
    await screen.findByText('扣項總覽')
    const s = DEC_USERS[0].salary
    const items = DECREASE.map(f => s[f])
    expect(rowIn('扣項總覽', '小美')).toEqual(['N1', '小美', '助理', ...items.map(formatNumber), formatNumber(sum(items))])
    const col = f => sum(DEC_USERS.map(u => u.salary[f]))
    expect(totalIn('扣項總覽')).toEqual(['合 計:', '', ...DECREASE.map(f => formatNumber(col(f))), formatNumber(sum(DECREASE.map(col)))])
  })

  it('換頁與每頁筆數只改扣項總覽的查詢', async () => {
    const { calls, settle } = setup()
    await screen.findByText('扣項總覽')
    await settle()
    fireEvent.click(within(card('扣項總覽')).getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').map(c => c.variables.input.pageOffset)).toContain(1))
    expect(callsOf(calls, 'FETCH_USER_SALARY_INCREASE').every(c => c.variables.input.pageOffset === 0)).toBe(true)
    await settle()
    choose(within(card('扣項總覽')).getByLabelText('每頁筆數'), '10')
    await wait(() =>
      expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').map(c => c.variables.input)).toContainEqual({ pageLimit: 10, pageOffset: 0, isStaff: false })
    )
  })
})

describe('薪資明細表：月份', () => {
  it('進頁先查今天 00:00；網址帶日期時改查該月 1 日 00:00（台灣時間）', async () => {
    const mid = new Date(2026, 8, 15, 10, 0).getTime()
    const { calls, settle } = setup({ route: `/salary/detail?startDate=${mid}&endDate=${mid}` })
    await settle()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expect(callsOf(calls, 'FETCH_USER_SALARY_INCREASE')[0].variables.date).toBe(today.getTime())
    const dates = callsOf(calls, 'FETCH_USER_SALARY_INCREASE').map(c => c.variables.date)
    expect(dates).toContain(new Date(2026, 8, 1).getTime())
    expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').map(c => c.variables.date)).toContain(new Date(2026, 8, 1).getTime())
  })

  // 已知缺口（待 Jason 決定）：員工沒有當月薪資資料（salary 為 null）時，IncreaseResult.js:65／DecreaseResult.js:63 直接讀 data.salary.xxx 拋錯，
  // 整頁變錯誤畫面；建議以 0 顯示或略過該員工。
  it('員工薪資資料為 null 時目前整頁進入錯誤畫面（鎖住現況）', async () => {
    setup({ inc: [{ id: '9', name: '新人', designerNo: 'N9', jobTitle: '助理', salary: null }] })
    expect(await screen.findByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})

describe('薪資明細表：沒有員工', () => {
  it('兩張表單獨使用（未給 className）且沒有員工時，合計列全為 0', () => {
    const page = { totalCount: 0, pageLimit: 20, pageOffset: 0 }
    renderPage(
      <>
        <IncreaseResult users={[]} pageSetting={page} handleOnChangePage={() => {}} handleOnChangeRowsPerPage={() => {}} />
        <DecreaseResult users={[]} pageSetting={page} handleOnChangePage={() => {}} handleOnChangeRowsPerPage={() => {}} />
      </>
    )
    expect(totalIn('加項總覽').slice(2).every(v => v === '0')).toBe(true)
    expect(totalIn('扣項總覽').slice(2).every(v => v === '0')).toBe(true)
  })
})
