import GenericMoreButton from 'components/GenericMoreButton'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { percent, unitPrice } from './ratio'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Service({ services }) {
  // 各類別的合計（占比的分母）
  const totalOf = key => services.reduce((total, item) => total + item.analytics[key], 0)
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} className="items-center pb-4">
        <CardTitle>服務項目分析</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>類別代號</TableHead>
              <TableHead>類別名稱</TableHead>
              <TableHead numeric>服務業績</TableHead>
              <TableHead numeric>占總服務業績比</TableHead>
              <TableHead numeric>卷使用業績</TableHead>
              <TableHead numeric>單項卷業績佔比</TableHead>
              <TableHead numeric>客次</TableHead>
              <TableHead numeric>占總客次比</TableHead>
              <TableHead numeric>指定客次</TableHead>
              <TableHead numeric>不指定客次</TableHead>
              <TableHead numeric>單項指定率</TableHead>
              <TableHead numeric>單項客單價</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((data, index) => (
              <TableRow key={`serviceCategoriesAnalytics-${data.id}-${index}`}>
                <TableCell className="tabular-nums">{data.no}</TableCell>
                <TableCell>{data.name}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.analytics.serviceFakeTotal))}</TableCell>
                <TableCell numeric>{percent(data.analytics.serviceFakeTotal, totalOf('serviceFakeTotal'))}%</TableCell>
                <TableCell numeric>{formatNumber(data.analytics.useTicketTotal)}</TableCell>
                <TableCell numeric>{percent(data.analytics.useTicketTotal, totalOf('useTicketTotal'))}%</TableCell>
                <TableCell numeric>{formatNumber(data.analytics.customerCount)}</TableCell>
                <TableCell numeric>{percent(data.analytics.customerCount, totalOf('customerCount'))}%</TableCell>
                <TableCell numeric>{formatNumber(data.analytics.designateCount)}</TableCell>
                <TableCell numeric>{formatNumber(data.analytics.notDesignateCustomer)}</TableCell>
                <TableCell numeric>{percent(data.analytics.designateCount, data.analytics.customerCount)}%</TableCell>
                <TableCell numeric>{formatNumber(unitPrice(data.analytics.serviceFakeTotal, data.analytics.customerCount))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default Service
