// 保護「收支科目明細」：
// - 預設查詢本月 1 日 00:00 到今天 23:59:59.999（台灣時間）、每頁 20 筆、第 1 頁
// - 每天一列：收入合計＝各收入科目相加、支出合計＝各支出科目相加、結餘合計＝收入合計＋支出合計（支出以負數記）
// - 改日期（快捷鈕）、換頁、改每頁筆數都送出對應的查詢參數（改每頁筆數回到第 1 頁）
// - 查詢失敗時不整頁壞
// GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays, endOfDay, startOfDay, startOfMonth } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AccountingSubject from '..'

jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

const day = {
  date: new Date(2026, 9, 5, 0, 0).getTime(),
  // 收入
  operatingIncome: 10000,
  salesRevenue: 2000,
  temporaryCollection: 300,
  // 支出（負數）
  houseRent: -5000,
  waterFee: -120,
  booksMagazinesAndFees: -80,
}

const setup = (fixtures = {}, route = '/accountingSubject') =>
  renderPage(<AccountingSubject />, {
    fixtures: {
      MONEY_ACCOUNT_DETAIL: v => ({
        moneyAccountDetail: { totalCount: 45, pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, data: [day] },
      }),
      ...fixtures,
    },
    route,
  })

const lastInput = calls => {
  const list = callsOf(calls, 'MONEY_ACCOUNT_DETAIL')
  return list[list.length - 1].variables.input
}

describe('收支科目明細', () => {
  it('預設查本月 1 日到今天整天、每頁 20 筆第 1 頁', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'MONEY_ACCOUNT_DETAIL')[0].variables.input).toEqual({
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
      pageLimit: 20,
      pageOffset: 0,
    })
    expect(screen.getByText(/共 45 筆, 1 \/ 3/)).toBeInTheDocument()
  })

  it('收入合計、支出合計、結餘合計依各科目加總（千分位）', async () => {
    const { settle } = setup()
    await settle()
    const row = within(screen.getByText('2026/10/05').closest('tr'))
    const cells = row.getAllByRole('cell').map(c => c.textContent)
    expect(cells.slice(0, 4)).toEqual(['2026/10/05', '12,300', '-5,200', '7,100'])
    expect(row.getByText('10,000')).toBeInTheDocument()
    expect(row.getByText('-80')).toBeInTheDocument()
  })

  it('按「昨天」改查昨天整天，換頁與改每頁筆數送出對應分頁參數', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '昨天' }))
    await wait(() =>
      expect(lastInput(calls)).toMatchObject({
        startDate: startOfDay(addDays(new Date(), -1)).getTime(),
        endDate: endOfDay(addDays(new Date(), -1)).getTime(),
      })
    )
    await settle()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(lastInput(calls)).toMatchObject({ pageOffset: 1, pageLimit: 20 }))
    await settle()
    expect(screen.getByText(/共 45 筆, 2 \/ 3/)).toBeInTheDocument()
    const perPage = screen.getByLabelText('每頁筆數')
    // 選項：5, 10, 20, 25, 1000 → 第 1 個（10 筆）
    fireEvent.change(perPage, { target: { value: '1' } })
    await wait(() => expect(lastInput(calls)).toMatchObject({ pageOffset: 0, pageLimit: 10 }))
  })

  it('查詢失敗時只顯示標題與搜尋列，不進錯誤畫面', async () => {
    const { settle } = setup({ MONEY_ACCOUNT_DETAIL: new Error('查詢失敗') })
    await settle()
    expect(screen.getAllByText('收支科目明細').length).toBeGreaterThan(0)
    expect(screen.queryByText(/共 \d+ 筆,/)).toBeNull()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
