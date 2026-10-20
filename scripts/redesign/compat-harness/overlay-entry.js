import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as O from 'ui/overlay-compat' // 受測的相容層

const C = { ...O }

function Sample({ L }) {
  const [anchor, setAnchor] = React.useState(null)
  const [anchor2, setAnchor2] = React.useState(null)
  return (
    <div style={{ position: 'relative', height: 300 }}>
      <button ref={setAnchor} style={{ marginLeft: 400, marginTop: 40 }}>設定</button>
      <button ref={setAnchor2} style={{ marginLeft: 40 }}>抽獎紀錄</button>
      {anchor && (
        <L.Popper placement="left-start" open anchorEl={anchor} style={{ zIndex: 20 }} disablePortal>
          <div style={{ width: 120, height: 60, background: 'white' }}>面板</div>
        </L.Popper>
      )}
      {anchor2 && (
        <L.Popper open anchorEl={anchor2} transition style={{ zIndex: '1' }} disablePortal>
          {({ TransitionProps }) => (
            <L.Fade {...TransitionProps} timeout={350}>
              <div style={{ width: 160, height: 40, background: 'white' }}>淡入內容</div>
            </L.Fade>
          )}
        </L.Popper>
      )}
      <L.Drawer anchor="bottom" open PaperProps={{ elevation: 1 }} variant="persistent">
        <div style={{ padding: 16 }}>已選取 3 筆</div>
      </L.Drawer>
      <L.Drawer anchor="bottom" open={false} PaperProps={{ elevation: 1 }} variant="persistent">
        <div style={{ padding: 16 }}>收合</div>
      </L.Drawer>
      <L.Drawer anchor="bottom" open ModalProps={{ disablePortal: true, disableEnforceFocus: true, disableScrollLock: true, disableAutoFocus: true }}>
        <div style={{ padding: 16 }}>打卡記錄</div>
      </L.Drawer>
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
