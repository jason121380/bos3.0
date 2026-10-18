import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon, Edit as EditIconSlot, Visibility as VisibilityIcon } from 'ui/icons'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

function Results({
  events, setEventUsing, setClickData, setDialogOpen, setCollapse,
  selectIds, setEventRuleUsing, onToggleAll, isAllExpanded, ...rest
}) {
  const renderIsUsing = isUsing => {
    return isUsing ? '上架中' : '已下架'
  }

  const renderRuleStatus = (status, isEnd) => {
    if (isEnd) return '已停用'
    return status ? '啟用中' : '已停用'
  }

  return (
    <div {...rest}>
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
            <CardTitle>活動清單</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {events.length} 筆資料
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1000px] [&_td]:whitespace-nowrap">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead>建立日期</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>時間範圍</TableHead>
                <TableHead>上架狀態</TableHead>
                <TableHead numeric>已發行 / 最大張數</TableHead>
                <TableHead>私鑰 / 隱私</TableHead>
                <TableHead>簡訊</TableHead>
                <TableHead>結束日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map(({ id, ruleGroups, ...event }) => {
                  const isSelect = selectIds.includes(id)
                  const Icon = isSelect ? KeyboardArrowUpIcon : KeyboardArrowDownIcon
                  return (
                    <Fragment key={id}>
                      <TableRow
                        data-state={isSelect ? 'selected' : undefined}
                      >
                        <TableCell className="px-2">
                          {ruleGroups.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-tertiary"
                              aria-label={isSelect ? '收合規則' : '展開規則'}
                              aria-expanded={isSelect}
                              onClick={() => setCollapse(id)}
                            >
                              <Icon fontSize="small" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums">{format(event.createTime, 'yyyy/MM/dd')}</TableCell>
                        <TableCell className="font-medium">{event.nameDefault}</TableCell>
                        <TableCell className="tabular-nums">{`${format(event.startDateDefault, 'yyyy/MM/dd')} ~ ${format(event.endDateDefault, 'yyyy/MM/dd')}`}</TableCell>
                        <TableCell>{event.endDateActual ? '活動結束' : renderIsUsing(event.isUsingDefault)}</TableCell>
                        <TableCell numeric>{`${event.releasedCount} / ${event.maxCountDefault}`}</TableCell>
                        <TableCell>{`${event.isJoined ? '已加入' : '未加入'} / ${event.isPublic ? '公開' : '私人'}`}</TableCell>
                        <TableCell>{event.isSMSNotifyDefault ? '開啟' : '關閉'}</TableCell>
                        <TableCell className="tabular-nums">{event.endDateActual ? format(event.endDateActual, 'yyyy/MM/dd') : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {event.endDateActual ? (
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary" aria-label="檢視活動">
                                <RouterLink to={`/main-event-edit/${id}`}>
                                  <VisibilityIcon fontSize="small" />
                                </RouterLink>
                              </Button>
                            ) : (
                              <Fragment>
                                <Button asChild size="sm" variant="secondary">
                                  <RouterLink to={`/event-rule-create/${id}`}>建立規則</RouterLink>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary" aria-label="編輯活動">
                                  <RouterLink to={`/main-event-edit/${id}`}>
                                    <EditIconSlot fontSize="small" />
                                  </RouterLink>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={event.isUsingDefault ? 'text-danger' : 'text-success'}
                                  onClick={e => {
                                    e.stopPropagation()
                                    setEventUsing(id, !event.isUsingDefault)
                                  }}
                                >
                                  {event.isUsingDefault ? '下架' : '上架'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger"
                                  onClick={e => {
                                    e.stopPropagation()
                                    setClickData({
                                      name: event.nameDefault,
                                      id: id,
                                      type: 'event'
                                    })
                                    setDialogOpen(true)
                                  }}
                                >
                                  結束
                                </Button>
                              </Fragment>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {ruleGroups.length > 0 && isSelect && (
                        <TableRow className="bg-surface hover:bg-surface">
                          <TableCell className="h-auto p-0" colSpan={10}>
                            <div className="pb-4 pl-10 pr-6 pt-2">
                              <Table wrapperClassName="bg-background">
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead>名稱</TableHead>
                                    <TableHead>時間範圍</TableHead>
                                    <TableHead numeric>張數 (發行/最大)</TableHead>
                                    <TableHead>狀態</TableHead>
                                    <TableHead>簡訊</TableHead>
                                    <TableHead>操作</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {ruleGroups.map(rule => (
                                    <TableRow key={rule.id}>
                                      <TableCell className="font-medium">{rule.nameForGroup}</TableCell>
                                      <TableCell className="tabular-nums">{`${format(rule.startDateForGroup, 'MM/dd')} ~ ${format(rule.endDateForGroup, 'MM/dd')}`}</TableCell>
                                      <TableCell numeric>{`${rule.releasedCount} / ${rule.maxCountForGroup}`}</TableCell>
                                      <TableCell>{(rule.endDateActual && event.endDateActual) ? '主活動關閉' : renderRuleStatus(rule.isUsingForGroup, rule.endDateActual)}</TableCell>
                                      <TableCell>{rule.isSMSNotifyForGroup ? '是' : '否'}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary" aria-label={rule.endDateActual ? '檢視規則' : '編輯規則'}>
                                            <RouterLink to={`/event-rule-edit/${rule.id}`}>
                                              {rule.endDateActual ? <VisibilityIcon fontSize="small" /> : <EditIconSlot fontSize="small" />}
                                            </RouterLink>
                                          </Button>
                                          {!rule.endDateActual && (
                                            <Fragment>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={rule.isUsingForGroup ? 'text-danger' : 'text-success'}
                                                onClick={e => {
                                                  e.stopPropagation()
                                                  setEventRuleUsing(rule.id, !rule.isUsingForGroup)
                                                }}
                                              >
                                                {rule.isUsingForGroup ? '停用' : '啟用'}
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-danger"
                                                onClick={e => {
                                                  e.stopPropagation()
                                                  setClickData({
                                                    name: rule.nameForGroup,
                                                    id: rule.id,
                                                    type: 'rule'
                                                  })
                                                  setDialogOpen(true)
                                                }}
                                              >
                                                結束
                                              </Button>
                                            </Fragment>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10}>
                    <EmptyState title="無活動資料" />
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
