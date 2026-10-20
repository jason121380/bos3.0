import { FormControl, MenuItem, Select, InputLabel } from 'ui/form-control'
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { openSnackbar } from 'elements/snackbars'
import { format, startOfDay, addMinutes, setHours } from 'date-fns'
import useFetchBooking from 'hooks/useFetchBooking'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import { MobileDatePicker } from 'ui/date-picker'
import _ from 'lodash'
// 外層為相容層 Dialog（CustomerInfo；窗內有日期選擇器、Select、Autocomplete）；內容區改原生 div，表單細節維持原樣，底部動作按鈕為 ui/button
import { Button as UiButton } from 'ui/button'

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

export default function ChoseEvent({ setModalOpen, cellphone, bookingCusCheck }) {
  const { booking } = useFetchBooking()
  const [bookTimeOption, setBookTimeOption] = useState([])
  const [btnDisabled, setBtnDisabled] = useState(false)

  useEffect(() => {
    const start = startOfDay(new Date()).getTime()
    const arr = []
    for (let i = 0; i < 48; i++) {
      arr.push(addMinutes(start, i * 30).getTime())
    }
    setBookTimeOption(arr)
  }, [])

  const [values, setValues] = useState({
    merchantId: JSON.parse(localStorage.getItem('userMerchant')).id,
    dateTime: setHours(startOfDay(new Date()),10).getTime(),
    designerId: '',
    name: cellphone,
    cellphone: cellphone,
    friends: [],
    designerServiceIds: [],
    remark: '',
    remarkForCustomer: '',
    timeCost: 1,
    isBookingCostUsing: true,
    isCusCheckRequired: false
  })

  const createBooking = () => {
    if (values.designerId === '') {
      openSnackbar({
        message: '請選擇設計師',
        variant: 'warning',
      })
      return
    }
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
    const submitData = {
      ...values,
      designerId: values.designerId.id
    }
    booking(submitData).then((res) => {
      if (res.data.bookingV2.id) {
        openSnackbar({ message: '預約成功', variant: 'success' })
        setModalOpen(false)
      }
    }).catch(error => {
      openSnackbar({ message: error.message, variant: 'error' })
      setBtnDisabled(false)
    })
  }

  return (
    <div className="flex-auto overflow-y-auto px-6 py-4">
      <div className="mb-4 flex items-end">
        <MobileDatePicker
          value={values.dateTime}
          className="[&_input]:!px-0 [&_input]:!pb-[7px] [&_input]:!pt-[6px]"
          label='預約時間'
          onChange={(value) => {
            const data = _.cloneDeep(values)
            data.dateTime = new Date(value).getTime()
            setValues(data)
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
        {bookTimeOption.length && (
          <FormControl variant='standard' className="[&_input]:!px-0 [&_input]:!pb-[7px] [&_input]:!pt-[6px]">
            <Select
              value={values.dateTime}
              sx={{ paddingRight: '24px' }}
              onChange={event => setValues({ ...values, dateTime: event.target.value })}
            >
              {bookTimeOption.map(time => (
                <MenuItem value={time} key={time}>
                  {format(time, 'HH:mm')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <BookingRecordListAutoComplete
        className="!mb-4"
        label="服務人員姓名/編號"
        value={values.designerId}
        onChange={value => {
          const data = _.cloneDeep(values)
          data.designerId = { id: value.id === '' ? '' : value.userId }
          setValues(data)
        }}
      />
      <FormControl
        fullWidth
        className="!mb-4"
        variant='outlined'
      >
        <InputLabel>服務時長</InputLabel>
        <Select
          label='服務時長'
          fullWidth
          value={values.timeCost}
          onChange={event => setValues({ ...values, timeCost: event.target.value })}
        >
          {timeCostArray.map(d => (
            <MenuItem key={`${d.value}-${d.label}`} value={d.value}>{d.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="備註"
        value={values.remark}
        className="!mb-4"
        fullWidth
        variant="outlined"
        onChange={e => {
          setValues({ ...values, remark: e.target.value })
        }}
      />
      <TextField
        label="顧客備註"
        value={values.remarkForCustomer}
        className="!mb-4"
        fullWidth
        variant="outlined"
        onChange={e => {
          setValues({ ...values, remarkForCustomer: e.target.value })
        }}
      />
      <div>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="佔用顧客端預約名額"
          checked={values.isBookingCostUsing}
          onChange={() => setValues({ ...values, isBookingCostUsing: !values.isBookingCostUsing })}
        />
      </div>
      {bookingCusCheck && (
        <div>
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="未來預訂(待確認)"
            checked={values.isCusCheckRequired}
            onChange={() => setValues({ ...values, isCusCheckRequired: !values.isCusCheckRequired })}
          />
        </div>
      )}

      <div className="ui-root flex justify-end gap-2 pt-2">
        <UiButton
          type="submit"
          variant="primary"
          disabled={btnDisabled}
          onClick={() => {
            createBooking()
          }}
        >
          預約
        </UiButton>
        <UiButton
          type="submit"
          variant="secondary"
          disabled={btnDisabled}
          onClick={() => {
            setModalOpen(false)
          }}
        >
          取消
        </UiButton>
      </div>
    </div>
  )
}
