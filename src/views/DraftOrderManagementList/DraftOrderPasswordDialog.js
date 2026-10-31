import React from 'react'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field, Input } from 'ui/input'

// 刪除／結帳密碼彈窗；自 ResultsV2.js 原樣搬出，state 與 handler 由 props 傳入
export default function DraftOrderPasswordDialog({
  openDialog,
  handleCloseDialog,
  dialogType,
  password,
  setPassword,
  handleConfirmCancel,
  handleConfirmCheckoutOrder,
  editBarOnClick,
  isClick,
}) {
  return (
    <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
      <DialogContent size="sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{dialogType === 'delete' ? '刪除掛單？' : '掛單結帳'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field label={dialogType === 'delete' ? '刪除密碼' : '編輯帳單密碼'} htmlFor="draft-order-password">
            <Input
              id="draft-order-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              data-testid="delete-password"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button
            variant={dialogType === 'delete' ? 'danger' : 'primary'}
            onClick={() => {
              dialogType === 'delete' ? handleConfirmCancel() : handleConfirmCheckoutOrder()
            }}
            autoFocus
            data-testid="confirm"
            disabled={editBarOnClick || isClick}
          >
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
