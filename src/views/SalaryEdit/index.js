/** @jsxImportSource @emotion/react */
import { Button, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantSalaryIncreaseItems from 'hooks/useFetchMerchantSalaryIncreaseItems'
import useFetchMerchantSalaryDecreaseItems from 'hooks/useFetchMerchantSalaryDecreaseItems'
import { useFetchUserSalary, useFetchIsUserSalaryChecked } from 'hooks/useFetchUser'
import { useFetchUsersMonthCheckout, useFetchUsersSalaryItems } from 'hooks/useFetchUsers'
import useFetchSettingUserSaleryItem from 'hooks/useFetchSettingUserSaleryItem'
import useFetchUserSalaryItem from 'hooks/useFetchUserSalaryItemRecord'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetAttendanceStatistics }  from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'
import idx from 'idx'
import _ from 'lodash'
import React from 'react'
import useFetchUserSalaryMonthlyCheckoutRecordV2 from 'hooks/useFetchUserSalaryMonthlyCheckoutRecordV2'
import { useFetchGetAttendanceStatus } from 'hooks/useFetchAttendanceRecords'
import { startOfMonth, format, endOfMonth } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Header from './Header'
import SalaryDecrease from './SalaryDecrease'
import SalaryIncrease from './SalaryIncrease'
import DesignerSalaryReportV2 from './DesignerSalaryReportV2'

const styles = {
  root: css({
    padding: theme.spacing(3),
    '& .headWrap': {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      '& .title': {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        flexDirection: 'row'
      },
      '& .attStatus': {
        '& p': {
          fontSize: 16
        }
      }
    }
  }),
  action: css({
    marginLeft: '10px',
  }),
  report: css({
    margin: '15px 0',
  }),
  lastNextDiv: css({
    width: '260px',
    display: 'flex',
    justifyContent: 'space-between',
  }),
}

const date = Number(location.search.split('=')[1])

