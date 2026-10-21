import React from 'react'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field, Input } from 'ui/input'

// 刪除帳單密碼彈窗；自 ResultsV2.js 原樣搬出，state 與 handler 由 props 傳入
export default function DeleteOrderDialog({
  openDialog,
  handleCloseDialog,
  deleteOrderPwd,
  setDeleteOrderPwd,
  isClick,
  handleConfirmCancel,
}) {
  return (
    <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>刪除帳單？</DialogTitle>
          <DialogDescription>刪除後無法復原，請輸入刪除密碼確認。</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field label="刪除密碼" htmlFor="delete-order-password">
            <Input
              id="delete-order-password"
              type="password"
              value={deleteOrderPwd}
              onChange={event => setDeleteOrderPwd(event.target.value)}
              data-testid="delete-password"
              autoFocus
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button variant="danger" disabled={isClick} onClick={handleConfirmCancel} data-testid="confirm">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
