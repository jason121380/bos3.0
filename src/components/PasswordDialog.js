import { TextField } from 'ui/text-field'
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material'
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

PasswordDialog.prototype = {
  title: PropTypes.string,
  inputLabel: PropTypes.string,
  open: PropTypes.bool,
  handleOnClose: PropTypes.func,
  Submit: PropTypes.func,
}

export default PasswordDialog