import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { percent } from './ratio'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Performance({ performance }) {
  const fakeSaleAndProductSale = performance.serviceFake + performance.productSales
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>業績分析</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead numeric>總業績</TableHead>
              <TableHead numeric>服務消費</TableHead>
              <TableHead numeric>店販消費</TableHead>
              <TableHead numeric>卡卷使用</TableHead>
              <TableHead numeric>卡卷販賣(不入業績)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell numeric>{formatNumber(Math.round(fakeSaleAndProductSale))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(performance.serviceFake))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(performance.productSales))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(performance.useTicketSales))}</TableCell>
              <TableCell numeric rowSpan={2}>{formatNumber(Math.round(performance.sellTicketSales))}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell numeric className="text-text-secondary">100%</TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(performance.serviceFake, fakeSaleAndProductSale)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(performance.productSales, fakeSaleAndProductSale)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(performance.useTicketSales, fakeSaleAndProductSale)}
                %
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default Performance
