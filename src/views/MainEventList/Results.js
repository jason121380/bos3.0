/** @jsxImportSource @emotion/react */
import {
  Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Box, TableContainer, ThemeProvider,
  createTheme, Collapse, Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { green, red, orange } from '@mui/material/colors';
import { css } from '@emotion/react'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

const styles = {
  root: css({
    marginTop: 24,
    '& td': {
      whiteSpace: 'nowrap !important'
    },
  }),
  Box: css({
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0px 1px 3px 0px rgb(0 0 0 / 12%)',
    '& th': {
      backgroundColor: '#b94831 !important'
    },
  }),
  setPadding: css({

    '& > .MuiTableCell-root': {
      padding: '12px 16px !important'
    }
  }),
  setPadding2: css({
    '& > .MuiTableCell-root': {
      padding: '6px 10px !important'
    }
  }),
  cursor: css({
    cursor: 'pointer',
  })
}

const theme1 = createTheme({
  palette: {
    primary: {
      main: orange[800] + '!important'
    },
  }
})

const theme2 = createTheme({
  palette: {
    primary: {
      main: red[600] + '!important'
    },
    secondary: {
      main: green[600] + '!important'
    },
  }
})

function Results({
  events, setEventUsing, setClickData, setDialogOpen, setCollapse,
  selectIds, setEventRuleUsing
}) {
  const renderIsUsing = isUsing => {
    return isUsing ? '上架中' : '已下架'
  }

  const renderRuleStatus = (status, isEnd) => {
    if (isEnd) return '已停用'
    return status ? '啟用中' : '已停用'
  }

  return (
    <Fragment>
      {events.length ?
        <Card css={styles.root}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow css={styles.setPadding}>
                  <TableCell></TableCell>
                  <TableCell>建立日期</TableCell>
                  <TableCell>名稱</TableCell>
                  <TableCell>時間範圍</TableCell>
                  <TableCell>最大發行張數</TableCell>
                  <TableCell>已發行張數</TableCell>
                  <TableCell>上架狀態</TableCell>
                  <TableCell>是否加入</TableCell>
                  <TableCell>隱私狀態</TableCell>
                  <TableCell>簡訊通知</TableCell>
                  <TableCell>實際結束日期</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map(({ id, ruleGroups, ...event }) => {
                  const isSelect = selectIds.includes(id)
                  const Icon = () => isSelect ? arrowUp : arrowDown
                  return (
                    <Fragment key={id}>
                      <TableRow css={css([styles.setPadding, ruleGroups.length ? styles.cursor : {}])} onClick={() => ruleGroups.length && setCollapse(id)} hover>
                        <TableCell>
                          {ruleGroups.length ? <Icon /> : ''}
                        </TableCell>
                        <TableCell>{format(event.createTime, 'yyyy/M/d')}</TableCell>
                        <TableCell>{event.nameDefault}</TableCell>
                        <TableCell>{`${format(event.startDateDefault, 'yyyy/M/d')} ~ ${format(event.endDateDefault, 'yyyy/M/d')}`}</TableCell>
                        <TableCell>{event.maxCountDefault}</TableCell>
                        <TableCell>{event.releasedCount}</TableCell>
                        <TableCell>{event.endDateActual ? '活動結束' : renderIsUsing(event.isUsingDefault)}</TableCell>
                        <TableCell>{event.isJoined ? '已加入' : '未加入'}</TableCell>
                        <TableCell>{event.isPublic ? '公開' : '私人'}</TableCell>
                        <TableCell>{event.isSMSNotifyDefault ? '開啟' : '關閉'}</TableCell>
                        <TableCell>{event.endDateActual ? format(event.endDateActual, 'yyyy/M/d') : ''}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {event.endDateActual ? '' : (
                              <ThemeProvider theme={theme1}>
                                <Button
                                  color='primary'
                                  variant='contained'
                                  component={RouterLink}
                                  to={`/event-rule-create/${id}`}
                                >建立規則</Button>
                              </ThemeProvider>
                            )}
                            <Button
                              to={`/main-event-edit/${id}`}
                              component={RouterLink}
                              color='primary'
                              variant='contained'
                            >{event.endDateActual ? '檢視' : '編輯'}</Button>
                            {event.endDateActual ? '' : (
                              <ThemeProvider theme={theme2}>
                                <Button
                                  color='secondary'
                                  variant='contained'
                                  onClick={e => {
                                    e.stopPropagation()
                                    setEventUsing(id, !event.isUsingDefault)
                                  }}
                                >
                                  {event.isUsingDefault ? '點我下架' : '點我上架'}
                                </Button>
                                <Button
                                  color='primary'
                                  variant='contained'
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
                                  提前結束
                                </Button>
                              </ThemeProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {ruleGroups.length ? (
                        <TableRow>
                          <TableCell style={{ padding: 0 }} colSpan={12}>
                            <Collapse timeout="auto" unmountOnExit in={selectIds.indexOf(id) > -1}>
                              <Box css={styles.Box} margin={2}>
                                <TableContainer>
                                  <Table>
                                    <TableHead>
                                      <TableRow css={styles.setPadding2}>
                                        <TableCell>名稱</TableCell>
                                        <TableCell>時間範圍</TableCell>
                                        <TableCell>最大發行張數</TableCell>
                                        <TableCell>已發行張數</TableCell>
                                        <TableCell>狀態</TableCell>
                                        <TableCell>是否套用</TableCell>
                                        <TableCell>簡訊通知</TableCell>
                                        <TableCell>實際結束日期</TableCell>
                                        <TableCell>操作</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {ruleGroups.map(rule => (
                                        <TableRow key={rule.id} css={styles.setPadding2} hover>
                                          <TableCell>{rule.nameForGroup}</TableCell>
                                          <TableCell>{`${format(rule.startDateForGroup, 'yyyy/M/d')} ~ ${format(rule.endDateForGroup, 'yyyy/M/d')}`}</TableCell>
                                          <TableCell>{rule.maxCountForGroup}</TableCell>
                                          <TableCell>{rule.releasedCount}</TableCell>
                                          <TableCell>{(rule.endDateActual && event.endDateActua) ? '主活動關閉' : renderRuleStatus(rule.isUsingForGroup, rule.endDateActual)}</TableCell>
                                          <TableCell>{rule.isRuleApply ? '已套用' : '未套用'}</TableCell>
                                          <TableCell>{rule.isSMSNotifyForGroup ? '開啟' : '關閉'}</TableCell>
                                          <TableCell>{rule.endDateActual ? format(rule.endDateActual, 'yyyy/M/d') : ''}</TableCell>
                                          <TableCell>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                              <Button
                                                to={`/event-rule-edit/${rule.id}`}
                                                component={RouterLink}
                                                color='primary'
                                                variant='contained'
                                              >{rule.endDateActual ? '檢視' : '編輯'}</Button>
                                              {rule.endDateActual ? '' : (
                                                <ThemeProvider theme={theme2}>
                                                  <Button
                                                    color='secondary'
                                                    variant='contained'
                                                    onClick={e => {
                                                      e.stopPropagation()
                                                      setEventRuleUsing(rule.id, !rule.isUsingForGroup)
                                                    }}
                                                  >
                                                    {rule.isUsingForGroup ? '點我停用' : '點我啟用'}
                                                  </Button>
                                                  <Button
                                                    color='primary'
                                                    variant='contained'
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
                                                    提前結束
                                                  </Button>
                                                </ThemeProvider>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        :
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: 100 }}>無資料</Typography>
      }
    </Fragment>
  )
}
export default Results
