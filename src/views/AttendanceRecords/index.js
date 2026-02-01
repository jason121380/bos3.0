/** @jsxImportSource @emotion/react */
import {
  Container,
  Button,
  Grid,
  CircularProgress,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { Autocomplete } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    padding: theme.spacing(3, 0, 3, 0),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white,
    minWidth: '40px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    marginTop: '100px',
  }),
  searchBtn: css({
    width: '100px',
  }),
}

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

const HR_USERID_LIST = [
  'e8241adb-29ec-4c89-9180-0c2ea5b54480', // 林秀香
  '685b8f6a-f928-4cb2-86f1-7f41bd4c4855', // WangIan
  'ad9a4a1c-8a8d-481a-aee0-f7f16c5613d4', // WangIan
  '7afce29a-7759-40df-a378-d31cb7c01306', // 科技部人員(S)
  '9f6cc8ab-f465-40f7-871e-86dee1561a39', // JasonCheng
  'f6c5ef06-d215-4f7c-af23-27c4ea16bf61', // 鄭家明
  'bf8dfc12-b584-48a4-8a22-0dcd6892c816', // 廖靜媛
  '43e22ff1-51b3-45c4-b484-ca2cf08d8a35', // 賴冠吩
  '46fb33c9-0950-4ec4-8a58-3730eb1ca5f6', // 呂欣倫
]

export default function Employees() {
  const urlParams = new URLSearchParams(window.location.search)
  const [userId, setUserId] = useState('')
  const [displayDate, setDisplayDate] = useState([])
  const [openDateModal, setOpenDateModal] = useState(false)
  const [userOptions, setUserOptioons] = useState([])
  const [selectItem, setSelectItem] = useState(clockInFilter)
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

      const clockinIdentity = JSON.parse(
        authorities.find(d => {
          return d.id === identityId
        }).authoritySettings
      ).find(d => {
        return d.pageTitle === '打卡權限設定'
      }).pageAuthority

      const add = clockinIdentity.find(d => {
        return d.pageName === '新增打卡紀錄'
      }).authority
      const edit = clockinIdentity.find(d => {
        return d.pageName === '編輯打卡紀錄'
      }).authority
      const del = clockinIdentity.find(d => {
        return d.pageName === '刪除打卡紀錄'
      }).authority

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
    <Page css={styles.root} title="全店打卡記錄">
      <Container maxWidth={false} css={styles.container}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='全店打卡記錄' subTitle='ATTENDANCE RECORDS' />
          <Grid item>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label='匯出打卡類型'
              checked={typeDisplay}
              onChange={(e, v) => setTypeDisplay(v)}
            />
            <Button
              disabled={attendanceRecordsExcelLazyDataV2ForHR.loading}
              variant="contained"
              color="secondary"
              onClick={handleHRExport}
              style={{
                marginRight: '8px',
                fontSize: '0.8rem'
              }}
            >
              報表匯出<br />(人資格式)
            </Button>
            <Button disabled={attendanceRecordsExcelLazyDataV2.loading} variant="contained" color="primary" onClick={() => handleSearch(true)}>
              報表匯出
            </Button>
          </Grid>
        </Grid>
        <Grid item container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', flexWrap: 'wrap', gap: 10 }}>
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
          />
          <Grid style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {identity.add &&
              <Button
                onClick={handleOpen}
                style={{ height: 'fit-content' }}
                variant='contained'
                disabled={attendanceRecordsLazyData.data === undefined || attendanceRecordsLazyData.loading}
                color='primary'>
                補打卡
              </Button>
            }
            <div style={{ width: '250px' }}>
              <Autocomplete
                autoHighlight
                css={styles.formControl}
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
                renderInput={(params) => <TextField {...params} label="員工姓名/編號" variant='outlined' />}
              />
            </div>
          </Grid>
        </Grid>
        <div style={{ display: 'flex', margin: '12px 0' }}>
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
                  style={{ color: '#202D50', marginRight: 8 }}
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
          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              css={styles.searchBtn}
              onClick={() => handleSearch()}
              disabled={attendanceRecordsLazyData.data === undefined || attendanceRecordsLazyData.loading}
            >
              搜尋
            </Button>
          </div>
        </div>
        {attendanceRecordsLazyData.data !== undefined && !attendanceRecordsLazyData.loading ? idx(attendanceRecordsLazyData, _ => (
          <Results
            identity={identity}
            handleSearch={handleSearch}
            attendanceRecords={_.data.attendanceRecords}
            year={new Date(date.startDate).getFullYear()}
            displayDate={displayDate}
          />
        )) :
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        }
      </Container>
      <Dialog open={openDateModal} onClose={handleClose}>
        <DialogTitle>補打卡</DialogTitle>
        <DialogContent style={{ overflow: 'visible', display: 'flex' }} >
          <div style={{ width: '350px' }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={reClockInData.status}
              onChange={(event, value) => setReClockInData({ ...reClockInData, status: value })}
              style={{ marginBottom: '20px' }}
            >
              {clockInType.map((data, idx) => (
                <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                  {data.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <DateTimePicker
              label="選取時間"
              sx={{ width: '100%' }}
              maxDateTime={new Date().getTime()}
              value={reClockInData.date}
              format="yyyy/MM/dd HH:mm"
              onChange={value => setReClockInData({ ...reClockInData, date: value === 'Invalid Date' ? 'Invalid Date' : new Date(value).getTime() })}
            />
            <Autocomplete
              style={{ marginTop: '20px' }}
              css={styles.formControl}
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
        <DialogActions style={{ margin: '10px' }}>
          <Button onClick={handleClose} variant="contained" style={{ marginRight: '10px' }}>
            取消
          </Button>
          <Button
            variant="contained"
            color='primary'
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
