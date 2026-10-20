import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TablePagination } from '../pagination-compat'
import pagenationLabel from '../../helper/pagenationLabel'

afterEach(cleanup)

const renderPagination = (props = {}) => {
  const onPageChange = jest.fn()
  const onRowsPerPageChange = jest.fn()
  const utils = render(
    <TablePagination
      component="div"
      count={23}
      labelRowsPerPage="每頁顯示數量"
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      page={0}
      rowsPerPage={5}
      rowsPerPageOptions={[5, 10, 25, 50, 1000]}
      {...props}
    />
  )
  return { ...utils, onPageChange, onRowsPerPageChange }
}

describe('ui/pagination-compat（與 MUI TablePagination 相容）', () => {
  // 帳單商品／服務彈窗的 handleOnChangeRowsPerPage 直接把 event.target.value 當每頁筆數送出：必須是數字，不能是索引或字串
  it('改每頁筆數時 event.target.value 為選項的數字', () => {
    const { onRowsPerPageChange } = renderPagination()
    fireEvent.change(screen.getByLabelText('每頁顯示數量'), { target: { value: '2' } })
    expect(onRowsPerPageChange.mock.calls[0][0].target.value).toBe(25)
  })

  // 換頁：onPageChange(event, 新頁碼)；第一頁不能再往前、最後一頁不能再往後
  it('前後頁按鈕以 (event, page) 呼叫，邊界時停用', () => {
    const { onPageChange, rerender } = renderPagination()
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Go to next page'))
    expect(onPageChange.mock.calls[0][1]).toBe(1)
    rerender(<TablePagination component="div" count={23} onPageChange={onPageChange} page={4} rowsPerPage={5} rowsPerPageOptions={[5, 10]} />)
    expect(screen.getByLabelText('Go to next page')).toBeDisabled()
  })

  // helper/pagenationLabel 直接改寫 .MuiTablePagination-displayedRows：原始文字必須與 MUI 相同才會變成中文
  it('筆數文字與 MUI 相同，舊的中文改寫流程照常運作', () => {
    const { container } = renderPagination({ page: 1 })
    const label = container.querySelector('.MuiTablePagination-displayedRows')
    expect(label.textContent).toBe('6–10 of 23')
    pagenationLabel(container)
    expect(label.textContent.replace(/ /g, ' ')).toBe('第 6–10 筆   共 23 筆')
  })
})
