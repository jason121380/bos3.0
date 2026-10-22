// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）

import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import idx from 'idx'
import { maskCustomerForExport } from 'helper/exportCustomerMask'
import format from 'date-fns/format'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'

export default function UsagedResults({
  orders,
  employees,
  onChangePage,
  onChangeRowsPerPage,
  page,
  results,
  isCustomerDataMarked = true,
  roundDecimal,
  ...rest
}) {
  const [csvData, setCsvData] = useState([])
  const totalPrice = () => {
    const price = results.reduce((acc, cur) => acc + roundDecimal(cur.price), 0)
    return roundDecimal(price)
  }

  useEffect(() => {
    const csvData = []
    results.forEach(data => {
      csvData.push({
        '使用卡券之帳單編號/時間': `#${data.usageOrder.no}_${format(data.usageOrder.date, 'yyyy/MM/dd')}`,
        '購買卡券之帳單編號/時間': `#${data.order.no}_${format(data.order.date, 'yyyy/MM/dd')}`,
        // 依店家設定遮罩姓名與手機（helper/exportCustomerMask，與帳單列表相同）
        '客戶': isCustomerDataMarked
          ? maskCustomerForExport(data.order.customer.name, data.order.customer.cellphone)
          : `${data.order.customer.name} ${data.order.customer.cellphone}`,
        // 與畫面「設計師」欄一致：使用卡券那張帳單的設計師
        '設計師': `${idx(data, _ => _.usageOrder.designer.name) || ''} ${idx(data, _ => _.usageOrder.designer.designerNo) || ''}`,
        '卡券代號': `${data.no}`,
        '卡券使用': `${data.service.name}`,
        '卡券使用金額': `${roundDecimal(data.price)}`
      })
    });
    csvData.push({
      '使用卡券之帳單編號/時間': '',
      '購買卡券之帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券使用': '合計',
      '卡券使用金額': totalPrice()
    })
    setCsvData(csvData)
  }, [results, isCustomerDataMarked])

  return (
    <div {...rest}>
      <ManagementTable
        title="卡券使用紀錄"
        totalCount={page.count}
        pageLimit={page.limit}
        pageOffset={page.offset}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={csvData}
        excelFilename="卡券使用紀錄.csv"
        tableHead={(
          <>
            <TableHead className="!px-2 !py-1">使用詳情</TableHead>
            <TableHead className="!px-2 !py-1">購買詳情</TableHead>
            <TableHead className="!px-2 !py-1">客戶</TableHead>
            <TableHead className="!px-2 !py-1">設計師</TableHead>
            <TableHead className="!px-2 !py-1">卡券代號</TableHead>
            <TableHead className="!px-2 !py-1">卡券使用</TableHead>
            <TableHead className="!px-2 !py-1">金額</TableHead>
          </>
        )}
      >
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={`${result.id}-${index}`}>
              <TableCell className="!px-2 !py-1">
                {idx(result, _ => _.usageOrder.no)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => format(_.usageOrder.date, 'yyyy/MM/dd'))}
                </div>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${result.usageOrder.id}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {idx(result, _ => _.order.no)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => format(_.order.date, 'yyyy/MM/dd'))}
                </div>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${result.order.id}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {idx(result, _ => _.order.customer.name)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => _.order.customer.cellphone)}
                </div>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {idx(result, _ => _.usageOrder.designer.name)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => _.usageOrder.designer.designerNo)}
                </div>
              </TableCell>
              <TableCell className="!px-2 !py-1">{idx(result, _ => _.no)}</TableCell>
              <TableCell className="!px-2 !py-1">{idx(result, _ => _.service.name)}</TableCell>
              <TableCell className="!px-2 !py-1">{roundDecimal(idx(result, _ => _.price))}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="!px-2 !py-1" colSpan={5} />
            <TableCell className="!px-2 !py-1" style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell className="!px-2 !py-1" style={{ fontWeight: 'bold' }}>{totalPrice()}</TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div >
  )
}
