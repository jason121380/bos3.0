import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '../table-compat'

afterEach(cleanup)

const renderTable = () =>
  render(
    <TableContainer data-testid="container">
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">選</TableCell>
            <TableCell align="right">金額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover>
            <TableCell className="forPrint4">剪髮</TableCell>
            <TableCell align="right" colSpan={2}>
              1,200
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )

describe('ui/table-compat（與 MUI Table 系列相容）', () => {
  // 報表列印（th.MuiTableCell-root.MuiTableCell-head、td.MuiTableCell-sizeSmall…）靠元素＋MUI class 排版，兩者都要一致
  it('表頭儲存格是 th、內文是 td，帶 head／body 與 size class', () => {
    renderTable()
    const head = screen.getByText('金額')
    expect(head.tagName).toBe('TH')
    expect(head).toHaveClass('MuiTableCell-root', 'MuiTableCell-head', 'MuiTableCell-sizeSmall', 'MuiTableCell-alignRight')
    const body = screen.getByText('剪髮')
    expect(body.tagName).toBe('TD')
    expect(body).toHaveClass('MuiTableCell-root', 'MuiTableCell-body', 'MuiTableCell-sizeSmall', 'forPrint4')
  })

  // 無障礙：表頭 th 預設 scope="col"（同 MUI），讓報讀器把欄名對應到內文
  it('表頭 th 預設 scope="col"，內文 td 沒有 scope', () => {
    renderTable()
    expect(screen.getByText('金額')).toHaveAttribute('scope', 'col')
    expect(screen.getByText('剪髮')).not.toHaveAttribute('scope')
  })

  it('padding、hover、colSpan、aria-label 照 MUI 輸出', () => {
    renderTable()
    expect(screen.getByText('選')).toHaveClass('MuiTableCell-paddingCheckbox')
    expect(screen.getByText('剪髮').closest('tr')).toHaveClass('MuiTableRow-root', 'MuiTableRow-hover')
    expect(screen.getByText('1,200')).toHaveAttribute('colspan', '2')
    expect(screen.getByRole('table', { name: 'a dense table' })).toHaveClass('MuiTable-root')
    expect(screen.getByTestId('container')).toHaveClass('MuiTableContainer-root')
  })
})
