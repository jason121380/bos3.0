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
}

function Results({ reportForDisplay }) {
  return (
    <TableContainer style={{marginTop: 8 }} component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>日期</TableCell>
            <TableCell>營業現金應收</TableCell>
            <TableCell>現金收支收入</TableCell>
            <TableCell>現金收支支出(-)</TableCell>
            <TableCell>匯款</TableCell>
            <TableCell>當日現金結存</TableCell>
            <TableCell>累計現金結存</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportForDisplay.map((report, index) => {
            return (
              <TableRow key={index}>
                <TableCell>{format(report.date, 'yyyy/MM/dd')}</TableCell>
                <TableCell>{report.businessCash}</TableCell>
                <TableCell>{report.cashRevenue}</TableCell>
                <TableCell>{report.cashExpenditure}</TableCell>
                <TableCell>{report.bankTransfer}</TableCell>
                <TableCell>{report.cashBalance}</TableCell>
                <TableCell>{report.totalCashBalance}</TableCell>
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell>
              {reportForDisplay.reduce((total, item) => (total = total + item.businessCash), 0)}
            </TableCell>
            <TableCell>
              {reportForDisplay.reduce((total, item) => (total = total + item.cashRevenue), 0)}
            </TableCell>
            <TableCell>
              {reportForDisplay.reduce((total, item) => (total = total + item.cashExpenditure), 0)}
            </TableCell>
            <TableCell></TableCell>
            <TableCell>
              {reportForDisplay.reduce((total, item) => (total = total + item.cashBalance), 0)}
            </TableCell>
            <TableCell>N/A</TableCell>
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
