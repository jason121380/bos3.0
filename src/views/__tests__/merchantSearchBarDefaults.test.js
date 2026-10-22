// 保護：報表搜尋列的設計師／科目欄預設是「全部」（不自動帶入第一位設計師或第一個科目）——Jason 2026/10/22 決定維持。
// 原本設計師細項分析、互助點數明細傳 initFirst={['employee']}、高階／現金收支登錄傳 initFirst={['subject']}，
// 但搜尋列只把 employee 轉給 EmployeeAutoComplete，而 EmployeeAutoComplete 不支援 initFirst、科目欄也沒收到，
// 兩者都沒有作用；已移除這些沒有作用的設定（Jason 2026/10/22 fix all），頁面行為不變。
// 這裡把搜尋列換成替身，記錄頁面傳入的 props；GraphQL 由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs } from '../../__tests__/testkit.test'

const mockBars = []
jest.mock('components/MerchantSearchBar', () => props => {
  mockBars.push(props)
  return <div data-testid="merchant-search-bar" />
})

jest.setTimeout(20000)

beforeEach(() => {
  loginAs()
  mockBars.length = 0
})
afterEach(cleanup)

const renderModule = modulePath => {
  const Page = require(modulePath).default
  return renderPage(<Page match={{ params: { id: '1' } }} location={{ pathname: '/page/1', search: '' }} />, { route: '/page/1' })
}

describe('報表搜尋列：設計師／科目預設為「全部」，不傳沒有作用的 initFirst', () => {
  it.each([
    ['views/DesignerPerformDetail', 'employeeId'],
    ['views/DecreaseDetail', 'employeeId'],
  ])('%s：設計師欄沒有預設值、不傳 initFirst', async (modulePath, key) => {
    const { settle } = renderModule(modulePath)
    await settle()
    expect(mockBars.length).toBeGreaterThan(0)
    const props = mockBars[mockBars.length - 1]
    expect(props.visible).toContain('employee')
    expect(props.values[key]).toBeFalsy()
    expect('initFirst' in props).toBe(false)
  })

  it.each([['views/GeneralAccountingRecordList'], ['views/AccountingRecordList']])(
    '%s：展開篩選後科目欄沒有預設值、不傳 initFirst',
    async modulePath => {
      const { settle } = renderModule(modulePath)
      await settle()
      fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
      await wait(() => expect(screen.getByTestId('merchant-search-bar')).toBeInTheDocument())
      const props = mockBars[mockBars.length - 1]
      expect(props.visible).toContain('subject')
      expect(props.values.accountingSubjectName).toBeFalsy()
      expect('initFirst' in props).toBe(false)
    }
  )
})
