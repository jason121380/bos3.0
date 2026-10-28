import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TablePagination, TableRow } from '../table'

// 保護什麼：正式 ui/table 的區段、ref、密度、數字對齊與分頁。
// - 分頁的筆數文字、可否換頁與每頁筆數回傳的值（數字）決定查詢參數，算錯會查到不存在的頁或少資料。

afterEach(cleanup)

describe('ui/table', () => {
  it('各區段可帶 ref 與 className；dense 縮小列高；numeric 欄右對齊', () => {
    const refs = { table: React.createRef(), head: React.createRef(), body: React.createRef(), foot: React.createRef(), row: React.createRef(), th: React.createRef(), td: React.createRef() }
    const { container } = render(
      <Table ref={refs.table} dense wrapperClassName="wrap" className="t">
        <TableHeader ref={refs.head} className="h">
          <TableRow ref={refs.row}>
            <TableHead ref={refs.th} numeric>
              金額
            </TableHead>
            <TableHead>名稱</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={refs.body}>
          <TableRow>
            <TableCell ref={refs.td} numeric>
              1,000
            </TableCell>
            <TableCell>洗髮</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter ref={refs.foot}>
          <TableRow>
            <TableCell>合計</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(container.firstChild.className).toContain('wrap')
    expect(refs.table.current.tagName).toBe('TABLE')
    expect(refs.table.current.className).toContain('[&_td]:h-8')
    expect(refs.head.current.tagName).toBe('THEAD')
    expect(refs.body.current.tagName).toBe('TBODY')
    expect(refs.foot.current.tagName).toBe('TFOOT')
    expect(refs.row.current.tagName).toBe('TR')
    expect(refs.th.current.className).toContain('text-right')
    expect(screen.getByText('名稱').className).not.toContain('text-right')
    expect(refs.td.current.className).toContain('tabular-nums')
    expect(screen.getByText('洗髮').className).not.toContain('tabular-nums')
  })

  it('非 dense 時不縮列高', () => {
    render(<Table data-testid="t" />)
    expect(screen.getByTestId('t').className).not.toContain('[&_td]:h-8')
  })

  it('TablePagination：0 筆顯示 0–0；每頁全部（-1）時只有一頁；選項可為 { value, label }', () => {
    const onRows = jest.fn()
    const { rerender } = render(<TablePagination count={0} page={0} rowsPerPage={10} onPageChange={() => {}} />)
    expect(screen.getByText('0–0 / 共 0 筆')).toBeInTheDocument()
    // 沒給 onRowsPerPageChange 時不畫每頁筆數
    expect(screen.queryByLabelText('每頁筆數')).toBeNull()
    rerender(
      <TablePagination
        count={37}
        page={0}
        rowsPerPage={-1}
        rowsPerPageOptions={[10, { value: -1, label: '全部' }]}
        onPageChange={() => {}}
        onRowsPerPageChange={onRows}
      />
    )
    expect(screen.getByText('1–37 / 共 37 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('下一頁')).toBeDisabled()
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['10', '全部'])
    fireEvent.change(screen.getByLabelText('每頁筆數'), { target: { value: '0' } })
    expect(onRows.mock.calls[0][0].target.value).toBe(10)
  })
})
