/** @jsxImportSource @emotion/react */
// 多選 Autocomplete（含勾選圖示的選項）與數字欄位（onWheel）保留 MUI
import {
  TextField, Checkbox, Autocomplete
} from '@mui/material'
import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { memo } from 'react'
import _ from 'lodash'
import produce from 'immer'

import styles from './styles/BookingNotificationLineAtSetting'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

const bookingLineNotificationArr = [
  {label: '顧客新增預約', key: 'cusCreateBooking'},
  {label: '顧客取消預約', key: 'cusCancelBooking'},
  {label: '設計師新增預約', key: 'designerCreateBooking'},
  {label: '設計師取消預約', key: 'designerCancelBooking'},
  {label: '預約有變動', key: 'bookingUpdated'},
]

const settingOptions = [
  {label: '顧客', key: 'customer'},
  {label: '設計師', key: 'designer'},
  {label: '店家', key: 'merchant'},
]

const designerStatus = [
  {label: '未指定設計師', value: 'NODESIGNER'},
  {label: '已指定設計師', value: 'HASDESIGNER'},
]

function NonDesignationBookingLimitSetting({
  className, inputEnable, aboutBooking, setAboutBooking,
  lineConnectedUser, NDBRecipients, setNDBRecipients, notificationDayCount, setNotificationDayCount,
  BookingLineNotify, setBookingLineNotify
}) {
  const handleChangeNotification = (key, optionKey, value) => {
    setBookingLineNotify(
      produce(draft => {
      draft[key][optionKey] = value.map(item => item.value);
    }))
  }
  const handleNotificationLineSetting = (key, value) => {
    setAboutBooking(
      produce(draft => {
        draft.bookingNotificationLine[key] = value
      })
    )
  }
  const handleSetValue = (key, value) => {
    setAboutBooking(
      produce(draft => {
        draft[key] = value
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>預約通知LINE@設定</CardTitle>
      </CardHeader>
      {bookingLineNotificationArr.map(({label, key}, index) => (
        <CardContent key={label} style={{ padding: (index === 0 || index === 4) ? '24px 24px 12px 24px' : '8px 24px' }}>
          <div style={{ marginBottom: '15px' }}>{label}</div>
          <div className="flex flex-wrap gap-6">
            {settingOptions.map(option => (
              <div key={key + option.label}>
                <Autocomplete
                  multiple
                  options={designerStatus}
                  onChange={(event, value) => handleChangeNotification(key, option.key, value)}
                  value={designerStatus.filter(({ value }) => BookingLineNotify[key][option.key].includes(value))}
                  disableCloseOnSelect
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          checked={selected}   
                        />
                        {option.label}
                      </li>
                    );
                  }}
                  style={{ width: 250 }}
                  renderInput={(params) => (
                    <TextField {...params} label={option.label} placeholder="" />
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      ))}
      <CardContent>
        <div css={styles.bookingInputGroup}>
          <div style={{ marginBottom: '15px' }}>預約提前通知天數</div>
          <div css={styles.bookingInput}>
            <TextField
              disabled={!inputEnable}
              variant="outlined"
              label="天數"
              type="number"
              value={notificationDayCount || ''}
              onChange={e => {
                const value = Number(e.target.value) < 1 ? null : Number(e.target.value) 
                setNotificationDayCount(value)
              }}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
          </div>
        </div>
        <div style={{ flexWrap: 'wrap' }} css={styles.serviceInputGroup}>
          <CheckboxField
            disabled={!inputEnable}
            css={styles.isUsing}
            label="啟用預約通知"
            checked={aboutBooking.bookingNotificationLine.isUsing}
            onChange={(e, v) => handleNotificationLineSetting('isUsing', v)}
          />
          {aboutBooking.bookingNotificationLine.isUsing && (
            <TextField
              type='number'
              variant='outlined'
              label='幾天前通知'
              disabled={!inputEnable}
              style={{ width: 100 }}
              value={aboutBooking.bookingNotificationLine.notifyDayCount}
              InputProps={{ inputProps: { min: 1 } }}
              onChange={e => handleNotificationLineSetting('notifyDayCount', Number(e.target.value) < 1 ? 1 : Number(e.target.value))}
              onWheel={() => document.activeElement.blur()}
            />
          )}
        </div>
        <div style={{ flexWrap: 'wrap' }} css={styles.serviceInputGroup}>
          <CheckboxField
            disabled={!inputEnable}
            css={styles.isUsing}
            label="開啟評分邀請"
            checked={aboutBooking.inviteRatingDayCount !== null}
            onChange={(e, v) => handleSetValue('inviteRatingDayCount', v ? 0 : null)}
          />
          {aboutBooking.inviteRatingDayCount !== null && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <TextField
                type='number'
                variant='outlined'
                label='幾天後發送邀請'
                disabled={!inputEnable}
                style={{ width: 100 }}
                InputProps={{ inputProps: { min: 0 } }}
                value={aboutBooking.inviteRatingDayCount}
                onChange={e => handleSetValue('inviteRatingDayCount', Number(e.target.value) < 0 ? 0 : Number(e.target.value))}
                onWheel={() => document.activeElement.blur()}
              />
              <TextField
                type='number'
                variant='outlined'
                label='評論有效天數'
                disabled={!inputEnable}
                style={{ width: 100 }}
                InputProps={{ inputProps: { min: 0 } }}
                value={aboutBooking.cusRatingDayLimit}
                onChange={e => handleSetValue('cusRatingDayLimit', Number(e.target.value) < 0 ? 0 : Number(e.target.value))}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
          )}
        </div>
        <Autocomplete
          multiple
          autoHighlight
          options={lineConnectedUser}
          disableCloseOnSelect
          disabled={!inputEnable}
          getOptionLabel={option => option.name}
          value={NDBRecipients}
          onChange={(e, v) => setNDBRecipients(v)}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                style={{ marginRight: 8 }}
                icon={icon}
                checkedIcon={checkedIcon}
                checked={selected}
              />
              {option.name}
            </li>
          )}
          renderInput={params => (
            <TextField {...params} variant="outlined" label="不指定預約 通知接收人" placeholder="選擇設計師" />
          )}
        />
      </CardContent>
    </Card>
  )
}

export default memo(NonDesignationBookingLimitSetting)
