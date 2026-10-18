/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Typography, Paper,
} from '@mui/material'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { css } from '@emotion/react'

const styles = {
  root: css({
    '& tbody tr:last-child td': {
      fontWeight: 'bold'
    }
  }),
  sticky: css({
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    zIndex: '99',
    wordBreak: 'break-all',
    whiteSpace: 'nowrap !important'
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
}

export default function Results({ reportData, format, roundDecimal, handleCountTotal }) {
  return (
    <Fragment>
      {reportData.length > 0 ? (
        <TableContainer css={styles.root} component={Paper}>
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead css={styles.stickyRow}>
              <TableRow>
                <TableCell css={styles.sticky}>訂單日期</TableCell>
                <TableCell>訂單編號</TableCell>
                <TableCell>設計師姓名</TableCell>
                <TableCell>顧客姓名</TableCell>
                <TableCell>會員卡名稱</TableCell>
                <TableCell>實際售價</TableCell>
                <TableCell>數量</TableCell>
                <TableCell>小計</TableCell>
                <TableCell>手續費</TableCell>
                <TableCell>販賣業績(實)</TableCell>
                <TableCell>抽成</TableCell>
                <TableCell>備註</TableCell>
                <TableCell>到期日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((d, i) => (
                <TableRow key={`MembershipSellReport-${i}`} hover>
                  <TableCell css={styles.sticky}>{format(d.orderDate, 'yyyy/M/d')}</TableCell>
                  <TableCell>
                    <Link style={{ color: 'black', textDecorationColor: 'black', textDecoration: 'underline' }} target='_blank' to={`/order/${d.orderId}`}>{`#${d.orderNo}`}</Link>
                  </TableCell>
                  <TableCell>{d.designerName}</TableCell>
                  <TableCell>{d.customerName}</TableCell>
                  <TableCell>{d.membershipName}</TableCell>
                  <TableCell>{d.sellPrice}</TableCell>
                  <TableCell>{d.count}</TableCell>
                  <TableCell>{d.summary}</TableCell>
                  <TableCell>{roundDecimal(d.handlingFee)}</TableCell>
                  <TableCell>{roundDecimal(d.truth)}</TableCell>
                  <TableCell>{roundDecimal(d.rake)}</TableCell>
                  <TableCell>{d.remark}</TableCell>
                  <TableCell>{d.expiryDate ? format(d.expiryDate, 'yyyy/M/d') : '永久會籍'}</TableCell>
                </TableRow>
              ))}
              <TableRow hover>
                <TableCell css={styles.sticky} />
                <TableCell colSpan={3} />
                <TableCell >合計</TableCell>
                <TableCell>{handleCountTotal('sellPrice')}</TableCell>
                <TableCell>{handleCountTotal('count')}</TableCell>
                <TableCell>{handleCountTotal('summary')}</TableCell>
                <TableCell>{handleCountTotal('handlingFee')}</TableCell>
                <TableCell>{handleCountTotal('truth')}</TableCell>
                <TableCell>{handleCountTotal('rake')}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography gutterBottom component="div" variant="h3">
          無資料
        </Typography>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
  roundDecimal: PropTypes.func,
  handleCountTotal: PropTypes.func,
}