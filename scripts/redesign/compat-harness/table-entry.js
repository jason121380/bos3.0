/** @jsxImportSource @emotion/react */
import React from 'react'
import ReactDOM from 'react-dom'
import { css } from '@emotion/react'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as C from 'ui/table-compat' // 受測的相容層（新類別複製本檔改這兩行）

const cellCss = css({ padding: '2px 4px', color: 'rgb(200, 0, 0)' })

function Sample({ L }) {
  return (
    <div>
      <L.TableContainer component={M.Paper}>
        <L.Table size="small" aria-label="a dense table">
          <L.TableHead>
            <L.TableRow>
              <L.TableCell padding="checkbox">✓</L.TableCell>
              <L.TableCell>名稱</L.TableCell>
              <L.TableCell align="right">金額</L.TableCell>
              <L.TableCell className="forPrint4" style={{ paddingLeft: '40px' }}>備註</L.TableCell>
            </L.TableRow>
          </L.TableHead>
          <L.TableBody className="renderItem">
            <L.TableRow hover>
              <L.TableCell padding="checkbox">□</L.TableCell>
              <L.TableCell>剪髮服務很長很長的名稱 剪髮服務很長很長的名稱</L.TableCell>
              <L.TableCell align="right">1,200</L.TableCell>
              <L.TableCell style={{ color: 'red', fontWeight: '500' }}>紅字</L.TableCell>
            </L.TableRow>
            <L.TableRow style={{ textAlign: 'center' }}>
              <L.TableCell colSpan={2} align="center">合計</L.TableCell>
              <L.TableCell css={cellCss}>emotion</L.TableCell>
              <L.TableCell>—</L.TableCell>
            </L.TableRow>
          </L.TableBody>
        </L.Table>
      </L.TableContainer>
      <L.TableContainer>
        <L.Table>
          <L.TableHead>
            <L.TableRow>
              <L.TableCell>中尺寸表頭</L.TableCell>
              <L.TableCell padding="checkbox">✓</L.TableCell>
            </L.TableRow>
          </L.TableHead>
          <L.TableBody>
            <L.TableRow>
              <L.TableCell>中尺寸內文</L.TableCell>
              <L.TableCell padding="none">none</L.TableCell>
            </L.TableRow>
          </L.TableBody>
        </L.Table>
      </L.TableContainer>
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
