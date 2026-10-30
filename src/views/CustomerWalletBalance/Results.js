import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ report }) {
  const [walletLeftSum, setWalletLeftSum] = useState(0)
  useEffect(() => {
    setWalletLeftSum(report.reduce((accu, curVal) => accu + curVal.leftWallet, 0))
  }, [report])
  return (
    <Table className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>客戶編號</TableHead>
          <TableHead>客戶姓名</TableHead>
          <TableHead>所屬設計師</TableHead>
          <TableHead numeric>儲值餘額</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {report.map(data => {
          return (
            <TableRow key={data.customerId}>
              <TableCell>{data.customerNo}</TableCell>
              <TableCell>{data.customerName}</TableCell>
              <TableCell>{data.preferDesignerName}</TableCell>
              <TableCell numeric>{formatNumber(data.leftWallet)}</TableCell>
            </TableRow>
          )
        })}
        <TableRow className="bg-surface font-medium">
          <TableCell className="font-bold">合計</TableCell>
          <TableCell />
          <TableCell />
          <TableCell numeric className="font-bold">
            {formatNumber(walletLeftSum)}
          </TableCell>
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
