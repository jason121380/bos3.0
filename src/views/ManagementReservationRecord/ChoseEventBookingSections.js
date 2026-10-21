import { Fragment } from 'react'
import { Button } from 'ui/button'
import { TextField } from 'ui/text-field'
import { Avatar } from 'ui/avatar'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Lock as LockIcon, LockOpen as LockOpenIcon, Person as PersonIcon } from 'ui/icons'
import { format } from 'date-fns'
import { actionRow, styles, timeCostArray } from './choseEventConstants'

// 預約彈窗（ChoseEvent）的新增預約區塊：自 ChoseEvent.js 原樣搬出，state 與 handler 仍在 ChoseEvent，由 props 傳入；
// 在 ChoseEvent 原位置以相同條件渲染（{條件 && <區塊 />}），掛載／卸載時機與原本的 <Fragment> 相同

// 新增預約（default／openOrder）
export function NewBookingSection({
  setModalOpen,
  modaltype,
  bookingCusCheck,
  checkinMode,
  btnDisabled,
  values,
  setValues,
  closeOrderTime,
  createBooking,
}) {
  return (
    <Fragment>
      <TextField
        label="顧客電話"
        type="tel"
        value={values.cellphone}
        className={styles.field}
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
        className={styles.field}
        fullWidth
        variant="outlined"
        onChange={e => {
          setValues({ ...values, name: e.target.value })
        }}
        required
      />
      <Field label='服務時長'>
        <NativeSelect
          className={`ui-root ${styles.field}`}
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
        className={styles.field}
        fullWidth
        variant="outlined"
        onChange={e => {
          setValues({ ...values, remark: e.target.value })
        }}
      />
      <TextField
        label="顧客備註"
        value={values.remarkForCustomer}
        className={styles.field}
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
        <button type="button" className={`${actionRow} ${styles.field}`} onClick={closeOrderTime} disabled={btnDisabled}>
          <Avatar className="bg-accent/8 text-accent">
            <LockOpenIcon />
          </Avatar>
          <span className="min-w-0 flex-1">開啟預約</span>
        </button>
        :
        <button type="button" className={`${actionRow} ${styles.field}`} onClick={closeOrderTime} disabled={btnDisabled}>
          <Avatar className="bg-accent/8 text-accent">
            <LockIcon />
          </Avatar>
          <span className="min-w-0 flex-1">關閉預約</span>
        </button>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="primary"
          type="submit"
          disabled={btnDisabled}
          onClick={() => {
            createBooking()
          }}
        >
          預約
        </Button>
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
    </Fragment>
  )
}

// 不指定預約與可預約人數設定（ndsDefault）
export function NdsBookingSection({
  setModalOpen,
  clickData,
  bookingCusCheck,
  btnDisabled,
  orderLimit,
  setOrderLimit,
  limitCount,
  setLimitCount,
  values,
  setValues,
  updateLimitCount,
  createNdsBooking,
}) {
  return (
    <Fragment>
      <button
        type="button"
        className={`${actionRow} ${styles.field}`}
        onClick={() => { setOrderLimit(!orderLimit) }}
      >
        <Avatar className="bg-accent/8 text-accent">
          <PersonIcon />
        </Avatar>
        <span className="min-w-0 flex-1">{orderLimit ? '設定可預約人數上限' : '回到預約'}</span>
      </button>
      {orderLimit ? <Fragment>
        <TextField
          label="顧客電話"
          type="tel"
          value={values.cellphone}
          className={styles.field}
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
          className={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, name: e.target.value })
          }}
          required
        />
        <Field label='服務時長'>
          <NativeSelect
            className={`ui-root ${styles.field}`}
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
          className={styles.field}
          fullWidth
          variant="outlined"
          onChange={e => {
            setValues({ ...values, remark: e.target.value })
          }}
        />
        <TextField
          label="顧客備註"
          value={values.remarkForCustomer}
          className={styles.field}
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
        <div className="flex justify-end gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={btnDisabled}
            onClick={createNdsBooking}
          >
            預約
          </Button>
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
            className={styles.field}
            fullWidth
            variant="outlined"
            type="number"
            onChange={e =>
              setLimitCount({
                ...limitCount,
                limit: parseInt(e.target.value, 10),
              })
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={btnDisabled}
              onClick={updateLimitCount}
            >
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
              取消
            </Button>
          </div>
        </Fragment>}
    </Fragment>
  )
}
