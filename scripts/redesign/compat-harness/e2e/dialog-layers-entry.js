// 離線真瀏覽器驗證頁：各情境分開載入，避免前一個浮層影響下一個情境。
import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog'
import { Dialog as CompatDialog, Modal } from 'ui/modal-compat'
import { DatePicker, MobileDatePicker } from 'ui/date-picker'
import { Autocomplete } from 'ui/combobox'
import PasswordDialog from 'components/PasswordDialog'
import { TextField } from 'ui/text-field'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'ui/select'
import { Popover, PopoverTrigger, PopoverContent } from 'ui/popover'
import { Popper } from 'ui/overlay-compat'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from 'ui/dropdown-menu'
import { Toaster, toast } from 'ui/toast'
import '../../../../src/styles/tokens.css'

window.__events = []
window.__focus = []
window.__scopes = []
for (const type of ['focusScope.autoFocusOnMount', 'focusScope.autoFocusOnUnmount']) document.addEventListener(type, event => {
  window.__scopes.push([type, event.target.id, document.activeElement && (document.activeElement.id || document.activeElement.outerHTML.slice(0, 100))])
}, true)
for (const type of ['focusin', 'focusout']) document.addEventListener(type, event => {
  window.__focus.push([type, event.target.id || event.target.tagName, event.relatedTarget && (event.relatedTarget.id || event.relatedTarget.tagName)])
  if (window.__focus.length > 30) window.__focus.shift()
})
function App() {
  const kind = location.search.slice(1)
  const [lower, setLower] = React.useState(true)
  const [upper, setUpper] = React.useState(false)
  const [date, setDate] = React.useState(new Date(2026, 9, 20))
  const [value, setValue] = React.useState(null)
  const [password, setPassword] = React.useState('')
  const [popperOpen, setPopperOpen] = React.useState(false)
  const [modalOpen, setModalOpen] = React.useState(false)
  const anchor = React.useRef(null)
  const changeLower = open => { window.__events.push(['lower', open]); setLower(open) }
  const changeUpper = open => { window.__events.push(['upper', open]); setUpper(open) }
  const content = <>
    <input id="lower-input" aria-label="下層輸入" />
    {(kind === 'desktop' || kind === 'mobile') && React.createElement(kind === 'mobile' ? MobileDatePicker : DatePicker, {
      value: date, closeOnSelect: true, onChange: next => { setDate(next); window.__events.push(['date', next.getDate()]) },
      slotProps: { textField: { id: 'date-field' } },
    })}
    {['combobox', 'nested-password'].includes(kind) && <Autocomplete onOpen={() => window.__events.push(['選單開啟'])} onClose={(event, reason) => window.__events.push(['選單關閉', reason])} options={['剪髮', '染髮']} value={value} onChange={(e, next) => setValue(next)} renderInput={p => <TextField {...p} label="服務" />} />}
    {kind === 'select' && <Select onValueChange={setValue}><SelectTrigger id="select-trigger"><SelectValue placeholder="選擇服務" /></SelectTrigger><SelectContent><SelectItem value="染髮">染髮</SelectItem></SelectContent></Select>}
    {kind === 'popover' && <Popover><PopoverTrigger id="popover-trigger">開啟浮層</PopoverTrigger><PopoverContent><input id="popover-input" aria-label="浮層輸入" /><button id="popover-button" onClick={() => setValue('已點擊')}>浮層按鈕</button></PopoverContent></Popover>}
    {kind === 'keep-mounted' && <>
      <button ref={anchor} id="open-popper" onClick={() => setPopperOpen(true)}>開啟相容浮層</button>
      <Popper open={popperOpen} anchorEl={anchor.current} keepMounted onEscapeKeyDown={() => setPopperOpen(false)}><div id="compat-popper" style={{ background: 'white', padding: 16 }}><input id="popper-input" aria-label="相容浮層輸入" /></div></Popper>
      <button id="open-modal" onClick={() => setModalOpen(true)}>開啟保留掛載視窗</button>
      <Modal open={modalOpen} keepMounted onClose={() => setModalOpen(false)}><div id="compat-modal" style={{ position: 'absolute', top: 100, left: 100, padding: 24, background: 'white' }}><input id="modal-input" aria-label="保留掛載輸入" /></div></Modal>
    </>}
    <output id="value">{value}</output>
    <button id="open-upper" onClick={() => setUpper(true)}>開啟上層</button>
    <button id="show-toast" onClick={() => toast.error('全站提示')}>顯示提示</button>
  </>
  const radix = (open, change, id, children) => <Dialog open={open} onOpenChange={change}><DialogContent id={id} aria-describedby={undefined}
    onEscapeKeyDown={event => window.__events.push(['對話框Esc', id, event.defaultPrevented])}
    onPointerDownOutside={event => window.__events.push(['外部指標', event.target && event.target.outerHTML.slice(0, 180), event.target && event.target.isConnected])}
    onFocusOutside={event => window.__events.push(['外部焦點', event.target && event.target.outerHTML.slice(0, 180)])}
  ><DialogTitle>{id === 'lower' ? '下層對話框' : '上層對話框'}</DialogTitle>{children}</DialogContent></Dialog>
  const compat = (open, change, id, children) => <CompatDialog open={open} onClose={() => change(false)} PaperProps={{ id, 'aria-label': id === 'lower' ? '下層對話框' : '上層對話框' }}><div style={{ padding: 24 }}>{children}</div></CompatDialog>
  const upperContent = <><input id="upper-input" aria-label="上層輸入" />{kind === 'nested-date' && <><DatePicker label="巢狀桌機日期" value={date} onChange={next => { setDate(next); window.__events.push(['巢狀日期', next.getDate()]) }} /><MobileDatePicker slotProps={{ textField: { id: 'nested-mobile-date' } }} label="巢狀手機日期" value={date} closeOnSelect onChange={next => { setDate(next); window.__events.push(['巢狀手機日期', next.getDate()]) }} /></>}{kind === 'dropdown' && <DropdownMenu><DropdownMenuTrigger id="dropdown-trigger">開啟最上層選單</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem id="dropdown-item">選單項目</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</>
  return <><Toaster />{['compat-radix', 'nested-password', 'nested-date'].includes(kind) ? compat(lower, changeLower, 'lower', content) : radix(lower, changeLower, 'lower', content)}{kind === 'nested-password' ? <PasswordDialog open={upper} title="巢狀操作密碼" inputLabel="操作密碼" inputOnChange={setPassword} handleOnCancel={() => changeUpper(false)} handleOnConfirm={() => { window.__events.push(['密碼確認', password]); changeUpper(false) }} /> : kind === 'radix-compat' ? compat(upper, changeUpper, 'upper', upperContent) : radix(upper, changeUpper, 'upper', upperContent)}</>
}
ReactDOM.render(<App />, document.getElementById('root'))
