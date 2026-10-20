import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import PropTypes from 'prop-types'

const PasswordDialog = ({
  title, inputLabel, open, handleOnCancel, handleOnConfirm, isLoading, inputOnChange
}) => {
  return (
    // 舊版 Dialog 未設 onClose（只能按取消／確認關閉），故不傳 onOpenChange 並 hideClose
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
          <Button disabled={isLoading} variant="secondary" onClick={handleOnCancel}>
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

PasswordDialog.prototype = {
  title: PropTypes.string,
  inputLabel: PropTypes.string,
  open: PropTypes.bool,
  handleOnClose: PropTypes.func,
  Submit: PropTypes.func,
}

export default PasswordDialog