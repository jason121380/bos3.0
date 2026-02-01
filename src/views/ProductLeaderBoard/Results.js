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
}

function Results({ report }) {
  return (
    <TableContainer component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>商品名稱</TableCell>
            <TableCell>商品代號</TableCell>
            <TableCell>消費次數</TableCell>
            <TableCell>消費累計</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report.map((data, index) => {
            return (
              <TableRow key={`${index}-${data.productName}-${data.productNo}`}>
                <TableCell>{data.productName}</TableCell>
                <TableCell>{data.productNo}</TableCell>
                <TableCell>{data.totalCount}</TableCell>
                <TableCell>{data.totalPrice}</TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell />
            <TableCell>
              {report.reduce((accu, curVal) => accu + curVal.totalCount, 0)}
            </TableCell>
            <TableCell>
              {report.reduce((accu, curVal) => accu + curVal.totalPrice, 0)}
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
