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
import { useEffect, useState } from 'react'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
}

function Results({ report }) {
  const [walletLeftSum, setWalletLeftSum] = useState(0)
  useEffect(() => {
    setWalletLeftSum(
      report.reduce((accu, curVal) => accu + curVal.leftWallet, 0)
    )
  }, [report])
  return (
    <TableContainer component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>客戶編號</TableCell>
            <TableCell>客戶姓名</TableCell>
            <TableCell>所屬設計師</TableCell>
            <TableCell>儲值餘額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report.map(data => {
            return (
              <TableRow key={data.customerId}>
                <TableCell>{data.customerNo}</TableCell>
                <TableCell>{data.customerName}</TableCell>
                <TableCell>{data.preferDesignerName}</TableCell>
                <TableCell>{data.leftWallet}</TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>{walletLeftSum}</TableCell>
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
