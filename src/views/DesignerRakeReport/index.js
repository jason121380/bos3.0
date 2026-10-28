import { useState, useEffect } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { startOfMonth } from 'date-fns'
import idx from 'idx'
import useFetchDesignerRakeReport from 'hooks/useFetchDesignersRakeReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { EmptyState } from 'ui/empty-state'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const DesignerRakeReport = () => {
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const designerRakeReportData = useFetchDesignerRakeReport({ input: date })
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  return (
    <Page className="ui-root" title="設計師抽成報表">
      <PageHeader title="設計師抽成報表" />
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        }
      />
      {designerRakeReportData.error ? (
          <QueryFailed onRetry={() => designerRakeReportData.refetch()} />
        ) : !designerRakeReportData.loading ? (
        idx(designerRakeReportData, _ =>
          _.data.userRakeReport.length > 0 ? (
            // userRakeGrid：@media print 以 div.userRakeGrid 排成三欄，className 保留
            <div className="userRakeGrid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Results
                designerRakeReport={_.data.userRakeReport}
                isMemberShipCardActive={isMemberShipCardActive}
              />
            </div>
          ) : (
            <EmptyState title="無資料" />
          )
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3" aria-busy="true">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      )}
    </Page>
  )
}

export default DesignerRakeReport
