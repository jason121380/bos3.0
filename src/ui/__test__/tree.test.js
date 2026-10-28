import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { TreeView, TreeItem } from '../tree'

function Fixture({ onToggle = jest.fn(), onSelect = jest.fn(), onClick = jest.fn() }) {
  const [expanded, setExpanded] = React.useState([])
  return <TreeView aria-label="店家" expanded={expanded} onToggle={(event, ids) => {
    onToggle(event.currentTarget.querySelector('span').id, ids)
    setExpanded(ids)
  }} onSelect={onSelect} defaultExpandIcon={<svg data-testid="expand" />} defaultCollapseIcon={<svg data-testid="collapse" />}>
    <TreeItem nodeId="group" label={<span id="group">群組</span>}>
      <TreeItem nodeId="a" label={<span>甲店</span>} onClick={onClick} />
      <TreeItem nodeId="disabled" label="停用" disabled onClick={onClick} />
      <TreeItem nodeId="b" label="乙店" />
    </TreeItem>
    <TreeItem nodeId="end" label="末項" />
  </TreeView>
}

test('受控展開、選取、圖示、列事件契約與收合卸載', () => {
  const onToggle = jest.fn(), onSelect = jest.fn(), onClick = jest.fn()
  render(<Fixture {...{ onToggle, onSelect, onClick }} />)
  expect(screen.getByRole('tree', { name: '店家' })).toBeInTheDocument()
  expect(screen.queryByText('甲店')).toBeNull()
  fireEvent.click(screen.getByText('群組'))
  expect(onToggle).toHaveBeenLastCalledWith('group', ['group'])
  expect(screen.getByTestId('collapse')).toBeInTheDocument()
  expect(screen.getByRole('group')).toBeInTheDocument()
  fireEvent.click(screen.getByText('甲店'))
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenLastCalledWith(expect.anything(), 'a')
  expect(screen.getByRole('treeitem', { name: '甲店' })).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(screen.getByText('停用'))
  expect(onClick).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByText('群組'))
  expect(screen.queryByText('甲店')).toBeNull()
})

test('方向鍵、Home／End、Enter／Space 走相同選取回呼，略過停用項目', () => {
  const onClick = jest.fn()
  render(<Fixture onClick={onClick} />)
  const group = screen.getAllByRole('treeitem')[0]
  group.focus()
  fireEvent.keyDown(group, { key: 'ArrowRight' })
  fireEvent.keyDown(group, { key: 'ArrowRight' })
  const a = screen.getByRole('treeitem', { name: '甲店' })
  expect(a).toHaveFocus()
  fireEvent.keyDown(a, { key: 'Enter' })
  fireEvent.keyDown(a, { key: ' ' })
  expect(onClick).toHaveBeenCalledTimes(2)
  fireEvent.keyDown(a, { key: 'ArrowDown' })
  const b = screen.getByRole('treeitem', { name: '乙店' })
  expect(b).toHaveFocus()
  fireEvent.keyDown(b, { key: 'ArrowUp' })
  expect(a).toHaveFocus()
  fireEvent.keyDown(a, { key: 'End' })
  expect(screen.getByRole('treeitem', { name: '末項' })).toHaveFocus()
  fireEvent.keyDown(document.activeElement, { key: 'Home' })
  expect(group).toHaveFocus()
  fireEvent.keyDown(a, { key: 'ArrowLeft' })
  expect(group).toHaveFocus()
  fireEvent.keyDown(group, { key: 'ArrowLeft' })
  expect(group).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getAllByRole('treeitem').filter(el => el.tabIndex === 0)).toHaveLength(1)
})

test('自訂 checkbox 標籤可操作，個別 selected 控制高亮，Esc 不被樹攔截', () => {
  const change = jest.fn(), click = jest.fn(), key = jest.fn()
  render(<div onKeyDown={key}><TreeView aria-label="商品"><TreeItem nodeId="p" selected label={<label><input type="checkbox" onChange={change} />商品</label>} onClick={click} /></TreeView></div>)
  const item = screen.getByRole('treeitem')
  expect(item).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(screen.getByRole('checkbox'))
  expect(change).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' })
  expect(click).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(item, { key: 'Escape' })
  expect(key).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'Escape', defaultPrevented: false }))
})


test('同一資料出現在全部與分類時，DOM id 與 Tab 入口仍唯一', () => {
  render(<TreeView defaultExpanded={['all', 'category']}>
    <TreeItem nodeId="all" label="全部"><TreeItem nodeId="p" label="商品" /></TreeItem>
    <TreeItem nodeId="category" label="分類"><TreeItem nodeId="p" label="商品" /></TreeItem>
  </TreeView>)
  const copies = screen.getAllByRole('treeitem', { name: '商品' })
  expect(copies[0].id).not.toBe(copies[1].id)
  copies[1].focus()
  expect(screen.getAllByRole('treeitem').filter(el => el.tabIndex === 0)).toEqual([copies[1]])
})
