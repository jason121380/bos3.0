import DateSelector from 'components/DateSelector'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchGetMoneyFlowsForAccounting from 'hooks/useFetchGetMoneyFlowsForAccounting'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { Card } from 'ui/card'

import Results from './Results'
import TotalPrice from './TotalPrice'

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

  const handlePageChange = (event, newPage) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = newPage
      })
    )
  }
  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }
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
          dateChange={value => setPageSetting(value)}
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
      {idx(
        getMoneyFlowsForAccounting,
        _ =>
          _.data.moneyFlows && (
            <Results
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              moneyFlows={_.data.moneyFlows}
              pageSetting={pageSetting}
            />
          )
      )}
    </Page>
  )
}

export default AccountingRecordList
