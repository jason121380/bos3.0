// 純本機互動頁：不載入應用程式、不建立後端 client。
import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog'
import { TreeView, TreeItem } from 'ui/tree'
import { Rating } from 'ui/rating'
import { Tag } from 'ui/tag'
import '../../../../src/styles/tokens.css'

function App() {
  const [open, setOpen] = React.useState(true)
  const [expanded, setExpanded] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [rating, setRating] = React.useState(null)
  const [tags, setTags] = React.useState(['乾燥', '敏感', '一般'])
  return (
    <div className="ui-root p-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent id="tree-dialog" aria-describedby={undefined}>
          <DialogTitle>樹狀選擇</DialogTitle>
          <TreeView
            aria-label="店家"
            expanded={expanded}
            onToggle={(event, ids) => {
              // 確認滑鼠與方向鍵回呼都能讀取原使用端依賴的標籤 span。
              if (event.currentTarget.querySelector('span').id !== 'group-label') throw new Error('展開事件契約錯誤')
              setExpanded(ids)
            }}
            selected={selected}
            onSelect={(event, id) => setSelected(id)}
          >
            <TreeItem nodeId="group" label={<span id="group-label">群組</span>}>
              <TreeItem nodeId="a" label="甲店" />
              <TreeItem nodeId="b" label="乙店" />
            </TreeItem>
            <TreeItem nodeId="c" label="丙店" />
          </TreeView>
          <output id="tree-value">{selected}</output>
        </DialogContent>
      </Dialog>
      <Rating aria-label="服務評分" value={rating} onChange={(event, value) => setRating(value)} size="large" />
      <output id="rating-value">{rating === null ? '空' : rating}</output>
      <div className="flex gap-2">
        {tags.map(label => (
          <Tag key={label} label={label} data-testid={`tag-${label}`} onDelete={() => setTags(tags.filter(t => t !== label))} />
        ))}
      </div>
    </div>
  )
}
ReactDOM.render(<App />, document.getElementById('root'))
