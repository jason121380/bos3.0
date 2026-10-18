/** @jsxImportSource @emotion/react */
import {
  Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Box, TableContainer, Collapse, Typography, CardHeader, CardContent, IconButton
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIconSlot from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

const styles = {
  root: css({
    marginTop: theme.spacing(1),
  }),
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1000,
    '& td': {
      whiteSpace: 'nowrap !important'
    },
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
  }),
  expandedRow: css({
    backgroundColor: 'rgb(var(--surface))',
    position: 'relative',
  }),
  actionButton: css({
    padding: '4px !important',
    '& .MuiSvgIcon-root': {
      color: 'rgb(var(--text-tertiary)) !important',
    },
    '&:hover .MuiSvgIcon-root': {
      color: 'rgb(var(--accent)) !important',
    },
    '&:hover': {
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '4px 16px !important',
    fontSize: '13px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    whiteSpace: 'nowrap',
  }),
  secondaryPill: css({
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
  redPill: css({
    backgroundColor: 'rgba(211, 47, 47, 0.1) !important',
    color: 'rgb(var(--danger)) !important',
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.2) !important',
    }
  }),
  greenPill: css({
    backgroundColor: 'rgba(56, 142, 60, 0.1) !important',
    color: '#388e3c !important',
    '&:hover': {
      backgroundColor: 'rgba(56, 142, 60, 0.2) !important',
    }
  }),
  subTableBox: css({
    borderRadius: '0 12px 12px 0',
    overflow: 'hidden',
    border: '1px solid rgb(var(--border))',
    borderLeft: 'none',
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      backgroundColor: 'rgb(var(--surface)) !important',
      color: 'rgb(var(--text-secondary)) !important',
    }
  }),
}

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
    <div css={styles.root} {...rest}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                活動清單
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {events.length} 筆資料
              </Typography>
            </div>
          }
          action={
            events.length > 0 && (
              <Button
                css={css([styles.pillButton, styles.secondaryPill])}
                onClick={onToggleAll}
              >
                {isAllExpanded ? '全部收合' : '全部展開'}
              </Button>
            )
          }
        />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table size="small">
                <TableHead css={styles.tableHead}>
                  <TableRow>
                    <TableCell style={{ width: 40 }}></TableCell>
                    <TableCell>建立日期</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>時間範圍</TableCell>
                    <TableCell>上架狀態</TableCell>
                    <TableCell>已發行 / 最大張數</TableCell>
                    <TableCell>私鑰 / 隱私</TableCell>
                    <TableCell>簡訊</TableCell>
                    <TableCell>結束日期</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.length > 0 ? (
                    events.map(({ id, ruleGroups, ...event }) => {
                      const isSelect = selectIds.includes(id)
                      const Icon = isSelect ? KeyboardArrowUpIcon : KeyboardArrowDownIcon
                      return (
                        <Fragment key={id}>
                          <TableRow
                            css={styles.tableRow}
                            selected={isSelect}
                          >
                            <TableCell>
                              {ruleGroups.length > 0 && (
                                <IconButton
                                  size="small"
                                  onClick={() => setCollapse(id)}
                                  css={styles.actionButton}
                                >
                                  <Icon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                            <TableCell>{format(event.createTime, 'yyyy/MM/dd')}</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>{event.nameDefault}</TableCell>
                            <TableCell>{`${format(event.startDateDefault, 'yyyy/MM/dd')} ~ ${format(event.endDateDefault, 'yyyy/MM/dd')}`}</TableCell>
                            <TableCell>{event.endDateActual ? '活動結束' : renderIsUsing(event.isUsingDefault)}</TableCell>
                            <TableCell>{`${event.releasedCount} / ${event.maxCountDefault}`}</TableCell>
                            <TableCell>{`${event.isJoined ? '已加入' : '未加入'} / ${event.isPublic ? '公開' : '私人'}`}</TableCell>
                            <TableCell>{event.isSMSNotifyDefault ? '開啟' : '關閉'}</TableCell>
                            <TableCell>{event.endDateActual ? format(event.endDateActual, 'yyyy/MM/dd') : '-'}</TableCell>
                            <TableCell align="right">
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                {event.endDateActual ? (
                                  <IconButton
                                    component={RouterLink}
                                    to={`/main-event-edit/${id}`}
                                    css={styles.actionButton}
                                    size="small"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                ) : (
                                  <Fragment>
                                    <Button
                                      css={css([styles.pillButton, styles.secondaryPill])}
                                      component={RouterLink}
                                      to={`/event-rule-create/${id}`}
                                    >建立規則</Button>
                                    <IconButton
                                      component={RouterLink}
                                      to={`/main-event-edit/${id}`}
                                      css={styles.actionButton}
                                      size="small"
                                    >
                                      <EditIconSlot fontSize="small" />
                                    </IconButton>
                                    <Button
                                      css={css([styles.pillButton, event.isUsingDefault ? styles.redPill : styles.greenPill])}
                                      onClick={e => {
                                        e.stopPropagation()
                                        setEventUsing(id, !event.isUsingDefault)
                                      }}
                                    >
                                      {event.isUsingDefault ? '下架' : '上架'}
                                    </Button>
                                    <Button
                                      css={css([styles.pillButton, styles.redPill])}
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
                          {ruleGroups.length > 0 && (
                            <TableRow>
                              <TableCell style={{ padding: 0 }} colSpan={10}>
                                <Collapse in={isSelect} timeout="auto" unmountOnExit>
                                  <div css={styles.expandedRow} style={{ padding: '8px 24px 16px 40px' }}>
                                    <Box css={styles.subTableBox}>
                                      <Table size="small">
                                        <TableHead css={styles.tableHead}>
                                          <TableRow>
                                            <TableCell>名稱</TableCell>
                                            <TableCell>時間範圍</TableCell>
                                            <TableCell>張數 (發行/最大)</TableCell>
                                            <TableCell>狀態</TableCell>
                                            <TableCell>簡訊</TableCell>
                                            <TableCell>操作</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {ruleGroups.map(rule => (
                                            <TableRow key={rule.id} css={styles.tableRow}>
                                              <TableCell style={{ fontWeight: '500' }}>{rule.nameForGroup}</TableCell>
                                              <TableCell>{`${format(rule.startDateForGroup, 'MM/dd')} ~ ${format(rule.endDateForGroup, 'MM/dd')}`}</TableCell>
                                              <TableCell>{`${rule.releasedCount} / ${rule.maxCountForGroup}`}</TableCell>
                                              <TableCell>{(rule.endDateActual && event.endDateActual) ? '主活動關閉' : renderRuleStatus(rule.isUsingForGroup, rule.endDateActual)}</TableCell>
                                              <TableCell>{rule.isSMSNotifyForGroup ? '是' : '否'}</TableCell>
                                              <TableCell>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                  <IconButton
                                                    component={RouterLink}
                                                    to={`/event-rule-edit/${rule.id}`}
                                                    css={styles.actionButton}
                                                    size="small"
                                                  >
                                                    {rule.endDateActual ? <VisibilityIcon fontSize="small" /> : <EditIconSlot fontSize="small" />}
                                                  </IconButton>
                                                  {!rule.endDateActual && (
                                                    <Fragment>
                                                      <Button
                                                        variant="text"
                                                        size="small"
                                                        style={{ fontSize: '12px', fontWeight: 'bold', color: rule.isUsingForGroup ? 'rgb(var(--danger))' : '#388e3c' }}
                                                        onClick={e => {
                                                          e.stopPropagation()
                                                          setEventRuleUsing(rule.id, !rule.isUsingForGroup)
                                                        }}
                                                      >
                                                        {rule.isUsingForGroup ? '停用' : '啟用'}
                                                      </Button>
                                                      <Button
                                                        variant="text"
                                                        size="small"
                                                        style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(var(--danger))' }}
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
                                    </Box>
                                  </div>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" style={{ padding: '40px 0' }}>
                        <Typography color="textSecondary">無活動資料</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
      </Card>
    </div>
  )
}
export default Results
