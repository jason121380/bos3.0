/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, TextField, IconButton,
  Select, MenuItem, InputLabel, FormControl, InputAdornment, Button,
  ThemeProvider, createTheme
} from '@mui/material'
import { memo } from 'react'
import _ from 'lodash'
import { Edit as EditIcon, Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import styles from './styles/MerchantReservationTimes'
import { green } from '@mui/material/colors';
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
const theme = createTheme({
  palette: {
    primary: {
      main: green[400]
    }
  }
})

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
    <Card css={className}>
      <CardHeader title="開放預約時段設定" />
      <Divider />
      <CardContent css={styles.CardContent}>
        {merchantReservation.length ?
          merchantReservation.map(({ title, openingHours, closingHours, useDay }, index) => (
            <div css={styles.container} key={`Reservation-${index}`}>
              <div>
                <TextField
                  disabled={!inputEnable}
                  placeholder={'請輸入名稱'}
                  value={title}
                  variant='standard'
                  css={styles.textField}
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
              <div css={styles.timeWrap}>
                <div css={styles.timeWrap}>
                  <FormControl variant="outlined">
                    <InputLabel>開始</InputLabel>
                    <Select
                      label='開始'
                      value={openingHours.split(':')[0]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('openingHours', 0, e.target.value, index)}
                    >
                      {hours.map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span>:</span>
                  <FormControl variant="outlined">
                    <Select
                      value={openingHours.split(':')[1]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('openingHours', 1, e.target.value, index)}
                    >
                      <MenuItem value='00'>00</MenuItem>
                      <MenuItem value='30'>30</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <span>至</span>
                <div css={styles.timeWrap}>
                  <FormControl variant="outlined">
                    <InputLabel>結束</InputLabel>
                    <Select
                      label='結束'
                      value={closingHours.split(':')[0]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('closingHours', 0, e.target.value, index)}
                    >
                      {hours.map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <span>:</span>
                  <FormControl variant="outlined">
                    <Select
                      value={closingHours.split(':')[1]}
                      disabled={!inputEnable}
                      onChange={e => handleChangeBookingTime('closingHours', 1, e.target.value, index)}
                    >
                      <MenuItem value='00'>00</MenuItem>
                      <MenuItem value='30'>30</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div css={styles.timeWrap}>
                {weekArray.map(({ label, value }) => {
                  const isInclude = useDay.includes(value)
                  return (
                    <ThemeProvider theme={theme} key={label}>
                      <Button
                        onClick={() => handleAddDay(value, index)}
                        variant="contained"
                        color={isInclude ? 'primary' : 'inherit'}
                        style={{ color: isInclude ? 'white' : '' }}
                        disabled={!inputEnable || (isInclude ? false : handleCheckDisbaled(value, index))}
                        css={styles.box}
                      >{label}</Button>
                    </ThemeProvider>
                  )
                })}
                <div css={styles.iconWrap}>
                  {index === merchantReservation.length - 1 &&
                    <IconButton disabled={!inputEnable || (merchantReservation.length >= 7)} onClick={() => merchantReservation.length < 7 && handleAddItem()}>
                      <AddIcon />
                    </IconButton>
                  }
                  <IconButton disabled={!inputEnable} onClick={() => handleRemoveItem(index)}>
                    <DeleteForeverIcon />
                  </IconButton>
                </div>
              </div>
              {index !== merchantReservation.length - 1 && <Divider/> }
            </div>
          )) :
          <div style={{ alignItems: 'center', display: 'flex', gap: 50 }}>
            <span>無資料</span>
            <IconButton disabled={!inputEnable} onClick={handleAddItem}>
              <AddIcon />
            </IconButton>
          </div>
        }
      </CardContent>
    </Card>
  )
}

export default memo(MerchantReservationTimes)