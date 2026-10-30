import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ reportData }) {
  return (
    <>
      {reportData.length ? (
        <Table dense className="min-w-[700px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead numeric>名次</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>編號</TableHead>
              <TableHead>手機</TableHead>
              <TableHead numeric>入金儲值</TableHead>
              <TableHead numeric>消費次數</TableHead>
              <TableHead numeric>所有消費金額</TableHead>
              <TableHead numeric>入金消費</TableHead>
              <TableHead numeric>非入金消費</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((data, i) => (
              <TableRow key={data.customerId}>
                <TableCell numeric>{i + 1}</TableCell>
                <TableCell>{data.customerName}</TableCell>
                <TableCell className="tabular-nums">{data.customerNo}</TableCell>
                <TableCell className="tabular-nums">{data.customerPhone}</TableCell>
                <TableCell numeric>{formatNumber(data.price.walletDeposit)}</TableCell>
                <TableCell numeric>{formatNumber(data.orderCount)}</TableCell>
                <TableCell numeric>{formatNumber(data.price.all)}</TableCell>
                <TableCell numeric>{formatNumber(data.price.wallet)}</TableCell>
                <TableCell numeric>{formatNumber(data.price.notWallet)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      )}
    </>
  )
}

export default Results
