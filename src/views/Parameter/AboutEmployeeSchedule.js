// 排版改 Tailwind flex（多欄 RWD：600px 以上 3／5／3 欄，以下堆疊，同原 Grid xs=12 sm=n）；時間與數字欄位保留 TextField；人員班別單行文字欄改 Field 上方標籤＋ui Input
import { TextField } from 'ui/text-field'
import { Button } from 'ui/button'
import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment, useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { CirclePicker } from 'react-color'

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
    const newSchedule = cloneDeep(isMerchantClockInSetting)
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
    }
    setIsMerchantClockInSetting(newSchedule)
  }

  const handleChangetime = (name, index, value) => {
    // 時間欄位被清空（瀏覽器刪掉時或分時回傳空字串）時保留原時間，避免存成 NaN
    if (!/^\d{2}:\d{2}/.test(value)) return
    const newIsMerchantClockInSetting = cloneDeep(isMerchantClockInSetting)
    const hour = parseInt(value.substr(0, 2), 10)
    const minute = parseInt(value.substr(3, 5), 10)

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
    }
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }

  const handleChangesScheduleName = (index, value) => {
    const newIsMerchantClockInSetting = cloneDeep(isMerchantClockInSetting)
    newIsMerchantClockInSetting[index].name = value
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  const handleChangeLateTime = (name, index, value) => {
    const newSchedule = cloneDeep(isMerchantClockInSetting)
    if (name === 'allowedDelayMinutes') newSchedule[index].allowedDelayMinutes = +value
    if (name === 'clockOutBufferMinutes') newSchedule[index].clockOutBufferMinutes = +value
    setIsMerchantClockInSetting(newSchedule)
  }
  const addSchedule = () => {
    const newIsMerchantClockInSetting = cloneDeep(isMerchantClockInSetting)
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
      // 與查詢回來的班別欄位一致（加班相關預設不啟用），畫面勾選框與分鐘欄位才是受控的、存檔不缺欄位
      isWorkOverMinutesCalculated: false,
      isClockOutBufferMinutesUsing: false,
      clockOutBufferMinutes: 0,
    })
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  const deleteSchedule = index => {
    const newIsMerchantClockInSetting = cloneDeep(isMerchantClockInSetting)
    newIsMerchantClockInSetting.splice(index, 1)
    setIsMerchantClockInSetting(newIsMerchantClockInSetting)
  }
  useEffect(() => {
    if (dataIndex !== '' && colorData !== '') {
      const newIsMerchantClockInSetting = cloneDeep(isMerchantClockInSetting)
      newIsMerchantClockInSetting[dataIndex].color = colorData
      setIsMerchantClockInSetting(newIsMerchantClockInSetting)
    }
  }, [colorData, setIsMerchantClockInSetting])
  return (
    <Fragment>
      <Card className='AboutEmployeeSchedule'>
        <CardHeader>
          <CardTitle>班別設定</CardTitle>
        </CardHeader>
        <CardContent>
          {isMerchantClockInSetting.length > 0 ? (
            isMerchantClockInSetting.map((data, index) => {
              return (
                <Fragment key={index}>
                  <div className="box-border flex w-full flex-row flex-wrap" style={{ marginBottom: '50px' }}>
                    <div className="box-border max-w-full basis-full min-[600px]:max-w-[25%] min-[600px]:basis-1/4">
                      <div>
                        <Field label="人員班別" className="mb-5">
                          <Input
                            disabled={!inputEnable}
                            value={data.name}
                            onChange={event => {
                              handleChangesScheduleName(index, event.target.value)
                            }}
                          />
                        </Field>
                      </div>
                      <div>
                        選取顏色
                        <Button
                          variant="secondary"
                          aria-label="選取顏色"
                          disabled={!inputEnable}
                          className="w-16 rounded-md ml-[10px] h-[40px] border border-solid border-border-strong"
                          style={{ background: `${data.color}` }}
                          onClick={() => {
                            setShowColorPicker(true)
                            setDataIndex(index)
                            setColorData(data.color !== null ? data.color : '')
                          }}
                        />
                      </div>
                    </div>
                    <div className="box-border max-w-full basis-full min-[600px]:max-w-[41.666667%] min-[600px]:basis-5/12">
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p className="w-[80px]">可打卡時間</p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.isClockInUsing}
                          onChange={event => {
                            handleChangeEnable('startTime', index, data.isClockInUsing)
                          }}
                          label="啟用"
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
                          className="w-[100px] flex ml-[12px] [&_input]:!pt-[6px] [&_input]:!px-0 [&_input]:!pb-[7px]"
                          onChange={(event, value) => {
                            handleChangetime('startTime', index, event.target.value)
                          }}
                        />
                      </div>
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p className="w-[80px]">下班時間 </p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.isClockOutUsing}
                          onChange={event => {
                            handleChangeEnable('endTime', index, data.isClockOutUsing)
                          }}
                          label="啟用"
                        />
                        <TextField
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          className="w-[100px] flex ml-[12px] [&_input]:!pt-[6px] [&_input]:!px-0 [&_input]:!pb-[7px]"
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
                      </div>
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p className="w-[80px]">休息開始</p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.breakTimeSetting[0].isStartTimeUsing}
                          onChange={event => {
                            handleChangeEnable(
                              'breakStart',
                              index,
                              data.breakTimeSetting[0].isStartTimeUsing
                            )
                          }}
                          label="啟用"
                        />
                        <TextField
                          disabled={!inputEnable || !data.breakTimeSetting[0].isStartTimeUsing}
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          className="w-[100px] flex ml-[12px] [&_input]:!pt-[6px] [&_input]:!px-0 [&_input]:!pb-[7px]"
                          value={
                            data.breakTimeSetting[0].startHour.toString().padStart(2, '0') +
                            ':' +
                            data.breakTimeSetting[0].startMinute.toString().padStart(2, '0')
                          }
                          onChange={(event, value) => {
                            handleChangetime('breakStart', index, event.target.value)
                          }}
                        />
                      </div>
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p className="w-[80px]">休息結束</p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.breakTimeSetting[0].isEndTimeHourUsing}
                          onChange={event => {
                            handleChangeEnable(
                              'breakEnd',
                              index,
                              data.breakTimeSetting[0].isEndTimeHourUsing
                            )
                          }}
                          label="啟用"
                        />
                        <TextField
                          disabled={!inputEnable || !data.breakTimeSetting[0].isEndTimeHourUsing}
                          type="time"
                          label="選擇時間"
                          variant='standard'
                          className="w-[100px] flex ml-[12px] [&_input]:!pt-[6px] [&_input]:!px-0 [&_input]:!pb-[7px]"
                          value={
                            data.breakTimeSetting[0].endHour.toString().padStart(2, '0') +
                            ':' +
                            data.breakTimeSetting[0].endMinute.toString().padStart(2, '0')
                          }
                          onChange={(event, value) => {
                            handleChangetime('breakEnd', index, event.target.value)
                          }}
                        />
                      </div>
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p style={{ maxWidth: '150px' }}>計算加班分鐘數</p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.isWorkOverMinutesCalculated}
                          onChange={event => {
                            handleChangeEnable(
                              'overtime',
                              index,
                              data.isWorkOverMinutesCalculated
                            )
                          }}
                          label="啟用"
                        />
                      </div>
                      <div className="box-border flex w-full flex-row flex-wrap items-center mb-[20px]">
                        <p style={{ maxWidth: '150px' }}>不計加班時長</p>
                        <CheckboxField
                          disabled={!inputEnable}
                          className="ml-[20px]"
                          checked={data.isClockOutBufferMinutesUsing}
                          onChange={event => {
                            handleChangeEnable(
                              'bufferTime',
                              index,
                              data.isClockOutBufferMinutesUsing
                            )
                          }}
                          label="啟用"
                        />
                      </div>

                    </div>
                    <div className="box-border flex w-full max-w-full basis-full flex-row flex-wrap items-start min-[600px]:max-w-[25%] min-[600px]:basis-1/4">
                      <div className="box-border flex w-full flex-row flex-wrap items-center justify-end">
                        不計遲到時長
                        <TextField
                          disabled={!inputEnable}
                          value={data.allowedDelayMinutes}
                          type="number"
                          label="分鐘"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0 } }}
                          className="w-[60px] flex ml-[12px] mb-[12px]"
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
                          className="w-[60px] flex ml-[12px] mb-[12px]"
                          onChange={event => {
                            handleChangeLateTime('clockOutBufferMinutes', index, event.target.value)
                          }}
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                    </div>
                    <div className="box-border flex w-full max-w-full basis-full flex-row flex-wrap items-end justify-end">
                      <DeleteForeverIcon
                        onClick={() => {
                          inputEnable && deleteSchedule(index)
                        }}
                        sm={12}
                        className="ml-[50px] cursor-pointer"
                      />
                      {isMerchantClockInSetting.length - 1 === index ? (
                        <AddIcon
                          onClick={() => {
                            inputEnable && addSchedule()
                          }}
                          sm={12}
                          className="ml-[50px] cursor-pointer"
                        />
                      ) : (
                        <div className="box-border" style={{ marginLeft: '50px', width: '24px', height: '24px' }} />
                      )}
                    </div>
                  </div>
                  {showColorPicker && (
                    <Fragment key={index}>
                      <CirclePicker
                        className="box-content pt-[20px] pr-[12px] pb-[12px] pl-[20px] border border-solid border-border-strong z-[999] fixed top-[50%] left-[50%] [transform:translate(-50%,-50%)] rounded-[8px] [box-shadow:0_1px_3px_0_rgb(63_63_68_/_15%)]"
                        disableAlpha
                        color={colorData}
                        onChange={event => {
                          setColorData(event.hex)
                        }}
                      />
                      <div
                        onClick={() => {
                          setShowColorPicker(false)
                        }}
                        className="w-[100vw] h-[100vh] top-0 left-0 fixed z-[998]"
                      />
                    </Fragment>
                  )}
                </Fragment>
              )
            })
          ) : (
            <div className="box-border flex w-full flex-row flex-wrap items-center" key='無資料'>
              <span className="text-heading text-text">
                無資料
              </span>
              <AddIcon
                onClick={() => {
                  inputEnable && addSchedule()
                }}
                sm={12}
                className="ml-[50px] cursor-pointer"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}
export default memo(AboutEmployeeSchedule)
