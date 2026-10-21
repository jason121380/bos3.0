// 保留相容層：Drawer（底部操作面板，ui 無對應元件）、編輯彈窗（由 Drawer 內開啟，換 Radix Dialog 會與 Drawer 的焦點鎖互搶）；
// 打卡時間格內的分隔線改 Tailwind
import { Drawer } from 'ui/overlay-compat'
import { Dialog, DialogTitle, DialogContent, DialogActions } from 'ui/modal-compat'
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { LocationOn as LocationOnIcon, ManageAccountsRounded as ManageAccountsRoundedIcon, DesktopWindowsRounded as DesktopWindows, PhoneIphone as PhoneIphoneIcon, QrCode as QrCodeIcon } from 'ui/icons'
import { format, setHours, setMinutes } from 'date-fns'
import PropTypes from 'prop-types'
import { Fragment, useState } from 'react'
import useFetchDeleteAttendantRecord from 'hooks/useFetchDeleteAttendantRecord'
import useFetchUpdateAttendantRecord from 'hooks/useFetchUpdateAttendantRecord'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'
import { focusRing } from 'ui/utils'

// 打卡項目樣式（原 emotion styles 等值轉 Tailwind）
const clockInItemClass = 'flex items-center gap-[4px] py-[2px] px-[4px] rounded-[4px] hover:!bg-transparent'
const colorRedClass = '!text-[color:red] font-bold flex items-center hover:!bg-transparent'
const colorRedLinkLateClass = '!text-[color:red] font-bold no-underline'

