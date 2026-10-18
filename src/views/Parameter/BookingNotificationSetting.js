/** @jsxImportSource @emotion/react */
// 手機號碼欄位（helperText 驗證）與帳號欄位（InputLabelProps）保留 MUI TextField
import {
  TextField, Grid
} from '@mui/material'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
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
    <Card>
      <CardHeader>
        <CardTitle>預約通知簡訊設定</CardTitle>
      </CardHeader>
      {bookingNotificationArr.map(({label, key}, index) => (
        <CardContent key={label} style={{ padding: (index === 0 || index === 4) ? '24px 24px 12px 24px' : '8px 24px' }}>
          <div style={{ marginBottom: '15px' }}>{label}</div>
          <div className="flex flex-wrap gap-6">
            {settingOptions.map(option => (
              <div key={key + option.label}>
                <NativeSelect
                  fullWidth={false}
                  css={styles.selectWidth}
                  name={option.key}
                  label={option.label}
                  value={merchantBookingNotification[key][option.key]}
                  disabled={!inputEnable}
                  onChange={event => handleChangeNotification(key, event)}
                >
                  <NativeSelectOption value={true}>開啟通知</NativeSelectOption>
                  <NativeSelectOption value={false}>關閉通知</NativeSelectOption>
                </NativeSelect>
              </div>
            ))}
          </div>
        </CardContent>
      ))}
      <CardContent>
        <div style={{ marginBottom: '15px' }}>簡訊發送帳號設定</div>
        <form method='post' action='/form' autoComplete='off' onSubmit={event => event.preventDefault()}>
          <div className="flex flex-wrap gap-6">
            <div>
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
            </div>
            <div>
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
            </div>
          </div>
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
