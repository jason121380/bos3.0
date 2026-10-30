// 離線真瀏覽器驗證頁：各情境分開載入，避免前一個浮層影響下一個情境。
import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog'
import { DatePicker, MobileDatePicker } from 'ui/date-picker'
import { Autocomplete } from 'ui/combobox'
import PasswordDialog from 'components/PasswordDialog'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'ui/select'
import { Popover, PopoverTrigger, PopoverContent } from 'ui/popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from 'ui/dropdown-menu'
import { Toaster, toast } from 'ui/toast'
import '../../../../src/styles/tokens.css'

window.__events = []
window.__focus = []
window.__scopes = []
for (const type of ['focusScope.autoFocusOnMount', 'focusScope.autoFocusOnUnmount'])
  document.addEventListener(
    type,
    event => {
      window.__scopes.push([
        type,
        event.target.id,
        document.activeElement && (document.activeElement.id || document.activeElement.outerHTML.slice(0, 100)),
      ])
    },
    true
  )
for (const type of ['focusin', 'focusout'])
  document.addEventListener(type, event => {
    window.__focus.push([
      type,
      event.target.id || event.target.tagName,
      event.relatedTarget && (event.relatedTarget.id || event.relatedTarget.tagName),
    ])
    if (window.__focus.length > 30) window.__focus.shift()
  })
