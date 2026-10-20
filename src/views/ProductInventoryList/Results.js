/** @jsxImportSource @emotion/react */
// 表格（className="ProductInventoryListTable"）即為 window.print() 的列印輸出，列印樣式依 MUI 結構撰寫，保留 MUI Table
import { TableRow, TableContainer, Table, TableHead, TableBody, TableCell } from 'ui/table-compat'
import { Paper } from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  medals: css({
    fontSize: '19px',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
  noData: css({
    fontSize: 24,
    textAlign: 'center'
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--background)) !important',
    },
  }),
}

function Results({ reportData }) {
  return (
    <>
      {reportData.length === 0 ? (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-baseline gap-3">
              <CardTitle>商品庫存列表</CardTitle>
              <span className="text-label tabular-nums text-text-secondary">
                共 {reportData.length} 筆
              </span>
            </div>
          </CardHeader>
          <div>
            <TableContainer style={{ maxHeight: 'calc(100vh - 360px)' }} className='ProductInventoryListTable' component={Paper} elevation={0}>
              <Table css={styles.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow css={styles.stickyRow}>
                    <TableCell>代號</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>廠商</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((d, index) => (
                    <TableRow key={`${d.productNo}-${d.name}-${index}`} css={styles.tableRow}>
                      <TableCell>{d.productNo || <small>{`(無代號)`}</small>}</TableCell>
                      <TableCell>{d.productName}</TableCell>
                      <TableCell>{d.count}</TableCell>
                      <TableCell>{d.productCategory}</TableCell>
                      <TableCell>{d.vendorName || <small>{`(無廠商)`}</small>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Card>
      )}
    </>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
}

Results.defaultProps = {
  reportData: [],
}

export default Results