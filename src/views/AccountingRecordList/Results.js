import { Download, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 左側兩欄固定（操作 / 日期），與舊版 sticky1、sticky2 相同位置
const sticky1 = 'sticky left-0 z-[1] w-[54px] bg-background'
const sticky2 = 'sticky left-[54px] z-[1] w-[120px] bg-background'

function Results({ className, moneyFlows, pageSetting, ...rest }) {
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    const excelData = []
    moneyFlows.moneyFlows.forEach(data => {
      excelData.push({
        日期: format(data.date, 'yyyy/MM/dd'),
        科目名稱: data.accountingSubject !== null ? data.accountingSubject.name : '',
        收入: data.inoutType === 'REVENUE' ? data.amount : '',
        支出: data.inoutType === 'EXPENDITURE' ? data.amount : '',
        登錄者: data.user ? `${data.user.name}/${data.user.designerNo || ''}` : '',
        收付方式: data.walletType,
        關係人: data.relationUser === null ? '' : data.relationUser.name,
        備註: data.remark,
      })
    })
    setExcelData(excelData)
  }, [moneyFlows])

  if (!moneyFlows) {
    return '載入中…'
  }

  return (
    // 舊版 ManagementTable（hidePagination）改為直接使用 ui/card＋ui/table；標題、筆數、CSV 匯出與欄位相同
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="高階收支登錄.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>高階收支登錄</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">共 {moneyFlows.totalCount} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1300px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={`${sticky1} bg-surface`}>操作</TableHead>
                <TableHead className={`${sticky2} bg-surface`}>日期</TableHead>
                <TableHead>科目名稱</TableHead>
                <TableHead numeric>收入</TableHead>
                <TableHead numeric>支出</TableHead>
                <TableHead>登錄者</TableHead>
                <TableHead>收付方式</TableHead>
                <TableHead>關係人</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moneyFlows.moneyFlows.map((data, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className={`${sticky1} px-2`}>
                      <Button asChild variant="ghost" size="icon" className="text-accent">
                        <RouterLink aria-label="編輯" to={`/accounting/detail/${data.id}`}>
                          <Pencil strokeWidth={1.75} />
                        </RouterLink>
                      </Button>
                    </TableCell>
                    <TableCell className={`${sticky2} tabular-nums`}>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>{data.accountingSubject !== null ? data.accountingSubject.name : ''}</TableCell>
                    <TableCell numeric>{formatNumber(data.inoutType === 'REVENUE' ? data.amount : '')}</TableCell>
                    <TableCell numeric>{formatNumber(data.inoutType === 'EXPENDITURE' ? data.amount : '')}</TableCell>
                    <TableCell>{data.user ? `${data.user.name}/${data.user.designerNo || ''}` : ''}</TableCell>
                    <TableCell>{data.walletType}</TableCell>
                    <TableCell>{data.relationUser === null ? '' : data.relationUser.name}</TableCell>
                    <TableCell className="text-text-secondary">{data.remark}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

Results.propTypes = {
  css: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
