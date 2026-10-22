import GenericMoreButton from 'components/GenericMoreButton'
import { format } from 'date-fns'
import React from 'react'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function OrderRecord({ records }) {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} className="items-center pb-4">
        <CardTitle>互助紀錄</CardTitle>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table className="min-w-[1300px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>日期</TableHead>
              <TableHead>帳單編號</TableHead>
              <TableHead>服務項目</TableHead>
              <TableHead>人員</TableHead>
              <TableHead numeric>抽固定金額</TableHead>
              {/* 查詢沒有「點數換算」資料：原本表頭有此欄、內容卻多一格重複的設計師姓名，金額全部錯一欄（固定金額落在「點數」） */}
              <TableHead numeric>點數</TableHead>
              <TableHead numeric>抽%</TableHead>
              <TableHead numeric>抽%換算</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(data => (
              <TableRow key={`serviceOrderHelpers-${data.id}`}>
                <TableCell className="tabular-nums">
                  {format(new Date(data.serviceOrder.order.date), 'yyyy/MM/dd')}
                </TableCell>
                <TableCell className="tabular-nums">#{data.serviceOrder.order.no}</TableCell>
                <TableCell>{data.serviceOrder.order.previewItem.join('、')}</TableCell>
                <TableCell>
                  {data.serviceOrder.order.designer.name}
                  {data.serviceOrder.order.designer.designerNo !== null &&
                    data.serviceOrder.order.designer.designerNo
                    ? ' / ' + data.serviceOrder.order.designer.designerNo
                    : ''}
                </TableCell>
                <TableCell numeric>{formatNumber(data.fixCommissionAmount)}</TableCell>
                <TableCell numeric>{formatNumber(data.point)}</TableCell>
                <TableCell numeric>{formatNumber(data.commissionPercent)}</TableCell>
                <TableCell numeric>{formatNumber(data.commissionAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

export default OrderRecord
