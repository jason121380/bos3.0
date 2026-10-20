import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import PageErrorBoundary from '../PageErrorBoundary'

afterEach(cleanup)

const Broken = () => {
  throw new Error('data is undefined')
}

// 為什麼重要：沒有錯誤邊界時，任何一頁渲染出錯（例如 API 失敗、資料為 null）整個後台會白畫面，
// 側欄也點不了。錯誤邊界要把錯誤限制在內容區，並提供重新整理的方式。
describe('PageErrorBoundary', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => console.error.mockRestore())

  it('頁面出錯時只在內容區顯示說明與重新整理，旁邊的版面照常顯示', () => {
    render(
      <div>
        <nav>側欄</nav>
        <PageErrorBoundary resetKey="/order/create">
          <Broken />
        </PageErrorBoundary>
      </div>
    )
    expect(screen.getByText('側欄')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('這個頁面發生錯誤')
    expect(screen.getByRole('button', { name: '重新整理' })).toBeInTheDocument()
  })

  it('換到別的頁面（resetKey 改變）時重置，正常顯示新頁面', () => {
    const { rerender } = render(
      <PageErrorBoundary resetKey="/order/create">
        <Broken />
      </PageErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    rerender(
      <PageErrorBoundary resetKey="/management/orders">
        <p>帳單列表</p>
      </PageErrorBoundary>
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('帳單列表')).toBeInTheDocument()
  })

  it('正常頁面不受影響', () => {
    render(
      <PageErrorBoundary resetKey="/a">
        <p>內容</p>
      </PageErrorBoundary>
    )
    expect(screen.getByText('內容')).toBeInTheDocument()
  })
})
