// 重新結帳密碼視窗（帳單詳細、掛單詳細原本各一份，2026/10/21 合併）。
// 密碼欄位有游標位置與貼上處理，保留 TextField 與原輸入處理。
// 密碼本身（reCheckoutPwd）仍由各頁保管，送出時帶入；這裡只負責遮罩顯示與輸入處理，處理函式自兩頁原樣搬來、一字未改。
import { useRef, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from 'ui/button'

export default function ReCheckoutPasswordDialog({ open, onClose, title, reCheckoutPwd, setReCheckoutPwd, confirmDisabled, onConfirm }) {
  const inputRef = useRef(null)
  const [selection, setSelection] = useState({ start: 0, end: 0 })

  const handlePasswordChange = e => {
    const value = e.target.value
    const { start, end } = selection
    const clonePassword = cloneDeep(reCheckoutPwd)
    const delta = value.length - reCheckoutPwd.length
    let combineValue = ''

    if (delta > 0) {
      combineValue = clonePassword.slice(0, start) + value.slice(start, start + delta) + clonePassword.slice(end, clonePassword.length)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = start + delta
          inputRef.current.selectionEnd = start + delta
        }
      }, 0)
    } else {
      if (end - start === Math.abs(delta)) {
        combineValue = clonePassword.slice(0, start) + clonePassword.slice(end, clonePassword.length)
      } else if (start === end) {
        combineValue = clonePassword.slice(0, start - 1) + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start - 1
            inputRef.current.selectionEnd = start - 1
          }
        }, 0)
      } else {
        const sliceValue = value.slice(start, start + 1)
        combineValue = clonePassword.slice(0, start) + sliceValue + clonePassword.slice(end, clonePassword.length)
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = start + 1
            inputRef.current.selectionEnd = start + 1
          }
        }, 0)
      }
    }
    setReCheckoutPwd(combineValue)
  }

  const handleSelect = event => {
    setSelection({
      start: event.target.selectionStart,
      end: event.target.selectionEnd,
    })
  }

  const handleKeyDown = event => {
    if (event.key === 'Delete') {
      event.preventDefault()
    }
    if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault()
    }
  }

  const handlePaste = event => {
    event.preventDefault()
    const pasteData = event.clipboardData.getData('text')
    const { start, end } = selection

    const newActualValue = reCheckoutPwd.slice(0, start) + pasteData + reCheckoutPwd.slice(end)

    setReCheckoutPwd(newActualValue)

    // 更新光标位置
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd = start + pasteData.length
      }
    }, 0)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onClose
          ? value => {
              // Radix 只會以 false 要求關閉（沒有 DialogTrigger），value 為 true 的分支測不到
              /* istanbul ignore else */
              if (!value) onClose()
            }
          : undefined
      }
    >
      <DialogContent size="sm" hideClose aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody style={{ overflow: 'visible' }}>
          <div id="alert-dialog-description">
            <TextField
              label="密碼"
              inputRef={inputRef}
              value={new Array(reCheckoutPwd.length).fill('*').join('')}
              onChange={handlePasswordChange}
              onSelect={handleSelect}
              onCopy={e => e.preventDefault()}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              type="text"
            />
          </div>
        </DialogBody>
        <DialogFooter className="ui-root">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" disabled={confirmDisabled} onClick={onConfirm} autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
