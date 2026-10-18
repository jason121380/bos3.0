/** @jsxImportSource @emotion/react */
import {
  Grid,
  Checkbox,
  Typography,
  Paper,
  IconButton,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  Tooltip,
  ListItemText,
  FormHelperText,
  FormControl,
  OutlinedInput,
  Box
} from '@mui/material'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded'
import { tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { useFormControl } from '@mui/material/FormControl'
import { useState, Fragment, useMemo } from 'react'
import _ from 'lodash'
import { format } from 'date-fns'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ListItemIcon from '@mui/material/ListItemIcon'
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded'
import CancelRoundedIcon from '@mui/icons-material/CloseRounded'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: '0px !important',
    paddingBottom: theme.spacing(3),
    '& .MuiListItemSecondaryAction-root': {
      position: 'relative',
      transform: 'none',
      flexGrow: 1,
      justifyContent: 'flex-end',
      right: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }
  }),
  card: css({
    borderRadius: '16px',
    minWidth: '332px',
    width: 322,
    position: 'relative',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.03)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.08)',
    }
  }),
  closeButton: css({
    position: 'absolute',
    top: '-15px',
    right: '-15px',
    zIndex: 10,
    backgroundColor: '#202D50 !important',
    color: 'white !important',
    width: '32px',
    height: '32px',
    padding: '0px',
    '&:hover': {
      backgroundColor: '#1a2540 !important',
      transform: 'scale(1.1)',
    }
  }),
  headerSection: css({
    padding: '24px 20px 16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  titleText: css({
    fontSize: '20px',
    fontWeight: '800',
    color: 'rgb(var(--text))',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '220px',
  }),
  rowItem: css({
    padding: '12px 16px !important',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.01)',
    }
  }),
  actionIcons: css({
    color: 'rgb(var(--text))',
    fontSize: '18px !important',
  }),
  addPersonnelBtn: css({
    marginTop: '8px',
    padding: '16px 20px !important',
    color: 'rgb(var(--accent)) !important',
    fontWeight: '700 !important',
    '& .MuiListItemIcon-root': {
      minWidth: '36px',
      color: 'rgb(var(--accent))',
    }
  }),
  checkbox: css({
    color: 'rgb(var(--accent)) !important',
    '&.Mui-checked': {
      color: 'rgb(var(--accent)) !important',
    }
  })
}

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

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))
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
      <Grid item key={cardIndex} css={styles.root} className='ScheduleCard'>
        <Paper elevation={0} css={styles.card}>
          <IconButton
            disabled={disableButton}
            onClick={() => handleClickOpen(cardIndex)}
            css={styles.closeButton}
            size="small"
          >
            <CancelRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <List disablePadding>
            <Box css={styles.headerSection}>
              {!data.setName ? (
                <FormControl variant="standard" fullWidth>
                  <OutlinedInput
                    placeholder="排版標題"
                    value={data.cardName}
                    disabled={disableButton}
                    onChange={e => handleCardTitleChange(cardIndex, e)}
                    onKeyDown={e => handleOnKeyDown(e, cardIndex)}
                    sx={{ borderRadius: '8px' }}
                  />
                  <MyFormHelperText />
                </FormControl>
              ) : (
                <Typography css={styles.titleText}>
                  {data.cardName || '未命名班表'}
                </Typography>
              )}

              <IconButton
                disabled={disableButton}
                onClick={() => handleClickTitle(cardIndex)}
                size="small"
              >
                <ModeEditOutlineRoundedIcon sx={{ fontSize: 18, color: 'rgb(var(--text-tertiary))' }} />
              </IconButton>
            </Box>
            {!employeeScheduleData.loading && progress < 100 ? (
              <Fragment>
                <Divider variant="middle" />
                {data.scheduleRow.map((eachRow, rowIndex) => {
                  if (eachRow !== null) {
                    return (
                      <Fragment key={`${rowIndex}-${eachRow.designerId}`}>
                        <ListItem
                          css={styles.rowItem}
                          disablePadding
                          secondaryAction={
                            <Fragment>
                              {eachRow.designerId !== '' &&
                                data.scheduleRow.length > 1 &&
                                !eachRow.timeAdded && (
                                  <Box sx={{ display: 'flex', gap: '2px' }}>
                                    <IconButton
                                      disabled={disableButton}
                                      onClick={() => handlePersonGoUp(cardIndex, rowIndex, eachRow)}
                                      size="small"
                                    >
                                      <ArrowUpwardIcon css={styles.actionIcons} />
                                    </IconButton>
                                    <IconButton
                                      disabled={disableButton}
                                      onClick={() => handlePersonGoDown(cardIndex, rowIndex, eachRow)}
                                      size="small"
                                    >
                                      <ArrowDownwardIcon css={styles.actionIcons} />
                                    </IconButton>
                                    <IconButton
                                      disabled={disableButton}
                                      onClick={() => handlePersonGoBottom(cardIndex, rowIndex, eachRow)}
                                      size="small"
                                    >
                                      <KeyboardDoubleArrowDownRoundedIcon css={styles.actionIcons} />
                                    </IconButton>
                                  </Box>
                                )}
                              {eachRow.time != 0 ? (
                                <Box sx={{ minWidth: '60px', ml: 1, textAlign: 'right' }}>
                                  <Typography variant="caption" sx={{ display: 'block', color: 'rgb(var(--text-tertiary))', lineHeight: 1.2 }}>
                                    {format(eachRow.time, 'MM/dd')}
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', color: 'rgb(var(--text-secondary))', fontWeight: 'bold' }}>
                                    {format(eachRow.time, 'H:mm')}
                                  </Typography>
                                </Box>
                              ) : null}
                              {eachRow.designerId !== '' && (
                                <IconButton
                                  disabled={disableButton}
                                  onClick={() => handleDeleteDesigner(cardIndex, rowIndex)}
                                  size="small"
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteForeverIcon css={styles.actionIcons} />
                                </IconButton>
                              )}
                            </Fragment>
                          }
                        >
                          {eachRow.designerId !== '' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                              <Checkbox
                                checked={eachRow.timeAdded}
                                onChange={() => handleAddTime(cardIndex, rowIndex)}
                                disabled={disableButton}
                                css={styles.checkbox}
                                size="small"
                              />
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ color: 'rgb(var(--text))', fontWeight: 500, fontSize: '15px' }}
                              >
                                {users.find(u => u.id === eachRow.designerId)?.nickName ||
                                  users.find(u => u.id === eachRow.designerId)?.name || ''}
                                <span style={{ color: '#999', marginLeft: '4px', fontSize: '12px' }}>
                                  {users.find(u => u.id === eachRow.designerId)?.designerNo || ''}
                                </span>
                              </Typography>
                            </Box>
                          )}
                        </ListItem>
                        {eachRow.designerId !== '' && <Divider variant="middle" sx={{ opacity: 0.6 }} />}
                      </Fragment>
                    )
                  }
                })}
              </Fragment>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <LinearProgress />
              </div>
            )
            }
            <ListItemButton
              disabled={disableButton}
              onClick={() => handleOpenModal(cardIndex)}
              css={styles.addPersonnelBtn}
            >
              <ListItemIcon>
                <PersonAddRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="新增人員" />
            </ListItemButton>
          </List>
        </Paper>
      </Grid>
    ))
  )
}
ScheduleCard.propTypes = {
  sx: PropTypes.string,
}
