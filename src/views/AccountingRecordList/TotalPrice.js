import { format } from 'date-fns'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

export default function TotalPrice({ startDate, endDate, rev, exp }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="tabular-nums">{`${format(startDate, 'yyyy/MM/dd')} ~ ${format(endDate, 'yyyy/MM/dd')} 合計`}</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead numeric>收入</TableHead>
              <TableHead numeric>支出</TableHead>
              <TableHead numeric className="text-text">合計</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell numeric>{formatNumber(rev)}</TableCell>
              <TableCell numeric>{formatNumber(exp)}</TableCell>
              <TableCell numeric className="font-medium">{formatNumber(rev - exp)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
