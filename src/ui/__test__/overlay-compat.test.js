import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Popper, Fade, Drawer } from '../overlay-compat'

afterEach(cleanup)

describe('ui/overlay-compat（與 MUI Popper／Drawer／Fade 相容）', () => {
  // 行事曆的尺寸設定面板：open 才顯示，掛在 body（不被行事曆的 overflow 裁切）
  it('Popper 依 open 掛到 body 並帶 role=tooltip', () => {
    const anchor = document.createElement('button')
    document.body.appendChild(anchor)
    const { rerender } = render(
      <Popper open={false} anchorEl={anchor}>
        <div>尺寸設定</div>
      </Popper>
    )
    expect(screen.queryByText('尺寸設定')).toBeNull()
    rerender(
      <Popper open anchorEl={anchor}>
        <div>尺寸設定</div>
      </Popper>
    )
    const panel = screen.getByRole('tooltip')
    expect(panel.parentElement).toBe(document.body)
    expect(panel).toHaveTextContent('尺寸設定')
    anchor.remove()
  })

  // 抽獎紀錄：transition 模式下關閉要等 Fade 結束才卸載（不會瞬間消失）
  it('Popper transition：關閉後等 Fade 離場結束才卸載', () => {
    jest.useFakeTimers()
    const anchor = document.createElement('button')
    document.body.appendChild(anchor)
    const ui = open => (
      <Popper open={open} anchorEl={anchor} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div>抽獎紀錄</div>
          </Fade>
        )}
      </Popper>
    )
    const { rerender } = render(ui(true))
    rerender(ui(false))
    expect(screen.getByText('抽獎紀錄')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(400))
    expect(screen.queryByText('抽獎紀錄')).toBeNull()
    jest.useRealTimers()
    anchor.remove()
  })

  // 已選取列表的底部動作列（persistent）：不擋頁面、收合時不可見但保留
  it('Drawer persistent：不是彈窗，收合時 visibility hidden', () => {
    const { rerender } = render(
      <Drawer anchor="bottom" open variant="persistent" PaperProps={{ elevation: 1 }}>
        <button type="button">刪除</button>
      </Drawer>
    )
    expect(screen.queryByRole('presentation')).toBeNull()
    const paper = screen.getByText('刪除').parentElement
    expect(paper).toHaveClass('MuiDrawer-paperAnchorDockedBottom', 'MuiPaper-elevation1')
    rerender(
      <Drawer anchor="bottom" open={false} variant="persistent" PaperProps={{ elevation: 1 }}>
        <button type="button">刪除</button>
      </Drawer>
    )
    expect(paper.style.visibility).toBe('hidden')
  })

  // 打卡記錄的底部面板（temporary）：帶背景，點背景以 backdropClick 關閉
  it('Drawer temporary：點背景呼叫 onClose(event, "backdropClick")', () => {
    const onClose = jest.fn()
    render(
      <Drawer anchor="bottom" open onClose={onClose}>
        <div>打卡記錄</div>
      </Drawer>
    )
    fireEvent.click(document.querySelector('.MuiBackdrop-root'))
    expect(onClose.mock.calls[0][1]).toBe('backdropClick')
    expect(document.querySelector('.MuiDrawer-modal')).not.toBeNull()
  })
})
