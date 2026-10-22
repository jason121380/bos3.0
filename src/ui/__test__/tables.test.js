import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TablePagination, TableRow } from '../table'
import * as Compat from '../table-compat'

// 保護什麼：新版表格（ui/table，含分頁）與舊頁面的 MUI 相容表格（table-compat；pagination-compat 沒有頁面使用，2026/10/22 已刪除）。
// - 報表列印（initialize.scss 數十條 .MuiTableCell-* 規則）靠 table-compat 輸出的 MUI class：區段、尺寸、排序、sticky 表頭。
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

describe('table-compat（MUI 相容）', () => {
  it('預設 medium／normal；表頭 th 帶 scope=col；區段外的儲存格為 body', () => {
    const { container } = render(
      <Compat.Table>
        <Compat.TableHead>
          <Compat.TableRow>
            <Compat.TableCell>名稱</Compat.TableCell>
          </Compat.TableRow>
        </Compat.TableHead>
        <tbody>
          <tr>
            <Compat.TableCell>區段外</Compat.TableCell>
          </tr>
        </tbody>
      </Compat.Table>
    )
    const th = screen.getByText('名稱')
    expect(th.tagName).toBe('TH')
    expect(th).toHaveAttribute('scope', 'col')
    expect(th).toHaveClass('MuiTableCell-head', 'MuiTableCell-sizeMedium')
    expect(th.parentElement).toHaveClass('MuiTableRow-head')
    expect(screen.getByText('區段外')).toHaveClass('MuiTableCell-body')
    expect(container.querySelector('table')).not.toHaveClass('MuiTable-stickyHeader')
  })

  it('stickyHeader 傳到每個儲存格；selected／footer 列；排序欄位標 aria-sort', () => {
    render(
      <Compat.Table stickyHeader size="small" padding="checkbox">
        <Compat.TableBody>
          <Compat.TableRow selected hover>
            <Compat.TableCell sortDirection="asc">升冪</Compat.TableCell>
            <Compat.TableCell sortDirection="desc" align="right">
              降冪
            </Compat.TableCell>
            <Compat.TableCell>不排序</Compat.TableCell>
          </Compat.TableRow>
        </Compat.TableBody>
        <Compat.TableFooter>
          <Compat.TableRow>
            <Compat.TableCell>合計</Compat.TableCell>
          </Compat.TableRow>
        </Compat.TableFooter>
      </Compat.Table>
    )
    const asc = screen.getByText('升冪')
    expect(asc).toHaveAttribute('aria-sort', 'ascending')
    expect(asc).toHaveClass('MuiTableCell-stickyHeader', 'MuiTableCell-sizeSmall', 'MuiTableCell-paddingCheckbox')
    expect(asc.parentElement).toHaveClass('Mui-selected', 'MuiTableRow-hover')
    expect(screen.getByText('降冪')).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getByText('降冪')).toHaveClass('MuiTableCell-alignRight')
    expect(screen.getByText('不排序')).not.toHaveAttribute('aria-sort')
    expect(screen.getByText('合計').parentElement).toHaveClass('MuiTableRow-footer')
    expect(screen.getByText('合計')).toHaveClass('MuiTableCell-footer')
  })

  it('Table 的 size／padding 為 null 時儲存格退回 medium／normal（不輸出 sizeNull）', () => {
    render(
      <Compat.Table size={null} padding={null}>
        <Compat.TableBody>
          <Compat.TableRow>
            <Compat.TableCell>x</Compat.TableCell>
          </Compat.TableRow>
        </Compat.TableBody>
      </Compat.Table>
    )
    expect(screen.getByText('x')).toHaveClass('MuiTableCell-sizeMedium')
    expect(screen.getByText('x').className).not.toContain('MuiTableCell-padding')
  })
})
