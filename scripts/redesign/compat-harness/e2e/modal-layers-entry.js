import React from 'react'
import ReactDOM from 'react-dom'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MuiScope } from 'ui/mui-theme'
import { Dialog, DialogContent, Modal } from 'ui/modal-compat'
import { MobileDatePicker } from 'ui/date-picker'
import { Autocomplete } from 'ui/combobox'
import { TextField } from 'ui/text-field'

function App() {
  const [date, setDate] = React.useState(new Date('2026-10-20T00:00:00'))
  const [open, setOpen] = React.useState(true)
  const [val, setVal] = React.useState(null)
  return (
    <MuiScope>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <button id="outside">頁面按鈕</button>
        {location.search === '?a' && <Dialog data-ours="1" open={open} onClose={(e, r) => { window.__closed = r; setOpen(false) }}>
          <DialogContent>
            <MobileDatePicker value={date} onChange={d => setDate(d)} format="yyyy/MM/dd" />
            <div id="picked">{date ? date.toISOString().slice(0, 10) : ''}</div>
          </DialogContent>
        </Dialog>}
        {location.search === '?b' && <Modal open>
          <div style={{ position: 'absolute', top: 400, left: 20, width: 300, background: 'white' }}>
            <Autocomplete options={['剪髮', '染髮', '燙髮']} value={val} onChange={(e, v) => setVal(v)} renderInput={p => <TextField {...p} label="服務" />} />
            <div id="svc">{val || ''}</div>
          </div>
        </Modal>}
      </LocalizationProvider>
    </MuiScope>
  )
}
ReactDOM.render(<App />, document.getElementById('root'))
