// QueryFailed 預設文案與 Page 沒有標題的情況。
// 為什麼重要：QueryFailed 是全站主查詢失敗時的畫面（CLAUDE.md：有主查詢就要有失敗畫面），不帶參數也要寫出原因與下一步；
// 沒給 onRetry 時不能出現點了沒反應的「重新查詢」。Page 沒給 title 時不能把分頁標題改成 "undefined"。
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QueryFailed from '../QueryFailed'
import Page from '../Page'

afterEach(cleanup)

describe('QueryFailed', () => {
  it('不帶參數：顯示預設標題與說明，沒有重新查詢鈕', () => {
    render(<QueryFailed />)
    expect(screen.getByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByText('請再試一次。列表不會一直停在載入中。')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('有 onRetry：預設按鈕「重新查詢」呼叫 onRetry；可自訂文案', () => {
    const onRetry = jest.fn()
    render(<QueryFailed onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: '重新查詢' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    cleanup()
    render(<QueryFailed title="商品載入失敗" description="請檢查網路" onRetry={onRetry} retryLabel="再試一次" />)
    expect(screen.getByText('商品載入失敗')).toBeInTheDocument()
    expect(screen.getByText('請檢查網路')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再試一次' })).toBeInTheDocument()
  })
})

describe('Page', () => {
  it('沒有 title 時不改分頁標題；有 title 時設定', () => {
    document.title = '原標題'
    render(
      <MemoryRouter>
        <Page>內容</Page>
      </MemoryRouter>
    )
    expect(document.title).toBe('原標題')
    expect(screen.getByText('內容')).toBeInTheDocument()
    cleanup()
    render(
      <MemoryRouter>
        <Page title="打帳單">內容</Page>
      </MemoryRouter>
    )
    expect(document.title).toBe('打帳單')
  })
})