export default function Results({
  attendanceRecords,
  handleSearch,
  year,
  displayDate,
  identity,
  typeDisplay,
  setTypeDisplay,
  handleHRExport,
  handleExport,
  exportLoading,
  exportHRLoading,
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
        return 'rgb(var(--warning))'
      case 'MORETHAN50':
        return 'rgb(var(--danger))'
      default:
        return 'rgb(var(--text))'
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
    // 編輯／刪除成功後按鈕維持 disabled；關閉面板時一併重置，下一筆打卡的操作才不會被鎖住（Codex review PR #255）
    setEditBtn(false)
    setDelBtn(false)
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

  // 打卡格點開操作面板（看定位、編輯、刪除）：有編輯／刪除權限，或這筆打卡有定位時才可點，條件同 handleSetEditData。
  // 2026/02 改版（deee739）時點擊被拿掉、面板無從開啟，2026/10/21 Jason 同意恢復；改用 role=button 讓鍵盤也能開
  const recordProps = (time, type, className) => {
    if (!(identity.edit || identity.delete || (time.latitude !== null && time.longitude !== null))) return { className }
    return {
      className: `${className} cursor-pointer hover:underline ${focusRing}`,
      role: 'button',
      tabIndex: 0,
      onClick: () => handleSetEditData(time, type),
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSetEditData(time, type)
        }
      },
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
        <div key={`clickin-${time.uuid}`} {...recordProps(time, 'start', (late && firstItem) ? colorRedClass : clockInItemClass)}>
          <span></span>
          <span>上</span>
          <a style={{ color: color(time.distanceValue) }} className={(late && firstItem) ? colorRedLinkLateClass : 'no-underline'}>
            {format(time.time, 'HH:mm')}
          </a>
        </div>
      )
    } else if (time.checkinType === 'CELLPHONE' || (time.checkinType === null && time.latitude !== null && time.longitude !== null)) {
      return (
        <div key={`clickin-${time.uuid}`} {...recordProps(time, 'start', (late && firstItem) ? colorRedClass : clockInItemClass)}>
          <PhoneIphoneIcon className="!text-[14px] shrink-0" />
          <span>上</span>
          {time.latitude !== null && time.longitude !== null ? (
            <a style={{ color: color(time.distanceValue) }} className={(late && firstItem) ? colorRedLinkLateClass : 'no-underline'}>
              {format(time.time, 'HH:mm')}
            </a>
          ) : (
            <span style={{ color: 'rgb(var(--text-tertiary))' }}>{format(time.time, 'HH:mm')}</span>
          )}
        </div>
      )
    } else if (time.checkinType === 'COMPUTER' || time.checkinType === null) {
      return (
        <div key={`clickin-${time.uuid}`} {...recordProps(time, 'start', (late && firstItem) ? colorRedClass : clockInItemClass)}>
          <DesktopWindows className="!text-[14px] shrink-0" />
          <span>上{format(time.time, 'HH:mm')}</span>
        </div>
      )
    } else if (time.checkinType === 'QRCODE' || time.checkinType === null) {
      return (
        <div key={`clickin-${time.uuid}`} {...recordProps(time, 'start', (late && firstItem) ? colorRedClass : clockInItemClass)}>
          <QrCodeIcon className="!text-[14px] shrink-0" />
          <span>上{format(time.time, 'HH:mm')}</span>
        </div>
      )
    } else if (time.checkinType === 'ADMIN') {
      return (
        <div key={`clickin-${time.uuid}`} {...recordProps(time, 'start', (late && firstItem) ? colorRedClass : clockInItemClass)}>
          <ManageAccountsRoundedIcon className="!text-[14px] shrink-0" />
          <span>上{format(time.time, 'HH:mm')}</span>
        </div>
      )
    }
  }

  const getClockOutTime = (time, late, lastItem) => {
    if (time === null || time.uuid === null) return
    if (time !== null) {
      if (time.isLine) {
        return (
          <div key={`clickout-${time.uuid}`} {...recordProps(time, 'end', (late && lastItem) ? colorRedClass : clockInItemClass)}>
            <span className="lineicon"></span>
            <span>下</span>
            <a style={{ color: color(time.distanceValue) }} className={(late && lastItem) ? colorRedLinkLateClass : 'no-underline'}>
              {format(time.time, 'HH:mm')}
            </a>
          </div>
        )
      } else if (time.checkinType === 'CELLPHONE' || (time.checkinType === null && time.latitude !== null && time.longitude !== null)) {
        return (
          <div key={`clickout-${time.uuid}`} {...recordProps(time, 'end', (late && lastItem) ? colorRedClass : clockInItemClass)}>
            <PhoneIphoneIcon className="!text-[14px] shrink-0" />
            <span>下</span>
            {time.latitude !== null && time.longitude !== null ? (
              <a style={{ color: color(time.distanceValue) }} className={(late && lastItem) ? colorRedLinkLateClass : 'no-underline'}>
                {format(time.time, 'HH:mm')}
              </a>
            ) : (
              <span style={{ color: 'rgb(var(--text-tertiary))' }}>{format(time.time, 'HH:mm')}</span>
            )}
          </div>
        )
      } else if (time.checkinType === 'COMPUTER' || time.checkinType === null) {
        return (
          <div key={`clickout-${time.uuid}`} {...recordProps(time, 'end', (late && lastItem) ? colorRedClass : clockInItemClass)}>
            <DesktopWindows className="!text-[14px] shrink-0" />
            <span>下{format(time.time, 'HH:mm')}</span>
          </div>
        )
      } else if (time.checkinType === 'QRCODE' || time.checkinType === null) {
        return (
          <div key={`clickout-${time.uuid}`} {...recordProps(time, 'end', (late && lastItem) ? colorRedClass : clockInItemClass)}>
            <QrCodeIcon className="!text-[14px] shrink-0" />
            <span>下{format(time.time, 'HH:mm')}</span>
          </div>
        )
      } else if (time.checkinType === 'ADMIN') {
        return (
          <div key={`clickout-${time.uuid}`} {...recordProps(time, 'end', (late && lastItem) ? colorRedClass : clockInItemClass)}>
            <ManageAccountsRoundedIcon className="!text-[14px] shrink-0" />
            <span>下{format(time.time, 'HH:mm')}</span>
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
          <span key={`breakOut-${start.uuid}`} {...recordProps(start, 'breakStart', clockInItemClass)}>
            <span className="lineicon"></span>
            <span>外</span>
            <a style={{ color: color(start.distanceValue) }} className="no-underline">
              {format(start.time, 'HH:mm')}
            </a>
          </span>
        )
      } else if (start.checkinType === 'CELLPHONE' || (start.checkinType === null && start.latitude !== null && start.longitude !== null)) {
        return (
          <span key={`breakOut-${start.uuid}`} {...recordProps(start, 'breakStart', clockInItemClass)}>
            <PhoneIphoneIcon className="!text-[14px] shrink-0" />
            <span>外</span>
            {start.latitude !== null && start.longitude !== null ? (
              <a style={{ color: color(start.distanceValue) }} className="no-underline">
                {format(start.time, 'HH:mm')}
              </a>
            ) : (
              <span style={{ color: 'rgb(var(--text-tertiary))' }}>{format(start.time, 'HH:mm')}</span>
            )}
          </span>
        )
      } else if (start.checkinType === 'COMPUTER' || start.checkinType === null) {
        return (
          <span key={`breakOut-${start.uuid}`} {...recordProps(start, 'breakStart', clockInItemClass)}>
            <DesktopWindows className="!text-[14px] shrink-0" />
            <span>外{format(start.time, 'HH:mm')}</span>
          </span>
        )
      } else if (start.checkinType === 'QRCODE' || start.checkinType === null) {
        return (
          <span key={`breakOut-${start.uuid}`} {...recordProps(start, 'breakStart', clockInItemClass)}>
            <QrCodeIcon className="!text-[14px] shrink-0" />
            <span>外{format(start.time, 'HH:mm')}</span>
          </span>
        )
      } else if (start.checkinType === 'ADMIN') {
        return (
          <span key={`breakOut-${start.uuid}`} {...recordProps(start, 'breakStart', clockInItemClass)}>
            <ManageAccountsRoundedIcon className="!text-[14px] shrink-0" />
            <span>外{format(start.time, 'HH:mm')}</span>
          </span>
        )
      }
    }

    const breakBack = end => {
      if (end === null || end.uuid === null) return
      if (end !== null) {
        if (end.isLine) {
          return (
            <span {...recordProps(end, 'breakEnd', clockInItemClass)} key={`breakBack-${end.uuid}`}>
              <span className="lineicon"></span>
              <span>回</span>
              <a style={{ color: color(end.distanceValue) }} className="no-underline">
                {format(end.time, 'HH:mm')}
              </a>
            </span>
          )
        } else if (end.checkinType === 'CELLPHONE' || (end.checkinType === null && end.latitude !== null && end.longitude !== null)) {
          return (
            <span {...recordProps(end, 'breakEnd', clockInItemClass)} key={`breakBack-${end.uuid}`}>
              <PhoneIphoneIcon className="!text-[14px] shrink-0" />
              <span>回</span>
              {end.latitude !== null && end.longitude !== null ? (
                <a style={{ color: color(end.distanceValue) }} className="no-underline">
                  {format(end.time, 'HH:mm')}
                </a>
              ) : (
                <span style={{ color: 'rgb(var(--text-tertiary))' }}>{format(end.time, 'HH:mm')}</span>
              )}
            </span>
          )
        } else if (end.checkinType === 'COMPUTER' || end.checkinType === null) {
          return (
            <span {...recordProps(end, 'breakEnd', clockInItemClass)} key={`breakBack-${end.uuid}`}>
              <DesktopWindows className="!text-[14px] shrink-0" />
              <span>回{format(end.time, 'HH:mm')}</span>
            </span>
          )
        } else if (end.checkinType === 'QRCODE' || end.checkinType === null) {
          return (
            <span {...recordProps(end, 'breakEnd', clockInItemClass)} key={`breakBack-${end.uuid}`}>
              <QrCodeIcon className="!text-[14px] shrink-0" />
              <span>回{format(end.time, 'HH:mm')}</span>
            </span>
          )
        } else if (end.checkinType === 'ADMIN') {
          return (
            <span {...recordProps(end, 'breakEnd', clockInItemClass)} key={`breakBack-${end.uuid}`}>
              <ManageAccountsRoundedIcon className="!text-[14px] shrink-0" />
              <span>回{format(end.time, 'HH:mm')}</span>
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
        return <div role="separator" className="h-px shrink-0 bg-border" style={{ margin: '3px 0' }} />
      }
    }
  }
  const stickyCell = 'sticky left-0 z-[99] bg-background outline outline-1 outline-border'
  return (
    <Card>
      <CardHeader
        className="items-center pb-4"
        action={
          <Fragment>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label='匯出打卡類型'
              checked={typeDisplay}
              onChange={(e, v) => setTypeDisplay(v)}
            />
            <Button
              disabled={exportHRLoading}
              variant="secondary"
              onClick={handleHRExport}
              size="sm"
            >
              報表匯出(人資格式)
            </Button>
            <Button
              disabled={exportLoading}
              variant="secondary"
              onClick={handleExport}
              size="sm"
            >
              報表匯出
            </Button>
          </Fragment>
        }
      >
        <div className="flex items-baseline gap-3">
          <CardTitle>全店打卡記錄列表</CardTitle>
          <span className="text-label tabular-nums text-text-secondary">
            共 {attendanceRecords.length} 筆
          </span>
        </div>
      </CardHeader>
      <div className="px-5 pb-5">
        <Table wrapperClassName="AttendanceRecordsTable max-h-[calc(100vh-430px)] overflow-auto" aria-label="a dense table">
          <TableHeader className="sticky top-0 z-[100]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky left-0 z-[99] bg-surface px-2 outline outline-1 outline-border">{year}年</TableHead>
              <TableHead className="bg-accent/8 px-2 font-bold text-accent">總打卡天數</TableHead>
              <TableHead className="px-2">曠職天數</TableHead>
              <TableHead className="px-2">總遲到分鐘數</TableHead>
              {displayDate.map((date, index) => (
                <TableHead key={`TableCell-${index}`} className="w-[180px] min-w-[180px] px-2">{date}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((data, index) => {
              return (
                <TableRow key={`TableRow-${index}`} className="hover:bg-transparent">
                  <TableCell className={`${stickyCell} whitespace-nowrap px-2 py-1 text-label`}>{data.userName}</TableCell>
                  {/* 計算總打卡天數 */}
                  <TableCell className="whitespace-nowrap bg-accent/8 px-2 py-1 text-label font-bold tabular-nums text-accent">{data.totalClockInDays + ` 天`}</TableCell>
                  <TableCell numeric className="whitespace-nowrap px-2 py-1 text-label">{formatNumber(data.absenteeismDays)}</TableCell>
                  <TableCell numeric className="whitespace-nowrap px-2 py-1 text-label">{formatNumber(data.totalLateMinutes)}</TableCell>
                  {displayDate.map(d => {
                    return data.attendanceRecord.map((record, index) => {
                      if (format(record.date, 'MM/dd') === d.substring(0, 5)) {
                        if (record.clockInRecord.length > 0) {
                          return (
                            <TableCell key={index} className="w-[180px] min-w-[180px] px-2 py-1 text-label">
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
                          return <TableCell key={index} className="w-[180px] min-w-[180px] px-2 py-1 text-label"></TableCell>
                        }
                      }
                      return undefined
                    })
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <Drawer anchor='bottom' open={open} onClose={handleCloseDrawer}>
        <div className="ui-root flex flex-col items-center justify-center gap-10 p-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <h4 className="m-0 text-heading text-text">已選取打卡記錄:  {showSelectDate && `${format(showSelectDate, 'yyyy/MM/dd  HH:mm')} - ${findClockInType(editData.clockInType)}`}</h4>
            {googleMapUrl !== '' && (
              <Button asChild variant="secondary" size="sm">
                <a href={googleMapUrl} target="_blank">
                  <LocationOnIcon />查看位置
                </a>
              </Button>
            )}
          </div>
          <div className="flex justify-center gap-20">
            {identity.edit && <Button onClick={() => setOpenModal(true)} variant='primary'>編輯</Button>}
            {identity.delete && <Button variant='danger' disabled={delBtn} onClick={handleDeleteRecord}>刪除</Button>}
          </div>
        </div>
      </Drawer>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle style={{ paddingBottom: 0 }}>編輯打卡記錄</DialogTitle>
        <DialogContent style={{ overflow: 'visible', display: 'flex' }} >
          <div className="ui-root flex w-[350px] flex-col gap-4">
            <p className="text-label text-text-secondary">
              已選取打卡記錄:  {showSelectDate && `${format(showSelectDate, 'yyyy/MM/dd  HH:mm')} - ${findClockInType(editData.clockInType)}`}
            </p>
            <Field label="選取時間" htmlFor="attendance-edit-time">
              <Input
                id="attendance-edit-time"
                value={!!editData.date && format(new Date(editData.date), 'HH:mm')}
                type='time'
                onChange={event => handleChangeTime(event.target.value)}
              />
            </Field>
          </div>
        </DialogContent>
        <DialogActions className="ui-root" style={{ margin: '10px' }}>
          <Button onClick={handleCloseModal} variant="secondary">
            取消
          </Button>
          <Button
            variant="primary"
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
