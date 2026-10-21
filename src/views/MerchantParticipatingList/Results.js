import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { Fragment } from 'react'
import format from 'date-fns/format';
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

function Results({ events, setCollapse, selectIds, onToggleAll, isAllExpanded }) {
    return (
        <div>
            <Card>
                <CardHeader
                    className="items-center pb-4"
                    action={
                        events.length > 0 && (
                            <Button size="sm" variant="secondary" onClick={onToggleAll}>
                                {isAllExpanded ? '全部收合' : '全部展開'}
                            </Button>
                        )
                    }
                >
                    <div className="flex items-baseline gap-3">
                        <CardTitle>店家參與清單</CardTitle>
                        <span className="text-label text-text-secondary tabular-nums">
                            共 {events.length} 個活動
                        </span>
                    </div>
                </CardHeader>
                <div className="px-5 pb-5">
                    <Table className="min-w-[700px] [&_td]:whitespace-nowrap">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12"></TableHead>
                                <TableHead>活動名稱</TableHead>
                                <TableHead numeric>參與店家數量</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length > 0 ? (
                                events.map(({ id, name, merchantList }) => {
                                    const isSelect = selectIds.includes(id)
                                    const Icon = isSelect ? KeyboardArrowUpIcon : KeyboardArrowDownIcon
                                    return (
                                        <Fragment key={id}>
                                            <TableRow
                                                data-state={isSelect ? 'selected' : undefined}
                                            >
                                                <TableCell className="px-2">
                                                    {merchantList.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-text-tertiary"
                                                            aria-label={isSelect ? '收合店家' : '展開店家'}
                                                            aria-expanded={isSelect}
                                                            onClick={() => setCollapse(id)}
                                                        >
                                                            <Icon fontSize="small" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{name}</TableCell>
                                                <TableCell numeric>{formatNumber(merchantList.length)} 家</TableCell>
                                            </TableRow>
                                            {merchantList.length > 0 && isSelect && (
                                                <TableRow className="bg-surface hover:bg-surface">
                                                    <TableCell className="h-auto p-0" colSpan={3}>
                                                        <div className="flex flex-wrap gap-2.5 pb-4 pl-12 pr-6 pt-3">
                                                            {merchantList.map(({ id: mId, name: mName, joinTime }) => (
                                                                // 參與日期改用原生 title 提示（取代相容層 Tooltip）
                                                                <span key={mId} className="inline-flex" title={`參與日期: ${format(joinTime, 'yyyy/MM/dd')}`}>
                                                                    <Badge variant="accent">{mName}</Badge>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    )
                                })
                            ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={3}>
                                        <EmptyState title="目前無活動參與資料" />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
export default Results
