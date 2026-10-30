import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantSalaryIncreaseItems from 'hooks/useFetchMerchantSalaryIncreaseItems'
import useFetchMerchantSalaryDecreaseItems from 'hooks/useFetchMerchantSalaryDecreaseItems'
import { useFetchUserSalary, useFetchIsUserSalaryChecked } from 'hooks/useFetchUser'
import { useFetchUsersMonthCheckout, useFetchUsersSalaryItems } from 'hooks/useFetchUsers'
import useFetchSettingUserSalaryItem from 'hooks/useFetchSettingUserSalaryItem'
import useFetchUserSalaryItem from 'hooks/useFetchUserSalaryItemRecord'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetAttendanceStatistics }  from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'
import idx from 'idx'
import React from 'react'
import useFetchUserSalaryMonthlyCheckoutRecordV2 from 'hooks/useFetchUserSalaryMonthlyCheckoutRecordV2'
import { useFetchGetAttendanceStatus } from 'hooks/useFetchAttendanceRecords'
import { startOfMonth, format, endOfMonth } from 'date-fns'

import { Button } from 'ui/button'
import Header from './Header'
import SalaryDecrease from './SalaryDecrease'
import SalaryIncrease from './SalaryIncrease'
import DesignerSalaryReportV2 from './DesignerSalaryReportV2'
import QueryFailed from 'components/QueryFailed'

