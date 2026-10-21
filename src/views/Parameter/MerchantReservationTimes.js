// 名稱欄位（endAdornment、onBlur 檢查）保留 MUI TextField
import { TextField, InputAdornment } from 'ui/text-field'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Field } from 'ui/input'
import { ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import { Edit as EditIcon, Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { green } from 'ui/colors';
import { openSnackbar } from 'elements/snackbars';

const hours = [
  '00', '01', '02', '03', '04', '05', '06', '07',
  '08', '09', '10', '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20', '21', '22', '23'
]

const weekArray = [
  { label: '一', value: 'MON' },
  { label: '二', value: 'TUE' },
  { label: '三', value: 'WED' },
  { label: '四', value: 'THU' },
  { label: '五', value: 'FRI' },
  { label: '六', value: 'SAT' },
  { label: '日', value: 'SUN' },
]
function MerchantReservationTimes({
  className,
  merchantReservation,
  setMerchantReservation,
  inputEnable,
}) {
  const handleTitleOnChange = (title, index) => {
    const newData = structuredClone(merchantReservation)
    newData[index].title = title
    setMerchantReservation([...newData])
  }

  const handleChangeBookingTime = (type, index, value, dataIndex) => {
    const newData = structuredClone(merchantReservation)
    const time = newData[dataIndex][type].split(':')
    time[index] = value
    newData[dataIndex][type] = time.join(':')
    setMerchantReservation([...newData])
  }

  const handleAddItem = () => {
    const newData = structuredClone(merchantReservation)
    newData.push({
      title: '',
      openingHours: '10:00:00',
      closingHours: '20:00:00',
      useDay: []
    })
    setMerchantReservation(newData)
  }

  const handleRemoveItem = index => {
    const newData = structuredClone(merchantReservation)
    newData.splice(index, 1)
    setMerchantReservation([...newData])
  }

  const handleAddDay = (day, index) => {
    const newData = structuredClone(merchantReservation)
    const dayIndex = newData[index].useDay.indexOf(day)
    if (dayIndex === -1) {
      newData[index].useDay.push(day)
    } else (
      newData[index].useDay.splice(dayIndex, 1)
    )
    setMerchantReservation([...newData])
  }

  const handleCheckDisbaled = (day, dataIndex) => {
    const allUsedDay = []
    merchantReservation.forEach(({ useDay }, index) => {
      if (dataIndex !== index) {
        allUsedDay.push(...useDay)
      }
    })
    return allUsedDay.includes(day)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>開放預約時段設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-[40px]">
        {merchantReservation.length ?
          merchantReservation.map(({ title, openingHours, closingHours, useDay }, index) => (
            <div className="flex flex-col gap-[20px]" key={`Reservation-${index}`}>
              <div>
                <TextField
                  disabled={!inputEnable}
                  placeholder={'請輸入名稱'}
                  value={title}
                  variant='standard'
                  className="[&_input]:!pt-[6px] [&_input]:!px-0 [&_input]:!pb-[7px]"
                  onBlur={e => {
                    if (e.target.value === '') {
                      setTimeout(() => {
                        openSnackbar({
                          message: '開放預約時段的名稱不得為空',
                          variant: 'error'
                        })
                      }, 100)
                    }
                  }}
                  onChange={e => handleTitleOnChange(e.target.value, index)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        <EditIcon size={12} color='disabled' />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="flex gap-[20px] items-center flex-wrap">
                <Field label='開始'>
                  <div className="flex items-center gap-2">
                    <NativeSelect
                      fullWidth={false}
                      className="w-24"
                      value={openingHours.split(':')[0]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('openingHours', 0, e.target.value, index)}
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
                      value={openingHours.split(':')[1]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('openingHours', 1, e.target.value, index)}
                    >
                      <NativeSelectOption value='00'>00</NativeSelectOption>
                      <NativeSelectOption value='30'>30</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </Field>
                <span>至</span>
                <Field label='結束'>
                  <div className="flex items-center gap-2">
                    <NativeSelect
                      fullWidth={false}
                      className="w-24"
                      value={closingHours.split(':')[0]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('closingHours', 0, e.target.value, index)}
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
                      value={closingHours.split(':')[1]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('closingHours', 1, e.target.value, index)}
                    >
                      <NativeSelectOption value='00'>00</NativeSelectOption>
                      <NativeSelectOption value='30'>30</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </Field>
              </div>
              <div className="flex gap-[20px] items-center flex-wrap">
                {weekArray.map(({ label, value }) => {
                  const isInclude = useDay.includes(value)
                  return (
                    <ToggleGroupItem
                      key={label}
                      selected={isInclude}
                      onClick={() => handleAddDay(value, index)}
                      disabled={!inputEnable || (isInclude ? false : handleCheckDisbaled(value, index))}
                      className="h-10 w-10 px-0"
                    >{label}</ToggleGroupItem>
                  )
                })}
                <div className="flex grow gap-[30px] flex-wrap [justify-content:end] [&_svg]:cursor-pointer">
                  {index === merchantReservation.length - 1 &&
                    <Button variant="ghost" size="icon" aria-label="新增時段" disabled={!inputEnable || (merchantReservation.length >= 7)} onClick={() => merchantReservation.length < 7 && handleAddItem()}>
                      <AddIcon />
                    </Button>
                  }
                  <Button variant="ghost" size="icon" aria-label="刪除時段" disabled={!inputEnable} onClick={() => handleRemoveItem(index)}>
                    <DeleteForeverIcon />
                  </Button>
                </div>
              </div>
              {index !== merchantReservation.length - 1 && <div className="h-px bg-border" /> }
            </div>
          )) :
          <div style={{ alignItems: 'center', display: 'flex', gap: 50 }}>
            <span>無資料</span>
            <Button variant="ghost" size="icon" aria-label="新增時段" disabled={!inputEnable} onClick={handleAddItem}>
              <AddIcon />
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  )
}

export default memo(MerchantReservationTimes)