import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Button } from 'ui/button'

const PublishedDialog = ({ open, isPublished, setIsPublished, handleClosePublishDialog, handleSetPublished, isClick }) => {
  return (
    <Dialog open={open}>
      <DialogContent size="sm" hideClose aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle id="alert-dialog-title">編輯上下架</DialogTitle>
        </DialogHeader>
        <DialogBody style={{ overflow: 'visible' }}>
          <FormControl variant="outlined" style={{ width: 200 }}>
            <NativeSelect value={isPublished} onChange={({ target: { value } }) => setIsPublished(value)} displayEmpty={false} placeholder="請選擇…">
              <NativeSelectOption value={true}>上架</NativeSelectOption>
              <NativeSelectOption value={false}>下架</NativeSelectOption>
            </NativeSelect>
          </FormControl>
        </DialogBody>
        <DialogFooter>
          <Button disabled={isClick} variant="secondary" onClick={handleClosePublishDialog}>
            取消
          </Button>
          <Button disabled={isClick} variant="primary" onClick={handleSetPublished} autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PublishedDialog
