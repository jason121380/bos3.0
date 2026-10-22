import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TreeItem, TreeView } from '../tree-compat'

// 保護什麼：店家／商品樹狀選擇窗（ui/tree-compat）的非受控狀態、鍵盤操作與焦點標示。
// 比照 MUI x-tree-view：Tab 進入 tree 時焦點落在已選項目（否則第一項），方向鍵上下移動、右展開／進入子層、左收合／回父層、
// Enter 切換展開（葉節點則選取）、空白鍵選取；aria-activedescendant 指向目前節點，只有 tree 本身持有焦點時才標 Mui-focused。
// 停用項目點擊不展開也不選取（但仍呼叫頁面的 onClick）；disableSelection 時不選取。

// jsdom 沒有 CSS.escape（瀏覽器都有）：測試環境補上最小實作
const hadCSS = typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function'
beforeAll(() => {
  if (!hadCSS) window.CSS = { ...(window.CSS || {}), escape: s => String(s).replace(/["\\]/g, '\\$&') }
})
afterEach(cleanup)

const Tree = props => (
  <TreeView
    defaultCollapseIcon={<i data-testid="collapse" />}
    defaultExpandIcon={<i data-testid="expand" />}
    defaultEndIcon={<i data-testid="end" />}
    defaultParentIcon={<i data-testid="parent" />}
    {...props}
  >
    <TreeItem nodeId="g1" label="群組一">
      <TreeItem nodeId="a" label="店家甲" />
      <TreeItem nodeId="b" label="店家乙" />
    </TreeItem>
    <TreeItem nodeId="c" label="店家丙" />
  </TreeView>
)

const tree = () => screen.getByRole('tree')
const item = name => screen.getByText(name).closest('[role="treeitem"]')
const press = key => {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    tree().dispatchEvent(ev)
  })
  return ev.defaultPrevented
}
const activeId = () => tree().getAttribute('aria-activedescendant')

describe('非受控狀態', () => {
  it('defaultExpanded／defaultSelected 生效；點擊切換展開與選取，並呼叫 onNodeSelect', () => {
    const onNodeSelect = jest.fn()
    render(<Tree defaultExpanded={['g1']} defaultSelected="a" onNodeSelect={onNodeSelect} />)
    expect(item('群組一')).toHaveAttribute('aria-expanded', 'true')
    expect(item('店家甲')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByText('店家乙'))
    expect(onNodeSelect).toHaveBeenCalledWith(expect.anything(), 'b')
    expect(item('店家乙')).toHaveAttribute('aria-selected', 'true')
    expect(item('店家甲')).not.toHaveAttribute('aria-selected')
    fireEvent.click(screen.getByText('群組一'))
    expect(screen.queryByText('店家甲')).toBeNull()
  })

  it('受控 selected 時點擊只回報、不自行改選取', () => {
    const onNodeSelect = jest.fn()
    render(<Tree selected="c" onNodeSelect={onNodeSelect} />)
    fireEvent.click(screen.getByText('群組一'))
    expect(onNodeSelect).toHaveBeenCalledWith(expect.anything(), 'g1')
    expect(item('店家丙')).toHaveAttribute('aria-selected', 'true')
    expect(item('群組一')).not.toHaveAttribute('aria-selected')
  })

  it('disableSelection 時點擊只展開、不選取', () => {
    const onNodeSelect = jest.fn()
    render(<Tree disableSelection onNodeSelect={onNodeSelect} />)
    fireEvent.click(screen.getByText('店家丙'))
    expect(onNodeSelect).not.toHaveBeenCalled()
    expect(item('店家丙')).not.toHaveAttribute('aria-selected')
  })
})

describe('圖示', () => {
  it('收合的群組用展開圖示、葉節點用 end 圖示；項目自己的 icon／expandIcon／collapseIcon／endIcon 優先', () => {
    const { rerender } = render(<Tree />)
    expect(item('群組一').querySelector('[data-testid="expand"]')).not.toBeNull()
    expect(item('店家丙').querySelector('[data-testid="end"]')).not.toBeNull()
    rerender(
      <TreeView defaultParentIcon={<i data-testid="parent" />} defaultExpanded={['g1']}>
        <TreeItem nodeId="g1" label="群組一" collapseIcon={<i data-testid="mycollapse" />}>
          <TreeItem nodeId="a" label="店家甲" endIcon={<i data-testid="myend" />} />
        </TreeItem>
        <TreeItem nodeId="g2" label="群組二" expandIcon={<i data-testid="myexpand" />}>
          <TreeItem nodeId="x" label="x" />
        </TreeItem>
        <TreeItem nodeId="g3" label="群組三">
          <TreeItem nodeId="y" label="y" />
        </TreeItem>
        <TreeItem nodeId="c" label="店家丙" icon={<i data-testid="myicon" />} />
      </TreeView>
    )
    expect(screen.getByTestId('mycollapse')).toBeInTheDocument()
    expect(screen.getByTestId('myend')).toBeInTheDocument()
    expect(screen.getByTestId('myexpand')).toBeInTheDocument()
    expect(item('群組三').querySelector('[data-testid="parent"]')).not.toBeNull()
    expect(screen.getByTestId('myicon')).toBeInTheDocument()
  })
})

describe('鍵盤操作', () => {
  it('Tab 進入 tree：焦點落在已選取的項目並標 Mui-focused；沒有選取時落在第一項', () => {
    const { unmount } = render(<Tree defaultExpanded={['g1']} defaultSelected="b" id="t" />)
    act(() => tree().focus())
    expect(activeId()).toBe('t-b')
    expect(item('店家乙').querySelector('.MuiTreeItem-content')).toHaveClass('Mui-focused')
    unmount()
    render(<Tree id="t" />)
    act(() => tree().focus())
    expect(activeId()).toBe('t-g1')
  })

  it('上下／Home／End 依畫面順序移動；到底時不動', () => {
    render(<Tree defaultExpanded={['g1']} id="t" />)
    act(() => tree().focus())
    expect(press('ArrowDown')).toBe(true)
    expect(activeId()).toBe('t-a')
    press('End')
    expect(activeId()).toBe('t-c')
    press('ArrowDown')
    expect(activeId()).toBe('t-c')
    press('ArrowUp')
    expect(activeId()).toBe('t-b')
    press('Home')
    expect(activeId()).toBe('t-g1')
  })

  it('右鍵：收合的群組展開、已展開時進入第一個子項、葉節點不動；左鍵：已展開時收合、子項回到父層、頂層葉節點不動', () => {
    const onNodeToggle = jest.fn()
    render(<Tree id="t" onNodeToggle={onNodeToggle} />)
    act(() => tree().focus())
    press('ArrowRight')
    expect(onNodeToggle).toHaveBeenLastCalledWith(expect.anything(), ['g1'])
    expect(item('群組一')).toHaveAttribute('aria-expanded', 'true')
    press('ArrowRight')
    expect(activeId()).toBe('t-a')
    press('ArrowRight')
    expect(activeId()).toBe('t-a')
    press('ArrowLeft')
    expect(activeId()).toBe('t-g1')
    press('ArrowLeft')
    expect(item('群組一')).toHaveAttribute('aria-expanded', 'false')
    press('End')
    press('ArrowLeft')
    expect(activeId()).toBe('t-c')
  })

  it('Enter：群組切換展開、葉節點選取；空白鍵選取；其他按鍵不處理（不 preventDefault）；onKeyDown 先收到', () => {
    const onKeyDown = jest.fn()
    render(<Tree id="t" onKeyDown={onKeyDown} />)
    act(() => tree().focus())
    press('Enter')
    expect(item('群組一')).toHaveAttribute('aria-expanded', 'true')
    press('End')
    press('Enter')
    expect(item('店家丙')).toHaveAttribute('aria-selected', 'true')
    press('Home')
    press(' ')
    expect(item('群組一')).toHaveAttribute('aria-selected', 'true')
    expect(press('a')).toBe(false)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('還沒有焦點節點時按鍵不處理', () => {
    render(<Tree />)
    expect(press('ArrowDown')).toBe(false)
    expect(activeId()).toBeNull()
  })

  it('焦點移出 tree 時清掉目前節點；在 tree 內移動（relatedTarget 在內）時保留；onBlur 照常呼叫', () => {
    const onBlur = jest.fn()
    render(
      <>
        <Tree id="t" onBlur={onBlur} />
        <button type="button">外面</button>
      </>
    )
    act(() => tree().focus())
    fireEvent.focusOut(tree(), { relatedTarget: item('店家丙') })
    expect(activeId()).toBe('t-g1')
    // tree 本身失焦（焦點移到項目上）時不再標 Mui-focused
    expect(item('群組一').querySelector('.MuiTreeItem-content')).not.toHaveClass('Mui-focused')
    fireEvent.focusOut(item('店家丙'), { relatedTarget: screen.getByText('外面') })
    expect(activeId()).toBeNull()
    expect(onBlur).toHaveBeenCalledTimes(2)
  })

  it('子項目上的 focus 事件不當成 Tab 進入；已有焦點節點時再次聚焦 tree 不重設', () => {
    render(<Tree id="t" defaultSelected="c" />)
    fireEvent.focusIn(item('群組一'))
    // 點到項目（li 取得焦點）時記下目前節點
    expect(activeId()).toBe('t-g1')
    fireEvent.focusIn(tree())
    expect(activeId()).toBe('t-g1')
  })

  it('沒有 onBlur／onMouseDown 時失焦與按下滑鼠不拋錯', () => {
    render(<Tree id="t" />)
    act(() => tree().focus())
    expect(() => fireEvent.focusOut(tree())).not.toThrow()
    expect(activeId()).toBeNull()
    expect(() => fireEvent.mouseDown(screen.getByText('店家丙'))).not.toThrow()
  })

  it('空的 tree 聚焦時不拋錯', () => {
    render(<TreeView id="empty" />)
    act(() => tree().focus())
    expect(activeId()).toBeNull()
  })
})

describe('TreeItem', () => {
  it('停用項目點擊不展開、不選取但仍呼叫 onClick；聚焦不記為目前節點', () => {
    const onClick = jest.fn()
    render(
      <TreeView id="t">
        <TreeItem nodeId="g" label="停用群組" disabled onClick={onClick}>
          <TreeItem nodeId="x" label="x" />
        </TreeItem>
      </TreeView>
    )
    fireEvent.click(screen.getByText('停用群組'))
    expect(onClick).toHaveBeenCalled()
    expect(item('停用群組')).toHaveAttribute('aria-expanded', 'false')
    expect(item('停用群組')).not.toHaveAttribute('aria-selected')
    expect(item('停用群組')).toHaveAttribute('aria-disabled', 'true')
    expect(item('停用群組').querySelector('.MuiTreeItem-content')).toHaveClass('Mui-disabled')
    fireEvent.focusIn(item('停用群組'))
    expect(activeId()).toBeNull()
  })

  it('Shift／Ctrl／⌘ 點擊時避免選到文字；頁面的 onMouseDown 與 ContentProps.className 照傳；自訂 id', () => {
    const onMouseDown = jest.fn()
    render(
      <TreeView>
        <TreeItem nodeId="a" id="custom" label="店家甲" onMouseDown={onMouseDown} ContentProps={{ className: 'cp' }} />
      </TreeView>
    )
    const content = screen.getByText('店家甲').closest('.MuiTreeItem-content')
    expect(content).toHaveClass('cp')
    expect(item('店家甲')).toHaveAttribute('id', 'custom')
    for (const mod of [{ shiftKey: true }, { ctrlKey: true }, { metaKey: true }]) {
      const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true, ...mod })
      content.dispatchEvent(ev)
      expect(ev.defaultPrevented).toBe(true)
    }
    const plain = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    content.dispatchEvent(plain)
    expect(plain.defaultPrevented).toBe(false)
    expect(onMouseDown).toHaveBeenCalledTimes(4)
  })

  it('TreeView 的 ref 可為函式或物件', () => {
    const fnRef = jest.fn()
    const { rerender } = render(<TreeView ref={fnRef} />)
    expect(fnRef).toHaveBeenCalledWith(tree())
    const objRef = React.createRef()
    rerender(<TreeView ref={objRef} />)
    expect(objRef.current).toBe(tree())
  })
})
