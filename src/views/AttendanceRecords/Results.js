/** @jsxImportSource @emotion/react */
import {
  TablePagination, TableRow, TableContainer, Table, TableHead, TableBody, TableCell,
  Typography, Dialog, DialogTitle, DialogContent, DialogContentText, TextField,
  DialogActions, IconButton, Card, CardHeader, CardContent, Drawer, Paper, Grid, Link,
  Divider
} from '@mui/material'
import { Button } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import DesktopWindows from '@mui/icons-material/DesktopWindowsRounded';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { format, setHours, setMinutes } from 'date-fns'
import PropTypes from 'prop-types'
import { Fragment, useState } from 'react'
import useFetchDeleteAttendantRecord from 'hooks/useFetchDeleteAttendantRecord'
import useFetchUpdateAttendantRecord from 'hooks/useFetchUpdateAttendantRecord'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid #eeeeee',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
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
    color: 'red !important',
    fontWeight: 'bold',
    transition: '.2s',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    "&:hover": {
      background: '#add8e675',
    }
  }),
  colorRedSticky: css({
    color: 'red',
    fontWeight: 'bold',
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid #eeeeee',
  }),
  colorRedLinkLate: css({
    color: 'red !important',
    fontWeight: 'bold',
    textDecoration: 'underline',
  }),
  colorRedLink: css({
    textDecoration: 'underline',
  }),
  span: css({
    marginRight: '10px',
    cursor: 'pointer',
    transition: '.2s',
    display: 'flex',
    alignItems: 'center',
    "&:hover": {
      background: '#add8e675',
    }
  }),
  content: css({
    flexGrow: 1,
    padding: theme.spacing(3),
    overflow: "auto"
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
  }),
}

