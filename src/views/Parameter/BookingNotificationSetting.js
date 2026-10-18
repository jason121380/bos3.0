/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, TextField, Select,
  MenuItem, InputLabel, FormControl, Grid,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo } from 'react'
import _ from 'lodash'
import produce from 'immer'

import styles from './styles/OrderWithoutCustomerDefaultSetting'

const bookingNotificationArr = [
  {label: '顧客新增預約', key: 'customerCreateBooking'},
  {label: '顧客取消預約', key: 'customerCancelBooking'},
  {label: '設計師新增預約', key: 'designerCreateBooking'},
  {label: '設計師取消預約', key: 'designerCancelBooking'},
  {label: '預約有變動', key: 'bookingUpdated'},
]

const settingOptions = [
  {label: '顧客', key: 'customer'},
  {label: '設計師', key: 'designer'},
  {label: '店家', key: 'merchant'},
]

function BookingNotificationSetting({
  className,
  aboutBooking,
  setAboutBooking,
  merchantBookingNotification,
  setMerchantBookingNotification,
  inputEnable,
}) {
  const handleChangeNotification = (key, event) => {
    const value = event.target.value
    const name = event.target.name
    const newData = _.cloneDeep(merchantBookingNotification)
    newData[key][name] = value
    setMerchantBookingNotification(newData)
  }

  const handleCheckError = value => {
    if (value.trim() === '') {
      return false
    } else {
      return !value.match(/^09[0-9]{8}$/)
    }
  }
  const handleAddPhoneData = () => {
    setAboutBooking(
      produce(draft => {
        draft.bookingNotificationPhone.push('')
      })
    )
  }
  const handleRemovePhoneData = index => {
    setAboutBooking(
      produce(draft => {
        draft.bookingNotificationPhone.splice(index, 1)
      })
    )
  }
  
  return (
    <Card css={className}>
      <CardHeader title="預約通知簡訊設定" />
      <Divider />
      {bookingNotificationArr.map(({label, key}, index) => (
        <CardContent key={label} style={{ padding: (index === 0 || index === 4) ? '24px 24px 12px 24px' : '8px 24px' }}>
          <div style={{ marginBottom: '15px' }}>{label}</div>
          <Grid item container spacing={3}>
            {settingOptions.map(option => (
              <Grid item key={key + option.label}>
                <FormControl variant="outlined" css={styles.selectWidth}>
                  <InputLabel>{option.label}</InputLabel>
                  <Select
                    name={option.key}
                    label={option.label}
                    value={merchantBookingNotification[key][option.key]}
                    disabled={!inputEnable}
                    onChange={event => handleChangeNotification(key, event)}
                  >
                    <MenuItem value={true}>開啟通知</MenuItem>
                    <MenuItem value={false}>關閉通知</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      ))}
      <CardContent>
        <div style={{ marginBottom: '15px' }}>簡訊發送帳號設定</div>
        <form method='post' action='/form' autoComplete='off' onSubmit={event => event.preventDefault()}>
          <Grid item container spacing={3}>
            <Grid item>
              <TextField
                label='API帳號'
                type="text"
                value={aboutBooking.SMSAccount.account ? aboutBooking.SMSAccount.account : ''}
                onChange={e => {
                  setAboutBooking(
                    produce(draft => {
                      draft.SMSAccount.account = e.target.value
                    })
                  )
                }}
                disabled={!inputEnable}
                variant='outlined'
                autoComplete='off'
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                label='API密碼'
                type="text"
                value={aboutBooking.SMSAccount.password ? aboutBooking.SMSAccount.password : ''}
                onChange={e => {
                  setAboutBooking(
                    produce(draft => {
                      draft.SMSAccount.password = e.target.value
                    })
                  )
                }}
                disabled={!inputEnable}
                variant='outlined'
                autoComplete='off'
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <CardContent>
        <div>簡訊寄送號碼設定</div>
        <Grid item container>
          {aboutBooking.bookingNotificationPhone.map((d, index, arr) => {
            return (
              <Grid xs={3} css={styles.phoneTextfieldGroup} key={`NotificationPhoneData-${index}`} item container>
                <Grid style={{ marginRight: '10px' }} item>{index + 1}</Grid>
                <TextField
                  label='手機號碼'
                  type="number"
                  disabled={!inputEnable}
                  value={d}
                  variant='outlined'
                  error={handleCheckError(d)}
                  css={styles.phoneTextfield}
                  helperText={handleCheckError(d) ? '手機格式有誤' : ''}
                  onChange={e => {
                    setAboutBooking(
                      produce(draft => {
                        draft.bookingNotificationPhone[index] = e.target.value
                      })
                    )
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {index > 0 && <DeleteForeverIcon style={{ cursor: 'pointer' }} onClick={() => handleRemovePhoneData(index)}/>}
                {index === arr.length - 1 && <AddIcon style={{ cursor: 'pointer' }} onClick={handleAddPhoneData}/>}
              </Grid>
            )
          })}

        </Grid>
      </CardContent>
    </Card>
  )
}

export default memo(BookingNotificationSetting)
