/** @jsxImportSource @emotion/react */
import React from 'react'
import ReactDOM from 'react-dom'
import { css } from '@emotion/react'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import * as D from 'ui/display-compat' // 受測的相容層
import { Card, CardContent } from 'ui/card-compat'

// 卡片也帶 MuiPaper-root：一起比，確認 Paper 規則不會蓋到卡片的底色與圓角
const C = { ...D, Card, CardContent }

const override = css({ marginBottom: 12, color: 'rgb(0, 128, 0)' })
const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline']

function Sample({ L }) {
  return (
    <div>
      <L.Paper>預設 Paper</L.Paper>
      <L.Paper elevation={12}>浮起 Paper</L.Paper>
      <L.Card>
        <L.CardContent>卡片內容</L.CardContent>
      </L.Card>
      <L.Divider />
      <L.Divider style={{ width: '100%' }} />
      <L.Divider className="my-6" />
      <L.CircularProgress color="inherit" size={20} />
      <L.CircularProgress variant="determinate" value={42} />
      <L.CircularProgress />
      {VARIANTS.map(v => (
        <L.Typography key={v} variant={v}>
          {v} 字級範例
        </L.Typography>
      ))}
      <L.Typography variant="h3" component="div" gutterBottom align="center">
        置中標題
      </L.Typography>
      <L.Typography variant="body1" css={override}>
        emotion 覆蓋
      </L.Typography>
      <L.Typography>預設</L.Typography>
      <L.Container maxWidth="md">md 容器</L.Container>
      <L.Container maxWidth="lg">lg 容器</L.Container>
      <L.Container maxWidth={false}>無上限容器</L.Container>
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
