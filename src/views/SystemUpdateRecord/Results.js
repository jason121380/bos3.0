// 每筆紀錄的展開區保留 MUI Accordion（橋接主題已套新外觀）；內含 Markdown 預覽，不套 ui-root（其基礎樣式會清掉 ol 編號）
import React, { useState, Fragment } from 'react'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'

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
    <div className="flex flex-col gap-3">
      {data.length > 0 &&
        data.map((d, index) => {
          return (
            <Accordion key={index} expanded={index === open}>
              <AccordionSummary
                expandIcon={<ChevronDown className="h-4 w-4" strokeWidth={1.75} />}
                onClick={() => {
                  index === open ? setOpen(-1) : setOpen(index)
                }}
              >
                <div className="flex w-full items-center justify-between gap-4 pr-2">
                  <h2 className="m-0 text-heading text-text">{d.title}</h2>
                  <div className="shrink-0 text-label tabular-nums text-text-secondary">版本:{d.versionNo}</div>
                </div>
              </AccordionSummary>
              <AccordionDetails className="flex flex-col overflow-x-auto">
                <MdEditor theme={theme} modelValue={d.content} previewOnly language='en-US' />
                <div className="ui-root flex w-full items-center justify-end gap-1 pt-3 text-caption text-text-secondary">
                  <div className="mr-2 tabular-nums">
                    更新日期:{format(d.updateTime, 'MM/dd')}
                  </div>
                  {isWhiteList && <Fragment>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <RouterLink
                        aria-label="編輯版本紀錄"
                        to={`/system-update-record/edit/${d.systemUpdateId}`}
                      >
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-secondary hover:text-danger"
                      aria-label="刪除版本紀錄"
                      onClick={() => { handleDeleteRecord(d.systemUpdateId) }}
                    >
                      <Trash2 strokeWidth={1.75} />
                    </Button>
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
