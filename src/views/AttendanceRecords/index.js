// 篩選區的員工 Autocomplete 未受控（選取值存在元件內）：收合時以 hidden 隱藏、不卸載（同原 Collapse），以免遺失；
// 補打卡彈窗內有 Autocomplete / DateTimePicker，保留相容層 Dialog（Radix Dialog 會與其彈出層焦點鎖互搶）
import { DialogActions, Dialog, DialogContent, DialogTitle } from 'ui/modal-compat'
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import { DateTimePicker } from 'ui/date-picker';
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { useFetchAttendanceRecordsLazy } from 'hooks/useFetchAttendanceRecords'
import { useFetchAttendanceRecordsExcelV2, useFetchAttendanceRecordsExcelV2ForHR } from 'hooks/useFetchAttendanceRecordsExcel'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchSetAddEmployeeClockInSchedule from 'hooks/useFetchSetAddEmployeeClockInSchedule'
import { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import useFetchGetMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { startOfMonth, addDays, format, endOfMonth } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { Autocomplete } from 'ui/combobox'
import { roleSectionAuthority, hasPageAuthority } from 'helper/rolePageAuthority'

const clockInType = [
  { label: '上班', value: 'CLOCKIN' },
  { label: '下班', value: 'CLOCKOUT' },
  { label: '休息開始', value: 'BREAKSTART' },
  { label: '休息結束', value: 'BREAKEND' },
]

const clockInFilter = [
  { label: '未知', value: 'NULL' },
  { label: '電腦打卡', value: 'ZERO' },
  { label: 'QRCODE打卡', value: 'QRCODE' },
  { label: '25M以內', value: 'LOWERTHAN25' },
  { label: '超過25M', value: 'BETWEEN25AND50' },
  { label: '超過50M', value: 'MORETHAN50' },
]

export default function Employees() {
  const urlParams = new URLSearchParams(window.location.search)
  const [userId, setUserId] = useState('')
  const [displayDate, setDisplayDate] = useState([])
  const [openDateModal, setOpenDateModal] = useState(false)
  const [userOptions, setUserOptioons] = useState([])
  const [selectItem, setSelectItem] = useState(clockInFilter)
  const [showFilter, setShowFilter] = useState(false)
  const [onClick, setOnClick] = useState(false)
  const [reClockInData, setReClockInData] = useState({
    date: new Date().getTime(),
    userId: '',
    status: 'CLOCKIN',
  })
  const [typeDisplay, setTypeDisplay] = useState(true)

  const [date, setDate] = useState({
    startDate: urlParams.has('startDate')
      ? startOfMonth(+urlParams.get('startDate')).getTime()
      : startOfMonth(new Date()).getTime(),
    endDate: urlParams.has('startDate')
      ? endOfMonth(+urlParams.get('startDate')).getTime()
      : endOfMonth(new Date()).getTime(),
  })

  const [attendanceRecordsLazy, attendanceRecordsLazyData] = useFetchAttendanceRecordsLazy()
  const [attendanceRecordsExcelLazyV2, attendanceRecordsExcelLazyDataV2] = useFetchAttendanceRecordsExcelV2()
  const [attendanceRecordsExcelLazyV2ForHR, attendanceRecordsExcelLazyDataV2ForHR] = useFetchAttendanceRecordsExcelV2ForHR()


  const [identity, setIdentity] = useState({
    add: false,
    edit: false,
    delete: false,
  })
  const user = useFetchUsersForCreatePicking()
  const { addEmployeeClockInSchedule } = useFetchSetAddEmployeeClockInSchedule()
  const profileIdentity = useFetchProfileIdentity()
  const merchantAuthorities = useFetchGetMerchantAuthorities()

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

  useEffect(() => {
    if (!profileIdentity.loading && !merchantAuthorities.loading) {
      const identityId = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityId)
      const authorities = idx(merchantAuthorities, _ => _.data.getMerchantAuthorities)

      const clockinIdentity = roleSectionAuthority(authorities, identityId, '打卡權限設定')
      const add = hasPageAuthority(clockinIdentity, '新增打卡紀錄')
      const edit = hasPageAuthority(clockinIdentity, '編輯打卡紀錄')
      const del = hasPageAuthority(clockinIdentity, '刪除打卡紀錄')

      setIdentity({
        add: add,
        edit: edit,
        delete: del,
      })
    }
  }, [profileIdentity.loading, merchantAuthorities.loading])

  useEffect(() => {
    if (!user.loading) {
      const data = idx(user, _ => _.data.users.users)
      setUserOptioons(data)
    }
  }, [user.loading])


  useEffect(() => {
    const displayDate = []
    const startDate = new Date(date.startDate).getDate()
    const endDate = new Date(date.endDate).getDate()
    let add = 0
    for (let i = startDate; i <= endDate; i++) {
      displayDate.push(
        `${format(addDays(new Date(date.startDate), add).getTime(), 'MM/dd')}${weekDisplay(
          format(addDays(new Date(date.startDate), add).getTime(), 'eeee')
        )}`
      )
      add++
    }
    setDisplayDate(displayDate)
    handleSearch()
  }, [date])

  useEffect(() => {
    if (!attendanceRecordsExcelLazyDataV2.loading && attendanceRecordsExcelLazyDataV2.data) {
      const url = idx(attendanceRecordsExcelLazyDataV2, _ => _.data.attendanceRecordsExcelV2)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [attendanceRecordsExcelLazyDataV2.loading])

  useEffect(() => {
    if (!attendanceRecordsExcelLazyDataV2ForHR.loading && attendanceRecordsExcelLazyDataV2ForHR.data) {
      const url = idx(attendanceRecordsExcelLazyDataV2ForHR, _ => _.data.attendanceRecordsExcelV2ForHR)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [attendanceRecordsExcelLazyDataV2ForHR.loading])

  const handleOpen = () => {
    setOpenDateModal(true)
    setOnClick(false)
  }

  const handleClose = () => {
    setOpenDateModal(false)
  }

  const handleSubmit = () => {
    setOnClick(true)
    if (isNaN(reClockInData.date) || reClockInData.date > new Date().getTime()) {
      openSnackbar({ message: isNaN(reClockInData.date) ? '時間有誤' : '請選取過去的時間', variant: 'warning' })
      setOnClick(false)
    } else if (reClockInData.userId === '') {
      openSnackbar({ message: '請選取員工', variant: 'warning' })
      setOnClick(false)
    } else {
      addEmployeeClockInSchedule({ input: reClockInData }).then(res => {
        if (res.data.addAttendantRecord) {
          openSnackbar({ message: '新增打卡成功', variant: 'success' })
          handleSearch()
          handleClose()
        }
      }).catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setOnClick(false)
      })
    }
  }

  const handleSearch = (excelExport = false) => {
    const filterArr = selectItem.map(d => d.value)
    const submitData = {
      variables: {
        input: {
          userId: userId,
          dateRange: date,
          distanceFilter: filterArr,
        }
      }
    }
    if (excelExport) {
      submitData.variables.input.isTypeDisplay = typeDisplay
      attendanceRecordsExcelLazyV2(submitData)
    } else {
      attendanceRecordsLazy(submitData)
    }
  }

  const handleHRExport = () => {
    const filterArr = selectItem.map(d => d.value)
    const submitData = {
      variables: {
        input: {
          userId: userId,
          dateRange: date,
          distanceFilter: filterArr,
          isTypeDisplay: typeDisplay,
        }
      }
    }
    attendanceRecordsExcelLazyV2ForHR(submitData)
  }
  return (
    <Page className="ui-root" title="全店打卡記錄">
      <div>
        <AdminPageHeader
          title='全店打卡記錄'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={identity.add ? {
            label: '補打卡',
            onClick: handleOpen,
            disabled: attendanceRecordsLazyData.data === undefined || attendanceRecordsLazyData.loading
          } : undefined}
        >
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={({ startDate, endDate }) => {
              setDate({
                startDate: startOfMonth(startDate).getTime(),
                endDate: endOfMonth(endDate).getTime()
              })
            }}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
            margin={false}
          />
        </AdminPageHeader>

        <div hidden={!showFilter}>
          <Card className="mb-6 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-1/4 min-w-[200px]">
                <Autocomplete
                  autoHighlight
                  options={userOptions}
                  onChange={(event, value) => {
                    if (!!value) {
                      setUserId(value.id)
                    } else {
                      setUserId('')
                    }
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      {`${option.name}${!!option.designerNo ? '-' + option.designerNo : '(無代號)'}`}
                    </li>
                  )}
                  filterOptions={(options, state) => {
                    const keyword = state.inputValue
                    if (keyword === '' || keyword.length === 0) {
                      return options
                    } else {
                      const newOptions = options.filter(d => d.designerNo !== null && d.designerNo.includes(keyword) || d.name !== null && d.name.includes(keyword))
                      return newOptions
                    }
                  }}
                  getOptionLabel={option => option.name}
                  renderInput={(params) => <TextField {...params} label="員工姓名/編號" variant='outlined' size="small" />}
                />
              </div>
              <div className="w-5/12 min-w-[280px]">
                <Autocomplete
                  multiple
                  fullWidth
                  size="small"
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
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => handleSearch()}
                  disabled={attendanceRecordsLazyData.data === undefined || attendanceRecordsLazyData.loading}
                >
                  搜尋
                </Button>
              </div>
            </div>
          </Card>
        </div>
        {attendanceRecordsLazyData.data !== undefined && !attendanceRecordsLazyData.loading ? idx(attendanceRecordsLazyData, _ => (
          <Results
            identity={identity}
            handleSearch={handleSearch}
            attendanceRecords={_.data.attendanceRecords}
            year={new Date(date.startDate).getFullYear()}
            displayDate={displayDate}
            typeDisplay={typeDisplay}
            setTypeDisplay={setTypeDisplay}
            handleHRExport={handleHRExport}
            handleExport={() => handleSearch(true)}
            exportLoading={attendanceRecordsExcelLazyDataV2.loading}
            exportHRLoading={attendanceRecordsExcelLazyDataV2ForHR.loading}
          />
        )) :
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[480px] w-full rounded-lg" />
          </div>
        }
      </div>
      <Dialog open={openDateModal} onClose={handleClose}>
        <DialogTitle>補打卡</DialogTitle>
        <DialogContent style={{ overflow: 'visible', display: 'flex' }} >
          <div style={{ width: '350px' }}>
            <ToggleGroup
              size="small"
              exclusive
              value={reClockInData.status}
              onChange={(event, value) => setReClockInData({ ...reClockInData, status: value })}
              style={{ marginBottom: '20px' }}
            >
              {clockInType.map((data, idx) => (
                <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                  {data.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <DateTimePicker
              label="選取時間"
              className="w-full"
              maxDateTime={new Date().getTime()}
              value={reClockInData.date}
              format="yyyy/MM/dd HH:mm"
              onChange={value => setReClockInData({ ...reClockInData, date: value === 'Invalid Date' ? 'Invalid Date' : new Date(value).getTime() })}
            />
            <Autocomplete
              style={{ marginTop: '20px' }}
              options={userOptions}
              onChange={(event, value) =>
                value === null ? setReClockInData({ ...reClockInData, userId: '' }) :
                  setReClockInData({ ...reClockInData, userId: value.id })}
              renderOption={(props, option) => (
                <li {...props}>
                  {`${option.name}${!!option.designerNo ? '-' + option.designerNo : '(無代號)'}`}
                </li>
              )}
              filterOptions={(options, state) => {
                const keyword = state.inputValue
                if (keyword === '' || keyword.length === 0) {
                  return options
                } else {
                  const newOptions = options.filter(d => d.designerNo !== null && d.designerNo.includes(keyword) || d.name !== null && d.name.includes(keyword))
                  return newOptions
                }
              }}
              getOptionLabel={option => option.name}
              renderInput={(params) => <TextField {...params} label="員工姓名/編號" variant='outlined' />}
            />
          </div>
        </DialogContent>
        <DialogActions className="ui-root" style={{ margin: '10px' }}>
          <Button onClick={handleClose} variant="secondary">
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={onClick}
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  )
}
