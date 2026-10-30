// 報到狀態篩選 Select 使用 ui/form-control（值為 true／false／空字串，不適用 Radix Select）
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import Page from 'components/Page'
import { addDays, endOfDay, startOfMonth } from 'date-fns'
import useFetchGetBookingManagement from 'hooks/useFetchGetBookingManagement'
import { useFetchGetCheckinSettingsForManagementList } from 'hooks/useFetchGetMerchantCheckinSettings'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import { useFetchGetDeleteOrderUsing } from 'hooks/useFetchMerchantPassword'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import isExportCustomerMasked from 'helper/exportCustomerMask'
import idx from 'idx'
import isPasswordRequired from 'helper/passwordRequired'
import produce from 'immer'
import { useState, useEffect } from 'react'
import DateSelector from 'components/DateSelector'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Link as RouterLink } from 'react-router-dom'
import { ListFilter } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function WebOrderMangagementList() {
  // 從本地存儲獲取商戶 ID
  const merchantid = localStorage.getItem('userMerchant')
    ? localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null
    : ''

  // 分頁與過濾器狀態管理
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(addDays(new Date(), +90)).getTime(),
    customerId: '',
    employeeId: '',
    isReserved: true,
    isCheckin: ''
  })

  // UI 狀態：切換過濾器、報到功能顯示、未來預約確認邏輯
  const [showFilter, setShowFilter] = useState(false)
  const [checkInDisplay, setCheclInDisplay] = useState(false)
  const [bookingCusCheck, setBookingCusCheck] = useState(false)

  // 獲取後端數據
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()
  const getBookingManagement = useFetchGetBookingManagement({
    dateRange: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate
    },
    pageLimit: pageSetting.pageLimit,
    pageOffset: pageSetting.pageOffset,
    isCheckin: pageSetting.isCheckin === '' ? null : pageSetting.isCheckin
  })
  const getCheckinSettings = useFetchGetCheckinSettingsForManagementList()
  const getDeleteOrderUsing = useFetchGetDeleteOrderUsing()
  // 匯出是否遮罩客資：比照帳單列表，只有設定查詢成功且為 false 才不遮罩（Jason 2026/10/22）
  const customerDataMarkedData = useFetchCustomerDataMarked()
  const isCustomerDataMarked = isExportCustomerMasked(customerDataMarkedData)
  // 刪除密碼設定查詢失敗時列表照常顯示，但刪除一律先要求密碼（fail closed，Codex review PR #270）
  const delOrderPassUsing = isPasswordRequired(getDeleteOrderUsing, 'deleteOrder')

  // 同步報到設置（查詢失敗時視為未開啟，不整頁錯誤，Jason 2026/10/22）
  useEffect(() => {
    if (!getCheckinSettings.loading) {
      const res = Boolean(idx(getCheckinSettings, _ => _.data.getMerchantCheckinSettings.isBookingCheckinEnabled))
      setCheclInDisplay(res)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getCheckinSettings.loading])

  // 同步未來預約確認設置
  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing, _ => _.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBookingCusCheckUsing.loading])

  return (
    <Page className="ui-root" title="預約管理">
      <PageHeader
        title='預約管理'
        actions={
          <>
            <DateSelector
              date={{ startDate: pageSetting.startDate, endDate: pageSetting.endDate }}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={({ startDate, endDate }) => {
                setPageSetting(
                  produce(draft => {
                    draft.startDate = startDate
                    draft.endDate = endDate
                  })
                )
              }}
            />
            {checkInDisplay && (
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
            )}
            <Button asChild variant="primary">
              <RouterLink to={`/customer/reservation/${merchantid}?usingLineLogin=0`}>{'新預約'}</RouterLink>
            </Button>
          </>
        }
      />

      {showFilter && checkInDisplay && (
        <Card className="mb-6 flex flex-wrap items-center gap-4 p-4">
          {checkInDisplay && (
            <div>
              <FormControl variant="outlined" style={{ width: 120 }} >
                <NativeSelect
                  onChange={e => setPageSetting(
                    produce(draft => {
                      draft.isCheckin = e.target.value
                    })
                  )}
                  value={pageSetting.isCheckin}
                  displayEmpty={false}
                  placeholder="請選擇…"
                  label="報到狀態"
                >
                  <NativeSelectOption value=''><em>無</em></NativeSelectOption>
                  <NativeSelectOption value={true}>報到成功</NativeSelectOption>
                  <NativeSelectOption value={false}>未報到</NativeSelectOption>
                </NativeSelect>
              </FormControl>
            </div>
          )}
        </Card>
      )}
      {getBookingManagement.error ? (
          <QueryFailed onRetry={() => getBookingManagement.refetch()} />
        ) : !getBookingManagement.loading ?
        idx(
          getBookingManagement,
          _ =>
            _.data.bookingManagement.bookings && (
              <Results
                orders={_.data.bookingManagement.bookings}
                checkInDisplay={checkInDisplay}
                bookingCusCheck={bookingCusCheck}
                pageSetting={_.data.bookingManagement}
                refetch={_.refetch}
                delOrderPassUsing={delOrderPassUsing}
                isCustomerDataMarked={isCustomerDataMarked}
              />
            )
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示（getBookingManagement.loading）
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )
      }
    </Page>
  )
}

export default WebOrderMangagementList
