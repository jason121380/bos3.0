// 分頁使用 ui/table TablePagination（paginationLabel 找不到 MUI class 即不動作，ui 版自帶中文筆數文字）
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import { useState, useRef, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

export default function BoughtResults({
  className,
  orders,
  employees,
  onChangePage,
  onChangeRowsPerPage,
  page,
  results,
  paginationLabel,
  roundDecimal,
  ...rest
}) {
  const pageRef = useRef(null)
  const [selectedOrders] = useState([])

  useEffect(() => {
    if (pageRef.current) {
      paginationLabel(pageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（paginationLabel）；只在 [pageRef.current, results] 變動時呼叫，補上會每次 render 重跑
  }, [pageRef.current, results])

  return (
    <div {...rest} className={className}>
      <p className="mb-2 text-label tabular-nums text-text-secondary">
        {/* 以後端的總筆數計算（原本用本頁筆數 results.length；Jason 2026/10/22 fix all） */}
        共 {page.count || 0} 筆, {page.offset + 1} /{Math.ceil((page.count || 0) / page.limit)}
      </p>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>卡券購買紀錄</CardTitle>
        </CardHeader>
        <div className="px-5">
          <Table className="min-w-[1150px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>操作</TableHead>
                <TableHead>帳單編號/時間</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>卡券銷售</TableHead>
                <TableHead numeric>銷售金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={`${result.id}-${index}`}>
                  <TableCell>
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink to={`/order/${result.order.id}`}>
                        帳單詳情
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium tabular-nums">{idx(result, _ => _.order.no)}</div>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {idx(result, _ => format(_.order.date, 'yyyy/MM/dd'))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {idx(result, _ => _.order.customer.name + ' ' + _.order.customer.cellphone)}
                  </TableCell>
                  <TableCell>
                    {idx(
                      result,
                      _ => _.order.designer.name + ' ' + _.order.designer.designerNo
                    )}
                  </TableCell>
                  <TableCell>{idx(result, _ => _.service.name)}</TableCell>
                  <TableCell numeric>{formatNumber(roundDecimal(idx(result, _ => _.price)))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end px-3 pb-2">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            count={page.count}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={page.offset}
            rowsPerPage={page.limit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
      <TableEditBar selected={selectedOrders} />
    </div>
  )
}
