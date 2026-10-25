import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { HeaderActionsPortal, HeaderActionsSlot, PageHeader, ReportToolbar } from '../page-header'

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

  // 報表篩選（STYLE §14）：日期與搜尋一直看得到；其餘條件收在「篩選」卡片，預設收合但不卸載（店家挑選等元件自己保存已選值）
  it('ReportToolbar：篩選預設收合、點擊展開，收合時條件仍掛載；搜尋在外面', () => {
    render(
      <ReportToolbar
        date={<input aria-label="日期" />}
        filters={<input aria-label="店家" defaultValue="A 店" />}
        actions={<button type="button">搜尋</button>}
      />
    )
    const toggle = screen.getByRole('button', { name: '篩選' })
    const store = screen.getByLabelText('店家')
    expect(screen.getByLabelText('日期').parentElement.className).toContain('gap-2')
    expect(toggle.className).toContain('h-9')
    expect(toggle.className).toContain('max-sm:h-10')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(store).not.toBeVisible()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeVisible()
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('店家')).toBe(store)
    expect(store).toHaveValue('A 店')
    expect(store).toBeVisible()
  })

  // 只有日期的報表不需要篩選鈕
  it('沒有 filters 時不顯示篩選鈕', () => {
    render(<ReportToolbar date={<input aria-label="日期" />} />)
    expect(screen.queryByRole('button', { name: '篩選' })).toBeNull()
  })
})
