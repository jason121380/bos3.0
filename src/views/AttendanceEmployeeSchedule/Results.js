/** @jsxImportSource @emotion/react */
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Paper, Card, CardHeader, CardContent, Typography,
} from '@mui/material'
import { format, isBefore, isAfter, isToday } from 'date-fns'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(2),
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap !important',
    minWidth: '150px !important',
    width: '150px !important',
    overflow: 'hidden !important',
    outline: '1px solid rgb(var(--border))',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  colorRed: css({
    color: 'red',
    fontWeight: 'bold',
  }),
  black: css({
    color: 'black',
  }),
  white: css({
    color: 'white',
  }),
  button: css({
    padding: '4px',
    height: '36px',
    lineHeight: '16px',
    overflow: 'hidden !important',
  }),
  buttonLabel: css({
    overflow: 'hidden !important',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap !important',
    width: '100px !important',
    display: 'inline-block !important',
  }),
  cardHeader: css({
    padding: '16px 16px !important',
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
  compactHeaderCell: css({
    padding: '8px 8px !important',
    fontSize: '13px !important',
    fontWeight: '600 !important',
    whiteSpace: 'nowrap',
    backgroundColor: 'rgb(var(--surface)) !important',
  }),
  dateHeaderCell: css({
    minWidth: '120px !important',
    width: '120px !important',
    padding: '8px 8px !important',
    fontSize: '13px !important',
    fontWeight: '600 !important',
    whiteSpace: 'nowrap',
    backgroundColor: 'rgb(var(--surface)) !important',
    textAlign: 'center',
  }),
  dateCell: css({
    minWidth: '120px !important',
    width: '120px !important',
    padding: '4px 8px !important',
    fontSize: '13px !important',
    textAlign: 'center',
  }),
}

export default function Results({
  displayDate, rawTime, fontColor, tagId, employeeSchedule,
  setEmployeeSchedule, editBefore, exportExcel, exportLoading,
  saveData, isClick, loading, isEditing, setIsEditing,
}) {
  const setSchedule = (dataIndex, time) => {
    if (!isEditing) return
    if (tagId !== '') {
      const newData = _.cloneDeep(employeeSchedule)
      newData[dataIndex].clockInSchedule.push({
        date: time,
        clockInSetting: {
          id: tagId.id,
          name: tagId.name,
          color: tagId.color,
        },
      })
      setEmployeeSchedule(newData)
    }
  }

  const checkTime = time => {
    if (isToday(time)) return true
    const checkFunc = editBefore ? isAfter : isBefore
    return checkFunc(new Date(), time)
  }

  const editSchedule = (scheduleId, dataIndex, time) => {
    if (!isEditing) return
    const newData = _.cloneDeep(employeeSchedule)
    const index = newData[dataIndex].clockInSchedule.map(d => {
      return d.date
    }).indexOf(time)
    if (tagId === '' || scheduleId === tagId.id) {
      newData[dataIndex].clockInSchedule[index].clockInSetting.id = null
      setEmployeeSchedule(newData)
    } else {
      newData[dataIndex].clockInSchedule[index].clockInSetting.id = tagId.id
      newData[dataIndex].clockInSchedule[index].clockInSetting.name = tagId.name
      newData[dataIndex].clockInSchedule[index].clockInSetting.color = tagId.color
      setEmployeeSchedule(newData)
    }
  }

  const addMultiColumnSchedule = date => {
    if (!isEditing) return
    if (checkTime(date)) {
      const newData = _.cloneDeep(employeeSchedule)
      newData.forEach((record, recordIndex) => {
        const dataInRecord = record.clockInSchedule.find(d => d.date === date)
        if (dataInRecord === undefined) {
          if (tagId !== '') {
            record.clockInSchedule.push({
              date: date,
              clockInSetting: {
                id: tagId.id,
                name: tagId.name,
                color: tagId.color,
              },
            })
          }
        } else {
          const editIndex = record.clockInSchedule.indexOf(dataInRecord)
          if (tagId === '') {
            record.clockInSchedule[editIndex].clockInSetting.id = null
          } else {
            record.clockInSchedule[editIndex].clockInSetting.id = tagId.id
            record.clockInSchedule[editIndex].clockInSetting.name = tagId.name
            record.clockInSchedule[editIndex].clockInSetting.color = tagId.color
          }
        }
      })
      setEmployeeSchedule(newData)
    }
  }

  const addMultiRowSchedule = designerIndex => {
    if (!isEditing) return
    const newData = _.cloneDeep(employeeSchedule)
    const verifyDate = rawTime.filter(d => checkTime(+d))
    verifyDate.map(date => {
      const dataInRecord = newData[designerIndex].clockInSchedule.find(d => d.date === +date)
      if (dataInRecord === undefined) {
        if (tagId !== '') {
          newData[designerIndex].clockInSchedule.push({
            date: +date,
            clockInSetting: {
              id: tagId.id,
              name: tagId.name,
              color: tagId.color,
            },
          })
        }
      } else {
        const editIndex = newData[designerIndex].clockInSchedule.indexOf(dataInRecord)
        if (tagId === '') {
          newData[designerIndex].clockInSchedule[editIndex].clockInSetting.id = null
        } else {
          newData[designerIndex].clockInSchedule[editIndex].clockInSetting.id = tagId.id
          newData[designerIndex].clockInSchedule[editIndex].clockInSetting.name = tagId.name
          newData[designerIndex].clockInSchedule[editIndex].clockInSetting.color = tagId.color
        }
      }
    })
    setEmployeeSchedule(newData)
  }

  const showTagData = (time, data, dataIndex) => {
    // 判斷這一格是不是之前的時間
    if (checkTime(time)) {
      if (data.clockInSchedule.length > 0) {
        const filterData = []
        data.clockInSchedule.forEach(d => {
          if (format(+d.date, 'yyyy/MM/dd') === format(+time, 'yyyy/MM/dd')) {
            filterData.push(d)
          }
        })
        if (filterData.length > 0) {
          if (filterData[0].clockInSetting.id === null) {
            return (
              <TableCell
                key={time}
                css={styles.dateCell}
                onClick={() => {
                  editSchedule(filterData[0].clockInSetting.id, dataIndex, time)
                }}
              />
            )
          } else {
            return (
              <TableCell key={time} css={styles.dateCell}>
                <Button
                  css={css([styles.button, css({ background: `${filterData[0].clockInSetting.color} !important`, borderRadius: '18px' })])}
                  onClick={() => {
                    editSchedule(filterData[0].clockInSetting.id, dataIndex, time)
                  }}
                  variant="contained"
                >
                  <span
                    css={css([styles.buttonLabel, css({ color: `${fontColor(filterData[0].clockInSetting.color)} !important`, fontSize: '12px' })])}
                  >{filterData[0].clockInSetting.name}</span>
                </Button>
              </TableCell>
            )
          }
        } else {
          return (
            <TableCell
              key={time}
              css={styles.dateCell}
              onClick={() => {
                setSchedule(dataIndex, time)
              }}
            />
          )
        }
      } else {
        return (
          <TableCell
            key={time}
            css={styles.dateCell}
            onClick={() => {
              setSchedule(dataIndex, time)
            }}
          />
        )
      }
    } else {
      if (data.clockInSchedule.length > 0) {
        const filterData = []
        data.clockInSchedule.forEach(d => {
          if (format(+d.date, 'yyyy/MM/dd') === format(+time, 'yyyy/MM/dd')) {
            filterData.push(d)
          }
        })
        if (filterData.length > 0) {
          if (filterData[0].clockInSetting.id === null) {
            return (
              <TableCell key={time} className="beforeToday" css={styles.dateCell} />
            )
          } else {
            return (
              <TableCell key={time} className="beforeToday" css={styles.dateCell}>
                <Button
                  css={css([styles.button, css({ borderRadius: '18px' })])}
                  variant="contained">
                  <span css={css([styles.buttonLabel, css({ fontSize: '12px' })])}>{filterData[0].clockInSetting.name}</span>
                </Button>
              </TableCell>
            )
          }
        } else {
          return <TableCell key={time} className="beforeToday" css={styles.dateCell} />
        }
      } else {
        return <TableCell key={time} className="beforeToday" css={styles.dateCell} />
      }
    }
  }

  return (
    <Card css={styles.root}>
      <CardHeader
        css={styles.cardHeader}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>班表總表列表</span>
            <Typography color="textSecondary" variant="body2">
              共 {employeeSchedule.length} 人
            </Typography>
          </div>
        }
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              disabled={exportLoading}
              variant="contained"
              onClick={exportExcel}
              size="small"
              css={css({
                backgroundColor: 'rgb(var(--surface)) !important',
                color: 'rgb(var(--text-secondary)) !important',
                boxShadow: 'none !important',
                borderRadius: '18px !important',
                padding: '4px 16px !important',
                '&:hover': {
                  backgroundColor: 'rgb(var(--surface)) !important',
                  boxShadow: 'none !important',
                }
              })}
            >
              報表匯出
            </Button>
          </div>
        }
      />
      <CardContent style={{ padding: 0 }}>
        <TableContainer style={{ maxHeight: 'calc(100vh - 380px)' }} component={Paper} className="AttendanceEmployeeScheduleTable">
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead css={styles.stickyRow}>
              <TableRow>
                <TableCell css={css([styles.sticky, styles.compactHeaderCell])}>設計師</TableCell>
                {displayDate.map((date, index) => (
                  <TableCell
                    key={index}
                    style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => addMultiColumnSchedule(Number(rawTime[index]))}
                    css={styles.dateHeaderCell}
                  >
                    {date}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeSchedule.length > 0 &&
                employeeSchedule.map((data, dataIndex) => {
                  return (
                    <TableRow key={dataIndex}>
                      <TableCell
                        style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        onClick={() => addMultiRowSchedule(dataIndex)}
                        css={css([styles.sticky, styles.compactCell])}
                        key={data.user.name}
                      >
                        {data.user.name}
                      </TableCell>
                      {rawTime.map(time => {
                        return showTagData(parseInt(time), data, dataIndex)
                      })}
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
