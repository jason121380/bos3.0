import { format } from 'date-fns'
import { Fragment } from 'react'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function SMSRecord({ records }) {
  return (
    <Fragment>
      {records.length === 0 ? (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      ) : (
        <Card className="p-5">
          <Table wrapperClassName="max-h-[calc(100vh-300px)] overflow-auto">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead>日期</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>手機號碼</TableHead>
                <TableHead>簡訊內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(({ date, cellphone, message }, i) => (
                <TableRow key={`${date}-${i}`}>
                  <TableCell className="tabular-nums">{format(date, 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="tabular-nums">{format(date, 'H:mm')}</TableCell>
                  <TableCell className="tabular-nums">{cellphone}</TableCell>
                  <TableCell>{message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Fragment>
  )
}

export default SMSRecord
