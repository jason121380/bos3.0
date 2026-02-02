/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Switch } from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { startOfMonth, addDays, format, endOfMonth } from 'date-fns'
import { useFetchGetMerchantClockInSchedule } from 'hooks/useFetchGetMerchantClockInSetting'
import useFetchGetEmployeeClockInSchedule from 'hooks/useFetchGetEmployeeClockInSchedule'
import useFetchSetEmployeeClockInSchedule from 'hooks/useFetchSetEmployeeClockInSchedule'
import useFetchGetIsEmployeeScheduleWorkingHourDisplay from 'hooks/useFetchGetIsEmployeeScheduleWorkingHourDisplay'
import useFetchGetUESUsingSetting from 'hooks/useFetchGetUESUsingSetting'
import useFetchGetEmployeeClockInScheduleExcel from 'hooks/useFetchGetEmployeeClockInScheduleExcel'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ScheduleTags from './ScheduleTags'
import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    padding: '0px !important',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  dateWrap: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0px 24px',
    flexWrap: 'wrap'
  })
}

export default function Employees() {
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })
  const [displayDate, setDisplayDate] = useState([])
  const [rawTime, setRawTime] = useState([])
  const [tagId, setTagId] = useState('')
  const [workingHourDisplay, setWorkingHourDisplay] = useState(true)
  const [employeeSchedule, setEmployeeSchedule] = useState([])
  const merchantClockInSchedule = useFetchGetMerchantClockInSchedule()
  const getIsEmployeeScheduleWorkingHourDisplay = useFetchGetIsEmployeeScheduleWorkingHourDisplay()
  const getUESUsingSetting = useFetchGetUESUsingSetting()
  const employeeClockInSchedule = useFetchGetEmployeeClockInSchedule({
    input: {
      startDate: startOfMonth(new Date(date.startDate)).getTime(),
      endDate: endOfMonth(new Date(date.startDate)).getTime(),
    },
  })
  const { setEmployeeClockInSchedule } = useFetchSetEmployeeClockInSchedule()
  const [getEmployeeClockInScheduleExcelLazy, getEmployeeClockInScheduleExcelData] = useFetchGetEmployeeClockInScheduleExcel()
  const [isClick, setIsClick] = useState(true)
  const [editBefore, setEditBefore] = useState(false)
  const [UESUsing, setUESUsing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 匯出 Excel
  const exportExcel = () => {
    getEmployeeClockInScheduleExcelLazy({
      variables: {
        input: {
          startDate: startOfMonth(new Date(date.startDate)).getTime(),
          endDate: endOfMonth(new Date(date.startDate)).getTime(),
        },
      },
    })
  }

  useEffect(() => {
    if (!getEmployeeClockInScheduleExcelData.loading && getEmployeeClockInScheduleExcelData.data) {
      const url = idx(getEmployeeClockInScheduleExcelData, _ => _.data.getEmployeeClockInScheduleExcel)
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.click()
      }
    }
  }, [getEmployeeClockInScheduleExcelData.loading])

  // 儲存資料
  const saveData = async () => {
    const newData = _.cloneDeep(employeeSchedule)
    const inputData = []
    setIsClick(true)

    newData.forEach(d => {
      const clockInSchedule = []
      d.clockInSchedule.forEach(d => {
        clockInSchedule.push({ date: d.date, clockInSettingId: d.clockInSetting.id })
      })
      inputData.push({
        userId: d.user.id,
        clockInSchedule: clockInSchedule,
      })
    })

    try {
      const res = await setEmployeeClockInSchedule({ input: inputData })
      if (res.data.setEmployeeClockInSchedule) {
        openSnackbar({ message: '儲存成功!', variant: 'success' })
        setIsEditing(false)
      } else {
        openSnackbar({ message: '儲存失敗!', variant: 'warning' })
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    } finally {
      setIsClick(false)
    }

  }

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return '(一)'
      case 'Tuesday':
        return '(二)'
      case 'Wednesday':
        return '(三)'
      case 'Thursday':
        return '(四)'
      case 'Friday':
        return '(五)'
      case 'Saturday':
        return '(六)'
      case 'Sunday':
        return '(日)'
      default:
        break
    }
  }

  // 按鈕顏色的明度判斷文字顯示黑或白
  const fontColor = color => {
    if (color === '#ffeb3b' || color === '#ffc107') {
      return 'black'
    } else {
      return 'white'
    }
  }
  useEffect(() => {
    if (!getIsEmployeeScheduleWorkingHourDisplay.loading) {
      const data = idx(getIsEmployeeScheduleWorkingHourDisplay, _ => _.data.getIsEmployeeScheduleWorkingHourDisplay)
      setWorkingHourDisplay(data)
    }
  }, [getIsEmployeeScheduleWorkingHourDisplay.loading])
  useEffect(() => {
    const displayDate = []
    const rawTime = []
    const startDate = new Date(startOfMonth(new Date(date.startDate)).getTime()).getDate()
    const endDate = new Date(endOfMonth(new Date(date.endDate)).getTime()).getDate()
    let add = 0
    for (let i = startDate; i <= endDate; i++) {
      displayDate.push(
        `${format(
          addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime(),
          'MM/dd'
        )}${weekDisplay(
          format(
            addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime(),
            'eeee'
          )
        )}`
      )
      rawTime.push(
        `${addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime()}`
      )
      add++
    }
    setRawTime(rawTime)
    setDisplayDate(displayDate)
    if (UESUsing) {
      setIsClick(false)
    } else {
      // 過去時間的班表儲存按鈕不給按
      if (startOfMonth(date.startDate).getTime() < startOfMonth(new Date()).getTime()) {
        setIsClick(true)
      } else {
        setIsClick(false)
      }
    }
  }, [date, UESUsing])

  useEffect(() => {
    if (!employeeClockInSchedule.loading) {
      setEmployeeSchedule(idx(employeeClockInSchedule, _ => _.data.getEmployeeClockInSchedule))
    }
  }, [employeeClockInSchedule.loading])

  useEffect(() => {
    if (!getUESUsingSetting.loading) {
      const data = idx(getUESUsingSetting, _ => _.data.getUESUsingSetting)
      setUESUsing(data)
    }
  }, [getUESUsingSetting.loading])

  return (
    <Page css={styles.root} title="考勤排班總表">
      <AdminPageHeader
        title="考勤排班總表"
        subtitle="ATTENDANCE EMPLOYEE SCHEDULE"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {UESUsing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#666' }}>
              <span>編輯過往班別</span>
              <Switch
                size="small"
                checked={editBefore}
                onChange={e => setEditBefore(e.target.checked)}
              />
            </div>
          )}
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
            css={css({
              '& .MuiOutlinedInput-root': {
                height: '32px',
                width: '120px',
                fontSize: '14px',
              }
            })}
          />
        </div>
      </AdminPageHeader>
      <Container maxWidth={false} css={styles.container}>
        <div style={{ marginBottom: '12px' }}>
          {!merchantClockInSchedule.loading && (
            <ScheduleTags
              merchantClockInSchedule={idx(
                merchantClockInSchedule,
                _ => _.data.getMerchantClockInSetting
              )}
              setTagId={setTagId}
              tagId={tagId}
              fontColor={fontColor}
              exportExcel={exportExcel}
              exportLoading={getEmployeeClockInScheduleExcelData.loading}
              loading={employeeClockInSchedule.loading}
              isClick={isClick}
              workingHourDisplay={workingHourDisplay}
            />
          )}
        </div>
        {((!employeeClockInSchedule.loading && !merchantClockInSchedule.loading)) ? (
          <Results
            displayDate={displayDate}
            rawTime={rawTime}
            fontColor={fontColor}
            tagId={tagId}
            setEmployeeSchedule={setEmployeeSchedule}
            employeeSchedule={employeeSchedule}
            editBefore={editBefore}
            exportExcel={exportExcel}
            exportLoading={getEmployeeClockInScheduleExcelData.loading}
            saveData={saveData}
            isClick={isClick}
            loading={employeeClockInSchedule.loading}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        ) :
          <div style={{ width: '100%', textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}
