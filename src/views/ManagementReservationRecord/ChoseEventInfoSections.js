import { Fragment } from 'react'
import { Button } from 'ui/button'
import { TextField } from 'ui/text-field'
import { format } from 'date-fns'
import { styles, timeArr } from './choseEventConstants'

// 預約彈窗（ChoseEvent）的事件內容與延遲服務時間區塊：自 ChoseEvent.js 原樣搬出，state 與 handler 仍在 ChoseEvent，由 props 傳入；
// 在 ChoseEvent 原位置以相同條件渲染（{條件 && <區塊 />}），掛載／卸載時機與原本的 <Fragment> 相同

// 事件內容（event）
export function EventSection({ setModalOpen, editOrder, findTimeCost }) {
  return (
    <Fragment>
      <div className={`MuiTypography-body1 ${styles.eventWrap}`}>
        <div>{`時間: ${format(new Date(editOrder.date), 'yyyy/MM/dd  HH:mm')}`}</div>
        <div>{`事件時長: ${findTimeCost(editOrder.timeCost)}`}</div>
        <div className="info">
          <div>事件說明:</div>
          <TextField
            multiline
            variant="outlined"
            inputProps={{
              readOnly: true,
            }}
            value={editOrder.customer.name}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          type="submit"
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

// 延遲服務時間（message）
export function DelayMessageSection({ setModalOpen, btnDisabled, delayTime, setDelayTime, handleSetDelayBookingTime }) {
  return (
    <>
      <p>尚須多久時間完成服務(將會通知下位顧客新的到店時間)</p>
      <div style={{ padding: '12px 0px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {timeArr.map(({ label, value }) => (
          <Button key={label} variant={delayTime === value ? 'primary' : 'secondary'} onClick={() => setDelayTime(value)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="primary" type="submit" disabled={btnDisabled} onClick={handleSetDelayBookingTime}>
          儲存
        </Button>
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
    </>
  )
}
