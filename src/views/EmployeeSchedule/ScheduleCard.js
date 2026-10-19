// 標題輸入框保留 MUI FormControl/OutlinedInput：MyFormHelperText 依賴 useFormControl 的 focused 狀態顯示提示
import { FormHelperText, FormControl, useFormControl } from 'ui/form-control'
import { OutlinedInput } from '@mui/material'
import { ArrowDown, ArrowUp, ChevronsDown, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import { useState, Fragment, useMemo } from 'react'
import _ from 'lodash'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Skeleton } from 'ui/skeleton'

function MyFormHelperText() {
  const { focused } = useFormControl() || {}

  const helperText = useMemo(() => {
    if (focused) {
      return '確認按下enter鍵'
    }

    return ''
  }, [focused])

  return <FormHelperText>{helperText}</FormHelperText>
}

export default function ScheduleCard({
  scheduleCard,
  setScheduleCard,
  handleClickOpen,
  setOpenAddDesignerModal,
  setModalCardIndex,
  setDisableButton,
  users,
  disableButton,
  employeeScheduleData,
  handleSetSchedule
}) {
  const [progress, setProgress] = useState(0)
  const handleAddTime = (cardIndex, rowIndex) => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    newScheduleCard.forEach((data, index) => {
      if (index === cardIndex) {
        data.scheduleRow.forEach((data2, index2) => {
          if (index2 === rowIndex && !data2.timeAdded) {
            data2.timeAdded = !data2.timeAdded
            data2.time = new Date().getTime()
          } else if (index2 === rowIndex && data2.timeAdded) {
            data2.timeAdded = !data2.timeAdded
            data2.time = 0
          }
        })
      }
    })
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handleCardTitleChange = (cardIndex, e) => {
    const newScheduleCard = _.cloneDeep(scheduleCard)
    newScheduleCard.forEach((data, index) => {
      if (index === cardIndex) {
        data.cardName = e.target.value
      }
    })
    setScheduleCard([...newScheduleCard])
  }

  const handleOnKeyDown = (e, cardIndex) => {
    if (e.keyCode === 13) {
      setDisableButton(true)
      const newScheduleCard = _.cloneDeep(scheduleCard)
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          data.setName = !data.setName
        }
      })
      setScheduleCard([...newScheduleCard])
      handleSetSchedule(JSON.stringify(newScheduleCard))
    }
  }

  const handleClickTitle = cardIndex => {
    const newScheduleCard = _.cloneDeep(scheduleCard)
    newScheduleCard.forEach((data, index) => {
      if (index === cardIndex && data.setName) {
        data.setName = false
      }
    })
    setScheduleCard([...newScheduleCard])
  }

  const handlePersonGoUp = (cardIndex, rowIndex, rowData) => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    const clickedRowData = rowData
    if (rowIndex === 0) {
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          const arr = []
          arr.push({ ...clickedRowData, time: 0, timeAdded: false })
          for (let i = data.scheduleRow.length - 1; i > 0; i--) {
            if (!data.scheduleRow[i].timeAdded) {
              arr.unshift(data.scheduleRow[i])
            }
          }
          for (let i = 1; i < data.scheduleRow.length; i++) {
            if (data.scheduleRow[i].timeAdded) {
              arr.splice(i, 0, data.scheduleRow[i])
            }
          }
          data.scheduleRow = arr
        }
      })
    } else {
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          const timeAddedDesigner = []
          const arr = []
          for (let i = rowIndex - 1; i >= 0; i--) {
            if (data.scheduleRow[i].timeAdded) {
              timeAddedDesigner.push(data.scheduleRow[i])
            }
            if (timeAddedDesigner.length === rowIndex) {
              for (let i = rowIndex + 1; i <= data.scheduleRow.length - 1; i++) {
                if (!data.scheduleRow[i].timeAdded) {
                  arr.push(data.scheduleRow[i])
                }
              }
              arr.push({ ...clickedRowData })
              for (let i = 0; i < data.scheduleRow.length; i++) {
                if (data.scheduleRow[i].timeAdded) {
                  arr.splice(i, 0, data.scheduleRow[i])
                }
              }
              data.scheduleRow = arr
            } else {
              if (!data.scheduleRow[i].timeAdded) {
                data.scheduleRow[rowIndex] = data.scheduleRow[i]
                data.scheduleRow[i] = { ...clickedRowData, timeAdded: false }
                break
              }
            }
          }
        }
      })
    }
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handlePersonGoDown = (cardIndex, rowIndex, rowData) => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    const clickedRowData = rowData
    if (rowIndex === 0) {
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          for (let i = 1; i <= data.scheduleRow.length; i++) {
            if (!data.scheduleRow[i].timeAdded) {
              data.scheduleRow[rowIndex] = data.scheduleRow[i]
              data.scheduleRow[i] = {
                ...clickedRowData,
              }
              break
            }
          }
        }
      })
    } else if (
      rowIndex === newScheduleCard[cardIndex].scheduleRow.length - 1 &&
      newScheduleCard[cardIndex].scheduleRow.length - 1 !== 0
    ) {
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          const arr = []
          arr.push({
            ...clickedRowData,
          })
          for (let i = 0; i < newScheduleCard[cardIndex].scheduleRow.length - 1; i++) {
            if (!data.scheduleRow[i].timeAdded) {
              arr.push(newScheduleCard[cardIndex].scheduleRow[i])
            }
          }
          for (let i = 0; i < data.scheduleRow.length - 1; i++) {
            if (data.scheduleRow[i].timeAdded) {
              arr.splice(i, 0, data.scheduleRow[i])
            }
          }
          data.scheduleRow = arr
        }
      })
    } else {
      newScheduleCard.forEach((data, index) => {
        if (index === cardIndex) {
          const timeAddedDesigner = []
          const arr = []
          for (let i = rowIndex + 1; i < data.scheduleRow.length; i++) {
            if (data.scheduleRow[i].timeAdded) {
              timeAddedDesigner.push(data.scheduleRow[i])
            }
          }
          if (timeAddedDesigner.length + rowIndex === data.scheduleRow.length - 1) {
            for (let i = rowIndex - 1; i >= 0; i--) {
              if (!data.scheduleRow[i].timeAdded) {
                arr.unshift(data.scheduleRow[i])
              }
            }
            arr.unshift({ ...clickedRowData })
            for (let i = 0; i < data.scheduleRow.length; i++) {
              if (data.scheduleRow[i].timeAdded) {
                arr.splice(i, 0, data.scheduleRow[i])
              }
            }
            data.scheduleRow = arr
          } else {
            for (let i = rowIndex; i < data.scheduleRow.length - 1; i++) {
              if (i < data.scheduleRow.length) {
                if (!data.scheduleRow[i + 1].timeAdded) {
                  data.scheduleRow[rowIndex] = data.scheduleRow[i + 1]
                  data.scheduleRow[i + 1] = {
                    ...clickedRowData,
                  }
                  break
                }
              }
            }
          }
          // 優化前的code
          // for (let i = rowIndex; i < data.scheduleRow.length - 1; i++) {
          //   if (i < data.scheduleRow.length) {
          //     if (!data.scheduleRow[i + 1].timeAdded) {
          //       data.scheduleRow[rowIndex] = data.scheduleRow[i + 1]
          //       data.scheduleRow[i + 1] = {
          //         ...clickedRowData,
          //       }
          //       break
          //     }
          //   }
          // }
        }
      })
    }
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handleDeleteDesigner = (cardIndex, rowIndex) => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    newScheduleCard.forEach((data, index) => {
      if (index === cardIndex) {
        data.scheduleRow.forEach((data2, index2) => {
          if (rowIndex === 0 && data.scheduleRow.length === 1) {
            data.scheduleRow = [
              {
                timeAdded: false,
                designerId: '',
                time: 0,
              },
            ]
          } else if (rowIndex === index2) {
            data.scheduleRow.splice(index2, 1)
          }
        })
      }
    })
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handlePersonGoBottom = (cardIndex, rowIndex, rowData) => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    const clickedRowData = rowData
    newScheduleCard.forEach((data, index) => {
      if (index === cardIndex) {
        const arr = []
        if (
          !data.scheduleRow[data.scheduleRow.length - 1].timeAdded &&
          rowIndex !== data.scheduleRow.length - 1
        ) {
          clickedRowData.time = new Date().getTime()
          arr.push({ ...clickedRowData })

          for (let i = data.scheduleRow.length - 1; i >= 0; i--) {
            if (i !== rowIndex) {
              if (!data.scheduleRow[i].timeAdded) {
                arr.unshift(data.scheduleRow[i])
                // if (data.scheduleRow[i].time != 0 && rowIndex != cardIndex.length - 1) {
                //   data.scheduleRow[i].time = 0
                // }
              }
            }
          }
          for (let i = 0; i < data.scheduleRow.length - 1; i++) {
            if (data.scheduleRow[i].timeAdded) {
              arr.splice(i, 0, data.scheduleRow[i])
            }
          }
          data.scheduleRow = arr
        } else if (rowIndex !== data.scheduleRow.length - 1) {
          clickedRowData.time = new Date().getTime()
          arr.push({ ...clickedRowData })

          for (let i = data.scheduleRow.length - 1; i >= 0; i--) {
            if (i !== rowIndex) {
              if (!data.scheduleRow[i].timeAdded) {
                arr.unshift(data.scheduleRow[i])
                // if (data.scheduleRow[i].time != 0 && rowIndex != cardIndex.length - 1) {
                //   data.scheduleRow[i].time = 0
                // }
              }
            }
          }
          for (let i = 0; i < data.scheduleRow.length - 1; i++) {
            if (data.scheduleRow[i].timeAdded) {
              arr.splice(i, 0, data.scheduleRow[i])
            }
          }
          const lastData = data.scheduleRow[data.scheduleRow.length - 1]
          data.scheduleRow = [...arr, lastData]
        } else {
          if (
            !data.scheduleRow[data.scheduleRow.length - 1].timeAddd &&
            data.scheduleRow[data.scheduleRow.length - 1].time === 0
          ) {
            data.scheduleRow[data.scheduleRow.length - 1].time = new Date().getTime()
            data.scheduleRow[data.scheduleRow.length - 1].timeAdd = true
          }
        }
      }
    })
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handleOpenModal = cardIndex => {
    setOpenAddDesignerModal(true)
    setModalCardIndex(cardIndex)
  }
  return (
    scheduleCard.map((data, cardIndex) => (
      <div key={cardIndex} className='ScheduleCard'>
        <Card className="flex w-[332px] flex-col">
          <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
            {!data.setName ? (
              <FormControl variant="standard" fullWidth>
                <OutlinedInput
                  placeholder="排版標題"
                  value={data.cardName}
                  disabled={disableButton}
                  onChange={e => handleCardTitleChange(cardIndex, e)}
                  onKeyDown={e => handleOnKeyDown(e, cardIndex)}
                />
                <MyFormHelperText />
              </FormControl>
            ) : (
              <h3 className="m-0 min-w-0 max-w-[220px] truncate text-heading text-text">
                {data.cardName || '未命名班表'}
              </h3>
            )}

            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-secondary"
                aria-label="編輯班表名稱"
                disabled={disableButton}
                onClick={() => handleClickTitle(cardIndex)}
              >
                <Pencil strokeWidth={1.75} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-secondary hover:text-danger"
                aria-label="刪除班表"
                disabled={disableButton}
                onClick={() => handleClickOpen(cardIndex)}
              >
                <X strokeWidth={1.75} />
              </Button>
            </div>
          </div>
          {!employeeScheduleData.loading && progress < 100 ? (
            <Fragment>
              <div className="mx-5 h-px bg-border" />
              {data.scheduleRow.map((eachRow, rowIndex) => {
                if (eachRow !== null) {
                  return (
                    <Fragment key={`${rowIndex}-${eachRow.designerId}`}>
                      <div className="flex min-h-[48px] items-center gap-2 px-4 py-2 hover:bg-surface-hover">
                        {eachRow.designerId !== '' && (
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Checkbox
                              aria-label="標記時間"
                              checked={eachRow.timeAdded}
                              onChange={() => handleAddTime(cardIndex, rowIndex)}
                              disabled={disableButton}
                            />
                            <span className="truncate text-body font-medium text-text">
                              {users.find(u => u.id === eachRow.designerId)?.nickName ||
                                users.find(u => u.id === eachRow.designerId)?.name || ''}
                              <span className="ml-1 text-caption text-text-tertiary">
                                {users.find(u => u.id === eachRow.designerId)?.designerNo || ''}
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-1">
                          {eachRow.designerId !== '' &&
                            data.scheduleRow.length > 1 &&
                            !eachRow.timeAdded && (
                              <div className="flex gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="上移"
                                  disabled={disableButton}
                                  onClick={() => handlePersonGoUp(cardIndex, rowIndex, eachRow)}
                                >
                                  <ArrowUp strokeWidth={1.75} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="下移"
                                  disabled={disableButton}
                                  onClick={() => handlePersonGoDown(cardIndex, rowIndex, eachRow)}
                                >
                                  <ArrowDown strokeWidth={1.75} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="移到最後"
                                  disabled={disableButton}
                                  onClick={() => handlePersonGoBottom(cardIndex, rowIndex, eachRow)}
                                >
                                  <ChevronsDown strokeWidth={1.75} />
                                </Button>
                              </div>
                            )}
                          {eachRow.time != 0 ? (
                            <div className="ml-1 min-w-[60px] text-right tabular-nums">
                              <span className="block text-caption text-text-tertiary">
                                {format(eachRow.time, 'MM/dd')}
                              </span>
                              <span className="block text-caption font-medium text-text-secondary">
                                {format(eachRow.time, 'H:mm')}
                              </span>
                            </div>
                          ) : null}
                          {eachRow.designerId !== '' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-8 w-8 hover:text-danger"
                              aria-label="移除人員"
                              disabled={disableButton}
                              onClick={() => handleDeleteDesigner(cardIndex, rowIndex)}
                            >
                              <Trash2 strokeWidth={1.75} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {eachRow.designerId !== '' && <div className="mx-5 h-px bg-border" />}
                    </Fragment>
                  )
                }
              })}
            </Fragment>
          ) : (
            <div className="px-5 py-3" aria-busy="true" aria-label="載入中">
              <Skeleton className="h-8 w-full" />
            </div>
          )
          }
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-accent"
              disabled={disableButton}
              onClick={() => handleOpenModal(cardIndex)}
            >
              <UserPlus strokeWidth={1.75} />
              新增人員
            </Button>
          </div>
        </Card>
      </div>
    ))
  )
}
ScheduleCard.propTypes = {
  sx: PropTypes.string,
}
