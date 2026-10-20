import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/feedback-compat' // 受測的相容層

function Sample({ L }) {
  return (
    <div>
      {['success', 'warning', 'error', 'info'].map(s => (
        <L.Alert key={s} elevation={6} variant="filled" severity={s}>
          {s} 訊息
        </L.Alert>
      ))}
      <L.Alert severity="warning" variant="filled" onClose={() => {}}>可關閉</L.Alert>
      <L.SnackbarContent message="已儲存" action={<button type="button">關閉</button>} />
      <L.Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={null}>
        <L.Alert elevation={6} variant="filled" severity="success">頂部置中</L.Alert>
      </L.Snackbar>
      <L.Snackbar open message="底部左側" />
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
