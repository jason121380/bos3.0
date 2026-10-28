// 保護「薪資明細表」的金額：加項總覽每位員工的「加項合計」＝16 個加項之和、「實發金額」＝加項合計 − 扣項合計（同一位員工、同月），
// 不含指定／不指定業績（Jason 2026/10/22「只算加扣項」）；扣項讀不到時實發金額顯示「—」；
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

const decTotalOf = user => sum(DECREASE.map(f => user.salary[f]))

describe('薪資明細表：加項總覽', () => {
  it('每位員工各加項、加項合計、實發金額與業績、點數', async () => {
    setup()
    await screen.findByText('加項總覽')
    const s = INC_USERS[0].salary
    const items = INCREASE.map(f => s[f])
    const itemsTotal = sum(items)
    await wait(() => expect(rowIn('加項總覽', '小美')[3]).not.toBe('—'))
    expect(rowIn('加項總覽', '小美')).toEqual([
      'N1', '小美', '設計師',
      // 實發金額＝加項合計 − 同一位員工的扣項合計，不加入指定／不指定業績（營業額）（Jason 2026/10/22「只算加扣項」）
      formatNumber(itemsTotal - decTotalOf(DEC_USERS[0])),
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
    await wait(() => expect(totalIn('加項總覽')[2]).not.toBe('—'))
    expect(totalIn('加項總覽')).toEqual([
      '合 計:', '',
      // 實發金額合計＝加項合計 − 扣項合計（全部員工）
      formatNumber(itemsTotal - sum(DEC_USERS.map(decTotalOf))),
      ...INCREASE.map(f => formatNumber(col(f))),
      formatNumber(itemsTotal),
      formatNumber(col('designateSales')), formatNumber(col('notDesignateSales')), formatNumber(col('points')),
    ])
  })

  // 標題的筆數與頁數用後端 totalCount（Jason 2026/10/22，與扣項總覽相同；修正前用本頁人數）。
  // 加項、扣項是兩支獨立查詢，加項先畫出來時扣項總覽還沒掛上；要等兩支都回來再斷言。
  it('標題的筆數與頁數以 totalCount 計算', async () => {
    const { settle } = setup()
    await settle()
    expect(within(card('加項總覽')).getByText('共 45 筆資料, 1/3 頁')).toBeInTheDocument()
    expect(within(card('扣項總覽')).getByText('共 45 筆資料, 1/3 頁')).toBeInTheDocument()
  })

  // 實發金額要扣同一頁員工的扣項：以扣項總覽的同一支查詢（FETCH_USER_SALARY_DECREASE）、加項總覽的分頁查詢；
  // 兩表分頁相同時與扣項總覽共用同一份結果（不多送查詢）。
  it('實發金額只扣同一位員工的扣項（依 id 對應，不依列順序）', async () => {
    setup({ dec: [DEC_USERS[1], DEC_USERS[0]] })
    await screen.findByText('加項總覽')
    const net = (inc, dec) => formatNumber(sum(INCREASE.map(f => inc.salary[f])) - decTotalOf(dec))
    await wait(() => expect(rowIn('加項總覽', '小美')[3]).toBe(net(INC_USERS[0], DEC_USERS[0])))
    expect(rowIn('加項總覽', '阿明')[3]).toBe(net(INC_USERS[1], DEC_USERS[1]))
  })

  it('扣項讀不到（查詢失敗）時實發金額顯示「—」，不誤顯示成只有加項', async () => {
    renderPage(<SalaryDetail />, {
      fixtures: {
        FETCH_USER_SALARY_INCREASE: v => ({ users: { totalCount: 2, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, users: INC_USERS } }),
        FETCH_USER_SALARY_DECREASE: new Error('查詢失敗'),
      },
    })
    await screen.findByText('加項總覽')
    await wait(() => expect(rowIn('加項總覽', '小美')[3]).toBe('—'))
    expect(rowIn('加項總覽', '阿明')[3]).toBe('—')
    expect(totalIn('加項總覽')[2]).toBe('—')
    // 加項合計照常顯示
    expect(rowIn('加項總覽', '小美')[20]).toBe(formatNumber(sum(INCREASE.map(f => INC_USERS[0].salary[f]))))
  })

  // 兩支查詢共用 users 根欄位的快取（同一位員工的薪資資料會合併），以元件直接驗證扣項缺漏的情況
  it('扣項中沒有這位員工或薪資資料為 null 時扣項視為 0', () => {
    const page = { totalCount: 2, pageLimit: 20, pageOffset: 0 }
    renderPage(
      <IncreaseResult
        users={INC_USERS}
        decreaseUsers={[{ ...DEC_USERS[0], salary: null }]}
        pageSetting={page}
        handleOnChangePage={() => {}}
        handleOnChangeRowsPerPage={() => {}}
      />
    )
    const incTotalOf = user => sum(INCREASE.map(f => user.salary[f]))
    expect(rowIn('加項總覽', '小美')[3]).toBe(formatNumber(incTotalOf(INC_USERS[0])))
    expect(rowIn('加項總覽', '阿明')[3]).toBe(formatNumber(incTotalOf(INC_USERS[1])))
    expect(totalIn('加項總覽')[2]).toBe(formatNumber(incTotalOf(INC_USERS[0]) + incTotalOf(INC_USERS[1])))
  })

  it('換頁與每頁筆數只改加項總覽的查詢；每頁筆數改變時回到第一頁', async () => {
    const { calls, settle } = setup()
    await screen.findByText('加項總覽')
    await settle()
    // 兩表分頁相同：實發金額與扣項總覽共用同一份扣項查詢
    expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE')).toHaveLength(1)
    fireEvent.click(within(card('加項總覽')).getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_INCREASE').map(c => c.variables.input.pageOffset)).toContain(1))
    // 加項換到第 2 頁：另以同一支扣項查詢、加項的分頁取得這一頁員工的扣項（算實發金額）；扣項總覽仍在第 1 頁
    await wait(() => expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').map(c => c.variables.input.pageOffset)).toContain(1))
    expect(within(card('扣項總覽')).getByText('共 45 筆資料, 1/3 頁')).toBeInTheDocument()
    // 加項、扣項查詢共用 users 根欄位的快取（既有情況，換頁前第 1 頁也一樣）：互相覆蓋時各重抓一次後就穩定，不會反覆重抓
    await settle()
    const settledCount = calls.length
    await settle()
    expect(calls.length).toBe(settledCount)
    expect(callsOf(calls, 'FETCH_USER_SALARY_DECREASE').filter(c => c.variables.input.pageOffset === 1)).toHaveLength(1)
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

  // 員工沒有當月薪資資料（salary 為 null）時各欄以 0 顯示（Jason 2026/10/22；修正前整頁錯誤）。
  it('員工薪資資料為 null 時各欄以 0 顯示', async () => {
    const { settle } = setup({
      inc: [{ id: '9', name: '新人', designerNo: 'N9', jobTitle: '助理', salary: null }, ...INC_USERS],
      dec: [{ id: '9', name: '新人', designerNo: 'N9', jobTitle: '助理', salary: null }, ...DEC_USERS],
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(rowIn('加項總覽', '新人').slice(3).every(v => v === '0')).toBe(true)
    expect(rowIn('扣項總覽', '新人').slice(3).every(v => v === '0')).toBe(true)
    // 合計列不受影響（實發金額合計＝加項合計 − 扣項合計）
    expect(totalIn('加項總覽')[2]).toBe(
      formatNumber(sum(INCREASE.map(f => sum(INC_USERS.map(u => u.salary[f])))) - sum(DEC_USERS.map(decTotalOf)))
    )
  })
})

describe('薪資明細表：沒有員工', () => {
  it('兩張表單獨使用（未給 className）且沒有員工時，合計列全為 0', () => {
    const page = { totalCount: 0, pageLimit: 20, pageOffset: 0 }
    renderPage(
      <>
        <IncreaseResult users={[]} decreaseUsers={[]} pageSetting={page} handleOnChangePage={() => {}} handleOnChangeRowsPerPage={() => {}} />
        <DecreaseResult users={[]} pageSetting={page} handleOnChangePage={() => {}} handleOnChangeRowsPerPage={() => {}} />
      </>
    )
    expect(totalIn('加項總覽').slice(2).every(v => v === '0')).toBe(true)
    expect(totalIn('扣項總覽').slice(2).every(v => v === '0')).toBe(true)
  })

  it('加項總覽沒有給扣項資料時實發金額合計顯示「—」', () => {
    const page = { totalCount: 0, pageLimit: 20, pageOffset: 0 }
    renderPage(<IncreaseResult users={[]} pageSetting={page} handleOnChangePage={() => {}} handleOnChangeRowsPerPage={() => {}} />)
    expect(totalIn('加項總覽')[2]).toBe('—')
    expect(totalIn('加項總覽').slice(3).every(v => v === '0')).toBe(true)
  })
})
