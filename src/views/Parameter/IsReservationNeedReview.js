// 數字欄位（onWheel 失焦、onFocus 全選）與多行文字保留 MUI TextField
import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Field } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import produce from 'immer'

const hours = [
  '00', '01', '02', '03', '04', '05', '06', '07',
  '08', '09', '10', '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20', '21', '22', '23'
]

const settingArr = [
  {label: '指定預約無需審核', key: 'isBookingAutoAccept'},
  {label: '啟用不指定預約審核', key: 'isNDBNeedVerify'},
  {label: '開放客人當日預約', key: 'isCustomerBookedableInSameDay'},
  {label: '預約結束時間不能超過營業結束時間', key: 'isRTCUsing'},
  {label: '單日預約紀錄顯示備註', key: 'isBookingRemarkDisplay'},
  {label: '單日預約紀錄顯示顧客備註', key: 'isCusBookingRemarkDisplay'},
  {label: '預約紀錄顯示顧客生日提醒', key: 'isBirthdayIconDisplay'},
  {label: '預約管理顯示已結帳的預約', key: 'isBookingHistoryDisplay'},
  {label: '上限納入審核中預約', key: 'isNDBInLimitCount'},
]

function IsReservationNeedReview({
  className, aboutBooking, setAboutBooking, bookingCusCheck,
  setBookingCusCheck, inputEnable, 
}) {
  const handleChangeBookingTime = (type, index, value) => {
    const time = cloneDeep(aboutBooking.bookingTimeSetting[type].split(':'))
    const newData = cloneDeep(aboutBooking.bookingTimeSetting)
    time[index] = value
    newData[type] = time.join(':')
    setAboutBooking(
      produce(draft =>{
        draft.bookingTimeSetting = newData
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
        <CardTitle>預約設定</CardTitle>
      </CardHeader>
      <CardContent>
        {settingArr.map(({ label, key }) => (
          <div className="flex items-center mb-[24px]" key={label}>
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label={label}
              checked={aboutBooking[key]}
              onChange={e => handleSetValue(key, e.target.checked)}
            />
          </div>
        ))}
        <div className="flex items-center mb-[24px]">
          <CheckboxField
            disabled={!inputEnable}
            className="mx-[20px] my-0"
            label="啟用「未來預訂(待確認)」的預約狀態"
            checked={bookingCusCheck}
            onChange={() => setBookingCusCheck(!bookingCusCheck)}
          />
        </div>
        <div className="flex flex-col mb-[24px]">
          <div style={{ marginBottom: '15px' }}>同一支電話當日可預約的次數</div>
          <div className="flex flex-wrap items-center gap-y-[10px]">
            <TextField
              disabled={!inputEnable || aboutBooking.bookingLimitPerCellphoneInSameDay === null}
              variant="outlined"
              label="次數"
              type="number"
              value={aboutBooking.bookingLimitPerCellphoneInSameDay === null ? '' : aboutBooking.bookingLimitPerCellphoneInSameDay}
              onChange={e => handleSetValue('bookingLimitPerCellphoneInSameDay', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="不限制次數"
              checked={aboutBooking.bookingLimitPerCellphoneInSameDay === null}
              onChange={e => handleSetValue('bookingLimitPerCellphoneInSameDay', e.target.checked ? null : 0)}
            />
          </div>
        </div>
        <div className="flex flex-col mb-[24px]">
          <div style={{ marginBottom: '15px' }}>單一顧客預約筆數上限</div>
          <div className="flex flex-wrap items-center gap-y-[10px]">
            <TextField
              disabled={!inputEnable || aboutBooking.cusMaxBookingCount === null}
              variant="outlined"
              label="次數"
              type="number"
              value={aboutBooking.cusMaxBookingCount === null ? '' : aboutBooking.cusMaxBookingCount}
              onChange={e => handleSetValue('cusMaxBookingCount', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="不限制次數"
              checked={aboutBooking.cusMaxBookingCount === null}
              onChange={e => handleSetValue('cusMaxBookingCount', e.target.checked ? null : 0)}
            />
          </div>
        </div>
        <div className="flex flex-row mb-[24px] mt-[36px] items-start">
          <span>指定預約僅開放未來</span>
          <div style={{  
            display: 'flex', flexDirection: 'column',
             marginTop: -12
          }}>
            <TextField
              disabled={!inputEnable || aboutBooking.disableBookingDayLimit === null}
              variant="outlined"
              label="天數"
              type="number"
              value={aboutBooking.disableBookingDayLimit === null ? '' : aboutBooking.disableBookingDayLimit}
              onChange={e => handleSetValue('disableBookingDayLimit', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              style={{ margin: 0 }}
              disabled={!inputEnable}
              label="不限制"
              checked={aboutBooking.disableBookingDayLimit === null}
              onChange={e => handleSetValue('disableBookingDayLimit', e.target.checked ? null : 0)}
            />
          </div>
          <span>天到</span>
          <div style={{  
            display: 'flex', flexDirection: 'column',
             marginTop: -12
          }}>
            <TextField
              disabled={!inputEnable || aboutBooking.createBookingDayLimit === null}
              variant="outlined"
              label="天數"
              type="number"
              value={aboutBooking.createBookingDayLimit === null ? '' : aboutBooking.createBookingDayLimit}
              onChange={e => handleSetValue('createBookingDayLimit', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              style={{ margin: 0 }}
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="不限制"
              checked={aboutBooking.createBookingDayLimit === null}
              onChange={e => handleSetValue('createBookingDayLimit', e.target.checked ? null : 0)}
            />
          </div>
          <span>天的預約</span>
        </div>
        <div className="flex flex-col mb-[24px]">
          <div style={{ marginBottom: '15px' }}>指定預約顧客可取消預約的時間</div>
          <div className="flex flex-wrap items-center gap-y-[10px]">
            <TextField
              disabled={!inputEnable || aboutBooking.cancelBookingDayLimitByActionDate === null}
              variant="outlined"
              label="提出申請幾天內"
              type="number"
              value={aboutBooking.cancelBookingDayLimitByActionDate === null ? '' : aboutBooking.cancelBookingDayLimitByActionDate}
              onChange={e => handleSetValue('cancelBookingDayLimitByActionDate', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="不限制天數"
              checked={aboutBooking.cancelBookingDayLimitByActionDate === null}
              onChange={e => handleSetValue('cancelBookingDayLimitByActionDate', e.target.checked ? null : 0)}
            />
            <TextField
              disabled={!inputEnable || aboutBooking.cancelBookingDayLimitByServiceDate === null}
              variant="outlined"
              label="預約日期幾天前"
              type="number"
              value={aboutBooking.cancelBookingDayLimitByServiceDate === null ? '' : aboutBooking.cancelBookingDayLimitByServiceDate}
              onChange={e => handleSetValue('cancelBookingDayLimitByServiceDate', parseInt(e.target.value === "" ? 0 : Math.abs(e.target.value)))}
              onFocus={e => e.target.select()}
              onWheel={() => document.activeElement.blur()}
            />
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="不限制天數"
              checked={aboutBooking.cancelBookingDayLimitByServiceDate === null}
              onChange={e => handleSetValue('cancelBookingDayLimitByServiceDate', e.target.checked ? null : 0)}
            />
          </div>
        </div>
        <div className="flex flex-col mb-[24px]">
          <div style={{ marginBottom: '15px' }}>設定店家可預約的時間範圍</div>
          <div style={{ flexWrap: 'wrap', gap: '10px 0' }} className="flex items-center">
            <Field label='開始'>
              <div className="flex items-center gap-2">
                <NativeSelect
                  fullWidth={false}
                  className="w-24"
                  value={aboutBooking.bookingTimeSetting.openingHours.split(':')[0]}
                  disabled={!inputEnable}
                  onChange={e => handleChangeBookingTime('openingHours', 0, e.target.value)}
                >
                  {hours.map(d => (
                    <NativeSelectOption key={d} value={d}>{d}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <span>:</span>
                <NativeSelect
                  fullWidth={false}
                  className="w-24"
                  aria-label="開始（分）"
                  value={aboutBooking.bookingTimeSetting.openingHours.split(':')[1]}
                  disabled={!inputEnable}
                  onChange={e => handleChangeBookingTime('openingHours', 1, e.target.value)}
                >
                  <NativeSelectOption value='00'>00</NativeSelectOption>
                  <NativeSelectOption value='30'>30</NativeSelectOption>
                </NativeSelect>
              </div>
            </Field>
            <span style={{ margin: '0 30px' }}>至</span>
            <Field label='結束'>
              <div className="flex items-center gap-2">
                <NativeSelect
                  fullWidth={false}
                  className="w-24"
                  value={aboutBooking.bookingTimeSetting.closingHours.split(':')[0]}
                  disabled={!inputEnable}
                  onChange={e => handleChangeBookingTime('closingHours', 0, e.target.value)}
                >
                  {hours.map(d => (
                    <NativeSelectOption key={d} value={d}>{d}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <span>:</span>
                <NativeSelect
                  fullWidth={false}
                  className="w-24"
                  aria-label="結束（分）"
                  value={aboutBooking.bookingTimeSetting.closingHours.split(':')[1]}
                  disabled={!inputEnable}
                  onChange={e => handleChangeBookingTime('closingHours', 1, e.target.value)}
                >
                  <NativeSelectOption value='00'>00</NativeSelectOption>
                  <NativeSelectOption value='30'>30</NativeSelectOption>
                </NativeSelect>
              </div>
            </Field>
          </div>
        </div>
        <div style={{ marginTop: '40px' }} className="flex items-center mb-[24px]">
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="設定顧客端疑難排解顯示的文字"
            multiline
            minRows="4"
            fullWidth
            value={aboutBooking.troubleShooting}
            onChange={e => handleSetValue('troubleShooting', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(IsReservationNeedReview)
