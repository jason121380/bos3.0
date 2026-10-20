import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from './mui-theme'
import { TreeView as MTreeView, TreeItem as MTreeItem } from '@mui/x-tree-view'
import { TreeView, TreeItem } from 'ui/tree-compat' // 受測的相容層

const M = { TreeView: MTreeView, TreeItem: MTreeItem }
const C = { TreeView, TreeItem }

// 同 MerchantsListModal：handleNodeFocus 從 event.currentTarget 找第一個 span 的 id 來切換展開
function Sample({ L, tag }) {
  const [expanded, setExpanded] = React.useState(['ALL'])
  const handleNodeFocus = ({ currentTarget }) => {
    const id = currentTarget.querySelector('span').id
    setExpanded(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }
  return (
    <L.TreeView defaultCollapseIcon={<span>▾</span>} defaultExpandIcon={<span>▸</span>} expanded={expanded} onNodeToggle={handleNodeFocus}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <input type="checkbox" style={{ flexShrink: 0, margin: '11px 4px 0 8px' }} />
        <L.TreeItem nodeId="ALL" label={<span id="ALL">全部(3)</span>} style={{ overflow: 'visible' }}>
          <L.TreeItem nodeId="m1" label={<span>店家甲</span>} className="onSelect" />
          <L.TreeItem nodeId="m2" label={<span>店家乙</span>} onClick={() => (window['clicked' + tag] = 'm2')} />
        </L.TreeItem>
      </div>
      <L.TreeItem nodeId="G1" label={<span id="G1">群組一(1)</span>}>
        <L.TreeItem nodeId="m3" label={<span>店家丙</span>} />
      </L.TreeItem>
    </L.TreeView>
  )
}

ReactDOM.render(
  <MuiScope>
    <div id="mui"><Sample L={M} tag="m" /></div>
    <div id="compat"><Sample L={C} tag="c" /></div>
  </MuiScope>,
  document.getElementById('root')
)
