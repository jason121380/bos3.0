import React, { Fragment } from 'react'
import { Button } from 'ui/button'
import { Avatar } from 'ui/avatar'
import { CheckboxField } from 'ui/checkbox'
import { Cancel as CancelIcon, Check as CheckIcon, Edit as EditIcon, ShoppingCart as ShoppingCartIcon, AssignmentTurnedIn as AssignmentTurnedInIcon, Message as MessageIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { format } from 'date-fns'
import { Link as RouterLink } from 'react-router-dom'
import { actionRow, styles } from './choseEventConstants'

// 預約彈窗（ChoseEvent）的預約明細區塊：自 ChoseEvent.js 原樣搬出，state 與 handler 仍在 ChoseEvent，由 props 傳入；
// 在 ChoseEvent 原位置以相同條件渲染（{條件 && <區塊 />}），掛載／卸載時機與原本的 <Fragment> 相同

// 預約明細與操作（editOrder）
export function EditOrderSection({
  setModalOpen,
  setModalType,
  editOrder,
  checkinSettings,
  bookingCusCheck,
  cancelPasswordUsing,
  btnDisabled,
  handleAcceptBooking,
  handleSetBookingCusCheckRequired,
  handleCheckIn,
  handleCancelCheckIn,
  handleSetBookingNoShow,
  openPassworDialog,
}) {
  return (
    <Fragment>
      <div className={`MuiTypography-body1 ${styles.breakWord}`}>
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
        {editOrder.status !== '已完成' && editOrder.status !== '設計師已取消' && (
          <React.Fragment>
            <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => { setModalType('editOrderDetail') }}>
              <Avatar className="bg-accent/8 text-accent">
                <EditIcon />
              </Avatar>
              <span className="min-w-0 flex-1">編輯</span>
            </button>
            <RouterLink
              className="block text-text no-underline"
              disabled={btnDisabled}
              to={`/order/${editOrder.id}?status=checkout`}
              target="_blank"
            >
              {editOrder.status === '預約成功' && (
                <div className={actionRow} aria-disabled={btnDisabled}>
                  <Avatar className="bg-accent/8 text-accent">
                    <ShoppingCartIcon />
                  </Avatar>
                  <span className="min-w-0 flex-1">結帳</span>
                </div>
              )}
            </RouterLink>
          </React.Fragment>
        )}

        {editOrder.status !== '預約成功' && editOrder.status !== '已完成' && (
          <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => handleAcceptBooking(true)}>
            <Avatar className="bg-accent/8 text-accent">
              <CheckIcon />
            </Avatar>
            <span className="min-w-0 flex-1">接受預約</span>
          </button>
        )}

        {editOrder.status !== '設計師已取消' && (
          <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => cancelPasswordUsing ? openPassworDialog('cancel') : handleAcceptBooking(false)}>
            <Avatar className="bg-accent/8 text-accent">
              <CancelIcon />
            </Avatar>
            <span className="min-w-0 flex-1">取消預約</span>
          </button>
        )}
        {(checkinSettings.isBookingCheckinEnabled && editOrder.isCheckin !== null) && (
          <>
            <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => editOrder.isCheckin ? handleCancelCheckIn() : handleCheckIn()}>
              <Avatar className="bg-accent/8 text-accent">
                <AssignmentTurnedInIcon />
              </Avatar>
              <span className="min-w-0 flex-1">{editOrder.isCheckin ? '取消報到' : '報到'}</span>
            </button>
            {checkinSettings.isUnDoneBookingManualNotify && (
              <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => setModalType('message')}>
                <Avatar className="bg-accent/8 text-accent">
                  <MessageIcon />
                </Avatar>
                <span className="min-w-0 flex-1">延遲服務時間</span>
              </button>
            )}
          </>
        )}
        <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => handleSetBookingNoShow()}>
          <Avatar className="bg-accent/8 text-accent">
            <EventBusyIcon />
          </Avatar>
          <span className="min-w-0 flex-1">{`${editOrder.isNoShow ? '取消未出席' : '未出席'}`}</span>
        </button>
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
    </Fragment>
  )
}
