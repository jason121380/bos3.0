import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'

// 刪除前的二次確認（STYLE.md §6：危險操作需二次確認並寫出後果）。
// 只負責呈現：取消／Esc／點背景只關閉；按「刪除」才呼叫 onConfirm，實際刪除的 mutation 留在呼叫端。
function ConfirmDeleteDialog({ open, onClose, onConfirm, title = '確認刪除', message, consequence = '刪除後無法復原。', confirmLabel = '刪除' }) {
  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) onClose()
      }}
    >
      <DialogContent size="sm" hideClose role="alertdialog" aria-describedby="confirm-delete-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div id="confirm-delete-description" className="flex flex-col gap-2">
            {message && <p className="whitespace-pre-line text-body text-text">{message}</p>}
            {consequence && <p className="text-body text-text-secondary">{consequence}</p>}
          </div>
        </DialogBody>
        <DialogFooter className="gap-2 max-sm:[&>button]:flex-1">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm} data-testid="confirm-delete">
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ConfirmDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.node,
  consequence: PropTypes.node,
  confirmLabel: PropTypes.string,
}

export default ConfirmDeleteDialog
