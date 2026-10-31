// 刪除前的二次確認（STYLE.md §6）。為什麼重要：批次刪除與各頁的刪除流程都經過這個對話框，
// Esc／取消只能關閉、絕不能觸發刪除；按「刪除」才呼叫 onConfirm；後果文案要讓使用者看到。
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import ConfirmDeleteDialog from '../ConfirmDeleteDialog'

afterEach(cleanup)

const setup = props => {
  const onClose = jest.fn()
  const onConfirm = jest.fn()
  render(<ConfirmDeleteDialog open onClose={onClose} onConfirm={onConfirm} message="確定刪除 3 筆商品？" {...props} />)
  return { onClose, onConfirm }
}

describe('ConfirmDeleteDialog', () => {
  it('Esc 只關閉，不刪除', () => {
    const { onClose, onConfirm } = setup()
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('取消只關閉；刪除才呼叫 onConfirm', () => {
    const { onClose, onConfirm } = setup()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('預設寫出「刪除後無法復原」；可自訂標題、後果與按鈕文字，後果可省略', () => {
    setup()
    expect(screen.getByRole('alertdialog')).toHaveTextContent('確認刪除')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('確定刪除 3 筆商品？')
    expect(screen.getByRole('alertdialog')).toHaveTextContent('刪除後無法復原。')
    cleanup()
    setup({ title: '作廢帳單', consequence: null, confirmLabel: '作廢', message: undefined })
    expect(screen.getByRole('alertdialog')).toHaveTextContent('作廢帳單')
    expect(screen.getByRole('alertdialog')).not.toHaveTextContent('刪除後無法復原。')
    expect(screen.getByRole('button', { name: '作廢' })).toBeInTheDocument()
  })

  it('關閉狀態不顯示', () => {
    setup({ open: false })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})
