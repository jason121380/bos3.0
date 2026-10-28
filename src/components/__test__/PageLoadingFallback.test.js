import React from 'react'
import { act, render, screen } from '@testing-library/react'
import PageLoadingFallback, { SHOW_SPINNER_DELAY } from 'components/PageLoadingFallback'

// 頁面程式下載中的佔位。原本只有一條 2px 細線，網路慢時使用者看到的是白頁（2026/10/28 回報「進去一直白頁」）。
// 這裡鎖住兩件事：快的時候不閃出轉圈；慢的時候內容區一定看得到「載入中…」。
describe('PageLoadingFallback', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('一開始只有頂端細線與讀屏可讀的「載入中…」，不立刻閃出轉圈', () => {
    const { container } = render(<PageLoadingFallback />)
    expect(screen.getByRole('status')).toHaveTextContent('載入中…')
    expect(container.querySelector('.animate-spin')).toBeNull()
    expect(screen.getByText('載入中…')).toHaveClass('sr-only')
  })

  it('超過延遲還沒載完，內容區中央顯示轉圈與看得到的「載入中…」', () => {
    const { container } = render(<PageLoadingFallback />)
    act(() => {
      jest.advanceTimersByTime(SHOW_SPINNER_DELAY)
    })
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(screen.getByText('載入中…')).not.toHaveClass('sr-only')
  })

  it('延遲設 0 時立刻顯示；載完卸載後不再更新狀態', () => {
    const { container, unmount } = render(<PageLoadingFallback delay={0} />)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    unmount()
    const second = render(<PageLoadingFallback />)
    second.unmount()
    expect(() => act(() => jest.advanceTimersByTime(SHOW_SPINNER_DELAY))).not.toThrow()
  })
})