function App() {
  const kind = location.search.slice(1)
  const [lower, setLower] = React.useState(true)
  const [upper, setUpper] = React.useState(false)
  const [date, setDate] = React.useState(new Date(2026, 9, 20))
  const [value, setValue] = React.useState(null)
  const [password, setPassword] = React.useState('')
  const [modalOpen, setModalOpen] = React.useState(false)
  const changeLower = open => {
    window.__events.push(['lower', open])
    setLower(open)
  }
  const changeUpper = open => {
    window.__events.push(['upper', open])
    setUpper(open)
  }
  const content = (
    <>
      <input id="lower-input" aria-label="下層輸入" />
      {(kind === 'desktop' || kind === 'mobile' || kind === 'customer-form') &&
        React.createElement(kind === 'mobile' ? MobileDatePicker : DatePicker, {
          value: date,
          closeOnSelect: true,
          onChange: next => {
            setDate(next)
            window.__events.push(['date', next.getDate()])
          },
          slotProps: { textField: { id: 'date-field' } },
        })}
      {['combobox', 'nested-password', 'customer-form'].includes(kind) && (
        <Autocomplete
          onOpen={() => window.__events.push(['選單開啟'])}
          onClose={(event, reason) => window.__events.push(['選單關閉', reason])}
          options={['剪髮', '染髮']}
          value={value}
          onChange={(e, next) => setValue(next)}
          renderInput={p => <TextField {...p} label="服務" />}
        />
      )}
      {kind === 'select' && (
        <Select onValueChange={setValue}>
          <SelectTrigger id="select-trigger">
            <SelectValue placeholder="選擇服務" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="染髮">染髮</SelectItem>
          </SelectContent>
        </Select>
      )}
      {kind === 'popover' && (
        <Popover>
          <PopoverTrigger id="popover-trigger">開啟浮層</PopoverTrigger>
          <PopoverContent>
            <input id="popover-input" aria-label="浮層輸入" />
            <button id="popover-button" onClick={() => setValue('已點擊')}>
              浮層按鈕
            </button>
          </PopoverContent>
        </Popover>
      )}
      {kind === 'customer-form' && (
        <>
          <NativeSelect name="gender" value={password} onChange={e => setPassword(e.target.value)}>
            <NativeSelectOption value="UNKNOWN">未知</NativeSelectOption>
            <NativeSelectOption value="FEMALE">女</NativeSelectOption>
          </NativeSelect>
          <button id="close-customer" onClick={() => setLower(false)}>
            取消
          </button>
        </>
      )}
      {kind === 'click-away' && (
        <div className="flex flex-col gap-3">
          <Select>
            <SelectTrigger id="away-select">
              <SelectValue placeholder="點外關閉選單" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">選項甲</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger id="away-popover">點外關閉浮層</PopoverTrigger>
            <PopoverContent id="away-panel">
              <input aria-label="點外浮層輸入" />
            </PopoverContent>
          </Popover>
          <DatePicker value={date} onChange={setDate} slotProps={{ textField: { id: 'away-date' } }} />
          <NativeSelect value="" onChange={() => {}} inputProps={{ 'aria-label': '點外單選' }}>
            <NativeSelectOption value="a">單選甲</NativeSelectOption>
          </NativeSelect>
          {/* 放在各浮層上方且留足距離，避免點擊位置被月曆或清單遮住。 */}
          <button id="after-btn" style={{ position: 'fixed', top: 12, right: 12 }}>
            下一個按鈕
          </button>
        </div>
      )}
      <output id="value">{value}</output>
      <button id="open-upper" onClick={() => setUpper(true)}>
        開啟上層
      </button>
      <button id="show-toast" onClick={() => toast.error('全站提示')}>
        顯示提示
      </button>
    </>
  )
  const radix = (open, change, id, children) => (
    <Dialog open={open} onOpenChange={kind === 'customer-form' ? undefined : change}>
      <DialogContent
        hideClose={kind === 'customer-form'}
        id={id}
        aria-describedby={undefined}
        onEscapeKeyDown={event => window.__events.push(['對話框Esc', id, event.defaultPrevented])}
        onPointerDownOutside={event =>
          window.__events.push(['外部指標', event.target && event.target.outerHTML.slice(0, 180), event.target && event.target.isConnected])
        }
        onFocusOutside={event => window.__events.push(['外部焦點', event.target && event.target.outerHTML.slice(0, 180)])}
      >
        <DialogTitle>{id === 'lower' ? '下層對話框' : '上層對話框'}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
  const upperContent = (
    <>
      {kind === 'reservation' && (
        <>
          <Autocomplete
            options={['剪髮', '染髮']}
            value={value}
            onChange={(e, next) => setValue(next)}
            renderInput={p => <TextField {...p} label="預約服務" />}
          />
          <DatePicker value={date} onChange={setDate} />
          <button id="open-password" onClick={() => setModalOpen(true)}>
            取消預約
          </button>
        </>
      )}
      <input id="upper-input" aria-label="上層輸入" />
      {kind === 'nested-date' && (
        <>
          <DatePicker
            label="巢狀桌機日期"
            value={date}
            onChange={next => {
              setDate(next)
              window.__events.push(['巢狀日期', next.getDate()])
            }}
          />
          <MobileDatePicker
            slotProps={{ textField: { id: 'nested-mobile-date' } }}
            label="巢狀手機日期"
            value={date}
            closeOnSelect
            onChange={next => {
              setDate(next)
              window.__events.push(['巢狀手機日期', next.getDate()])
            }}
          />
        </>
      )}
      {kind === 'dropdown' && (
        <DropdownMenu>
          <DropdownMenuTrigger id="dropdown-trigger">開啟最上層選單</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem id="dropdown-item">選單項目</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
  return (
    <>
      <Toaster />
      {kind === 'reservation' && (
        <PasswordDialog
          open={modalOpen}
          title="預約取消密碼"
          inputLabel="取消密碼"
          inputOnChange={setPassword}
          handleOnCancel={() => setModalOpen(false)}
          handleOnConfirm={() => setModalOpen(false)}
        />
      )}
      {radix(lower, changeLower, 'lower', content)}
      {kind === 'nested-password' ? (
        <PasswordDialog
          open={upper}
          title="巢狀操作密碼"
          inputLabel="操作密碼"
          inputOnChange={setPassword}
          handleOnCancel={() => changeUpper(false)}
          handleOnConfirm={() => {
            window.__events.push(['密碼確認', password])
            changeUpper(false)
          }}
        />
      ) : (
        radix(upper, changeUpper, 'upper', upperContent)
      )}
    </>
  )
}
ReactDOM.render(<App />, document.getElementById('root'))
