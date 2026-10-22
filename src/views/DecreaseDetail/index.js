import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchUserHelperRetrieve } from 'hooks/useFetchGetUserHelperRetrieve'
import idx from 'idx'
import React from 'react'
import DesignerBeenAssistedAutoComplete from 'components/DesignerBeenAssistedAutoComplete'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

import DecreaseResults from './DecreaseResults'

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
        <AdminPageHeader title='互助點數明細' />
        <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-[15px]">
          <div>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={values => setPageSetting(values)}
              outside
              visible={['datePicker', 'employee', 'service']}
              useInDecreaseDetailReport={true}
              lastInLeaderBoard={true}
              uiDateField
            />
          </div>
          <DesignerBeenAssistedAutoComplete
            label="設計師編號/姓名"
            value={beenAssistedDesigner}
            onChange={value => setBeenAssistedDesigner(value.userId)}
          />
        </div>
        {!userHelperRetrieveData.loading ? (
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
