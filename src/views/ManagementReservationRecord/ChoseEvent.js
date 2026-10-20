/** @jsxImportSource @emotion/react */
import { Grid } from 'ui/grid-compat'
import { Button } from 'ui/button-compat'
import { FormControl, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import React, { useState, useEffect, Fragment } from 'react'
// 對話框內含 MobileDatePicker 與 Autocomplete，依指南保留 MUI DialogContent / List / TextField；
// 預約時間的時段下拉與 standard 變體的 MobileDatePicker 並排、樣式依 .MuiSelect-select 撰寫，保留 MUI Select
import { DialogContent, Link, List, ListItemButton, ListItemAvatar, ListItemText } from '@mui/material'
import { Avatar } from 'ui/avatar'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Cancel as CancelIcon, Check as CheckIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, Person as PersonIcon, AssignmentTurnedIn as AssignmentTurnedInIcon, Message as MessageIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { format, getMinutes, startOfDay, addMinutes } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import useFetchAdminBookingTime from 'hooks/useFetchAdminBookingTime'
import useFetchBooking from 'hooks/useFetchBooking'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import useFetchNonDesignationBooking from 'hooks/useFetchNonDesignationBooking'
import useFetchNonDesignateBookingLimit from 'hooks/useFetchMerchantDesignateTimeNonDesignateBookingLimit'
import useFetchSettingMerchantNonDesignateBookingLimit from 'hooks/useFetchSetMerchantDesignateTimeNonDesignateBookingLimit'
import useFetchSetBookingCheckin from 'hooks/useFetchSetBookingCheckin'
import useFetchSetBookingCancelCheckin from 'hooks/useFetchSetBookingCancelCheckin'
import useFetchSetDelayBookingCheckinTime from 'hooks/useFetchSetDelayBookingCheckinTime'
import useFetchSetBookingCusCheckRequired from 'hooks/useFetchSetBookingCusCheckRequired'
import useFetchSetBookingNoShow from 'hooks/useFetchSetBookingNoShow'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import PasswordDialog from 'components/PasswordDialog'
import { MobileDatePicker } from 'ui/date-picker'
import idx from 'idx'
import _ from 'lodash'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { green, grey, blue } from '@mui/material/colors'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer'

const themes = createTheme({
  palette: {
    primary: {
      main: green[400]
    },
    secondary: {
      main: grey[400]
    },
  }
})

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
  }),
  avatar: css({
    backgroundColor: blue[100],
    color: blue[600],
  }),
  field: css({
    marginBottom: theme.spacing(2) + '!important',
  }),
  field2: css({
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(2),
  }),
  dialog: css({
    maxWidth: '400px',
  }),
  breakWord: css({
    fontSize: 14,
    '& div': {
      wordBreak: 'break-all'
    }
  }),
  eventWrap: css({
    gap: 4,
    display: 'flex',
    flexDirection: 'column',
    '& .MuiInputBase-multiline': {
      padding: '8px 12px'
    },
    '& div': {
      wordBreak: 'break-all'
    },
    '& div.info': {
      display: 'flex',
      gap: 8,
      '& div:first-child': {
        flexShrink: 0
      },
      '& div:last-child': {
        flexGrow: 1,
        marginBottom: 12,
        '& div': {
          '& textarea': {
          }
        }
      }
    }
  }),
  datepicker: {
    '& input, .MuiSelect-select': {
      padding: '6px 0 7px !important'
    }
  }
}

const designate = [
  { label: '指定', value: true },
  { label: '不指定', value: false },
]

const timeCostArray = [
  { label: '30分鐘', value: 1 },
  { label: '1小時', value: 2 },
  { label: '1.5小時', value: 3 },
  { label: '2小時', value: 4 },
  { label: '2.5小時', value: 5 },
  { label: '3小時', value: 6 },
  { label: '3.5小時', value: 7 },
  { label: '4小時', value: 8 },
  { label: '4.5小時', value: 9 },
  { label: '5小時', value: 10 },
  { label: '5.5小時', value: 11 },
  { label: '6小時', value: 12 },
  { label: '6.5小時', value: 13 },
  { label: '7小時', value: 14 },
  { label: '7.5小時', value: 15 },
  { label: '8小時', value: 16 }
]

