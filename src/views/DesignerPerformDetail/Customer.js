import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { percent } from './ratio'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Customer({ customer }) {
  const genderCustomerCount =
    customer.femaleCustomerCount + customer.maleCustomerCount + customer.unKnowCustomerCount
  const designateAndNotDesignateCustomerCount =
    customer.designateCustomerCount + customer.notDesignateCustomerCount
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>來客分析</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead numeric>總客次</TableHead>
              <TableHead numeric>客單價</TableHead>
              <TableHead numeric>指定客</TableHead>
              <TableHead numeric>不指定</TableHead>
              <TableHead numeric>男客</TableHead>
              <TableHead numeric>女客</TableHead>
              <TableHead numeric>未知性別</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell numeric rowSpan={2}>{formatNumber(designateAndNotDesignateCustomerCount)}</TableCell>
              <TableCell numeric rowSpan={2}>{formatNumber(customer.customerAvgAmount)}</TableCell>
              <TableCell numeric>{formatNumber(customer.designateCustomerCount)}</TableCell>
              <TableCell numeric>{formatNumber(customer.notDesignateCustomerCount)}</TableCell>
              <TableCell numeric>{formatNumber(customer.maleCustomerCount)}</TableCell>
              <TableCell numeric>{formatNumber(customer.femaleCustomerCount)}</TableCell>
              <TableCell numeric>{formatNumber(customer.unKnowCustomerCount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell numeric className="text-text-secondary">
                {percent(customer.designateCustomerCount, designateAndNotDesignateCustomerCount)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(customer.notDesignateCustomerCount, designateAndNotDesignateCustomerCount)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(customer.maleCustomerCount, genderCustomerCount)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(customer.femaleCustomerCount, genderCustomerCount)}
                %
              </TableCell>
              <TableCell numeric className="text-text-secondary">
                {percent(customer.unKnowCustomerCount, genderCustomerCount)}
                %
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default Customer
