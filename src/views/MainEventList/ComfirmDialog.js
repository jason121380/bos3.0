import {
  Dialog, DialogContent, DialogTitle, DialogActions,
  DialogContentText, Button
} from '@mui/material'

const ComfirmDialog = ({ clickData, isClick, dialogOpen, close, confirmFunc }) => {
  return (
    <Dialog open={dialogOpen}>
      <DialogTitle>
        確認要提前結束<strong>{ clickData.name }</strong>？
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          結束後將不可復原。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={isClick} onClick={close} color='inherit' variant='contained'>取消</Button>
        <Button disabled={isClick} onClick={() => confirmFunc(clickData)} color='primary' variant='contained'>確認</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ComfirmDialog