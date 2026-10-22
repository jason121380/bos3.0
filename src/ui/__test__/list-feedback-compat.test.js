import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { Snackbar, Alert } from '../feedback-compat'

afterEach(cleanup)

describe('ui/feedback-compat（與 MUI Snackbar／Alert 相容）', () => {
  // 全站提示訊息：時間到以 'timeout' 關閉；滑鼠停在訊息上時暫停計時（使用者正在讀）
  it('autoHideDuration 到時以 timeout 呼叫 onClose，滑鼠移入時暫停', () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    render(
      <Snackbar open autoHideDuration={3000} onClose={onClose}>
        <Alert severity="success" variant="filled">
          已儲存
        </Alert>
      </Snackbar>
    )
    const root = screen.getByRole('alert').parentElement
    act(() => jest.advanceTimersByTime(2000))
    fireEvent.mouseEnter(root)
    act(() => jest.advanceTimersByTime(5000))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseLeave(root)
    act(() => jest.advanceTimersByTime(1500))
    expect(onClose).toHaveBeenCalledWith(null, 'timeout')
    jest.useRealTimers()
  })

  // 點訊息以外的地方以 'clickaway' 關閉；開啟它的那次點擊不算
  it('點畫面其他地方以 clickaway 呼叫 onClose', () => {
    jest.useFakeTimers()
    const onClose = jest.fn()
    render(
      <>
        <button type="button">頁面</button>
        <Snackbar open onClose={onClose} message="提示" />
      </>
    )
    fireEvent.click(screen.getByText('頁面'))
    expect(onClose).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1))
    fireEvent.click(screen.getByText('頁面'))
    expect(onClose.mock.calls[0][1]).toBe('clickaway')
    jest.useRealTimers()
  })

  it('關閉時不渲染；Alert 以 role=alert 讓報讀器朗讀', () => {
    const { rerender } = render(
      <Snackbar open={false}>
        <Alert severity="error">失敗</Alert>
      </Snackbar>
    )
    expect(screen.queryByText('失敗')).toBeNull()
    rerender(
      <Snackbar open>
        <Alert severity="error">失敗</Alert>
      </Snackbar>
    )
    expect(screen.getByRole('alert')).toHaveTextContent('失敗')
  })
})
