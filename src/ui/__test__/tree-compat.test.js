import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TreeView, TreeItem } from '../tree-compat'

afterEach(cleanup)

// 同店家選擇窗：handleNodeFocus 從 event.currentTarget（點擊的 content）找第一個 span 的 id 來切換展開
function StorePicker({ onItemClick }) {
  const [expanded, setExpanded] = React.useState([])
  const handleNodeFocus = ({ currentTarget }) => {
    const id = currentTarget.querySelector('span').id
    setExpanded(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }
  return (
    <TreeView defaultCollapseIcon={<svg data-testid="collapse" />} defaultExpandIcon={<svg data-testid="expand" />} expanded={expanded} onNodeToggle={handleNodeFocus}>
      <TreeItem nodeId="G1" label={<span id="G1">群組一</span>}>
        <TreeItem nodeId="m1" label={<span>店家甲</span>} onClick={onItemClick} />
      </TreeItem>
    </TreeView>
  )
}

describe('ui/tree-compat（與 @mui/x-tree-view 相容）', () => {
  // 店家／商品選擇窗的展開靠 currentTarget 讀 label 的 span id：currentTarget 必須是點擊的 content
  it('點群組以 content 為 currentTarget 呼叫 onNodeToggle，收合時子項卸載', () => {
    render(<StorePicker />)
    expect(screen.queryByText('店家甲')).toBeNull()
    fireEvent.click(screen.getByText('群組一'))
    expect(screen.getByText('店家甲')).toBeInTheDocument()
    expect(screen.getByRole('treeitem', { name: /群組一/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('collapse')).toBeInTheDocument()
    fireEvent.click(screen.getByText('群組一'))
    expect(screen.queryByText('店家甲')).toBeNull()
  })

  // 點店家：觸發 TreeItem 的 onClick（加入選取），並標示 Mui-selected
  it('點葉節點呼叫 onClick 並選取', () => {
    const onItemClick = jest.fn()
    render(<StorePicker onItemClick={onItemClick} />)
    fireEvent.click(screen.getByText('群組一'))
    fireEvent.click(screen.getByText('店家甲'))
    expect(onItemClick).toHaveBeenCalledTimes(1)
    expect(screen.getByText('店家甲').closest('.MuiTreeItem-content')).toHaveClass('Mui-selected')
    expect(screen.getByRole('tree')).toBeInTheDocument()
  })
})
