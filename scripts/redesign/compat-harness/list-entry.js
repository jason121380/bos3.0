import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter, Link as RouterLink } from 'react-router-dom'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as LC from 'ui/list-compat' // 受測的相容層
import { Link } from 'ui/link-compat'

const C = { ...LC, Link }

function Sample({ L }) {
  return (
    <div>
      <L.List>
        <L.ListItemButton onClick={() => {}}>
          <L.ListItemText primary="新預約" />
        </L.ListItemButton>
        <L.ListItemButton disabled>
          <L.ListItemText primary="關閉預約" />
        </L.ListItemButton>
        <L.ListItemButton>
          <L.ListItemIcon>★</L.ListItemIcon>
          <L.ListItemText primary="結帳" secondary="說明" />
        </L.ListItemButton>
      </L.List>
      <L.List dense component="div" role="list">
        <L.ListItemButton role="listitem" disableRipple>
          <L.ListItemText id="x1" primary="密集清單" primaryTypographyProps={{ style: { fontSize: '16px', color: 'rgb(0, 0, 255)' } }} />
        </L.ListItemButton>
      </L.List>
      <L.Link component={RouterLink} to="/a" color="inherit" underline="none" variant="h6" target="_blank">預約連結</L.Link>
      <L.Link component={RouterLink} to="/b" underline="hover">帳單</L.Link>
      <L.Link component={RouterLink} to="/c" underline="always" color="#263238">顧客</L.Link>
      <L.Link href="#d">預設連結</L.Link>
    </div>
  )
}

ReactDOM.render(
  <MemoryRouter>
    <MuiScope>
      <div id="mui"><Sample L={M} /></div>
      <div id="compat"><Sample L={C} /></div>
    </MuiScope>
  </MemoryRouter>,
  document.getElementById('root')
)
