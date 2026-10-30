import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import React from 'react'

const ProductSalesPriceRanking = ({ data }) => {
  return (
    <div className="min-w-0">
      <Card className="h-full min-h-[390px]">
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <CardTitle className="whitespace-nowrap">商品銷售金額排行</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內商品銷售金額排行</CardDescription>
          </div>
          {data.length > 0 ? (
            <Table dense wrapperClassName="mt-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>商品</TableHead>
                  <TableHead>類別</TableHead>
                  <TableHead numeric>數量</TableHead>
                  <TableHead numeric>總金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d, index) => (
                  <TableRow key={`productSalesPrice-${index}`}>
                    <TableCell className="tabular-nums text-text-secondary">{`${index + 1}.`}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.categoryName}</TableCell>
                    <TableCell numeric>{formatNumber(d.count)}</TableCell>
                    <TableCell numeric>{formatNumber(d.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="無資料" className="h-[350px]" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(ProductSalesPriceRanking)
