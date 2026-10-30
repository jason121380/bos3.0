import Page from 'components/Page'
import { endOfDay, startOfDay } from 'date-fns'
import useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import React, { Fragment, useEffect, useState } from 'react'
import DateSelector from 'components/DateSelector'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import Overview from './Overview'
import QueryFailed from 'components/QueryFailed'

function MerchantBusinessDashboard() {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [progress, setProgress] = React.useState(0)
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  const merchantDashboardData = useFetchMerchantDashboard({
    input: pageSetting,
  })

  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const overview = idx(merchantDashboardData, _ => _.data.merchantDashboard.intervalSummary) || {}
  const results = idx(merchantDashboardData, _ => _.data.merchantDashboard) || {}

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !merchantDashboardData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const membership = idx(merchantDashboardData, _ => _.data.merchantDashboard.intervalSummary.membership)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading, merchantDashboardData.loading])
  return (
    <Page className="ui-root" title="營業儀表板">
      <PageHeader title="營業儀表板" />
      <Toolbar>
        <DateSelector
          date={pageSetting}
          attributes={[
            'thismonth', 'lastmonth', 'dbyesterday',
            'yesterday', 'today', 'startDate', 'endDate'
          ]}
          dateChange={value => setPageSetting(value)}
        />
      </Toolbar>
      {merchantDashboardData.error ? (
        <QueryFailed onRetry={() => merchantDashboardData.refetch()} />
      ) : !merchantDashboardData.loading ? (
        <Fragment>
          <Overview membershipDisplay={membershipDisplay} overview={overview} />
          <Results results={results} />
        </Fragment>
      ) : (
        // 載入中：與舊版 ProgressBar 相同時機顯示（merchantDashboardData.loading）
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[148px] w-full rounded-lg" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
      )}
    </Page>
  )
}

export default MerchantBusinessDashboard
