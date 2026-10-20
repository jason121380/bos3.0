// 日期選擇器回呼序列比對頁：同一情境（?kind）分別以 MUI x-date-pickers（#m）與自家 ui/date-picker（#c）渲染，記錄 onChange／onAccept／onClose／onError 到 window.__log。
// 用法見 date-picker-run.js。
import React from 'react'
import ReactDOM from 'react-dom'
import { format } from 'date-fns'
import zhTW from 'date-fns/locale/zh-TW'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MobileDatePicker as MMobile } from '@mui/x-date-pickers/MobileDatePicker'
import { DatePicker as MDesktop } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker as MDT } from '@mui/x-date-pickers/DateTimePicker'
import { MobileDateTimePicker as MMDT } from '@mui/x-date-pickers/MobileDateTimePicker'
import { MuiScope } from '../mui-theme'
import * as C from 'ui/date-picker'

const M = { MobileDatePicker: MMobile, DatePicker: MDesktop, DateTimePicker: MDT, MobileDateTimePicker: MMDT }
const fmt = v => (v === null ? 'null' : v instanceof Date ? (isNaN(v) ? 'Invalid' : format(v, 'yyyy-MM-dd HH:mm')) : typeof v)
const log = (tag, ...a) => (window.__log[tag] = window.__log[tag] || []).push(a.join(' '))

function Scenario({ L, tag, kind }) {
  const [v, setV] = React.useState(kind === 'empty' || kind === 'type' || kind === 'dtType' ? null : kind === 'future' ? new Date(2026, 10, 2) : new Date(2026, 9, 20, 9, 30))
  const common = {
    value: v,
    onChange: x => { log(tag, 'change', fmt(x)); setV(x) },
    onAccept: x => log(tag, 'accept', fmt(x)),
    onClose: () => log(tag, 'close'),
    onError: (e, x) => log(tag, 'error', e, fmt(x)),
  }
  if (kind === 'selectClose')
    return <L.MobileDatePicker {...common} closeOnSelect format="yyyy/MM/dd" slots={{ field: p => <button id={tag + '-f'} onClick={p.onClick}>{format(p.value, 'yyyy/MM/dd')}</button> }} />
  if (kind === 'cancelOk') return <L.MobileDatePicker {...common} format="yyyy/MM/dd" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'monthYear') return <L.MobileDatePicker {...common} views={['month', 'year']} format="yyyy/MM" closeOnSelect slots={{ field: p => <button id={tag + '-f'} onClick={p.onClick}>{format(p.value, 'yyyy/MM')}</button> }} />
  if (kind === 'openYear') return <L.MobileDatePicker {...common} openTo="year" format="yyyy/MM/dd" closeOnSelect slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'minDate') return <L.MobileDatePicker {...common} minDate={new Date(2026, 9, 21)} format="yyyy/MM/dd" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'dtType') return <L.DateTimePicker {...common} format="yyyy/MM/dd HH:mm" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'desktopPick') return <L.DatePicker {...common} format="yyyy/MM/dd" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'future') return <L.DatePicker {...common} disableFuture format="yyyy/MM/dd" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'type') return <L.DatePicker {...common} format="yyyy/MM/dd" slotProps={{ textField: { id: tag + '-f' } }} />
  if (kind === 'mdt') return <L.MobileDateTimePicker {...common} format="yyyy/MM/dd HH:mm" slotProps={{ textField: { id: tag + '-f' } }} />
  return null
}

const kind = window.location.search.slice(1)
ReactDOM.render(
  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW} localeText={{ cancelButtonLabel: '取消', okButtonLabel: '確認' }}>
    <MuiScope>
      <div id="m"><Scenario L={M} tag="m" kind={kind} /></div>
      <div id="c"><Scenario L={C} tag="c" kind={kind} /></div>
    </MuiScope>
  </LocalizationProvider>,
  document.getElementById('root')
)
window.__log = {}
