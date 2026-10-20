import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from 'ui/mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/pagination-compat' // 受測的相容層

function Sample({ L }) {
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState(5)
  return (
    <div style={{ width: 900 }}>
      <L.TablePagination
        component="div"
        count={23}
        labelRowsPerPage="每頁顯示數量"
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={e => setRows(e.target.value)}
        page={page}
        rowsPerPage={rows}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
      />
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
