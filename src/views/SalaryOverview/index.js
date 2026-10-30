// 狀態下拉的 onChange 依賴 event.target.value，使用 ui/native-select NativeSelect
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import { useFethcMonthlyCloseStatus } from 'hooks/useFetchMerchant'
import { useFetchUsersSalaryItems, useFetchUsersMonthCheckout } from 'hooks/useFetchUsers'
import useFetchIsSalaryChecked from 'hooks/useFetchIsSalaryChecked'
import useFetchSettingUserSalaryItemUnlock from 'hooks/useFetchSetUnlockUserSalaryItem'
import useFetchSalaryItemLock from 'hooks/useFetchIsSalaryitemLocked'
import useFetchMerchantLatestMonthlyCheckoutTime from 'hooks/useFetchMerchantLatestMonthlyCheckoutTime'
import useFetchGetIsBorrowDisplayInSalaryOverview from 'hooks/useFetchGetIsBorrowDisplayInSalaryOverview'
import { startOfDay, subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import idx from 'idx'
import produce from 'immer'
import React, { useEffect, useState } from 'react'
import { useLocation, useHistory } from 'react-router'
import useFetchGetSalaryUserList from 'hooks/useFetchGetSalaryUserList'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'

import useQueryString from 'hooks/useQueryString'
import DateSelector from 'components/DateSelector'
import Overview from './Overview'
import Results from './Results'
import { PageHeader } from 'ui/page-header'

export default function SalaryOverview() {
  const lastMonth = startOfMonth(subMonths(new Date(), 1)).getTime()
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

  const [getQueryString] = useQueryString()
  const urlDate = getQueryString('startDate') || getQueryString('date')
  const defaultDate = JSON.parse(localStorage.getItem('currentTime'))

  const monthlyCloseStatus = useFethcMonthlyCloseStatus(urlDate === '' ? defaultDate : Number(urlDate))
  const MerchantId = JSON.parse(localStorage.getItem('userMerchant')).id
  const userInput = { usagelimit: 'SALARY', MerchantId }
  const [setting, setSetting] = React.useState({
    input: {
      pageLimit: 50,
      pageOffset: 0,
      isStaff: false,
    },
    date: urlDate === '' ? defaultDate : Number(urlDate),
  })
  const salaryItemLockData = useFetchSalaryItemLock({ date: setting.date })
  React.useEffect(() => {
    if (!salaryItemLockData.loading) {
      const data = idx(salaryItemLockData, _ => _.data.isSalaryitemLocked)
      setIsSalaryItemsLock(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [salaryItemLockData.loading, salaryItemLockData.data])
  const latestMonthlyCheckoutTime = useFetchMerchantLatestMonthlyCheckoutTime({
    date: setting.date,
  })
  // 拿月結時間----------------------------------------------------
  const [monthlyCheckoutTime, setMonthlyCheckoutTime] = useState(null)
  useEffect(() => {
    if (!latestMonthlyCheckoutTime.loading) {
      setMonthlyCheckoutTime(idx(latestMonthlyCheckoutTime, _ => _.data.merchantLatestMonthlyCheckoutTime))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [latestMonthlyCheckoutTime.loading, latestMonthlyCheckoutTime.data])
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
    date: urlDate === '' ? defaultDate : Number(urlDate),
  })
  React.useEffect(() => {
    if (!users.loading) {
      const isUsersSalaryChacked = idx(users, _ => _.data.users.users)
      setUsersIsSalaryChecked(isUsersSalaryChacked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [users.loading, users.data])

  const userSalayItemData = useFetchUsersSalaryItems({
    date: setting.date,
    input: userInput,
  })
  const isSalaryChackedData = useFetchIsSalaryChecked({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isSalaryChackedData.loading, isSalaryChackedData.data])

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
    // DateSelector will handle history.push internally,
    // but we can keep this for safety or if called from elsewhere.
    if (!location.search.includes(`startDate=${date}`)) {
      history.push(`/salary/overview?startDate=${date}`)
    }
  }
  // 解鎖、刪除月結紀錄後要更新的資料：鎖定狀態、月結時間、員工月結狀態與名單。
  // 原本整頁 reload，會丟掉月份以外的篩選與捲動位置；改為重抓這幾支查詢（2026/10/28）。
  // 上面拷貝到 state 的 effect 也看 data：cache-first／network-only 的查詢 refetch 時 loading 不會變（本站不開 notifyOnNetworkStatusChange），只看 loading 會停在舊值
  const refetchOverview = () => {
    salaryItemLockData.refetch()
    latestMonthlyCheckoutTime.refetch()
    users.refetch()
    isSalaryChackedData.refetch()
    userSalayItemData.refetch()
    salaryUserList.refetch()
  }
  const handleIsSalaryItemsLock = () => {
    if (isSalaryItemsLock) {
      setUserSalaryItemUnlock({ date: setting.date }).then(res => {
        refetchOverview()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [salaryItemLockData.loading, salaryItemLockData.data])

  React.useEffect(() => {
    if (!getIsBorrowDisplayInSalaryOverview.loading) {
      const data = idx(getIsBorrowDisplayInSalaryOverview, _ => _.data.getIsBorrowDisplayInSalaryOverview)
      setBorrowDisplay(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBorrowDisplayInSalaryOverview.loading])
  return (
    <Page className="ui-root pb-12" title="薪資總表/月結">
      <PageHeader
        title="薪資總表/月結"
        actions={
          <>
            <DateSelector
              date={{
                startDate: startOfMonth(setting.date).getTime(),
                endDate: endOfMonth(setting.date).getTime(),
              }}
              attributes={['lastmonth', 'thismonth', 'startDate']}
              dateChange={({ startDate }) => handleDateChange(startDate)}
              onlyStart
              inputFormat="yyyy/MM"
              pickerOption={{
                views: ['month', 'year'],
              }}
              margin={false}
            />
          </>
        }
      />
      {salaryUserList.error ? (
        <QueryFailed onRetry={() => salaryUserList.refetch()} />
      ) : idx(salaryUserList, _ => _.data.getSalaryUserList) ? (
        idx(
          salaryUserList,
          _ =>
            _.data.getSalaryUserList && (
              <React.Fragment>
                <div className="mb-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-[7fr_5fr]">
                  <div>
                    <Overview usersSalary={_.data.getSalaryUserList} date={setting.date} />
                  </div>
                  <div>
                    <Card className="flex h-full flex-col justify-center gap-3 p-5">
                      <h3 className="m-0 text-heading text-text">操作指南</h3>
                      <ol className="m-0 flex list-none flex-col gap-1 p-0">
                        {[
                          '1. 選擇要月結的人「勾選」或是全選',
                          '2. 下方按下「月結」',
                          '3. 月結完成後，點擊「詳情」進入加扣項',
                          '4. 確認正確後，按下「鎖定」 即不可更改',
                        ].map((step, i) => (
                          <li key={i} className="text-body text-text-secondary">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </Card>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <FormControl variant="outlined" style={{ width: '150px' }}>
                    <NativeSelect
                      labelId="select-item-label"
                      id="select-item"
                      size="small"
                      value={listStatus}
                      onChange={event => setListStatus(event.target.value)}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="狀態"
                    >
                      {showOption.map((data, idx) => (
                        <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                          {data.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>

                  <Button variant={isSalaryItemsLock ? 'secondary' : 'primary'} className="min-w-[120px]" onClick={handleIsSalaryItemsLock}>
                    {isSalaryItemsLock ? '取消鎖定薪資' : '鎖定薪資'}
                  </Button>

                  {monthlyCheckoutTime && (
                    <div className="flex flex-col rounded-md bg-accent/8 px-4 py-1.5 text-accent">
                      <span className="text-caption font-medium">上次月結完成時間</span>
                      <span className="text-body font-bold tabular-nums">{format(new Date(monthlyCheckoutTime), 'yyyy/MM/dd HH:mm')}</span>
                    </div>
                  )}
                </div>
                <Results
                  status={idx(monthlyCloseStatus, _ => _.data.merchant.monthlyCloseStatus)}
                  calendarDate={setting.date}
                  pageSetting={setting.input}
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
                  onDataChanged={refetchOverview}
                />
              </React.Fragment>
            )
        )
      ) : (
        // 載入中：與舊版 CircularProgress 相同時機顯示
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[160px] w-full rounded-lg" />
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      )}
    </Page>
  )
}
