import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/misc-compat' // 受測的相容層

function Sample({ L }) {
  return (
    <div>
      <L.IconButton onClick={() => {}}>✕</L.IconButton>
      <L.IconButton size="large">✎</L.IconButton>
      <L.Chip label="生日" onDelete={() => {}} />
      <L.Chip label="無刪除" />
      <L.Collapse in>
        <div>展開內容</div>
      </L.Collapse>
      <L.Collapse in={false}>
        <div>收合內容</div>
      </L.Collapse>
      <L.Rating name="r" value={3} size="large" onChange={() => {}} />
    </div>
  )
}

ReactDOM.render(
  <MuiScope>
    <div id="mui"><Sample L={M} /></div>
    <div id="compat"><Sample L={C} /></div>
  </MuiScope>,
  document.getElementById('root')
)
