/** @jsxImportSource @emotion/react */
import {
  FormControl, FormControlLabel, Checkbox, InputLabel, Select, MenuItem
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import _ from 'lodash'
import produce from 'immer'
import styles from './styles/AboutDeletePersonalClockInDisplay'

const timeCostArray = [
  { label: '無限制', value: 0 },
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

const optionArr = [
  { label: "顧客端預約備註為必填項目", key: 'isRemarkRequired' },
  { label: "限制指定預約只能預約偏好設計師", key: 'isCusBookingPreferDesOnly' },
  { label: "開放不指定預約", key: 'isCusNonDesBookingUsing' },
  { label: "顧客端預約強制選擇服務項目", key: 'isBookingItemRequired' },
  { label: "關閉顧客端預約", key: 'closeCustomerBooking' },
  { label: "預約時顯示同行人數", key: 'isBookingPeerDisplay' },
  { label: "顯示預約項目價格", key: 'isBookingItemPriceDisplay' },
]

function AboutCustomerBooking({
  className, inputEnable, aboutCustomer, setAboutCustomer
}) {
  const handleSetValue = (key, value) => {
    setAboutCustomer(
      produce(draft => {
        draft[key] = value
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>顧客端預約設定</CardTitle>
      </CardHeader>
      <CardContent>
        {optionArr.map(({ label, key }) => (
          <div key={label}>
            <FormControlLabel
              disabled={!inputEnable}
              css={styles.isUsing}
              control={<Checkbox color="primary" />}
              label={label}
              checked={aboutCustomer[key]}
              onChange={e => handleSetValue(key, e.target.checked)}
            />
          </div>
        ))}
        <FormControl
          css={styles.isUsing}
          sx={{ marginTop: '16px !important', width: '160px' }}
          variant='outlined'
        >
          <InputLabel>預約最短時長</InputLabel>
          <Select
            label='預約最短時長'
            fullWidth
            value={aboutCustomer.bookingMinumnTimeCost}
            onChange={e => handleSetValue('bookingMinumnTimeCost', e.target.value)}
          >
            {timeCostArray.map(d => (
              <MenuItem key={`${d.value}-${d.label}`} value={d.value}>{d.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

export default memo(AboutCustomerBooking)