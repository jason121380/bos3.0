/** @jsxImportSource @emotion/react */
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip
} from '@mui/material'
import { Fragment } from 'react'
import _ from 'lodash'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  tableCell: css({
    padding: '8px 16px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
  button: css({
    borderRadius: '20px !important',
    padding: '4px 16px !important',
    fontSize: '12px !important',
    fontWeight: 'bold !important',
    height: '28px',
    marginRight: '6px',
    boxShadow: 'none !important',
  }),
  inButton: css({
    borderColor: '#2e7d32 !important',
    color: '#2e7d32 !important',
    '&:hover': {
      backgroundColor: '#2e7d32 !important',
      color: 'white !important',
    },
  }),
  outButton: css({
    borderColor: '#ed6c02 !important',
    color: '#ed6c02 !important',
    '&:hover': {
      backgroundColor: '#ed6c02 !important',
      color: 'white !important',
    },
  }),
  breakTimeButton: css({
    borderColor: '#1A73E8 !important',
    color: '#1A73E8 !important',
    '&:hover': {
      backgroundColor: '#1A73E8 !important',
      color: 'white !important',
    },
  }),
  chip: css({
    height: '24px !important',
    fontSize: '11px !important',
    fontWeight: 'bold !important',
    borderRadius: '12px !important',
  }),
  colorRed: css({
    color: '#d32f2f !important',
    fontWeight: 'bold',
  }),
}

function Results({ clockInRecord, handleClockIn, isToday, btnStatus }) {
  const color = value => {
    switch (value) {
      case 'BETWEEN25AND50':
        return '#ff6d00'
      case 'MORETHAN50':
        return '#d50000'
      default:
        return 'black'
    }
  }

  const checkBreakTime = time => {
    const arr = []
    time.map(d => {
      if (d.end === null) {
        if (d.start.time !== null) {
          arr.push('a')
        }
      } else if (d.start.time !== null || d.end.time !== null) {
        arr.push('a')
      }
    })
    if (arr.length > 0) {
      return true
    } else {
      return false
    }
  }

  const checkBr = (time, index) => {
    const arr = []
    if (index === 0) {
      return false
    } else {
      if (checkBreakTime(time.breakRecord)) {
        arr.push('a')
      }
      if (time.out === null) {
        if (time.in.time !== null) {
          arr.push('a')
        }
      } else if (time.in.time !== null || time.out.time !== null) {
        arr.push('a')
      }
      if (arr.length > 0) {
        return true
      } else {
        return false
      }
    }
  }
  const showBreaktime = (breakTime, recordIndex, length) => {
    return (
      <Fragment>
        {checkBreakTime(breakTime) && <b style={{ color: '#202D50' }} id='breakTime'>外出時間：</b>}
        {breakTime.map((d, index) => {
          if (index === 0) {
            if (d.end === null) {
              if (d.start.time !== null) {
                return (
                  <Fragment key={`breakTime=${index}`}>
                    <span className='time' style={{ color: color(d.start.distanceValue) }}>{format(d.start.time, 'HH:mm')}</span>
                  </Fragment>
                )
              }
            } else {
              return (
                <Fragment key={`breakTime=${index}`}>
                  {d.start.time !== null && <span className='time' style={{ color: color(d.start.distanceValue) }}>{format(d.start.time, 'HH:mm')}</span>}
                  {' - '}{d.end !== null && d.end.time !== null && <span className='time' style={{ color: color(d.end.distanceValue) }}>{format(d.end.time, 'HH:mm')}</span>}
                </Fragment>
              )
            }
          } else {
            if (d.end === null) {
              if (d.start.time !== null) {
                return (
                  <Fragment key={`breakTime=${index}`}>
                    {', '}<span className='time' style={{ color: color(d.start.distanceValue) }}>{format(d.start.time, 'HH:mm')}</span>
                  </Fragment>
                )
              }
            } else {
              return (
                <Fragment key={`breakTime=${index}`}>
                  {', '}
                  {d.start.time !== null && <span className='time' style={{ color: color(d.start.distanceValue) }}>{format(d.start.time, 'HH:mm')}</span>}
                  {' - '}{d.end !== null && d.end.time !== null && <span className='time' style={{ color: color(d.end.distanceValue) }}>{format(d.end.time, 'HH:mm')}</span>}
                </Fragment>
              )
            }
          }
        })}
      </Fragment>
    )
  }

  const btnDisabled = data => {
    if (data.length > 0) {
      const lastClockin = data.length - 1
      if (data[lastClockin].out === null) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const buttonStatus = lastRecord => {
    if (lastRecord.length > 0) {
      const lastClockin = lastRecord.length - 1
      if (lastRecord[lastClockin].breakRecord.length > 0) {
        const lastBreak = lastRecord[lastClockin].breakRecord.length - 1
        if (lastRecord[lastClockin].breakRecord[lastBreak].end === null) {
          return '歸來'
        } else {
          return '外出'
        }
      } else {
        return '外出'
      }
    } else {
      return '外出'
    }
  }

  const lateOrEarly = (lastIndex, index, lateOrEarly) => {
    if (lateOrEarly === true && lastIndex === index) {
      return styles.colorRed
    } else {
      return null
    }
  }
  const clockInOutRender = (value, designer) => {
    return (
      value.map((time, index) => {
        if (time.out !== null) {
          return (
            <Fragment key={`clockInOutRender-${index}`}>
              {checkBr(time, index) && <hr className='hrBorderStyleInEmployeeClockin' />}
              <b style={{ color: '#2e7d32' }}>上班時間：</b>
              {(time.in !== null && time.in.time !== null) &&
                <span css={lateOrEarly(
                  value.length - 1,
                  index,
                  designer.isLate
                )}
                  style={{ color: color(time.in.distanceValue) }}
                  className='time'
                >
                  {format(time.in.time, 'HH:mm')}</span>
              }
              {' - '}
              <span css={lateOrEarly(
                value.length - 1,
                index,
                designer.isLeaveEarly
              )}
                style={{ color: color(time.out.distanceValue) }}
                className='time'
              >
                {format(time.out.time, 'HH:mm')}
              </span>
              <br />
              {time.breakRecord.length > 0 && showBreaktime(time.breakRecord, index, value.length)}
            </Fragment>
          )
        } else {
          return (
            <Fragment key={`clockInOutRender-${index}`}>
              {checkBr(time, index) && <hr className='hrBorderStyleInEmployeeClockin' />}
              {time.in.time !== null &&
                <Fragment>
                  <b style={{ color: '#2e7d32' }}>上班時間：</b>
                  <span css={lateOrEarly(
                    value.length - 1,
                    index,
                    designer.isLate
                  )}
                    style={{ color: color(time.in.distanceValue) }}
                    className='time'
                  >{format(time.in.time, 'HH:mm')}
                  </span>
                  <br />
                </Fragment>
              }
              {time.breakRecord.length > 0 && showBreaktime(time.breakRecord, index, value.length)}
            </Fragment>
          )
        }
      })
    )
  }
  return (
    <ThemeProvider theme={theme}>
      <TableContainer component={Paper} className="EmployeeClockInTableContainer">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell css={styles.tableCell}>狀態</TableCell>
              <TableCell css={styles.tableCell}>代號</TableCell>
              <TableCell css={styles.tableCell}>暱稱</TableCell>
              <TableCell css={styles.tableCell}>姓名</TableCell>
              <TableCell css={styles.tableCell}>班別</TableCell>
              <TableCell css={styles.tableCell}>時間</TableCell>
              <TableCell css={styles.tableCell}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clockInRecord.map((designer, index) => (
              <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#fcfcfc' } }}>
                <TableCell css={styles.tableCell}>
                  {btnStatus[index].clockInRecord.length > 0 ? (
                    btnStatus[index].clockInRecord.map((d, designerTimeIndex) => {
                      if (designerTimeIndex === designer.clockInRecord.length - 1) {
                        if (d.in !== null && d.out === null && d.breakRecord.length === 0) {
                          return <Chip css={styles.chip} key={`designerTimeIndex-${designerTimeIndex}`} label="上班中" color="success" />
                        }
                        if (d.time !== null && d.out !== null) {
                          return (
                            <Chip
                              css={styles.chip}
                              label="已下班"
                              key={`designerTimeIndex-${designerTimeIndex}`}
                              style={{ backgroundColor: '#ed6c02', color: 'white' }}
                            />
                          )
                        }
                        if (
                          d.in !== null &&
                          d.out === null &&
                          d.breakRecord.length > 0 &&
                          d.breakRecord[d.breakRecord.length - 1]
                        ) {
                          if (d.breakRecord[d.breakRecord.length - 1].end === null) {
                            return (
                              <Chip
                                css={styles.chip}
                                label="外出中"
                                key={`designerTimeIndex-${designerTimeIndex}`}
                                style={{ backgroundColor: '#1A73E8', color: 'white' }}
                              />
                            )
                          }
                          if (d.breakRecord[d.breakRecord.length - 1].end !== null) {
                            return <Chip css={styles.chip} key={`designerTimeIndex-${designerTimeIndex}`} label="上班中" color="success" />
                          }
                        }
                      }
                    })
                  ) : (
                    <Chip css={styles.chip} label="未打卡" color="default" variant="outlined" />
                  )}
                </TableCell>
                <TableCell css={styles.tableCell}>{designer.userNo ? designer.userNo : '無代號'}</TableCell>
                <TableCell
                  css={styles.tableCell}
                  style={{
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {designer.userNickName ? designer.userNickName : ''}
                </TableCell>
                <TableCell
                  css={styles.tableCell}
                  style={{
                    minWidth: 100,
                  }}
                >
                  {designer.userName}
                </TableCell>
                <TableCell
                  css={styles.tableCell}
                  style={{
                    minWidth: 100,
                  }}
                >
                  {designer.clockInSetting !== null && designer.clockInSetting.name}
                </TableCell>
                <TableCell
                  css={styles.tableCell}
                  style={{
                    minWidth: 200,
                  }}
                >
                  {designer.clockInRecord.length > 0 && clockInOutRender(designer.clockInRecord, designer)}
                </TableCell>
                <TableCell css={styles.tableCell}>
                  <Button
                    disabled={btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    css={[styles.button, styles.inButton]}
                    variant="outlined"
                    className='work'
                    onClick={() => {
                      handleClockIn(btnStatus[index].userId, 'CLOCKIN')
                    }}
                  >
                    上班
                  </Button>
                  <Button
                    disabled={!btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    css={[styles.button, styles.outButton]}
                    variant="outlined"
                    className='offWork'
                    onClick={() => {
                      handleClockIn(btnStatus[index].userId, 'CLOCKOUT')
                    }}
                  >
                    下班
                  </Button>
                  <Button
                    disabled={!btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    css={[styles.button, styles.breakTimeButton]}
                    variant="outlined"
                    className='break'
                    onClick={() => {
                      handleClockIn(
                        btnStatus[index].userId,
                        buttonStatus(btnStatus[index].clockInRecord) === '外出' ? 'BREAKSTART' : 'BREAKEND'
                      )
                    }}
                  >
                    {buttonStatus(btnStatus[index].clockInRecord)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  )
}

export default Results
