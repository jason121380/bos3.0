/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment, useState, useEffect } from 'react'
import _ from 'lodash'
import { CirclePicker } from 'react-color'

import styles from './styles/AboutEmployeeSchedule'

const AboutEmployeeSchedule = ({
  className,
  setIsMerchantClockInSetting,
  isMerchantClockInSetting,
  inputEnable,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [dataIndex, setDataIndex] = useState('')
  const [colorData, setColorData] = useState('')
  // 對應react-color套件裡顯示的顏色 共18種
  const randomColor = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#607d8b',
  ]
  /* const randomColor = [
    '#e15241',
    '#d63865',
    '#9032aa',
    '#613cb0',
    '#4351ae',
    '#4994ec',
    '#4ba6ee',
    '#54b9d2',
    '#429588',
    '#67ad5c',
    '#97c15c',
    '#d1dd59',
    '#fbeb61',
    '#f6c344',
    '#f09d37',
    '#eb6337',
    '#74574a',
    '#667d89',
  ] */
  const handleChangeEnable = (name, index, using) => {
    const newSchedule = _.cloneDeep(isMerchantClockInSetting)
    switch (name) {
      case 'startTime':
        newSchedule[index].isClockInUsing = !using
        break
      case 'endTime':
        newSchedule[index].isClockOutUsing = !using
        break
      case 'breakStart':
        newSchedule[index].breakTimeSetting[0].isStartTimeUsing = !using
        break
      case 'breakEnd':
        newSchedule[index].breakTimeSetting[0].isEndTimeHourUsing = !using
        break
      case 'overtime':
        newSchedule[index].isWorkOverMinutesCalculated = !using
        break
      case 'bufferTime':
        newSchedule[index].isClockOutBufferMinutesUsing = !using
        break
      default:
        break
    }
    setIsMerchantClockInSetting(newSchedule)
  }

  const handleChangetime = (name, index, value) => {
    const newIsMerchantClockInSetting = _.cloneDeep(isMerchantClockInSetting)
    const hour = parseInt(value.substr(0, 2))
    const minute = parseInt(value.substr(3, 5))

    switch (name) {
      case 'startTime':
        newIsMerchantClockInSetting[index].clockInHour = hour
        newIsMerchantClockInSetting[index].clockInMinute = minute
        break
      case 'endTime':
        newIsMerchantClockInSetting[index].clockOutHour = hour
        newIsMerchantClockInSetting[index].clockOutMinute = minute
        break
      case 'breakStart':
        newIsMerchantClockInSetting[index].breakTimeSetting[0].startHour = hour
        newIsMerchantClockInSetting[index].breakTimeSetting[0].startMinute = minute
        break
      case 'breakEnd':
        newIsMerchantClockInSetting[index].breakTimeSetting[0].endHour = hour
        newIsMerchantClockInSetting[index].breakTimeSetting[0].endMinute = minute
        break
      default:
        break
    }
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }

  const handleChangesScheduleName = (index, value) => {
    const newIsMerchantClockInSetting = _.cloneDeep(isMerchantClockInSetting)
    newIsMerchantClockInSetting[index].name = value
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  const handleChangeLateTime = (name, index, value) => {
    const newSchedule = _.cloneDeep(isMerchantClockInSetting)
    if (name === 'allowedDelayMinutes') newSchedule[index].allowedDelayMinutes = +value
    if (name === 'clockOutBufferMinutes') newSchedule[index].clockOutBufferMinutes = +value
    setIsMerchantClockInSetting(newSchedule)
  }
  const addSchedule = () => {
    const newIsMerchantClockInSetting = _.cloneDeep(isMerchantClockInSetting)
    const randNum = Math.floor(Math.random() * randomColor.length)
    newIsMerchantClockInSetting.push({
      name: '',
      clockInHour: 0,
      clockInMinute: 0,
      isClockInUsing: true,
      clockOutHour: 0,
      clockOutMinute: 0,
      isClockOutUsing: true,
      breakTimeSetting: [
        {
          startHour: 0,
          startMinute: 0,
          isStartTimeUsing: true,
          endHour: 0,
          endMinute: 0,
          isEndTimeHourUsing: true,
        },
      ],
      allowedDelayMinutes: 0,
      color: randomColor[randNum],
    })
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  const deleteSchedule = index => {
    const newIsMerchantClockInSetting = _.cloneDeep(isMerchantClockInSetting)
    newIsMerchantClockInSetting.splice(index, 1)
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  useEffect(() => {
    if (dataIndex !== '' && colorData !== '') {
      const newIsMerchantClockInSetting = _.cloneDeep(isMerchantClockInSetting)
      newIsMerchantClockInSetting[dataIndex].color = colorData
      setIsMerchantClockInSetting(newIsMerchantClockInSetting)
    }
  }, [colorData])
  return (
    <Fragment>
      <Card css={className} className='AboutEmployeeSchedule'>
        <CardHeader title="班別設定" />
        <Divider />
        <CardContent>
          {isMerchantClockInSetting.length > 0 ? (
            isMerchantClockInSetting.map((data, index) => {
              return (
                <Fragment key={index}>
                  <Grid container direction="row" style={{ marginBottom: '50px' }}>
                    <Grid sm={3} xs={12} item >
                      <Grid>
                        <TextField
                          disabled={!inputEnable}
                          label="人員班別"
                          variant="outlined"
                          value={data.name}
                          css={styles.gap}
                          onChange={event => {
                            handleChangesScheduleName(index, event.target.value)
                          }}
                        />
                      </Grid>
                      <Grid>
                        選取顏色
                        <Button
                          disabled={!inputEnable}
                          css={styles.colorTag}
                          style={{ background: `${data.color}` }}
                          onClick={() => {
                            setShowColorPicker(true)
                            setDataIndex(index)
                            setColorData(data.color !== null ? data.color : '')
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Grid sm={5} xs={12} item >
                      <Grid container direction="row" alignItems="center" css={styles.gap} >
                        <p css={styles.title}>可打卡時間</p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              checked={data.isClockInUsing}
                              disabled={!inputEnable}
                              onChange={event => {
                                handleChangeEnable('startTime', index, data.isClockInUsing)
                              }}
                              size="small"
                              color="primary"
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                        <TextField
                          value={
                            data.clockInHour.toString().padStart(2, '0') +
                            ':' +
                            data.clockInMinute.toString().padStart(2, '0')
                          }
                          disabled={!inputEnable || !data.isClockInUsing}
                          // disabled={!data.startTime.enable}
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          css={styles.field}
                          onChange={(event, value) => {
                            handleChangetime('startTime', index, event.target.value)
                          }}
                        />
                      </Grid>
                      <Grid container direction="row" alignItems="center" css={styles.gap} >
                        <p css={styles.title}>下班時間 </p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              disabled={!inputEnable}
                              checked={data.isClockOutUsing}
                              size="small"
                              color="primary"
                              onChange={event => {
                                handleChangeEnable('endTime', index, data.isClockOutUsing)
                              }}
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                        <TextField
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          css={styles.field}
                          disabled={!inputEnable || !data.isClockOutUsing}
                          value={
                            data.clockOutHour.toString().padStart(2, '0') +
                            ':' +
                            data.clockOutMinute.toString().padStart(2, '0')
                          }
                          onChange={(event, value) => {
                            handleChangetime('endTime', index, event.target.value)
                          }}
                        />
                      </Grid>
                      <Grid container direction="row" alignItems="center" css={styles.gap}>
                        <p css={styles.title}>休息開始</p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              checked={data.breakTimeSetting[0].isStartTimeUsing}
                              disabled={!inputEnable}
                              size="small"
                              color="primary"
                              onChange={event => {
                                handleChangeEnable(
                                  'breakStart',
                                  index,
                                  data.breakTimeSetting[0].isStartTimeUsing
                                )
                              }}
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                        <TextField
                          disabled={!inputEnable || !data.breakTimeSetting[0].isStartTimeUsing}
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          css={styles.field}
                          value={
                            data.breakTimeSetting[0].startHour.toString().padStart(2, '0') +
                            ':' +
                            data.breakTimeSetting[0].startMinute.toString().padStart(2, '0')
                          }
                          onChange={(event, value) => {
                            handleChangetime('breakStart', index, event.target.value)
                          }}
                        />
                      </Grid>
                      <Grid container direction="row" alignItems="center" css={styles.gap}>
                        <p css={styles.title}>休息結束</p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              checked={data.breakTimeSetting[0].isEndTimeHourUsing}
                              disabled={!inputEnable}
                              size="small"
                              color="primary"
                              onChange={event => {
                                handleChangeEnable(
                                  'breakEnd',
                                  index,
                                  data.breakTimeSetting[0].isEndTimeHourUsing
                                )
                              }}
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                        <TextField
                          disabled={!inputEnable || !data.breakTimeSetting[0].isEndTimeHourUsing}
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          css={styles.field}
                          value={
                            data.breakTimeSetting[0].endHour.toString().padStart(2, '0') +
                            ':' +
                            data.breakTimeSetting[0].endMinute.toString().padStart(2, '0')
                          }
                          onChange={(event, value) => {
                            handleChangetime('breakEnd', index, event.target.value)
                          }}
                        />
                      </Grid>
                      <Grid container direction="row" alignItems="center" css={styles.gap}>
                        <p style={{ maxWidth: '150px' }}>計算加班分鐘數</p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              checked={data.isWorkOverMinutesCalculated}
                              disabled={!inputEnable}
                              size="small"
                              color="primary"
                              onChange={event => {
                                handleChangeEnable(
                                  'overtime',
                                  index,
                                  data.isWorkOverMinutesCalculated
                                )
                              }}
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                      </Grid>
                      <Grid container direction="row" alignItems="center" css={styles.gap}>
                        <p style={{ maxWidth: '150px' }}>不計加班時長</p>
                        <FormControlLabel
                          disabled={!inputEnable}
                          css={styles.isUsing}
                          control={
                            <Checkbox
                              checked={data.isClockOutBufferMinutesUsing}
                              disabled={!inputEnable}
                              size="small"
                              color="primary"
                              onChange={event => {
                                handleChangeEnable(
                                  'bufferTime',
                                  index,
                                  data.isClockOutBufferMinutesUsing
                                )
                              }}
                            />
                          }
                          label="啟用"
                          labelPlacement="end"
                        />
                      </Grid>

                    </Grid>
                    <Grid sm={3} xs={12} container item direction="row" alignItems="flex-start" >
                      <Grid container direction="row" alignItems="center" justifyContent='flex-end'>
                        不計遲到時長
                        <TextField
                          disabled={!inputEnable}
                          value={data.allowedDelayMinutes}
                          type="number"
                          label="分鐘"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0 } }}
                          css={styles.smallField}
                          onChange={event => {
                            handleChangeLateTime('allowedDelayMinutes', index, event.target.value)
                          }}
                        />
                        不計加班時長
                        <TextField
                          disabled={!inputEnable}
                          value={data.clockOutBufferMinutes}
                          type="number"
                          label="分鐘"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0 } }}
                          css={styles.smallField}
                          onChange={event => {
                            handleChangeLateTime('clockOutBufferMinutes', index, event.target.value)
                          }}
                          onWheel={() => document.activeElement.blur()}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      xs={12}
                      container
                      direction="row"
                      alignItems="flex-end"
                      justifyContent="flex-end"
                      item
                    >
                      <DeleteForeverIcon
                        onClick={() => {
                          inputEnable && deleteSchedule(index)
                        }}
                        sm={12}
                        css={styles.icon}
                      />
                      {isMerchantClockInSetting.length - 1 === index ? (
                        <AddIcon
                          onClick={() => {
                            inputEnable && addSchedule()
                          }}
                          sm={12}
                          css={styles.icon}
                        />
                      ) : (
                        <Grid style={{ marginLeft: '50px', width: '24px', height: '24px' }} />
                      )}
                    </Grid>
                  </Grid>
                  {showColorPicker && (
                    <Fragment key={index}>
                      <CirclePicker
                        css={styles.colorPicker}
                        disableAlpha
                        color={colorData}
                        onChange={event => {
                          console.log('event.hex: ', event.hex);
                          setColorData(event.hex)
                        }}
                      />
                      <div
                        onClick={() => {
                          setShowColorPicker(false)
                        }}
                        css={styles.fixedBg}
                      />
                    </Fragment>
                  )}
                </Fragment>
              )
            })
          ) : (
            <Grid container direction="row" alignItems="center" key='無資料'>
              <Typography component="h1" variant="h5">
                無資料
              </Typography>
              <AddIcon
                onClick={() => {
                  inputEnable && addSchedule()
                }}
                sm={12}
                css={styles.icon}
              />
            </Grid>
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}
export default memo(AboutEmployeeSchedule)
