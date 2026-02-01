/** @jsxImportSource @emotion/react */
import React, { useState, Fragment } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'

const styles = {
  logList: css({
    margin: '20px 0',
  }),
  details: css({
    overflowX: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  }),
  listHead: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  bottomInfo: css({
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
    fontSize: '14px',
    color: 'gray',
  }),
}

const Results = ({ data, systemUpdateRecord, isWhiteList }) => {
  const [open, setOpen] = useState(0)
  const [theme, setTheme] = useState('')
  const getTheme = setInterval(() => {
    if (document.documentElement.getAttribute('data-color-mode') !== null) {
      setTheme(document.documentElement.getAttribute('data-color-mode'))
      clearInterval(getTheme)
    }
  }, 500);

  const handleDeleteRecord = id => {
    openSnackbar({
      message: '確定要刪除此筆版本更新紀錄？',
      variant: 'error',
      disableHide: true,
      resign: true,
      deleteSystemRecordPending: true,
      systemUpdateId: id,
      systemUpdateRecord: systemUpdateRecord,
    })
  }

  MdEditor.config({
    markedRenderer(renderer) {
      renderer.link = (href, title, text) => {
        return `<a href="${href}" title="${title}" target="_blank">${text}</a>`;
      };
      return renderer;
    }
  });

  return (
    <div css={styles.logList}>
      {data.length > 0 &&
        data.map((d, index) => {
          return (
            <Accordion key={index} expanded={index === open}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                css={styles.listHead}
                onClick={() => {
                  index === open ? setOpen(-1) : setOpen(index)
                }}
              >
                <div css={styles.listHead}>
                  <h2>{d.title}</h2>
                  <div>版本:{d.versionNo}</div>
                </div>
              </AccordionSummary>
              <AccordionDetails css={styles.details}>
                <MdEditor theme={theme} modelValue={d.content} previewOnly language='en-US' />
                <div css={styles.bottomInfo}>
                  <div style={{ marginRight: '10px' }}>
                    更新日期:{format(d.updateTime, 'MM/dd')}
                  </div>
                  {isWhiteList && <Fragment>
                    <IconButton
                      component={RouterLink}
                      to={`/system-update-record/edit/${d.systemUpdateId}`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => { handleDeleteRecord(d.systemUpdateId) }}>
                      <DeleteIcon />
                    </IconButton>
                  </Fragment>}
                </div>
              </AccordionDetails>
            </Accordion>
          )
        })}
    </div>
  )
}

export default Results
