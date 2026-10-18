/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  DialogContent, TextField, FormControl, MenuItem,
  Select, FormControlLabel, Checkbox, InputLabel,
} from '@mui/material'
import { blue } from '@mui/material/colors'
import { openSnackbar } from 'elements/snackbars'
import { format, startOfDay, addMinutes, setHours } from 'date-fns'
import useFetchBooking from 'hooks/useFetchBooking'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'
import { MobileDatePicker } from '@mui/x-date-pickers'
import _ from 'lodash'
import { css } from '@emotion/react'
// 大型表單：日期／下拉／Autocomplete 等細節保留 MUI，只換底部動作按鈕
import { Button as UiButton } from 'ui/button'
import { theme } from '../../../theme'

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
    <DialogContent dividers style={{ border: 'none' }}>
      <div css={styles.field2}>
        <MobileDatePicker
          value={values.dateTime}
          css={styles.datepicker}
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
          <FormControl variant='standard' css={styles.datepicker}>
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
        className={styles.field}
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
        css={styles.field}
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
    </DialogContent>
  )
}
