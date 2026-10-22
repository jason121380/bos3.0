import GenericMoreButton from 'components/GenericMoreButton'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { percent, unitPrice } from './ratio'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function MerchantSells({ merchantSells }) {
  // 各類別的合計（占比的分母）
  const totalOf = key => merchantSells.reduce((total, item) => total + item.analytics[key], 0)
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
              {/* 表頭原本照抄服務項目分析（占總服務業績比、單項卷業績佔比），與欄位內容不符 */}
              <TableHead numeric>占總店販業績比</TableHead>
              <TableHead numeric>客次</TableHead>
              <TableHead numeric>占總客次比</TableHead>
              <TableHead numeric>單項客次單價</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchantSells.map(data => (
              <TableRow key={`merchantSalesAnalytics-${data.id}`}>
                <TableCell className="tabular-nums">{data.no}</TableCell>
                <TableCell>{data.name}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.analytics.productAmountTotal))}</TableCell>
                <TableCell numeric>{percent(data.analytics.productAmountTotal, totalOf('productAmountTotal'))}%</TableCell>
                <TableCell numeric>{formatNumber(data.analytics.customerCount)}</TableCell>
                <TableCell numeric>{percent(data.analytics.customerCount, totalOf('customerCount'))}%</TableCell>
                {/* 單項客次單價：原本沒有取整數，會顯示 333.3333333333333；比照服務項目的單項客單價無條件捨去 */}
                <TableCell numeric>{formatNumber(unitPrice(data.analytics.productAmountTotal, data.analytics.customerCount))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default MerchantSells
