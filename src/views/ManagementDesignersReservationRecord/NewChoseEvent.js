import { Button } from 'ui/button'
import { useState, Fragment } from 'react'
// 外層為相容層 Dialog（OrderTable；窗內有相容層 PasswordDialog）；內容區、動作列與按鈕改原生元素＋ui/button
import { Avatar } from 'ui/avatar'
import { Cancel as CancelIcon, Check as CheckIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, EventSeat as EventSeatIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import useFetchSetBookingNoShow from 'hooks/useFetchSetBookingNoShow'
import useFetchAdminBookingTime, { useFetchAdminBookingTimeAllStore } from 'hooks/useFetchAdminBookingTime'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import PasswordDialog from 'components/PasswordDialog'
import _ from 'lodash'

// 動作列（原 ListItemButton）：整列可點、左側頭像＋文字；hover surface-hover、停用 40% 透明
const actionRow = 'ui-root flex min-h-12 w-full items-center gap-4 rounded-md border-0 bg-transparent px-4 py-2 text-left text-body text-text no-underline transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40 aria-disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-accent'

// 原 emotion styles.field（width 100%、marginBottom 16px）：寬度 actionRow 已有 w-full，只補下外距
const fieldRow = `${actionRow} mb-[16px]`

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
    <div className="flex-auto overflow-y-auto px-6 py-4">
      {(modaltype === 'defaultAll' || modaltype === 'openAllOrder') && <Fragment>
        <RouterLink
          className="block text-text no-underline"
          to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`}
        >
          <div className={fieldRow}>
            <Avatar className="bg-accent/8 text-accent">
              <EventSeatIcon />
            </Avatar>
            <span className="min-w-0 flex-1">新預約</span>
          </div>
        </RouterLink>
        {!checkinMode && (modaltype === 'openAllOrder' ? 
          <button type="button" className={fieldRow} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockOpenIcon />
            </Avatar>
            <span className="min-w-0 flex-1">開啟全店預約</span>
          </button>
          :
          <button type="button" className={fieldRow} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockIcon />
            </Avatar>
            <span className="min-w-0 flex-1">關閉全店預約</span>
          </button>
        )}
        
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            type="submit"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </div>
      </Fragment>}
      {(modaltype === 'default' || modaltype === 'openOrder') && <Fragment>
        <RouterLink
          className="block text-text no-underline"
          to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`}
        >
          <div className={fieldRow}>
            <Avatar className="bg-accent/8 text-accent">
              <EventSeatIcon />
            </Avatar>
            <span className="min-w-0 flex-1">新預約</span>
          </div>
        </RouterLink>
        {!checkinMode && (modaltype === 'openOrder' ? 
          <button type="button" className={fieldRow} onClick={closeOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockOpenIcon />
            </Avatar>
            <span className="min-w-0 flex-1">開啟預約</span>
          </button>
          :
          <button type="button" className={fieldRow} onClick={closeOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockIcon />
            </Avatar>
            <span className="min-w-0 flex-1">關閉預約</span>
          </button>
        )}
        
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            type="submit"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </div>
      </Fragment>}
      {(modaltype === 'orderCheck' || modaltype === 'orderSuccess') && <Fragment>
        <div className="mb-[0.35em] text-body text-text [&_div]:break-all">
          <div>
            <p>{`姓名: `}
              <RouterLink
                className="text-text underline"
                to={`/management/customers/${editOrder.customer.id}/invoices`}
                target="_blank" >
                {editOrder.customer.name}
              </RouterLink>
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
        <div className="flex flex-col py-2">
          {modaltype === 'orderSuccess' && (
            <RouterLink
              className="block text-text no-underline"
              to={`/order/${editOrder.id}?status=edit`}
              target="_blank"
            >
              <div className={fieldRow}>
                <Avatar className="bg-accent/8 text-accent">
                  <EditIcon />
                </Avatar>
                <span className="min-w-0 flex-1">編輯</span>
              </div>
            </RouterLink>
          )}
          <RouterLink
            className="block text-text no-underline"
            to={`/order/${editOrder.id}?status=checkout`}
            target="_blank"
          >
            <div className={fieldRow}>
              <Avatar className="bg-accent/8 text-accent">
                <ShoppingCartIcon />
              </Avatar>
              <span className="min-w-0 flex-1">結帳</span>
            </div>
          </RouterLink>

          {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
            <button type="button" className={fieldRow} onClick={() => handleAcceptBooking(true)}>
              <Avatar className="bg-accent/8 text-accent">
                <CheckIcon />
              </Avatar>
              <span className="min-w-0 flex-1">接受預約</span>
            </button>
          )}
          {editOrder.status !== '設計師已取消' && (
            <button type="button" className={fieldRow} onClick={() => cancelPasswordUsing ? openPassworDialog('cancel') : handleAcceptBooking(false)}>
              <Avatar className="bg-accent/8 text-accent">
                <CancelIcon />
              </Avatar>
              <span className="min-w-0 flex-1">取消預約</span>
            </button>
          )}
          <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => handleSetBookingNoShow()}>
            <Avatar className="bg-accent/8 text-accent">
              <EventBusyIcon />
            </Avatar>
            <span className="min-w-0 flex-1">{`${editOrder.isNoShow ? '取消未出席' : '未出席'}`}</span>
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            type="submit"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </div>
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
    </div>
  )
}
