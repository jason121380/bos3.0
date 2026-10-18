import React, { useState, useEffect } from 'react'
// 篩選用 Autocomplete（multiple＋選項內 Checkbox）保留 MUI
import { TextField, Checkbox } from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Page from 'components/Page'
import useFetchDailyClockInRecord, { useFetchDailyClockInRecordLazy } from 'hooks/useFetchDailyClockInRecord'
import { format } from 'date-fns'
import idx from 'idx'
import useFetchSetUserClockIn from 'hooks/useFetchSettingUserClockIn'
import { useFetchGetEmployeeClockInDisplay } from 'hooks/useFetchGetParameterReportSetting'
import { openSnackbar } from 'elements/snackbars'
import { Autocomplete } from '@mui/material'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { Button } from 'ui/button'
import { Card } from 'ui/card'

import Results from './Results'

const clockInFilter = [
  { label: '未知', value: 'NULL' },
  { label: '電腦打卡', value: 'ZERO' },
  { label: '25M以內', value: 'LOWERTHAN25' },
  { label: '超過25M', value: 'BETWEEN25AND50' },
  { label: '超過50M', value: 'MORETHAN50' },
]

const EmployeeClockIn = () => {
  const [clockInRecord, setClockInRecord] = useState([])
  const [selectItem, setSelectItem] = useState(clockInFilter)
  const { setUserClockIn } = useFetchSetUserClockIn()
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [isToday, setIsToday] = useState(false)
  const [btnStatus, setBtnStatus] = useState([])
  const [dailyClockInRecordLazy, dailyClockInRecordLazyData] = useFetchDailyClockInRecordLazy()
  const [filterDisplay, setFilterDiaply] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const clockInDataForBtnStatus = useFetchDailyClockInRecord({ date: date.startDate })
  const getEmployeeClockInDisplay = useFetchGetEmployeeClockInDisplay()

  useEffect(() => {
    if (dailyClockInRecordLazyData.data !== undefined && !dailyClockInRecordLazyData.loading && !clockInDataForBtnStatus.loading) {
      const DataForBtnStatus = idx(clockInDataForBtnStatus, _ => _.data.dailyClockInRecord)
      setBtnStatus(DataForBtnStatus)
      const clockInRecord = idx(dailyClockInRecordLazyData, _ => _.data.dailyClockInRecord)
      setClockInRecord(clockInRecord)
    }
  }, [dailyClockInRecordLazyData.loading, clockInDataForBtnStatus.loading])

  useEffect(() => {
    setIsToday(format(new Date(date.startDate), 'yyyy/MM/dd') === format(new Date(), 'yyyy/MM/dd'))
    handleSearch()
  }, [date])

  useEffect(() => {
    if (!getEmployeeClockInDisplay.loading) {
      const data = idx(getEmployeeClockInDisplay, _ => _.data.getParameterReportSetting.isEDCIFilterDisplay)
      setFilterDiaply(data)
    }
  }, [getEmployeeClockInDisplay.loading])


  const handleClockIn = (id, status) => {
    setUserClockIn({
      input: {
        userIds: [id],
        status: status,
      },
    })
      .then(res => {
        if (res.data.userClockIn.status === true) {
          openSnackbar({
            message: '打卡成功',
            variant: 'success',
          })
          clockInDataForBtnStatus.refetch()
          handleSearch()
        } else {
          openSnackbar({
            message: res.data.userClockIn.message,
            variant: 'warning',
          })
        }
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
      })
  }

  const handleSearch = () => {
    const filterArr = selectItem.map(d => d.value)
    const submitData = {
      variables: {
        date: date.startDate,
        distanceFilter: filterArr,
      }
    }
    dailyClockInRecordLazy(submitData)
  }

  return (
    <Page className="ui-root" title="現場電腦打卡">
      <AdminPageHeader
        title='現場電腦打卡'
        onFilterClick={filterDisplay ? () => setShowFilter(!showFilter) : null}
        showFilter={showFilter}
      >
        <DateSelector
          date={date}
          attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
          dateChange={value => setDate(value)}
          margin={false}
        />
      </AdminPageHeader>

      {showFilter && (
        <Card className="mb-6 flex items-center gap-3 p-4">
          <Autocomplete
            multiple
            fullWidth
            value={selectItem}
            onChange={(e, v) => setSelectItem(v)}
            options={clockInFilter}
            disableCloseOnSelect
            getOptionLabel={option => option.label}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={selected}
                />
                {option.label}
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                label="篩選打卡記錄"
                placeholder="篩選條件"
              />
            )}
          />
          <Button
            variant="primary"
            className="shrink-0"
            onClick={handleSearch}
            disabled={dailyClockInRecordLazyData.data === undefined || dailyClockInRecordLazyData.loading}
          >
            搜尋
          </Button>
        </Card>
      )}
      <Results
        handleSearch={handleSearch}
        clockInRecord={clockInRecord}
        handleClockIn={handleClockIn}
        isToday={isToday}
        btnStatus={btnStatus}
      />
    </Page>
  )
}

export default EmployeeClockIn