const timeArr = [
  { label: '5分' , value: 5 },
  { label: '10分' , value: 10 },
  { label: '15分' , value: 15 },
  { label: '20分' , value: 20 },
  { label: '25分' , value: 25 },
  { label: '30分' , value: 30 },
  { label: '35分' , value: 35 },
  { label: '40分' , value: 40 },
  { label: '45分' , value: 45 },
  { label: '50分' , value: 50 },
  { label: '55分' , value: 55 },
  { label: '60分' , value: 60 },
]

export default function ChoseEvent({
  merchantId, setModalOpen, clickData, refetchData, modaltype, setModalType,
  editOrder, setEditOrder, checkinSettings, bookingCusCheck, checkinMode,
  cancelPasswordUsing
}) {
  const { booking } = useFetchBooking()
  const { updateOrder } = useFetchUpdateOrder()
  const { adminBookingTime } = useFetchAdminBookingTime()
  const { verifyBooking } = useFetchVerifyBooking()
  const { nonDesignationBooking } = useFetchNonDesignationBooking()
  const { setMerchantNonDesignateBookingLimit } = useFetchSettingMerchantNonDesignateBookingLimit()
  const { setDelayBookingCheckinTime } = useFetchSetDelayBookingCheckinTime()
  const { setBookingCusCheckRequired } = useFetchSetBookingCusCheckRequired()
  const { setBookingNoShow } = useFetchSetBookingNoShow()
  const nonDesignateLimitData = useFetchNonDesignateBookingLimit({
    date: clickData.dateTime,
  })
  const { setBookingCheckin } = useFetchSetBookingCheckin()
  const { setBookingCancelCheckin } = useFetchSetBookingCancelCheckin()
  const [bookTimeOption, setBookTimeOption] = useState([])
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [orderLimit, setOrderLimit] = useState(true)
  const [limitCount, setLimitCount] = useState({
    date: null,
    limit: 0,
  })
  const [delayTime, setDelayTime] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (editOrder.date) {
      const start = startOfDay(editOrder.date).getTime()
      const arr = []
      for (let i = 0; i < 48; i++) {
        arr.push(addMinutes(start, i * 30).getTime())
      }
      setBookTimeOption(arr)
    }
  }, [editOrder])

  const [values, setValues] = useState({
    merchantId: merchantId,
    dateTime: clickData.dateTime,
    designerId: clickData.designerId,
    name: '',
    cellphone: '',
    friends: [],
    designerServiceIds: [],
    remark: '',
    remarkForCustomer: '',
    timeCost: 1,
    isBookingCostUsing: true,
    isCusCheckRequired: false
  })
  useEffect(() => {
    if (!nonDesignateLimitData.loading) {
      const nonDesignateLimit = idx(
        nonDesignateLimitData,
        _ => _.data.merchantDesignateTimeNonDesignateBookingLimit
      )
      if (nonDesignateLimit !== null) {
        setLimitCount(nonDesignateLimit)
      }
    }
  }, [nonDesignateLimitData.loading])

  const closeOrderTime = () => {
    setBtnDisabled(true)
    adminBookingTime({
      appointable: modaltype === 'openOrder' ? true : false,
      datetime: clickData.dateTime,
      designerId: clickData.designerId,
    })
      .then(res => {
        if (res.data.adminBookingTime.designerId) {
          refetchData()
          openSnackbar({ message: '變更成功', variant: 'success' })
          setModalOpen(false)
        }
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setBtnDisabled(false)
      })
  }

  const createBooking = () => {
    if (values.cellphone === '') {
      openSnackbar({
        message: '請填寫電話',
        variant: 'warning',
      })
      return
    }
    if (values.name === '') {
      openSnackbar({
        message: '請填寫顧客',
        variant: 'warning',
      })
      return
    }
    setBtnDisabled(true)
    booking(values).then((res) => {
      if (res.data.bookingV2.id) {
        refetchData()
        openSnackbar({ message: '預約成功', variant: 'success' })
        setModalOpen(false)
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setBtnDisabled(false)
    })
  }

  const handleAcceptBooking = status => {
    setBtnDisabled(true)
    verifyBooking({
      orderId: editOrder.id,
      isApproval: status,
      isFromPC: true,
      password
    }).then(res => {
      if (res.data.verifyBooking.id) {
        refetchData()
        if (status) {
          openSnackbar({
            message: '已接受預約',
            variant: 'success',
          })
        } else {
          openSnackbar({
            message: '已取消預約',
            variant: 'success',
          })
          setDialogOpen(false)
        }
        setModalOpen(false)
      }
    }).catch(error => {
      setBtnDisabled(false)
      openSnackbar({ message: error.message, variant: 'error' })
    })
  }

  const handleUpdateEditOrder = () => {
    if (getMinutes(new Date(editOrder.date)) !== 0 && getMinutes(new Date(editOrder.date)) !== 30) {
      openSnackbar({
        message: '時間有誤',
        variant: 'warning',
      })
      return
    } else {

      if (!editOrder.customer.id) {
        openSnackbar({
          message: '請選擇顧客',
          variant: 'warning',
        })
        return
      }

      if (editOrder.designer && !editOrder.designer.id) {
        openSnackbar({
          message: '請選擇服務人員',
          variant: 'warning',
        })
        return
      }

      if (modaltype === 'editNdsOrder' && editOrder.isDesignate && (!editOrder.designer || !editOrder.designer.id)) {
        openSnackbar({
          message: '請選擇服務人員',
          variant: 'warning',
        })
        return
      }
      const submitData = {
        orderInput: {
          customerId: editOrder.customer.id,
          date: editOrder.date,
          designerId: editOrder.designer ? editOrder.designer.id : null,
          isDesignate: editOrder.isDesignate,
          remark: editOrder.remark,
          remarkForCustomer: editOrder.remarkForCustomer,
          timeCost: editOrder.timeCost,
          isBookingCostUsing: editOrder.isBookingCostUsing
        },
        notificationDayCount: editOrder.notificationDayCount,
        updateOrderId: editOrder.id,
      }

      setBtnDisabled(true)
      updateOrder(submitData).then(res => {
        if (res.data.updateOrder.id) {
          refetchData()
          openSnackbar({
            message: '帳單編輯成功',
            variant: 'success',
          })
          setModalOpen(false)
        }
      }).catch(error => {
        setBtnDisabled(false)
        openSnackbar({ message: error.message, variant: 'error' })
      })
    }
  }

  const updateLimitCount = () => {
    if (limitCount.limit === '' || limitCount.limit < 0) {
      openSnackbar({
        message: '預約人數有誤',
        variant: 'warning',
      })
      return
    }
    setBtnDisabled(true)
    setMerchantNonDesignateBookingLimit({ input: limitCount }).then(res => {
      if (res.data.setMerchantDesignateTimeNonDesignateBookingLimit.merchant) {
        openSnackbar({ message: '設定完成', variant: 'success' })
        setModalOpen(false)
      } else {
        openSnackbar({ message: '設定失敗', variant: 'error' })
        setBtnDisabled(false)
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setBtnDisabled(false)
    })

  }

  const createNdsBooking = () => {
    if (values.cellphone === '') {
      openSnackbar({
        message: '請填寫電話',
        variant: 'warning',
      })
      return
    }
    if (values.name === '') {
      openSnackbar({
        message: '請填寫顧客',
        variant: 'warning',
      })
      return
    }

    const submitData = {
      bookingDate: values.dateTime,
      cellphone: values.cellphone,
      customerName: values.name,
      storeId: merchantId,
      remark: values.remark,
      remarkForCustomer: values.remarkForCustomer,
      timeCost: values.timeCost,
      isCusCheckRequired: values.isCusCheckRequired
    }
    if (limitCount.limit === 0) {
      openSnackbar({ message: '此時段可預約人數設定為0', variant: 'warning' })
    } else {
      setBtnDisabled(true)
      nonDesignationBooking(submitData).then(res => {
        if (res.data.nonDesignationBooking.id) {
          openSnackbar({ message: '預約成功', variant: 'success' })
          setModalOpen(false)
          refetchData()
        }
      }).catch(error => {
        setBtnDisabled(false)
        openSnackbar({ message: error.message, variant: 'error' })
      })
    }
  }

  const handleSetBookingCusCheckRequired = async checked => {
    setBtnDisabled(true)
    try {
      const res = await setBookingCusCheckRequired({
        input: {
          bookingId: editOrder.id,
          isRequired: checked
        }
      })
      if (res) {
        setEditOrder(
          produce(draft => {
            draft.isCusCheckRequired = checked
          })
        )
        openSnackbar({ message: '編輯成功', variant: 'success' })
        refetchData()
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    } finally {
      setBtnDisabled(false)
    }
  }

  const findTimeCost = timeCost => {
    const findData = timeCostArray.find(data => data.value === timeCost)
    return findData ? findData.label : ''
  }

  const handleCheckIn = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingCheckin({
        bookingId: editOrder.id,
        isCellphone: false
      })
      openSnackbar({ message: '報到成功', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false)
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  
  const handleCancelCheckIn = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingCancelCheckin({
        bookingId: editOrder.id,
        isCellphone: false
      })
      openSnackbar({ message: '已取消報到', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false)
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }

  const handleSetDelayBookingTime = async () => {
    setBtnDisabled(true) 
    try {
      await setDelayBookingCheckinTime({
        input: {
          bookingId: editOrder.id,
          delayTime: delayTime,
        }
      })
      openSnackbar({ message: '簡訊已寄出', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false) 
    }
  }

  const handleSetBookingNoShow = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingNoShow({
        input: {
          bookingIds: [editOrder.id],
          isNoShow: !editOrder.isNoShow,
        }
      })
      openSnackbar({ message: '設定成功', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false) 
    }
  }

  const openPassworDialog = () => {
    setDialogOpen(true)
  }
  const closePassworDialog = () => {
    setDialogOpen(false)
    setPassword('')
  }

  return (
    <DialogContent dividers style={{ border: 'none' }}>
      {(modaltype === 'default' || modaltype === 'openOrder') && <Fragment>
        <TextField
          label="顧客電話"
          type="tel"
          value={values.cellphone}
          css={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, cellphone: e.target.value })
          }}
          required
        />
        <TextField
          label="顧客姓名"
          value={values.name}
          css={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, name: e.target.value })
          }}
          required
        />
        <Field label='服務時長'>
          <NativeSelect
            css={styles.field}
            className="ui-root"
            value={values.timeCost}
            onChange={event => setValues({ ...values, timeCost: event.target.value })}
          >
            {timeCostArray.map(d => (
              <NativeSelectOption key={`${d.value}-${d.label}`} value={d.value}>{d.label}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <TextField
          label="備註"
          value={values.remark}
          css={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, remark: e.target.value })
          }}
        />
        <TextField
          label="顧客備註"
          value={values.remarkForCustomer}
          css={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, remarkForCustomer: e.target.value })
          }}
        />
        <div>
          <CheckboxField
            className="ui-root py-2"
            label="佔用顧客端預約名額"
            checked={values.isBookingCostUsing}
            onChange={() => setValues({ ...values, isBookingCostUsing: !values.isBookingCostUsing })}
          />
        </div>
        {bookingCusCheck && (
          <div>
            <CheckboxField
              className="ui-root py-2"
              label="未來預訂(待確認)"
              checked={values.isCusCheckRequired}
              onChange={() => setValues({ ...values, isCusCheckRequired: !values.isCusCheckRequired })}
            />
          </div>
        )}
        {!checkinMode && (modaltype === 'openOrder' ?
          <ListItemButton css={styles.field} onClick={closeOrderTime} disabled={btnDisabled}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <LockOpenIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="開啟預約" />
          </ListItemButton>
          :
          <ListItemButton css={styles.field} onClick={closeOrderTime} disabled={btnDisabled}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <LockIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="關閉預約" />
          </ListItemButton>
        )}

        <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginRight: '10px' }}
            disabled={btnDisabled}
            onClick={() => {
              createBooking()
            }}
          >
            預約
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ background: 'red' }}
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </Grid>
      </Fragment>}

      {modaltype === 'editOrder' && <Fragment>
        <div css={styles.breakWord} className='MuiTypography-body1'>
          <div>
            <p>{`姓名: `}
              <Link
                color='#263238'
                component={RouterLink}
                underline='always'
                to={`/management/customers/${editOrder.customer.id}/invoices`}
                target="_blank" >
                {editOrder.customer.name}
              </Link>
            </p>
          </div>
          <div>{`電話: ${editOrder.customer.cellphone}`}</div>
          <div>{`日期: ${format(new Date(editOrder.date), 'yyyy/MM/dd')}`}</div>
          <div>{`預約時間: ${format(new Date(editOrder.date), 'HH:mm')}`}</div>
          <div>{`指定/不指定: ${editOrder.isDesignate ? '指定' : '不指定'}`}</div>
          <div>{`設計師: ${editOrder.isDesignate ? editOrder.designer.name : '不指定'}`}</div>
          <div>{`同行人數: ${editOrder.companionCount}`}</div>
          <div>{`備註: ${editOrder.remark}`}</div>
          <div>{`顧客備註: ${editOrder.remarkForCustomer}`}</div>
          {(checkinSettings.isBookingCheckinEnabled && editOrder.isCheckin !== null) && (
            <div>{`報到狀態: ${editOrder.isCheckin ? '報到成功' : '未報到'}`}</div>
          )}
          {editOrder.notificationDate && (
            <div style={{ fontWeight: 'bold' }}>{
              `提醒日期: ${format(new Date(editOrder.notificationDate), 'yyyy/MM/dd')} (${editOrder.notificationDayCount}天前)`
            }</div>
          )}
          {editOrder.isNoShow && <div>出席狀況: 未出席</div>}
        </div>
        <List>
          {editOrder.status !== '已完成' && editOrder.status !== '設計師已取消' && (
            <React.Fragment>
              <ListItemButton disabled={btnDisabled} onClick={() => { setModalType('editOrderDetail') }}>
                <ListItemAvatar>
                  <Avatar className="bg-accent/8 text-accent">
                    <EditIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="編輯" />
              </ListItemButton>
              <Link
                disabled={btnDisabled}
                color="inherit"
                component={RouterLink}
                to={`/order/${editOrder.id}?status=checkout`}
                variant="h6"
                target="_blank"
                underline='none'
              >
                {editOrder.status === '預約成功' && (
                  <ListItemButton disabled={btnDisabled}>
                    <ListItemAvatar>
                      <Avatar className="bg-accent/8 text-accent">
                        <ShoppingCartIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="結帳" />
                  </ListItemButton>
                )}
              </Link>
            </React.Fragment>
          )}

          {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
            <ListItemButton disabled={btnDisabled} onClick={() => handleAcceptBooking(true)}>
              <ListItemAvatar>
                <Avatar className="bg-accent/8 text-accent">
                  <CheckIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="接受預約" />
            </ListItemButton>
          )}

          {editOrder.status !== '設計師已取消' && (
            <ListItemButton disabled={btnDisabled} onClick={() => cancelPasswordUsing ? openPassworDialog('cancel') : handleAcceptBooking(false)}>
              <ListItemAvatar>
                <Avatar className="bg-accent/8 text-accent">
                  <CancelIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="取消預約" />
            </ListItemButton>
          )}
          {(checkinSettings.isBookingCheckinEnabled && editOrder.isCheckin !== null) && (
            <>
              <ListItemButton disabled={btnDisabled} onClick={() => editOrder.isCheckin ? handleCancelCheckIn() : handleCheckIn()}>
                <ListItemAvatar>
                  <Avatar className="bg-accent/8 text-accent">
                    <AssignmentTurnedInIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={editOrder.isCheckin ? '取消報到' : '報到'} />
              </ListItemButton>
              {checkinSettings.isUnDoneBookingManualNotify && (
                <ListItemButton disabled={btnDisabled} onClick={() => setModalType('message')} >
                  <ListItemAvatar>
                    <Avatar className="bg-accent/8 text-accent">
                      <MessageIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="延遲服務時間" />
                </ListItemButton>
              )}
            </>
          )}
          <ListItemButton disabled={btnDisabled} onClick={() => handleSetBookingNoShow()}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <EventBusyIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${editOrder.isNoShow ? '取消未出席' : '未出席'}`} />
          </ListItemButton>
          {bookingCusCheck && (
            <div>
              <CheckboxField
                className="ui-root py-2"
                label="未來預訂(待確認)"
                checked={editOrder.isCusCheckRequired}
                disabled={btnDisabled}
                onChange={e => handleSetBookingCusCheckRequired(e.target.checked)}
              />
            </div>
          )}
        </List>
        <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </Grid>
      </Fragment>}
      {(modaltype === 'editOrderDetail' || modaltype === "editNdsOrder") && <Fragment>
        <div css={styles.field} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ToggleGroup
            size="small"
            value={editOrder.isDesignate}
            onChange={() => {
              const data = _.cloneDeep(editOrder)
              data.isDesignate = !data.isDesignate
              setEditOrder(data)
            }}
            exclusive
          >
            {designate.map((data, idx) => (
              <ToggleGroupItem
                key={`${data.label}-${idx}`}
                value={data.value}
                data-testid={`assign-designer-${data.value}`}
              >
                {data.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {(modaltype === 'editNdsOrder' && checkinSettings.isBookingCheckinEnabled && editOrder.isCheckin !== null) && (
            <p style={{ alignSelf: 'center' }}>{`報到狀態: ${editOrder.isCheckin ? '報到成功' : '未報到'}`}</p> 
          )}
        </div>
        <div css={styles.field2}>
          <MobileDatePicker
            value={editOrder.date}
            css={styles.datepicker}
            label='預約時間'
            onChange={(value) => {
              const data = _.cloneDeep(editOrder)
              data.date = new Date(value).getTime()
              setEditOrder(data)
            }}
            format="yyyy/MM/dd"
            localeText={{
              toolbarTitle: '選擇日期'
            }}
            slotProps={{
              toolbar: {
                toolbarFormat: 'M月d日'
              },
              textField: {
                variant: 'standard'
              }
            }}
          />
          <FormControl variant='standard' css={styles.datepicker}>
            <Select
              value={editOrder.date}
              sx={{ paddingRight: '24px' }}
              onChange={event => setEditOrder({ ...editOrder, date: event.target.value })}
            >
              {bookTimeOption.map(delayTime => (
                <MenuItem value={delayTime} key={delayTime}>
                  {format(delayTime, 'HH:mm')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div css={styles.field}>
          <CustomerAutoComplete
            label="顧客姓名/手機號碼/編號"
            value={editOrder.customer.id}
            onChange={value => {
              const data = _.cloneDeep(editOrder)
              data.customer.id = value.id === '' ? '' : value.id
              setEditOrder(data)
            }}
          />
        </div>
        <div css={styles.field}>
          <BookingRecordListAutoComplete
            label="服務人員姓名/編號"
            value={!!editOrder.designer ? editOrder.designer.id : ''}
            onChange={value => {
              const data = _.cloneDeep(editOrder)
              data.designer = { id: value.id === '' ? '' : value.userId }
              setEditOrder(data)
            }}
          />
        </div>
        <Field label='服務時長'>
          <NativeSelect
            css={styles.field}
            className="ui-root"
            value={editOrder.timeCost}
            onChange={event => setEditOrder({ ...editOrder, timeCost: event.target.value })}
          >
            {timeCostArray.map(d => (
              <NativeSelectOption key={`${d.value}-${d.label}`} value={d.value}>{d.label}</NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <TextField
          css={styles.field}
          value={editOrder.remark}
          label="備註"
          fullWidth
          variant="outlined"
          onChange={e => {
            const data = _.cloneDeep(editOrder)
            data.remark = e.target.value
            setEditOrder(data)
          }}
        />
        <TextField
          css={styles.field}
          value={editOrder.remarkForCustomer}
          label="顧客備註"
          fullWidth
          variant="outlined"
          inputProps={{
            readOnly: true
          }}
        />
        <TextField
          type='number'
          variant='outlined'
          fullWidth
          label='提前通知天數'
          css={styles.field}
          value={editOrder.notificationDayCount || ''}
          InputProps={{ inputProps: { min: 1 } }}
          onFocus={e => e.target.select()}
          onChange={e => {
            const value = Number(e.target.value) < 1 ? null : Number(e.target.value) 
            const data = _.cloneDeep(editOrder)
            data.notificationDayCount = value
            setEditOrder(data)
          }}
          onWheel={() => document.activeElement.blur()}
        />
        {modaltype === "editOrderDetail" && (
          <CheckboxField
            className="ui-root py-2"
            label="佔用顧客端預約名額"
            checked={editOrder.isBookingCostUsing}
            onChange={() => setEditOrder({ ...editOrder, isBookingCostUsing: !editOrder.isBookingCostUsing })}
          />
        )}
        {bookingCusCheck && (
          <div>
            <CheckboxField
              className="ui-root py-2"
              label="未來預訂(待確認)"
              checked={editOrder.isCusCheckRequired}
              disabled={btnDisabled}
              onChange={e => handleSetBookingCusCheckRequired(e.target.checked)}
            />
          </div>
        )}
        {(modaltype === 'editNdsOrder' && checkinSettings.isBookingCheckinEnabled && editOrder.isCheckin !== null) && (
          <ListItemButton disabled={btnDisabled} onClick={() => editOrder.isCheckin ? handleCancelCheckIn() : handleCheckIn()}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <AssignmentTurnedInIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={editOrder.isCheckin ? '取消報到' : '報到'} />
          </ListItemButton> 
        )}
        <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={btnDisabled}
            style={{ marginRight: '10px' }}
            onClick={handleUpdateEditOrder}
          >
            儲存
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </Grid>
      </Fragment>}

      {modaltype === 'ndsDefault' && <Fragment>
        <ListItemButton
          css={styles.field}
          onClick={() => { setOrderLimit(!orderLimit) }}
        >
          <ListItemAvatar>
            <Avatar className="bg-accent/8 text-accent">
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={orderLimit ? '設定可預約人數上限' : '回到預約'}
          />
        </ListItemButton>
        {orderLimit ? <Fragment>
          <TextField
            label="顧客電話"
            type="tel"
            value={values.cellphone}
            css={styles.field}
            fullWidth
            variant="outlined"
            onChange={e => {
              setValues({ ...values, cellphone: e.target.value })
            }}
            required
          />
          <TextField
            label="顧客姓名"
            value={values.name}
            css={styles.field}
            fullWidth
            variant="outlined"
            onChange={e => {
              setValues({ ...values, name: e.target.value })
            }}
            required
          />
          <Field label='服務時長'>
            <NativeSelect
              css={styles.field}
              className="ui-root"
              value={values.timeCost}
              onChange={event => setValues({ ...values, timeCost: event.target.value })}
            >
              {timeCostArray.map(d => (
                <NativeSelectOption key={`${d.value}-${d.label}`} value={d.value}>{d.label}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <TextField
            label="備註"
            value={values.remark}
            css={styles.field}
            fullWidth
            variant="outlined"
            onChange={e => {
              setValues({ ...values, remark: e.target.value })
            }}
          />
          <TextField
            label="顧客備註"
            value={values.remarkForCustomer}
            css={styles.field}
            fullWidth
            variant="outlined"
            onChange={e => {
              setValues({ ...values, remarkForCustomer: e.target.value })
            }}
          />
          {bookingCusCheck && (
            <div>
              <CheckboxField
                className="ui-root py-2"
                label="未來預訂(待確認)"
                checked={values.isCusCheckRequired}
                onChange={() => setValues({ ...values, isCusCheckRequired: !values.isCusCheckRequired })}
              />
            </div>
          )}
          <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginRight: '10px' }}
              disabled={btnDisabled}
              onClick={createNdsBooking}
            >
              預約
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ background: 'red' }}
              disabled={btnDisabled}
              onClick={() => {
                setModalOpen(false)
              }}
            >
              取消
            </Button>
          </Grid>

        </Fragment> :
          <Fragment>
            <div className="mb-[0.35em] text-body font-medium text-text">
              可預約人數設定
            </div>
            <div className="mb-[0.35em] text-body font-medium text-text">
              時段:
              {format(new Date(clickData.dateTime), 'yyyy/MM/dd  HH:mm')}
            </div>
            <TextField
              label="人數"
              value={limitCount.limit}
              css={styles.field}
              fullWidth
              variant="outlined"
              type="number"
              onChange={e =>
                setLimitCount({
                  ...limitCount,
                  limit: parseInt(e.target.value),
                })
              }
            />
            <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginRight: '10px' }}
                disabled={btnDisabled}
                onClick={updateLimitCount}
              >
                儲存
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ background: 'red' }}
                disabled={btnDisabled}
                onClick={() => {
                  setModalOpen(false)
                }}
              >
                取消
              </Button>
            </Grid>
          </Fragment>}
      </Fragment>}

      {(modaltype === 'event') && <Fragment>
        <div css={styles.eventWrap} className='MuiTypography-body1'>
          <div>{`時間: ${format(new Date(editOrder.date), 'yyyy/MM/dd  HH:mm')}`}</div>
          <div>{`事件時長: ${findTimeCost(editOrder.timeCost)}`}</div>
          <div className='info'>
            <div>事件說明:</div>
            <TextField
              multiline
              variant='outlined'
              inputProps={{
                readOnly: true
              }}
              value={editOrder.customer.name}
            />
          </div>
        </div>
        <Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </Grid>
      </Fragment>}
      {(modaltype === 'message') && (
        <>
          <p>尚須多久時間完成服務(將會通知下位顧客新的到店時間)</p>
          <div style={{ padding: '12px 0px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ThemeProvider theme={themes}>
              {timeArr.map(({ label, value }) => (
                <Button
                  style={{ color: 'white' }}
                  key={label}
                  variant='contained'
                  color={delayTime === value ? 'primary' : 'secondary'}
                  onClick={() => setDelayTime(value)}
                >{label}</Button>
              ))}
            </ThemeProvider>
          </div>
          <Grid container justifyContent='flex-end'>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={btnDisabled}
              style={{ marginRight: '10px' }}
              onClick={handleSetDelayBookingTime}
            >
              儲存
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={btnDisabled}
              onClick={() => {
                setModalOpen(false)
              }}
            >
              關閉
            </Button>
          </Grid>
        </>
      )}
      <PasswordDialog
        open={dialogOpen}
        title='取消預約'
        inputLabel='取消預約密碼'
        handleOnCancel={closePassworDialog}
        handleOnConfirm={() => handleAcceptBooking(false)}
        isLoading={btnDisabled}
        inputOnChange={value => setPassword(value)}
      />
    </DialogContent>
  )
}
