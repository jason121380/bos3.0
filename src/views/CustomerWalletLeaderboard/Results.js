import { css } from '@emotion/react'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const styles = {
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
}

function Results({ reportData }) {
  return (
    <>
      {reportData.length ? (
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">名次</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>編號</TableHead>
              <TableHead>手機</TableHead>
              <TableHead numeric>入金儲值</TableHead>
              <TableHead numeric>入金使用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((data, i) => (
              <TableRow key={data.customerId}>
                <TableCell className="tabular-nums text-text-secondary">{i + 1}</TableCell>
                <TableCell>{data.customerName}</TableCell>
                <TableCell>{data.customerNo}</TableCell>
                <TableCell className="tabular-nums">{data.customerPhone}</TableCell>
                <TableCell numeric>{formatNumber(data.walletDeposit)}</TableCell>
                <TableCell numeric>{formatNumber(data.walletUse)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState title="無資料" className="mt-[100px]" />
      )}

    </>
  )
}

export default Results
