import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import React from 'react'
import { Card } from 'ui/card'

import Results from './Results'
import TotalPrice from 'views/AccountingShared/TotalPrice'
import QueryFailed from 'components/QueryFailed'

function AccountingRecordList() {
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 1000,
    pageOffset: 0,
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    accountingSubjectName: '',
    payTypeKeyWord: '',
    relationUserId: '',
  })
  const [showFilter, setShowFilter] = React.useState(false)

  const getMoneyFlowsForAccounting = useFetchGetMoneyFlowsForAccounting({ input: pageSetting })

  return (
    <Page className="ui-root" title="高階收支登錄">
      <AdminPageHeader
        title='高階收支登錄'
        showFilter={showFilter}
        onFilterClick={() => setShowFilter(!showFilter)}
        primaryAction={{
          label: '新增',
          to: '/accounting/create'
        }}
      >
        <DateSelector
          date={pageSetting}
          attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          // 快速選擇日期只回傳起訖，合併進原條件：保留「現場現金」限制、篩選與筆數（Jason 2026/10/22）
          dateChange={value => setPageSetting(prev => ({ ...prev, ...value }))}
        />
      </AdminPageHeader>

      {showFilter && (
        <Card className="mb-6 p-4">
          <MerchantSearchBar
            values={pageSetting}
            onFilter={values => setPageSetting(values)}
            outside
            visible={['employee', 'subject', 'payType']}
            relationUserId={true}
            lastInLeaderBoard={true}
          />
        </Card>
      )}
      {idx(
        getMoneyFlowsForAccounting,
        _ =>
          _.data.moneyFlows && (
            <TotalPrice
              startDate={pageSetting.startDate}
              endDate={pageSetting.endDate}
              rev={_.data.moneyFlows.revenue}
              exp={_.data.moneyFlows.expenditure}
            />
          )
      )}
      {getMoneyFlowsForAccounting.error ? (
        <QueryFailed onRetry={() => getMoneyFlowsForAccounting.refetch()} />
      ) : idx(
        getMoneyFlowsForAccounting,
        _ =>
          _.data.moneyFlows && (
            <Results
              moneyFlows={_.data.moneyFlows}
              pageSetting={pageSetting}
            />
          )
      )}
    </Page>
  )
}

export default AccountingRecordList
