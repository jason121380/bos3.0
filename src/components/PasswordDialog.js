import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import PropTypes from 'prop-types'

const PasswordDialog = ({ title, inputLabel, open, handleOnCancel, handleOnConfirm, isLoading, inputOnChange, cancelDisabled }) => {
  return (
    <Dialog open={open}>
      <DialogContent size="sm" hideClose aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody style={{ overflow: 'visible' }}>
          <TextField
            // value={editPwd}
            label={inputLabel}
            onChange={e => inputOnChange(e.target.value)}
            inputProps={{
              type: 'password',
            }}
          />
        </DialogBody>
        <DialogFooter>
          {/* cancelDisabled：「取消」另用的停用狀態（單日預約紀錄只在送出中停用）；沒給時與「確認」相同（isLoading），其他呼叫端不受影響（Jason 2026/10/22 fix all） */}
          <Button disabled={cancelDisabled ?? isLoading} variant="secondary" onClick={handleOnCancel}>
            取消
          </Button>
          <Button disabled={isLoading} variant="primary" onClick={handleOnConfirm}>
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 原本寫成 PasswordDialog.prototype（型別檢查沒有作用）且列的是不存在的 props（handleOnClose、Submit）；改為 propTypes、對齊實際 props（Jason 2026/10/22 fix all）
PasswordDialog.propTypes = {
  title: PropTypes.string,
  inputLabel: PropTypes.string,
  open: PropTypes.bool,
  handleOnCancel: PropTypes.func,
  handleOnConfirm: PropTypes.func,
  isLoading: PropTypes.bool,
  inputOnChange: PropTypes.func,
  cancelDisabled: PropTypes.bool,
}

export default PasswordDialog
