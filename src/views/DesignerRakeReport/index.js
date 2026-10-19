/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { startOfMonth } from 'date-fns'
import idx from 'idx'
import useFetchDesignerRakeReport from 'hooks/useFetchDesignersRakeReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { EmptyState } from 'ui/empty-state'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
}

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
      <Toolbar>
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        </div>
      </Toolbar>
      {!designerRakeReportData.loading ? (
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
