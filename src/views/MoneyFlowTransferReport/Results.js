import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ reportForDisplay }) {
  return (
    <Table wrapperClassName="mt-2" className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>日期</TableHead>
          <TableHead numeric>營業現金應收</TableHead>
          <TableHead numeric>現金收支收入</TableHead>
          <TableHead numeric>現金收支支出(-)</TableHead>
          <TableHead numeric>匯款</TableHead>
          <TableHead numeric>當日現金結存</TableHead>
          <TableHead numeric>累計現金結存</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportForDisplay.map((report, index) => {
          return (
            <TableRow key={index}>
              <TableCell className="tabular-nums">{format(report.date, 'yyyy/MM/dd')}</TableCell>
              <TableCell numeric>{formatNumber(report.businessCash)}</TableCell>
              <TableCell numeric>{formatNumber(report.cashRevenue)}</TableCell>
              <TableCell numeric>{formatNumber(report.cashExpenditure)}</TableCell>
              <TableCell numeric>{formatNumber(report.bankTransfer)}</TableCell>
              <TableCell numeric>{formatNumber(report.cashBalance)}</TableCell>
              <TableCell numeric>{formatNumber(report.totalCashBalance)}</TableCell>
            </TableRow>
          )
        })}
        <TableRow className="font-bold">
          <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
          <TableCell numeric>
            {formatNumber(reportForDisplay.reduce((total, item) => (total = total + item.businessCash), 0))}
          </TableCell>
          <TableCell numeric>
            {formatNumber(reportForDisplay.reduce((total, item) => (total = total + item.cashRevenue), 0))}
          </TableCell>
          <TableCell numeric>
            {formatNumber(reportForDisplay.reduce((total, item) => (total = total + item.cashExpenditure), 0))}
          </TableCell>
          <TableCell></TableCell>
          <TableCell numeric>
            {formatNumber(reportForDisplay.reduce((total, item) => (total = total + item.cashBalance), 0))}
          </TableCell>
          <TableCell numeric>N/A</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
