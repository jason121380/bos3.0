// 班表格線使用 sticky 欄列、動態班別色與 .AttendanceEmployeeScheduleTable / .beforeToday 全域樣式，表格沿用 MUI；班別按鈕改 ui/button（動態班別色以 CSS 變數＋!important 保留原權重）
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { format, isBefore, isAfter, isToday } from 'date-fns'
import PropTypes from 'prop-types'
import cloneDeep from 'lodash/cloneDeep'
import { Button as UiButton } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'

export default function Results({
  displayDate, rawTime, fontColor, tagId, employeeSchedule,
  setEmployeeSchedule, editBefore, exportExcel, exportLoading,
  saveData, isClick, loading, isEditing, setIsEditing,
}) {
  const setSchedule = (dataIndex, time) => {
    if (!isEditing) return
    if (tagId !== '') {
      const newData = cloneDeep(employeeSchedule)
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
    const newData = cloneDeep(employeeSchedule)
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
      const newData = cloneDeep(employeeSchedule)
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
    const newData = cloneDeep(employeeSchedule)
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
                className="!w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center"
                onClick={() => {
                  editSchedule(filterData[0].clockInSetting.id, dataIndex, time)
                }}
              />
            )
          } else {
            return (
              <TableCell key={time} className="!w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center">
                <UiButton
                  variant="ghost"
                  className="h-[36px] !overflow-hidden rounded-[18px] p-[4px] leading-[16px] max-sm:h-[36px] ![background:var(--schedule-tag-bg)]"
                  style={{ '--schedule-tag-bg': filterData[0].clockInSetting.color }}
                  onClick={() => {
                    editSchedule(filterData[0].clockInSetting.id, dataIndex, time)
                  }}
                >
                  <span
                    className="!inline-block !w-[100px] !overflow-hidden text-ellipsis !whitespace-nowrap text-[12px] ![color:var(--schedule-tag-fg)]"
                    style={{ '--schedule-tag-fg': fontColor(filterData[0].clockInSetting.color) }}
                  >{filterData[0].clockInSetting.name}</span>
                </UiButton>
              </TableCell>
            )
          }
        } else {
          return (
            <TableCell
              key={time}
              className="!w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center"
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
            className="!w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center"
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
              <TableCell key={time} className="beforeToday !w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center" />
            )
          } else {
            return (
              <TableCell key={time} className="beforeToday !w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center">
                <UiButton
                  variant="ghost"
                  className="h-[36px] !overflow-hidden rounded-[18px] p-[4px] leading-[16px] max-sm:h-[36px]">
                  <span className="!inline-block !w-[100px] !overflow-hidden text-ellipsis !whitespace-nowrap text-[12px]">{filterData[0].clockInSetting.name}</span>
                </UiButton>
              </TableCell>
            )
          }
        } else {
          return <TableCell key={time} className="beforeToday !w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center" />
        }
      } else {
        return <TableCell key={time} className="beforeToday !w-[120px] !min-w-[120px] !px-[8px] !py-[4px] !text-[13px] [&&]:text-center" />
      }
    }
  }

  return (
    <Card className="mt-4 overflow-hidden">
      <CardHeader
        className="items-center pb-4"
        action={
          <UiButton
            size="sm"
            variant="secondary"
            disabled={exportLoading}
            onClick={exportExcel}
          >
            報表匯出
          </UiButton>
        }
      >
        <div className="flex items-baseline gap-3">
          <CardTitle>班表總表列表</CardTitle>
          <span className="text-label tabular-nums text-text-secondary">
            共 {employeeSchedule.length} 人
          </span>
        </div>
      </CardHeader>
      <div className="mt-0">
        <TableContainer style={{ maxHeight: 'calc(100vh - 380px)' }} component={Paper} className="AttendanceEmployeeScheduleTable">
          <Table size="small" aria-label="a dense table">
            <TableHead className="sticky top-0 z-[100] bg-white [outline:1px_solid_rgb(var(--border))]">
              <TableRow>
                <TableCell className="sticky left-0 z-[99] !w-[150px] !min-w-[150px] !overflow-hidden text-ellipsis !whitespace-nowrap ![background-color:rgb(var(--surface))] bg-white !p-[8px] !text-[13px] !font-semibold [outline:1px_solid_rgb(var(--border))]">設計師</TableCell>
                {displayDate.map((date, index) => (
                  <TableCell
                    key={index}
                    style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    onClick={() => addMultiColumnSchedule(Number(rawTime[index]))}
                    className="!w-[120px] !min-w-[120px] ![background-color:rgb(var(--surface))] !p-[8px] [&&]:text-center !text-[13px] !font-semibold whitespace-nowrap"
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
                        className="sticky left-0 z-[99] !w-[150px] !min-w-[150px] !overflow-hidden text-ellipsis !whitespace-nowrap bg-white !px-[8px] !py-[4px] !text-[13px] [outline:1px_solid_rgb(var(--border))]"
                        key={data.user.name}
                      >
                        {data.user.name}
                      </TableCell>
                      {rawTime.map(time => {
                        return showTagData(parseInt(time, 10), data, dataIndex)
                      })}
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Card>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
