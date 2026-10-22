import { Dialog, DialogTitle, DialogActions, DialogContent } from 'ui/modal-compat'
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import PropTypes from 'prop-types'

const PasswordDialog = ({
  title, inputLabel, open, handleOnCancel, handleOnConfirm, isLoading, inputOnChange
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{ overflow: 'visible' }}>
        <TextField
          // value={editPwd}
          label={inputLabel}
          onChange={e => inputOnChange(e.target.value)}
          inputProps={{
            type: 'password',
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} variant="secondary" onClick={handleOnCancel}>
          取消
        </Button>
        <Button disabled={isLoading} variant="primary" onClick={handleOnConfirm}>
          確認
        </Button>
      </DialogActions>
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
}

export default PasswordDialog