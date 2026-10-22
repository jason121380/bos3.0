import { Fragment } from 'react'
import { format } from 'date-fns'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 遲到／早退標紅（lateOrEarly 回傳 class 字串），與舊版相同
// 打卡操作按鈕：上班 / 下班 / 外出（歸來）以狀態色文字區分
const clockBtn = 'h-7 px-3 text-caption font-medium'

function Results({ clockInRecord, handleClockIn, isToday, btnStatus }) {
  const color = value => {
    switch (value) {
      case 'BETWEEN25AND50':
        return 'rgb(var(--warning))'
      case 'MORETHAN50':
        return 'rgb(var(--danger))'
      default:
        return 'rgb(var(--text))'
    }
  }

  const checkBreakTime = time => {
    const arr = []
    time.forEach(d => {
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
        {checkBreakTime(breakTime) && <b style={{ color: 'rgb(var(--text))' }} id='breakTime'>外出時間：</b>}
        {/* 開始、結束都沒有時間的外出紀錄整筆不顯示（原本會留下「, - 」，Jason 2026/10/22 fix all） */}
        {breakTime.filter(d => d.start.time !== null || (d.end !== null && d.end.time !== null)).map((d, index) => {
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
          return undefined
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
      return ' !text-danger font-bold'
    } else {
      return ''
    }
  }
  const clockInOutRender = (value, designer) => {
    return (
      value.map((time, index) => {
        if (time.out !== null) {
          return (
            <Fragment key={`clockInOutRender-${index}`}>
              {checkBr(time, index) && <hr className='hrBorderStyleInEmployeeClockin' />}
              <b style={{ color: 'rgb(var(--success))' }}>上班時間：</b>
              {(time.in !== null && time.in.time !== null) &&
                <span style={{ color: color(time.in.distanceValue) }} className={`time${lateOrEarly(value.length - 1,
                  index,
                  designer.isLate)}`}>
                  {format(time.in.time, 'HH:mm')}</span>
              }
              {' - '}
              <span style={{ color: color(time.out.distanceValue) }} className={`time${lateOrEarly(value.length - 1,
                index,
                designer.isLeaveEarly)}`}>
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
                  <b style={{ color: 'rgb(var(--success))' }}>上班時間：</b>
                  <span style={{ color: color(time.in.distanceValue) }} className={`time${lateOrEarly(value.length - 1,
                    index,
                    designer.isLate)}`}>{format(time.in.time, 'HH:mm')}
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
    <div className="EmployeeClockInTableContainer">
      <Table className="whitespace-nowrap">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>狀態</TableHead>
            <TableHead>代號</TableHead>
            <TableHead>暱稱</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>班別</TableHead>
            <TableHead>時間</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clockInRecord.map((designer, index) => (
            <TableRow key={index}>
              <TableCell>
                {btnStatus[index].clockInRecord.length > 0 ? (
                  btnStatus[index].clockInRecord.map((d, designerTimeIndex) => {
                    if (designerTimeIndex === designer.clockInRecord.length - 1) {
                      if (d.in !== null && d.out === null && d.breakRecord.length === 0) {
                        return <Badge key={`designerTimeIndex-${designerTimeIndex}`} variant="success">上班中</Badge>
                      }
                      if (d.time !== null && d.out !== null) {
                        return (
                          <Badge
                            key={`designerTimeIndex-${designerTimeIndex}`}
                            variant="warning"
                          >
                            已下班
                          </Badge>
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
                            <Badge
                              key={`designerTimeIndex-${designerTimeIndex}`}
                              variant="accent"
                            >
                              外出中
                            </Badge>
                          )
                        }
                        if (d.breakRecord[d.breakRecord.length - 1].end !== null) {
                          return <Badge key={`designerTimeIndex-${designerTimeIndex}`} variant="success">上班中</Badge>
                        }
                      }
                    }
                    return undefined
                  })
                ) : (
                  <Badge variant="neutral">未打卡</Badge>
                )}
              </TableCell>
              <TableCell className="tabular-nums">{designer.userNo ? designer.userNo : '無代號'}</TableCell>
              <TableCell className="max-w-[100px] overflow-hidden text-ellipsis">
                {designer.userNickName ? designer.userNickName : ''}
              </TableCell>
              <TableCell className="min-w-[100px]">
                {designer.userName}
              </TableCell>
              <TableCell className="min-w-[100px]">
                {designer.clockInSetting !== null && designer.clockInSetting.name}
              </TableCell>
              <TableCell className="min-w-[200px] whitespace-normal py-2 tabular-nums">
                {designer.clockInRecord.length > 0 && clockInOutRender(designer.clockInRecord, designer)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Button
                    disabled={btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    variant="secondary"
                    className={`work ${clockBtn} text-success`}
                    onClick={() => {
                      handleClockIn(btnStatus[index].userId, 'CLOCKIN')
                    }}
                  >
                    上班
                  </Button>
                  <Button
                    disabled={!btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    variant="secondary"
                    className={`offWork ${clockBtn} text-warning`}
                    onClick={() => {
                      handleClockIn(btnStatus[index].userId, 'CLOCKOUT')
                    }}
                  >
                    下班
                  </Button>
                  <Button
                    disabled={!btnDisabled(btnStatus[index].clockInRecord) || !isToday}
                    variant="secondary"
                    className={`break ${clockBtn} text-accent`}
                    onClick={() => {
                      handleClockIn(
                        btnStatus[index].userId,
                        buttonStatus(btnStatus[index].clockInRecord) === '外出' ? 'BREAKSTART' : 'BREAKEND'
                      )
                    }}
                  >
                    {buttonStatus(btnStatus[index].clockInRecord)}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Results