export default React.memo(function SalaryEdit(props) {
  const { match, location } = props
  // 每次 render 由 router 的 location 取月份；原本在模組層讀 window.location 只算一次，從薪資總覽換月再進來會沿用舊月份
  const date = Number(location.search.split('=')[1])
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

  const { setUserSalaryItem } = useFetchSettingUserSalaryItem()

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
      const data = idx(attendanceStatus, _ => _.data.attendanceRecords) || []
      if (data[0]) {
        setAttStatus(data[0])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [attendanceStatus.loading])
  

  React.useEffect(() => {
    if (!usersMonthCheckoutData.loading) {
      // 查詢失敗時當成沒有已結算資料（原本讀 undefined.filter 整頁錯誤；2026/10/28）
      const isUsersSalaryChacked = idx(usersMonthCheckoutData, _ => _.data.users.users) || []
      // 篩選出已結算的資料
      const correctData = isUsersSalaryChacked.filter(el => {
        return el.isSalaryChecked === true
      })
      setUsersIsSalaryChecked(correctData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [usersMonthCheckoutData.loading])

  React.useEffect(() => {
    if (isUserSalaryCheckedData.data && !isUserSalaryCheckedData.loading) {
      const isUserSalaryItemLock = idx(isUserSalaryCheckedData, _ => _.data.user.isSalaryItemLocked)
      setIsSalaryItemsLock(isUserSalaryItemLock)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isUserSalaryCheckedData.data, isUserSalaryCheckedData.loading])

  React.useEffect(() => {
    if (!userSalary.loading) {
      const remark = idx(userSalary, _ => _.data.user.remarkForSalary)
      setRemark(remark)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [userSalary.loading])

  React.useEffect(() => {
    if (!usersSalayItemData.loading) {
      // 篩選出已結算的資料
      // 查詢失敗時當成沒有員工清單（只影響上一位／下一位；原本讀 undefined.filter 整頁錯誤；2026/10/28）
      const usersArr = (idx(usersSalayItemData, _ => _.data.users.users) || []).filter(el => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [usersSalayItemData.loading, designerMonthlyCheckoutRedor…] 變動時執行；match.params.id、usersSalayItemData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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
      !isMemberShipCardActiveData.loading &&
      // 查詢失敗時 data 為 undefined，不讀欄位（2026/10/28 稽核 B-04）
      idx(userSalayItemData, _ => _.data.userSalaryItemRecord)
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
            sorting: data.sorting,
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

      const memberActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
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
            return undefined
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [ userSalayItemData.loading, merchantSalaryIncreaseItems.…] 變動時執行；decreaseReformatted、increaseReformatted、isMemberShipCardActiveData、userSalayItemData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttendanceStatistics.loading])
  

  const handleSave = () => {
    const filteredIncreaseCombined = increaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )
    const filteredDecreaseCombined = decreaseCombined.map(
      ({ source, ...keepProteries }) => keepProteries
    )

    // delete if optional increase item repeat
    increaseCombined.forEach(data => {
      increaseSecondContent.increaseItems.forEach((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.forEach(data => {
      decreaseSecondContent.decreaseItems.forEach((data2, index) => {
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
    increaseCombined.forEach(data => {
      increaseSecondContent.increaseItems.forEach((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.forEach(data => {
      decreaseSecondContent.decreaseItems.forEach((data2, index) => {
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
    increaseCombined.forEach(data => {
      increaseSecondContent.increaseItems.forEach((data2, index) => {
        if (data2.itemName === data.itemName) {
          increaseSecondContent.increaseItems.splice(index, 1)
        }
      })
    })
    // delete if optional decrease item repeat
    decreaseCombined.forEach(data => {
      decreaseSecondContent.decreaseItems.forEach((data2, index) => {
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
  // 頁面外距由 #printContainer 提供；「儲存」為本頁唯一主要按鈕
  // 員工薪資資料讀取失敗：顯示可重試的錯誤狀態，不顯示空白薪資表（避免把空值存回去）
  if (userSalary.error) {
    return (
      <Page title="薪資維護" className="ui-root">
        <QueryFailed onRetry={() => userSalary.refetch()} />
      </Page>
    )
  }

  return (
    <Page title="薪資維護" className="ui-root">
      <div className="noprint flex flex-wrap items-start justify-between gap-4 pb-6">
        <div className="flex flex-wrap items-end gap-4">
          <h1 className="m-0 text-title !font-bold text-text">{`${userSalary.data ? userSalary.data.user.name : ''} ${format(date, 'yyyy/MM')} 薪資表`}</h1>
          <Header remark={remark} setRemark={setRemark} />
        </div>
        {(attendanceDisplay && !attendanceStatus.loading && attStatus) && (
          <div className="flex flex-col gap-1 text-body tabular-nums text-text-secondary">
            <p>總打卡天數：{attStatus.totalClockInDays}</p>
            <p>總曠職天數：{attStatus.absenteeismDays}</p>
            <p>總遲到分鐘數：{attStatus.totalLateMinutes}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {!designerMonthlyCheckoutRedordData.loading &&
          !isMemberShipCardActiveData.loading &&
          increaseCombined !== undefined &&
          increaseSecondContent !== undefined &&
          decreaseCombined !== undefined &&
          decreaseSecondContent !== undefined ? (
          <div>
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
          </div>
        ) : (
          <div></div>
        )}
        <div>
          {idx(
            userSalary,
            _ =>
              _.data.user.salary && (
                <div className="mt-2 grid grid-cols-2 gap-6">
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                </div>
              )
          )}
          <div className="my-5 flex justify-between">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleBack}>
                返回
              </Button>
              {!isSalaryItemsLock && (
                <Button
                  variant="primary"
                  onClick={handleSave}
                >
                  儲存
                </Button>
              )}
            </div>
            {!isSalaryItemsLock && (
              <div className="flex items-center gap-2">
                {userIndex === 0 ? (
                  ''
                ) : (
                  <Button
                    variant="secondary"
                    disabled={userIndex === 0}
                    onClick={handleToLastUser}
                  >
                    儲存並上一筆
                  </Button>
                )}
                {userIndex === usersArr.length - 1 ? (
                  ''
                ) : (
                  <Button
                    variant="secondary"
                    disabled={userIndex === usersArr.length - 1}
                    onClick={handleToNextUser}
                  >
                    儲存並下一筆
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
})
