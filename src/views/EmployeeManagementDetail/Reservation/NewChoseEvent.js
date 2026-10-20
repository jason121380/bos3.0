/** @jsxImportSource @emotion/react */
import React, { useState, Fragment } from 'react'
// 外層為相容層 Dialog（OrderTable）；內容區與動作列（原 List / ListItemButton / Link）改原生元素＋react-router Link
import { Avatar } from 'ui/avatar'
import { Button } from 'ui/button'
import { blue } from 'ui/colors'
import { Cancel as CancelIcon, Check as CheckIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, EventSeat as EventSeatIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import useFetchAdminBookingTime, { useFetchAdminBookingTimeAllStore } from 'hooks/useFetchAdminBookingTime'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

// 動作列（原 ListItemButton）：整列可點、左側頭像＋文字；hover surface-hover、停用 40% 透明
const actionRow = 'ui-root flex min-h-12 w-full items-center gap-4 rounded-md border-0 bg-transparent px-4 py-2 text-left text-body text-text no-underline transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40 aria-disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-accent'

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
  merchantId, setModalOpen, clickData, modaltype,
  editOrder, refetchData, checkinSettings, checkinMode
}) {
  const { adminBookingTime } = useFetchAdminBookingTime()
  const { adminBookingTimeAllStore } = useFetchAdminBookingTimeAllStore()
  const { verifyBooking } = useFetchVerifyBooking()
  const [btnDisabled, setBtnDisabled] = useState(false)

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
        }
        setModalOpen(false)
      }
    }).catch(error => {
      setBtnDisabled(false)
      openSnackbar({ message: error.message, variant: 'error' })
    })
  }

  return (
    <div className="flex-auto overflow-y-auto px-6 py-4">
      {(modaltype === 'defaultAll' || modaltype === 'openAllOrder') && <Fragment>
        <RouterLink
          className="block text-text no-underline"
          to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`}
        >
          <div className={actionRow} css={styles.field}>
            <Avatar className="bg-accent/8 text-accent">
              <EventSeatIcon />
            </Avatar>
            <span className="min-w-0 flex-1">新預約</span>
          </div>
        </RouterLink>
        {!checkinMode && (modaltype === 'openAllOrder' ? 
          <button type="button" className={actionRow} css={styles.field} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockOpenIcon />
            </Avatar>
            <span className="min-w-0 flex-1">開啟全店預約</span>
          </button>
          :
          <button type="button" className={actionRow} css={styles.field} onClick={closeAllOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockIcon />
            </Avatar>
            <span className="min-w-0 flex-1">關閉全店預約</span>
          </button>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
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
          <div className={actionRow} css={styles.field}>
            <Avatar className="bg-accent/8 text-accent">
              <EventSeatIcon />
            </Avatar>
            <span className="min-w-0 flex-1">新預約</span>
          </div>
        </RouterLink>
        {!checkinMode && (modaltype === 'openOrder' ? 
          <button type="button" className={actionRow} css={styles.field} onClick={closeOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockOpenIcon />
            </Avatar>
            <span className="min-w-0 flex-1">開啟預約</span>
          </button>
          :
          <button type="button" className={actionRow} css={styles.field} onClick={closeOrderTime} disabled={btnDisabled}>
            <Avatar className="bg-accent/8 text-accent">
              <LockIcon />
            </Avatar>
            <span className="min-w-0 flex-1">關閉預約</span>
          </button>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
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
        <div className="mb-2 text-body text-text" css={styles.breakWord}>
          <div>{`姓名: ${editOrder.customer.name}`}</div>
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
        </div>
        <div className="flex flex-col py-2">
          {modaltype === 'orderSuccess' && (
            <RouterLink
              className="block text-text no-underline"
              to={`/order/${editOrder.id}?status=edit`}
              target="_blank"
            >
              <div className={actionRow}>
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
            <div className={actionRow}>
              <Avatar className="bg-accent/8 text-accent">
                <ShoppingCartIcon />
              </Avatar>
              <span className="min-w-0 flex-1">結帳</span>
            </div>
          </RouterLink>

          {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
            <button type="button" className={actionRow} onClick={() => handleAcceptBooking(true)}>
              <Avatar className="bg-accent/8 text-accent">
                <CheckIcon />
              </Avatar>
              <span className="min-w-0 flex-1">接受預約</span>
            </button>
          )}
          {editOrder.status !== '設計師已取消' && (
            <button type="button" className={actionRow} onClick={() => handleAcceptBooking(false)}>
              <Avatar className="bg-accent/8 text-accent">
                <CancelIcon />
              </Avatar>
              <span className="min-w-0 flex-1">取消預約</span>
            </button>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
            disabled={btnDisabled}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </div>
      </Fragment>}
    </div>
  )
}