export default function Results({
  attendanceRecords,
  handleSearch,
  year,
  displayDate,
  identity,
}) {
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [delBtn, setDelBtn] = useState(false)
  const [editBtn, setEditBtn] = useState(false)
  const [googleMapUrl, setGoogleMapUrl] = useState('')
  const [showSelectDate, setShowSelectDate] = useState('')
  const { deleteAttendantRecord } = useFetchDeleteAttendantRecord()
  const { updateAttendantRecord } = useFetchUpdateAttendantRecord()
  const [editData, setEditData] = useState({
    uuid: '',
    date: '',
    clockInType: ''
  })

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

  const handleChangeTime = time => {
    const [hh, mm] = time.split(':')
    let editTime = editData.date
    editTime = setHours(new Date(editTime), hh).getTime()
    editTime = setMinutes(new Date(editTime), mm).getTime()
    setEditData({ ...editData, date: editTime })
  }

  const handleSubmit = () => {
    setEditBtn(true)
    updateAttendantRecord({
      input: {
        uuid: editData.uuid,
        date: editData.date,
      }
    }).then(res => {
      if (res.data.updateAttendantRecord) {
        openSnackbar({ message: '修改成功', variant: 'success' })
        handleSearch()
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setEditBtn(false)
    })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleCloseDrawer = () => {
    setEditData({
      uuid: '',
      date: '',
      clockInType: ''
    })
    setGoogleMapUrl('')
    setOpen(false)
  }

  const findClockInType = type => {
    switch (type) {
      case 'start':
        return "上班"
      case 'end':
        return "下班"
      case 'breakStart':
        return "外出"
      case 'breakEnd':
        return "歸回"
      default:
        return ""
    }
  }

  const handleSetEditData = (time, type) => {

    if (identity.edit || identity.delete || (time.latitude !== null && time.longitude !== null)) {
      if (time.latitude !== null && time.longitude !== null && time.checkinType !== 'QRCODE') {
        setGoogleMapUrl(`https://www.google.com/maps?q=${time.latitude},${time.longitude}`)
      }
      const data = {
        uuid: time.uuid,
        date: time.time,
        clockInType: type,
      }
      setShowSelectDate(time.time)
      setEditData(data)
      setOpen(true)
    }
  }

  const handleDeleteRecord = () => {
    setDelBtn(true)
    deleteAttendantRecord(editData.uuid).then(res => {
      if (res.data.deleteAttendantRecord) {
        openSnackbar({ message: '刪除成功', variant: 'success' })
        handleSearch()
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setDelBtn(false)
    })
  }

  const getClockInTime = (time, late, firstItem) => {
    if (time === null || time.uuid === null) return
    if (time.isLine) {
      return (
        <div onClick={() => handleSetEditData(time, 'start')} key={`clickin-${time.uuid}`} css={(late && firstItem) ? styles.colorRed : styles.cursor}>
          <span css="lineicon"></span>
          上
          <a style={{ color: color(time.distanceValue) }} css={(late && firstItem) ? styles.colorRedLinkLate : styles.colorRedLink}>
            {format(time.time, 'HH:mm')}
          </a>
        </div>
      )
    } else if (time.checkinType === 'CELLPHONE' || (time.checkinType === null && time.latitude !== null && time.longitude !== null)) {
      return (
        <div key={`clickin-${time.uuid}`} onClick={() => handleSetEditData(time, 'start')} css={(late && firstItem) ? styles.colorRed : styles.cursor}>
          <PhoneIphoneIcon style={{ color: 'black', fontSize: '17px' }} />
          上
          {time.latitude !== null && time.longitude !== null ? (
            <a style={{ color: color(time.distanceValue) }} css={(late && firstItem) ? styles.colorRedLinkLate : styles.colorRedLink}>
              {format(time.time, 'HH:mm')}
            </a>
          ) : (
            <span style={{ color: '#959595' }}>{format(time.time, 'HH:mm')}</span>
          )}
        </div>
      )
    } else if (time.checkinType === 'COMPUTER' || time.checkinType === null) {
      return (
        <div key={`clickin-${time.uuid}`} onClick={() => handleSetEditData(time, 'start')} css={(late && firstItem) ? styles.colorRed : styles.cursor}>
          <DesktopWindows style={{ color: 'black', fontSize: '17px' }} />
          上{format(time.time, 'HH:mm')}
        </div>
      )
    } else if (time.checkinType === 'QRCODE' || time.checkinType === null) {
      return (
        <div key={`clickin-${time.uuid}`} onClick={() => handleSetEditData(time, 'start')} css={(late && firstItem) ? styles.colorRed : styles.cursor}>
          <QrCodeIcon style={{ color: 'black', fontSize: '17px' }} />
          上{format(time.time, 'HH:mm')}
        </div>
      )
    } else if (time.checkinType === 'ADMIN') {
      return (
        <div key={`clickin-${time.uuid}`} onClick={() => handleSetEditData(time, 'start')} css={(late && firstItem) ? styles.colorRed : styles.cursor}>
          <ManageAccountsRoundedIcon style={{ color: 'black', fontSize: '17px' }} />
          上{format(time.time, 'HH:mm')}
        </div>
      )
    }
  }

  const getClockOutTime = (time, late, lastItem) => {
    if (time === null || time.uuid === null) return
    if (time !== null) {
      if (time.isLine) {
        return (
          <div key={`clickout-${time.uuid}`} onClick={() => handleSetEditData(time, 'end')} css={(late && lastItem) ? styles.colorRed : styles.cursor}>
            <span className="lineicon"></span>
            下
            <a style={{ color: color(time.distanceValue) }} css={(late && lastItem) ? styles.colorRedLinkLate : styles.colorRedLink}>
              {format(time.time, 'HH:mm')}
            </a>
          </div>
        )
      } else if (time.checkinType === 'CELLPHONE' || (time.checkinType === null && time.latitude !== null && time.longitude !== null)) {
        return (
          <div key={`clickout-${time.uuid}`} onClick={() => handleSetEditData(time, 'end')} css={(late && lastItem) ? styles.colorRed : styles.cursor}>
            <PhoneIphoneIcon style={{ color: 'black', fontSize: '17px' }} />
            下
            {time.latitude !== null && time.longitude !== null ? (
              <a style={{ color: color(time.distanceValue) }} css={(late && lastItem) ? styles.colorRedLinkLate : styles.colorRedLink}>
                {format(time.time, 'HH:mm')}
              </a>
            ) : (
              <span style={{ color: '#959595' }}>{format(time.time, 'HH:mm')}</span>
            )}
          </div>
        )
      } else if (time.checkinType === 'COMPUTER' || time.checkinType === null) {
        return (
          <div key={`clickout-${time.uuid}`} onClick={() => handleSetEditData(time, 'end')} css={(late && lastItem) ? styles.colorRed : styles.cursor}>
            <DesktopWindows style={{ color: 'black', fontSize: '17px' }} />
            下{format(time.time, 'HH:mm')}{' '}
          </div>
        )
      } else if (time.checkinType === 'QRCODE' || time.checkinType === null) {
        return (
          <div key={`clickout-${time.uuid}`} onClick={() => handleSetEditData(time, 'end')} css={(late && lastItem) ? styles.colorRed : styles.cursor}>
            <QrCodeIcon style={{ color: 'black', fontSize: '17px' }} />
            下{format(time.time, 'HH:mm')}{' '}
          </div>
        )
      } else if (time.checkinType === 'ADMIN') {
        return (
          <div key={`clickout-${time.uuid}`} onClick={() => handleSetEditData(time, 'end')} css={(late && lastItem) ? styles.colorRed : styles.cursor}>
            <ManageAccountsRoundedIcon style={{ color: 'black', fontSize: '17px' }} />
            下{format(time.time, 'HH:mm')}{' '}
          </div>
        )
      }
    }
  }

  const getBreakTime = (time, index) => {
    const breakOut = start => {
      if (start === null || start.uuid === null) return
      if (start.isLine) {
        return (
          <span key={`breakOut-${start.uuid}`} onClick={() => handleSetEditData(start, 'breakStart')} css={styles.span}>
            <span className="lineicon"></span>
            外
            <a style={{ color: color(start.distanceValue) }} css={styles.colorRedLink}>
              {format(start.time, 'HH:mm')}
            </a>
          </span>
        )
      } else if (start.checkinType === 'CELLPHONE' || (start.checkinType === null && start.latitude !== null && start.longitude !== null)) {
        return (
          <span key={`breakOut-${start.uuid}`} onClick={() => handleSetEditData(start, 'breakStart')} css={styles.span}>
            <PhoneIphoneIcon style={{ color: 'black', fontSize: '17px' }} />
            外
            {start.latitude !== null && start.longitude !== null ? (
              <a style={{ color: color(start.distanceValue) }} css={styles.colorRedLink}>
                {format(start.time, 'HH:mm')}
              </a>
            ) : (
              <span style={{ color: '#959595' }}>{format(start.time, 'HH:mm')}</span>
            )}
          </span>
        )
      } else if (start.checkinType === 'COMPUTER' || start.checkinType === null) {
        return (
          <span key={`breakOut-${start.uuid}`} onClick={() => handleSetEditData(start, 'breakStart')} css={styles.span}>
            <DesktopWindows style={{ color: 'black', fontSize: '17px' }} />
            外{format(start.time, 'HH:mm')}
          </span>
        )
      } else if (start.checkinType === 'QRCODE' || start.checkinType === null) {
        return (
          <span key={`breakOut-${start.uuid}`} onClick={() => handleSetEditData(start, 'breakStart')} css={styles.span}>
            <QrCodeIcon style={{ color: 'black', fontSize: '17px' }} />
            外{format(start.time, 'HH:mm')}
          </span>
        )
      } else if (start.checkinType === 'ADMIN') {
        return (
          <span key={`breakOut-${start.uuid}`} onClick={() => handleSetEditData(start, 'breakStart')} css={styles.span}>
            <ManageAccountsRoundedIcon style={{ color: 'black', fontSize: '17px' }} />
            外{format(start.time, 'HH:mm')}
          </span>
        )
      }
    }

    const breakBack = end => {
      if (end === null || end.uuid === null) return
      if (end !== null) {
        if (end.isLine) {
          return (
            <span css={styles.span} key={`breakBack-${end.uuid}`} onClick={() => handleSetEditData(end, 'breakEnd')}>
              <span className="lineicon"></span>
              回
              <a style={{ color: color(end.distanceValue) }} css={styles.colorRedLink}>
                {format(end.time, 'HH:mm')}
              </a>
            </span>
          )
        } else if (end.checkinType === 'CELLPHONE' || (end.checkinType === null && end.latitude !== null && end.longitude !== null)) {
          return (
            <span css={styles.span} key={`breakBack-${end.uuid}`} onClick={() => handleSetEditData(end, 'breakEnd')}>
              <PhoneIphoneIcon style={{ color: 'black', fontSize: '17px' }} />
              回
              {end.latitude !== null && end.longitude !== null ? (
                <a style={{ color: color(end.distanceValue) }} css={styles.colorRedLink}>
                  {format(end.time, 'HH:mm')}
                </a>
              ) : (
                <span style={{ color: '#959595' }}>{format(end.time, 'HH:mm')}</span>
              )}
            </span>
          )
        } else if (end.checkinType === 'COMPUTER' || end.checkinType === null) {
          return (
            <span css={styles.span} key={`breakBack-${end.uuid}`} onClick={() => handleSetEditData(end, 'breakEnd')}>
              <DesktopWindows style={{ color: 'black', fontSize: '17px' }} />
              回{format(end.time, 'HH:mm')}
            </span>
          )
        } else if (end.checkinType === 'QRCODE' || end.checkinType === null) {
          return (
            <span css={styles.span} key={`breakBack-${end.uuid}`} onClick={() => handleSetEditData(end, 'breakEnd')}>
              <QrCodeIcon style={{ color: 'black', fontSize: '17px' }} />
              回{format(end.time, 'HH:mm')}
            </span>
          )
        } else if (end.checkinType === 'ADMIN') {
          return (
            <span css={styles.span} key={`breakBack-${end.uuid}`} onClick={() => handleSetEditData(end, 'breakEnd')}>
              <ManageAccountsRoundedIcon style={{ color: 'black', fontSize: '17px' }} />
              回{format(end.time, 'HH:mm')}
            </span>
          )
        }
      }
    }
    return (
      <div key={`break-${index}`} style={{ display: 'flex' }}>
        {breakOut(time.start)}
        {breakBack(time.end)}
      </div>
    )
  }

  const renderDivider = (clockIn, clockInIndex) => {
    if (clockInIndex > 0) {
      let intime = false
      let outTime = false
      let breakTime = false
      if (clockIn.in !== null && clockIn.in.time !== null) {
        intime = true
      }
      if (clockIn.out !== null && clockIn.out.time !== null) {
        outTime = true
      }
      if (clockIn.breakRecord.length > 0) {
        const checkArr = clockIn.breakRecord.map(d => {
          return (d.start !== null && d.start.time !== null) || (d.end !== null && d.end.time !== null)
        })
        breakTime = checkArr[0]
      }
      if (intime || outTime || breakTime) {
        return <Divider style={{ margin: '3px 0' }} />
      }
    }
  }
  return (
    <Card css={styles.root}>
      <CardHeader
        css={styles.cardHeader}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>全店打卡記錄列表</span>
            <Typography color="textSecondary" variant="body2">
              共 {attendanceRecords.length} 筆
            </Typography>
          </div>
        }
      />
      <CardContent style={{ padding: 0 }}>
        <TableContainer style={{ maxHeight: 'calc(100vh - 430px)' }} component={Paper} className="AttendanceRecordsTable">
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow css={styles.stickyRow}>
                <TableCell css={styles.sticky}>{year}年</TableCell>
                <TableCell>總打卡天數</TableCell>
                <TableCell>曠職天數</TableCell>
                <TableCell>總遲到分鐘數</TableCell>
                {displayDate.map((date, index) => (
                  <TableCell key={`TableCell-${index}`} style={{ whiteSpace: 'nowrap', paddingRight: '100px' }}>{date}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.map((data, index) => {
                return (
                  <TableRow key={`TableRow-${index}`} css={styles.tableRow}>
                    <TableCell css={styles.sticky}>{data.userName}</TableCell>
                    {/* 計算總打卡天數 */}
                    <TableCell css={data.totalClockInDays < 22 ? styles.colorRed : {}}>{data.totalClockInDays + ` 天`}</TableCell>
                    <TableCell>{data.absenteeismDays}</TableCell>
                    <TableCell>{data.totalLateMinutes}</TableCell>
                    {displayDate.map(d => {
                      return data.attendanceRecord.map((record, index) => {
                        if (format(record.date, 'MM/dd') === d.substring(0, 5)) {
                          if (record.clockInRecord.length > 0) {
                            return (
                              <TableCell key={index}>
                                {record.clockInRecord.map((clockIn, clockInIndex) => {
                                  return (
                                    <Fragment key={clockInIndex}>
                                      {renderDivider(clockIn, clockInIndex)}
                                      {/* {clockInIndex === 0 ? '' : <Divider />} */}
                                      {getClockInTime(clockIn.in, record.isLate, clockInIndex === 0)}
                                      {clockIn.breakRecord.length > 0 &&
                                        clockIn.breakRecord.map((br, index) => {
                                          return getBreakTime(br, index)
                                        })}
                                      {getClockOutTime(
                                        clockIn.out,
                                        record.isLeaveEarly,
                                        record.clockInRecord.length - 1 === clockInIndex
                                      )}
                                    </Fragment>
                                  )
                                })}
                              </TableCell>
                            )
                          } else {
                            return <TableCell key={index}></TableCell>
                          }
                        }
                      })
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Drawer anchor='bottom' open={open} onClose={handleCloseDrawer}>
        <Grid direction='column' justifyContent='center' alignItems="center" container style={{ padding: '16px', rowGap: '40px' }}>
          <Grid item direction='row' justifyContent='center' alignItems="center" container>
            <Typography variant="h4" component="h4">已選取打卡記錄:  {showSelectDate && `${format(showSelectDate, 'yyyy/MM/dd  HH:mm')} - ${findClockInType(editData.clockInType)}`}</Typography>
            {googleMapUrl !== '' && (
              <Link href={googleMapUrl} target="_blank">
                <Button style={{ marginLeft: '30px' }} variant="contained" color='primary' size='small'>
                  <LocationOnIcon style={{ width: '16px' }} />查看位置
                </Button>
              </Link>
            )}
          </Grid>
          <Grid item style={{ columnGap: '80px' }} container justifyContent='center'>
            {identity.edit && <Button onClick={() => setOpenModal(true)} variant='contained' color='primary'>編輯</Button>}
            {identity.delete && <Button variant='contained' style={{ background: 'red' }} disabled={delBtn} onClick={handleDeleteRecord}>刪除</Button>}
          </Grid>
        </Grid>
      </Drawer>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle style={{ paddingBottom: 0 }}>編輯打卡記錄</DialogTitle>
        <DialogContent style={{ overflow: 'visible', display: 'flex' }} >
          <div style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" gutterBottom component="div">
              已選取打卡記錄:  {showSelectDate && `${format(showSelectDate, 'yyyy/MM/dd  HH:mm')} - ${findClockInType(editData.clockInType)}`}
            </Typography>
            <TextField margin="normal" value={!!editData.date && format(new Date(editData.date), 'HH:mm')} label='選取時間' variant='outlined'
              fullWidth type='time' onChange={event => handleChangeTime(event.target.value)} ></TextField>
          </div>
        </DialogContent>
        <DialogActions style={{ margin: '10px' }}>
          <Button color='inherit' onClick={handleCloseModal} variant="contained" style={{ marginRight: '10px' }}>
            取消
          </Button>
          <Button
            variant="contained"
            color='primary'
            onClick={handleSubmit}
            disabled={editBtn}
          >
            確認
          </Button>

        </DialogActions>
      </Dialog>
    </Card>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
