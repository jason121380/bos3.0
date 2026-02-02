/** @jsxImportSource @emotion/react */
import {
  Container, Grid, Button, Typography, FormControl, Select,
  InputLabel, MenuItem, CircularProgress,
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { Card } from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import { useFethcMonthlyCloseStatus } from 'hooks/useFetchMerchant'
import { useFetchUsersSalaryItems, useFetchUsersMonthCheckout } from 'hooks/useFetchUsers'
import useFetchIsSalaryChacked from 'hooks/useFetchIsSalaryChacked'
import useFetchSettingUserSalaryItemUnlock from 'hooks/useFetchSetUnlockUserSalaryItem'
import useFetchSalaryItemLock from 'hooks/useFetchIsSalaryitemLocked'
import useFetchMerchantLatestMonthlyCheckoutTime from 'hooks/useFetchMerchantLatestMonthlyCheckoutTime'
import useFetchGetIsBorrowDisplayInSalaryOverview from 'hooks/useFetchGetIsBorrowDisplayInSalaryOverview'
import { startOfDay, subMonths } from 'date-fns'
import idx from 'idx'
import produce from 'immer'
import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router'
import useFetchGetSalaryUserList from 'hooks/useFetchGetSalaryUserList'
import { format } from 'validate.js'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Header from './Header'
import Overview from './Overview'
import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

export default function SalaryOverview() {
  const lastMonth = subMonths(startOfDay(new Date()), 1).getTime()
  if (localStorage.getItem('currentTime') === null) {
    localStorage.setItem('currentTime', lastMonth)
  } else {
    localStorage.removeItem('currentTime')
    localStorage.setItem('currentTime', lastMonth)
  }

  const location = useLocation()
  const history = useHistory()

  const { setUserSalaryItemUnlock } = useFetchSettingUserSalaryItemUnlock()
  const [isThisMonthSalaryChacked, setIsThisMonthSalaryChacked] = React.useState(false)
  const [isSalaryItemsLock, setIsSalaryItemsLock] = React.useState(false)
  const [editBtnStatus, setEditBtnStatus] = React.useState(false)
  const [usersIsSalaryChecked, setUsersIsSalaryChecked] = React.useState([])
  const [borrowDisplay, setBorrowDisplay] = React.useState(false)
  const getIsBorrowDisplayInSalaryOverview = useFetchGetIsBorrowDisplayInSalaryOverview()

  const monthlyCloseStatus = useFethcMonthlyCloseStatus(
    location.search.split('=')[1] === undefined
      ? JSON.parse(localStorage.getItem('currentTime'))
      : Number(location.search.split('=')[1])
  )
  const MerchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const userInput = { usagelimit: 'SALARY', MerchantId }
  const [setting, setSetting] = React.useState({
    input: {
      pageLimit: 50,
      pageOffset: 0,
      isStaff: false,
    },
    date:
      location.search.split('=')[1] === undefined
        ? JSON.parse(localStorage.getItem('currentTime'))
        : Number(location.search.split('=')[1]),
  })
  const salaryItemLockData = useFetchSalaryItemLock({ date: setting.date })
  React.useEffect(() => {
    if (!salaryItemLockData.loading) {
      const data = idx(salaryItemLockData, _ => _.data.isSalaryitemLocked)
      setIsSalaryItemsLock(data)
    }
  }, [salaryItemLockData.loading])
  const latestMonthlyCheckoutTime = useFetchMerchantLatestMonthlyCheckoutTime({
    date: setting.date,
  })
  // 拿月結時間----------------------------------------------------
  const [monthlyCheckoutTime, setMonthlyCheckoutTime] = useState(null)
  useEffect(() => {
    if (!latestMonthlyCheckoutTime.loading) {
      setMonthlyCheckoutTime(
        idx(latestMonthlyCheckoutTime, _ => _.data.merchantLatestMonthlyCheckoutTime)
      )
    }
  }, [latestMonthlyCheckoutTime.loading])
  // -------------------------------------------------------------
  const showOption = [
    { label: '全部', value: 'ALL' },
    { label: '已月結', value: 'CHECKED' },
    { label: '未結算', value: 'UNCHECKED' },
  ]
  // 列表狀態----------------------------------------------------
  const [listStatus, setListStatus] = useState('ALL')
  // -------------------------------------------------------------
  const users = useFetchUsersMonthCheckout({
    usagelimit: 'SALARY',
    date:
      location.search.split('=')[1] === undefined
        ? JSON.parse(localStorage.getItem('currentTime'))
        : Number(location.search.split('=')[1]),
  })
  React.useEffect(() => {
    if (!users.loading) {
      const isUsersSalaryChacked = idx(users, _ => _.data.users.users)
      setUsersIsSalaryChecked(isUsersSalaryChacked)
    }
  }, [users.loading])

  const userSalayItemData = useFetchUsersSalaryItems({
    date: setting.date,
    input: userInput,
  })
  const isSalaryChackedData = useFetchIsSalaryChacked({
    date: setting.date,
  })
  // 列表input----------------------------------------------------
  const salaryUserList = useFetchGetSalaryUserList({
    date: setting.date,
    input: listStatus,
  })
  // -------------------------------------------------------------

  React.useEffect(() => {
    if (!isSalaryChackedData.loading) {
      const isSalaryChacked = idx(isSalaryChackedData, _ => _.data.isSalaryChacked)
      setIsThisMonthSalaryChacked(isSalaryChacked)
    }
  }, [isSalaryChackedData.loading])

  const handleOnChangePage = (event, page) => {
    setSetting(
      produce(draft => {
        draft.input.pageOffset = page
      })
    )
  }

  const handleOnChangeRowsPerPage = event => {
    idx(event, _ => {
      setSetting(
        produce(draft => {
          draft.input.pageLimit = _.target.value
          draft.input.pageOffset = 0
        })
      )
    })
  }
  const handleDateChange = date => {
    setSetting(
      produce(draft => {
        draft.date = date
      })
    )
    history.push(`/salary/overview?date=${date}`)
  }
  const handleIsSalaryItemsLock = () => {
    if (isSalaryItemsLock) {
      setUserSalaryItemUnlock({ date: setting.date }).then(res => {
        salaryItemLockData.refetch()
        window.location.reload()
        openSnackbar({
          message: '加扣項已解鎖',
          variant: 'warning',
        })
      })
    } else {
      openSnackbar({
        message: `請確認薪資是否已經登入完，
      薪資鎖定後將無法更改。
      `,
        variant: 'error',
        disableHide: true,
        resign: true,
        salaryItemsLock: true,
        salaryItemLockDataRefetch: salaryItemLockData.refetch,
        settingDate: setting.date,
      })
    }
  }

  React.useEffect(() => {
    if (!salaryItemLockData.loading) {
      const btnStatus = idx(salaryItemLockData, _ => _.data.isSalaryitemLocked)
      setEditBtnStatus(btnStatus)
    }
  }, [salaryItemLockData.loading])

  React.useEffect(() => {
    if (!getIsBorrowDisplayInSalaryOverview.loading) {
      const data = idx(getIsBorrowDisplayInSalaryOverview, _ => _.data.getIsBorrowDisplayInSalaryOverview)
      setBorrowDisplay(data)
    }
  }, [getIsBorrowDisplayInSalaryOverview.loading])
  return (
    <Page css={styles.root} title="薪資總表/月結">
      <Container maxWidth={false}>
        <AdminPageHeader title='薪資總表/月結' sx={{ marginBottom: '8px !important' }}>
          <Header
            date={setting.date}
            onChange={handleDateChange}
            status={idx(monthlyCloseStatus, _ => _.data.merchant.monthlyCloseStatus)}
          />
        </AdminPageHeader>
        {idx(salaryUserList, _ => _.data.getSalaryUserList) ?
          idx(
            salaryUserList,
            _ =>
              _.data.getSalaryUserList && (
                <React.Fragment>
                  <Grid container alignItems='stretch' spacing={2} style={{ marginBottom: '16px' }}>
                    <Grid item xs={12} md={7}>
                      <Overview usersSalary={_.data.getSalaryUserList} date={setting.date} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Card sx={{
                        height: '100%',
                        border: '1px solid #f0f0f0',
                        borderRadius: '12px',
                        boxShadow: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 2.5,
                        backgroundColor: '#ffffff'
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, display: 'flex', alignItems: 'center', fontSize: '14.5px' }}>
                          <span style={{ backgroundColor: theme.palette.primary.main, width: '4px', height: '16px', display: 'inline-block', marginRight: '8px', borderRadius: '2px' }}></span>
                          操作指南
                        </Typography>
                        <Grid container spacing={1}>
                          {[
                            "步驟1: 選擇要月結的人『打勾』或是全選",
                            "步驟2: 下方按下『批次月結』",
                            "步驟3: 月結完成後，點擊「鉛筆圖示」進入每個人加扣項核對",
                            "步驟4: 全部確認正確後，按下『鎖定』"
                          ].map((step, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14.5px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                <span style={{ marginRight: '8px', color: theme.palette.primary.main, fontWeight: 'bold' }}>•</span>
                                {step}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} alignItems='center' style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                      <FormControl variant="outlined" style={{ width: '150px', marginRight: '16px' }}>
                        <InputLabel id="select-item-label">狀態</InputLabel>
                        <Select
                          labelId="select-item-label"
                          id="select-item"
                          label='狀態'
                          size="small"
                          value={listStatus}
                          onChange={event => setListStatus(event.target.value)}
                        >
                          {showOption.map((data, idx) => (
                            <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                              {data.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        variant="contained"
                        onClick={handleIsSalaryItemsLock}
                        css={css({
                          backgroundColor: isSalaryItemsLock ? '#f4b400 !important' : '#1A73E8 !important',
                          color: 'white !important',
                          minWidth: '120px',
                          height: '40px !important',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          borderRadius: '50px',
                          padding: '0 24px',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: isSalaryItemsLock ? '#e3a300 !important' : '#1557b0 !important',
                            boxShadow: '0 2px 10px rgba(26, 115, 232, 0.3) !important'
                          }
                        })}
                      >
                        {isSalaryItemsLock ? '取消鎖定薪資' : '鎖定薪資'}
                      </Button>

                      {monthlyCheckoutTime && (
                        <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" color="textSecondary" style={{ fontWeight: 500, fontSize: '13px', lineHeight: 1.2 }}>
                            上次月結完成時間
                          </Typography>
                          <Typography variant="caption" color="textSecondary" style={{ fontWeight: 700, fontSize: '14px', color: theme.palette.text.primary }}>
                            {format(new Date(monthlyCheckoutTime).toLocaleString(), 'yyyy/MM/dd HH:mm')}
                          </Typography>
                        </div>
                      )}
                    </Grid>

                  </Grid>
                  <Results
                    status={idx(monthlyCloseStatus, _ => _.data.merchant.monthlyCloseStatus)}
                    calendarDate={setting.date}
                    pageSetting={setting.input}
                    className={styles.results}
                    isSalaryChackedData={isSalaryChackedData}
                    salaryUserList={salaryUserList}
                    userSalayItemData={userSalayItemData}
                    usersSalary={_.data.getSalaryUserList}
                    handleOnChangePage={handleOnChangePage}
                    handleOnChangeRowsPerPage={handleOnChangeRowsPerPage}
                    isThisMonthSalaryChacked={isThisMonthSalaryChacked}
                    editBtnStatus={editBtnStatus}
                    usersIsSalaryChecked={usersIsSalaryChecked}
                    isSalaryItemsLock={isSalaryItemsLock}
                    borrowDisplay={borrowDisplay}
                  />
                </React.Fragment>
              )
          ) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}
