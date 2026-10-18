import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon, Edit as EditIconSlot } from 'ui/icons'
import { Link } from 'react-router-dom'
import format from 'date-fns/format';
import getLabel from 'utils/getTransferListLabel'
import { Fragment } from 'react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

export default function Results({ reportData, open, openCollapse, onToggleAll }) {
  const isAllOpen = open.length === reportData.length && reportData.length > 0;

  return reportData.length ? (
    <Card>
      <CardHeader
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleAll}
          >
            {isAllOpen ? '全部收合' : '全部展開'}
          </Button>
        }
      >
        <div className="flex items-baseline gap-3">
          <CardTitle>
            組合設定列表
          </CardTitle>
          <span className="text-label tabular-nums text-text-secondary">
            共 {reportData.length} 筆
          </span>
        </div>
      </CardHeader>
      <div className="px-5 pb-5 pt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className='noprint w-16'>展開</TableHead>
              <TableHead className="w-16">編輯</TableHead>
              <TableHead>代號</TableHead>
              <TableHead>名稱</TableHead>
              <TableHead>建立者</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead>編輯者</TableHead>
              <TableHead>編輯時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map(d => (
              <Fragment key={d.id}>
                <TableRow>
                  <TableCell className='noprint'>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-secondary"
                      aria-label={open.indexOf(d.id) > -1 ? '收合組合內容' : '展開組合內容'}
                      aria-expanded={open.indexOf(d.id) > -1}
                      onClick={() => openCollapse(d.id)}
                    >
                      {open.indexOf(d.id) > -1 ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <Link
                        aria-label={`編輯 ${d.name}`}
                        to={`/shortcut/edit/${d.id}`}
                      >
                        <EditIconSlot fontSize="small" />
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>{d.no}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.creator.name}</TableCell>
                  <TableCell className="tabular-nums">{format(d.createdAt, 'yyyy/MM/dd HH:mm')}</TableCell>
                  <TableCell>{d.editor && d.editor.name}</TableCell>
                  <TableCell className="tabular-nums">{format(d.updatedAt, 'yyyy/MM/dd HH:mm')}</TableCell>
                </TableRow>
                <TableRow className='noprint border-b-0 hover:bg-transparent'>
                  <TableCell className="h-auto p-0" colSpan={8}>
                    {open.indexOf(d.id) > -1 && (
                      <div className="my-2 ml-6 border-0 border-l-4 border-solid border-accent pl-4">
                        {d.collapesData.length ? (
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead>服務項目</TableHead>
                                <TableHead>店販銷售</TableHead>
                                <TableHead>預收卡</TableHead>
                                <TableHead>會員卡</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {d.collapesData.map(({
                                service, product, ticket, membership
                              }, i) => (
                                <TableRow key={`${d.id}-${i}-collapesData`}>
                                  <TableCell>{service && getLabel(service)}</TableCell>
                                  <TableCell>{product && getLabel(product)}</TableCell>
                                  <TableCell>{ticket && getLabel(ticket)}</TableCell>
                                  <TableCell>{membership && getLabel(membership)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="p-4 text-center text-body text-text-tertiary">無詳細組合資料</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  ) : (
    <Card>
      <EmptyState title="無資料" />
    </Card>
  )
}
