// MUI Dialog 保留：內含 MUI Select（值為布林，Radix Select 不支援）
import { Dialog, DialogTitle, DialogContent, DialogActions } from 'ui/modal-compat'
import { Select, FormControl, MenuItem } from 'ui/form-control'
import { Button } from 'ui/button'

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
        <Button disabled={isClick} variant="secondary" onClick={handleClosePublishDialog}>
          取消
        </Button>
        <Button disabled={isClick} variant="primary" onClick={handleSetPublished} autoFocus data-testid="confirm">
          確認
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublishedDialog