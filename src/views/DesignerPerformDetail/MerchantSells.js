import GenericMoreButton from 'components/GenericMoreButton'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function MerchantSells({ merchantSells }) {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} className="items-center pb-4">
        <CardTitle>店販分析</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>類別代號</TableHead>
              <TableHead>類別名稱</TableHead>
              <TableHead numeric>店販業績</TableHead>
              <TableHead numeric>占總服務業績比</TableHead>
              <TableHead numeric>客次</TableHead>
              <TableHead numeric>單項卷業績佔比</TableHead>
              <TableHead numeric>單項客次單價</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchantSells.map(data => (
              <TableRow key={`merchantSalesAnalytics-${data.id}`}>
                <TableCell className="tabular-nums">{data.no}</TableCell>
                <TableCell>{data.name}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.analytics.productAmountTotal))}</TableCell>
                <TableCell numeric>
                  {(isNaN(
                    data.analytics.productAmountTotal / merchantSells.reduce((total, item) => (total = total + item.analytics.productAmountTotal), 0)
                  )
                    ? 0
                    : (data.analytics.productAmountTotal /
                        merchantSells.reduce((total, item) => (total = total + item.analytics.productAmountTotal), 0)) *
                      100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell numeric>{formatNumber(data.analytics.customerCount)}</TableCell>
                <TableCell numeric>
                  {(isNaN(data.analytics.customerCount / merchantSells.reduce((total, item) => (total = total + item.analytics.customerCount), 0))
                    ? 0
                    : (data.analytics.customerCount / merchantSells.reduce((total, item) => (total = total + item.analytics.customerCount), 0)) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell numeric>
                  {formatNumber(
                    isNaN(data.analytics.productAmountTotal / data.analytics.customerCount)
                      ? 0
                      : Math.round(data.analytics.productAmountTotal) / data.analytics.customerCount
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default MerchantSells
