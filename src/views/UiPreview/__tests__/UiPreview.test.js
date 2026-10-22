// 保護開發用元件預覽頁（/ui-preview，只在非正式建置註冊路由）：不呼叫任何 API、所有示範元件都能操作不拋錯。
// 守住：深色切換掛在 <html>（離開頁面時移除）、分頁與每頁筆數、Toast、確認對話框、分頁籤、下拉／切換鈕／開關等示範狀態。
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { fieldByLabel, pickOption, selectedText } from '../../__tests__/settingsPageKit.test'
import UiPreview from '..'

afterEach(cleanup)

it('深色切換加在 <html>，再按回淺色；離開頁面時移除', () => {
  const { unmount } = render(<UiPreview />)
  expect(screen.getByText('元件預覽')).toBeInTheDocument()
  expect(document.documentElement).not.toHaveClass('dark')
  fireEvent.click(screen.getByRole('button', { name: '深色' }))
  expect(document.documentElement).toHaveClass('dark')
  fireEvent.click(screen.getByRole('button', { name: '淺色' }))
  expect(document.documentElement).not.toHaveClass('dark')
  fireEvent.click(screen.getByRole('button', { name: '深色' }))
  unmount()
  expect(document.documentElement).not.toHaveClass('dark')
})

it('示範表格：金額千分位、狀態徽章；分頁下一頁、改每頁筆數回第一頁', () => {
  render(<UiPreview />)
  expect(screen.getAllByText('1,880')[0].tagName).toBe('TD')
  expect(screen.getByText('已付款')).toBeInTheDocument()
  expect(screen.getByText('待處理')).toBeInTheDocument()
  expect(screen.getByText('已退款')).toBeInTheDocument()
  const prev = screen.getByLabelText('上一頁')
  expect(prev).toBeDisabled()
  fireEvent.click(screen.getByLabelText('下一頁'))
  expect(screen.getByLabelText('上一頁')).not.toBeDisabled()
  pickOption(screen.getByLabelText('每頁筆數'), '25')
  expect(selectedText(screen.getByLabelText('每頁筆數'))).toBe('25')
  expect(screen.getByLabelText('上一頁')).toBeDisabled()
})

it('Toast：成功與錯誤提示', () => {
  render(<UiPreview />)
  fireEvent.click(screen.getByRole('button', { name: '成功提示' }))
  expect(screen.getByText('已儲存帳單')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '錯誤提示' }))
  expect(screen.getByText('儲存失敗')).toBeInTheDocument()
  expect(screen.getByText('網路連線中斷，請確認網路後再按一次儲存。')).toBeInTheDocument()
})

it('確認對話框可開啟並以取消關閉', () => {
  render(<UiPreview />)
  fireEvent.click(screen.getByRole('button', { name: '刪除帳單' }))
  expect(screen.getByText('確定要刪除這張帳單？')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  expect(screen.queryByText('確定要刪除這張帳單？')).toBeNull()
})

it('下拉、切換鈕、篩選鈕、開關的示範狀態', () => {
  render(<UiPreview />)
  const status = fieldByLabel('帳號狀態')
  fireEvent.change(status, { target: { value: status.options[1].value } })
  expect(status.options[status.selectedIndex].textContent).toBe('停用')
  const day = screen.getByRole('button', { name: '日' })
  const week = screen.getByRole('button', { name: '週' })
  expect(day).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(week)
  expect(week).toHaveAttribute('aria-pressed', 'true')
  // 再按已選的不會取消選取
  fireEvent.click(week)
  expect(week).toHaveAttribute('aria-pressed', 'true')
  const chip = screen.getByRole('button', { name: '只看指定' })
  expect(chip).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(chip)
  expect(chip).toHaveAttribute('aria-pressed', 'true')
  const sw = screen.getByRole('switch')
  expect(sw).toBeChecked()
  fireEvent.click(sw)
  expect(sw).not.toBeChecked()
  // 服務類別下拉是固定值示範，操作不改變
  fireEvent.change(fieldByLabel('服務類別'), { target: { value: '1' } })
})
