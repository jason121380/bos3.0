import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TablePagination } from '../table'
import { toast, Toaster } from '../toast'
import { cn } from '../utils'

afterEach(cleanup)

describe('TablePagination', () => {
  // 遷移時頁面直接沿用 MUI TablePagination 的 handler，簽名必須相同：onPageChange(event, newPage)
  it('以 MUI 相同的 (event, newPage) 呼叫 onPageChange', () => {
    const onPageChange = jest.fn()
    render(<TablePagination count={45} page={1} rowsPerPage={10} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByLabelText('下一頁'))
    fireEvent.click(screen.getByLabelText('上一頁'))
    expect(onPageChange.mock.calls.map(c => c[1])).toEqual([2, 0])
  })

  it('第一頁不可往前、最後一頁不可往後，避免查詢超出範圍的頁碼', () => {
    const { rerender } = render(<TablePagination count={45} page={0} rowsPerPage={10} onPageChange={() => {}} />)
    expect(screen.getByLabelText('上一頁')).toBeDisabled()
    rerender(<TablePagination count={45} page={4} rowsPerPage={10} onPageChange={() => {}} />)
    expect(screen.getByLabelText('下一頁')).toBeDisabled()
    expect(screen.getByText('41–45 / 共 45 筆')).toBeInTheDocument()
  })
})

describe('toast', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  // STYLE.md §6：成功 3 秒自動消失；錯誤必須讓使用者看到並手動關閉
  it('成功訊息 3 秒後消失，錯誤訊息不會自動消失', () => {
    render(<Toaster />)
    act(() => {
      toast.success('已儲存')
      toast.error('儲存失敗')
    })
    act(() => jest.advanceTimersByTime(3000))
    expect(screen.queryByText('已儲存')).toBeNull()
    expect(screen.getByText('儲存失敗')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('關閉'))
    expect(screen.queryByText('儲存失敗')).toBeNull()
  })
})

describe('cn', () => {
  // 自訂字級（text-body）與文字色（text-text）必須能並存，否則元件會掉字級或掉顏色
  it('保留字級與顏色兩類 class', () => {
    expect(cn('text-body text-text', 'text-label')).toBe('text-text text-label')
  })
})
