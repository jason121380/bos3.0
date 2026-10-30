import { Button } from 'ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'

// 與舊版相同：未提供 onOpenChange，只能用「取消／確認」關閉（點背景與 Esc 不會關閉）
const ComfirmDialog = ({ clickData, isClick, dialogOpen, close, confirmFunc }) => {
  return (
    <Dialog open={dialogOpen}>
      <DialogContent size="sm" hideClose>
        <DialogHeader>
          <DialogTitle>
            確認要提前結束<strong>{clickData.name}</strong>？
          </DialogTitle>
          <DialogDescription>結束後將不可復原。</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button disabled={isClick} onClick={close} variant="secondary">
            取消
          </Button>
          <Button disabled={isClick} onClick={() => confirmFunc(clickData)} variant="danger">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ComfirmDialog
