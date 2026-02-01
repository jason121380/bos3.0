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
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  dark: css({
    background: '#ebebeb',
  }),
  light: css({
    background: 'white',
  }),
}

function Results({ report, total, countTotalPrice }) {
  return (
    <TableContainer component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>顧客編號</TableCell>
            <TableCell>顧客姓名</TableCell>
            <TableCell>顧客手機</TableCell>
            <TableCell>卡券編號</TableCell>
            <TableCell>卡券名稱</TableCell>
            <TableCell>總金額</TableCell>
            <TableCell>總量</TableCell>
            <TableCell>已使用數量</TableCell>
            <TableCell>剩餘數量</TableCell>
            <TableCell>剩餘金額</TableCell>
            <TableCell>單張卡券原始金額</TableCell>
            <TableCell>單張卡券扣手續費後金額</TableCell>
            <TableCell>單張卡券之手續費</TableCell>
            <TableCell>其他付款方式名稱</TableCell>
            <TableCell>是否已先入業績</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report != null &&
            report.map((data, i) =>
              data.data.map((d, index) => {
                return (
                  <TableRow key={index} css={i % 2 === 0 ? styles.dark : styles.light}>
                    <TableCell>{d.customerNo}</TableCell>
                    <TableCell>{d.customerName}</TableCell>
                    <TableCell>{d.customerCellPhone}</TableCell>
                    <TableCell>{d.couponNo}</TableCell>
                    <TableCell>{d.couponName}</TableCell>
                    <TableCell>{d.totalCount * Math.round(d.singleCouponPrice)}</TableCell>
                    <TableCell>{d.totalCount}</TableCell>
                    <TableCell>{d.usedCount}</TableCell>
                    <TableCell>{d.remainingCount}</TableCell>
                    <TableCell>{d.remainingCount * Math.round(d.singleCouponPrice)}</TableCell>
                    <TableCell>{Math.round(d.singleCouponPrice)}</TableCell>
                    <TableCell>{Math.round(d.singleCouponPriceDecreaseHandingFee)}</TableCell>
                    <TableCell>{Math.abs(Math.round(d.singleCouponHandingFee))}</TableCell>
                    <TableCell>{d.otherPaymentName !== null ? d.otherPaymentName : '無'}</TableCell>
                    <TableCell>{d.isIntoPerformanceWhileBuying === true ? '是' : '否'}</TableCell>
                  </TableRow>
                )
              })
            )}

          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell colSpan={4} />
            <TableCell>{countTotalPrice(total, 'totalCount')}</TableCell>
            <TableCell>
              {total != null && total.reduce((acc, curVal) => acc + curVal.totalCount, 0)}
            </TableCell>
            <TableCell>
              {total != null && total.reduce((acc, curVal) => acc + curVal.usedCount, 0)}
            </TableCell>
            <TableCell>
              {total != null && total.reduce((acc, curVal) => acc + curVal.remainingCount, 0)}
            </TableCell>
            <TableCell>{countTotalPrice(total, 'remainingCount')}</TableCell>
            <TableCell>
              {total != null && Math.round(total.reduce((acc, curVal) => acc + curVal.singleCouponPrice, 0))}
            </TableCell>
            <TableCell>
              {total != null &&
                Math.round(total.reduce((acc, curVal) => acc + curVal.singleCouponPriceDecreaseHandingFee, 0))}
            </TableCell>
            <TableCell>
              {total != null &&
                Math.abs(
                  Math.round(
                    total.reduce((acc, curVal) => acc + curVal.singleCouponHandingFee, 0)
                  )
                )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
