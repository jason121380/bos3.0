/** @jsxImportSource @emotion/react */
import React from 'react'
import ReactDOM from 'react-dom'
import { css } from '@emotion/react'
import { MuiScope } from './mui-theme'
import * as M from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import * as C from 'ui/accordion-compat' // 受測的相容層

const details = css({ display: 'flex', flexDirection: 'column', gap: 8 })

function Sample({ L }) {
  return (
    <div>
      <L.Accordion defaultExpanded expanded>
        <L.AccordionSummary expandIcon={<ExpandMoreIcon />} data-testid="panelService" style={{ width: '100%' }} aria-controls="panel-content" id="panel-header">
          服務項目
        </L.AccordionSummary>
        <L.AccordionDetails css={details}>
          <div>展開的內容</div>
        </L.AccordionDetails>
      </L.Accordion>
      <L.Accordion expanded={false}>
        <L.AccordionSummary expandIcon={<ExpandMoreIcon />}>收合的區塊</L.AccordionSummary>
        <L.AccordionDetails className="flex flex-col overflow-x-auto">
          <div>收合的內容</div>
        </L.AccordionDetails>
      </L.Accordion>
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
