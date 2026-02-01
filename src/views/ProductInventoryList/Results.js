/** @jsxImportSource @emotion/react */
import {
  TablePagination, TableRow, TableContainer, Table, TableHead, TableBody, TableCell,
  Typography, Card, CardHeader, CardContent, Paper
} from '@mui/material'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'

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
    outline: '1px solid #eeeeee',
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
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
  }),
}

function Results({ reportData }) {
  return (
    <>
      {reportData.length === 0 ? (
        <p css={styles.noData}>無資料</p>
      ) : (
        <Card>
          <CardHeader
            css={styles.cardHeader}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>商品庫存列表</span>
                <Typography color="textSecondary" variant="body2">
                  共 {reportData.length} 筆
                </Typography>
              </div>
            }
          />
          <CardContent style={{ padding: 0 }}>
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
          </CardContent>
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