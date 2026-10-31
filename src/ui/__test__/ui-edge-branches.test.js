// ui 元件的邊界操作（各元件主要測試以外的情況）：
// - Rating：非受控且沒有 onChange 時仍能選；鎖定時滑過不預覽；其他按鍵不改值；尺寸。
// - toast：沒有先移入就移出，不會提早或重複計時。
// - Tree：葉節點按右鍵不移動焦點。
// - SidebarFlyout：以鍵盤打開但浮層裡沒有可聚焦項目時，不拋錯、焦點不亂跳。
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Rating } from '../rating'
import { Toaster, toast } from '../toast'
import { TreeItem, TreeView } from '../tree'
import { SidebarFlyout } from '../sidebar'

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('Rating', () => {
  it('非受控且沒有 onChange：點選仍會記住', () => {
    render(<Rating name="r" />)
    fireEvent.click(screen.getByRole('radio', { name: '3 星' }))
    expect(screen.getByRole('radio', { name: '3 星' })).toBeChecked()
  })

  it('唯讀時滑過不預覽（不讓人以為可以改）', () => {
    render(<Rating name="r" value={1} readOnly />)
    const four = screen.getByRole('radio', { name: '4 星' })
    fireEvent.mouseEnter(four.parentElement)
    expect(four.parentElement).toHaveAttribute('data-filled', 'false')
  })

  it('方向鍵與空白鍵以外的按鍵不改值；size small 用小星星', () => {
    const change = jest.fn()
    render(<Rating name="r" value={2} size="small" onChange={change} />)
    const two = screen.getByRole('radio', { name: '2 星' })
    fireEvent.keyDown(two, { key: 'Enter' })
    expect(change).not.toHaveBeenCalled()
    expect(two.parentElement.querySelector('svg')).toHaveClass('h-5', 'w-5')
  })

  it('空白鍵在未選的星上選取該星', () => {
    const change = jest.fn()
    render(<Rating name="r" value={2} onChange={change} />)
    fireEvent.keyDown(screen.getByRole('radio', { name: '4 星' }), { key: ' ' })
    expect(change).toHaveBeenLastCalledWith(expect.anything(), 4)
  })
})

describe('toast', () => {
  it('沒有先移入就移出：照原本時間消失，不提早', () => {
    jest.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast.success('已更新')
    })
    fireEvent.mouseLeave(screen.getByRole('status'))
    act(() => {
      jest.advanceTimersByTime(1400)
    })
    expect(screen.getByText('已更新')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(screen.queryByText('已更新')).toBeNull()
  })
})

describe('Tree', () => {
  it('葉節點按右鍵不移動焦點、不展開', () => {
    render(
      <TreeView aria-label="分類">
        <TreeItem nodeId="a" label="甲" />
        <TreeItem nodeId="b" label="乙" />
      </TreeView>
    )
    const a = screen.getByRole('treeitem', { name: '甲' })
    a.focus()
    fireEvent.keyDown(a, { key: 'ArrowRight' })
    expect(a).toHaveFocus()
    expect(a).not.toHaveAttribute('aria-expanded')
  })
})

describe('SidebarFlyout', () => {
  it('鍵盤打開但沒有可聚焦的細項：不拋錯，焦點留在原處', () => {
    function Harness() {
      const ref = React.useRef(null)
      const [open, setOpen] = React.useState(false)
      React.useLayoutEffect(() => setOpen(true), [])
      return (
        <aside>
          <button type="button" ref={ref}>
            群組
          </button>
          {open && (
            <SidebarFlyout anchorRef={ref} label="空的細項" autoFocus>
              <span>沒有可用的頁面</span>
            </SidebarFlyout>
          )}
        </aside>
      )
    }
    render(<Harness />)
    screen.getByRole('button', { name: '群組' }).focus()
    expect(screen.getByRole('region', { name: '空的細項' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '群組' })).toHaveFocus()
  })
})
