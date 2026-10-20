import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from '../mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/misc-compat'
import { Slider as UiSlider } from 'ui/slider'
function Row({ L, S, tag }) {
  const ref = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [v, setV] = React.useState(40)
  const [r, setR] = React.useState(3)
  return (
    <div id={tag} style={{ display: 'flex', gap: 40, alignItems: 'center', padding: '60px 20px 20px', height: 160 }}>
      <L.Rating name={tag + 'r'} value={r} size="large" onChange={(e, n) => n && setR(n)} />
      <L.Tooltip arrow title={<p style={{ fontSize: 13 }}>參與日期: 2026/10/20</p>}><span id={tag + 'tt'} style={{ padding: 4, border: '1px solid #ccc' }}>店家</span></L.Tooltip>
      <S style={{ width: 150 }} max={70} value={v} valueLabelDisplay="auto" onChange={(e, x) => setV(x)} id={tag + 'sl'} />
      <button ref={ref} id={tag + 'mb'} onClick={() => setOpen(true)}>⋮</button>
      <L.Menu anchorEl={ref.current} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} elevation={1} onClose={() => setOpen(false)} open={open} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <L.MenuItem onClick={() => { window.__menu = tag; setOpen(false) }}><span style={{ width: 36 }}>🖨</span><span>報表匯出</span></L.MenuItem>
      </L.Menu>
      <span id={tag + 'rv'}>{r}</span>
    </div>
  )
}
ReactDOM.render(<MuiScope><Row L={M} S={M.Slider} tag="m" /><Row L={C} S={UiSlider} tag="c" /></MuiScope>, document.getElementById('root'))
