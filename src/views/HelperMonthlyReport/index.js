import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { format } from 'date-fns'
import idx from 'idx'
import { useFetchGetHelperMonthlyReport } from 'hooks/useFetchGetHelperMonthlyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const HelperMontlyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const helperMonthlyData = useFetchGetHelperMonthlyReport(date)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !helperMonthlyData.loading) {
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const helperMonthlyReport = idx(helperMonthlyData, _ => _.data.helperMonthlyReport)
      const membershipPerformanceTotal = (helperMonthlyReport || []).reduce((accu, curVal) => accu + curVal.membershipPerformance, 0)
      const membershipRakeTotal = (helperMonthlyReport || []).reduce((accu, curVal) => accu + curVal.membershipRake, 0)
      setMembershipDisplay(membershipPerformanceTotal !== 0 || membershipRakeTotal !== 0 || isMemberShipCardActive)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading, helperMonthlyData.loading])

  return (
    <Page className="ui-root" title="互助月報表">
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'none', justifyContent: 'space-between' }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
            '  - ' +
            format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
            '   ' +
            '互助月報表'}
        </div>
        <div className="merchantNamePrint">{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>
      </div>
      <PageHeader
        title="互助月報表"
        actions={
          <div className="printGrid print:hidden">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer strokeWidth={1.75} />
              列印
            </Button>
          </div>
        }
      />
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        }
      />

      {helperMonthlyData.error ? (
        <QueryFailed onRetry={() => helperMonthlyData.refetch()} />
      ) : !helperMonthlyData.loading ? (
        idx(
          helperMonthlyData,
          _ =>
            _.data.helperMonthlyReport !== null && <Results helperMonthlyReport={_.data.helperMonthlyReport} membershipDisplay={membershipDisplay} />
        )
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default HelperMontlyReport
