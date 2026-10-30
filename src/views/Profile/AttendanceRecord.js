import { format } from 'date-fns'
import { Fragment, useEffect, useRef } from 'react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

const AttendanceRecord = ({
  page,
  onChangePage,
  onChangeRowsPerPage,
  results,
  pagenationLabel,
  ...rest
}) => {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（pagenationLabel）；只在 [results, pageRef.current] 變動時呼叫，補上會每次 render 重跑
  }, [results, pageRef.current])

  // 分頁改用 ui/table 的 TablePagination：ref 原樣保留，pagenationLabel 找不到 MUI 元素時不動作
  return (
    <div {...rest}>
      {results && (results.length === 0 ?
        <Card>
          <EmptyState title="無資料" />
        </Card>
        : <Fragment>
          <p className="pb-2 text-label tabular-nums text-text-secondary">
            共 {results.length} 筆, {page.offset + 1} / {Math.ceil(results.length / page.limit)}
          </p>
          <Card {...rest}>
            <CardHeader className="pb-4">
              <CardTitle>打卡紀錄</CardTitle>
            </CardHeader>
            <div className="px-5">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>時間</TableHead>
                    <TableHead className="text-right">地點</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((data, idx) => (
                    <TableRow key={`attendance-record-${idx}`}>
                      <TableCell>
                        <div className="tabular-nums">{format(new Date(data.checkinDateTime), 'HH:mm:ss')}</div>
                        <div className="text-caption tabular-nums text-text-secondary">
                          {format(new Date(data.checkinDateTime), 'yyyy/MM/dd')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="secondary">
                          <a
                            href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                            target="_blank"
                        rel="noopener noreferrer"
                          >
                            地點
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end px-2 pb-2">
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
        </Fragment>)
      }
    </div>
  )
}

export default AttendanceRecord
