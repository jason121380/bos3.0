/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from '@mui/material'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
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
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid rgb(var(--border))',
    width: '100px'
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))'
  }),
}

function Results({ reportData }) {
  const recordType = type => {
    switch (type) {
      case 'SALE':
        return '店販'
      case 'PURCHASE':
        return '進貨'
      case 'PICKING':
        return '自購'
    }
  }

  return (
    <TableContainer style={{ marginTop: '12px', maxHeight: 'calc(100vh - 340px)' }} className='ProductInvoicingRecordReportTable' component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow css={styles.stickyRow}>
            <TableCell css={styles.sticky}>時間</TableCell>
            <TableCell>編號</TableCell>
            <TableCell>商品名稱</TableCell>
            <TableCell>商品代號</TableCell>
            <TableCell>商品單位</TableCell>
            <TableCell>類型</TableCell>
            <TableCell>數量</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((d, index) => (
            <TableRow hover key={`reportDataRow-${index}`}>
              <TableCell css={styles.sticky}>{format(d.date, 'yyyy/MM/dd')}</TableCell>
              <TableCell style={{ wordBreak: 'break-all' }}>{d.no}</TableCell>
              <TableCell>{d.productName}</TableCell>
              <TableCell>{d.productNo}</TableCell>
              <TableCell>{d.unit}</TableCell>
              <TableCell>{recordType(d.type)}</TableCell>
              <TableCell>{d.count}</TableCell>
            </TableRow>
          ))}
          <TableRow hover>
            <TableCell></TableCell>
            <TableCell colSpan={4}></TableCell>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell style={{ fontWeight: 'bold' }}>{reportData.reduce((a, b) => a + b.count, 0)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
}

Results.defaultProps = {
  reportData: [],
}

export default Results