import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { HeaderActionsPortal, HeaderActionsSlot, PageHeader } from '../page-header'

afterEach(cleanup)

describe('ui/page-header 頁首動作插槽', () => {
  // 費用分析／損益表／付款報表：「報表匯出」的資料與 handler 在 Results 內，按鈕要出現在頁首列印鈕左側（STYLE §14）
  it('HeaderActionsPortal 把按鈕畫進頁首插槽，排在列印左側，點擊仍呼叫原 handler', () => {
    const onExport = jest.fn()
    render(
      <>
        <PageHeader
          title="損益表"
          actions={
            <>
              <HeaderActionsSlot />
              <button type="button">列印</button>
            </>
          }
        />
        <section aria-label="報表內容">
          <HeaderActionsPortal>
            <button type="button" onClick={onExport}>
              報表匯出
            </button>
          </HeaderActionsPortal>
        </section>
      </>
    )
    const exportButton = screen.getByRole('button', { name: '報表匯出' })
    expect(screen.getByRole('region', { name: '報表內容' })).not.toContainElement(exportButton)
    const buttons = screen.getAllByRole('button').map(b => b.textContent)
    expect(buttons.indexOf('報表匯出')).toBeLessThan(buttons.indexOf('列印'))
    fireEvent.click(exportButton)
    expect(onExport).toHaveBeenCalledTimes(1)
  })

  // 頁面沒有放插槽時不能讓匯出鈕消失
  it('沒有插槽時照原位置渲染', () => {
    render(
      <HeaderActionsPortal>
        <button type="button">報表匯出</button>
      </HeaderActionsPortal>
    )
    expect(screen.getByRole('button', { name: '報表匯出' })).toBeInTheDocument()
  })
})
