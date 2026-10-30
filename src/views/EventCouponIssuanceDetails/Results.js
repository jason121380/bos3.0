import { Fragment, useRef, useEffect } from 'react'
import paginationLabel from '../../helper/paginationLabel'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

function Results({ recordData, pageSetting, onPageChange, onRowsPerPageChange }) {
  const pageRef1 = useRef(null)

  useEffect(() => {
    if (pageRef1.current) {
      paginationLabel(pageRef1.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pageRef.current 放進依賴，讓分頁元件掛上 DOM 後的下一次 render 補上中文分頁標籤
  }, [pageRef1.current, pageSetting])

  return (
    <div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>發券明細清單</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">共 {pageSetting.totalCount} 筆資料</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          {recordData.length ? (
            <Fragment>
              <Table className="min-w-[900px] [&_td]:whitespace-nowrap">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>流水號</TableHead>
                    <TableHead>活動名稱</TableHead>
                    <TableHead>規則名稱</TableHead>
                    <TableHead>帳單日期</TableHead>
                    <TableHead>帳單編號</TableHead>
                    <TableHead>顧客姓名</TableHead>
                    <TableHead>顧客手機</TableHead>
                    <TableHead>使用手機端</TableHead>
                    <TableHead>寄送簡訊</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordData.map(d => (
                    <TableRow key={d.number}>
                      <TableCell className="tabular-nums">{d.number}</TableCell>
                      <TableCell className="font-medium">{d.eventName}</TableCell>
                      <TableCell>{d.ruleName}</TableCell>
                      <TableCell className="tabular-nums">{format(d.orderDate, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        <a target="_blank" href={`/order/${d.orderId}`} className="font-medium text-accent underline" rel="noreferrer">
                          {d.orderNo === null ? '' : `#${d.orderNo}`}
                        </a>
                      </TableCell>
                      <TableCell>{d.customerName}</TableCell>
                      <TableCell className="tabular-nums">{d.customerCellphone}</TableCell>
                      <TableCell>{d.isCustomerSideUsing ? '是' : '否'}</TableCell>
                      <TableCell>{d.isSMSSended ? '是' : '否'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div ref={pageRef1}>
                <TablePagination
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
                  count={pageSetting.totalCount}
                  page={pageSetting.pageOffset}
                  rowsPerPage={pageSetting.pageLimit}
                  rowsPerPageOptions={[5, 10, 25, 50, 1000]}
                />
              </div>
            </Fragment>
          ) : (
            <EmptyState title="無發券明細資料" />
          )}
        </div>
      </Card>
    </div>
  )
}
export default Results
