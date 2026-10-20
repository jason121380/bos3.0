import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Link as RouterLink } from 'react-router-dom'

import { List, ListItemButton, ListItemText } from '../list-compat'
import { Link } from '../link-compat'
import { Snackbar, Alert } from '../feedback-compat'

afterEach(cleanup)

describe('ui/list-compat（與 MUI List 系列相容）', () => {
  // 預約行事曆的操作選單（新預約、結帳、取消預約…）：可點、可鍵盤操作；停用時不可點也不可 Tab 到
  it('ListItemButton 是可聚焦的按鈕，Enter 觸發；disabled 時不觸發', () => {
    const onClick = jest.fn()
    const onDisabled = jest.fn()
    render(
      <List>
        <ListItemButton onClick={onClick}>
          <ListItemText primary="結帳" />
        </ListItemButton>
        <ListItemButton disabled onClick={onDisabled}>
          <ListItemText primary="取消預約" />
        </ListItemButton>
      </List>
    )
    const checkout = screen.getByRole('button', { name: '結帳' })
    expect(checkout).toHaveAttribute('tabindex', '0')
    fireEvent.click(checkout)
    fireEvent.keyDown(checkout, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)
    const cancel = screen.getByRole('button', { name: '取消預約' })
    expect(cancel).toHaveAttribute('aria-disabled', 'true')
    expect(cancel).toHaveAttribute('tabindex', '-1')
    fireEvent.click(cancel)
    expect(onDisabled).not.toHaveBeenCalled()
  })
})

describe('ui/link-compat（與 MUI Link 相容）', () => {
  // 帳單、顧客、預約頁的連結以 react-router Link 導頁，target="_blank" 另開分頁
  it('component={RouterLink} 時 to／target 照傳', () => {
    render(
      <MemoryRouter>
        <Link component={RouterLink} to="/order/1?status=edit" color="inherit" underline="none" target="_blank">
          編輯帳單
        </Link>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: '編輯帳單' })
    expect(link).toHaveAttribute('href', '/order/1?status=edit')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveClass('MuiLink-root', 'MuiLink-underlineNone')
  })
})

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
