import { Fragment } from 'react'
import { Button } from 'ui/button'
import { FormControl, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { Avatar } from 'ui/avatar'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { AssignmentTurnedIn as AssignmentTurnedInIcon } from 'ui/icons'
import { format } from 'date-fns'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import { MobileDatePicker } from 'ui/date-picker'
import cloneDeep from 'lodash/cloneDeep'
import { actionRow, styles, designate, timeCostArray } from './choseEventConstants'

// 預約時間的時段下拉與 standard 變體的 MobileDatePicker 並排、使用 ui/form-control 原生 Select；舊 .MuiSelect-select 樣式不再命中
// 預約彈窗（ChoseEvent）的編輯預約區塊：自 ChoseEvent.js 原樣搬出，state 與 handler 仍在 ChoseEvent，由 props 傳入；
// 在 ChoseEvent 原位置以相同條件渲染（{條件 && <區塊 />}），掛載／卸載時機與原本的 <Fragment> 相同

// 編輯預約（editOrderDetail／editNdsOrder）
export function EditOrderDetailSection({
  setModalOpen,
  modaltype,
  editOrder,
  setEditOrder,
  checkinSettings,
  bookingCusCheck,
  bookTimeOption,
  btnDisabled,
  handleUpdateEditOrder,
  handleSetBookingCusCheckRequired,
  handleCheckIn,
  handleCancelCheckIn,
}) {
  return (
    <Fragment>
      <div className={styles.field} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ToggleGroup
          size="small"
          value={editOrder.isDesignate}
          onChange={() => {
            const data = cloneDeep(editOrder)
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
      <div className={styles.field2}>
        <MobileDatePicker
          value={editOrder.date}
          className={styles.datepicker}
          label='預約時間'
          onChange={(value) => {
            const data = cloneDeep(editOrder)
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
        <FormControl variant='standard' className={styles.datepicker}>
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
      <div className={styles.field}>
        <CustomerAutoComplete
          label="顧客姓名/手機號碼/編號"
          value={editOrder.customer.id}
          onChange={value => {
            const data = cloneDeep(editOrder)
            data.customer.id = value.id === '' ? '' : value.id
            setEditOrder(data)
          }}
        />
      </div>
      <div className={styles.field}>
        <BookingRecordListAutoComplete
          label="服務人員姓名/編號"
          value={!!editOrder.designer ? editOrder.designer.id : ''}
          onChange={value => {
            const data = cloneDeep(editOrder)
            data.designer = { id: value.id === '' ? '' : value.userId }
            setEditOrder(data)
          }}
        />
      </div>
      <Field label='服務時長'>
        <NativeSelect
          className={`ui-root ${styles.field}`}
          value={editOrder.timeCost}
          onChange={event => setEditOrder({ ...editOrder, timeCost: event.target.value })}
        >
          {timeCostArray.map(d => (
            <NativeSelectOption key={`${d.value}-${d.label}`} value={d.value}>{d.label}</NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <TextField
        className={styles.field}
        value={editOrder.remark}
        label="備註"
        fullWidth
        variant="outlined"
        onChange={e => {
          const data = cloneDeep(editOrder)
          data.remark = e.target.value
          setEditOrder(data)
        }}
      />
      <TextField
        className={styles.field}
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
        className={styles.field}
        value={editOrder.notificationDayCount || ''}
        InputProps={{ inputProps: { min: 1 } }}
        onFocus={e => e.target.select()}
        onChange={e => {
          const value = Number(e.target.value) < 1 ? null : Number(e.target.value) 
          const data = cloneDeep(editOrder)
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
        <button type="button" className={actionRow} disabled={btnDisabled} onClick={() => editOrder.isCheckin ? handleCancelCheckIn() : handleCheckIn()}>
          <Avatar className="bg-accent/8 text-accent">
            <AssignmentTurnedInIcon />
          </Avatar>
          <span className="min-w-0 flex-1">{editOrder.isCheckin ? '取消報到' : '報到'}</span>
        </button> 
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="primary"
          type="submit"
          disabled={btnDisabled}
          onClick={handleUpdateEditOrder}
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
          關閉
        </Button>
      </div>
    </Fragment>
  )
}
