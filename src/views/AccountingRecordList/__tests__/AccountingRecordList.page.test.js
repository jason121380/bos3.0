// 保護「高階收支登錄」列表：
// - 預設查本月 1 日 00:00 到今天 23:59:59.999（台灣時間）、1000 筆、科目／收付方式／關係人不篩選
// - 合計卡：區間文字、收入、支出、合計＝收入−支出（千分位）
// - 每筆：科目（沒有科目時空白）、收入或支出欄依 inoutType、登錄者「姓名/編號」、收付方式、關係人、備註、編輯連結
// - 報表匯出（CSV）內容與表格一致
// - 篩選：選科目、收付方式後送出對應的查詢參數
// - 快速選擇日期：已知缺口（待 Jason 決定）——快捷選項只回傳起訖，頁面整個覆蓋查詢條件，分頁筆數與篩選條件被丟掉
// - 查詢失敗時不整頁壞
// GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, format, startOfDay, startOfMonth, subDays } from 'date-fns'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AccountingRecordList from '..'

jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

const FLOWS = [
  {
    id: 'f-1',
    date: new Date(2026, 9, 3, 10, 0).getTime(),
    accountingSubject: { id: 'a-1', name: '技術收入' },
    inoutType: 'REVENUE',
    amount: 12000,
    walletType: '現金',
    remark: '十月第一週',
    user: { id: 'u-1', name: '店長', designerNo: 'A1' },
    relationUser: { name: '王小美' },
  },
  {
    id: 'f-2',
    date: new Date(2026, 9, 4, 23, 30).getTime(),
    accountingSubject: null,
    inoutType: 'EXPENDITURE',
    amount: 3500,
    walletType: '匯款',
    remark: '',
    user: { id: 'u-2', name: '會計', designerNo: null },
    relationUser: null,
  },
  {
    id: 'f-3',
    date: new Date(2026, 9, 5, 0, 0).getTime(),
    accountingSubject: { id: 'a-2', name: '雜支' },
    inoutType: 'EXPENDITURE',
    amount: 80,
    walletType: '現金',
    remark: '',
    user: null,
    relationUser: null,
  },
]

const fixtures = {
  GET_MONEY_FLOW_FOR_ACCOUNTING: {
    moneyFlows: { moneyFlows: FLOWS, pageLimit: 1000, pageOffset: 0, totalCount: 3, revenue: 12000, expenditure: 3580 },
  },
  GET_ACCOUNTING_SUBJECTS: { accountingSubjects: [{ id: 'a-1', name: '技術收入', isUsing: true }, { id: 'a-2', name: '雜支', isUsing: true }] },
  GET_ACCOUNTING_TYPE: { getAccountingType: ['現金', '匯款'] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [] },
}

const setup = (extra = {}) => renderPage(<AccountingRecordList />, { fixtures: { ...fixtures, ...extra }, route: '/accounting' })
const lastInput = calls => {
  const list = callsOf(calls, 'GET_MONEY_FLOW_FOR_ACCOUNTING')
  return list[list.length - 1].variables.input
}
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const field = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (label, optionText) => {
  fireEvent.click(field(label))
  fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === optionText))
}
const cells = text => within(screen.getByText(text).closest('tr')).getAllByRole('cell').map(c => c.textContent)

describe('高階收支登錄', () => {
  it('預設查本月 1 日到今天整天、1000 筆、不篩選', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_MONEY_FLOW_FOR_ACCOUNTING')[0].variables.input).toEqual({
      pageLimit: 1000,
      pageOffset: 0,
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
      accountingSubjectName: '',
      payTypeKeyWord: '',
      relationUserId: '',
    })
  })

  it('合計卡顯示區間與收入、支出、合計（收入−支出）', async () => {
    const { settle } = setup()
    await settle()
    const title = `${format(startOfMonth(new Date()), 'yyyy/MM/dd')} ~ ${format(new Date(), 'yyyy/MM/dd')} 合計`
    const card = screen.getByText(title).closest('.mb-6')
    expect(within(card).getAllByRole('cell').map(c => c.textContent)).toEqual(['12,000', '3,580', '8,420'])
  })

  it('每筆顯示科目、收入或支出、登錄者、收付方式、關係人、備註與編輯連結，匯出檔內容一致', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.getByText('共 3 筆')).toBeInTheDocument()
    expect(cells('十月第一週')).toEqual(['', '2026/10/03', '技術收入', '12,000', '', '店長/A1', '現金', '王小美', '十月第一週'])
    expect(cells('會計/')).toEqual(['', '2026/10/04', '', '', '3,500', '會計/', '匯款', '', ''])
    expect(cells('雜支')).toEqual(['', '2026/10/05', '雜支', '', '80', '', '現金', '', ''])
    expect(screen.getAllByLabelText('編輯').map(a => a.getAttribute('href'))).toEqual([
      '/accounting/deatil/f-1',
      '/accounting/deatil/f-2',
      '/accounting/deatil/f-3',
    ])
    await wait(() => expect(exportedCsv()).toContain('"2026/10/03","技術收入","12000","","店長/A1","現金","王小美","十月第一週"'))
    expect(exportedCsv()).toContain('"2026/10/04","","","3500","會計/","匯款","",""')
    expect(screen.getByText('報表匯出').closest('a').getAttribute('download')).toBe('高階收支登錄.csv')
  })

  it('打開篩選選科目與收付方式，查詢帶入科目名稱與收付方式關鍵字（日期與筆數不變）', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    await settle()
    choose('選擇科目', '雜支')
    await wait(() => expect(lastInput(calls)).toMatchObject({ accountingSubjectName: '雜支', pageLimit: 1000 }))
    await settle()
    choose('收付方式', '匯款')
    await wait(() =>
      expect(lastInput(calls)).toMatchObject({
        accountingSubjectName: '雜支',
        payTypeKeyWord: '匯款',
        startDate: startOfMonth(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
      })
    )
    // 再按一次篩選收起
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    expect(screen.queryByText('選擇科目')).toBeNull()
  })

  it('已知缺口（待 Jason 決定）：快速選擇「昨天」後，查詢只剩起訖，分頁筆數與篩選條件被丟掉', async () => {
    // DateSelector 的快捷選項只回傳 { startDate, endDate }，頁面以 setPageSetting(value) 整個覆蓋
    const { calls, settle } = setup()
    await settle()
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        startDate: startOfDay(subDays(new Date(), 1)).getTime(),
        endDate: endOfDay(subDays(new Date(), 1)).getTime(),
      })
    )
  })

  it('查詢失敗時只顯示標題，不進錯誤畫面', async () => {
    const { settle } = setup({ GET_MONEY_FLOW_FOR_ACCOUNTING: new Error('查詢失敗') })
    await settle()
    expect(screen.getAllByText('高階收支登錄').length).toBeGreaterThan(0)
    expect(screen.queryByText('報表匯出')).toBeNull()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
