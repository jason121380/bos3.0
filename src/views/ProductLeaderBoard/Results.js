import PropTypes from 'prop-types'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ report }) {
  return (
    <Table className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>商品名稱</TableHead>
          <TableHead>商品代號</TableHead>
          <TableHead numeric>消費次數</TableHead>
          <TableHead numeric>消費累計</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {report.map((data, index) => {
          return (
            <TableRow key={`${index}-${data.productName}-${data.productNo}`}>
              <TableCell>{data.productName}</TableCell>
              <TableCell className="tabular-nums">{data.productNo}</TableCell>
              <TableCell numeric>{formatNumber(data.totalCount)}</TableCell>
              <TableCell numeric>{formatNumber(data.totalPrice)}</TableCell>
            </TableRow>
          )
        })}
        <TableRow className="font-bold">
          <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
          <TableCell />
          <TableCell numeric>{formatNumber(report.reduce((accu, curVal) => accu + curVal.totalCount, 0))}</TableCell>
          <TableCell numeric>{formatNumber(report.reduce((accu, curVal) => accu + curVal.totalPrice, 0))}</TableCell>
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
