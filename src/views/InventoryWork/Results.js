import { Eye, Pencil } from 'lucide-react'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import format from 'date-fns/format'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ inventorys }) {
  return (
    <Fragment>
      {inventorys.length === 0 ? (
        <Card>
          <EmptyState title="目前沒有盤點紀錄" />
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-baseline gap-3">
              <CardTitle>歷史盤點單</CardTitle>
              <span className="text-label tabular-nums text-text-secondary">
                共 {inventorys.length} 筆資料
              </span>
            </div>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">日期時間</TableHead>
                  <TableHead className="w-[120px]">狀態</TableHead>
                  <TableHead>建立人員</TableHead>
                  <TableHead className="w-[80px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventorys.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium tabular-nums">{format(d.date, 'yyyy/MM/dd HH:mm')}</TableCell>
                    <TableCell>
                      <Badge variant={d.isDraft ? 'warning' : 'success'}>
                        {d.isDraft ? '未完成' : '已完成'}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.creatorName}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                        <RouterLink
                          aria-label={d.isDraft ? '繼續盤點' : '查看盤點單'}
                          to={d.isDraft ? `inventory-work/edit/${d.id}` : `inventory-work/review/${d.id}`}
                        >
                          {d.isDraft ? <Pencil strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
                        </RouterLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </Fragment>
  )
}
export default Results
