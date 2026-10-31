// TreeView 非受控用法與 ref／onKeyDown 轉發（商品分類樹、店家樹沿用）。
// 為什麼重要：沒傳 expanded 的樹要自己記住展開狀態，否則點了展不開；呼叫端的 onKeyDown 要先收到（可擋下樹的預設鍵盤操作）。
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TreeItem, TreeView } from '../tree'

afterEach(cleanup)

// 函式元件不轉發 ref，所以 ref 用 treeRef 傳下去
const Tree = ({ treeRef, ...props }) => (
  <TreeView aria-label="分類" ref={treeRef} {...props}>
    <TreeItem nodeId="hair" label="洗髮">
      <TreeItem nodeId="oil" label="護髮油" />
    </TreeItem>
    <TreeItem nodeId="tool" label="工具" />
  </TreeView>
)

describe('TreeView 非受控', () => {
  it('沒傳 expanded 時自己記住展開／收合，沒有 onToggle 也可以', () => {
    render(<Tree />)
    expect(screen.queryByText('護髮油')).toBeNull()
    fireEvent.click(screen.getByText('洗髮'))
    expect(screen.getByText('護髮油')).toBeInTheDocument()
    fireEvent.click(screen.getByText('洗髮'))
    expect(screen.queryByText('護髮油')).toBeNull()
  })

  it('defaultExpanded／defaultSelected 決定初始狀態，可 Tab 進入的是已選項目', () => {
    render(<Tree defaultExpanded={['hair']} defaultSelected="oil" />)
    const oil = screen.getByRole('treeitem', { name: '護髮油' })
    expect(oil).toHaveAttribute('aria-selected', 'true')
    expect(oil).toHaveAttribute('tabindex', '0')
  })

  it('轉發 ref：物件與函式 ref 都拿到樹本身', () => {
    const objectRef = React.createRef()
    render(<Tree treeRef={objectRef} />)
    expect(objectRef.current).toBe(screen.getByRole('tree'))
    cleanup()
    const fnRef = jest.fn()
    render(<Tree treeRef={fnRef} />)
    expect(fnRef).toHaveBeenCalledWith(screen.getByRole('tree'))
  })
})

describe('TreeItem onKeyDown', () => {
  it('呼叫端的 onKeyDown 先收到；呼叫端 preventDefault 時樹不移動焦點', () => {
    const onKeyDown = jest.fn(event => event.preventDefault())
    render(
      <TreeView aria-label="分類">
        <TreeItem nodeId="a" label="甲" onKeyDown={onKeyDown} />
        <TreeItem nodeId="b" label="乙" />
      </TreeView>
    )
    const a = screen.getByRole('treeitem', { name: '甲' })
    a.focus()
    fireEvent.keyDown(a, { key: 'ArrowDown' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(a).toHaveFocus()
  })
})
