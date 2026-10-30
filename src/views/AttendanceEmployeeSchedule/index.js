import { Switch } from 'ui/switch'
import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import DateSelector from 'components/DateSelector'
import { startOfMonth, addDays, format, endOfMonth } from 'date-fns'
import { useFetchGetMerchantClockInSchedule } from 'hooks/useFetchGetMerchantClockInSetting'
import useFetchGetEmployeeClockInSchedule from 'hooks/useFetchGetEmployeeClockInSchedule'
import useFetchSetEmployeeClockInSchedule from 'hooks/useFetchSetEmployeeClockInSchedule'
import useFetchGetIsEmployeeScheduleWorkingHourDisplay from 'hooks/useFetchGetIsEmployeeScheduleWorkingHourDisplay'
import useFetchGetUESUsingSetting from 'hooks/useFetchGetUESUsingSetting'
import useFetchGetEmployeeClockInScheduleExcel from 'hooks/useFetchGetEmployeeClockInScheduleExcel'
import cloneDeep from 'lodash/cloneDeep'
import { openSnackbar } from 'elements/snackbars'

import { Skeleton } from 'ui/skeleton'
import ScheduleTags from './ScheduleTags'
import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getEmployeeClockInScheduleExcelData.loading])

  // 儲存資料
  const saveData = async () => {
    const newData = cloneDeep(employeeSchedule)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsEmployeeScheduleWorkingHourDisplay.loading])
  useEffect(() => {
    const displayDate = []
    const rawTime = []
    const startDate = new Date(startOfMonth(new Date(date.startDate)).getTime()).getDate()
    const endDate = new Date(endOfMonth(new Date(date.endDate)).getTime()).getDate()
    let add = 0
    for (let i = startDate; i <= endDate; i++) {
      displayDate.push(
        `${format(addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime(), 'MM/dd')}${weekDisplay(
          format(addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime(), 'eeee')
        )}`
      )
      rawTime.push(`${addDays(new Date(startOfMonth(new Date(date.startDate)).getTime()), add).getTime()}`)
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
      // 查詢失敗時給空陣列，不整頁壞（Jason 2026/10/22 fix all）
      setEmployeeSchedule(idx(employeeClockInSchedule, _ => _.data.getEmployeeClockInSchedule) || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [employeeClockInSchedule.loading])

  useEffect(() => {
    if (!getUESUsingSetting.loading) {
      const data = idx(getUESUsingSetting, _ => _.data.getUESUsingSetting)
      setUESUsing(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getUESUsingSetting.loading])

  return (
    <Page className="ui-root" title="考勤排班總表">
      <div>
        <PageHeader
          title="考勤排班總表"
          actions={
            <>
              <div className="flex items-center gap-4">
                {UESUsing && (
                  <div className="flex items-center gap-1 text-body text-text-secondary">
                    <span>編輯過往班別</span>
                    <Switch size="small" checked={editBefore} onChange={e => setEditBefore(e.target.checked)} />
                  </div>
                )}
                <DateSelector
                  date={date}
                  attributes={['lastmonth', 'thismonth', 'startDate']}
                  dateChange={value => setDate(value)}
                  onlyStart
                  inputFormat="yyyy/MM"
                  pickerOption={{
                    views: ['month', 'year'],
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={isEditing ? saveData : () => setIsEditing(true)}
                disabled={isEditing ? employeeClockInSchedule.loading || isClick : false}
              >
                {isEditing ? '儲存' : '編輯班表'}
              </Button>
            </>
          }
        />
        <div className="mb-3">
          {!merchantClockInSchedule.loading && (
            <ScheduleTags
              merchantClockInSchedule={idx(merchantClockInSchedule, _ => _.data.getMerchantClockInSetting)}
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
        {employeeClockInSchedule.error ? (
          <QueryFailed onRetry={() => employeeClockInSchedule.refetch()} />
        ) : !employeeClockInSchedule.loading && !merchantClockInSchedule.loading ? (
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
        ) : (
          <Skeleton className="mt-4 h-96 w-full" />
        )}
      </div>
    </Page>
  )
}
