/** @jsxImportSource @emotion/react */
import { Grid } from 'ui/grid-compat'
import { Button } from 'ui/button-compat'
import { useState, Fragment } from 'react'
import { DialogContent, Link, List, ListItemButton, ListItemAvatar, ListItemText } from '@mui/material'
import { Avatar } from 'ui/avatar'
import { blue } from 'ui/colors'
import { Cancel as CancelIcon, Check as CheckIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, EventSeat as EventSeatIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSetBookingNoShow from 'hooks/useFetchSetBookingNoShow'
import useFetchAdminBookingTime, { useFetchAdminBookingTimeAllStore } from 'hooks/useFetchAdminBookingTime'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import PasswordDialog from 'components/PasswordDialog'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
    width: '100%',
    marginBottom: theme.spacing(2),
  }),
  dialog: css({
    maxWidth: '400px',
  }),
  breakWord: css({
    '& div': {
      wordBreak: 'break-all'
    }
  })
}

export default function NewChoseEvent({
  merchantId, setModalOpen, clickData, modaltype, checkinMode,
  editOrder, refetchData, checkinSettings, cancelPasswordUsing
}) {
  const { adminBookingTime } = useFetchAdminBookingTime()
  const { adminBookingTimeAllStore } = useFetchAdminBookingTimeAllStore()
  const { verifyBooking } = useFetchVerifyBooking()
  const { setBookingNoShow } = useFetchSetBookingNoShow()
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState('')

  const closeAllOrderTime = () => {
    setBtnDisabled(true)
    adminBookingTimeAllStore({
      datetime: clickData.dateTime,
      appointable: modaltype === 'openAllOrder' ? true : false,
    })
      .then(res => {
        if (res.data.adminBookingTimeAllStore.storeId) {
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
      {(modaltype === 'defaultAll' || modaltype === 'openAllOrder') && <Fragment>
        <Link
          component={RouterLink}
          to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`}
        >
          <ListItemButton css={styles.field}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <EventSeatIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="新預約" />
          </ListItemButton>
        </Link>
        {!checkinMode && (modaltype === 'openAllOrder' ? 
          <ListItemButton css={styles.field} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <LockOpenIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="開啟全店預約" />
          </ListItemButton>
          :
          <ListItemButton css={styles.field} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <LockIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="關閉全店預約" />
          </ListItemButton>
        )}
        
        <Grid container justifyContent="flex-end" style={{ display: 'flex' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </Grid>
      </Fragment>}
      {(modaltype === 'default' || modaltype === 'openOrder') && <Fragment>
        <Link
          component={RouterLink}
          to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`}
        >
          <ListItemButton css={styles.field}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <EventSeatIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="新預約" />
          </ListItemButton>
        </Link>
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
        
        <Grid container justifyContent="flex-end" style={{ display: 'flex' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </Grid>
      </Fragment>}
      {(modaltype === 'orderCheck' || modaltype === 'orderSuccess') && <Fragment>
        <div css={styles.breakWord} className="mb-[0.35em] text-body text-text">
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
        <List style={{ display: 'flex', flexDirection: 'column' }}>
          {modaltype === 'orderSuccess' && (
            <Link
              color="inherit"
              component={RouterLink}
              to={`/order/${editOrder.id}?status=edit`}
              variant="h6"
              target="_blank"
              underline='none'
            >
              <ListItemButton css={styles.field}>
                <ListItemAvatar>
                  <Avatar className="bg-accent/8 text-accent">
                    <EditIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="編輯" />
              </ListItemButton>
            </Link>
          )}
          <Link
            color="inherit"
            component={RouterLink}
            to={`/order/${editOrder.id}?status=checkout`}
            variant="h6"
            target="_blank"
            underline='none'
          >
            <ListItemButton css={styles.field}>
              <ListItemAvatar>
                <Avatar className="bg-accent/8 text-accent">
                  <ShoppingCartIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="結帳" />
            </ListItemButton>
          </Link>

          {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
            <ListItemButton css={styles.field} onClick={() => handleAcceptBooking(true)}>
              <ListItemAvatar>
                <Avatar className="bg-accent/8 text-accent">
                  <CheckIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="接受預約" />
            </ListItemButton>
          )}
          {editOrder.status !== '設計師已取消' && (
            <ListItemButton css={styles.field} onClick={() => cancelPasswordUsing ? openPassworDialog('cancel') : handleAcceptBooking(false)}>
              <ListItemAvatar>
                <Avatar className="bg-accent/8 text-accent">
                  <CancelIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="取消預約" />
            </ListItemButton>
          )}
          <ListItemButton disabled={btnDisabled} onClick={() => handleSetBookingNoShow()}>
            <ListItemAvatar>
              <Avatar className="bg-accent/8 text-accent">
                <EventBusyIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${editOrder.isNoShow ? '取消未出席' : '未出席'}`} />
          </ListItemButton>
        </List>
        <Grid container justifyContent="flex-end" style={{ display: 'flex' }}>
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
