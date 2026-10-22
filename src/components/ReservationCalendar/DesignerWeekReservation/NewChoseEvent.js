import { DialogBody } from 'ui/dialog'
import React, { useState, Fragment } from 'react'
// 動作清單改原生元素：有 onClick 的列為原生 <button>；連往帳單／新預約的列由 react-router Link 本身當可點元素（列內不再巢狀按鈕）
import { cn, focusRing } from 'ui/utils'
import { Avatar } from 'ui/avatar'
import { Cancel as CancelIcon, Check as CheckIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, EventSeat as EventSeatIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { format } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import useFetchAdminBookingTime, { useFetchAdminBookingTimeAllStore } from 'hooks/useFetchAdminBookingTime'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'

// 動作列（原清單按鈕列：上下 8px、左右 16px，hover surface-hover，停用 38% 透明）
const rowClass = cn(
  'flex w-full min-w-0 cursor-pointer select-none items-center border-0 bg-transparent px-4 py-2 text-left text-inherit no-underline transition-colors hover:bg-surface-hover',
  'disabled:pointer-events-none disabled:cursor-default disabled:opacity-[0.38]',
  focusRing
)
const linkClass = cn('block rounded-md text-inherit no-underline', focusRing)
// 原頭像欄（最小寬 56px）＋文字欄（16px 主文字色、上下 4px）
const AvatarSlot = ({ children }) => <span className="inline-flex min-w-[56px] shrink-0">{children}</span>
const RowText = ({ primary }) => <span className="my-1 min-w-0 flex-1 text-body text-text">{primary}</span>

export default function NewChoseEvent({
  merchantId, setModalOpen, clickData, modaltype, checkinMode,
  editOrder, refetchData, checkinSettings
}) {
  const { adminBookingTime } = useFetchAdminBookingTime()
  const { adminBookingTimeAllStore } = useFetchAdminBookingTimeAllStore()
  const { verifyBooking } = useFetchVerifyBooking()
  const [btnDisabled, setBtnDisabled] = useState(false)
  // 送出中（等後端回應）：「取消／關閉」只在這段期間停用。後端回應但沒回 id 時結果不明，動作鈕（btnDisabled）維持停用避免重複送出，
  // 「取消／關閉」恢復可按（原本也一起停用，只能按 Esc／點背景關；Jason 2026/10/22 fix all）
  const [pending, setPending] = useState(false)

  const closeAllOrderTime = () => {
    setBtnDisabled(true)
    setPending(true)
    adminBookingTimeAllStore({
      datetime: clickData.dateTime,
      appointable: modaltype === 'openAllOrder' ? true : false,
    })
      .then(res => {
        setPending(false)
        if (res.data.adminBookingTimeAllStore.storeId) {
          refetchData()
          openSnackbar({ message: '變更成功', variant: 'success' })
          setModalOpen(false)
        }
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setBtnDisabled(false)
        setPending(false)
      })
  }

  const closeOrderTime = () => {
    setBtnDisabled(true)
    setPending(true)
    adminBookingTime({
      appointable: modaltype === 'openOrder' ? true : false,
      datetime: clickData.dateTime,
      designerId: clickData.designerId,
    })
      .then(res => {
        setPending(false)
        if (res.data.adminBookingTime.designerId) {
          refetchData()
          openSnackbar({ message: '變更成功', variant: 'success' })
          setModalOpen(false)
        }
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setBtnDisabled(false)
        setPending(false)
      })
  }

  const handleAcceptBooking = status => {
    setBtnDisabled(true)
    setPending(true)
    verifyBooking({
      orderId: editOrder.id,
      isApproval: status,
    }).then(res => {
      setPending(false)
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
      setPending(false)
      openSnackbar({ message: error.message, variant: 'error' })
    })
  }

  return (
    <DialogBody className="py-4">
      {(modaltype === 'defaultAll' || modaltype === 'openAllOrder') && <Fragment>
        <RouterLink to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`} className={linkClass}>
          <span className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <EventSeatIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="新預約" />
          </span>
        </RouterLink>
        {!checkinMode && (modaltype === 'openAllOrder' ? 
          <button type="button" onClick={closeAllOrderTime} disabled={btnDisabled} className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <LockOpenIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="開啟全店預約" />
          </button>
          :
          <button type="button" onClick={closeAllOrderTime} disabled={btnDisabled} className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <LockIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="關閉全店預約" />
          </button>
        )}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </div>
      </Fragment>}
      {(modaltype === 'default' || modaltype === 'openOrder') && <Fragment>
        <RouterLink to={`/customer/reservation/${merchantId}?usingLineLogin=0&date=${clickData.dateTime}&designerId=${!!clickData.designerId ? clickData.designerId : ''}`} className={linkClass}>
          <span className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <EventSeatIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="新預約" />
          </span>
        </RouterLink>
        {!checkinMode && (modaltype === 'openOrder' ? 
          <button type="button" onClick={closeOrderTime} disabled={btnDisabled} className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <LockOpenIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="開啟預約" />
          </button>
          :
          <button type="button" onClick={closeOrderTime} disabled={btnDisabled} className={cn(rowClass, 'mb-4')}>
            <AvatarSlot>
              <Avatar className="bg-accent/8 text-accent">
                <LockIcon />
              </Avatar>
            </AvatarSlot>
            <RowText primary="關閉預約" />
          </button>
        )}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            取消
          </Button>
        </div>
      </Fragment>}
      {(modaltype === 'orderCheck' || modaltype === 'orderSuccess') && <Fragment>
        <div className="mb-2 text-body text-text [&_div]:break-all">
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
        <div className="py-2">
          {modaltype === 'orderSuccess' && (
            <RouterLink to={`/order/${editOrder.id}?status=edit`} target="_blank" className={linkClass}>
              <span className={rowClass}>
                <AvatarSlot>
                  <Avatar className="bg-accent/8 text-accent">
                    <EditIcon />
                  </Avatar>
                </AvatarSlot>
                <RowText primary="編輯" />
              </span>
            </RouterLink>
          )}
          <RouterLink to={`/order/${editOrder.id}?status=checkout`} target="_blank" className={linkClass}>
            <span className={rowClass}>
              <AvatarSlot>
                <Avatar className="bg-accent/8 text-accent">
                  <ShoppingCartIcon />
                </Avatar>
              </AvatarSlot>
              <RowText primary="結帳" />
            </span>
          </RouterLink>

          {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
            <button type="button" onClick={() => handleAcceptBooking(true)} className={rowClass}>
              <AvatarSlot>
                <Avatar className="bg-accent/8 text-accent">
                  <CheckIcon />
                </Avatar>
              </AvatarSlot>
              <RowText primary="接受預約" />
            </button>
          )}
          {editOrder.status !== '設計師已取消' && (
            <button type="button" onClick={() => handleAcceptBooking(false)} className={rowClass}>
              <AvatarSlot>
                <Avatar className="bg-accent/8 text-accent">
                  <CancelIcon />
                </Avatar>
              </AvatarSlot>
              <RowText primary="取消預約" />
            </button>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setModalOpen(false)
            }}
          >
            關閉
          </Button>
        </div>
      </Fragment>}
    </DialogBody>
  )
}
