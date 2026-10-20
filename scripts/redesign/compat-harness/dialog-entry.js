/** @jsxImportSource @emotion/react */
import React from 'react'
import ReactDOM from 'react-dom'
import { css } from '@emotion/react'
import { MuiScope } from 'ui/mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/modal-compat' // 受測的相容層
import { Button } from 'ui/button'

// 兩邊都 disablePortal（渲染在 #mui／#compat 內才能逐元素比對），並關掉焦點強制與捲動鎖，避免兩個彈窗互搶
const common = { disablePortal: true, disableEnforceFocus: true, disableScrollLock: true, disableAutoFocus: true }
const title = css({ fontSize: 20 })
const modalChild = css({ position: 'absolute', top: '10%', left: '10%', width: 300, background: 'white' })

function Sample({ L }) {
  return (
    <div>
      <L.Dialog open {...common} maxWidth="xs" fullWidth className="ManagementReservationRecordDialog" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <L.DialogTitle id="alert-dialog-title" css={title} style={{ paddingBottom: 0 }}>確認刪除？</L.DialogTitle>
        <L.DialogContent>
          <L.DialogContentText id="alert-dialog-description">刪除後無法復原</L.DialogContentText>
        </L.DialogContent>
        <L.DialogActions className="ui-root">
          <Button>取消</Button>
          <Button variant="danger">刪除</Button>
        </L.DialogActions>
      </L.Dialog>
      <L.Dialog open {...common} maxWidth="md">
        <L.DialogTitle>編輯</L.DialogTitle>
        <L.DialogContent dividers style={{ border: 'none' }}>
          <div>內容</div>
        </L.DialogContent>
        <L.DialogActions style={{ margin: '10px' }}>
          <Button>關閉</Button>
        </L.DialogActions>
      </L.Dialog>
      <L.Dialog open {...common} fullScreen>
        <L.DialogContent style={{ overflow: 'visible' }}>全螢幕</L.DialogContent>
      </L.Dialog>
      <L.Modal open {...common}>
        <div css={modalChild}>帳單商品彈窗</div>
      </L.Modal>
      <L.Backdrop open id="Backdrop">
        <span>載入中</span>
      </L.Backdrop>
      <L.Backdrop open={false}>
        <span>已關閉</span>
      </L.Backdrop>
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
