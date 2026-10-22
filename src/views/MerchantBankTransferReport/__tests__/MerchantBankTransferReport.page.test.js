// 保護「薪資轉帳明細」（整頁以瀏覽器列印輸出，TransferDetail／表格 class 為列印範本，本測試只驗證內容不改版面）：
// - 預設以「一個月前的現在」查薪資轉帳（台灣時間）；快速選擇「上個月」改查上個月 1 日；網址帶的月份直接查詢
// - 轉帳申請書帶入店家銀行設定（帳號、銀行、分行、聯絡人、電話），未設定的欄位留白
// - 名冊：分行、帳號、戶名、轉帳金額＝加項－扣項；預設全選，取消勾選的人不列印（salaryTransferNoDsiplay）、不計入合計
// - 全選框：部分勾選為 indeterminate，按下全選／全不選
// - 沒有資料顯示「無資料」；薪資或銀行設定查詢失敗、銀行設定尚未建立（null）都不整頁錯誤（Jason 2026/10/22）
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfMonth, subMonths } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickQuickDate } from '../../__tests__/stockKit.test'
import MerchantBankTransferReport from '..'

jest.setTimeout(20000)

const BANK = {
  remitterName: '美髮店',
  remitterBankName: '台灣銀行',
  remitterBankAccount: '012-345678',
  remitterBankBranchName: '信義分行',
  remitterBankBranchCode: '0123',
  trustorName: '林會計',
  trustorPhone: '02-2345-6789',
}
const SALARY = [
  { id: 'u1', name: '王小美', designerNo: 'A1', bankCode: '004', bankName: '台灣銀行', bankBranchName: '大安', bankAccount: '111', increaseItem: 50000, decreaseItem: 2000 },
  { id: 'u2', name: '陳大文', designerNo: 'A2', bankCode: '004', bankName: '台灣銀行', bankBranchName: '信義', bankAccount: '222', increaseItem: 30000, decreaseItem: 500 },
]
const setup = ({ bank = BANK, salary = SALARY, ...options } = {}) =>
  renderPage(<MerchantBankTransferReport />, {
    fixtures: {
      GET_MERCHANT_BANK_SETTINGS: { getMerchantBankSettings: bank },
      FETCH_GET_USER_SALARY_TRANSFER_REPORT: { userSalaryTransferReport: salary },
    },
    route: '/report/bank-transfer',
    ...options,
  })
const rowOf = name => screen.getByText(name).closest('tr')
const totalCell = () => [...screen.getByText('合計').closest('tr').querySelectorAll('td')].pop().textContent
const inputValues = () => [...document.querySelectorAll('.TransferDetailpPrint input')].map(input => input.value)
const lastDate = calls => callsOf(calls, 'FETCH_GET_USER_SALARY_TRANSFER_REPORT').pop().variables.date

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資轉帳明細', () => {
  it('預設查一個月前；快速選擇「上個月」改查上個月 1 日；網址帶的月份直接查詢', async () => {
    const before = subMonths(new Date(), 1).getTime()
    const { calls, settle } = setup()
    await settle()
    const first = callsOf(calls, 'FETCH_GET_USER_SALARY_TRANSFER_REPORT')[0].variables.date
    expect(first).toBeGreaterThanOrEqual(before)
    expect(first).toBeLessThanOrEqual(subMonths(new Date(), 1).getTime())
    pickQuickDate('上個月')
    await wait(() => expect(lastDate(calls)).toBe(startOfMonth(subMonths(new Date(), 1)).getTime()))
    cleanup()
    const start = new Date(2026, 7, 1).getTime()
    const second = setup({ route: `/report/bank-transfer?startDate=${start}&endDate=${start}` })
    await second.settle()
    expect(lastDate(second.calls)).toBe(start)
  })

  it('申請書帶入銀行設定；未設定的欄位留白', async () => {
    const { settle } = setup()
    await settle()
    // 年、月、日（今天）、帳號、合計（手填）、銀行、分行
    const values = inputValues()
    expect(values.slice(3)).toEqual(['012-345678', '', '台灣銀行', '信義分行'])
    expect(screen.getByText('聯絡人：林會計')).toBeInTheDocument()
    expect(screen.getByText('電話：02-2345-6789')).toBeInTheDocument()
    cleanup()
    const blank = setup({
      bank: { ...BANK, remitterBankAccount: null, remitterBankName: null, remitterBankBranchName: null, trustorName: null, trustorPhone: null },
    })
    await blank.settle()
    expect(inputValues().slice(3)).toEqual([' ', '', '', ''])
    expect(screen.getByText('聯絡人：')).toBeInTheDocument()
    expect(screen.getByText('電話：')).toBeInTheDocument()
  })

  it('名冊預設全選，轉帳金額＝加項－扣項；取消勾選的人不列印、不計入合計；全選框切換', async () => {
    const { settle } = setup()
    await settle()
    expect([...rowOf('王小美').querySelectorAll('td')].map(td => td.textContent)).toEqual(['', '大安', '111', '王小美', '48000'])
    expect(totalCell()).toBe('77500')
    const selectAll = screen.getByLabelText('全選')
    expect(selectAll.checked).toBe(true)
    fireEvent.click(within(rowOf('陳大文')).getByLabelText('選取'))
    expect(totalCell()).toBe('48000')
    expect(rowOf('陳大文')).toHaveClass('salaryTransferNoDsiplay')
    expect(rowOf('王小美')).not.toHaveClass('salaryTransferNoDsiplay')
    expect(selectAll.indeterminate).toBe(true)
    fireEvent.click(within(rowOf('陳大文')).getByLabelText('選取'))
    expect(totalCell()).toBe('77500')
    fireEvent.click(selectAll)
    expect(totalCell()).toBe('0')
    expect(selectAll.checked).toBe(false)
    fireEvent.click(selectAll)
    expect(totalCell()).toBe('77500')
  })

  it('列印呼叫瀏覽器列印', async () => {
    window.print = jest.fn()
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByText('列印'))
    expect(window.print).toHaveBeenCalled()
  })

  it('沒有資料顯示「無資料」；查詢失敗、銀行設定為 null 都不整頁錯誤', async () => {
    const empty = setup({ salary: [] })
    await empty.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const noBank = setup({ bank: null })
    await noBank.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('王小美')).toBeInTheDocument()
    cleanup()
    const failed = setup({ fixtures: {}, fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})
