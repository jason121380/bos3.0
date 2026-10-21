import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import React from 'react'

const CustomerConsumptionPriceRanking = ({ data }) => {
  return (
    <div className="min-w-0">
      <Card className="h-full min-h-[390px]">
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <CardTitle className="whitespace-nowrap">消費總金額排行</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內來客(帳單)的消費總額</CardDescription>
          </div>
          {data.length > 0 ?
            <Table dense wrapperClassName="mt-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>手機</TableHead>
                  <TableHead numeric>總帳單數</TableHead>
                  <TableHead numeric>總金額</TableHead>
                  <TableHead numeric>客單價</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d, index) => (
                  <TableRow key={`customerConsumptionPrice-${index}`}>
                    <TableCell className="tabular-nums text-text-secondary">{`${index + 1}.`}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.cellphone}</TableCell>
                    <TableCell numeric>{formatNumber(d.orderCount)}</TableCell>
                    <TableCell numeric>{formatNumber(d.totalPrice)}</TableCell>
                    <TableCell numeric>{formatNumber(d.pricePerCount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table> :
            <EmptyState title="無資料" className="h-[350px]" />
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(CustomerConsumptionPriceRanking)