// 保護「顧客入金餘額表」：每位顧客的編號、姓名、所屬設計師、儲值餘額與合計；報表匯出檔與畫面同內容並加合計列；
// 以設計師／顧客篩選時送出的 designerId／customerId 為陣列（清除後為空陣列）。GraphQL 全由 testkit 的模擬 link 回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerWalletBalance from '..'

jest.setTimeout(20000)

jest.mock('components/EmployeeAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="designer" data-value={String(value)}>
    <button type="button" onClick={() => onChange({ userId: 'designer-1', userName: '王小美' })}>選設計師</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除設計師</button>
  </div>
))
jest.mock('components/CustomerAutoComplete', () => ({ value, onChange }) => (
  <div data-testid="customer" data-value={value}>
    <button type="button" onClick={() => onChange({ id: 'customer-1', name: '陳小姐' })}>選顧客</button>
    <button type="button" onClick={() => onChange({ id: '' })}>清除顧客</button>
  </div>
))

const REPORT = [
  { customerId: 'c1', customerName: '陳小姐', customerNickName: '', customerNo: 'C01', leftWallet: 12000, preferDesignerName: '王小美' },
  { customerId: 'c2', customerName: '林先生', customerNickName: '', customerNo: 'C02', leftWallet: 500, preferDesignerName: 'Amy' },
]

const setup = (fixtures = {}) =>
  renderPage(<CustomerWalletBalance />, {
    fixtures: { GET_CUSTOMER_WALLET_BALANCE: { customerWalletReport: { customerWalletReport: REPORT } }, ...fixtures },
  })

const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const lastInput = calls => callsOf(calls, 'GET_CUSTOMER_WALLET_BALANCE').pop().variables.input

beforeEach(() => loginAs())
afterEach(cleanup)

describe('顧客入金餘額表', () => {
  it('列出每位顧客的餘額與合計，匯出檔內容相同並含合計列', async () => {
    const utils = setup()
    await utils.settle()
    expect(lastInput(utils.calls)).toEqual({ pageLimit: 50, pageOffset: 0, designerId: [], customerId: [] })
    const row = screen.getByText('陳小姐').closest('tr')
    expect(within(row).getByText('C01')).toBeInTheDocument()
    expect(within(row).getByText('王小美')).toBeInTheDocument()
    expect(within(row).getByText('12,000')).toBeInTheDocument()
    expect(within(screen.getByText('合計').closest('tr')).getByText('12,500')).toBeInTheDocument()
    await wait(() => expect(exportedCsv()).toContain('"C01","陳小姐","王小美","12000"'))
    expect(exportedCsv()).toContain('"合計","","","12500"')
  })

  it('選設計師、選顧客後以陣列送出篩選；清除後回到空陣列', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('選設計師'))
    await wait(() => expect(lastInput(utils.calls).designerId).toEqual(['designer-1']))
    expect(screen.getByTestId('designer')).toHaveAttribute('data-value', 'designer-1')
    fireEvent.click(screen.getByText('選顧客'))
    await wait(() => expect(lastInput(utils.calls).customerId).toEqual(['customer-1']))
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', 'customer-1')
    fireEvent.click(screen.getByText('清除設計師'))
    await wait(() => expect(lastInput(utils.calls).designerId).toEqual([]))
    fireEvent.click(screen.getByText('清除顧客'))
    await wait(() => expect(lastInput(utils.calls).customerId).toEqual([]))
    expect(screen.getByTestId('customer')).toHaveAttribute('data-value', '')
  })

  it('沒有資料時合計為 0', async () => {
    const utils = setup({ GET_CUSTOMER_WALLET_BALANCE: { customerWalletReport: { customerWalletReport: [] } } })
    await utils.settle()
    expect(within(screen.getByText('合計').closest('tr')).getByText('0')).toBeInTheDocument()
  })

  // 查詢失敗時以空陣列處理：合計 0、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示；
  // 原本 effect 直接 report.reduce 拋錯；Jason 2026/10/22 fix all）
  it('查詢失敗：合計為 0、匯出只有合計列，不整頁錯誤', async () => {
    const utils = setup({ GET_CUSTOMER_WALLET_BALANCE: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    expect(within(screen.getByText('合計').closest('tr')).getByText('0')).toBeInTheDocument()
    expect(exportedCsv()).toContain('"合計","0"')
  })
})