export default React.memo(function SalaryEdit(props) {
  const { match, location } = props
  const MerchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const userInput = { usagelimit: 'EMPLOYEE_LIST', MerchantId }
  const [userIndex, setUserIndex] = React.useState(0)
  const [usersArr, setUsersArr] = React.useState([])
  const [isSalaryItemsLock, setIsSalaryItemsLock] = React.useState(false)
  const [usersIsSalaryChecked, setUsersIsSalaryChecked] = React.useState([])
  const [remark, setRemark] = React.useState('')
  const [focus, setFocus] = React.useState('')
  const [tabIndex, setTabIndex] = React.useState(0)
  const [attStatus, setAttStatus] = React.useState(null)
  const [attendanceDisplay, setAttendanceDisplay] = React.useState(false)

  const getAttendanceStatistics = useFetchGetAttendanceStatistics()
  const usersMonthCheckoutData = useFetchUsersMonthCheckout({
    usagelimit: 'EMPLOYEE_LIST',
    date: startOfMonth(date).getTime(),
  })

  const userSalayItemData = useFetchUserSalaryItem({
    designerId: match.params.id,
    date: date,
  })

  const usersSalayItemData = useFetchUsersSalaryItems({
    date: date,
    input: userInput,
  })

  const designerMonthlyCheckoutRedordData = useFetchUserSalaryMonthlyCheckoutRecordV2({
    date: date,
    userId: match.params.id,
  })
  const isUserSalaryCheckedData = useFetchIsUserSalaryChecked({
    input: { id: match.params.id },
    date: date,
  })

  const attendanceStatus = useFetchGetAttendanceStatus({
    userId: match.params.id,
    dateRange: {
      startDate: startOfMonth(date).getTime(),
      endDate: endOfMonth(date).getTime(),
    }
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  const { setUserSalaryItem } = useFetchSettingUserSaleryItem()

  const merchantSalaryIncreaseItems = useFetchMerchantSalaryIncreaseItems()
  const increaseReformatted = idx(merchantSalaryIncreaseItems, _ =>
    _.data.getMerchantSalaryIncreaseItems.map(data => ({
      itemName: data.itemSetting,
      price: 0,
      type: data.type,
      sorting: data.sorting,
    }))
  )
  const [salaryIncreaseItemsReformatted, setSalaryIncreaseItemsReformatted] = React.useState()

  const merchantSalaryDecreaseItems = useFetchMerchantSalaryDecreaseItems()
  const decreaseReformatted = idx(merchantSalaryDecreaseItems, _ =>
    _.data.getMerchantSalaryDecreaseItems.map(data => ({
      itemName: data.itemSetting,
      price: 0,
      type: data.type,
      sorting: data.sorting,
    }))
  )
  const [salaryDecreaseItemsReformatted, setSalaryDecreaseItemsReformatted] = React.useState()

  const userSalary = useFetchUserSalary({
    input: {
      id: match.params.id,
    },
    date: date,
  })
  const [increaseCombined, setIncreaseCombined] = React.useState()
  const [decreaseCombined, setDecreaseCombined] = React.useState()
  const [increaseSecondContent, setIncreaseSecondContent] = React.useState({
    increaseItems: [{ itemName: '', price: 0, type: 'INCREASE' }],
  })
  const [decreaseSecondContent, setDecreaseSecondContent] = React.useState({
    decreaseItems: [{ itemName: '', price: 0, type: 'DECREASE' }],
  })

  React.useEffect(() => {
    if (!attendanceStatus.loading) {
      const data = attendanceStatus.data.attendanceRecords
      if (data[0]) {
        setAttStatus(data[0])
      }
    }
  }, [attendanceStatus.loading])
  

  React.useEffect(() => {
    if (!usersMonthCheckoutData.loading) {
      const isUsersSalaryChacked = idx(usersMonthCheckoutData, _ => _.data.users.users)
      // 篩選出已結算的資料
      const correctData = isUsersSalaryChacked.filter(el => {
        return el.isSalaryChecked === true
      })
      setUsersIsSalaryChecked(correctData)
    }
  }, [usersMonthCheckoutData.loading])

  React.useEffect(() => {
    if (isUserSalaryCheckedData.data && !isUserSalaryCheckedData.loading) {
      const isUserSalaryItemLock = idx(isUserSalaryCheckedData, _ => _.data.user.isSalaryItemLocked)
      setIsSalaryItemsLock(isUserSalaryItemLock)
    }
  }, [isUserSalaryCheckedData.data, isUserSalaryCheckedData.loading])

  React.useEffect(() => {
    if (!userSalary.loading) {
      const remark = idx(userSalary, _ => _.data.user.remarkForSalary)
      setRemark(remark)
    }
  }, [userSalary.loading])

  React.useEffect(() => {
    if (!usersSalayItemData.loading) {
      // 篩選出已結算的資料
      const usersArr = idx(usersSalayItemData, _ => _.data.users.users).filter(el => {
        return el.isSalaryChecked === true
      })
      const user = usersArr.find(data => data.id === match.params.id)
      setUsersArr(usersArr)
      if (user !== undefined) {
        usersArr.forEach((userData, index) => {
          if (userData.id === user.id) {
            setUserIndex(index)
          }
        })
      }
    }
  }, [usersSalayItemData.loading, designerMonthlyCheckoutRedordData.loading])
  React.useEffect(() => {
    if (
      !userSalayItemData.loading &&
      !merchantSalaryIncreaseItems.loading &&
      !merchantSalaryDecreaseItems.loading &&
      increaseReformatted !== undefined &&
      decreaseReformatted !== undefined &&
      !designerMonthlyCheckoutRedordData.loading &&
      !usersSalayItemData.loading &&
      !isMemberShipCardActiveData.loading
    ) {
      // ==========INCREASE==========
      const initIncrease = []
      const increaseItem = idx(userSalayItemData, _ => _.data.userSalaryItemRecord.increaseItem)

      increaseReformatted.forEach(data => {
        const findData = increaseItem.find(data2 => data2.itemName === data.itemName)
        if (findData) {
          initIncrease.push({
            itemName: findData.itemName,
            price: findData.price,
            type: findData.type,
            sorting: findData.sorting,
            source: 'parameter',
          })
        } else {
          initIncrease.push({
            itemName: data.itemName,
            price: data.price,
            type: data.type,
            sorting: data.sorting,
            source: 'parameter',
          })
        }
      })

      const initIncreaseSecond = []
      // separate the increase if add from below(optional)
      userSalayItemData.data.userSalaryItemRecord.increaseItem.forEach(data => {
        if (initIncrease.every(data2 => data2.itemName !== data.itemName)) {
          initIncreaseSecond.push({
            itemName: data.itemName,
            price: data.price,
            type: data.type,
          })
        }
      })
      if (initIncreaseSecond.length > 0) {
        setIncreaseSecondContent({ increaseItems: initIncreaseSecond })
      }

      const memberActive = isMemberShipCardActiveData.data.getIsMemberShipCardActive
      const membership = initIncrease.find(d => d.itemName === '會員卡獎金')
      if (!memberActive && membership && membership.price === 0) {
        const index = initIncrease.findIndex(d => d.itemName === '會員卡獎金')
        index >= 0 && initIncrease.splice(index, 1)
      }
      // ==========DECREASE==========
      const initDecrease = []
      idx(userSalayItemData, _ =>
        _.data.userSalaryItemRecord.decreaseItem.length > 0
          ? _.data.userSalaryItemRecord.decreaseItem.map(data => {
            decreaseReformatted.forEach(data2 => {
              if (data.itemName === data2.itemName && data.price !== 0) {
                initDecrease.push({
                  itemName: data.itemName,
                  price: data.price,
                  type: data.type,
                  sorting: data2.sorting,
                  source: 'parameter',
                })
              }
            })
          })
          : [{ itemName: '', price: 0, type: 'DECREASE', source: 'optional' }]
      )

      // decrease from parameter but no value
      decreaseReformatted.forEach(data => {
        if (initDecrease.every(data2 => data2.itemName !== data.itemName)) {
          initDecrease.push({
            itemName: data.itemName,
            price: data.price,
            type: data.type,
            sorting: data.sorting,
            source: 'parameter',
          })
        }
      })

      const initDecreaseSecond = []
      // separate the increase if add from below(optional)
      userSalayItemData.data.userSalaryItemRecord.decreaseItem.forEach(data => {
        if (initDecrease.every(data2 => data2.itemName !== data.itemName)) {
          initDecreaseSecond.push({
            itemName: data.itemName,
            price: data.price,
            type: data.type,
          })
        }
      })
      if (initDecreaseSecond.length > 0) {
        setDecreaseSecondContent({ decreaseItems: initDecreaseSecond })
      }

      setIncreaseCombined(initIncrease)
      setDecreaseCombined(initDecrease)
      setSalaryIncreaseItemsReformatted(increaseReformatted)
      setSalaryDecreaseItemsReformatted(decreaseReformatted)
    }
  }, [
    userSalayItemData.loading,
    merchantSalaryIncreaseItems.loading,
    merchantSalaryDecreaseItems.loading,
    designerMonthlyCheckoutRedordData.loading,
    isMemberShipCardActiveData.loading,
    usersSalayItemData.loading,
    userIndex
  ])

  React.useEffect(() => {
    if (!getAttendanceStatistics.loading) {
      const data = idx(getAttendanceStatistics, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isAttendanceStatisticsDisplayOnUserSalary)
      setAttendanceDisplay(data)
    }
  }, [getAttendanceStatistics.loading])
  

  const handleSave = () => {
    const filteredIncreaseCombined = increaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )
    const filteredDecreaseCombined = decreaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )

    // delete if optional increase item repeat
    increaseCombined.map(data => {
      increaseSecondContent.increaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.map(data => {
      decreaseSecondContent.decreaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          decreaseSecondContent.decreaseItems.splice(index, 1)
        }
      })
    })

    const increaseDecreaseCombined = [
      ...filteredIncreaseCombined,
      ...filteredDecreaseCombined,
      ...increaseSecondContent.increaseItems,
      ...decreaseSecondContent.decreaseItems,
    ]
    const result = increaseDecreaseCombined.filter(data => data.itemName !== '' && data.price !== 0)

    const inputData = {
      userId: match.params.id,
      userSalaryItem: result,
      date: date,
      remark: remark,
    }
    setUserSalaryItem({ input: inputData }).then(() => {
      openSnackbar({
        message: '儲存成功',
        variant: 'success',
      })
      window.location.href = `/salary/overview?date=${date}`
    })
  }

  const handleBack = () => {
    window.location.href = `/salary/overview?date=${date}`
  }

  const handleToLastUser = () => {
    const filteredIncreaseCombined = increaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )
    const filteredDecreaseCombined = decreaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )

    // delete if optional increase item repeat
    increaseCombined.map(data => {
      increaseSecondContent.increaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.map(data => {
      decreaseSecondContent.decreaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          decreaseSecondContent.decreaseItems.splice(index, 1)
        }
      })
    })

    const increaseDecreaseCombined = [
      ...filteredIncreaseCombined,
      ...filteredDecreaseCombined,
      ...increaseSecondContent.increaseItems,
      ...decreaseSecondContent.decreaseItems,
    ]
    const result = increaseDecreaseCombined.filter(data => data.itemName !== '' && data.price !== 0)

    const inputData = {
      userId: match.params.id,
      userSalaryItem: result,
      date: date,
      remark: remark,
    }
    usersIsSalaryChecked.forEach((user, index) => {
      if (user.id === usersArr[userIndex - 1].id) {
        // 原本的 index !== 0 會讓第二筆資料無法回到第一筆
        if (user.isSalaryChecked) {
          setUserSalaryItem({ input: inputData }).then(() => {
            openSnackbar({
              message: '儲存成功',
              variant: 'success',
            })
            window.location.href = `/salary/edit/${usersArr[userIndex - 1].id}?date=${date}`
          })
        } else if (user.isSalaryChecked && index > 1) {
          setUserSalaryItem({ input: inputData }).then(() => {
            openSnackbar({
              message: '儲存成功',
              variant: 'success',
            })
            window.location.href = `/salary/edit/${usersArr[userIndex - 2].id}?date=${date}`
          })
        }
      }
    })
  }

  const handleToNextUser = () => {
    const filteredIncreaseCombined = increaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )
    const filteredDecreaseCombined = decreaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )

    // delete if optional increase item repeat
    increaseCombined.map(data => {
      increaseSecondContent.increaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.map(data => {
      decreaseSecondContent.decreaseItems.map((data2, index) => {
        if (data2.itemName === data.itemName) {
          decreaseSecondContent.decreaseItems.splice(index, 1)
        }
      })
    })

    const increaseDecreaseCombined = [
      ...filteredIncreaseCombined,
      ...filteredDecreaseCombined,
      ...increaseSecondContent.increaseItems,
      ...decreaseSecondContent.decreaseItems,
    ]
    const result = increaseDecreaseCombined.filter(
      data => data.itemName !== '' && data.price !== 0 && data.price !== null
    )

    const inputData = {
      userId: match.params.id,
      userSalaryItem: result,
      date: date,
      remark: remark,
    }

    usersIsSalaryChecked.forEach((user, index) => {
      if (user.id === usersArr[userIndex + 1].id) {
        if (user.isSalaryChecked) {
          setUserSalaryItem({ input: inputData }).then(() => {
            openSnackbar({
              message: '儲存成功',
              variant: 'success',
            })
            window.location.href = `/salary/edit/${usersArr[userIndex + 1].id}?date=${date}`
          })
        } else if (user.isSalaryChecked && index !== usersArr.length - 1) {
          setUserSalaryItem({ input: inputData }).then(() => {
            openSnackbar({
              message: '儲存成功',
              variant: 'success',
            })
            window.location.href = `/salary/edit/${usersArr[userIndex + 2].id}?date=${date}`
          })
        }
      }
    })
  }
  return (
    <Page title="薪資維護" css={styles.root}>
      <div className='headWrap'>
        <div className='title'>
          <PageTitle title={`${userSalary.data ? userSalary.data.user.name : ''} ${format(date, 'yyyy/MM')} 薪資表`} subTitle='Salary Edit' />
          <Header remark={remark} setRemark={setRemark} />
        </div>
        {(attendanceDisplay && !attendanceStatus.loading && attStatus) && (
          <div className='attStatus'>
            <p>總打卡天數：{attStatus.totalClockInDays}</p>
            <p>總曠職天數：{attStatus.absenteeismDays}</p>
            <p>總遲到分鐘數：{attStatus.totalLateMinutes}</p>
          </div>
        )}
      </div>
      <Grid container style={{ justifyContent: 'space-between' }} spacing={2}>
        {!designerMonthlyCheckoutRedordData.loading &&
          !isMemberShipCardActiveData.loading &&
          increaseCombined !== undefined &&
          increaseSecondContent !== undefined &&
          decreaseCombined !== undefined &&
          decreaseSecondContent !== undefined ? (
          <Grid item xs={12}>
            <DesignerSalaryReportV2
              userSalary={userSalary}
              designer={designerMonthlyCheckoutRedordData.data.getUserSalaryMonthlyCheckoutRecordV2}
              memberActive={isMemberShipCardActiveData.data.getIsMemberShipCardActive}
              actualTransferFun={
                increaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
                increaseSecondContent.increaseItems.reduce((accu, curVal) => accu + curVal.price, 0) -
                (decreaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
                  decreaseSecondContent.decreaseItems.reduce((accu, curVal) => accu + curVal.price, 0))
              }
            />
          </Grid>
        ) : (
          <Grid item md={6} xs={12}></Grid>
        )}
        <Grid item xs={12}>
          {idx(
            userSalary,
            _ =>
              _.data.user.salary && (
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                  <Grid item xs={6}>
                    {increaseCombined !== undefined && increaseSecondContent !== undefined && (
                      <SalaryIncrease
                        salaryIncreaseItemsReformatted={salaryIncreaseItemsReformatted}
                        increaseSecondContent={increaseSecondContent}
                        increaseCombined={increaseCombined}
                        setIncreaseCombined={setIncreaseCombined}
                        setSalaryIncreaseItemsReformatted={setSalaryIncreaseItemsReformatted}
                        setIncreaseSecondContent={setIncreaseSecondContent}
                        isSalaryItemsLock={isSalaryItemsLock}
                        userSalary={userSalary}
                        focus={focus}
                        setFocus={setFocus}
                        tabIndex={tabIndex}
                        setTabIndex={setTabIndex}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {decreaseCombined !== undefined && decreaseSecondContent !== undefined && (
                      <SalaryDecrease
                        salaryDecreaseItemsReformatted={salaryDecreaseItemsReformatted}
                        decreaseSecondContent={decreaseSecondContent}
                        decreaseCombined={decreaseCombined}
                        setDecreaseCombined={setDecreaseCombined}
                        setSalaryDecreaseItemsReformatted={setSalaryDecreaseItemsReformatted}
                        setDecreaseSecondContent={setDecreaseSecondContent}
                        isSalaryItemsLock={isSalaryItemsLock}
                        userSalary={userSalary}
                        focus={focus}
                        setFocus={setFocus}
                        tabIndex={tabIndex}
                        setTabIndex={setTabIndex}
                      />
                    )}
                  </Grid>
                </Grid>
              )
          )}
          <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button color="primary" variant="contained" onClick={handleBack}>
                返回
              </Button>
              {!isSalaryItemsLock && (
                <Button
                  color="error"
                  variant="contained"
                  css={styles.action}
                  onClick={handleSave}
                  style={{ color: 'white', backgroundColor: 'red' }}
                >
                  儲存
                </Button>
              )}
            </div>
            {!isSalaryItemsLock && (
              <div css={styles.lastNextDiv}>
                {userIndex === 0 ? (
                  ''
                ) : (
                  <Button
                    color="error"
                    variant="contained"
                    disabled={userIndex === 0}
                    onClick={handleToLastUser}
                    style={{ color: 'white', backgroundColor: 'red' }}
                  >
                    儲存並上一筆
                  </Button>
                )}
                {userIndex === usersArr.length - 1 ? (
                  ''
                ) : (
                  <Button
                    color="error"
                    variant="contained"
                    disabled={userIndex === usersArr.length - 1}
                    onClick={handleToNextUser}
                    style={{ color: 'white', backgroundColor: 'red' }}
                  >
                    儲存並下一筆
                  </Button>
                )}
              </div>
            )}
          </div>
        </Grid>
      </Grid>
    </Page>
  )
})
