import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Modal, Dialog, DialogTitle, DialogContent, DialogActions, Backdrop } from '../modal-compat'

afterEach(cleanup)

describe('ui/modal-compat（與 MUI Modal／Dialog 相容）', () => {
  // 各頁的 handleClose 依 reason 判斷（例如帳單彈窗只允許按鈕關閉）：Esc 與點背景的 reason 必須和 MUI 相同
  it('Esc 以 escapeKeyDown、點面板外以 backdropClick 呼叫 onClose', () => {
    const onClose = jest.fn()
    render(
      <Dialog open onClose={onClose}>
        <DialogTitle>確認</DialogTitle>
        <DialogContent>內容</DialogContent>
      </Dialog>
    )
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose.mock.calls[0][1]).toBe('escapeKeyDown')
    const container = dialog.parentElement
    fireEvent.mouseDown(container)
    fireEvent.click(container)
    expect(onClose.mock.calls[1][1]).toBe('backdropClick')
    // 在面板內按下、拖到外面放開：不算點背景（避免選字時誤關）
    fireEvent.mouseDown(dialog)
    fireEvent.click(container)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  // 報讀器以 aria-labelledby 讀出對話框標題；沒給 id 時自動配對
  it('對話框以 DialogTitle 為名稱，可用 role 找到', () => {
    render(
      <Dialog open>
        <DialogTitle>刪除顧客</DialogTitle>
        <DialogActions>
          <button type="button">取消</button>
        </DialogActions>
      </Dialog>
    )
    expect(screen.getByRole('dialog', { name: '刪除顧客' })).toBeInTheDocument()
  })

  // 開啟：焦點移入、body 不可捲動、背後頁面對報讀器隱藏；關閉：全部還原、焦點回到開啟按鈕
  it('開啟時鎖焦點與捲動並隱藏背後內容，關閉後還原', () => {
    const Demo = () => {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            開啟
          </button>
          <Modal open={open}>
            <div>
              <button type="button" onClick={() => setOpen(false)}>
                關閉
              </button>
            </div>
          </Modal>
        </>
      )
    }
    const { container } = render(<Demo />)
    const opener = screen.getByText('開啟')
    act(() => opener.focus())
    fireEvent.click(opener)
    const modalRoot = document.querySelector('.MuiModal-root')
    expect(modalRoot.contains(document.activeElement)).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(container).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(screen.getByText('關閉'))
    expect(document.querySelector('.MuiModal-root')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(container).not.toHaveAttribute('aria-hidden')
    expect(document.activeElement).toBe(opener)
  })

  // 兩層彈窗（例如帳單彈窗上再開確認框）：Esc 只關最上層
  it('多層時 Esc 只交給最上層', () => {
    const outer = jest.fn()
    const inner = jest.fn()
    render(
      <>
        <Dialog open onClose={outer}>
          <DialogContent>外層</DialogContent>
        </Dialog>
        <Dialog open onClose={inner}>
          <DialogContent>內層</DialogContent>
        </Dialog>
      </>
    )
    fireEvent.keyDown(screen.getByText('外層'), { key: 'Escape' })
    expect(outer).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByText('內層'), { key: 'Escape' })
    expect(inner).toHaveBeenCalledTimes(1)
  })

  it('關閉時不渲染；Backdrop 關閉時保留但隱藏', () => {
    render(
      <>
        <Dialog open={false}>
          <DialogContent>看不到</DialogContent>
        </Dialog>
        <Backdrop open={false} data-testid="bd" />
      </>
    )
    expect(screen.queryByText('看不到')).toBeNull()
    expect(screen.getByTestId('bd').style.visibility).toBe('hidden')
  })
})
