import { act, render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import AccountingRecordCreate from '../index'

// 原本的 '../Header' 元件已不存在（git 歷史中也找不到）：頁首標題現在由 index.js 的 PageHeader 負責，
// 因此改為渲染頁面本身；表單 General 需要大量 API，這裡只測頁首，所以 mock 掉。
jest.mock('../General', () => ({
  __esModule: true,
  default: () => <div data-testid="general-form" />,
}))

// 測試範圍
describe('<Header />', () => {
  let wrapper = null

  beforeEach(() => {
    localStorage.clear()
  })

  // 測試案例
  it('should render Chinese title correctly', async () => {
    await act(async () => {
      wrapper = await render(
        <MemoryRouter>
          <AccountingRecordCreate />
        </MemoryRouter>
      )
    })
    const hasCorrectTitle = wrapper.getAllByText('新增收借支紀錄')
    expect(hasCorrectTitle.length).toBeGreaterThan(0)
  })

  // 原測試還檢查英文標題 'Create Accounting Record'，目前畫面上沒有任何英文標題（改版前亦無），故移除該案例。

  it('should render the stay-in-create checkbox', async () => {
    await act(async () => {
      wrapper = await render(
        <MemoryRouter>
          <AccountingRecordCreate />
        </MemoryRouter>
      )
    })
    expect(wrapper.getByLabelText('連續新增收借支')).toBeTruthy()
  })
})
