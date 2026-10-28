import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { Tag } from '../tag'

test('刪除按鈕有名稱，點擊只刪除一次；標籤本身支援 Backspace／Delete', () => {
  const remove = jest.fn()
  render(<Tag label="乾燥" onDelete={remove} data-testid="tag" />)
  fireEvent.click(screen.getByRole('button', { name: '刪除「乾燥」' }))
  const tag = screen.getByTestId('tag')
  tag.focus()
  fireEvent.keyUp(tag, { key: 'Backspace' })
  fireEvent.keyUp(tag, { key: 'Delete' })
  fireEvent.keyUp(tag, { key: 'Enter' })
  expect(remove).toHaveBeenCalledTimes(3)
  fireEvent.keyUp(screen.getByRole('button'), { key: 'Backspace' })
  expect(remove).toHaveBeenCalledTimes(3)
  expect(tag.className).toContain('focus-visible:ring-2')
})

test('無 onDelete 時為單純標籤', () => {
  render(<Tag label="一般" />)
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.getByText('一般').parentElement).not.toHaveAttribute('tabindex')
})
