/** @jsxImportSource @emotion/react */
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Select,
  FormControl, MenuItem
} from '@mui/material'

const PublishedDialog = ({
  open, isPublished, setIsPublished, handleClosePublishDialog,
  handleSetPublished, isClick
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle id="alert-dialog-title">編輯上下架</DialogTitle>
      <DialogContent style={{ overflow: 'visible' }}>
        <FormControl variant="outlined" style={{ width: 200 }}>
          <Select
            value={isPublished}
            onChange={({ target: { value } }) => setIsPublished(value)}
          >
            <MenuItem value={true}>上架</MenuItem>
            <MenuItem value={false}>下架</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button disabled={isClick} variant='contained' onClick={handleClosePublishDialog} color="primary">
          取消
        </Button>
        <Button disabled={isClick} variant='contained' onClick={handleSetPublished} color="primary" autoFocus data-testid="confirm">
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublishedDialog