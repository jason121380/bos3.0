// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）

import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import { format } from 'date-fns'
import { maskCustomerForExport } from 'helper/exportCustomerMask'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'

export default function BoughtResults({
  className,
  results,
  page,
  onChangePage,
  onChangeRowsPerPage,
  isCustomerDataMarked = true,
  roundDecimal,
  ...rest
}) {
  const { pageOffset, pageLimit } = page
  const [csvData, setCsvData] = useState([])
  const [reportData, setReportData] = useState([])

  const handleCountTotal = key => {
    if (key === 'price') {
      return roundDecimal(reportData.reduce((acc, cur) => acc + roundDecimal(cur.price), 0))
    } else {
      return reportData.reduce((acc, cur) => acc + cur[key], 0)
    }
  }

  useEffect(() => {
    setReportData(results.slice(pageOffset * pageLimit, (pageOffset * pageLimit) + pageLimit))
  }, [results, page])

  useEffect(() => {
    const csvData = []
    reportData.forEach(data => {
      csvData.push({
        '帳單編號/時間': `#${data.orderNo}_${format(data.orderDate, 'yyyy/MM/dd')}`,
        // 依店家設定遮罩姓名與手機（helper/exportCustomerMask，與帳單列表相同）
        '客戶': isCustomerDataMarked
          ? maskCustomerForExport(data.customerName, data.customerPhone)
          : `${data.customerName} ${data.customerPhone}`,
        '設計師': `${data.designerName} ${data.designerNo}`,
        '卡券代號': `${data.ticketNo}`,
        '卡券販賣': `${data.ticketName}`,
        '卡券販賣金額': `${roundDecimal(data.price)}`,
        '總張數': `${data.totalCount}`,
        '剩餘張數': `${data.leftCount}`
      })
    });
    csvData.push({
      '帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券販賣': '合計',
      '卡券販賣金額': `${handleCountTotal('price')}`,
      '總張數': `${handleCountTotal('totalCount')}`,
      '剩餘張數': `${handleCountTotal('leftCount')}`
    })
    setCsvData(csvData)
  }, [reportData, isCustomerDataMarked])


  return (
    <div {...rest} className={className}>
      <ManagementTable
        title="卡券販賣紀錄"
        totalCount={results.length}
        pageLimit={pageLimit}
        pageOffset={pageOffset}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={csvData}
        excelFilename="卡券販賣紀錄.csv"
        tableHead={(
          <>
            <TableHead className="!px-2 !py-1">操作</TableHead>
            <TableHead className="!px-2 !py-1">帳單編號/時間</TableHead>
            <TableHead className="!px-2 !py-1">客戶</TableHead>
            <TableHead className="!px-2 !py-1">設計師</TableHead>
            <TableHead className="!px-2 !py-1">卡券代號</TableHead>
            <TableHead className="!px-2 !py-1">卡券販賣</TableHead>
            <TableHead className="!px-2 !py-1">金額</TableHead>
            <TableHead className="!px-2 !py-1">總張數</TableHead>
            <TableHead className="!px-2 !py-1">現餘</TableHead>
          </>
        )}
      >
        <TableBody>
          {reportData.map((data, index) => (
            <TableRow key={`${data.id}-${index}`}>
              <TableCell className="!px-2 !py-1">
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${data.orderId}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {data.orderNo}
                <div className="text-caption tabular-nums text-text-secondary">
                  {format(data.orderDate, 'yyyy/MM/dd')}
                </div>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {data.customerName}
                <div className="text-caption tabular-nums text-text-secondary">
                  {data.customerPhone}
                </div>
              </TableCell>
              <TableCell className="!px-2 !py-1">
                {data.designerName}
                <div className="text-caption tabular-nums text-text-secondary">
                  {data.designerNo}
                </div>
              </TableCell>
              <TableCell className="!px-2 !py-1">{data.ticketNo}</TableCell>
              <TableCell className="!px-2 !py-1">{data.ticketName}</TableCell>
              <TableCell className="!px-2 !py-1">{roundDecimal(data.price)}</TableCell>
              <TableCell className="!px-2 !py-1">{data.totalCount}</TableCell>
              <TableCell className="!px-2 !py-1">{data.leftCount}</TableCell>
            </TableRow>
          ))}
          <TableRow className="[&_td]:font-bold">
            <TableCell className="!px-2 !py-1" colSpan={5} />
            <TableCell className="!px-2 !py-1">合計</TableCell>
            <TableCell className="!px-2 !py-1">{handleCountTotal('price')}</TableCell>
            <TableCell className="!px-2 !py-1">{handleCountTotal('totalCount')}</TableCell>
            <TableCell className="!px-2 !py-1">{handleCountTotal('leftCount')}</TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div >
  )
}
