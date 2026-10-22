import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText } from '../list-compat'
import { Typography } from '../display-compat'

// 保護什麼：舊頁面（切換店家清單、選單、搜尋結果）用的 MUI List 相容元件。
// - ListItemButton 同 MUI ButtonBase：Enter 在 keydown、空白鍵在 keyup 觸發點擊；停用時不觸發、不可 Tab 聚焦；
//   component="button" 時交給原生按鈕處理（不重複觸發、用原生 disabled）。
// - dense 由 List 傳到子項目（MUI class：MuiList-dense／MuiListItemButton-dense／MuiListItemText-dense），
//   ListItemText 以 Typography 包住 primary／secondary（頁面 '.MuiListItemText-primary' 選擇器靠它）。

afterEach(cleanup)

describe('List', () => {
  it('dense 與 subheader 輸出 MUI class，disablePadding 時不加 padding', () => {
    render(
      <List data-testid="l" dense subheader={<li>分店</li>} disablePadding>
        <li>a</li>
      </List>
    )
    const l = screen.getByTestId('l')
    expect(l.tagName).toBe('UL')
    expect(l).toHaveClass('MuiList-dense', 'MuiList-subheader')
    expect(l).not.toHaveClass('MuiList-padding')
    expect(l.firstChild).toHaveTextContent('分店')
  })
})

describe('ListItemButton：鍵盤與停用', () => {
  it('空白鍵在 keyup 觸發點擊（keydown 只防止頁面捲動）；呼叫端 onKeyDown／onKeyUp 照常收到', () => {
    const onClick = jest.fn()
    const onKeyDown = jest.fn()
    const onKeyUp = jest.fn()
    render(
      <ListItemButton onClick={onClick} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
        A 店
      </ListItemButton>
    )
    const btn = screen.getByRole('button')
    const down = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    btn.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    fireEvent.keyUp(btn, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onKeyDown).toHaveBeenCalled()
    expect(onKeyUp).toHaveBeenCalled()
    // 其他按鍵不觸發
    fireEvent.keyUp(btn, { key: 'a' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('停用時空白鍵也不觸發；沒有 onClick 時 keyup 不拋錯', () => {
    const onClick = jest.fn()
    const { rerender } = render(
      <ListItemButton disabled onClick={onClick}>
        A 店
      </ListItemButton>
    )
    fireEvent.keyUp(screen.getByRole('button'), { key: ' ' })
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).not.toHaveBeenCalled()
    rerender(<ListItemButton>A 店</ListItemButton>)
    expect(() => {
      fireEvent.click(screen.getByRole('button'))
      fireEvent.keyUp(screen.getByRole('button'), { key: ' ' })
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    }).not.toThrow()
  })

  it('子元素上的按鍵不觸發本列（event.target 必須是本列）', () => {
    const onClick = jest.fn()
    render(
      <ListItemButton onClick={onClick}>
        <input aria-label="內部輸入" />
      </ListItemButton>
    )
    const inner = screen.getByLabelText('內部輸入')
    fireEvent.keyUp(inner, { key: ' ' })
    fireEvent.keyDown(inner, { key: 'Enter' })
    const down = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    inner.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('component="button" 時用原生 disabled、不加 role，鍵盤交給瀏覽器（不重複觸發）', () => {
    const onClick = jest.fn()
    const { rerender } = render(
      <ListItemButton component="button" onClick={onClick}>
        A 店
      </ListItemButton>
    )
    const btn = screen.getByRole('button')
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).not.toHaveAttribute('role')
    fireEvent.keyDown(btn, { key: 'Enter' })
    fireEvent.keyUp(btn, { key: ' ' })
    expect(onClick).not.toHaveBeenCalled()
    rerender(
      <ListItemButton component="button" disabled>
        A 店
      </ListItemButton>
    )
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled')
  })

  it('tabIndex 可自訂；divider／selected／alignItems=flex-start 與 List 的 dense 輸出 MUI class', () => {
    render(
      <List dense>
        <ListItemButton tabIndex={-1} divider selected alignItems="flex-start">
          A 店
        </ListItemButton>
      </List>
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('tabindex', '-1')
    expect(btn).toHaveClass('MuiListItemButton-dense', 'MuiListItemButton-divider', 'Mui-selected', 'MuiListItemButton-alignItemsFlexStart')
  })
})

describe('ListItemText', () => {
  it('primary 可用 children 給；dense 時為 body2；secondary 包成 Typography 並標 multiline', () => {
    const { container } = render(
      <List dense>
        <ListItemText inset secondary="台北市" secondaryTypographyProps={{ className: 'sec' }}>
          A 店
        </ListItemText>
      </List>
    )
    const root = container.querySelector('.MuiListItemText-root')
    expect(root).toHaveClass('MuiListItemText-dense', 'MuiListItemText-inset', 'MuiListItemText-multiline')
    const primary = screen.getByText('A 店')
    expect(primary.tagName).toBe('SPAN')
    expect(primary).toHaveClass('MuiListItemText-primary', 'MuiTypography-body2')
    const secondary = screen.getByText('台北市')
    expect(secondary).toHaveClass('MuiListItemText-secondary', 'MuiTypography-body2', 'sec')
  })

  it('primaryTypographyProps.variant 指定時改用該 variant 的標籤；已是 Typography 時不再包一層', () => {
    const { rerender } = render(<ListItemText primary="標題" primaryTypographyProps={{ variant: 'h6', className: 'pri' }} />)
    expect(screen.getByText('標題').tagName).toBe('H6')
    expect(screen.getByText('標題')).toHaveClass('pri')
    rerender(<ListItemText primary={<Typography>自訂</Typography>} secondary={<Typography>副標</Typography>} />)
    expect(screen.getByText('自訂')).not.toHaveClass('MuiListItemText-primary')
    expect(screen.getByText('副標')).not.toHaveClass('MuiListItemText-secondary')
  })

  it('disableTypography 時原樣輸出文字', () => {
    const { container } = render(<ListItemText primary="純文字" secondary="副" disableTypography />)
    expect(container.querySelector('.MuiTypography-root')).toBeNull()
    expect(container.textContent).toBe('純文字副')
  })
})

describe('ListItemAvatar／ListItemIcon', () => {
  it('輸出 MUI class 並帶 className、ref', () => {
    const a = React.createRef()
    const i = React.createRef()
    render(
      <>
        <ListItemAvatar ref={a} className="av" />
        <ListItemIcon ref={i} className="ic" />
      </>
    )
    expect(a.current).toHaveClass('MuiListItemAvatar-root', 'av')
    expect(i.current).toHaveClass('MuiListItemIcon-root', 'ic')
  })
})
