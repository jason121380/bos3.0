import { format } from 'date-fns'
import { useRef, useEffect } from 'react'
import pagenationLabel from './../../helper/pagenationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow } from 'ui/table'

const AttendanceRecord = ({
  page,
  onChangePage,
  onChangeRowsPerPage,
  results,
  ...rest
}) => {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, pageRef.current])

  return (
    <div {...rest}>
      <p className="mb-2 text-label tabular-nums text-text-secondary">
        共 {results.length} 筆, {page.offset + 1} / {Math.ceil(results.length / page.limit)}
      </p>
      <Card {...rest}>
        <CardHeader>
          <CardTitle>打卡紀錄</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5 pt-4">
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
                  <TableCell className="tabular-nums">
                    {format(new Date(data.checkinDateTime), 'HH:mm:ss')}
                    <div className="text-caption text-text-secondary">
                      {format(new Date(data.checkinDateTime), 'MM/dd/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="secondary">
                      <a
                        href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                        target="_blank"
                      >
                        地點
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* pageRef 保留：pagenationLabel 只改寫 MUI 分頁文字，新分頁元件已是中文，查無元素時不動作 */}
          <div ref={pageRef}>
            <TablePagination
              count={page.count}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              page={page.offset}
              rowsPerPage={page.limit}
              rowsPerPageOptions={[5, 10, 25, 50, 1000]}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AttendanceRecord
