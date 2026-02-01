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
}

function Results({ report, reportWithAmount, roundDecimal }) {
  return (
    <TableContainer style={{marginTop: 8 }} component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>日期</TableCell>
            <TableCell>科目編號</TableCell>
            <TableCell>科目名稱</TableCell>
            <TableCell>收入金額</TableCell>
            <TableCell>支出金額</TableCell>
            <TableCell>備註</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportWithAmount.map(report => {
            return report.moneyFlow.map((d, index)=> {
              if (d.subjectName !== '小結') {
                return (
                  <TableRow key={index}>
                    <TableCell>{format(d.date, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>{d.subjectNo}</TableCell>
                    <TableCell>{d.subjectName}</TableCell>
                    <TableCell>
                      {d.revenue !== 0 ? roundDecimal(d.revenue) : ''}
                    </TableCell>
                    <TableCell>
                      {d.expenditure !== 0 ? roundDecimal(d.expenditure) : ''}
                    </TableCell>
                    <TableCell>{d.remark}</TableCell>
                  </TableRow>
                )
              } else {
                return (
                  <TableRow
                    className="moneyFlowCatReportSubtotal"
                    style={{ backgroundColor: 'lightgray' }}
                    key={index}
                  >
                    <TableCell />
                    <TableCell />
                    <TableCell>{d.subjectName}</TableCell>
                    <TableCell>{d.amount > 0 ? d.amount : ''}</TableCell>
                    <TableCell>{d.amount > 0 ? '' : Math.abs(d.amount)}</TableCell>
                    <TableCell />
                  </TableRow>
                )
              }
            })
          })}
          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell />
            <TableCell />
            <TableCell>{roundDecimal(report.revenueSummary)}</TableCell>
            <TableCell>{roundDecimal(report.expenditureSummary)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}


export default Results
