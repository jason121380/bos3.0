import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchUserHelperRetrieve } from 'hooks/useFetchGetUserHelperRetrieve'
import idx from 'idx'
import React from 'react'
import DesignerBeenAssistedAutoComplete from 'components/DesignerBeenAssistedAutoComplete'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

import DecreaseResults from './DecreaseResults'
import QueryFailed from 'components/QueryFailed'

export default function DecreaseDetail() {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    serviceId: '',
  })

  const [beenAssistedDesigner, setBeenAssistedDesigner] = React.useState()

  const userHelperRetrieveData = useFetchUserHelperRetrieve({
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    designerId: pageSetting.employeeId === '' ? '' : pageSetting.employeeId,
    serviceId: pageSetting.serviceId === '' ? '' : pageSetting.serviceId,
  })

  return (
    <Page title="互助點數明細" className="ui-root">
      <div>
        <PageHeader title="互助點數明細" />
        {/* 日期留在篩選列；人員、服務、被協助設計師收進「篩選」（STYLE §14）。MerchantSearchBar 拆兩個實例共用同一份 values，收合區的那個不讀網址日期 */}
        <ReportToolbar
          date={
            <MerchantSearchBar
              values={pageSetting}
              onFilter={values => setPageSetting(values)}
              outside
              visible={['datePicker']}
              lastInLeaderBoard={true}
              uiDateField
            />
          }
          filters={
            <>
              <MerchantSearchBar
                values={pageSetting}
                onFilter={values => setPageSetting(values)}
                outside
                stopGetQueryString={true}
                visible={['employee', 'service']}
                useInDecreaseDetailReport={true}
                lastInLeaderBoard={true}
              />
              <DesignerBeenAssistedAutoComplete
                label="設計師編號/姓名"
                value={beenAssistedDesigner}
                onChange={value => setBeenAssistedDesigner(value.userId)}
              />
            </>
          }
        />
        {userHelperRetrieveData.error ? (
          <QueryFailed onRetry={() => userHelperRetrieveData.refetch()} />
        ) : !userHelperRetrieveData.loading ? (
          idx(userHelperRetrieveData, _ =>
            _.data.getUserHelperRetrieve.helperRecord.length > 0 ? (
              <DecreaseResults
                results={_.data.getUserHelperRetrieve.helperRecord}
                summary={_.data.getUserHelperRetrieve.summary}
                pointSummary={_.data.getUserHelperRetrieve.pointSummary}
                beenAssistedDesigner={beenAssistedDesigner}
              />
            ) : (
              <Card>
                <EmptyState title="無資料" />
              </Card>
            )
          )
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}
